import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { afterEach, expect, it } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { HostMethods } from "@aux/contracts";
import {
  applyPendingRuntimeRestore,
  createRuntimeBackup,
  listRuntimeBackups,
  openDb,
  Repo,
  runtimeRestoreStatus,
  stageRuntimeRestore,
  EventBus,
  TaskService,
  TaskEvidenceService,
} from "@aux/runtime";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import {
  advanceManagedRecoveryGeneration,
  currentManagedRecoveryGeneration,
} from "../../apps/runtime/src/services/managed-recovery-generation.js";
import { issueFreshManagedBackup } from "../../apps/runtime/src/services/runtime-backup.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { saveDocumentSnapshot } from "../support/document-snapshot.js";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

async function stagedFixture(version = 3) {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-restore-"));
  directories.push(dataDir);
  const dbPath = join(dataDir, "aux-state.sqlite");
  const original = new Repo(openDb(dbPath));
  original.setSetting("restore-marker", "before");
  const artifactPath = join(dataDir, "artifacts", "restore-fixture.txt");
  mkdirSync(join(dataDir, "artifacts"), { recursive: true });
  writeFileSync(artifactPath, "restored artifact");
  original.saveArtifact({
    artifactId: "restore-fixture",
    path: artifactPath,
    mediaType: "text/plain",
    size: 17,
    status: "complete",
    createdAt: Date.now(),
  });
  if (version === 2)
    original.db.exec(`
      DROP TABLE run_start_receipts;
      DROP TABLE coding_process_logs;
      DROP TABLE private_spend;
      DROP TABLE document_segments;
      DROP TABLE document_snapshots;
      PRAGMA user_version=2;
    `);
  const backup = await createRuntimeBackup(original, dataDir);
  original.close();
  const changed = new Repo(openDb(dbPath));
  changed.setSetting("restore-marker", "after");
  changed.db.prepare("DELETE FROM artifacts WHERE artifact_id='restore-fixture'").run();
  changed.close();
  rmSync(artifactPath);
  await stageRuntimeRestore(dataDir, backup.path);
  return { dataDir, dbPath, artifactPath };
}

it("applies a staged restore before the next database open and preserves the previous state", async () => {
  const { dataDir, dbPath, artifactPath } = await stagedFixture();
  expect(await runtimeRestoreStatus(dataDir)).toMatchObject({ pending: true });
  const applied = await applyPendingRuntimeRestore(dataDir, dbPath);
  expect(applied.applied).toBe(true);
  if (!("recoveryPath" in applied) || !applied.recoveryPath) throw new Error("Expected a recovery snapshot");

  const restored = new Repo(openDb(dbPath));
  expect(restored.getSetting("restore-marker")).toBe("before");
  expect(restored.getArtifact("restore-fixture")?.path).toBe(artifactPath);
  restored.close();
  expect(readFileSync(artifactPath, "utf8")).toBe("restored artifact");
  const recovery = new Repo(openDb(join(applied.recoveryPath, "state.sqlite")));
  expect(recovery.getSetting("restore-marker")).toBe("after");
  recovery.close();
  const status = await runtimeRestoreStatus(dataDir);
  expect(HostMethods.runtimeRestoreStatus.result.parse(status)).toEqual(status);
  expect(status).toMatchObject({ pending: false, lastAppliedAt: expect.any(Number) });
  expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  expect(await applyPendingRuntimeRestore(dataDir, dbPath)).toEqual({ applied: false });
});

it("restores a valid v2 backup and upgrades it only on the next database open", async () => {
  const { dataDir, dbPath, artifactPath } = await stagedFixture(2);
  expect((await applyPendingRuntimeRestore(dataDir, dbPath)).applied).toBe(true);
  const staged = new DatabaseSync(dbPath, { readOnly: true });
  expect(staged.prepare("PRAGMA user_version").get()).toEqual({ user_version: 2 });
  staged.close();
  const restored = new Repo(openDb(dbPath));
  expect(restored.getSetting("restore-marker")).toBe("before");
  expect(restored.getArtifact("restore-fixture")?.path).toBe(artifactPath);
  expect(restored.db.prepare("SELECT count(*) AS n FROM run_start_receipts").get()).toEqual({ n: 0 });
  restored.close();
});

