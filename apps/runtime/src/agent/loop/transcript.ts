import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import type { FieldCodec } from "../../store/field-codec.js";
import { withSecureDelete } from "../../store/db.js";
import type { DatabaseSync } from "node:sqlite";
import type { LoopPark, ModelMessage } from "./types.js";
import type { Repo } from "../../store/repo.js";
import { projectLegacyRecall } from "./legacy-recall.js";

/**
 * Durable transcript rows: every model-visible message a run consumes or
 * produces lands here before the loop continues. A restart rebuilds the
 * original history; the loop derives a bounded working view for each request.
 * A suspension's parked tool results ride in a `park` row
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
  /** Accepted question/handoff answer awaiting consumption; never executable approval authority. */
  acceptedAnswer?: unknown;
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

/** Matches the original fork writer: an incomplete tool step is never copied. */
export function closedTranscriptEntries(entries: { seq: number; message: ModelMessage }[]) {
  const messages = entries.map((entry) => entry.message);
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index]!;
    if (message.role !== "assistant" || !Array.isArray(message.content)) continue;
    const pending = new Set(
      message.content.filter((part) => part.type === "tool-call").map((part) => part.toolCallId),
    );
    if (!pending.size) continue;
    for (let resultIndex = index + 1; resultIndex < messages.length; resultIndex++) {
      const result = messages[resultIndex]!;
      if (result.role !== "tool") break;
      for (const part of result.content) if (part.type === "tool-result") pending.delete(part.toolCallId);
    }
    if (pending.size) return entries.slice(0, index);
  }
  return entries;
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

  /** Raw immutable prefix, retaining source seqs for exact historical lineage proof. */
  forkEntries(runId: string): { seq: number; message: ModelMessage }[] {
    return closedTranscriptEntries(this.entries(runId));
  }

  /** A new fork never copies durable legacy recall into another model context. */
  forkPrefix(runId: string, repo: Repo): ModelMessage[] {
    return projectLegacyRecall(
      repo,
      this,
      runId,
      this.forkEntries(runId).map((entry) => entry.message),
    );
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

  /** Bounded historical inspection uses the same encrypted rows as the loop. */
  pageEntries(runId: string, beforeSeq?: number) {
    const rows = this.db
      .prepare(
        `SELECT seq,message FROM run_transcript WHERE run_id=? AND kind='message' AND seq<? ORDER BY seq DESC LIMIT 81`,
      )
      .all(runId, beforeSeq ?? Number.MAX_SAFE_INTEGER) as { seq: number; message: string }[];
    const page = rows.slice(0, 80);
    return {
      entries: page.reverse().map((row) => ({
        seq: row.seq,
        message: this.decode<ModelMessage>(runId, row.seq, "message", row.message),
      })),
      earlierSequence: rows.length > 80 ? page[0]!.seq : undefined,
    };
  }

  /** Explicit retirement only: bounded authenticated message AND parked-result inspection. */
  *retirementPages(
    runId: string,
    decode = true,
  ): Generator<{
    rows: { seq: number; kind: "message" | "park"; value: unknown }[];
    fingerprint: string;
    bytes: number;
  }> {
    const rowLimit = 1024 * 1024;
    let after = -1,
      total = 0;
    const digest = createHash("sha256");
    const first = this.db.prepare("SELECT MIN(seq) AS seq FROM run_transcript WHERE run_id=?").get(runId) as {
      seq: number | null;
    };
    if (first.seq !== null && (!Number.isSafeInteger(first.seq) || first.seq < 0))
      throw new AuxError("permission_denied", "Legacy Memory history has invalid row identities.");
    for (;;) {
      const rows = this.db
        .prepare(
          `SELECT seq,kind,
        CASE WHEN length(CAST(message AS BLOB))<=? THEN message END AS message,
        CASE WHEN length(CAST(park AS BLOB))<=? THEN park END AS park,
        length(CAST(coalesce(message,'') AS BLOB))+length(CAST(coalesce(park,'') AS BLOB)) AS bytes,
        message IS NOT NULL AS has_message, park IS NOT NULL AS has_park
        FROM run_transcript WHERE run_id=? AND seq>? ORDER BY seq LIMIT 64`,
        )
        .all(rowLimit, rowLimit, runId, after) as {
        seq: number;
        kind: string;
        message: string | null;
        park: string | null;
        bytes: number;
        has_message: number;
        has_park: number;
      }[];
      if (!rows.length) return;
      const page = rows.map((row) => {
        const column: "park" | "message" = row.kind === "park" ? "park" : "message";
        const encoded = row[column];
        total += row.bytes;
        if (
          !Number.isSafeInteger(row.seq) ||
          row.seq <= after ||
          !["message", "park"].includes(row.kind) ||
          row.bytes > rowLimit ||
          total > 64 * 1024 * 1024 ||
          row.has_message + row.has_park !== 1 ||
          (column === "message" ? !row.has_message : !row.has_park) ||
          typeof encoded !== "string"
        )
          throw new AuxError(
            "permission_denied",
            "Legacy Memory history exceeds its bounded retirement inspection.",
          );
        digest.update(JSON.stringify([row.seq, row.kind, encoded]));
        after = row.seq;
        return {
          seq: row.seq,
          kind: column,
          value: decode ? this.decode<unknown>(runId, row.seq, column, encoded) : undefined,
        };
      });
      yield { rows: page, fingerprint: digest.copy().digest("hex"), bytes: total };
    }
  }

  messageAfter(runId: string, sequence: number): ModelMessage | undefined {
    const row = this.db
      .prepare(
        `SELECT seq,message FROM run_transcript WHERE run_id=? AND kind='message' AND seq>? ORDER BY seq LIMIT 1`,
      )
      .get(runId, sequence) as { seq: number; message: string } | undefined;
    return row && this.decode<ModelMessage>(runId, row.seq, "message", row.message);
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

  updatePark(runId: string, parked: ParkedCall): void {
    const row = this.db
      .prepare("SELECT seq,park FROM run_transcript WHERE run_id=? AND kind='park' ORDER BY seq DESC LIMIT 1")
      .get(runId) as { seq: number; park: string } | undefined;
    if (!row || !this.openPark(runId)) throw new Error("No open parked call to update");
    const current = this.decode<ParkedCall>(runId, row.seq, "park", row.park);
    if (current.toolCallId !== parked.toolCallId) throw new Error("Cannot replace another parked call");
    withSecureDelete(this.db, () =>
      this.db
        .prepare("UPDATE run_transcript SET park=? WHERE run_id=? AND seq=?")
        .run(this.encode(runId, row.seq, "park", parked), runId, row.seq),
    );
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
