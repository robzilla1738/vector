import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import { AuxError, type Backend, EventTypes, type PageTarget } from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import type { LivePage, PageServiceDeps } from "./types.js";

/**
 * The live page map and what every component shares: identity lookup,
 * per-window selection pointers, persist batching and driver wiring.
 */
export class PageRegistry {
  constructor(readonly deps: PageServiceDeps) {}

  live = new Map<string, LivePage>();
  pendingExternal = new Map<string, { removed: boolean; done?: Promise<PageTarget> }>();
  /** Foreground tabs/popups return to the tab that launched them when closed. */
  returnTargets = new Map<string, string>();
  /** Window hint for pages not yet (or never) registered — set by window/upsert ops. */
  lastKnownWindow = new Map<string, string>();
  revCounters = new Map<string, number>();
  activeId: string | null = null;
  /** Each regular browser window owns an independent selected tab. */
  activeByWindow = new Map<string, string>();
  /** set on app teardown — view.removed storms must not touch the restore list */
  closing = false;

  restoring = false;
  pendingRestore = new Map<string, ReturnType<Repo["loadTabs"]>[number]>();
  restoreErrors = new Map<string, string>();
  retryingRestore = new Set<string>();

  list(opts?: { backend?: Backend; includeDetached?: boolean }): PageTarget[] {
    const persisted = this.deps.repo.listPages(opts);
    // live targets always win over stale rows
    const map = new Map(persisted.map((p) => [p.pageId, p]));
    for (const [id, lp] of this.live) map.set(id, lp.target);
    return [...map.values()].sort((a, b) => a.createdAt - b.createdAt);
  }

  get(pageId: string): PageTarget {
    const lp = this.live.get(pageId);
    if (lp) return lp.target;
    const row = this.deps.repo.getPage(pageId);
    if (!row) throw new AuxError("not_found", `no page ${pageId}`);
    return row;
  }

  driverFor(backend: Backend): BrowserDriver | null {
    const drivers = this.deps.drivers();
    return backend === "aux" ? drivers.aux : drivers.chrome;
  }

  /** One construction path for pages opened here and pages attached from native surfaces. */
  addLive(target: PageTarget, driver: DriverPage | null): LivePage {
    const lp: LivePage = { target, driver, queue: Promise.resolve(), history: [], consoleLines: [] };
    this.live.set(target.pageId, lp);
    if (driver && target.backend === "aux" && this.deps.native.available()) {
      driver.setNativeDownloadAuthority?.();
    }
    if (driver && this.deps.downloadsDir) driver.setDownloadDir?.(this.deps.downloadsDir);
    if (driver) this.wireDriverEvents(lp);
    this.persist(lp);
    return lp;
  }

