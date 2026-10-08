import {
  AuxError,
  RoutineSchema,
  RoutineRunOutcomeSchema,
  type Routine,
  type RoutineRun,
  type RoutineRunOutcome,
  type RoutineInboxItem,
  type RoutineAlert,
  type RoutineCompare,
  type RoutineTrigger,
  type Run,
} from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import type { TaskEvidenceService } from "../task-evidence.js";
import { parseRun } from "./records.js";
/** Durable automation results, review receipts and inbox projections. */
export class RoutineInbox {
  constructor(
    private repo: Repo,
    private routine: (id: string) => Routine,
    private runById: (id: string) => RoutineRun,
  ) {}
  outcome(routineRunId: string, evidence: TaskEvidenceService): RoutineRunOutcome {
    const run = this.runById(routineRunId);
    const row = this.repo.db
      .prepare("SELECT json FROM routine_revisions WHERE routine_id=? AND revision=?")
      .get(run.routineId, run.revision) as { json: string } | undefined;
    if (!row) throw new AuxError("not_found", "The saved Skill revision for this run is unavailable.");
    const definition = RoutineSchema.parse(JSON.parse(row.json));
    const result =
      definition.sourceTaskId && definition.sourceTaskRevision
        ? evidence.runCriteria(
            definition.sourceTaskId,
            definition.sourceTaskRevision,
            run.runId,
            definition.successCriteria,
          )
        : {
            linkedRunFound: false,
            criteria: definition.successCriteria.map((criterion) => ({
              criterion,
              status: "unverified" as const,
              evidence: [],
            })),
          };
    return RoutineRunOutcomeSchema.parse({
      run,
      sourceTaskId: definition.sourceTaskId,
      sourceTaskRevision: definition.sourceTaskRevision,
      ...result,
    });
  }

  /** One inbox row per automation occurrence, including completed results and missed fires. */
  inbox(
    opts: {
      workspaceId?: string;
      limit?: number;
      unreadOnly?: boolean;
      cursor?: { createdAt: number; routineRunId: string };
    } = {},
  ): RoutineInboxItem[] {
    const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
    const rows = this.repo.db
      .prepare(
        `SELECT rr.*,r.workspace_id,coalesce(rev.json,r.json) AS routine_json,k.value AS read_at
      FROM routine_runs rr JOIN routines r ON r.routine_id=rr.routine_id
      LEFT JOIN routine_revisions rev ON rev.routine_id=rr.routine_id AND rev.revision=rr.revision
      LEFT JOIN kv k ON k.key='setting:routineInboxRead:'||rr.routine_run_id
      WHERE rr.occurrence_identity IS NOT NULL AND (? IS NULL OR r.workspace_id=?)
        AND (?=0 OR k.value IS NULL)
        AND (? IS NULL OR rr.created_at<? OR (rr.created_at=? AND rr.routine_run_id<?))
      ORDER BY rr.created_at DESC,rr.routine_run_id DESC LIMIT ?`,
      )
      .all(
        opts.workspaceId ?? null,
        opts.workspaceId ?? null,
        opts.unreadOnly ? 1 : 0,
        opts.cursor?.createdAt ?? null,
        opts.cursor?.createdAt ?? null,
        opts.cursor?.createdAt ?? null,
        opts.cursor?.routineRunId ?? null,
        limit,
      ) as (Record<string, unknown> & {
      workspace_id: string;
      routine_json: string;
      read_at: string | null;
    })[];
    return rows.map((row) => {
      const definition = JSON.parse(row.routine_json) as { title: string; trigger: RoutineTrigger };
      return {
        run: parseRun(row),
        title: definition.title,
        workspaceId: row.workspace_id,
        triggerKind: definition.trigger.kind,
        ...(row.read_at
          ? { readAt: this.repo.getSetting<number>(`routineInboxRead:${row.routine_run_id}`) }
          : {}),
      };
    });
  }

