import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas } from "@aux/contracts";
import { chromeBookmarkFiles, readChromeBookmarksFile } from "../../services/chrome-bookmarks.js";

async function h_chrome_importCookies(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.importCookies(params);
}
async function h_chrome_importBookmarks(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = MethodSchemas["chrome.importBookmarks"].parse(params);
  const files = chromeBookmarkFiles(p.profile);
  if (!files.length) {
    throw new AuxError(
      "not_found",
      p.profile
        ? `Chromium profile "${p.profile}" has no bookmarks store`
        : "no Chrome, Chromium, or Edge profile with bookmarks found on this machine",
    );
  }
  const seen = new Set<string>();
  const bookmarks = files
    .flatMap((f) => readChromeBookmarksFile(f.path))
    .filter((b) => !seen.has(b.url) && !!seen.add(b.url))
    .slice(0, 10000);
  const result = s.repo.importBookmarks(bookmarks);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return {
    ok: true,
    imported: result.added,
    skipped: result.skipped,
    profiles: files.map((f) => f.profile),
    detail: `read ${files.length} Chromium profile${files.length === 1 ? "" : "s"} (${files.map((f) => f.profile).join(", ")})`,
  };
}
async function h_chrome_openLive(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const page = s.pages.get(params.pageId);
  const chrome = s.drivers().chrome;
  if (page.backend !== "chrome") throw new AuxError("invalid_params", "not a chrome page");
  await chrome?.activateTarget?.(page.targetId);
  return { ok: true };

  // models / settings
}

export const chromeMethods: Partial<Record<MethodName, MethodHandler>> = {
  "chrome.importCookies": h_chrome_importCookies,
  "chrome.importBookmarks": h_chrome_importBookmarks,
  "chrome.openLive": h_chrome_openLive,
};
