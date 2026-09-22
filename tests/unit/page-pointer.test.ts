import { describe, expect, it } from "vitest";
import { boundsContaining, chromiumWheelDelta, cssCursor, inputEventFor, pointerHitsPage, readPagePointer } from "../../apps/desktop/main/page-pointer";

describe("page pointer", () => {
  it("accepts a shell pointer and drops malformed ones", () => {
    expect(readPagePointer({ kind: "down", x: 12, y: 40, button: "left", clickCount: 2, deltaX: 0, deltaY: 0, modifiers: ["shift", "nope"] })).toMatchObject({ kind: "down", x: 12, clickCount: 2, modifiers: ["shift"] });
    expect(readPagePointer({ kind: "nope", x: 1, y: 1 })).toBeNull();
    expect(readPagePointer({ kind: "move", x: Number.NaN, y: 1 })).toBeNull();
    expect(readPagePointer(null)).toBeNull();
  });

  it("hits the view under the pointer and maps it into that view", () => {
    const page = { id: "page", x: 280, y: 36, width: 800, height: 600 };
    expect(boundsContaining(100, 40, [page])).toBeUndefined();
    expect(boundsContaining(300, 80, [page])?.id).toBe("page");
    expect(inputEventFor({ kind: "down", x: 300, y: 80, button: "left", clickCount: 1, deltaX: 0, deltaY: 0, modifiers: [] }, page.x, page.y)).toMatchObject({ type: "mouseDown", x: 20, y: 44 });
  });

  it("flips wheel deltas into Chromium's coordinate", () => {
    expect(chromiumWheelDelta(2, 30)).toEqual({ deltaX: -2, deltaY: -30 });
    expect(inputEventFor({ kind: "wheel", x: 10, y: 10, button: "left", clickCount: 0, deltaX: 0, deltaY: 12, modifiers: ["control"] }, 0, 0)).toMatchObject({ type: "mouseWheel", deltaY: -12, modifiers: ["control"] });
  });

  it("maps Chromium cursors onto CSS", () => {
    expect(cssCursor("hand")).toBe("pointer");
    expect(cssCursor("i-beam")).toBe("text");
    expect(cssCursor("grab")).toBe("grab");
    expect(cssCursor("made-up")).toBe("auto");
  });

  it("keeps clicks on the address bar and sends the page hole through", () => {
    const chrome = { closest: (selector: string) => selector.includes(".toolbar") ? {} : null };
    const page = { closest: () => null };
    expect(pointerHitsPage(chrome, true)).toBe(false);
    expect(pointerHitsPage(page, true)).toBe(true);
    expect(pointerHitsPage(page, false)).toBe(false);
  });
});
