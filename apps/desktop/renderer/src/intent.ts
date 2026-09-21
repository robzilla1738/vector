/** Predictable address-bar routing: URLs open, text searches, and > explicitly asks Aux. */
import { isUrlLike, toUrl } from "./chrome";

export type Intent =
  | { kind: "navigate"; url: string; display: string }
  | { kind: "search"; query: string; url: string }
  | { kind: "run"; goal: string; scope: "page" | "new" }
  | { kind: "command"; query: string }
  | { kind: "empty" };

export interface IntentContext {
  /** the active page has a real URL the agent could work on */
  hasPage: boolean;
  searchEngine?: string;
}

export function detectIntent(raw: string, ctx: IntentContext): Intent {
  const v = raw.trim();
  if (!v) return { kind: "empty" };

  if (v.startsWith("/")) return { kind: "command", query: v.slice(1).trim() };
  if (v.startsWith(">")) {
    const goal = v.slice(1).trim();
    return goal ? { kind: "run", goal, scope: ctx.hasPage ? "page" : "new" } : { kind: "empty" };
  }
  if (v.startsWith("?")) {
    const q = v.slice(1).trim();
    return { kind: "search", query: q, url: toUrl(q, ctx.searchEngine) };
  }

  // URLs and bare domains win outright — never send a URL to the model.
  if (!/\s/.test(v) && isUrlLike(v)) {
    const url = toUrl(v, ctx.searchEngine);
    return { kind: "navigate", url, display: url.replace(/^https?:\/\//, "").replace(/\/$/, "") };
  }

  return { kind: "search", query: v, url: toUrl(v, ctx.searchEngine) };
}

/** Short label for the inline chip beside the field. */
export function intentLabel(i: Intent): string {
  switch (i.kind) {
    case "navigate":
      return "Open";
    case "search":
      return "Search";
    case "run":
      return i.scope === "page" ? "Ask on this page" : "New task";
    case "command":
      return "Command";
    default:
      return "";
  }
}