  wireDriverEvents(lp: LivePage) {
    lp.driver?.setEvents({
      onNavigated: (url, epoch) => {
        if (!url.startsWith("chrome-error://")) lp.target.url = url;
        lp.target.documentEpoch = epoch;
        this.resetDocumentState(lp);
        this.deps.repo.markDatasetsStale(lp.target.pageId);
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, url: lp.target.url, documentEpoch: epoch });
        void this.refreshMeta(lp);
      },
      onDestroyed: (reason) => {
        lp.target.viewStatus = reason === "crashed" ? "crashed" : "detached";
        lp.target.controller = "none";
        this.resetDocumentState(lp);
        this.persist(lp);
        if (!this.closing) this.deps.events.emit(reason === "crashed" ? EventTypes.PageCrashed : EventTypes.PageRemoved, {
          pageId: lp.target.pageId,
          reason,
        });
      },
      onDialog: (info) => {
        lp.lastDialog = info;
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, dialog: info });
      },
      decideDialog: this.deps.decideDialog
        ? (info) => this.deps.decideDialog!({ pageId: lp.target.pageId, ...info })
        : undefined,
      onConsole: (info) => {
      lp.consoleLines.push({ level: info.level, message: info.message, atMs: info.atMs ?? Date.now() });
      if (lp.consoleLines.length > 200) lp.consoleLines.splice(0, lp.consoleLines.length - 200);
      },
      onDownload: (info) => {
        // In the desktop shell the native will-download path is authoritative
        // (it sees every profile-session download); driver events cover
        // standalone mode where no native surface exists.
        if (!this.deps.native.available()) {
          this.deps.events.emit(EventTypes.DownloadStarted, { pageId: lp.target.pageId, ...info });
        }
      },
      onResponse: this.deps.responses?.record(lp.target.pageId),
    });
  }

  /** Retire page-derived text and controls when their document is no longer current. */
  resetDocumentState(lp: LivePage) {
    lp.lastObs = undefined;
    lp.lastObservationId = undefined;
    lp.history = [];
    lp.consoleLines = [];
    lp.lastDialog = undefined;
  }

  /** Coalesced: the page row and tab strip commit once per tick however many fields changed. */
  persist(lp: LivePage) {
    lp.target.lastActiveAt = Date.now();
    this.deps.repo.deferPage(lp.target);
    this.saveTabsSnapshot();
  }

  /** Last tab strip handed to the repo — the strip is rewritten only when it changed. */
  private savedTabs = "";

  /** Persist the human-facing tab strip so a restart restores it. */
  saveTabsSnapshot() {
    if (this.closing || this.restoring) return;
    const tabs = [...this.live.values()]
      .filter((x) => !x.target.ownedByRuntime && x.target.backend === "aux" && x.target.viewStatus !== "detached")
      .map((x, i) => ({
        pageId: x.target.pageId,
        windowId: x.target.windowId ?? "main",
        ordinal: i,
        url: x.target.url,
        title: x.target.title,
        backend: x.target.backend,
        active: this.activeByWindow.get(x.target.windowId ?? "main") === x.target.pageId,
      }));
    const liveIds=new Set(tabs.map(tab=>tab.pageId));
    for(const saved of this.pendingRestore.values())if(!liveIds.has(saved.page_id))tabs.push({pageId:saved.page_id,windowId:saved.window_id,ordinal:tabs.length,url:saved.url,title:saved.title,backend:saved.backend as Backend,active:!!saved.active});
    const key = JSON.stringify(tabs);
    if (key === this.savedTabs) return;
    this.savedTabs = key;
    // snapshot is best-effort — a failed write is retried by the next change;
    // late: tab rows reference page rows queued in the same batch
    this.deps.repo.defer("tabs", () => {
      try {
        this.deps.repo.saveTabs(tabs);
      } catch (e) {
        if (this.savedTabs === key) this.savedTabs = "";
        this.deps.tracer?.incr("swallowed.saveTabsSnapshot");
        throw e;
      }
    }, true);
  }

  async refreshMeta(lp: LivePage) {
    if (!lp.driver?.isAttached()) return;
    try {
      const title = await lp.driver.title();
      const url = lp.driver.url();
      if (lp.target.navigationError || url.startsWith("chrome-error://")) return;
      lp.target.title = title;
      lp.target.url = url;
      this.persist(lp);
      this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, title: lp.target.title, url: lp.target.url });
      // browsing history is the human's: agent/worker pages do not write it
      if (!lp.target.ownedByRuntime && lp.target.url.startsWith("http")) this.deps.repo.recordVisit(lp.target.url, lp.target.title, lp.target.pageId);
    } catch {
      // target racing a navigation — next event fixes it
      this.deps.tracer?.incr("swallowed.refreshMeta");
    }
  }

  /** Human navigation is allowed even while controller=human. */
  driverPageLenient(pageId: string): DriverPage {
    const lp = this.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached())
      throw new AuxError("target_detached", `page ${pageId} is not attached`);
    return lp.driver;
  }

  isAttached(pageId: string): boolean {
    return this.live.get(pageId)?.driver?.isAttached() ?? false;
  }

  livePageIds(): string[] {
    return [...this.live.keys()];
  }
}
