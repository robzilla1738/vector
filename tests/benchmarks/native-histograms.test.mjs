import assert from "node:assert/strict";
import { test } from "node:test";
import { histogram, oneObservation, onePresentation } from "./native-histograms.mjs";

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

test("retains exact presentation microseconds and unavailable intervals without repairing unmatched pairs", () => {
  const before = { latency: { count: 2, sum: 32000 }, frameInterval: { count: 2, sum: 16666 } };
  const after = { latency: { count: 3, sum: 48333 }, frameInterval: { count: 3, sum: 24999 } };
  assert.deepEqual(onePresentation(before, after), { latencyUs: 16333, frameIntervalUs: 8333 });
  assert.deepEqual(onePresentation(before, { ...after, frameInterval: { count: 3, sum: 16666 } }), {
    latencyUs: 16333,
    frameIntervalUs: 0,
  });
  assert.throws(
    () => onePresentation(before, { ...after, frameInterval: before.frameInterval }),
    /not paired/,
  );
  assert.throws(() => onePresentation(before, { ...after, latency: { count: 4, sum: 48333 } }), /not paired/);
  assert.throws(
    () =>
      onePresentation(before, {
        latency: { count: 4, sum: 64000 },
        frameInterval: { count: 4, sum: 33332 },
      }),
    /added 2/,
  );
  assert.throws(
    () => onePresentation(before, { ...after, latency: { count: 3, sum: 48333.5 } }),
    /integer microseconds/,
  );
});

test("rejects missing or overlapping events instead of inventing a latency", () => {
  const before = { count: 2, sum: 27 };
  assert.equal(oneObservation(before, { count: 3, sum: 41 }, "switch"), 14);
  assert.throws(() => oneObservation(before, { count: 2, sum: 27 }, "switch"), /added 0/);
  assert.throws(() => oneObservation(before, { count: 4, sum: 55 }, "switch"), /added 2/);
  assert.throws(() => oneObservation(before, { count: 3, sum: 20 }, "switch"), /invalid duration/);
});
