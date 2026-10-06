import type { FieldCodec } from "../../store/field-codec.js";
import { withSecureDelete } from "../../store/db.js";
import type { DatabaseSync } from "node:sqlite";
import type { LoopPark, ModelMessage } from "./types.js";

/**
 * Durable transcript rows: every model-visible message a run consumes or
 * produces lands here before the loop continues. A restart rebuilds the
 * exact context; a suspension's parked tool results ride in a `park` row
 * (never a message row) so side-effect-bearing outputs are not recomputed.
 */
interface TranscriptRow {
  seq: number;
  kind: string;
  message: string | null;
  park: string | null;
}

/** Pending tool results captured when a suspension interrupts a multi-call step. */
export interface ParkedCall {
  /** The tool call awaiting a resolution — its result is the answer. */
  toolCallId: string;
  toolName: string;
  /** Typed suspension needed to reconstruct the pending question on restart. */
  suspension?: LoopPark;
  /**
   * Every call of the step in order: real outputs for executed calls, a
   * `parked` slot for the suspended call, and honest "interrupted" outputs
   * for calls after it that never ran.
   */
  pendingResults: (
    | { toolCallId: string; toolName: string; output: unknown }
    | { toolCallId: string; toolName: string; parked: true }
  )[];
}

export class TranscriptStore {
  constructor(
    private readonly db: DatabaseSync,
    private readonly codec?: FieldCodec,
  ) {}

  private encode(runId: string, seq: number, column: "message" | "park", value: unknown): string {
    const text = JSON.stringify(value);
    return this.codec?.encrypt("run_transcript", JSON.stringify([runId, seq]), column, text) ?? text;
  }

  private decode<T>(runId: string, seq: number, column: "message" | "park", value: string): T {
    return JSON.parse(
      this.codec?.decrypt("run_transcript", JSON.stringify([runId, seq]), column, value) ?? value,
    ) as T;
  }

  private nextSeq(runId: string): number {
    const row = this.db.prepare(`SELECT MAX(seq) AS s FROM run_transcript WHERE run_id=?`).get(runId) as
      { s: number | null } | undefined;
    return (row?.s ?? -1) + 1;
  }

  /** Append model messages; returns the first new seq. */
  append(runId: string, messages: ModelMessage[], at = Date.now()): number {
    let seq = this.nextSeq(runId);
    const first = seq;
    const stmt = this.db.prepare(
      `INSERT INTO run_transcript(run_id,seq,kind,message,appended_at) VALUES(?,?,'message',?,?)`,
    );
    for (const message of messages) {
      stmt.run(runId, seq, this.encode(runId, seq, "message", message), at);
      seq++;
    }
    return first;
  }

  /** Load the message history (park rows are metadata, not messages). */
  load(runId: string): ModelMessage[] {
    const rows = this.db
      .prepare(`SELECT seq, message FROM run_transcript WHERE run_id=? AND kind='message' ORDER BY seq`)
      .all(runId) as { seq: number; message: string }[];
    return rows.map((row) => this.decode<ModelMessage>(runId, row.seq, "message", row.message));
  }

  /** Message rows with their seqs — same order as `load`, so index i ↔ entries[i].seq. */
  entries(runId: string): { seq: number; message: ModelMessage }[] {
    const rows = this.db
      .prepare(`SELECT seq, message FROM run_transcript WHERE run_id=? AND kind='message' ORDER BY seq`)
      .all(runId) as { seq: number; message: string }[];
    return rows.map((row) => ({
      seq: row.seq,
      message: this.decode<ModelMessage>(runId, row.seq, "message", row.message),
    }));
  }

  /** Persist a compaction rewrite — specific message rows replaced in one transaction. */
  rewrite(runId: string, updates: { seq: number; message: ModelMessage }[]): void {
    if (!updates.length) return;
    try {
      this.db.exec("BEGIN");
      const stmt = this.db.prepare(
        `UPDATE run_transcript SET message=? WHERE run_id=? AND seq=? AND kind='message'`,
      );
      for (const update of updates)
        withSecureDelete(this.db, () =>
          stmt.run(this.encode(runId, update.seq, "message", update.message), runId, update.seq),
        );
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  /** One open park per run — parking again superseded by a newer row is impossible. */
  park(runId: string, parked: ParkedCall, at = Date.now()): void {
    const open = this.openPark(runId);
    if (open) throw new Error(`run ${runId} already has a parked tool call (${open.toolCallId})`);
    const seq = this.nextSeq(runId);
    this.db
      .prepare(`INSERT INTO run_transcript(run_id,seq,kind,park,appended_at) VALUES(?,?,'park',?,?)`)
      .run(runId, seq, this.encode(runId, seq, "park", parked), at);
  }

  openPark(runId: string): ParkedCall | undefined {
    const row = this.db
      .prepare(
        `SELECT seq, park FROM run_transcript WHERE run_id=? AND kind='park' ORDER BY seq DESC LIMIT 1`,
      )
      .get(runId) as { seq: number; park: string } | undefined;
    if (!row) return undefined;
    const parked = this.decode<ParkedCall & { resolved?: boolean }>(runId, row.seq, "park", row.park);
    return parked.resolved ? undefined : parked;
  }

  /** The parked call resolves into a tool message; the park row is marked consumed in place. */
  resolvePark(runId: string, message: ModelMessage, at = Date.now()): void {
    const row = this.db
      .prepare(
        `SELECT seq, park FROM run_transcript WHERE run_id=? AND kind='park' ORDER BY seq DESC LIMIT 1`,
      )
      .get(runId) as TranscriptRow | undefined;
    if (!row) throw new Error(`run ${runId} has no parked tool call`);
    const parked = this.decode<ParkedCall & { resolved?: boolean }>(runId, row.seq, "park", row.park!);
    if (parked.resolved) throw new Error(`run ${runId} park already resolved`);
    try {
      this.db.exec("BEGIN");
      withSecureDelete(this.db, () =>
        this.db
          .prepare(`UPDATE run_transcript SET park=? WHERE run_id=? AND seq=?`)
          .run(this.encode(runId, row.seq, "park", { ...parked, resolved: true }), runId, row.seq),
      );
      this.append(runId, [message], at);
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  /** Replace everything at or after `seq` — compaction rewrites the tail. */
  truncateFrom(runId: string, seq: number): void {
    withSecureDelete(this.db, () =>
      this.db.prepare(`DELETE FROM run_transcript WHERE run_id=? AND seq>=?`).run(runId, seq),
    );
  }

  count(runId: string): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) AS n FROM run_transcript WHERE run_id=? AND kind='message'`)
      .get(runId) as { n: number };
    return row.n;
  }
}
