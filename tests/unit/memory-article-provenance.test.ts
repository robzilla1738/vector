import { seedHistoricalRunMemory, seedHistoricalEpisodicReceiver } from "../fixtures/historical-memory.js";
import { advanceManagedRecoveryGeneration } from "../../apps/runtime/dist/services/managed-recovery-generation.js";
import { startRuntime } from "@aux/runtime";
import {
  SpaceMemoryRestore,
  memoryRestoreTransition,
  memoryLogicalDigest,
} from "../../apps/runtime/dist/services/space-memory-restore.js";
import { cancelRuntimeRestore } from "../../apps/runtime/dist/services/runtime-backup.js";
import {
  currentSpaceMemory,
  spaceMemoryDigest,
} from "../../apps/runtime/dist/services/space-memory-backup.js";
import { MemorySourceAdmission } from "../../apps/runtime/dist/services/memory-source-admission.js";
import { SpaceMemoryStore } from "../../apps/runtime/dist/services/space-memory-store.js";
import { toErrorPayload } from "@aux/contracts";
import { inspectLegacyArticleHistory } from "../../apps/runtime/dist/services/legacy-memory-retirement.js";
import { projectLegacyRecall } from "../../apps/runtime/dist/agent/loop/legacy-recall.js";
import { toolResultsMessage } from "../../apps/runtime/dist/agent/loop/types.js";
import { ConversationBranches } from "../../apps/runtime/dist/services/conversation-branches.js";
import {
  createRuntimeBackup,
  stageRuntimeRestore,
  applyPendingRuntimeRestore,
} from "../../apps/runtime/dist/services/runtime-backup.js";
import { searchConversation } from "../../apps/runtime/dist/services/conversation-search.js";
import { SubagentService } from "../../apps/runtime/dist/services/subagents.js";
import { SendJournal } from "../../apps/runtime/dist/safety/send-journal.js";
import { DesktopContextStore } from "../../apps/runtime/dist/services/desktop-context-store.js";
import { DesktopContextService } from "../../apps/runtime/dist/services/desktop-context.js";
import { DesktopContextRunSources } from "../../apps/runtime/dist/services/desktop-context-run-sources.js";
import {
  desktopContextDefaults,
  type DesktopContextSettings,
  type DesktopContextNativeStatus,
  type DesktopContextCapture,
} from "@aux/contracts/desktop-context";
import type { TurnSourceContext } from "@aux/contracts/turn-source-context";
import { digest } from "@aux/contracts/util/digest";
import { randomUUID } from "node:crypto";
import {
  protectedRunFamily,
  retireProtectedGeneratedTask,
} from "../../apps/runtime/dist/services/run-lineage.js";
import { SubagentSchema, SubagentGroupSchema } from "@aux/contracts/subagents";
import { setMemberSourceDigest } from "../../apps/runtime/dist/services/set-member-lineage.js";
import { initializeFieldCodec } from "../../apps/runtime/dist/store/field-codec.js";
import { backup, DatabaseSync } from "node:sqlite";
import { sanitizePortablePageRecall } from "@aux/contracts/portable-page-recall";
import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ArtifactStore,
  EventBus,
  MemoryPipeline,
  MockModelClient,
  NullNativeBridge,
  PageService,
  Repo,
  RunService,
  SetService,
  SettingsService,
  TaskService,
  TranscriptStore,
  openDb,
} from "@aux/runtime";
import { DocumentSnapshots } from "../../apps/runtime/dist/services/document-snapshots.js";
import { ContentMemoryStore } from "../../apps/runtime/dist/services/content-memory.js";
import { profileSecrets } from "../support/profile-secrets.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { fixtureMemoryExtractor } from "../fixtures/memory-extraction.js";
import type { MemoryReadSourceInput, MemoryRecallMatch } from "@aux/contracts/memory-documents";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
  vi.restoreAllMocks();
});
async function fixture(
  dreamer?: import("../../apps/runtime/dist/services/memory-dream.js").MemoryDreamer,
  beforeRead?: (signal: AbortSignal) => Promise<void>,
  profileId = "recall-provenance",
  publicWeb = false,
) {
  const directory = mkdtempSync(join(tmpdir(), "aux-recall-provenance-"));
  const native = profileSecrets(profileId).native;
  const db = openDb(":memory:");
  const repo = new Repo(db, await initializeFieldCodec(db, native, profileId));
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspaceId = tasks.createWorkspace("Original article Space").workspaceId;
  const memory = new ContentMemoryStore(repo, native, profileId);
  const pipeline = new MemoryPipeline(repo, native, profileId, fixtureMemoryExtractor, dreamer, {
    pages: (id, signal) => memory.recallDocuments(id, signal),
    history: () => [],
  });
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  const model = new MockModelClient();
  vi.spyOn(settings, "model").mockReturnValue(model);
  const mentions = fixtureTurnMentions((id) => repo.getPage(id));
  const pages = new PageService({
    repo,
    events,
    turnMentions: mentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const sets = new SetService(repo, events, pages);
  let desktopSources: DesktopContextRunSources | undefined;
  const runs = new RunService({
    repo,
    events,
    settings,
    pages,
    get desktopContextSources() {
      return desktopSources;
    },
    turnMentions: mentions,
    artifacts: new ArtifactStore(directory, repo, events),
    documentSnapshots: new DocumentSnapshots(repo),
    sets,
    contentMemory: memory,
    memoryPipeline: pipeline,
    nativeAvailable: () => false,
    agentLoop: {
      ...(publicWeb
        ? { webFetch: async () => ({ output: { text: "Independent synthetic public web fixture." } }) }
        : {}),
      modelGeneration: () => settings.modelCacheGeneration(),
      memorySearch: (query, ctx) => pipeline.recall({ ...query, workspaceId }, ctx.signal, ctx.checkOwner),
      memoryReadSource: async (input, ctx) => {
        if (beforeRead) {
          if (!ctx.signal) throw new Error("The original fixture Memory read signal is missing.");
          await beforeRead(ctx.signal);
        }
        return pipeline.readSource({ ...input, workspaceId }, ctx.signal, ctx.checkOwner);
      },
    },
  });
  cleanup.push(async () => {
    await runs.close();
    await pipeline.close();
    await memory.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  await memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://article.test"],
    originScope: "listed-sites",
  });
  const article = await memory.saveEligible({
    workspaceId,
    pageId: "source-page",
    documentEpoch: 1,
    url: "https://article.test/workshop",
    title: "Quartz workshop",
    text: "The quartz workshop meets every Tuesday afternoon at the north building.",
  });
  const transcript = new TranscriptStore(repo.db, repo.columnCipher);
  return {
    repo,
    runs,
    workspaceId,
    model,
    memory,
    pipeline,
    article,
    transcript,
    directory,
    sets,
    native,
    events,
    settings,
    pages,
    mentions,
    setDesktopSources(value: DesktopContextRunSources) {
      desktopSources = value;
    },
  };
}
async function recallArticle(
  f: Awaited<ReturnType<typeof fixture>>,
  options: {
    kinds?: ("page" | "episodic")[];
    parked?: boolean;
    beforeFirstModel?: () => Promise<void>;
    afterSearch?: () => Promise<void>;
    secondSearch?: boolean;
    expectedStatus?: string;
  } = {},
) {
  let step = 0;
  f.model.toolCallStep = vi.fn(async () => {
    step++;
    if (step === 1) await options.beforeFirstModel?.();
    const messages = f.transcript.load("recall-run");
    const result = messages.filter((message) => message.role === "tool").at(-1);
    const item = result?.content[0];
    const matches =
      item?.type === "tool-result" && item.output.type === "json"
        ? (item.output.value as { matches?: MemoryRecallMatch[] }).matches
        : undefined;
    const match = matches?.[0];
    const input: Omit<MemoryReadSourceInput, "workspaceId"> | undefined = match && {
      sourceId: match.sourceId,
      revision: match.revision,
      sha256: match.sha256,
      startLine: 1,
      limitLines: 20,
    };
    if (step === 2) await options.afterSearch?.();
    const call =
      step === 1
        ? {
            toolCallId: "search",
            toolName: "memory_search",
            input: { queries: ["quartz workshop"], kinds: options.kinds ?? ["page"], mode: "lexical" },
          }
        : step === 2
          ? options.secondSearch
            ? {
                toolCallId: "search-again",
                toolName: "memory_search",
                input: { queries: ["quartz workshop"], kinds: options.kinds ?? ["page"], mode: "lexical" },
              }
            : { toolCallId: "read", toolName: "memory_read", input: input! }
          : options.parked && step === 3
            ? {
                toolCallId: "question",
                toolName: "ask_user_question",
                input: { question: "Continue reading?" },
              }
            : options.parked && step === 4
              ? {
                  toolCallId: "later-search",
                  toolName: "memory_search",
                  input: { queries: ["quartz workshop"], kinds: options.kinds ?? ["page"], mode: "lexical" },
                }
              : {
                  toolCallId: `done-${step}`,
                  toolName: "submit_result",
                  input: { report: "Read the saved workshop record." },
                };
    return {
      message: { role: "assistant" as const, content: [{ type: "tool-call" as const, ...call }] },
      toolCalls: [call],
      durationMs: 1,
      inputTokens: 1,
      outputTokens: 1,
      costUsd: 0,
    };
  });
  await f.runs.coordinator.start({
    runId: "recall-run",
    goal: "Read the saved workshop record",
    pageIds: [],
    modelId: "fixture",
    contextWorkspaceId: f.workspaceId,
  });
  await vi.waitFor(
    () =>
      expect(f.repo.getRun("recall-run")?.status).toBe(
        options.expectedStatus ?? (options.parked ? "needs_input" : "completed"),
      ),
    { timeout: 5000 },
  );
}
it("registers real search/read article captures before transcript publication and joins Forget", async () => {
  const f = await fixture();
  const append = TranscriptStore.prototype.append;
  let admittedResults = 0;
  vi.spyOn(TranscriptStore.prototype, "append").mockImplementation(function (
    this: TranscriptStore,
    ...args: Parameters<TranscriptStore["append"]>
  ) {
    if (
      args[0] === "recall-run" &&
      args[1].some(
        (message) =>
          message.role === "tool" &&
          message.content.some(
            (part) => part.type === "tool-result" && ["memory_search", "memory_read"].includes(part.toolName),
          ),
      )
    ) {
      expect(f.repo.getRun("recall-run")?.config?.contextMemoryRefs).toMatchObject([
        { memoryId: f.article.memoryId, capturedAt: f.article.capturedAt },
      ]);
      admittedResults++;
    }
    return append.call(this, ...args);
  });
  await recallArticle(f);
  expect(admittedResults).toBe(2);
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain("The quartz workshop meets");
  expect(JSON.stringify(f.repo.db.prepare("SELECT message FROM run_transcript").all())).not.toContain(
    "The quartz workshop meets",
  );
  expect(f.repo.getRun("recall-run")?.config).toMatchObject({
    memoryRecallAdmissionVersion: 1,
    contextMemoryIds: [f.article.memoryId],
    contextMemoryRefs: [
      { memoryId: f.article.memoryId, workspaceId: f.workspaceId, capturedAt: f.article.capturedAt },
    ],
  });
  expect(
    await f.runs.workTrace("recall-run", undefined, async (id) => expect(id).toBe(f.workspaceId)),
  ).toMatchObject({ protectedWorkspaceId: f.workspaceId });
  const draft = await f.runs.branch("recall-run", "branch", "original-window", async () => {});
  expect(JSON.stringify(f.runs.branches.prefix(draft.chatId))).toContain("The quartz workshop meets");
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((done) => (enter = done));
  const gate = new Promise<void>((done) => (release = done));
  let checks = 0;
  const read = f.runs
    .workTrace("recall-run", undefined, async () => {
      if (++checks === 2) {
        enter();
        await gate;
      }
    })
    .then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
  await entered;
  let removed = false;
  const removal = f.memory
    .forget(f.workspaceId, f.article.memoryId, () =>
      f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
    )
    .then((value) => {
      removed = true;
      return value;
    });
  await new Promise<void>((done) => setImmediate(done));
  expect(removed).toBe(false);
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
  ).toBeDefined();
  release();
  expect(await read).toMatchObject({ error: { code: "cancelled" } });
  expect(await removal).toBe(1);
  await f.runs.redactForgottenArticleOutputs(f.workspaceId);
  expect(f.transcript.load("recall-run")).toEqual([]);
  expect(f.transcript.load(`conversation-branch:${draft.chatId}`)).toEqual([]);
  expect(f.runs.branches.info(draft.chatId)?.available).toBe(false);
  expect(f.repo.listModelCalls("recall-run")).toHaveLength(3);
  await expect(f.runs.workTrace("recall-run", undefined, async () => {})).rejects.toMatchObject({
    code: "permission_denied",
  });
});
it("refuses the entire legacy trace including later non-Memory echoes and inherited branches", async () => {
  const f = await fixture();
  await recallArticle(f);
  const run = f.repo.getRun("recall-run")!;
  f.repo.saveRun({
    ...run,
    config: {
      ...run.config,
      memoryRecallAdmissionVersion: undefined,
      contextMemoryRefs: undefined,
      contextMemoryIds: undefined,
    },
  });
  f.transcript.append("recall-run", [
    {
      role: "assistant",
      content: [
        { type: "tool-call", toolCallId: "echo", toolName: "repl", input: { code: "echo prior result" } },
      ],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "echo",
          toolName: "repl",
          output: { type: "text", value: "The quartz workshop meets every Tuesday afternoon." },
        },
      ],
    },
  ]);
  const projection = vi.spyOn(TranscriptStore.prototype, "pageEntries");
  await expect(f.runs.workTrace("recall-run", undefined, async () => {})).rejects.toThrow(/legacy Memory/);
  f.repo.saveRun({
    ...run,
    runId: "branch",
    config: {
      implementation: "agent-loop",
      memoryRecallAdmissionVersion: 1,
      branchSourceRunIds: [run.runId],
    },
  });
  await expect(f.runs.workTrace("branch", undefined, async () => {})).rejects.toThrow(/legacy Memory/);
  expect(projection).not.toHaveBeenCalled();
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain("The quartz workshop meets");
});
it("keeps ordinary chat without Memory calls readable without source restrictions", async () => {
  const f = await fixture();
  f.repo.saveRun({
    runId: "ordinary",
    goal: "Ordinary chat",
    pageIds: [],
    status: "completed",
    createdAt: 1,
  });
  f.transcript.append("ordinary", [
    {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "time", toolName: "get_time", input: {} }],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "time",
          toolName: "get_time",
          output: { type: "text", value: "Original ordinary result" },
        },
      ],
    },
  ]);
  expect(
    await f.runs.workTrace("ordinary", undefined, async (id) => expect(id).toBeUndefined()),
  ).toMatchObject({ calls: [{ output: expect.stringContaining("Original ordinary result") }] });
});

it("refuses legacy parked continuation before another model request or provenance backfill", async () => {
  const f = await fixture();
  await recallArticle(f, { parked: true });
  const run = f.repo.getRun("recall-run")!;
  f.repo.saveRun({ ...run, config: { ...run.config, memoryRecallAdmissionVersion: undefined } });
  const requests = vi.mocked(f.model.toolCallStep).mock.calls.length;
  await f.runs.coordinator.answer("recall-run", "Continue");
  await vi.waitFor(() => expect(f.repo.getRun("recall-run")?.status).toBe("failed"), { timeout: 5000 });
  expect(vi.mocked(f.model.toolCallStep).mock.calls.length).toBe(requests);
  expect(f.repo.getRun("recall-run")?.error).toContain("Use New Chat");
  expect(f.repo.getRun("recall-run")?.config?.memoryRecallAdmissionVersion).toBeUndefined();
  expect(JSON.stringify(f.transcript.load("recall-run"))).not.toContain("later-search");
  await expect(f.runs.workTrace("recall-run", undefined, async () => {})).rejects.toThrow(/legacy Memory/);
});
it("refuses same-ID replacement captures without overwriting earlier admitted provenance", async () => {
  const f = await fixture();
  let newerCapture = 0;
  await recallArticle(f, {
    secondSearch: true,
    expectedStatus: "failed",
    afterSearch: async () => {
      const newer = await f.memory.saveEligible({
        workspaceId: f.workspaceId,
        pageId: "source-page",
        documentEpoch: 1,
        url: f.article.url,
        title: f.article.title,
        text: "The quartz workshop moved to Friday. Changed article body.",
      });
      expect(newer.memoryId).toBe(f.article.memoryId);
      newerCapture = newer.capturedAt;
    },
  });
  expect(newerCapture).toBeGreaterThan(f.article.capturedAt);
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryRefs).toMatchObject([
    { capturedAt: f.article.capturedAt },
  ]);
  expect(JSON.stringify(f.transcript.load("recall-run"))).not.toContain("moved to Friday");
  await expect(f.runs.workTrace("recall-run", undefined, async () => {})).rejects.toMatchObject({
    code: "permission_denied",
  });
});

