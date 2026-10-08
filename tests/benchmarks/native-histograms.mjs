/** CDP exposes cumulative UMA counts and sums. An input is a raw sample only
 * when it adds exactly one observation to the named histogram. */
export function histogram(response, name) {
  const item = response.histograms?.find((entry) => entry.name === name);
  if (!item) return { count: 0, sum: 0 };
  if (!Number.isSafeInteger(item.count) || !Number.isFinite(item.sum))
    throw new Error(`Invalid Chromium histogram: ${name}`);
  return { count: item.count, sum: item.sum };
}

export function oneObservation(before, after, name) {
  if (after.count !== before.count + 1)
    throw new Error(`${name} added ${after.count - before.count} observations; expected exactly one`);
  const duration = after.sum - before.sum;
  if (!Number.isFinite(duration) || duration < 0) throw new Error(`${name} returned an invalid duration`);
  return duration;
}

export const tabPresentationNames = {
  latency: "AuxPerf.TabSwitchInputToPresentedUs",
  frameInterval: "AuxPerf.TabSwitchFrameIntervalUs",
};

export function onePresentation(before, after) {
  if (
    before.latency.count !== before.frameInterval.count ||
    after.latency.count !== after.frameInterval.count
  )
    throw new Error("Native latency and frame interval counters are not paired");
  const latencyUs = oneObservation(before.latency, after.latency, tabPresentationNames.latency);
  const frameIntervalUs = oneObservation(
    before.frameInterval,
    after.frameInterval,
    tabPresentationNames.frameInterval,
  );
  if (!Number.isSafeInteger(latencyUs) || !Number.isSafeInteger(frameIntervalUs))
    throw new Error("Native presentation samples must retain integer microseconds");
  // Zero is the native missing/non-VSync interval sentinel, never a guessed refresh rate.
  return { latencyUs, frameIntervalUs };
}
