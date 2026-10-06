import { randomUUID } from "node:crypto";
import { navigateNativePage } from "./navigation.js";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import {
  AuxError,
  AgentPageCreatedSchema,
  type AgentPageCreate,
  type AgentPageCreated,
  type AuxErrorCode,
  type Backend,
  EventTypes,
  type PageTarget,
  newPageId,
} from "@aux/contracts";
import { runAncestry } from "../run-lineage.js";
import type { ActivationPolicy } from "./activation.js";
import type { PageRegistry } from "./registry.js";

export class PageOpener {
  constructor(
    private pages: PageRegistry,
    private activation: ActivationPolicy,
  ) {}

  /** Open a page. An omitted backend selects embedded Chromium (`aux`). */
  async open(opts: {
    url: string;
    windowId?: string;
    backend?: Backend;
    background: boolean;
    ownedByRuntime: boolean;
    activate?: boolean;
    targetId?: string; // chrome: attach an existing tab by CDP id
    /** Internal authority hook; never supplied by renderer/RPC parameters. */
    beforeNavigate?: (target: PageTarget) => Promise<void>;
    agentScope?: Omit<AgentPageCreate, "windowId" | "background">;
    /** Original caller lifecycle cancellation; never renderer/RPC parameters. */
    signal?: AbortSignal;
  }): Promise<PageTarget> {
    const backend = opts.backend ?? "aux";
    return this.openOn(backend, opts, opts.backend ? `explicit-backend:${opts.backend}` : "chromium-default");
  }

  /** Create the backend surface for a page and return its target id. */
  private async createSurface(
    backend: Backend,
    driver: BrowserDriver | null,
    pageId: string,
    initialUrl: string,
    background: boolean,
    windowId?: string,
    ownedByRuntime = false,
  ): Promise<{ targetId: string; nativeCreated: boolean; cdpTargetId?: string; windowId?: string }> {
    if (backend === "aux") {
      const marker = `atab-${pageId}`;
      if (this.pages.deps.native.available()) {
        // Scoped tab commands (§7.3): agent opens go through the same main-owned
        // controller as human opens — deduplicated, ack'd, catalog-published.
        const ack = await this.pages.deps.native.tabCommand({
          commandId: `agent-${newPageId()}`,
          windowId: windowId ?? "main",
          command: {
            kind: "open",
            pageId,
            url: initialUrl,
            background,
            activate: !background,
            runtimeOwned: ownedByRuntime,
          },
        });
        if (ack.status === "rejected") {
          const raw = ack.error?.code;
          const code: AuxErrorCode =
            raw === "forbidden"
              ? "permission_denied"
              : raw === "stale_tab"
                ? "conflict"
                : raw === "invalid_params" || raw === "not_found" || raw === "backend_unavailable"
                  ? raw
                  : "backend_unavailable";
          throw new AuxError(code, ack.error?.message ?? "The tab could not be opened.");
        }
        return { targetId: marker, nativeCreated: true, cdpTargetId: ack.targetId, windowId: ack.windowId };
      }
      if (driver?.createTarget) {
        // standalone mode: the driver owns the surface (headless chrome page)
        return { targetId: await driver.createTarget(initialUrl), nativeCreated: false };
      }
      throw new AuxError("backend_unavailable", "aux backend needs the desktop shell or a standalone driver");
    }
    if (!driver?.createTarget) {
      throw new AuxError(
        "invalid_params",
        backend === "chrome"
          ? "chrome pages.open requires targetId of an existing tab"
          : `${backend} driver cannot create pages`,
      );
    }
    return { targetId: await driver.createTarget(initialUrl), nativeCreated: false };
  }