it("removes admitted article tool transcript from the real portable copy without changing its source", async () => {
  const f = await fixture();
  await recallArticle(f);
  const copyPath = join(f.directory, "portable.sqlite");
  await backup(f.repo.db, copyPath);
  const restored = new Repo(openDb(copyPath), f.repo.columnCipher);
  try {
    sanitizePortablePageRecall(restored.db, restored.columnCipher);
    expect(new TranscriptStore(restored.db, restored.columnCipher).load("recall-run")).toEqual([]);
    expect(restored.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
    expect(restored.db.prepare("SELECT count(*) AS n FROM content_memory").get()).toEqual({ n: 0 });
  } finally {
    restored.close();
  }
  const reopened = new Repo(openDb(copyPath), f.repo.columnCipher);
  try {
    expect(new TranscriptStore(reopened.db, reopened.columnCipher).load("recall-run")).toEqual([]);
    expect(reopened.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
  } finally {
    reopened.close();
  }
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain("The quartz workshop meets");
});

it("refuses a source replacement between actual byte admission and run publication", async () => {
  const f = await fixture();
  const admit = f.memory.admitRecallSources.bind(f.memory);
  vi.spyOn(f.memory, "admitRecallSources").mockImplementationOnce(async (...args) => {
    const result = await admit(...args);
    await f.memory.saveEligible({
      workspaceId: f.workspaceId,
      pageId: "source-page",
      documentEpoch: 1,
      url: f.article.url,
      title: f.article.title,
      text: "The quartz workshop now meets Friday. Replacement article.",
    });
    return result;
  });
  await recallArticle(f);
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryRefs).toBeUndefined();
  const stored = JSON.stringify(f.transcript.load("recall-run"));
  expect(stored).not.toContain("The quartz workshop meets every Tuesday");
  expect(stored).not.toContain("Replacement article");
  expect(stored).toContain("retired before publication");
});

function setReceipt(
  f: Awaited<ReturnType<typeof fixture>>,
  setId: string,
  memberId: string,
  childId: string,
  parentId: string,
) {
  const member = f.sets.get(setId).members.find((item) => item.memberId === memberId)!;
  const source = { parentRunId: parentId, setId, memberId, url: member.url!, memberUrl: member.url };
  const sourceDigest = setMemberSourceDigest(source);
  const child = f.repo.getRun(childId)!;
  f.repo.saveRun({ ...child, config: { ...child.config, setMemberSource: { ...source, sourceDigest } } });
  f.repo.db
    .prepare(
      "INSERT INTO set_run_members(child_run_id,parent_run_id,set_id,member_id,source_digest,state,created_at,updated_at) VALUES(?,?,?,?,?,'completed',1,1)",
    )
    .run(childId, parentId, setId, memberId, sourceDigest);
}
it("joins held Set-parent work and retires actual article family while preserving another execution of the same Set", async () => {
  const f = await fixture();
  await recallArticle(f);
  const set = await f.sets.create({
    name: "Synthetic Set",
    source: "urls",
    urls: [f.article.url, "https://article.test/second"],
  });
  const [first, second] = f.sets.get(set.setId).members;
  for (const member of [first!, second!]) f.repo.saveMember({ ...member, status: "completed" });
  for (const id of ["set-parent", "sibling", "unrelated-parent", "unrelated-child"]) {
    f.repo.saveRun({
      runId: id,
      goal: "Review the Set",
      setId: id.endsWith("parent") ? set.setId : undefined,
      pageIds: [],
      status: "completed",
      createdAt: 1,
      config: { contextWorkspaceId: f.workspaceId },
    });
    f.transcript.append(id, [
      {
        role: "assistant",
        content: [
          {
            type: "text",
            text: id.startsWith("unrelated")
              ? "Unrelated execution"
              : `Actual child source: ${f.article.text}`,
          },
        ],
      },
    ]);
  }
  setReceipt(f, set.setId, first!.memberId, "recall-run", "set-parent");
  setReceipt(f, set.setId, second!.memberId, "sibling", "set-parent");
  setReceipt(f, set.setId, first!.memberId, "unrelated-child", "unrelated-parent");
  expect([...protectedRunFamily(f.repo, new Set(["recall-run"]))].sort()).toEqual([
    "recall-run",
    "set-parent",
    "sibling",
  ]);
  const copyPath = join(f.directory, "family-portable.sqlite");
  await backup(f.repo.db, copyPath);
  const copy = new Repo(openDb(copyPath), f.repo.columnCipher);
  try {
    expect(() => sanitizePortablePageRecall(copy.db, copy.columnCipher)).toThrow(
      /authenticated runtime lineage/,
    );
    expect(new TranscriptStore(copy.db, copy.columnCipher).load("set-parent")).not.toEqual([]);
    const legacy = await inspectLegacyArticleHistory(copy, new TranscriptStore(copy.db, copy.columnCipher));
    const inspected = () => {
      legacy.check();
      return legacy.runIds;
    };
    expect(() =>
      sanitizePortablePageRecall(
        copy.db,
        copy.columnCipher,
        (ids) => protectedRunFamily(copy, ids),
        undefined,
        inspected,
      ),
    ).toThrow(/Generated protected tasks/);
    expect(new TranscriptStore(copy.db, copy.columnCipher).load("set-parent")).not.toEqual([]);
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id) => {
        retireProtectedGeneratedTask(copy, id);
      },
      inspected,
    );
    for (const id of ["set-parent", "sibling", "recall-run"])
      expect(new TranscriptStore(copy.db, copy.columnCipher).load(id)).toEqual([]);
    expect(new TranscriptStore(copy.db, copy.columnCipher).load("unrelated-parent")).not.toEqual([]);
  } finally {
    copy.close();
  }
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((done) => (enter = done));
  const gate = new Promise<void>((done) => (release = done));
  let checks = 0;
  const read = f.runs
    .workTrace("set-parent", undefined, async (id) => {
      expect(id).toBe(f.workspaceId);
      if (++checks === 2) {
        enter();
        await gate;
      }
    })
    .then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
  await entered;
  let removed = false;
  const removal = f.memory
    .forget(f.workspaceId, f.article.memoryId, () =>
      f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
    )
    .then(() => {
      removed = true;
    });
  await new Promise<void>((done) => setImmediate(done));
  expect(removed).toBe(false);
  release();
  expect(await read).toMatchObject({ error: { code: "cancelled" } });
  await removal;
  await f.runs.redactForgottenArticleOutputs(f.workspaceId);
  for (const runId of ["set-parent", "recall-run", "sibling"]) {
    expect(f.repo.getRun(runId)?.config?.contextMemoryRevoked).toBe(true);
    expect(f.transcript.load(runId)).toEqual([]);
  }
  for (const id of ["unrelated-parent", "unrelated-child"]) {
    expect(f.repo.getRun(id)?.config?.contextMemoryRevoked).not.toBe(true);
    expect(f.transcript.load(id)).not.toEqual([]);
  }
  expect(f.repo.listModelCalls("recall-run")).toHaveLength(3);
});
it("rejects missing, changed and cyclic Set receipts instead of trusting config IDs", async () => {
  const f = await fixture();
  await recallArticle(f);
  const set = await f.sets.create({ name: "Synthetic Set", source: "urls", urls: [f.article.url] });
  const member = f.sets.get(set.setId).members[0]!;
  f.repo.saveRun({
    runId: "parent",
    goal: "Original parent",
    status: "completed",
    pageIds: [],
    createdAt: 1,
  });
  setReceipt(f, set.setId, member.memberId, "recall-run", "parent");
  const row = f.repo.db
    .prepare("SELECT source_digest FROM set_run_members WHERE child_run_id='recall-run'")
    .get() as { source_digest: string };
  f.repo.db
    .prepare("UPDATE set_run_members SET source_digest=? WHERE child_run_id='recall-run'")
    .run("f".repeat(64));
  expect(() => protectedRunFamily(f.repo, new Set(["recall-run"]))).toThrow(/provenance changed/);
  f.repo.db
    .prepare("UPDATE set_run_members SET source_digest=? WHERE child_run_id='recall-run'")
    .run(row.source_digest);
  setReceipt(f, set.setId, member.memberId, "parent", "recall-run");
  expect(() => protectedRunFamily(f.repo, new Set(["recall-run"]))).toThrow(/cycle/);
  f.repo.db.prepare("DELETE FROM set_run_members WHERE child_run_id='recall-run'").run();
  expect(() => protectedRunFamily(f.repo, new Set(["recall-run"]))).toThrow(/receipt is unavailable/);
});
it("uses validated encrypted subagent membership for child article retirement and rejects malformed ownership", async () => {
  const f = await fixture();
  await recallArticle(f);
  const parentId = "subagent-parent";
  f.repo.saveRun({
    runId: parentId,
    goal: "Original parent",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  f.transcript.append(parentId, [{ role: "assistant", content: [{ type: "text", text: f.article.text }] }]);
  const group = SubagentGroupSchema.parse({
    groupId: randomUUID(),
    parentRunId: parentId,
    workspaceId: f.workspaceId,
    tokenBudget: 0,
    costBudgetUsd: 0,
    timeBudgetMs: 0,
    deadlineAt: 0,
    createdAt: 1,
    state: "closed",
  });
  f.repo.db
    .prepare("UPDATE runs SET goal=? WHERE run_id='recall-run'")
    .run(f.repo.protectRecordField("runs", ["recall-run"], "goal", `Child detail: ${f.article.text}`));
  f.repo.db
    .prepare("UPDATE conversations SET title=? WHERE chat_id='recall-run'")
    .run(
      f.repo.protectRecordField(
        "conversations",
        ["recall-run"],
        "title",
        `Child detail: ${f.article.text}`.slice(0, 160),
      ),
    );
  const agent = SubagentSchema.parse({
    agentId: randomUUID(),
    groupId: group.groupId,
    sourceRunId: parentId,
    runId: "recall-run",
    goal: `Investigate this recalled detail: ${f.article.text}`,
    profile: "research",
    pageIds: [],
    tokenAllocation: 0,
    costAllocationUsd: 0,
    maxModelCalls: 0,
    createdAt: 1,
    state: "completed",
  });
  f.repo.db
    .prepare(
      "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,?,?)",
    )
    .run(group.groupId, parentId, f.workspaceId, JSON.stringify(group), group.state, 1);
  f.repo.db
    .prepare(
      "INSERT INTO subagents(agent_id,group_id,reserved_run_id,run_id,body,state,created_at) VALUES(?,?,?,?,?,?,?)",
    )
    .run(
      agent.agentId,
      group.groupId,
      "recall-run",
      "recall-run",
      f.repo.protectRecordField("subagents", [agent.agentId], "body", JSON.stringify(agent)),
      "completed",
      1,
    );
  expect([...protectedRunFamily(f.repo, new Set(["recall-run"]))].sort()).toEqual(["recall-run", parentId]);
  const original = f.repo.db
    .prepare("SELECT body FROM subagent_groups WHERE group_id=?")
    .get(group.groupId) as { body: string };
  f.repo.db
    .prepare("UPDATE subagent_groups SET body=? WHERE group_id=?")
    .run(JSON.stringify({ ...group, parentRunId: "fabricated" }), group.groupId);
  expect(() => protectedRunFamily(f.repo, new Set(["recall-run"]))).toThrow(/provenance changed/);
  f.repo.db.prepare("UPDATE subagent_groups SET body=? WHERE group_id=?").run(original.body, group.groupId);
  const path = join(f.directory, "child-portable.sqlite");
  await backup(f.repo.db, path);
  const copy = new Repo(openDb(path), f.repo.columnCipher);
  try {
    const inspected = await inspectLegacyArticleHistory(
      copy,
      new TranscriptStore(copy.db, copy.columnCipher),
    );
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id) => {
        retireProtectedGeneratedTask(copy, id);
      },
      () => {
        inspected.check();
        return inspected.runIds;
      },
    );
    expect(copy.getRun("recall-run")?.goal).toBe("Saved-article-derived task retired");
    const child = copy.db.prepare("SELECT body FROM subagents WHERE agent_id=?").get(agent.agentId) as {
      body: string;
    };
    expect(copy.revealRecordField("subagents", [agent.agentId], "body", child.body)).not.toContain(
      f.article.text,
    );
    expect(copy.getRun(parentId)?.goal).toBe("Original parent");
    expect(copy.getConversationTitle("recall-run")).toBe("Saved-article-derived task retired");
  } finally {
    copy.close();
  }
  f.repo.db
    .prepare("UPDATE conversations SET title=? WHERE chat_id='recall-run'")
    .run(f.repo.protectRecordField("conversations", ["recall-run"], "title", "Owner's task label"));
  await f.memory.forget(f.workspaceId, f.article.memoryId, () =>
    f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
  );
  await f.runs.redactForgottenArticleOutputs(f.workspaceId);
  expect(f.transcript.load(parentId)).toEqual([]);
  expect(f.repo.getRun(parentId)?.config?.contextMemoryRevoked).toBe(true);
  expect(f.repo.getRun(parentId)?.goal).toBe("Original parent");
  expect(f.repo.getRun("recall-run")?.goal).toBe("Saved-article-derived task retired");
  expect(f.repo.getConversationTitle("recall-run")).toBe("Owner's task label");
  expect(
    (await searchConversation(f.repo, { chatId: "recall-run", query: "quartz", direction: "next" })).matches,
  ).toBe(0);
  const retiredAgent = f.repo.db
    .prepare("SELECT body FROM subagents WHERE agent_id=?")
    .get(agent.agentId) as { body: string };
  expect(f.repo.revealRecordField("subagents", [agent.agentId], "body", retiredAgent.body)).not.toContain(
    f.article.text,
  );
});

it("refuses a held earlier trace when actual recall admission changes its source proof", async () => {
  const f = await fixture();
  let modelEnter!: () => void, modelRelease!: () => void;
  const modelEntered = new Promise<void>((done) => (modelEnter = done));
  const modelGate = new Promise<void>((done) => (modelRelease = done));
  const running = recallArticle(f, {
    beforeFirstModel: async () => {
      modelEnter();
      await modelGate;
    },
  });
  await modelEntered;
  let viewerEnter!: () => void, viewerRelease!: () => void;
  const viewerEntered = new Promise<void>((done) => (viewerEnter = done));
  const viewerGate = new Promise<void>((done) => (viewerRelease = done));
  const read = f.runs
    .workTrace("recall-run", undefined, async () => {
      viewerEnter();
      await viewerGate;
    })
    .then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
  await viewerEntered;
  modelRelease();
  await running;
  viewerRelease();
  expect(await read).toMatchObject({ error: { code: "permission_denied" } });
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryRefs).toHaveLength(1);
});

async function desktopSource(f: Awaited<ReturnType<typeof fixture>>) {
  let now = Date.now();
  const store = new DesktopContextStore(f.repo, f.native, "recall-provenance");
  let settings: DesktopContextSettings = desktopContextDefaults();
  let status: DesktopContextNativeStatus = {
    supported: true,
    phase: "off",
    accessibilityTrusted: true,
    ocrSupported: true,
    pickerGrantActive: false,
    leaseId: null,
    configurationRevision: 0,
    consentRevision: 0,
    dropped: 0,
    reason: "none",
  };
  const service = new DesktopContextService({
    store,
    native: {
      status: async () => ({ ...status }),
      apps: async () => [],
      configure: async (value) => {
        status = {
          ...status,
          phase: value.enabled && !value.paused ? "running" : "off",
          configurationRevision: value.revision,
          leaseId: value.enabled && !value.paused ? "lease" : null,
        };
        return { ...status };
      },
      attach: async () => ({ ...status }),
      permission: async () => ({ ...status }),
      take: async () => null,
      validate: async () => true,
      acknowledge: async () => {},
      stop: async () => {
        status = { ...status, phase: "off", leaseId: null };
      },
    },
    settings: () => settings,
    saveSettings: (value) => {
      settings = value;
    },
    now: () => now,
    workspaceEligible: (id) => id === f.workspaceId,
    sourceEligible: () => true,
    beforeChange: (scope) => f.runs.retireDesktopContext(scope, true).then(() => {}),
    beforeRemoval: (scope) => f.runs.retireDesktopContext(scope).then(() => {}),
    changed: () => {},
  });
  cleanup.unshift(() => service.shutdown());
  await service.configure(
    settings.revision,
    {
      ...settings,
      enabled: true,
      workspaceId: f.workspaceId,
      selectedApps: [{ bundleId: "test.editor", displayName: "Synthetic Editor" }],
    },
    "fixture-native-owner",
    async () => {},
  );
  const capture: DesktopContextCapture = {
    captureId: randomUUID(),
    workspaceId: f.workspaceId,
    leaseId: "lease",
    configurationRevision: settings.revision,
    sourceEpoch: "epoch",
    app: { bundleId: "test.editor", displayName: "Synthetic Editor" },
    processId: 123,
    windowId: "synthetic-external-window",
    capturedAt: now,
    expiresAt: now + 14 * 86400000,
    kind: "accessibility",
    text: "Separate desktop reminder",
    selection: "",
    windowTitle: "Synthetic notes",
    sha256: digest("Separate desktop reminder\0"),
  };
  await store.append(capture, () => {});
  const viewer: TurnSourceContext = {
    windowId: "fixture-window",
    activePageId: null,
    revision: 0,
    layout: {
      shared: {
        spaces: [
          { id: "browser-space", name: "Synthetic", color: "blue", grain: 0, workspaceId: f.workspaceId },
        ],
        archivedSpaces: [],
        pins: {},
        folders: [],
        tabSpace: {},
        order: [],
        tabFolder: {},
        tabNames: {},
        splitGroups: [],
      },
      window: { activeSpaceId: "browser-space", activeTabs: {}, splitRatio: 0.5 },
    },
  };
  const sources = new DesktopContextRunSources({
    repo: f.repo,
    service,
    privateProfile: false,
    turnSourceContext: async () => viewer,
    protect: () => {},
  });
  f.setDesktopSources(sources);
  return {
    store,
    service,
    sources,
    settings: () => settings,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
it("retires mixed article transcript after actual desktop removal while preserving desktop-only human drafts", async () => {
  const f = await fixture();
  const desktop = await desktopSource(f);
  await recallArticle(f);
  const recalled = f.repo.getRun("recall-run")!;
  f.repo.saveRun({
    ...recalled,
    status: "running",
    config: { ...recalled.config, nativeTurnContext: randomUUID() },
  });
  const desktopResult = await desktop.sources.search(
    { queries: ["desktop reminder"], mode: "lexical" },
    { runId: "recall-run", signal: new AbortController().signal, checkOwner: () => {} },
  );
  expect(desktopResult.items).toHaveLength(1);
  f.repo.saveRun({ ...f.repo.getRun("recall-run")!, status: "completed" });
  f.transcript.append("recall-run", [
    { role: "user", content: `Keep this quoted article: ${f.article.text}` },
  ]);
  f.repo.saveRun({
    runId: "desktop-only",
    goal: "Ordinary desktop request",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: {
      implementation: "agent-loop",
      contextWorkspaceId: f.workspaceId,
      nativeTurnContext: randomUUID(),
    },
  });
  await desktop.sources.search(
    { queries: ["desktop reminder"], mode: "lexical" },
    { runId: "desktop-only", signal: new AbortController().signal, checkOwner: () => {} },
  );
  f.transcript.append("desktop-only", [
    { role: "user", content: "Ordinary desktop request" },
    { role: "user", content: "Keep the ordinary draft unsent." },
  ]);
  await desktop.service.forget(
    f.workspaceId,
    desktop.settings().revision,
    "test.editor",
    undefined,
    async () => {},
    "fixture-native-owner",
  );
  expect(await desktop.store.read(f.workspaceId)).toEqual([]);
  expect(f.repo.getRun("recall-run")?.config).toMatchObject({
    desktopContextRetired: true,
    contextMemoryRevoked: true,
    contextMemoryIds: [f.article.memoryId],
  });
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain(f.article.text);
  const copyPath = join(f.directory, "mixed.sqlite");
  await backup(f.repo.db, copyPath);
  const copy = new Repo(openDb(copyPath), f.repo.columnCipher);
  try {
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id) => {
        retireProtectedGeneratedTask(copy, id);
      },
    );
    expect(new TranscriptStore(copy.db, copy.columnCipher).load("recall-run")).toEqual([]);
    expect(JSON.stringify(new TranscriptStore(copy.db, copy.columnCipher).load("desktop-only"))).toContain(
      "Keep the ordinary draft",
    );
  } finally {
    copy.close();
  }
  await f.memory.forget(f.workspaceId, f.article.memoryId, () =>
    f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
  );
  await f.runs.redactForgottenArticleOutputs(f.workspaceId);
  expect(f.transcript.load("recall-run")).toEqual([]);
  expect(await f.runs.redactForgottenArticleOutputs(f.workspaceId)).toBe(0);
  expect(JSON.stringify(f.transcript.load("desktop-only"))).toContain("Keep the ordinary draft");
});

