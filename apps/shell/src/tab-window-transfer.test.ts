// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget, TabCommandAck } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";

afterEach(() => vi.restoreAllMocks());
function setup() {
  const layout = emptyLayout();
  const folder = {
    id: "folder",
    name: "Research",
    spaceId: layout.activeSpaceId,
    collapsed: false,
    color: "green" as const,
    emoji: "🧪",
  };
  layout.folders = [folder];
  layout.tabFolder = { one: folder.id, two: folder.id };
  const pages = ["one", "two", "three"].map(
    (pageId) =>
      ({ pageId, windowId: "main", url: "https://example.com", viewStatus: "visible" }) as PageTarget,
  );
  useStore.setState({ layout, pages, activePageId: "one" });
  return { pages, folder };
}
const ack = (windowId: string): TabCommandAck => ({
  commandId: "",
  status: "applied",
  catalogVersion: 0,
  windowId,
});
it("uses one new destination, carries placement to it, and restores the active tab", async () => {
  const { folder } = setup();
  const tabCommand = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack("destination"));
  await useStore.getState().moveTabsToWindow(["one", "two", "one"]);
  const space = useStore.getState().layout.spaces.find((item) => item.id === folder.spaceId)!;
  expect(tabCommand.mock.calls.map(([command]) => command)).toEqual([
    {
      kind: "move",
      pageId: "one",
      activate: true,
      placement: {
        space: { id: space.id, name: space.name, color: space.color, grain: space.grain },
        folder: {
          id: folder.id,
          name: folder.name,
          spaceId: folder.spaceId,
          collapsed: false,
          color: "green",
          emoji: "🧪",
        },
      },
    },
    {
      kind: "move",
      pageId: "two",
      activate: false,
      windowId: "destination",
      placement: {
        space: { id: space.id, name: space.name, color: space.color, grain: space.grain },
        folder: {
          id: folder.id,
          name: folder.name,
          spaceId: folder.spaceId,
          collapsed: false,
          color: "green",
          emoji: "🧪",
        },
      },
    },
  ]);
});
it("stops after an uncertain transfer without retrying or moving later tabs", async () => {
  setup();
  const tabCommand = vi
    .spyOn(bridge, "tabCommand")
    .mockResolvedValueOnce(ack("destination"))
    .mockRejectedValueOnce(new Error("Connection interrupted"));
  await expect(useStore.getState().moveTabsToWindow(["one", "two", "three"])).rejects.toThrow(
    "confirming 1 of 3 tabs. Check both windows",
  );
  expect(tabCommand).toHaveBeenCalledTimes(2);
});
it("checks the entire selection for agent control before any transfer", async () => {
  const { pages } = setup();
  useStore.setState({
    pages: pages.map((page) => (page.pageId === "two" ? { ...page, controller: "agent" } : page)),
  });
  const tabCommand = vi.spyOn(bridge, "tabCommand");
  await expect(useStore.getState().moveTabsToWindow(["one", "two"], "existing")).rejects.toThrow(
    "Take control",
  );
  expect(tabCommand).not.toHaveBeenCalled();
});
it("files an arriving tab into the relayed space and folder", () => {
  const layout = emptyLayout();
  const pages = [{ pageId: "moved", windowId: "main", url: "https://example.com" } as PageTarget];
  useStore.setState({ layout, pages });
  useStore.getState().applyTabsPlacement({
    pageId: "moved",
    windowId: bridge.windowId,
    placement: {
      space: { id: "research", name: "Research", color: "violet", grain: 60 },
      folder: {
        id: "folder",
        name: "Papers",
        spaceId: "research",
        collapsed: false,
        color: "teal",
        emoji: "📌",
      },
    },
  });
  const state = useStore.getState();
  expect(
    state.layout.spaces.some(
      (space) => space.id === "research" && space.name === "Research" && space.grain === 60,
    ),
  ).toBe(true);
  expect(state.layout.tabSpace.moved).toBe("research");
  expect(state.layout.tabFolder.moved).toBe("folder");
  expect(state.layout.folders.find((item) => item.id === "folder")).toMatchObject({
    color: "teal",
    emoji: "📌",
  });
});
it("carries a reviewed tab name to its destination only for the same URL", async () => {
  setup();
  useStore.getState().setTabName("one", "https://example.com", "Project brief");
  const tabCommand = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack("destination"));
  await useStore.getState().moveTabsToWindow(["one"]);
  const command = tabCommand.mock.calls[0]?.[0];
  expect(command?.kind).toBe("move");
  const placement = command?.kind === "move" ? command.placement : undefined;
  expect(placement?.tabName).toEqual({ title: "Project brief", url: "https://example.com" });
  useStore.setState({
    layout: emptyLayout(),
    pages: [{ pageId: "one", url: "https://example.com" } as PageTarget],
  });
  useStore.getState().applyTabsPlacement({ pageId: "one", windowId: bridge.windowId, placement: placement! });
  expect(useStore.getState().layout.tabNames?.one?.title).toBe("Project brief");
  useStore.setState({
    layout: emptyLayout(),
    pages: [{ pageId: "one", url: "https://changed.example" } as PageTarget],
  });
  useStore.getState().applyTabsPlacement({ pageId: "one", windowId: bridge.windowId, placement: placement! });
  expect(useStore.getState().layout.tabNames?.one).toBeUndefined();
});
it("ignores placement relayed for another window", () => {
  const layout = emptyLayout();
  useStore.setState({ layout, pages: [{ pageId: "moved", url: "https://example.com" } as PageTarget] });
  useStore
    .getState()
    .applyTabsPlacement({
      pageId: "moved",
      windowId: "other",
      placement: { space: { id: "research", name: "Research", color: "violet" } },
    });
  expect(useStore.getState().layout.spaces.some((space) => space.id === "research")).toBe(false);
});
