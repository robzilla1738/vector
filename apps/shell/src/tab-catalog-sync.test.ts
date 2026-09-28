// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { TabRecordSchema, type PageTarget, type TabCatalogSnapshot, type TabPatch, type TabRecord } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";

afterEach(() => vi.restoreAllMocks());
const record = (pageId: string, over: Partial<TabRecord> = {}): TabRecord => ({
  pageId, windowId: "main", url: `https://a.test/${pageId}`, title: pageId, loading: false,
  muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false,
  crashed: false, runtimeOwned: false, generation: 0, createdAt: 1, lastActiveAt: 1, ...over,
});
const patch = (version: number, baseVersion: number, ops: TabPatch["ops"]): TabPatch => ({ version, baseVersion, ops, ts: version });
const snapshot = (version: number, tabs: TabRecord[], order: string[], activePageId: string | null): TabCatalogSnapshot =>
  ({ version, tabs, windows: [{ windowId: "main", order, activePageId }] });

function setup(catalogVersion = 3) {
  const layout = { ...emptyLayout(), order: ["one", "two"] };
  const pages = ["one", "two"].map(pageId => ({ pageId, title: pageId, url: `https://a.test/${pageId}`, viewStatus: "visible" } as PageTarget));
  useStore.setState({ pages, layout, activePageId: "two", catalogVersion, closedTabs: [] });
}

it("applies contiguous catalog patches into the page model", () => {
  setup();
  useStore.getState().applyTabsPatch(patch(4, 3, [
    { op: "upsert", tab: record("three") },
    { op: "window", window: { windowId: "main", order: ["one", "two", "three"], activePageId: "three" } },
  ]));
  const state = useStore.getState();
  expect(state.pages.map(page => page.pageId)).toEqual(["one", "two", "three"]);
  expect(state.layout.order).toEqual(["one", "two", "three"]);
  expect(state.activePageId).toBe("three");
  expect(state.catalogVersion).toBe(4);
});

it("merges catalog fields onto live pages without clobbering runtime fields", () => {
  setup();
  useStore.setState(state => ({ pages: state.pages.map(page => page.pageId === "one" ? { ...page, controller: "agent" as const, documentEpoch: 7 } : page) }));
  useStore.getState().applyTabsPatch(patch(4, 3, [{ op: "upsert", tab: record("one", { title: "renamed", loading: true }) }]));
  const page = useStore.getState().pages.find(page => page.pageId === "one")!;
  expect(page).toMatchObject({ title: "renamed", loading: true, controller: "agent", documentEpoch: 7 });
});

it("carries a page theme color and clears it when the site stops declaring one", () => {
  setup();
  expect(TabRecordSchema.safeParse(record("one", { themeColor: "red; background: url(bad)" })).success).toBe(false);
  useStore.getState().applyTabsPatch(patch(4, 3, [{ op: "upsert", tab: record("one", { themeColor: "#c03955" }) }]));
  expect(useStore.getState().pages.find(page => page.pageId === "one")?.themeColor).toBe("#c03955");
  useStore.getState().applyTabsPatch(patch(5, 4, [{ op: "upsert", tab: record("one") }]));
  expect(useStore.getState().pages.find(page => page.pageId === "one")?.themeColor).toBeUndefined();
});

it("tracks native battery saver transitions without accepting stale catalog state", () => {
  setup();
  document.documentElement.dataset.batterySaver = "false";
  useStore.getState().syncTabsSnapshot({ ...snapshot(4, [record("one"), record("two")], ["one", "two"], "two"), batterySaverActive: true });
  expect(document.documentElement.dataset.batterySaver).toBe("true");
  useStore.getState().applyTabsPatch({ ...patch(5, 4, [{ op: "window", window: { windowId: "main", order: ["one", "two"], activePageId: "two" } }]), batterySaverActive: false });
  expect(document.documentElement.dataset.batterySaver).toBe("false");
  useStore.getState().syncTabsSnapshot({ ...snapshot(3, [], [], null), batterySaverActive: true });
  expect(document.documentElement.dataset.batterySaver).toBe("false");
});

