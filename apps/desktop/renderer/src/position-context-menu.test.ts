// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { positionContextMenu } from "./position-context-menu";

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