it("checks the actual child desktop quote TTL before publishing its parent's echoed work", async () => {
  const f = await fixture();
  await recallArticle(f);
  const desktop = await desktopSource(f);
  const original = f.repo.getRun("recall-run")!;
  f.repo.saveRun({
    ...original,
    status: "running",
    config: { ...original.config, nativeTurnContext: randomUUID() },
  });
  await desktop.sources.search(
    { queries: ["desktop reminder"], mode: "lexical" },
    { runId: "recall-run", signal: new AbortController().signal, checkOwner: () => {} },
  );
  f.repo.saveRun({ ...f.repo.getRun("recall-run")!, status: "completed" });
  const set = await f.sets.create({
    source: "urls",
    name: "Actual protected family",
    urls: ["https://article.test/workshop"],
  });
  const member = f.repo.listMembers(set.setId)[0]!;
  f.repo.saveRun({
    runId: "desktop-parent",
    goal: "Original human goal",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  setReceipt(f, set.setId, member.memberId, "recall-run", "desktop-parent");
  f.transcript.append("desktop-parent", [
    { role: "assistant", content: [{ type: "text", text: "Separate desktop reminder" }] },
  ]);
  expect(await f.runs.workTrace("desktop-parent", undefined, async () => {})).toMatchObject({
    protectedWorkspaceId: f.workspaceId,
  });
  desktop.advance(14 * 86400000 + 1);
  await expect(f.runs.workTrace("desktop-parent", undefined, async () => {})).rejects.toThrow(
    /expired or was removed/,
  );
  expect(f.transcript.load("desktop-parent")).not.toEqual([]);
});

it("retires actual model-to-subagent follow-up bodies while retaining their local-send receipt and human parent goal", async () => {
  const f = await fixture();
  const subagents = new SubagentService(f.repo, f.events, f.runs);
  cleanup.unshift(async () => {
    subagents.close();
  });
  await recallArticle(f, { parked: true });
  const parentId = "generated-message-parent",
    agentId = randomUUID(),
    groupId = randomUUID();
  f.repo.saveRun({
    runId: parentId,
    goal: "Original human request",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  const group = SubagentGroupSchema.parse({
    groupId,
    parentRunId: parentId,
    workspaceId: f.workspaceId,
    tokenBudget: 0,
    costBudgetUsd: 0,
    timeBudgetMs: 0,
    deadlineAt: 0,
    createdAt: 1,
    state: "active",
  });
  const agent = SubagentSchema.parse({
    agentId,
    groupId,
    sourceRunId: parentId,
    runId: "recall-run",
    goal: f.article.text,
    profile: "research",
    pageIds: [],
    tokenAllocation: 0,
    costAllocationUsd: 0,
    maxModelCalls: 0,
    createdAt: 1,
    state: "running",
  });
  f.repo.db
    .prepare(
      "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,?,?)",
    )
    .run(groupId, parentId, f.workspaceId, JSON.stringify(group), "active", 1);
  f.repo.db
    .prepare(
      "INSERT INTO subagents(agent_id,group_id,reserved_run_id,run_id,body,state,created_at) VALUES(?,?,?,?,?,?,?)",
    )
    .run(
      agentId,
      groupId,
      "recall-run",
      "recall-run",
      f.repo.protectRecordField("subagents", [agentId], "body", JSON.stringify(agent)),
      "running",
      1,
    );
  f.repo.saveRun({
    ...f.repo.getRun("recall-run")!,
    goal: f.article.text,
    config: { ...f.repo.getRun("recall-run")!.config, chatId: agentId },
  });
  const message = await subagents.sendMessage(
    agentId,
    "recall-run",
    `Check this saved article: ${f.article.text}`,
  );
  const journal = new SendJournal(f.repo.db, f.repo.columnCipher);
  const receipt = journal.messageStatus(message.messageId)!;
  expect(receipt.text).toContain(f.article.text);
  const copyPath = join(f.directory, "generated-followup.sqlite");
  await backup(f.repo.db, copyPath);
  const copy = new Repo(openDb(copyPath), f.repo.columnCipher);
  try {
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id) => {
        retireProtectedGeneratedTask(copy, id);
      },
    );
    expect(copy.getRunMessage(message.messageId)?.text).not.toContain(f.article.text);
    expect(new SendJournal(copy.db, copy.columnCipher).messageStatus(message.messageId)).toMatchObject({
      ...receipt,
      text: "Saved-article-derived task retired",
    });
  } finally {
    copy.close();
  }
  await f.memory.forget(f.workspaceId, f.article.memoryId, () =>
    f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
  );
  await f.runs.redactForgottenArticleOutputs(f.workspaceId);
  expect(f.repo.getRunMessage(message.messageId)).toMatchObject({
    status: "cancelled",
    text: "Saved-article-derived task retired",
  });
  expect(journal.messageStatus(message.messageId)).toMatchObject({
    ...receipt,
    text: "Saved-article-derived task retired",
  });
  expect(f.repo.getRun(parentId)?.goal).toBe("Original human request");
  expect(f.runs.messages.messageStatus(message.messageId)).toMatchObject({
    ...receipt,
    text: "Saved-article-derived task retired",
  });
  expect(() =>
    journal.queue({
      nonce: message.messageId,
      threadId: agentId,
      turnId: "recall-run",
      text: "Saved-article-derived task retired",
    }),
  ).toThrow(/Nonce belongs/);
});

it("joins actual child desktop Forget with a held parent read and retires only authenticated generated text", async () => {
  const f = await fixture();
  const subagents = new SubagentService(f.repo, f.events, f.runs);
  cleanup.unshift(async () => {
    subagents.close();
  });
  f.model.toolCallStep = vi.fn(async () => {
    const call = {
      toolCallId: randomUUID(),
      toolName: "ask_user_question",
      input: { question: "Keep waiting?" },
    };
    return {
      message: { role: "assistant" as const, content: [{ type: "tool-call" as const, ...call }] },
      toolCalls: [call],
      durationMs: 1,
      inputTokens: 1,
      outputTokens: 1,
      costUsd: 0,
    };
  });
  await f.runs.coordinator.start({
    runId: "desktop-child",
    goal: "Separate desktop reminder",
    pageIds: [],
    modelId: "fixture",
    contextWorkspaceId: f.workspaceId,
  });
  await vi.waitFor(() => expect(f.repo.getRun("desktop-child")?.status).toBe("needs_input"));
  const desktop = await desktopSource(f);
  const agentId = randomUUID(),
    groupId = randomUUID(),
    parentId = "original-desktop-parent";
  f.repo.saveRun({
    runId: parentId,
    goal: "Original human desktop request",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  f.repo.saveRun({
    runId: "unrelated-desktop",
    goal: "Unrelated human work",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  f.transcript.append("unrelated-desktop", [{ role: "user", content: "Unrelated human draft" }]);
  const group = SubagentGroupSchema.parse({
    groupId,
    parentRunId: parentId,
    workspaceId: f.workspaceId,
    tokenBudget: 0,
    costBudgetUsd: 0,
    timeBudgetMs: 0,
    deadlineAt: 0,
    createdAt: 1,
    state: "active",
  });
  const agent = SubagentSchema.parse({
    agentId,
    groupId,
    sourceRunId: parentId,
    runId: "desktop-child",
    goal: "Investigate Separate desktop reminder",
    profile: "research",
    pageIds: [],
    tokenAllocation: 0,
    costAllocationUsd: 0,
    maxModelCalls: 0,
    createdAt: 1,
    state: "running",
  });
  f.repo.db
    .prepare(
      "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,?,?)",
    )
    .run(groupId, parentId, f.workspaceId, JSON.stringify(group), "active", 1);
  f.repo.db
    .prepare(
      "INSERT INTO subagents(agent_id,group_id,reserved_run_id,run_id,body,state,created_at) VALUES(?,?,?,?,?,?,?)",
    )
    .run(
      agentId,
      groupId,
      "desktop-child",
      "desktop-child",
      f.repo.protectRecordField("subagents", [agentId], "body", JSON.stringify(agent)),
      "running",
      1,
    );
  const child = f.repo.getRun("desktop-child")!;
  f.repo.saveRun({
    ...child,
    status: "running",
    config: { ...child.config, chatId: agentId, nativeTurnContext: randomUUID() },
  });
  await desktop.sources.search(
    { queries: ["desktop reminder"], mode: "lexical" },
    { runId: "desktop-child", signal: new AbortController().signal, checkOwner: () => {} },
  );
  f.repo.saveRun({
    ...f.repo.getRun("desktop-child")!,
    status: "needs_input",
    config: { ...f.repo.getRun("desktop-child")!.config, nativeTurnContext: undefined },
  });
  const message = await subagents.sendMessage(
    agentId,
    "desktop-child",
    "Follow up Separate desktop reminder",
  );
  f.transcript.append("desktop-child", [{ role: "user", content: message.text }]);
  const journal = new SendJournal(f.repo.db, f.repo.columnCipher),
    receipt = journal.messageStatus(message.messageId)!;
  f.transcript.append(parentId, [
    { role: "user", content: "Original human desktop request" },
    { role: "assistant", content: [{ type: "text", text: "Separate desktop reminder" }] },
    { role: "user", content: "Keep my original human draft unsent." },
  ]);
  const invoices = f.repo.listModelCalls("desktop-child");
  expect(f.repo.getRun("desktop-child")?.config?.contextMemoryIds).toBeUndefined();
  expect(
    f.repo.db
      .prepare(
        "SELECT 1 FROM run_tool_calls WHERE run_id='desktop-child' AND tool_name IN ('memory_search','memory_read')",
      )
      .get(),
  ).toBeUndefined();
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((done) => {
      enter = done;
    }),
    gate = new Promise<void>((done) => {
      release = done;
    });
  let checks = 0;
  const read = f.runs
    .workTrace(parentId, undefined, async () => {
      if (++checks === 2) {
        enter();
        await gate;
      }
    })
    .then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
  await entered;
  let removed = false;
  const removal = desktop.service
    .forget(
      f.workspaceId,
      desktop.settings().revision,
      "test.editor",
      undefined,
      async () => {},
      "fixture-native-owner",
    )
    .then((value) => {
      removed = true;
      return value;
    });
  await new Promise<void>((done) => setImmediate(done));
  try {
    expect(removed).toBe(false);
    expect(await desktop.store.read(f.workspaceId)).toHaveLength(1);
  } finally {
    release();
  }
  expect(await read).toMatchObject({ error: { code: "cancelled" } });
  await removal;
  expect(await desktop.store.read(f.workspaceId)).toEqual([]);
  expect(f.repo.getRun(parentId)?.config?.desktopContextRetired).toBe(true);
  expect(f.repo.getRun(parentId)?.goal).toBe("Original human desktop request");
  expect(JSON.stringify(f.transcript.load(parentId))).toContain("Keep my original human draft unsent.");
  expect(JSON.stringify(f.transcript.load(parentId))).not.toContain("Separate desktop reminder");
  expect(f.repo.getRun("desktop-child")?.goal).toBe("Desktop-source-derived task retired");
  expect(JSON.stringify(f.transcript.load("desktop-child"))).not.toContain("Separate desktop reminder");
  expect(f.repo.getRunMessage(message.messageId)).toMatchObject({
    status: "cancelled",
    text: "Desktop-source-derived task retired",
  });
  expect(f.runs.messages.messageStatus(message.messageId)).toMatchObject({
    ...receipt,
    text: "Desktop-source-derived task retired",
  });
  expect(f.repo.listModelCalls("desktop-child")).toEqual(invoices);
  const body = f.repo.db.prepare("SELECT body FROM subagents WHERE agent_id=?").get(agentId) as {
    body: string;
  };
  expect(f.repo.revealRecordField("subagents", [agentId], "body", body.body)).not.toContain(
    "Separate desktop reminder",
  );
  expect(
    (await searchConversation(f.repo, { chatId: agentId, query: "desktop reminder", direction: "next" }))
      .matches,
  ).toBe(0);
  expect(f.repo.getRun("unrelated-desktop")?.config?.contextMemoryRevoked).toBeUndefined();
  expect(f.transcript.load("unrelated-desktop")).not.toEqual([]);
  const path = join(f.directory, "desktop-only-retired.sqlite");
  await backup(f.repo.db, path);
  const copy = new Repo(openDb(path), f.repo.columnCipher);
  try {
    const inspected = await inspectLegacyArticleHistory(
      copy,
      new TranscriptStore(copy.db, copy.columnCipher),
    );
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id, source) => {
        retireProtectedGeneratedTask(copy, id, source);
      },
      () => {
        inspected.check();
        return inspected.runIds;
      },
    );
    expect(copy.getRun("desktop-child")?.goal).toBe("Desktop-source-derived task retired");
    expect(copy.getRunMessage(message.messageId)?.text).toBe("Desktop-source-derived task retired");
    expect(new SendJournal(copy.db, copy.columnCipher).messageStatus(message.messageId)).toMatchObject({
      ...receipt,
      text: "Desktop-source-derived task retired",
    });
    expect(JSON.stringify(new TranscriptStore(copy.db, copy.columnCipher).load(parentId))).toContain(
      "Keep my original human draft unsent.",
    );
    expect(copy.listModelCalls("desktop-child")).toEqual(invoices);
  } finally {
    copy.close();
  }
});

it("refuses a held parent trace when a new authenticated child admits and echoes protected desktop evidence", async () => {
  const f = await fixture(),
    desktop = await desktopSource(f),
    parentId = "growing-parent";
  f.repo.saveRun({
    runId: parentId,
    goal: "Original human request",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  f.transcript.append(parentId, [{ role: "user", content: "Original human request" }]);
  const parent = f.repo.getRun(parentId)!;
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((done) => {
      enter = done;
    }),
    gate = new Promise<void>((done) => {
      release = done;
    });
  const read = f.runs
    .workTrace(parentId, undefined, async () => {
      enter();
      await gate;
    })
    .then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
  await entered;
  f.repo.saveRun({
    runId: "new-child",
    goal: "Inspect desktop",
    status: "running",
    pageIds: [],
    createdAt: 2,
    config: { contextWorkspaceId: f.workspaceId, nativeTurnContext: randomUUID() },
  });
  await desktop.sources.search(
    { queries: ["desktop reminder"], mode: "lexical" },
    { runId: "new-child", signal: new AbortController().signal, checkOwner: () => {} },
  );
  f.repo.saveRun({ ...f.repo.getRun("new-child")!, status: "completed" });
  const set = await f.sets.create({
    name: "New actual child",
    source: "urls",
    urls: ["https://article.test/new"],
  });
  setReceipt(f, set.setId, f.repo.listMembers(set.setId)[0]!.memberId, "new-child", parentId);
  f.transcript.append(parentId, [
    { role: "assistant", content: [{ type: "text", text: "Separate desktop reminder" }] },
  ]);
  expect(f.repo.getRun(parentId)?.config).toEqual(parent.config);
  release();
  expect(await read).toMatchObject({ error: { code: "permission_denied" } });
  expect(
    await f.runs.workTrace(parentId, undefined, async (id) => {
      expect(id).toBe(f.workspaceId);
    }),
  ).toMatchObject({ protectedWorkspaceId: f.workspaceId });
  f.repo.db.prepare("DELETE FROM set_run_members WHERE child_run_id='new-child'").run();
  await expect(
    desktop.service.forget(
      f.workspaceId,
      desktop.settings().revision,
      "test.editor",
      undefined,
      async () => {},
      "fixture-native-owner",
    ),
  ).rejects.toThrow(/receipt is unavailable/);
  expect(await desktop.store.read(f.workspaceId)).toHaveLength(1);
  setReceipt(f, set.setId, f.repo.listMembers(set.setId)[0]!.memberId, "new-child", parentId);
  for (const id of ["other-desktop-parent", "other-desktop-child"])
    f.repo.saveRun({
      runId: id,
      goal: "Unrelated execution of same Set",
      status: "completed",
      pageIds: [],
      createdAt: 3,
      config: { contextWorkspaceId: f.workspaceId },
    });
  setReceipt(
    f,
    set.setId,
    f.repo.listMembers(set.setId)[0]!.memberId,
    "other-desktop-child",
    "other-desktop-parent",
  );
  f.transcript.append("other-desktop-parent", [{ role: "user", content: "Unrelated execution draft" }]);
  await desktop.service.forget(
    f.workspaceId,
    desktop.settings().revision,
    "test.editor",
    undefined,
    async () => {},
    "fixture-native-owner",
  );
  expect(f.repo.getRun(parentId)?.config?.desktopContextRetired).toBe(true);
  expect(f.repo.getRun("other-desktop-parent")?.config?.contextMemoryRevoked).toBeUndefined();
  expect(f.repo.getRun("other-desktop-child")?.config?.contextMemoryRevoked).toBeUndefined();
  expect(JSON.stringify(f.transcript.load("other-desktop-parent"))).toContain("Unrelated execution draft");
});

it("retires active desktop-only output in the actual source-omitting portable backup while retaining human drafts", async () => {
  const f = await fixture(),
    desktop = await desktopSource(f),
    parentId = "active-desktop-parent",
    childId = "active-desktop-child";
  f.repo.saveRun({
    runId: parentId,
    goal: "Original human export request",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
  });
  f.repo.saveRun({
    runId: childId,
    goal: "Separate desktop reminder",
    status: "running",
    pageIds: [],
    createdAt: 2,
    config: { contextWorkspaceId: f.workspaceId, nativeTurnContext: randomUUID() },
  });
  const result = await desktop.sources.search(
    { queries: ["desktop reminder"], mode: "lexical" },
    { runId: childId, signal: new AbortController().signal, checkOwner: () => {} },
  );
  expect(result.items).toHaveLength(1);
  f.repo.saveRun({
    ...f.repo.getRun(childId)!,
    status: "completed",
    result: { report: "Separate desktop reminder" },
  });
  const set = await f.sets.create({
    name: "Actual desktop export family",
    source: "urls",
    urls: ["https://article.test/export"],
  });
  setReceipt(f, set.setId, f.repo.listMembers(set.setId)[0]!.memberId, childId, parentId);
  f.transcript.append(parentId, [
    { role: "user", content: "Original human export request" },
    { role: "assistant", content: [{ type: "text", text: "Separate desktop reminder" }] },
    { role: "user", content: "Keep this human export draft." },
  ]);
  f.transcript.append(childId, [
    { role: "user", content: "Inspect Separate desktop reminder" },
    { role: "assistant", content: [{ type: "text", text: "Separate desktop reminder" }] },
  ]);
  expect(f.repo.getRun(childId)?.config?.contextMemoryIds).toBeUndefined();
  f.repo.saveModelCall({
    callId: "active-export-invoice",
    runId: childId,
    role: "agent",
    modelId: "fixture",
    durationMs: 1,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    costEstimated: false,
    providerMetadata: { usage: { cachedInputTokens: 0 } },
    createdAt: 1,
  });
  const invoice = f.repo.listModelCalls(childId);
  f.repo.saveStep({
    stepId: "active-export-undo",
    runId: childId,
    op: "fill",
    pageId: "fixture-page",
    inputs: { ref: "field", value: "Original approved value" },
    startedAt: 1,
  });
  f.repo.db
    .prepare("INSERT INTO action_intents VALUES(?,?,?,?,?,?,?,?,?,?)")
    .run(
      "active-export-effect",
      "fixture-key",
      childId,
      "fixture-page",
      1,
      null,
      null,
      "uncertain",
      1,
      "Original reconciliation metadata",
    );
  const output = new ArtifactStore(join(f.directory, "artifacts"), f.repo, f.events).save({
    runId: childId,
    label: "desktop-generated.txt",
    buffer: Buffer.from("Separate desktop reminder"),
    mediaType: "text/plain",
  });
  const exported = await createRuntimeBackup(f.repo, f.directory);
  expect(exported.artifactFiles).toBe(0);
  const copy = new Repo(
    new DatabaseSync(join(exported.path, "state.sqlite"), { readOnly: true }),
    f.repo.columnCipher,
  );
  try {
    expect(copy.db.prepare("SELECT count(*) AS n FROM desktop_context_captures").get()).toEqual({ n: 0 });
    const copied = new TranscriptStore(copy.db, copy.columnCipher);
    expect(JSON.stringify(copied.load(parentId))).not.toContain("Separate desktop reminder");
    expect(JSON.stringify(copied.load(parentId))).toContain("Keep this human export draft.");
    expect(copy.getRun(childId)?.goal).toBe("Desktop-source-derived task retired");
    expect(copy.getRun(childId)?.result).toBeUndefined();
    expect(copied.load(childId)).toEqual([]);
    expect(copy.getRun(parentId)?.goal).toBe("Original human export request");
    expect(copy.getRun(parentId)?.config?.desktopContextRetired).toBe(true);
    expect(copy.listModelCalls(childId)).toEqual(invoice);
    expect(copy.db.prepare("SELECT op FROM steps WHERE step_id='active-export-undo'").get()).toEqual({
      op: "fill",
    });
    expect(
      copy.db.prepare("SELECT status FROM action_intents WHERE id='active-export-effect'").get(),
    ).toEqual({ status: "uncertain" });
    expect(copy.getArtifact(output.artifactId)).toBeUndefined();
  } finally {
    copy.close();
  }
  const restoredPath = join(f.directory, "restored-active-desktop.sqlite");
  await backup(f.repo.db, restoredPath);
  await stageRuntimeRestore(f.directory, exported.path, f.repo.columnCipher, f.pipeline);
  expect((await applyPendingRuntimeRestore(f.directory, restoredPath)).applied).toBe(true);
  const restored = new Repo(openDb(restoredPath), f.repo.columnCipher);
  try {
    expect(restored.getRun(childId)?.goal).toBe("Desktop-source-derived task retired");
    expect(restored.getRun(childId)?.config?.contextMemoryRevoked).toBe(true);
    expect(new TranscriptStore(restored.db, restored.columnCipher).load(childId)).toEqual([]);
    expect(JSON.stringify(new TranscriptStore(restored.db, restored.columnCipher).load(parentId))).toContain(
      "Keep this human export draft.",
    );
    expect(restored.listModelCalls(childId)).toEqual(invoice);
  } finally {
    restored.close();
  }
  expect(await desktop.store.read(f.workspaceId)).toHaveLength(1);
  expect(f.repo.getRun(parentId)?.config?.contextMemoryRevoked).toBeUndefined();
  expect(existsSync(output.path)).toBe(true);
  expect(f.repo.getRun(childId)?.goal).toBe("Separate desktop reminder");
});

it("retires legacy typed article output and extracted episode through the original Forget owner", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  f.repo.saveRun({
    runId: "legacy-episode",
    goal: "Original owner request",
    pageIds: [],
    status: "completed",
    createdAt: 1,
    config: { implementation: "agent-loop", contextWorkspaceId: f.workspaceId },
    result: { report: f.article.text },
  });
  const result = await f.pipeline.recall({
    workspaceId: f.workspaceId,
    queries: ["quartz workshop"],
    kinds: ["page"],
    mode: "lexical",
  });
  expect(result.matches).toHaveLength(1);
  f.repo.db
    .prepare("INSERT INTO run_tool_calls VALUES(?,?,?,?)")
    .run("legacy-episode", "legacy-search", "memory_search", 1);
  const call = {
    type: "tool-call" as const,
    toolCallId: "legacy-search",
    toolName: "memory_search",
    input: { queries: ["quartz workshop"], kinds: ["page"], mode: "lexical" },
  };
  f.transcript.append("legacy-episode", [
    { role: "user", content: "Original owner request" },
    { role: "assistant", content: [call] },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          output: { type: "json", value: result as never },
        },
      ],
    },
  ]);
  await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, "legacy-episode");
  expect(await f.pipeline.inbox(f.workspaceId)).toHaveLength(1);
  let proof: Awaited<ReturnType<RunService["retireArticleTransferSources"]>> | undefined;
  await f.memory.forget(f.workspaceId, f.article.memoryId, async () => {
    proof = await f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId);
    return proof;
  });
  await f.runs.redactForgottenArticleOutputs(f.workspaceId, proof);
  expect(await f.pipeline.inbox(f.workspaceId)).toHaveLength(0);
  expect(f.transcript.load("legacy-episode")).toEqual([]);
  expect(f.repo.getRun("legacy-episode")?.result).toBeUndefined();
});

