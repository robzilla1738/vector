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
function pageFixture() {
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
    tabCommand: vi.fn(async (input: { command: { kind: string } }) => {
      if (input.command.kind === "close") return nativeClose();
      trace.push("native-blank"); return { status: "applied", targetId: "target" };
    }),
  });
  const driverPage = {
    identity: { pageId: "page", targetId: "target", backend: "aux" },
    url: () => url, title: async () => "Fixture", isAttached: () => true,
    navigate: async (next: string) => { trace.push("navigate"); url = next; driverEvents.onNavigated?.(next, 1); },
    setEvents: (value: DriverPageEvents) => { driverEvents = value; }, dispose, observe,
    observeFingerprint: async () => "stable-content",
  } as unknown as DriverPage;
  const driver = { backend: "aux", isConnected: () => true, attach: async () => driverPage } as unknown as BrowserDriver;
  const record = vi.fn();
  const pages = new PageService({ repo, events, native, drivers: () => ({ aux: driver, chrome: null }), recordAgentObservation: record });
  return { pages, trace, record, observe, dispose, nativeClose };
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

it("binds a scoped external dispatch to its actual session run and revokes before releasing ownership", async () => {
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
  await expect(invoke("pages.execute", { taskId: task.taskId, expectedRevision: task.revision,
    program: { pageId: "p1", steps: [{ id: "read", op: "extract", fields: [{ name: "text" }] }] },
  }, { external: true, connectionId: connection.connectionId, scope: connection.scope })).rejects.toThrow("driver failed");
  expect(trace).toEqual(["bind", "dispatch", "revoke"]);
  expect(repo.getRun(boundRun!)?.config).toMatchObject({ taskId: task.taskId, taskRevision: task.revision });
  expect(pageOwnership.snapshot().p1).toBeUndefined();
});
