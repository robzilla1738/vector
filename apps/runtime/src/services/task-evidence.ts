import { createHash, randomUUID } from "node:crypto";
import {
  CriterionReviewParams,
  CriterionReviewSchema,
  CriterionVerificationSchema,
  EvidenceCaptureParams,
  EvidenceDocumentParams,
  EvidenceNoteParams,
  TaskEvidenceSchema,
  TaskReconcileParams,
  TaskReconcileOperationParams,
  TaskVerifyCriterionParams,
  AuxError,
  type Task,
  type TaskEvidence,
  type CriterionReview,
  type CriterionVerification,
  type TaskReceipt,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { summarizeModelUsage } from "./model-usage.js";
import type { EventBus } from "../events.js";
import type { PageService } from "./pages.js";
import { TaskService } from "./tasks.js";
import { DurableWriteLedger } from "../agent/durable.js";
import { redactSettledRunInvocations } from "@aux/contracts/forgotten-run-invocations";

type Actor = "desktop_user" | "external_client";
type EvidenceRow = { seq: number; json: string };
const ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

export class TaskEvidenceService {
  private tasks: TaskService;
  constructor(
    private repo: Repo,
    private events: EventBus,
    private pages?: Pick<PageService, "observe" | "get">,
  ) {
    this.tasks = new TaskService(repo, events);
  }

  recordNote(input: unknown, actor: Actor): TaskEvidence {
    const p = EvidenceNoteParams.parse(input);
    this.current(p.taskId, p.expectedRevision, p.criterionId);
    const now = Date.now();
    return this.saveEvidence({
      evidenceId: randomUUID(),
      taskId: p.taskId,
      taskRevision: p.expectedRevision,
      criterionId: p.criterionId,
      kind: "note",
      actor,
      summary: p.summary,
      recordedAt: now,
      observedAt: now,
      runSequence: this.runSequence(p.taskId),
      source: {},
    });
  }

  importDocument(input: unknown): TaskEvidence {
    const p = EvidenceDocumentParams.parse(input);
    const task = this.current(p.taskId, p.expectedRevision, p.criterionId, true);
    if (task.state === "archived")
      throw new AuxError("conflict", "Restore this task before importing evidence");
    const now = Date.now();
    return this.saveEvidence({
      evidenceId: randomUUID(),
      taskId: p.taskId,
      taskRevision: p.expectedRevision,
      criterionId: p.criterionId,
      kind: "document_snapshot",
      actor: "desktop_user",
      summary: `Document: ${p.filename}`,
      recordedAt: now,
      observedAt: now,
      runSequence: this.runSequence(p.taskId),
      source: {
        filename: p.filename,
        sha256: createHash("sha256").update(p.content, "utf8").digest("hex"),
        byteLength: Buffer.byteLength(p.content, "utf8"),
      },
      snapshot: { title: p.filename, text: p.content },
    });
  }

  async capture(input: unknown): Promise<TaskEvidence> {
    const p = EvidenceCaptureParams.parse(input);
    const task = this.current(p.taskId, p.expectedRevision, p.criterionId);
    const scoped =
      task.resources.some((resource) => resource.kind === "page" && resource.locator === p.pageId) ||
      this.tasks
        .details(p.taskId)
        .runs.some(({ run, currentRevision }) => currentRevision && run.pageIds.includes(p.pageId));
    if (!scoped)
      throw new AuxError("permission_denied", "The page is not in this task's current resources or runs");
    if (!this.pages) throw new AuxError("backend_unavailable", "Browser evidence capture is unavailable");
    const sequence = this.runSequence(p.taskId);
    const observation = await this.pages.observe(p.pageId, { scope: "full" });
    this.current(p.taskId, p.expectedRevision, p.criterionId);
    if (sequence !== this.runSequence(p.taskId))
      throw new AuxError("conflict", "A task run started during capture; capture fresh evidence");
    return this.saveEvidence({
      evidenceId: randomUUID(),
      taskId: p.taskId,
      taskRevision: p.expectedRevision,
      criterionId: p.criterionId,
      kind: "browser_observation",
      actor: "runtime",
      summary: `Page observation: ${observation.content.title || observation.content.url}`.slice(0, 4000),
      recordedAt: Date.now(),
      observedAt: observation.observedAt,
      runSequence: sequence,
      source: {
        pageId: p.pageId,
        url: observation.content.url,
        documentEpoch: observation.documentEpoch,
        observationRevision: observation.revision,
      },
      snapshot: { title: observation.content.title, text: observation.content.text.slice(0, 20000) },
    });
  }

  review(input: unknown): CriterionReview {
    const p = CriterionReviewParams.parse(input);
    const review = this.repo.transaction(() => {
      this.current(p.taskId, p.expectedRevision, p.criterionId, true);
      const evidence = this.evidence(p.taskId, p.expectedRevision, p.criterionId);
      for (const id of p.evidenceIds) {
        const record = evidence.find((item) => item.record.evidenceId === id)?.record;
        if (!record)
          throw new AuxError(
            "invalid_params",
            "Review evidence must belong to this criterion and task revision",
          );
        const reason = this.staleReason(record);
        if (reason) throw new AuxError("conflict", `Evidence is stale: ${reason}`);
      }
      const record: CriterionReview = {
        reviewId: randomUUID(),
        taskId: p.taskId,
        taskRevision: p.expectedRevision,
        criterionId: p.criterionId,
        actor: "desktop_user",
        outcome: p.outcome,
        evidenceIds: [...new Set(p.evidenceIds)],
        note: p.note,
        recordedAt: Date.now(),
        evidenceSequence: Math.max(0, ...evidence.map((item) => item.seq)),
      };
      this.repo.db
        .prepare(
          "INSERT INTO criterion_reviews(review_id,task_id,task_revision,criterion_id,json) VALUES(?,?,?,?,?)",
        )
        .run(record.reviewId, record.taskId, record.taskRevision, record.criterionId, JSON.stringify(record));
      return record;
    });
    this.events.emit("task.reviewed", { taskId: p.taskId, reviewId: review.reviewId });
    return review;
  }

  reconcile(input: unknown): { ok: true } {
    const p = TaskReconcileParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const action = this.repo.db
      .prepare(
        `SELECT a.id,a.status FROM action_intents a LEFT JOIN runs r ON r.run_id=a.run_id
      WHERE a.id=? AND coalesce(a.task_id,json_extract(r.config,'$.taskId'))=?
      AND coalesce(a.task_revision,json_extract(r.config,'$.taskRevision'))=?`,
      )
      .get(p.intentId, p.taskId, p.expectedRevision) as { id: string; status: string } | undefined;
    if (!action || !["pending", "uncertain"].includes(action.status))
      throw new AuxError("conflict", "No unresolved action with this ID belongs to the task");
    const evidence = this.evidence(p.taskId, p.expectedRevision).find(
      (item) => item.record.evidenceId === p.evidenceId,
    )?.record;
    if (!evidence)
      throw new AuxError("invalid_params", "Reconciliation needs evidence from the current task revision");
    const reason = this.staleReason(evidence);
    if (reason) throw new AuxError("conflict", `Evidence is stale: ${reason}`);
    new DurableWriteLedger(this.repo.db).reconcile(
      p.intentId,
      p.outcome,
      JSON.stringify({
        actor: "desktop_user",
        evidenceId: p.evidenceId,
        note: p.note,
        recordedAt: Date.now(),
      }),
    );
    this.events.emit("task.action_reconciled", {
      taskId: p.taskId,
      intentId: p.intentId,
      outcome: p.outcome,
      evidenceId: p.evidenceId,
    });
    return { ok: true };
  }

  reconcileOperation(input: unknown): { ok: true } {
    const p = TaskReconcileOperationParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const operation = this.repo.db
      .prepare(
        `SELECT i.invocation_id AS invocationId,i.run_id AS runId,o.effect_class AS effectClass
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id LEFT JOIN runs r ON r.run_id=i.run_id
      WHERE i.invocation_id=? AND coalesce(json_extract(r.config,'$.taskId'),json_extract(i.inputs,'$.taskId'))=?
      AND coalesce(json_extract(r.config,'$.taskRevision'),json_extract(i.inputs,'$.taskRevision'))=? AND o.effect_class!='read'
      AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown')`,
      )
      .get(p.invocationId, p.taskId, p.expectedRevision) as
      { invocationId: string; runId?: string; effectClass: string } | undefined;
    if (!operation)
      throw new AuxError("conflict", "No unresolved operation with this ID belongs to the task");
    const evidence = this.evidence(p.taskId, p.expectedRevision).find(
      (item) => item.record.evidenceId === p.evidenceId,
    )?.record;
    if (!evidence)
      throw new AuxError("invalid_params", "Reconciliation needs evidence from the current task revision");
    const reason = this.staleReason(evidence);
    if (reason) throw new AuxError("conflict", `Evidence is stale: ${reason}`);
    const recordedAt = Date.now();
    this.repo.transaction(() => {
      const updated = this.repo.db
        .prepare(
          `UPDATE operation_invocations SET status='reconciled',effect_outcome=?,ended_at=coalesce(ended_at,?)
        WHERE invocation_id=? AND (status IN ('running','interrupted') OR effect_outcome='unknown')`,
        )
        .run(p.outcome === "applied" ? "verified" : "not-dispatched", recordedAt, p.invocationId);
      if (updated.changes !== 1)
        throw new AuxError("conflict", "The operation was reconciled by another client");
      this.repo.db
        .prepare(
          `INSERT INTO operation_reconciliations(invocation_id,task_id,task_revision,outcome,evidence_id,note,recorded_at) VALUES(?,?,?,?,?,?,?)`,
        )
        .run(p.invocationId, p.taskId, p.expectedRevision, p.outcome, p.evidenceId, p.note, recordedAt);
      if (operation.runId && this.repo.getRun(operation.runId)?.config?.contextMemoryRevoked)
        redactSettledRunInvocations(this.repo.db, operation.runId);
    });
    this.events.emit("task.operation_reconciled", {
      taskId: p.taskId,
      invocationId: p.invocationId,
      outcome: p.outcome,
      evidenceId: p.evidenceId,
    });
    return { ok: true };
  }

  verifyCriterion(input: unknown): CriterionVerification {
    const p = TaskVerifyCriterionParams.parse(input);
    const task = this.current(p.taskId, p.expectedRevision, p.criterionId);
    const criterion = task.criteria.find((item) => item.criterionId === p.criterionId)!;
    const rows = this.evidence(p.taskId, p.expectedRevision, p.criterionId);
    const fresh = rows.filter((item) => !this.staleReason(item.record));
    let localMatch = false;
    let status: CriterionVerification["status"] = "unverified";
    let reason: string;
    if (criterion.verification === "manual") {
      reason = "Manual criteria stay unverified until you accept them. This check did not record a review.";
    } else if (criterion.verification === "service") {
      reason =
        "Service checks stay unverified. Aux does not call remote APIs to prove this criterion, and this is not human acceptance.";
    } else if (criterion.verification === "browser") {
      localMatch = fresh.some((item) => item.record.kind === "browser_observation");
      status = "needs_review";
      reason = localMatch
        ? "A current page observation exists. This local match is not human acceptance."
        : "No current page observation exists for this criterion.";
    } else if (criterion.verification === "artifact") {
      localMatch = fresh.some(
        (item) => item.record.kind === "document_snapshot" || !!item.record.source.cloudArtifacts?.length,
      );
      status = "needs_review";
      reason = localMatch
        ? "A saved artifact snapshot exists. This local match is not human acceptance."
        : "No current artifact snapshot exists for this criterion.";
    } else {
      localMatch = fresh.some((item) => item.record.kind === "command_snapshot");
      status = "needs_review";
      reason = localMatch
        ? "A saved command result exists. A successful exit is not acceptance."
        : "No current command result exists for this criterion.";
    }
    const record = CriterionVerificationSchema.parse({
      verificationId: randomUUID(),
      taskId: p.taskId,
      taskRevision: p.expectedRevision,
      criterionId: p.criterionId,
      method: criterion.verification,
      status,
      localMatch,
      reason,
      evidenceIds: fresh.map((item) => item.record.evidenceId),
      recordedAt: Date.now(),
    });
    this.repo.db
      .prepare(
        "INSERT INTO criterion_verifications(verification_id,task_id,task_revision,criterion_id,json,recorded_at) VALUES(?,?,?,?,?,?)",
      )
      .run(
        record.verificationId,
        record.taskId,
        record.taskRevision,
        record.criterionId,
        JSON.stringify(record),
        record.recordedAt,
      );
    this.events.emit("task.criterion_verified", {
      taskId: record.taskId,
      verificationId: record.verificationId,
      status: record.status,
      localMatch: record.localMatch,
    });
    return record;
  }

  receipt(taskId: string, revision?: number, includeChildren = true): TaskReceipt {
    const details = this.tasks.details(taskId);
    const task =
      revision === undefined ? details.task : details.revisions.find((item) => item.revision === revision);
    if (!task) throw new AuxError("not_found", "This task revision does not exist");
    const runs = details.runs.filter(({ run }) => run.config!.taskRevision! <= task.revision);
    const unresolvedActions = this.repo.db
      .prepare(
        `SELECT a.id AS intentId,a.run_id AS runId,a.page_id AS pageId,a.status
      FROM action_intents a LEFT JOIN runs r ON r.run_id=a.run_id WHERE coalesce(a.task_id,json_extract(r.config,'$.taskId'))=?
      AND coalesce(a.task_revision,json_extract(r.config,'$.taskRevision'))<=?
      AND a.status IN ('pending','uncertain') ORDER BY a.created_at,a.id`,
      )
      .all(taskId, task.revision) as unknown as TaskReceipt["unresolvedActions"];
    const operationRows = this.repo.db
      .prepare(
        `SELECT i.invocation_id AS invocationId,i.run_id AS runId,
      o.site_key||'/'||o.name AS operation,o.effect_class AS effectClass,i.status,i.effect_outcome AS effectOutcome,i.started_at AS startedAt,i.error
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id LEFT JOIN runs r ON r.run_id=i.run_id
      WHERE coalesce(json_extract(r.config,'$.taskId'),json_extract(i.inputs,'$.taskId'))=?
      AND coalesce(json_extract(r.config,'$.taskRevision'),json_extract(i.inputs,'$.taskRevision'))<=? AND o.effect_class!='read'
      AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown') ORDER BY i.started_at,i.invocation_id`,
      )
      .all(taskId, task.revision) as (Omit<TaskReceipt["unresolvedOperations"][number], "runId" | "error"> & {
      runId: string | null;
      error: string | null;
    })[];
    const unresolvedOperations = operationRows.map(({ runId, error, ...row }) => ({
      ...row,
      ...(runId ? { runId } : {}),
      ...(error ? { error } : {}),
    }));
    const criteria: TaskReceipt["criteria"] = task.criteria.map((criterion) => {
      const rows = this.evidence(taskId, task.revision, criterion.criterionId);
      const evidence = rows.map(({ record }) => {
        const reason = this.staleReason(record);
        return { record, stale: !!reason, reason };
      });
      const reviewRow = this.repo.db
        .prepare(
          "SELECT json FROM criterion_reviews WHERE task_id=? AND task_revision=? AND criterion_id=? ORDER BY seq DESC LIMIT 1",
        )
        .get(taskId, task.revision, criterion.criterionId) as { json: string } | undefined;
      const review = reviewRow ? CriterionReviewSchema.parse(JSON.parse(reviewRow.json)) : undefined;
      let status: TaskReceipt["criteria"][number]["status"] = evidence.length ? "needs_review" : "unverified";
      if (review) {
        const stale = review.evidenceIds.some(
          (id) => !evidence.some((item) => item.record.evidenceId === id && !item.stale),
        );
        const newEvidence = rows.some((row) => row.seq > review.evidenceSequence);
        status = stale ? "stale" : newEvidence ? "needs_review" : review.outcome;
      }
      return { criterion, status, evidence, review };
    });
    const calls = runs.flatMap(({ run }) => this.repo.listModelCalls(run.runId));
    const usage = summarizeModelUsage(calls);
    const active = runs.some(({ run }) => ACTIVE.has(run.status));
    const ownStatus: TaskReceipt["status"] =
      unresolvedActions.length || unresolvedOperations.length
        ? "uncertain"
        : active
          ? "in_progress"
          : criteria.every((item) => item.status === "accepted")
            ? "accepted"
            : criteria.some((item) => item.status === "rejected")
              ? "not_met"
              : "needs_review";
    const childTasks: TaskReceipt["childTasks"] =
      includeChildren && task.revision === details.task.revision
        ? details.children.map((child) => {
            const childReceipt = this.receipt(child.task.taskId, undefined, false);
            return {
              taskId: child.task.taskId,
              parentTaskId: child.task.parentTaskId!,
              title: child.task.title,
              revision: child.task.revision,
              state: child.task.state,
              depth: child.depth,
              status: childReceipt.status,
              modelCalls: childReceipt.modelCalls,
              knownCostUsd: childReceipt.knownCostUsd,
              costComplete: childReceipt.costComplete,
            };
          })
        : [];
    const descendantStatuses = new Set(childTasks.map((child) => child.status));
    const status: TaskReceipt["status"] =
      ownStatus === "uncertain" || descendantStatuses.has("uncertain")
        ? "uncertain"
        : ownStatus === "in_progress" || descendantStatuses.has("in_progress")
          ? "in_progress"
          : ownStatus === "not_met" || descendantStatuses.has("not_met")
            ? "not_met"
            : ownStatus === "accepted" && childTasks.every((child) => child.status === "accepted")
              ? "accepted"
              : "needs_review";
    return {
      taskId,
      taskRevision: task.revision,
      currentTaskRevision: details.task.revision,
      objective: task.objective,
      generatedAt: Date.now(),
      status,
      criteria,
      unresolvedActions,
      unresolvedOperations,
      runs: runs.map(({ run }) => ({
        runId: run.runId,
        status: run.status,
        taskRevision: run.config!.taskRevision!,
        currentRevision: run.config!.taskRevision === task.revision,
        error: run.error,
        durationMs:
          run.startedAt !== undefined && run.endedAt !== undefined
            ? Math.max(0, run.endedAt - run.startedAt)
            : undefined,
      })),
      modelCalls: usage.calls,
      knownCostUsd: usage.knownCostUsd,
      costComplete: usage.costComplete,
      modelIds: usage.modelIds,
      providers: usage.providers,
      destinations: usage.destinations,
      childTasks,
      verifications: (
        this.repo.db
          .prepare(
            "SELECT json FROM criterion_verifications WHERE task_id=? AND task_revision=? ORDER BY recorded_at DESC LIMIT 100",
          )
          .all(taskId, task.revision) as { json: string }[]
      ).flatMap((row) => {
        const parsed = CriterionVerificationSchema.safeParse(JSON.parse(row.json));
        return parsed.success ? [parsed.data] : [];
      }),
    };
  }

  /** Evidence for one task run, never pooled with another run of the same task revision. */
  runCriteria(
    taskId: string,
    revision: number,
    runId: string | undefined,
    criteria: Task["criteria"],
  ): { linkedRunFound: boolean; criteria: TaskReceipt["criteria"] } {
    const row = runId
      ? (this.repo.db.prepare("SELECT rowid AS sequence,config FROM runs WHERE run_id=?").get(runId) as
          { sequence: number; config: string | null } | undefined)
      : undefined;
    if (row) {
      const config = row.config ? (JSON.parse(row.config) as { taskId?: string; taskRevision?: number }) : {};
      if (config.taskId !== taskId || config.taskRevision !== revision)
        throw new AuxError(
          "conflict",
          "The linked run does not belong to this Skill's source task revision.",
        );
    }
    const evidenceRows = row
      ? this.evidence(taskId, revision).filter((item) => item.record.runSequence === row.sequence)
      : [];
    const entries: TaskReceipt["criteria"] = criteria.map((criterion) => {
      const rows = evidenceRows.filter((item) => item.record.criterionId === criterion.criterionId);
      const evidence = rows.map(({ record }) => {
        const reason = this.staleReason(record);
        return { record, stale: !!reason, reason };
      });
      const reviews = this.repo.db
        .prepare(
          "SELECT json FROM criterion_reviews WHERE task_id=? AND task_revision=? AND criterion_id=? ORDER BY seq DESC",
        )
        .all(taskId, revision, criterion.criterionId) as { json: string }[];
      const review = reviews
        .map((item) => CriterionReviewSchema.parse(JSON.parse(item.json)))
        .find(
          (item) =>
            rows.length > 0 &&
            item.evidenceIds.every((id) => rows.some((row) => row.record.evidenceId === id)),
        );
      let status: TaskReceipt["criteria"][number]["status"] = evidence.length
        ? evidence.every((item) => item.stale)
          ? "stale"
          : "needs_review"
        : "unverified";
      if (review) {
        const stale = review.evidenceIds.some(
          (id) => !evidence.some((item) => item.record.evidenceId === id && !item.stale),
        );
        const newEvidence = rows.some((item) => item.seq > review.evidenceSequence);
        status = stale ? "stale" : newEvidence ? "needs_review" : review.outcome;
      }
      return { criterion, status, evidence, review };
    });
    return { linkedRunFound: !!row, criteria: entries };
  }

  private current(taskId: string, revision: number, criterionId?: string, idle = false): Task {
    const task = this.tasks.get(taskId);
    if (task.revision !== revision)
      throw new AuxError("conflict", "Task revision changed; reload before recording evidence or a decision");
    if (criterionId && !task.criteria.some((criterion) => criterion.criterionId === criterionId))
      throw new AuxError("not_found", "Criterion does not belong to this task revision");
    if (idle && this.tasks.details(taskId).runs.some(({ run }) => ACTIVE.has(run.status)))
      throw new AuxError("conflict", "Stop active task runs before recording a decision");
    return task;
  }

  private runSequence(taskId: string): number {
    return Number(
      this.repo.db
        .prepare("SELECT coalesce(max(rowid),0) AS seq FROM runs WHERE json_extract(config,'$.taskId')=?")
        .get(taskId)?.seq,
    );
  }

  private staleReason(evidence: TaskEvidence): string | undefined {
    if (this.runSequence(evidence.taskId) !== evidence.runSequence)
      return "A new task run started after this evidence was recorded";
    if (evidence.kind === "browser_observation") {
      try {
        const page = this.pages?.get(evidence.source.pageId!);
        if (!page || page.viewStatus === "detached" || page.viewStatus === "crashed")
          return "The source page is unavailable";
        if (
          page.url !== evidence.source.url ||
          page.documentEpoch !== evidence.source.documentEpoch ||
          page.lastRevision !== evidence.source.observationRevision
        )
          return "The source page changed since capture";
      } catch {
        return "The source page is unavailable";
      }
    }
    return undefined;
  }

  private evidence(
    taskId: string,
    revision: number,
    criterionId?: string,
  ): { seq: number; record: TaskEvidence }[] {
    return (
      this.repo.db
        .prepare(
          "SELECT seq,json FROM task_evidence WHERE task_id=? AND task_revision=? AND (? IS NULL OR criterion_id=?) ORDER BY seq",
        )
        .all(taskId, revision, criterionId ?? null, criterionId ?? null) as EvidenceRow[]
    ).map((row) => ({ seq: row.seq, record: TaskEvidenceSchema.parse(JSON.parse(row.json)) }));
  }

  private saveEvidence(record: TaskEvidence): TaskEvidence {
    const validated = TaskEvidenceSchema.parse(record);
    this.repo.db
      .prepare(
        "INSERT INTO task_evidence(evidence_id,task_id,task_revision,criterion_id,json) VALUES(?,?,?,?,?)",
      )
      .run(
        validated.evidenceId,
        validated.taskId,
        validated.taskRevision,
        validated.criterionId,
        JSON.stringify(validated),
      );
    this.events.emit("task.evidence_recorded", {
      taskId: validated.taskId,
      evidenceId: validated.evidenceId,
    });
    return validated;
  }
}
