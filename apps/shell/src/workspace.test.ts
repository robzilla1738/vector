import { describe, expect, it } from "vitest";
import { OrganizationLayoutSchema, type PageTarget } from "@aux/contracts";
import { fromOrganizationLayout, toOrganizationLayout } from "./store/organization-layout";
import {
  lifecycleForStrip,
  DEFAULT_SPACE,
  groupedTabs,
  canSplitPage,
  previewSplit,
  rememberActiveTab,
  splitForPage,
  addPane,
  separate,
  archiveSpace,
  restoreSpace,
  reconcileSpaces,
  assignFolder,
  assignSpace,
  createFolder,
  createSpace,
  emptyLayout,
  isPinned,
  moveTab,
  renameSpace,
  spaceThemeColor,
  removeFolder,
  removeSpace,
  reorderGroup,
  reorderInSpace,
  setActiveSpace,
  syncOrder,
  syncSpaces,
  tabsInFolder,
  tabsInSpace,
  toggleFolder,
  togglePin,
  unfiledTabs,
  updateFolder,
} from "./workspace";

const roundTrip = (layout: ReturnType<typeof emptyLayout>) =>
  fromOrganizationLayout(
    OrganizationLayoutSchema.parse(JSON.parse(JSON.stringify(toOrganizationLayout(layout)))),
  );

it("round-trips a custom Space color and rejects malformed stored recipes", () => {
  const theme = { hue: 195, lightness: 62, intensity: 80, inverted: true };
  const created = createSpace(emptyLayout(), "Studio", "teal", 50, theme);
  const restored = roundTrip(created);
  expect(restored.spaces[1]?.theme).toEqual(theme);
  expect(spaceThemeColor(theme)).toBe("oklch(38% 0.144 195)");
  expect(
    renameSpace(restored, restored.spaces[1]!.id, "Studio", "teal", 50, null).spaces[1]?.theme,
  ).toBeUndefined();
  const malicious = toOrganizationLayout(created);
  const unsafe = {
    ...malicious,
    shared: {
      ...malicious.shared,
      spaces: [created.spaces[0], { ...created.spaces[1], theme: { ...theme, hue: "0);background:red" } }],
    },
  };
  expect(OrganizationLayoutSchema.safeParse(unsafe).success).toBe(false);
});

const page = (id: string, extra: Partial<PageTarget> = {}): PageTarget => ({
  pageId: id,
  backend: "aux",
  targetId: `t-${id}`,
  url: `https://${id}.example.com/`,
  title: id,
  documentEpoch: 0,
  lastRevision: 0,
  viewStatus: "hidden",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 0,
  lastActiveAt: 0,
  ...extra,
});

