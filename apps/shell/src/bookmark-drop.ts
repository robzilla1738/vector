import { bookmarkWebUrl } from "./bookmark-files";

export const TAB_DRAG_TYPE = "application/x-aux-tabs";

export function bookmarkTabsFromDrop(raw: string, pages: { pageId: string; url: string; title: string }[]) {
  const ids = new Set(raw.split("\n").filter(Boolean));
  const byUrl = new Map<string, { url: string; title: string }>();
  for (const page of pages) {
    if (!ids.has(page.pageId)) continue;
    const url = bookmarkWebUrl(page.url);
    if (!url || byUrl.has(url)) continue;
    byUrl.set(url, { url, title: (page.title || url).slice(0, 1000) });
  }
  return [...byUrl.values()];
}
