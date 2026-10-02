import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, expect, it, vi } from "vitest";
import { EventBus, NullNativeBridge, openDb, Repo, RunService, SetService, type ArtifactStore, type ModelClient, type PageService, type SettingsService } from "@aux/runtime";
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
      return { pageId: `controlled-${++n}`, targetId: `target-${n}`, source: input.source,
        isolation: { isolationId: `partition-${input.runId}`, runId: input.runId, taskId: input.taskId,
          taskRevision: input.taskRevision, inMemory: true as const, cookies: "empty" as const } };
    }),
    egressContext: vi.fn(async ({ tabId }: { tabId: string }) => { const page = targets.get(tabId)!; return {
      profileId: "profile", tabId, frameId: `frame-${tabId}`, documentToken: `${tabId}:${page.documentEpoch}`,
      sourceOrigin: page.url === "about:blank" ? "aux://blank" : new URL(page.url).origin, isolation: page.agentIsolation,
    }; }),
    egressInstall: vi.fn(async ({ lease }: { lease: EgressLease }) => { trace.push(`install:${lease.tabId}`); return { accepted: true as const }; }),
    egressRevoke: vi.fn(async () => ({ accepted: true as const })),
  });
  let runs: RunService;
  const egress = new BrowserEgress({ profileId: "profile", native,
    run: runId => { const run = repo.getRun(runId); return run && ["queued", "running", "planning", "needs_input"].includes(run.status)
      ? { taskRevision: 0, threadId: runId } : null; },
    page: pageId => targets.get(pageId)!, ownsPage: (runId, pageId) => runs.pageOwnership.snapshot()[pageId]?.runId === runId,
    audit: vi.fn(), approve: async () => false,
  });
  const execute = vi.fn(async (program: Program, ctx: { runId: string }) => {
    await egress.ensure(ctx.runId, program.pageId); trace.push(`execute:${program.pageId}`);
    return { status: "completed" as const, steps: [], extracted: { answer: "Read controlled copy" } };
  });
  const pages = {
    get: (id: string) => targets.get(id)!, list: () => [...targets.values()], livePageIds: () => [...targets.keys()], isAttached: (id: string) => targets.has(id),
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
