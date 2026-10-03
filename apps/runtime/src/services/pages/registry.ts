import { randomUUID } from "node:crypto";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import { AuxError, type Backend, EventTypes, type PageTarget, type NativePersonReadContext } from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import { parsePersonReadContext } from "../native-person-reader.js";
import type { LivePage, PageServiceDeps } from "./types.js";

/**
 * The live page map and what every component shares: identity lookup,
 * per-window selection pointers, persist batching and driver wiring.
 */
export class PageRegistry {
  constructor(readonly deps: PageServiceDeps) {}

  live = new Map<string, LivePage>();
  /** Catalog events wait until native-minted controlled pages have their creator metadata. */
  agentCreations = new Set<Promise<void>>();
  pendingExternal = new Map<string, { removed: boolean; done?: Promise<PageTarget> }>();
  private driverAttaches = new Map<string, Promise<void>>();
  /** Suppress catalog reattachment while a native page open is awaiting its driver. */
  opening = new Set<string>();
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
  /** Page ids that still had a renderer at shutdown. A restart must load these before showing them. */
  awakeOnRestore = new Set<string>();
  restoreErrors = new Map<string, string>();
  retryingRestore = new Set<string>();

  list(opts?: { backend?: Backend; includeDetached?: boolean }): PageTarget[] {
    const persisted = this.deps.repo.listPages(opts);
    // live targets always win over stale rows
    const map = new Map(persisted.map((p) => [p.pageId, p]));
    for (const [id, lp] of this.live) {
      if (opts?.includeDetached || lp.target.viewStatus !== "detached") map.set(id, lp.target);
      else map.delete(id);
    }
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
    // Persisted sessions never identify a restored or replacement attachment.
    delete target.sessionId;
    const lp: LivePage = { target, driver: null, queue: Promise.resolve(), history: [], consoleLines: [] };
    this.live.set(target.pageId, lp);
    if (driver) this.installDriver(lp, driver);
    this.persist(lp);
    return lp;
  }

  /** A native read session is distinct from a browser-control attachment. */
  adoptPersonReadContext(lp: LivePage, context: Pick<NativePersonReadContext, "documentId" | "sessionId">) {
    if (this.closing || this.live.get(lp.target.pageId) !== lp || lp.driver)
      throw new AuxError("target_detached", "This tab changed while preparing its context.");
    if (lp.personReadDocumentId && lp.personReadDocumentId !== context.documentId) {
      if (lp.target.sessionId === context.sessionId)
        throw new AuxError("backend_unavailable", "The native reader reused a retired document session.");
      if (lp.personReadDocumentEpoch === lp.target.documentEpoch) lp.target.documentEpoch++;
      this.resetDocumentState(lp);
    }
    const changed = lp.target.sessionId !== context.sessionId;
    lp.personReadDocumentId = context.documentId;
    lp.personReadDocumentEpoch = lp.target.documentEpoch;
    lp.target.sessionId = context.sessionId;
    if (changed) {
      this.persist(lp);
      this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
    }
  }
  async prepareReadPage(pageId: string): Promise<void> {
    const lp = this.live.get(pageId);
    if (!lp) throw new AuxError("target_detached", "This tab is no longer available.");
    if (lp.driver || lp.target.backend !== "aux" || lp.target.ownedByRuntime || lp.target.agentIsolation) return;
    if (!["human", "none"].includes(lp.target.controller) ||
        ["detached", "crashed"].includes(lp.target.viewStatus))
      throw new AuxError("permission_denied", "This tab is unavailable for read-only context.");
    const prepare = this.deps.native.personReadContext;
    if (!this.deps.native.available() || !prepare)
      throw new AuxError("backend_unavailable", "The native page reader is unavailable.");
    const epoch = lp.target.documentEpoch, control = lp.target.controllerEpoch, url = lp.target.url;
    const raw = await prepare.call(this.deps.native, pageId);
    if (this.live.get(pageId) !== lp || this.closing || lp.driver ||
        lp.target.documentEpoch !== epoch || lp.target.controllerEpoch !== control || lp.target.url !== url ||
        lp.target.ownedByRuntime || lp.target.agentIsolation ||
        !["human", "none"].includes(lp.target.controller) || ["detached", "crashed"].includes(lp.target.viewStatus))
      throw new AuxError("target_detached", "This tab changed while preparing its context.");
    const context = parsePersonReadContext(pageId, raw);
    if (context.url !== lp.target.url)
      throw new AuxError("ref_stale", "This tab navigated before its context was ready.");
    this.adoptPersonReadContext(lp, context);
  }

