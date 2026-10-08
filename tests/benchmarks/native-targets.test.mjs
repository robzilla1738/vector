import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPerformanceTargets, performanceTargets, tabPresentationSummary } from "./native-targets.mjs";

function report() {
  const samples = (kind) =>
    Array.from({ length: 5 }, (_, pair) => ({
      pair,
      firstFrame: 500,
      coldInteractive: 700,
      warmFirstFrame: 100,
      runtimeBoot: [{ phase: "ready", elapsedMs: 200, processElapsedMs: 600 }],
      interactions: {
        tabSwitch: Array.from({ length: 20 }, () => ({ latencyUs: 12000, frameIntervalUs: 0 })),
        commandBar: Array(20).fill(16),
      },
      memorySummary: {
        physicalFootprintBytes: kind === "aux" ? 1_150_000_000 : 1_000_000_000,
        shellPhysicalFootprintBytes: 120 * 1024 * 1024,
        runtimePhysicalFootprintBytes: 90 * 1024 * 1024,
      },
    }));
  return {
    status: "complete",
    method: { idleTabs: 10, historyEntries: 50000 },
    raw: { aux: samples("aux"), stock: samples("stock") },
    medians: { aux: { appBytes: 1_000_000_000 }, stock: { appBytes: 910_000_000 } },
  };
}

test("compares inclusive timing and byte budgets without changing measurement completion", () => {
  const measured = report();
  const targets = performanceTargets(measured);
  for (const [name, result] of Object.entries(targets))
    if (name !== "warmWindow" && name !== "tabSwitch") assert.equal(result.status, "met", name);
  assert.equal(targets.runtimeReady.observed, 600);
  assert.equal(targets.firstFrameRelative.limit, 525);
  assert.equal(targets.shellMemory.observed, 120);
  assert.equal(targets.shellMemory.unit, "MiB");
  assert.equal(targets.totalMemoryOverhead.observed, 150);
  assert.equal(targets.totalMemoryOverhead.unit, "MB");
  assert.equal(targets.appSizeOverhead.observed, 90);

  for (const sample of measured.raw.aux) {
    sample.firstFrame += 26;
    sample.memorySummary.shellPhysicalFootprintBytes++;
    sample.memorySummary.physicalFootprintBytes++;
  }
  measured.medians.aux.appBytes++;
  const missed = performanceTargets(measured);
  for (const name of [
    "firstFrame",
    "firstFrameRelative",
    "shellMemory",
    "totalMemoryOverhead",
    "appSizeOverhead",
  ])
    assert.equal(missed[name].status, "missed", name);
  assert.equal(measured.status, "complete");
  measured.medians.aux.appBytes = 800_000_000;
  assert.equal(performanceTargets(measured).appSizeOverhead.observed, -110);
  assert.equal(performanceTargets(measured).appSizeOverhead.status, "met");
});

test("never drops invalid observations or substitutes a partial set or another runtime clock", () => {
  for (const invalid of [null, undefined, NaN, Infinity, -1, "500"]) {
    const measured = report();
    measured.raw.aux[4].firstFrame = invalid;
    measured.raw.aux[4].memorySummary.shellPhysicalFootprintBytes = invalid;
    measured.raw.aux[4].runtimeBoot[0].processElapsedMs = invalid;
    measured.raw.aux[4].interactions.commandBar[19] = invalid;
    measured.medians.stock.appBytes = invalid;
    const targets = performanceTargets(measured);
    for (const name of [
      "firstFrame",
      "firstFrameRelative",
      "shellMemory",
      "runtimeReady",
      "commandBar",
      "appSizeOverhead",
    ])
      assert.equal(targets[name].status, "unavailable", `${name}: ${invalid}`);
  }
  const partial = report();
  partial.raw.aux.pop();
  assert.equal(performanceTargets(partial).firstFrame.status, "unavailable");
  assert.equal(performanceTargets(partial).runtimeReady.status, "unavailable");
  const ambiguous = report();
  ambiguous.raw.aux[0].runtimeBoot.push({ phase: "ready", processElapsedMs: 600 });
  assert.equal(performanceTargets(ambiguous).runtimeReady.status, "unavailable");
  ambiguous.raw.aux[0].runtimeBoot = [];
  assert.equal(performanceTargets(ambiguous).runtimeReady.status, "unavailable");
  ambiguous.raw.stock.forEach((sample) => {
    sample.firstFrame = 0;
  });
  assert.equal(performanceTargets(ambiguous).firstFrameRelative.status, "unavailable");
});

