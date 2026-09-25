import assert from "node:assert/strict";
import { test } from "node:test";
import { summarizeSamples } from "./statistics.mjs";

test("benchmark report includes deterministic intervals and preserves raw extremes", () => {
  const samples = Array.from({ length: 20 }, (_, index) => index + 1);
  const first = summarizeSamples(samples);
  const second = summarizeSamples(samples);
  assert.deepEqual(first, second);
  assert.equal(first.n, 20);
  assert.equal(first.min, 1);
  assert.equal(first.max, 20);
  assert.equal(first.p50, 10.5);
  assert.equal(first.p95, 19.1);
  for (const key of ["p50", "p95"]) {
    const [lower, upper] = first.confidence95[key];
    assert.ok(lower <= first[key] && first[key] <= upper);
  }
  assert.deepEqual(summarizeSamples([7, 7, 7]).confidence95, { p50: [7, 7], p95: [7, 7] });
  assert.throws(() => summarizeSamples([1, Infinity]), /finite numbers/);
});
