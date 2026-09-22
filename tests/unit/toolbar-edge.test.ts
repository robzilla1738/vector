import { describe, expect, it } from "vitest";
import { pagePointerKeepsToolbar, toolbarEdgeFromCursor } from "../../apps/desktop/main/toolbar-edge";

const stage = { x: 280, y: 0, width: 1000, height: 800 };
const content = { x: 100, y: 40 };

describe("toolbar edge", () => {
  it("opens only at the top of the page and stays open through the chrome band", () => {
    expect(pagePointerKeepsToolbar(10, false)).toBe(true);
    expect(pagePointerKeepsToolbar(80, false)).toBe(false);
    expect(pagePointerKeepsToolbar(-20, false)).toBe(false);
    expect(pagePointerKeepsToolbar(-20, true)).toBe(true);
    expect(pagePointerKeepsToolbar(40, true)).toBe(true);
    expect(pagePointerKeepsToolbar(90, true)).toBe(false);
  });

  it("ignores the pointer when it is over the sidebar", () => {
    expect(toolbarEdgeFromCursor({ x: 120, y: 50 }, content, stage, false)).toBe(false);
    expect(toolbarEdgeFromCursor({ x: 500, y: 55 }, content, stage, false)).toBe(true);
  });
});