test("requires the actual interaction distribution and workload metadata", () => {
  const measured = report();
  measured.raw.aux[0].interactions.commandBar.pop();
  measured.raw.aux[1].interactions.commandBar.push(16);
  assert.equal(performanceTargets(measured).commandBar.status, "unavailable");
  const wrongWorkload = report();
  wrongWorkload.method.historyEntries = 100;
  wrongWorkload.method.idleTabs = 1;
  const targets = performanceTargets(wrongWorkload);
  for (const name of ["commandBar", "shellMemory", "runtimeMemory", "totalMemoryOverhead"])
    assert.equal(targets[name].status, "unavailable", name);
});

test("retains diagnostics without claiming unmeasured warm-window or display-frame targets", () => {
  const targets = performanceTargets(report());
  assert.equal(targets.warmWindow.status, "unavailable");
  assert.equal(targets.warmWindow.observed, null);
  assert.equal(targets.warmWindow.diagnostics.warmRelaunchFirstFrameMs, 100);
  assert.equal(targets.tabSwitch.status, "unavailable");
  assert.equal(targets.tabSwitch.observed, null);
  assert.equal(targets.tabSwitch.diagnostics.latencyP95Ms, 12);
  assert.equal(targets.tabSwitch.limit, 8000);
  const markdown = formatPerformanceTargets(targets);
  assert.match(markdown, /Performance targets are advisory/);
  assert.match(markdown, /Measured warm relaunch first frame: 100\.00 ms/);
  assert.match(markdown, /zero or missing intervals cannot be guessed or dropped/);
  assert.match(markdown, /MiB = 1,048,576 bytes; MB = 1,000,000 bytes/);
});

test("compares all exact variable-refresh pairs and both warm-window presentation signals", () => {
  const measured = report();
  for (const sample of measured.raw.aux) {
    sample.warmWindow = { firstFrameUs: 115000, controlsReadyUs: 120000 };
    sample.interactions.tabSwitch = Array.from({ length: 20 }, (_, index) => {
      const frameIntervalUs = index % 2 ? 16667 : 8333;
      return { latencyUs: frameIntervalUs + 8000, frameIntervalUs };
    });
  }
  let targets = performanceTargets(measured);
  assert.equal(targets.warmWindow.status, "met");
  assert.equal(targets.warmWindow.observed, 120);
  assert.equal(targets.warmWindow.diagnostics.firstFrameMs, 115);
  assert.equal(targets.warmWindow.diagnostics.controlsReadyMs, 120);
  assert.equal(targets.tabSwitch.status, "met");
  assert.equal(targets.tabSwitch.observed, 8000);
  assert.deepEqual(targets.tabSwitch.diagnostics.frameIntervalRangeUs, { min: 8333, max: 16667 });
  assert.equal(tabPresentationSummary(measured.raw.aux).p95, 24.667);
  for (const sample of measured.raw.aux) {
    sample.warmWindow.firstFrameUs = 120001;
    for (const pair of sample.interactions.tabSwitch) pair.latencyUs++;
  }
  targets = performanceTargets(measured);
  assert.equal(targets.warmWindow.status, "missed");
  assert.equal(targets.tabSwitch.status, "missed");
  delete measured.raw.aux[4].warmWindow.controlsReadyUs;
  measured.raw.aux[4].interactions.tabSwitch[19].frameIntervalUs = 0;
  targets = performanceTargets(measured);
  assert.equal(targets.warmWindow.status, "unavailable");
  assert.equal(targets.tabSwitch.status, "unavailable");
  assert.equal(targets.tabSwitch.diagnostics.latencyP95Ms, 24.668);
});
