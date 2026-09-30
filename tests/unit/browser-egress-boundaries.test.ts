import { afterEach, expect, it, vi } from "vitest";
import { AgentConnectionService, EventBus, ExternalSessionService, makeInvoker, NullNativeBridge, openDb, PageService, Repo, TaskService, type Services } from "@aux/runtime";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { ObservationContent } from "@aux/contracts";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";

const cleanup: Array<() => void> = [];
afterEach(() => { for (const dispose of cleanup.splice(0)) dispose(); });
function repository() {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  cleanup.push(() => { repo.flush(); db.close(); });
  return { repo, events: new EventBus(repo) };
}
function pageFixture(extra: {
  prepareAgentEgress?: (runId: string, pageId: string) => Promise<void>;
  grantsForRun?: () => readonly ["effect:read", "effect:write"];
} = {}) {
  const { repo, events } = repository();
  let url = "about:blank";
  let driverEvents: DriverPageEvents = {};
  const trace: string[] = [];
  const observe = vi.fn(async () => ({
    url, title: "Fixture", text: "Source content has a concrete recipient boundary.",
    viewport: { width: 800, height: 600, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 },
    frames: [], headings: [], elements: [], formFields: [], tables: [], links: [], dialogs: [], console: [],
    truncated: false, stats: { elementsTotal: 0, elementsShown: 0, textChars: 53, approxTokens: 12 },
  } satisfies ObservationContent));
  const dispose = vi.fn(async () => {});
  const nativeClose = vi.fn(async () => ({ status: "applied" }));
  const native = Object.assign(new NullNativeBridge(), {
    available: () => true,
    createAgentPage: vi.fn(async () => ({ pageId: "native-minted-page", targetId: "target",
      isolation: { isolationId: "native-minted-partition", runId: "run", taskRevision: 0, inMemory: true as const, cookies: "empty" as const } })),
    tabCommand: vi.fn(async (input: { command: { kind: string } }) => {
      if (input.command.kind === "close") return nativeClose();
      trace.push("native-blank"); return { status: "applied", targetId: "target" };
    }),
  });
  const driverPage = {
    identity: { pageId: "page", targetId: "target", backend: "aux" },
    url: () => url, title: async () => "Fixture", isAttached: () => true,
    navigate: async (next: string) => { trace.push("navigate"); url = next; driverEvents.onNavigated?.(next, 1); },
    waitFor: async () => ({ ok: true, timedOut: false }),
    click: async () => { trace.push("click"); },
    setEvents: (value: DriverPageEvents) => { driverEvents = value; }, dispose, observe,
    observeFingerprint: async () => "stable-content",
  } as unknown as DriverPage;
  const driver = { backend: "aux", isConnected: () => true, attach: async () => driverPage } as unknown as BrowserDriver;
  const record = vi.fn();
  const pages = new PageService({ repo, events, native, drivers: () => ({ aux: driver, chrome: null }), recordAgentObservation: record, ...extra });
  return { pages, trace, record, observe, dispose, nativeClose, native, driverPage };
}

it("claims the actual blank document before first navigation and records even cached observations", async () => {
  const f = pageFixture();
  const page = await f.pages.open({ url: "https://source.test/", background: true, ownedByRuntime: true,
    beforeNavigate: async page => {
      expect(f.pages.get(page.pageId).url).toBe("about:blank");
      f.trace.push("authority-installed");
    },
  });
  expect(f.trace).toEqual(["native-blank", "authority-installed", "navigate"]);
  await f.pages.observe(page.pageId, {});
  await f.pages.observe(page.pageId, {});
  expect(f.observe).toHaveBeenCalledTimes(1);
  expect(f.record).toHaveBeenCalledTimes(2);
  expect(f.record).toHaveBeenLastCalledWith(page.pageId, "https://source.test/", "Source content has a concrete recipient boundary.");
});

it("closes the inert native blank and never navigates after authority installation fails", async () => {
  const f = pageFixture();
  await expect(f.pages.open({ url: "https://recipient.test/", background: true, ownedByRuntime: true,
    beforeNavigate: async () => { throw new Error("authority denied"); },
  })).rejects.toThrow("authority denied");
  expect(f.trace).toEqual(["native-blank"]);
  expect(f.nativeClose).toHaveBeenCalledTimes(1);
  expect(f.dispose).toHaveBeenCalledTimes(1);
  expect(f.pages.livePageIds()).toEqual([]);
});

function scopedDispatch() {
  const { repo, events } = repository();
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Read", objective: "Read",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Tab" }],
  });
  const agentConnections = new AgentConnectionService(repo);
  const connection = agentConnections.create({ name: "Fixture", client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
  }).connection;
  const externalSessions = new ExternalSessionService(repo, events);
  const pageOwnership = new PageOwnership();
  const trace: string[] = [];
  let boundRun: string | undefined;
  const revoke = vi.fn(() => { expect(pageOwnership.snapshot().p1).toBeDefined(); trace.push("revoke"); });
  const invoke = makeInvoker({ repo, events, agentConnections, externalSessions,
    pages: { get: () => ({ controller: "none" }), list: () => [],
      execute: async () => { trace.push("dispatch"); throw new Error("driver failed"); } },
    runs: { pageOwnership, acquireBrowserEgress: async (runId: string) => {
      boundRun = runId;
      expect(pageOwnership.snapshot().p1).toMatchObject({ runId });
      trace.push("bind"); return revoke;
    } },
    settings: { effectGrants: () => [], originPolicies: () => [], safetyCeiling: () => "ask" },
  } as unknown as Services);
  const client = { external: true as const, connectionId: connection.connectionId, scope: connection.scope };
  return { repo, invoke, trace, pageOwnership, task, client, boundRun: () => boundRun };
}

