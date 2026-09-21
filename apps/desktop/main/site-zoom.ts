import { chmodSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import type { WebContents } from "electron";

const min = Math.log(0.25) / Math.log(1.2);
const max = Math.log(5) / Math.log(1.2);
function site(url: string): string | undefined {
  try { const parsed = new URL(url); return /^https?:$/.test(parsed.protocol) ? parsed.origin : undefined; }
  catch { return undefined; }
}

/** One profile's site sizes. Omit the file for a private session. */
export class SiteZoomPreferences {
  private levels = new Map<string, number>();
  constructor(private readonly file?: string) {
    if (!file) return;
    try {
      const saved: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (!Array.isArray(saved)) return;
      for (const row of saved.slice(-500)) {
        if (Array.isArray(row) && row.length === 2 && typeof row[0] === "string" && site(row[0]) === row[0]
          && typeof row[1] === "number" && Number.isFinite(row[1]) && row[1] >= min && row[1] <= max && row[1] !== 0) this.levels.set(row[0], row[1]);
      }
    } catch { /* A missing or unreadable preference file uses standard page size. */ }
  }
  list() { return [...this.levels].map(([origin, level]) => ({origin, percentage: Math.round(100 * 1.2 ** level)})).sort((a, b) => a.origin.localeCompare(b.origin)); }
  reset(origin: string) {
    if (site(origin) !== origin) throw new Error("Choose a saved website size.");
    this.remember(origin, 0);
  }
  level(url: string): number { return this.levels.get(site(url) ?? "") ?? 0; }
  remember(url: string, level: number) {
    const origin = site(url);
    if (!origin || !Number.isFinite(level)) return;
    const next = new Map(this.levels);
    next.delete(origin);
    if (level !== 0) next.set(origin, Math.max(min, Math.min(max, level)));
    if (next.size > 500) next.delete(next.keys().next().value!);
    if (this.file) {
      const temporary = `${this.file}.tmp`;
      writeFileSync(temporary, JSON.stringify([...next]), { mode: 0o600 });
      chmodSync(temporary, 0o600);
      renameSync(temporary, this.file);
    }
    this.levels = next;
  }
  apply(contents: Pick<WebContents, "isDestroyed" | "setZoomLevel">, url: string) {
    if (!contents.isDestroyed()) contents.setZoomLevel(this.level(url));
  }
}
