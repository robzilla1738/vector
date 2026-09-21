import { describe, expect, it } from "vitest";
import { splitRatio, splitWidths } from "../../packages/contracts/src/split-layout";

describe("split layout", () => {
  it("keeps a real gutter and covers the stage exactly at every width", () => {
    for (const width of [0, 4, 8, 100, 321, 640, 1023]) {
      for (const ratio of [.25, .5, .75]) {
        const result = splitWidths(width, ratio);
        expect(result.left + result.gutter + result.right).toBe(width);
        expect(Math.min(result.left, result.right)).toBeGreaterThanOrEqual(0);
        if (width >= 328) expect(Math.min(result.left, result.right)).toBeGreaterThanOrEqual(160);
      }
    }
  });
  it("bounds restored or IPC values and centers narrow panes", () => {
    expect(splitRatio(Infinity)).toBe(.5);
    expect(splitRatio("0.7")).toBe(.5);
    expect(splitRatio(4)).toBe(.75);
    expect(splitRatio(-1)).toBe(.25);
    expect(splitWidths(300, .75)).toEqual({left:146,gutter:8,right:146});
    expect(splitWidths(1008, .6)).toEqual({left:600,gutter:8,right:400});
  });
});
