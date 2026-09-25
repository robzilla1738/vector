/** Deterministic percentile bootstrap; raw samples remain the source of truth. */
function quantile(sorted, probability) {
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function generator(seed) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

const rounded = (value) => +value.toFixed(1);

/** Nonparametric 95% intervals for empirical p50 and p95, 2,000 resamples. */
export function summarizeSamples(samples) {
  if (!Array.isArray(samples) || !samples.length || samples.some((value) => !Number.isFinite(value))) {
    throw new Error("Benchmark samples must be a nonempty list of finite numbers.");
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const random = generator(0x415558 ^ samples.length);
  const boot50 = [];
  const boot95 = [];
  for (let trial = 0; trial < 2000; trial++) {
    const draw = Array.from({ length: samples.length }, () => sorted[Math.floor(random() * samples.length)]);
    draw.sort((a, b) => a - b);
    boot50.push(quantile(draw, 0.5));
    boot95.push(quantile(draw, 0.95));
  }
  boot50.sort((a, b) => a - b);
  boot95.sort((a, b) => a - b);
  return {
    n: sorted.length,
    mean: rounded(sorted.reduce((sum, value) => sum + value, 0) / sorted.length),
    p50: rounded(quantile(sorted, 0.5)),
    p95: rounded(quantile(sorted, 0.95)),
    min: sorted[0],
    max: sorted.at(-1),
    confidence95: {
      p50: [rounded(quantile(boot50, 0.025)), rounded(quantile(boot50, 0.975))],
      p95: [rounded(quantile(boot95, 0.025)), rounded(quantile(boot95, 0.975))],
    },
  };
}
