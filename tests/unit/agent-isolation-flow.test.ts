import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, expect, it, vi } from "vitest";
import { EventBus, NullNativeBridge, openDb, Repo, RunService, SetService, type ArtifactStore, type ModelClient, type PageService, type SettingsService } from "@aux/runtime";
import { AuxError } from "@aux/contracts";
import type { AgentPageCreate, EgressLease, Observation, PageTarget, Program } from "@aux/contracts";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";

const disposers: Array<() => void> = [];
afterEach(() => { for (const dispose of disposers.splice(0)) dispose(); });
function harness(url = "https://source.test/") {
  const db = openDb(":memory:"), repo = new Repo(db), events = new EventBus(repo);
  const targets = new Map<string, PageTarget>();
  targets.set("owner", { pageId: "owner", url, backend: "aux", targetId: "owner-target", title: "Source", documentEpoch: 1, sessionId: "synthetic-owner-attachment",
    lastRevision: 0, controller: "none", controllerEpoch: 0, ownedByRuntime: false, viewStatus: "visible", createdAt: 1, lastActiveAt: 1 });
  const trace: string[] = [];
  const created: AgentPageCreate[] = [];
  let n = 0;
  const native = Object.assign(new NullNativeBridge(), {
    createAgentPage: vi.fn(async (input: AgentPageCreate) => {
      created.push(input);
      return { pageId: `controlled-${++n}`, creationId: `synthetic-creation-${n}`, targetId: `target-${n}`, source: input.source,
        isolation: { isolationId: `partition-${input.runId}`, runId: input.runId, taskId: input.taskId,
          taskRevision: input.taskRevision, inMemory: true as const, cookies: "empty" as const } };
    }),
    egressContext: vi.fn(async ({ tabId }: { tabId: string }) => { const page = targets.get(tabId)!; return {
      controlGeneration: "fixture-native-generation", personControlled: false, profileId: "profile", tabId, frameId: `frame-${tabId}`, documentToken: `${tabId}:${page.documentEpoch}`,
      sourceOrigin: page.url === "about:blank" ? "aux://blank" : new URL(page.url).origin, isolation: page.agentIsolation,
    }; }),
    egressInstall: vi.fn(async ({ lease }: { lease: EgressLease }) => { trace.push(`install:${lease.tabId}`); return { accepted: true as const }; }),
    egressRevoke: vi.fn(async () => ({ accepted: true as const })),
  });
  let runs: RunService;
  const egress = new BrowserEgress({ runAncestry: runId => [runId], profileId: "profile", native,
    run: runId => { const run = repo.getRun(runId); return run && ["queued", "running", "planning", "needs_input"].includes(run.status)
      ? { taskRevision: 0, threadId: runId } : null; },
    page: pageId => { const page = targets.get(pageId); if (!page) throw new AuxError("not_found", `no page ${pageId}`); return page; }, ownsPage: (runId, pageId) => runs.pageOwnership.snapshot()[pageId]?.runId === runId,
    audit: vi.fn(), approve: async () => false,
  });
  const execute = vi.fn(async (program: Program, ctx: { runId: string }) => {
    await egress.ensure(ctx.runId, program.pageId); trace.push(`execute:${program.pageId}`);
    return { status: "completed" as const, steps: [], extracted: { answer: "Read controlled copy" } };
  });
  const pages = {
    get: (id: string) => { const page = targets.get(id); if (!page) throw new AuxError("not_found", `no page ${id}`); return page; }, list: () => [...targets.values()], livePageIds: () => [...targets.keys()], isAttached: (id: string) => targets.has(id),
    open: async (opts: Parameters<PageService["open"]>[0]) => {
      if (!opts.agentScope) throw new Error("ordinary open must not occur");
      const created = await native.createAgentPage({ ...opts.agentScope, windowId: "main", background: true });
      const page: PageTarget = { ...targets.get("owner")!, pageId: created.pageId, targetId: created.targetId,
        url: "about:blank", documentEpoch: 0, sessionId: "synthetic-controlled-attachment:" + created.pageId, ownedByRuntime: true, viewStatus: "background", agentIsolation: created.isolation };
      targets.set(page.pageId, page);
      await opts.beforeNavigate!(page);
      trace.push(`navigate:${page.pageId}`); page.url = opts.url; page.documentEpoch++;
      return page;
    },
    observe: async (pageId: string) => { trace.push(`observe:${pageId}`); return { observationId: `observation-${pageId}`, pageId, documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
      content: { url: targets.get(pageId)!.url, title: "Source", text: "Separate sign-in is required.", headings: [], elements: [], formFields: [], links: [], tables: [], frames: [], dialogs: [],
        viewport: { width: 800, height: 600, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 }, truncated: false, stats: { elementsTotal: 0, elementsShown: 0, textChars: 28, approxTokens: 7 } },
    } satisfies Observation; },
    closeCreated: async (original: PageTarget, _runId: string) => { trace.push(`close:${original.pageId}`); targets.delete(original.pageId); },
    execute, releaseAgent: vi.fn(), close: async (pageId: string) => { trace.push(`close:${pageId}`); targets.delete(pageId); return { ok: true }; },
  } as unknown as PageService;
  const model = { generateStructured: vi.fn(async () => ({ object: { status: "needs_input", message: "Separate sign-in", question: "Sign in on the temporary tab." }, inputTokens: 1, outputTokens: 1, durationMs: 1 })) } as unknown as ModelClient;
  const settings = { maxWorkers: () => 2, perOrigin: () => 2, maxModelCalls: () => 4, model: () => model, plannerModel: () => "fixture",
    recoveryModel: () => undefined, visionModel: () => undefined, effectGrants: () => ["effect:read", "effect:write", "effect:egress"],
    effectGrantsForRun: () => ["effect:read", "effect:write", "effect:egress"], agentRoute: () => ({ modelId: "fixture", reasoning: "medium" }),
  } as unknown as SettingsService;
  const sets = new SetService(repo, events, pages);
  runs = new RunService({ turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId)), repo, events, pages, sets, settings, browserEgress: egress,
    artifacts: { save: () => ({ artifactId: "fixture" }) } as unknown as ArtifactStore,
    translateSteps: (_id, steps) => steps, nativeAvailable: () => true });
  disposers.push(() => { egress.close(); repo.flush(); db.close(); });
  return { repo, runs, pages, native, trace, created, execute, targets, sets, model };
}
async function until(check: () => boolean) {
  await vi.waitFor(() => expect(check()).toBe(true), { timeout: 3000, interval: 10 });
}

