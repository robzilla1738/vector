import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { EventBus, MemoryPipeline, openDb, Repo, TaskService } from "@aux/runtime";
import { consolidateMemoryClaims } from "../../apps/runtime/src/services/night-memory.js";
it("deduplicates within each source, preserves distinct evidence and flags contradictions without inventing facts", () => {
  const claim = (sourceRunId: string, text: string, capturedAt = 900) => ({
    claimId: randomUUID(),
    sourceRunId,
    text,
    capturedAt,
  });
  const a = claim("a", "The fixture is ready.");
  const older = { ...a, claimId: randomUUID(), capturedAt: 800 };
  const b = claim("b", a.text),
    bDuplicate = { ...b, claimId: randomUUID(), capturedAt: 850 };
  const opposite = claim("c", "The fixture is not ready.");
  const stale = claim("stale", "The fixture is old.", 1),
    revoked = claim("revoked", "The fixture is revoked.");
  const consolidated = consolidateMemoryClaims(
    [a, older, b, bDuplicate, opposite, stale, revoked],
    1000,
    (item) => item.sourceRunId !== "revoked",
    500,
  );
  expect(consolidated).toHaveLength(3);
  expect(consolidated.find((item) => item.claimId === a.claimId)?.mergedClaimIds).toEqual([older.claimId]);
  expect(consolidated.find((item) => item.claimId === b.claimId)?.mergedClaimIds).toEqual([
    bDuplicate.claimId,
  ]);
  expect(consolidated.find((item) => item.claimId === opposite.claimId)?.contradictionIds).toEqual([
    a.claimId,
    b.claimId,
  ]);
  expect(consolidated.map((item) => item.text)).toEqual([a.text, b.text, opposite.text]);
});
it("consolidates the real protected pipeline under a lease, rebuilds recall, and reverts one pre-change revision", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-night-memory-")),
    db = openDb(":memory:"),
    repo = new Repo(db);
  const tasks = new TaskService(repo, new EventBus(repo)),
    workspace = tasks.createWorkspace("Night memory");
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      secrets.set(name, value);
      return { ok: true as const };
    },
    profileStorageRoot: async () => {
      const name = `aux_root_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  const pipeline = new MemoryPipeline(repo, native, directory, "fixture");
  try {
    await expect(pipeline.consolidate(workspace.workspaceId)).rejects.toThrow(/Enable/);
    pipeline.setPolicy(workspace.workspaceId, true);
    for (const [runId, text] of [
      ["a", "The fixture is ready."],
      ["b", "The fixture is not ready."],
    ] as const) {
      repo.saveRun({
        runId,
        goal: "Memory fixture",
        pageIds: [],
        status: "completed",
        createdAt: Date.now(),
        endedAt: Date.now(),
        config: { contextWorkspaceId: workspace.workspaceId },
        result: { report: text },
      });
      await pipeline.extractRun(workspace.workspaceId, runId);
      const claim = (await pipeline.inbox(workspace.workspaceId)).find(
        (claim) => claim.sourceRunId === runId,
      )!;
      await pipeline.review(workspace.workspaceId, claim.claimId, "accept");
    }
    expect(await pipeline.search(workspace.workspaceId, "fixture")).toHaveLength(2);
    const before = (await pipeline.history(workspace.workspaceId)).length;
    const consolidated = await pipeline.consolidate(workspace.workspaceId);
    expect(consolidated).toMatchObject({ before: 2, after: 2, contradictions: 2 });
    expect(await pipeline.search(workspace.workspaceId, "fixture")).toEqual([]);
    expect((await pipeline.overview(workspace.workspaceId)).summary).toBe("");
    expect((await pipeline.history(workspace.workspaceId)).length).toBe(before + 1);
    expect(await pipeline.reindex(workspace.workspaceId)).toEqual({ indexed: 2 });
    await pipeline.revert(workspace.workspaceId, consolidated.revisionId);
    expect(await pipeline.search(workspace.workspaceId, "fixture")).toHaveLength(2);
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
