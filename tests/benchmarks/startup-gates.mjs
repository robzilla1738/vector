/** Arithmetic over already authenticated raw receipts; this does not qualify a
 * producer, launch, cache state, stock build, or candidate identity. */
export function startupDistribution(samples) {
  if (
    !Array.isArray(samples) ||
    samples.length < 20 ||
    samples.length > 200 ||
    samples.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new Error("Startup gates require 20–200 finite nonnegative raw samples");
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = (probability) => sorted[Math.ceil(probability * sorted.length) - 1];
  return {
    count: sorted.length,
    p50Ms: rank(0.5),
    p95Ms: rank(0.95),
    maxMs: sorted.at(-1),
    rawMs: [...samples],
  };
}

/** UI endpoints are independent. Runtime acknowledgement never substitutes for
 * or delays selection of the first-frame and interactive measurements. */
export function evaluateStartupBudgets({ firstFrameMs, interactiveMs, helloAckMs, stockFirstFrameMs }) {
  const firstFrame = startupDistribution(firstFrameMs);
  const interactive = startupDistribution(interactiveMs);
  const helloAck = startupDistribution(helloAckMs);
  const stockFirstFrame = startupDistribution(stockFirstFrameMs);
  if (![interactive, helloAck, stockFirstFrame].every((metric) => metric.count === firstFrame.count))
    throw new Error("Keep matched trial counts; missing endpoints cannot be omitted");
  if (stockFirstFrame.p50Ms <= 0 || stockFirstFrame.p95Ms <= 0)
    throw new Error("Stock baseline must be positive");
  const checks = {
    firstFrameP50: firstFrame.p50Ms <= 800,
    firstFrameP95: firstFrame.p95Ms <= 1500,
    interactiveP50: interactive.p50Ms <= 800,
    interactiveP95: interactive.p95Ms <= 1500,
    helloAckP50: helloAck.p50Ms <= 1000,
    stockFirstFrameP50: firstFrame.p50Ms <= stockFirstFrame.p50Ms * 1.1,
    stockFirstFrameP95: firstFrame.p95Ms <= stockFirstFrame.p95Ms * 1.1,
  };
  return {
    arithmeticPass: Object.values(checks).every(Boolean),
    checks,
    firstFrame,
    interactive,
    helloAck,
    stockFirstFrame,
  };
}

/** Exact arithmetic only over already authenticated original native microsecond
 * receipts. No source/launch/cache/AC/stock authority is inferred here. */
export function evaluateRawStartupBudgets({ firstFrameUs, interactiveUs, helloAckUs, stockFirstFrameUs }) {
  function distribution(raw) {
    if (
      !Array.isArray(raw) ||
      raw.length < 20 ||
      raw.length > 200 ||
      raw.some(
        (value) =>
          typeof value !== "string" ||
          !/^[1-9][0-9]{0,18}$/.test(value) ||
          BigInt(value) > 9223372036854775807n,
      )
    )
      throw new Error("Keep 20–200 original positive native microsecond samples");
    const sorted = raw.map(BigInt).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return {
      count: raw.length,
      p50Us: sorted[Math.ceil(raw.length * 0.5) - 1],
      p95Us: sorted[Math.ceil(raw.length * 0.95) - 1],
      maxUs: sorted.at(-1),
      rawUs: [...raw],
    };
  }
  const metrics = [firstFrameUs, interactiveUs, helloAckUs, stockFirstFrameUs].map(distribution);
  const [firstFrame, interactive, helloAck, stockFirstFrame] = metrics;
  if (metrics.some((metric) => metric.count !== firstFrame.count))
    throw new Error("Keep every matched original endpoint/trial");
  const checks = {
    firstFrameP50: firstFrame.p50Us <= 800_000n,
    firstFrameP95: firstFrame.p95Us <= 1_500_000n,
    interactiveP50: interactive.p50Us <= 800_000n,
    interactiveP95: interactive.p95Us <= 1_500_000n,
    helloAckP50: helloAck.p50Us <= 1_000_000n,
    stockFirstFrameP50: firstFrame.p50Us * 10n <= stockFirstFrame.p50Us * 11n,
    stockFirstFrameP95: firstFrame.p95Us * 10n <= stockFirstFrame.p95Us * 11n,
  };
  const saved = (metric) => ({
    ...metric,
    p50Us: String(metric.p50Us),
    p95Us: String(metric.p95Us),
    maxUs: String(metric.maxUs),
  });
  return {
    arithmeticPass: Object.values(checks).every(Boolean),
    checks,
    firstFrame: saved(firstFrame),
    interactive: saved(interactive),
    helloAck: saved(helloAck),
    stockFirstFrame: saved(stockFirstFrame),
  };
}
