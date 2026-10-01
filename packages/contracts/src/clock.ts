/** Native timestamps stay in wall time; elapsed ages and scheduled delays share one scale. */
export function createClock(scale = 1, wallNow: () => number = Date.now) {
  if (!Number.isFinite(scale) || scale < 1 || scale > 100000) throw new Error("Invalid clock scale.");
  return {
    scale,
    now: wallNow,
    elapsedSince: (timestamp: number) => Math.max(0, wallNow() - timestamp) * scale,
    delayMs: (durationMs: number) => {
      if (!Number.isFinite(durationMs) || durationMs < 0) throw new Error("Invalid clock duration.");
      return durationMs / scale;
    },
  };
}
export type Clock = ReturnType<typeof createClock>;
