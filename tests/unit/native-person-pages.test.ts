import { createHash, randomUUID } from "node:crypto";
import { expect, it, vi } from "vitest";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import { PERSON_OBSERVER_WRAPPED_SOURCE } from "@aux/chromium-driver";
import { EventBus, NullNativeBridge, Repo, openDb } from "@aux/runtime";
import {
  PageTargetSchema,
  type NativePersonReadReceipt,
  type PersonReadRequest,
  type PageTarget,
  type AgentPageIsolation,
} from "@aux/contracts";
import { PageRegistry } from "../../apps/runtime/dist/services/pages/registry.js";
import { PageLanes } from "../../apps/runtime/dist/services/pages/lanes.js";
import { ObservationService } from "../../apps/runtime/dist/services/pages/observation.js";
import { NativeViewSync } from "../../apps/runtime/dist/services/pages/native-sync.js";
import { PageOpener } from "../../apps/runtime/dist/services/pages/opener.js";
import { ActivationPolicy } from "../../apps/runtime/dist/services/pages/activation.js";
import { TurnMentionService } from "../../apps/runtime/dist/services/turn-mention-service.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const producerSha256 = createHash("sha256").update(PERSON_OBSERVER_WRAPPED_SOURCE).digest("hex");
const isolation: AgentPageIsolation = {
  isolationId: "borrowed-session",
  runId: "run",
  taskRevision: 0,
  mode: "session",
  inMemory: false,
  cookies: "profile",
};
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  let documentId = randomUUID();
  let sessionId = randomUUID();
  const pageId = randomUUID();
  let url = "https://read.test/";
  let read = async (input: {
    pageId: string;
    request: PersonReadRequest;
  }): Promise<NativePersonReadReceipt> => ({
    pageId: input.pageId,
    readId: randomUUID(),
    documentId,
    sessionId,
    producerSha256,
    value:
      input.request.operation === "extract"
        ? { heading: "Ready" }
        : {
            url,
            title: "Plan",
            viewport: { width: 800, height: 600, scale: 1 },
            scroll: { x: 0, y: 0, maxY: 0 },
            text: "Ready",
            headings: ["Ready"],
            elements: [],
            formFields: [],
            tables: [],
            links: [],
            dialogs: [],
            truncated: false,
            elementsTotal: 0,
            nextRef: 1,
          },
  });
  const native = new NullNativeBridge();
  native.available = () => true;
  const pages: PageRegistry = new PageRegistry({
    repo,
    events,
    native: Object.assign(native, {
      personReadContext: async (pageId: string) => ({ pageId, documentId, sessionId, producerSha256, url }),
      personRead: (input: { pageId: string; request: PersonReadRequest }) => read(input),
    }),
    turnMentions: fixtureTurnMentions((id): PageTarget | undefined => pages.live.get(id)?.target),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const target = PageTargetSchema.parse({
    pageId,
    backend: "aux",
    targetId: "native-tab",
    url,
    title: "Plan",
    documentEpoch: 0,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "human",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  });
  const original = pages.addLive(target, null);
  const observation = new ObservationService(pages, new PageLanes(pages));
  return {
    pages,
    observation,
    original,
    pageId,
    navigate: (next: string) => {
      url = next;
      documentId = randomUUID();
      sessionId = randomUUID();
    },
    replaceDocument: () => {
      documentId = randomUUID();
      sessionId = randomUUID();
    },
    intercept: (next: typeof read) => {
      const before = read;
      read = next;
      return before;
    },
  };
}
it("observes an actual live native row without minting a driver attachment", async () => {
  const f = fixture();
  const result = await f.observation.observe(f.pageId, {});
  expect(result.content.text).toBe("Ready");
  expect(result.pageId).toBe(f.pageId);
  expect(f.original.driver).toBeNull();
  expect(f.original.target.sessionId).toBeDefined();
  expect(f.original.personReadDocumentId).toBeDefined();
});
it("joins retired person reads and binds the exact borrowed document before controlled observation", async () => {
  const f = fixture();
  f.original.target.controller = "none";
  const first = await f.observation.observe(f.pageId, {});
  const source = structuredClone(f.original.target);
  let handlers: DriverPageEvents = {};
  const driver = {
    isAttached: () => true,
    setEvents: (value: DriverPageEvents) => {
      handlers = value;
    },
    observe: vi.fn(async () => ({ ...first.content, text: "Controlled read" })),
    extract: vi.fn(async () => ({ heading: "Controlled heading" })),
    dispose: vi.fn(async () => {
      handlers.onDestroyed?.("closed");
    }),
  } as unknown as DriverPage;
  const attach = vi.fn(async () => driver);
  f.pages.deps.drivers = () => ({
    aux: { isConnected: () => true, attach } as unknown as BrowserDriver,
    chrome: null,
  });
  let release!: (value: NativePersonReadReceipt) => void;
  let entered!: () => void;
  const reading = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held = new Promise<NativePersonReadReceipt>((resolve) => {
    release = resolve;
  });
  const before = f.intercept(async () => {
    entered();
    return held;
  });
  const pendingRead = f.observation.observe(f.pageId, {}).catch((error) => error);
  await reading;
  const admitted = f.pages.admitSessionPage({ pageId: f.pageId, source, isolation, current: () => true });
  expect(attach).not.toHaveBeenCalled();
  release(
    await before({
      pageId: f.pageId,
      request: { operation: "observe", maxElements: 120, maxTextChars: 6000 },
    }),
  );
  await expect(pendingRead).resolves.toMatchObject({ code: "target_detached" });
  await admitted;
  expect(f.original.target.sessionId).toBe(source.sessionId);
  expect(f.original.history).toHaveLength(0);
  expect(f.original.personReadDocumentId).toBeUndefined();
  expect((await f.observation.observe(f.pageId, {})).content.text).toBe("Controlled read");
  expect((await f.observation.extract(f.pageId, [{ name: "heading", selector: "h1" }])).fields.heading).toBe(
    "Controlled heading",
  );
  handlers.onDialog?.({ type: "alert", message: "Bound to preserved source" });
  expect(f.original.lastDialog?.message).toBe("Bound to preserved source");
  await f.pages.retireSessionPage(f.pageId, isolation);
  expect(driver.dispose).toHaveBeenCalledOnce();
  expect(f.original.target.viewStatus).toBe("visible");
  expect(f.original.target.agentIsolation).toBeUndefined();
  expect(f.original.driver).toBeNull();
  f.intercept(before);
  expect((await f.observation.observe(f.pageId, {})).content.text).toBe("Ready");
});
it("refuses a held borrowed attachment after takeover and never reuses its source on a replacement", async () => {
  const f = fixture();
  f.original.target.controller = "none";
  await f.pages.prepareReadPage(f.pageId);
  const source = structuredClone(f.original.target);
  let release!: () => void;
  let entered!: () => void;
  const attaching = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const driver = {
    isAttached: () => true,
    setEvents: vi.fn(),
    dispose: vi.fn(async () => {}),
  } as unknown as DriverPage;
  f.pages.deps.drivers = () => ({
    aux: {
      isConnected: () => true,
      attach: async () => {
        entered();
        await held;
        return driver;
      },
    } as unknown as BrowserDriver,
    chrome: null,
  });
  const admission = f.pages.admitSessionPage({ pageId: f.pageId, source, isolation, current: () => true });
  await attaching;
  f.original.target.controllerEpoch++;
  f.original.target.controller = "human";
  release();
  await expect(admission).rejects.toMatchObject({ code: "ref_stale" });
  expect(driver.dispose).toHaveBeenCalledOnce();
  expect(f.original.driver).toBeNull();
  expect(f.original.target.agentIsolation).toEqual(isolation);
  await f.pages.attachVisible(f.pageId);
  expect(f.original.driver).toBeNull();
  const preparePerson = vi.spyOn(f.pages.deps.native, "personReadContext");
  await f.pages.retireSessionPage(f.pageId, isolation);
  expect(preparePerson).not.toHaveBeenCalled();
  expect(f.original.target.controller).toBe("human");
  expect(f.original.target.sessionId).toBeUndefined();
  f.pages.installDriver(f.original, driver);
  expect(f.original.target.sessionId).not.toBe(source.sessionId);
});
it("increments same-URL replacement epoch once and invalidates prior observation state", async () => {
  const f = fixture();
  const first = await f.observation.observe(f.pageId, {});
  f.replaceDocument();
  await f.pages.prepareReadPage(f.pageId);
  const next = await f.observation.observe(f.pageId, {});
  expect(next.documentEpoch).toBe(first.documentEpoch + 1);
  expect(f.original.history).toHaveLength(1);
  expect(next.deltaFrom).toBeUndefined();
  expect((await f.observation.observe(f.pageId, {})).documentEpoch).toBe(next.documentEpoch);
});
it("does not double-count a document already retired by a native catalog navigation", async () => {
  const f = fixture();
  await f.observation.observe(f.pageId, {});
  f.original.target.documentEpoch++;
  f.pages.resetDocumentState(f.original);
  f.replaceDocument();
  await f.pages.prepareReadPage(f.pageId);
  expect((await f.observation.observe(f.pageId, {})).documentEpoch).toBe(1);
});
it("rejects a held native response after replacing the live row under the same page ID", async () => {
  const f = fixture();
  let resolve!: (value: NativePersonReadReceipt) => void;
  const pending = new Promise<NativePersonReadReceipt>((done) => {
    resolve = done;
  });
  const before = f.intercept(async () => pending);
  const result = f.observation.observe(f.pageId, {});
  await Promise.resolve();
  await Promise.resolve();
  f.pages.addLive({ ...f.original.target }, null);
  resolve(
    await before({
      pageId: f.pageId,
      request: { operation: "observe", maxElements: 120, maxTextChars: 6000 },
    }),
  );
  await expect(result).rejects.toMatchObject({ code: "target_detached" });
  expect(f.original.history).toHaveLength(0);
});
it("joins extract to its original observed native document", async () => {
  const f = fixture();
  const before = f.intercept(async (input) => {
    if (input.request.operation === "extract") f.replaceDocument();
    return before(input);
  });
  await expect(f.observation.extract(f.pageId, [{ name: "heading", selector: "h1" }])).rejects.toMatchObject({
    code: "ref_stale",
  });
});
it("refuses controlled person rows and missing subtree without generic CDP fallback", async () => {
  const f = fixture();
  await expect(f.observation.observe(f.pageId, { scope: "subtree" })).rejects.toMatchObject({
    code: "invalid_params",
  });
  f.original.target.controller = "agent";
  await expect(f.observation.observe(f.pageId, {})).rejects.toMatchObject({ code: "permission_denied" });
});

it("refuses a retired read session until current context is explicitly prepared", async () => {
  const f = fixture();
  await f.pages.prepareReadPage(f.pageId);
  await f.observation.observe(f.pageId, {});
  const originalSession = f.original.target.sessionId;
  f.replaceDocument();
  await expect(f.observation.observe(f.pageId, {})).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.original.target.sessionId).toBe(originalSession);
  await f.pages.prepareReadPage(f.pageId);
  expect(f.original.target.sessionId).not.toBe(originalSession);
  expect((await f.observation.observe(f.pageId, {})).content.text).toBe("Ready");
});
it("rejects held context metadata when its original live row is replaced", async () => {
  const f = fixture();
  let release!: (value: unknown) => void;
  const pending = new Promise<unknown>((done) => {
    release = done;
  });
  Object.assign(f.pages.deps.native, { personReadContext: async () => pending });
  const result = f.pages.prepareReadPage(f.pageId);
  const replacement = f.pages.addLive({ ...f.original.target }, null);
  release({
    pageId: f.pageId,
    documentId: randomUUID(),
    sessionId: randomUUID(),
    producerSha256,
    url: f.original.target.url,
  });
  await expect(result).rejects.toMatchObject({ code: "target_detached" });
  expect(replacement.target.sessionId).toBeUndefined();
});