  async openOn(
    backend: Backend,
    opts: {
      url: string;
      windowId?: string;
      background: boolean;
      ownedByRuntime: boolean;
      activate?: boolean;
      targetId?: string;
      beforeNavigate?: (target: PageTarget) => Promise<void>;
      agentScope?: Omit<AgentPageCreate, "windowId" | "background">;
      signal?: AbortSignal;
    },
    routeReason: string,
    restored?: PageTarget,
  ): Promise<PageTarget> {
    const driver = this.pages.driverFor(backend);
    // Ordinary native tabs use the browser's fixed person read/navigation
    // routes, never an agent CDP attachment. A driver is still mandatory for
    // controlled/isolated tabs and external/standalone backends.
    const nativePerson =
      backend === "aux" &&
      this.pages.deps.native.available() &&
      typeof this.pages.deps.native.personReadContext === "function" &&
      !opts.ownedByRuntime &&
      !opts.agentScope &&
      !opts.beforeNavigate &&
      !opts.targetId;
    // a dropped control socket is recovered lazily for control consumers.
    if (!nativePerson && driver && !driver.isConnected() && driver.reconnect)
      await driver.reconnect().catch(() => {});
    if (!nativePerson && !driver?.isConnected())
      throw new AuxError("backend_unavailable", `${backend} backend is not connected`);

    if (restored?.agentIsolation)
      throw new AuxError(
        "permission_denied",
        "This temporary sign-in session has ended. Start a new run to open a fresh protected tab.",
      );
    if (
      opts.agentScope &&
      (backend !== "aux" || opts.targetId || !opts.beforeNavigate || !opts.ownedByRuntime)
    )
      throw new AuxError(
        "permission_denied",
        "Protected tabs require a fresh native page and request authority before navigation.",
      );
    let pageId = restored?.pageId ?? (nativePerson ? randomUUID() : newPageId());
    let registered = () => {};
    const creating = opts.agentScope
      ? new Promise<void>((resolve) => {
          registered = resolve;
        })
      : undefined;
    if (creating) this.pages.agentCreations.add(creating);
    this.pages.opening.add(pageId);
    let isolated: AgentPageCreated | undefined;
    let createdTarget: PageTarget | undefined;
    try {
      let targetId: string;
      let nativeCreated = false;
      let cdpTargetId: string | undefined;
      let nativeWindowId: string | undefined;
      // Open on about:blank, then navigate AFTER response listeners are wired —
      // otherwise the page's own first load escapes passive capture.
      const initialUrl = opts.targetId ? opts.url : "about:blank";
      if (opts.agentScope) {
        if (!this.pages.deps.native.createAgentPage)
          throw new AuxError(
            "capability_unsupported",
            "Protected temporary tabs are unavailable in this browser.",
          );
        if (opts.agentScope.source && opts.agentScope.source.expectedUrl !== opts.url)
          throw new AuxError("permission_denied", "The temporary tab must open the selected source address.");
        const originalRun = this.pages.deps.repo.getRun(opts.agentScope.runId);
        if (
          opts.signal?.aborted ||
          !originalRun ||
          !["queued", "running", "planning", "needs_input"].includes(originalRun.status) ||
          originalRun.config?.taskId !== opts.agentScope.taskId ||
          (originalRun.config?.taskRevision ?? 0) !== opts.agentScope.taskRevision ||
          JSON.stringify(runAncestry(this.pages.deps.repo, originalRun.runId, true)) !==
            JSON.stringify(opts.agentScope.ancestry)
        )
          throw new AuxError("ref_stale", "The original run ended before opening its temporary tab.");
        isolated = AgentPageCreatedSchema.parse(
          await this.pages.deps.native.createAgentPage({
            ...opts.agentScope,
            windowId: opts.windowId ?? "main",
            background: opts.background,
          }),
        );
        if (
          isolated.isolation.runId !== opts.agentScope.runId ||
          isolated.isolation.taskId !== opts.agentScope.taskId ||
          isolated.isolation.taskRevision !== opts.agentScope.taskRevision ||
          JSON.stringify(isolated.source) !== JSON.stringify(opts.agentScope.source) ||
          this.pages.live.has(isolated.pageId) ||
          this.pages.opening.has(isolated.pageId)
        )
          throw new AuxError("permission_denied", "Native temporary-tab authority did not match this run.");
        this.pages.opening.delete(pageId);
        pageId = isolated.pageId;
        this.pages.opening.add(pageId);
        targetId = `atab-${pageId}`;
        cdpTargetId = isolated.targetId;
        nativeCreated = true;
      } else if (opts.targetId && backend === "chrome") {
        targetId = opts.targetId;
      } else {
        ({
          targetId,
          nativeCreated,
          cdpTargetId,
          windowId: nativeWindowId,
        } = await this.createSurface(
          backend,
          driver,
          pageId,
          initialUrl,
          opts.background,
          opts.windowId,
          opts.ownedByRuntime,
        ));
      }

      if (nativePerson && (this.pages.closing || opts.signal?.aborted)) {
        const error = new AuxError(
          "target_detached",
          "The original native page opening retired before publication.",
        );
        try {
          const cleanup = await this.pages.deps.native.tabCommand({
            commandId: `agent-${newPageId()}`,
            windowId: nativeWindowId ?? opts.windowId ?? "main",
            command: { kind: "close", pageId },
          });
          if (cleanup.status === "rejected")
            throw new AuxError("backend_unavailable", "Original native page cleanup was not acknowledged.");
        } catch (cleanup) {
          throw new AggregateError(
            [error, cleanup],
            "Native page opening retired with original cleanup debt.",
          );
        }
        throw error;
      }
      const target: PageTarget = {
        pageId,
        windowId: nativePerson ? (nativeWindowId ?? opts.windowId) : opts.windowId,
        backend,
        targetId,
        url: opts.beforeNavigate || nativePerson ? initialUrl : opts.url,
        title: "",
        documentEpoch: restored ? restored.documentEpoch + 1 : 0,
        lastRevision: 0,
        viewStatus: backend === "chrome" ? "hidden" : opts.background ? "background" : "visible",
        controller: "none",
        controllerEpoch: restored ? restored.controllerEpoch + 1 : 0,
        ownedByRuntime: opts.ownedByRuntime,
        ...(isolated ? { agentIsolation: isolated.isolation } : {}),
        createdAt: restored?.createdAt ?? Date.now(),
        lastActiveAt: Date.now(),
        routeReason,
      };
      createdTarget = target;
      if (isolated) this.pages.creatorPages.set(pageId, isolated);
      let dp: DriverPage | null;
      const protectedPage = isolated ? this.pages.addLive(target, null) : undefined;
      try {
        // CDP attachment initializes execution worlds. Install genuine native
        // authority before even these commands reach a protected document.
        if (protectedPage) await opts.beforeNavigate!(target);
        dp = nativePerson
          ? null
          : restored && driver!.recoverPage
            ? await driver!.recoverPage(targetId, pageId, restored.documentEpoch + 1)
            : await driver!.attach(targetId, pageId, cdpTargetId ? { cdpTargetId } : undefined);
      } catch (e) {
        // the shell view already exists — destroy it rather than leaking a
        // driverless zombie tab in the strip
        if (nativeCreated && !protectedPage)
          await this.pages.deps.native
            .tabCommand({
              commandId: `agent-${newPageId()}`,
              windowId: opts.windowId ?? "main",
              command: { kind: "close", pageId },
            })
            .catch(() => {});
        throw e;
      }
      const lp = protectedPage ?? this.pages.addLive(target, dp);
      if (protectedPage && dp) this.pages.installDriver(lp, dp);
      registered();
      if (creating) this.pages.agentCreations.delete(creating);
      this.pages.opening.delete(pageId);
      if (!this.pages.restoring) this.pages.deps.events.emit(EventTypes.PageAdded, { page: target });
      this.pages.deps.tracer?.incr(`router.open.${backend}`);
      if (opts.beforeNavigate && !protectedPage) {
        try {
          await opts.beforeNavigate(target);
        } catch (error) {
          // Failed authority never falls through to the requested navigation.
          // Close only the newly created surface; attached owner tabs stay inert.
          if (nativeCreated)
            await this.pages.deps.native
              .tabCommand({
                commandId: `agent-${newPageId()}`,
                windowId: opts.windowId ?? "main",
                command: { kind: "close", pageId },
              })
              .catch(() => {});
          target.viewStatus = "detached";
          this.pages.persist(lp);
          this.pages.live.delete(pageId);
          await dp?.dispose().catch(() => {});
          this.pages.deps.events.emit(EventTypes.PageRemoved, { pageId });
          throw error;
        }
      }
      // Select the requested foreground tab before loading. A slow response must
      // not steal focus later or leave commands targeting the previous tab.
      if (nativePerson && opts.url !== initialUrl) {
        const cleanupOwner = {
          windowId: target.windowId,
          controller: target.controller,
          controllerEpoch: target.controllerEpoch,
          driver: lp.driver,
          ownedByRuntime: target.ownedByRuntime,
          isolation: JSON.stringify(target.agentIsolation),
        };
        try {
          if (!(await navigateNativePage(this.pages, pageId, opts.url, opts.signal)))
            throw new AuxError("target_detached", "The original native tab was unavailable for navigation.");
          if (opts.signal?.aborted || this.pages.closing || this.pages.live.get(pageId) !== lp)
            throw new AuxError("target_detached", "The original native opening retired before completion.");
        } catch (error) {
          try {
            if (
              this.pages.live.get(pageId) !== lp ||
              lp.driver !== cleanupOwner.driver ||
              target.windowId !== cleanupOwner.windowId ||
              target.controller !== cleanupOwner.controller ||
              target.controllerEpoch !== cleanupOwner.controllerEpoch ||
              target.ownedByRuntime !== cleanupOwner.ownedByRuntime ||
              JSON.stringify(target.agentIsolation) !== cleanupOwner.isolation
            )
              throw new AuxError(
                "permission_denied",
                "Original native page cleanup lost its retained owner.",
              );
            const cleanup = await this.pages.deps.native.tabCommand({
              commandId: `agent-${newPageId()}`,
              windowId: target.windowId ?? "main",
              command: { kind: "close", pageId },
            });
            if (cleanup.status === "rejected")
              throw new AuxError("backend_unavailable", "Original native page cleanup was not acknowledged.");
            if (this.pages.live.get(pageId) === lp) {
              target.viewStatus = "detached";
              this.pages.persist(lp);
              this.pages.live.delete(pageId);
              this.pages.deps.events.emit(EventTypes.PageRemoved, { pageId });
            }
          } catch (cleanup) {
            throw new AggregateError(
              [error, cleanup],
              "Native page opening failed with original cleanup debt.",
            );
          }
          throw error;
        }
      }
      if (opts.activate ?? !opts.background) await this.activation.activate(pageId).catch(() => {});
      // the real navigation happens with listeners attached — captured like
      // any later navigation (metadata + bodies)
      if (dp && opts.url !== initialUrl) {
        if (protectedPage && isolated) {
          const navigate = this.pages.deps.navigateControlled;
          if (!navigate)
            throw new AuxError(
              "capability_unsupported",
              "Protected initial navigation requires native continuation authority.",
            );
          const originalIsolation = structuredClone(isolated.isolation);
          const originalControllerEpoch = target.controllerEpoch;
          const validateSource = () => {
            const run = this.pages.deps.repo.getRun(originalIsolation.runId);
            const current = this.pages.live.get(pageId);
            if (
              opts.signal?.aborted ||
              current !== lp ||
              !current.target.ownedByRuntime ||
              current.target.controller === "human" ||
              current.target.controllerEpoch !== originalControllerEpoch ||
              JSON.stringify(current.target.agentIsolation) !== JSON.stringify(originalIsolation) ||
              !run ||
              !["queued", "running", "planning", "needs_input"].includes(run.status) ||
              run.config?.taskId !== originalIsolation.taskId ||
              (run.config?.taskRevision ?? 0) !== originalIsolation.taskRevision
            )
              throw new AuxError(
                "ref_stale",
                "The original task or temporary tab changed before its first navigation.",
              );
          };
          await navigate(
            { runId: originalIsolation.runId, pageId, url: opts.url, signal: opts.signal, validateSource },
            this.pages,
          );
        } else {
          const navigation = lp.driver!.navigate(opts.url).catch(() => {});
          if (!restored) await navigation;
        }
      }
      void this.pages.refreshMeta(lp);
      return target;
    } catch (error) {
      if (isolated && createdTarget) {
        const current = this.pages.live.get(pageId);
        if (
          current &&
          current.target.ownedByRuntime &&
          current.target.controller !== "human" &&
          JSON.stringify(current.target.agentIsolation) === JSON.stringify(isolated.isolation)
        ) {
          try {
            await this.pages.closeCreator(structuredClone(current.target), isolated.isolation.runId);
          } catch (cleanup) {
            throw new AggregateError(
              [error, cleanup],
              "Temporary-page opening failed and its original native cleanup remains unresolved.",
            );
          }
        }
      }
      throw error;
    } finally {
      registered();
      if (creating) this.pages.agentCreations.delete(creating);
      this.pages.opening.delete(pageId);
    }
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
    lastActiveAt?: number;
    themeColor?: string;
    split?: PageTarget["split"];
    active?: boolean;
    ownedByRuntime?: boolean;
    lifecycle?: PageTarget["lifecycle"];
    showBlankDocument?: boolean;
    cdpTargetId?: string;
    restored?: PageTarget;
  }): Promise<PageTarget> {
    if (opts.ownedByRuntime && this.pages.agentCreations.size) await Promise.all(this.pages.agentCreations);
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
    pending.done = this.attachExternal(
      { ...opts, restored: previous?.backend === opts.backend ? previous : undefined },
      pageId,
      pending,
    );
    this.pages.pendingExternal.set(pageId, pending);
    try {
      return await pending.done;
    } finally {
      this.pages.pendingExternal.delete(pageId);
    }
  }

  private async attachExternal(
    opts: {
      windowId?: string;
      marker: string;
      url: string;
      backend: Backend;
      title?: string;
      lastActiveAt?: number;
      themeColor?: string;
      split?: PageTarget["split"];
      active?: boolean;
      ownedByRuntime?: boolean;
      lifecycle?: PageTarget["lifecycle"];
      showBlankDocument?: boolean;
      cdpTargetId?: string;
      restored?: PageTarget;
    },
    pageId: string,
    pending: { removed: boolean },
  ): Promise<PageTarget> {
    const driver = this.pages.driverFor(opts.backend);
    const dormant = !opts.active && (opts.lifecycle === "placeholder" || opts.lifecycle === "discarded");
    const ownedByRuntime = opts.ownedByRuntime ?? opts.restored?.ownedByRuntime ?? false;
    const nativePerson =
      opts.backend === "aux" &&
      this.pages.deps.native.available() &&
      typeof this.pages.deps.native.personReadContext === "function" &&
      !ownedByRuntime &&
      !opts.restored?.agentIsolation;
    const dp =
      driver && !dormant && !nativePerson
        ? await driver.attach(opts.marker, pageId, {
            cdpTargetId: opts.cdpTargetId,
            initialDocumentEpoch: opts.restored ? opts.restored.documentEpoch + 1 : undefined,
          })
        : null;
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
      themeColor: opts.themeColor,
      split: opts.split,
      showBlankDocument: opts.showBlankDocument,
      documentEpoch: opts.restored ? opts.restored.documentEpoch + 1 : 0,
      lastRevision: 0,
      viewStatus: opts.active === false ? "background" : "visible",
      lifecycle: opts.lifecycle,
      controller: "none",
      controllerEpoch: opts.restored ? opts.restored.controllerEpoch + 1 : 0,
      ownedByRuntime,
      createdAt: opts.restored?.createdAt ?? Date.now(),
      lastActiveAt: opts.lastActiveAt ?? Date.now(),
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