async function legacyArticle(
  f: Awaited<ReturnType<typeof fixture>>,
  runId = "legacy-source",
  options: { read?: boolean; parked?: boolean; workspaceId?: string } = {},
) {
  const workspaceId = options.workspaceId ?? f.workspaceId;
  const search = await f.pipeline.recall({
    workspaceId,
    queries: ["quartz workshop"],
    kinds: ["page"],
    mode: "lexical",
  });
  const match = search.matches[0]!;
  const name = options.read ? "memory_read" : "memory_search";
  const input = options.read
    ? {
        sourceId: match.sourceId,
        revision: match.revision,
        sha256: match.sha256,
        startLine: 1,
        limitLines: 1,
      }
    : { queries: ["quartz workshop"], kinds: ["page"], mode: "lexical" };
  const output = options.read ? await f.pipeline.readSource({ ...input, workspaceId }) : search;
  f.repo.saveRun({
    runId,
    goal: "Original owner request",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    endedAt: Date.now(),
    config: { implementation: "agent-loop", contextWorkspaceId: workspaceId },
    result: { report: f.article.text },
  });
  const call = { type: "tool-call" as const, toolCallId: `call:${runId}`, toolName: name, input };
  f.repo.db.prepare("INSERT INTO run_tool_calls VALUES(?,?,?,?)").run(runId, call.toolCallId, name, 1);
  f.transcript.append(runId, [
    { role: "user", content: "Original owner request" },
    { role: "assistant", content: [call] },
  ]);
  if (options.parked)
    f.transcript.park(runId, {
      toolCallId: "pending-action",
      toolName: "act",
      pendingResults: [
        { toolCallId: call.toolCallId, toolName: name, output },
        { toolCallId: "pending-action", toolName: "act", parked: true },
      ],
    });
  else
    f.transcript.append(runId, [
      toolResultsMessage([{ toolCallId: call.toolCallId, toolName: name, output }]),
    ]);
  return { runId, call, input, output, match };
}
async function forgetLegacy(
  f: Awaited<ReturnType<typeof fixture>>,
  memoryId: string | undefined = f.article.memoryId,
) {
  let proof: Awaited<ReturnType<RunService["retireArticleTransferSources"]>> | undefined;
  const count = await f.memory.forget(f.workspaceId, memoryId, async () => {
    proof = await f.runs.retireArticleTransferSources(f.workspaceId, memoryId);
    return proof;
  });
  await f.runs.redactForgottenArticleOutputs(f.workspaceId, proof);
  return { count, proof };
}

it.each([false, true])(
  "recognizes only exact encrypted original search/read pairs (read=%s), without admission",
  async (read) => {
    const f = await fixture();
    const source = await legacyArticle(f, "original", { read });
    const before = f.repo.getRun(source.runId)!.config;
    const proof = await inspectLegacyArticleHistory(f.repo, f.transcript, {
      workspaceId: f.workspaceId,
      memoryId: f.article.memoryId,
    });
    expect([...proof.runIds]).toEqual([source.runId]);
    expect(proof.exposures[0]).toMatchObject({
      workspaceId: f.workspaceId,
      sourceId: `page:${f.article.memoryId}`,
      revision: source.match.revision,
      sha256: source.match.sha256,
    });
    expect(f.repo.getRun(source.runId)!.config).toEqual(before);
    expect(() => projectLegacyRecall(f.repo, f.transcript, source.runId)).toThrow("older chat");
    expect(() => f.transcript.forkPrefix(source.runId, f.repo)).toThrow("older chat");
    expect(f.transcript.load(source.runId)).toHaveLength(3);
  },
);
it("inspects parked successful results and retires them without executing the pending action", async () => {
  const f = await fixture();
  const source = await legacyArticle(f, "parked-legacy", { parked: true });
  expect((await inspectLegacyArticleHistory(f.repo, f.transcript)).runIds.has(source.runId)).toBe(true);
  expect(f.transcript.load(source.runId)).toHaveLength(2);
  await forgetLegacy(f);
  expect(f.transcript.openPark(source.runId)).toBeUndefined();
  expect(f.repo.db.prepare("SELECT count(*) AS n FROM action_intents").get()).toEqual({ n: 0 });
});
it("permits the identical completed park result once, but refuses a replaced result", async () => {
  const f = await fixture();
  const source = await legacyArticle(f, "resolved-park", { parked: true });
  f.transcript.append(source.runId, [
    toolResultsMessage([
      { toolCallId: source.call.toolCallId, toolName: source.call.toolName, output: source.output },
    ]),
  ]);
  expect((await inspectLegacyArticleHistory(f.repo, f.transcript)).runIds.has(source.runId)).toBe(true);
  f.transcript.append(source.runId, [
    toolResultsMessage([
      { toolCallId: source.call.toolCallId, toolName: source.call.toolName, output: source.output },
    ]),
  ]);
  await expect(forgetLegacy(f)).rejects.toThrow("duplicated or replaced");
  expect(await f.memory.get(f.workspaceId, f.article.memoryId)).not.toBeNull();
});
it.each(["ledger", "pair", "truncated", "wrong-read"])(
  "refuses incomplete legacy evidence before Forget changes sources: %s",
  async (defect) => {
    const f = await fixture();
    const source = await legacyArticle(f, "incomplete", { read: defect === "wrong-read" });
    if (defect === "ledger") f.repo.db.prepare("DELETE FROM run_tool_calls WHERE run_id=?").run(source.runId);
    if (defect === "pair")
      f.repo.db.prepare("DELETE FROM run_transcript WHERE run_id=? AND seq=1").run(source.runId);
    if (defect === "truncated") {
      f.repo.db.prepare("DELETE FROM run_transcript WHERE run_id=? AND seq=2").run(source.runId);
      f.transcript.append(source.runId, [
        toolResultsMessage([
          { toolCallId: source.call.toolCallId, toolName: source.call.toolName, output: "{truncated}" },
        ]),
      ]);
    }
    if (defect === "wrong-read") {
      f.repo.db.prepare("DELETE FROM run_transcript WHERE run_id=? AND seq=2").run(source.runId);
      f.transcript.append(source.runId, [
        toolResultsMessage([
          {
            toolCallId: source.call.toolCallId,
            toolName: source.call.toolName,
            output: { ...source.output, revision: "a".repeat(64) },
          },
        ]),
      ]);
    }
    const prior = await f.memory.get(f.workspaceId, f.article.memoryId);
    await expect(forgetLegacy(f)).rejects.toThrow("Legacy Memory retirement is unavailable");
    expect(await f.memory.get(f.workspaceId, f.article.memoryId)).toEqual(prior);
    expect(f.repo.getRun(source.runId)?.result).toBeDefined();
  },
);
it("keeps human text and another original Space outside article retirement", async () => {
  const f = await fixture();
  await legacyArticle(f);
  const other = new TaskService(f.repo, f.events).createWorkspace("Separate original Space").workspaceId;
  await f.memory.saveEligible({
    workspaceId: other,
    pageId: "other-space-page",
    documentEpoch: 1,
    url: "https://article.test/other-space",
    title: "Other Space workshop",
    text: f.article.text,
  });
  const foreign = await legacyArticle(f, "separate-space", { workspaceId: other });
  f.repo.saveRun({
    runId: "human-only",
    goal: f.article.text,
    pageIds: [],
    status: "completed",
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
    result: { report: "Independent human answer" },
  });
  f.transcript.append("human-only", [
    { role: "user", content: f.article.text },
    { role: "assistant", content: "Independent human answer" },
  ]);
  await forgetLegacy(f);
  expect(f.transcript.load(foreign.runId)).toHaveLength(3);
  expect(f.transcript.load("human-only")).toHaveLength(2);
  expect(f.repo.getRun("human-only")?.goal).toBe(f.article.text);
});
it("retires historical exposure after same-ID recapture and independent factor rotation", async () => {
  const f = await fixture();
  const original = await legacyArticle(f);
  const other = await f.memory.saveEligible({
    workspaceId: f.workspaceId,
    pageId: "other",
    documentEpoch: 1,
    url: "https://article.test/other",
    title: "Other article",
    text: "A separate synthetic article has no relationship to this conversation.",
  });
  await f.memory.forget(f.workspaceId, other.memoryId);
  const current = await f.memory.saveEligible({
    workspaceId: f.workspaceId,
    pageId: "source-page",
    documentEpoch: 2,
    url: f.article.url,
    title: "New capture",
    text: "The recaptured workshop changed to Friday.",
  });
  expect(current.memoryId).toBe(f.article.memoryId);
  const source = (
    await f.pipeline.recall({
      workspaceId: f.workspaceId,
      queries: ["Friday"],
      kinds: ["page"],
      mode: "lexical",
    })
  ).matches[0]!;
  expect(source.revision).not.toBe(original.match.revision);
  expect(source.sha256).not.toBe(original.match.sha256);
  await forgetLegacy(f);
  expect(f.transcript.load(original.runId)).toEqual([]);
  expect(f.repo.getRun(original.runId)?.config?.memoryRecallAdmissionVersion).toBeUndefined();
});
it("explicit zero-row Forget discovers legacy results while ordinary no-op cleanup stays scan-free", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  await f.memory.forget(f.workspaceId, f.article.memoryId);
  const scan = vi.spyOn(TranscriptStore.prototype, "retirementPages");
  await f.runs.redactForgottenArticleOutputs(f.workspaceId);
  expect(scan).not.toHaveBeenCalled();
  const outcome = await forgetLegacy(f);
  expect(outcome.count).toBe(0);
  expect(f.transcript.load(source.runId)).toEqual([]);
  await expect(f.runs.redactForgottenArticleOutputs(f.workspaceId, outcome.proof)).rejects.toThrow(
    "unavailable or uncommitted",
  );
  await forgetLegacy(f); // Durable old execution receipts are not mistaken for fresh unresolved outputs.
});
it("binds one-use proofs to their original operation and detects source/row replacement", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  const proof = await f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId);
  await expect(f.runs.redactForgottenArticleOutputs(f.workspaceId, proof)).rejects.toThrow(
    "unavailable or uncommitted",
  );
  f.transcript.append(source.runId, [{ role: "assistant", content: "A replacement row arrived." }]);
  await expect(f.memory.forget(f.workspaceId, f.article.memoryId, () => proof)).rejects.toThrow(
    "transcript changed",
  );
  expect(await f.memory.get(f.workspaceId, f.article.memoryId)).not.toBeNull();
  const sourceProof = await f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId);
  await f.memory.saveEligible({
    workspaceId: f.workspaceId,
    pageId: "source-page",
    documentEpoch: 3,
    url: f.article.url,
    title: "Replaced source",
    text: "The source changed during the owned operation.",
  });
  await expect(f.memory.forget(f.workspaceId, f.article.memoryId, () => sourceProof)).rejects.toThrow(
    "proof changed",
  );
  expect(await f.memory.get(f.workspaceId, f.article.memoryId)).not.toBeNull();
});
it("refuses oversized rows or cancelled inspection without changing any original row", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  const cancel = new AbortController();
  await expect(
    inspectLegacyArticleHistory(f.repo, f.transcript, {}, () => {
      cancel.abort();
      cancel.signal.throwIfAborted();
    }),
  ).rejects.toThrow();
  f.transcript.append(source.runId, [{ role: "user", content: "x".repeat(1024 * 1024) }]);
  await expect(forgetLegacy(f)).rejects.toThrow("bounded retirement inspection");
  expect(f.repo.getRun(source.runId)?.result).toBeDefined();
  expect(await f.memory.get(f.workspaceId, f.article.memoryId)).not.toBeNull();
});
it("preserves exact separately authored edits in inspectable tombstones, never in recall or Dream input", async () => {
  const consolidate = vi.fn(
    async (input: import("../../apps/runtime/dist/services/memory-dream.js").MemoryDreamInput) => {
      input.checkCurrent();
      return { status: "completed" as const, changes: [] };
    },
  );
  const f = await fixture({ generation: () => "fixture-dream", consolidate });
  f.pipeline.setPolicy(f.workspaceId, true);
  const source = await legacyArticle(f);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, source.runId, true);
  await f.pipeline.editDocuments({
    workspaceId: f.workspaceId,
    expectedGeneration: (await f.pipeline.documents(f.workspaceId)).generation,
    edits: [
      { claimId: claim.claimId, text: "My independent owner correction stays available for inspection." },
    ],
  });
  const original = (await f.pipeline.documents(f.workspaceId)).documents[0]!.claim.ownerEdit;
  const document = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://article.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Independent site instructions written by the owner.",
  });
  await forgetLegacy(f);
  const documents = await f.pipeline.documents(f.workspaceId);
  expect(documents.documents).toHaveLength(1);
  expect(documents.documents[0]!.claim).toMatchObject({
    claimId: claim.claimId,
    text: "Original source retired.",
    ownerEdit: original,
    sourceRetired: { at: expect.any(Number) },
  });
  expect(documents.documents[0]!.claim.source).toBeUndefined();
  expect((await f.pipeline.overview(f.workspaceId)).summary).not.toContain(original!.text);
  const recovered = await f.pipeline.recoverySnapshot();
  expect(JSON.stringify(recovered)).not.toContain("The quartz workshop meets");
  expect(
    recovered[0]!.searchIndex?.chunks.some((chunk) => JSON.stringify(chunk).includes(original!.text)),
  ).toBeFalsy();
  expect((await f.pipeline.documentList(f.workspaceId)).documents).toEqual([document.document]);
  expect(
    (
      await f.pipeline.recall({
        workspaceId: f.workspaceId,
        queries: ["owner correction"],
        kinds: ["episodic"],
        mode: "lexical",
      })
    ).matches,
  ).toEqual([]);
  await f.pipeline.consolidate(f.workspaceId);
  expect((await f.pipeline.documents(f.workspaceId)).documents[0]?.claim.ownerEdit).toEqual(original);
  await f.pipeline.dream(f.workspaceId);
  expect(consolidate).toHaveBeenCalledOnce();
  expect(JSON.stringify(consolidate.mock.calls[0]![0])).not.toContain(original!.text);
  expect((await f.pipeline.dreamActivity(f.workspaceId)).entries[0]?.sourceRunIds).toEqual([]);
  const destination = await fixture(undefined, undefined, "different-disposable-profile");
  destination.repo.db
    .prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES(?,?,?)")
    .run(f.workspaceId, "Restored owner Space", Date.now());
  await destination.pipeline.importRecoverySnapshot(recovered);
  expect((await destination.pipeline.documents(f.workspaceId)).documents[0]?.claim.ownerEdit).toEqual(
    original,
  );
  expect((await destination.pipeline.overview(f.workspaceId)).summary).not.toContain(original!.text);
  const restoredClaim = (await destination.pipeline.recoverySnapshot()).find(
    (space) => space.workspaceId === f.workspaceId,
  )!.claims[0]!;
  expect(restoredClaim.sourceRetired).toBeDefined();
  expect(restoredClaim.source).toBeUndefined();
  const cipher = (repo: Repo) =>
    repo.db
      .prepare("SELECT content FROM memory_files WHERE workspace_id=? AND name='claims.json.enc'")
      .get(f.workspaceId)?.content;
  expect(cipher(destination.repo)).not.toBe(cipher(f.repo));
  await f.pipeline.forget({ workspaceId: f.workspaceId, claimId: claim.claimId });
  expect((await f.pipeline.documents(f.workspaceId)).documents).toEqual([]);
});
it("portable copy and restore retire exact legacy branch drafts while preserving unrelated human drafts", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  // Reproduce the historical branch writer directly: current branch creation correctly refuses old Memory input.
  const branch = "old-article-draft";
  f.repo.createConversationDraft(branch, "Legacy branch", false);
  f.repo.setSetting(`conversationBranch:${branch}`, {
    sourceRunId: source.runId,
    sourceRunIds: [source.runId],
    mode: "branch",
    windowId: "original-window",
  });
  f.transcript.append(
    `conversation-branch:${branch}`,
    f.transcript.forkEntries(source.runId).map((entry) => entry.message),
  );
  f.repo.saveRun({
    runId: "consumed-old-branch",
    goal: "Separate owner follow-up",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    config: {
      implementation: "agent-loop",
      contextWorkspaceId: f.workspaceId,
      chatId: branch,
      branchSourceRunIds: [source.runId],
    },
    result: { report: f.article.text },
  });
  f.transcript.append("consumed-old-branch", [
    ...f.transcript.forkEntries(source.runId).map((entry) => entry.message),
    { role: "user", content: "Task: Separate owner follow-up" },
  ]);
  f.repo.saveRun({
    runId: "plain-source",
    goal: "Keep this original human request.",
    pageIds: [],
    status: "completed",
    createdAt: 1,
    config: { implementation: "agent-loop", contextWorkspaceId: f.workspaceId },
  });
  f.transcript.append("plain-source", [{ role: "user", content: "Keep this original human request." }]);
  const plain = await new ConversationBranches(f.repo).create(
    "plain-source",
    "branch",
    "original-window",
    async () => {},
  );
  const exported = await createRuntimeBackup(f.repo, f.directory);
  const copy = new Repo(
    new DatabaseSync(join(exported.path, "state.sqlite"), { readOnly: true }),
    f.repo.columnCipher,
  );
  try {
    expect(new TranscriptStore(copy.db, copy.columnCipher).load(source.runId)).toEqual([]);
    expect(new TranscriptStore(copy.db, copy.columnCipher).load("consumed-old-branch")).toEqual([]);
    expect(copy.getRun("consumed-old-branch")?.goal).toBe("Separate owner follow-up");
    expect(
      copy.db.prepare("SELECT 1 FROM run_transcript WHERE run_id=?").get(`conversation-branch:${branch}`),
    ).toBeUndefined();
    expect(copy.getSetting(`conversationBranch:${branch}`)).toMatchObject({ revoked: true });
    expect(
      new TranscriptStore(copy.db, copy.columnCipher).load(`conversation-branch:${plain.chatId}`),
    ).toHaveLength(1);
  } finally {
    copy.close();
  }
  const restoredPath = join(f.directory, "legacy-restored.sqlite");
  await backup(f.repo.db, restoredPath);
  await stageRuntimeRestore(f.directory, exported.path, f.repo.columnCipher, f.pipeline);
  await applyPendingRuntimeRestore(f.directory, restoredPath);
  const restored = new Repo(openDb(restoredPath), f.repo.columnCipher);
  try {
    expect(
      restored.db.prepare("SELECT 1 FROM run_transcript WHERE run_id=?").get(`conversation-branch:${branch}`),
    ).toBeUndefined();
    expect(restored.getSetting(`conversationBranch:${branch}`)).toMatchObject({ revoked: true });
    expect(new TranscriptStore(restored.db, restored.columnCipher).load("consumed-old-branch")).toEqual([]);
    expect(
      new TranscriptStore(restored.db, restored.columnCipher).load(`conversation-branch:${plain.chatId}`),
    ).toHaveLength(1);
  } finally {
    restored.close();
  }
  expect(f.transcript.load(source.runId)).toHaveLength(3);
  expect(f.transcript.load(`conversation-branch:${branch}`)).toHaveLength(3);
});
it("refuses a conflicting historical branch prefix before publishing any portable backup", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  f.repo.createConversationDraft("tampered-draft", "Draft", false);
  f.repo.setSetting("conversationBranch:tampered-draft", {
    sourceRunId: source.runId,
    sourceRunIds: [source.runId],
    mode: "branch",
    windowId: "original-window",
  });
  f.transcript.append("conversation-branch:tampered-draft", [
    { role: "user", content: "A different human request must never be guessed away." },
  ]);
  await expect(createRuntimeBackup(f.repo, f.directory)).rejects.toThrow("copied branch prefix changed");
  expect(f.transcript.load("conversation-branch:tampered-draft")).toHaveLength(1);
});

