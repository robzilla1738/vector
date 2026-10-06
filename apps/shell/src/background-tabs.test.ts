import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { TabCommandAck } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";
afterEach(() => vi.restoreAllMocks());
it("keeps the destination and current browsing state when a background open finishes after a Space switch", async () => {
  const layout = {
    ...emptyLayout(),
    spaces: [
      { id: "work", name: "Work", color: "slate" as const, grain: 0 },
      { id: "home", name: "Home", color: "slate" as const, grain: 0 },
    ],
    activeSpaceId: "work",
  };
  useStore.setState({ layout, pages: normalizePages([]), activePageId: null, overlay: "bookmarks" });
  let finish!: (ack: TabCommandAck) => void;
  const tabCommand = vi.spyOn(bridge, "tabCommand").mockImplementation(
    async () =>
      new Promise<TabCommandAck>((resolve) => {
        finish = resolve;
      }),
  );
  const bindTabSpace = vi
    .spyOn(bridge, "bindTabSpace")
    .mockResolvedValue({ spaceId: "work", workspaceId: "workspace:work" });
  const opening = useStore.getState().openBackgroundTab("https://example.com", "work");
  useStore.setState({ layout: { ...layout, activeSpaceId: "home" }, activePageId: "new-selection" });
  finish({ commandId: "", status: "applied", catalogVersion: 0, pageId: "opened" });
  await opening;
  expect(tabCommand).toHaveBeenCalledWith(
    { kind: "open", url: "https://example.com", background: true, activate: false },
    expect.any(Number),
  );
  expect(bindTabSpace).not.toHaveBeenCalled(); // plain-browser tests do not advertise native Spaces
  expect(useStore.getState().layout.tabSpace.opened).toBe("work");
  expect(useStore.getState().layout.activeSpaceId).toBe("home");
  expect(useStore.getState().activePageId).toBe("new-selection");
  expect(useStore.getState().overlay).toBe("bookmarks");
  await useStore.getState().openBackgroundTab("https://example.com", "work");
  expect(tabCommand).toHaveBeenCalledTimes(1);
});
