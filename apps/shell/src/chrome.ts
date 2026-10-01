/**
 * Address-field, overlay→native-view, and activity-count rules used by the
 * desktop shell. Pure functions so tests import the same module the UI uses.
 */
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";

// Domain labels allow unicode letters/digits — `münchen.de` and `例え.jp`
// navigate; `a.b,c` and other non-host punctuation does not.
const DOMAIN_LIKE = /^[\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*\.([\p{L}\p{N}_-]+)(:\d+)?(\/\S*)?$/iu;
// The last label must read as a TLD — a leading letter (or xn--) — so
// `version.1.2` stays a query while `node.js` navigates.
const TLD_LIKE = /^[\p{L}][\p{L}\p{N}-]*$|^xn--/iu;
const IPV6_LIKE = /^\[[0-9a-f:]+\](:\d+)?(\/\S*)?$|^[0-9a-f:]*::[0-9a-f:]*(:\d+)?(\/\S*)?$/i;

/** Native new-tab aliases and empty tabs all host Aux Home in the shell. */
export function isHomeAddress(url: string | null | undefined): boolean {
  return !url || url === "about:blank" || /^chrome:\/\/(?:newtab|new-tab-page)\/?$/.test(url);
}

export function isUrlLike(v: string): boolean {
  if (/^(https?:\/\/|about:|chrome:\/\/|file:\/\/|view-source:|data:)/i.test(v)) return true;
  if (IPV6_LIKE.test(v)) return true;
  if (/^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/\S*)?$/i.test(v)) return true;
  const match = DOMAIN_LIKE.exec(v);
  return !!match?.[1] && TLD_LIKE.test(match[1]);
}

/** URL-like input becomes an http(s) navigate URL; anything else uses the search engine. Never starts an agent. */
export function toUrl(v: string, searchEngine?: string): string {
  const s = v.trim();
  if (/^(https?:\/\/|about:|chrome:\/\/|file:\/\/|view-source:|data:)/i.test(s)) return s;
  if (isUrlLike(s) && !s.includes(" ")) {
    const local = /^(localhost|127\.|0\.0\.0\.0|::|\[::|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|.*\.local\b)/i.test(s);
    const host = /^[0-9a-f:]*::[0-9a-f:]*$/i.test(s) ? `[${s}]` : s;
    return `${local ? "http" : "https"}://${host}`;
  }
  const tpl = searchEngine || DEFAULT_SEARCH_ENGINE;
  return tpl.includes("%s") ? tpl.replaceAll("%s", encodeURIComponent(s)) : tpl + encodeURIComponent(s);
}

export function addressNavigate(input: string, searchEngine?: string): { action: "navigate"; url: string } {
  return { action: "navigate", url: toUrl(input, searchEngine) };
}

/** Scrim overlays cover the stage and must hide WebContentsView. In-flow strips shrink the stage instead. */
export function isScrimOverlay(overlay: string | null): boolean {
  return overlay === "reader" || overlay === "bookmarks" || overlay === "command-surface" || overlay === "settings" || overlay === "history" || overlay === "clear-history" || overlay === "observe" || overlay === "tasks" || overlay === "site" || overlay === "capture";
}

export function isFlowOverlay(overlay: string | null): boolean {
  return overlay === "find" || overlay === "downloads" || overlay === "inline-assist";
}

export function nativePageId(input: {
  mode: "focus" | "overview" | "table" | "conversation";
  overlay: string | null;
  activePageId: string | null;
  url: string | null | undefined;
  backend?: string | null;
  viewStatus?: string;
  navigationError?: unknown;
  showBlankDocument?: boolean;
  /** A page-action confirmation covers the stage the way a scrim does. */
  confirming?: boolean;
}): string | null {
  if (input.mode !== "focus" || input.viewStatus === "crashed" || input.navigationError) return null;
  if (input.confirming || isScrimOverlay(input.overlay)) return null;
  if (!input.activePageId) return null;
  const url = input.url?.trim() ?? "";
  if (isHomeAddress(url) && !input.showBlankDocument) return null;
  if (input.backend === "chrome") return null;
  return input.activePageId;
}

export function activityCounts(input: {
  members: Array<{ status: string }>;
  runs: Array<{ status: string }>;
  downloads: Array<{ state: string }>;
}): { complete: number; active: number; queued: number; files: number; needsAttention: number } {
  const files = input.downloads.filter((d) => d.state === "completed").length;
  if (input.members.length > 0) {
    let complete = 0;
    let active = 0;
    let queued = 0;
    let needsAttention = 0;
    for (const m of input.members) {
      if (m.status === "completed") complete += 1;
      else if (m.status === "running") active += 1;
      else if (m.status === "queued") queued += 1;
      else if (m.status === "failed") needsAttention += 1;
    }
    return { complete, active, queued, files, needsAttention };
  }
  let complete = 0;
  let active = 0;
  let queued = 0;
  let needsAttention = 0;
  for (const r of input.runs) {
    switch (r.status) {
      case "completed":
        complete += 1;
        break;
      case "partially_completed":
        complete += 1;
        needsAttention += 1;
        break;
      case "queued":
        queued += 1;
        break;
      case "planning":
      case "running":
      case "paused":
        active += 1;
        break;
      case "needs_input":
        active += 1;
        needsAttention += 1;
        break;
      case "failed":
        needsAttention += 1;
        break;
      default:
        break;
    }
  }
  return { complete, active, queued, files, needsAttention };
}
