import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { prepareProtectedDatabase } from "../../apps/runtime/src/store/protected-startup.js";

it("migrates adapted data before repository reads, survives restart and refuses a missing factor", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-protected-startup-"));
  const path = join(dir, "state.sqlite");
  const profileId = "profile-one";
  const secrets = new Map<string, string>();
  const name = (kind: "aux_root_v1" | "sqlite_factor_v1") =>
    `${kind}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  const native = {
    async readSecret(key: string) { return { value: secrets.get(key) }; },
    async storeSecret(key: string, value: string) { secrets.set(key, value); return { ok: true }; },
    async profileStorageRoot() {
      const key = name("aux_root_v1");
      if (!secrets.has(key)) secrets.set(key, randomBytes(32).toString("base64"));
      return { value: secrets.get(key)! };
    },
    async profileStorageFactor() {
      const key = name("sqlite_factor_v1");
      if (!secrets.has(key)) secrets.set(key, randomBytes(32).toString("base64"));
      return { value: secrets.get(key)! };
    },
  } as unknown as NativeBridge;
  let db = openDb(path);
  try {
    const legacy = new Repo(db);
    legacy.saveModelCall({ callId: "old", runId: "run", role: "agent", modelId: "model", durationMs: 1,
      error: "private startup error", createdAt: 1 });
    legacy.saveRun({ runId: "old-run", goal: "private startup goal", status: "completed", pageIds: [],
      config: { chatId: "chat", context: "private startup context" }, createdAt: 1 });
    legacy.setSetting("startup-fixture", { text: "private startup setting" });
    const legacyTasks = new TaskService(legacy, new EventBus(legacy));
    const space = legacyTasks.createWorkspace("private startup space");
    const task = legacyTasks.create({ workspaceId: space.workspaceId, title: "private startup task",
      objective: "Check protection", criteria: [{ criterionId: "check", description: "Protected",
        verification: "manual" }] });
    const cipher = await prepareProtectedDatabase(db, native, profileId);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.listModelCalls("run")[0]?.error).toBe("private startup error");
    expect(protectedRepo.getRun("old-run")?.config?.context).toBe("private startup context");
    expect(protectedRepo.getSetting("startup-fixture")).toEqual({ text: "private startup setting" });
    expect(new TaskService(protectedRepo, new EventBus(protectedRepo)).get(task.taskId).title)
      .toBe("private startup task");
    expect((db.prepare("SELECT count(*) AS n FROM aux_meta WHERE key LIKE 'protected_sqlite_v1:%'").get() as { n: number }).n)
      .toBe(24);
    expect(readFileSync(path).includes("private startup error")).toBe(false);
    expect(readFileSync(path).includes("private startup task")).toBe(false);
    db.close();
    db = openDb(path);
    const reopened = await prepareProtectedDatabase(db, native, profileId);
    const reopenedRepo = new Repo(db, reopened);
    expect(reopenedRepo.listModelCalls("run")[0]?.error).toBe("private startup error");
    expect(new TaskService(reopenedRepo, new EventBus(reopenedRepo)).get(task.taskId).title)
      .toBe("private startup task");
    secrets.delete(name("sqlite_factor_v1"));
    await expect(prepareProtectedDatabase(db, native, profileId)).rejects.toThrow(/factor is missing/);
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }); }
});
