import { describe, expect, it } from "vitest";
import {
  EventBus,
  NullNativeBridge,
  PageService,
  Repo,
  ResponseStore,
  openDb,
  type DriverSet,
} from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import type { TabPatch, TabPatchOp, TabRecord } from "@aux/contracts";

/**
 * §7.1/§7.2: the runtime subscribes to the main-owned tab catalog. Human and
 * external surfaces register for agent attach; runtime echoes are skipped;
 * window ops carry main's activation decision.
 */
const record = (pageId: string, windowId = "main", over: Partial<TabRecord> = {}): TabRecord => ({
  pageId, windowId, url: `https://a.test/${pageId}`, title: pageId, loading: false, muted: false,
  audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false,
  runtimeOwned: false, generation: 0, createdAt: 1, lastActiveAt: 1, ...over,
});
const patch = (version: number, ops: TabPatchOp[]): TabPatch => ({ version, baseVersion: version - 1, ops, ts: version });
const upsert = (tab: TabRecord, origin: "human" | "runtime" | "external" = "human"): TabPatchOp => ({ op: "upsert", tab, origin });
const win = (windowId: string, order: string[], activePageId: string | null): TabPatchOp =>
  ({ op: "window", window: { windowId, order, activePageId } });

function harness() {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const attached: string[] = [];
  const disposed: string[] = [];
  let destroyAttached: (() => void) | undefined;
  const driver: BrowserDriver = {
    backend: "aux",
    connect: async () => {},
    disconnect: async () => {},
    isConnected: () => true,
    listTargets: async () => [],
    createTarget: async () => `t${attached.length}`,
    attach: async (targetId, pageId) => {
      attached.push(`${targetId}:${pageId}`);
      const page: DriverPage = {
        identity: { pageId, targetId, backend: "aux" },
        url: () => `https://a.test/${pageId}`,
        title: async () => pageId,
        isAttached: () => true,
        navigate: async () => {}, back: async () => {}, forward: async () => {},
        reload: async () => {}, stop: async () => {}, click: async () => {},
        dblclick: async () => {}, hover: async () => {}, fill: async () => {},
        typeText: async () => {}, press: async () => {}, check: async () => {},
        uncheck: async () => {}, select: async () => {}, scroll: async () => {},
        dragTo: async () => {}, clickPoint: async () => {}, uploadFiles: async () => {},
        waitFor: async () => ({ ok: true, timedOut: false, detail: "" }),
        waitForDownload: async () => ({ suggestedFilename: "f" }),
        handleDialog: async () => {}, collectScroll: async () => ({ items: [], collected: 0 }),
        screenshot: async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }),
        observe: async () => ({ url: "", title: "", viewport: { width: 0, height: 0, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: "", headings: [], elements: [], formFields: [], tables: [], links: [], dialogs: [], console: [], truncated: false, stats: { elementsTotal: 0, elementsShown: 0, textChars: 0, approxTokens: 0 } }),
        expandRef: async () => [], extract: async () => ({}), evaluate: async () => null,
        console: async () => [], setEvents: (handlers) => { destroyAttached = () => handlers.onDestroyed?.("closed"); },
        dispose: async () => { disposed.push(pageId); },
      };
      return page;
    },
  };
  const drivers: DriverSet = { aux: driver, chrome: null };
  const pages = new PageService({
    repo,
    events,
    native: new NullNativeBridge(),
    drivers: () => drivers,
    responses: new ResponseStore({ repo, events, flushDelayMs: 0 }),
    grants: [],
  });
  return { pages, events, attached, disposed, destroyAttached: () => destroyAttached?.() };
}

describe("PageService.syncCatalog", () => {
  it("omits a driver-detached tab before its catalog removal arrives", async () => {
    const { pages, destroyAttached } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("one"))]));
    destroyAttached();
    expect(pages.list().map(page => page.pageId)).not.toContain("one");
    expect(pages.list({ includeDetached: true }).map(page => page.pageId)).toContain("one");
  });

  it("registers human-created tabs on the stable marker", async () => {
    const { pages, attached } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("one"))]));
    const page = pages.get("one");
    expect(page).toMatchObject({ url: "https://a.test/one", windowId: "main", ownedByRuntime: false });
    expect(attached).toEqual(["atab-one:one"]);
  });

  it("activates a new tab registered in the same patch as its window op", async () => {
    const { pages } = harness();
    await pages.syncCatalog(patch(1, [win("main", ["one"], "one"), upsert(record("one"))]));
    expect(pages.activePageIdFor("main")).toBe("one");
    expect(pages.activePageId).toBe("one");
  });

  it("does not re-register runtime-owned echoes", async () => {
    const { pages, attached } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("r1", "main", { runtimeOwned: true }), "runtime")]));
    expect(attached).toEqual([]);
    expect(() => pages.get("r1")).toThrow();
  });

  it("preserves native runtime ownership when a catalog upsert races the open response", async () => {
    const { pages } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("raced", "main", { runtimeOwned: true }))]));
    expect(pages.get("raced")).toMatchObject({ ownedByRuntime: true, viewStatus: "background" });
  });

  it("returns the in-flight registration when the same tab upserts twice", async () => {
    const { pages, attached } = harness();
    const [a, b] = await Promise.all([
      pages.syncCatalog(patch(1, [upsert(record("one"))])),
      pages.syncCatalog(patch(2, [upsert(record("one", "main", { title: "next" }))])),
    ]);
    void a; void b;
    expect(attached).toEqual(["atab-one:one"]);
    // The driver owns title — the catalog echo must not clobber live fields.
    expect(pages.get("one").title).toBe("one");
  });

  it("moves the windowId on a live page without touching runtime fields", async () => {
    const { pages } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("one"))]));
    const before = pages.get("one");
    await pages.syncCatalog(patch(2, [upsert(record("one", "second"))]));
    const after = pages.get("one");
    expect(after.windowId).toBe("second");
    expect(after.documentEpoch).toBe(before.documentEpoch);
  });

  it("carries a native failure and clears it only when the catalog reports recovery", async () => {
    const { pages } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("one"))]));
    const error = { url: "https://a.test/one", code: -200,
      message: "ERR_CERT_COMMON_NAME_INVALID", upgradedFrom: "http://a.test/one" };
    await pages.syncCatalog(patch(2, [upsert(record("one", "main", { navigationError: error }))]));
    expect(pages.get("one").navigationError).toEqual(error);
    expect(pages.get("one").loading).toBe(false);
    await pages.syncCatalog(patch(3, [upsert(record("one", "main", { navigationError: error }))]));
    expect(pages.get("one").navigationError).toEqual(error);
    await pages.syncCatalog(patch(4, [upsert(record("one"))]));
    expect(pages.get("one").navigationError).toBeNull();
  });

  it("detaches removed tabs and honors main's chosen successor", async () => {
    const { pages, disposed } = harness();
    await pages.syncCatalog(patch(1, [upsert(record("one")), upsert(record("two")), win("main", ["one", "two"], "two")]));
    await pages.syncCatalog(patch(2, [{ op: "remove", pageId: "two" }, win("main", ["one"], "one")]));
    expect(pages.get("two").viewStatus).toBe("detached");
    expect(pages.list().some(page => page.pageId === "two")).toBe(false);
    expect(disposed).toEqual(["two"]);
    expect(pages.activePageIdFor("main")).toBe("one");
    expect(pages.get("one").viewStatus).not.toBe("detached");
  });
});
