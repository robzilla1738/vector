import type { PageContextRef, PageQuickAction, PageTarget } from "@aux/contracts";
import { sourceRef } from "./browser-context-sources";

/** Bind an explicit page action to the document the human actually selected. */
export function pageActionSource(action: PageQuickAction, pages: PageTarget[]): PageContextRef | null {
  const page = pages.find(item => item.pageId === action.pageId);
  if (!page || !action.topUrl || page.url !== action.topUrl || page.loading || page.ownedByRuntime
    || ["crashed", "detached"].includes(page.viewStatus ?? "") || !/^https?:\/\//.test(page.url)) return null;
  try { return sourceRef(page, action.capturedAt ?? Date.now()); }
  catch { return null; }
}
