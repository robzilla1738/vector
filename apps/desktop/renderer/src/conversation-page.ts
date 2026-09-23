import type { PageTarget } from "@aux/contracts";

export function conversationPage(pages: PageTarget[], selection: string, activePageId: string | null, linkedPageId?: string) {
  const id = selection === "active" ? activePageId : selection === "linked" ? linkedPageId : selection === "none" ? null : selection;
  return pages.find(page => page.pageId === id && !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
}