it("sanitizes protected article recall and authenticates the same Profile before restore staging", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-protected-restore-"));
  directories.push(dataDir);
  const dbPath = join(dataDir, "aux-state.sqlite");
  const db = openDb(dbPath);
  const saved = new Map<string, string>();
  const profileId = "restore-profile";
  const secretName = (prefix: string) =>
    `${prefix}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  const secrets = {
    async readSecret(name: string) {
      return { value: saved.get(name) };
    },
    async storeSecret(name: string, value: string) {
      saved.set(name, value);
      return { ok: true as const };
    },
    async profileStorageRoot() {
      const name = secretName("aux_root_v1");
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
    async profileStorageFactor() {
      const name = secretName("sqlite_factor_v1");
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
  };
  const cipher = await initializeFieldCodec(db, secrets, profileId);
  const repo = new Repo(db, cipher);
  repo.saveRun({
    runId: "article",
    goal: "private goal",
    status: "completed",
    pageIds: [],
    config: { chatId: "chat", contextMemoryIds: ["source"], context: "private source paragraph" },
    result: { answer: "private answer" },
    createdAt: 1,
  });
  const documents = new ConversationDocuments(repo, new DocumentSnapshots(repo));
  documents.add({
    chatId: "chat",
    filename: "retained.txt",
    content: "Opening text ".repeat(100) + "Protected body tail",
    sourceArtifactId: "unrelated",
  });
  const reference = documents.references("chat")[0]!;
  const segmented = await saveDocumentSnapshot(repo);
  const events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const space = tasks.createWorkspace("private space");
  const task = tasks.create({
    workspaceId: space.workspaceId,
    title: "private task",
    objective: "Review the document",
    criteria: [{ criterionId: "criterion", description: "Document reviewed", verification: "manual" }],
  });
  const document = new TaskEvidenceService(repo, events, new DocumentSnapshots(repo)).importText({
    taskId: task.taskId,
    expectedRevision: 1,
    criterionId: "criterion",
    filename: "evidence.txt",
    content: "private evidence",
  });
  db.prepare(
    "INSERT INTO criterion_reviews(review_id,task_id,task_revision,criterion_id,json) VALUES('review',?,1,'criterion',?)",
  ).run(task.taskId, JSON.stringify({ note: "private review" }));

  const backup = await createRuntimeBackup(repo, dataDir);
  const backupBytes = readFileSync(join(backup.path, "state.sqlite"));
  expect(backupBytes.includes("private source paragraph")).toBe(false);
  expect(backupBytes.includes("retained.txt")).toBe(false);
  expect(backupBytes.includes("Protected body tail")).toBe(false);
  expect(backupBytes.includes("Opening text")).toBe(false);
  expect(backupBytes.includes("private evidence")).toBe(false);
  expect(backupBytes.includes("Protected segmented document")).toBe(false);
  expect(backupBytes.includes("Protected filename.txt")).toBe(false);
  repo.close();
  await expect(stageRuntimeRestore(dataDir, backup.path)).rejects.toThrow(/original Profile key/);
  expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  await stageRuntimeRestore(dataDir, backup.path, cipher);
  const applied = await applyPendingRuntimeRestore(dataDir, dbPath);
  expect(applied.applied).toBe(true);
  const restored = new Repo(openDb(dbPath), cipher);
  expect(
    new DocumentSnapshots(restored).read(segmented.owner, segmented.snapshot.sha256).chunk.segments[0]?.text,
  ).toBe("Protected segmented document");
  expect(restored.getRun("article")?.config?.contextMemoryRevoked).toBe(true);
  expect(restored.getRun("article")?.config?.context).toBeUndefined();
  expect(
    restored.db
      .prepare(
        "SELECT json_extract(config,'$.contextMemoryRevoked') AS revoked FROM run_lookup WHERE run_id='article'",
      )
      .get(),
  ).toMatchObject({ revoked: 1 });
  expect(
    new ConversationDocuments(restored, new DocumentSnapshots(restored)).list("chat").attachments[0]!.excerpt,
  ).toContain("Opening text");
  expect(
    new ConversationDocuments(restored, new DocumentSnapshots(restored))
      .read(reference.chatId, reference.attachmentId, reference.sha256)
      .chunk.segments.map((segment) => segment.text)
      .join(""),
  ).toContain("Protected body tail");
  const evidence = restored.db
    .prepare("SELECT seq,json FROM task_evidence WHERE evidence_id=?")
    .get(document.evidenceId) as { seq: number; json: string };
  expect(
    JSON.parse(restored.revealRecordField("task_evidence", [evidence.seq], "json", evidence.json)),
  ).toMatchObject({
    document: { completed: { textBytes: Buffer.byteLength("private evidence") } },
  });
  restored.close();
  const backupDbPath = join(backup.path, "state.sqlite");
  const tampered = new DatabaseSync(backupDbPath);
  tampered
    .prepare("UPDATE kv SET value=? WHERE key=?")
    .run(JSON.stringify("auxenc:v3:tampered"), "setting:conversationAttachments:chat");
  tampered.close();
  const manifestPath = join(backup.path, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    database: { bytes: number; sha256: string };
  };
  const bytes = readFileSync(backupDbPath);
  manifest.database.bytes = bytes.length;
  manifest.database.sha256 = createHash("sha256").update(bytes).digest("hex");
  writeFileSync(manifestPath, JSON.stringify(manifest));
  await expect(stageRuntimeRestore(dataDir, backup.path, cipher)).rejects.toThrow();
  expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
});

it("rejects a changed staged database without touching the active database", async () => {
  const { dataDir, dbPath } = await stagedFixture();
  writeFileSync(join(dataDir, "pending-runtime-restore.sqlite"), "corrupted");
  await expect(applyPendingRuntimeRestore(dataDir, dbPath)).rejects.toThrow();
  const active = new Repo(openDb(dbPath));
  expect(active.getSetting("restore-marker")).toBe("after");
  active.close();
  expect(await runtimeRestoreStatus(dataDir)).toMatchObject({ pending: true });
});

it("preserves an artifact that changed after staging", async () => {
  const { dataDir, dbPath, artifactPath } = await stagedFixture();
  writeFileSync(artifactPath, "new local work");
  await expect(applyPendingRuntimeRestore(dataDir, dbPath)).rejects.toThrow(
    /conflicts with existing Aux data/,
  );
  expect(readFileSync(artifactPath, "utf8")).toBe("new local work");
  const active = new Repo(openDb(dbPath));
  expect(active.getSetting("restore-marker")).toBe("after");
  active.close();
  expect(await runtimeRestoreStatus(dataDir)).toMatchObject({ pending: true });
});

it("refuses to replace a database owned by a live runtime", async () => {
  const { dataDir, dbPath } = await stagedFixture();
  writeFileSync(join(dataDir, "runtime.json"), JSON.stringify({ pid: process.pid }));
  await expect(applyPendingRuntimeRestore(dataDir, dbPath)).rejects.toThrow(/Quit the running Aux runtime/);
  const active = new Repo(openDb(dbPath));
  expect(active.getSetting("restore-marker")).toBe("after");
  active.close();
});

it("finishes a restore interrupted after the database swap", async () => {
  const { dataDir, dbPath, artifactPath } = await stagedFixture();
  copyFileSync(join(dataDir, "pending-runtime-restore-artifacts", "restore-fixture.txt"), artifactPath);
  rmSync(`${dbPath}-wal`, { force: true });
  rmSync(`${dbPath}-shm`, { force: true });
  copyFileSync(join(dataDir, "pending-runtime-restore.sqlite"), dbPath);
  expect(await applyPendingRuntimeRestore(dataDir, dbPath)).toMatchObject({ applied: true, recovered: true });
  expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  const restored = new Repo(openDb(dbPath));
  expect(restored.getSetting("restore-marker")).toBe("before");
  restored.close();
});

it("refuses an older managed backup after Forget and accepts a fresh generation", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-recovery-generation-"));
  directories.push(dataDir);
  const repo = new Repo(openDb(join(dataDir, "aux-state.sqlite")));
  try {
    const old = await createRuntimeBackup(repo, dataDir);
    const before = currentManagedRecoveryGeneration(dataDir);
    const after = advanceManagedRecoveryGeneration(dataDir);
    expect(after).toEqual({ lineageId: before.lineageId, generation: before.generation + 1 });
    expect((await listRuntimeBackups(dataDir)).find((item) => item.path === old.path)?.restorable).toBe(
      false,
    );
    expect((await runtimeRestoreStatus(dataDir)).managedRecovery).toEqual({
      generation: after.generation,
      freshBackupIssued: false,
    });
    await expect(stageRuntimeRestore(dataDir, old.path)).rejects.toThrow(
      /predates the current recovery generation/,
    );
    const fresh = await createRuntimeBackup(repo, dataDir);
    expect((await listRuntimeBackups(dataDir)).find((item) => item.path === fresh.path)?.restorable).toBe(
      true,
    );
    expect((await runtimeRestoreStatus(dataDir)).managedRecovery).toEqual({
      generation: after.generation,
      freshBackupIssued: true,
    });
    await expect(stageRuntimeRestore(dataDir, fresh.path)).resolves.toMatchObject({ staged: true });
  } finally {
    repo.close();
  }
});

it("does not issue a partial post-Forget recovery point and permits a complete retry", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-recovery-issue-"));
  directories.push(dataDir);
  const repo = new Repo(openDb(join(dataDir, "aux-state.sqlite")));
  try {
    const old = await createRuntimeBackup(repo, dataDir);
    const current = advanceManagedRecoveryGeneration(dataDir);
    repo.saveArtifact({
      artifactId: "missing",
      path: join(dataDir, "artifacts", "missing.txt"),
      mediaType: "text/plain",
      size: 7,
      status: "complete",
      createdAt: Date.now(),
    });
    await expect(issueFreshManagedBackup(repo, dataDir, current)).rejects.toThrow(
      /complete current-generation backup/,
    );
    expect((await runtimeRestoreStatus(dataDir)).managedRecovery.freshBackupIssued).toBe(false);
    expect((await listRuntimeBackups(dataDir)).map((item) => [item.path, item.restorable])).toEqual([
      [old.path, false],
    ]);
    repo.db.prepare("DELETE FROM artifacts WHERE artifact_id='missing'").run();
    const fresh = await issueFreshManagedBackup(repo, dataDir, current);
    expect((await runtimeRestoreStatus(dataDir)).managedRecovery.freshBackupIssued).toBe(true);
    await expect(stageRuntimeRestore(dataDir, fresh.path)).resolves.toMatchObject({ staged: true });
  } finally {
    repo.close();
  }
});

it("rejects a restore staged before Forget at pre-open apply without replacing current data", async () => {
  const { dataDir, dbPath } = await stagedFixture();
  advanceManagedRecoveryGeneration(dataDir);
  await expect(applyPendingRuntimeRestore(dataDir, dbPath)).rejects.toThrow(
    /predates the current recovery generation/,
  );
  const current = new Repo(openDb(dbPath));
  expect(current.getSetting("restore-marker")).toBe("after");
  current.close();
  expect(await runtimeRestoreStatus(dataDir)).toMatchObject({ pending: true });
});

it("fails closed when the recovery anchor is missing or corrupt", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-recovery-anchor-"));
  directories.push(dataDir);
  const repo = new Repo(openDb(join(dataDir, "aux-state.sqlite")));
  try {
    const backup = await createRuntimeBackup(repo, dataDir);
    const anchor = join(dataDir, "managed-recovery-generation.json");
    rmSync(anchor);
    await expect(stageRuntimeRestore(dataDir, backup.path)).rejects.toThrow(/anchor is missing/);
    writeFileSync(anchor, "not JSON");
    await expect(stageRuntimeRestore(dataDir, backup.path)).rejects.toThrow(/anchor is invalid/);
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  } finally {
    repo.close();
  }
});

it("does not publish a backup if Forget advances generation during its snapshot", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-backup-race-"));
  directories.push(dataDir);
  const repo = new Repo(openDb(join(dataDir, "aux-state.sqlite")));
  try {
    await expect(
      createRuntimeBackup(repo, dataDir, {
        interrupt: () => {
          advanceManagedRecoveryGeneration(dataDir);
        },
      }),
    ).rejects.toThrow(/predates the current recovery generation/);
    expect(await listRuntimeBackups(dataDir)).toEqual([]);
  } finally {
    repo.close();
  }
});

it("rejects backups without a recovery generation, including a fresh Profile", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-recovery-generation-"));
  directories.push(dataDir);
  const repo = new Repo(openDb(join(dataDir, "aux-state.sqlite")));
  try {
    const backup = await createRuntimeBackup(repo, dataDir);
    const path = join(backup.path, "manifest.json");
    const manifest = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    delete manifest.recoveryGeneration;
    writeFileSync(path, JSON.stringify(manifest));
    await expect(stageRuntimeRestore(dataDir, backup.path)).rejects.toThrow(
      /predates the current recovery generation/,
    );
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
    expect((await listRuntimeBackups(dataDir))[0]?.restorable).toBe(false);
  } finally {
    repo.close();
  }
});