it("copies only the selected URL before any model observation and leaves the owner tab untouched", async () => {
  const f = harness();
  const run = await f.runs.coordinator.start({ goal: "Read the selected website", pageIds: ["owner"] });
  await until(() => f.repo.getRun(run.runId)?.status === "needs_input");
  const current = f.repo.getRun(run.runId)!;
  expect(current.pageIds).toEqual(["controlled-1"]);
  expect(current.config?.isolatedPageSources).toEqual([{ sourcePageId: "owner", pageId: "controlled-1", url: "https://source.test/" }]);
  expect(f.created[0]?.source).toEqual({ tabId: "owner", expectedUrl: "https://source.test/", documentToken: "owner:1" });
  expect(f.trace.slice(0, 2)).toEqual(["install:controlled-1", "navigate:controlled-1"]);
  expect(f.trace).toContain("observe:controlled-1"); expect(f.trace).not.toContain("observe:owner");
  expect(f.targets.get("owner")).toMatchObject({ url: "https://source.test/", controller: "none", ownedByRuntime: false });
  f.runs.cancel(run.runId); await until(() => !f.runs.coordinator.controls.has(run.runId));
});

it("refuses the old planner’s blank page without creating or actuating an owner tab", async () => {
  const f = harness("about:blank");
  const run = await f.runs.coordinator.start({ goal: "Start browsing", pageIds: ["owner"] });
  await until(() => f.repo.getRun(run.runId)?.status === "failed");
  expect(f.repo.getRun(run.runId)?.error).toContain("protected temporary tab");
  expect(f.created).toEqual([]); expect(f.trace).toEqual([]);
});

