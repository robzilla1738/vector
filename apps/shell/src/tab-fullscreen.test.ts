// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TabCatalogSnapshotSchema, type TabCatalogSnapshot, type TabRecord } from "@aux/contracts";
import { createHostClient } from "./host/client.generated";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { normalizePages } from "./store/pages";
import { emptyLayout } from "./workspace";
import { tabFullscreenPageId } from "./tab-fullscreen";

vi.mock("./feature-availability", () => ({ featureStage: () => "on" }));
const own = bridge.windowId;
const tab = (pageId: string, windowId = own): TabRecord => ({
  pageId,
  windowId,
  url: `https://video.test/${pageId}`,
  title: pageId,
  loading: false,
  muted: false,
  audible: true,
  canGoBack: false,
  canGoForward: false,
  popup: false,
  crashed: false,
  runtimeOwned: false,
  generation: 0,
  createdAt: 1,
  lastActiveAt: 1,
});
const snapshot = (version: number, owner: string | null, active = "one"): TabCatalogSnapshot =>
  TabCatalogSnapshotSchema.parse({
    version,
    tabs: [tab("one"), tab("two"), tab("other", "foreign")],
    windows: [
      { windowId: own, order: ["one", "two"], activePageId: active, tabFullscreenPageId: owner },
      { windowId: "foreign", order: ["other"], activePageId: "other", tabFullscreenPageId: "other" },
    ],
  });
const current = () => tabFullscreenPageId(useStore.getState(), own);
beforeEach(() => {
  useStore.setState({
    pages: normalizePages([]),
    layout: emptyLayout(),
    activePageId: null,
    tabFullscreenPageId: null,
    catalogVersion: 0,
    connected: false,
    restoringTabs: false,
    pendingRestoreIds: [],
  });
});
afterEach(() => vi.restoreAllMocks());
it("loads the exact window's HTML fullscreen from a native snapshot without runtime readiness or layout edits", () => {
  useStore.getState().syncTabsSnapshot(snapshot(1, "one"));
  const layout = JSON.stringify(useStore.getState().layout);
  expect(current()).toBe("one");
  expect(useStore.getState().connected).toBe(false);
  useStore.getState().syncTabsSnapshot(snapshot(2, null));
  expect(current()).toBeNull();
  expect(JSON.stringify(useStore.getState().layout)).toBe(layout);
});
it("applies tab-to-browser exit and same-window owner changes through the existing ordered catalog patch", () => {
  useStore.getState().syncTabsSnapshot(snapshot(1, "one"));
  const update = (version: number, activePageId: string, tabFullscreenPageId: string | null) =>
    useStore.getState().applyTabsPatch({
      version,
      baseVersion: version - 1,
      ts: version,
      ops: [
        {
          op: "window",
          window: { windowId: own, order: ["one", "two"], activePageId, tabFullscreenPageId },
        },
      ],
    });
  update(2, "two", "two");
  expect(current()).toBe("two");
  update(3, "two", null);
  expect(current()).toBeNull();
  useStore.getState().syncTabsSnapshot(snapshot(1, "one"));
  expect(current()).toBeNull();
});
it("does not accept a foreign, inactive, removed, or missing-window fullscreen owner", () => {
  useStore.getState().syncTabsSnapshot(snapshot(1, "other"));
  expect(current()).toBeNull();
  useStore.getState().syncTabsSnapshot(snapshot(2, "two"));
  expect(current()).toBeNull();
  useStore.getState().syncTabsSnapshot(snapshot(3, "one"));
  useStore
    .getState()
    .applyTabsPatch({ version: 4, baseVersion: 3, ts: 4, ops: [{ op: "remove", pageId: "one" }] });
  expect(useStore.getState().tabFullscreenPageId).toBeNull();
  expect(current()).toBeNull();
  useStore.getState().syncTabsSnapshot({ version: 5, tabs: [], windows: [] });
  expect(useStore.getState().tabFullscreenPageId).toBeNull();
});
it("drops uncertain fullscreen presentation on a catalog gap until the actual resync publishes", async () => {
  useStore.getState().syncTabsSnapshot(snapshot(1, "one"));
  let release!: (value: Awaited<ReturnType<typeof bridge.tabsSince>>) => void;
  const read = vi.spyOn(bridge, "tabsSince").mockImplementation(
    () =>
      new Promise((done) => {
        release = done;
      }),
  );
  useStore.getState().applyTabsPatch({
    version: 4,
    baseVersion: 3,
    ts: 4,
    ops: [
      {
        op: "window",
        window: { windowId: own, order: ["one", "two"], activePageId: "two", tabFullscreenPageId: "two" },
      },
    ],
  });
  expect(current()).toBeNull();
  expect(read).toHaveBeenCalledOnce();
  release({ kind: "snapshot", snapshot: snapshot(4, "two", "two") });
  await vi.waitFor(() => expect(current()).toBe("two"));
});
it.each(["crashed", "navigation", "worker", "window"])(
  "refuses %s page presentation even with an old owner field",
  (change) => {
    useStore.getState().syncTabsSnapshot(snapshot(1, "one"));
    const state = useStore.getState();
    const page = { ...state.pages.byId.one! };
    if (change === "crashed") page.viewStatus = "crashed";
    if (change === "navigation") page.navigationError = { url: page.url, code: -20, message: "blocked" };
    if (change === "worker") page.ownedByRuntime = true;
    if (change === "window") page.windowId = "foreign";
    useStore.setState({ pages: normalizePages([page]) });
    expect(current()).toBeNull();
  },
);

it("preserves fullscreen metadata through the real generated snapshot and event normalization", async () => {
  const callbacks = new Map<string, (value: unknown) => void>();
  const request = vi.fn(async () => snapshot(1, "one"));
  const client = createHostClient({
    request,
    subscribe: (event, callback) => {
      callbacks.set(event, callback);
      return () => {
        callbacks.delete(event);
      };
    },
  });
  useStore.getState().syncTabsSnapshot(await client.tabsSnapshot());
  expect(request).toHaveBeenCalledExactlyOnceWith("tabsSnapshot", []);
  expect(current()).toBe("one");
  const stop = client.onTabsPatch(useStore.getState().applyTabsPatch);
  callbacks.get("onTabsPatch")!({
    version: 2,
    baseVersion: 1,
    ts: 2,
    ops: [
      {
        op: "window",
        window: { windowId: own, order: ["one", "two"], activePageId: "two", tabFullscreenPageId: "two" },
      },
    ],
  });
  expect(current()).toBe("two");
  callbacks.get("onTabsPatch")!({
    version: 3,
    baseVersion: 2,
    ts: 3,
    ops: [
      {
        op: "window",
        window: { windowId: own, order: ["one", "two"], activePageId: "one", tabFullscreenPageId: null },
      },
    ],
  });
  expect(current()).toBeNull();
  stop();
  expect(callbacks.size).toBe(0);
});
