import { describe, expect, it } from "vitest";
import type { SplitGroup } from "@aux/contracts";
import { dividerRatio, paneRects, springStep } from "./split-layout";
const group = (layout: SplitGroup["layout"], count: number): SplitGroup => ({ id: "g", panes: ["a", "b", "c", "d"].slice(0, count), layout, ratios: layout === "columns" ? [1 / 3, .5] : [.5, .5, .5], focused: "a" });
describe("fluid split geometry", () => {
  it.each([["row", 2], ["column", 2], ["columns", 3], ["one-plus-two", 3], ["grid", 4]] as const)("tiles %s without overlapping pages", (shape, count) => {
    const { panes, dividers } = paneRects({ x: 0, y: 0, width: 1200, height: 800 }, group(shape, count));
    expect(panes).toHaveLength(count); expect(dividers).toHaveLength(count - 1);
    for (const pane of panes) { expect(pane.width).toBeGreaterThanOrEqual(200); expect(pane.height).toBeGreaterThanOrEqual(200); expect(pane.x).toBeGreaterThanOrEqual(8); expect(pane.y).toBeGreaterThanOrEqual(8); }
    for (let i = 0; i < panes.length; i++) for (let j = i + 1; j < panes.length; j++) {
      const a = panes[i]!, b = panes[j]!;
      expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
    }
  });
  it("clamps minimums and uses a fifteen pixel midpoint snap", () => {
    const g = group("row", 2); g.ratios = [.1];
    const { panes, dividers } = paneRects({ x: 0, y: 0, width: 1000, height: 700 }, g);
    expect(panes[0]!.width).toBe(200);
    const d = dividers[0]!; const middle = d.origin + d.available / 2 + 4;
    expect(dividerRatio(d, middle + 15)).toBe(.5);
    expect(dividerRatio(d, middle + 16)).toBeGreaterThan(.5);
  });
  it("uses no outer inset in Minimal UI", () => {
    expect(paneRects({ x: 0, y: 0, width: 1000, height: 700 }, group("row", 2), 0).panes[0]!.x).toBe(0);
  });
  it("settles the specified spring without frame-rate dependent overshoot", () => {
    let p = 0, v = 0;
    for (let i = 0; i < 60; i++) { const step = springStep(p, v, 1, 1 / 60); p = step.position; v = step.velocity; expect(p).toBeLessThanOrEqual(1.01); }
    expect(p).toBeCloseTo(1, 5);
  });
});
