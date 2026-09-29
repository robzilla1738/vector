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
  TaskUndoBrowserChangeParams,
  TaskUndoRunBrowserChangesParams,
  TaskVerifyCriterionParams,
  AuxError,
  type Task,
  type TaskEvidence,
  type CriterionReview,
  type CriterionVerification,
  type TaskReceipt,
  type StepRecord,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { summarizeModelUsage } from "./model-usage.js";
import type { EventBus } from "../events.js";
import type { PageService } from "./pages.js";
import type { NativeBridge } from "../native.js";
import { BrowserBookmarkLedger } from "./browser-bookmark-ledger.js";
import { BrowserDownloadLedger } from "./browser-download-ledger.js";
import { BrowserHistoryLedger } from "./browser-history-ledger.js";
import { TaskService } from "./tasks.js";
import { DurableWriteLedger } from "../agent/durable.js";
import { redactSettledRunInvocations } from "@aux/contracts/forgotten-run-invocations";
import { isConsequential } from "../agent/permissions.js";
import { BrowserGroupReceiptSchema } from "@aux/contracts/browser-group-receipt";

type Actor = "desktop_user" | "external_client";
type EvidenceRow = { seq: number; evidence_id: string; json: string };
const ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

function eligibleUndoStep(step: StepRecord): boolean {
  const outcome = step.outcome;
  if (outcome?.status !== "ok" || outcome.undoneAt) return false;
  if (["fill", "type", "check", "uncheck", "select"].includes(step.op))
    return !!(outcome.before && outcome.after && step.pageId);
  if (step.op === "tab.open") return !!(step.pageId && outcome.after?.ownedByRuntime === true);
  if (step.op === "bookmark.add") return outcome.before?.existed === false && !!outcome.after;
  if (step.op === "download") return outcome.before?.existed === false && typeof outcome.after?.sha256 === "string";
  if (step.op === "history.visit") return outcome.before?.existed === false && !!outcome.after;
  return false;
}

function undoReview(steps: StepRecord[]): { token: string; eligibleStepIds: string[] } {
  // Include every step, including remote effects. A newly recorded effect or an
  // updated outcome invalidates the owner's reviewed snapshot before undo starts.
  const token = createHash("sha256").update(JSON.stringify(steps.map(step => [
    step.stepId, step.op, step.inputs, step.outcome,
  ]))).digest("hex");
  const eligibleStepIds = steps.filter(eligibleUndoStep).map(step => step.stepId);
  return { token, eligibleStepIds: eligibleStepIds.length <= 200 ? eligibleStepIds : [] };
}

