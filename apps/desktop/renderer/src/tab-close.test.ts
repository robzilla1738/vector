// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@vector/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
afterEach(() => vi.restoreAllMocks());
const pages = ["one", "two", "three"].map(pageId => ({pageId, url: "https://example.com"}) as PageTarget);
it("stops grouped closing when beforeunload cancels and releases the operation lock", async () => {
  useStore.setState({pages, closingTabs: false});
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValueOnce({ok: true} as never).mockResolvedValueOnce({ok: false} as never);
  expect(await useStore.getState().closeTabs(["one", "two", "three"])).toBe(false);
  expect(invoke.mock.calls).toEqual([["pages.close", {pageId: "one"}], ["pages.close", {pageId: "two"}]]);
  expect(useStore.getState().closingTabs).toBe(false);
});
it("does not overlap close requests while a page waits for a response", async () => {
  useStore.setState({pages, closingTabs: false});
  let finish!: (result: never) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(() => new Promise(resolve => {finish = resolve;}));
  const pending = useStore.getState().closeTabs(["one"]);
  expect(await useStore.getState().closeTabs(["two"])).toBe(false);
  expect(invoke).toHaveBeenCalledTimes(1);
  finish({ok: true} as never);
  expect(await pending).toBe(true);
  expect(useStore.getState().closingTabs).toBe(false);
});
it("restores a closed group in original order and activates its previous foreground tab", async () => {
  const {emptyLayout} = await import("./workspace");
  const layout = emptyLayout(); layout.order = ["one", "two", "three"];
  useStore.setState({pages, layout, closedTabs: [], activePageId: "one", closingTabs: false, reopeningTab: false, pendingRestoreIds: []});
  let eventSeq = useStore.getState().lastSeq + 1;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params: any) => {
    if (method === "pages.close") {
      useStore.getState().applyEvent({type: "page.removed", seq: eventSeq++, ts: Date.now(), payload: {pageId: params.pageId}});
      return {ok: true} as never;
    }
    if (method === "pages.open") return {pageId: `restored-${params.url.endsWith('/one') ? 'one' : 'three'}`, url: params.url, title: "Restored", viewStatus: "visible"} as never;
    return {} as never;
  });
  useStore.setState({pages: pages.map(page => ({...page, url: `https://example.com/${page.pageId === "two" ? "one" : page.pageId}`, title: page.pageId}))});
  await useStore.getState().closeTabs(["one", "three"]);
  expect(useStore.getState().closedTabs.map(tab => tab.index)).toEqual([0, 2]);
  await useStore.getState().reopenClosedTab();
  expect(useStore.getState().layout.order).toEqual(["restored-one", "two", "restored-three"]);
  expect(useStore.getState().closedTabs).toEqual([]);
  expect(useStore.getState().activePageId).toBe("restored-one");
  expect(invoke.mock.calls.filter(([method]) => method === "pages.open").every(([, params]: any) => params.activate === false)).toBe(true);
});
