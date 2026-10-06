import { summarizeSamples } from "./statistics.mjs";

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
  const durationMs = after.sum - before.sum;
  if (!Number.isFinite(durationMs) || durationMs < 0) throw new Error(`${name} returned an invalid duration`);
  return durationMs;
}

export function metric(samples) {
  if (samples.length < 20) throw new Error("Native latency qualification requires at least 20 raw trials");
  return { units: "ms", samples, ...summarizeSamples(samples) };
}
