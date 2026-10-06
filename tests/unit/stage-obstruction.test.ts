import { describe, expect, it } from "vitest";
import { stageAvoiding } from "../../apps/shell/src/stage-obstruction";

describe("stage beside a menu", () => {
  const stage = { x: 280, y: 0, width: 1000, height: 800 };

  it("leaves the page alone when the menu stays in the sidebar", () => {
    expect(stageAvoiding(stage, [{ x: 16, y: 400, width: 220, height: 280 }])).toEqual(stage);
  });

  it("keeps the rest of the page when a menu overlaps its left edge", () => {
    expect(stageAvoiding(stage, [{ x: 200, y: 420, width: 240, height: 260 }])).toEqual({
      x: 440,
      y: 0,
      width: 840,
      height: 800,
    });
  });
});
