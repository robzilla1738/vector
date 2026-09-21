import { expect, it } from "vitest";
import { setPageZoom } from "../../apps/desktop/main/page-zoom.js";

it("uses familiar percentage stops from either direction, including custom starting sizes", () => {
  let level = 0;
  const contents = { isDestroyed: () => false, getZoomLevel: () => level, setZoomLevel: (next: number) => { level = next; } };
  const percentage = () => Math.round(100 * 1.2 ** level);
  setPageZoom(contents, { direction: "in" }); expect(percentage()).toBe(110);
  setPageZoom(contents, { direction: "in" }); expect(percentage()).toBe(125);
  setPageZoom(contents, { direction: "out" }); expect(percentage()).toBe(110);
  setPageZoom(contents, { level: Math.log(1.2) / Math.log(1.2) });
  setPageZoom(contents, { direction: "in" }); expect(percentage()).toBe(125);
  setPageZoom(contents, { reset: true }); expect(percentage()).toBe(100);
  setPageZoom(contents, { direction: "out" }); expect(percentage()).toBe(90);
});

it("clamps zoom at browser bounds and retains explicit and relative API changes", () => {
  let level = 0;
  const contents = { isDestroyed: () => false, getZoomLevel: () => level, setZoomLevel: (next: number) => { level = next; } };
  setPageZoom(contents, { level: 100 });
  expect(Math.round(100 * 1.2 ** setPageZoom(contents, { direction: "in" }).level)).toBe(500);
  setPageZoom(contents, { delta: -100 });
  expect(Math.round(100 * 1.2 ** setPageZoom(contents, { direction: "out" }).level)).toBe(25);
  expect(() => setPageZoom(contents, { level: NaN })).toThrow("Invalid page zoom");
  expect(() => setPageZoom({ ...contents, isDestroyed: () => true }, {})).toThrow("no longer available");
});
