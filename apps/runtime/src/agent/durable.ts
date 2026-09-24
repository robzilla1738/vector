/** Persist intent before dispatch; uncertainty never authorizes a retry. */
import { createHash, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { openDb } from "../store/db.js";
import { classifyStep } from "./permissions.js";

export interface WriteIntent {
  id: string;
  runId: string;
  pageId: string;
  documentEpoch: number;
  idempotencyKey: string;
  taskId?: string;
  taskRevision?: number;
  status: "pending" | "confirmed" | "uncertain" | "not_applied";
}

const SELECT = `SELECT id, run_id AS runId, page_id AS pageId,
  document_epoch AS documentEpoch, idempotency_key AS idempotencyKey, task_id AS taskId,
  task_revision AS taskRevision, status FROM action_intents`;

export class DurableWriteLedger {
  private readonly db: DatabaseSync;
  private readonly ownsDb: boolean;

  constructor(storage?: DatabaseSync | string) {
    this.ownsDb = !storage || typeof storage === "string";
    this.db = typeof storage === "string" ? openDb(`${storage}.sqlite`) : storage ?? openDb(":memory:");
  }

  close(): void { if (this.ownsDb) this.db.close(); }

  key(runId: string, pageId: string, epoch: number, signature: string, revision = 0): string {
    return createHash("sha256").update(JSON.stringify([runId, pageId, epoch, revision, signature])).digest("hex");
  }

  begin(opts: {
    runId: string; pageId: string; documentEpoch: number;
    signature: string; revision?: number; logicalActionId?: string;
    taskId?: string; taskRevision?: number;
  }): { intent: WriteIntent; duplicate: boolean } {
    const idempotencyKey = opts.logicalActionId
      ? createHash("sha256").update(JSON.stringify(["logical-action", opts.logicalActionId])).digest("hex")
      : this.key(opts.runId, opts.pageId, opts.documentEpoch, opts.signature, opts.revision);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      // A new observation, target ref, or repair plan cannot bypass an unresolved
      // effect. Reads can still establish what happened before another write.
      const existing = this.db.prepare(`${SELECT} WHERE idempotency_key=? OR
        (run_id=? AND page_id=? AND status IN ('pending','uncertain')) OR
        (task_id=? AND status IN ('pending','uncertain'))
        ORDER BY CASE WHEN status IN ('pending','uncertain') THEN 0 ELSE 1 END LIMIT 1`)
        .get(idempotencyKey, opts.runId, opts.pageId,opts.taskId??null) as unknown as WriteIntent | undefined;
      if (existing) {
        this.db.exec("COMMIT");
        return { intent: existing, duplicate: true };
      }
      const intent: WriteIntent = { id: randomUUID(), runId: opts.runId, pageId: opts.pageId,
        documentEpoch: opts.documentEpoch, idempotencyKey, taskId: opts.taskId, taskRevision: opts.taskRevision, status: "pending" };
      this.insert(intent);
      this.db.exec("COMMIT");
      return { intent, duplicate: false };
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  confirm(id: string): void { this.transition(id, "confirmed"); }
  // A failed browser response is not proof that the external effect failed.
  fail(id: string): void { this.transition(id, "uncertain"); }

  /** Pre-dispatch failure: the write never left this process. */
  abortUndispatched(id: string, reason: string): void {
    if (!reason.trim()) throw new Error("Pre-dispatch abort requires a reason");
    this.transition(id, "not_applied", reason);
  }

  /** Trusted reconciliation only; callers must supply independent evidence. */
  reconcile(id: string, outcome: "applied" | "not_applied", evidence: string): void {
    if (!evidence.trim()) throw new Error("Reconciliation requires evidence");
    this.transition(id, outcome === "applied" ? "confirmed" : "not_applied", evidence);
  }

  get(idempotencyKey: string): WriteIntent | undefined {
    return this.db.prepare(`${SELECT} WHERE idempotency_key=?`).get(idempotencyKey) as unknown as WriteIntent | undefined;
  }

  unresolved(runId: string): WriteIntent[] {
    return this.db.prepare(`${SELECT} WHERE run_id=? AND status IN ('pending','uncertain') ORDER BY created_at,id`)
      .all(runId) as unknown as WriteIntent[];
  }

  private insert(intent: WriteIntent): void {
    const now = Date.now();
    this.db.prepare(`INSERT INTO action_intents(id,idempotency_key,run_id,page_id,document_epoch,task_id,task_revision,status,created_at)
      VALUES(?,?,?,?,?,?,?,?,?)`).run(intent.id, intent.idempotencyKey, intent.runId, intent.pageId, intent.documentEpoch, intent.taskId ?? null, intent.taskRevision ?? null, intent.status, now);
    this.db.prepare("INSERT INTO action_transitions(intent_id,status,recorded_at) VALUES(?,?,?)").run(intent.id, intent.status, now);
  }

  private transition(id: string, status: WriteIntent["status"], evidence?: string): void {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const prior = this.db.prepare("SELECT status FROM action_intents WHERE id=?").get(id) as { status: string } | undefined;
      if (!prior) throw new Error("Unknown action intent");
      if (!evidence && prior.status !== "pending") throw new Error("Settled action requires reconciliation evidence");
      this.db.prepare("UPDATE action_intents SET status=?, evidence=? WHERE id=?").run(status, evidence ?? null, id);
      this.db.prepare("INSERT INTO action_transitions(intent_id,status,recorded_at,evidence) VALUES(?,?,?,?)")
        .run(id, status, Date.now(), evidence ?? null);
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

}

export function stepSignature(ops: Array<{ op: string; target?: unknown; value?: unknown }>): string {
  const canonical = JSON.stringify(ops, (_key, value) => value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value);
  return createHash("sha256").update(canonical).digest("hex");
}

/** Stable task-level identity: same logical write across runs, pages and epochs. */
export function taskLogicalActionId(taskId: string, revision: number, signature: string): string {
  return `task:${taskId}:r${revision}:${signature}`;
}

/** Persist a write/egress intent. `skip` means do not dispatch. */
export function beginConsequentialWrite(
  ledger: DurableWriteLedger | undefined,
  opts: {
    runId: string;
    pageId: string;
    documentEpoch: number;
    /** Observation revision. Same click after a new observe is a new write. */
    revision?: number;
    steps: Array<{ op: string; target?: unknown; value?: unknown }>;
    logicalActionId?: string;
    taskId?: string;
    taskRevision?: number;
  },
): { skip: boolean; intentId?: string; reason?: string } {
  if (!ledger) return { skip: false };
  const writes = opts.steps.some((s) => {
    const effect = classifyStep(s.op);
    return effect !== "read";
  });
  if (!writes) return { skip: false };
  const signature = stepSignature(opts.steps);
  const logicalActionId = opts.logicalActionId
    ?? (opts.taskId && opts.taskRevision != null ? taskLogicalActionId(opts.taskId, opts.taskRevision, signature) : undefined);
  const began = ledger.begin({
    runId: opts.runId,
    pageId: opts.pageId,
    documentEpoch: opts.documentEpoch,
    revision: opts.revision,
    signature,
    logicalActionId,
    taskId: opts.taskId,
    taskRevision: opts.taskRevision,
  });
  if (began.duplicate) return { skip: true, reason: `Action ${began.intent.id} is ${began.intent.status}; reconcile its outcome before dispatch. No new action was executed.` };
  return { skip: false, intentId: began.intent.id };
}

/** Failures raised while resolving or authorizing a target: no input reached the page. */
const PRE_DISPATCH_CODES = new Set([
  "target_detached", "ref_stale", "target_ambiguous", "not_found", "invalid_params", "permission_denied", "capability_unsupported",
]);

export interface WriteResultLike {
  status: string;
  steps?: Array<{ op: string; status: string; error?: { code: string; message?: string } }>;
}

/**
 * What a finished program means for its write intent.
 * - every consequential step dispatched without error: `confirmed` (same as a completed program)
 * - the first consequential failure happened before dispatch and nothing consequential ran: `not_applied`
 * - otherwise an input may have reached the site: `uncertain`
 */
export function writeOutcome(result: WriteResultLike): { outcome: "confirmed" | "not_applied" | "uncertain"; reason?: string } {
  if (result.status === "completed") return { outcome: "confirmed" };
  // without step outcomes nothing proves the input stayed in this process
  if (!result.steps?.length) return { outcome: "uncertain" };
  const writes = (result.steps ?? []).filter((s) => classifyStep(s.op) !== "read");
  const failed = writes.find((s) => s.status === "failed");
  if (!failed) {
    if (writes.length && writes.every((s) => s.status === "ok")) return { outcome: "confirmed" };
    if (writes.every((s) => s.status === "skipped")) return { outcome: "not_applied", reason: "no consequential step was dispatched" };
    return { outcome: "uncertain" };
  }
  const dispatchedBefore = writes.slice(0, writes.indexOf(failed)).some((s) => s.status === "ok");
  if (!dispatchedBefore && failed.error && PRE_DISPATCH_CODES.has(failed.error.code)) {
    return { outcome: "not_applied", reason: `${failed.op} failed before dispatch: ${failed.error.code}` };
  }
  return { outcome: "uncertain" };
}

export function settleWrite(
  ledger: DurableWriteLedger | undefined,
  intentId: string | undefined,
  result: boolean | WriteResultLike,
): void {
  if (!ledger || !intentId) return;
  const settled = typeof result === "boolean" ? { outcome: result ? "confirmed" as const : "uncertain" as const } : writeOutcome(result);
  if (settled.outcome === "confirmed") ledger.confirm(intentId);
  else if (settled.outcome === "not_applied") ledger.abortUndispatched(intentId, settled.reason ?? "not dispatched");
  else ledger.fail(intentId);
}
