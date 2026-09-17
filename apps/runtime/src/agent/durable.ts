/**
 * Durable write ledger (Gate D). Persist intent before dispatch so a lost
 * response cannot issue a second external write with the same key.
 */
export interface WriteIntent {
  id: string;
  runId: string;
  pageId: string;
  documentEpoch: number;
  idempotencyKey: string;
  status: "pending" | "confirmed" | "failed";
}

export class DurableWriteLedger {
  private byKey = new Map<string, WriteIntent>();
  private seq = 0;

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
    if (existing?.status === "confirmed" || existing?.status === "pending") {
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
    return { intent, duplicate: false };
  }

  confirm(id: string) {
    for (const intent of this.byKey.values()) {
      if (intent.id === id) intent.status = "confirmed";
    }
  }

  fail(id: string) {
    for (const intent of this.byKey.values()) {
      if (intent.id === id) intent.status = "failed";
    }
  }

  get(idempotencyKey: string): WriteIntent | undefined {
    return this.byKey.get(idempotencyKey);
  }
}

export function stepSignature(ops: Array<{ op: string; target?: string; value?: string }>): string {
  return ops.map((s) => `${s.op}:${s.target ?? ""}:${s.value ?? ""}`).join("|");
}
