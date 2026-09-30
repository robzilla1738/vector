import { EventTypes, type TabPatch, type TabPatchOp } from "@aux/contracts";
import type { ActivationPolicy } from "./activation.js";
import type { PageOpener } from "./opener.js";
import type { PageRegistry } from "./registry.js";
import type { LivePage } from "./types.js";
import { BrowserDownloadLedger } from "../browser-download-ledger.js";

export class NativeViewSync {
  private downloads: BrowserDownloadLedger;
  constructor(private pages: PageRegistry, private opener: PageOpener, private activation: ActivationPolicy) {
    this.downloads = new BrowserDownloadLedger(pages.deps.repo, pages.deps.downloadsDir);
  }

  /** Catalog patches apply strictly in publish order — attach work inside an
   *  op must not interleave with the next patch. */
  private catalogQueue: Promise<unknown> = Promise.resolve();

  onNativeNavigated(pageId: string, url: string) {
    if (url.startsWith("chrome-error://")) return;
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    lp.target.url = url;
    lp.target.documentEpoch++;
    this.pages.resetDocumentState(lp);
    if (lp.target.viewStatus === "crashed") lp.target.viewStatus = lp.target.ownedByRuntime ? "background" : this.pages.activeByWindow.get(lp.target.windowId ?? "main") === pageId ? "visible" : "hidden";
    lp.target.error = undefined;
    lp.target.navigationError = null;
    this.pages.persist(lp);
    if (!this.pages.restoring) this.pages.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
    void this.pages.refreshMeta(lp);
  }

  onNativeNavigationError(pageId: string, error: { url: string; code: number; message: string; upgradedFrom?: string } | null) {
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    if (JSON.stringify(lp.target.navigationError ?? null) === JSON.stringify(error)) return;
    lp.target.navigationError = error;
    if (error) { lp.target.url = error.url; lp.target.title = "Page couldn’t load"; lp.target.loading = false; this.pages.resetDocumentState(lp); }
    this.pages.persist(lp);
    if (!this.pages.restoring) this.pages.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
  }

