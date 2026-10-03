import { AuxError, EventTypes, type PageTarget } from "@aux/contracts";
import type { ActivationPolicy } from "./activation.js";
import type { PageOpener } from "./opener.js";
import type { PageRegistry } from "./registry.js";

export class TabSessionRestore {
  constructor(private pages: PageRegistry, private opener: PageOpener, private activation: ActivationPolicy) {
    if(pages.deps.native.available())for(const tab of pages.deps.repo.loadTabs().filter(tab=>tab.backend==="aux"))pages.pendingRestore.set(tab.page_id,tab);
    // Read the pre-quit renderer state before detachAllPages rewrites every row.
    for (const tab of pages.pendingRestore.values()) {
      const previous = pages.deps.repo.getPage(tab.page_id);
      if (!previous || previous.ownedByRuntime) continue;
      if (previous.viewStatus !== "visible" && previous.viewStatus !== "background") continue;
      if (previous.lifecycle === "discarded" || previous.lifecycle === "placeholder" || previous.lifecycle === "frozen") continue;
      pages.awakeOnRestore.add(tab.page_id);
    }
    pages.restoring = pages.pendingRestore.size > 0;
    // restore persisted page rows as detached history entries
    pages.deps.repo.detachAllPages();
  }

  /** Reopen the tabs that were live when the app last shut down. */
  async restoreTabs() {
    if (!this.pages.deps.native.available()) { this.pages.restoring=false; return; }
    if (this.pages.live.size > 0) {
      for(const pageId of this.pages.live.keys())this.pages.pendingRestore.delete(pageId);
      this.pages.restoring=false;
      this.pages.saveTabsSnapshot();
      return;
    }
    const existing = await (this.pages.deps.native.listPages?.() ?? Promise.resolve({ pages: [] })).catch(() => ({ pages: [] }));
    if (existing.pages.length) {
      this.pages.restoring = true;
      try {
        for (const page of existing.pages) {
          const previous = this.pages.deps.repo.getPage(page.pageId);
          try {
            await this.opener.registerExternal({ ...page, backend: "aux", restored: previous });
            this.pages.pendingRestore.delete(page.pageId);
          } catch {
            /* one stale native target must not block the other live tabs */
          }
        }
        // The catalog may publish background placeholders after the active
        // view. Keep their durable rows pending until that native upsert
        // arrives; opening them here would defeat lazy session restore.
        // Tabs that still had a renderer must load again. A discarded tab
        // stays a placeholder, so activating the first catalog row would reload it.
        const awake = existing.pages.filter((page) => this.pages.awakeOnRestore.has(page.pageId));
        if (awake.length) {
          for (const page of awake) await this.loadAwakeTab(page.pageId, page.url);
        } else {
          const byWindow = new Map<string, (typeof existing.pages)[number]>();
          for (const page of existing.pages) {
            const windowId = page.windowId ?? "main";
            if (page.active || !byWindow.has(windowId)) byWindow.set(windowId, page);
          }
          for (const page of byWindow.values()) {
            await this.activation.activate(page.pageId).catch(() => {});
          }
        }
      } finally {
        this.pages.restoring = false;
        this.pages.deps.events.emit(EventTypes.PageUpdated, {});
      }
      return;
    }
    const tabs = this.pages.deps.repo.loadTabs().filter((t) => t.backend === "aux");
    if (!tabs.length) return;
    const remembered = tabs.filter((tab) => this.pages.awakeOnRestore.has(tab.page_id));
    const selected = new Map<string, (typeof tabs)[number]>();
    if (!remembered.length) {
      for (const tab of tabs) {
        const windowId = tab.window_id || "main";
        if (tab.active || !selected.has(windowId)) selected.set(windowId, tab);
      }
    }
    const opening = remembered.length ? remembered : [...selected.values()];
    this.pages.restoring = true;
    try {
      for (const t of opening) {
        try {
          const { page: p } = await this.restoreSavedTab(t.page_id);
          await this.activation.activate(p.pageId).catch(() => {});
        } catch (error) {
          this.pages.restoreErrors.set(t.page_id,error instanceof Error?error.message:String(error));
        }
      }
    } finally {
      this.pages.restoring = false;
      this.pages.deps.events.emit(EventTypes.PageUpdated, {});
      // Keep the original durable snapshot until all surfaces are restored.
      // Normal later tab mutations resume snapshotting.
    }
  }

  /** Load a restored renderer without selecting the tab, so a protected neighbor stays put. */
  private async loadAwakeTab(pageId: string, url: string) {
    if (this.pages.deps.native.recoverPage) {
      await this.pages.deps.native.recoverPage(pageId, url).catch(() => {});
      return;
    }
    await this.activation.activate(pageId).catch(() => {});
  }

  recoveryTabs() {
    return [...this.pages.pendingRestore.values()].map(tab=>({pageId:tab.page_id,url:tab.url,title:tab.title,windowId:tab.window_id||"main",error:this.pages.restoreErrors.get(tab.page_id),retrying:this.pages.retryingRestore.has(tab.page_id)}));
  }

  async retryRestore(pageId:string) {
    if(this.pages.restoring||this.pages.retryingRestore.has(pageId))throw new AuxError("conflict","This session is already being restored.");
    this.pages.retryingRestore.add(pageId);
    try {
      const {page,restored}=await this.restoreSavedTab(pageId);
      this.pages.saveTabsSnapshot();
      return {ok:true,pageId:page.pageId,page:{...page},restored};
    } catch(error) {
      this.pages.restoreErrors.set(pageId,error instanceof Error?error.message:String(error));
      throw error;
    } finally {
      this.pages.retryingRestore.delete(pageId);
      this.pages.deps.events.emit("browser.recovery.changed",{});
    }
  }

  private async restoreSavedTab(pageId:string):Promise<{page:PageTarget;restored:boolean}> {
    const saved=this.pages.pendingRestore.get(pageId);
    if(!saved)throw new AuxError("not_found","This tab has already been restored.");
    const existing=this.pages.live.get(pageId);
    if(existing){this.pages.pendingRestore.delete(pageId);this.pages.restoreErrors.delete(pageId);return {page:existing.target,restored:false};}
    const previous=this.pages.deps.repo.getPage(pageId);
    if(!previous||!this.pages.driverFor("aux")?.recoverPage)throw new AuxError("backend_unavailable","The browser cannot restore this tab yet. Its saved address has been kept.");
    const page=await this.opener.openOn("aux",{url:saved.url||"about:blank",windowId:saved.window_id||"main",background:false,ownedByRuntime:false,activate:false},"session-restore",previous);
    this.pages.deps.repo.markDatasetsStale(page.pageId);
    this.pages.pendingRestore.delete(pageId);this.pages.restoreErrors.delete(pageId);
    return {page,restored:true};
  }
}
