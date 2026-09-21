/** Persist intent before dispatch; uncertainty never authorizes a retry. */
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { openDb } from "../store/db.js";
import { classifyStep } from "./permissions.js";

export interface WriteIntent {
  id: string;
  runId: string;
  pageId: string;
  documentEpoch: number;
  idempotencyKey: string;
  status: "pending" | "confirmed" | "uncertain" | "not_applied";
}

const SELECT = `SELECT id, run_id AS runId, page_id AS pageId,
  document_epoch AS documentEpoch, idempotency_key AS idempotencyKey, status FROM action_intents`;

export class DurableWriteLedger {
  private readonly db: DatabaseSync;
  private readonly ownsDb: boolean;

  constructor(storage?: DatabaseSync | string, legacyPath?: string) {
    this.ownsDb = !storage || typeof storage === "string";
    // Preserve the historical path-based API without overwriting its JSON file.
    this.db = typeof storage === "string" ? openDb(`${storage}.sqlite`) : storage ?? openDb(":memory:");
    const source = typeof storage === "string" ? storage : legacyPath;
    try { if (source) this.importLegacy(source); }
    catch (error) { if (this.ownsDb) this.db.close(); throw error; }
  }

  close(): void { if (this.ownsDb) this.db.close(); }

  key(runId: string, pageId: string, epoch: number, signature: string, revision = 0): string {
    return createHash("sha256").update(JSON.stringify([runId, pageId, epoch, revision, signature])).digest("hex");
  }

  begin(opts: {
    runId: string; pageId: string; documentEpoch: number;
    signature: string; revision?: number; logicalActionId?: string;
  }): { intent: WriteIntent; duplicate: boolean } {
    const idempotencyKey = opts.logicalActionId
      ? createHash("sha256").update(JSON.stringify([opts.runId, opts.logicalActionId])).digest("hex")
      : this.key(opts.runId, opts.pageId, opts.documentEpoch, opts.signature, opts.revision);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      // A new observation, target ref, or repair plan cannot bypass an unresolved
      // effect. Reads can still establish what happened before another write.
      const existing = this.db.prepare(`${SELECT} WHERE idempotency_key=? OR
        (run_id=? AND page_id=? AND status IN ('pending','uncertain'))
        ORDER BY CASE WHEN status IN ('pending','uncertain') THEN 0 ELSE 1 END LIMIT 1`)
        .get(idempotencyKey, opts.runId, opts.pageId) as unknown as WriteIntent | undefined;
      if (existing) {
        this.db.exec("COMMIT");
        return { intent: existing, duplicate: true };
      }
      const intent: WriteIntent = { id: randomUUID(), runId: opts.runId, pageId: opts.pageId,
        documentEpoch: opts.documentEpoch, idempotencyKey, status: "pending" };
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
    this.db.prepare(`INSERT INTO action_intents(id,idempotency_key,run_id,page_id,document_epoch,status,created_at)
      VALUES(?,?,?,?,?,?,?)`).run(intent.id, intent.idempotencyKey, intent.runId, intent.pageId, intent.documentEpoch, intent.status, now);
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

  private importLegacy(path: string): void {
    const source = resolve(path);
    if (this.db.prepare("SELECT 1 FROM journal_imports WHERE source=?").get(source)) return;
    let text: string;
    try { text = readFileSync(source, "utf8"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; }
    const parsed = JSON.parse(text) as { seq: number; intents: WriteIntent[] };
    if (!parsed || !Number.isSafeInteger(parsed.seq) || parsed.seq < 0 || !Array.isArray(parsed.intents)) throw new Error("Invalid legacy action journal; recovery is required");
    for (const intent of parsed.intents) {
      if (!intent || ![intent.id, intent.runId, intent.pageId, intent.idempotencyKey].every(v => typeof v === "string" && v.length > 0)
        || !Number.isSafeInteger(intent.documentEpoch) || !["pending", "confirmed", "failed"].includes(intent.status)) {
        throw new Error("Invalid legacy action intent; recovery is required");
      }
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      for (const intent of parsed.intents) {
        // Legacy keys cannot be matched reliably after replanning. Preserve every
        // row as uncertain until independent reconciliation, including 'failed'.
        const key = createHash("sha256").update(JSON.stringify(["legacy", source, intent.idempotencyKey])).digest("hex");
        this.insert({ ...intent, id: randomUUID(), idempotencyKey: key, status: "uncertain" });
      }
      this.db.prepare("INSERT INTO journal_imports VALUES(?,?)").run(source, Date.now());
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
  });
  if (began.duplicate) return { skip: true, reason: `Action ${began.intent.id} is ${began.intent.status}; reconcile its outcome before dispatch. No new action was executed.` };
  return { skip: false, intentId: began.intent.id };
}

export function settleWrite(
  ledger: DurableWriteLedger | undefined,
  intentId: string | undefined,
  ok: boolean,
): void {
  if (!ledger || !intentId) return;
  if (ok) ledger.confirm(intentId);
  else ledger.fail(intentId);
}
