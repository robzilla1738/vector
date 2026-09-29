import type { PageTarget } from "@aux/contracts";

export const memorySaverCyclesKey = "aux.memory-saver-cycles.v1";
export const memorySaverCyclesChanged = "aux:memory-saver-cycles-changed";
let currentCycles: MemorySaverCycle[] = [];
let volatileFallback = false;
const MAX_ESTIMATE_BYTES = 1024 ** 4;
const SAFE_REASONS = new Set([
  "Sleeping tabs is unavailable in this window.", "The tab changed or moved. Review it again.",
  "Only a loaded background tab can sleep.", "This tab has no stable identity.",
  "Agent-owned tabs stay awake.", "Playing audio keeps this tab awake.",
  "Captured tabs stay awake.", "This tab has unload handlers and stays awake.",
  "Pinned tabs stay awake.", "Chromium kept this tab active.",
]);
const safeEstimate = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) > 0 && (value as number) <= MAX_ESTIMATE_BYTES;
const safeSite = (value: unknown): value is string => typeof value === "string" && value.length <= 253 && /^[a-z0-9.-]*$/i.test(value);

export type MemorySaverCycle = {
  at: number;
  pageId: string;
  site: string;
  slept: boolean;
  estimatedSavedBytes?: number;
  reason?: string;
};

export function readMemorySaverCycles(): MemorySaverCycle[] {
  try {
    const stored = localStorage.getItem(memorySaverCyclesKey);
    if (stored === null) return volatileFallback ? currentCycles : [];
    const value = JSON.parse(stored);
    if (!Array.isArray(value)) return [];
    return value.flatMap((row): MemorySaverCycle[] => {
      if (!row || !Number.isSafeInteger(row.at) || row.at < 0 ||
          typeof row.pageId !== "string" || !safeSite(row.site) ||
          typeof row.slept !== "boolean") return [];
      return [{ at: row.at, pageId: row.pageId, site: row.site, slept: row.slept,
        ...(row.slept && safeEstimate(row.estimatedSavedBytes)
          ? { estimatedSavedBytes: row.estimatedSavedBytes } : {}),
        ...(!row.slept && SAFE_REASONS.has(row.reason) ? { reason: row.reason } : {}),
      }];
    }).slice(0, 20);
  } catch { return currentCycles; }
}

export function recordMemorySaverCycle(page: Pick<PageTarget, "pageId" | "url">,
  result: { slept: boolean; estimatedSavedBytes?: number; reason?: string }) {
  let site = "";
  try { site = new URL(page.url).hostname; } catch { /* The scheduler only selects web URLs. */ }
  const cycle: MemorySaverCycle = { at: Date.now(), pageId: page.pageId, site,
    slept: result.slept,
    ...(result.slept && safeEstimate(result.estimatedSavedBytes)
      ? { estimatedSavedBytes: result.estimatedSavedBytes } : {}),
    ...(!result.slept && result.reason && SAFE_REASONS.has(result.reason) ? { reason: result.reason } : {}),
  };
  const cycles = [cycle, ...readMemorySaverCycles()].slice(0, 20);
  currentCycles = cycles;
  try { localStorage.setItem(memorySaverCyclesKey, JSON.stringify(cycles)); volatileFallback = false; }
  catch { volatileFallback = true; /* Keep this window's current cycles. */ }
  window.dispatchEvent(new Event(memorySaverCyclesChanged));
}

export function memorySaverSummary(cycles: readonly MemorySaverCycle[]) {
  const slept = cycles.filter(cycle => cycle.slept);
  return {
    slept: slept.length,
    estimatedSavedBytes: slept.reduce((total, cycle) => total + (cycle.estimatedSavedBytes ?? 0), 0),
    measured: slept.filter(cycle => cycle.estimatedSavedBytes !== undefined).length,
    latest: cycles[0] ?? null,
  };
}
