import { AuxError, EventTypes, type PageTarget } from "@aux/contracts";
import type { PageRegistry } from "./registry.js";
import type { LivePage } from "./types.js";

/** Which tab each window selects — explicit activation, native focus, and the successor when the selected tab goes away. */
export class ActivationPolicy {
  constructor(private pages: PageRegistry) {}

  /** Forget a closed page's return links; returns the tab it should hand focus back to. */
  takeReturnTarget(pageId: string) {
    const target = this.pages.returnTargets.get(pageId);
    this.pages.returnTargets.delete(pageId);
    for (const [child, parent] of this.pages.returnTargets) if (parent === pageId) this.pages.returnTargets.delete(child);
    return target;
  }

  /**
   * The tab a window selects when its active tab goes away: the tab that
   * opened it while still in that window, else the most recently active
   * visible tab, else the most recently active tab.
   */
  successor(windowId: string, returnTarget?: string): LivePage | undefined {
    const returned = returnTarget ? this.pages.live.get(returnTarget) : undefined;
    if (returned && (returned.target.windowId ?? "main") === windowId) return returned;
    const candidates = [...this.pages.live.values()].filter(page => page.target.viewStatus !== "detached" && (page.target.windowId ?? "main") === windowId);
    const recent = (pages: LivePage[]) => pages.sort((a, b) => b.target.lastActiveAt - a.target.lastActiveAt)[0];
    return recent(candidates.filter(page => page.target.viewStatus === "visible")) ?? recent(candidates);
  }

  /** A native focus notification records selection without issuing another focus command. */
  onNativeWindowFocused(pageId: string, windowId: string) {
    const page = this.pages.live.get(pageId);
    if (!page || (page.target.windowId ?? "main") !== windowId || page.target.ownedByRuntime) return;
    this.pages.activeId = pageId;
    this.pages.activeByWindow.set(windowId, pageId);
    page.target.lastActiveAt = Date.now();
    this.pages.persist(page);
    this.pages.deps.events.emit(EventTypes.PageUpdated, {pageId, activePageId: pageId, lastActiveAt: page.target.lastActiveAt});
  }

  async activate(pageId: string): Promise<PageTarget> {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    if (lp.target.backend === "aux" && this.pages.deps.native.available()) {
      await this.pages.deps.native.focusPage(pageId);
      if (lp.target.viewStatus !== "crashed") lp.target.viewStatus = "visible";
    }
    this.pages.activeId = pageId;
    this.pages.activeByWindow.set(lp.target.windowId ?? "main", pageId);
    lp.target.lastActiveAt = Date.now();
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId, viewStatus: lp.target.viewStatus, activePageId: pageId });
    return lp.target;
  }
}
