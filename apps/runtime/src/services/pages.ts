import type { BrowserSpace, TabPatch, TabPatchOp } from "@aux/contracts";
import type { PageWindowMove } from "@aux/contracts";
import {
  EventTypes,
  newObservationId,
  newPageId,
  AuxError,
  type AuxErrorCode,
  type Backend,
  type Condition,
  type Observation,
  type ObservationContent,
  type ObservationRequest,
  type PageTarget,
  type Program,
  type ProgramNode,
  type ProgramResult,
  type Step,
  type StepRecord,
} from "@aux/contracts";
import { newStepId } from "@aux/contracts";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { EventBus } from "../events.js";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import type { VaultService } from "./vault.js";
import { executeProgram, type ExecContext } from "../execution/executor.js";
import { pickElementInPage, ELEMENT_PICK_TIMEOUT_MS, type PickedElement } from "../execution/element-picker.js";
import { authorizeProgram, DEFAULT_GRANTS, type GrantSource } from "../agent/permissions.js";
import { beginConsequentialWrite, settleWrite, type DurableWriteLedger } from "../agent/durable.js";
import { AsyncLocalStorage } from "node:async_hooks";

/** Backends the runtime can hold drivers for. */
export interface DriverSet {
  aux: BrowserDriver | null;
  chrome: BrowserDriver | null;
}

type ObserveReq = Partial<Pick<ObservationRequest, "scope" | "subtreeRef" | "maxElements" | "maxTextChars" | "sinceRevision" | "format">>;

/** `pages.execute` result: the program result plus the act-and-observe observation. */
export type ExecuteResult = ProgramResult & { observation?: Observation };

/** Ops that dispatch trusted input — they need a visible, laid-out view. */
const INTERACTIVE_OPS = new Set([
  "click", "dblclick", "hover", "press", "type", "fill", "fillCredential",
  "check", "uncheck", "select", "scroll", "dragTo", "clickPoint",
]);

/** Ops whose success IS a verification — they prove state, not just dispatch. */
const VERIFY_OPS = new Set([
  "expect", "assert", "waitFor", "expectDownload", "expectNavigation", "extract",
]);

interface LivePage {
  target: PageTarget;
  driver: DriverPage | null;
  /** serialization chain — commands to one page never overlap */
  queue: Promise<unknown>;
  lastObservationId?: string;
  /** observation cache (plan A6): the last observation with the page fingerprint and request it answered */
  lastObs?: { fingerprint: string; reqKey: string; obs: Observation };
  /** recent observations by revision so `sinceRevision` can diff against the one the caller last saw */
  history: { revision: number; text: string; fields: Map<string, string> }[];
  consoleLines: { level: string; message: string; atMs?: number }[];
  lastDialog?: { type: string; message: string };
}

const OBSERVATION_HISTORY = 8;

const observeReqKey = (req: ObserveReq) =>
  `${req.scope ?? "full"}|${req.subtreeRef ?? ""}|${req.maxElements ?? 120}|${req.maxTextChars ?? 6000}`;

export interface PageServiceDeps {
  repo: Repo;
  events: EventBus;
  native: NativeBridge;
  drivers: () => DriverSet;
  recordStep?: (s: StepRecord) => void;
  artifacts?: { save(o: { runId?: string; pageId?: string; label: string; buffer: Buffer; mediaType: string }): { artifactId: string } };
  /** passive response capture — bound per page in wireDriverEvents */
  responses?: {
    record(pageId: string): NonNullable<DriverPageEvents["onResponse"]>;
    flush(): Promise<void>;
    list(pageId: string, opts?: { since?: number; urlIncludes?: string; limit?: number }): unknown[];
  };
  /** structured spans (§6) — execute/observe emit timing records */
  tracer?: {
    start(
      name: string,
      ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
    ): { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
    incr(name: string, by?: number): void;
  };
  /** fallback `call` node dispatch when the caller didn't supply one */
  callOperation?: (name: string, args: Record<string, unknown>, pageId: string) => Promise<unknown>;
  /**
   * Privilege-independent effect grants (Gate D / Gate F). Model text and
   * RPC params cannot expand these. A function re-reads after settings.set.
   * Used for unsolicited `pages.execute` (no runId).
   */
  grants?: GrantSource;
  /**
   * Grants for a user-started `runs.start` (`ctx.runId` set). Starting the
   * run is the write grant. Falls back to `grants` when omitted.
   */
  grantsForRun?: GrantSource;
  /** optional locked vault; fillCredential resolves here and never records the secret */
  vault?: VaultService;
  /** Shared write journal. Direct execute journals here when `ctx.journaled` is unset. */
  durableWrites?: DurableWriteLedger;
}

/**
 * Owns the page registry: identity, lifecycle, per-page serialization,
 * observations with revisions, human takeover, and driver wiring.
 */
export class PageService {
  private live = new Map<string, LivePage>();
  private pendingExternal = new Map<string, { removed: boolean; done?: Promise<PageTarget> }>();
  /** Foreground tabs/popups return to the tab that launched them when closed. */
  private returnTargets = new Map<string, string>();
  /** Window hint for pages not yet (or never) registered — set by window/upsert ops. */
  private lastKnownWindow = new Map<string, string>();
  private revCounters = new Map<string, number>();
  private activeId: string | null = null;
  /** Each regular browser window owns an independent selected tab. */
  private activeByWindow = new Map<string, string>();
  /** set on app teardown — view.removed storms must not touch the restore list */
  private closing = false;
  /** Catalog patches apply strictly in publish order — attach work inside an
   *  op must not interleave with the next patch. */
  private catalogQueue: Promise<unknown> = Promise.resolve();
  private restoring = false;
  private pendingRestore = new Map<string, ReturnType<Repo["loadTabs"]>[number]>();
  private restoreErrors = new Map<string, string>();
  private retryingRestore = new Set<string>();
  /** pages with an in-flight program — Playwright input is not a human takeover */
  private programInflight = new Set<string>();

  shuttingDown() {
    this.closing = true;
  }

  get activePageId(): string | null {
    return this.activeId;
  }

  activePageIdFor(windowId = "main"): string | null {
    return this.activeByWindow.get(windowId) ?? null;
  }

  get isRestoringTabs() { return this.restoring; }

  constructor(private deps: PageServiceDeps) {
    if(deps.native.available())for(const tab of deps.repo.loadTabs().filter(tab=>tab.backend==="aux"))this.pendingRestore.set(tab.page_id,tab);
    this.restoring = this.pendingRestore.size > 0;
    // restore persisted page rows as detached history entries
    for (const p of deps.repo.listPages({ includeDetached: true })) {
      p.viewStatus = "detached";
      p.controller = "none";
      this.deps.repo.upsertPage(p);
    }
  }

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

  driverPage(pageId: string): DriverPage {
    const lp = this.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached())
      throw new AuxError("target_detached", `page ${pageId} is not attached`);
    if (lp.target.controller === "human")
      throw new AuxError("conflict", `page ${pageId} is under human control — resume first`);
    return lp.driver;
  }

  /**
   * Resource conflict keys (§10.2): programs declaring `conflicts` hold those
   * keys for their duration — a second program wanting the same key waits.
   * Keys are acquired sorted to keep lock order deterministic.
   */
  private keyMutex = new Map<string, Promise<unknown>>();
  private withKeys<T>(keys: string[] | undefined, fn: () => Promise<T>): Promise<T> {
    const sorted = [...new Set(keys ?? [])].sort();
    const acquire = async (i: number): Promise<T> => {
      if (i >= sorted.length) return fn();
      const key = sorted[i]!;
      const prev = this.keyMutex.get(key) ?? Promise.resolve();
      let release!: () => void;
      const hold = new Promise<void>((r) => (release = r));
      const stored = prev.then(() => hold);
      this.keyMutex.set(key, stored);
      await prev.catch(() => {});
      try {
        return await acquire(i + 1);
      } finally {
        release();
        if (this.keyMutex.get(key) === stored) this.keyMutex.delete(key);
      }
    };
    return acquire(0);
  }

