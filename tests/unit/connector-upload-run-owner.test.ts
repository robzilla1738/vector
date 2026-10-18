import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { AuxError, SubagentGroupSchema, SubagentSchema, taskConversationId, type Run } from "@aux/contracts";
import {
  DurableWriteLedger,
  EventBus,
  openDb,
  Repo,
  RunService,
  SetService,
  TaskService,
} from "@aux/runtime";
import type { PageService, SettingsService } from "@aux/runtime";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";
import { workspacesMethods } from "../../apps/runtime/src/api/methods/workspaces.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
import { createHash, randomBytes } from "node:crypto";
import { setMemberSourceDigest } from "../../apps/runtime/src/services/set-member-lineage.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0).reverse()) await close();
});
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function fixture(privateTask = false) {
  const repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const space = tasks.createWorkspace("Transfer fixture"),
    task = tasks.create({
      workspaceId: space.workspaceId,
      title: "Upload selected file",
      objective: "Exact selected original",
      criteria: [{ criterionId: "done", description: "Verified", verification: "manual" }],
    });
  const directory = mkdtempSync(join(tmpdir(), "aux-connector-owner-"));
  const pages = {
    list: () => [],
    get: () => {
      throw new AuxError("not_found", "No browser source in this fixture");
    },
    releaseControl: async () => {},
    clearWorking: async () => {},
  } as unknown as PageService;
  const settings = {
    maxWorkers: () => 2,
    perOrigin: () => 2,
    modelCacheGeneration: () => "cache-original",
    agentPolicy: () => ({ agentPolicyRevision: 0 }),
  } as unknown as SettingsService;
  const turnMentions = fixtureTurnMentions(() => undefined),
    documents = new DocumentSnapshots(repo);
  const lifecycle = vi.fn(async (_ids: readonly string[], _mode: "retire" | "forget") => {});
  let generation = "model-original";
  const runs = new RunService({
    repo,
    events,
    pages,
    sets: new SetService(repo, events, pages),
    settings,
    artifacts: new ArtifactStore(directory, repo, events),
    documentSnapshots: documents,
    turnMentions,
    nativeAvailable: () => false,
    agentLoop: { modelGeneration: () => generation },
    connectorFileTransferLifecycle: (ids, mode) => lifecycle(ids, mode),
  });
  const run: Run = {
    runId: "original-transfer-run",
    goal: task.objective,
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: {
      implementation: "agent-loop",
      privateTask,
      chatId: taskConversationId(task.taskId),
      messageRevision: 0,
      taskId: task.taskId,
      taskRevision: task.revision,
      contextWorkspaceId: space.workspaceId,
      nativeTurnContext: "fixture-original-turn",
    },
  };
  repo.saveRun(run);
  const control = { abort: new AbortController(), dispatchAbort: new AbortController(), paused: false };
  runs.coordinator.controls.set(run.runId, control);
  await turnMentions.begin(run.runId, [], []);
  closes.push(async () => {
    lifecycle.mockReset().mockResolvedValue(undefined);
    await runs.close();
    await documents.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  return {
    repo,
    events,
    directory,
    runs,
    run,
    control,
    task,
    space,
    turnMentions,
    lifecycle,
    model: () => {
      generation = "model-replaced";
    },
  };
}
it("keeps the exact owner stable across genuine approval status/checkpoint changes", async () => {
  const f = await fixture(),
    original = f.runs.captureConnectorUploadOwner(f.run.runId);
  f.repo.saveRun({
    ...f.run,
    status: "needs_input",
    config: { ...f.run.config, checkpoint: { planBoundary: "needs_input" } },
  });
  f.repo.saveRun({ ...f.repo.getRun(f.run.runId)!, status: "running" });
  const resumed = f.runs.captureConnectorUploadOwner(f.run.runId);
  expect(resumed.identity).toBe(original.identity);
  expect(resumed.identity).toMatch(/^[a-f0-9]{64}$/);
  expect(() => original.checkCurrent()).not.toThrow();
});
it.each([
  "control",
  "dispatch",
  "mention",
  "message",
  "native",
  "model",
  "Space",
  "task",
  "Forget",
  "readonly",
])("retires the original %s owner rather than adopting replacement authority", async (kind) => {
  const f = await fixture(),
    original = f.runs.captureConnectorUploadOwner(f.run.runId);
  if (kind === "control")
    f.runs.coordinator.controls.set(f.run.runId, {
      abort: new AbortController(),
      dispatchAbort: new AbortController(),
      paused: false,
    });
  if (kind === "dispatch") f.control.dispatchAbort = new AbortController();
  if (kind === "mention") await f.turnMentions.begin(f.run.runId, [], []);
  if (kind === "message") f.repo.saveRun({ ...f.run, config: { ...f.run.config, messageRevision: 1 } });
  if (kind === "native")
    f.repo.saveRun({ ...f.run, config: { ...f.run.config, nativeTurnContext: "replacement" } });
  if (kind === "model") f.model();
  if (kind === "Space")
    f.repo.setSetting(`conversationWorkspace:${f.run.config!.chatId}`, "replacement-space");
  if (kind === "task")
    f.repo.db.prepare("UPDATE tasks SET revision=revision+1 WHERE task_id=?").run(f.task.taskId);
  if (kind === "Forget")
    f.repo.saveRun({ ...f.run, config: { ...f.run.config, contextMemoryRevoked: true } });
  if (kind === "readonly")
    f.repo.saveRun({ ...f.run, config: { ...f.run.config, subagentProfile: "explorer" } });
  expect(() => original.checkCurrent()).toThrow();
});
it("refuses a genuinely private conversation before capturing an upload owner", async () => {
  const f = await fixture(true);
  expect(() => f.runs.captureConnectorUploadOwner(f.run.runId)).toThrow("Private");
});
it("registers original work and refuses late publication after owner retirement", async () => {
  const f = await fixture(),
    original = f.runs.captureConnectorUploadOwner(f.run.runId),
    started = deferred(),
    finish = deferred();
  const work = f.runs.connectorFileOperation(
    { runId: f.run.runId, signal: original.signal, checkOwner: original.checkCurrent },
    async () => {
      started.resolve();
      await finish.promise;
      return "late-derived-result";
    },
  );
  const refused = work.then(
    () => {
      throw new Error("A retired owner cannot publish its late result");
    },
    (error) => expect(error).toBeInstanceOf(Error),
  );
  await started.promise;
  f.model();
  finish.resolve();
  await refused;
});
it.each(["stop", "takeover", "shutdown"])(
  "%s aborts original work and joins transfer retirement before returning",
  async (kind) => {
    const f = await fixture(),
      original = f.runs.captureConnectorUploadOwner(f.run.runId),
      entered = deferred(),
      close = deferred();
    f.lifecycle.mockImplementation(async () => {
      expect(original.signal.aborted).toBe(true);
      entered.resolve();
      await close.promise;
    });
    let settled = false;
    const retired = (
      kind === "stop"
        ? f.runs.cancel(f.run.runId)
        : kind === "takeover"
          ? f.runs.pauseForTakeover(f.run.runId)
          : f.runs.close()
    ).then(() => {
      settled = true;
    });
    await entered.promise;
    expect(settled).toBe(false);
    close.resolve();
    await retired;
    expect(settled).toBe(true);
  },
);
it("durably accepts steering, revokes original dispatch, and waits for the held transfer before acknowledgment", async () => {
  const f = await fixture(),
    original = f.runs.captureConnectorUploadOwner(f.run.runId),
    entered = deferred(),
    close = deferred();
  f.lifecycle.mockImplementation(async () => {
    expect(original.signal.aborted).toBe(true);
    entered.resolve();
    await close.promise;
  });
  const input = {
    messageId: randomUUID(),
    runId: f.run.runId,
    chatId: f.run.config!.chatId!,
    text: "Use the corrected source",
    pageIds: [],
    contextPageRefs: [],
    expectedRevision: 0,
  };
  let acknowledged = false;
  const pending = f.runs.messages.steer(input).then((value) => {
    acknowledged = true;
    return value;
  });
  await entered.promise;
  expect(f.repo.getRun(f.run.runId)?.config?.messageRevision).toBe(1);
  expect(acknowledged).toBe(false);
  expect(() => original.checkCurrent()).toThrow();
  close.resolve();
  await pending;
  await f.runs.messages.steer(input);
  expect(f.lifecycle).toHaveBeenCalledTimes(1);
  expect(acknowledged).toBe(true);
});
it("does not roll back or duplicate an already committed correction when transfer retirement fails", async () => {
  const f = await fixture();
  f.lifecycle.mockRejectedValueOnce(new Error("Original request close was not acknowledged"));
  const input = {
    messageId: randomUUID(),
    runId: f.run.runId,
    chatId: f.run.config!.chatId!,
    text: "Correct the source",
    pageIds: [],
    contextPageRefs: [],
    expectedRevision: 0,
  };
  await expect(f.runs.messages.steer(input)).rejects.toThrow("close");
  expect(f.repo.getRun(f.run.runId)?.config?.messageRevision).toBe(1);
  await expect(f.runs.messages.steer(input)).resolves.toMatchObject({ messageId: input.messageId });
  expect(f.lifecycle).toHaveBeenCalledTimes(1);
  expect(f.repo.listRunSteers(f.run.runId)).toHaveLength(1);
});
it("does not delete transfer bodies merely for an ordinary pause", async () => {
  const f = await fixture();
  await f.runs.pause(f.run.runId);
  expect(f.lifecycle).not.toHaveBeenCalled();
});
it("forgets terminal article-derived transfer bodies before removing generated answers and retains uncertain effects", async () => {
  const f = await fixture();
  const ledger = new DurableWriteLedger(f.repo.db);
  const { intent } = ledger.begin({
    runId: f.run.runId,
    pageId: "connector-upload",
    documentEpoch: 0,
    signature: "exact upload",
    taskId: f.task.taskId,
    taskRevision: f.task.revision,
  });
  ledger.fail(intent.id);
  f.repo.saveRun({
    ...f.run,
    status: "completed",
    result: { report: "private generated answer" },
    config: { ...f.run.config, contextMemoryIds: ["removed-article"] },
  });
  f.lifecycle.mockImplementation(async (ids, mode) => {
    expect(ids).toContain(f.run.runId);
    expect(mode).toBe("forget");
    expect(f.repo.getRun(f.run.runId)?.result?.report).toBe("private generated answer");
  });
  await f.runs.redactForgottenArticleOutputs(f.space.workspaceId);
  expect(f.lifecycle).toHaveBeenCalledTimes(1);
  expect(f.repo.getRun(f.run.runId)?.result).toBeUndefined();
  expect(ledger.getById(intent.id)?.status).toBe("uncertain");
});
it("forgets terminal desktop-derived transfer bodies before redacting the original transcript result", async () => {
  const f = await fixture();
  f.repo.saveRun({
    ...f.run,
    status: "completed",
    result: { report: "desktop-derived answer" },
    config: {
      ...f.run.config,
      desktopContextQuotes: [
        {
          workspaceId: f.space.workspaceId,
          captureId: randomUUID(),
          sha256: "a".repeat(64),
          version: "b".repeat(64),
          appBundleId: "test.editor",
          expiresAt: Date.now() + 60_000,
          consentRevision: 1,
          startLine: 1,
          endLine: 1,
          startOffset: 0,
          endOffset: 12,
          includeSelection: false,
          quoteSha256: "c".repeat(64),
        },
      ],
    },
  });
  f.lifecycle.mockImplementation(async (ids, mode) => {
    expect(ids).toContain(f.run.runId);
    expect(mode).toBe("forget");
    expect(f.repo.getRun(f.run.runId)?.result?.report).toBe("desktop-derived answer");
  });
  await f.runs.retireDesktopContext({ workspaceId: f.space.workspaceId, appBundleIds: ["test.editor"] });
  expect(f.lifecycle).toHaveBeenCalledTimes(1);
  expect(f.repo.getRun(f.run.runId)?.result).toBeUndefined();
});

async function articleFixture() {
  const f = await fixture();
  const secrets = new Map<string, string>();
  let retireFactor: undefined | (() => Promise<void>);
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      if (!value) await retireFactor?.();
      secrets.set(name, value);
      return { ok: true as const };
    },
    profileStorageRoot: async () => {
      const name = `aux_root_v1_${createHash("sha256").update("upload-article-fixture").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  const memory = new ContentMemoryStore(f.repo, native, "upload-article-fixture");
  closes.push(() => memory.close());
  await memory.setPolicy(f.space.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://article.test"],
  });
  const article = await memory.saveEligible({
    workspaceId: f.space.workspaceId,
    pageId: "article-page",
    documentEpoch: 1,
    sessionId: "original-article-session",
    url: "https://article.test/fact",
    title: "Test article",
    text: "The original article supplies this quoted fact.",
  });
  f.repo.saveRun({ ...f.run, config: { ...f.run.config, contextMemoryIds: [article.memoryId] } });
  const original = f.runs.captureConnectorUploadOwner(f.run.runId);
  const handler = (
    method: "workspaces.contentMemory.forget" | "workspaces.contentMemory.setPolicy",
    params: object,
  ) =>
    workspacesMethods[method]!({
      method,
      params,
      client: { external: false },
      s: {
        repo: f.repo,
        events: f.events,
        runs: f.runs,
        contentMemory: memory,
        settings: { all: () => ({ dataDir: f.directory }) },
        checkpointDeletedData: () => {},
      },
      revokeArticleRuns: async () => f.runs.retireWorkspaceCompactions(f.space.workspaceId),
    } as unknown as MethodCtx);
  return {
    ...f,
    memory,
    article,
    original,
    handler,
    holdFactor: (hold: () => Promise<void>) => {
      retireFactor = hold;
    },
  };
}
it("awaits original transfer retirement and exact terminal descendants before the actual Forget source/key deletion", async () => {
  const f = await articleFixture(),
    entered = deferred(),
    finish = deferred();
  const root = f.repo.getRun(f.run.runId)!;
  const other = await f.memory.saveEligible({
    workspaceId: f.space.workspaceId,
    pageId: "other-article",
    documentEpoch: 1,
    sessionId: "other-original",
    url: "https://article.test/other",
    title: "Other article",
    text: "Unrelated retained article.",
  });
  for (const id of ["terminal-source", "terminal-child", "unrelated-source"])
    f.repo.saveRun({
      ...root,
      runId: id,
      status: "completed",
      config: {
        ...root.config,
        contextMemoryIds:
          id === "terminal-source" ? [f.article.memoryId] : id === "unrelated-source" ? [other.memoryId] : [],
        contextRunIds: id === "terminal-child" ? [root.runId] : [],
      },
    });
  const ledger = new DurableWriteLedger(f.repo.db),
    { intent } = ledger.begin({
      runId: root.runId,
      pageId: "connector",
      documentEpoch: 0,
      signature: "original-unknown-send",
      taskId: f.task.taskId,
    });
  ledger.fail(intent.id);
  const held = f.runs.connectorFileOperation(
    { runId: root.runId, signal: f.original.signal, checkOwner: f.original.checkCurrent },
    async () => {
      await finish.promise;
      return "not publishable after Forget";
    },
  );
  const joined = held.then(
    () => {
      throw new Error("A retired original operation cannot publish");
    },
    (error) => expect(error).toBeInstanceOf(Error),
  );
  let removedTransfers = false;
  const beforeRemoval: boolean[] = [];
  f.lifecycle.mockImplementation(async (ids, mode) => {
    expect(ids).not.toContain("unrelated-source");
    expect(f.original.signal.aborted).toBe(true);
    expect(() => f.original.checkCurrent()).toThrow();
    if (!removedTransfers)
      beforeRemoval.push(
        !!f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
      );
    if (mode === "retire") {
      entered.resolve();
      await joined;
    }
    if (mode === "forget") removedTransfers = true;
  });
  const operation = f.handler("workspaces.contentMemory.forget", {
    workspaceId: f.space.workspaceId,
    memoryId: f.article.memoryId,
  });
  await entered.promise;
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
  ).toBeDefined();
  finish.resolve();
  // Later post-delete redaction repeats the idempotent exact cleanup after the source is gone.
  await operation;
  expect(beforeRemoval.length).toBeGreaterThan(0);
  expect(beforeRemoval.every(Boolean)).toBe(true);
  expect(f.lifecycle.mock.calls.filter(([, mode]) => mode === "forget").map(([ids]) => new Set(ids))).toEqual(
    [
      new Set([root.runId, "terminal-source", "terminal-child"]),
      new Set([root.runId, "terminal-source", "terminal-child"]),
    ],
  );
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
  ).toBeUndefined();
  expect(ledger.getById(intent.id)?.status).toBe("uncertain");
  expect(f.repo.getRun("unrelated-source")?.config?.contextMemoryRevoked).toBeFalsy();
});
it.each(["forget", "policy"])(
  "%s refuses before source deletion when the original transfer cannot join",
  async (kind) => {
    const f = await articleFixture();
    f.lifecycle.mockRejectedValueOnce(new Error("Original upload close not acknowledged"));
    const failed =
      kind === "forget"
        ? f.handler("workspaces.contentMemory.forget", {
            workspaceId: f.space.workspaceId,
            memoryId: f.article.memoryId,
          })
        : f.handler("workspaces.contentMemory.setPolicy", {
            workspaceId: f.space.workspaceId,
            policy: { enabled: false, retentionDays: 30, allowedOrigins: [] },
          });
    await expect(failed).rejects.toThrow("could not be confirmed");
    expect(f.original.signal.aborted).toBe(true);
    expect(
      f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
    ).toBeDefined();
    expect((await f.memory.get(f.space.workspaceId, f.article.memoryId))?.text).toContain("original article");
    expect(() => f.runs.captureConnectorUploadOwner(f.run.runId)).toThrow();
  },
);
it("retains revoked transfer authority when old-factor retirement fails after deletion", async () => {
  const f = await articleFixture(),
    entered = deferred(),
    finish = deferred();
  let forgotten = false;
  f.lifecycle.mockImplementation(async (_ids, mode) => {
    if (mode === "forget") forgotten = true;
  });
  f.holdFactor(async () => {
    entered.resolve();
    await finish.promise;
    throw new Error("Old factor retirement failed");
  });
  const operation = f.handler("workspaces.contentMemory.forget", {
    workspaceId: f.space.workspaceId,
    memoryId: f.article.memoryId,
  });
  const refused = operation.then(
    () => {
      throw new Error("Forget must fail while key retirement is unknown");
    },
    (error) => expect(error.message).toContain("could not be confirmed"),
  );
  await entered.promise;
  expect(forgotten).toBe(true);
  expect(f.original.signal.aborted).toBe(true);
  expect(() => f.original.checkCurrent()).toThrow();
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.article.memoryId),
  ).toBeUndefined();
  finish.resolve();
  await refused;
  f.holdFactor(async () => {});
  await f.handler("workspaces.contentMemory.forget", {
    workspaceId: f.space.workspaceId,
    memoryId: f.article.memoryId,
  });
  expect(() => f.runs.captureConnectorUploadOwner(f.run.runId)).toThrow();
});
it.each(["additive", "same-origin normalization"])(
  "leaves original owners live for %s article policy edits",
  async (kind) => {
    const f = await articleFixture();
    await f.handler("workspaces.contentMemory.setPolicy", {
      workspaceId: f.space.workspaceId,
      policy: {
        enabled: true,
        retentionDays: 90,
        allowedOrigins:
          kind === "additive" ? ["https://article.test", "https://new.test"] : ["https://article.test/path"],
      },
    });
    expect(() => f.original.checkCurrent()).not.toThrow();
    expect(f.lifecycle.mock.calls.every(([ids]) => ids.length === 0)).toBe(true);
  },
);

it.each(["branch", "Set", "subagent"])(
  "retires and redacts the exact terminal %s descendant through the shared source closure",
  async (kind) => {
    const f = await articleFixture(),
      parent = f.repo.getRun(f.run.runId)!,
      childId = "original-derived-child",
      now = Date.now();
    const config = {
      ...parent.config,
      contextMemoryIds: [],
      contextRunIds: [],
      ...(kind === "branch" ? { branchSourceRunIds: [parent.runId] } : {}),
    };
    if (kind === "Set") {
      const source = {
        parentRunId: parent.runId,
        setId: "original-set",
        memberId: "original-member",
        url: "https://article.test/member",
        memberUrl: "https://article.test/member",
      };
      config.setMemberSource = { ...source, sourceDigest: setMemberSourceDigest(source) };
      f.repo.saveSet({
        setId: source.setId,
        name: "Original set",
        source: "urls",
        memberIds: [source.memberId],
        createdAt: now,
      });
      f.repo.saveMember({
        memberId: source.memberId,
        setId: source.setId,
        ordinal: 0,
        url: source.url,
        status: "completed",
      });
      f.repo.db
        .prepare(
          "INSERT INTO set_run_members(child_run_id,parent_run_id,set_id,member_id,source_digest,state,created_at,updated_at) VALUES(?,?,?,?,?,'completed',?,?)",
        )
        .run(
          childId,
          parent.runId,
          source.setId,
          source.memberId,
          config.setMemberSource.sourceDigest,
          now,
          now,
        );
    }
    f.repo.saveRun({
      ...parent,
      runId: childId,
      status: "completed",
      result: { report: "Exact descendant generated answer" },
      config,
    });
    if (kind === "subagent") {
      const group = SubagentGroupSchema.parse({
        groupId: randomUUID(),
        parentRunId: parent.runId,
        workspaceId: f.space.workspaceId,
        tokenBudget: 0,
        costBudgetUsd: 0,
        timeBudgetMs: 0,
        deadlineAt: 0,
        createdAt: now,
        state: "closed",
      });
      const agent = SubagentSchema.parse({
        agentId: randomUUID(),
        groupId: group.groupId,
        runId: childId,
        sourceRunId: parent.runId,
        goal: "Original child",
        profile: "default",
        pageIds: [],
        tokenAllocation: 0,
        costAllocationUsd: 0,
        maxModelCalls: 0,
        state: "completed",
        createdAt: now,
      });
      f.repo.db
        .prepare(
          "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,?,?)",
        )
        .run(group.groupId, parent.runId, f.space.workspaceId, JSON.stringify(group), group.state, now);
      f.repo.db
        .prepare(
          "INSERT INTO subagents(agent_id,group_id,reserved_run_id,run_id,body,state,created_at) VALUES(?,?,?,?,?,?,?)",
        )
        .run(agent.agentId, group.groupId, childId, childId, JSON.stringify(agent), agent.state, now);
    }
    await f.handler("workspaces.contentMemory.forget", {
      workspaceId: f.space.workspaceId,
      memoryId: f.article.memoryId,
    });
    expect(
      f.lifecycle.mock.calls.filter(([, mode]) => mode === "forget").map(([ids]) => new Set(ids)),
    ).toEqual([new Set([parent.runId, childId]), new Set([parent.runId, childId])]);
    expect(f.repo.getRun(childId)?.result).toBeUndefined();
    expect(f.repo.getRun(childId)?.config?.contextMemoryRevoked).toBe(true);
  },
);
