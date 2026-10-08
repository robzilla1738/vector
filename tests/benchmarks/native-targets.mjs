const MiB = 1024 * 1024;
const MB = 1_000_000;
const measurement = (value) => Number.isFinite(value) && value >= 0;

function median(samples, select) {
  if (!Array.isArray(samples) || samples.length !== 5) return null;
  const values = Array.from(samples, select);
  return values.every(measurement) ? values.sort((a, b) => a - b)[2] : null;
}

function interactions(samples, metric) {
  if (!Array.isArray(samples) || samples.length !== 5) return null;
  const groups = Array.from(samples, (sample) => sample?.interactions?.[metric]);
  if (groups.some((values) => !Array.isArray(values) || values.length !== 20)) return null;
  return groups.flat();
}

function percentile(values) {
  return values?.length === 100 && values.every(Number.isFinite)
    ? [...values].sort((a, b) => a - b)[94]
    : null;
}

export function tabPresentationSummary(samples) {
  const pairs = interactions(samples, "tabSwitch");
  const latency = pairs?.every((pair) => Number.isSafeInteger(pair?.latencyUs) && pair.latencyUs >= 0)
    ? pairs.map((pair) => pair.latencyUs / 1000).sort((a, b) => a - b)
    : null;
  const intervals =
    latency && pairs.every((pair) => Number.isSafeInteger(pair.frameIntervalUs) && pair.frameIntervalUs > 0)
      ? pairs.map((pair) => pair.frameIntervalUs)
      : null;
  return {
    samples: pairs?.length ?? 0,
    p50: latency?.[49] ?? null,
    p95: latency?.[94] ?? null,
    max: latency?.at(-1) ?? null,
    frameIntervalRangeUs: intervals ? { min: Math.min(...intervals), max: Math.max(...intervals) } : null,
    frameAdjustedP95Us: intervals
      ? percentile(pairs.map((pair) => pair.latencyUs - pair.frameIntervalUs))
      : null,
  };
}

function target(label, observed, limit, unit, basis) {
  observed = Number.isFinite(observed) ? observed : null;
  limit = Number.isFinite(limit) ? limit : null;
  let status = "unavailable";
  if (observed !== null && limit !== null) status = observed <= limit ? "met" : "missed";
  return { label, status, observed, limit, unit, basis };
}

