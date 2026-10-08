import { randomUUID } from "node:crypto";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import {
  AuxError,
  type Backend,
  EventTypes,
  type PageTarget,
  type NativePersonReadContext,
  type AgentPageCreated,
  type AgentPageIsolation,
  NativeCreatorCleanupProofSchema,
} from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import { parsePersonReadContext } from "../native-person-reader.js";
import type { LivePage, PageServiceDeps } from "./types.js";

interface BorrowedSession {
  live: LivePage;
  isolation: AgentPageIsolation;
  attachment?: Promise<void>;
  sourceSessionId?: string;
  driver?: DriverPage;
  retiringDriver?: DriverPage;
}

/**
 * The live page map and what every component shares: identity lookup,
 * per-window selection pointers, persist batching and driver wiring.
 */
export class PageRegistry {
  constructor(readonly deps: PageServiceDeps) {}

  live = new Map<string, LivePage>();
  readonly creatorPages = new Map<string, AgentPageCreated>();
  /** Catalog events wait until native-minted controlled pages have their creator metadata. */
  agentCreations = new Set<Promise<void>>();
  pendingExternal = new Map<string, { removed: boolean; done?: Promise<PageTarget> }>();
  private driverAttaches = new Map<string, Promise<void>>();
  private personReads = new Map<LivePage, Set<Promise<unknown>>>();
  private borrowedSessions = new Map<string, BorrowedSession>();
  private controlledTransitions = new Map<
    string,
    {
      live: LivePage;
      driver: DriverPage;
      sessionId: string;
      controllerEpoch: number;
      retired: boolean;
      retirementObservers: Set<() => void>;
    }
  >();
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

