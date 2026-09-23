import type { PageTarget } from "@aux/contracts";

/** A paused multi-page run may resume only after every other scoped page has left human control. */
export function canResumeAfterPageRelease(runPageIds: string[], releasedPageId: string, pages: Iterable<Pick<PageTarget, "pageId" | "controller">>): boolean {
  const controllers = new Map([...pages].map(page => [page.pageId, page.controller]));
  return !runPageIds.some(pageId => pageId !== releasedPageId && controllers.get(pageId) === "human");
}
