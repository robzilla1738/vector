import { afterEach, expect, it, vi } from "vitest";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { MemoryPipeline, openDb, Repo, TaskService, EventBus } from "@aux/runtime";
import { SpaceMemoryStore } from "../../apps/runtime/dist/services/space-memory-store.js";
import type { MemoryDreamChange } from "@aux/contracts/memory-documents";
import type { MemoryDreamer } from "../../apps/runtime/dist/services/memory-dream.js";
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
  vi.restoreAllMocks();
});
function fixture(dreamer?: MemoryDreamer) {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    tasks = new TaskService(repo, new EventBus(repo));
  const workspaceId = tasks.createWorkspace("Synthetic Memory boundary").workspaceId;
  const secrets = new Map<string, string>();
  let hook: ((name: string, value: string) => void | Promise<void>) | undefined;
  const native = {
    async storeSecret(name: string, value: string) {
      await hook?.(name, value);
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
    async readSecret(name: string) {
      return { value: secrets.get(name) };
    },
    async profileStorageRoot() {
      const name = `aux_root_v1_${sha("boundary-fixture").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  const pipeline = new MemoryPipeline(
    repo,
    native,
    "boundary-fixture",
    {
      generation: () => "fixture",
      extract: async ({ report, checkCurrent }) => {
        checkCurrent();
        return { status: "completed", quotes: [report], modelId: "fixture" };
      },
    },
    dreamer,
  );
  cleanup.push(async () => {
    await pipeline.close();
    db.close();
  });
  const save = (
    runId: string,
    space = workspaceId,
    report = "The synthetic workshop meets every Tuesday afternoon.",
    at = Date.now(),
  ) =>
    repo.saveRun({
      runId,
      goal: "Synthetic completed session",
      status: "completed",
      pageIds: [],
      config: { contextWorkspaceId: space },
      result: { report },
      createdAt: at,
      endedAt: at,
    });
  const source = async () => {
    const runId = randomUUID();
    save(runId);
    await pipeline.extractRun(workspaceId, runId);
    const claim = (await pipeline.inbox(workspaceId))[0]!;
    await pipeline.review(workspaceId, claim.claimId, "accept");
    return claim;
  };
  const apply = (change: MemoryDreamChange, revision: number) =>
    tasks.setWorkspaceMemory(workspaceId, revision, change.after).revision;
  return {
    repo,
    native,
    secrets,
    db,
    tasks,
    workspaceId,
    pipeline,
    save,
    source,
    apply,
    setHook(next: typeof hook) {
      hook = next;
    },
  };
}
const ownerDream: MemoryDreamer = {
  generation: () => "fixture",
  consolidate: async (input) => ({
    status: "completed",
    changes: [
      {
        path: "MEMORY.md",
        content: "Proposed Tuesday workshop guidance.",
        claimIds: [input.claims[0]!.claimId],
      },
    ],
  }),
};
async function proposed() {
  const f = fixture(ownerDream);
  await f.source();
  f.tasks.setWorkspaceMemory(f.workspaceId, 0, "Original owner guidance.");
  const operation = await f.pipeline.dream(f.workspaceId);
  return { ...f, operation };
}
async function accept(f: Awaited<ReturnType<typeof proposed>>) {
  const files = await f.pipeline.documentList(f.workspaceId);
  return f.pipeline.dreamReview(
    {
      workspaceId: f.workspaceId,
      operationId: f.operation.operationId,
      changeId: f.operation.changes[0]!.changeId,
      expectedGeneration: files.generation,
      expectedOwnerRevision: 1,
      decision: "accept",
    },
    f.apply,
  );
}
async function revert(f: Awaited<ReturnType<typeof proposed>>) {
  return f.pipeline.dreamRevert(
    {
      workspaceId: f.workspaceId,
      operationId: f.operation.operationId,
      expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    },
    f.apply,
  );
}
it("counts eligible Space sessions independently of 1000 newer unrelated completions", async () => {
  const f = fixture();
  const at = Date.now() - 25 * 3600000;
  for (let i = 0; i < 5; i++) f.save(`local-${i}`, f.workspaceId, undefined, at);
  const foreign = f.tasks.createWorkspace("Other Space").workspaceId;
  f.repo.transaction(() => {
    for (let i = 0; i < 1000; i++) f.save(`foreign-${i}`, foreign);
  });
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 5, due: true });
});
it("paginates within the Space past empty rows and excludes blank reports from the eligible corpus", async () => {
  const f = fixture();
  for (let i = 0; i < 105; i++) f.save(`empty-${i}`, f.workspaceId, i % 2 ? "" : "   ");
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 0, due: false });
  for (let i = 0; i < 5; i++) f.save(`useful-${i}`, f.workspaceId, undefined, Date.now() - 1000);
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 5, due: true });
});
it("uses the 24hour trigger for one useful session and excludes the older14day corpus", async () => {
  const f = fixture();
  f.save("expired", f.workspaceId, undefined, Date.now() - 15 * 86400000);
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 0, due: false });
  f.save("recent", f.workspaceId, undefined, Date.now() - 25 * 3600000);
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 1, due: true });
});
it("keeps owner text and pending receipt unchanged when native key preparation rejects acceptance", async () => {
  const f = await proposed();
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && value) throw new Error("Native key preparation failed");
  });
  await expect(accept(f)).rejects.toThrow("Native key preparation failed");
  f.setHook(undefined);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 1,
    content: "Original owner guidance.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes[0]).toMatchObject({
    state: "pending",
  });
  expect((await accept(f)).changes[0]).toMatchObject({ state: "accepted", resultingRevision: 2 });
});
it("keeps accepted owner text and its receipt together when revert key preparation rejects, then permits exact retry", async () => {
  const f = await proposed();
  await accept(f);
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && value) throw new Error("Native revert preparation failed");
  });
  await expect(revert(f)).rejects.toThrow("Native revert preparation failed");
  f.setHook(undefined);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 2,
    content: "Proposed Tuesday workshop guidance.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes[0]!.state).toBe("accepted");
  expect((await revert(f)).changes[0]!.state).toBe("reverted");
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Original owner guidance.");
});
it("rolls back owner and encrypted receipt together when old key erasure fails before retirement", async () => {
  const f = await proposed();
  let failed = false;
  f.setHook((name, value) => {
    if (!failed && name.startsWith("mem_") && !value) {
      failed = true;
      throw new Error("Old key erasure refused");
    }
  });
  await expect(accept(f)).rejects.toThrow("Old key erasure refused");
  f.setHook(undefined);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 1,
    content: "Original owner guidance.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes[0]!.state).toBe("pending");
});
it("preserves later owner edits and their committed acceptance receipt instead of overwriting during failed retirement rollback", async () => {
  const f = await proposed();
  let failed = false;
  f.setHook((name, value) => {
    if (!failed && name.startsWith("mem_") && !value) {
      failed = true;
      f.tasks.setWorkspaceMemory(f.workspaceId, 2, "Later owner text must survive.");
      throw new Error("Old key erasure refused");
    }
  });
  await expect(accept(f)).rejects.toThrow("Later owner edits prevent");
  f.setHook(undefined);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 3,
    content: "Later owner text must survive.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes[0]!.state).toBe("accepted");
  await expect(revert(f)).rejects.toMatchObject({ code: "conflict" });
});
it("refuses a source report retired before original model admission and never publishes synthesis", async () => {
  let f: ReturnType<typeof fixture>;
  let runId = "";
  let refused = false;
  const model: MemoryDreamer = {
    generation: () => "fixture",
    consolidate: async (input) => {
      const run = f.repo.getRun(runId)!;
      f.repo.saveRun({ ...run, result: { report: "Retired source." } });
      try {
        input.checkCurrent();
      } catch {
        refused = true;
      }
      return { status: "completed", changes: [] };
    },
  };
  f = fixture(model);
  runId = (await f.source()).sourceRunId;
  expect(await f.pipeline.dream(f.workspaceId)).toMatchObject({
    status: "cancelled",
    errorCode: "source_changed",
    changes: [],
  });
  expect(refused).toBe(true);
});
it("refuses source retirement during the final encrypted generation preparation", async () => {
  const f = await proposed();
  const claim = (await f.pipeline.claims(f.workspaceId))[0]!;
  let writes = 0;
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && value && ++writes === 2) {
      const run = f.repo.getRun(claim.sourceRunId)!;
      f.repo.saveRun({ ...run, result: { report: "Retired during final encryption." } });
    }
  });
  expect(await f.pipeline.dream(f.workspaceId)).toMatchObject({
    status: "cancelled",
    errorCode: "source_changed",
    changes: [],
  });
  f.setHook(undefined);
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes).toEqual([]);
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Original owner guidance.");
});
it("refuses a source retired by the asynchronous removal hook before proposal commit", async () => {
  const f = await proposed();
  const claim = (await f.pipeline.claims(f.workspaceId))[0]!;
  const files = await f.pipeline.documentList(f.workspaceId);
  await expect(
    f.pipeline.dreamReview(
      {
        workspaceId: f.workspaceId,
        operationId: f.operation.operationId,
        changeId: f.operation.changes[0]!.changeId,
        expectedGeneration: files.generation,
        expectedOwnerRevision: 1,
        decision: "accept",
      },
      f.apply,
      async () => {
        const run = f.repo.getRun(claim.sourceRunId)!;
        f.repo.saveRun({ ...run, result: { report: "Retired by removal hook." } });
      },
    ),
  ).rejects.toMatchObject({ code: "cancelled" });
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Original owner guidance.");
});
it("refuses paused Memory at final proposal publication without changing owner text", async () => {
  const f = await proposed();
  const files = await f.pipeline.documentList(f.workspaceId);
  await expect(
    f.pipeline.dreamReview(
      {
        workspaceId: f.workspaceId,
        operationId: f.operation.operationId,
        changeId: f.operation.changes[0]!.changeId,
        expectedGeneration: files.generation,
        expectedOwnerRevision: 1,
        decision: "accept",
      },
      f.apply,
      async () => {
        f.pipeline.setPolicy(f.workspaceId, false);
      },
    ),
  ).rejects.toMatchObject({ code: "cancelled" });
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Original owner guidance.");
});

it("keeps the committed owner and accepted receipt when erasure succeeded but its acknowledgement failed", async () => {
  const f = await proposed();
  let failed = false;
  f.setHook((name, value) => {
    if (!failed && name.startsWith("mem_") && !value) {
      failed = true;
      f.secrets.delete(name);
      throw new Error("Erasure acknowledgement unavailable");
    }
  });
  await expect(accept(f)).rejects.toThrow("Erasure acknowledgement unavailable");
  f.setHook(undefined);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 2,
    content: "Proposed Tuesday workshop guidance.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes[0]!.state).toBe("accepted");
  expect((await revert(f)).changes[0]!.state).toBe("reverted");
});

it("joins shutdown during accepted native key preparation and never commits the staged owner mutation", async () => {
  const f = await proposed();
  let entered!: () => void, release!: () => void;
  const began = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let held = false;
  f.setHook(async (name, value) => {
    if (!held && name.startsWith("mem_") && value) {
      held = true;
      entered();
      await gate;
    }
  });
  const original = accept(f);
  const outcome = original.then(
    () => ({ kind: "completed" as const }),
    (error: unknown) => ({ kind: "failed" as const, error }),
  );
  await began;
  let closed = false;
  const closing = f.pipeline.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(closed).toBe(false);
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Original owner guidance.");
  release();
  expect(await outcome).toMatchObject({ kind: "failed", error: { code: "cancelled" } });
  await closing;
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 1,
    content: "Original owner guidance.",
  });
});

it("rechecks the original Settings owner after native key preparation before any owner or receipt publication", async () => {
  const f = await proposed();
  let original = true;
  let prepared = false;
  const checkOwner = vi.fn(async () => {
    expect(prepared).toBe(true);
    if (!original) throw new Error("Original Settings window retired");
  });
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && value) {
      prepared = true;
      original = false;
    }
  });
  const files = await f.pipeline.documentList(f.workspaceId);
  await expect(
    f.pipeline.dreamReview(
      {
        workspaceId: f.workspaceId,
        operationId: f.operation.operationId,
        changeId: f.operation.changes[0]!.changeId,
        expectedGeneration: files.generation,
        expectedOwnerRevision: 1,
        decision: "accept",
      },
      f.apply,
      undefined,
      checkOwner,
    ),
  ).rejects.toThrow("Original Settings window retired");
  f.setHook(undefined);
  expect(checkOwner).toHaveBeenCalledTimes(1);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 1,
    content: "Original owner guidance.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!.changes[0]!.state).toBe("pending");
});

async function generatedDream() {
  const path = `sites/example.test-${sha("https://example.test").slice(0, 12)}.md`;
  const consolidate = vi.fn<MemoryDreamer["consolidate"]>(async (input) => ({
    status: "completed",
    modelId: "fixture",
    inputTokens: 43,
    outputTokens: 17,
    cachedInputTokens: 0,
    costUsd: 0.001,
    changes: [
      { path, content: "Updated generated workshop guidance.", claimIds: [input.claims[0]!.claimId] },
    ],
  }));
  const f = fixture({ generation: () => "fixture", consolidate });
  const claim = await f.source();
  const store = new SpaceMemoryStore(f.repo, f.native, "boundary-fixture");
  const state = await store.read(f.workspaceId);
  state.files.set(
    "documents.json.enc",
    JSON.stringify([
      {
        documentId: randomUUID(),
        target: { kind: "site", origin: "https://example.test" },
        path,
        revision: 1,
        authoredBy: "generated",
        content: "Original generated workshop guidance.",
        contentSha256: sha("Original generated workshop guidance."),
        updatedAt: Date.now(),
        sourceRefs: [
          { claimId: claim.claimId, sourceRunId: claim.sourceRunId, quoteSha256: sha(claim.text) },
        ],
      },
    ]),
  );
  await store.write(f.workspaceId, state.files, state.history, state.prior);
  return { ...f, consolidate };
}
it("preserves the committed Dream diff and measured receipt after actual prior-key erase with a lost ACK, then reverts without inference replay", async () => {
  const f = await generatedDream();
  let erased = 0;
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && !value && ++erased === 2) {
      f.secrets.delete(name);
      throw new Error("Erased final prior key, ACK lost");
    }
  });
  await expect(f.pipeline.dream(f.workspaceId)).rejects.toMatchObject({
    code: "operation_uncertain",
    detail: { kind: "memory-dream-publication" },
  });
  f.setHook(undefined);
  expect(erased).toBe(2);
  const files = await f.pipeline.documentList(f.workspaceId);
  expect(files.documents[0]).toMatchObject({ content: "Updated generated workshop guidance.", revision: 2 });
  const operation = (await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!;
  expect(operation).toMatchObject({
    status: "completed",
    modelId: "fixture",
    inputTokens: 43,
    outputTokens: 17,
    cachedInputTokens: 0,
    costUsd: 0.001,
    changes: [
      {
        before: "Original generated workshop guidance.",
        after: "Updated generated workshop guidance.",
        beforeSha256: sha("Original generated workshop guidance."),
        afterSha256: sha("Updated generated workshop guidance."),
        resultingRevision: 2,
        state: "applied",
      },
    ],
  });
  expect(operation.changes[0]!.sourceRefs).toHaveLength(1);
  expect(
    (
      await f.pipeline.dreamRevert(
        {
          workspaceId: f.workspaceId,
          operationId: operation.operationId,
          expectedGeneration: files.generation,
        },
        f.apply,
      )
    ).changes[0]!.state,
  ).toBe("reverted");
  expect((await f.pipeline.documentList(f.workspaceId)).documents[0]!.content).toBe(
    "Original generated workshop guidance.",
  );
  expect(f.consolidate).toHaveBeenCalledOnce();
});
it("preserves a later owner edit and the original committed generated diff when final key erasure loses its ACK", async () => {
  const f = await generatedDream();
  let erased = 0;
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && !value && ++erased === 2) {
      f.secrets.delete(name);
      f.tasks.setWorkspaceMemory(f.workspaceId, 0, "Later owner guidance.");
      throw new Error("Final key erase response lost after a later edit");
    }
  });
  await expect(f.pipeline.dream(f.workspaceId)).rejects.toMatchObject({ code: "operation_uncertain" });
  f.setHook(undefined);
  expect(erased).toBe(2);
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 1,
    content: "Later owner guidance.",
  });
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]).toMatchObject({
    status: "completed",
    changes: [{ state: "applied", resultingRevision: 2 }],
  });
  expect((await f.pipeline.documentList(f.workspaceId)).documents[0]!.content).toBe(
    "Updated generated workshop guidance.",
  );
  expect(f.consolidate).toHaveBeenCalledOnce();
});

it("does not claim a committed Dream result when final old-key retirement is refused before erasure", async () => {
  const f = await generatedDream();
  let erased = 0;
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && !value && ++erased === 2) {
      throw new Error("Final prior key still intact");
    }
  });
  expect(await f.pipeline.dream(f.workspaceId)).toMatchObject({ status: "failed", changes: [] });
  f.setHook(undefined);
  expect((await f.pipeline.documentList(f.workspaceId)).documents[0]!.content).toBe(
    "Original generated workshop guidance.",
  );
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]).toMatchObject({
    status: "failed",
    changes: [],
  });
  expect(f.consolidate).toHaveBeenCalledOnce();
});

it("does not mistake a competing generation after lease retirement for this Dream's committed result", async () => {
  const f = await generatedDream();
  let prepared = 0;
  f.setHook(async (name, value) => {
    if (name.startsWith("mem_") && value && ++prepared === 2) {
      // Simulate another lease owner taking over after the original lease expired
      // while its native key request was held. This writer preserves old docs.
      f.db.prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=?").run(f.workspaceId);
      const other = new SpaceMemoryStore(f.repo, f.native, "boundary-fixture");
      const state = await other.read(f.workspaceId);
      await other.write(f.workspaceId, state.files, state.history, state.prior);
    }
  });
  expect(await f.pipeline.dream(f.workspaceId)).toMatchObject({ status: "cancelled", changes: [] });
  f.setHook(undefined);
  expect((await f.pipeline.documentList(f.workspaceId)).documents[0]!.content).toBe(
    "Original generated workshop guidance.",
  );
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]).toMatchObject({
    status: "cancelled",
    changes: [],
  });
  expect(f.consolidate).toHaveBeenCalledOnce();
});
it("never overwrites the committed Dream diff when another generation succeeds during its lost retirement ACK", async () => {
  const f = await generatedDream();
  let erased = 0;
  f.setHook(async (name, value) => {
    if (name.startsWith("mem_") && !value && ++erased === 2) {
      f.db.prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=?").run(f.workspaceId);
      const other = new SpaceMemoryStore(f.repo, f.native, "boundary-fixture");
      const state = await other.read(f.workspaceId);
      await other.write(f.workspaceId, state.files, state.history, state.prior);
      f.secrets.delete(name);
      throw new Error("Retirement ACK lost after a newer publication");
    }
  });
  await expect(f.pipeline.dream(f.workspaceId)).rejects.toMatchObject({ code: "operation_uncertain" });
  f.setHook(undefined);
  expect((await f.pipeline.documentList(f.workspaceId)).documents[0]!.content).toBe(
    "Updated generated workshop guidance.",
  );
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]).toMatchObject({
    status: "completed",
    changes: [{ state: "applied", resultingRevision: 2 }],
  });
  expect(f.consolidate).toHaveBeenCalledOnce();
});

it("keeps the committed Dream receipt when SQLite rejects restoration after old-key refusal, preserving later owner edits and exact revert", async () => {
  const f = await generatedDream();
  const store = new SpaceMemoryStore(f.repo, f.native, "boundary-fixture");
  let prepared = 0,
    erased = 0;
  let prior: ReturnType<typeof store.generation> = null;
  f.setHook((name, value) => {
    if (name.startsWith("mem_") && value && ++prepared === 2) {
      prior = store.generation(f.workspaceId);
      if (!prior || !/^g-[a-f0-9-]+$/.test(prior.generation))
        throw new Error("Unexpected fixture generation");
      f.db.exec(`CREATE TRIGGER refuse_previous_generation BEFORE INSERT ON memory_files
        WHEN NEW.generation='${prior.generation}' BEGIN SELECT RAISE(ABORT,'Fixture rollback restoration failed'); END;`);
    }
    if (name.startsWith("mem_") && !value && ++erased === 2) {
      f.tasks.setWorkspaceMemory(f.workspaceId, 0, "Later owner guidance during key retirement.");
      throw new Error("Final prior key erasure refused");
    }
  });
  await expect(f.pipeline.dream(f.workspaceId)).rejects.toMatchObject({ code: "operation_uncertain" });
  f.setHook(undefined);
  f.db.exec("DROP TRIGGER refuse_previous_generation");
  expect(prepared).toBe(2);
  expect(erased).toBe(2);
  expect(prior).toBeDefined();
  expect(f.secrets.has(prior!.keyName)).toBe(true);
  const files = await f.pipeline.documentList(f.workspaceId);
  expect(files.generation).not.toBe(prior!.generation);
  expect(files.documents[0]).toMatchObject({ content: "Updated generated workshop guidance.", revision: 2 });
  const operation = (await f.pipeline.dreamActivity(f.workspaceId)).entries[0]!;
  expect(operation).toMatchObject({
    status: "completed",
    cachedInputTokens: 0,
    changes: [
      {
        state: "applied",
        resultingRevision: 2,
        before: "Original generated workshop guidance.",
        after: "Updated generated workshop guidance.",
      },
    ],
  });
  expect(f.tasks.workspaceMemory(f.workspaceId)).toMatchObject({
    revision: 1,
    content: "Later owner guidance during key retirement.",
  });
  expect(
    (
      await f.pipeline.dreamRevert(
        {
          workspaceId: f.workspaceId,
          operationId: operation.operationId,
          expectedGeneration: files.generation,
        },
        f.apply,
      )
    ).changes[0]!.state,
  ).toBe("reverted");
  expect((await f.pipeline.documentList(f.workspaceId)).documents[0]!.content).toBe(
    "Original generated workshop guidance.",
  );
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Later owner guidance during key retirement.");
  expect(f.consolidate).toHaveBeenCalledOnce();
});
