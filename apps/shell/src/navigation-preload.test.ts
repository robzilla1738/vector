// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("./bridge", async (original) => ({
  ...(await original<typeof import("./bridge")>()),
  inNativeHost: true,
}));
import { bridge } from "./bridge";
import { useStore } from "./store";
import { normalizePages } from "./store/pages";
import { hintNavigation } from "./navigation-preload";

const initial = useStore.getState();
const originalPrivate = bridge.privateMode;
const page = {
  pageId: "hover-owner",
  url: "https://current.test/",
  title: "Current",
  windowId: bridge.windowId,
  ownedByRuntime: false,
};
beforeEach(() => {
  bridge.privateMode = false;
  useStore.setState({ ...initial, activePageId: page.pageId, pages: normalizePages([page] as never) }, true);
  vi.spyOn(bridge, "preloadNavigation").mockResolvedValue(true);
});
afterEach(() => {
  useStore.setState(initial, true);
  bridge.privateMode = originalPrivate;
  vi.restoreAllMocks();
});
it("binds the hover hint to the current owned tab and its current URL", () => {
  hintNavigation("https://bookmark.test/");
  expect(bridge.preloadNavigation).toHaveBeenCalledWith({
    pageId: page.pageId,
    expectedUrl: page.url,
    url: "https://bookmark.test/",
  });
});
it("refuses private, missing, runtime-owned, foreign-window and non-web targets", () => {
  bridge.privateMode = true;
  hintNavigation("https://bookmark.test/");
  bridge.privateMode = false;
  hintNavigation("file:///local");
  for (const update of [{ ownedByRuntime: true }, { windowId: "another-owner" }]) {
    useStore.setState({ pages: normalizePages([{ ...page, ...update }] as never) });
    hintNavigation("https://bookmark.test/");
  }
  useStore.setState({ activePageId: null });
  hintNavigation("https://bookmark.test/");
  expect(bridge.preloadNavigation).not.toHaveBeenCalled();
});
