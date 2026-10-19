import rankingFixture from "../fixtures/memory-ranking.json";
import { AuxError } from "@aux/contracts";
import { afterEach, expect, it, vi } from "vitest";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { EventBus, MemoryPipeline, openDb, Repo, TaskService } from "@aux/runtime";
import { SpaceMemoryStore } from "../../apps/runtime/dist/services/space-memory-store.js";
import { LocalMemoryEmbeddings } from "../../apps/runtime/dist/services/local-memory-embeddings.js";
import {
  MemoryRecall,
  memoryChunks,
  memoryRecallScore,
} from "../../apps/runtime/dist/services/memory-recall.js";
import {
  MemoryRecallResultSchema,
  type MemoryDocumentRecord,
  type MemoryRecallSource,
} from "@aux/contracts/memory-documents";
import type { MemoryDreamer } from "../../apps/runtime/dist/services/memory-dream.js";
import { fixtureMemoryExtractor } from "../fixtures/memory-extraction.js";
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
  vi.restoreAllMocks();
});
function fixture(
  dreamer?: MemoryDreamer,
  recallDependencies?: ConstructorParameters<typeof MemoryPipeline>[5],
) {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    tasks = new TaskService(repo, new EventBus(repo));
  const workspaceId = tasks.createWorkspace("Synthetic Memory").workspaceId;
  const secrets = new Map<string, string>();
  const native = {
    async storeSecret(name: string, value: string) {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
    async readSecret(name: string) {
      return { value: secrets.get(name) };
    },
    async profileStorageRoot() {
      const name = `aux_root_v1_${sha("documents-test").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  const pipeline = new MemoryPipeline(
    repo,
    native,
    "documents-test",
    fixtureMemoryExtractor,
    dreamer,
    recallDependencies,
  );
  const store = new SpaceMemoryStore(repo, native, "documents-test");
  cleanup.push(async () => {
    await pipeline.close();
    db.close();
  });
  const source = async (runId = randomUUID()) => {
    const text = "The synthetic workshop meets each Tuesday afternoon.";
    repo.saveRun({
      runId,
      goal: "Workshop planning",
      status: "completed",
      pageIds: [],
      config: { contextWorkspaceId: workspaceId },
      result: { report: text },
      createdAt: Date.now(),
      endedAt: Date.now(),
    });
    await pipeline.extractRun(workspaceId, runId);
    const claim = (await pipeline.inbox(workspaceId))[0]!;
    await pipeline.review(workspaceId, claim.claimId, "accept");
    return claim;
  };
  const generated = async () => {
    const claim = await source();
    const document: MemoryDocumentRecord = {
      documentId: randomUUID(),
      target: { kind: "site", origin: "https://example.test" },
      path: `sites/example.test-${sha("https://example.test").slice(0, 12)}.md`,
      revision: 1,
      authoredBy: "generated",
      content: "# Workshop\nOriginal synthesis.",
      contentSha256: sha("# Workshop\nOriginal synthesis."),
      updatedAt: Date.now(),
      sourceRefs: [{ claimId: claim.claimId, sourceRunId: claim.sourceRunId, quoteSha256: sha(claim.text) }],
    };
    const state = await store.read(workspaceId);
    state.files.set("documents.json.enc", JSON.stringify([document]));
    await store.write(workspaceId, state.files, state.history, state.prior);
    return { claim, document };
  };
  return { db, repo, tasks, workspaceId, pipeline, store, source, generated, native };
}
it.each(["discovery", "extraction"])(
  "keeps unextracted sessions forgotten across restart during %s",
  async (path) => {
    let now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const f = fixture();
    const runId = randomUUID();
    f.repo.saveRun({
      runId,
      goal: "Synthetic unextracted session",
      status: "completed",
      pageIds: [],
      config: { contextWorkspaceId: f.workspaceId },
      result: { report: "The synthetic workshop meets every Tuesday afternoon." },
      createdAt: Date.now() - 1000,
      endedAt: Date.now() - 1000,
    });
    await f.pipeline.forget({ workspaceId: f.workspaceId, all: true });
    await f.pipeline.close();
    const extract = vi.fn(fixtureMemoryExtractor.extract);
    const restarted = new MemoryPipeline(f.repo, f.native, "documents-test", {
      ...fixtureMemoryExtractor,
      extract,
    });
    try {
      const outcome =
        path === "discovery"
          ? await restarted.sources(f.workspaceId)
          : await restarted.extractRun(f.workspaceId, runId);
      expect(outcome).toEqual(path === "discovery" ? [] : { extracted: 0 });
      expect(extract).not.toHaveBeenCalled();
      expect(await restarted.inbox(f.workspaceId)).toEqual([]);
      expect((await restarted.recoverySnapshot())[0]!.claims).toEqual([]);
      now++;
      const freshId = randomUUID();
      f.repo.saveRun({
        runId: freshId,
        goal: "Synthetic new session after Forget",
        status: "completed",
        pageIds: [],
        config: { contextWorkspaceId: f.workspaceId },
        result: { report: "The synthetic new workshop meets each Wednesday afternoon." },
        createdAt: now,
        endedAt: now,
      });
      expect((await restarted.sources(f.workspaceId)).map((source) => source.runId)).toEqual([freshId]);
      expect(await restarted.extractRun(f.workspaceId, freshId)).toEqual({ extracted: 1 });
      expect(extract).toHaveBeenCalledTimes(1);
    } finally {
      await restarted.close();
    }
  },
);
it("binds authoritative site edits to generation, document identity and revision", async () => {
  const f = fixture();
  const first = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    expectedGeneration: null,
    target: { kind: "site", origin: "https://example.test" },
    content: "Owner guidance",
  });
  expect(first.document).toMatchObject({ authoredBy: "owner", revision: 1, sourceRefs: [] });
  await expect(
    f.pipeline.documentSet({
      workspaceId: f.workspaceId,
      expectedGeneration: first.generation,
      documentId: first.document!.documentId,
      expectedRevision: 2,
      target: first.document!.target,
      content: "Stale edit",
    }),
  ).rejects.toMatchObject({ code: "conflict" });
  const next = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    expectedGeneration: first.generation,
    documentId: first.document!.documentId,
    expectedRevision: 1,
    target: first.document!.target,
    content: "Owner revised guidance",
  });
  expect(next.document).toMatchObject({ revision: 2, contentSha256: sha("Owner revised guidance") });
  expect(JSON.stringify(f.db.prepare("SELECT content FROM memory_files").all())).not.toContain(
    "Owner revised guidance",
  );
  await expect(
    f.pipeline.documentSet({
      workspaceId: f.workspaceId,
      expectedGeneration: next.generation,
      target: { kind: "site", origin: "https://example.test/path" },
      content: "No",
    }),
  ).rejects.toMatchObject({ code: "invalid_params" });
});
it("publishes generated Dream synthesis with own measured usage and reverts only unchanged resulting documents", async () => {
  const model: MemoryDreamer = {
    generation: () => "model-generation",
    consolidate: vi.fn<MemoryDreamer["consolidate"]>(async (input) => ({
      status: "completed",
      modelId: "synthetic",
      inputTokens: 100,
      outputTokens: 20,
      cachedInputTokens: 0,
      costUsd: 0.001,
      costEstimated: false,
      changes: [
        {
          path: input.documents.find((document) => document.path.startsWith("sites/"))!.path,
          content: "# Workshop\nConsolidated Tuesday guidance.",
          claimIds: [input.claims[0]!.claimId],
        },
      ],
    })),
  };
  const f = fixture(model),
    { document } = await f.generated();
  const operation = await f.pipeline.dream(f.workspaceId);
  expect(operation).toMatchObject({
    status: "completed",
    cachedInputTokens: 0,
    costUsd: 0.001,
    changes: [{ state: "applied", before: document.content, resultingRevision: 2 }],
  });
  let files = await f.pipeline.documentList(f.workspaceId);
  expect(files.documents[0]!.content).toContain("Consolidated");
  await f.pipeline.dreamRevert({
    workspaceId: f.workspaceId,
    operationId: operation.operationId,
    expectedGeneration: files.generation,
  });
  files = await f.pipeline.documentList(f.workspaceId);
  expect(files.documents[0]).toMatchObject({
    content: document.content,
    sourceRefs: document.sourceRefs,
    revision: 3,
  });
  const again = await f.pipeline.dream(f.workspaceId);
  files = await f.pipeline.documentList(f.workspaceId);
  await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    expectedGeneration: files.generation,
    documentId: document.documentId,
    expectedRevision: 4,
    target: document.target,
    content: "Later owner edit",
  });
  files = await f.pipeline.documentList(f.workspaceId);
  await expect(
    f.pipeline.dreamRevert({
      workspaceId: f.workspaceId,
      operationId: again.operationId,
      expectedGeneration: files.generation,
    }),
  ).rejects.toMatchObject({ code: "not_found" });
  expect(files.documents[0]!.content).toBe("Later owner edit");
});
it("keeps Dream owner changes as proposals without changing source quotes or owner content", async () => {
  const f = fixture({
    generation: () => "one",
    consolidate: async (input) => ({
      status: "completed",
      changes: [{ path: "MEMORY.md", content: "Proposed synthesis", claimIds: [input.claims[0]!.claimId] }],
    }),
  });
  const claim = await f.source();
  f.tasks.setWorkspaceMemory(f.workspaceId, 0, "Owner original");
  const operation = await f.pipeline.dream(f.workspaceId);
  expect(operation.changes).toMatchObject([
    { state: "pending", ownerPath: "MEMORY.md", before: "Owner original" },
  ]);
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Owner original");
  expect((await f.pipeline.claims(f.workspaceId))[0]!.source?.quote).toBe(claim.text);
  const files = await f.pipeline.documentList(f.workspaceId);
  const accepted = await f.pipeline.dreamReview(
    {
      workspaceId: f.workspaceId,
      operationId: operation.operationId,
      changeId: operation.changes[0]!.changeId,
      expectedGeneration: files.generation,
      expectedOwnerRevision: 1,
      decision: "accept",
    },
    (change, revision) => f.tasks.setWorkspaceMemory(f.workspaceId, revision, change.after).revision,
  );
  expect(accepted.changes[0]!.state).toBe("accepted");
  expect(f.tasks.workspaceMemory(f.workspaceId).content).toBe("Proposed synthesis");
});
it("joins original Dream cancellation before Forget and removes derived documents, drafts and source rediscovery", async () => {
  let dispatched!: () => void;
  const started = new Promise<void>((resolve) => {
    dispatched = resolve;
  });
  const f = fixture({
    generation: () => "one",
    consolidate: async (input) => {
      dispatched();
      await new Promise<void>((resolve) =>
        input.signal.addEventListener("abort", () => resolve(), { once: true }),
      );
      return { status: "failed", errorCode: "interrupted", inputTokens: 7, outputTokens: 0, changes: [] };
    },
  });
  const { claim } = await f.generated();
  const original = f.pipeline.dream(f.workspaceId);
  await started;
  await f.pipeline.forget({ workspaceId: f.workspaceId, sourceRunId: claim.sourceRunId });
  expect(await original).toMatchObject({ status: "cancelled", inputTokens: 7 });
  expect((await f.pipeline.documentList(f.workspaceId)).documents).toEqual([]);
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries).toEqual([]);
  await expect(f.pipeline.discoverySnapshot(f.workspaceId, [claim.sourceRunId])).rejects.toMatchObject({
    code: "permission_denied",
  });
  const recovered = await f.pipeline.recoverySnapshot();
  expect(recovered[0]!.retiredSources!.sourceHashes).toContain(sha(claim.sourceRunId));
});
it("never cancels a replacement Dream through an interrupted operation's saved identity", async () => {
  const f = fixture({
    generation: () => "one",
    consolidate: async () => ({ status: "completed", changes: [] }),
  });
  await f.source();
  const old = await f.pipeline.dream(f.workspaceId);
  const state = await f.store.read(f.workspaceId);
  state.files.set("dream-operations.json.enc", JSON.stringify([{ ...old, status: "running" }]));
  await f.store.write(f.workspaceId, state.files, state.history, state.prior);
  const replacement = f.pipeline.dream(f.workspaceId);
  const cancelled = await f.pipeline.dreamCancel(f.workspaceId, old.operationId);
  expect(cancelled.operationId).toBe(old.operationId);
  expect(await replacement).toMatchObject({ status: "no-change" });
});
it("joins the exact active Dream after cancellation and retains its measured usage", async () => {
  let complete!: () => void;
  let signal!: AbortSignal;
  const f = fixture({
    generation: () => "one",
    consolidate: async (input) => {
      signal = input.signal;
      await new Promise<void>((resolve) => {
        complete = resolve;
      });
      return { status: "completed", changes: [], inputTokens: 9, outputTokens: 0 };
    },
  });
  await f.source();
  const original = f.pipeline.dream(f.workspaceId);
  await vi.waitFor(() => expect(complete).toBeTypeOf("function"));
  const active = (await f.pipeline.dreamStatus(f.workspaceId)).active!;
  let settled = false;
  const cancellation = f.pipeline.dreamCancel(f.workspaceId, active.operationId).then((value) => {
    settled = true;
    return value;
  });
  await vi.waitFor(() => expect(signal.aborted).toBe(true));
  expect(settled).toBe(false);
  complete();
  expect(await cancellation).toMatchObject({
    operationId: active.operationId,
    status: "cancelled",
    inputTokens: 9,
    outputTokens: 0,
  });
  expect(await original).toEqual(await cancellation);
});
it("keeps heading and exact line ranges and rejects stale search/read identity after an owner edit", async () => {
  const f = fixture();
  f.tasks.setWorkspaceMemory(
    f.workspaceId,
    0,
    "# Preferences\nWorkshop Tuesday\n# Projects\nSynthetic schedule",
  );
  const input = {
    workspaceId: f.workspaceId,
    queries: ["workshop", "schedule"],
    mode: "lexical" as const,
    limit: 1,
  };
  const results = await f.pipeline.recall(input);
  expect(results.matches[0]).toMatchObject({
    heading: expect.any(String),
    startLine: expect.any(Number),
    sourceId: "owner:MEMORY.md",
  });
  expect(results.nextCursor).not.toBeNull();
  const match = results.matches[0]!;
  const read = await f.pipeline.readSource({
    workspaceId: f.workspaceId,
    sourceId: match.sourceId,
    revision: match.revision,
    sha256: match.sha256,
    startLine: 1,
    limitLines: 2,
  });
  expect(read).toMatchObject({
    text: "# Preferences\nWorkshop Tuesday",
    startLine: 1,
    endLine: 2,
    nextLine: 3,
  });
  f.tasks.setWorkspaceMemory(f.workspaceId, 1, "Changed owner guidance");
  await expect(f.pipeline.recall({ ...input, cursor: results.nextCursor })).rejects.toMatchObject({
    code: "conflict",
  });
  await expect(
    f.pipeline.readSource({
      workspaceId: f.workspaceId,
      sourceId: match.sourceId,
      revision: match.revision,
      sha256: match.sha256,
    }),
  ).rejects.toMatchObject({ code: "conflict" });
});
it("refuses an oversized UTF-8 source line instead of returning a zero-progress read cursor", async () => {
  const text = "# Synthetic source\n" + "界".repeat(30_000);
  const source: MemoryRecallSource = {
    sourceId: "page:large-line",
    kind: "page",
    path: "synthetic.md",
    title: "Synthetic source",
    text,
    revision: "1",
    sha256: sha(text),
    updatedAt: Date.now(),
    sourceRefs: [],
  };
  const f = fixture(undefined, { pages: async () => [source], history: () => [] });
  const request = {
    workspaceId: f.workspaceId,
    sourceId: source.sourceId,
    revision: source.revision,
    sha256: source.sha256,
  };
  const first = await f.pipeline.readSource(request);
  expect(first).toMatchObject({ text: "# Synthetic source", startLine: 1, endLine: 1, nextLine: 2 });
  await expect(f.pipeline.readSource({ ...request, startLine: first.nextLine })).rejects.toMatchObject({
    code: "invalid_params",
    message:
      "The requested line exceeds the Memory source read byte limit. Choose another line or a bounded search excerpt.",
  });
});

it("labels a local embedding outage as lexical fallback without sending text remotely", async () => {
  vi.spyOn(LocalMemoryEmbeddings.prototype, "discover").mockRejectedValue(
    new AuxError("backend_unavailable", "Unavailable"),
  );
  const recall = new MemoryRecall();
  cleanup.push(() => recall.close());
  const source: MemoryRecallSource = {
    sourceId: "owner:MEMORY.md",
    kind: "owner",
    path: "MEMORY.md",
    title: "Owner",
    text: "# Projects\nWorkshop schedule",
    sha256: sha("# Projects\nWorkshop schedule"),
    revision: "1",
    updatedAt: Date.now(),
    sourceRefs: [],
  };
  expect(memoryChunks(source)[0]).toMatchObject({ heading: "Projects", startLine: 1, endLine: 2 });
  const result = await recall.search(
    [source],
    { workspaceId: "workspace", queries: ["workshop"], mode: "auto", limit: 20 },
    new AbortController().signal,
    () => {},
  );
  expect(result).toMatchObject({
    mode: "lexical",
    fallbackReason: expect.stringContaining("keyword"),
    matches: [{ sourceId: source.sourceId }],
  });
});

it("uses the demonstrated semantic/recency/path ranking while keeping stronger old evidence above a weak fresh mention", () => {
  const now = 1800000000000;
  const base: MemoryRecallSource = {
    sourceId: "test",
    kind: "owner",
    path: "",
    title: "",
    text: "Workshop reference",
    sha256: sha("Workshop reference"),
    revision: "1",
    updatedAt: now,
    sourceRefs: [],
  };
  const ranked = rankingFixture.candidates
    .map((candidate) => {
      const chunk = memoryChunks({
        ...base,
        sourceId: candidate.id,
        path: candidate.path,
        updatedAt: now - candidate.ageDays * 86400000,
      })[0]!;
      return {
        id: candidate.id,
        score: memoryRecallScore(chunk, [rankingFixture.query], candidate.semantic, now),
      };
    })
    .sort((a, b) => b.score - a.score);
  expect(ranked.map((candidate) => candidate.id)).toEqual(rankingFixture.expectedOrder);
});
it("counts five eligible sessions for idle Dream and records a real no-change outcome before resetting its due window", async () => {
  const f = fixture({
    generation: () => "one",
    consolidate: async () => ({ status: "completed", modelId: "Synthetic", changes: [] }),
  });
  for (let i = 0; i < 5; i++) await f.source();
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ due: true, eligibleSessions: 5 });
  const operation = await f.pipeline.dream(f.workspaceId, "idle");
  expect(operation).toMatchObject({ trigger: "idle", status: "no-change", changes: [] });
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ due: false, eligibleSessions: 0 });
});
it.each(["failed", "cancelled"] as const)(
  "retains unprocessed Dream sessions after %s and backs off automatic retries for 24 hours",
  async (outcome) => {
    let now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const consolidate = vi.fn<MemoryDreamer["consolidate"]>(async () => {
      if (outcome === "cancelled") throw new AuxError("cancelled", "Synthetic cancellation");
      return { status: "failed", changes: [], errorCode: "inference_failed" };
    });
    const f = fixture({
      generation: () => "one",
      consolidate,
    });
    for (let index = 0; index < 5; index++) await f.source();
    now++;
    expect(await f.pipeline.dream(f.workspaceId, "idle")).toMatchObject({ status: outcome });
    expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 5, due: false });
    expect(await f.pipeline.dreamIdle()).toEqual([]);
    expect(consolidate).toHaveBeenCalledTimes(1);
    now += 86400000 - 1;
    expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 5, due: false });
    now++;
    expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 5, due: true });
    now += 14 * 86400000;
    expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 0, due: false });
  },
);
it("permits manual Dream during failure backoff and consumes sessions only after no-change success", async () => {
  let now = Date.now(),
    fail = true;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  const f = fixture({
    generation: () => "one",
    consolidate: async () =>
      fail
        ? { status: "failed", changes: [], errorCode: "inference_failed" }
        : { status: "completed", changes: [] },
  });
  for (let index = 0; index < 5; index++) await f.source();
  now++;
  await f.pipeline.dream(f.workspaceId, "idle");
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 5, due: false });
  fail = false;
  now++;
  expect(await f.pipeline.dream(f.workspaceId, "manual")).toMatchObject({ status: "no-change" });
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 0, due: false });
});
it("makes one eligible session due after 24 hours and expires it after 14 days", async () => {
  let now = Date.now();
  vi.spyOn(Date, "now").mockImplementation(() => now);
  const f = fixture();
  await f.source();
  now += 86400000 - 1;
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 1, due: false });
  now++;
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 1, due: true });
  now += 13 * 86400000;
  expect(await f.pipeline.dreamStatus(f.workspaceId)).toMatchObject({ eligibleSessions: 0, due: false });
});
it("cancels and joins the original read-by-ID source operation when its Memory owner retires", async () => {
  let started!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  let capturedSignal: AbortSignal | undefined;
  const f = fixture(undefined, {
    pages: async (_workspaceId, signal) => {
      capturedSignal = signal;
      started();
      await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
      return [];
    },
    history: () => [],
  });
  f.tasks.setWorkspaceMemory(f.workspaceId, 0, "Owner source lines");
  const original = f.pipeline.readSource({
    workspaceId: f.workspaceId,
    sourceId: "owner:MEMORY.md",
    revision: "1",
    sha256: sha("Owner source lines"),
  });
  const rejected = expect(original).rejects.toMatchObject({ name: "AbortError" });
  await began;
  await f.pipeline.retireWorkspace(f.workspaceId);
  await rejected;
  expect(capturedSignal!.aborted).toBe(true);
});
it("expires source-dependent synthesis while preserving unrelated owner site guidance and hiding expired source identity from recovery", async () => {
  const now = Date.now();
  const clock = vi.spyOn(Date, "now").mockReturnValue(now - 31 * 86400000);
  const f = fixture(),
    { claim } = await f.generated();
  clock.mockReturnValue(now);
  const files = await f.pipeline.documentList(f.workspaceId);
  await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    expectedGeneration: files.generation,
    target: { kind: "site", origin: "https://owner.test" },
    content: "Permanent owner site guidance",
  });
  await f.pipeline.setRetention({ workspaceId: f.workspaceId, retentionDays: 30, expectedRetentionDays: 0 });
  expect((await f.pipeline.documentList(f.workspaceId)).documents).toMatchObject([
    { authoredBy: "owner", content: "Permanent owner site guidance" },
  ]);
  const recovery = await f.pipeline.recoverySnapshot();
  expect(JSON.stringify(recovery)).not.toContain(claim.sourceRunId);
  expect(recovery[0]!.retiredSources!.sourceHashes).toContain(sha(claim.sourceRunId));
});
it("authenticates document content hashes and complete new file inventory during recovery import", async () => {
  const original = fixture();
  await original.pipeline.documentSet({
    workspaceId: original.workspaceId,
    expectedGeneration: null,
    target: { kind: "site", origin: "https://example.test" },
    content: "Synthetic protected guidance",
  });
  const snapshot = (await original.pipeline.recoverySnapshot())[0]!;
  expect(snapshot.verifiedFiles).toEqual(
    expect.arrayContaining(["documents.json.enc", "dream-operations.json.enc", "retired-sources.json.enc"]),
  );
  const target = fixture();
  await target.pipeline.importRecoverySnapshot([{ ...snapshot, workspaceId: target.workspaceId }]);
  expect((await target.pipeline.documentList(target.workspaceId)).documents[0]!.content).toBe(
    "Synthetic protected guidance",
  );
  const tampered = fixture();
  await expect(
    tampered.pipeline.importRecoverySnapshot([
      {
        ...snapshot,
        workspaceId: tampered.workspaceId,
        documents: [{ ...snapshot.documents![0]!, content: "Altered content" }],
      },
    ]),
  ).rejects.toThrow("content or provenance");
  expect((await tampered.pipeline.documentList(tampered.workspaceId)).documents).toEqual([]);
});
it("immediately withholds generated synthesis after an effective owner note edit while retaining the original immutable quote", async () => {
  const f = fixture(),
    { claim } = await f.generated();
  expect((await f.pipeline.overview(f.workspaceId)).summary).toContain("Original synthesis");
  const files = await f.pipeline.documentList(f.workspaceId);
  await f.pipeline.editDocuments({
    workspaceId: f.workspaceId,
    expectedGeneration: files.generation,
    edits: [{ claimId: claim.claimId, text: "The synthetic workshop now meets on Friday afternoon." }],
  });
  expect((await f.pipeline.overview(f.workspaceId)).summary).not.toContain("Original synthesis");
  expect(
    (
      await f.pipeline.recall({
        workspaceId: f.workspaceId,
        queries: ["original synthesis"],
        mode: "lexical",
      })
    ).matches,
  ).toEqual([]);
  const source = (await f.pipeline.claims(f.workspaceId))[0]!;
  expect(source.source!.quote).toBe(claim.text);
  expect(source.ownerEdit).toMatchObject({ revision: 1, text: expect.stringContaining("Friday") });
});

it("returns complete provenance for valid long page/history URLs without violating its result contract", async () => {
  const url = `https://example.test/${"synthetic-segment/".repeat(190)}`;
  const text = `Synthetic workshop reference\n${url}`;
  const source: MemoryRecallSource = {
    sourceId: "history:synthetic",
    kind: "history",
    path: url,
    title: "Workshop",
    text,
    revision: "1",
    sha256: sha(text),
    updatedAt: Date.now(),
    url,
    sourceRefs: [],
  };
  const engine = new MemoryRecall();
  cleanup.push(() => engine.close());
  const result = await engine.search(
    [source],
    { workspaceId: "workspace", queries: ["workshop"], mode: "lexical", limit: 20 },
    new AbortController().signal,
    () => {},
  );
  expect(url.length).toBeGreaterThan(2048);
  expect(MemoryRecallResultSchema.parse(result).matches[0]).toMatchObject({ path: url, url });
});
