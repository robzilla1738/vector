import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget, TabCommand, TabCommandAck } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";
afterEach(() => vi.restoreAllMocks());
const applied = (command: TabCommand, pageId?: string): TabCommandAck => ({
  commandId: "",
  status: "applied",
  catalogVersion: 1,
  pageId: pageId ?? ("pageId" in command ? command.pageId : undefined),
});
function setup() {
  const pages = ["first", "middle", "last", "other"].map(
    (pageId) =>
      ({
        pageId,
        title: pageId,
        url: `https://example.test/${pageId}`,
        ownedByRuntime: false,
        viewStatus: "visible",
      }) as PageTarget,
  );
  const layout = {
    ...emptyLayout(),
    spaces: [
      { id: "work", name: "Work", color: "slate" as const, grain: 0 },
      { id: "personal", name: "Personal", color: "slate" as const, grain: 0 },
    ],
    activeSpaceId: "work",
    order: pages.map((page) => page.pageId),
    tabSpace: { first: "work", middle: "work", last: "work", other: "personal" },
    folders: [{ id: "research", spaceId: "work", name: "Research", collapsed: false }],
    tabFolder: { middle: "research" },
  };
  useStore.setState({
    pages: normalizePages(pages),
    layout,
    activePageId: "middle",
    closedTabs: [],
    reopeningTab: false,
  });
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  vi.spyOn(bridge, "invoke").mockResolvedValue({} as never);
  vi.spyOn(bridge, "bindTabSpace").mockImplementation(async (_pageId, spaceId) => ({
    spaceId,
    workspaceId: `workspace:${spaceId}`,
  }));
  return { pages, layout };
}
function close(pageId: string) {
  useStore.getState().applyEvent({
    seq: Date.now(),
    streamId: "test",
    type: "page.removed",
    ts: Date.now(),
    payload: { pageId },
  });
}
const pageOf = (pageId: string, url = "https://example.test/x"): PageTarget =>
  ({ pageId, title: "x", url, ownedByRuntime: false, viewStatus: "visible" }) as PageTarget;

// The reopen restore must wait for the reopened page to land in `pages` —
// the catalog patch can lag behind the open ack, and writing order while the
// id is not live lets the next syncOrder drop it, leaving the tab appended
// at the end instead of its recorded position.
it("restores position when the catalog patch lands after the open ack", async () => {
  setup();
  // The background open's stub-add is skipped when the id was seen-then-removed during the
  // await — simulate exactly that racing the open, so `pages` gains the tab
  // only via the delayed patch.
  vi.spyOn(bridge, "tabCommand").mockImplementation(async (command) => {
    if (command.kind === "open") {
      useStore.getState().applyEvent({
        seq: Date.now(),
        streamId: "test",
        type: "page.added",
        ts: Date.now(),
        payload: { page: pageOf(command.pageId!, command.url ?? "") },
      });
      useStore.getState().applyEvent({
        seq: Date.now(),
        streamId: "test",
        type: "page.removed",
        ts: Date.now(),
        payload: { pageId: command.pageId! },
      });
      return applied(command);
    }
    return applied(command);
  });
  close("middle");
  const opening = useStore.getState().reopenClosedTab();
  // The page's upsert patch arrives after the ack resolves.
  setTimeout(
    () =>
      useStore.getState().applyEvent({
        seq: Date.now(),
        streamId: "test",
        type: "page.added",
        ts: Date.now(),
        payload: { page: pageOf("middle", "https://example.test/middle") },
      }),
    20,
  );
  await opening;
  const layout = useStore.getState().layout;
  expect(layout.tabFolder.middle).toBe("research");
  expect(layout.order).toEqual(["first", "middle", "last", "other"]);
  expect(useStore.getState().closedTabs).toEqual([]);
});