export class TaskEvidenceService {
  private tasks: TaskService;
  constructor(
    private repo: Repo,
    private events: EventBus,
    private pages?: Pick<PageService, "observe" | "get" | "undoFormChange" | "undoOpenedTab">,
    private native?: NativeBridge,
    private downloadsDir?: string,
    private trashDir?: string,
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
        .run(record.reviewId, record.taskId, record.taskRevision, record.criterionId,
          this.repo.protectRecordField("criterion_reviews", [record.reviewId], "json", JSON.stringify(record)));
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
        `SELECT a.id,a.status FROM action_intents a LEFT JOIN runs r ON r.run_id=a.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id
      WHERE a.id=? AND coalesce(a.task_id,json_extract(rl.config,'$.taskId'))=?
      AND coalesce(a.task_revision,json_extract(rl.config,'$.taskRevision'))=?`,
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

  async undoBrowserChange(input: unknown): Promise<{ ok: true }> {
    const p = TaskUndoBrowserChangeParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const details = this.tasks.details(p.taskId);
    const run = details.runs.find(item => item.run.runId === p.runId &&
      item.run.config?.taskRevision === p.expectedRevision)?.run;
    if (!run || ACTIVE.has(run.status)) throw new AuxError("conflict", "The run is unavailable or still active");
    const steps = this.repo.listSteps(p.runId);
    const step = steps.find(item => item.stepId === p.stepId);
    if (!step || !["fill", "type", "check", "uncheck", "select"].includes(step.op) ||
      step.outcome?.status !== "ok" || step.outcome.undoneAt || !step.pageId ||
      typeof step.inputs?.target !== "string" || !step.outcome.pageUrl ||
      step.outcome.receipt?.identity?.documentEpoch === undefined)
      throw new AuxError("conflict", "This form edit has no safe undo record");
    if (steps.some(other => other.pageId === step.pageId && steps.indexOf(other) > steps.indexOf(step) &&
      other.inputs?.target === step.inputs?.target && other.outcome?.status === "ok" && !other.outcome?.undoneAt))
      throw new AuxError("conflict", "A later edit touched this control; undo the later edit first");
    const state = (value: Record<string, unknown> | undefined) => {
      if (!value || Object.keys(value).length !== 1) return undefined;
      if (typeof value.value === "string" && value.value !== "{redacted}" && value.value.length <= 300)
        return { value: value.value };
      if (typeof value.checked === "boolean") return { checked: value.checked };
      if (typeof value.selected === "string" && value.selected.length <= 300)
        return { selected: value.selected };
      return undefined;
    };
    const before = state(step.outcome.before);
    const after = state(step.outcome.after);
    if (!before || !after || !this.pages) throw new AuxError("conflict", "The prior or resulting form state was not recorded safely");
    await this.pages.undoFormChange({ pageId: step.pageId, target: step.inputs.target,
      url: step.outcome.pageUrl, documentEpoch: step.outcome.receipt.identity.documentEpoch,
      before, after });
    this.repo.transaction(() => {
      const current = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
      if (!current?.outcome || current.outcome.undoneAt) throw new AuxError("conflict", "This form edit was already undone");
      this.repo.saveStep({ ...current, outcome: { ...current.outcome, undoneAt: Date.now() } });
    });
    return { ok: true };
  }

  async undoRunBrowserChanges(input: unknown): Promise<{ restored: number; skipped: { stepId: string; reason: string }[] }> {
    const p = TaskUndoRunBrowserChangesParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const run = this.tasks.details(p.taskId).runs.find(item => item.run.runId === p.runId &&
      item.run.config?.taskRevision === p.expectedRevision)?.run;
    if (!run || ACTIVE.has(run.status)) throw new AuxError("conflict", "The run is unavailable or still active");
    const recorded = this.repo.listSteps(p.runId);
    const review = undoReview(recorded);
    if (review.token !== p.reviewToken ||
      JSON.stringify(review.eligibleStepIds) !== JSON.stringify(p.expectedStepIds) ||
      !p.selectedStepIds.every(id => review.eligibleStepIds.includes(id)))
      throw new AuxError("conflict", "The run receipt changed. Review its browser changes again before undoing.");
    const selected = new Set(p.selectedStepIds);
    const steps = recorded.reverse();
    const single = { taskId: p.taskId, expectedRevision: p.expectedRevision, runId: p.runId };
    let restored = 0;
    const skipped: { stepId: string; reason: string }[] = [];
    for (const step of steps) {
      if (!selected.has(step.stepId)) continue;
      try {
        if (["fill", "type", "check", "uncheck", "select"].includes(step.op)) {
          await this.undoBrowserChange({ ...single, stepId: step.stepId });
        } else if (step.op === "bookmark.add") {
          await this.undoBookmarkChange({ ...single, stepId: step.stepId });
        } else if (step.op === "download") {
          await this.undoDownloadChange({ ...single, stepId: step.stepId });
        } else if (step.op === "history.visit") {
          await this.undoHistoryChange({ ...single, stepId: step.stepId });
        } else if (step.op === "tab.open" && step.pageId && this.pages) {
          if (steps.some((later, index) => index < steps.indexOf(step) && later.op === "tab.close" &&
            later.pageId === step.pageId && later.outcome?.status === "ok")) {
            skipped.push({ stepId: step.stepId, reason: "The run already closed this tab" });
            continue;
          }
          const after = step.outcome?.after;
          if (typeof after?.url !== "string" || typeof after?.documentEpoch !== "number" ||
            after.ownedByRuntime !== true)
            throw new AuxError("conflict", "This tab has no safe run-owned before/after record");
          await this.pages.undoOpenedTab(step.pageId, { url: after.url, documentEpoch: after.documentEpoch });
          const current = this.repo.listSteps(p.runId).find(item => item.stepId === step.stepId);
          if (!current?.outcome || current.outcome.undoneAt) throw new AuxError("conflict", "This tab was already undone");
          this.repo.saveStep({ ...current, outcome: { ...current.outcome, undoneAt: Date.now() } });
        } else if (step.op === "tab.open") {
          throw new AuxError("backend_unavailable", "This tab cannot be closed through the current browser connection");
        } else if (step.op === "tab.close") {
          skipped.push({ stepId: step.stepId, reason: "A closed tab cannot be safely reconstructed" });
          continue;
        } else continue;
        restored++;
      } catch (error) {
        skipped.push({ stepId: step.stepId,
          reason: (error instanceof Error ? error.message : String(error)).slice(0, 500) });
      }
    }
    return { restored, skipped };
  }

  async undoBookmarkChange(input: unknown): Promise<{ ok: true }> {
    const p = TaskUndoBrowserChangeParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const run = this.tasks.details(p.taskId).runs.find(item => item.run.runId === p.runId &&
      item.run.config?.taskRevision === p.expectedRevision)?.run;
    if (!run || ACTIVE.has(run.status)) throw new AuxError("conflict", "The run is unavailable or still active");
    const step = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
    if (step?.op !== "bookmark.add" || step.outcome?.status !== "ok" || step.outcome.undoneAt ||
      step.outcome.before?.existed !== false || !step.outcome.after)
      throw new AuxError("conflict", "This bookmark has no safe undo record");
    await new BrowserBookmarkLedger(this.repo, this.native).undo({ after: step.outcome.after });
    this.repo.transaction(() => {
      const current = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
      if (!current?.outcome || current.outcome.undoneAt)
        throw new AuxError("conflict", "This bookmark was already undone");
      this.repo.saveStep({ ...current, outcome: { ...current.outcome, undoneAt: Date.now() } });
    });
    return { ok: true };
  }

  async undoDownloadChange(input: unknown): Promise<{ ok: true }> {
    const p = TaskUndoBrowserChangeParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const run = this.tasks.details(p.taskId).runs.find(item => item.run.runId === p.runId &&
      item.run.config?.taskRevision === p.expectedRevision)?.run;
    if (!run || ACTIVE.has(run.status)) throw new AuxError("conflict", "The run is unavailable or still active");
    const step = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
    if (step?.op !== "download" || step.outcome?.status !== "ok" || step.outcome.undoneAt)
      throw new AuxError("conflict", "This download has no safe cleanup record");
    await new BrowserDownloadLedger(this.repo, this.downloadsDir, this.trashDir).undo(step);
    this.repo.transaction(() => {
      const current = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
      if (!current?.outcome || current.outcome.undoneAt)
        throw new AuxError("conflict", "This download was already cleaned up");
      this.repo.saveStep({ ...current, outcome: { ...current.outcome, undoneAt: Date.now() } });
    });
    return { ok: true };
  }

  async undoHistoryChange(input: unknown): Promise<{ ok: true }> {
    const p = TaskUndoBrowserChangeParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const run = this.tasks.details(p.taskId).runs.find(item => item.run.runId === p.runId &&
      item.run.config?.taskRevision === p.expectedRevision)?.run;
    if (!run || ACTIVE.has(run.status)) throw new AuxError("conflict", "The run is unavailable or still active");
    const step = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
    if (step?.op !== "history.visit" || step.outcome?.status !== "ok" || step.outcome.undoneAt)
      throw new AuxError("conflict", "This visit has no safe removal record");
    await new BrowserHistoryLedger(this.repo, this.native).undo(step);
    this.repo.transaction(() => {
      const current = this.repo.listSteps(p.runId).find(item => item.stepId === p.stepId);
      if (!current?.outcome || current.outcome.undoneAt)
        throw new AuxError("conflict", "This visit was already removed");
      this.repo.saveStep({ ...current, outcome: { ...current.outcome, undoneAt: Date.now() } });
    });
    return { ok: true };
  }

  reconcileOperation(input: unknown): { ok: true } {
    const p = TaskReconcileOperationParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);
    const operation = this.repo.db
      .prepare(
        `SELECT i.invocation_id AS invocationId,i.run_id AS runId,o.effect_class AS effectClass
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id LEFT JOIN runs r ON r.run_id=i.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id
      WHERE i.invocation_id=? AND coalesce(json_extract(rl.config,'$.taskId'),json_extract(i.inputs,'$.taskId'))=?
      AND coalesce(json_extract(rl.config,'$.taskRevision'),json_extract(i.inputs,'$.taskRevision'))=? AND o.effect_class!='read'
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
      this.repo.saveOperationReconciliation({ invocationId: p.invocationId, taskId: p.taskId,
        taskRevision: p.expectedRevision, outcome: p.outcome, evidenceId: p.evidenceId,
        note: p.note, recordedAt });
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
        this.repo.protectRecordField("criterion_verifications", [record.verificationId], "json", JSON.stringify(record)),
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
      FROM action_intents a LEFT JOIN runs r ON r.run_id=a.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id WHERE coalesce(a.task_id,json_extract(rl.config,'$.taskId'))=?
      AND coalesce(a.task_revision,json_extract(rl.config,'$.taskRevision'))<=?
      AND a.status IN ('pending','uncertain') ORDER BY a.created_at,a.id`,
      )
      .all(taskId, task.revision) as unknown as TaskReceipt["unresolvedActions"];
    const operationRows = this.repo.db
      .prepare(
        `SELECT i.invocation_id AS invocationId,i.run_id AS runId,
      o.site_key||'/'||o.name AS operation,o.effect_class AS effectClass,i.status,i.effect_outcome AS effectOutcome,i.started_at AS startedAt,i.error
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id LEFT JOIN runs r ON r.run_id=i.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id
      WHERE coalesce(json_extract(rl.config,'$.taskId'),json_extract(i.inputs,'$.taskId'))=?
      AND coalesce(json_extract(rl.config,'$.taskRevision'),json_extract(i.inputs,'$.taskRevision'))<=? AND o.effect_class!='read'
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
    const setterOps = new Set(["fill", "type", "check", "uncheck", "select"]);
    const browserChanges: TaskReceipt["browserChanges"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        const status = step.outcome?.status;
        if (!setterOps.has(step.op) || (status !== "ok" && status !== "failed")) return [];
        const boundedState = (raw: Record<string, unknown> | undefined) => raw && {
          ...(typeof raw.value === "string" ? { value: raw.value.slice(0, 300) } : {}),
          ...(typeof raw.checked === "boolean" ? { checked: raw.checked } : {}),
          ...(typeof raw.selected === "string" ? { selected: raw.selected.slice(0, 300) } : {}),
        };
        const before = boundedState(step.outcome?.before);
        const after = boundedState(step.outcome?.after);
        return [{ stepId: step.stepId, runId: run.runId, pageId: step.pageId ?? "unknown",
          taskRevision: run.config!.taskRevision!, op: step.op as TaskReceipt["browserChanges"][number]["op"],
          status, startedAt: step.startedAt,
          ...(typeof step.inputs?.target === "string" ? { target: step.inputs.target.slice(0, 200) } : {}),
          ...(before && Object.keys(before).length ? { before } : {}),
          ...(after && Object.keys(after).length ? { after } : {}),
          ...(step.outcome?.undoneAt ? { undoneAt: step.outcome.undoneAt } : {}),
        }];
      })).sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const tabChanges: TaskReceipt["tabChanges"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        if (step.op !== "tab.open" && step.op !== "tab.close") return [];
        const status = step.outcome?.status;
        if (status !== "ok" && status !== "failed") return [];
        return [{ stepId: step.stepId, runId: run.runId, pageId: step.pageId ?? "unknown",
          taskRevision: run.config!.taskRevision!, op: step.op as "tab.open" | "tab.close", status, startedAt: step.startedAt,
          ...(typeof step.inputs?.url === "string" ? { url: step.inputs.url.slice(0, 8192) } : {}),
          ...(step.outcome?.undoneAt ? { undoneAt: step.outcome.undoneAt } : {}),
        }];
      })).sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const groupChanges: TaskReceipt["groupChanges"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        if (step.op !== "group.change" || step.outcome?.status !== "ok") return [];
        return [BrowserGroupReceiptSchema.parse({ stepId: step.stepId, runId: run.runId,
          groupId: step.inputs?.groupId, taskRevision: run.config!.taskRevision!,
          observedAt: step.startedAt, before: step.outcome.before, after: step.outcome.after,
          undoAvailable: false })];
      })).sort((a, b) => a.observedAt - b.observedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const remoteActions: TaskReceipt["remoteActions"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        if (!isConsequential(step.op) || setterOps.has(step.op) || step.op.startsWith("tab.")) return [];
        const status = step.outcome?.status;
        if (status !== "ok" && status !== "failed") return [];
        const receipt = step.outcome?.receipt;
        return [{ stepId: step.stepId, runId: run.runId, pageId: step.pageId ?? "unknown",
          taskRevision: run.config!.taskRevision!, op: step.op, status, startedAt: step.startedAt,
          ...(step.outcome?.effect ? { effect: step.outcome.effect } : {}),
          ...(receipt?.observed ? { browserObserved: receipt.observed.slice(0, 300) } : {}),
          remoteConfirmed: receipt?.remoteConfirmed === true,
          uncertain: status === "failed" || receipt?.uncertain === true || receipt?.unconfirmed === true ||
            receipt?.dispatchedBeforeTakeover === true || step.outcome?.effect === "uncertain",
        }];
      })).sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const bookmarkChanges: TaskReceipt["bookmarkChanges"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        if (step.op !== "bookmark.add" || !step.outcome ||
          !["ok", "failed"].includes(step.outcome.status)) return [];
        const after = step.outcome.after;
        return [{ stepId: step.stepId, runId: run.runId, pageId: step.pageId ?? "unknown",
          taskRevision: run.config!.taskRevision!, status: step.outcome.status as "ok" | "failed",
          startedAt: step.startedAt,
          ...(typeof after?.url === "string" ? { url: after.url.slice(0, 8192) } : {}),
          ...(typeof after?.title === "string" ? { title: after.title.slice(0, 1000) } : {}),
          ...(step.outcome.undoneAt ? { undoneAt: step.outcome.undoneAt } : {}),
        }];
      })).sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const downloadChanges: TaskReceipt["downloadChanges"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        if (step.op !== "download" || !step.outcome) return [];
        const after = step.outcome.after;
        const state = after?.state;
        const status: TaskReceipt["downloadChanges"][number]["status"] =
          state === "completed" ? "completed" : state === "started" ? "started" : "interrupted";
        return [{ stepId: step.stepId, runId: run.runId, pageId: step.pageId ?? "unknown",
          taskRevision: run.config!.taskRevision!, status, startedAt: step.startedAt,
          ...(typeof after?.filename === "string" ? { filename: after.filename.slice(0, 1000) } : {}),
          ...(typeof step.inputs?.sourceUrl === "string" ? { sourceUrl: step.inputs.sourceUrl.slice(0, 8192) } : {}),
          ...(typeof after?.path === "string" ? { path: after.path.slice(0, 4096) } : {}),
          ...(typeof after?.size === "number" ? { size: after.size } : {}),
          cleanupAvailable: status === "completed" && step.outcome.before?.existed === false &&
            typeof after?.sha256 === "string" && !step.outcome.undoneAt,
          ...(step.outcome.undoneAt ? { undoneAt: step.outcome.undoneAt } : {}),
        }];
      })).sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const historyChanges: TaskReceipt["historyChanges"] = runs.flatMap(({ run }) =>
      this.repo.listSteps(run.runId).flatMap(step => {
        if (step.op !== "history.visit" || step.outcome?.status !== "ok") return [];
        const after = step.outcome.after;
        return [{ stepId: step.stepId, runId: run.runId, pageId: step.pageId ?? "unknown",
          taskRevision: run.config!.taskRevision!, status: "ok" as const, startedAt: step.startedAt,
          ...(typeof after?.url === "string" ? { url: after.url.slice(0, 8192) } : {}),
          ...(typeof after?.title === "string" ? { title: after.title.slice(0, 4096) } : {}),
          ...(typeof after?.visitedAt === "number" ? { visitedAt: after.visitedAt } : {}),
          ...(step.outcome.undoneAt ? { undoneAt: step.outcome.undoneAt } : {}),
        }];
      })).sort((a, b) => a.startedAt - b.startedAt || a.stepId.localeCompare(b.stepId)).slice(-200);
    const criteria: TaskReceipt["criteria"] = task.criteria.map((criterion) => {
      const rows = this.evidence(taskId, task.revision, criterion.criterionId);
      const evidence = rows.map(({ record }) => {
        const reason = this.staleReason(record);
        return { record, stale: !!reason, reason };
      });
      const reviewRow = this.repo.db
        .prepare(
          "SELECT review_id,json FROM criterion_reviews WHERE task_id=? AND task_revision=? AND criterion_id=? ORDER BY seq DESC LIMIT 1",
        )
        .get(taskId, task.revision, criterion.criterionId) as { review_id: string; json: string } | undefined;
      const review = reviewRow ? CriterionReviewSchema.parse(JSON.parse(this.repo.revealRecordField(
        "criterion_reviews", [reviewRow.review_id], "json", reviewRow.json))) : undefined;
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
      undoReviews: runs.flatMap(({ run }) => {
        if (ACTIVE.has(run.status) || run.config?.taskRevision !== task.revision) return [];
        return [{ runId: run.runId, ...undoReview(this.repo.listSteps(run.runId)) }];
      }).slice(-200),
      browserChanges,
      tabChanges,
      groupChanges,
      remoteActions,
      bookmarkChanges,
      downloadChanges,
      historyChanges,
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
            "SELECT verification_id,json FROM criterion_verifications WHERE task_id=? AND task_revision=? ORDER BY recorded_at DESC LIMIT 100",
          )
          .all(taskId, task.revision) as { verification_id: string; json: string }[]
      ).flatMap((row) => {
        const parsed = CriterionVerificationSchema.safeParse(JSON.parse(this.repo.revealRecordField(
          "criterion_verifications", [row.verification_id], "json", row.json)));
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
      ? (this.repo.db.prepare("SELECT rowid AS sequence FROM runs WHERE run_id=?").get(runId) as
          { sequence: number } | undefined)
      : undefined;
    if (row) {
      const config = this.repo.getRun(runId!)?.config ?? {};
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
          "SELECT review_id,json FROM criterion_reviews WHERE task_id=? AND task_revision=? AND criterion_id=? ORDER BY seq DESC",
        )
        .all(taskId, revision, criterion.criterionId) as { review_id: string; json: string }[];
      const review = reviews
        .map((item) => CriterionReviewSchema.parse(JSON.parse(this.repo.revealRecordField(
          "criterion_reviews", [item.review_id], "json", item.json))))
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
        .prepare("SELECT coalesce(max(r.rowid),0) AS seq FROM run_lookup l JOIN runs r ON r.run_id=l.run_id WHERE json_extract(l.config,'$.taskId')=?")
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
          "SELECT seq,evidence_id,json FROM task_evidence WHERE task_id=? AND task_revision=? AND (? IS NULL OR criterion_id=?) ORDER BY seq",
        )
        .all(taskId, revision, criterionId ?? null, criterionId ?? null) as EvidenceRow[]
    ).map((row) => ({ seq: row.seq, record: TaskEvidenceSchema.parse(JSON.parse(this.repo.revealRecordField(
      "task_evidence", [row.evidence_id], "json", row.json))) }));
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
        this.repo.protectRecordField("task_evidence", [validated.evidenceId], "json", JSON.stringify(validated)),
      );
    this.events.emit("task.evidence_recorded", {
      taskId: validated.taskId,
      evidenceId: validated.evidenceId,
    });
    return validated;
  }
}
