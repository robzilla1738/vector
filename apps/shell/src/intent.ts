/** URL-first routing with explicit scopes and the person’s Ask/Search preference. */
import { isUrlLike, toUrl } from "./chrome";
import { engineList, resolveKeyword, type KeywordEngine } from "./engines";

export type Intent =
  | { kind: "navigate"; url: string; display: string }
  | { kind: "search"; query: string; url: string; engine?: string }
  | { kind: "run"; goal: string; scope: "page" | "new" }
  | { kind: "command"; query: string }
  | { kind: "empty" };

export interface IntentContext {
  /** the active page has a real URL the agent could work on */
  hasPage: boolean;
  searchEngine?: string;
  routing?: "automatic" | "prefer-chat" | "prefer-search";
  askUnavailable?: boolean;
  searchEngines?: readonly KeywordEngine[];
}

export function detectIntent(raw: string, ctx: IntentContext): Intent {
  const v = raw.trim();
  if (!v) return { kind: "empty" };

  if (v.startsWith("/")) return { kind: "command", query: v.slice(1).trim() };
  if (v.startsWith(">")) {
    const goal = v.slice(1).trim();
    return !goal
      ? { kind: "empty" }
      : ctx.askUnavailable
        ? { kind: "search", query: goal, url: toUrl(goal, ctx.searchEngine) }
        : { kind: "run", goal, scope: ctx.hasPage ? "page" : "new" };
  }
  if (v.startsWith("?")) {
    const q = v.slice(1).trim();
    return { kind: "search", query: q, url: toUrl(q, ctx.searchEngine) };
  }

  // A keyword engine claim (`gh aux browser`) routes to that engine's search.
  const keyed = resolveKeyword(v, ctx.searchEngines ?? engineList());
  if (keyed) return { kind: "search", query: keyed.terms, url: keyed.url, engine: keyed.engine.name };

  // URLs and bare domains win outright — never send a URL to the model.
  if (!/\s/.test(v) && isUrlLike(v)) {
    const url = toUrl(v, ctx.searchEngine);
    return { kind: "navigate", url, display: url.replace(/^https?:\/\//, "").replace(/\/$/, "") };
  }

  const words = v.split(/\s+/).length;
  const asks =
    /^(?:who|what|when|where|why|how|which|can|could|would|should|is|are|do|does|did)\b/i.test(v) ||
    (v.endsWith("?") && words >= 4) ||
    words >= 8;
  if (!ctx.askUnavailable && ctx.routing !== "prefer-search" && (ctx.routing === "prefer-chat" || asks))
    return { kind: "run", goal: v, scope: ctx.hasPage ? "page" : "new" };
  return { kind: "search", query: v, url: toUrl(v, ctx.searchEngine) };
}

/** Short label for the inline chip beside the field. */
export function intentLabel(i: Intent): string {
  switch (i.kind) {
    case "navigate":
      return "Open";
    case "search":
      return i.engine ?? "Search";
    case "run":
      return i.scope === "page" ? "Ask on this page" : "New task";
    case "command":
      return "Command";
    default:
      return "";
  }
}

/** One window-local breaker. Failures include a missing model, disconnect and
 * an unacknowledged request; a late completion never counts as a fresh success. */
export class AskCircuitBreaker {
  private failures: number[] = [];
  private blockedUntil = 0;
  private searchFlips = 0;
  constructor(private readonly now = Date.now) {}
  unavailable(): boolean {
    return this.now() < this.blockedUntil;
  }
  retryAfter(): number {
    return Math.max(0, this.blockedUntil - this.now());
  }
  failed(): void {
    const now = this.now();
    this.failures = this.failures.filter((time) => now - time < 600_000);
    this.failures.push(now);
    if (this.failures.length >= 3) {
      this.blockedUntil = now + 600_000;
      this.failures = [];
    }
  }
  flipped(route: "search" | "ask"): boolean {
    this.searchFlips = route === "search" ? this.searchFlips + 1 : 0;
    return this.searchFlips === 2;
  }
}