it("does not reuse another article's opaque proof or overwrite overlapping operation scope", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  const other = await f.memory.saveEligible({
    workspaceId: f.workspaceId,
    pageId: "other",
    documentEpoch: 1,
    url: "https://article.test/unrelated",
    title: "Other",
    text: "A separate article remains independent from this task.",
  });
  const first = await f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId);
  const second = await f.runs.retireArticleTransferSources(f.workspaceId, other.memoryId);
  await expect(f.memory.forget(f.workspaceId, other.memoryId, () => first)).rejects.toThrow("scope differs");
  expect(await f.memory.get(f.workspaceId, other.memoryId)).not.toBeNull();
  await f.memory.forget(f.workspaceId, f.article.memoryId, () => first);
  await f.runs.redactForgottenArticleOutputs(f.workspaceId, first);
  expect(f.transcript.load(source.runId)).toEqual([]);
  await expect(f.memory.forget(f.workspaceId, other.memoryId, () => second)).rejects.toThrow("proof changed");
  expect(await f.memory.get(f.workspaceId, other.memoryId)).not.toBeNull();
});
it("discovers only actually pruned legacy page exposures when the original prune owner opts in", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const source = await legacyArticle(f);
  await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, source.runId);
  f.repo.db.prepare("UPDATE content_memory SET expires_at=0 WHERE memory_id=?").run(f.article.memoryId);
  const pruned = await f.memory.prune();
  expect(pruned.workspaceIds).toEqual([f.workspaceId]);
  await f.runs.redactForgottenArticleOutputs(f.workspaceId, undefined, { discoverMissingLegacy: true });
  expect(f.transcript.load(source.runId)).toEqual([]);
  expect(await f.pipeline.inbox(f.workspaceId)).toEqual([]);
});

it("refuses original Space/model replacement during a yielded encrypted transcript scan", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  const other = new TaskService(f.repo, f.events).createWorkspace("Replacement Space").workspaceId;
  let checks = 0;
  await expect(
    inspectLegacyArticleHistory(f.repo, f.transcript, { workspaceId: f.workspaceId }, () => {
      if (++checks === 2) {
        const current = f.repo.getRun(source.runId)!;
        f.repo.saveRun({
          ...current,
          config: { ...current.config, contextWorkspaceId: other, modelId: "replacement-model" },
        });
      }
    }),
  ).rejects.toThrow("run scope changed during transcript paging");
  expect(await f.memory.get(f.workspaceId, f.article.memoryId)).not.toBeNull();
  expect(f.transcript.load(source.runId)).toHaveLength(3);
});
it("all-page Forget covers absent old captures in its original Space without clearing owner documents", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  const doc = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://article.test" },
    expectedGeneration: null,
    content: "Independent owner instructions.",
  });
  let proof: Awaited<ReturnType<RunService["retireArticleTransferSources"]>> | undefined;
  await f.memory.forget(
    f.workspaceId,
    undefined,
    async () => (proof = await f.runs.retireArticleTransferSources(f.workspaceId)),
  );
  await f.runs.redactForgottenArticleOutputs(f.workspaceId, proof);
  expect(f.transcript.load(source.runId)).toEqual([]);
  expect((await f.pipeline.documentList(f.workspaceId)).documents).toEqual([doc.document]);
});

it("blocks actual idle compaction and new branch creation before model dispatch for legacy Memory", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  await expect(
    f.runs.branch(source.runId, "branch", "original-window", async () => {}),
  ).rejects.toMatchObject({
    code: "conflict",
  });
  const generate = vi.spyOn(f.model, "generateText");
  const authorize = vi.fn(async () => {});
  const stats = f.runs.contextStats(source.runId);
  const queued = await f.runs.compactIdleContext(source.runId, stats.revision, {
    nativeTurnContext: "original-fixture-user",
    checkOwner: async () => {},
    authorize,
    route: {
      kind: "network",
      model: f.model,
      modelId: stats.modelId,
      provider: "gateway",
      destination: "https://ai-gateway.vercel.sh",
    },
  });
  expect(queued.compaction.status).toBe("queued");
  await vi.waitFor(() => expect(f.runs.contextStats(source.runId).compaction.status).toBe("failed"));
  expect(generate).not.toHaveBeenCalled();
  expect(authorize).not.toHaveBeenCalled();
  expect(f.repo.getRun(source.runId)?.config?.memoryRecallAdmissionVersion).toBeUndefined();
  expect(f.transcript.load(source.runId)).toHaveLength(3);
});

it("retires historical episodic search/read into a separate modern chat after original article Forget", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const original = await legacyArticle(f);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, original.runId, true);
  const independent = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://article.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Independent owner instructions for the site.",
  });
  await seedHistoricalEpisodicReceiver(f.repo, f.workspaceId, claim);
  const run = f.repo.getRun("recall-run")!;
  expect(run.config?.memoryRecallAdmissionVersion).toBe(1);
  expect(run.config?.contextMemoryRefs).toBeUndefined();
  expect(run.config?.contextRunIds).toBeUndefined();
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain(claim.claimId);
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain("The quartz workshop meets");
  const exported = await createRuntimeBackup(f.repo, f.directory);
  const destination = join(f.directory, "downstream-retired.sqlite");
  await backup(f.repo.db, destination);
  await stageRuntimeRestore(f.directory, exported.path, f.repo.columnCipher, f.pipeline);
  await applyPendingRuntimeRestore(f.directory, destination);
  const restored = new Repo(openDb(destination), f.repo.columnCipher);
  const restoredPipeline = new MemoryPipeline(
    restored,
    f.native,
    "recall-provenance",
    fixtureMemoryExtractor,
  );
  try {
    expect(new TranscriptStore(restored.db, restored.columnCipher).load("recall-run")).toEqual([]);
    expect(new TranscriptStore(restored.db, restored.columnCipher).load(original.runId)).toEqual([]);
    expect(restored.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
    expect(restored.getRun(original.runId)?.goal).toBe("Original owner request");
    expect((await restoredPipeline.documentList(f.workspaceId)).documents).toEqual([independent.document]);
  } finally {
    await restoredPipeline.close();
    restored.close();
  }
  expect(f.transcript.load("recall-run")).not.toEqual([]);
  await forgetLegacy(f);
  expect(await f.pipeline.claims(f.workspaceId)).toEqual([]);
  expect(f.transcript.load("recall-run")).toEqual([]);
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
  expect(() => f.runs.contextStats("recall-run")).toThrow("retired by Forget");
});

it("aborts and joins the original held modern Memory read before inspecting and forgetting its admitted article", async () => {
  let enter!: () => void, release!: () => void, signal: AbortSignal | undefined;
  const entered = new Promise<void>((done) => (enter = done)),
    gate = new Promise<void>((done) => (release = done));
  const f = await fixture(undefined, async (original) => {
    signal = original;
    enter();
    await gate;
    original.throwIfAborted();
  });
  const running = recallArticle(f, { expectedStatus: "cancelled" });
  await entered;
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryIds).toEqual([f.article.memoryId]);
  const removal = forgetLegacy(f);
  await vi.waitFor(() => expect(signal?.aborted).toBe(true));
  expect(await f.memory.get(f.workspaceId, f.article.memoryId)).not.toBeNull();
  release();
  await removal;
  await running;
  expect(f.transcript.load("recall-run")).toEqual([]);
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
  expect(f.repo.db.prepare("SELECT count(*) AS n FROM action_intents").get()).toEqual({ n: 0 });
});
it("exports fully retired consumed branches without replay and refuses retained partial branch ciphertext", async () => {
  const f = await fixture();
  const original = await legacyArticle(f);
  const chatId = "retired-consumed";
  f.repo.createConversationDraft(chatId, "Old branch", false);
  f.repo.setSetting(`conversationBranch:${chatId}`, {
    sourceRunId: original.runId,
    sourceRunIds: [original.runId],
    mode: "branch",
    windowId: "original-window",
  });
  f.repo.saveRun({
    runId: "retired-branch",
    goal: "Keep this original owner follow-up",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    config: {
      implementation: "agent-loop",
      contextWorkspaceId: f.workspaceId,
      chatId,
      branchSourceRunIds: [original.runId],
    },
    result: { report: f.article.text },
  });
  f.transcript.append("retired-branch", [
    ...f.transcript.load(original.runId),
    { role: "user", content: "Task: Keep this original owner follow-up" },
  ]);
  await forgetLegacy(f);
  expect(f.transcript.load("retired-branch")).toEqual([]);
  expect(f.repo.getRun("retired-branch")?.goal).toBe("Keep this original owner follow-up");
  const exported = await createRuntimeBackup(f.repo, f.directory);
  expect(existsSync(join(exported.path, "state.sqlite"))).toBe(true);
  f.transcript.append("retired-branch", [
    { role: "user", content: "Partial retained history is not certified clean." },
  ]);
  await expect(createRuntimeBackup(f.repo, f.directory)).rejects.toThrow("partially retired branch history");
  expect(f.transcript.load("retired-branch")).toHaveLength(1);
});

it("preserves anomalous owner document content with retired provenance and supports ordinary explicit reaffirmation", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const original = await legacyArticle(f);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, original.runId, true);
  const created = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://article.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Exact separate owner instructions must remain inspectable.",
  });
  const store = new SpaceMemoryStore(f.repo, f.native, "recall-provenance");
  const current = await store.read(f.workspaceId);
  const anomalous = {
    ...created.document!,
    sourceRefs: [
      { claimId: claim.claimId, sourceRunId: original.runId, quoteSha256: claim.source!.quoteSha256 },
    ],
  };
  current.files.set("documents.json.enc", JSON.stringify([anomalous]));
  await store.write(f.workspaceId, current.files, current.history, current.prior);
  await forgetLegacy(f);
  const after = await f.pipeline.documentList(f.workspaceId),
    retained = after.documents[0]!;
  expect(retained).toMatchObject({
    ...created.document,
    sourceRefs: [],
    sourceRetired: { at: expect.any(Number) },
  });
  expect(
    (
      await f.pipeline.recall({
        workspaceId: f.workspaceId,
        queries: ["separate owner instructions"],
        kinds: ["site"],
        mode: "lexical",
      })
    ).matches,
  ).toEqual([]);
  const reaffirmed = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    documentId: retained.documentId,
    target: retained.target,
    expectedGeneration: after.generation,
    expectedRevision: retained.revision,
    content: retained.content,
  });
  expect(reaffirmed.document?.sourceRetired).toBeUndefined();
  expect(reaffirmed.document?.content).toBe(retained.content);
  expect(
    (
      await f.pipeline.recall({
        workspaceId: f.workspaceId,
        queries: ["separate owner instructions"],
        kinds: ["site"],
        mode: "lexical",
      })
    ).matches,
  ).toHaveLength(1);
});
it("keeps legacy model-reset diagnostics out of sanitized public API error fields", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  let refusal: unknown;
  try {
    projectLegacyRecall(f.repo, f.transcript, source.runId);
  } catch (error) {
    refusal = error;
  }
  expect(refusal).toMatchObject({ code: "conflict", detail: { contextResetRequired: true } });
  const wire = toErrorPayload(refusal);
  expect(wire.code).toBe("conflict");
  expect(wire.detail).toBeUndefined();
  expect(wire.message).not.toContain("Use New Chat");
});

it("retires historical typed episodic receivers after authenticated family expansion in live Forget and portable restore", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const child = await legacyArticle(f, "family-article-child");
  const parentId = "family-report-parent";
  f.repo.saveRun({
    runId: parentId,
    goal: "Original human family task",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    endedAt: Date.now(),
    config: {
      implementation: "agent-loop",
      contextWorkspaceId: f.workspaceId,
      memoryRecallAdmissionVersion: 1,
    },
    result: { report: f.article.text },
  });
  const set = await f.sets.create({ name: "Review family", source: "urls", urls: [f.article.url] });
  setReceipt(f, set.setId, f.repo.listMembers(set.setId)[0]!.memberId, child.runId, parentId);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, parentId, true);
  expect(claim.sourceRunId).toBe(parentId);
  const ownerDocument = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://independent.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Independent owner instructions stay unchanged.",
  });
  for (const id of ["independent-family-parent", "independent-family-child"])
    f.repo.saveRun({
      runId: id,
      goal: "Independent original human task",
      pageIds: [],
      status: "completed",
      createdAt: Date.now(),
      endedAt: Date.now(),
      config: {
        implementation: "agent-loop",
        contextWorkspaceId: f.workspaceId,
        memoryRecallAdmissionVersion: 1,
      },
      result: { report: "Independent family report." },
    });
  const independentSet = await f.sets.create({
    name: "Independent family",
    source: "urls",
    urls: ["https://independent.test"],
  });
  setReceipt(
    f,
    independentSet.setId,
    f.repo.listMembers(independentSet.setId)[0]!.memberId,
    "independent-family-child",
    "independent-family-parent",
  );
  f.transcript.append("independent-family-parent", [
    { role: "user", content: "Preserve unrelated human history." },
  ]);
  await seedHistoricalEpisodicReceiver(f.repo, f.workspaceId, claim);
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryIds).toBeUndefined();
  expect(f.repo.getRun("recall-run")?.config?.contextRunIds).toBeUndefined();
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain(claim.claimId);
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain(f.article.text);
  const exported = await createRuntimeBackup(f.repo, f.directory);
  const destination = join(f.directory, "family-receiver-retired.sqlite");
  await backup(f.repo.db, destination);
  await stageRuntimeRestore(f.directory, exported.path, f.repo.columnCipher, f.pipeline);
  await applyPendingRuntimeRestore(f.directory, destination);
  const restored = new Repo(openDb(destination), f.repo.columnCipher);
  const restoredPipeline = new MemoryPipeline(
    restored,
    f.native,
    "recall-provenance",
    fixtureMemoryExtractor,
  );
  try {
    const transcript = new TranscriptStore(restored.db, restored.columnCipher);
    expect(transcript.load("recall-run")).toEqual([]);
    expect(transcript.load(parentId)).toEqual([]);
    expect(transcript.load(child.runId)).toEqual([]);
    expect(restored.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
    expect(restored.getRun(parentId)?.goal).toBe("Original human family task");
    expect(restored.getRun("recall-run")?.config?.desktopContextRetired).toBeUndefined();
    expect(restored.getRun(parentId)?.config?.desktopContextRetired).toBeUndefined();
    expect(transcript.load("independent-family-parent")).toEqual([
      { role: "user", content: "Preserve unrelated human history." },
    ]);
    expect(restored.getRun("independent-family-child")?.result?.report).toBe("Independent family report.");
    expect((await restoredPipeline.documentList(f.workspaceId)).documents).toEqual([ownerDocument.document]);
  } finally {
    await restoredPipeline.close();
    restored.close();
  }
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain(f.article.text);
  await forgetLegacy(f);
  expect(f.transcript.load(child.runId)).toEqual([]);
  expect(f.transcript.load(parentId)).toEqual([]);
  expect(await f.pipeline.claims(f.workspaceId)).toEqual([]);
  expect(f.transcript.load("recall-run")).toEqual([]);
  expect(f.repo.getRun("recall-run")?.config?.contextMemoryRevoked).toBe(true);
  expect(f.transcript.load("independent-family-parent")).toEqual([
    { role: "user", content: "Preserve unrelated human history." },
  ]);
  expect(f.repo.getRun("independent-family-child")?.result?.report).toBe("Independent family report.");
  expect((await f.pipeline.documentList(f.workspaceId)).documents).toEqual([ownerDocument.document]);
  expect(() => f.runs.contextStats("recall-run")).toThrow("retired by Forget");
});

async function restoreMemoryFixture() {
  const f = await fixture();
  await f.pipeline.setPolicy(f.workspaceId, true);
  const original = await legacyArticle(f);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, original.runId, true);
  await seedHistoricalEpisodicReceiver(f.repo, f.workspaceId, claim);
  const exported = await createRuntimeBackup(f.repo, f.directory);
  const destination = join(f.directory, "aux-state.sqlite");
  await backup(f.repo.db, destination);
  const storage = new SpaceMemoryStore(f.repo, f.native, "recall-provenance");
  const prior = storage.generation(f.workspaceId)!;
  const priorFactor = (await f.native.readSecret(prior.keyName)).value;
  return { ...f, original, claim, exported, destination, prior, priorFactor };
}

it("ordinary restore detaches source-retired Memory without touching live factors, then finalizes actual applied generations", async () => {
  const f = await restoreMemoryFixture();
  const other = new TaskService(f.repo, f.events).createWorkspace("Independent current Space").workspaceId;
  await f.pipeline.documentSet({
    workspaceId: other,
    target: { kind: "site", origin: "https://independent.test" },
    expectedGeneration: null,
    content: "Owner instructions created after the older backup remain exact.",
  });
  rmSync(f.destination);
  await backup(f.repo.db, f.destination);
  const independentBefore = currentSpaceMemory(f.repo.db).files.filter((row) => row.workspace_id === other);
  const currentBefore = spaceMemoryDigest(currentSpaceMemory(f.repo.db));
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const transition = memoryRestoreTransition(f.repo)!;
  expect(transition).toMatchObject({
    role: "source",
    phase: "ready",
    spaces: [{ workspaceId: f.workspaceId, prior: f.prior }],
  });
  const prepared = transition.spaces[0]!;
  expect(prepared.next.generation).not.toBe(f.prior.generation);
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  expect((await f.native.readSecret(prepared.next.keyName)).value).toBeTruthy();
  expect(spaceMemoryDigest(currentSpaceMemory(f.repo.db))).toBe(currentBefore);
  expect(JSON.stringify(await f.pipeline.recoverySnapshot())).toContain("The quartz workshop meets");
  await applyPendingRuntimeRestore(f.directory, f.destination);
  const restored = new Repo(openDb(f.destination), f.repo.columnCipher);
  const pipeline = new MemoryPipeline(restored, f.native, "recall-provenance", fixtureMemoryExtractor);
  try {
    expect(memoryRestoreTransition(restored)?.role).toBe("destination");
    await new SpaceMemoryRestore(restored, f.native, "recall-provenance", f.directory).startup();
    expect(memoryRestoreTransition(restored)).toBeUndefined();
    expect((await f.native.readSecret(f.prior.keyName)).value).toBeFalsy();
    expect((await f.native.readSecret(prepared.next.keyName)).value).toBeTruthy();
    expect(JSON.stringify(await pipeline.recoverySnapshot())).not.toContain("The quartz workshop meets");
    expect(currentSpaceMemory(restored.db).files.filter((row) => row.workspace_id === other)).toEqual(
      independentBefore,
    );
    expect(new TranscriptStore(restored.db, restored.columnCipher).load("recall-run")).toEqual([]);
    expect((await pipeline.documentList(other)).documents[0]?.content).toContain("after the older backup");
  } finally {
    await pipeline.close();
    restored.close();
  }
});

