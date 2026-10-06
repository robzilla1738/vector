// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget, TabRecord } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { emptyLayout } from "../../workspace";
vi.mock("../../feature-availability", () => ({ featureStage: () => "on" }));
afterEach(() => vi.restoreAllMocks());
const tab = (pageId: string, windowId: string, fields = {}): TabRecord => ({
  pageId, windowId, windowKind: "normal", url: "https://example.com", title: pageId,
  loading: false, muted: false, audible: false, canGoBack: true, canGoForward: false,
  popup: false, crashed: false, runtimeOwned: false, generation: 0, createdAt: 1, lastActiveAt: 2, ...fields,
});
function setup() {
  const layout = emptyLayout();
  useStore.setState({ pages: [], layout, activePageId: null, catalogVersion: 0, restoringTabs: false, pendingRestoreIds: [] });
  return layout;
}
it("keeps normal human tabs from every window and excludes special windows and anchors", () => {
  setup();
  useStore.getState().syncTabsSnapshot({ version: 1, tabs: [tab("a", bridge.windowId), tab("b", "2"), tab("little", "3", { windowKind: "little" }), tab("anchor", bridge.windowId, { anchor: true })], windows: [{ windowId: bridge.windowId, order: ["a", "anchor"], activePageId: "a" }] });
  expect(useStore.getState().pages.map(page => page.pageId)).toEqual(["a", "b"]);
  expect(useStore.getState().activePageId).toBe("a");
  useStore.getState().applyTabsPatch({ baseVersion: 1, version: 2, ts: 1, ops: [{ op: "upsert", tab: tab("a", "2") }] });
  expect(useStore.getState().pages.find(page => page.pageId === "a")?.windowId).toBe("2");
  expect(useStore.getState().layout.order).toContain("a");
});
it("claims a remote row before changing local selection and never sends a stale owner activate", async () => {
  const layout = setup();
  const page = { pageId: "remote", windowId: "2", viewStatus: "hidden", ownedByRuntime: false, controller: "human" } as PageTarget;
  useStore.setState({ pages: [page], activePageId: "before", layout: { ...layout, order: [page.pageId] } });
  const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue({ commandId: "claim", status: "applied", catalogVersion: 2, windowId: bridge.windowId, pageId: page.pageId });
  await useStore.getState().activate(page.pageId);
  expect(command.mock.calls.map(([value]) => value)).toEqual([{ kind: "claim", pageId: page.pageId, activate: true }]);
  expect(useStore.getState().activePageId).toBe(page.pageId);
});
it("refused claims preserve the previous selection and active Space", async () => {
  const layout = setup();
  useStore.setState({ pages: [{ pageId: "remote", windowId: "2", viewStatus: "hidden", ownedByRuntime: false, controller: "human" } as PageTarget], activePageId: "before" });
  vi.spyOn(bridge, "tabCommand").mockResolvedValue({ commandId: "claim", status: "rejected", catalogVersion: 1, error: { code: "forbidden", message: "Controlled tab" } });
  await expect(useStore.getState().activate("remote")).rejects.toThrow("Controlled tab");
  expect(useStore.getState().activePageId).toBe("before");
  expect(useStore.getState().layout.activeSpaceId).toBe(layout.activeSpaceId);
});
it("shows controlled human rows without claiming them or changing the selected Space", async () => {
  const layout = setup();
  const page = { pageId: "controlled", windowId: "2", viewStatus: "hidden", ownedByRuntime: false, controller: "agent" } as PageTarget;
  useStore.setState({ pages: [page], activePageId: "before" });
  const command = vi.spyOn(bridge, "tabCommand");
  await useStore.getState().activate(page.pageId);
  expect(command).not.toHaveBeenCalled();
  expect(useStore.getState().pages).toContain(page);
  expect(useStore.getState().activePageId).toBe("before");
  expect(useStore.getState().layout.activeSpaceId).toBe(layout.activeSpaceId);
});

it("reconciles native metadata for existing workers without adding remote workers to human rows", () => {
  setup();
  useStore.setState({ pages: [{ pageId: "worker", windowId: bridge.windowId, ownedByRuntime: true, viewStatus: "hidden" } as PageTarget] });
  useStore.getState().syncTabsSnapshot({ version: 1, tabs: [tab("worker", bridge.windowId, { runtimeOwned: true, title: "Live worker" }), tab("remote-worker", "2", { runtimeOwned: true })], windows: [] });
  expect(useStore.getState().pages.map(page => page.pageId)).toEqual(["worker"]);
  expect(useStore.getState().pages[0]?.title).toBe("Live worker");
  useStore.getState().applyTabsPatch({ baseVersion: 1, version: 2, ts: 1, ops: [{ op: "upsert", tab: tab("worker", bridge.windowId, { runtimeOwned: true, title: "Worker updated", audible: true }) }, { op: "upsert", tab: tab("remote-worker", "2", { runtimeOwned: true }) }] });
  expect(useStore.getState().pages.map(page => page.pageId)).toEqual(["worker"]);
  expect(useStore.getState().pages[0]).toMatchObject({ windowId: bridge.windowId, title: "Worker updated", ownedByRuntime: true });
});
it("reuses the one live Little page for a new address and refuses missing local ownership", async () => {
  setup();
  vi.spyOn(bridge, "windowKind", "get").mockReturnValue("little");
  const current = { pageId: "little", windowId: bridge.windowId, url: "https://example.test", viewStatus: "visible", ownedByRuntime: false, controller: "human" } as PageTarget;
  const navigatePage = vi.fn().mockResolvedValue(undefined);
  const focusCommandBar = vi.fn();
  useStore.setState({ pages: [current], activePageId: current.pageId, navigatePage, focusCommandBar });
  const command = vi.spyOn(bridge, "tabCommand");
  expect(await useStore.getState().newTab()).toBe(current);
  expect(navigatePage).toHaveBeenCalledExactlyOnceWith("little", "about:blank");
  expect(focusCommandBar).toHaveBeenCalledExactlyOnceWith("toolbar");
  expect(command).not.toHaveBeenCalled();
  useStore.setState({ pages: [{ ...current, windowId: "foreign" }] });
  await expect(useStore.getState().newTab()).rejects.toThrow("finish opening");
  expect(navigatePage).toHaveBeenCalledTimes(1);
});
