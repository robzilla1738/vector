/**
 * Backend router (docs/engine/architecture.md §11 "Routing and fallback").
 *
 * Decides where `pages.open` places a page — the in-process Vector Engine
 * or a Chromium (`vector`) — and plans what happens when the engine reports
 * `capability_unsupported`:
 *
 *   1. origin in the needs-chromium table (TTL 24 h, persisted) → Chromium
 *   2. otherwise engine-first; the engine classifies the parsed document
 *      (`requiresScript` + reason) → `capability_unsupported` → the runtime
 *      reopens on Chromium and records the origin
 *   3. mid-program `capability_unsupported` → replay the remaining steps on
 *      Chromium after a fresh observation; ref-targeted steps cannot carry
 *      across backends and trigger REPAIR
 *
 * Deterministic and side-effect free apart from the table, so it is unit
 * tested with a fake store and a fake clock. Every decision carries a
 * `routeReason` that ends up on `pages.open` results.
 */
import { VectorError, type Backend, type EngineMode, type Step } from "@vector/contracts";
import type { PageRouting } from "@vector/browser-driver";

export const NEEDS_CHROMIUM_TTL_MS = 24 * 60 * 60 * 1000;

export interface NeedsChromiumEntry {
  origin: string;
  reason: string;
  recordedAt: number;
  expiresAt: number;
}

/** Persistence for the needs-chromium table (the runtime uses the SQLite kv). */
export interface RouterStore {
  load(): NeedsChromiumEntry[];
  save(entries: NeedsChromiumEntry[]): void;
}

export class MemoryRouterStore implements RouterStore {
  private entries: NeedsChromiumEntry[] = [];
  load() {
    return [...this.entries];
  }
  save(entries: NeedsChromiumEntry[]) {
    this.entries = [...entries];
  }
}

export interface RouteDecision {
  backend: Backend;
  /** logged and returned on pages.open results */
  reason: string;
  /** an engine `capability_unsupported` on open may reopen the page on Chromium */
  fallbackAllowed: boolean;
  /** Strict native mode cannot start the engine; never substitute Chromium. */
  backendUnavailable?: boolean;
}

export interface ReplayPlan {
  /** steps from the failed one onwards */
  remaining: Step[];
  /** ids of remaining steps that address `r<n>` refs — engine refs are meaningless on Chromium */
  refSteps: string[];
  /** true when refSteps is non-empty: the planner must re-observe and replan (REPAIR) */
  repair: boolean;
}

export interface RouterOptions {
  mode: () => EngineMode;
  engineAvailable: () => boolean;
  store?: RouterStore;
  now?: () => number;
  ttlMs?: number;
  log?: (message: string, attrs: Record<string, unknown>) => void;
  /** Independent product: never start or substitute Chromium. */
  nativeOnly?: () => boolean;
}

/** Schemes the engine can open in M1 (`http(s)` needs the `http` feature, always on in the addon). */
const ENGINE_SCHEMES = new Set(["http:", "https:", "file:", "data:", "about:"]);

export function originOf(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol === "file:") return "file://";
    if (u.protocol === "data:" || u.protocol === "about:") return null;
    return u.origin === "null" ? null : u.origin;
  } catch {
    return null;
  }
}

/** True for the engine's "this needs Chromium" signal. */
export const isFallbackError = (e: unknown): e is VectorError =>
  e instanceof VectorError &&
  (e.code === "capability_unsupported" ||
    e.code === "backend_unavailable" ||
    e.code === "internal");

export class Router {
  private readonly store: RouterStore;
  private readonly now: () => number;
  private readonly ttlMs: number;
  private readonly log: (message: string, attrs: Record<string, unknown>) => void;
  private table: NeedsChromiumEntry[];

  constructor(private readonly opts: RouterOptions) {
    this.store = opts.store ?? new MemoryRouterStore();
    this.now = opts.now ?? (() => Date.now());
    this.ttlMs = opts.ttlMs ?? NEEDS_CHROMIUM_TTL_MS;
    this.log = opts.log ?? (() => {});
    this.table = this.store.load();
    this.prune();
  }

  mode(): EngineMode {
    return this.opts.mode();
  }

  engineAvailable(): boolean {
    return this.opts.engineAvailable();
  }

  /** Independent product: never start or substitute Chromium. */
  isNativeOnly(): boolean {
    return this.opts.nativeOnly?.() ?? false;
  }

  // ---- needs-chromium table ----

  private prune() {
    const now = this.now();
    const before = this.table.length;
    this.table = this.table.filter((e) => e.expiresAt > now);
    if (this.table.length !== before) this.store.save(this.table);
  }

  /** Unexpired entry for the URL's origin, if any. */
  needsChromium(url: string): NeedsChromiumEntry | undefined {
    const origin = originOf(url);
    if (!origin) return undefined;
    this.prune();
    return this.table.find((e) => e.origin === origin);
  }

