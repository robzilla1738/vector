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
import { mkdtempSync, rmSync, existsSync } from "node:fs";
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
async function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-recall-provenance-"));
  const native = profileSecrets("recall-provenance").native;
  const db = openDb(":memory:");
  const repo = new Repo(db, await initializeFieldCodec(db, native, "recall-provenance"));
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspaceId = tasks.createWorkspace("Original article Space").workspaceId;
  const memory = new ContentMemoryStore(repo, native, "recall-provenance");
  const pipeline = new MemoryPipeline(repo, native, "recall-provenance", fixtureMemoryExtractor, undefined, {
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
    nativeAvailable: () => false,
    agentLoop: {
      modelGeneration: () => settings.modelCacheGeneration(),
      memorySearch: (query, ctx) => pipeline.recall({ ...query, workspaceId }, ctx.signal, ctx.checkOwner),
      memoryReadSource: (input, ctx) =>
        pipeline.readSource({ ...input, workspaceId }, ctx.signal, ctx.checkOwner),
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
            input: { queries: ["quartz workshop"], kinds: ["page"], mode: "lexical" },
          }
        : step === 2
          ? options.secondSearch
            ? {
                toolCallId: "search-again",
                toolName: "memory_search",
                input: { queries: ["quartz workshop"], kinds: ["page"], mode: "lexical" },
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
                  input: { queries: ["quartz workshop"], kinds: ["page"], mode: "lexical" },
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

it("never backfills the creation proof when a legacy parked run resumes and recalls again", async () => {
  const f = await fixture();
  await recallArticle(f, { parked: true });
  const run = f.repo.getRun("recall-run")!;
  f.repo.saveRun({ ...run, config: { ...run.config, memoryRecallAdmissionVersion: undefined } });
  await f.runs.coordinator.answer("recall-run", "Continue");
  await vi.waitFor(() => expect(f.repo.getRun("recall-run")?.status).toBe("completed"), { timeout: 5000 });
  expect(f.repo.getRun("recall-run")?.config?.memoryRecallAdmissionVersion).toBeUndefined();
  expect(JSON.stringify(f.transcript.load("recall-run"))).toContain("later-search");
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
    expect(() =>
      sanitizePortablePageRecall(copy.db, copy.columnCipher, (ids) => protectedRunFamily(copy, ids)),
    ).toThrow(/Generated protected tasks/);
    expect(new TranscriptStore(copy.db, copy.columnCipher).load("set-parent")).not.toEqual([]);
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id) => {
        retireProtectedGeneratedTask(copy, id);
      },
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
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id) => {
        retireProtectedGeneratedTask(copy, id);
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
    sanitizePortablePageRecall(
      copy.db,
      copy.columnCipher,
      (ids) => protectedRunFamily(copy, ids),
      (id, source) => {
        retireProtectedGeneratedTask(copy, id, source);
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
