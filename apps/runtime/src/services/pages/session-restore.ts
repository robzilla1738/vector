import { AuxError, EventTypes, type PageTarget } from "@aux/contracts";
import type { ActivationPolicy } from "./activation.js";
import type { PageOpener } from "./opener.js";
import type { PageRegistry } from "./registry.js";

export class TabSessionRestore {
  constructor(private pages: PageRegistry, private opener: PageOpener, private activation: ActivationPolicy) {
    if(pages.deps.native.available())for(const tab of pages.deps.repo.loadTabs().filter(tab=>tab.backend==="aux"))pages.pendingRestore.set(tab.page_id,tab);
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
        const byWindow = new Map<string, (typeof existing.pages)[number]>();
        for (const page of existing.pages) {
          const windowId = page.windowId ?? "main";
          if (page.active || !byWindow.has(windowId)) byWindow.set(windowId, page);
        }
        for (const page of byWindow.values()) {
          await this.activation.activate(page.pageId).catch(() => {});
        }
      } finally {
        this.pages.restoring = false;
        this.pages.deps.events.emit(EventTypes.PageUpdated, {});
      }
      return;
    }
    const tabs = this.pages.deps.repo.loadTabs().filter((t) => t.backend === "aux");
    if (!tabs.length) return;
    const activateIds = new Map<string, string>();
    this.pages.restoring = true;
    try {
      for (const t of tabs) {
        try {
          const p = await this.restoreSavedTab(t.page_id);
          const windowId = t.window_id || "main";
          if (t.active || !activateIds.has(windowId)) activateIds.set(windowId, p.pageId);
        } catch (error) {
          this.pages.restoreErrors.set(t.page_id,error instanceof Error?error.message:String(error));
        }
      }
      for (const pageId of activateIds.values()) await this.activation.activate(pageId).catch(() => {});
    } finally {
      this.pages.restoring = false;
      this.pages.deps.events.emit(EventTypes.PageUpdated, {});
      // Keep the original durable snapshot until all surfaces are restored.
      // Normal later tab mutations resume snapshotting.
    }
  }

  recoveryTabs() {
    return [...this.pages.pendingRestore.values()].map(tab=>({pageId:tab.page_id,url:tab.url,title:tab.title,windowId:tab.window_id||"main",error:this.pages.restoreErrors.get(tab.page_id),retrying:this.pages.retryingRestore.has(tab.page_id)}));
  }

  async retryRestore(pageId:string) {
    if(this.pages.restoring||this.pages.retryingRestore.has(pageId))throw new AuxError("conflict","This session is already being restored.");
    this.pages.retryingRestore.add(pageId);
    try {
      const page=await this.restoreSavedTab(pageId);
      this.pages.saveTabsSnapshot();
      return {ok:true,pageId:page.pageId};
    } catch(error) {
      this.pages.restoreErrors.set(pageId,error instanceof Error?error.message:String(error));
      throw error;
    } finally {
      this.pages.retryingRestore.delete(pageId);
      this.pages.deps.events.emit("browser.recovery.changed",{});
    }
  }

  private async restoreSavedTab(pageId:string):Promise<PageTarget> {
    const saved=this.pages.pendingRestore.get(pageId);
    if(!saved)throw new AuxError("not_found","This tab has already been restored.");
    const existing=this.pages.live.get(pageId);
    if(existing){this.pages.pendingRestore.delete(pageId);this.pages.restoreErrors.delete(pageId);return existing.target;}
    const previous=this.pages.deps.repo.getPage(pageId);
    if(!previous||!this.pages.driverFor("aux")?.recoverPage)throw new AuxError("backend_unavailable","The browser cannot restore this tab yet. Its saved address has been kept.");
    const page=await this.opener.openOn("aux",{url:saved.url||"about:blank",windowId:saved.window_id||"main",background:false,ownedByRuntime:false,activate:false},"session-restore",previous);
    this.pages.deps.repo.markDatasetsStale(page.pageId);
    this.pages.pendingRestore.delete(pageId);this.pages.restoreErrors.delete(pageId);
    return page;
  }
}