it("ordinary restore Cancel removes only original detached factors and retains exact live Memory", async () => {
  const f = await restoreMemoryFixture();
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const next = memoryRestoreTransition(f.repo)!.spaces[0]!.next;
  await cancelRuntimeRestore(f.directory, f.pipeline);
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
  expect((await f.native.readSecret(next.keyName)).value).toBeFalsy();
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  expect(JSON.stringify(await f.pipeline.recoverySnapshot())).toContain("The quartz workshop meets");
  expect(existsSync(join(f.directory, "pending-runtime-restore.sqlite"))).toBe(false);
});

it("ordinary restore joins a held original detached write before article Forget acknowledges and cleans late key bytes", async () => {
  const f = await restoreMemoryFixture();
  const store = f.native.storeSecret.bind(f.native);
  let entered!: () => void, release!: () => void;
  const held = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let nextKey: string | undefined;
  vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
    if (!nextKey && key.startsWith("mem_") && key !== f.prior.keyName && value) {
      nextKey = key;
      entered();
      await gate;
    }
    return store(key, value);
  });
  const staged = stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline).then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await held;
  let acknowledged = false;
  const removal = f.memory
    .forget(f.workspaceId, f.article.memoryId, () =>
      f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
    )
    .then((result) => {
      acknowledged = true;
      return result;
    });
  await new Promise<void>((resolve) => setImmediate(resolve));
  expect(acknowledged).toBe(false);
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
  ).toBeDefined();
  release();
  expect(await staged).toHaveProperty("error");
  await removal;
  expect(acknowledged).toBe(true);
  expect(nextKey).toBeDefined();
  expect((await f.native.readSecret(nextKey!)).value).toBeFalsy();
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
});

it.each(["before", "after"] as const)(
  "ordinary restore records key ownership before detached allocation and cleans a %s-store failure",
  async (timing) => {
    const f = await restoreMemoryFixture();
    const store = f.native.storeSecret.bind(f.native);
    let allocated: string | undefined;
    let writes = 0;
    let plannedBeforeStore = false;
    vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
      if (value && key.startsWith("mem_") && key !== f.prior.keyName) {
        allocated = key;
        writes++;
        plannedBeforeStore =
          memoryRestoreTransition(f.repo)?.spaces.some((item) => item.next.keyName === key) ?? false;
        if (timing === "after") await store(key, value);
        throw new Error("Synthetic detached native store failure");
      }
      return store(key, value);
    });
    await expect(
      stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline),
    ).rejects.toThrow("Synthetic detached native store failure");
    expect(writes).toBe(1);
    expect(plannedBeforeStore).toBe(true);
    expect(allocated).toBeDefined();
    expect((await f.native.readSecret(allocated!)).value).toBeFalsy();
    expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
    expect(memoryRestoreTransition(f.repo)).toBeUndefined();
  },
);

it("ordinary restore retains exact cleanup debt and refuses source Forget when detached erasure is uncertain", async () => {
  const f = await restoreMemoryFixture();
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const next = memoryRestoreTransition(f.repo)!.spaces[0]!.next;
  const store = f.native.storeSecret.bind(f.native);
  const failure = vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
    if (key === next.keyName && !value) throw new Error("Synthetic detached erase refusal");
    return store(key, value);
  });
  await expect(
    f.memory.forget(f.workspaceId, f.article.memoryId, () =>
      f.runs.retireArticleTransferSources(f.workspaceId, f.article.memoryId),
    ),
  ).rejects.toThrow("Synthetic detached erase refusal");
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
  ).toBeDefined();
  expect(memoryRestoreTransition(f.repo)?.spaces[0]?.next).toEqual(next);
  expect((await f.native.readSecret(next.keyName)).value).toBeTruthy();
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  failure.mockRestore();
  await cancelRuntimeRestore(f.directory, f.pipeline);
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
  expect((await f.native.readSecret(next.keyName)).value).toBeFalsy();
});

async function appliedMemoryFixture() {
  const f = await restoreMemoryFixture();
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const next = memoryRestoreTransition(f.repo)!.spaces[0]!.next;
  await applyPendingRuntimeRestore(f.directory, f.destination);
  const restored = new Repo(openDb(f.destination), f.repo.columnCipher);
  cleanup.push(async () => restored.close());
  return {
    ...f,
    next,
    restored,
    owner: new SpaceMemoryRestore(restored, f.native, "recall-provenance", f.directory),
  };
}

it.each(["before", "after"] as const)(
  "ordinary restore finalization preserves applied generation after a %s-erase acknowledgement failure",
  async (timing) => {
    const f = await appliedMemoryFixture();
    const store = f.native.storeSecret.bind(f.native);
    const failure = vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
      if (key === f.prior.keyName && !value) {
        if (timing === "after") await store(key, value);
        throw new Error("Synthetic old-key erase acknowledgement failure");
      }
      return store(key, value);
    });
    const first = await f.owner.startup().then(
      () => undefined,
      (error: unknown) => String(error),
    );
    expect(first).toBe(
      timing === "before" ? "Error: Synthetic old-key erase acknowledgement failure" : undefined,
    );
    expect(memoryRestoreTransition(f.restored)?.role).toBe(timing === "before" ? "destination" : undefined);
    expect(Boolean((await f.native.readSecret(f.prior.keyName)).value)).toBe(timing === "before");
    if (timing === "before") {
      failure.mockRestore();
      await f.owner.startup();
    }
    expect(memoryRestoreTransition(f.restored)).toBeUndefined();
    expect((await f.native.readSecret(f.prior.keyName)).value).toBeFalsy();
    expect((await f.native.readSecret(f.next.keyName)).value).toBeTruthy();
    const state = await new SpaceMemoryStore(f.restored, f.native, "recall-provenance").read(f.workspaceId);
    expect(JSON.stringify([...state.files])).not.toContain("The quartz workshop meets");
  },
);

it("ordinary restore refuses Cancel of the actual newly active factor before startup finalization", async () => {
  const f = await appliedMemoryFixture();
  const restoredPipeline = new MemoryPipeline(f.restored, f.native, "recall-provenance");
  try {
    await expect(cancelRuntimeRestore(f.directory, restoredPipeline)).rejects.toThrow(
      "original Space memory restore owner changed",
    );
    expect((await f.native.readSecret(f.next.keyName)).value).toBeTruthy();
    await f.owner.startup();
  } finally {
    await restoredPipeline.close();
  }
});

it("ordinary restore discards the original preparing generation after an actual protected database reopen", async () => {
  const f = await restoreMemoryFixture();
  const name = `pending-runtime-restore.sqlite.${randomUUID()}.tmp`;
  const artifacts = `pending-runtime-restore-artifacts.${randomUUID()}.tmp`;
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(f.directory, artifacts));
  await backup(f.repo.db, join(f.directory, name));
  const source = spaceMemoryDigest(currentSpaceMemory(f.repo.db));
  const owner = new SpaceMemoryRestore(f.repo, f.native, "recall-provenance", f.directory);
  const operation = owner.begin(
    source,
    digest("original explicit fixture source ownership"),
    name,
    artifacts,
  );
  const store = new SpaceMemoryStore(f.repo, f.native, "recall-provenance");
  const current = await store.read(f.workspaceId);
  const prepared = await store.prepareDetached(
    f.workspaceId,
    current.files,
    current.history,
    (next) => owner.plan(operation, next, f.prior, memoryLogicalDigest(current.files, current.history)),
    () => expect(spaceMemoryDigest(currentSpaceMemory(f.repo.db))).toBe(source),
  );
  expect(memoryRestoreTransition(f.repo)?.phase).toBe("preparing");
  rmSync(f.destination);
  await backup(f.repo.db, f.destination);
  const reopened = new Repo(openDb(f.destination), f.repo.columnCipher);
  try {
    await new SpaceMemoryRestore(reopened, f.native, "recall-provenance", f.directory).startup();
    expect(memoryRestoreTransition(reopened)).toBeUndefined();
    expect((await f.native.readSecret(prepared.keyName)).value).toBeFalsy();
    expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
    expect(existsSync(join(f.directory, name))).toBe(false);
  } finally {
    reopened.close();
  }
});

it("ordinary restore preserves existing retired owner tombstones and unrelated owner documents without allocating another factor", async () => {
  const f = await restoreMemoryFixture();
  await f.pipeline.editDocuments({
    workspaceId: f.workspaceId,
    expectedGeneration: (await f.pipeline.documents(f.workspaceId)).generation,
    edits: [{ claimId: f.claim.claimId, text: "My separate owner correction remains exact for inspection." }],
  });
  await forgetLegacy(f);
  await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://owner.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Independent owner authored instructions.",
  });
  const state = await f.pipeline.recoverySnapshot();
  const before = currentSpaceMemory(f.repo.db);
  const prior = new SpaceMemoryStore(f.repo, f.native, "recall-provenance").generation(f.workspaceId)!;
  const key = (await f.native.readSecret(prior.keyName)).value;
  rmSync(f.destination);
  await backup(f.repo.db, f.destination);
  const calls = vi.spyOn(f.native, "storeSecret");
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  expect(memoryRestoreTransition(f.repo)?.spaces).toEqual([]);
  expect(calls.mock.calls.filter(([name, value]) => name.startsWith("mem_") && value)).toEqual([]);
  expect(currentSpaceMemory(f.repo.db)).toEqual(before);
  const staged = new Repo(
    new DatabaseSync(join(f.directory, "pending-runtime-restore.sqlite"), { readOnly: true }),
    f.repo.columnCipher,
  );
  const pipeline = new MemoryPipeline(staged, f.native, "recall-provenance");
  try {
    expect(await pipeline.recoverySnapshot()).toEqual(state);
  } finally {
    await pipeline.close();
    staged.close();
  }
  await cancelRuntimeRestore(f.directory, f.pipeline);
  expect((await f.native.readSecret(prior.keyName)).value).toBe(key);
});

it("ordinary restore records only actually retired sources per Space without overflowing unrelated near-cap history", async () => {
  const f = await restoreMemoryFixture();
  const other = new TaskService(f.repo, f.events).createWorkspace("Unrelated Space").workspaceId;
  await f.pipeline.documentSet({
    workspaceId: other,
    target: { kind: "site", origin: "https://owner.test" },
    expectedGeneration: null,
    content: "Independent untouched owner document in another Space.",
  });
  f.repo.saveRun({
    runId: "independent-research",
    status: "completed",
    pageIds: [],
    goal: "Independent research",
    createdAt: Date.now(),
    endedAt: Date.now(),
    config: { contextWorkspaceId: f.workspaceId },
    result: { report: "The independent planning review happens on Friday mornings in the west building." },
  });
  await f.pipeline.extractRun(f.workspaceId, "independent-research");
  const pending = (await f.pipeline.inbox(f.workspaceId)).find(
    (item) => item.sourceRunId === "independent-research",
  )!;
  await f.pipeline.review(f.workspaceId, pending.claimId, "accept");
  const store = new SpaceMemoryStore(f.repo, f.native, "recall-provenance");
  const current = await store.read(f.workspaceId);
  const hashes = Array.from({ length: 4999 }, (_, index) =>
    digest(`unrelated historical retirement ${index}`),
  );
  current.files.set("retired-sources.json.enc", JSON.stringify({ before: 0, sourceHashes: hashes }));
  await store.write(f.workspaceId, current.files, current.history, current.prior);
  const chosen = await createRuntimeBackup(f.repo, f.directory);
  rmSync(f.destination);
  await backup(f.repo.db, f.destination);
  const otherBefore = currentSpaceMemory(f.repo.db).files.filter((row) => row.workspace_id === other);
  const watermarks = f.repo.db
    .prepare("SELECT * FROM memory_pipeline_watermarks WHERE workspace_id=? ORDER BY run_id")
    .all(other);
  await stageRuntimeRestore(f.directory, chosen.path, f.repo.columnCipher, f.pipeline);
  const restoredCopy = new Repo(
    new DatabaseSync(join(f.directory, "pending-runtime-restore.sqlite")),
    f.repo.columnCipher,
  );
  const projected = new MemoryPipeline(restoredCopy, f.native, "recall-provenance");
  try {
    const state = (await projected.recoverySnapshot()).find((item) => item.workspaceId === f.workspaceId)!;
    expect(state.retiredSources).toEqual({ before: 0, sourceHashes: [...hashes, digest(f.original.runId)] });
    expect(currentSpaceMemory(restoredCopy.db).files.filter((row) => row.workspace_id === other)).toEqual(
      otherBefore,
    );
    expect(
      restoredCopy.db
        .prepare("SELECT * FROM memory_pipeline_watermarks WHERE workspace_id=? ORDER BY run_id")
        .all(other),
    ).toEqual(watermarks);
    expect(
      restoredCopy.db
        .prepare("SELECT 1 FROM memory_pipeline_watermarks WHERE workspace_id=? AND run_id='recall-run'")
        .get(f.workspaceId),
    ).toBeUndefined();
    expect(
      (
        await projected.recall({
          workspaceId: f.workspaceId,
          queries: ["independent planning review"],
          kinds: ["episodic"],
          mode: "lexical",
        })
      ).matches,
    ).toEqual([expect.objectContaining({ sourceId: `claim:${pending.claimId}` })]);
  } finally {
    await projected.close();
    restoredCopy.close();
  }
  await cancelRuntimeRestore(f.directory, f.pipeline);
});

it("ordinary restore commits actual WAL metadata under scoped FULL durability before native allocation and restores the connection mode", async () => {
  const f = await restoreMemoryFixture();
  const disk = new Repo(openDb(f.destination), f.repo.columnCipher);
  const pipeline = new MemoryPipeline(disk, f.native, "recall-provenance");
  try {
    expect(disk.db.prepare("PRAGMA journal_mode").get()).toEqual({ journal_mode: "wal" });
    disk.db
      .exec(`CREATE TABLE restore_durability_probe(mode INTEGER); CREATE TRIGGER capture_restore_durability BEFORE INSERT ON aux_meta
      WHEN NEW.key='space_memory_restore_v1' BEGIN INSERT INTO restore_durability_probe SELECT synchronous FROM pragma_synchronous; END`);
    const prior = disk.db.prepare("PRAGMA synchronous").get();
    const native = f.native.storeSecret.bind(f.native);
    const allocations: { transaction: boolean; mode: unknown; modes: unknown[]; planned: boolean }[] = [];
    const writes = vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
      if (key.startsWith("mem_") && key !== f.prior.keyName && value)
        allocations.push({
          transaction: disk.db.isTransaction,
          mode: disk.db.prepare("PRAGMA synchronous").get(),
          modes: disk.db.prepare("SELECT mode FROM restore_durability_probe").all(),
          planned: memoryRestoreTransition(disk)?.spaces.some((item) => item.next.keyName === key) ?? false,
        });
      return native(key, value);
    });
    await stageRuntimeRestore(f.directory, f.exported.path, disk.columnCipher, pipeline);
    expect(writes).toHaveBeenCalled();
    expect(allocations).toHaveLength(1);
    expect(allocations[0]).toMatchObject({ transaction: false, mode: prior, planned: true });
    expect(allocations[0]!.modes.length).toBeGreaterThanOrEqual(2);
    expect(allocations[0]!.modes.every((row) => (row as { mode: number }).mode === 2)).toBe(true);
    expect(disk.db.prepare("PRAGMA synchronous").get()).toEqual(prior);
    await cancelRuntimeRestore(f.directory, pipeline);
  } finally {
    await pipeline.close();
    disk.close();
  }
});

it("ordinary restore reaches native cleanup after a stale ready generation instead of failing before authentication", async () => {
  const f = await restoreMemoryFixture();
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const next = memoryRestoreTransition(f.repo)!.spaces[0]!.next;
  advanceManagedRecoveryGeneration(f.directory);
  const store = f.native.storeSecret.bind(f.native);
  const fault = vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
    if (key === next.keyName && !value) throw new Error("Synthetic crash before cleanup acknowledgement");
    return store(key, value);
  });
  await expect(f.pipeline.retireWorkspace(f.workspaceId)).rejects.toThrow(
    "Synthetic crash before cleanup acknowledgement",
  );
  // Persist the actual source-side owner as a stopped runtime would leave it.
  rmSync(f.destination);
  await backup(f.repo.db, f.destination);
  expect(await applyPendingRuntimeRestore(f.directory, f.destination)).toMatchObject({
    applied: false,
    cleanupRequired: true,
  });
  const reopened = new Repo(openDb(f.destination), f.repo.columnCipher);
  try {
    fault.mockRestore();
    await new SpaceMemoryRestore(reopened, f.native, "recall-provenance", f.directory).startup();
    expect(memoryRestoreTransition(reopened)).toBeUndefined();
    expect((await f.native.readSecret(next.keyName)).value).toBeFalsy();
    expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
    expect(existsSync(join(f.directory, "pending-runtime-restore.json"))).toBe(false);
  } finally {
    reopened.close();
  }
});

it("ordinary restore refuses hostless startup before any runtime descriptor or API can publish a pending destination", async () => {
  const f = await appliedMemoryFixture();
  await expect(
    startRuntime({
      AUX_DATA_DIR: f.directory,
      AUX_API_PORT: "0",
      AUX_LOAD_DOTENV: "0",
      AUX_BROWSER_PROFILE_ID: "recall-provenance",
    }),
  ).rejects.toThrow("authenticated native Profile owner before startup");
  expect(existsSync(join(f.directory, "runtime.json"))).toBe(false);
  expect(memoryRestoreTransition(f.restored)?.role).toBe("destination");
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  await f.owner.startup();
});

it("ordinary restore refuses nested metadata ownership and restores synchronous mode after a failed durable plan", async () => {
  const f = await restoreMemoryFixture();
  const name = `pending-runtime-restore.sqlite.${randomUUID()}.tmp`;
  const artifacts = `pending-runtime-restore-artifacts.${randomUUID()}.tmp`;
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(f.directory, artifacts));
  await backup(f.repo.db, join(f.directory, name));
  const owner = new SpaceMemoryRestore(f.repo, f.native, "recall-provenance", f.directory);
  const before = f.repo.db.prepare("PRAGMA synchronous").get();
  expect(() =>
    f.repo.transaction(() =>
      owner.begin(
        spaceMemoryDigest(currentSpaceMemory(f.repo.db)),
        digest("fixture original proof"),
        name,
        artifacts,
      ),
    ),
  ).toThrow("independent durable commit");
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
  expect(f.repo.db.prepare("PRAGMA synchronous").get()).toEqual(before);
  // Remove the independent low-level fixture paths before testing the actual production stage owner.
  rmSync(join(f.directory, name));
  rmSync(join(f.directory, artifacts), { recursive: true });
  f.repo.db.exec(`CREATE TABLE plan_fail_counter(count INTEGER); INSERT INTO plan_fail_counter VALUES(0);
    CREATE TRIGGER fail_second_metadata_write BEFORE INSERT ON aux_meta WHEN NEW.key='space_memory_restore_v1' BEGIN
      UPDATE plan_fail_counter SET count=count+1;
      SELECT CASE WHEN (SELECT count FROM plan_fail_counter)>1 THEN RAISE(ABORT,'Synthetic durable plan failure') END;
    END;`);
  const writes = vi.spyOn(f.native, "storeSecret");
  await expect(
    stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline),
  ).rejects.toThrow("Synthetic durable plan failure");
  expect(
    writes.mock.calls.filter(([key, value]) => key.startsWith("mem_") && key !== f.prior.keyName && value),
  ).toEqual([]);
  expect(f.repo.db.prepare("PRAGMA synchronous").get()).toEqual(before);
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
});

