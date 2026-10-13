// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { makePage } from "./mock/fixtures";
import { useStore } from "./store";
import { normalizePages } from "./store/pages";
import { emptyLayout } from "./workspace";

const original = useStore.getState();
beforeEach(() => {
  const layout = {
    ...emptyLayout(),
    spaces: [
      { id: "work", name: "Work", color: "slate" as const, grain: 0 },
      { id: "home", name: "Home", color: "slate" as const, grain: 0 },
    ],
    activeSpaceId: "work",
    order: ["other", "second", "first"],
    tabSpace: { other: "home", second: "work", first: "work" },
  };
  const pages = [
    makePage(0, { pageId: "other", windowId: "another-window" }),
    makePage(1, { pageId: "second", windowId: bridge.windowId }),
    makePage(2, { pageId: "first", windowId: bridge.windowId }),
  ];
  useStore.setState({
    ...original,
    layout,
    pages: normalizePages(pages),
    settings: {},
    restoringTabs: false,
    pendingRestoreIds: [],
    catalogVersion: 7,
  });
  vi.spyOn(bridge, "tabCommand").mockImplementation(async (command) => ({
    commandId: "created",
    status: "applied",
    catalogVersion: 7,
    pageId: command.kind === "open" ? (command.pageId ?? "created") : undefined,
  }));
});
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(original);
});

it.each(["top", "bottom"] as const)(
  "opens a new foreground tab at the %s without sorting existing tabs",
  async (position) => {
    useStore.setState({ settings: { verticalTabInsertionPosition: position } });
    const page = await useStore.getState().newTab("https://new.example");
    expect(page).not.toBeNull();
    expect(bridge.tabCommand).toHaveBeenCalledWith(
      expect.objectContaining({ index: position === "top" ? 0 : 2 }),
      7,
    );
    expect(useStore.getState().layout.order).toEqual(
      position === "top"
        ? ["other", page!.pageId, "second", "first"]
        : ["other", "second", "first", page!.pageId],
    );
  },
);

it("places a background open in its destination while retaining manual order", async () => {
  await useStore.getState().openBackgroundTab("https://new.example", "work", false);
  expect(bridge.tabCommand).toHaveBeenCalledWith(expect.objectContaining({ index: 0, activate: false }), 7);
  expect(useStore.getState().layout.order).toEqual(["other", "created", "second", "first"]);
});

it("preserves an explicit reopen index and does not apply the vertical preference in horizontal layout", async () => {
  await useStore.getState().openBackgroundTab("https://restored.example", "work", false, "restored", 1);
  expect(bridge.tabCommand).toHaveBeenLastCalledWith(
    expect.objectContaining({ pageId: "restored", index: 1 }),
    7,
  );
  useStore.setState({ settings: { tabLayout: "horizontal", verticalTabInsertionPosition: "top" } });
  await useStore.getState().newTab("https://horizontal.example");
  const command = vi.mocked(bridge.tabCommand).mock.calls.at(-1)![0];
  expect(command).not.toHaveProperty("index");
  expect(useStore.getState().layout.order.slice(0, 3)).toEqual(["other", "second", "first"]);
});
