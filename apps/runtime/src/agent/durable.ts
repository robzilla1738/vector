/**
 * Durable write ledger (Gate D). Persist intent before dispatch so a lost
 * response cannot issue a second external write with the same key.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { classifyStep } from "./permissions.js";

export interface WriteIntent {
  id: string;
  runId: string;
  pageId: string;
  documentEpoch: number;
  idempotencyKey: string;
  status: "pending" | "confirmed" | "failed";
}

interface LedgerFile {
  seq: number;
  intents: WriteIntent[];
}

export class DurableWriteLedger {
  private byKey = new Map<string, WriteIntent>();
  private seq = 0;
  private readonly persistPath?: string;

  constructor(persistPath?: string) {
    this.persistPath = persistPath;
    if (persistPath) this.load();
  }

  key(runId: string, pageId: string, epoch: number, signature: string): string {
    return `${runId}|${pageId}|${epoch}|${signature}`;
  }

  begin(opts: {
    runId: string;
    pageId: string;
    documentEpoch: number;
    signature: string;
  }): { intent: WriteIntent; duplicate: boolean } {
    const idempotencyKey = this.key(opts.runId, opts.pageId, opts.documentEpoch, opts.signature);
    const existing = this.byKey.get(idempotencyKey);
    if (existing && (existing.status === "confirmed" || existing.status === "pending")) {
      return { intent: existing, duplicate: true };
    }
    const intent: WriteIntent = {
      id: `w${++this.seq}`,
      runId: opts.runId,
      pageId: opts.pageId,
      documentEpoch: opts.documentEpoch,
      idempotencyKey,
      status: "pending",
    };
    this.byKey.set(idempotencyKey, intent);
    this.flush();
    return { intent, duplicate: false };
  }

  confirm(id: string) {
    for (const intent of this.byKey.values()) {
      if (intent.id === id) intent.status = "confirmed";
    }
    this.flush();
  }

  fail(id: string) {
    for (const intent of this.byKey.values()) {
      if (intent.id === id) intent.status = "failed";
    }
    this.flush();
  }

  get(idempotencyKey: string): WriteIntent | undefined {
    return this.byKey.get(idempotencyKey);
  }

  private load() {
    const path = this.persistPath;
    if (!path) return;
    try {
      const parsed = JSON.parse(readFileSync(path, "utf8")) as LedgerFile;
      this.seq = parsed.seq ?? 0;
      for (const intent of parsed.intents ?? []) {
        this.byKey.set(intent.idempotencyKey, intent);
      }
    } catch {
      /* first use or unreadable file — start empty */
    }
  }

  private flush() {
    if (!this.persistPath) return;
    const payload: LedgerFile = {
      seq: this.seq,
      intents: [...this.byKey.values()],
    };
    mkdirSync(dirname(this.persistPath), { recursive: true });
    const tmp = `${this.persistPath}.tmp`;
    writeFileSync(tmp, JSON.stringify(payload));
    renameSync(tmp, this.persistPath);
  }
}

export function stepSignature(ops: Array<{ op: string; target?: string; value?: string }>): string {
  return ops.map((s) => `${s.op}:${s.target ?? ""}:${s.value ?? ""}`).join("|");
}

function stepsForSignature(steps: Array<{ op: string; target?: unknown; value?: unknown }>): Array<{ op: string; target?: string; value?: string }> {
  return steps.map((s) => ({
    op: s.op,
    target: typeof s.target === "string" ? s.target : "",
    value: typeof s.value === "string" ? s.value : "",
  }));
}

/** Persist a write/egress intent. `skip` means do not dispatch. */
export function beginConsequentialWrite(
  ledger: DurableWriteLedger | undefined,
  opts: {
    runId: string;
    pageId: string;
    documentEpoch: number;
    steps: Array<{ op: string; target?: unknown; value?: unknown }>;
  },
): { skip: boolean; intentId?: string } {
  if (!ledger) return { skip: false };
  const writes = opts.steps.some((s) => {
    const effect = classifyStep(s.op);
    return effect === "write" || effect === "egress";
  });
  if (!writes) return { skip: false };
  const began = ledger.begin({
    runId: opts.runId,
    pageId: opts.pageId,
    documentEpoch: opts.documentEpoch,
    signature: stepSignature(stepsForSignature(opts.steps)),
  });
  if (began.duplicate) return { skip: true };
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