  /** Records (or refreshes) an origin as Chromium-only for the TTL. */
  recordNeedsChromium(url: string, reason: string): NeedsChromiumEntry | undefined {
    const origin = originOf(url);
    if (!origin) return undefined;
    const now = this.now();
    const entry: NeedsChromiumEntry = { origin, reason, recordedAt: now, expiresAt: now + this.ttlMs };
    this.table = [...this.table.filter((e) => e.origin !== origin), entry];
    this.store.save(this.table);
    this.log("router.needs-chromium", { origin, reason, expiresAt: entry.expiresAt });
    return entry;
  }

  /** Drops an origin so the engine gets another try (tests, settings UI). */
  forget(url: string): boolean {
    const origin = originOf(url);
    const before = this.table.length;
    this.table = this.table.filter((e) => e.origin !== origin);
    if (this.table.length !== before) this.store.save(this.table);
    return this.table.length !== before;
  }

  /** Current unexpired entries. */
  entries(): NeedsChromiumEntry[] {
    this.prune();
    return [...this.table];
  }

  // ---- decisions ----

  decide(url: string, requested: Backend | undefined): RouteDecision {
    const done = (d: RouteDecision) => {
      this.log("router.decide", { url, requested, ...d });
      return d;
    };
    if (this.opts.nativeOnly?.()) {
      if (!this.engineAvailable()) {
        return done({
          backend: "vector-engine",
          reason: "native-only:engine-unavailable",
          fallbackAllowed: false,
          backendUnavailable: true,
        });
      }
      return done({ backend: "vector-engine", reason: "native-only", fallbackAllowed: false });
    }
    if (requested === "chrome") return done({ backend: "chrome", reason: "explicit-backend:chrome", fallbackAllowed: false });
    if (requested === "vector-engine")
      return done({ backend: "vector-engine", reason: "explicit-backend:vector-engine", fallbackAllowed: false });
    const mode = this.mode();
    if (mode === "off") return done({ backend: "vector", reason: "engine-mode-off", fallbackAllowed: false });
    if (mode === "always") {
      if (!this.engineAvailable()) {
        return done({
          backend: "vector-engine",
          reason: "engine-unavailable",
          fallbackAllowed: false,
          backendUnavailable: true,
        });
      }
      return done({ backend: "vector-engine", reason: "engine-always", fallbackAllowed: false });
    }
    // auto = hybrid: engine first, Chromium fallback, separately labeled
    if (!this.engineAvailable()) return done({ backend: "vector", reason: "hybrid:engine-unavailable", fallbackAllowed: false });
    let scheme = "";
    try {
      scheme = new URL(url).protocol;
    } catch {
      return done({ backend: "vector", reason: "unparseable-url", fallbackAllowed: false });
    }
    if (!ENGINE_SCHEMES.has(scheme)) return done({ backend: "vector", reason: `unsupported-scheme:${scheme}`, fallbackAllowed: false });
    const hit = this.needsChromium(url);
    if (hit) return done({ backend: "vector", reason: `needs-chromium-table:${hit.reason}`, fallbackAllowed: false });
    return done({ backend: "vector-engine", reason: "hybrid:engine-first", fallbackAllowed: true });
  }

  /**
   * Maps the engine's post-parse classification to the fallback signal.
   * Returns the `capability_unsupported` error to throw, or null to keep the page.
   */
  classify(routing: PageRouting | undefined): VectorError | null {
    if (!routing?.requiresScript) return null;
    const reason = routing.reason ?? routing.kind ?? "requiresScript";
    return new VectorError("capability_unsupported", `document classified ${routing.kind ?? "requiresScript"}: ${reason}`, {
      reason,
      kind: routing.kind ?? "requiresScript",
      routing,
    });
  }

  /** The reason string recorded when an open falls back. */
  static fallbackReason(e: unknown): string {
    if (e instanceof VectorError) {
      const d = e.detail as { reason?: string } | undefined;
      return d?.reason ?? e.message;
    }
    return e instanceof Error ? e.message : String(e);
  }

  /** Plans the Chromium replay after a mid-program `capability_unsupported` at `failedIndex`. */
  planReplay(steps: readonly Step[], failedIndex: number): ReplayPlan {
    const remaining = steps.slice(Math.max(0, failedIndex));
    const refSteps = remaining.filter(stepTargetsRef).map((s) => s.id);
    return { remaining, refSteps, repair: refSteps.length > 0 };
  }

  /** Index of the step whose failure asks for a fallback, or -1. */
  static fallbackIndex(outcomes: readonly { status: string; error?: { code: string } }[]): number {
    return outcomes.findIndex((o) => o.status === "failed" && o.error?.code === "capability_unsupported");
  }
}

const REF = /^r\d+(?:\.\d+)?$/;
/** Does the step address an observation ref anywhere (target, drag destination, refReady wait)? */
export function stepTargetsRef(s: Step): boolean {
  const rec = s as unknown as Record<string, unknown>;
  if (typeof rec.target === "string" && REF.test(rec.target)) return true;
  if (typeof rec.to === "string" && REF.test(rec.to)) return true;
  const conds: unknown[] = [];
  if (s.op === "waitFor") conds.push(s.condition);
  if (s.expect) conds.push(...s.expect);
  return conds.some((c) => {
    const cc = c as { kind?: string; ref?: string } | undefined;
    return cc?.kind === "refReady" && typeof cc.ref === "string" && REF.test(cc.ref);
  });
}
