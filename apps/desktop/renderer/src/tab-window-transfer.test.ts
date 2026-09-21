// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@vector/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";

afterEach(() => vi.restoreAllMocks());
function setup() {
  const layout = emptyLayout();
  const folder = {id: "folder", name: "Research", spaceId: layout.activeSpaceId, collapsed: false};
  layout.folders = [folder];
  layout.tabFolder = {one: folder.id, two: folder.id};
  const pages = ["one", "two", "three"].map(pageId => ({pageId, windowId: "main", url: "https://example.com", viewStatus: "visible"}) as PageTarget);
  useStore.setState({layout, pages, activePageId: "one"});
  return {pages, folder};
}
it("uses one new destination, preserves placement snapshots after source events, and restores the active tab", async () => {
  const {pages, folder} = setup();
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params: any) => {
    if (method === "pages.moveToWindow") {
      useStore.setState({pages: useStore.getState().pages.filter(page => page.pageId !== params.pageId)});
      return {...pages.find(page => page.pageId === params.pageId), windowId: "destination"} as never;
    }
    return {} as never;
  });
  await useStore.getState().moveTabsToWindow(["one", "two", "one"]);
  expect(invoke.mock.calls).toEqual([
    ["pages.moveToWindow", {pageId: "one", spaceId: folder.spaceId, folder, windowId: undefined, activate: true}],
    ["pages.moveToWindow", {pageId: "two", spaceId: folder.spaceId, folder, windowId: "destination", activate: false}],
  ]);
});
it("stops after an uncertain transfer without retrying or moving later tabs", async () => {
  const {pages} = setup();
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValueOnce({...pages[0], windowId: "destination"} as never).mockRejectedValueOnce(new Error("Connection interrupted"));
  await expect(useStore.getState().moveTabsToWindow(["one", "two", "three"])).rejects.toThrow("confirming 1 of 3 tabs. Check both windows");
  expect(invoke).toHaveBeenCalledTimes(2);
});
it("checks the entire selection for agent control before any transfer", async () => {
  const {pages} = setup();
  useStore.setState({pages: pages.map(page => page.pageId === "two" ? {...page, controller: "agent"} : page)});
  const invoke = vi.spyOn(bridge, "invoke");
  await expect(useStore.getState().moveTabsToWindow(["one", "two"], "existing")).rejects.toThrow("Take control");
  expect(invoke).not.toHaveBeenCalled();
});
