import { describe, expect, it } from "vitest";
import { cursorAtWindowLeft, pagePointerKeepsToolbar, toolbarEdgeFromCursor } from "../../apps/desktop/main/toolbar-edge";

const stage = { x: 280, y: 0, width: 1000, height: 800 };
const content = { x: 100, y: 40 };

describe("toolbar edge", () => {
  it("opens only at the top of the page and stays open through the chrome band", () => {
    expect(pagePointerKeepsToolbar(6, false)).toBe(true);
    expect(pagePointerKeepsToolbar(7, false)).toBe(false);
    expect(pagePointerKeepsToolbar(80, false)).toBe(false);
    expect(pagePointerKeepsToolbar(-20, false)).toBe(false);
    expect(pagePointerKeepsToolbar(-20, true)).toBe(true);
    expect(pagePointerKeepsToolbar(14, true)).toBe(true);
    expect(pagePointerKeepsToolbar(15, true)).toBe(false);
    expect(pagePointerKeepsToolbar(90, true)).toBe(false);
  });

  it("opens the hidden sidebar only from the window's left edge", () => {
    const content = { x: 100, y: 40, width: 1200, height: 800 };
    expect(cursorAtWindowLeft({ x: 104, y: 200 }, content)).toBe(true);
    expect(cursorAtWindowLeft({ x: 107, y: 200 }, content)).toBe(false);
    expect(cursorAtWindowLeft({ x: 114, y: 200 }, content, true)).toBe(true);
    expect(cursorAtWindowLeft({ x: 115, y: 200 }, content, true)).toBe(false);
    expect(cursorAtWindowLeft({ x: 130, y: 200 }, content)).toBe(false);
    expect(cursorAtWindowLeft({ x: 104, y: 900 }, content)).toBe(false);
  });

  it("ignores the pointer when it is over the sidebar", () => {
    expect(toolbarEdgeFromCursor({ x: 120, y: 50 }, content, stage, false)).toBe(false);
    expect(toolbarEdgeFromCursor({ x: 500, y: 46 }, content, stage, false)).toBe(true);
    expect(toolbarEdgeFromCursor({ x: 500, y: 47 }, content, stage, false)).toBe(false);
  });
});
