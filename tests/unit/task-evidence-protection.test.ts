import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, TaskEvidenceService, TaskService } from "@aux/runtime";
import {
  FieldCodec,
  encryptedFieldsForDatabase,
  initializeFieldCodec,
} from "../../apps/runtime/src/store/field-codec.js";
import {
  protectLegacyTaskEvidence,
  taskEvidenceProtection,
} from "../../apps/runtime/src/store/task-evidence-protection.js";
import { profileSecrets } from "../support/profile-secrets.js";
import { withSecureDelete } from "../../apps/runtime/src/store/db.js";

const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});
function databasePath() {
  const directory = mkdtempSync(join(tmpdir(), "aux-task-evidence-protection-"));
  directories.push(directory);
  return join(directory, "state.sqlite");
}
function taskFixture(repo: Repo) {
  const events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Evidence fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Document review",
    objective: "Read the selected document",
    criteria: [{ criterionId: "document", description: "Review complete", verification: "manual" }],
  });
  const evidence = new TaskEvidenceService(repo, events);
  return {
    task,
    evidence,
    add: (content: string) =>
      evidence.importDocument({
        taskId: task.taskId,
        expectedRevision: 1,
        criterionId: "document",
        filename: "evidence.txt",
        content,
      }),
  };
}

it("seals evidence before commit, survives raw SQLite reopen and rejects copied row ciphertext", async () => {
  const path = databasePath(),
    secrets = profileSecrets("evidence");
  let db = openDb(path);
  const codec = await initializeFieldCodec(db, secrets.native, "evidence");
  let repo = new Repo(db, codec);
  const f = taskFixture(repo);
  const marker = "A private document paragraph: 71eac66a";
  const encrypt = vi.spyOn(codec, "encrypt").mockImplementationOnce(() => {
    throw new Error("sealing failed");
  });
  expect(() => f.add(marker)).toThrow("sealing failed");
  expect(db.prepare("SELECT count(*) AS n FROM task_evidence").get()).toEqual({ n: 0 });
  encrypt.mockRestore();
  f.add(marker);
  f.add("Another selected document");
  repo.close();
  db = new DatabaseSync(path, { readOnly: true });
  expect(JSON.stringify(db.prepare("SELECT json FROM task_evidence").all())).not.toContain(marker);
  expect(readFileSync(path).includes(Buffer.from(marker))).toBe(false);
  db.close();
  db = openDb(path);
  repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "evidence"));
  try {
    const service = new TaskEvidenceService(repo, new EventBus(repo));
    expect(service.receipt(f.task.taskId).criteria[0]?.evidence[0]?.record.snapshot?.text).toBe(marker);
    const rows = db.prepare("SELECT seq,json FROM task_evidence ORDER BY seq").all() as {
      seq: number;
      json: string;
    }[];
    db.prepare("UPDATE task_evidence SET json=? WHERE seq=?").run(rows[0]!.json, rows[1]!.seq);
    expect(() => service.receipt(f.task.taskId)).toThrow();
  } finally {
    repo.close();
  }
});

it("resumes a validated legacy conversion and never re-admits plaintext after its protected completion", async () => {
  const path = databasePath(),
    secrets = profileSecrets("legacy-evidence");
  let db = openDb(path);
  let repo = new Repo(db);
  const f = taskFixture(repo);
  const marker = "Legacy confidential document: c605a473";
  f.add(marker);
  f.add("Second legacy document");
  const original = db.prepare("SELECT seq,json FROM task_evidence ORDER BY seq").all() as {
    seq: number;
    json: string;
  }[];
  const codec = await FieldCodec.create(secrets.native, "legacy-evidence", true);
  // A previously sealed row is authenticated, never interpreted as legacy JSON.
  withSecureDelete(db, () =>
    db
      .prepare("UPDATE task_evidence SET json=? WHERE seq=?")
      .run(
        codec.encrypt("task_evidence", JSON.stringify([original[0]!.seq]), "json", original[0]!.json),
        original[0]!.seq,
      ),
  );
  const encrypt = vi.spyOn(codec, "encrypt");
  encrypt.mockImplementation((table, id, column, value) => {
    if (table === "task_evidence") throw new Error("fixture interruption");
    return FieldCodec.prototype.encrypt.call(codec, table, id, column, value);
  });
  await expect(protectLegacyTaskEvidence(db, codec)).rejects.toThrow("fixture interruption");
  encrypt.mockRestore();
  expect(taskEvidenceProtection(db)?.cursor).toBe(original[0]!.seq);
  expect(() => encryptedFieldsForDatabase(db)).toThrow("must finish");
  repo.close();
  db = openDb(path);
  repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "legacy-evidence"));
  try {
    expect(taskEvidenceProtection(db)?.cursor).toBeNull();
    expect(encryptedFieldsForDatabase(db).task_evidence).toEqual(["json"]);
    expect(readFileSync(path).includes(Buffer.from(marker))).toBe(false);
    const service = new TaskEvidenceService(repo, new EventBus(repo));
    expect(service.receipt(f.task.taskId).criteria[0]?.evidence).toHaveLength(2);
    const prepared = vi.spyOn(db, "prepare");
    await initializeFieldCodec(db, secrets.native, "legacy-evidence");
    expect(prepared.mock.calls.every(([sql]) => sql.includes("aux_meta"))).toBe(true);
    prepared.mockRestore();
    const other = await FieldCodec.create(profileSecrets("other").native, "other", true);
    await expect(protectLegacyTaskEvidence(db, other)).rejects.toThrow();
    db.prepare("UPDATE task_evidence SET json=? WHERE seq=?").run(original[0]!.json, original[0]!.seq);
    await initializeFieldCodec(db, secrets.native, "legacy-evidence");
    expect(() => service.receipt(f.task.taskId)).toThrow("plaintext");
  } finally {
    repo.close();
  }
});