  onNativeCrashed(pageId: string) {
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    lp.target.viewStatus = "crashed";
    lp.target.error = "The renderer process crashed.";
    lp.target.loading = false;
    this.pages.resetDocumentState(lp);
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageCrashed, { pageId });
  }

  /**
   * Catalog patches pushed by the main process (§7.1/§7.2): the runtime
   * subscribes to human tab truth — presence, window placement, focus —
   * instead of owning it. Field-level convergence still rides the view.*
   * notifications; window ops run first so a patch's activation decision is
   * known before its upserts/removes apply.
   */
  syncCatalog(patch: TabPatch): Promise<void> {
    const run = this.catalogQueue.then(() => this.applyCatalogPatch(patch));
    this.catalogQueue = run.catch(() => {});
    return run;
  }

  private async applyCatalogPatch(patch: TabPatch) {
    for (const op of patch.ops) {
      if (op.op !== "window" || !op.window) continue;
      const w = op.window;
      if (this.pages.activeByWindow.get(w.windowId) === w.activePageId) continue;
      if (w.activePageId) {
        const displaced = this.pages.activeByWindow.get(w.windowId);
        // The window op is activation truth — record the displaced tab as the
        // close-return target even for a page that dies before registering.
        if (displaced && displaced !== w.activePageId) this.pages.returnTargets.set(w.activePageId, displaced);
        this.pages.activeByWindow.set(w.windowId, w.activePageId);
        this.pages.lastKnownWindow.set(w.activePageId, w.windowId);
      }
      else this.pages.activeByWindow.delete(w.windowId);
      const lp = w.activePageId ? this.pages.live.get(w.activePageId) : undefined;
      if (lp) {
        // The window op is the truth for activation — the global pointer
        // follows the most recently activated tab main reports.
        this.pages.activeId = lp.target.pageId;
        lp.target.lastActiveAt = Date.now();
        this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, activePageId: lp.target.pageId, lastActiveAt: lp.target.lastActiveAt });
      } else if (!w.activePageId) {
        const active = this.pages.activeId ? this.pages.live.get(this.pages.activeId) : undefined;
        if (active && (active.target.windowId ?? "main") === w.windowId) this.pages.activeId = null;
      }
    }
    for (const op of patch.ops) {
      try {
        await this.syncCatalogOp(op);
      } catch {
        /* one malformed op must not drop the rest of the batch */
      }
    }
  }

  private async syncCatalogOp(op: TabPatchOp) {
    switch (op.op) {
      case "upsert": {
        const tab = op.tab;
        if (!tab) return;
        this.pages.lastKnownWindow.set(tab.pageId, tab.windowId);
        const lp = this.pages.live.get(tab.pageId);
        if (lp) {
          this.onNativeNavigationError(tab.pageId, tab.navigationError ?? null);
          if (lp.target.themeColor !== tab.themeColor) {
            lp.target.themeColor = tab.themeColor;
            this.pages.persist(lp);
            this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId: tab.pageId, themeColor: tab.themeColor });
          }
          if (lp.target.lifecycle !== tab.lifecycle) {
            lp.target.lifecycle = tab.lifecycle;
            this.pages.persist(lp);
          }
          // The catalog owns window placement; the driver and view.* events
          // own the per-page fields the runtime reports.
          if ((lp.target.windowId ?? "main") !== tab.windowId) {
            lp.target.windowId = tab.windowId;
            this.pages.persist(lp);
            this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId: tab.pageId, windowId: tab.windowId });
          }
          return;
        }
        // Pages the runtime itself created echo back through the catalog —
        // skip them. Human/external surfaces register so agent ops can
        // attach on the stable marker.
        if (op.origin === "runtime" || this.pages.opening.has(tab.pageId) ||
          this.pages.pendingExternal.has(tab.pageId) || this.pages.closing) return;
        const active = this.pages.activeByWindow.get(tab.windowId) === tab.pageId;
        await this.opener.registerExternal({
          pageId: tab.pageId,
          windowId: tab.windowId,
          marker: `atab-${tab.pageId}`,
          url: tab.url,
          title: tab.title,
          themeColor: tab.themeColor,
          backend: "aux",
          active,
          ownedByRuntime: tab.runtimeOwned,
          lifecycle: tab.lifecycle,
          // A re-materialized tab continues its epoch sequence — a fresh
          // surface must invalidate observations made against the old one.
          restored: this.pages.deps.repo.getPage(tab.pageId),
        });
        if (this.pages.pendingRestore.delete(tab.pageId)) {
          this.pages.restoreErrors.delete(tab.pageId);
          this.pages.deps.events.emit("browser.recovery.changed", {});
        }
        // A placeholder catalog row for a tab that was still rendered must load.
        // Waiting here would deadlock the catalog queue on the focus response.
        if (this.pages.awakeOnRestore.has(tab.pageId) && tab.lifecycle !== "live") {
          const recover = this.pages.deps.native.recoverPage;
          if (recover) void recover(tab.pageId, tab.url).catch(() => {});
          else void this.activation.activate(tab.pageId).catch(() => {});
        }
        if (tab.navigationError) this.onNativeNavigationError(tab.pageId, tab.navigationError);
        return;
      }
      case "remove": {
        if (!op.pageId) return;
        this.applyNativeRemoved(op.pageId, false);
        return;
      }
    }
  }

  /**
   * main -> runtime: a native webContents was destroyed out-of-band (popup
   * close). The catalog patch announcing the page's activation was emitted
   * first, so the restore decision is enqueued on the catalog queue — reading
   * the window-active pointer synchronously would race the queued ops.
   */
  onNativeRemoved(pageId: string, chooseSuccessor = true, discarded = false) {
    const pending = this.pages.pendingExternal.get(pageId);
    if (pending) pending.removed = true;
    if (!chooseSuccessor) {
      // Called from syncCatalogOp — already serialized on the catalog queue.
      this.applyNativeRemoved(pageId, false, discarded);
      return;
    }
    const run = this.catalogQueue.then(() => this.applyNativeRemoved(pageId, true, discarded));
    this.catalogQueue = run.catch(() => {});
  }

  private applyNativeRemoved(pageId: string, chooseSuccessor: boolean, discarded = false) {
    const lp = this.pages.live.get(pageId);
    if (lp) {
      if (lp.target.viewStatus !== "crashed") lp.target.viewStatus = "detached";
      lp.target.controller = "none";
      this.pages.persist(lp);
      this.pages.live.delete(pageId);
      void lp.driver?.dispose().catch(() => {});
    }
    const returnTarget = this.activation.takeReturnTarget(pageId);
    // A popup that dies before its attach completes never lands in `live`,
    // but a window op may still have made it the window's active tab —
    // the stale pointer must be cleared and a successor chosen either way.
    const windowId = lp?.target.windowId ?? this.pages.lastKnownWindow.get(pageId) ?? "main";
    this.pages.lastKnownWindow.delete(pageId);
    if (!this.pages.closing) {
      let next: LivePage | undefined;
      const wasWindowActive = this.pages.activeByWindow.get(windowId) === pageId;
      if (wasWindowActive) this.pages.activeByWindow.delete(windowId);
      const wasActive = this.pages.activeId === pageId;
      if (wasActive) this.pages.activeId = null;
      // Catalog-originated removes arrive alongside a window op carrying
      // main's chosen successor — picking our own would double-focus.
      if (chooseSuccessor && (wasActive || wasWindowActive)) {
        next = this.activation.successor(windowId, returnTarget);
      }
      // A discard keeps its catalog record — the tab stays on the strip as a
      // detached page, so renderers must not treat it as a close.
      if (lp || next) {
        if (discarded) {
          if (lp) this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId, viewStatus: "detached" });
        } else {
          this.pages.deps.events.emit(EventTypes.PageRemoved, { pageId, ...(next ? { activePageId: next.target.pageId } : {}) });
        }
      }
      if (next) void this.activation.activate(next.target.pageId).catch(() => {});
    }
  }

  onNativeTitle(pageId: string, title: string) {
    const lp = this.pages.live.get(pageId);
    if (!lp || lp.target.navigationError) return;
    lp.target.title = title;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId, title });
  }

  onNativeFavicon(pageId: string, favicon: string) {
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    lp.target.favicon = favicon || undefined;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId, favicon });
  }

  onNativeNavState(pageId: string, canGoBack: boolean, canGoForward: boolean) {
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    lp.target.canGoBack = canGoBack;
    lp.target.canGoForward = canGoForward;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId, canGoBack, canGoForward });
  }

  onNativeLoading(pageId: string, loading: boolean) {
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    lp.target.loading = loading && !lp.target.navigationError && lp.target.viewStatus !== "crashed";
    this.pages.deps.events.emit(EventTypes.PageLoading, { pageId, loading: lp.target.loading });
  }

  /** main -> runtime: a profile-session download began (authoritative record). */
  onNativeDownloadStarted(
    pageId: string | undefined,
    info: { id: string; sourceUrl?: string; filename: string; path: string; size: number; totalBytes?: number; startedAt: number; downloadRoot?: string },
  ) {
    this.pages.deps.repo.saveDownload({ ...info, pageId, state: "started" });
    const lp = pageId ? this.pages.live.get(pageId) : undefined;
    this.downloads.started(pageId, info, lp?.target.controller, info.downloadRoot);
    lp?.driver?.notifyDownloadStarted?.(info);
    this.pages.deps.events.emit(EventTypes.DownloadStarted, { pageId, ...info, state: "started" });
  }

  async onNativeDownload(
    pageId: string | undefined,
    info: { id: string; sourceUrl?: string; filename: string; path: string; state: string; size: number; totalBytes?: number; startedAt: number; endedAt?: number },
  ) {
    this.pages.deps.repo.saveDownload({ ...info, pageId });
    await this.downloads.finished(info);
    const lp = pageId ? this.pages.live.get(pageId) : undefined;
    if (lp?.driver) {
      lp.driver.notifyDownload?.({
        id: info.id,
        startedAt: info.startedAt,
        suggestedFilename: info.filename,
        path: info.path,
        state: info.state,
      });
    }
    this.pages.deps.events.emit(EventTypes.DownloadFinished, { pageId, ...info });
  }
}