  markInboxRead(routineRunId: string, now = Date.now()): { readAt: number } {
    const row = this.repo.db
      .prepare("SELECT 1 FROM routine_runs WHERE routine_run_id=? AND occurrence_identity IS NOT NULL")
      .get(routineRunId);
    if (!row) throw new AuxError("not_found", "That automation result was not found.");
    const key = `routineInboxRead:${routineRunId}`;
    const readAt = this.repo.getSetting<number>(key) ?? now;
    this.repo.setSetting(key, readAt);
    return { readAt };
  }

  alerts(limit = 30): RoutineAlert[] {
    const rows = this.repo.db
      .prepare(
        `SELECT r.routine_run_id, r.routine_id, r.status, r.reason, r.created_at, t.json
      FROM routine_runs r JOIN routines t ON t.routine_id=r.routine_id
      WHERE (r.status IN ('missed','needs_review','uncertain','failed','waiting_input') OR r.reason LIKE 'Coalesced %' OR (r.status='completed' AND r.occurrence_id IS NOT NULL AND json_extract(t.json,'$.reviewRequired')=1))
      ORDER BY r.created_at DESC LIMIT ?`,
      )
      .all(limit) as {
      routine_run_id: string;
      routine_id: string;
      status: string;
      reason: string | null;
      created_at: number;
      json: string;
    }[];
    return rows.map((row) => {
      const routine = JSON.parse(row.json) as { title: string; trigger?: { kind?: string } };
      return {
        routineRunId: row.routine_run_id,
        routineId: row.routine_id,
        title: routine.title,
        status: row.status as RoutineAlert["status"],
        reason: row.reason ?? undefined,
        triggerKind: (
          [
            "schedule",
            "rrule",
            "monitor",
            "heartbeat",
            "site_notification",
            "page_change",
            "calendar_event",
          ] as string[]
        ).includes(routine.trigger?.kind ?? "")
          ? (routine.trigger!.kind as RoutineAlert["triggerKind"])
          : "manual",
        createdAt: row.created_at,
      };
    });
  }

  compare(leftRunId: string, rightRunId: string): RoutineCompare {
    const left = this.runById(leftRunId);
    const right = this.runById(rightRunId);
    if (left.routineId !== right.routineId)
      throw new AuxError("conflict", "Compare two runs of the same routine.");
    const routine = this.routine(left.routineId);
    const sameOccurrence = !!left.occurrenceIdentity && left.occurrenceIdentity === right.occurrenceIdentity;
    const sameParameters = JSON.stringify(left.parameters) === JSON.stringify(right.parameters);
    const statusChanged = left.status !== right.status;
    const summary = [
      `${routine.title}: ${left.status.replaceAll("_", " ")} vs ${right.status.replaceAll("_", " ")}.`,
      sameOccurrence ? "Same scheduled occurrence." : "Different occurrences.",
      sameParameters ? "Parameters match." : "Parameters differ.",
      "This comparison is a local status snapshot. It does not prove a business outcome.",
    ].join(" ");
    return {
      routineId: routine.routineId,
      title: routine.title,
      left,
      right,
      sameOccurrence,
      sameParameters,
      statusChanged,
      summary,
    };
  }
}
export function mapRoutineRunStatus(record: RoutineRun, run: Run): RoutineRun | undefined {
  const endedAt = run.endedAt ?? Date.now();
  switch (run.status) {
    case "completed":
      return {
        ...record,
        status: "completed",
        reason: record.status === "waiting_input" ? undefined : record.reason,
        endedAt,
      };
    case "partially_completed":
      return {
        ...record,
        status: "completed",
        reason: "The run partially completed — review its results.",
        endedAt,
      };
    case "failed":
      return { ...record, status: "failed", reason: run.statusMessage ?? "The run failed.", endedAt };
    case "cancelled":
      return { ...record, status: "cancelled", endedAt };
    case "interrupted":
      return { ...record, status: "failed", reason: "The run was interrupted by a restart.", endedAt };
    case "needs_input":
      return record.status === "waiting_input"
        ? undefined
        : { ...record, status: "waiting_input", reason: "The run is waiting for input." };
    default:
      return record.status === "waiting_input"
        ? { ...record, status: "running", reason: undefined }
        : undefined;
  }
}