it("reconciles an older local tab placement to the main-owned Space", () => {
  setup();
  const space = { id: "research", name: "Research", color: "blue" as const, grain: 0, workspaceId: "workspace-research" };
  useStore.setState(state => ({ layout: { ...state.layout, spaces: [...state.layout.spaces, space], tabSpace: { one: state.layout.activeSpaceId } } }));
  useStore.getState().applyTabsPatch(patch(4, 3, [{ op: "upsert", tab: record("one", { spaceId: space.id, workspaceId: space.workspaceId }) }]));
  expect(useStore.getState().layout.tabSpace.one).toBe(space.id);
  useStore.setState(state => ({ layout: { ...state.layout, tabSpace: { one: state.layout.spaces[0]!.id } } }));
  useStore.getState().syncTabsSnapshot(snapshot(5, [record("one", { spaceId: space.id, workspaceId: space.workspaceId }), record("two")], ["one", "two"], "two"));
  expect(useStore.getState().layout.tabSpace.one).toBe(space.id);
});

it("requests a resync on a base-version gap instead of applying out of order", async () => {
  setup();
  const tabsSince = vi.spyOn(bridge, "tabsSince").mockResolvedValue({ kind: "snapshot", snapshot: snapshot(9, [record("one"), record("four")], ["one", "four"], "four") });
  useStore.getState().applyTabsPatch(patch(10, 8, [{ op: "remove", pageId: "one" }]));
  // The stale patch is dropped; resync converges on main's snapshot.
  await vi.waitFor(() => expect(tabsSince).toHaveBeenCalledWith(3));
  await vi.waitFor(() => expect(useStore.getState().catalogVersion).toBe(9));
  const state = useStore.getState();
  expect(state.pages.map(page => page.pageId).sort()).toEqual(["four", "one"]);
  expect(state.activePageId).toBe("four");
});

it("replays retained patches when the gap is recoverable", async () => {
  setup();
  const tabsSince = vi.spyOn(bridge, "tabsSince").mockResolvedValue({ kind: "patches", patches: [
    patch(4, 3, [{ op: "upsert", tab: record("three") }]),
    patch(5, 4, [{ op: "window", window: { windowId: "main", order: ["one", "three", "two"], activePageId: "one" } }]),
  ] });
  useStore.getState().applyTabsPatch(patch(9, 7, [{ op: "remove", pageId: "one" }]));
  await vi.waitFor(() => expect(tabsSince).toHaveBeenCalledWith(3));
  await vi.waitFor(() => expect(useStore.getState().catalogVersion).toBe(5));
  expect(useStore.getState().layout.order).toEqual(["one", "three", "two"]);
  expect(useStore.getState().activePageId).toBe("one");
});

it("a remove op records closed-tab history while a cross-window move does not", () => {
  setup();
  useStore.getState().applyTabsPatch(patch(4, 3, [{ op: "remove", pageId: "one" }]));
  expect(useStore.getState().closedTabs.map(tab => tab.pageId)).toEqual(["one"]);
  useStore.getState().applyTabsPatch(patch(5, 4, [{ op: "upsert", tab: record("two", { windowId: "other" }) }]));
  const state = useStore.getState();
  expect(state.pages.map(page => page.pageId)).toEqual([]);
  expect(state.closedTabs.map(tab => tab.pageId)).toEqual(["one"]);
});

it("a snapshot never rewinds the catalog version", () => {
  setup();
  useStore.getState().syncTabsSnapshot(snapshot(1, [record("ghost")], ["ghost"], "ghost"));
  expect(useStore.getState().catalogVersion).toBe(3);
  expect(useStore.getState().pages.map(page => page.pageId)).toEqual(["one", "two"]);
});