it("saved programs acquire a protected copy and dispatch only on that copy", async () => {
  const f = harness();
  f.repo.saveProgram({ programId: "saved", name: "Read", version: 1, siteKey: "*", parameters: [],
    stepsJson: JSON.stringify([{ id: "read", op: "extract", fields: [{ name: "answer" }] }]), useCount: 0, createdAt: 1 });
  const { runId } = f.runs.runProgram({ programId: "saved", pageId: "owner" });
  await until(() => f.repo.getRun(runId)?.status === "completed");
  expect(f.execute.mock.calls[0]?.[0].pageId).toBe("controlled-1");
  expect(f.runs.pageOwnership.snapshot()).toEqual({});
  expect(f.trace).not.toContain("execute:owner"); expect(f.native.egressRevoke).toHaveBeenCalled();
});


it("set replay uses an isolated worker and releases its authority before closing it", async () => {
  const f = harness();
  const set = await f.sets.create({ name: "Selected source", source: "tabs", pageIds: ["owner"] });
  const { runId } = await f.runs.mapSet({ setId: set.setId, program: { steps: [{ id: "reload", op: "reload" }] } });
  await until(() => ["completed", "partially_completed", "failed"].includes(f.repo.getRun(runId)?.status ?? ""));
  expect(f.repo.getRun(runId)?.status).toBe("completed");
  expect(f.execute.mock.calls[0]?.[0].pageId).toBe("controlled-1");
  expect(f.native.egressRevoke).toHaveBeenCalled(); expect(f.trace).toContain("close:controlled-1");
  expect(f.targets.has("owner")).toBe(true); expect(f.trace).not.toContain("execute:owner");
  expect(f.runs.pageOwnership.snapshot()).toEqual({});
});

it("a closed explicit source rejects start without substituting another page or persisting a run", async () => {
  const f = harness();
  const ref = { pageId: "owner", url: "https://source.test/", documentEpoch: 1, sessionId: "synthetic-owner-attachment" };
  f.targets.delete("owner");
  await expect(f.runs.start({ goal: "Read this selected source", pageIds: ["owner"], contextPageRefs: [ref] }))
    .rejects.toMatchObject({ code: "not_found", message: "The selected browser tab is no longer available. Choose another tab or remove its browser context before trying again." });
  expect(f.repo.listRuns(10)).toEqual([]);
  expect(f.created).toEqual([]);
  expect(f.model.generateStructured).not.toHaveBeenCalled();
});

it("a selected source closed during queued turn setup fails actionably before copying or model observation", async () => {
  const f = harness();
  let resume!: () => void;
  const held = new Promise<void>(resolve => { resume = resolve; });
  const begin = f.runs.coordinator.deps.turnMentions.begin.bind(f.runs.coordinator.deps.turnMentions);
  vi.spyOn(f.runs.coordinator.deps.turnMentions, "begin").mockImplementation(async (...args) => { await held; return begin(...args); });
  const run = await f.runs.coordinator.start({ goal: "Read this selected source", pageIds: ["owner"] });
  f.targets.delete("owner");
  resume();
  await until(() => f.repo.getRun(run.runId)?.status === "failed");
  expect(f.repo.getRun(run.runId)?.error).toBe("The selected browser tab is no longer available. Choose another tab or remove its browser context before trying again.");
  expect(f.repo.getRun(run.runId)?.pageIds).toEqual(["owner"]);
  expect(f.created).toEqual([]);
  expect(f.trace).toEqual([]);
  expect(f.model.generateStructured).not.toHaveBeenCalled();
});

it("unexpected page lookup failures retain their original error instead of masquerading as a closed tab", async () => {
  const f = harness();
  const error = new AuxError("permission_denied", "Source authority revoked");
  vi.spyOn(f.pages, "get").mockImplementation(() => { throw error; });
  await expect(f.runs.start({ goal: "Read", pageIds: ["owner"], contextPageRefs: [{ pageId: "owner", url: "https://source.test/", documentEpoch: 1 }] }))
    .rejects.toBe(error);
  expect(f.repo.listRuns(10)).toEqual([]);
});

