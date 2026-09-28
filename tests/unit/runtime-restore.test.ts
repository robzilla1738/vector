import { afterEach, expect, it } from "vitest";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  applyPendingRuntimeRestore,
  createRuntimeBackup,
  openDb,
  Repo,
  runtimeRestoreStatus,
  stageRuntimeRestore,
} from "@aux/runtime";

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