it("binds a scoped external dispatch to its actual session run and revokes before releasing ownership", async () => {
  const { repo, invoke, trace, pageOwnership, task, client, boundRun } = scopedDispatch();
  await expect(invoke("pages.execute", { taskId: task.taskId, expectedRevision: task.revision,
    program: { pageId: "p1", steps: [{ id: "go", op: "click", target: "r1" }] },
  }, client)).rejects.toThrow("driver failed");
  expect(trace).toEqual(["bind", "dispatch", "revoke"]);
  expect(repo.getRun(boundRun()!)?.config).toMatchObject({ taskId: task.taskId, taskRevision: task.revision });
  expect(pageOwnership.snapshot().p1).toBeUndefined();
});

it("lets a scoped read use the attached task page without transmission protection", async () => {
  const { invoke, trace, pageOwnership, task, client } = scopedDispatch();
  await expect(invoke("pages.execute", { taskId: task.taskId, expectedRevision: task.revision,
    program: { pageId: "p1", steps: [{ id: "wait", op: "waitFor", condition: { kind: "selector", selector: "#aux-trust-absent", state: "visible" } }] },
  }, client)).rejects.toThrow("driver failed");
  expect(trace).toEqual(["dispatch"]);
  expect(pageOwnership.snapshot().p1).toBeUndefined();
});

it("installs transmission protection for a write program and not for a read", async () => {
  const prepare = vi.fn(async () => {});
  const f = pageFixture({
    prepareAgentEgress: prepare,
    grantsForRun: () => ["effect:read", "effect:write"],
  });
  Object.assign(f.native, {
    acquireStage: async () => ({ ok: true }),
    releaseStage: async () => {},
  });
  const page = await f.pages.open({ url: "https://source.test/read", background: true, ownedByRuntime: true });
  (f.driverPage.identity as { pageId: string }).pageId = page.pageId;
  await f.pages.execute({
    pageId: page.pageId,
    steps: [{ id: "wait", op: "waitFor", condition: { kind: "selector", selector: "#x", state: "visible" } }],
  }, { runId: "run-read" });
  expect(prepare).not.toHaveBeenCalled();
  await f.pages.execute({
    pageId: page.pageId,
    steps: [{ id: "go", op: "click", target: "r1" }],
  }, { runId: "run-write" });
  expect(prepare).toHaveBeenCalledTimes(1);
  expect(prepare).toHaveBeenCalledWith("run-write", page.pageId);
  expect(f.trace).toContain("click");
});


it("uses native-minted controlled identity before navigation and never falls back to ordinary open", async () => {
  const f = pageFixture();
  const target = await f.pages.open({ url: "https://source.test/", background: true, ownedByRuntime: true,
    agentScope: { profileId: "profile", runId: "run", taskRevision: 0 },
    beforeNavigate: async page => { expect(page.agentIsolation?.isolationId).toBe("native-minted-partition"); f.trace.push("authority-installed"); },
  });
  expect(target.pageId).toBe("native-minted-page");
  expect(f.trace).toEqual(["authority-installed", "navigate"]);
  expect(f.native.createAgentPage).toHaveBeenCalledWith({ profileId: "profile", runId: "run", taskRevision: 0, windowId: "main", background: true });
  expect(f.native.tabCommand).not.toHaveBeenCalled();
});

it("keeps controlled creation inert when native isolation or source authority is substituted", async () => {
  const f = pageFixture();
  await expect(f.pages.open({ url: "https://source.test/", background: true, ownedByRuntime: true,
    agentScope: { profileId: "profile", runId: "other-run", taskRevision: 0 }, beforeNavigate: vi.fn(),
  })).rejects.toThrow("did not match this run");
  expect(f.trace).toEqual([]); expect(f.native.tabCommand).not.toHaveBeenCalled();
  expect(f.pages.livePageIds()).toEqual([]);
});

it("closes a newly minted controlled blank on denied install, without navigating or falling back", async () => {
  const f = pageFixture();
  await expect(f.pages.open({ url: "https://source.test/", background: true, ownedByRuntime: true,
    agentScope: { profileId: "profile", runId: "run", taskRevision: 0 },
    beforeNavigate: async () => { throw new Error("denied native install"); },
  })).rejects.toThrow("denied native install");
  expect(f.trace).toEqual([]); expect(f.nativeClose).toHaveBeenCalledOnce();
  expect(f.pages.livePageIds()).toEqual([]);
});

it("preserves isolation metadata when the native catalog announces the minted page before create returns", async () => {
  const f = pageFixture();
  const result = { pageId: "native-minted-page", targetId: "target", isolation: {
    isolationId: "native-minted-partition", runId: "run", taskRevision: 0, inMemory: true as const, cookies: "empty" as const,
  } };
  let announced!: ReturnType<PageService["registerExternal"]>;
  f.native.createAgentPage.mockImplementationOnce(async () => {
    announced = f.pages.registerExternal({ pageId: result.pageId, marker: `atab-${result.pageId}`,
      cdpTargetId: result.targetId, url: "about:blank", backend: "aux", ownedByRuntime: true });
    return result;
  });
  const page = await f.pages.open({ url: "https://source.test/", background: true, ownedByRuntime: true,
    agentScope: { profileId: "profile", runId: "run", taskRevision: 0 }, beforeNavigate: async () => {},
  });
  expect(await announced).toBe(page);
  expect(page.agentIsolation).toEqual(result.isolation);
  expect(f.pages.livePageIds()).toEqual([result.pageId]);
});
