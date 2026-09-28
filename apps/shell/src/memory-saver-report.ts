import type { PageTarget } from "@aux/contracts";

export const memorySaverCyclesKey = "aux.memory-saver-cycles.v1";
export const memorySaverCyclesChanged = "aux:memory-saver-cycles-changed";
let currentCycles: MemorySaverCycle[] = [];

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
    if (stored === null) return currentCycles;
    const value = JSON.parse(stored);
    if (!Array.isArray(value)) return [];
    return value.flatMap((row): MemorySaverCycle[] => {
      if (!row || !Number.isSafeInteger(row.at) || row.at < 0 ||
          typeof row.pageId !== "string" || typeof row.site !== "string" ||
          typeof row.slept !== "boolean") return [];
      return [{ at: row.at, pageId: row.pageId, site: row.site, slept: row.slept,
        ...(row.slept && Number.isSafeInteger(row.estimatedSavedBytes) && row.estimatedSavedBytes > 0
          ? { estimatedSavedBytes: row.estimatedSavedBytes } : {}),
        ...(!row.slept && typeof row.reason === "string" ? { reason: row.reason } : {}),
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
    ...(result.slept && Number.isSafeInteger(result.estimatedSavedBytes) && result.estimatedSavedBytes! > 0
      ? { estimatedSavedBytes: result.estimatedSavedBytes } : {}),
    ...(!result.slept && result.reason ? { reason: result.reason } : {}),
  };
  const cycles = [cycle, ...readMemorySaverCycles()].slice(0, 20);
  currentCycles = cycles;
  try { localStorage.setItem(memorySaverCyclesKey, JSON.stringify(cycles)); } catch { /* Keep this window's current cycles. */ }
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