  /** Restored placeholders acquire a driver only after their native tab opens. */
  async attachVisible(pageId: string): Promise<void> {
    const lp = this.live.get(pageId);
    if (!lp || lp.driver || lp.target.backend !== "aux") return;
    const pending = this.driverAttaches.get(pageId);
    if (pending) return pending;
    const work = (async () => {
      const driver = this.driverFor("aux");
      if (!driver) return;
      const attached = await driver.attach(lp.target.targetId, pageId, {
        initialDocumentEpoch: lp.target.documentEpoch,
      });
      if (this.live.get(pageId) !== lp || this.closing) {
        await attached.dispose().catch(() => {});
        return;
      }
      try { this.installDriver(lp, attached); }
      catch (error) { await attached.dispose().catch(() => {}); throw error; }
      void this.refreshMeta(lp);
    })();
    this.driverAttaches.set(pageId, work);
    try { await work; }
    finally { this.driverAttaches.delete(pageId); }
  }

  /** A real attachment, shared by fresh open, restore, discard recovery and crash reload. */
  installDriver(lp: LivePage, driver: DriverPage) {
    if (this.live.get(lp.target.pageId) !== lp || this.closing) throw new AuxError("target_detached", "This tab closed while attaching.");
    if (lp.driver === driver) return;
    if (lp.driver) throw new AuxError("conflict", "This tab already has a newer attachment.");
    lp.driver = driver;
    lp.target.sessionId = randomUUID();
    if (lp.target.backend === "aux" && this.deps.native.available()) driver.setNativeDownloadAuthority?.();
    if (this.deps.downloadsDir) driver.setDownloadDir?.(this.deps.downloadsDir);
    this.wireDriverEvents(lp);
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
  }

  wireDriverEvents(lp: LivePage) {
    const driver = lp.driver, sessionId = lp.target.sessionId;
    const current = () => this.live.get(lp.target.pageId) === lp && lp.driver === driver && lp.target.sessionId === sessionId;
    const response = this.deps.responses?.record(lp.target.pageId);
    driver?.setEvents({
      onNavigated: (url, epoch) => {
        if (!current()) return;
        if (!url.startsWith("chrome-error://")) lp.target.url = url;
        lp.target.documentEpoch = epoch;
        this.resetDocumentState(lp);
        this.deps.repo.markDatasetsStale(lp.target.pageId);
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, url: lp.target.url, documentEpoch: epoch });
        void this.refreshMeta(lp);
      },
      onDestroyed: (reason) => {
        if (!current()) return;
        delete lp.target.sessionId;
        lp.driver = null;
        lp.target.viewStatus = reason === "crashed" ? "crashed" : "detached";
        lp.target.controller = "none";
        this.resetDocumentState(lp);
        this.persist(lp);
        if (this.closing) return;
        if (reason === "crashed") {
          this.deps.events.emit(EventTypes.PageCrashed, { pageId: lp.target.pageId, reason });
          return;
        }
        // Discard replaces the renderer and closes its debugger target. The
        // catalog remove is the close; reporting one here drops a sleeping tab.
        if (this.deps.native.available() && lp.target.backend === "aux") {
          this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, viewStatus: "detached" });
          return;
        }
        this.deps.events.emit(EventTypes.PageRemoved, { pageId: lp.target.pageId, reason });
      },
      onDialog: (info) => {
        if (!current()) return;
        lp.lastDialog = info;
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, dialog: info });
      },
      decideDialog: this.deps.decideDialog
        ? (info) => current() ? this.deps.decideDialog!({ pageId: lp.target.pageId, ...info }) : Promise.resolve("leave" as const)
        : undefined,
      onConsole: (info) => {
        if (!current()) return;
      lp.consoleLines.push({ level: info.level, message: info.message, atMs: info.atMs ?? Date.now() });
      if (lp.consoleLines.length > 200) lp.consoleLines.splice(0, lp.consoleLines.length - 200);
      },
      onDownload: (info) => {
        if (!current()) return;
        // In the desktop shell the native will-download path is authoritative
        // (it sees every profile-session download); driver events cover
        // standalone mode where no native surface exists.
        if (!this.deps.native.available()) {
          this.deps.events.emit(EventTypes.DownloadStarted, { pageId: lp.target.pageId, ...info });
        }
      },
      onResponse: response ? info => { if (current()) return response({ ...info, sessionId }); } : undefined,
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
    const driver = lp.driver, sessionId = lp.target.sessionId;
    if (!driver?.isAttached()) return;
    try {
      const title = await driver.title();
      if (this.live.get(lp.target.pageId) !== lp || lp.driver !== driver || lp.target.sessionId !== sessionId) return;
      const url = driver.url();
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