  /** Serialize all driver commands per page. */
  /**
   * Per-page serialization lane. Reentrant calls from within the lane's own
   * async context run inline — a `call` node invoking an operation that
   * executes steps on the SAME page must not wait on its own queue (deadlock).
   * AsyncLocalStorage scopes this to the reentrant context only: concurrent
   * calls from other contexts still serialize normally.
   */
  private laneCtx = new AsyncLocalStorage<{ lane: string }>();
  private enqueue<T>(pageId: string, fn: () => Promise<T>): Promise<T> {
    if (this.laneCtx.getStore()?.lane === pageId) return fn();
    const lp = this.live.get(pageId);
    if (!lp) return fn();
    const run = lp.queue.then(() => this.laneCtx.run({ lane: pageId }, fn));
    lp.queue = run.catch(() => {});
    return run;
  }

  private driverFor(backend: Backend): BrowserDriver | null {
    const drivers = this.deps.drivers();
    return backend === "aux" ? drivers.aux : drivers.chrome;
  }

  /** Open a page. An omitted backend selects embedded Chromium (`aux`). */
  async open(opts: {
    url: string;
    windowId?: string;
    backend?: Backend;
    background: boolean;
    ownedByRuntime: boolean;
    activate?: boolean;
    targetId?: string; // chrome: attach an existing tab by CDP id
  }): Promise<PageTarget> {
    const backend = opts.backend ?? "aux";
    return this.openOn(backend, opts, opts.backend ? `explicit-backend:${opts.backend}` : "chromium-default");
  }

  /** Create the backend surface for a page and return its target id. */
  private async createSurface(
    backend: Backend,
    driver: BrowserDriver,
    pageId: string,
    initialUrl: string,
    background: boolean,
    windowId?: string,
    ownedByRuntime=false,
  ): Promise<{ targetId: string; nativeCreated: boolean }> {
    if (backend === "aux") {
      const marker = `atab-${pageId}`;
      if (this.deps.native.available()) {
        // Scoped tab commands (§7.3): agent opens go through the same main-owned
        // controller as human opens — deduplicated, ack'd, catalog-published.
        const ack = await this.deps.native.tabCommand({
          commandId: `agent-${newPageId()}`,
          windowId: windowId ?? "main",
          command: { kind: "open", pageId, url: initialUrl, background, activate: !background, runtimeOwned: ownedByRuntime },
        });
        if (ack.status === "rejected") throw new AuxError((ack.error?.code ?? "unavailable") as AuxErrorCode, ack.error?.message ?? "The tab could not be opened.");
        return { targetId: marker, nativeCreated: true };
      }
      if (driver.createTarget) {
        // standalone mode: the driver owns the surface (headless chrome page)
        return { targetId: await driver.createTarget(initialUrl), nativeCreated: false };
      }
      throw new AuxError("backend_unavailable", "aux backend needs the desktop shell or a standalone driver");
    }
    if (!driver.createTarget) {
      throw new AuxError(
        "invalid_params",
        backend === "chrome"
          ? "chrome pages.open requires targetId of an existing tab (list them with chrome.tabs)"
          : `${backend} driver cannot create pages`,
      );
    }
    return { targetId: await driver.createTarget(initialUrl), nativeCreated: false };
  }

  private async openOn(
    backend: Backend,
    opts: { url: string; windowId?: string; background: boolean; ownedByRuntime: boolean; activate?: boolean; targetId?: string },
    routeReason: string,
    restored?: PageTarget,
  ): Promise<PageTarget> {
    const driver = this.driverFor(backend);
    // a dropped socket is recovered lazily here rather than failing every
    // open until restart; a backend that is truly gone still fails below
    if (driver && !driver.isConnected() && driver.reconnect) await driver.reconnect().catch(() => {});
    if (!driver?.isConnected())
      throw new AuxError("backend_unavailable", `${backend} backend is not connected`);

    const pageId = restored?.pageId ?? newPageId();
    let targetId: string;
    let nativeCreated = false;
    // Open on about:blank, then navigate AFTER response listeners are wired —
    // otherwise the page's own first load escapes passive capture.
    const initialUrl = opts.targetId ? opts.url : "about:blank";
    if (opts.targetId && backend === "chrome") {
      targetId = opts.targetId;
    } else {
      ({ targetId, nativeCreated } = await this.createSurface(backend, driver, pageId, initialUrl, opts.background, opts.windowId,opts.ownedByRuntime));
    }

    let dp: DriverPage;
    try {
      dp = restored && driver.recoverPage
        ? await driver.recoverPage(targetId, pageId, restored.documentEpoch + 1)
        : await driver.attach(targetId, pageId);
    } catch (e) {
      // the shell view already exists — destroy it rather than leaking a
      // driverless zombie tab in the strip
      if (nativeCreated) await this.deps.native.tabCommand({ commandId: `agent-${newPageId()}`, windowId: opts.windowId ?? "main", command: { kind: "close", pageId } }).catch(() => {});
      throw e;
    }
    const target: PageTarget = {
      pageId,
      windowId: opts.windowId,
      backend,
      targetId,
      url: opts.url,
      title: "",
      documentEpoch: restored ? restored.documentEpoch + 1 : 0,
      lastRevision: 0,
      viewStatus: backend === "chrome" ? "hidden" : opts.background ? "background" : "visible",
      controller: "none",
      controllerEpoch: restored ? restored.controllerEpoch + 1 : 0,
      ownedByRuntime: opts.ownedByRuntime,
      createdAt: restored?.createdAt ?? Date.now(),
      lastActiveAt: Date.now(),
      routeReason,
    };
    const lp: LivePage = { target, driver: dp, queue: Promise.resolve(), history: [], consoleLines: [] };
    this.live.set(pageId, lp);
    this.wireDriverEvents(lp);
    this.persist(lp);
    if (!this.restoring) this.deps.events.emit(EventTypes.PageAdded, { page: target });
    this.deps.tracer?.incr(`router.open.${backend}`);
    // Select the requested foreground tab before loading. A slow response must
    // not steal focus later or leave commands targeting the previous tab.
    if (opts.activate ?? !opts.background) await this.activate(pageId).catch(() => {});
    // the real navigation happens with listeners attached — captured like
    // any later navigation (metadata + bodies)
    if (dp && opts.url !== initialUrl) {
      const navigation = lp.driver!.navigate(opts.url).catch(() => {});
      if (!restored) await navigation;
    }
    void this.refreshMeta(lp);
    return target;
  }

  /** Register a page created natively outside the open() path (popups, restored tabs). */
  /**
   * Register a natively-created page (popup, catalog-reported human tab).
   * Idempotent: the catalog upsert and the `view.popup` notification can
   * arrive in either order — a second call returns the live or in-flight
   * target instead of attaching a duplicate driver.
   */
  async registerExternal(opts: {
    pageId?: string;
    windowId?: string;
    marker: string;
    url: string;
    backend: Backend;
    title?: string;
    active?: boolean;
    showBlankDocument?: boolean;
    restored?: PageTarget;
  }): Promise<PageTarget> {
    const pageId = opts.pageId ?? newPageId();
    const existing = this.live.get(pageId);
    if (existing) return existing.target;
    const inFlight = this.pendingExternal.get(pageId);
    if (inFlight?.done) return inFlight.done;
    const pending: { removed: boolean; done?: Promise<PageTarget> } = { removed: false };
    pending.done = this.attachExternal(opts, pageId, pending);
    this.pendingExternal.set(pageId, pending);
    try {
      return await pending.done;
    } finally {
      this.pendingExternal.delete(pageId);
    }
  }

