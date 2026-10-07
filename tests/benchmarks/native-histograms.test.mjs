import assert from "node:assert/strict";
import { test } from "node:test";
import { histogram, oneObservation } from "./native-histograms.mjs";

test("extracts only the aggregate named UMA histogram", () => {
  const response = {
    histograms: [
      { name: "Browser.Tabs.TotalSwitchDuration3.WithSavedFrames", count: 5, sum: 70 },
      { name: "Browser.Tabs.TotalSwitchDuration3", count: 3, sum: 36 },
    ],
  };
  assert.deepEqual(histogram(response, "Browser.Tabs.TotalSwitchDuration3"), { count: 3, sum: 36 });
  assert.deepEqual(histogram(response, "Startup.BrowserWindow.FirstPaint"), { count: 0, sum: 0 });
});

test("rejects missing or overlapping events instead of inventing a latency", () => {
  const before = { count: 2, sum: 27 };
  assert.equal(oneObservation(before, { count: 3, sum: 41 }, "switch"), 14);
  assert.throws(() => oneObservation(before, { count: 2, sum: 27 }, "switch"), /added 0/);
  assert.throws(() => oneObservation(before, { count: 4, sum: 55 }, "switch"), /added 2/);
  assert.throws(() => oneObservation(before, { count: 3, sum: 20 }, "switch"), /invalid duration/);
});