it("binds explicit read mentions to a native session and refuses same-URL replacement", async () => {
  const f = fixture();
  await f.pages.prepareReadPage(f.pageId);
  const service = new TurnMentionService({
    page: (id) => f.pages.live.get(id)?.target,
    prepareReadPage: (id) => f.pages.prepareReadPage(id),
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const page = f.original.target;
  await service.begin(
    "run",
    [
      {
        kind: "tab",
        pageId: page.pageId,
        url: page.url,
        title: page.title,
        sessionId: page.sessionId!,
        documentEpoch: page.documentEpoch,
        access: "read",
      },
    ],
    [],
  );
  expect(await service.require("run", f.pageId, "read")).toEqual({ status: "available" });
  expect(await service.require("run", f.pageId, "act")).toMatchObject({ status: "unavailable" });
  f.replaceDocument();
  expect(await service.require("run", f.pageId, "read")).toMatchObject({ status: "unavailable" });
  expect(f.original.driver).toBeNull();
});
it("listing tab metadata grants no native page preparation or read access", async () => {
  const f = fixture();
  let preparations = 0;
  const service = new TurnMentionService({
    page: (id) => f.pages.live.get(id)?.target,
    prepareReadPage: async (id) => {
      preparations++;
      await f.pages.prepareReadPage(id);
    },
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  await service.begin("run", [{ kind: "tabs" }], []);
  expect(preparations).toBe(0);
  expect(service.list("run", [f.original.target])).toHaveLength(1);
  expect(await service.require("run", f.pageId, "read")).toMatchObject({ status: "unavailable" });
  expect(preparations).toBe(0);
});

it("publishes native catalog URL and document changes exactly once without a control attachment", async () => {
  const f = fixture();
  await f.pages.prepareReadPage(f.pageId);
  await f.observation.observe(f.pageId, {});
  const activation = new ActivationPolicy(f.pages);
  const sync = new NativeViewSync(f.pages, new PageOpener(f.pages, activation), activation);
  const url = "https://read.test/replacement";
  f.navigate(url);
  const tab = {
    pageId: f.pageId,
    windowId: "main",
    url,
    title: "Replacement",
    loading: false,
    muted: false,
    audible: false,
    canGoBack: true,
    canGoForward: false,
    popup: false,
    crashed: false,
    runtimeOwned: false,
    generation: 0,
    createdAt: 1,
    lastActiveAt: 1,
  };
  await sync.syncCatalog({
    version: 1,
    baseVersion: 0,
    ts: 1,
    ops: [{ op: "upsert", origin: "human", tab }],
  });
  expect(f.original.target).toMatchObject({ url, title: "Replacement", documentEpoch: 1 });
  expect(f.original.history).toHaveLength(0);
  expect((await f.observation.observe(f.pageId, {})).content.url).toBe(url);
  f.replaceDocument();
  await sync.syncCatalog({
    version: 2,
    baseVersion: 1,
    ts: 2,
    ops: [{ op: "upsert", origin: "human", tab }],
  });
  expect(f.original.target.documentEpoch).toBe(2);
  await sync.syncCatalog({
    version: 3,
    baseVersion: 2,
    ts: 3,
    ops: [{ op: "upsert", origin: "human", tab }],
  });
  expect(f.original.target.documentEpoch).toBe(2);
  expect(f.original.driver).toBeNull();
});
it("refuses context metadata from a newer native URL before its catalog update", async () => {
  const f = fixture();
  await f.pages.prepareReadPage(f.pageId);
  const session = f.original.target.sessionId;
  f.navigate("https://read.test/newer");
  await expect(f.pages.prepareReadPage(f.pageId)).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.original.target.sessionId).toBe(session);
});

it("refuses persisted context after its original live native row disappears", async () => {
  const f = fixture();
  await f.pages.prepareReadPage(f.pageId);
  f.pages.live.delete(f.pageId);
  await expect(f.pages.prepareReadPage(f.pageId)).rejects.toMatchObject({ code: "target_detached" });
});

it("publishes native discard and wake while ordinary visibility follows window and split selection", async () => {
  const f = fixture();
  const activation = new ActivationPolicy(f.pages);
  const sync = new NativeViewSync(f.pages, new PageOpener(f.pages, activation), activation);
  const secondId = randomUUID();
  const second = f.pages.addLive({ ...f.original.target, pageId: secondId, viewStatus: "hidden" }, null);
  const task = f.pages.addLive(
    {
      ...f.original.target,
      pageId: randomUUID(),
      ownedByRuntime: true,
      controller: "agent",
      viewStatus: "background",
    },
    null,
  );
  const updates: Record<string, unknown>[] = [];
  const stop = f.pages.deps.events.subscribe((event) => {
    if (event.type === "page.updated") updates.push(event.payload);
  });
  const tab = (pageId: string, lifecycle: "live" | "discarded", split?: PageTarget["split"]) => ({
    pageId,
    windowId: "main",
    url: f.original.target.url,
    title: "Plan",
    loading: false,
    muted: false,
    audible: false,
    canGoBack: false,
    canGoForward: false,
    popup: false,
    crashed: false,
    runtimeOwned: false,
    generation: 0,
    createdAt: 1,
    lastActiveAt: 1,
    lifecycle,
    split,
  });
  f.pages.activeByWindow.set("main", f.pageId);
  await sync.syncCatalog({
    version: 1,
    baseVersion: 0,
    ts: 1,
    ops: [
      { op: "window", window: { windowId: "main", order: [f.pageId, secondId], activePageId: secondId } },
      { op: "upsert", tab: tab(f.pageId, "discarded") },
      { op: "upsert", tab: tab(secondId, "live") },
    ],
  });
  expect(f.original.target).toMatchObject({
    lifecycle: "discarded",
    viewStatus: "hidden",
    controller: "human",
  });
  expect(second.target.viewStatus).toBe("visible");
  expect(task.target).toMatchObject({ controller: "agent", viewStatus: "background" });
  expect(updates).toContainEqual({ pageId: f.pageId, lifecycle: "discarded" });
  await sync.syncCatalog({
    version: 2,
    baseVersion: 1,
    ts: 2,
    ops: [
      { op: "window", window: { windowId: "main", order: [f.pageId, secondId], activePageId: f.pageId } },
      { op: "upsert", tab: tab(f.pageId, "live") },
    ],
  });
  expect(f.original.target).toMatchObject({ lifecycle: "live", viewStatus: "visible" });
  expect(second.target.viewStatus).toBe("hidden");
  await sync.syncCatalog({
    version: 3,
    baseVersion: 2,
    ts: 3,
    ops: [
      { op: "upsert", tab: tab(f.pageId, "live", { id: "split", index: 0 }) },
      { op: "upsert", tab: tab(secondId, "live", { id: "split", index: 1 }) },
    ],
  });
  expect(second.target.viewStatus).toBe("visible");
  stop();
});
