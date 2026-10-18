import { AuxError } from "@aux/contracts";
import { expect, it, vi } from "vitest";
import { memoryMethods } from "../../apps/runtime/src/api/methods/memory.js";
import { openDb, Repo } from "@aux/runtime";
import {
  createRuntimeBackup,
  listRuntimeBackups,
  runtimeRestoreStatus,
} from "../../apps/runtime/src/services/runtime-backup.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  currentManagedRecoveryGeneration,
  ensureManagedRecoveryGeneration,
} from "../../apps/runtime/src/services/managed-recovery-generation.js";

it("refreshes and revokes active context after successful Memory changes only", async () => {
  const repo = new Repo(openDb(":memory:"));
  const emit = vi.fn();
  const revokeWorkspaceContext = vi.fn();
  const review = vi.fn().mockResolvedValue({ accepted: true, remaining: 0 });
  const forget = vi
    .fn()
    .mockResolvedValueOnce({ forgotten: 0, remaining: 1 })
    .mockResolvedValueOnce({ forgotten: 1, remaining: 0 });
  const context = (method: "memory.pipeline.review" | "memory.pipeline.forget") =>
    ({
      client: { external: false, codeMode: false },
      method,
      params: { workspaceId: "space-1", claimId: "11669024-a817-444b-bafa-7622510e51a2", decision: "accept" },
      revokeWorkspaceContext,
      s: { repo, memoryPipeline: { review, forget, retireWorkspace: vi.fn() }, events: { emit } },
    }) as unknown as Parameters<NonNullable<(typeof memoryMethods)[typeof method]>>[0];

  await memoryMethods["memory.pipeline.review"]!(context("memory.pipeline.review"));
  expect(revokeWorkspaceContext).toHaveBeenCalledWith("space-1", false);
  expect(emit).toHaveBeenCalledWith("workspace.memory.updated", { workspaceId: "space-1" });

  revokeWorkspaceContext.mockClear();
  emit.mockClear();
  await memoryMethods["memory.pipeline.forget"]!(context("memory.pipeline.forget"));
  expect(revokeWorkspaceContext).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();

  await memoryMethods["memory.pipeline.forget"]!(context("memory.pipeline.forget"));
  expect(revokeWorkspaceContext).toHaveBeenCalledWith("space-1", false);
  expect(emit).toHaveBeenCalledWith("workspace.memory.updated", { workspaceId: "space-1" });

  review.mockRejectedValueOnce(new Error("source changed"));
  revokeWorkspaceContext.mockClear();
  emit.mockClear();
  await expect(memoryMethods["memory.pipeline.review"]!(context("memory.pipeline.review"))).rejects.toThrow(
    "source changed",
  );
  expect(revokeWorkspaceContext).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();
  repo.close();
});

it("keeps Forget successful but marks recovery incomplete when fresh issuance cannot include evidence", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-memory-issue-fail-"));
  const repo = new Repo(openDb(":memory:"));
  try {
    const old = await createRuntimeBackup(repo, dataDir);
    repo.saveArtifact({
      artifactId: "missing",
      path: join(dataDir, "artifacts", "missing.txt"),
      mediaType: "text/plain",
      size: 7,
      status: "complete",
      createdAt: Date.now(),
    });
    const handler = memoryMethods["memory.pipeline.forget"]!;
    await expect(
      handler({
        client: { external: false, codeMode: false },
        method: "memory.pipeline.forget",
        params: { workspaceId: "space-1", all: true },
        revokeWorkspaceContext: vi.fn(),
        s: {
          repo,
          memoryPipeline: {
            retireWorkspace: vi.fn(),
            forget: async (_params: unknown, beforeRemoval: () => void) => {
              beforeRemoval();
              return { forgotten: 1, remaining: 0 };
            },
          },
          settings: { all: () => ({ dataDir }) },
          events: { emit: vi.fn() },
        },
      } as unknown as Parameters<typeof handler>[0]),
    ).resolves.toEqual({ forgotten: 1, remaining: 0 });
    expect((await listRuntimeBackups(dataDir)).map((item) => [item.path, item.restorable])).toEqual([
      [old.path, false],
    ]);
    expect((await runtimeRestoreStatus(dataDir)).managedRecovery.freshBackupIssued).toBe(false);
  } finally {
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});

it("advances the managed backup generation before a nonempty pipeline Forget", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-memory-method-"));
  const repo = new Repo(openDb(":memory:"));
  try {
    const before = ensureManagedRecoveryGeneration(dataDir);
    const forget = vi.fn(async (_params: unknown, beforeRemoval: () => void) => {
      beforeRemoval();
      expect(currentManagedRecoveryGeneration(dataDir).generation).toBe(before.generation + 1);
      return { forgotten: 1, remaining: 0 };
    });
    const handler = memoryMethods["memory.pipeline.forget"]!;
    await handler({
      client: { external: false, codeMode: false },
      method: "memory.pipeline.forget",
      params: { workspaceId: "space-1", all: true },
      revokeWorkspaceContext: vi.fn(),
      s: {
        repo,
        memoryPipeline: { forget, retireWorkspace: vi.fn() },
        settings: { all: () => ({ dataDir }) },
        events: { emit: vi.fn() },
      },
    } as unknown as Parameters<typeof handler>[0]);
    expect(forget).toHaveBeenCalledOnce();
    expect((await listRuntimeBackups(dataDir)).filter((item) => item.restorable)).toHaveLength(1);
  } finally {
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});

it("invalidates current context for committed Dream publication uncertainty without rewriting or retrying the original result", async () => {
  const emit = vi.fn();
  const revokeWorkspaceContext = vi.fn();
  const error = new AuxError("operation_uncertain", "Saved, key retirement ACK lost", {
    kind: "memory-dream-publication",
    operationId: "original-operation",
  });
  const dream = vi.fn().mockRejectedValue(error);
  const handler = memoryMethods["memory.pipeline.dream"]!;
  const context = {
    method: "memory.pipeline.dream",
    client: { external: false, codeMode: false, nativeTurnContext: "original-token" },
    params: { workspaceId: "space-1" },
    revokeWorkspaceContext,
    s: {
      memoryPipeline: { dream },
      events: { emit },
      nativeIdentity: Promise.resolve({ privateSession: false }),
      native: { turnSourceContext: vi.fn().mockResolvedValue({ windowId: "original-window" }) },
    },
  } as unknown as Parameters<typeof handler>[0];
  await expect(handler(context)).rejects.toBe(error);
  expect(dream).toHaveBeenCalledOnce();
  expect(revokeWorkspaceContext).toHaveBeenCalledExactlyOnceWith("space-1", false);
  expect(emit).toHaveBeenCalledExactlyOnceWith("workspace.memory.updated", { workspaceId: "space-1" });
  revokeWorkspaceContext.mockClear();
  emit.mockClear();
  const uncommitted = new AuxError("conflict", "Source changed before publication");
  dream.mockRejectedValueOnce(uncommitted);
  await expect(handler(context)).rejects.toBe(uncommitted);
  expect(revokeWorkspaceContext).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();
});
