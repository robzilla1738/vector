// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@vector/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";
afterEach(() => vi.restoreAllMocks());
it("keeps the destination and current browsing state when a background open finishes after a Space switch", async () => {
  const layout = { ...emptyLayout(), spaces: [{ id: "work", name: "Work", color: "slate" as const }, { id: "home", name: "Home", color: "slate" as const }], activeSpaceId: "work" };
  useStore.setState({ layout, pages: [], activePageId: null, overlay: "bookmarks" });
  let finish!: (page: PageTarget) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async () => new Promise<PageTarget>(resolve => { finish = resolve; }));
  const opening = useStore.getState().openBackgroundTab("https://example.com", "work");
  useStore.setState({ layout: { ...layout, activeSpaceId: "home" }, activePageId: "new-selection" });
  finish({ pageId: "opened", url: "https://example.com", viewStatus: "background" } as PageTarget);
  await opening;
  expect(invoke).toHaveBeenCalledWith("pages.open", { url: "https://example.com", background: true, activate: false });
  expect(useStore.getState().layout.tabSpace.opened).toBe("work");
  expect(useStore.getState().layout.activeSpaceId).toBe("home");
  expect(useStore.getState().activePageId).toBe("new-selection");
  expect(useStore.getState().overlay).toBe("bookmarks");
  await useStore.getState().openBackgroundTab("https://example.com", "work");
  expect(invoke).toHaveBeenCalledTimes(1);
});
