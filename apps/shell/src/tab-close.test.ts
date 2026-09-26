// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget, TabCommandAck } from "@aux/contracts";
import { bridge } from "./bridge";
import { lastEventSeq, useStore } from "./store";
afterEach(() => vi.restoreAllMocks());
const pages = ["one", "two", "three"].map(pageId => ({pageId, url: "https://example.com"}) as PageTarget);
const applied = (pageId?: string): TabCommandAck => ({ commandId: "", status: "applied", catalogVersion: 0, pageId });
const rejected = (code: string): TabCommandAck => ({ commandId: "", status: "rejected", catalogVersion: 0, error: { code, message: code } });
it("stops grouped closing when beforeunload cancels and releases the operation lock", async () => {
  useStore.setState({pages, closingTabs: false});
  const tabCommand = vi.spyOn(bridge, "tabCommand").mockResolvedValueOnce(applied("one") as never).mockResolvedValueOnce(rejected("close_vetoed") as never);
  expect(await useStore.getState().closeTabs(["one", "two", "three"])).toBe(false);
  expect(tabCommand.mock.calls).toEqual([[{kind: "close", pageId: "one"}, 0], [{kind: "close", pageId: "two"}, 0]]);
  expect(useStore.getState().closingTabs).toBe(false);
});
it("does not overlap close requests while a page waits for a response", async () => {
  useStore.setState({pages, closingTabs: false});
  let finish!: (ack: TabCommandAck) => void;
  const tabCommand = vi.spyOn(bridge, "tabCommand").mockImplementation(() => new Promise(resolve => {finish = resolve;}));
  const pending = useStore.getState().closeTabs(["one"]);
  expect(await useStore.getState().closeTabs(["two"])).toBe(false);
  expect(tabCommand).toHaveBeenCalledTimes(1);
  finish(applied("one"));
  expect(await pending).toBe(true);
  expect(useStore.getState().closingTabs).toBe(false);
});
it("restores a closed group in original order and activates its previous foreground tab", async () => {
  const {emptyLayout} = await import("./workspace");
  const layout = emptyLayout(); layout.order = ["one", "two", "three"];
  useStore.setState({pages, layout, closedTabs: [], activePageId: "one", closingTabs: false, reopeningTab: false, pendingRestoreIds: []});
  vi.spyOn(bridge, "bindTabSpace").mockResolvedValue({ spaceId: layout.activeSpaceId, workspaceId: `workspace:${layout.activeSpaceId}` });
  let eventSeq = lastEventSeq() + 1;
  const tabCommand = vi.spyOn(bridge, "tabCommand").mockImplementation(async (command: any) => {
    if (command.kind === "close") {
      useStore.getState().applyEvent({type: "page.removed", seq: eventSeq++, streamId: "test", ts: Date.now(), payload: {pageId: command.pageId}});
      return applied(command.pageId) as never;
    }
    if (command.kind === "open") return applied(`restored-${command.url.endsWith('/one') ? 'one' : 'three'}`) as never;
    return applied(command.pageId) as never;
  });
  useStore.setState({pages: pages.map(page => ({...page, url: `https://example.com/${page.pageId === "two" ? "one" : page.pageId}`, title: page.pageId}))});
  await useStore.getState().closeTabs(["one", "three"]);
  expect(useStore.getState().closedTabs.map(tab => tab.index)).toEqual([0, 2]);
  await useStore.getState().reopenClosedTab();
  expect(useStore.getState().layout.order).toEqual(["restored-one", "two", "restored-three"]);
  expect(useStore.getState().closedTabs).toEqual([]);
  expect(useStore.getState().activePageId).toBe("restored-one");
  expect(tabCommand.mock.calls.filter(([command]: any) => command.kind === "open").every(([command]: any) => command.activate === false)).toBe(true);
});
