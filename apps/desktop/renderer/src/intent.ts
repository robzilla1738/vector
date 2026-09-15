/**
 * Command-bar intent detection. One field is URL bar, search box, and agent
 * prompt; this module decides which — as a pure function so the UI, the
 * palette, and the tests share the same rules.
 *
 *   URL or domain                     → navigate
 *   "?" prefix, question shape,       → search
 *     or a short noun phrase
 *   imperative / multi-word request   → run (ask on this page, or new task)
 *   "/" prefix                        → command (palette)
 *   ">" prefix                        → force a run
 */
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

const IMPERATIVE =
  /^(find|open|go|book|buy|order|add|remove|delete|fill|submit|click|log|sign|check|compare|summari[sz]e|extract|collect|list|download|upload|send|reply|write|draft|create|make|schedule|cancel|change|update|set|turn|search|look|get|grab|scrape|read|translate|explain|tell|show|pull|export|save|close|scroll|navigate|visit|watch|track|monitor|apply|register|renew|pay|transfer|post|tweet|email|message|call|play|pause|mute|unsubscribe|follow|like|share|rename|move|copy|paste|sort|filter|group|count|calculate|convert)\b/i;

const QUESTION_WORD = /^(who|what|when|where|why|how|which|is|are|was|were|do|does|did|can|could|should|would|will)\b/i;

/** Pronouns that bind the request to the current page ("this", "here", "it"). */
const PAGE_DEICTIC = /\b(this page|this tab|this site|on this|here|these|this form|this table|this article|this one|it)\b/i;

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

  const words = v.split(/\s+/);
  const endsQuestion = /\?$/.test(v);
  const looksQuestion = QUESTION_WORD.test(v) || endsQuestion;
  const deictic = PAGE_DEICTIC.test(v);
  // "open source browsers" is a search; "open the settings page" is a task —
  // a bare verb needs an object marker or some length before it reads as a request
  const objectMarker = /\b(the|this|that|these|those|my|our|your|a|an|all|every|each|me|it|them|into|from|for|to|on|in|with)\b/i.test(v);
  const imperative = IMPERATIVE.test(v) && (objectMarker || deictic || words.length >= 4);

  // "search for X" / "look up X" / "google X" with no page binding is a plain web search
  const searchPrefix = /^(search( for)?|look up|google)\s+/i.exec(v);
  if (searchPrefix && !deictic) {
    const q = v.slice(searchPrefix[0].length).trim();
    if (q) return { kind: "search", query: q, url: toUrl(q, ctx.searchEngine) };
  }

  // A question about the page ("what does this say?") is agent work when a
  // page is present; a bare question is web search.
  if (looksQuestion && !imperative) {
    if (deictic && ctx.hasPage) return { kind: "run", goal: v, scope: "page" };
    return { kind: "search", query: v, url: toUrl(v, ctx.searchEngine) };
  }

  if (imperative) return { kind: "run", goal: v, scope: ctx.hasPage ? "page" : "new" };

  // Long free text reads as a task; short noun phrases as a search.
  if (words.length >= 6) return { kind: "run", goal: v, scope: ctx.hasPage ? "page" : "new" };
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