it("ordinary restore joins shutdown before cleaning a late original detached key write", async () => {
  const f = await restoreMemoryFixture();
  let enter!: () => void, release!: () => void;
  const held = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let next: string | undefined;
  const store = f.native.storeSecret.bind(f.native);
  vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
    if (!next && key.startsWith("mem_") && key !== f.prior.keyName && value) {
      next = key;
      enter();
      await gate;
    }
    return store(key, value);
  });
  const staged = stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline).then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await held;
  let closed = false;
  const shutdown = f.pipeline.close().then(() => {
    closed = true;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  expect(closed).toBe(false);
  release();
  await shutdown;
  expect(await staged).toHaveProperty("error");
  expect((await f.native.readSecret(next!)).value).toBeFalsy();
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
});

it("ordinary restore missing pending bytes still reaches authenticated original source cleanup on restart", async () => {
  const f = await restoreMemoryFixture();
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const original = memoryRestoreTransition(f.repo)!;
  const next = original.spaces[0]!.next;
  rmSync(join(f.directory, "pending-runtime-restore.sqlite"));
  rmSync(f.destination);
  await backup(f.repo.db, f.destination);
  const outcome = await applyPendingRuntimeRestore(f.directory, f.destination);
  expect(outcome).toMatchObject({ applied: false, cleanupRequired: true, operationId: original.operationId });
  if (!("cleanupRequired" in outcome)) throw new Error("Expected original native cleanup handoff.");
  const reopened = new Repo(openDb(f.destination), f.repo.columnCipher);
  try {
    await new SpaceMemoryRestore(reopened, f.native, "recall-provenance", f.directory).startup({
      operationId: outcome.operationId,
    });
    expect(memoryRestoreTransition(reopened)).toBeUndefined();
    expect((await f.native.readSecret(next.keyName)).value).toBeFalsy();
    expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  } finally {
    reopened.close();
  }
});

it("ordinary restore rechecks exact applied rows after original native awaits before erasing any prior key", async () => {
  const f = await appliedMemoryFixture();
  const read = f.native.readSecret.bind(f.native);
  let changed = false;
  vi.spyOn(f.native, "readSecret").mockImplementation(async (key) => {
    const value = await read(key);
    if (key === f.prior.keyName && !changed) {
      changed = true;
      f.restored.db
        .prepare("UPDATE memory_files SET content=content||'changed' WHERE workspace_id=?")
        .run(f.workspaceId);
    }
    return value;
  });
  const writes = vi.spyOn(f.native, "storeSecret");
  await expect(f.owner.startup()).rejects.toThrow("generation identity changed");
  expect(changed).toBe(true);
  expect(writes.mock.calls.filter(([key, value]) => key === f.prior.keyName && !value)).toEqual([]);
  expect((await read(f.prior.keyName)).value).toBe(f.priorFactor);
  expect(memoryRestoreTransition(f.restored)?.role).toBe("destination");
});

it("ordinary restore Pause rejects uncertain original cleanup and a later exact Cancel can settle it", async () => {
  const f = await restoreMemoryFixture();
  await stageRuntimeRestore(f.directory, f.exported.path, f.repo.columnCipher, f.pipeline);
  const next = memoryRestoreTransition(f.repo)!.spaces[0]!.next;
  const store = f.native.storeSecret.bind(f.native);
  const failure = vi.spyOn(f.native, "storeSecret").mockImplementation(async (key, value) => {
    if (key === next.keyName && !value) throw new Error("Synthetic paused cleanup refusal");
    return store(key, value);
  });
  await expect(f.pipeline.setPolicy(f.workspaceId, false)).rejects.toThrow(
    "Synthetic paused cleanup refusal",
  );
  expect(memoryRestoreTransition(f.repo)?.spaces[0]?.next).toEqual(next);
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  failure.mockRestore();
  await cancelRuntimeRestore(f.directory, f.pipeline);
  expect(memoryRestoreTransition(f.repo)).toBeUndefined();
  expect((await f.native.readSecret(next.keyName)).value).toBeFalsy();
});

it("ordinary restore refuses an unproven deferred operation before reading or erasing native factors", async () => {
  const f = await appliedMemoryFixture();
  const reads = vi.spyOn(f.native, "readSecret");
  const writes = vi.spyOn(f.native, "storeSecret");
  await expect(f.owner.startup({ operationId: randomUUID() })).rejects.toThrow("operation is unverified");
  expect(reads).not.toHaveBeenCalled();
  expect(writes).not.toHaveBeenCalled();
  expect(memoryRestoreTransition(f.restored)?.role).toBe("destination");
  await f.owner.startup();
});

it("ordinary restore refuses prior-key retirement if the applied database lost its canonical destination identity", async () => {
  const f = await appliedMemoryFixture();
  const moved = join(f.directory, "original-applied-moved.sqlite");
  const { renameSync } = await import("node:fs");
  renameSync(f.destination, moved);
  const writes = vi.spyOn(f.native, "storeSecret");
  await expect(f.owner.startup()).rejects.toThrow();
  expect(writes.mock.calls.filter(([key, value]) => key === f.prior.keyName && !value)).toEqual([]);
  expect((await f.native.readSecret(f.prior.keyName)).value).toBe(f.priorFactor);
  expect(memoryRestoreTransition(f.restored)?.role).toBe("destination");
  renameSync(moved, f.destination);
  await f.owner.startup();
});

async function independentEmptySearch(
  f: Awaited<ReturnType<typeof fixture>>,
  options: { readFailure?: boolean; secondMemory?: boolean } = {},
) {
  let step = 0;
  f.model.toolCallStep = vi.fn(async () => {
    const call =
      ++step === 1
        ? options.readFailure
          ? {
              toolCallId: "empty-read",
              toolName: "memory_read",
              input: { sourceId: "claim:missing", revision: "0", sha256: "0".repeat(64) },
            }
          : {
              toolCallId: "empty-search",
              toolName: "memory_search",
              input: { queries: ["independent nonexistent subject"], kinds: ["episodic"], mode: "lexical" },
            }
        : step === 2
          ? options.secondMemory
            ? {
                toolCallId: "content-search",
                toolName: "memory_search",
                input: { queries: ["independent owner"], kinds: ["site"], mode: "lexical" },
              }
            : { toolCallId: "fresh-time", toolName: "get_time", input: {} }
          : {
              toolCallId: "independent-done",
              toolName: "submit_result",
              input: { report: "Independent research completed after the empty saved Memory search." },
            };
    return {
      message: { role: "assistant" as const, content: [{ type: "tool-call" as const, ...call }] },
      toolCalls: [call],
      durationMs: 1,
      inputTokens: 1,
      outputTokens: 1,
      costUsd: 0,
    };
  });
  await f.runs.coordinator.start({
    runId: "independent-empty",
    goal: "Research a new independent subject",
    pageIds: [],
    modelId: "fixture",
    contextWorkspaceId: f.workspaceId,
  });
  await vi.waitFor(() => expect(f.repo.getRun("independent-empty")?.status).toBe("completed"));
  return "independent-empty";
}

it("permits first-task learning after a genuine modern empty search and independent subsequent tool use", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const runId = await independentEmptySearch(f);
  expect(f.repo.getRun(runId)?.config?.memoryRecallAdmissionVersion).toBe(1);
  expect(
    f.repo.db
      .prepare("SELECT tool_name FROM run_tool_calls WHERE run_id=? ORDER BY started_at,tool_call_id")
      .all(runId),
  ).toEqual(expect.arrayContaining([{ tool_name: "memory_search" }, { tool_name: "get_time" }]));
  const outputs = f.transcript
    .load(runId)
    .flatMap((message) =>
      message.role === "tool" ? message.content.filter((part) => part.type === "tool-result") : [],
    );
  expect(outputs.find((part) => part.toolName === "memory_search")?.output).toMatchObject({
    type: "json",
    value: { matches: [], total: 0 },
  });
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([runId]);
  expect(proof.allows(runId)).toBe(true);
  expect(await f.pipeline.extractRun(f.workspaceId, runId)).toMatchObject({ extracted: 1 });
  const claim = (await f.pipeline.inbox(f.workspaceId))[0]!;
  await f.pipeline.review(f.workspaceId, claim.claimId, "accept");
  expect((await f.pipeline.overview(f.workspaceId)).summary).toContain("Independent research completed");
});

it("refuses historical article-derived notes before expiry, after expiry and after recapture without erasing inspection", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const source = await legacyArticle(f);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, source.runId, true);
  const extract = vi.spyOn(fixtureMemoryExtractor, "extract");
  await expect(f.pipeline.extractRun(f.workspaceId, source.runId)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(extract).not.toHaveBeenCalled();
  expect(await f.pipeline.search(f.workspaceId, "quartz")).toEqual([]);
  expect((await f.pipeline.overview(f.workspaceId)).summary).not.toContain(f.article.text);
  f.repo.db.prepare("UPDATE content_memory SET expires_at=0 WHERE memory_id=?").run(f.article.memoryId);
  expect(await f.memory.recallDocuments(f.workspaceId, new AbortController().signal)).toEqual([]);
  expect(
    (
      await f.pipeline.recall({
        workspaceId: f.workspaceId,
        queries: ["quartz"],
        kinds: ["episodic"],
        mode: "lexical",
      })
    ).matches,
  ).toEqual([]);
  await expect(
    f.pipeline.readSource({
      workspaceId: f.workspaceId,
      sourceId: `claim:${claim.claimId}`,
      revision: "0",
      sha256: digest(claim.text),
    }),
  ).rejects.toMatchObject({ code: "conflict" });
  await f.memory.saveEligible({
    workspaceId: f.workspaceId,
    pageId: "source-page",
    documentEpoch: 2,
    url: f.article.url,
    title: "Workshop",
    text: "Fresh explicit capture has different content and authority.",
  });
  expect(await f.pipeline.search(f.workspaceId, "quartz")).toEqual([]);
  expect((await f.pipeline.documents(f.workspaceId)).documents[0]!.claim).toEqual(claim);
  expect(f.transcript.load(source.runId)).not.toEqual([]);
  const owner = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://independent.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Independent owner instructions remain available.",
  });
  expect((await f.pipeline.overview(f.workspaceId)).summary).toContain(owner.document!.content);
});

it("does not decrypt known legacy Memory execution history or enumerate unrelated runs for candidate refusal", async () => {
  const f = await fixture();
  const source = await legacyArticle(f);
  const pages = vi.spyOn(TranscriptStore.prototype, "retirementPages");
  const prepare = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([source.runId]);
  expect(prepare.allows(source.runId)).toBe(false);
  expect(pages).not.toHaveBeenCalled();
  expect(f.repo.getRun(source.runId)?.config?.memoryRecallAdmissionVersion).toBeUndefined();
});

it("detects exact encrypted empty-result replacement before any later publication", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id]);
  expect(proof.allows(id)).toBe(true);
  f.transcript.append(id, [
    {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolCallId: "unpaired",
          toolName: "memory_search",
          input: { queries: ["new query"] },
        },
      ],
    },
  ]);
  expect(() => proof.check()).toThrow("transcript changed");
  const current = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id]);
  expect(current.allows(id)).toBe(false);
});

it("fences original Memory ledger changes across generation-key preparation", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const id = await independentEmptySearch(f);
  const store = f.native.storeSecret.bind(f.native);
  let release!: () => void;
  const gate = new Promise<void>((done) => (release = done));
  let held = false;
  vi.spyOn(f.native, "storeSecret").mockImplementation(async (name, value) => {
    if (value && !held) {
      held = true;
      await gate;
    }
    return store(name, value);
  });
  const pending = f.pipeline.extractRun(f.workspaceId, id).then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await vi.waitFor(() => expect(held).toBe(true), { timeout: 5000 });
  f.repo.db
    .prepare("INSERT INTO run_tool_calls VALUES(?,?,?,?)")
    .run(id, "new-original-call", "memory_read", Date.now());
  release();
  expect(await pending).toMatchObject({ error: { code: "cancelled" } });
  expect(await f.pipeline.inbox(f.workspaceId)).toEqual([]);
});

it("never restores a blocked generated same-path body to Dream through an independent valid site claim", async () => {
  const consolidate = vi.fn<
    import("../../apps/runtime/dist/services/memory-dream.js").MemoryDreamer["consolidate"]
  >(async (input) => {
    input.checkCurrent();
    return { status: "completed", changes: [] };
  });
  const f = await fixture({ generation: () => "independent-dream", consolidate });
  f.pipeline.setPolicy(f.workspaceId, true);
  const original = await legacyArticle(f);
  const old = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, original.runId, true);
  await f.pipeline.editDocuments({
    workspaceId: f.workspaceId,
    expectedGeneration: (await f.pipeline.documents(f.workspaceId)).generation,
    edits: [{ claimId: old.claimId, text: "Separately authored owner correction remains inspectable." }],
  });
  const ownerEdit = (await f.pipeline.documents(f.workspaceId)).documents[0]!.claim.ownerEdit;
  const runId = "independent-site-report",
    pageId = "independent-site-page",
    url = "https://article.test/new-research";
  const quote = "Independent new evidence verifies a green fixture with three units.";
  f.repo.upsertPage({
    pageId,
    backend: "aux",
    targetId: pageId,
    url,
    title: "Independent research",
    documentEpoch: 1,
    lastRevision: 1,
    viewStatus: "visible",
    controller: "human",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  const artifactId = "independent-observation",
    path = join(f.directory, "independent-observation.json");
  writeFileSync(
    path,
    JSON.stringify({
      observationId: artifactId,
      pageId,
      documentEpoch: 1,
      revision: 1,
      observedAt: 1,
      scope: "full",
      content: {
        url,
        title: "Independent research",
        viewport: { width: 100, height: 100, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 },
        frames: [],
        text: quote,
        headings: [],
        elements: [],
        formFields: [],
        tables: [],
        links: [],
        dialogs: [],
        truncated: false,
        stats: { elementsTotal: 0, elementsShown: 0, textChars: quote.length, approxTokens: 20 },
      },
    }),
  );
  f.repo.saveArtifact({
    artifactId,
    runId,
    pageId,
    path,
    mediaType: "application/json",
    size: Buffer.byteLength(readFileSync(path)),
    status: "complete",
    createdAt: 1,
  });
  f.repo.saveRun({
    runId,
    goal: "Independent site research",
    pageIds: [pageId],
    status: "completed",
    createdAt: Date.now(),
    endedAt: Date.now(),
    config: { implementation: "agent-loop", contextWorkspaceId: f.workspaceId },
    result: { report: quote, citations: [{ observationId: artifactId, quote }] },
  });
  await f.pipeline.extractRun(f.workspaceId, runId);
  const valid = (await f.pipeline.inbox(f.workspaceId))[0]!;
  await f.pipeline.review(f.workspaceId, valid.claimId, "accept");
  const store = new SpaceMemoryStore(f.repo, f.native, "recall-provenance"),
    state = await store.read(f.workspaceId);
  const documentPath = `sites/article.test-${digest("https://article.test").slice(0, 12)}.md`;
  const stored = {
    documentId: randomUUID(),
    target: { kind: "site", origin: "https://article.test" },
    path: documentPath,
    revision: 1,
    authoredBy: "generated",
    content: f.article.text,
    contentSha256: digest(f.article.text),
    updatedAt: Date.now(),
    sourceRefs: [
      { claimId: old.claimId, sourceRunId: old.sourceRunId, quoteSha256: old.source!.quoteSha256 },
    ],
  };
  state.files.set("documents.json.enc", JSON.stringify([stored]));
  await store.write(f.workspaceId, state.files, state.history, state.prior);
  expect(await f.pipeline.dream(f.workspaceId)).toMatchObject({ status: "no-change" });
  expect(consolidate).toHaveBeenCalledTimes(1);
  expect(
    consolidate.mock.calls[0]![0].documents.find((document) => document.path === documentPath)?.content,
  ).toBe("");
  expect(JSON.stringify(consolidate.mock.calls[0]![0])).not.toContain(f.article.text);
  expect(consolidate.mock.calls[0]![0].claims).toEqual([{ claimId: valid.claimId, text: valid.text }]);
  expect(
    (await f.pipeline.documents(f.workspaceId)).documents.find(
      (document) => document.claim.claimId === old.claimId,
    )!.claim.ownerEdit,
  ).toEqual(ownerEdit);
  expect((await f.pipeline.documentList(f.workspaceId)).documents).toEqual([stored]);
});

it("permits only exact original modern no-content failures and never clears another nonempty Memory call", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f, { readFailure: true });
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id]);
  expect(proof.allows(id)).toBe(true);
  const original = f.transcript.entries(id).find((entry) => entry.message.role === "tool")!;
  expect(original.message).toMatchObject({
    role: "tool",
    content: [
      {
        toolName: "memory_read",
        output: {
          type: "error-text",
          value: "This Memory source changed or is no longer eligible. Search again.",
        },
      },
    ],
  });
  f.transcript.truncateFrom(id, original.seq);
  f.transcript.append(id, [
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolName: "memory_read",
          toolCallId: "empty-read",
          output: { type: "error-text", value: "Unexpected source text in an arbitrary error." },
        },
      ],
    },
  ]);
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
});

it("refuses a later genuine nonempty owner-document search despite an earlier empty result", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://independent.test" },
    expectedGeneration: null,
    content: "Independent owner document contains instructions for new research.",
  });
  const id = await independentEmptySearch(f, { secondMemory: true });
  expect(f.repo.getRun(id)?.config?.memoryRecallAdmissionVersion).toBe(1);
  expect(f.repo.getRun(id)?.config?.contextMemoryIds).toBeUndefined();
  const outputs = f.transcript
    .load(id)
    .flatMap((message) =>
      message.role === "tool" ? message.content.filter((part) => part.type === "tool-result") : [],
    );
  expect(outputs.find((part) => part.toolCallId === "content-search")?.output).toMatchObject({
    type: "json",
    value: { total: 1 },
  });
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
  await expect(f.pipeline.extractRun(f.workspaceId, id)).rejects.toMatchObject({ code: "permission_denied" });
});

it("does not infer clean admission from a marker without ledger or from an unsealed empty result", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  f.repo.db.prepare("DELETE FROM run_tool_calls WHERE run_id=? AND tool_name='memory_search'").run(id);
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
  const run = f.repo.getRun(id)!;
  f.repo.saveRun({ ...run, config: { ...run.config, memoryRecallAdmissionVersion: undefined } });
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
});

it("fails the whole candidate inspection on its row budget and ignores ordinary human JSON as a tool call", async () => {
  const f = await fixture();
  const id = "ordinary-human-history";
  f.repo.saveRun({
    runId: id,
    goal: "Independent human task",
    pageIds: [],
    status: "completed",
    createdAt: 1,
    config: { contextWorkspaceId: f.workspaceId },
    result: { report: "Independent plain note remains available." },
  });
  f.transcript.append(id, [
    { role: "user", content: '{"toolName":"memory_search","matches":[]} is quoted human text.' },
  ]);
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    true,
  );
  f.transcript.append(
    id,
    Array.from({ length: 4096 }, () => ({
      role: "user" as const,
      content: "Bounded ordinary historical row.",
    })),
  );
  await expect(
    new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id]),
  ).rejects.toMatchObject({ code: "backend_unavailable" });
});