  async closeCreator(original: PageTarget, runId: string): Promise<void> {
    const snapshot = structuredClone(original);
    const creation = this.creatorPages.get(snapshot.pageId);
    const current = this.live.get(snapshot.pageId);
    const sameOriginal = () =>
      !!creation &&
      !!current &&
      this.creatorPages.get(snapshot.pageId) === creation &&
      this.live.get(snapshot.pageId) === current &&
      creation.isolation.runId === runId &&
      snapshot.ownedByRuntime &&
      current.target.ownedByRuntime &&
      current.target.controller !== "human" &&
      current.target.viewStatus !== "detached" &&
      current.target.backend === snapshot.backend &&
      current.target.targetId === snapshot.targetId &&
      current.target.sessionId === snapshot.sessionId &&
      current.target.documentEpoch === snapshot.documentEpoch &&
      current.target.controllerEpoch === snapshot.controllerEpoch &&
      current.target.url === snapshot.url &&
      JSON.stringify(current.target.agentIsolation) === JSON.stringify(snapshot.agentIsolation) &&
      JSON.stringify(snapshot.agentIsolation) === JSON.stringify(creation.isolation);
    if (!sameOriginal() || !creation || !current)
      throw new AuxError("ref_stale", "The original temporary-page cleanup scope changed.");
    if (
      !this.deps.retireCreatedPage ||
      !this.deps.native.creatorCleanupProof ||
      !this.deps.native.closeCreatedPage
    )
      throw new AuxError("capability_unsupported", "Native temporary-page cleanup is unavailable.");
    await this.deps.retireCreatedPage(runId, snapshot.pageId);
    if (!sameOriginal())
      throw new AuxError("ref_stale", "The original temporary page changed during retirement.");
    const proof = NativeCreatorCleanupProofSchema.parse(
      await this.deps.native.creatorCleanupProof({
        pageId: snapshot.pageId,
        creationId: creation.creationId,
      }),
    );
    if (!sameOriginal())
      throw new AuxError(
        "ref_stale",
        "The original temporary page changed while obtaining cleanup authority.",
      );
    if (
      proof.creationId !== creation.creationId ||
      proof.pageId !== creation.pageId ||
      proof.runId !== runId ||
      proof.isolationId !== creation.isolation.isolationId ||
      proof.taskId !== creation.isolation.taskId ||
      proof.taskRevision !== creation.isolation.taskRevision
    )
      throw new AuxError("permission_denied", "Native cleanup returned another creator's authority.");
    const reply = await this.deps.native.closeCreatedPage({ proof });
    if (reply.closed !== true)
      throw new AuxError("backend_unavailable", "Original temporary-page closure was not acknowledged.");
    if (this.creatorPages.get(snapshot.pageId) === creation) this.creatorPages.delete(snapshot.pageId);
    if (this.live.get(snapshot.pageId) === current) {
      this.live.delete(snapshot.pageId);
      current.target.viewStatus = "detached";
      this.persist(current);
      await current.driver?.dispose();
      this.deps.events.emit(EventTypes.PageRemoved, { pageId: snapshot.pageId });
    }
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

  async personRead<T>(lp: LivePage, read: () => Promise<T>): Promise<T> {
    if (this.live.get(lp.target.pageId) !== lp || lp.driver || lp.target.agentIsolation)
      throw new AuxError("target_detached", "The original person reader retired.");
    const reads = this.personReads.get(lp) ?? new Set<Promise<unknown>>();
    this.personReads.set(lp, reads);
    const pending = read();
    reads.add(pending);
    try {
      return await pending;
    } finally {
      reads.delete(pending);
      if (!reads.size && this.personReads.get(lp) === reads) this.personReads.delete(lp);
    }
  }

  /** Only BrowserEgress's acknowledged original-document admission calls this. */
  async admitSessionPage(input: {
    pageId: string;
    source: Pick<PageTarget, "url" | "documentEpoch" | "sessionId"> & { controllerEpoch?: number };
    isolation: AgentPageIsolation;
    current(): boolean;
  }): Promise<void> {
    const { pageId, source, isolation } = input;
    const lp = this.live.get(pageId);
    const existing = this.borrowedSessions.get(pageId);
    if (existing && existing.live === lp && existing.isolation.isolationId === isolation.isolationId) {
      if (existing.attachment) await existing.attachment;
      if (lp?.driver?.isAttached() && input.current()) return;
      throw new AuxError("ref_stale", "The original borrowed attachment retired.");
    }
    const current = () =>
      !!lp &&
      !this.closing &&
      this.live.get(pageId) === lp &&
      input.current() &&
      lp.target.backend === "aux" &&
      !lp.target.ownedByRuntime &&
      lp.target.url === source.url &&
      lp.target.documentEpoch === source.documentEpoch &&
      lp.target.controllerEpoch === source.controllerEpoch &&
      lp.target.sessionId === source.sessionId;
    if (!current() || !lp || lp.driver || lp.target.agentIsolation || isolation.mode !== "session")
      throw new AuxError("ref_stale", "The original session document changed before reader admission.");
    const driver = this.driverFor("aux");
    if (!driver?.isConnected())
      throw new AuxError("backend_unavailable", "The protected browser reader is unavailable.");
    const original: BorrowedSession = { live: lp, isolation };
    this.borrowedSessions.set(pageId, original);
    // Retire pending fixed reads before any CDP attachment can dispatch.
    lp.target.agentIsolation = structuredClone(isolation);
    this.resetDocumentState(lp);
    const work = (async () => {
      await Promise.allSettled(this.personReads.get(lp) ?? []);
      if (!current() || this.borrowedSessions.get(pageId) !== original)
        throw new AuxError("ref_stale", "The original session reader admission retired.");
      const attached = await driver.attach(lp.target.targetId, pageId, {
        initialDocumentEpoch: source.documentEpoch,
      });
      original.driver = attached;
      try {
        if (!current() || this.borrowedSessions.get(pageId) !== original || !attached.isAttached())
          throw new AuxError("ref_stale", "The original session changed while attaching its reader.");
        original.sourceSessionId = source.sessionId;
        this.installDriver(lp, attached);
        delete lp.personReadDocumentId;
        delete lp.personReadDocumentEpoch;
      } catch (error) {
        original.retiringDriver = attached;
        try {
          await attached.dispose();
          delete original.retiringDriver;
          delete original.driver;
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            "Session admission and attachment retirement failed",
            { cause: error },
          );
        }
        throw error;
      } finally {
        delete original.sourceSessionId;
      }
    })();
    original.attachment = work;
    try {
      await work;
    } finally {
      original.attachment = undefined;
    }
  }

