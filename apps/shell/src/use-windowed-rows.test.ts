import { expect, it } from "vitest";
import { windowRange } from "./use-windowed-rows";

it("windows rows around the viewport and clamps to the list", () => {
  expect(windowRange(0, 300, 100, 30, 500, 5)).toEqual({ start: 0, end: 15 });
  expect(windowRange(3100, 300, 100, 30, 500, 5)).toEqual({ start: 95, end: 115 });
  expect(windowRange(20_000, 300, 100, 30, 500, 5)).toEqual({ start: 500, end: 500 });
  expect(windowRange(0, 300, 0, 0, 7, 5)).toEqual({ start: 0, end: 7 });
});