it("a selected tab closed while native source context is held cannot copy or replace its context", async () => {
  const f = harness();
  let resume!: () => void;
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const held = new Promise<void>(resolve => { resume = resolve; });
  const context = f.native.egressContext.getMockImplementation()!;
  f.native.egressContext.mockImplementation(async input => {
    const receipt = await context(input);
    entered();
    await held;
    return receipt;
  });
  const run = await f.runs.coordinator.start({ goal: "Read selected website", pageIds: ["owner"] });
  try {
    await started;
    f.targets.delete("owner");
  } finally { resume(); }
  await until(() => f.repo.getRun(run.runId)?.status === "failed");
  expect(f.repo.getRun(run.runId)?.error).toBe("The selected browser tab is no longer available. Choose another tab or remove its browser context before trying again.");
  expect(f.repo.getRun(run.runId)?.pageIds).toEqual(["owner"]);
  expect(f.created).toEqual([]);
  expect(f.trace).toEqual([]);
  expect(f.model.generateStructured).not.toHaveBeenCalled();
});

it("preserves acknowledged takeover state and newer configuration when a protected open returns late", async () => {
  const f = harness();
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  const open = f.pages.open.bind(f.pages);
  vi.spyOn(f.pages, "open").mockImplementation(async options => {
    const page = await open(options);
    entered();
    await held;
    return page;
  });
  const run = await f.runs.coordinator.start({ goal: "Read selected website", pageIds: ["owner"] });
  try {
    await started;
    f.targets.get("controlled-1")!.controller = "human";
    expect(f.repo.getRun(run.runId)?.status).toBe("queued");
    await f.runs.pauseForTakeover(run.runId);
    expect(f.repo.getRun(run.runId)?.status).toBe("paused");
    const current = f.repo.getRun(run.runId)!;
    current.config = { ...current.config, instructions: "Newer person-authored instructions" };
    f.repo.saveRun(current);
    release();
    await until(() => !!f.repo.getRun(run.runId)?.config?.isolatedPageSources?.length);
    expect(f.repo.getRun(run.runId)).toMatchObject({ status: "paused", config: { instructions: "Newer person-authored instructions" } });
    expect(f.targets.get("controlled-1")?.controller).toBe("human");
    expect(f.trace).not.toContain("close:controlled-1");
    expect(f.model.generateStructured).not.toHaveBeenCalled();
  } finally {
    release();
    await f.runs.cancel(run.runId);
    await until(() => !f.runs.coordinator.controls.has(run.runId));
  }
});

it("does not close a person-held protected tab when its creator is cancelled before open returns", async () => {
  const f = harness();
  let entered!: () => void, release!: () => void, returned!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  const completed = new Promise<void>(resolve => { returned = resolve; });
  const open = f.pages.open.bind(f.pages);
  vi.spyOn(f.pages, "open").mockImplementation(async options => {
    const page = await open(options);
    entered();
    await held;
    returned();
    return page;
  });
  const run = await f.runs.coordinator.start({ goal: "Read selected website", pageIds: ["owner"] });
  try {
    await started;
    f.targets.get("controlled-1")!.controller = "human";
    await f.runs.cancel(run.runId);
  } finally { release(); }
  await completed;
  await until(() => f.runs.pageOwnership.snapshot()["controlled-1"] === undefined);
  expect(f.repo.getRun(run.runId)?.status).toBe("cancelled");
  expect(f.targets.get("controlled-1")?.controller).toBe("human");
  expect(f.trace).not.toContain("close:controlled-1");
  expect(f.model.generateStructured).not.toHaveBeenCalled();
});

