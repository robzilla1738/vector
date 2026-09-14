import {
  EventTypes,
  newObservationId,
  newPageId,
  VectorError,
  type Observation,
  type ObservationContent,
  type PageTarget,
  type Program,
  type ProgramNode,
  type ProgramResult,
  type Step,
  type StepRecord,
} from "@vector/contracts";
import { newStepId } from "@vector/contracts";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@vector/browser-driver";
import type { EventBus } from "../events.js";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import { executeProgram, type ExecContext } from "../execution/executor.js";
import { AsyncLocalStorage } from "node:async_hooks";

/** Ops that dispatch trusted input — they need a visible, laid-out view. */
const INTERACTIVE_OPS = new Set([
  "click", "dblclick", "hover", "press", "type", "fill",
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
  lastText?: string;
  lastFields?: Map<string, string>;
  lastObservationId?: string;
}

export interface PageServiceDeps {
  repo: Repo;
  events: EventBus;
  native: NativeBridge;
  drivers: () => { vector: BrowserDriver | null; chrome: BrowserDriver | null };
  recordStep?: (s: StepRecord) => void;
  artifacts?: { save(o: { runId?: string; pageId?: string; label: string; buffer: Buffer; mediaType: string }): { artifactId: string } };
  /** passive response capture — bound per page in wireDriverEvents */
  responses?: { record(pageId: string): NonNullable<DriverPageEvents["onResponse"]> };
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
}

/**
 * Owns the page registry: identity, lifecycle, per-page serialization,
 * observations with revisions, human takeover, and driver wiring.
 */
export class PageService {
  private live = new Map<string, LivePage>();
  private revCounters = new Map<string, number>();
  private activeId: string | null = null;
  /** set on app teardown — view.removed storms must not touch the restore list */
  private closing = false;

  shuttingDown() {
    this.closing = true;
  }

  get activePageId(): string | null {
    return this.activeId;
  }

  constructor(private deps: PageServiceDeps) {
    // restore persisted page rows as detached history entries
    for (const p of deps.repo.listPages({ includeDetached: true })) {
      p.viewStatus = "detached";
      p.controller = "none";
      this.deps.repo.upsertPage(p);
    }
  }

  list(opts?: { backend?: "vector" | "chrome"; includeDetached?: boolean }): PageTarget[] {
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
    if (!row) throw new VectorError("not_found", `no page ${pageId}`);
    return row;
  }

  driverPage(pageId: string): DriverPage {
    const lp = this.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached())
      throw new VectorError("target_detached", `page ${pageId} is not attached`);
    if (lp.target.controller === "human")
      throw new VectorError("conflict", `page ${pageId} is under human control — resume first`);
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

  async open(opts: {
    url: string;
    backend: "vector" | "chrome";
    background: boolean;
    ownedByRuntime: boolean;
    activate?: boolean;
    targetId?: string; // chrome: attach an existing tab by CDP id
  }): Promise<PageTarget> {
    const drivers = this.deps.drivers();
    const driver = opts.backend === "vector" ? drivers.vector : drivers.chrome;
    if (!driver?.isConnected())
      throw new VectorError("backend_unavailable", `${opts.backend} backend is not connected`);

    const pageId = newPageId();
    let targetId: string;
    let nativeCreated = false;
    // open on about:blank, then navigate AFTER response listeners are wired —
    // otherwise the page's own first load escapes passive capture entirely
    const initialUrl = opts.targetId ? opts.url : "about:blank";
    if (opts.backend === "vector") {
      const marker = `vtab-${pageId}`;
      if (this.deps.native.available()) {
        await this.deps.native.createPage({ pageId, marker, url: initialUrl, background: opts.background });
        nativeCreated = true;
        targetId = marker;
      } else if (driver.createTarget) {
        // standalone mode: the driver owns the surface (headless chrome page)
        targetId = await driver.createTarget(initialUrl);
      } else {
        throw new VectorError("backend_unavailable", "vector backend needs the desktop shell or a standalone driver");
      }
    } else {
      if (opts.targetId) {
        targetId = opts.targetId;
      } else if (driver.createTarget) {
        targetId = await driver.createTarget(initialUrl);
      } else {
        throw new VectorError(
          "invalid_params",
          "chrome pages.open requires targetId of an existing tab (list them with chrome.tabs)",
        );
      }
    }

    let dp: DriverPage;
    try {
      dp = await driver.attach(targetId, pageId);
    } catch (e) {
      // the shell view already exists — destroy it rather than leaking a
      // driverless zombie tab in the strip
      if (nativeCreated) await this.deps.native.closePage(pageId).catch(() => {});
      throw e;
    }
    const target: PageTarget = {
      pageId,
      backend: opts.backend,
      targetId,
      url: opts.url,
      title: "",
      documentEpoch: 0,
      lastRevision: 0,
      viewStatus: opts.backend === "chrome" ? "hidden" : opts.background ? "background" : "visible",
      controller: "none",
      controllerEpoch: 0,
      ownedByRuntime: opts.ownedByRuntime,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    const lp: LivePage = { target, driver: dp, queue: Promise.resolve() };
    this.live.set(pageId, lp);
    this.wireDriverEvents(lp);
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageAdded, { page: target });
    // the real navigation happens with listeners attached — captured like
    // any later navigation (metadata + bodies)
    if (dp && opts.url !== initialUrl) {
      await lp.driver!.navigate(opts.url).catch(() => {});
    }
    void this.refreshMeta(lp);
    // pages default to surfacing in the shell unless explicitly backgrounded
    if (opts.activate ?? !opts.background) await this.activate(pageId).catch(() => {});
    return target;
  }

  /** Register a page created natively outside the open() path (popups, restored tabs). */
  async registerExternal(opts: {
    pageId?: string;
    marker: string;
    url: string;
    backend: "vector" | "chrome";
    title?: string;
  }): Promise<PageTarget> {
    const drivers = this.deps.drivers();
    const driver = opts.backend === "vector" ? drivers.vector : drivers.chrome;
    const pageId = opts.pageId ?? newPageId();
    const dp = driver ? await driver.attach(opts.marker, pageId) : null;
    const target: PageTarget = {
      pageId,
      backend: opts.backend,
      targetId: opts.marker,
      url: opts.url,
      title: opts.title ?? "",
      documentEpoch: 0,
      lastRevision: 0,
      viewStatus: "visible",
      controller: "none",
      controllerEpoch: 0,
      ownedByRuntime: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    const lp: LivePage = { target, driver: dp, queue: Promise.resolve() };
    this.live.set(pageId, lp);
    if (dp) this.wireDriverEvents(lp);
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageAdded, { page: target });
    return target;
  }

  private wireDriverEvents(lp: LivePage) {
    lp.driver?.setEvents({
      onNavigated: (url, epoch) => {
        lp.target.url = url;
        lp.target.documentEpoch = epoch;
        this.deps.repo.markDatasetsStale(lp.target.pageId, epoch);
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, url, documentEpoch: epoch });
        void this.refreshMeta(lp);
      },
      onTitleChanged: (title) => {
        lp.target.title = title;
        this.persist(lp);
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, title });
      },
      onDestroyed: (reason) => {
        lp.target.viewStatus = reason === "crashed" ? "crashed" : "detached";
        lp.target.controller = "none";
        this.persist(lp);
        this.deps.events.emit(reason === "crashed" ? EventTypes.PageCrashed : EventTypes.PageRemoved, {
          pageId: lp.target.pageId,
          reason,
        });
      },
      onDialog: (info) =>
        this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, dialog: info }),
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
    if (this.closing) return;
    const tabs = [...this.live.values()]
      .filter((x) => !x.target.ownedByRuntime && x.target.backend === "vector" && x.target.viewStatus !== "detached")
      .map((x, i) => ({
        pageId: x.target.pageId,
        ordinal: i,
        url: x.target.url,
        title: x.target.title,
        backend: x.target.backend,
        active: x.target.pageId === this.activeId,
      }));
    try {
      this.deps.repo.saveTabs(tabs);
    } catch {
      /* snapshot is best-effort */
    }
  }

  /** Reopen the tabs that were live when the app last shut down. */
  async restoreTabs() {
    if (!this.deps.native.available() || this.live.size > 0) return;
    const tabs = this.deps.repo.loadTabs().filter((t) => t.backend === "vector");
    if (!tabs.length) return;
    let activateId: string | null = null;
    for (const t of tabs) {
      try {
        const p = await this.open({
          url: t.url || "about:blank",
          backend: "vector",
          background: false,
          ownedByRuntime: false,
          activate: false,
        });
        if (t.active) activateId = p.pageId;
      } catch {
        /* an unrestorable tab shouldn't block the rest */
      }
    }
    if (activateId) await this.activate(activateId).catch(() => {});
  }

  private async refreshMeta(lp: LivePage) {
    if (!lp.driver?.isAttached()) return;
    try {
      lp.target.title = await lp.driver.title();
      lp.target.url = lp.driver.url();
      this.persist(lp);
      this.deps.events.emit(EventTypes.PageUpdated, { pageId: lp.target.pageId, title: lp.target.title, url: lp.target.url });
      if (lp.target.url.startsWith("http")) this.deps.repo.addHistory(lp.target.url, lp.target.title, lp.target.pageId);
    } catch {
      /* target racing a navigation — next event fixes it */
    }
  }

  async close(pageId: string) {
    const lp = this.live.get(pageId);
    if (lp) {
      lp.target.viewStatus = "detached";
      this.persist(lp);
      this.live.delete(pageId);
      await lp.driver?.dispose().catch(() => {});
    }
    if (lp?.target.backend === "vector" && this.deps.native.available()) {
      await this.deps.native.closePage(pageId).catch(() => {});
    }
    if (this.activeId === pageId) {
      this.activeId = null;
      // surface the next open page, if any
      const next = [...this.live.values()].find((x) => x.target.viewStatus === "visible" || x.target.backend === "vector");
      if (next) void this.activate(next.target.pageId).catch(() => {});
      else this.deps.events.emit(EventTypes.PageUpdated, { pageId, activePageId: null });
    }
    this.deps.events.emit(EventTypes.PageRemoved, { pageId });
    return { ok: true };
  }

  async activate(pageId: string): Promise<PageTarget> {
    const lp = this.live.get(pageId);
    if (!lp) throw new VectorError("not_found", `no page ${pageId}`);
    if (lp.target.backend === "vector" && this.deps.native.available()) {
      await this.deps.native.focusPage(pageId);
      lp.target.viewStatus = "visible";
    }
    this.activeId = pageId;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { pageId, viewStatus: lp.target.viewStatus, activePageId: pageId });
    return lp.target;
  }

  async navigate(pageId: string, url: string): Promise<PageTarget> {
    return this.enqueue(pageId, async () => {
      const dp = this.driverPageLenient(pageId);
      await dp.navigate(url);
      const lp = this.live.get(pageId);
      if (!lp) throw new VectorError("target_detached", `page ${pageId} detached during navigation`);
      lp.target.url = url;
      this.persist(lp);
      return lp.target;
    });
  }

  /** Human navigation is allowed even while controller=human. */
  private driverPageLenient(pageId: string): DriverPage {
    const lp = this.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached())
      throw new VectorError("target_detached", `page ${pageId} is not attached`);
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
      await this.driverPageLenient(pageId).reload();
      return this.get(pageId);
    });
  }
  async stop(pageId: string) {
    return this.enqueue(pageId, async () => {
      // webContents.stop() halts the load without the renderer's event loop —
      // the only reliable stop when a page never finishes loading
      if (this.live.get(pageId)?.target.backend === "vector" && this.deps.native.available()) {
        await this.deps.native.stopPage(pageId).catch(() => {});
      }
      await this.driverPageLenient(pageId).stop();
      return this.get(pageId);
    });
  }

  // ---------- observation ----------

  async observe(
    pageId: string,
    req: { scope?: "full" | "forms" | "links" | "tables" | "subtree"; subtreeRef?: string; maxElements?: number; maxTextChars?: number; sinceRevision?: number },
  ): Promise<Observation> {
    return this.enqueue(pageId, async () => {
      const dp = this.driverPageLenient(pageId);
      const content = await dp.observe(req);
      const lp = this.live.get(pageId);
      if (!lp) throw new VectorError("target_detached", `page ${pageId} detached during observation`);
      const revision = (this.revCounters.get(pageId) ?? lp.target.lastRevision) + 1;
      this.revCounters.set(pageId, revision);
      lp.target.lastRevision = revision;
      lp.target.url = content.url;
      lp.target.title = content.title;
      const changesSince = this.diffObservations(lp, content);
      const deltaFrom = lp.lastObservationId;
      lp.lastText = content.text;
      lp.lastFields = new Map(content.formFields.map((f) => [f.label ?? f.name ?? f.ref ?? "?", f.value ?? ""]));
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
    });
  }

  private diffObservations(lp: LivePage, next: ObservationContent): string[] {
    const changes: string[] = [];
    if (lp.lastText !== undefined && lp.lastText !== next.text) {
      const a = lp.lastText.split("\n").filter(Boolean);
      const b = next.text.split("\n").filter(Boolean);
      const added = b.filter((l) => !a.includes(l)).slice(0, 5);
      const removed = a.filter((l) => !b.includes(l)).slice(0, 5);
      for (const l of added) changes.push(`+ ${l.slice(0, 120)}`);
      for (const l of removed) changes.push(`- ${l.slice(0, 120)}`);
      if (!added.length && !removed.length) changes.push("page text changed");
    }
    if (lp.lastFields) {
      for (const f of next.formFields) {
        const key = f.label ?? f.name ?? f.ref ?? "?";
        const prev = lp.lastFields.get(key);
        const cur = f.value ?? "";
        if (prev !== undefined && prev !== cur) changes.push(`${key}: "${prev}" -> "${cur}"`);
      }
    }
    return changes;
  }

  // ---------- execution ----------

  async execute(program: Program, ctx: ExecContext = {}): Promise<ProgramResult> {
    const pageId = program.pageId;
    return this.withKeys(program.conflicts, () =>
      this.enqueue(pageId, async () => {
      const lp = this.live.get(pageId);
      if (!lp?.driver?.isAttached()) throw new VectorError("target_detached", `page ${pageId} is not attached`);
      if (lp.target.controller === "human")
        throw new VectorError("conflict", `page ${pageId} is under human control`);
      lp.target.controller = ctx.runId ? "agent" : lp.target.controller === "none" ? "external" : lp.target.controller;
      this.persist(lp);
      // pointer/keyboard input only lands on a visible, laid-out native view —
      // hold the stage lease while a program with interactive steps runs
      const allSteps = collectSteps(program);
      const needsStage =
        lp.target.backend === "vector" &&
        this.deps.native.available() &&
        allSteps.some((s) => INTERACTIVE_OPS.has(s.op));
      if (needsStage) await this.deps.native.acquireStage(pageId).catch(() => ({ ok: false }));
      // takeover epoch: a human claiming the page mid-run must abort in-flight
      // programs rather than fight for the input lane
      const expectedEpoch = lp.target.controllerEpoch;
      const span = this.deps.tracer?.start("program.execute", {
        runId: ctx.runId,
        pageId,
        attrs: { steps: allSteps.length, nodes: program.nodes?.length },
      });
      // §6.2 — proposed vs dispatched vs completed vs verified
      this.deps.tracer?.incr("actions.proposed", allSteps.length);
      let result: ProgramResult;
      try {
        result = await executeProgram(lp.driver, program, {
          allowEval: false,
          ...ctx,
          observe: (req) => this.observe(pageId, req).then((o) => o.content),
          onEmit: (label, value) =>
            this.deps.events.emit("page.emitted", { pageId, runId: ctx.runId, label, value }),
          callOperation: ctx.callOperation ??
            (this.deps.callOperation ? (n, a) => this.deps.callOperation!(n, a, pageId) : undefined),
          checkValid: () => {
            if (lp.target.controllerEpoch !== expectedEpoch)
              throw new VectorError("conflict", `page ${pageId} changed controller mid-run (takeover)`);
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
            this.deps.recordStep?.({
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
        });
      } catch (e) {
        span?.end("failed", { error: e instanceof Error ? e.message : String(e) });
        this.deps.tracer?.incr("program.error");
        throw e;
      } finally {
        if (needsStage) await this.deps.native.releaseStage(pageId).catch(() => {});
      }
      if (lp.target.controller === "agent" || lp.target.controller === "external") {
        lp.target.controller = "none";
      }
      this.persist(lp); // documentEpoch already advanced via onNavigated events
      span?.end(result.status === "completed" ? "ok" : result.status === "cancelled" ? "cancelled" : "failed", {
        status: result.status,
        steps: result.steps.length,
      });
      this.deps.tracer?.incr(`program.${result.status}`);
      return result;
      }),
    );
  }

  // ---------- find / zoom / capture ----------

  async find(pageId: string, text: string, forward: boolean, findNext: boolean) {
    if (!this.deps.native.available()) throw new VectorError("backend_unavailable", "find requires the desktop shell");
    return this.deps.native.findInPage(pageId, text, forward, findNext);
  }
  async stopFind(pageId: string, action: "clear" | "keep") {
    if (!this.deps.native.available()) return { ok: true };
    return this.deps.native.stopFind(pageId, action);
  }
  async zoom(pageId: string, level?: number, delta?: number, reset?: boolean) {
    if (!this.deps.native.available()) throw new VectorError("backend_unavailable", "zoom requires the desktop shell");
    return this.deps.native.setZoom(pageId, level, delta, reset);
  }
  async capture(pageId: string, opts?: { fullPage?: boolean; format?: "dataUrl" | "artifact" }) {
    const dp = this.driverPageLenient(pageId);
    const shot = await dp.screenshot({ fullPage: opts?.fullPage });
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

  takeover(pageId: string): PageTarget {
    const lp = this.live.get(pageId);
    if (!lp) throw new VectorError("not_found", `no page ${pageId}`);
    lp.target.controller = "human";
    lp.target.controllerEpoch++;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "human", controllerEpoch: lp.target.controllerEpoch });
    return lp.target;
  }

  resume(pageId: string): PageTarget {
    const lp = this.live.get(pageId);
    if (!lp) throw new VectorError("not_found", `no page ${pageId}`);
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
    // Only agent/external-controlled pages hand control to the human —
    // ordinary browsing must not pin the page as human-owned forever.
    if (lp.target.controller === "agent" || lp.target.controller === "external") {
      this.takeover(pageId);
    }
  }

  onNativeNavigated(pageId: string, url: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.url = url;
    lp.target.documentEpoch++;
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageUpdated, { pageId, url, documentEpoch: lp.target.documentEpoch });
    void this.refreshMeta(lp);
  }

  onNativeCrashed(pageId: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    lp.target.viewStatus = "crashed";
    lp.target.error = "Renderer process crashed";
    this.persist(lp);
    this.deps.events.emit(EventTypes.PageCrashed, { pageId });
  }

  /** main -> runtime: a native webContents was destroyed out-of-band (popup close). */
  onNativeRemoved(pageId: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
    if (lp.target.viewStatus !== "crashed") lp.target.viewStatus = "detached";
    lp.target.controller = "none";
    this.persist(lp);
    this.live.delete(pageId);
    void lp.driver?.dispose().catch(() => {});
    this.deps.events.emit(EventTypes.PageRemoved, { pageId });
  }

  onNativeTitle(pageId: string, title: string) {
    const lp = this.live.get(pageId);
    if (!lp) return;
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
    lp.target.loading = loading;
    this.deps.events.emit(EventTypes.PageLoading, { pageId, loading });
  }

  /** main -> runtime: a profile-session download began (authoritative record). */
  onNativeDownloadStarted(
    pageId: string | undefined,
    info: { id: string; filename: string; path: string; size: number; totalBytes?: number; startedAt: number },
  ) {
    this.deps.repo.saveDownload({ ...info, pageId, state: "started" });
    this.deps.events.emit(EventTypes.DownloadStarted, { pageId, ...info, state: "started" });
  }

  onNativeDownload(
    pageId: string | undefined,
    info: { id: string; filename: string; path: string; state: string; size: number; totalBytes?: number; startedAt: number; endedAt?: number },
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

function stepInputsOf(s: { op: string } & Record<string, unknown>): Record<string, unknown> {
  const { id, op, timeoutMs, optional, expect, ...rest } = s;
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
