import type { PageTarget } from "@vector/contracts";
import type { Layout } from "./workspace";

/** Propose redundant visible tabs; never close anything or combine different Spaces. */
export function duplicateTabs(pages: PageTarget[], layout: Layout, activePageId: string | null): string[] {
  const groups = new Map<string, PageTarget[]>();
  for (const page of pages) {
    if (page.ownedByRuntime || page.viewStatus === "detached" || page.controller === "agent" || page.controller === "external" || !/^https?:\/\//i.test(page.url)) continue;
    const key = JSON.stringify([layout.tabSpace[page.pageId] ?? layout.activeSpaceId, page.url]);
    const group = groups.get(key) ?? [];
    group.push(page); groups.set(key, group);
  }
  const duplicates = new Set<string>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const keeper = group.find(page => page.pageId === activePageId)
      ?? group.reduce((latest, page) => page.lastActiveAt > latest.lastActiveAt ? page : latest);
    for (const page of group) if (page !== keeper) duplicates.add(page.pageId);
  }
  return pages.filter(page => duplicates.has(page.pageId)).map(page => page.pageId);
}
