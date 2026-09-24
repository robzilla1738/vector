import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

const FINGERPRINT = /^sha256:[a-f0-9]{64}$/;

/** Distinct-input promotion needs equality, never the original input values. */
export function operationInputFingerprint(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

/** Convert older raw validation samples before the Profile or a portable copy is used. */
export function sanitizeOperationInputSamples(db: DatabaseSync): number {
  if (!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='operation_implementations'").get()) return 0;
  const rows = db.prepare("SELECT impl_id AS implId,stats FROM operation_implementations WHERE instr(stats,'successInputs')>0")
    .all() as { implId: string; stats: string }[];
  const ownTransaction = !db.isTransaction;
  if (ownTransaction) db.exec("BEGIN");
  let changed = 0;
  try {
    for (const row of rows) {
      let stats: Record<string, unknown>;
      try { stats = JSON.parse(row.stats) as Record<string, unknown>; }
      catch {
        db.prepare("UPDATE operation_implementations SET stats='{}' WHERE impl_id=?").run(row.implId);
        changed++;
        continue;
      }
      if (!stats || typeof stats !== "object" || Array.isArray(stats)) {
        db.prepare("UPDATE operation_implementations SET stats='{}' WHERE impl_id=?").run(row.implId);
        changed++;
        continue;
      }
      const original = stats.successInputs;
      if (!Array.isArray(original)) {
        if (original !== undefined) {
          delete stats.successInputs;
          db.prepare("UPDATE operation_implementations SET stats=? WHERE impl_id=?").run(JSON.stringify(stats), row.implId);
          changed++;
        }
        continue;
      }
      const samples = [...new Set(original.filter((item): item is string => typeof item === "string")
        .map(item => FINGERPRINT.test(item) ? item : operationInputFingerprint(item)))].slice(0, 3);
      if (JSON.stringify(original) === JSON.stringify(samples)) continue;
      db.prepare("UPDATE operation_implementations SET stats=? WHERE impl_id=?")
        .run(JSON.stringify({ ...stats, successInputs: samples }), row.implId);
      changed++;
    }
    if (ownTransaction) db.exec("COMMIT");
    return changed;
  } catch (error) {
    if (ownTransaction) db.exec("ROLLBACK");
    throw error;
  }
}
