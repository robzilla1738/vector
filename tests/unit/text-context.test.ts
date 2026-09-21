import { expect, it } from "vitest";
import { textContextShares } from "@vector/contracts";

it("keeps multiple long sources represented and returns unused short-source capacity", () => {
  expect(textContextShares([10_000, 10_000, 10_000], 6000)).toEqual([2000, 2000, 2000]);
  expect(textContextShares([40, 10_000, 0], 6000)).toEqual([40, 5960, 0]);
  expect(textContextShares([10_000, 40], 6000)).toEqual([5960, 40]);
  expect(textContextShares([5, 5, 5], 2)).toEqual([1, 1, 0]);
});