it("refuses only the authenticated Memory-bearing effect family, not another execution sharing its Set", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const child = await legacyArticle(f, "admission-family-child");
  for (const id of ["admission-family-parent", "independent-parent", "independent-child"])
    f.repo.saveRun({
      runId: id,
      goal: "Original independent human task",
      pageIds: [],
      status: "completed",
      createdAt: 1,
      endedAt: 1,
      config: { implementation: "agent-loop", contextWorkspaceId: f.workspaceId },
      result: { report: "Independent original research gives a useful fixture note." },
    });
  const set = await f.sets.create({
    name: "Shared Set identity",
    source: "urls",
    urls: [f.article.url, "https://independent.test"],
  });
  const members = f.repo.listMembers(set.setId);
  setReceipt(f, set.setId, members[0]!.memberId, child.runId, "admission-family-parent");
  setReceipt(f, set.setId, members[1]!.memberId, "independent-child", "independent-parent");
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([
    "admission-family-parent",
    "independent-parent",
  ]);
  expect(proof.allows("admission-family-parent")).toBe(false);
  expect(proof.allows("independent-parent")).toBe(true);
  await expect(f.pipeline.extractRun(f.workspaceId, "admission-family-parent")).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(await f.pipeline.extractRun(f.workspaceId, "independent-parent")).toMatchObject({ extracted: 1 });
});

it("authenticates copied source boundaries and rechecks the exact original branch receipt", async () => {
  const f = await fixture();
  const source = await independentEmptySearch(f);
  const child = "independent-copied-child",
    chatId = "admission-copy";
  const original = f.repo.getRun(source)!;
  const childRun = {
    ...original,
    runId: child,
    goal: "Independent copied task",
    config: { ...original.config, chatId, branchSourceRunIds: [source] },
    result: { report: "Independent copied research report." },
  };
  f.repo.saveRun(childRun);
  f.repo.setSetting(`conversationBranch:${chatId}`, {
    sourceRunId: source,
    sourceRunIds: [source],
    mode: "branch",
    windowId: "original-window",
  });
  const { originalTask } = await import("../../apps/runtime/dist/agent/loop/original-task-message.js");
  f.transcript.append(child, [
    ...f.transcript.forkEntries(source).map((entry) => entry.message),
    originalTask(childRun),
  ]);
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([child]);
  expect(proof.allows(child)).toBe(true);
  f.repo.setSetting(`conversationBranch:${chatId}`, {
    sourceRunId: source,
    sourceRunIds: [],
    mode: "branch",
    windowId: "original-window",
  });
  expect(() => proof.check()).toThrow("execution changed");
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([child])).allows(child),
  ).toBe(false);
});

it("cancels original extraction when authenticated family membership grows during the model await", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const id = await independentEmptySearch(f),
    original = f.repo.getRun(id)!;
  const extract = fixtureMemoryExtractor.extract.bind(fixtureMemoryExtractor);
  let entered = false,
    release!: () => void;
  const gate = new Promise<void>((done) => (release = done));
  vi.spyOn(fixtureMemoryExtractor, "extract").mockImplementation(async (input) => {
    entered = true;
    await gate;
    return extract(input);
  });
  const pending = f.pipeline.extractRun(f.workspaceId, id).then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await vi.waitFor(() => expect(entered).toBe(true));
  const child = "new-original-family-member";
  f.repo.saveRun({
    runId: child,
    goal: "Independent child",
    pageIds: [],
    status: "completed",
    createdAt: 1,
    endedAt: 1,
    config: { implementation: "agent-loop", contextWorkspaceId: f.workspaceId },
    result: { report: "Independent child report." },
  });
  const set = await f.sets.create({
    name: "New authenticated original family",
    source: "urls",
    urls: ["https://independent.test"],
  });
  setReceipt(f, set.setId, f.repo.listMembers(set.setId)[0]!.memberId, child, id);
  release();
  expect(await pending).toMatchObject({ error: { code: "cancelled" } });
  expect(f.repo.getRun(id)?.result).toEqual(original.result);
  expect(await f.pipeline.inbox(f.workspaceId)).toEqual([]);
});

it("decodes each candidate once per operation and checks original ciphertext without another decode", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  const pages = vi.spyOn(TranscriptStore.prototype, "retirementPages");
  const proof = new MemorySourceAdmission(f.repo, f.workspaceId, () => {});
  await proof.prepare([id, id]);
  await proof.prepare([id]);
  proof.check();
  expect(proof.allows(id)).toBe(true);
  expect(pages.mock.calls.filter(([, decode]) => decode !== false)).toEqual([[id]]);
  expect(pages.mock.calls.filter(([, decode]) => decode === false)).toHaveLength(3);
});

it("refuses extra source-bearing fields hidden beside an otherwise empty canonical result", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  const row = f.transcript.entries(id).find((entry) => entry.message.role === "tool")!;
  if (row.message.role !== "tool") throw new Error("Original result missing");
  const part = row.message.content[0]!;
  if (part.type !== "tool-result" || part.output.type !== "json")
    throw new Error("Original typed result missing");
  const { MemoryRecallResultSchema } = await import("@aux/contracts/memory-documents");
  const original = MemoryRecallResultSchema.parse(part.output.value);
  f.transcript.truncateFrom(id, row.seq);
  f.transcript.append(id, [
    {
      role: "tool",
      content: [
        {
          ...part,
          output: { type: "json", value: { ...original, unreviewedSourceText: "Unproven recalled bytes" } },
        },
      ],
    },
  ]);
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
});

it("never treats a parked pending Memory outcome as a completed empty result", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  const row = f.transcript.entries(id).find((entry) => entry.message.role === "tool")!;
  f.transcript.truncateFrom(id, row.seq);
  f.transcript.park(id, {
    toolCallId: "empty-search",
    toolName: "memory_search",
    pendingResults: [{ toolCallId: "empty-search", toolName: "memory_search", parked: true }],
  });
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
});

it("keeps independent owner documents and accepted pastes usable beside an unretired historical orphan", async () => {
  const f = await fixture();
  f.pipeline.setPolicy(f.workspaceId, true);
  const original = await legacyArticle(f);
  const claim = await seedHistoricalRunMemory(f.pipeline, f.repo, f.workspaceId, original.runId, true);
  f.repo.db.prepare("DELETE FROM runs WHERE run_id=?").run(original.runId);
  const owner = await f.pipeline.documentSet({
    workspaceId: f.workspaceId,
    target: { kind: "site", origin: "https://owner-independent.test" },
    expectedGeneration: (await f.pipeline.documentList(f.workspaceId)).generation,
    content: "Independent owner guidance uses an emerald notebook.",
  });
  const preview = await f.pipeline.previewPaste({
    workspaceId: f.workspaceId,
    text: "My independent preference is a violet project folder.",
  });
  if (preview.status !== "ready") throw new Error("Expected ordinary owner paste preview");
  await f.pipeline.commitPaste({
    workspaceId: f.workspaceId,
    previewId: preview.previewId,
    selectedIds: preview.candidates.map((item) => item.candidateId),
  });
  const pasted = (await f.pipeline.inbox(f.workspaceId))[0]!;
  await f.pipeline.review(f.workspaceId, pasted.claimId, "accept");
  const overview = await f.pipeline.overview(f.workspaceId);
  expect(overview.summary).toContain(owner.document!.content);
  expect(overview.summary).toContain(pasted.text);
  expect(overview.summary).not.toContain(claim.text);
  const recall = await f.pipeline.recall({
    workspaceId: f.workspaceId,
    queries: ["independent"],
    kinds: ["site", "episodic"],
    mode: "lexical",
  });
  expect(recall.matches.map((match) => match.sourceId)).toEqual(
    expect.arrayContaining([`document:${owner.document!.documentId}`, `claim:${pasted.claimId}`]),
  );
  expect(recall.matches.some((match) => match.sourceId === `claim:${claim.claimId}`)).toBe(false);
  for (const match of recall.matches)
    expect(
      (
        await f.pipeline.readSource({
          workspaceId: f.workspaceId,
          sourceId: match.sourceId,
          revision: match.revision,
          sha256: match.sha256,
        })
      ).text,
    ).toBeTruthy();
  expect(
    (await f.pipeline.documents(f.workspaceId)).documents.find((item) => item.claim.claimId === claim.claimId)
      ?.claim,
  ).toEqual(claim);
});

it("refuses refs-only captured Memory on an authenticated family member without poisoning independent sources", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  for (const runId of ["refs-family-parent", "refs-family-child"])
    f.repo.saveRun({
      runId,
      goal: "Independent fixture task",
      pageIds: [],
      status: "completed",
      createdAt: 1,
      config: { contextWorkspaceId: f.workspaceId },
      result: { report: "Independent useful plain research report." },
    });
  const child = f.repo.getRun("refs-family-child")!;
  f.repo.saveRun({
    ...child,
    config: {
      ...child.config,
      contextMemoryRefs: [
        {
          memoryId: f.article.memoryId,
          profileId: "recall-provenance",
          workspaceId: f.workspaceId,
          pageId: f.article.pageId,
          documentEpoch: f.article.documentEpoch,
          url: f.article.url,
          title: f.article.title,
          capturedAt: f.article.capturedAt,
        },
      ],
    },
  });
  const set = await f.sets.create({ name: "Original refs family", source: "urls", urls: [f.article.url] });
  setReceipt(f, set.setId, f.repo.listMembers(set.setId)[0]!.memberId, child.runId, "refs-family-parent");
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([
    "refs-family-parent",
    id,
  ]);
  expect(proof.allows("refs-family-parent")).toBe(false);
  expect(proof.allows(id)).toBe(true);
  expect(f.repo.getRun(child.runId)?.config?.contextMemoryIds).toBeUndefined();
});

it("admits genuine normal spawn and copied forkSelf independently, with original family policy and prefix fences", async () => {
  const f = await fixture(undefined, undefined, "recall-provenance", true);
  f.pipeline.setPolicy(f.workspaceId, true);
  const subagents = new SubagentService(f.repo, f.events, f.runs, undefined, ["webfetch"]);
  cleanup.unshift(async () => subagents.close());
  let parentStep = 0;
  f.model.toolCallStep = vi.fn(async (options: Parameters<MockModelClient["toolCallStep"]>[0]) => {
    const child = options.messages.some(
      (message) =>
        message.role === "user" &&
        typeof message.content === "string" &&
        /Task: (Normal independent child|Copied independent child)/u.test(message.content),
    );
    const call = child
      ? {
          toolCallId: randomUUID(),
          toolName: "submit_result",
          input: { report: "Independent child research established a teal fixture with four units." },
        }
      : ++parentStep === 1
        ? { toolCallId: "parent-clock", toolName: "get_time", input: {} }
        : {
            toolCallId: "parent-question",
            toolName: "ask_user_question",
            input: { question: "Keep independent research open?" },
          };
    return {
      message: { role: "assistant" as const, content: [{ type: "tool-call" as const, ...call }] },
      toolCalls: [call],
      durationMs: 1,
      inputTokens: 1,
      outputTokens: 1,
      costUsd: 0,
    };
  });
  await f.runs.coordinator.start({
    runId: "actual-spawn-parent",
    goal: "Independent original parent",
    pageIds: [],
    modelId: "fixture",
    contextWorkspaceId: f.workspaceId,
  });
  await vi.waitFor(() => expect(f.repo.getRun("actual-spawn-parent")?.status).toBe("needs_input"));
  const group = subagents.createGroup({
    parentRunId: "actual-spawn-parent",
    tokenBudget: 0,
    costBudgetUsd: 0,
    timeBudgetMs: 0,
  });
  const args = {
    groupId: group.groupId,
    pageIds: [],
    profile: "read_only",
    tokenAllocation: 0,
    costAllocationUsd: 0,
    maxModelCalls: 4,
  };
  const normal = await subagents.spawn({ ...args, goal: "Normal independent child" });
  const fork = await subagents.forkSelf({
    ...args,
    goal: "Copied independent child",
    sourceRunId: "actual-spawn-parent",
  });
  for (const agent of [normal, fork])
    await vi.waitFor(() => expect(f.repo.getRun(agent.runId!)?.status).toBe("completed"));
  const { originalTask } = await import("../../apps/runtime/dist/agent/loop/original-task-message.js");
  const original = f.repo.getRun("actual-spawn-parent")!;
  expect(f.repo.getRun(normal.runId!)?.config?.memoryRecallAdmissionVersion).toBe(1);
  expect(f.transcript.load(normal.runId!)[0]).toEqual(originalTask(f.repo.getRun(normal.runId!)!));
  const copied = f.transcript.load(fork.runId!);
  expect(copied[0]).toEqual(originalTask(original));
  expect(
    copied.findIndex(
      (message) => JSON.stringify(message) === JSON.stringify(originalTask(f.repo.getRun(fork.runId!)!)),
    ),
  ).toBeGreaterThan(0);
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([
    normal.runId!,
    fork.runId!,
  ]);
  expect(proof.allows(normal.runId!)).toBe(true);
  expect(proof.allows(fork.runId!)).toBe(true);
  expect(await f.pipeline.extractRun(f.workspaceId, normal.runId!)).toMatchObject({ extracted: 1 });
  const modernChild = f.repo.getRun(normal.runId!)!;
  f.repo.saveRun({
    ...modernChild,
    config: { ...modernChild.config, memoryRecallAdmissionVersion: undefined },
  });
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!])).allows(
      normal.runId!,
    ),
  ).toBe(false);
  f.repo.saveRun({ ...f.repo.getRun(normal.runId!)!, config: modernChild.config });
  const forkBoundary = copied.findIndex(
    (message) => JSON.stringify(message) === JSON.stringify(originalTask(f.repo.getRun(fork.runId!)!)),
  );
  // Old records have no durable fork flag. Removing the prefix never removes source-family policy.
  f.transcript.truncateFrom(fork.runId!, 0);
  f.transcript.append(fork.runId!, copied.slice(forkBoundary));
  f.repo.saveRun({
    ...f.repo.getRun(original.runId)!,
    config: { ...original.config, chatId: "replacement-private-source", privateTask: true },
  });
  expect(() => proof.check()).toThrow(/changed/);
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!])).allows(
      normal.runId!,
    ),
  ).toBe(false);
  f.repo.saveRun({
    ...f.repo.getRun(original.runId)!,
    config: {
      ...original.config,
      contextMemoryRefs: [
        {
          memoryId: f.article.memoryId,
          profileId: "recall-provenance",
          workspaceId: f.workspaceId,
          pageId: f.article.pageId,
          documentEpoch: f.article.documentEpoch,
          url: f.article.url,
          title: f.article.title,
          capturedAt: f.article.capturedAt,
        },
      ],
    },
  });
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!])).allows(
      normal.runId!,
    ),
  ).toBe(false);
  f.repo.saveRun({ ...f.repo.getRun(original.runId)!, config: original.config });
  const pageId = "original-parent-page",
    url = "https://independent-parent.test/research";
  f.repo.upsertPage({
    pageId,
    backend: "aux",
    targetId: pageId,
    url,
    title: "Independent parent source",
    sessionId: "parent-session",
    documentEpoch: 1,
    lastRevision: 1,
    viewStatus: "visible",
    controller: "human",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  f.repo.saveRun({
    ...f.repo.getRun(original.runId)!,
    config: {
      ...original.config,
      contextPageRefs: [{ pageId, url, sessionId: "parent-session", documentEpoch: 1 }],
    },
  });
  const pageProof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!]);
  expect(pageProof.allows(normal.runId!)).toBe(true);
  f.repo.upsertPage({ ...f.repo.getPage(pageId)!, windowKind: "private" });
  expect(() => pageProof.check()).toThrow(/eligibility changed/);
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!])).allows(
      normal.runId!,
    ),
  ).toBe(false);
  f.repo.upsertPage({ ...f.repo.getPage(pageId)!, windowKind: "normal" });
  f.repo.upsertPage({ ...f.repo.getPage(pageId)!, viewStatus: "detached" });
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!])).allows(
      normal.runId!,
    ),
  ).toBe(false);
  f.repo.upsertPage({ ...f.repo.getPage(pageId)!, viewStatus: "visible" });
  const { readWorkspaceMemory } = await import("../../apps/runtime/dist/services/workspace-memory.js");
  const memory = readWorkspaceMemory(f.repo, f.workspaceId);
  f.repo.setSetting(`workspaceMemory:${f.workspaceId}`, {
    ...memory,
    excludedOrigins: [new URL(url).origin],
  });
  expect(
    (await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!])).allows(
      normal.runId!,
    ),
  ).toBe(false);
  f.repo.setSetting(`workspaceMemory:${f.workspaceId}`, memory);
  f.repo.saveRun({ ...f.repo.getRun(original.runId)!, config: original.config });
  f.transcript.truncateFrom(fork.runId!, 0);
  f.transcript.append(fork.runId!, [
    { role: "user", content: "A replacement copied prefix is not the admitted source." },
    ...copied.slice(1),
  ]);
  expect(
    (
      await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([normal.runId!, fork.runId!])
    ).allows(fork.runId!),
  ).toBe(false);
});

it("includes a copied source's authenticated Memory-bearing child without poisoning another family in the same Set", async () => {
  const f = await fixture();
  for (const id of ["copied-family-parent", "other-copy-parent", "other-copy-child"]) {
    f.repo.saveRun({
      runId: id,
      goal: "Original independent human task",
      pageIds: [],
      status: "completed",
      createdAt: 1,
      endedAt: 1,
      config: { implementation: "agent-loop", contextWorkspaceId: f.workspaceId },
      result: { report: "Independent original report supplies useful fixture knowledge." },
    });
    f.transcript.append(id, [{ role: "user", content: "Original independent human history." }]);
  }
  const branches = new ConversationBranches(f.repo);
  const draft = await branches.create("copied-family-parent", "branch", "original-window", async () => {});
  const copiedRun = {
    runId: "historical-consumed-copy",
    goal: "Follow independent copied history",
    pageIds: [],
    status: "completed" as const,
    createdAt: 2,
    endedAt: 2,
    config: {
      implementation: "agent-loop" as const,
      contextWorkspaceId: f.workspaceId,
      chatId: draft.chatId,
      branchSourceRunIds: ["copied-family-parent"],
    },
    result: { report: "Independent copied fixture report remains a historical record." },
  };
  const { originalTask } = await import("../../apps/runtime/dist/agent/loop/original-task-message.js");
  // Canonical historical consumed branch: actual original receipt and exact producer prefix.
  // It is not a current model/read admission and receives no retroactive marker.
  f.repo.saveRun(copiedRun);
  f.transcript.append(copiedRun.runId, [...branches.prefix(draft.chatId)!, originalTask(copiedRun)]);
  const prior = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([copiedRun.runId]);
  expect(prior.allows(copiedRun.runId)).toBe(true);
  const child = await legacyArticle(f, "copied-family-memory-child");
  const set = await f.sets.create({
    source: "urls",
    name: "Original copied-source Set",
    urls: [f.article.url, "https://other-copy.test"],
  });
  const members = f.repo.listMembers(set.setId);
  setReceipt(f, set.setId, members[0]!.memberId, child.runId, "copied-family-parent");
  setReceipt(f, set.setId, members[1]!.memberId, "other-copy-child", "other-copy-parent");
  expect(() => prior.check()).toThrow("family changed");
  const proof = await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([
    copiedRun.runId,
    "other-copy-parent",
  ]);
  expect(proof.allows(copiedRun.runId)).toBe(false);
  expect(proof.allows("other-copy-parent")).toBe(true);
});

it("never treats a read-only diagnostic transplanted onto an actual modern search as canonical no-content", async () => {
  const f = await fixture();
  const id = await independentEmptySearch(f);
  const entry = f.transcript.entries(id).find((row) => row.message.role === "tool")!;
  f.transcript.truncateFrom(id, entry.seq);
  f.transcript.append(id, [
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "empty-search",
          toolName: "memory_search",
          output: {
            type: "error-text",
            value: "This Memory source changed or is no longer eligible. Search again.",
          },
        },
      ],
    },
  ]);
  expect((await new MemorySourceAdmission(f.repo, f.workspaceId, () => {}).prepare([id])).allows(id)).toBe(
    false,
  );
});