  /** Native terminal retirement has acknowledged this exact borrowed isolation. */
  async retireSessionPage(pageId: string, isolation: AgentPageIsolation): Promise<void> {
    const original = this.borrowedSessions.get(pageId);
    if (!original || original.isolation.isolationId !== isolation.isolationId) return;
    if (original.attachment) await original.attachment.catch(() => {});
    const lp = original.live;
    if (this.live.get(pageId) !== lp || lp.target.agentIsolation?.isolationId !== isolation.isolationId) {
      const orphan = original.retiringDriver ?? original.driver;
      if (orphan) await orphan.dispose();
      if (this.borrowedSessions.get(pageId) === original) this.borrowedSessions.delete(pageId);
      return;
    }
    const driver = original.retiringDriver ?? lp.driver;
    if (driver) {
      original.retiringDriver = driver;
      if (lp.driver === driver) lp.driver = null;
      await driver.dispose();
      delete original.retiringDriver;
      if (this.live.get(pageId) !== lp || lp.driver) return;
    }
    const source = { ...lp.target };
    let context: NativePersonReadContext | undefined;
    if (source.viewStatus !== "crashed" && source.controller !== "human") {
      const prepare = this.deps.native.personReadContext;
      if (!prepare) throw new AuxError("backend_unavailable", "The native page reader is unavailable.");
      context = parsePersonReadContext(pageId, await prepare.call(this.deps.native, pageId));
      if (
        this.live.get(pageId) !== lp ||
        this.borrowedSessions.get(pageId) !== original ||
        lp.driver ||
        lp.target.agentIsolation?.isolationId !== isolation.isolationId ||
        lp.target.url !== source.url ||
        lp.target.documentEpoch !== source.documentEpoch ||
        lp.target.controllerEpoch !== source.controllerEpoch ||
        context.url !== source.url
      )
        throw new AuxError("ref_stale", "The original page changed while returning its person reader.");
    }
    this.borrowedSessions.delete(pageId);
    delete lp.target.agentIsolation;
    delete lp.target.sessionId;
    delete lp.personReadDocumentId;
    delete lp.personReadDocumentEpoch;
    this.resetDocumentState(lp);
    if (context) {
      if (lp.target.viewStatus === "detached")
        lp.target.viewStatus =
          this.activeByWindow.get(lp.target.windowId ?? "main") === pageId ? "visible" : "hidden";
      this.adoptPersonReadContext(lp, context);
    }
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
  }

  async prepareReadPage(pageId: string): Promise<void> {
    const lp = this.live.get(pageId);
    if (!lp) throw new AuxError("target_detached", "This tab is no longer available.");
    if (lp.driver || lp.target.backend !== "aux" || lp.target.ownedByRuntime || lp.target.agentIsolation)
      return;
    if (
      !["human", "none"].includes(lp.target.controller) ||
      ["detached", "crashed"].includes(lp.target.viewStatus)
    )
      throw new AuxError("permission_denied", "This tab is unavailable for read-only context.");
    const prepare = this.deps.native.personReadContext;
    if (!this.deps.native.available() || !prepare)
      throw new AuxError("backend_unavailable", "The native page reader is unavailable.");
    const epoch = lp.target.documentEpoch,
      control = lp.target.controllerEpoch,
      url = lp.target.url;
    const raw = await this.personRead(lp, () => prepare.call(this.deps.native, pageId));
    if (
      this.live.get(pageId) !== lp ||
      this.closing ||
      lp.driver ||
      lp.target.controllerEpoch !== control ||
      lp.target.ownedByRuntime ||
      lp.target.agentIsolation ||
      !["human", "none"].includes(lp.target.controller) ||
      ["detached", "crashed"].includes(lp.target.viewStatus)
    )
      throw new AuxError("target_detached", "This tab changed while preparing its context.");
    if (lp.target.documentEpoch !== epoch || lp.target.url !== url)
      throw new AuxError("ref_stale", "This tab navigated before its context was ready.");
    const context = parsePersonReadContext(pageId, raw);
    if (context.url !== lp.target.url)
      throw new AuxError("ref_stale", "This tab navigated before its context was ready.");
    this.adoptPersonReadContext(lp, context);
  }