  private async attachExternal(opts: {
    windowId?: string;
    marker: string;
    url: string;
    backend: Backend;
    title?: string;
    active?: boolean;
    showBlankDocument?: boolean;
    restored?: PageTarget;
  }, pageId: string, pending: { removed: boolean }): Promise<PageTarget> {
    const driver = this.driverFor(opts.backend);
    const dp = driver ? await driver.attach(opts.marker, pageId) : null;
    if (pending.removed || this.closing) {
      await dp?.dispose().catch(() => {});
      throw new AuxError("not_found", "Page closed while it was being attached");
    }
    const target: PageTarget = {
      pageId,
      windowId: opts.windowId,
      backend: opts.backend,
      targetId: opts.marker,
      url: dp?.url() || opts.url,
      title: opts.title ?? "",
      showBlankDocument: opts.showBlankDocument,
      documentEpoch: opts.restored ? opts.restored.documentEpoch + 1 : 0,
      lastRevision: 0,
      viewStatus: opts.active === false ? "background" : "visible",
      controller: "none",
      controllerEpoch: opts.restored ? opts.restored.controllerEpoch + 1 : 0,
      ownedByRuntime: false,
      createdAt: opts.restored?.createdAt ?? Date.now(),
      lastActiveAt: Date.now(),
    };
    const lp: LivePage = { target, driver: dp, queue: Promise.resolve(), history: [], consoleLines: [] };
    this.live.set(pageId, lp);
    if (dp) this.wireDriverEvents(lp);
    this.persist(lp);
    if (opts.active) {
      const previous = this.activeByWindow.get(target.windowId ?? "main");
      if (previous && previous !== pageId) this.returnTargets.set(pageId, previous);
      this.activeId = pageId;
      this.activeByWindow.set(target.windowId ?? "main", pageId);
    }
    this.deps.events.emit(EventTypes.PageAdded, { page: target });
    void this.refreshMeta(lp);
    return target;
  }

