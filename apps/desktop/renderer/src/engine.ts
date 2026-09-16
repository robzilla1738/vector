/**
 * Engine identity for a page. The runtime contract today exposes
 * `PageTarget.backend: "vector" | "chrome"`. A parallel track is adding the
 * Rust "vector-engine" backend plus `settings.engineMode` and a `routeReason`
 * on `pages.open` results.
 *
 * TODO(contracts): replace these local unions with `BackendT` / `EngineMode`
 * from @vector/contracts once PageIdentity.backend gains "vector-engine" and
 * SettingsSetParams gains `engineMode`. Until then the UI reads the wider type
 * defensively so it compiles against the current contract and lights up
 * automatically when the runtime starts emitting the new values.
 */
import type { PageTarget } from "@vector/contracts";

export type EngineBackend = "vector" | "chrome" | "vector-engine";
export type EngineMode = "off" | "auto" | "always";

/** Extra per-page routing detail the engine track will attach to pages.open results. */
export interface EngineRoute {
  backend: EngineBackend;
  /** why this backend was chosen — e.g. "engineMode=auto · site allowlist" */
  routeReason?: string;
  /** milliseconds spent choosing/launching the backend */
  routeMs?: number;
  /** navigation → first paint, when the backend reports it */
  firstPaintMs?: number;
}

export interface EngineInfo {
  backend: EngineBackend;
  label: string;
  short: string;
  description: string;
  route?: EngineRoute;
}

const LABELS: Record<EngineBackend, { label: string; short: string; description: string }> = {
  vector: { label: "Chromium", short: "Cr", description: "Rendered by Vector's embedded Chromium view." },
  chrome: { label: "Your Chrome", short: "Ch", description: "Borrowed from your signed-in Chrome over CDP." },
  "vector-engine": { label: "Vector Engine", short: "VE", description: "Rendered by the native Vector Engine — built for agents first." },
};

/** Read the engine identity of a page, tolerating the pre-contract shape. */
export function engineOf(page: Pick<PageTarget, "backend"> & { route?: EngineRoute; routeReason?: string }): EngineInfo {
  const routed = page.route?.backend;
  const raw = routed && routed in LABELS ? routed : (page.backend as EngineBackend);
  const backend = raw in LABELS ? raw : "vector";
  const meta = LABELS[backend];
  const route: EngineRoute | undefined =
    page.route ?? (page.routeReason ? { backend, routeReason: page.routeReason } : undefined);
  return { backend, ...meta, route };
}

export function engineModeLabel(mode: EngineMode | undefined): string {
  switch (mode) {
    case "always":
      return "Vector Engine only. Missing addon or host is an error — Chromium is never substituted.";
    case "auto":
      return "Hybrid: Vector Engine where it helps, Chromium elsewhere";
    default:
      return "Chromium for every page";
  }
}

export function readEngineMode(settings: Record<string, unknown>): EngineMode {
  const m = settings.engineMode;
  return m === "auto" || m === "always" || m === "off" ? m : "off";
}
