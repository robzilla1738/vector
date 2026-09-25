import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import { AuxError, type AuxErrorCode, type Backend, EventTypes, type PageTarget, newPageId } from "@aux/contracts";
import type { ActivationPolicy } from "./activation.js";
import type { PageRegistry } from "./registry.js";

export class PageOpener {
  constructor(private pages: PageRegistry, private activation: ActivationPolicy) {}

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
  ): Promise<{ targetId: string; nativeCreated: boolean; cdpTargetId?: string }> {
    if (backend === "aux") {
      const marker = `atab-${pageId}`;
      if (this.pages.deps.native.available()) {
        // Scoped tab commands (§7.3): agent opens go through the same main-owned
        // controller as human opens — deduplicated, ack'd, catalog-published.
        const ack = await this.pages.deps.native.tabCommand({
          commandId: `agent-${newPageId()}`,
          windowId: windowId ?? "main",
          command: { kind: "open", pageId, url: initialUrl, background, activate: !background, runtimeOwned: ownedByRuntime },
        });
        if (ack.status === "rejected") throw new AuxError((ack.error?.code ?? "unavailable") as AuxErrorCode, ack.error?.message ?? "The tab could not be opened.");
        return { targetId: marker, nativeCreated: true, cdpTargetId: ack.targetId };
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

  async openOn(
    backend: Backend,
    opts: { url: string; windowId?: string; background: boolean; ownedByRuntime: boolean; activate?: boolean; targetId?: string },
    routeReason: string,
    restored?: PageTarget,
  ): Promise<PageTarget> {
    const driver = this.pages.driverFor(backend);
    // a dropped socket is recovered lazily here rather than failing every
    // open until restart; a backend that is truly gone still fails below
    if (driver && !driver.isConnected() && driver.reconnect) await driver.reconnect().catch(() => {});
    if (!driver?.isConnected())
      throw new AuxError("backend_unavailable", `${backend} backend is not connected`);

    const pageId = restored?.pageId ?? newPageId();
    let targetId: string;
    let nativeCreated = false;
    let cdpTargetId: string | undefined;
    // Open on about:blank, then navigate AFTER response listeners are wired —
    // otherwise the page's own first load escapes passive capture.
    const initialUrl = opts.targetId ? opts.url : "about:blank";
    if (opts.targetId && backend === "chrome") {
      targetId = opts.targetId;
    } else {
      ({ targetId, nativeCreated, cdpTargetId } = await this.createSurface(backend, driver, pageId, initialUrl, opts.background, opts.windowId,opts.ownedByRuntime));
    }

    let dp: DriverPage;
    try {
      dp = restored && driver.recoverPage
        ? await driver.recoverPage(targetId, pageId, restored.documentEpoch + 1)
        : await driver.attach(targetId, pageId, cdpTargetId ? { cdpTargetId } : undefined);
    } catch (e) {
      // the shell view already exists — destroy it rather than leaking a
      // driverless zombie tab in the strip
      if (nativeCreated) await this.pages.deps.native.tabCommand({ commandId: `agent-${newPageId()}`, windowId: opts.windowId ?? "main", command: { kind: "close", pageId } }).catch(() => {});
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
    const lp = this.pages.addLive(target, dp);
    if (!this.pages.restoring) this.pages.deps.events.emit(EventTypes.PageAdded, { page: target });
    this.pages.deps.tracer?.incr(`router.open.${backend}`);
    // Select the requested foreground tab before loading. A slow response must
    // not steal focus later or leave commands targeting the previous tab.
    if (opts.activate ?? !opts.background) await this.activation.activate(pageId).catch(() => {});
    // the real navigation happens with listeners attached — captured like
    // any later navigation (metadata + bodies)
    if (dp && opts.url !== initialUrl) {
      const navigation = lp.driver!.navigate(opts.url).catch(() => {});
      if (!restored) await navigation;
    }
    void this.pages.refreshMeta(lp);
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
    cdpTargetId?: string;
    restored?: PageTarget;
  }): Promise<PageTarget> {
    const pageId = opts.pageId ?? newPageId();
    const existing = this.pages.live.get(pageId);
    if (existing) return existing.target;
    const inFlight = this.pages.pendingExternal.get(pageId);
    if (inFlight?.done) return inFlight.done;
    const pending: { removed: boolean; done?: Promise<PageTarget> } = { removed: false };
    // Native catalog notifications can attach a saved page before the
    // explicit session-restore pass. Read its prior epoch here as well so
    // either arrival order invalidates refs from the previous process.
    const previous = opts.restored ?? this.pages.deps.repo.getPage(pageId);
    pending.done = this.attachExternal({ ...opts, restored: previous?.backend === opts.backend ? previous : undefined }, pageId, pending);
    this.pages.pendingExternal.set(pageId, pending);
    try {
      return await pending.done;
    } finally {
      this.pages.pendingExternal.delete(pageId);
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
    cdpTargetId?: string;
    restored?: PageTarget;
  }, pageId: string, pending: { removed: boolean }): Promise<PageTarget> {
    const driver = this.pages.driverFor(opts.backend);
    const dp = driver ? await driver.attach(opts.marker, pageId, {
      cdpTargetId: opts.cdpTargetId,
      initialDocumentEpoch: opts.restored ? opts.restored.documentEpoch + 1 : undefined,
    }) : null;
    if (pending.removed || this.pages.closing) {
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
    const lp = this.pages.addLive(target, dp);
    if (opts.active) {
      const previous = this.pages.activeByWindow.get(target.windowId ?? "main");
      if (previous && previous !== pageId) this.pages.returnTargets.set(pageId, previous);
      this.pages.activeId = pageId;
      this.pages.activeByWindow.set(target.windowId ?? "main", pageId);
    }
    this.pages.deps.events.emit(EventTypes.PageAdded, { page: target });
    void this.pages.refreshMeta(lp);
    return target;
  }
}
