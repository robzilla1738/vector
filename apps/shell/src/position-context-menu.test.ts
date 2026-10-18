// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  positionContextMenu,
  positionAnchoredPopover,
  positionSelectedPopover,
} from "./position-context-menu";

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
  positionAnchoredPopover(menu, { left: 620, right: 720, top: 300, bottom: 332 });
  expect(menu.style.maxHeight).toBe("284px");
  expect(menu.style.top).toBe("8px");
  expect(Number.parseFloat(menu.style.top) + menu.offsetHeight).toBeLessThan(300);
  positionAnchoredPopover(menu, { left: 100, right: 200, top: 500, bottom: 532 });
  expect(menu.style.maxHeight).toBe("420px");
  expect(menu.style.top).toBe("92px");
  positionAnchoredPopover(menu, { left: 100, right: 200, top: 40, bottom: 72 });
  expect(menu.style.top).toBe("80px");
  expect(menu.style.maxHeight).toBe("420px");
});

it("aligns to the control's end while clamping narrow viewport edges", () => {
  vi.stubGlobal("innerWidth", 800);
  vi.stubGlobal("innerHeight", 600);
  const menu = document.createElement("div");
  Object.defineProperties(menu, { offsetWidth: { value: 344 }, offsetHeight: { value: 180 } });
  positionAnchoredPopover(menu, { left: 500, right: 620, top: 100, bottom: 132 }, "end");
  expect(menu.style.left).toBe("276px");
  expect(menu.style.top).toBe("140px");
  positionAnchoredPopover(menu, { left: 20, right: 120, top: 100, bottom: 132 }, "end");
  expect(menu.style.left).toBe("8px");
});

it("aligns the selected row center and text inset with its original trigger", () => {
  vi.stubGlobal("innerWidth", 800);
  vi.stubGlobal("innerHeight", 600);
  const menu = document.createElement("div"),
    selected = document.createElement("button");
  menu.append(selected);
  Object.defineProperties(menu, { offsetWidth: { value: 200 }, offsetHeight: { value: 220 } });
  menu.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
  selected.getBoundingClientRect = () => ({ top: 78, height: 32 }) as DOMRect;
  positionSelectedPopover(menu, { left: 300, right: 440, top: 200, bottom: 232 }, selected);
  expect(menu.style.minWidth).toBe("140px");
  expect(menu.style.left).toBe("296px");
  expect(menu.style.top).toBe("122px");
  expect(menu.scrollTop).toBe(0);
  expect(Number.parseFloat(menu.style.left) + 6 + 8).toBe(300 + 10);
  expect(Number.parseFloat(menu.style.top) + 78 + 16).toBe(216);
});

it("bounds a tall selected picker on both axes and scrolls the selected row into alignment", () => {
  vi.stubGlobal("innerWidth", 240);
  vi.stubGlobal("innerHeight", 180);
  const menu = document.createElement("div"),
    selected = document.createElement("button");
  menu.append(selected);
  Object.defineProperties(menu, {
    offsetWidth: { value: 200 },
    offsetHeight: { get: () => Math.min(600, Number.parseFloat(menu.style.maxHeight)) },
  });
  menu.getBoundingClientRect = () => ({ top: Number.parseFloat(menu.style.top) || 0 }) as DOMRect;
  selected.getBoundingClientRect = () =>
    ({ top: (Number.parseFloat(menu.style.top) || 0) + 400 - menu.scrollTop, height: 48 }) as DOMRect;
  positionSelectedPopover(menu, { left: 200, right: 232, top: 40, bottom: 72 }, selected);
  expect(menu.style.maxHeight).toBe("164px");
  expect(menu.style.left).toBe("32px");
  expect(menu.style.top).toBe("8px");
  expect(menu.scrollTop).toBe(376);
  expect(8 + 400 - menu.scrollTop + 24).toBe(56);
  // Repositioning preserves the exact row alignment, without accumulating its scroll.
  positionSelectedPopover(menu, { left: 200, right: 232, top: 40, bottom: 72 }, selected);
  expect(menu.scrollTop).toBe(376);
});

it.each([null, document.createElement("button")])(
  "uses the bounded four-pixel fallback without a contained selection",
  (selected) => {
    vi.stubGlobal("innerWidth", 240);
    vi.stubGlobal("innerHeight", 200);
    const menu = document.createElement("div");
    Object.defineProperties(menu, { offsetWidth: { value: 200 }, offsetHeight: { value: 100 } });
    positionSelectedPopover(menu, { left: 1, right: 100, top: 170, bottom: 194 }, selected);
    expect(menu.style.left).toBe("8px");
    expect(menu.style.top).toBe("92px");
  },
);

it("keeps an intrinsic selected picker at least as wide as its trigger without exceeding a narrow viewport", () => {
  vi.stubGlobal("innerWidth", 800);
  vi.stubGlobal("innerHeight", 600);
  const menu = document.createElement("div");
  Object.defineProperties(menu, {
    offsetWidth: { get: () => Math.max(152, Number.parseFloat(menu.style.minWidth) || 0) },
    offsetHeight: { value: 100 },
  });
  positionSelectedPopover(menu, { left: 500, right: 760, top: 100, bottom: 132 }, null);
  expect(menu.style.minWidth).toBe("260px");
  expect(menu.style.left).toBe("496px");
  positionSelectedPopover(menu, { left: 20, right: 620, top: 100, bottom: 132 }, null);
  expect(menu.style.minWidth).toBe("440px");
  vi.stubGlobal("innerWidth", 240);
  positionSelectedPopover(menu, { left: 5, right: 400, top: 100, bottom: 132 }, null);
  expect(menu.style.minWidth).toBe("224px");
  expect(menu.style.left).toBe("8px");
});
