import { expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { workspacesMethods } from "../../apps/runtime/src/api/methods/workspaces.js";
import { BrowsingMemory } from "../../apps/runtime/src/services/browsing-memory.js";
import {
  currentManagedRecoveryGeneration,
  ensureManagedRecoveryGeneration,
} from "../../apps/runtime/src/services/managed-recovery-generation.js";
import { listRuntimeBackups } from "../../apps/runtime/src/services/runtime-backup.js";

function fixture() {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-memory-recovery-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const space = tasks.createWorkspace("Memory");
  const browsingMemory = new BrowsingMemory(repo);
  const context = (method: keyof typeof workspacesMethods, params: object, extra: object = {}) =>
    ({
      client: { external: false },
      method,
      params,
      tasks,
      browsingMemory,
      revokeWorkspaceContext: vi.fn(),
      revokeArticleRuns: vi.fn(),
      s: {
        repo,
        settings: { all: () => ({ dataDir }) },
        events,
        runs: { redactForgottenArticleOutputs: vi.fn(), retireArticleTransferSources: vi.fn() },
        checkpointDeletedData: vi.fn(),
        ...extra,
      },
    }) as unknown as Parameters<NonNullable<(typeof workspacesMethods)[typeof method]>>[0];
  return {
    dataDir,
    repo,
    tasks,
    space,
    browsingMemory,
    context,
    close: () => {
      repo.close();
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
}

it("advances for browsing Forget and retention deletion, but not a pause", async () => {
  const f = fixture();
  try {
    const workspaceId = f.space.workspaceId;
    const now = Date.now();
    f.repo.setSetting(`browsingMemoryPolicy:${workspaceId}`, { enabled: true, retentionDays: 30 });
    f.repo.setSetting(`browsingMemoryPages:${workspaceId}`, [
      {
        memoryId: "page-1",
        url: "https://example.test/",
        title: "Article",
        firstVisitedAt: now - 10 * 86_400_000,
        lastVisitedAt: now - 10 * 86_400_000,
      },
    ]);
    const before = ensureManagedRecoveryGeneration(f.dataDir).generation;
    await workspacesMethods["workspaces.browsingMemory.set"]!(
      f.context("workspaces.browsingMemory.set", {
        workspaceId,
        policy: { enabled: false, retentionDays: 30 },
      }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before);
    await workspacesMethods["workspaces.browsingMemory.set"]!(
      f.context("workspaces.browsingMemory.set", {
        workspaceId,
        policy: { enabled: true, retentionDays: 7 },
      }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 1);
    f.repo.setSetting(`browsingMemoryPages:${workspaceId}`, [
      {
        memoryId: "page-2",
        url: "https://example.test/next",
        title: "Next",
        firstVisitedAt: now,
        lastVisitedAt: now,
      },
    ]);
    await workspacesMethods["workspaces.browsingMemory.forget"]!(
      f.context("workspaces.browsingMemory.forget", { workspaceId, memoryId: "page-2" }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 2);
    expect(
      (await listRuntimeBackups(f.dataDir)).filter((item) => item.restorable && !item.missingArtifacts),
    ).toHaveLength(1);
  } finally {
    f.close();
  }
});

it("advances for manual Memory removal but not additive edits", async () => {
  const f = fixture();
  try {
    const workspaceId = f.space.workspaceId;
    const first = f.tasks.setWorkspaceMemory(workspaceId, 0, "Remember bronze");
    const before = ensureManagedRecoveryGeneration(f.dataDir).generation;
    await expect(
      workspacesMethods["workspaces.memory.set"]!(
        f.context("workspaces.memory.set", {
          workspaceId,
          expectedRevision: first.revision,
          content: "",
          items: [{ itemId: "bad", content: "" }],
        }),
      ),
    ).rejects.toThrow(/valid memory notes/);
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before);
    await workspacesMethods["workspaces.memory.set"]!(
      f.context("workspaces.memory.set", {
        workspaceId,
        expectedRevision: first.revision,
        content: "Remember bronze and copper",
      }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before);
    const current = f.tasks.workspaceMemory(workspaceId);
    await workspacesMethods["workspaces.memory.set"]!(
      f.context("workspaces.memory.set", { workspaceId, expectedRevision: current.revision, content: "" }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 1);
    const item = { itemId: "note-1", content: "Retained fact", enabled: true, createdAt: 1, updatedAt: 1 };
    const cleared = f.tasks.workspaceMemory(workspaceId);
    await workspacesMethods["workspaces.memory.set"]!(
      f.context("workspaces.memory.set", {
        workspaceId,
        expectedRevision: cleared.revision,
        content: "",
        items: [item],
      }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 1);
    const withItem = f.tasks.workspaceMemory(workspaceId);
    await workspacesMethods["workspaces.memory.set"]!(
      f.context("workspaces.memory.set", {
        workspaceId,
        expectedRevision: withItem.revision,
        content: "",
        items: [],
      }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 2);
    const withoutItem = f.tasks.workspaceMemory(workspaceId);
    await workspacesMethods["workspaces.memory.set"]!(
      f.context("workspaces.memory.set", {
        workspaceId,
        expectedRevision: withoutItem.revision,
        content: "",
        excludedOrigins: ["https://excluded.example"],
      }),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 3);
  } finally {
    f.close();
  }
});

it("wires saved-article Forget and policy removals through the recovery guard", async () => {
  const f = fixture();
  try {
    const workspaceId = f.space.workspaceId;
    const before = ensureManagedRecoveryGeneration(f.dataDir).generation;
    const store = {
      policy: vi
        .fn()
        .mockReturnValue({ enabled: true, retentionDays: 30, allowedOrigins: ["https://example.test"] }),
      forget: vi.fn(
        async (_space: string, _memoryId: string | undefined, advance: () => void | Promise<void>) => {
          await advance();
          return 1;
        },
      ),
      setPolicy: vi.fn(async (_space: string, policy: object, advance: () => void | Promise<void>) => {
        await advance();
        return policy;
      }),
    };
    await workspacesMethods["workspaces.contentMemory.forget"]!(
      f.context(
        "workspaces.contentMemory.forget",
        { workspaceId, memoryId: "article-1" },
        { contentMemory: store },
      ),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 1);
    await workspacesMethods["workspaces.contentMemory.setPolicy"]!(
      f.context(
        "workspaces.contentMemory.setPolicy",
        { workspaceId, policy: { enabled: true, retentionDays: 30, allowedOrigins: [] } },
        { contentMemory: store },
      ),
    );
    expect(currentManagedRecoveryGeneration(f.dataDir).generation).toBe(before + 2);
    expect(
      (await listRuntimeBackups(f.dataDir)).filter((item) => item.restorable && !item.missingArtifacts),
    ).toHaveLength(1);
  } finally {
    f.close();
  }
});
