// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from "vitest";
import { emptyLayout } from "./workspace";
import { normalizePages } from "./store/pages";
import type { PageTarget } from "@aux/contracts";
const mocks = vi.hoisted(() => ({
  open: vi.fn(),
  snapshot: vi.fn(),
  split: vi.fn(),
  state: {} as any,
  bridge: { windowId: "own", privateMode: false, windowKind: "normal", tabsSnapshot: vi.fn() },
}));
vi.mock("./bridge", () => ({ bridge: mocks.bridge }));
vi.mock("./bookmark-folders", () => ({ openBookmark: mocks.open }));
vi.mock("./store", () => ({ useStore: { getState: () => mocks.state } }));
vi.mock("./features/surfaces/split-actions", () => ({
  localSplitPage: (id: string) => mocks.state.pages.byId[id],
  commitSplit: mocks.split,
}));
import { openBookmarkDestination } from "./bookmark-destinations";
const item = { nodeId: "12", title: "Saved research", url: "https://example.test" };
const page = (pageId: string): PageTarget => ({
  pageId,
  windowId: "own",
  backend: "aux",
  targetId: pageId,
  url: item.url,
  title: pageId,
  documentEpoch: 1,
  lastRevision: 0,
  viewStatus: "visible",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.bridge.windowId = "own";
  const layout = emptyLayout();
  layout.tabSpace = { primary: layout.activeSpaceId, opened: layout.activeSpaceId };
  mocks.state = {
    layout,
    activePageId: "primary",
    overlay: "bookmarks",
    pages: normalizePages([page("primary"), page("opened")]),
    syncTabsSnapshot: vi.fn(),
    moveTabs: vi.fn(),
    activate: vi.fn(),
    setOverlay: vi.fn(),
  };
  mocks.open.mockResolvedValue({ pageId: "opened" });
  mocks.bridge.tabsSnapshot.mockResolvedValue({ version: 1, tabs: [], windows: [] });
  mocks.split.mockResolvedValue(undefined);
});
it("groups the acknowledged saved bookmark in its originating Space before activating it", async () => {
  await openBookmarkDestination(item, "group");
  expect(mocks.open).toHaveBeenCalledWith(item, "background", undefined, mocks.state.layout.activeSpaceId);
  expect(mocks.state.moveTabs).toHaveBeenCalledWith(["opened"], mocks.state.layout.activeSpaceId, {
    name: item.title,
  });
  expect(mocks.state.activate).toHaveBeenCalledWith("opened");
  expect(mocks.state.setOverlay).toHaveBeenCalledWith(null);
});
it("does not arrange or activate a tab after the window changes during native opening", async () => {
  mocks.open.mockImplementationOnce(async () => {
    mocks.bridge.windowId = "other";
    return { pageId: "opened" };
  });
  await expect(openBookmarkDestination(item, "group")).rejects.toThrow("bookmark opened");
  expect(mocks.state.moveTabs).not.toHaveBeenCalled();
  expect(mocks.state.activate).not.toHaveBeenCalled();
});
it("preserves the opened tab and Library when native split acknowledgement fails", async () => {
  mocks.split.mockRejectedValueOnce(new Error("Split unavailable"));
  await expect(openBookmarkDestination(item, "split")).rejects.toThrow("Split unavailable");
  expect(mocks.split).toHaveBeenCalledOnce();
  expect(mocks.state.pages.byId.opened).toBeDefined();
  expect(mocks.state.activate).not.toHaveBeenCalled();
  expect(mocks.state.setOverlay).not.toHaveBeenCalled();
});
it("rejects a missing split source before opening and a moved result before grouping", async () => {
  mocks.state.activePageId = null;
  await expect(openBookmarkDestination(item, "split")).rejects.toThrow("Choose an available");
  expect(mocks.open).not.toHaveBeenCalled();
  mocks.state.pages.byId.opened.windowId = "other";
  await expect(openBookmarkDestination(item, "group")).rejects.toThrow("no longer available");
  expect(mocks.state.moveTabs).not.toHaveBeenCalled();
});

it("does not move a newly opened bookmark back after its Space changes", async () => {
  mocks.bridge.tabsSnapshot.mockImplementationOnce(async () => {
    mocks.state.layout.tabSpace.opened = "another-space";
    return { version: 2, tabs: [], windows: [] };
  });
  await expect(openBookmarkDestination(item, "group")).rejects.toThrow("no longer available");
  expect(mocks.state.moveTabs).not.toHaveBeenCalled();
  expect(mocks.state.activate).not.toHaveBeenCalled();
});