/** Advisory comparisons only; unavailable samples never become zero or a smaller sample set. */
export function performanceTargets(report) {
  const { aux, stock } = report.raw;
  const firstFrame = median(aux, (sample) => sample?.firstFrame);
  const stockFrame = median(stock, (sample) => sample?.firstFrame);
  const memory = (samples, field) =>
    report.method.idleTabs === 10 ? median(samples, (sample) => sample?.memorySummary?.[field]) : null;
  const shell = memory(aux, "shellPhysicalFootprintBytes");
  const runtime = memory(aux, "runtimePhysicalFootprintBytes");
  const auxMemory = memory(aux, "physicalFootprintBytes");
  const stockMemory = memory(stock, "physicalFootprintBytes");
  const auxApp = report.medians.aux?.appBytes;
  const stockApp = report.medians.stock?.appBytes;
  const tabSwitch = tabPresentationSummary(aux);
  const commandBar = interactions(aux, "commandBar");
  const ready = median(aux, (sample) => {
    const phases = Array.isArray(sample?.runtimeBoot)
      ? sample.runtimeBoot.filter((phase) => phase?.phase === "ready")
      : [];
    return phases.length === 1 ? phases[0].processElapsedMs : null;
  });
  const targets = {
    firstFrame: target("Cold first frame", firstFrame, 500, "ms", "Median of all five Aux launches."),
    firstFrameRelative: target(
      "Cold first frame vs stock + 5%",
      firstFrame,
      stockFrame !== null && stockFrame > 0 ? stockFrame * 1.05 : null,
      "ms",
      "Aux median compared with 1.05 times the positive stock median; five launches each.",
    ),
    interactive: target(
      "Launch to interactive",
      median(aux, (sample) => sample?.coldInteractive),
      700,
      "ms",
      "Five-launch median conservative bound, including real input and probe overhead.",
    ),
    runtimeReady: target(
      "Runtime ready (timing only)",
      ready,
      600,
      "ms",
      "Five-launch median processElapsedMs; exactly one ready mark per process. Does not prove readiness is off the browser critical path.",
    ),
    warmWindow: {
      ...target(
        "Warm new window ready",
        median(aux, (sample) => {
          const firstFrame = sample?.warmWindow?.firstFrameUs;
          const controlsReady = sample?.warmWindow?.controlsReadyUs;
          return Number.isSafeInteger(firstFrame) &&
            firstFrame >= 0 &&
            Number.isSafeInteger(controlsReady) &&
            controlsReady >= 0
            ? Math.max(firstFrame, controlsReady) / 1000
            : null;
        }),
        120,
        "ms",
        "Five-window median of max(firstFrameUs, controlsReadyUs), from native OpenEmptyWindow in the same process. Exact additional-window and subsequent ordinary input proof; excludes CmdN ingress and input-probe time.",
      ),
      diagnostics: {
        firstFrameMs: median(aux, (sample) =>
          measurement(sample?.warmWindow?.firstFrameUs) ? sample.warmWindow.firstFrameUs / 1000 : null,
        ),
        controlsReadyMs: median(aux, (sample) =>
          measurement(sample?.warmWindow?.controlsReadyUs) ? sample.warmWindow.controlsReadyUs / 1000 : null,
        ),
        warmRelaunchFirstFrameMs: median(aux, (sample) => sample?.warmFirstFrame),
      },
    },
    tabSwitch: {
      ...target(
        "Tab switch p95 (one frame + 8 ms)",
        tabSwitch.frameAdjustedP95Us,
        8000,
        "µs",
        "95th of 100 latency-minus-paired-frame-interval observations, twenty per process; every interval must be positive and native VSync-backed.",
      ),
      diagnostics: { latencyP95Ms: tabSwitch.p95, frameIntervalRangeUs: tabSwitch.frameIntervalRangeUs },
    },
    commandBar: target(
      "Command-bar input to paint p95",
      report.method.historyEntries === 50000 && commandBar?.every(measurement)
        ? percentile(commandBar)
        : null,
      16,
      "ms",
      "95th of 100 retained native input observations, twenty per process, with 50,000 history entries.",
    ),
    shellMemory: target(
      "Shell footprint",
      shell === null ? null : shell / MiB,
      120,
      "MiB",
      "Median of five full original-shell process footprints with ten idle tabs.",
    ),
    runtimeMemory: target(
      "Runtime footprint",
      runtime === null ? null : runtime / MiB,
      90,
      "MiB",
      "Median of five full original-runtime process footprints with ten idle tabs.",
    ),
    totalMemoryOverhead: target(
      "Total footprint overhead vs stock",
      auxMemory === null || stockMemory === null ? null : (auxMemory - stockMemory) / MB,
      150,
      "MB",
      "Difference of five-sample process-tree medians with ten idle tabs; shared pages may count more than once.",
    ),
    appSizeOverhead: target(
      "App size overhead vs stock",
      measurement(auxApp) && measurement(stockApp) ? (auxApp - stockApp) / MB : null,
      90,
      "MB",
      "Difference of measured bundle bytes; includes the packaged runtime, which is also reported separately.",
    ),
  };
  if (targets.warmWindow.status === "unavailable")
    targets.warmWindow.reason =
      "Five actual same-process new-window measurements are unavailable; whole-process relaunch cannot substitute.";
  if (targets.tabSwitch.status === "unavailable")
    targets.tabSwitch.reason =
      "All 100 exact latency/positive-frame-interval pairs are required; zero or missing intervals cannot be guessed or dropped.";
  for (const item of Object.values(targets)) {
    if (item.status === "unavailable" && !item.reason)
      item.reason =
        "Required complete, finite, nonnegative measurements or workload metadata are unavailable; no samples were dropped.";
  }
  return targets;
}

export function formatPerformanceTargets(targets) {
  const format = (value, unit) => (value === null ? "—" : `${value.toFixed(2)} ${unit}`);
  const rows = Object.values(targets).map((item) => {
    let diagnostic =
      item.diagnostics && Object.hasOwn(item.diagnostics, "warmRelaunchFirstFrameMs")
        ? ` New-window first frame: ${format(item.diagnostics.firstFrameMs, "ms")}; controls ready: ${format(item.diagnostics.controlsReadyMs, "ms")}. Measured warm relaunch first frame: ${format(item.diagnostics.warmRelaunchFirstFrameMs, "ms")}.`
        : "";
    if (item.diagnostics && Object.hasOwn(item.diagnostics, "latencyP95Ms")) {
      diagnostic = ` Absolute latency p95: ${format(item.diagnostics.latencyP95Ms, "ms")}.`;
      const range = item.diagnostics.frameIntervalRangeUs;
      if (range) diagnostic += ` Actual frame intervals: ${range.min}–${range.max} µs.`;
    }
    return `| ${item.label} | ${format(item.observed, item.unit)} | ${format(item.limit, item.unit)} | ${item.status} | ${item.basis}${item.reason ? ` ${item.reason}` : ""}${diagnostic} |`;
  });
  return [
    "Performance targets are advisory; measurement completion does not mean every target passed.",
    "MiB = 1,048,576 bytes; MB = 1,000,000 bytes. Negative overhead means Aux measured smaller than stock.",
    "Comparisons use unrounded values; this table displays two decimal places.",
    "",
    "| Target | Observed | Limit | Result | Evidence / limitation |",
    "| --- | ---: | ---: | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}