  /** Restored placeholders acquire a driver only after their native tab opens. */
  async attachVisible(pageId: string): Promise<void> {
    const lp = this.live.get(pageId);
    if (
      !lp ||
      lp.driver ||
      lp.target.backend !== "aux" ||
      this.controlledTransitions.has(pageId) ||
      this.borrowedSessions.has(pageId)
    )
      return;
    if (
      this.deps.native.available() &&
      typeof this.deps.native.personReadContext === "function" &&
      !lp.target.ownedByRuntime &&
      !lp.target.agentIsolation
    ) {
      await this.prepareReadPage(pageId);
      return;
    }
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
      try {
        this.installDriver(lp, attached);
      } catch (error) {
        await attached.dispose().catch(() => {});
        throw error;
      }
      void this.refreshMeta(lp);
    })();
    this.driverAttaches.set(pageId, work);
    try {
      await work;
    } finally {
      this.driverAttaches.delete(pageId);
    }
  }

  hasControlledTransition(pageId: string): boolean {
    return this.controlledTransitions.has(pageId);
  }

  /** Internal producer used only while an original native command is pending.
   * The caller must validate its native receipt and source authority before
   * and after attachment. This token never authorizes a browser effect. */
  beginControlledTransition(pageId: string) {
    const live = this.live.get(pageId);
    if (
      !live?.driver?.isAttached() ||
      !live.target.sessionId ||
      live.target.backend !== "aux" ||
      live.target.controller === "human" ||
      this.closing ||
      this.controlledTransitions.has(pageId)
    )
      throw new AuxError("ref_stale", "This original attachment cannot start a controlled navigation.");
    const original = {
      live,
      driver: live.driver,
      sessionId: live.target.sessionId,
      controllerEpoch: live.target.controllerEpoch,
      retired: false,
      retirementObservers: new Set<() => void>(),
      url: live.target.url,
      documentEpoch: live.target.documentEpoch,
      targetId: live.target.targetId,
      controller: live.target.controller,
    };
    this.controlledTransitions.set(pageId, original);
    let committed: { url: string; documentEpoch: number } | undefined;
    let published: { driver: DriverPage; sessionId: string } | undefined;
    const current = () =>
      this.controlledTransitions.get(pageId) === original &&
      this.live.get(pageId) === live &&
      !this.closing &&
      live.target.controllerEpoch === original.controllerEpoch &&
      live.target.controller !== "human" &&
      live.target.url === (committed?.url ?? original.url) &&
      live.target.documentEpoch === (committed?.documentEpoch ?? original.documentEpoch) &&
      live.target.targetId === original.targetId &&
      live.target.controller === original.controller &&
      (original.retired
        ? live.driver === null && live.target.sessionId === undefined
        : live.driver === original.driver && live.target.sessionId === original.sessionId);
    const finish = () => {
      if (this.controlledTransitions.get(pageId) === original) this.controlledTransitions.delete(pageId);
      for (const observer of Array.from(original.retirementObservers)) observer();
    };
    return {
      current,
      waitRetired: (deadline: number, signal: AbortSignal, validate: () => void): Promise<void> =>
        new Promise((resolve, reject) => {
          let timer: ReturnType<typeof setTimeout> | undefined;
          const cleanup = () => {
            if (timer !== undefined) clearTimeout(timer);
            original.retirementObservers.delete(check);
            signal.removeEventListener("abort", check);
          };
          const check = () => {
            try {
              validate();
              if (signal.aborted || !current() || !Number.isSafeInteger(deadline) || Date.now() >= deadline)
                throw new AuxError(
                  "ref_stale",
                  "The original navigation retirement deadline or source changed.",
                );
              if (!original.retired) return;
              cleanup();
              resolve();
            } catch (error) {
              cleanup();
              reject(error);
            }
          };
          original.retirementObservers.add(check);
          signal.addEventListener("abort", check, { once: true });
          const wake = () => {
            timer = undefined;
            check();
            // Timer delivery may precede the wall-clock deadline. Keep only the
            // original remaining interval; an early wake never retires the wait.
            if (original.retirementObservers.has(check))
              timer = setTimeout(wake, Math.max(1, deadline - Date.now()));
          };
          timer = setTimeout(wake, Math.max(0, deadline - Date.now()));
          check();
        }),
      cancel: async () => {
        finish();
        if (
          published &&
          this.live.get(pageId) === live &&
          live.driver === published.driver &&
          live.target.sessionId === published.sessionId
        ) {
          const driver = published.driver;
          live.driver = null;
          delete live.target.sessionId;
          live.target.viewStatus = "detached";
          if (
            live.target.controllerEpoch === original.controllerEpoch &&
            live.target.controller === original.controller
          )
            live.target.controller = "none";
          this.resetDocumentState(live);
          this.persist(live);
          await driver.dispose();
          return;
        }
        if (
          this.live.get(pageId) === live &&
          original.retired &&
          !live.driver &&
          live.target.controllerEpoch === original.controllerEpoch &&
          live.target.controller !== "human"
        ) {
          live.target.controller = "none";
          live.target.viewStatus = "detached";
          this.persist(live);
        }
      },
      stage: (receipt: { url: string; documentEpoch: number }, validate: () => void) => {
        validate();
        if (
          !current() ||
          !original.retired ||
          committed ||
          !Number.isSafeInteger(receipt.documentEpoch) ||
          receipt.documentEpoch !== original.documentEpoch + 1
        )
          throw new AuxError("ref_stale", "The original navigation attachment is not retired.");
        committed = { ...receipt };
        live.target.url = receipt.url;
        live.target.documentEpoch = receipt.documentEpoch;
        // This is native committed document metadata, not a driver/session.
        // No page command can execute while its real driver remains absent.
        live.target.viewStatus = "background";
        this.resetDocumentState(live);
        this.deps.repo.markDatasetsStale(pageId);
        this.persist(live);
      },
      attach: async (
        receipt: { url: string; documentEpoch: number },
        validate: () => void,
      ): Promise<DriverPage> => {
        validate();
        if (
          !current() ||
          !original.retired ||
          (committed
            ? receipt.url !== committed.url || receipt.documentEpoch !== committed.documentEpoch
            : receipt.documentEpoch !== original.documentEpoch + 1 ||
              !Number.isSafeInteger(receipt.documentEpoch))
        )
          throw new AuxError("ref_stale", "The original navigation attachment is not retired.");
        const browser = this.driverFor("aux");
        if (!browser) throw new AuxError("target_detached", "The browser driver is unavailable.");
        const attached = await browser.attach(live.target.targetId, pageId, {
          initialDocumentEpoch: receipt.documentEpoch,
        });
        try {
          validate();
          if (
            !current() ||
            !attached.isAttached() ||
            attached === original.driver ||
            attached.identity.pageId !== pageId ||
            attached.identity.backend !== "aux" ||
            attached.url() !== receipt.url
          )
            throw new AuxError("ref_stale", "The navigation's fresh attachment changed before admission.");
          live.target.url = receipt.url;
          live.target.documentEpoch = receipt.documentEpoch;
          live.target.viewStatus = "visible";
          this.resetDocumentState(live);
          this.deps.repo.markDatasetsStale(pageId);
          finish();
          const installedSession = this.installDriver(live, attached);
          if (installedSession) published = { driver: attached, sessionId: installedSession };
          if (
            this.live.get(pageId) !== live ||
            live.driver !== attached ||
            !installedSession ||
            live.target.sessionId !== installedSession ||
            live.target.controllerEpoch !== original.controllerEpoch ||
            live.target.controller !== original.controller
          )
            throw new AuxError("ref_stale", "The new attachment changed while publishing its incarnation.");
          return attached;
        } catch (error) {
          const cleanupErrors: unknown[] = [];
          // installDriver publishes identity before binding its callbacks. A
          // binding failure must not leave that exact partial incarnation live.
          if (
            published &&
            this.live.get(pageId) === live &&
            live.driver === attached &&
            live.target.sessionId === published.sessionId
          ) {
            live.driver = null;
            delete live.target.sessionId;
            live.target.viewStatus = "detached";
            try {
              this.resetDocumentState(live);
              this.persist(live);
            } catch (cleanupError) {
              cleanupErrors.push(cleanupError);
            }
          }
          try {
            await attached.dispose();
          } catch (cleanupError) {
            cleanupErrors.push(cleanupError);
          }
          if (cleanupErrors.length)
            throw new AggregateError(
              [error, ...cleanupErrors],
              "Navigation attachment admission and cleanup failed",
              { cause: error },
            );
          throw error;
        }
      },
    };
  }

  /** A real attachment, shared by fresh open, restore, discard recovery and crash reload. */
  installDriver(lp: LivePage, driver: DriverPage) {
    if (this.live.get(lp.target.pageId) !== lp || this.closing)
      throw new AuxError("target_detached", "This tab closed while attaching.");
    if (lp.driver === driver) return lp.target.sessionId;
    if (lp.driver) throw new AuxError("conflict", "This tab already has a newer attachment.");
    lp.driver = driver;
    const admission = this.borrowedSessions.get(lp.target.pageId);
    const sessionId = admission?.live === lp ? (admission.sourceSessionId ?? randomUUID()) : randomUUID();
    lp.target.sessionId = sessionId;
    try {
      if (lp.target.backend === "aux" && this.deps.native.available()) driver.setNativeDownloadAuthority?.();
      if (this.deps.downloadsDir) driver.setDownloadDir?.(this.deps.downloadsDir);
      this.wireDriverEvents(lp);
      this.persist(lp);
      this.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
    } catch (error) {
      if (
        this.live.get(lp.target.pageId) === lp &&
        lp.driver === driver &&
        lp.target.sessionId === sessionId
      ) {
        lp.driver = null;
        delete lp.target.sessionId;
        lp.target.viewStatus = "detached";
        try {
          this.resetDocumentState(lp);
          this.persist(lp);
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            "Attachment binding and partial publication retirement failed",
            { cause: error },
          );
        }
      }
      throw error;
    }
    return sessionId;
  }

  wireDriverEvents(lp: LivePage) {
    const driver = lp.driver,
      sessionId = lp.target.sessionId;
    const identityCurrent = () =>
      this.live.get(lp.target.pageId) === lp && lp.driver === driver && lp.target.sessionId === sessionId;
    const current = () =>
      identityCurrent() && this.controlledTransitions.get(lp.target.pageId)?.driver !== driver;
    const response = this.deps.responses?.record(lp.target.pageId);
    driver?.setEvents({
      onNavigated: (url, epoch) => {
        if (!current()) return;
        if (!url.startsWith("chrome-error://")) lp.target.url = url;
        lp.target.documentEpoch = epoch;
        this.resetDocumentState(lp);
        this.deps.repo.markDatasetsStale(lp.target.pageId);
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, {
          pageId: lp.target.pageId,
          url: lp.target.url,
          documentEpoch: epoch,
        });
        void this.refreshMeta(lp);
      },
      onDestroyed: (reason) => {
        if (!identityCurrent()) return;
        const transition = this.controlledTransitions.get(lp.target.pageId);
        const controlledRetirement =
          reason !== "crashed" &&
          transition?.live === lp &&
          transition.driver === driver &&
          transition.sessionId === sessionId;
        if (controlledRetirement) transition.retired = true;
        else if (transition?.live === lp) this.controlledTransitions.delete(lp.target.pageId);
        delete lp.target.sessionId;
        lp.driver = null;
        lp.target.viewStatus = reason === "crashed" ? "crashed" : "detached";
        if (
          !controlledRetirement &&
          !(this.borrowedSessions.has(lp.target.pageId) && lp.target.controller === "human")
        )
          lp.target.controller = "none";
        this.resetDocumentState(lp);
        this.persist(lp);
        if (transition) for (const observer of Array.from(transition.retirementObservers)) observer();
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
        ? (info) =>
            current()
              ? this.deps.decideDialog!({ pageId: lp.target.pageId, ...info })
              : Promise.resolve("leave" as const)
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
      onResponse: response
        ? (info) => {
            if (current()) return response({ ...info, sessionId });
          }
        : undefined,
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
    this.deps.repo.deferPage(lp.target);
    this.saveTabsSnapshot();
  }

  /** Last tab strip handed to the repo — the strip is rewritten only when it changed. */
  private savedTabs = "";

  /** Persist the human-facing tab strip so a restart restores it. */
  saveTabsSnapshot() {
    if (this.closing || this.restoring) return;
    const tabs = [...this.live.values()]
      .filter(
        (x) => !x.target.ownedByRuntime && x.target.backend === "aux" && x.target.viewStatus !== "detached",
      )
      .map((x, i) => ({
        pageId: x.target.pageId,
        windowId: x.target.windowId ?? "main",
        ordinal: i,
        url: x.target.url,
        title: x.target.title,
        backend: x.target.backend,
        active: this.activeByWindow.get(x.target.windowId ?? "main") === x.target.pageId,
      }));
    const liveIds = new Set(tabs.map((tab) => tab.pageId));
    for (const saved of this.pendingRestore.values())
      if (!liveIds.has(saved.page_id))
        tabs.push({
          pageId: saved.page_id,
          windowId: saved.window_id,
          ordinal: tabs.length,
          url: saved.url,
          title: saved.title,
          backend: saved.backend as Backend,
          active: !!saved.active,
        });
    const key = JSON.stringify(tabs);
    if (key === this.savedTabs) return;
    this.savedTabs = key;
    // snapshot is best-effort — a failed write is retried by the next change;
    // late: tab rows reference page rows queued in the same batch
    this.deps.repo.defer(
      "tabs",
      () => {
        try {
          this.deps.repo.saveTabs(tabs);
        } catch (e) {
          if (this.savedTabs === key) this.savedTabs = "";
          this.deps.tracer?.incr("swallowed.saveTabsSnapshot");
          throw e;
        }
      },
      true,
    );
  }

  async refreshMeta(lp: LivePage) {
    const driver = lp.driver,
      sessionId = lp.target.sessionId;
    if (!driver?.isAttached()) return;
    try {
      const title = await driver.title();
      if (
        this.live.get(lp.target.pageId) !== lp ||
        lp.driver !== driver ||
        lp.target.sessionId !== sessionId ||
        this.controlledTransitions.get(lp.target.pageId)?.driver === driver
      )
        return;
      const url = driver.url();
      if (lp.target.navigationError || url.startsWith("chrome-error://")) return;
      lp.target.title = title;
      lp.target.url = url;
      this.persist(lp);
      this.deps.events.emit(EventTypes.PageUpdated, {
        pageId: lp.target.pageId,
        title: lp.target.title,
        url: lp.target.url,
      });
      // browsing history is the human's: agent/worker pages do not write it
      if (!lp.target.ownedByRuntime && lp.target.url.startsWith("http"))
        this.deps.repo.recordVisit(lp.target.url, lp.target.title, lp.target.pageId);
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