  private wireDriverEvents(lp: LivePage) {
    lp.driver?.setEvents({
      onNavigated: (url, epoch) => {
        if (!url.startsWith("chrome-error://")) lp.target.url = url;
        lp.target.documentEpoch = epoch;
        this.deps.repo.markDatasetsStale(lp.target.pageId);
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, url: lp.target.url, documentEpoch: epoch });
        void this.refreshMeta(lp);
      },
      onTitleChanged: (title) => {
        if (lp.target.navigationError || lp.driver?.url().startsWith("chrome-error://")) return;
        lp.target.title = title;
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, title });
      },
      onDestroyed: (reason) => {
        lp.target.viewStatus = reason === "crashed" ? "crashed" : "detached";
        lp.target.controller = "none";
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
      onConsole: (info) => {
      lp.consoleLines.push({ level: info.level, message: info.message, atMs: Date.now() });
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

  private persist(lp: LivePage) {
    lp.target.lastActiveAt = Date.now();
    this.deps.repo.upsertPage(lp.target);
    this.saveTabsSnapshot();
  }

  /** Persist the human-facing tab strip so a restart restores it. */
  private saveTabsSnapshot() {
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
    try {
      const liveIds=new Set(tabs.map(tab=>tab.pageId));
      for(const saved of this.pendingRestore.values())if(!liveIds.has(saved.page_id))tabs.push({pageId:saved.page_id,windowId:saved.window_id,ordinal:tabs.length,url:saved.url,title:saved.title,backend:saved.backend as Backend,active:!!saved.active});
      this.deps.repo.saveTabs(tabs);
    } catch {
      /* snapshot is best-effort */
    }
  }

  /** Reopen the tabs that were live when the app last shut down. */
  async restoreTabs() {
    if (!this.deps.native.available()) { this.restoring=false; return; }
    if (this.live.size > 0) {
      for(const pageId of this.live.keys())this.pendingRestore.delete(pageId);
      this.restoring=false;
      this.saveTabsSnapshot();
      return;
    }
    const existing = await (this.deps.native.listPages?.() ?? Promise.resolve({ pages: [] })).catch(() => ({ pages: [] }));
    if (existing.pages.length) {
      this.restoring = true;
      try {
        for (const page of existing.pages) {
          const previous = this.deps.repo.getPage(page.pageId);
          try {
            await this.registerExternal({ ...page, backend: "aux", restored: previous });
            this.pendingRestore.delete(page.pageId);
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
          await this.activate(page.pageId).catch(() => {});
        }
      } finally {
        this.restoring = false;
        this.deps.events.emit(EventTypes.PageUpdated, {});
      }
      return;
    }
    const tabs = this.deps.repo.loadTabs().filter((t) => t.backend === "aux");
    if (!tabs.length) return;
    const activateIds = new Map<string, string>();
    this.restoring = true;
    try {
      for (const t of tabs) {
        try {
          const p = await this.restoreSavedTab(t.page_id);
          const windowId = t.window_id || "main";
          if (t.active || !activateIds.has(windowId)) activateIds.set(windowId, p.pageId);
        } catch (error) {
          this.restoreErrors.set(t.page_id,error instanceof Error?error.message:String(error));
        }
      }
      for (const pageId of activateIds.values()) await this.activate(pageId).catch(() => {});
    } finally {
      this.restoring = false;
      this.deps.events.emit(EventTypes.PageUpdated, {});
      // Keep the original durable snapshot until all surfaces are restored.
      // Normal later tab mutations resume snapshotting.
    }
  }

  recoveryTabs() {
    return [...this.pendingRestore.values()].map(tab=>({pageId:tab.page_id,url:tab.url,title:tab.title,windowId:tab.window_id||"main",error:this.restoreErrors.get(tab.page_id),retrying:this.retryingRestore.has(tab.page_id)}));
  }

  async retryRestore(pageId:string) {
    if(this.restoring||this.retryingRestore.has(pageId))throw new AuxError("conflict","This session is already being restored.");
    this.retryingRestore.add(pageId);
    try {
      const page=await this.restoreSavedTab(pageId);
      this.saveTabsSnapshot();
      return {ok:true,pageId:page.pageId};
    } catch(error) {
      this.restoreErrors.set(pageId,error instanceof Error?error.message:String(error));
      throw error;
    } finally {
      this.retryingRestore.delete(pageId);
      this.deps.events.emit("browser.recovery.changed",{});
    }
  }

  private async restoreSavedTab(pageId:string):Promise<PageTarget> {
    const saved=this.pendingRestore.get(pageId);
    if(!saved)throw new AuxError("not_found","This tab has already been restored.");
    const existing=this.live.get(pageId);
    if(existing){this.pendingRestore.delete(pageId);this.restoreErrors.delete(pageId);return existing.target;}
    const previous=this.deps.repo.getPage(pageId);
    if(!previous||!this.driverFor("aux")?.recoverPage)throw new AuxError("backend_unavailable","The browser cannot restore this tab yet. Its saved address has been kept.");
    const page=await this.openOn("aux",{url:saved.url||"about:blank",windowId:saved.window_id||"main",background:false,ownedByRuntime:false,activate:false},"session-restore",previous);
    this.deps.repo.markDatasetsStale(page.pageId);
    this.pendingRestore.delete(pageId);this.restoreErrors.delete(pageId);
    return page;
  }

  private async refreshMeta(lp: LivePage) {
    if (!lp.driver?.isAttached()) return;
    try {
      const title = await lp.driver.title();
      const url = lp.driver.url();
      if (lp.target.navigationError || url.startsWith("chrome-error://")) return;
      lp.target.title = title;
      lp.target.url = url;
      this.persist(lp);
      this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, title: lp.target.title, url: lp.target.url });
      if (lp.target.url.startsWith("http")) this.deps.repo.addHistory(lp.target.url, lp.target.title, lp.target.pageId);
    } catch {
      /* target racing a navigation — next event fixes it */
    }
  }

  async close(pageId: string) {
    const lp = this.live.get(pageId);
    if (lp?.target.backend === "aux" && this.deps.native.available()) {
      const ack = await this.deps.native.tabCommand({ commandId: `agent-${newPageId()}`, windowId: lp.target.windowId ?? "main", command: { kind: "close", pageId } });
      // not_found/wrong_window mean the tab is already gone in main — converge
      // locally rather than keeping a driver attached to a dead view.
      if (ack.status === "rejected" && ack.error?.code !== "not_found" && ack.error?.code !== "wrong_window") return { ok: false };
      if (this.live.get(pageId) !== lp) return { ok: true };
    }
    if (lp && this.live.get(pageId) === lp) {
      lp.target.viewStatus = "detached";
      this.persist(lp);
      this.live.delete(pageId);
      await lp.driver?.dispose().catch(() => {});
    }
    const windowId = lp?.target.windowId ?? "main";
    const wasWindowActive = this.activeByWindow.get(windowId) === pageId;
    if (wasWindowActive) this.activeByWindow.delete(windowId);
    if (this.activeId === pageId) {
      this.activeId = null;
      // surface the next open page, if any
      const next = [...this.live.values()].find((x) =>
        (x.target.windowId ?? "main") === windowId &&
        (x.target.viewStatus === "visible" || x.target.backend === "aux"));
      if (next) void this.activate(next.target.pageId).catch(() => {});
      else this.deps.events.emit(EventTypes.PageUpdated, { pageId, activePageId: null });
    } else if (wasWindowActive) {
      const next = [...this.live.values()].find((x) => (x.target.windowId ?? "main") === windowId && x.target.pageId !== pageId);
      if (next) void this.activate(next.target.pageId).catch(() => {});
    }
    this.deps.events.emit(EventTypes.PageRemoved, { pageId });
    return { ok: true };
  }

  async moveToWindow(input: PageWindowMove, space: BrowserSpace): Promise<PageTarget> {
    return this.enqueue(input.pageId, async () => {
      const page = this.live.get(input.pageId);
      if (!page) throw new AuxError("not_found", "This tab no longer exists.");
      if (page.target.ownedByRuntime || page.target.controller === "agent" || page.target.controller === "external") {
        throw new AuxError("conflict", "Take control of this tab before moving it to another window.");
      }
      if (!this.deps.native.movePage) throw new AuxError("backend_unavailable", "Moving live tabs requires the Aux desktop browser.");
      const fromWindowId = page.target.windowId ?? "main";
      if (input.windowId === fromWindowId) return page.target;
      const moved = await this.deps.native.movePage(input.pageId, input.windowId, input.activate);
      page.target.windowId = moved.windowId;
      if (moved.sourceActivePageId) this.activeByWindow.set(fromWindowId, moved.sourceActivePageId);
      else this.activeByWindow.delete(fromWindowId);
      this.activeByWindow.set(moved.windowId, moved.activePageId ?? input.pageId);
      if (input.activate !== false) this.activeId = input.pageId;
      this.persist(page);
      this.deps.repo.setSetting(`tab-placement:${input.pageId}`, { spaceId: input.spaceId, folder: input.folder });
      this.deps.events.emit("page.moved", {
        page: page.target, fromWindowId, toWindowId: moved.windowId,
        sourceActivePageId: moved.sourceActivePageId, activePageId: moved.activePageId ?? input.pageId, activate: input.activate !== false, spaceId: input.spaceId, space, folder: input.folder,
      });
      return page.target;
    });
  }

  /** A native focus notification records selection without issuing another focus command. */
  onNativeWindowFocused(pageId: string, windowId: string) {
    const page = this.live.get(pageId);
    if (!page || (page.target.windowId ?? "main") !== windowId || page.target.ownedByRuntime) return;
    this.activeId = pageId;
    this.activeByWindow.set(windowId, pageId);
    page.target.lastActiveAt = Date.now();
    this.persist(page);
    this.deps.events.emit(EventTypes.PageUpdated, {pageId, activePageId: pageId, lastActiveAt: page.target.lastActiveAt});
  }

  async activate(pageId: string): Promise<PageTarget> {
    const lp = this.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    if (lp.target.backend === "aux" && this.deps.native.available()) {
      await this.deps.native.focusPage(pageId);
      if (lp.target.viewStatus !== "crashed") lp.target.viewStatus = "visible";
    }
    this.activeId = pageId;
    this.activeByWindow.set(lp.target.windowId ?? "main", pageId);
    lp.target.lastActiveAt = Date.now();
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { pageId, viewStatus: lp.target.viewStatus, activePageId: pageId });
    return lp.target;
  }

  async navigate(pageId: string, url: string): Promise<PageTarget> {
    return this.enqueue(pageId, async () => {
      const dp = this.driverPageLenient(pageId);
      await dp.navigate(url);
      const lp = this.live.get(pageId);
      if (!lp) throw new AuxError("target_detached", `page ${pageId} detached during navigation`);
      lp.target.url = url;
      this.persist(lp);
      return lp.target;
    });
  }

  /** Human navigation is allowed even while controller=human. */
  private driverPageLenient(pageId: string): DriverPage {
    const lp = this.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached())
      throw new AuxError("target_detached", `page ${pageId} is not attached`);
    return lp.driver;
  }

  async back(pageId: string) {
    return this.enqueue(pageId, async () => {
      await this.driverPageLenient(pageId).back();
      return this.get(pageId);
    });
  }
  async forward(pageId: string) {
    return this.enqueue(pageId, async () => {
      await this.driverPageLenient(pageId).forward();
      return this.get(pageId);
    });
  }
  async reload(pageId: string) {
    return this.enqueue(pageId, async () => {
      const lp = this.live.get(pageId);
      if (lp?.target.viewStatus === "crashed" && lp.target.backend === "aux" && this.deps.native.recoverPage) {
        const recovered = await this.deps.native.recoverPage(pageId, lp.target.url);
        if (!recovered.ok) throw new AuxError("target_detached", "The native tab is no longer available");
        const driver = this.driverFor("aux");
        if (!driver) throw new AuxError("backend_unavailable", "Browser connection is unavailable");
        await lp.driver?.dispose();
        try {
          lp.driver = await (driver.recoverPage ? driver.recoverPage(lp.target.targetId, pageId, lp.target.documentEpoch) : driver.attach(lp.target.targetId, pageId));
        } catch (error) {
          lp.target.viewStatus = "crashed";
          lp.target.error = "The page reloaded, but its browser connection could not be restored.";
          this.persist(lp);
          if (!this.restoring) this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
          throw error;
        }
        lp.lastObs = undefined;
        lp.lastObservationId = undefined;
        lp.history = [];
        this.wireDriverEvents(lp);
      } else {
        const driver = lp?.target.viewStatus === "crashed" && lp.driver ? lp.driver : this.driverPageLenient(pageId);
        await driver.reload();
      }
      return this.get(pageId);
    });
  }
  async stop(pageId: string) {
    return this.enqueue(pageId, async () => {
      // webContents.stop() halts the load without the renderer's event loop —
      // the only reliable stop when a page never finishes loading
      if (this.live.get(pageId)?.target.backend === "aux" && this.deps.native.available()) {
        await this.deps.native.stopPage(pageId).catch(() => {});
      }
      await this.driverPageLenient(pageId).stop();
      return this.get(pageId);
    });
  }

  private pickInFlight = new Set<string>();

  /**
   * Interactive element pick ("request edit") — the tab stays under human
   * control; a small overlay resolves on click, Escape, or timeout. The pick
   * is deliberately not enqueued: it must run while the user keeps clicking.
   */
  async pickElement(pageId: string, opts: { timeoutMs?: number } = {}): Promise<{ picked: boolean; element?: PickedElement }> {
    const lp = this.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached()) throw new AuxError("target_detached", `page ${pageId} is not attached`);
    if (lp.target.controller === "agent") throw new AuxError("conflict", "The agent is driving this page. Take it over before picking an element.");
    if (this.pickInFlight.has(pageId)) throw new AuxError("conflict", "An element pick is already waiting on this page.");
    const timeoutMs = Math.min(Math.max(opts.timeoutMs ?? ELEMENT_PICK_TIMEOUT_MS, 1_000), 120_000);
    this.pickInFlight.add(pageId);
    try {
      const expression = `(${pickElementInPage.toString()})(${timeoutMs})`;
      const result = await Promise.race([
        lp.driver.evaluate(expression) as Promise<PickedElement | null>,
        new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs + 5_000)),
      ]).catch(() => null);
      return result ? { picked: true, element: result } : { picked: false };
    } finally {
      this.pickInFlight.delete(pageId);
    }
  }

  // ---------- observation ----------

  async observe(pageId: string, req: ObserveReq): Promise<Observation> {
    return this.enqueue(pageId, async () => {
      const dp = this.driverPageLenient(pageId);
      const lp = this.live.get(pageId);
      // Observation cache (plan A6): one small probe decides whether the
      // last observation is still exact. Same epoch, same request shape,
      // same fingerprint — nothing the walk could see has changed, so the
      // renderer is not re-walked and nothing is re-persisted.
      let fingerprint: string | undefined;
      if (dp.observeFingerprint && lp) {
        fingerprint = await dp.observeFingerprint().catch(() => undefined);
        const hit = lp.lastObs;
        if (
          fingerprint &&
          hit &&
          hit.fingerprint === fingerprint &&
          hit.reqKey === observeReqKey(req) &&
          hit.obs.documentEpoch === lp.target.documentEpoch
        ) {
          this.deps.tracer?.incr("observe.cache_hit");
          return { ...hit.obs, observedAt: Date.now(), cached: true, changesSince: undefined, deltaFrom: undefined };
        }
      }
    const content = await dp.observe(req);
    if (lp && content.console?.length) {
      for (const line of content.console) {
        lp.consoleLines.push({ level: line.level, message: line.message, atMs: line.atMs ?? Date.now() });
      }
      if (lp.consoleLines.length > 200) lp.consoleLines.splice(0, lp.consoleLines.length - 200);
    }
    return this.recordObservation(pageId, content, req, fingerprint);
    });
  }

  /**
   * Stamp an `ObservationContent` with ids/revision/epoch, diff it against
   * the previous one, persist and announce it.
   */
  private recordObservation(pageId: string, content: ObservationContent, req: ObserveReq, fingerprint?: string): Observation {
    const lp = this.live.get(pageId);
    if (!lp) throw new AuxError("target_detached", `page ${pageId} detached during observation`);
    const revision = (this.revCounters.get(pageId) ?? lp.target.lastRevision) + 1;
    this.revCounters.set(pageId, revision);
    lp.target.lastRevision = revision;
    lp.target.url = content.url;
    lp.target.title = content.title;
    // `sinceRevision` picks the observation the caller last saw as the diff
    // base (falls back to the most recent one when it has aged out)
    const base =
      req.sinceRevision !== undefined ? (lp.history.find((h) => h.revision === req.sinceRevision) ?? lp.history.at(-1)) : lp.history.at(-1);
    const changesSince = this.diffObservations(base, content);
    const deltaFrom = lp.lastObservationId;
    const fields = new Map(content.formFields.map((f) => [f.label ?? f.name ?? f.ref ?? "?", f.value ?? ""]));
    lp.history.push({ revision, text: content.text, fields });
    if (lp.history.length > OBSERVATION_HISTORY) lp.history.splice(0, lp.history.length - OBSERVATION_HISTORY);
    const obs: Observation = {
      observationId: newObservationId(),
      pageId,
      documentEpoch: lp.target.documentEpoch,
      revision,
      observedAt: Date.now(),
      scope: req.scope ?? "full",
      content,
      changesSince: changesSince.length ? changesSince : undefined,
      deltaFrom: changesSince.length ? deltaFrom : undefined,
    };
    lp.lastObservationId = obs.observationId;
    lp.lastObs = fingerprint ? { fingerprint, reqKey: observeReqKey(req), obs } : undefined;
    this.deps.repo.saveObservation({
      observationId: obs.observationId,
      pageId,
      epoch: obs.documentEpoch,
      revision,
      observedAt: obs.observedAt,
      scope: obs.scope,
      json: JSON.stringify(obs),
    });
    this.persist(lp);
    this.deps.events.emit(EventTypes.Observation, {
      pageId,
      revision,
      epoch: obs.documentEpoch,
      approxTokens: content.stats.approxTokens,
    });
    return obs;
  }

  private diffObservations(base: { text: string; fields: Map<string, string> } | undefined, next: ObservationContent): string[] {
    const changes: string[] = [];
    if (!base) return changes;
    if (base.text !== next.text) {
      const a = base.text.split("\n").filter(Boolean);
      const b = next.text.split("\n").filter(Boolean);
      const added = b.filter((l) => !a.includes(l)).slice(0, 5);
      const removed = a.filter((l) => !b.includes(l)).slice(0, 5);
      for (const l of added) changes.push(`+ ${l.slice(0, 120)}`);
      for (const l of removed) changes.push(`- ${l.slice(0, 120)}`);
      if (!added.length && !removed.length) changes.push("page text changed");
    }
    {
      for (const f of next.formFields) {
        const key = f.label ?? f.name ?? f.ref ?? "?";
        const prev = base.fields.get(key);
        const cur = f.value ?? "";
        if (prev !== undefined && prev !== cur) changes.push(`${key}: "${prev}" -> "${cur}"`);
      }
    }
    return changes;
  }

  /** Structured fields from the current observation, plus CSS extract specs. */
  async extract(
    pageId: string,
    fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }>,
  ): Promise<{ pageId: string; documentEpoch: number; revision: number; fields: Record<string, unknown> }> {
    const obs = await this.observe(pageId, {});
    const { picked, css } = pickExtractFields(obs.content, fields);
    if (css.length) {
      const extra = await this.driverPageLenient(pageId).extract(css);
      Object.assign(picked, extra);
    }
    return { pageId, documentEpoch: obs.documentEpoch, revision: obs.revision, fields: picked };
  }

  /** Wait until a condition holds — one `waitFor` program step. */
  async waitFor(pageId: string, condition: Condition): Promise<{
    ok: boolean;
    timedOut: boolean;
    detail?: string;
    status?: string;
  }> {
    const result = await this.execute({
      pageId,
      steps: [{ id: newStepId(), op: "waitFor", condition }],
    });
    const step = result.steps[0];
    return {
      ok: result.status === "completed",
      timedOut: step?.error?.code === "condition_timeout",
      detail: step?.detail ?? step?.error?.message,
      status: result.status,
    };
  }

  /** Page console lines (driver buffer, observe payload, and event log). */
  async console(
    pageId: string,
    opts?: { since?: number; limit?: number },
  ): Promise<{ lines: { level: string; message: string; atMs?: number }[] }> {
    const lp = this.live.get(pageId);
    const dp = this.driverPageLenient(pageId);
    let lines = lp?.consoleLines.slice() ?? [];
    if (dp.console) {
      const fromDriver = await dp.console();
      if (fromDriver.length) lines = mergeConsoleLines(lines, fromDriver);
    } else if (!lines.length) {
      const obs = await this.observe(pageId, {});
      if (obs.content.console?.length) lines = mergeConsoleLines(lines, obs.content.console);
    }
    if (opts?.since !== undefined) lines = lines.filter((l) => (l.atMs ?? 0) >= opts.since!);
    if (opts?.limit !== undefined) lines = lines.slice(-opts.limit);
    return { lines };
  }

  /** List or accept/dismiss the current dialog. */
  async dialog(
    pageId: string,
    action: "list" | "accept" | "dismiss" = "list",
    promptText?: string,
  ): Promise<{
    ok?: boolean;
    action?: "list" | "accept" | "dismiss";
    dialogs?: { type: string; message: string }[];
    pending?: { type: string; message: string } | null;
  }> {
    const lp = this.live.get(pageId);
    if (action === "list") {
      const obs = await this.observe(pageId, {});
      const dialogs = obs.content.dialogs.length ? obs.content.dialogs : (lp?.lastDialog ? [lp.lastDialog] : []);
      return { action: "list", dialogs, pending: lp?.lastDialog ?? dialogs[0] ?? null };
    }
    const result = await this.execute({
      pageId,
      steps: [{ id: newStepId(), op: "dialog", action, promptText }],
    });
    if (lp) lp.lastDialog = undefined;
    return { ok: result.status === "completed", action, pending: null };
  }

  /** Captured HTTP responses for the page (same store as `responses.list`). */
  async network(
    pageId: string,
    opts?: { since?: number; urlIncludes?: string; limit?: number },
  ): Promise<unknown[]> {
    this.get(pageId);
    if (!this.deps.responses) return [];
    await this.deps.responses.flush();
    return this.deps.responses.list(pageId, opts);
  }

  // ---------- execution ----------

  /**
   * Run a program. `opts.returnObservation` observes the page after the
   * program in a follow-up observe on the same lane.
   */
  async execute(program: Program, ctx: ExecContext = {}, opts: { returnObservation?: ObserveReq } = {}): Promise<ExecuteResult> {
    const pageId = program.pageId;
    return this.withKeys(program.conflicts, () =>
      this.enqueue(pageId, async () => {
      const lp = this.live.get(pageId);
      if (!lp?.driver?.isAttached()) throw new AuxError("target_detached", `page ${pageId} is not attached`);
      if (lp.target.controller === "human")
        throw new AuxError("conflict", `page ${pageId} is under human control`);
      const allSteps = collectSteps(program);
      const grants = ctx.runId
        ? (this.deps.grantsForRun ?? this.deps.grants ?? DEFAULT_GRANTS)
        : (this.deps.grants ?? DEFAULT_GRANTS);
      let origin = "";
      try {
        origin = lp.target.url ? new URL(lp.target.url).origin : "";
      } catch {
        origin = "";
      }
      const auth = authorizeProgram(allSteps, grants, origin);
      if (!auth.ok) throw new AuxError("permission_denied", auth.denied);
      const run = ctx.runId ? this.deps.repo.getRun(ctx.runId) : undefined;
      const journal = ctx.journaled ? { skip: false as const, intentId: undefined as string | undefined } : beginConsequentialWrite(this.deps.durableWrites, {
        runId: ctx.runId ?? `direct:${pageId}`,
        pageId,
        documentEpoch: lp.target.documentEpoch ?? 0,
        revision: lp.target.lastRevision,
        steps: allSteps,
        taskId: ctx.taskId ?? run?.config?.taskId,
        taskRevision: run?.config?.taskRevision,
      });
      if (journal.skip) throw new AuxError("conflict", journal.reason!);
      ctx = { ...ctx, journaled: true };
      this.programInflight.add(pageId);
      try {
      lp.target.controller = ctx.runId ? "agent" : lp.target.controller === "none" ? "external" : lp.target.controller;
      // controller/epoch changes are persisted once, after the program (speed P2-1)
      // pointer/keyboard input only lands on a visible, laid-out native view —
      // mark the page working (rendered offscreen unless focused) while a
      // program with interactive steps runs; no global lease (plan A8)
      const needsStage =
        lp.target.backend === "aux" &&
        this.deps.native.available() &&
        allSteps.some((s) => INTERACTIVE_OPS.has(s.op));
      if (needsStage) await this.deps.native.acquireStage(pageId).catch(() => ({ ok: false }));
      // takeover epoch: a human claiming the page mid-run must abort in-flight
      // programs rather than fight for the input lane
      const expectedEpoch = lp.target.controllerEpoch;
      const span = this.deps.tracer?.start("program.execute", {
        runId: ctx.runId,
        pageId,
        attrs: { steps: allSteps.length, nodes: program.nodes?.length, backend: lp.target.backend },
      });
      // §6.2 — proposed vs dispatched vs completed vs verified
      this.deps.tracer?.incr("actions.proposed", allSteps.length);
      // step rows are collected here and written in ONE transaction when the
      // program ends instead of an autocommit per step (speed P2-1)
      const stepRecords: StepRecord[] = [];
      const flushSteps = () => {
        if (!stepRecords.length || !this.deps.recordStep) return;
        const rows = stepRecords.splice(0);
        try {
          this.deps.repo.transaction(() => {
            for (const r of rows) this.deps.recordStep!(r);
          });
        } catch {
          /* the step ledger is observational — never fail the program for it */
        }
      };
      let result: ProgramResult & { observation?: ObservationContent };
      let observation: Observation | undefined;
      try {
        const execCtx: ExecContext = {
          ...ctx,
          // after the spread: an explicit `allowEval: undefined` from a caller
          // must not re-enable page JS / new Function for untrusted programs
          allowEval: ctx.allowEval ?? false,
          pageOrigin: origin,
          taskId: ctx.taskId ?? (ctx.runId ? this.deps.repo.getRun(ctx.runId)?.config?.taskId : undefined),
          resolveCredential: ctx.resolveCredential ?? (this.deps.vault
            ? (ref, info) => {
                const runConfig = ctx.runId ? this.deps.repo.getRun(ctx.runId)?.config : undefined;
                return this.deps.vault!.revealForFill(ref, {
                  ...info,
                  origin: info.origin || origin,
                  taskId: info.taskId ?? ctx.taskId ?? runConfig?.taskId,
                  accountLabels: runConfig?.accountLabels,
                });
              }
            : undefined),
          observe: (req) => this.observe(pageId, req).then((o) => o.content),
          onEmit: (label, value) =>
            this.deps.events.emit("page.emitted", { pageId, runId: ctx.runId, label, value }),
          callOperation: ctx.callOperation ??
            (this.deps.callOperation ? (n, a) => this.deps.callOperation!(n, a, pageId) : undefined),
          checkValid: () => {
            if (lp.target.controllerEpoch !== expectedEpoch)
              throw new AuxError("conflict", `page ${pageId} changed controller mid-run (takeover)`);
          },
          checkpoint: ctx.checkpoint ?? ((name, env) => this.deps.repo.saveCheckpoint(pageId, name, env)),
          loadCheckpoint: ctx.loadCheckpoint ?? ((name) => this.deps.repo.loadCheckpoint(pageId, name)),
          onArtifact: ctx.onArtifact ?? ((label, buffer, mediaType) =>
            this.deps.artifacts?.save({ runId: ctx.runId, pageId, label, buffer, mediaType }).artifactId),
          onStep: (outcome, step) => {
            const t = this.deps.tracer;
            t?.incr("actions.dispatched");
            t?.incr(`actions.${outcome.status === "ok" ? "completed" : outcome.status}`);
            if (outcome.status === "ok" && VERIFY_OPS.has(step.op)) t?.incr("actions.verified");
            stepRecords.push({
              stepId: newStepId(),
              runId: ctx.runId ?? "",
              pageId,
              op: step.op,
              inputs: stepInputsOf(step),
              startedAt: outcome.startedAt,
              outcome,
            });
            ctx.onStep?.(outcome, step);
          },
        };
        result = await executeProgram(lp.driver, program, execCtx);
        if (
          result.status === "failed" &&
          result.steps.some((s) => s.error?.code === "conflict" && (s.error.message.includes("takeover") || s.error.message.includes("controller")))
        ) {
          for (const s of result.steps) {
            if (s.status === "ok") {
              s.effect = "uncertain";
              s.receipt = {
                observed: s.detail,
                remoteConfirmed: false,
                uncertain: true,
                dispatchedBeforeTakeover: true,
              };
            }
          }
        }
        if (result.observation) {
          observation = this.recordObservation(pageId, result.observation, opts.returnObservation ?? {});
          delete result.observation;
        } else if (opts.returnObservation) {
          // A page that detached mid-program still returns the program
          // result — the observation is best-effort.
          observation = await this.observe(pageId, opts.returnObservation).catch(() => undefined);
        }
      } catch (e) {
        flushSteps();
        settleWrite(this.deps.durableWrites, journal.intentId, false);
        if (!ctx.runId && (lp.target.controller === "agent" || lp.target.controller === "external")) {
          lp.target.controller = "none";
        }
        this.persist(lp);
        this.deps.tracer?.incr("program.error");
        span?.end("failed", { error: e instanceof Error ? e.message : String(e) });
        throw e;
      } finally {
        if (needsStage) await this.deps.native.releaseStage(pageId).catch(() => {});
      }
      settleWrite(this.deps.durableWrites, journal.intentId, result.status === "completed");
      flushSteps();
      if (!ctx.runId && (lp.target.controller === "agent" || lp.target.controller === "external")) {
        lp.target.controller = "none";
      }
      this.persist(lp); // single persist per program; documentEpoch already advanced via onNavigated events
      this.deps.tracer?.incr(`program.${result.status}`);
      span?.end(result.status === "completed" ? "ok" : result.status === "cancelled" ? "cancelled" : "failed", {
        status: result.status,
        steps: result.steps.length,
      });
      const { observation: _inline, ...programResult } = result;
      return observation ? { ...programResult, observation } : programResult;
      } finally {
        this.programInflight.delete(pageId);
      }
      }),
    );
  }

  // ---------- find / zoom / capture ----------

  async find(pageId: string, text: string, forward: boolean, findNext: boolean) {
    if (!this.deps.native.available()) throw new AuxError("backend_unavailable", "find requires the desktop shell");
    return this.deps.native.findInPage(pageId, text, forward, findNext);
  }
  async stopFind(pageId: string, action: "clear" | "keep") {
    if (!this.deps.native.available()) return { ok: true };
    return this.deps.native.stopFind(pageId, action);
  }
  async zoom(pageId: string, level?: number, delta?: number, reset?: boolean, direction?: "in" | "out") {
    if (!this.deps.native.available()) throw new AuxError("backend_unavailable", "zoom requires the desktop shell");
    return this.deps.native.setZoom(pageId, level, delta, reset, direction);
  }
  async capture(pageId: string, opts?: { fullPage?: boolean; format?: "dataUrl" | "artifact"; expectedDocumentEpoch?: number }) {
    const dp = this.driverPageLenient(pageId);
    const before = this.get(pageId);
    const epoch = before.documentEpoch;
    const url = dp.url();
    if (opts?.expectedDocumentEpoch !== undefined && opts.expectedDocumentEpoch !== epoch)
      throw new AuxError("conflict", "The page changed before capture. Capture it again.");
    const shot = before.backend === "aux" && this.deps.native.available() && !opts?.fullPage
      ? await this.deps.native.capturePage(pageId, 1).then(image => ({
        buffer: Buffer.from(image.dataUrl.split(",")[1] ?? "", "base64"),
        width: image.width, height: image.height, scale: image.scale,
      }))
      : await dp.screenshot({ fullPage: opts?.fullPage });
    const after = this.get(pageId);
    if (after.documentEpoch !== epoch || dp.url() !== url || !dp.isAttached())
      throw new AuxError("conflict", "The page changed during capture. Capture it again.");
    if (!shot.buffer.length || shot.width <= 0 || shot.height <= 0)
      throw new AuxError("backend_unavailable", "The page has no image available yet. Open the tab and try again.");
    if (opts?.format === "artifact") {
      const a = this.deps.artifacts?.save({ pageId, label: "capture", buffer: shot.buffer, mediaType: "image/png" });
      return { artifactId: a?.artifactId, width: shot.width, height: shot.height, scale: shot.scale };
    }
    return {
      dataUrl: `data:image/png;base64,${shot.buffer.toString("base64")}`,
      width: shot.width,
      height: shot.height,
      scale: shot.scale,
    };
  }

  // ---------- takeover ----------

  /** Human takeover — flips the local controller so in-process execute is blocked. */
  async takeover(pageId: string): Promise<PageTarget> {
    const lp = this.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    lp.target.controller = "human";
    lp.target.controllerEpoch++;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "human", controllerEpoch: lp.target.controllerEpoch });
    return lp.target;
  }

  /** Release human takeover. */
  async resume(pageId: string): Promise<PageTarget> {
    const lp = this.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    lp.target.controller = "none";
    lp.target.controllerEpoch++;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "none" });
    return lp.target;
  }

  /** main -> runtime: user interacted with a native view directly. */
  onNativeTakeover(pageId: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    if (this.programInflight.has(pageId)) return;
    // Only agent/external-controlled pages hand control to the human —
    // ordinary browsing must not pin the page as human-owned forever.
    if (lp.target.controller === "agent" || lp.target.controller === "external") {
      void this.takeover(pageId);
    }
  }

  /** Run finished — drop agent control if the human did not take the page. */
  releaseAgent(pageId: string) {
    const lp = this.live.get(pageId);
    if (!lp || lp.target.controller !== "agent") return;
    lp.target.controller = "none";
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "none" });
  }

  onNativeNavigated(pageId: string, url: string) {
    if (url.startsWith("chrome-error://")) return;
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.url = url;
    lp.target.documentEpoch++;
    if (lp.target.viewStatus === "crashed") lp.target.viewStatus = lp.target.ownedByRuntime ? "background" : this.activeByWindow.get(lp.target.windowId ?? "main") === pageId ? "visible" : "hidden";
    lp.target.error = undefined;
    lp.target.navigationError = null;
    this.persist(lp);
    if (!this.restoring) this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
    void this.refreshMeta(lp);
  }

  onNativeNavigationError(pageId: string, error: { url: string; code: number; message: string } | null) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.navigationError = error;
    if (error) { lp.target.url = error.url; lp.target.title = "Page couldn’t load"; lp.target.loading = false; }
    this.persist(lp);
    if (!this.restoring) this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
  }

  onNativeCrashed(pageId: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.viewStatus = "crashed";
    lp.target.error = "The renderer process crashed.";
    lp.target.loading = false;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageCrashed, { pageId });
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
      if (this.activeByWindow.get(w.windowId) === w.activePageId) continue;
      if (w.activePageId) {
        const displaced = this.activeByWindow.get(w.windowId);
        // The window op is activation truth — record the displaced tab as the
        // close-return target even for a page that dies before registering.
        if (displaced && displaced !== w.activePageId) this.returnTargets.set(w.activePageId, displaced);
        this.activeByWindow.set(w.windowId, w.activePageId);
        this.lastKnownWindow.set(w.activePageId, w.windowId);
      }
      else this.activeByWindow.delete(w.windowId);
      const lp = w.activePageId ? this.live.get(w.activePageId) : undefined;
      if (lp) {
        // The window op is the truth for activation — the global pointer
        // follows the most recently activated tab main reports.
        this.activeId = lp.target.pageId;
        lp.target.lastActiveAt = Date.now();
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, activePageId: lp.target.pageId, lastActiveAt: lp.target.lastActiveAt });
      } else if (!w.activePageId) {
        const active = this.activeId ? this.live.get(this.activeId) : undefined;
        if (active && (active.target.windowId ?? "main") === w.windowId) this.activeId = null;
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
        this.lastKnownWindow.set(tab.pageId, tab.windowId);
        const lp = this.live.get(tab.pageId);
        if (lp) {
          // The catalog owns window placement; the driver and view.* events
          // own the per-page fields the runtime reports.
          if ((lp.target.windowId ?? "main") !== tab.windowId) {
            lp.target.windowId = tab.windowId;
            this.persist(lp);
            this.deps.events.emit(EventTypes.PageUpdated, { pageId: tab.pageId, windowId: tab.windowId });
          }
          return;
        }
        // Pages the runtime itself created echo back through the catalog —
        // skip them. Human/external surfaces register so agent ops can
        // attach on the stable marker.
        if (op.origin === "runtime" || this.pendingExternal.has(tab.pageId) || this.closing) return;
        const active = this.activeByWindow.get(tab.windowId) === tab.pageId;
        await this.registerExternal({
          pageId: tab.pageId,
          windowId: tab.windowId,
          marker: `atab-${tab.pageId}`,
          url: tab.url,
          title: tab.title,
          backend: "aux",
          active,
        });
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
  onNativeRemoved(pageId: string, chooseSuccessor = true) {
    const pending = this.pendingExternal.get(pageId);
    if (pending) pending.removed = true;
    if (!chooseSuccessor) {
      // Called from syncCatalogOp — already serialized on the catalog queue.
      this.applyNativeRemoved(pageId, false);
      return;
    }
    const run = this.catalogQueue.then(() => this.applyNativeRemoved(pageId, true));
    this.catalogQueue = run.catch(() => {});
  }

  private applyNativeRemoved(pageId: string, chooseSuccessor: boolean) {
    const lp = this.live.get(pageId);
    if (lp) {
      if (lp.target.viewStatus !== "crashed") lp.target.viewStatus = "detached";
      lp.target.controller = "none";
      this.persist(lp);
      this.live.delete(pageId);
      void lp.driver?.dispose().catch(() => {});
    }
    const returnTarget = this.returnTargets.get(pageId);
    this.returnTargets.delete(pageId);
    for (const [child, parent] of this.returnTargets) if (parent === pageId) this.returnTargets.delete(child);
    // A popup that dies before its attach completes never lands in `live`,
    // but a window op may still have made it the window's active tab —
    // the stale pointer must be cleared and a successor chosen either way.
    const windowId = lp?.target.windowId ?? this.lastKnownWindow.get(pageId) ?? "main";
    this.lastKnownWindow.delete(pageId);
    if (!this.closing) {
      let next: LivePage | undefined;
      const wasWindowActive = this.activeByWindow.get(windowId) === pageId;
      if (wasWindowActive) this.activeByWindow.delete(windowId);
      const wasActive = this.activeId === pageId;
      if (wasActive) this.activeId = null;
      // Catalog-originated removes arrive alongside a window op carrying
      // main's chosen successor — picking our own would double-focus.
      if (chooseSuccessor && (wasActive || wasWindowActive)) {
        this.activeId = null;
        const returned = returnTarget ? this.live.get(returnTarget) : undefined;
        const preferred = returned && (returned.target.windowId ?? "main") === windowId ? returned : undefined;
        const candidates = [...this.live.values()].filter(page =>
          page.target.viewStatus !== "detached" && (page.target.windowId ?? "main") === windowId);
        next = preferred ?? candidates
          .filter(page => page.target.viewStatus === "visible")
          .sort((a, b) => b.target.lastActiveAt - a.target.lastActiveAt)[0] ?? candidates
          .sort((a, b) => b.target.lastActiveAt - a.target.lastActiveAt)[0];
      }
      if (lp || next) this.deps.events.emit(EventTypes.PageRemoved, { pageId, ...(next ? { activePageId: next.target.pageId } : {}) });
      if (next) void this.activate(next.target.pageId).catch(() => {});
    }
  }

  onNativeTitle(pageId: string, title: string) {
    const lp = this.live.get(pageId);
    if (!lp || lp.target.navigationError) return;
    lp.target.title = title;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { pageId, title });
  }

  onNativeFavicon(pageId: string, favicon: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.favicon = favicon || undefined;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { pageId, favicon });
  }

  onNativeNavState(pageId: string, canGoBack: boolean, canGoForward: boolean) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.canGoBack = canGoBack;
    lp.target.canGoForward = canGoForward;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { pageId, canGoBack, canGoForward });
  }

  onNativeLoading(pageId: string, loading: boolean) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.loading = loading && !lp.target.navigationError && lp.target.viewStatus !== "crashed";
    this.deps.events.emit(EventTypes.PageLoading, { pageId, loading: lp.target.loading });
  }

  /** main -> runtime: a profile-session download began (authoritative record). */
  onNativeDownloadStarted(
    pageId: string | undefined,
    info: { id: string; sourceUrl?: string; filename: string; path: string; size: number; totalBytes?: number; startedAt: number },
  ) {
    this.deps.repo.saveDownload({ ...info, pageId, state: "started" });
    this.deps.events.emit(EventTypes.DownloadStarted, { pageId, ...info, state: "started" });
  }

  onNativeDownload(
    pageId: string | undefined,
    info: { id: string; sourceUrl?: string; filename: string; path: string; state: string; size: number; totalBytes?: number; startedAt: number; endedAt?: number },
  ) {
    this.deps.repo.saveDownload({ ...info, pageId });
    const lp = pageId ? this.live.get(pageId) : undefined;
    if (lp?.driver && info.state === "completed") {
      (lp.driver as { notifyDownload?: (i: { suggestedFilename: string; path?: string }) => void }).notifyDownload?.({
        suggestedFilename: info.filename,
        path: info.path,
      });
    }
    this.deps.events.emit(EventTypes.DownloadFinished, { pageId, ...info });
  }

  isAttached(pageId: string): boolean {
    return this.live.get(pageId)?.driver?.isAttached() ?? false;
  }

  livePageIds(): string[] {
    return [...this.live.keys()];
  }
}