describe("tab order", () => {
  it("keeps known order, appends new pages, drops closed ones", () => {
    const order = syncOrder(["b", "a", "gone"], [page("a"), page("b"), page("c")]);
    expect(order).toEqual(["b", "a", "c"]);
  });

  it("reorders within a space and leaves other spaces alone", () => {
    const pages = [page("a"), page("b"), page("c"), page("x")];
    let layout = emptyLayout();
    layout = { ...layout, order: ["a", "x", "b", "c"] };
    layout = createSpace(layout, "Work");
    const work = layout.activeSpaceId;
    layout = assignSpace(layout, "x", work);
    layout = setActiveSpace(layout, DEFAULT_SPACE.id);
    layout = syncSpaces(layout, pages);

    // move c to the front of the personal space
    layout = reorderInSpace(layout, DEFAULT_SPACE.id, 2, 0, pages);
    expect(tabsInSpace(layout, pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["c", "a", "b"]);
    expect(tabsInSpace(layout, pages, work).map((p) => p.pageId)).toEqual(["x"]);
    // x kept its absolute slot
    expect(layout.order).toEqual(["c", "x", "a", "b"]);
  });

  it("dropping after the last row moves to the end; no-op moves return the same object", () => {
    const pages = [page("a"), page("b"), page("c")];
    const layout = syncSpaces({ ...emptyLayout(), order: ["a", "b", "c"] }, pages);
    expect(
      tabsInSpace(reorderInSpace(layout, DEFAULT_SPACE.id, 0, 3, pages), pages, DEFAULT_SPACE.id).map(
        (p) => p.pageId,
      ),
    ).toEqual(["b", "c", "a"]);
    expect(reorderInSpace(layout, DEFAULT_SPACE.id, 1, 1, pages)).toBe(layout);
    expect(reorderInSpace(layout, DEFAULT_SPACE.id, 9, 0, pages)).toBe(layout);
  });

  it("moveTab places before a target or at the end", () => {
    const layout = { ...emptyLayout(), order: ["a", "b", "c"] };
    expect(moveTab(layout, "c", "a").order).toEqual(["c", "a", "b"]);
    expect(moveTab(layout, "a", null).order).toEqual(["b", "c", "a"]);
    expect(moveTab(layout, "a", "a")).toBe(layout);
  });

  it("shows human background tabs while hiding worker and detached pages", () => {
    const pages = [
      page("a"),
      page("w", { ownedByRuntime: true }),
      page("bg", { viewStatus: "background" }),
      page("d", { viewStatus: "detached" }),
    ];
    const layout = syncSpaces({ ...emptyLayout(), order: syncOrder([], pages) }, pages);
    expect(tabsInSpace(layout, pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["a", "bg"]);
  });

  it("keeps a sleeping tab on the strip after its renderer detaches", () => {
    const pages = [
      page("live"),
      page("discarded", { viewStatus: "detached", lifecycle: "discarded" }),
      page("frozen", { viewStatus: "detached", lifecycle: "frozen" }),
      page("placeholder", { viewStatus: "detached", lifecycle: "placeholder" }),
      page("closed", { viewStatus: "detached" }),
      page("worker", { ownedByRuntime: true, lifecycle: "discarded" }),
    ];
    const layout = syncSpaces({ ...emptyLayout(), order: pages.map((item) => item.pageId) }, pages);
    expect(tabsInSpace(layout, pages, DEFAULT_SPACE.id).map((item) => item.pageId)).toEqual([
      "live",
      "discarded",
      "frozen",
      "placeholder",
    ]);
  });

  it("keeps a detached tab sleeping when the catalog still says live", () => {
    expect(lifecycleForStrip("live", undefined, "detached")).toBe("discarded");
    expect(lifecycleForStrip("discarded", "live", "detached")).toBe("discarded");
    expect(lifecycleForStrip("live", "placeholder", "detached")).toBe("placeholder");
    expect(lifecycleForStrip("discarded", "live", "visible")).toBe("live");
  });
});

describe("spaces", () => {
  it("new pages land in the active space; a new space gets a fresh colour", () => {
    let layout = createSpace(emptyLayout(), "Research");
    expect(layout.spaces).toHaveLength(2);
    expect(layout.spaces[1]!.color).not.toBe(layout.spaces[0]!.color);
    expect(layout.activeSpaceId).toBe(layout.spaces[1]!.id);
    layout = syncSpaces(layout, [page("n")]);
    expect(layout.tabSpace.n).toBe(layout.spaces[1]!.id);
  });

  it("removing a space folds its tabs and pins into a neighbour and never removes the last one", () => {
    let layout = createSpace(emptyLayout(), "Work");
    const work = layout.activeSpaceId;
    layout = assignSpace(layout, "t1", work);
    layout = togglePin(layout, work, { url: "https://a.com/", title: "A" });
    layout = removeSpace(layout, work);
    expect(layout.spaces.map((s) => s.id)).toEqual([DEFAULT_SPACE.id]);
    expect(layout.tabSpace.t1).toBe(DEFAULT_SPACE.id);
    expect(isPinned(layout, DEFAULT_SPACE.id, "https://a.com/")).toBe(true);
    expect(layout.activeSpaceId).toBe(DEFAULT_SPACE.id);
    expect(removeSpace(layout, DEFAULT_SPACE.id)).toBe(layout);
  });

  it("ignores assignments to unknown spaces", () => {
    const layout = emptyLayout();
    expect(assignSpace(layout, "p", "nope")).toBe(layout);
    expect(setActiveSpace(layout, "nope")).toBe(layout);
  });
});

describe("pins", () => {
  it("keeps overflow pins and toggles individual pins", () => {
    let layout = emptyLayout();
    for (let i = 0; i < 7; i++)
      layout = togglePin(layout, DEFAULT_SPACE.id, { url: `https://s${i}.com/`, title: `s${i}` });
    expect(layout.pins[DEFAULT_SPACE.id]).toHaveLength(7);
    expect(roundTrip(layout).pins[DEFAULT_SPACE.id]).toHaveLength(7);
    layout = togglePin(layout, DEFAULT_SPACE.id, { url: "https://s0.com/", title: "s0" });
    expect(isPinned(layout, DEFAULT_SPACE.id, "https://s0.com/")).toBe(false);
  });
});

describe("folders", () => {
  it("files tabs into a folder and leaves the rest unfiled", () => {
    const pages = [page("a"), page("b"), page("c")];
    let layout = syncSpaces({ ...emptyLayout(), order: ["a", "b", "c"] }, pages);
    layout = createFolder(layout, DEFAULT_SPACE.id, "Dev");
    const folderId = layout.folders[0]!.id;
    layout = assignFolder(layout, "a", folderId);
    layout = assignFolder(layout, "b", folderId);
    expect(tabsInFolder(layout, pages, folderId).map((p) => p.pageId)).toEqual(["a", "b"]);
    expect(unfiledTabs(layout, pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["c"]);
    layout = toggleFolder(layout, folderId);
    expect(layout.folders[0]!.collapsed).toBe(true);
    layout = assignFolder(layout, "a", null);
    expect(unfiledTabs(layout, pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["a", "c"]);
    layout = removeFolder(layout, folderId);
    expect(layout.folders).toHaveLength(0);
    expect(layout.tabFolder.b).toBeUndefined();
  });

  it("reorders inside a folder without shuffling unfiled tabs", () => {
    const pages = [page("a"), page("b"), page("c"), page("d")];
    let layout = syncSpaces({ ...emptyLayout(), order: ["a", "b", "c", "d"] }, pages);
    layout = createFolder(layout, DEFAULT_SPACE.id, "Dev");
    const folderId = layout.folders[0]!.id;
    layout = assignFolder(layout, "a", folderId);
    layout = assignFolder(layout, "b", folderId);
    layout = reorderGroup(layout, DEFAULT_SPACE.id, folderId, 1, 0, pages);
    expect(tabsInFolder(layout, pages, folderId).map((p) => p.pageId)).toEqual(["b", "a"]);
    expect(unfiledTabs(layout, pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["c", "d"]);
  });

  it("updates folder name and appearance without touching other fields", () => {
    let layout = syncSpaces({ ...emptyLayout(), order: ["a"] }, [page("a")]);
    layout = createFolder(layout, DEFAULT_SPACE.id, "Dev");
    const folderId = layout.folders[0]!.id;
    layout = assignFolder(layout, "a", folderId);
    layout = toggleFolder(layout, folderId);
    layout = updateFolder(layout, folderId, { name: "Builds", color: "green", emoji: "🔨" });
    const folder = layout.folders[0]!;
    expect(folder).toMatchObject({ name: "Builds", color: "green", emoji: "🔨", collapsed: true });
    expect(layout.tabFolder.a).toBe(folderId);
    layout = updateFolder(layout, folderId, { emoji: null });
    expect(layout.folders[0]!.emoji).toBeUndefined();
    expect(layout.folders[0]!.color).toBe("green");
    expect(roundTrip(layout).folders[0]).toEqual(layout.folders[0]);
    expect(updateFolder(layout, "missing", { name: "X" })).toBe(layout);
  });
});

describe("Profile organization persistence", () => {
  it("round-trips the current contract and rejects corrupt or incomplete data", () => {
    const layout = createSpace(emptyLayout(), "Work");
    expect(roundTrip(layout)).toEqual(layout);
    const stored = toOrganizationLayout(layout);
    for (const invalid of [null, "{not json", {}, { ...stored, shared: { ...stored.shared, spaces: [] } }]) {
      expect(OrganizationLayoutSchema.safeParse(invalid).success).toBe(false);
    }
    for (const grain of [101, -1, "75"]) {
      expect(
        OrganizationLayoutSchema.safeParse({
          ...stored,
          shared: { ...stored.shared, spaces: [{ ...stored.shared.spaces[0], grain }] },
        }).success,
      ).toBe(false);
    }
    const valid = {
      ...stored,
      shared: {
        ...stored.shared,
        spaces: [{ ...stored.shared.spaces[0], grain: 75 }],
        folders: [{ id: "f1", name: "Dev", spaceId: stored.window.activeSpaceId, collapsed: false }],
      },
    };
    expect(OrganizationLayoutSchema.parse(valid).shared.spaces[0]?.grain).toBe(75);
    expect(OrganizationLayoutSchema.parse(valid).shared.folders).toEqual(valid.shared.folders);
    expect(
      OrganizationLayoutSchema.safeParse({
        ...valid,
        shared: {
          ...valid.shared,
          folders: [{ id: "f1", name: "Dev", spaceId: stored.window.activeSpaceId }],
        },
      }).success,
    ).toBe(false);
  });
});

describe("Space continuity", () => {
  it("persists per-Space selection and restores splits only for live tabs in the same Space", () => {
    let layout = assignSpace(assignSpace(emptyLayout(), "a", DEFAULT_SPACE.id), "b", DEFAULT_SPACE.id);
    layout = rememberActiveTab(
      {
        ...layout,
        splitGroups: [{ id: "split-a", panes: ["a", "b"], layout: "row", ratios: [0.5], focused: "a" }],
      },
      "a",
    );
    const restored = roundTrip(layout);
    expect(restored.activeTabs?.[DEFAULT_SPACE.id]).toBe("a");
    expect(splitForPage(restored, [page("a"), page("b")], "a")).toBe("b");
    expect(splitForPage(restored, [page("a")], "a")).toBeNull();
    const second = createSpace(restored, "Other");
    expect(
      splitForPage(assignSpace(second, "b", second.activeSpaceId), [page("a"), page("b")], "a"),
    ).toBeNull();
  });
});

it("retains failed session placement while live tabs change and removes it after recovery ends", () => {
  let layout = createSpace(emptyLayout(), "Research");
  const space = layout.spaces.at(-1)!;
  layout = assignSpace({ ...layout, order: ["saved", "live"] }, "saved", space.id);
  const restored = syncSpaces(
    { ...layout, order: syncOrder(layout.order, [page("live"), page("new")], ["saved"]) },
    [page("live"), page("new")],
    ["saved"],
  );
  expect(restored.order).toEqual(["saved", "live", "new"]);
  expect(restored.tabSpace.saved).toBe(space.id);
  const completed = syncSpaces(
    { ...restored, order: syncOrder(restored.order, [page("live"), page("new")]) },
    [page("live"), page("new")],
  );
  expect(completed.order).toEqual(["live", "new"]);
  expect(completed.tabSpace.saved).toBeUndefined();
});

it("offers split view only for available browser-owned pages", () => {
  expect(canSplitPage(page("ready"))).toBe(true);
  expect(canSplitPage(undefined)).toBe(false);
  for (const changes of [
    { backend: "chrome" },
    { ownedByRuntime: true },
    { viewStatus: "detached" },
    { viewStatus: "crashed" },
    { url: "about:blank" },
  ] as Partial<PageTarget>[])
    expect(canSplitPage(page("unavailable", changes))).toBe(false);
  expect(canSplitPage(page("blank-document", { url: "about:blank", showBlankDocument: true }))).toBe(true);
});

it("keeps a split visible when either page is selected and clears replaced pairs", () => {
  const pages = [page("a"), page("b"), page("c")];
  const base = {
    ...emptyLayout(),
    tabSpace: { a: DEFAULT_SPACE.id, b: DEFAULT_SPACE.id, c: DEFAULT_SPACE.id },
  };
  const first = addPane(base, "a", "b");
  expect(splitForPage(first, pages, "a")).toBe("b");
  expect(splitForPage(first, pages, "b")).toBe("a");
  const replaced = addPane(separate(first, "a"), "a", "c");
  expect(splitForPage(replaced, pages, "b")).toBeNull();
  expect(splitForPage(replaced, pages, "c")).toBe("a");
  const closed = separate(replaced, "c");
  expect(splitForPage(closed, pages, "a")).toBeNull();
  expect(splitForPage(closed, pages, "c")).toBeNull();
});

it("pairs a conversation preview with the current tab when that tab can share the stage", () => {
  const layout = { ...emptyLayout(), tabSpace: { current: DEFAULT_SPACE.id, preview: DEFAULT_SPACE.id } };
  expect(previewSplit(layout, [page("current"), page("preview")], "preview", "current")).toEqual({
    primary: "current",
    companion: "preview",
  });
});

it("falls back to another tab in the same Space when the current tab cannot share the stage", () => {
  const layout = {
    ...emptyLayout(),
    tabSpace: { current: "space-other", preview: DEFAULT_SPACE.id, partner: DEFAULT_SPACE.id },
  };
  expect(
    previewSplit(layout, [page("current"), page("preview"), page("partner")], "preview", "current"),
  ).toEqual({ primary: "preview", companion: "partner" });
  const samePage = { ...emptyLayout(), tabSpace: { current: DEFAULT_SPACE.id, preview: DEFAULT_SPACE.id } };
  expect(previewSplit(samePage, [page("current"), page("preview")], "current", "current")).toEqual({
    primary: "current",
    companion: "preview",
  });
});

it("does not offer a split for a crashed page, a page in another Space, or a page with no partner", () => {
  const layout = {
    ...emptyLayout(),
    tabSpace: { current: DEFAULT_SPACE.id, preview: DEFAULT_SPACE.id, other: "space-other" },
  };
  expect(
    previewSplit(layout, [page("current"), page("preview"), page("other")], "other", "current"),
  ).toBeNull();
  expect(previewSplit(layout, [page("only")], "only", "only")).toBeNull();
  expect(
    previewSplit(layout, [page("preview", { viewStatus: "crashed" }), page("current")], "preview", "current"),
  ).toBeNull();
});

it("keeps horizontal group members contiguous without losing ungrouped or orphaned tabs", () => {
  const layout = emptyLayout();
  layout.folders = [{ id: "research", name: "Research", spaceId: layout.activeSpaceId, collapsed: true }];
  layout.tabFolder = { a: "research", c: "research", d: "deleted" };
  const tabs = ["a", "b", "c", "d"].map((pageId) => ({ pageId }));
  expect(groupedTabs(layout, tabs).map((tab) => tab.pageId)).toEqual(["a", "c", "b", "d"]);
  expect(tabs.map((tab) => tab.pageId)).toEqual(["a", "b", "c", "d"]);
});

it("archives and restores exact Space organization while ignoring stale runtime presentation", () => {
  let layout = createSpace(emptyLayout(), "Local research", "teal", 35);
  const spaceId = layout.activeSpaceId;
  layout = createFolder(layout, spaceId, "Sources");
  layout = assignFolder(assignSpace(layout, "page", spaceId), "page", layout.folders[0]!.id);
  layout = togglePin(layout, spaceId, { url: "https://example.test", title: "Source" });
  const before = roundTrip(layout);
  const archived = roundTrip(archiveSpace(layout, spaceId));
  const reconciled = reconcileSpaces(archived, [
    {
      id: spaceId,
      workspaceId: "real-workspace",
      name: "Stale name",
      color: "pink",
      grain: 0,
      archived: false,
    },
    { id: "invented", workspaceId: "other", name: "Untrusted ID", color: "slate", grain: 0, archived: false },
    {
      id: "workspace:genuine",
      workspaceId: "genuine",
      name: "CLI project",
      color: "slate",
      grain: 0,
      archived: false,
    },
  ]);
  expect(reconciled.archivedSpaces?.[0]).toEqual({ ...before.spaces[1], workspaceId: "real-workspace" });
  expect(reconciled.spaces.map((space) => space.id)).toEqual([before.spaces[0]!.id, "workspace:genuine"]);
  expect(reconciled.tabSpace).toEqual(before.tabSpace);
  expect(reconciled.tabFolder).toEqual(before.tabFolder);
  expect(reconciled.folders).toEqual(before.folders);
  expect(reconciled.pins).toEqual(before.pins);
  const restored = roundTrip(restoreSpace(reconciled, spaceId));
  expect(restored.spaces.find((space) => space.id === spaceId)).toEqual({
    ...before.spaces[1],
    workspaceId: "real-workspace",
  });
  expect(restored.archivedSpaces).toEqual([]);
  expect(() => archiveSpace(emptyLayout(), DEFAULT_SPACE.id)).toThrow("Keep at least one active Space.");
});