it("continues cancelled creator cleanup past a detached copy while preserving a person-held copy", async () => {
  const f = harness();
  for (const pageId of ["owner-2", "owner-3"])
    f.targets.set(pageId, { ...f.targets.get("owner")!, pageId, targetId: `${pageId}-target`, sessionId: `${pageId}-attachment` });
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  const open = f.pages.open.bind(f.pages);
  vi.spyOn(f.pages, "open").mockImplementation(async options => {
    const page = await open(options);
    if (page.pageId === "controlled-3") { entered(); await held; }
    return page;
  });
  const run = await f.runs.coordinator.start({ goal: "Read selected websites", pageIds: ["owner", "owner-2", "owner-3"] });
  try {
    await started;
    f.targets.get("controlled-1")!.controller = "human";
    f.targets.delete("controlled-2");
    await f.runs.cancel(run.runId);
  } finally { release(); }
  await until(() => f.trace.includes("close:controlled-3"));
  expect(f.repo.getRun(run.runId)?.status).toBe("cancelled");
  expect(f.targets.get("controlled-1")?.controller).toBe("human");
  expect(f.trace.filter(entry => entry.startsWith("close:"))).toEqual(["close:controlled-3"]);
  expect(f.runs.pageOwnership.snapshot()).not.toHaveProperty("controlled-1");
  expect(f.runs.pageOwnership.snapshot()).not.toHaveProperty("controlled-2");
  expect(f.runs.pageOwnership.snapshot()).not.toHaveProperty("controlled-3");
  expect(f.model.generateStructured).not.toHaveBeenCalled();
});

async function completedSourceTurn(f: ReturnType<typeof harness>) {
  const owner = f.targets.get("owner")!;
  const ref = { pageId: owner.pageId, url: owner.url, documentEpoch: owner.documentEpoch, sessionId: owner.sessionId };
  const run = await f.runs.start({ goal: "Read exact source", pageIds: [owner.pageId], contextPageRefs: [ref], chatId: "protected-retry" });
  await until(() => f.repo.getRun(run.runId)?.status === "needs_input");
  await f.runs.cancel(run.runId);
  await until(() => !f.runs.coordinator.controls.has(run.runId));
  return { run: f.repo.getRun(run.runId)!, ref, owner };
}

it("retries a genuine protected-copy turn from its unchanged original source after the old copy closes", async () => {
  const f = harness();
  const { run, ref } = await completedSourceTurn(f);
  expect(run.pageIds).toEqual(["controlled-1"]);
  expect(run.config?.isolatedPageSources).toEqual([{ sourcePageId: "owner", pageId: "controlled-1", url: ref.url }]);
  await f.pages.close("controlled-1");
  const retried = await f.runs.retry(run.runId);
  expect(retried.config?.contextPageRefs).toEqual([ref]);
  await until(() => f.repo.getRun(retried.runId)?.status === "needs_input");
  expect(f.repo.getRun(retried.runId)?.pageIds).toEqual(["controlled-2"]);
  expect(f.created).toHaveLength(2);
  expect(f.created[1]?.source).toEqual({ tabId: "owner", expectedUrl: ref.url, documentToken: "owner:1" });
  expect(f.trace).not.toContain("observe:owner");
  expect(f.targets.get("owner")).toMatchObject({ ownedByRuntime: false, url: ref.url, documentEpoch: ref.documentEpoch, sessionId: ref.sessionId });
  await f.runs.cancel(retried.runId);
  await until(() => !f.runs.coordinator.controls.has(retried.runId));
});

it.each(["document", "session", "url", "ownership", "closed", "missing-map", "ambiguous-map", "missing-snapshot"] as const)(
  "refuses protected-copy retry after original %s drift without creating another tab or run", async drift => {
    const f = harness();
    const { run, owner } = await completedSourceTurn(f);
    if (drift === "document") owner.documentEpoch++;
    if (drift === "session") owner.sessionId = "replacement-person-document";
    if (drift === "url") owner.url = "https://different.test/";
    if (drift === "ownership") owner.ownedByRuntime = true;
    if (drift === "closed") f.targets.delete(owner.pageId);
    if (drift === "missing-map") run.config!.isolatedPageSources = undefined;
    if (drift === "ambiguous-map") run.config!.isolatedPageSources!.push({ ...run.config!.isolatedPageSources![0]! });
    if (drift === "missing-snapshot") run.config!.contextPageRefs = undefined;
    f.repo.saveRun(run);
    await expect(f.runs.retry(run.runId)).rejects.toMatchObject({ code: "conflict" });
    expect(f.created).toHaveLength(1);
    expect(f.repo.listRuns(20)).toHaveLength(1);
  });
