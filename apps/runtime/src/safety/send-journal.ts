import { createHash, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export type SendState = "queued" | "offline" | "sending" | "accepted" | "acknowledged" | "parked" | "failed" | "cancelled";
export interface SendRecord {
  nonce: string;
  threadId: string;
  turnId: string;
  text: string;
  state: SendState;
  acceptanceId?: string;
  errorCode?: string;
  createdAt: number;
  updatedAt: number;
}
export type AcceptanceLookup = (nonce: string) => Promise<
  | { status: "accepted"; acceptanceId: string }
  | { status: "not_accepted" }
  | { status: "unknown" }
>;
export type MessageTransport = {
  online(): boolean;
  lookup: AcceptanceLookup;
  send: (input: { nonce: string; threadId: string; turnId: string; text: string }) => Promise<{ acceptanceId: string }>;
};

const SELECT = `SELECT nonce,thread_id AS threadId,turn_id AS turnId,text,state,acceptance_id AS acceptanceId,
  error_code AS errorCode,created_at AS createdAt,updated_at AS updatedAt FROM safety_send_journal`;

/** One nonce per logical message; durable before network dispatch. */
export class SendJournal {
  private readonly inFlight = new Map<string, Promise<SendRecord>>();
  constructor(private readonly db: DatabaseSync) {
    db.exec(`CREATE TABLE IF NOT EXISTS safety_send_journal(
      nonce TEXT PRIMARY KEY, thread_id TEXT NOT NULL, turn_id TEXT NOT NULL, text TEXT NOT NULL,
      digest TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('queued','offline','sending','accepted','acknowledged','parked','failed','cancelled')),
      acceptance_id TEXT, error_code TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_safety_send_turn ON safety_send_journal(turn_id,created_at);
      CREATE INDEX IF NOT EXISTS idx_safety_send_state ON safety_send_journal(state,created_at);`);
    this.recoverInterrupted();
  }

  queue(input: { nonce?: string; threadId: string; turnId: string; text: string }, now = Date.now()): SendRecord {
    if (!input.threadId || !input.turnId || !input.text.trim()) throw new Error("A send needs a thread, turn, and message");
    const nonce = input.nonce ?? randomUUID();
    const digest = createHash("sha256").update(JSON.stringify([input.threadId, input.turnId, input.text])).digest("hex");
    const existing = this.db.prepare(`SELECT digest FROM safety_send_journal WHERE nonce=?`).get(nonce) as { digest: string } | undefined;
    if (existing && existing.digest !== digest) throw new Error("Nonce belongs to a different message");
    if (!existing) this.db.prepare(`INSERT INTO safety_send_journal(nonce,thread_id,turn_id,text,digest,state,created_at,updated_at)
      VALUES(?,?,?,?,?,'queued',?,?)`).run(nonce, input.threadId, input.turnId, input.text, digest, now, now);
    return this.messageStatus(nonce)!;
  }

  messageStatus(nonce: string): SendRecord | undefined {
    return this.db.prepare(`${SELECT} WHERE nonce=?`).get(nonce) as unknown as SendRecord | undefined;
  }

  list(threadId: string): SendRecord[] {
    return this.db.prepare(`${SELECT} WHERE thread_id=? ORDER BY created_at,nonce`).all(threadId) as unknown as SendRecord[];
  }

  /** An uncertain send is never replayed without an authoritative negative lookup. */
  dispatch(nonce: string, transport: MessageTransport, now = Date.now()): Promise<SendRecord> {
    const current = this.inFlight.get(nonce);
    if (current) return current;
    const pending = this.dispatchOnce(nonce, transport, now).finally(() => this.inFlight.delete(nonce));
    this.inFlight.set(nonce, pending);
    return pending;
  }

  private async dispatchOnce(nonce: string, transport: MessageTransport, now: number): Promise<SendRecord> {
    let record = this.messageStatus(nonce);
    if (!record) throw new Error("Unknown message nonce");
    if (["accepted", "acknowledged", "failed", "cancelled"].includes(record.state)) return record;
    // A concurrent caller in this process must not interpret an active send as a crashed send.
    if (record.state === "sending") return record;
    if (!transport.online()) { this.transition(nonce, "offline", now); return this.messageStatus(nonce)!; }
    if (record.state === "parked") {
      let lookup: Awaited<ReturnType<AcceptanceLookup>>;
      try { lookup = await transport.lookup(nonce); }
      catch { lookup = { status: "unknown" }; }
      if (lookup.status === "accepted") {
        this.transition(nonce, "accepted", now, lookup.acceptanceId);
        return this.messageStatus(nonce)!;
      }
      if (lookup.status === "unknown") {
        this.transition(nonce, "parked", now);
        return this.messageStatus(nonce)!;
      }
    }
    // The journal commit occurs before transport.send, including on first dispatch.
    this.transition(nonce, "sending", now);
    record = this.messageStatus(nonce)!;
    try {
      const { acceptanceId } = await transport.send({ nonce, threadId: record.threadId, turnId: record.turnId, text: record.text });
      this.transition(nonce, "accepted", Date.now(), acceptanceId);
    } catch {
      // Network errors say nothing about server acceptance.
      this.transition(nonce, "parked", Date.now());
    }
    return this.messageStatus(nonce)!;
  }

  /** On restart, no sending record becomes queued again. */
  recoverInterrupted(now = Date.now()): number {
    return Number(this.db.prepare("UPDATE safety_send_journal SET state='parked',updated_at=? WHERE state='sending'").run(now).changes);
  }

  acknowledge(nonce: string, acceptanceId: string, now = Date.now()): SendRecord {
    const record = this.messageStatus(nonce);
    if (!record || !["accepted", "acknowledged"].includes(record.state) || record.acceptanceId !== acceptanceId)
      throw new Error("Acknowledgement does not match an accepted send");
    this.transition(nonce, "acknowledged", now, acceptanceId);
    return this.messageStatus(nonce)!;
  }

  acceptLocal(nonce: string, acceptanceId: string, now = Date.now()): SendRecord {
    const current = this.messageStatus(nonce);
    if (!current || current.state === "failed" || current.state === "cancelled" || current.acceptanceId && current.acceptanceId !== acceptanceId)
      throw new Error("Local acceptance does not match the message");
    if (current.state !== "acknowledged") this.transition(nonce, "accepted", now, acceptanceId);
    return this.messageStatus(nonce)!;
  }

  park(nonce: string, now = Date.now()): SendRecord {
    const current = this.messageStatus(nonce);
    if (!current || !["sending", "accepted", "parked"].includes(current.state)) throw new Error("Only an unsettled send can park");
    this.transition(nonce, "parked", now);
    return this.messageStatus(nonce)!;
  }

  cancel(nonce: string, now = Date.now()): SendRecord {
    const current = this.messageStatus(nonce);
    if (!current || ["acknowledged", "failed"].includes(current.state)) throw new Error("Message already settled");
    this.transition(nonce, "cancelled", now);
    return this.messageStatus(nonce)!;
  }

  settleTurn(turnId: string): { status: "settled" | "pending" | "needs_attention"; pending: string[] } {
    const records = this.db.prepare(`${SELECT} WHERE turn_id=? ORDER BY created_at,nonce`).all(turnId) as unknown as SendRecord[];
    const pending = records.filter(record => record.state !== "acknowledged" && record.state !== "cancelled").map(record => record.nonce);
    const status = records.some(record => record.state === "parked" || record.state === "failed")
      ? "needs_attention" : pending.length ? "pending" : "settled";
    return { status, pending };
  }

  /** Only an explicit local decision can make a parked message terminally failed. */
  fail(nonce: string, errorCode: string, now = Date.now()): SendRecord {
    const current = this.messageStatus(nonce);
    if (!current || !["parked", "offline", "queued"].includes(current.state)) throw new Error("Only an unsent or parked message can fail");
    this.db.prepare("UPDATE safety_send_journal SET state='failed',error_code=?,updated_at=? WHERE nonce=?").run(errorCode, now, nonce);
    return this.messageStatus(nonce)!;
  }

  private transition(nonce: string, state: SendState, now: number, acceptanceId?: string): void {
    this.db.prepare(`UPDATE safety_send_journal SET state=?,acceptance_id=COALESCE(?,acceptance_id),updated_at=? WHERE nonce=?`)
      .run(state, acceptanceId ?? null, now, nonce);
  }
}

export function sendNotice(state: SendState): string | null {
  if (state === "offline") return "You are offline. This message is queued and will be checked when the connection returns.";
  if (state === "parked") return "Delivery is uncertain. Aux is checking whether the message was accepted before it can continue.";
  if (state === "failed") return "This message was not delivered. Review it before sending a new one.";
  return null;
}
