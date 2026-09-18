/**
 * Address-field, overlay→native-view, and activity-count rules used by the
 * desktop shell. Pure functions so tests import the same module the UI uses.
 */

export function isUrlLike(v: string): boolean {
  if (/^(https?:\/\/|about:|chrome:\/\/|file:\/\/|view-source:|data:)/i.test(v)) return true;
  return /^(localhost|\d{1,3}(\.\d{1,3}){3}|[\w-]+(\.[\w-]+)+)(:\d+)?(\/\S*)?$/i.test(v);
}

/** URL-like input becomes an http(s) navigate URL; anything else uses the search engine. Never starts an agent. */
export function toUrl(v: string, searchEngine?: string): string {
  const s = v.trim();
  if (/^(https?:\/\/|about:|chrome:\/\/|file:\/\/|view-source:|data:)/i.test(s)) return s;
  if (isUrlLike(s) && !s.includes(" ")) {
    const local = /^(localhost|127\.|0\.0\.0\.0|::1|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|.*\.local\b)/i.test(s);
    return `${local ? "http" : "https"}://${s}`;
  }
  const tpl = searchEngine || "https://duckduckgo.com/?q=%s";
  return tpl.includes("%s") ? tpl.replace("%s", encodeURIComponent(s)) : tpl + encodeURIComponent(s);
}

export function addressNavigate(input: string, searchEngine?: string): { action: "navigate"; url: string } {
  return { action: "navigate", url: toUrl(input, searchEngine) };
}

/** Scrim overlays cover the stage and must hide WebContentsView. In-flow strips shrink the stage instead. */
export function isScrimOverlay(overlay: string | null): boolean {
  return overlay === "palette" || overlay === "settings" || overlay === "history" || overlay === "observe";
}

export function isFlowOverlay(overlay: string | null): boolean {
  return overlay === "find" || overlay === "downloads";
}

export function nativePageId(input: {
  mode: "focus" | "overview" | "table";
  overlay: string | null;
  activePageId: string | null;
  url: string | null | undefined;
  backend?: string | null;
}): string | null {
  if (input.mode !== "focus") return null;
  if (isScrimOverlay(input.overlay)) return null;
  if (!input.activePageId) return null;
  const url = input.url?.trim() ?? "";
  if (!url || url === "about:blank") return null;
  if (input.backend === "chrome") return null;
  // EngineView paints the Vector document. A Chromium WebContentsView must
  // not sit on top of that surface.
  if (input.backend === "vector-engine") return null;
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
