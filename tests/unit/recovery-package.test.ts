import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { prepareProtectedDatabase } from "../../apps/runtime/src/store/protected-startup.js";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";
import { MemoryPipeline } from "../../apps/runtime/src/services/memory-pipeline.js";
import { exportRecoveryPackage, inspectRecoveryPackage, stageRecoveryPackage } from
  "../../apps/runtime/src/services/recovery-package.js";
import { applyPendingRuntimeRestore, createRuntimeBackup, stageRuntimeRestore } from "../../apps/runtime/src/services/runtime-backup.js";
import { advanceManagedRecoveryGeneration } from "../../apps/runtime/src/services/managed-recovery-generation.js";

const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });

function native(profileId: string) {
  const secrets = new Map<string, string>();
  const secretName = (prefix: string) => `${prefix}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  return { bridge: {
    async readSecret(name: string) { return { value: secrets.get(name) }; },
    async storeSecret(name: string, value: string) { secrets.set(name, value); return { ok: true as const }; },
    async profileStorageRoot() {
      const name = secretName("aux_root_v1");
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
    async profileStorageFactor() {
      const name = secretName("sqlite_factor_v1");
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  } as unknown as NativeBridge, secrets };
}

async function fixture() {
  const sourceDir = mkdtempSync(join(tmpdir(), "aux-recovery-source-"));
  const targetDir = mkdtempSync(join(tmpdir(), "aux-recovery-target-"));
  directories.push(sourceDir, targetDir);
  const sourceId = "disposable-source", targetId = "disposable-target";
  const sourceNative = native(sourceId), targetNative = native(targetId);
  const sourceDb = openDb(join(sourceDir, "state.sqlite"));
  const sourceCipher = await prepareProtectedDatabase(sourceDb, sourceNative.bridge, sourceId);
  const source = new Repo(sourceDb, sourceCipher);
  const tasks = new TaskService(source, new EventBus(source));
  const space = tasks.createWorkspace("Protected research space");
  tasks.create({ workspaceId: space.workspaceId, title: "Protected task", objective: "Check source",
    criteria: [{ criterionId: "check", description: "Protected", verification: "manual" }] });
  source.saveRun({ runId: "recovery-run", goal: "Protected source goal", status: "completed", pageIds: [],
    config: { chatId: "chat", contextWorkspaceId: space.workspaceId },
    result: { report: "A protected conclusion with sufficient source detail." }, createdAt: 1, endedAt: 2 });
  mkdirSync(join(sourceDir, "artifacts"));
  const artifactPath = join(sourceDir, "artifacts", "evidence.txt");
  writeFileSync(artifactPath, "Protected artifact evidence");
  source.saveArtifact({ artifactId: "evidence", runId: "recovery-run", path: artifactPath,
    mediaType: "text/plain", size: 27, status: "complete", createdAt: 1 });
  const pages = new ContentMemoryStore(source, sourceNative.bridge, sourceId);
  await pages.setPolicy(space.workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: ["https://example.test"] });
  await pages.saveEligible({ workspaceId: space.workspaceId, pageId: "page", documentEpoch: 1,
    url: "https://example.test/article", title: "Protected article", text: "Protected article memory for a second Profile." });
  const memory = new MemoryPipeline(source, sourceNative.bridge, join(sourceDir, "space-memory"), sourceId);
  memory.setPolicy(space.workspaceId, true);
  await memory.extractRun(space.workspaceId, "recovery-run");
  const targetDb = openDb(join(targetDir, "state.sqlite"));
  const targetCipher = await prepareProtectedDatabase(targetDb, targetNative.bridge, targetId);
  const target = new Repo(targetDb, targetCipher);
  return { sourceDir, targetDir, sourceId, targetId, sourceNative, targetNative, source, target, space };
}

it("restores protected SQLite, page memory, Space memory and artifacts under the second Profile's own keys", async () => {
  const f = await fixture();
  const phrase = "an original offline recovery phrase";
  const exported = await exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase);
  const bytes = readFileSync(exported.path);
  for (const secret of ["Protected research space", "Protected task", "Protected source goal",
    "Protected article memory", "Protected artifact evidence"])
    expect(bytes.includes(secret)).toBe(false);
  expect(exported.manifest).toMatchObject({ pageMemoryCount: 1, artifactIds: ["evidence"] });
  expect(exported.manifest.spaceMemory).toHaveLength(1);
  const managedBackup = await createRuntimeBackup(f.source, f.sourceDir);
  const sourceMemory = new MemoryPipeline(f.source, f.sourceNative.bridge, join(f.sourceDir, "space-memory"), f.sourceId);
  await sourceMemory.forget({ workspaceId: f.space.workspaceId, all: true },
    () => { advanceManagedRecoveryGeneration(f.sourceDir); });
  const sourcePages = new ContentMemoryStore(f.source, f.sourceNative.bridge, f.sourceId);
  await sourcePages.forget(f.space.workspaceId, undefined,
    () => { advanceManagedRecoveryGeneration(f.sourceDir); });
  await expect(stageRuntimeRestore(f.sourceDir, managedBackup.path, f.source.columnCipher))
    .rejects.toThrow(/predates the current recovery generation/);
  await expect(inspectRecoveryPackage(exported.path, "wrong phrase", f.targetId)).rejects.toThrow(/phrase is wrong/);
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  const review = await inspectRecoveryPackage(exported.path, phrase, f.targetId);
  await expect(stageRecoveryPackage(f.target, f.targetNative.bridge, f.targetDir, f.targetId,
    exported.path, phrase, review.sha256, "not-a-review")).rejects.toThrow(/Review this recovery package/);
  await expect(stageRecoveryPackage(f.target, f.targetNative.bridge, f.targetDir, f.targetId,
    exported.path, phrase, review.sha256, review.reviewToken, () => { throw new Error("fixture interruption"); }))
    .rejects.toThrow(/fixture interruption/);
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  expect(f.target.listWorkspaces()).toHaveLength(0);
  const staged = await stageRecoveryPackage(f.target, f.targetNative.bridge, f.targetDir, f.targetId,
    exported.path, phrase, review.sha256, review.reviewToken);
  expect(staged).toMatchObject({ staged: true, artifactFiles: 1, spaceCount: 1, pageMemoryCount: 1 });
  f.target.close();
  f.source.close();
  expect((await applyPendingRuntimeRestore(f.targetDir, join(f.targetDir, "state.sqlite"), f.targetId)).applied).toBe(true);
  const reopenedDb = openDb(join(f.targetDir, "state.sqlite"));
  const cipher = await prepareProtectedDatabase(reopenedDb, f.targetNative.bridge, f.targetId);
  const restored = new Repo(reopenedDb, cipher);
  expect(restored.listWorkspaces()[0]?.name).toBe("Protected research space");
  expect(restored.getRun("recovery-run")?.goal).toBe("Protected source goal");
  expect(readFileSync(join(f.targetDir, "artifacts", "evidence.txt"), "utf8")).toBe("Protected artifact evidence");
  const pages = new ContentMemoryStore(restored, f.targetNative.bridge, f.targetId);
  expect(await pages.search(f.space.workspaceId, "article memory")).toHaveLength(1);
  const memory = new MemoryPipeline(restored, f.targetNative.bridge, join(f.targetDir, "space-memory"), f.targetId);
  expect(await memory.inbox(f.space.workspaceId)).toHaveLength(1);
  expect(f.targetNative.secrets.has(`aux_root_v1_${createHash("sha256").update(f.targetId).digest("hex").slice(0, 24)}`)).toBe(true);
  restored.close();
});

it("rejects package tampering without changing the destination", async () => {
  const f = await fixture();
  const phrase = "another original recovery phrase";
  const exported = await exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase);
  const file = JSON.parse(readFileSync(exported.path, "utf8")) as { ciphertext: string };
  file.ciphertext = `${file.ciphertext[0] === "A" ? "B" : "A"}${file.ciphertext.slice(1)}`;
  writeFileSync(exported.path, JSON.stringify(file));
  await expect(inspectRecoveryPackage(exported.path, phrase, f.targetId)).rejects.toThrow(/phrase is wrong|changed/);
  expect(f.target.listWorkspaces()).toHaveLength(0);
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  f.target.close(); f.source.close();
});

it("refuses a missing protected factor, a missing artifact and a nonempty destination", async () => {
  const f = await fixture();
  const phrase = "reviewed recovery phrase for fixtures";
  const factor = [...f.sourceNative.secrets.keys()].find(name => name.startsWith("pageMemoryFactorV2_"))!;
  const saved = f.sourceNative.secrets.get(factor)!;
  f.sourceNative.secrets.delete(factor);
  await expect(exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase))
    .rejects.toThrow(/factor is missing/);
  f.sourceNative.secrets.set(factor, saved);
  rmSync(join(f.sourceDir, "artifacts", "evidence.txt"));
  await expect(exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase))
    .rejects.toThrow();
  writeFileSync(join(f.sourceDir, "artifacts", "evidence.txt"), "Protected artifact evidence");
  const exported = await exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase);
  const review = await inspectRecoveryPackage(exported.path, phrase, f.targetId);
  new TaskService(f.target, new EventBus(f.target)).createWorkspace("Existing destination data");
  await expect(stageRecoveryPackage(f.target, f.targetNative.bridge, f.targetDir, f.targetId,
    exported.path, phrase, review.sha256, review.reviewToken)).rejects.toThrow(/empty Profile/);
  expect(f.target.listWorkspaces()[0]?.name).toBe("Existing destination data");
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  f.target.close(); f.source.close();
});
