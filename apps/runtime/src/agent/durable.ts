/**
 * Durable write ledger (Gate D). Persist intent before dispatch so a lost
 * response cannot issue a second external write with the same key.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

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
