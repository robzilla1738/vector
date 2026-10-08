import { createHash } from "node:crypto";
import { setImmediate } from "node:timers/promises";
import { CloudProcessIdentitySchema } from "@aux/contracts/coding-processes";
import type { Repo } from "../store/repo.js";

export const PROCESS_LOG_CHUNK_BYTES = 64 * 1024;
export const PROCESS_LOG_LIMIT = 8 * 1024 * 1024;

/** End before a split code point; inputs come from the SDK's decoded UTF-8 strings. */
export function utf8PrefixLength(bytes: Buffer, end: number): number {
  while (end > 0 && end < bytes.length && (bytes[end]! & 0xc0) === 0x80) end--;
  return end;
}

export function appendProcessLog(repo: Repo, processId: string, offset: number, bytes: Buffer): void {
  for (let start = 0; start < bytes.length;) {
    const end = utf8PrefixLength(bytes, Math.min(start + PROCESS_LOG_CHUNK_BYTES, bytes.length));
    repo.db
      .prepare("INSERT INTO coding_process_logs(process_id,byte_offset,byte_length,text) VALUES(?,?,?,?)")
      .run(
        processId,
        offset + start,
        end - start,
        repo.protectRecordField(
          "coding_process_logs",
          [processId, offset + start],
          "text",
          bytes.subarray(start, end).toString("utf8"),
        ),
      );
    start = end;
  }
}

/** Called after original Profile key admission, before services or APIs can read receipts. */
export async function migrateCodingProcessLogs(repo: Repo): Promise<void> {
  const marker = repo.db
    .prepare("SELECT value FROM aux_meta WHERE key='coding_process_logs_migration'")
    .get() as { value: string } | undefined;
  if (!marker) return;
  let cursor = Number(marker.value);
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error("Invalid process log migration cursor.");
  for (;;) {
    const row = repo.db
      .prepare(
        "SELECT rowid,process_id,run_id,receipt FROM coding_process_receipts WHERE rowid>? ORDER BY rowid LIMIT 1",
      )
      .get(cursor) as { rowid: number; process_id: string; run_id: string; receipt: string } | undefined;
    if (!row) break;
    repo.transaction(() => {
      const receipt = JSON.parse(
        repo.revealRecordField("coding_process_receipts", [row.process_id], "receipt", row.receipt),
      );
      if (Object.hasOwn(receipt, "logText")) {
        if (
          receipt.processId !== row.process_id ||
          receipt.runId !== row.run_id ||
          !CloudProcessIdentitySchema.safeParse(receipt.execution).success ||
          typeof receipt.logText !== "string"
        )
          throw new Error("Cannot migrate an invalid cloud process receipt.");
        const bytes = Buffer.from(receipt.logText);
        const length = utf8PrefixLength(bytes, Math.min(bytes.length, PROCESS_LOG_LIMIT));
        appendProcessLog(repo, row.process_id, 0, bytes.subarray(0, length));
        if (length < bytes.length) receipt.logTruncated = true;
        if (receipt.logDigest)
          receipt.logDigest = createHash("sha256").update(bytes.subarray(0, length)).digest("hex");
        delete receipt.logText;
        repo.db
          .prepare("UPDATE coding_process_receipts SET receipt=? WHERE process_id=?")
          .run(
            repo.protectRecordField(
              "coding_process_receipts",
              [row.process_id],
              "receipt",
              JSON.stringify(receipt),
            ),
            row.process_id,
          );
      }
      repo.db
        .prepare("UPDATE aux_meta SET value=? WHERE key='coding_process_logs_migration'")
        .run(String(row.rowid));
    });
    cursor = row.rowid;
    await setImmediate();
  }
  repo.db.prepare("DELETE FROM aux_meta WHERE key='coding_process_logs_migration'").run();
}
