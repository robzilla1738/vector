// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { positionContextMenu, positionAnchoredPopover } from "./position-context-menu";

afterEach(() => vi.unstubAllGlobals());

it.each([
  { x: 100, y: 100, left: "100px", top: "100px" },
  { x: 799, y: 599, left: "520px", top: "192px" },
  { x: -10, y: -10, left: "8px", top: "8px" },
])("keeps unscaled menu bounds in the viewport at $x,$y", ({ x, y, left, top }) => {
  vi.stubGlobal("innerWidth", 800);
  vi.stubGlobal("innerHeight", 600);
  const menu = document.createElement("div");
  Object.defineProperties(menu, { offsetWidth: { value: 272 }, offsetHeight: { value: 400 } });
  const bounds = vi.spyOn(menu, "getBoundingClientRect");
  positionContextMenu(menu, x, y);
  expect(menu.style.left).toBe(left);
  expect(menu.style.top).toBe(top);
  expect(bounds).not.toHaveBeenCalled();
});

it("places a composer picker above its anchor and grows again when space returns", () => {
  vi.stubGlobal("innerWidth", 800);
  vi.stubGlobal("innerHeight", 600);
  const menu = document.createElement("div");
  Object.defineProperties(menu, {
    offsetWidth: { value: 272 },
    offsetHeight: { get: () => Math.min(400, Number.parseFloat(menu.style.maxHeight) || 400) },
  });
  positionAnchoredPopover(menu, { left: 620, top: 300, bottom: 332 });
  expect(menu.style.maxHeight).toBe("286px");
  expect(menu.style.top).toBe("8px");
  expect(Number.parseFloat(menu.style.top) + menu.offsetHeight).toBeLessThan(300);
  positionAnchoredPopover(menu, { left: 100, top: 500, bottom: 532 });
  expect(menu.style.maxHeight).toBe("420px");
  expect(menu.style.top).toBe("94px");
  positionAnchoredPopover(menu, { left: 100, top: 40, bottom: 72 });
  expect(menu.style.top).toBe("78px");
  expect(menu.style.maxHeight).toBe("420px");
});
