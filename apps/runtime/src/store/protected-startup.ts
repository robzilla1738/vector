import type { DatabaseSync } from "node:sqlite";
import type { NativeBridge } from "../native.js";
import { compactProtectedSqlite, migrateSensitiveTable, SqliteColumnCipher } from "./sqlite-protection.js";

/** Only tables whose every SQL read and write has a protected-field adapter. */
export const ACTIVE_PROTECTED_TABLES = [
  "model_calls",
  "page_sets",
  "set_members",
  "programs",
  "response_metadata",
  "results",
  "datasets",
  "events",
  "run_messages",
  "safety_approval_requests",
  "safety_send_journal",
  "safety_audit",
] as const;

/** Complete the protected migration before constructing any repository service. */
export async function prepareProtectedDatabase(db: DatabaseSync, native: NativeBridge, profileId: string) {
  if (!profileId) throw new Error("Protected database startup requires a Profile identity.");
  const hasEncryptedRows = Boolean(db.prepare(
    "SELECT 1 FROM aux_meta WHERE key LIKE 'protected_sqlite_v1:%' LIMIT 1",
  ).get());
  const cipher = await SqliteColumnCipher.create(native, profileId, hasEncryptedRows);
  let migrated = 0;
  for (const table of ACTIVE_PROTECTED_TABLES) migrated += migrateSensitiveTable(db, cipher, table);
  if (migrated) compactProtectedSqlite(db);
  return cipher;
}
