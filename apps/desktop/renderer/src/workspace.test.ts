import { describe, expect, it } from "vitest";
import type { PageTarget } from "@vector/contracts";
import {
  DEFAULT_SPACE,
  assignSpace,
  createSpace,
  emptyLayout,
  isPinned,
  moveTab,
  parseLayout,
  removeSpace,
  reorderInSpace,
  setActiveSpace,
  syncOrder,
  syncSpaces,
  tabsInSpace,
  togglePin,
} from "./workspace";

const page = (id: string, extra: Partial<PageTarget> = {}): PageTarget => ({
  pageId: id,
  backend: "vector",
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
    expect(tabsInSpace(reorderInSpace(layout, DEFAULT_SPACE.id, 0, 3, pages), pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["b", "c", "a"]);
    expect(reorderInSpace(layout, DEFAULT_SPACE.id, 1, 1, pages)).toBe(layout);
    expect(reorderInSpace(layout, DEFAULT_SPACE.id, 9, 0, pages)).toBe(layout);
  });

  it("moveTab places before a target or at the end", () => {
    const layout = { ...emptyLayout(), order: ["a", "b", "c"] };
    expect(moveTab(layout, "c", "a").order).toEqual(["c", "a", "b"]);
    expect(moveTab(layout, "a", null).order).toEqual(["b", "c", "a"]);
    expect(moveTab(layout, "a", "a")).toBe(layout);
  });

  it("hides worker and detached pages from the tab list", () => {
    const pages = [page("a"), page("w", { ownedByRuntime: true }), page("bg", { viewStatus: "background" }), page("d", { viewStatus: "detached" })];
    const layout = syncSpaces({ ...emptyLayout(), order: syncOrder([], pages) }, pages);
    expect(tabsInSpace(layout, pages, DEFAULT_SPACE.id).map((p) => p.pageId)).toEqual(["a"]);
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
  it("toggles and caps at 12 per space", () => {
    let layout = emptyLayout();
    for (let i = 0; i < 14; i++) layout = togglePin(layout, DEFAULT_SPACE.id, { url: `https://s${i}.com/`, title: `s${i}` });
    expect(layout.pins[DEFAULT_SPACE.id]).toHaveLength(12);
    layout = togglePin(layout, DEFAULT_SPACE.id, { url: "https://s0.com/", title: "s0" });
    expect(isPinned(layout, DEFAULT_SPACE.id, "https://s0.com/")).toBe(false);
  });
});

describe("persistence", () => {
  it("round-trips and survives corrupt storage", () => {
    const layout = createSpace(emptyLayout(), "Work");
    expect(parseLayout(JSON.stringify(layout))).toEqual(layout);
    expect(parseLayout(null)).toEqual(emptyLayout());
    expect(parseLayout("{not json")).toEqual(emptyLayout());
    expect(parseLayout(JSON.stringify({ spaces: [] })).spaces).toHaveLength(1);
    const bad = parseLayout(JSON.stringify({ spaces: [{ id: "x", name: "X", color: "blue" }], activeSpaceId: "missing", order: [1, "ok"] }));
    expect(bad.activeSpaceId).toBe("x");
    expect(bad.order).toEqual(["ok"]);
  });
});
