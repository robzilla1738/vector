/**
 * Durable suspensions (S3): an `ask` decision parks the run as needs_input;
 * this store makes that park durable, enforces one pending suspension per
 * run, and lets the same UI serve built-in, subagent, and external sessions.
 */
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  SuspensionSchema,
  type Suspension,
  type SuspensionKind,
  type SuspensionRequest,
} from "@aux/contracts";

type SuspensionRow = {
  suspension_id: string;
  run_id: string;
  thread_id: string;
  turn_id: string;
  kind: string;
  request_json: string;
  approval_id: string | null;
  state: string;
  created_at: number;
  resolved_at: number | null;
};

function rowToSuspension(row: SuspensionRow): Suspension {
  return SuspensionSchema.parse({
    suspensionId: row.suspension_id,
    runId: row.run_id,
    threadId: row.thread_id,
    turnId: row.turn_id,
    kind: row.kind,
    request: JSON.parse(row.request_json),
    state: row.state,
    createdAt: row.created_at,
    ...(row.resolved_at != null ? { resolvedAt: row.resolved_at } : {}),
  });
}

export class SuspensionStore {
  constructor(
    private readonly db: DatabaseSync,
    private readonly audit: (event: Record<string, unknown>) => void = () => {},
  ) {
    db.exec(`CREATE TABLE IF NOT EXISTS safety_suspensions(
      suspension_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, thread_id TEXT NOT NULL, turn_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('ask-user-question','approval','action-confirmation','handoff')),
      request_json TEXT NOT NULL, approval_id TEXT,
      state TEXT NOT NULL CHECK(state IN ('pending','answered','cancelled','expired')),
      created_at INTEGER NOT NULL, resolved_at INTEGER);
      CREATE INDEX IF NOT EXISTS idx_suspensions_run ON safety_suspensions(run_id, state);
      CREATE INDEX IF NOT EXISTS idx_suspensions_approval ON safety_suspensions(approval_id, state);`);
  }

  /** Park the run on a suspension; an identical pending suspension is reused, not duplicated. */
  park(input: {
    runId: string;
    threadId: string;
    turnId: string;
    kind: SuspensionKind;
    request: SuspensionRequest;
    now?: number;
  }): Suspension {
    const now = input.now ?? Date.now();
    const existing = this.pending(input.runId);
    if (existing) {
      // One pending suspension per run: a re-park for the same question returns
      // the live record; a different one supersedes it.
      const same =
        existing.kind === input.kind &&
        existing.request.instruction === input.request.instruction &&
        existing.request.approvalId === input.request.approvalId;
      if (same) return existing;
      this.resolve(existing.suspensionId, "cancelled", now);
    }
    const suspension: Suspension = {
      suspensionId: randomUUID(),
      runId: input.runId,
      threadId: input.threadId,
      turnId: input.turnId,
      kind: input.kind,
      request: input.request,
      state: "pending",
      createdAt: now,
    };
    this.db
      .prepare(
        `INSERT INTO safety_suspensions(
      suspension_id,run_id,thread_id,turn_id,kind,request_json,approval_id,state,created_at)
      VALUES(?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        suspension.suspensionId,
        input.runId,
        input.threadId,
        input.turnId,
        input.kind,
        JSON.stringify(input.request),
        input.request.approvalId ?? null,
        "pending",
        now,
      );
    this.audit({
      kind: "suspension_parked",
      suspensionId: suspension.suspensionId,
      suspensionKind: input.kind,
      runId: input.runId,
      at: now,
    });
    return suspension;
  }

  pending(runId: string): Suspension | undefined {
    const row = this.db
      .prepare(
        `SELECT * FROM safety_suspensions WHERE run_id=? AND state='pending'
      ORDER BY created_at DESC LIMIT 1`,
      )
      .get(runId) as SuspensionRow | undefined;
    return row ? rowToSuspension(row) : undefined;
  }

  /** Every run parked right now — the queue a UI session attaches to. */
  pendingAll(): Suspension[] {
    const rows = this.db
      .prepare(`SELECT * FROM safety_suspensions WHERE state='pending' ORDER BY created_at`)
      .all() as SuspensionRow[];
    return rows.map(rowToSuspension);
  }

  resolve(suspensionId: string, state: "answered" | "cancelled" | "expired", now = Date.now()): void {
    const changed = this.db
      .prepare(
        `UPDATE safety_suspensions SET state=?, resolved_at=? WHERE suspension_id=? AND state='pending'`,
      )
      .run(state, now, suspensionId).changes;
    if (changed) this.audit({ kind: "suspension_resolved", suspensionId, state, at: now });
  }

  /** Resolve the live suspension for a run, if any. */
  resolveRun(runId: string, state: "answered" | "cancelled" | "expired", now = Date.now()): void {
    const pending = this.pending(runId);
    if (pending) this.resolve(pending.suspensionId, state, now);
  }

  /** An approval decision resolves whichever suspension carries its request;
   * returns it so the caller can wake the run the suspension parked. */
  resolveByApprovalId(
    approvalId: string,
    state: "answered" | "cancelled" | "expired",
    now = Date.now(),
  ): Suspension | undefined {
    const row = this.db
      .prepare(
        `SELECT * FROM safety_suspensions
      WHERE approval_id=? AND state='pending' ORDER BY created_at DESC LIMIT 1`,
      )
      .get(approvalId) as SuspensionRow | undefined;
    if (!row) return undefined;
    this.resolve(row.suspension_id, state, now);
    return rowToSuspension(row);
  }

  /** Restart recovery: runs that will never resume do not hold pending suspensions. */
  expireOrphans(liveRunIds: ReadonlySet<string>, now = Date.now()): number {
    const rows = this.db
      .prepare(`SELECT suspension_id AS id, run_id AS runId FROM safety_suspensions WHERE state='pending'`)
      .all() as { id: string; runId: string }[];
    let count = 0;
    for (const row of rows) {
      if (!liveRunIds.has(row.runId)) {
        this.resolve(row.id, "expired", now);
        count += 1;
      }
    }
    return count;
  }
}
