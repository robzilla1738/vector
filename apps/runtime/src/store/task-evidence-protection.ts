import { setImmediate } from "node:timers/promises";
import type { DatabaseSync } from "node:sqlite";
import { TaskEvidenceSchema } from "@aux/contracts";
import { withSecureDelete } from "./db.js";
import type { FieldCodec } from "./field-codec.js";

export const TASK_EVIDENCE_PROTECTION = "task_evidence_protection_v1";
const PROOF = "aux-v3/task-evidence-json/v1";
type Protection = { cursor: number | null; proof: string };

export function taskEvidenceProtection(db: DatabaseSync): Protection | undefined {
  const marker = db.prepare("SELECT value FROM aux_meta WHERE key=?").get(TASK_EVIDENCE_PROTECTION) as
    { value: string } | undefined;
  if (!marker) return;
  const state = JSON.parse(marker.value) as Protection;
  if (
    !state ||
    Object.keys(state).length !== 2 ||
    typeof state.proof !== "string" ||
    !state.proof ||
    (state.cursor !== null && (!Number.isSafeInteger(state.cursor) || state.cursor < 0))
  )
    throw new Error("Invalid task evidence protection migration marker.");
  return state;
}

export function authenticateTaskEvidenceProtection(
  db: DatabaseSync,
  codec: FieldCodec,
): Protection | undefined {
  const state = taskEvidenceProtection(db);
  if (
    state &&
    codec.decrypt("aux_meta", JSON.stringify([TASK_EVIDENCE_PROTECTION]), "value", state.proof) !== PROOF
  )
    throw new Error("The task evidence protection marker does not match its original Profile.");
  return state;
}

/** Portable recovery translates this Profile-bound completion proof with its rows. */
export function recodeTaskEvidenceProtection(
  db: DatabaseSync,
  codec: FieldCodec,
  direction: "encrypt" | "decrypt",
): void {
  const state = taskEvidenceProtection(db);
  if (!state) return;
  if (direction === "decrypt") authenticateTaskEvidenceProtection(db, codec);
  else if (state.proof !== PROOF) throw new Error("Invalid portable task evidence protection proof.");
  state.proof = codec[direction](
    "aux_meta",
    JSON.stringify([TASK_EVIDENCE_PROTECTION]),
    "value",
    state.proof,
  );
  db.prepare("UPDATE aux_meta SET value=? WHERE key=?").run(JSON.stringify(state), TASK_EVIDENCE_PROTECTION);
}

type EvidenceRow = {
  seq: number;
  evidence_id: string;
  task_id: string;
  task_revision: number;
  criterion_id: string;
  json: string;
};

/** One resumable conversion before protected services can admit requests. */
export async function protectLegacyTaskEvidence(db: DatabaseSync, codec: FieldCodec): Promise<void> {
  const marker = authenticateTaskEvidenceProtection(db, codec);
  if (marker?.cursor === null) return;
  const state: Protection = marker ?? {
    cursor: 0,
    proof: codec.encrypt("aux_meta", JSON.stringify([TASK_EVIDENCE_PROTECTION]), "value", PROOF),
  };
  let cursor = state.cursor!;
  if (!marker)
    db.prepare("INSERT INTO aux_meta(key,value) VALUES(?,?)").run(
      TASK_EVIDENCE_PROTECTION,
      JSON.stringify(state),
    );
  for (;;) {
    const row = db
      .prepare(
        "SELECT seq,evidence_id,task_id,task_revision,criterion_id,json FROM task_evidence WHERE seq>? ORDER BY seq LIMIT 1",
      )
      .get(cursor) as EvidenceRow | undefined;
    if (!row) break;
    const sealed = codec.isEncrypted(row.json);
    const content = sealed
      ? codec.decrypt("task_evidence", JSON.stringify([row.seq]), "json", row.json)
      : row.json;
    const record = TaskEvidenceSchema.parse(JSON.parse(content));
    if (
      record.evidenceId !== row.evidence_id ||
      record.taskId !== row.task_id ||
      record.taskRevision !== row.task_revision ||
      record.criterionId !== row.criterion_id
    )
      throw new Error("The original task evidence identity does not match its stored row.");
    withSecureDelete(db, () => {
      db.exec("BEGIN IMMEDIATE");
      try {
        if (!sealed)
          db.prepare("UPDATE task_evidence SET json=? WHERE seq=?").run(
            codec.encrypt("task_evidence", JSON.stringify([row.seq]), "json", content),
            row.seq,
          );
        state.cursor = row.seq;
        db.prepare("UPDATE aux_meta SET value=? WHERE key=?").run(
          JSON.stringify(state),
          TASK_EVIDENCE_PROTECTION,
        );
        db.exec("COMMIT");
      } catch (error) {
        if (db.isTransaction) db.exec("ROLLBACK");
        throw error;
      }
    });
    cursor = row.seq;
    await setImmediate();
  }
  // Remove the prior plaintext WAL frames before marking the conversion complete.
  if (cursor > 0) {
    const checkpoint = db.prepare("PRAGMA wal_checkpoint(TRUNCATE)").get() as { busy: number };
    if (checkpoint.busy)
      throw new Error("Task evidence protection is waiting for the original database reader to close.");
  }
  state.cursor = null;
  db.prepare("UPDATE aux_meta SET value=? WHERE key=?").run(JSON.stringify(state), TASK_EVIDENCE_PROTECTION);
}
