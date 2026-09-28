import { afterEach, expect, it } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  applyPendingRuntimeRestore,
  createRuntimeBackup,
  openDb,
  Repo,
  runtimeRestoreStatus,
  stageRuntimeRestore,
} from "@aux/runtime";
import { migrateSensitiveKv, migrateSensitiveTable, SqliteColumnCipher } from "../../apps/runtime/src/store/sqlite-protection.js";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

async function stagedFixture() {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-restore-"));
  directories.push(dataDir);
  const dbPath = join(dataDir, "aux-state.sqlite");
  const original = new Repo(openDb(dbPath));
  original.setSetting("restore-marker", "before");
  const artifactPath = join(dataDir, "artifacts", "restore-fixture.txt");
  mkdirSync(join(dataDir, "artifacts"), { recursive: true });
  writeFileSync(artifactPath, "restored artifact");
  original.saveArtifact({ artifactId: "restore-fixture", path: artifactPath, mediaType: "text/plain",
    size: 17, status: "complete", createdAt: Date.now() });
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
  expect(await runtimeRestoreStatus(dataDir)).toMatchObject({ pending: false, lastAppliedAt: expect.any(Number) });
  expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  expect(await applyPendingRuntimeRestore(dataDir, dbPath)).toEqual({ applied: false });
});

it("sanitizes protected article recall and authenticates the same Profile before restore staging", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-protected-restore-"));
  directories.push(dataDir);
  const dbPath = join(dataDir, "aux-state.sqlite");
  const db = openDb(dbPath);
  const legacy = new Repo(db);
  legacy.saveRun({ runId: "article", goal: "private goal", status: "completed", pageIds: [],
    config: { chatId: "chat", contextMemoryIds: ["source"], context: "private source paragraph" },
    result: { answer: "private answer" }, createdAt: 1 });
  legacy.setSetting("conversationAttachments:chat", [{ sourceArtifactId: "unrelated", filename: "retained.txt" }]);
  const saved = new Map<string, string>();
  const profileId = "restore-profile";
  const secretName = (prefix: string) => `${prefix}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  const secrets = {
    async readSecret(name: string) { return { value: saved.get(name) }; },
    async storeSecret(name: string, value: string) { saved.set(name, value); return { ok: true as const }; },
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
  const cipher = await SqliteColumnCipher.create(secrets, profileId, false);
  migrateSensitiveTable(db, cipher, "runs");
  migrateSensitiveKv(db, cipher);
  const repo = new Repo(db, cipher);
  const backup = await createRuntimeBackup(repo, dataDir);
  const backupBytes = readFileSync(join(backup.path, "state.sqlite"));
  expect(backupBytes.includes("private source paragraph")).toBe(false);
  expect(backupBytes.includes("retained.txt")).toBe(false);
  repo.close();
  await expect(stageRuntimeRestore(dataDir, backup.path)).rejects.toThrow(/original Profile key/);
  expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  await stageRuntimeRestore(dataDir, backup.path, cipher);
  const applied = await applyPendingRuntimeRestore(dataDir, dbPath);
  expect(applied.applied).toBe(true);
  const restored = new Repo(openDb(dbPath), cipher);
  expect(restored.getRun("article")?.config?.contextMemoryRevoked).toBe(true);
  expect(restored.getRun("article")?.config?.context).toBeUndefined();
  expect(restored.db.prepare("SELECT json_extract(config,'$.contextMemoryRevoked') AS revoked FROM run_lookup WHERE run_id='article'").get())
    .toMatchObject({ revoked: 1 });
  expect(restored.getSetting("conversationAttachments:chat")).toEqual([
    { sourceArtifactId: "unrelated", filename: "retained.txt" },
  ]);
  restored.close();
  const backupDbPath = join(backup.path, "state.sqlite");
  const tampered = new DatabaseSync(backupDbPath);
  tampered.prepare("UPDATE aux_meta SET value='auxenc:v1:tampered' WHERE key='portable_profile_proof_v1'").run();
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
  await expect(applyPendingRuntimeRestore(dataDir, dbPath)).rejects.toThrow(/conflicts with existing Aux data/);
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
