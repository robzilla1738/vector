import { describe, expect, it } from "vitest";
import {
  addPane,
  emptyLayout,
  flipLayout,
  removePane,
  separate,
  splitGroupForPage,
  splitIndex,
  swapPanes,
  focusPane,
  resizeSplit,
} from "../../workspace";
const base = () => ({ ...emptyLayout(), tabSpace: { a: "s", b: "s", c: "s", d: "s", other: "elsewhere" } });
describe("shared split reducers", () => {
  it("adds 2, 3 and 4 panes and refuses a fifth, duplicate and other Space", () => {
    const two = addPane(base(), "a", "b");
    expect(splitGroupForPage(two, "b")!.panes).toEqual(["a", "b"]);
    const three = addPane(two, "a", "c", "bottom");
    expect(splitGroupForPage(three, "c")!.layout).toBe("one-plus-two");
    const four = addPane(three, "a", "d");
    expect(splitGroupForPage(four, "a")!.layout).toBe("grid");
    expect(addPane(four, "a", "b")).toBe(four);
    expect(addPane(four, "a", "other")).toBe(four);
  });
  it("reflows a removed focused pane and dissolves the final pair", () => {
    const four = addPane(addPane(addPane(base(), "a", "b"), "a", "c"), "a", "d");
    const three = removePane(four, "d");
    expect(splitGroupForPage(three, "a")!.focused).toBe("c");
    const two = removePane(three, "c");
    expect(splitGroupForPage(two, "a")!.layout).toBe("row");
    expect(removePane(two, "b").splitGroups).toEqual([]);
  });
  it("swaps, flips, focuses and separates without touching another group", () => {
    const two = addPane(base(), "a", "b");
    const more = addPane(two, "c", "d");
    expect(splitGroupForPage(swapPanes(more, "a"), "a")!.panes).toEqual(["b", "a"]);
    expect(splitGroupForPage(flipLayout(more, "a"), "a")!.layout).toBe("column");
    expect(splitGroupForPage(focusPane(more, "a"), "a")!.focused).toBe("a");
    expect(separate(more, "a").splitGroups).toHaveLength(1);
    expect(splitGroupForPage(separate(more, "a"), "c")).toBe(splitGroupForPage(more, "c"));
  });
  it("shares the immutable membership index and clamps only the requested divider", () => {
    const two = addPane(base(), "a", "b");
    expect(splitIndex(two)).toBe(splitIndex(two));
    const next = resizeSplit(two, "a", 0, 0.95);
    expect(splitGroupForPage(next, "a")!.ratios).toEqual([0.9]);
    expect(splitIndex(next)).not.toBe(splitIndex(two));
    expect(splitGroupForPage(two, "a")!.ratios).toEqual([0.5]);
  });
});
