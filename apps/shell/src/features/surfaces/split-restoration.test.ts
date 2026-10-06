import { normalizePages, orderedPages } from "../../store/pages";
import { beforeEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { emptyLayout } from "../../workspace";
const fixture = vi.hoisted(() => ({
  state: {} as {
    connected: boolean;
    restoringTabs: boolean;
    catalogVersion: number;
    layout: ReturnType<typeof emptyLayout>;
    pages: import("../../store/pages").PageCollection;
  },
  listeners: new Set<() => void>(),
  commit: vi.fn(async (..._args: unknown[]) => {}),
  error: vi.fn(),
}));
vi.mock("../../store", () => ({
  useStore: {
    getState: () => fixture.state,
    subscribe: (listener: () => void) => {
      fixture.listeners.add(listener);
      return () => fixture.listeners.delete(listener);
    },
  },
  errToast: fixture.error,
}));
vi.mock("./split-actions", () => ({
  commitSplit: fixture.commit,
  localSplitPage: (id: string) =>
    orderedPages(fixture.state.pages).find(
      (page) =>
        page.pageId === id && page.windowId === "own" && !page.ownedByRuntime && page.controller === "none",
    ),
}));
import { restoreNativeSplits } from "./split-restoration";
const publish = () => {
  for (const listener of fixture.listeners) listener();
};
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
beforeEach(() => {
  fixture.listeners.clear();
  fixture.commit.mockReset();
  fixture.commit.mockResolvedValue(undefined);
  fixture.error.mockReset();
  const layout = emptyLayout();
  layout.splitGroups = [{ id: "saved", panes: ["one", "two"], layout: "row", ratios: [0.6], focused: "one" }];
  fixture.state = {
    connected: true,
    restoringTabs: false,
    catalogVersion: 1,
    layout,
    pages: normalizePages(
      ["one", "two"].map(
        (pageId) => ({ pageId, windowId: "own", controller: "none", ownedByRuntime: false }) as PageTarget,
      ) as never,
    ),
  };
});
it("waits for actual restoration and native catalog before a single native reconstruction", async () => {
  fixture.state.restoringTabs = true;
  fixture.state.catalogVersion = 0;
  const stop = restoreNativeSplits();
  expect(fixture.commit).not.toHaveBeenCalled();
  fixture.state.restoringTabs = false;
  publish();
  expect(fixture.commit).not.toHaveBeenCalled();
  fixture.state.catalogVersion = 1;
  publish();
  await settle();
  publish();
  expect(fixture.commit).toHaveBeenCalledTimes(1);
  expect(fixture.commit.mock.calls[0]?.[2]).toMatchObject({ splitGroups: [] });
  stop();
  expect(fixture.listeners.size).toBe(0);
});
it("retains a pair already restored by the native model", () => {
  orderedPages(fixture.state.pages).forEach((page, index) => {
    page.split = { id: "native-pair", index };
  });
  const stop = restoreNativeSplits();
  expect(fixture.commit).not.toHaveBeenCalled();
  stop();
});
it("does not dispatch for foreign or runtime-owned members", () => {
  fixture.state.pages.byId[fixture.state.pages.allIds[1]!]!.ownedByRuntime = true;
  const stop = restoreNativeSplits();
  expect(fixture.commit).not.toHaveBeenCalled();
  fixture.state.pages.byId[fixture.state.pages.allIds[1]!]!.ownedByRuntime = false;
  fixture.state.pages.byId[fixture.state.pages.allIds[1]!]!.windowId = "other";
  publish();
  expect(fixture.commit).not.toHaveBeenCalled();
  stop();
});
it("invalidates queued reconstruction on unmount and reports a live failure once", async () => {
  let valid!: () => boolean;
  fixture.commit.mockImplementationOnce(async (...args) => {
    valid = args[3] as () => boolean;
  });
  const stop = restoreNativeSplits();
  expect(valid()).toBe(true);
  stop();
  expect(valid()).toBe(false);
  await settle();
  fixture.commit.mockRejectedValueOnce(new Error("native unavailable"));
  const stopAgain = restoreNativeSplits();
  await settle();
  publish();
  expect(fixture.error).toHaveBeenCalledTimes(1);
  expect(fixture.commit).toHaveBeenCalledTimes(2);
  stopAgain();
});