const EXTRACT_KEYS = new Set([
  "url",
  "title",
  "text",
  "headings",
  "elements",
  "formFields",
  "tables",
  "links",
  "dialogs",
  "console",
  "viewport",
  "scroll",
  "frames",
]);

function pickExtractFields(
  content: ObservationContent,
  fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }>,
): {
  picked: Record<string, unknown>;
  css: { name: string; selector?: string; attribute?: string; all?: boolean }[];
} {
  const picked: Record<string, unknown> = {};
  const css: { name: string; selector?: string; attribute?: string; all?: boolean }[] = [];
  if (!fields?.length) {
    picked.url = content.url;
    picked.title = content.title;
    picked.text = content.text;
    picked.headings = content.headings;
    picked.formFields = content.formFields;
    picked.tables = content.tables;
    picked.links = content.links;
    picked.dialogs = content.dialogs;
    return { picked, css };
  }
  for (const field of fields) {
    if (typeof field !== "string") {
      if (field.selector) css.push(field);
      else {
        const value = valueForExtractName(content, field.name);
        if (value !== undefined) picked[field.name] = value;
        else css.push(field);
      }
      continue;
    }
    picked[field] = valueForExtractName(content, field) ?? null;
  }
  return { picked, css };
}

function valueForExtractName(content: ObservationContent, name: string): unknown {
  if (EXTRACT_KEYS.has(name)) return content[name as keyof ObservationContent];
  const el = content.elements.find((e) => e.ref === name || e.name === name);
  if (el) return el;
  const form = content.formFields.find((f) => f.ref === name || f.label === name || f.name === name);
  if (form) return form;
  const link = content.links.find((l) => l.ref === name || l.text === name);
  if (link) return link;
  return undefined;
}

function mergeConsoleLines(
  a: { level: string; message: string; atMs?: number }[],
  b: { level: string; message: string; atMs?: number }[],
): { level: string; message: string; atMs?: number }[] {
  const seen = new Set(a.map((l) => `${l.level}|${l.message}|${l.atMs ?? 0}`));
  const out = a.slice();
  for (const line of b) {
    const key = `${line.level}|${line.message}|${line.atMs ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function stepInputsOf(s: { op: string } & Record<string, unknown>): Record<string, unknown> {
  const { id, op, timeoutMs, optional, expect, ...rest } = s;
  if (op === "fillCredential") return { target: rest.target, credentialRef: rest.credentialRef };
  return rest;
}

/** Every browser step inside a program — flat or nested in control flow. */
function collectSteps(program: Program): Step[] {
  const out: Step[] = [...(program.steps ?? [])];
  const walk = (nodes: readonly ProgramNode[]) => {
    for (const n of nodes) {
      if (n.kind === "step") out.push(n.step);
      else if (n.kind === "if") {
        walk(n.then);
        if (n.else) walk(n.else);
      } else if (n.kind === "forEach" || n.kind === "until") walk(n.body);
    }
  };
  if (program.nodes) walk(program.nodes);
  return out;
}
