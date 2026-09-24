import { extractElements } from "./extract-script.js";
import type { BrowserContext, ConsoleMessage, Dialog, Download, ElementHandle, Frame, Locator, Page, Request, Response } from "playwright-core";
import {
  AuxError,
  normalizeAuxEnvironment,
  type Condition,
  type ElementRef,
  type FrameInfo,
  type ObservationContent,
  type ObservationRequest,
  type SelectorStrategy,
} from "@aux/contracts";
import { collectObservation, type ObserveScriptArgs, type ObserveScriptResult } from "./observe-script.js";
import { parseTarget, RefRegistry } from "./ref-registry.js";
import { locatorAttempts, selectUniqueLocator } from "./locator-resolve.js";
import { bodyCapturePolicy, defaultResponseCaptureOptions, type ResponseCaptureOptions } from "./response-capture.js";
import { RequestTracker, SETTLED_CONDITION_MS, SETTLED_QUIET_MS, settledProbe } from "./readiness.js";
import { AuxWorld } from "./aux-world.js";
import type { DriverPage, DriverPageEvents, PageIdentity, ScreenshotResult, WaitOutcome } from "./types.js";

const DEFAULT_STEP_TIMEOUT = 15_000;
const DEFAULT_CONDITION_TIMEOUT = 10_000;
const FRAME_PROBE_MS = 2_000;
const FRAME_OBSERVE_MS = 10_000;
/** Upper bound a read/act waits for a main-frame navigation started by earlier input to commit. */
const NAVIGATION_COMMIT_MS = 10_000;

/** Race a promise against a timeout — resolves undefined on timeout.
 * The underlying promise keeps running (frame evaluates can't be cancelled)
 * so rejections are swallowed to avoid unhandled rejections later. */
/** A resolved step target: a live handle from the ref map, or a searched locator. */
type Actionable = Locator | ElementHandle<HTMLElement | SVGElement>;
const isHandle = (a: Actionable): a is ElementHandle<HTMLElement | SVGElement> => typeof (a as Locator).count !== "function";

export function bounded<T>(p: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([
    p.catch(() => undefined),
    new Promise<undefined>((r) => setTimeout(() => r(undefined), ms)),
  ]);
}

/** Passive response capture — env-off switch; the body policy lives in response-capture.ts. */
const CAPTURE_RESPONSES = normalizeAuxEnvironment(process.env).AUX_CAPTURE_RESPONSES !== "0";

interface FrameKeys {
  /** 'main' or 'f1'..'fN' in page.frames() order at observe time. */
  keyToFrame: Map<string, Frame>;
}

export class PlaywrightDriverPage implements DriverPage {
  readonly identity: PageIdentity;
  protected page: Page;
  protected context: BrowserContext;
  private refs: RefRegistry;
  private events: DriverPageEvents = {};
  private frameKeys: FrameKeys = { keyToFrame: new Map() };
  private documentEpoch = 0;
  private dialogHandler: { action: "accept" | "dismiss"; promptText?: string } | null = null;
  private lastDialog: { type: string; message: string } | null = null;
  private consoleLines: { level: string; message: string; atMs: number }[] = [];
  private externalDownloadWaiters: {
    resolve: (v: { suggestedFilename: string; path?: string }) => void;
    reject: (e: Error) => void;
    timer: NodeJS.Timeout;
    startedAt: number;
    downloadId?: string;
    cleanup?: () => void;
  }[] = [];
  private nativeDownloadAuthority = false;
  private attached = true;
  private capture: ResponseCaptureOptions;
  /** Resolves to null when the page cannot host the isolated world (test doubles, exotic targets). */
  private world: Promise<AuxWorld | null>;
  private requests: RequestTracker;
  /** Lowest ref number a new node may take — page-wide across frames, reset per document. */
  private refCounter = 1;
  /** This wrapper's page listeners; the driver's own close/crash handlers must survive dispose. */
  private listeners: [string, (...args: never[]) => void][] = [];

  constructor(opts: {
    page: Page;
    context: BrowserContext;
    identity: PageIdentity;
    refs: RefRegistry;
    initialDocumentEpoch?: number;
    /** override which response bodies are captured (default: xhr/fetch JSON+text) */
    responseCapture?: Partial<ResponseCaptureOptions>;
  }) {
    this.page = opts.page;
    this.context = opts.context;
    this.identity = opts.identity;
    this.refs = opts.refs;
    this.documentEpoch = opts.initialDocumentEpoch ?? 0;
    this.capture = { ...defaultResponseCaptureOptions(), ...opts.responseCapture };
    this.requests = new RequestTracker(() => this.page.mainFrame());
    this.wireEvents();
    // best-effort: without the world, observe/act use Playwright's main-world
    // paths and readiness falls back to bounded frame waits
    this.world =
      typeof this.context?.newCDPSession === "function"
        ? AuxWorld.open(this.context, this.page).catch(() => null)
        : Promise.resolve(null);
  }

  private on(event: string, fn: (...args: never[]) => void) {
    this.page.on(event as never, fn as never);
    this.listeners.push([event, fn]);
  }

  /**
   * Actions return as soon as input is dispatched (`noWaitAfter`). A
   * main-frame navigation the input started is tracked here and awaited — up
   * to commit — by whatever reads or acts on the page next, so a following
   * observe never sees the document being replaced.
   */
  private pendingNavigation: { request: unknown; done: Promise<void>; resolve(): void } | null = null;

  private async navigationCommitted(): Promise<void> {
    const pending = this.pendingNavigation;
    if (!pending) return;
    await bounded(pending.done, NAVIGATION_COMMIT_MS).catch(() => {});
    if (this.pendingNavigation === pending) this.pendingNavigation = null;
  }

  private wireEvents() {
    const endNavigation = (request?: unknown) => {
      const pending = this.pendingNavigation;
      if (pending && (request === undefined || pending.request === request)) {
        this.pendingNavigation = null;
        pending.resolve();
      }
    };
    this.on("request", (request: Request) => {
      this.requests.started(request);
      try {
        if (!request.isNavigationRequest() || request.frame() !== this.page.mainFrame()) return;
      } catch {
        return; // service-worker requests have no frame
      }
      endNavigation();
      let resolve!: () => void;
      const done = new Promise<void>((r) => { resolve = r; });
      this.pendingNavigation = { request, done, resolve };
    });
    // a download or a 204 never commits a document
    this.on("requestfailed", (request: Request) => {
      this.requests.ended(request);
      endNavigation(request);
    });
    this.on("requestfinished", (request: Request) => {
      this.requests.ended(request);
      if (request.isNavigationRequest()) setTimeout(() => endNavigation(request), 50);
    });
    this.on("framenavigated", (frame: Frame) => {
      if (frame !== this.page.mainFrame()) return;
      endNavigation();
      this.documentEpoch++;
      this.refs.clear(this.identity.pageId);
      this.refCounter = 1;
      this.requests.reset();
      this.frameKeys.keyToFrame.clear();
      this.events.onNavigated?.(frame.url(), this.documentEpoch);
    });
    this.on("close", () => {
      this.attached = false;
      this.events.onDestroyed?.("closed");
    });
    this.on("crash", () => {
      this.attached = false;
      this.events.onDestroyed?.("crashed");
    });
    this.on("dialog", (dialog: Dialog) => {
      void this.onDialog(dialog);
    });
    this.on("console", (msg: ConsoleMessage) => {
      const info = { level: msg.type(), message: msg.text(), atMs: Date.now() };
      this.consoleLines.push(info);
      if (this.consoleLines.length > 200) this.consoleLines.splice(0, this.consoleLines.length - 200);
      this.events.onConsole?.(info);
    });
    this.on("download", (download: Download) => {
      const info = { suggestedFilename: download.suggestedFilename(), path: undefined as string | undefined };
      if (!this.nativeDownloadAuthority) {
        const waiters = this.externalDownloadWaiters.splice(0);
        for (const w of waiters) {
          w.cleanup?.();
          w.resolve(info);
        }
      }
      this.events.onDownload?.(info);
    });
    if (CAPTURE_RESPONSES) {
      this.on("response", (response: Response) => {
        void this.captureResponse(response);
      });
    }
  }

  private responseSeq = 0;

  /**
   * Passive response capture (§8): every completed response reports metadata;
   * bodies are fetched only for data responses (xhr/fetch, JSON/text) under
   * a size cap — never for scripts/stylesheets/documents unless the driver
   * was constructed with those resource types. Failures (redirect chains,
   * aborted fetches) are swallowed — capture must never interfere with the page.
   */
  private async captureResponse(response: Response) {
    const handler = this.events.onResponse;
    if (!handler) return;
    const endedAt = Date.now();
    const req = response.request();
    const timing = req.timing();
    const headers = response.headers();
    const contentType = headers["content-type"];
    const resourceType = req.resourceType();
    const info: Parameters<NonNullable<DriverPageEvents["onResponse"]>>[0] = {
      requestId: `rq_${this.identity.pageId}_${++this.responseSeq}`,
      url: response.url(),
      method: req.method(),
      status: response.status(),
      contentType,
      resourceType,
      // timing().startTime is already epoch-ms — -1 when unavailable
      startedAt: timing.startTime > 0 ? Math.round(timing.startTime) : endedAt,
      endedAt,
    };
    const declared = Number(headers["content-length"]);
    const decision = bodyCapturePolicy(
      { resourceType, contentType, contentLength: Number.isFinite(declared) && declared >= 0 ? declared : undefined },
      this.capture,
    );
    if (decision === "too-large") {
      info.bodyBytes = declared;
      info.truncated = true;
    } else if (decision === "capture") {
      try {
        const body = await response.body();
        info.bodyBytes = body.length;
        if (body.length <= this.capture.bodyCapBytes) info.body = body;
        else {
          info.body = body.subarray(0, this.capture.bodyCapBytes);
          info.truncated = true;
        }
      } catch {
        /* body unavailable — metadata still reports */
      }
    }
    try {
      handler(info);
    } catch {
      /* consumer errors must not reach the page */
    }
  }

  private async onDialog(dialog: Dialog) {
    const info = { type: dialog.type(), message: dialog.message() };
    this.lastDialog = info;
    this.events.onDialog?.(info);
    try {
      if (dialog.type() === "beforeunload" && this.identity.backend === "aux") {
        // Veto at the automation boundary. Electron's will-prevent-unload handler
        // owns the human Stay/Leave decision, including native close and reload.
        await dialog.dismiss();
        return;
      }
      const handler = this.dialogHandler;
      if (handler?.action === "accept") await dialog.accept(handler.promptText);
      else await dialog.dismiss();
    } catch {
      /* dialog already handled */
    }
  }

  /** Native Aux downloads complete through the profile session, not Playwright's start event. */
  setNativeDownloadAuthority() { this.nativeDownloadAuthority = true; }

  notifyDownloadStarted(info: { id: string; startedAt: number }) {
    for (const waiter of this.externalDownloadWaiters) {
      if (!waiter.downloadId && info.startedAt >= waiter.startedAt) waiter.downloadId = info.id;
    }
  }

  /** Called by the runtime when the native side reports a terminal download. */
  notifyDownload(info: { id: string; startedAt: number; suggestedFilename: string; path?: string; state: string }) {
    const waiters = this.externalDownloadWaiters.filter(w => w.downloadId === info.id || (!w.downloadId && info.startedAt >= w.startedAt));
    this.externalDownloadWaiters = this.externalDownloadWaiters.filter(w => !waiters.includes(w));
    for (const w of waiters) {
      w.cleanup?.();
      if (info.state === "completed") w.resolve(info);
      else w.reject(new Error(`Download ${info.suggestedFilename} ${info.state}`));
    }
  }

  setEvents(events: DriverPageEvents) {
    this.events = events;
  }

  url() {
    return this.page.url();
  }
  async title() {
    // bounded — page.title() evaluates in the renderer and hangs on a busy
    // main thread (heavy ad/tracking workloads), which would stall the lane
    return (await bounded(this.page.title(), FRAME_PROBE_MS)) ?? "";
  }
  isAttached() {
    return this.attached && !this.page.isClosed();
  }
  epoch() {
    return this.documentEpoch;
  }

  async navigate(url: string, timeoutMs = 30_000) {
    // the world's new-document script must be registered before the document
    // is created, or the first call pays a lazy install on a busy renderer
    await this.world;
    await this.page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" });
  }
  async back(timeoutMs = 15_000) {
    const res = await this.page.goBack({ timeout: timeoutMs, waitUntil: "domcontentloaded" }).catch(() => null);
    if (!res) throw new AuxError("step_failed", "No back history");
  }
  async forward(timeoutMs = 15_000) {
    const res = await this.page.goForward({ timeout: timeoutMs, waitUntil: "domcontentloaded" }).catch(() => null);
    if (!res) throw new AuxError("step_failed", "No forward history");
  }
  async reload(timeoutMs = 30_000) {
    await this.page.reload({ timeout: timeoutMs, waitUntil: "domcontentloaded" });
    // A successful explicit reload recovers a crashed renderer on this same tab.
    this.attached = true;
  }

  /**
   * Bounded quiescence wait: two animation frames, no in-flight fetch/XHR,
   * and no DOM mutation for ~100 ms — or the deadline. Returns whether the
   * page settled. Never throws; a wedged renderer just reports false.
   */
  async waitForSettled(timeoutMs = SETTLED_CONDITION_MS): Promise<boolean> {
    const world = await this.world;
    if (!world) {
      const r = await bounded(this.page.evaluate(settledProbe, { timeoutMs, quietMs: SETTLED_QUIET_MS }), timeoutMs + 250);
      return r === true;
    }
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const left = Math.max(0, deadline - Date.now());
      const dom = await bounded(world.call<boolean>(`__aux.settle(${left}, ${SETTLED_QUIET_MS})`, true), left + 250);
      if (dom !== true) return false;
      if (this.requests.quiet(SETTLED_QUIET_MS)) return true;
      // requests in flight: wait them out, then re-check the DOM — a completed fetch usually renders
      while (!this.requests.quiet(SETTLED_QUIET_MS)) {
        if (Date.now() >= deadline) return false;
        await new Promise((r) => setTimeout(r, Math.min(20, Math.max(1, deadline - Date.now()))));
      }
    }
  }
  async stop() {
    // bounded — window.stop() itself needs the renderer's event loop, which
    // is exactly what's saturated on a never-ending load
    await bounded(this.page.evaluate("window.stop()"), FRAME_PROBE_MS);
  }

  // ---------- target resolution ----------

  private frameForKey(key: string): Frame {
    if (key === "main") return this.page.mainFrame();
    const frame = this.frameKeys.keyToFrame.get(key);
    if (frame && !frame.isDetached()) return frame;
    // re-derive frame keys — the frame set may have changed since observe
    this.assignFrameKeys();
    const retry = this.frameKeys.keyToFrame.get(key);
    if (retry && !retry.isDetached()) return retry;
    throw new AuxError("target_detached", `Frame ${key} no longer exists on ${this.identity.pageId}`);
  }

  private assignFrameKeys() {
    const map = new Map<string, Frame>();
    map.set("main", this.page.mainFrame());
    const frames = this.page.frames().filter((f) => f !== this.page.mainFrame());
    frames.forEach((f, i) => map.set(`f${i + 1}`, f));
    this.frameKeys.keyToFrame = map;
    return map;
  }

  /** Resolve a step target to a Locator in the right frame (search path). */
  private async resolveLocator(target: string): Promise<Locator> {
    const parsed = parseTarget(target);
    let strategy: SelectorStrategy;
    let frameKey = "main";
    if (parsed.kind === "ref") {
      const entry = this.refs.resolve(this.identity.pageId, parsed.ref);
      if (!entry) {
        throw new AuxError(
          "target_detached",
          `Ref ${parsed.ref} is unknown or stale — re-observe the page`,
        );
      }
      strategy = entry.selector;
      frameKey = entry.frame;
    } else {
      strategy = parsed.strategy;
    }
    const frame = this.frameForKey(frameKey);
    return selectUniqueLocator(locatorAttempts(frame, strategy), target);
  }

  async originForTarget(target: string): Promise<string> {
    await this.navigationCommitted();
    const parsed = parseTarget(target);
    let frame = this.page.mainFrame();
    let iframeRef = false;
    if (parsed.kind === "ref") {
      const entry = this.refs.resolve(this.identity.pageId, parsed.ref);
      if (!entry) throw new AuxError("target_detached", `Ref ${parsed.ref} is unknown or stale — re-observe the page`);
      frame = this.frameForKey(entry.frame);
      iframeRef = entry.tag.toLowerCase() === "iframe";
    }
    if ((parsed.kind !== "ref" || iframeRef) && this.page.frames().some(child => child.parentFrame() === frame)) {
      const locator = await this.resolveLocator(target);
      const handle = isHandle(locator) ? locator : await locator.elementHandle();
      const child = await handle?.contentFrame();
      if (child) frame = child;
    }
    try { return new URL(frame.url()).origin; }
    catch { throw new AuxError("target_detached", "Target frame is navigating — re-observe the page"); }
  }

  hasForeignFrames(): boolean {
    const main = this.page.mainFrame().url();
    let origin: string;
    try { origin = new URL(main).origin; } catch { return true; }
    return this.page.frames().some(frame => {
      if (frame === this.page.mainFrame()) return false;
      try { return new URL(frame.url()).origin !== origin; }
      catch { return true; }
    });
  }

  /**
   * One-hop ref resolution (speed P0-3 / plan A7): the observe script keeps
   * the live `ref → Element` map, so a ref resolves to its node directly —
   * no css/xpath/role search. A main-frame node lives in the aux world, which
   * Playwright cannot hand out handles for; the world computes a fresh css
   * path for it instead. Child frames keep the map in their own world and
   * return an ElementHandle. Playwright's actionability checks apply either
   * way. Falls back to the registry selectors when the node is gone
   * (removed, re-rendered, or the document changed), which is also what
   * produces `target_detached`.
   */
  private async resolveActionable(target: string): Promise<Actionable> {
    await this.navigationCommitted();
    const parsed = parseTarget(target);
    if (parsed.kind === "ref") {
      const entry = this.refs.resolve(this.identity.pageId, parsed.ref);
      if (entry) {
        const frame = this.frameForKey(entry.frame);
        const world = entry.frame === "main" ? await this.world : null;
        if (world) {
          const css = await bounded(world.call<string | null>(`__aux.css(${JSON.stringify(parsed.ref)})`), FRAME_PROBE_MS);
          const loc = css ? await selectUniqueLocator(locatorAttempts(frame, { css }), target).catch(() => null) : null;
          if (loc) return loc;
        } else {
          const handle = await bounded(
            frame.evaluateHandle((ref) => {
              const m = (globalThis as unknown as { __auxStore?: { refs?: Map<string, Element> } }).__auxStore?.refs;
              const el = m instanceof Map ? m.get(ref) : undefined;
              return el && el.isConnected ? el : null;
            }, parsed.ref),
            FRAME_PROBE_MS,
          );
          const el = handle?.asElement();
          if (el) return el as ElementHandle<HTMLElement | SVGElement>;
          await handle?.dispose().catch(() => {});
        }
      }
    }
    return this.resolveLocator(target);
  }

  /** A registered main-frame ref plus the world holding its node; null routes to Playwright. */
  private async worldRef(target: string): Promise<{ world: AuxWorld; ref: string } | null> {
    await this.navigationCommitted();
    const parsed = parseTarget(target);
    if (parsed.kind !== "ref" || this.refs.resolve(this.identity.pageId, parsed.ref)?.frame !== "main") return null;
    const world = await this.world;
    return world ? { world, ref: JSON.stringify(parsed.ref) } : null;
  }

  /**
   * Raw CDP pointer input: one world call scrolls the node in, checks it is
   * connected, visible, enabled and actually hit at its centre, then the
   * mouse events are pipelined on the page session. Any failed check returns
   * false so the caller takes Playwright's actionability path — its waits
   * and error messages stay the behaviour for everything but the easy case.
   */
  private async rawPointer(target: string, button: "left" | "right" | "middle" | "none", clicks: number): Promise<boolean> {
    const w = await this.worldRef(target);
    if (!w) return false;
    const point = await bounded(w.world.call<[number, number] | string>(`__aux.point(${w.ref})`), FRAME_PROBE_MS);
    if (!Array.isArray(point)) return false;
    const [x, y] = point;
    const mask = button === "left" ? 1 : button === "right" ? 2 : button === "middle" ? 4 : 0;
    const sent = [w.world.input("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", buttons: 0 })];
    for (let n = 1; n <= clicks; n++) {
      sent.push(w.world.input("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button, buttons: mask, clickCount: n }));
      sent.push(w.world.input("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button, buttons: 0, clickCount: n }));
    }
    await Promise.all(sent);
    return true;
  }

  /** Focus (and for fill, select) the ref's node in the world; true when keyboard input may follow. */
  private async rawFocus(target: string, fill: boolean): Promise<AuxWorld | null> {
    const w = await this.worldRef(target);
    if (!w) return null;
    const r = await bounded(w.world.call<string>(`__aux.focus(${w.ref}, ${fill})`), FRAME_PROBE_MS);
    return r === "ok" ? w.world : null;
  }

  // ---------- actions ----------

  async click(target: string, button: "left" | "right" | "middle" = "left", timeoutMs = DEFAULT_STEP_TIMEOUT) {
    if (await this.rawPointer(target, button, 1)) return;
    const loc = await this.resolveActionable(target);
    await loc.click({ button, timeout: timeoutMs, noWaitAfter: true });
  }
  async dblclick(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    if (await this.rawPointer(target, "left", 2)) return;
    const loc = await this.resolveActionable(target);
    await loc.dblclick({ timeout: timeoutMs, noWaitAfter: true });
  }
  async hover(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    if (await this.rawPointer(target, "none", 0)) return;
    const loc = await this.resolveActionable(target);
    await loc.hover({ timeout: timeoutMs });
  }
  async fill(target: string, value: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    // select-all + Input.insertText, exactly Playwright's fill minus the
    // actionability waits: frameworks see trusted beforeinput/input events
    const world = await this.rawFocus(target, true);
    if (world) {
      if (value) await world.input("Input.insertText", { text: value });
      else {
        const key = { key: "Delete", code: "Delete", windowsVirtualKeyCode: 46 };
        await Promise.all([world.input("Input.dispatchKeyEvent", { type: "keyDown", ...key }), world.input("Input.dispatchKeyEvent", { type: "keyUp", ...key })]);
      }
      return;
    }
    const loc = await this.resolveActionable(target);
    await loc.fill(value, { timeout: timeoutMs });
  }
  async typeText(target: string, value: string, delayMs = 0, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    if (await this.rawFocus(target, false)) {
      await this.page.keyboard.type(value, { delay: delayMs });
      return;
    }
    const loc = await this.resolveActionable(target);
    if (isHandle(loc)) await loc.type(value, { delay: delayMs, timeout: timeoutMs });
    else await loc.pressSequentially(value, { delay: delayMs, timeout: timeoutMs });
  }
  async press(key: string, target?: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    if (!target) {
      await this.page.keyboard.press(key);
      return;
    }
    if (await this.rawFocus(target, false)) {
      await this.page.keyboard.press(key);
      return;
    }
    const loc = await this.resolveActionable(target);
    await loc.press(key, { timeout: timeoutMs });
  }
  async check(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveActionable(target);
    await loc.check({ timeout: timeoutMs });
  }
  async uncheck(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveActionable(target);
    await loc.uncheck({ timeout: timeoutMs });
  }
  async select(target: string, value: string | string[], timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveActionable(target);
    await loc.selectOption(Array.isArray(value) ? value.map((v) => ({ label: v })) : { label: value }, { timeout: timeoutMs });
  }
  async scroll(opts: { target?: string; direction: "up" | "down" | "top" | "bottom"; amount?: number }) {
    const amount = opts.amount ?? 700;
    if (opts.target) {
      const loc = await this.resolveActionable(opts.target);
      await loc.scrollIntoViewIfNeeded({ timeout: DEFAULT_STEP_TIMEOUT });
      return;
    }
    await this.page.evaluate(
      ([dir, amt]) => {
        const d = dir as string;
        const a = amt as number;
        if (d === "top") scrollTo(0, 0);
        else if (d === "bottom") scrollTo(0, document.documentElement.scrollHeight);
        else scrollBy(0, d === "up" ? -a : a);
      },
      [opts.direction, amount] as const,
    );
  }
  async dragTo(target: string, to: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const src = await this.resolveLocator(target);
    const dst = await this.resolveLocator(to);
    await src.dragTo(dst, { timeout: timeoutMs });
  }
  async clickPoint(x: number, y: number, button: "left" | "right" | "middle" = "left") {
    await this.page.mouse.click(x, y, { button });
  }
  async uploadFiles(target: string, files: string[], timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveActionable(target);
    await loc.setInputFiles(files, { timeout: timeoutMs });
  }

  /**
   * Scroll through a container or the viewport, accumulating items keyed by a
   * stable attribute/text so virtualized and infinite lists collect fully.
   * Stops on item-limit, or at the scroller's end once nothing new appears.
   *
   * A pass that adds no keys while the scroll position is still advancing is
   * NOT stagnation — a loaded batch can span several viewports of already
   * collected rows. Waits are condition-based: a MutationObserver resolves
   * the moment the list grows or re-renders, `settleMs` is only the cap.
   */
  async collectScroll(opts: {
    item: string;
    container?: string;
    key?: string;
    fields?: { name: string; selector?: string; attribute?: string }[];
    limit?: number;
    maxScrolls?: number;
    settleMs?: number;
  }): Promise<{ items: Record<string, unknown>[]; collected: number }> {
    const collected = new Map<string, Record<string, unknown>>();
    const limit = opts.limit ?? 1000;
    const maxScrolls = opts.maxScrolls ?? 60;
    const settle = opts.settleMs ?? 180;
    type Batch = { rows: { k: string; data: Record<string, unknown> }[]; atEnd: boolean; sig: string };
    const collectOnce = (scroll: boolean): Promise<Batch> =>
      this.page.evaluate(
        ({ container, item, key, fields, doScroll }) => {
          const scroller = container ? document.querySelector(container) : null;
          const roots = (scroller ?? document).querySelectorAll(item);
          const rows: { k: string; data: Record<string, unknown> }[] = [];
          for (const el of roots) {
            const k = (key ? el.getAttribute(key) : null) ?? el.textContent?.trim();
            if (!k) continue;
            const data: Record<string, unknown> = {};
            if (fields?.length) {
              for (const f of fields) {
                const t = f.selector ? el.querySelector(f.selector) : el;
                data[f.name] = f.attribute ? t?.getAttribute(f.attribute) : t?.textContent?.trim();
              }
            } else {
              data.text = el.textContent?.trim();
            }
            rows.push({ k, data });
          }
          let atEnd: boolean;
          if (scroller instanceof HTMLElement) {
            if (doScroll) scroller.scrollTop += scroller.clientHeight;
            atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
          } else {
            if (doScroll) window.scrollBy(0, window.innerHeight);
            atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
          }
          const sig = `${roots.length}:${rows[0]?.k ?? ""}:${rows[rows.length - 1]?.k ?? ""}`;
          return { rows, atEnd, sig };
        },
        { container: opts.container, item: opts.item, key: opts.key, fields: opts.fields, doScroll: scroll },
      );
    /** Resolve true as soon as the item set differs from `sig` (append or
     * virtualized re-render), false once `timeoutMs` passes without change. */
    const waitForChange = (sig: string, timeoutMs: number): Promise<boolean> =>
      this.page
        .evaluate(
          ({ container, item, key, sig, timeoutMs }) =>
            new Promise<boolean>((resolve) => {
              const scroller = container ? document.querySelector(container) : null;
              const root = scroller ?? document.body ?? document.documentElement;
              const current = () => {
                const roots = (scroller ?? document).querySelectorAll(item);
                const keyOf = (el: Element) => (key ? el.getAttribute(key) : null) ?? el.textContent?.trim() ?? "";
                const first = roots[0];
                const last = roots[roots.length - 1];
                return `${roots.length}:${first ? keyOf(first) : ""}:${last ? keyOf(last) : ""}`;
              };
              if (current() !== sig) return resolve(true);
              let timer = 0;
              const mo = new MutationObserver(() => {
                if (current() === sig) return;
                mo.disconnect();
                clearTimeout(timer);
                resolve(true);
              });
              mo.observe(root, { childList: true, subtree: true, characterData: true });
              timer = setTimeout(() => {
                mo.disconnect();
                resolve(false);
              }, timeoutMs) as unknown as number;
            }),
          { container: opts.container, item: opts.item, key: opts.key, sig, timeoutMs },
        )
        .catch(() => false);
    const absorb = (batch: Batch) => {
      let added = 0;
      for (const r of batch.rows) {
        if (!collected.has(r.k) && collected.size < limit) {
          collected.set(r.k, r.data);
          added++;
        }
      }
      return added;
    };
    let stagnantAtEnd = 0;
    for (let i = 0; i < maxScrolls && collected.size < limit; i++) {
      const batch = await collectOnce(true);
      const added = absorb(batch);
      if (collected.size >= limit) break;
      if (added > 0) stagnantAtEnd = 0;
      // the scroll event that drives loaders/virtualizers fires on the next
      // frame — wait for the list to react rather than a fixed interval
      let changed = await waitForChange(batch.sig, settle);
      if (!batch.atEnd) continue; // still traversing content — never stagnation
      if (added === 0 && ++stagnantAtEnd >= 3) break; // end reached, list churns but yields nothing new
      if (!changed) {
        // hitting the bottom is exactly what makes infinite scrollers load —
        // give a slow batch a longer, bounded window before calling it the end
        changed = await waitForChange(batch.sig, settle * 3);
        if (!changed) break;
      }
    }
    // a batch that landed during the last wait is still on the page
    absorb(await collectOnce(false));
    return { items: [...collected.values()], collected: Math.min(collected.size, limit) };
  }

  // ---------- waits ----------

  async waitFor(condition: Condition): Promise<WaitOutcome> {
    await this.navigationCommitted();
    const timeout = "timeoutMs" in condition && condition.timeoutMs ? condition.timeoutMs : DEFAULT_CONDITION_TIMEOUT;
    try {
      switch (condition.kind) {
        case "textVisible":
          await this.page.getByText(condition.text, { exact: false }).first().waitFor({ state: "visible", timeout });
          break;
        case "selector":
          await this.page.locator(condition.selector).first().waitFor({ state: condition.state, timeout });
          break;
        case "refReady": {
          const loc = await this.resolveLocator(condition.ref);
          await loc.waitFor({ state: "attached", timeout });
          break;
        }
        case "urlMatches": {
          const p = condition.pattern;
          const regex = p.startsWith("/") && p.endsWith("/") ? new RegExp(p.slice(1, -1)) : null;
          await this.page.waitForURL(url => regex ? regex.test(url.href) : url.href.includes(p), { timeout });
          break;
        }
        case "navigationSettled":
          await this.page.waitForLoadState("domcontentloaded", { timeout });
          await this.page.waitForLoadState("load", { timeout: Math.min(timeout, 10_000) }).catch(() => {});
          break;
        case "settled": {
          const ok = await this.waitForSettled(condition.timeoutMs ?? SETTLED_CONDITION_MS);
          if (!ok) return { ok: false, timedOut: true, detail: "page did not settle: requests in flight or DOM still changing" };
          break;
        }
        case "downloadCompleted": {
          const res = await this.waitForDownload(timeout);
          return { ok: true, timedOut: false, detail: res.suggestedFilename };
        }
        case "response":
          await this.page.waitForResponse(
            (r) => r.url().includes(condition.urlIncludes) && (condition.status === undefined || r.status() === condition.status),
            { timeout },
          );
          break;
        case "expression":
          await this.page.waitForFunction(condition.expression, undefined, { timeout });
          break;
      }
      return { ok: true, timedOut: false };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/timeout/i.test(msg)) return { ok: false, timedOut: true, detail: msg };
      return { ok: false, timedOut: false, detail: msg };
    }
  }

  waitForDownload(timeoutMs = 30_000, signal?: AbortSignal): Promise<{ suggestedFilename: string; path?: string }> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(new AuxError("conflict", "Download wait was cancelled")); return; }
      const waiter = { resolve, reject, timer: undefined as unknown as NodeJS.Timeout, startedAt: Date.now(), cleanup: undefined as (() => void) | undefined };
      const cleanup = () => {
        clearTimeout(waiter.timer);
        signal?.removeEventListener("abort", onAbort);
        this.externalDownloadWaiters = this.externalDownloadWaiters.filter(w => w !== waiter);
      };
      const onAbort = () => { cleanup(); reject(new AuxError("conflict", "Download wait was cancelled")); };
      waiter.cleanup = cleanup;
      waiter.timer = setTimeout(() => { cleanup(); reject(new AuxError("condition_timeout", "Timed out waiting for download")); }, timeoutMs);
      this.externalDownloadWaiters.push(waiter);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  async handleDialog(action: "accept" | "dismiss", promptText?: string) {
    this.dialogHandler = { action, promptText };
    // clear after one use to avoid silently swallowing later dialogs
    setTimeout(() => {
      if (this.dialogHandler?.action === action) this.dialogHandler = null;
    }, 30_000);
  }

  async console(): Promise<{ level: string; message: string; atMs?: number }[]> {
    return this.consoleLines.slice();
  }

  // ---------- observation ----------

  async screenshot(opts?: { fullPage?: boolean }): Promise<ScreenshotResult> {
    await this.navigationCommitted();
    const buffer = await this.page.screenshot({ fullPage: opts?.fullPage ?? false, type: "png" });
    const meta = await this.page
      .evaluate(() => ({ w: innerWidth, h: innerHeight, s: devicePixelRatio || 1 }))
      .catch(() => ({ w: 0, h: 0, s: 1 }));
    return { buffer, width: meta.w, height: meta.h, scale: meta.s };
  }

  /** One small evaluate on the main frame; cache only when child DOM cannot enter the observation. */
  async observeFingerprint(): Promise<string> {
    await this.navigationCommitted();
    // without the world's mutation tracker a text-only change would leave the
    // fingerprint unchanged, so such a document is never served from cache
    const world = await this.world;
    if (!world) throw new AuxError("backend_unavailable", "mutation tracker unavailable on this page");
    const main = await bounded(world.call<string>("__aux.fingerprint()"), FRAME_PROBE_MS);
    if (typeof main !== "string") throw new AuxError("backend_unavailable", "fingerprint probe timed out");
    const mainOrigin = new URL(this.page.url()).origin;
    const children = this.page.frames().filter(frame => frame !== this.page.mainFrame());
    for (const frame of children) {
      let origin: string;
      try { origin = new URL(frame.url()).origin; } catch { throw new AuxError("backend_unavailable", "Child frame is navigating"); }
      if (origin === "null" || origin === mainOrigin) throw new AuxError("backend_unavailable", "Observed child frame needs a fresh read");
    }
    const frames = children.map(frame => frame.url()).join("\u0002");
    return frames ? `${main}\u0001frames:${frames}` : main;
  }

  async observe(req?: Partial<ObservationRequest>): Promise<ObservationContent> {
    await this.navigationCommitted();
    const maxElements = req?.maxElements ?? 120;
    const maxTextChars = req?.maxTextChars ?? 6000;
    const frameMap = this.assignFrameKeys();
    const frames: FrameInfo[] = [];
    const allElements: ElementRef[] = [];
    const formFields: ObservationContent["formFields"] = [];
    const tables: ObservationContent["tables"] = [];
    const links: ObservationContent["links"] = [];
    let text = "";
    let headings: string[] = [];
    let truncated = false;
    let elementsTotal = 0;
    let viewport = { width: 0, height: 0, scale: 1 };
    let scroll = { x: 0, y: 0, maxY: 0 };
    // a subtree pass adds to the page's refs; a full pass replaces them
    const partial = req?.scope === "subtree";
    const world = await this.world;
    let title: string | undefined;

    let mainOrigin: string | null = null;
    try {
      mainOrigin = new URL(this.page.url()).origin;
    } catch {
      /* unparsable — every frame falls through to the probe */
    }
    // Origin check first: default observations skip provably cross-origin
    // frames without a round-trip. An explicitly selected iframe subtree may
    // inspect that frame, so useful login/checkout widgets remain operable.
    // Every read stays bounded so a wedged frame cannot stall the page lane.
    const sameOriginOf = async (frame: Frame): Promise<boolean> => {
      try {
        const origin = new URL(frame.url()).origin;
        if (mainOrigin !== null && origin !== "null") return origin === mainOrigin;
      } catch {
        /* ambiguous url — probe below */
      }
      const probed = (
        (await bounded(
          frame.evaluate(() => true).then(() => true).catch(() => false),
          FRAME_PROBE_MS,
        )) === true
      );
      // An about:blank frame may navigate while the probe is in flight. Use
      // its current URL before allowing a content read.
      try {
        const currentOrigin = new URL(frame.url()).origin;
        if (mainOrigin !== null && currentOrigin !== "null") return currentOrigin === mainOrigin;
      } catch { /* still ambiguous */ }
      return probed;
    };
    // Subtree scope (plan A10): `subtreeRef` is an `rN` from the last
    // observation or a css selector. A ref resolves through the registry to
    // its css path *and* frame; a ref to an <iframe> scopes the observation
    // to that frame's document instead.
    let subtree: { css?: string; ref?: string; frameKey?: string; onlyFrame?: Frame } | undefined;
    if (req?.scope === "subtree" && req.subtreeRef) {
      const parsed = parseTarget(req.subtreeRef);
      if (parsed.kind === "ref") {
        const entry = this.refs.resolve(this.identity.pageId, parsed.ref);
        if (!entry) throw new AuxError("target_detached", `subtreeRef ${parsed.ref} is unknown or stale — re-observe the page`);
        subtree = { css: entry.selector.css, ref: parsed.ref, frameKey: entry.frame };
        if (entry.tag === "iframe" && entry.selector.css) {
          const owner = this.frameForKey(entry.frame);
          const child = await bounded(
            owner.$(entry.selector.css).then((h) => h?.contentFrame() ?? null),
            FRAME_PROBE_MS,
          ).catch(() => null);
          if (child) subtree = { onlyFrame: child };
        }
      } else {
        const css = parsed.strategy.css ?? req.subtreeRef;
        subtree = { css, frameKey: "main" };
        const child = await bounded(
          this.page.mainFrame().$(css).then(handle => handle?.contentFrame() ?? null),
          FRAME_PROBE_MS,
        ).catch(() => null);
        if (child) subtree = { onlyFrame: child };
      }
    }
    for (const [key, frame] of frameMap) {
      const sameOrigin = await sameOriginOf(frame);
      frames.push({ frame: key, url: frame.url(), name: frame.name() || undefined, sameOrigin });
      if (!sameOrigin && frame !== subtree?.onlyFrame) continue;
      if (subtree?.onlyFrame && frame !== subtree.onlyFrame) continue;
      if (subtree?.frameKey && key !== subtree.frameKey && key !== "main") continue;
      const scoped = subtree && !subtree.onlyFrame && key === subtree.frameKey;
      // a frame that navigated mid-observe, is not evaluatable, or timed out
      // is skipped rather than stalling the lane
      const part = await this.collect(key, frame, world, {
        maxElements: Math.max(10, maxElements - allElements.length),
        maxTextChars,
        subtreeCss: scoped ? subtree!.css : undefined,
        subtreeRef: scoped ? subtree!.ref : undefined,
        frameKey: key,
        refStart: this.refCounter,
        mergeRefs: partial,
      });
      if (!part) continue;
      elementsTotal += part.elementsTotal;
      truncated ||= part.truncated;
      if (key === "main") {
        viewport = part.viewport;
        scroll = part.scroll;
        text = part.text;
        headings = part.headings;
        title = part.title; // the script already read document.title — no extra round trip
      } else {
        // keep subframe text out of the main summary; elements carry frame key
      }
      allElements.push(...(part.elements as ElementRef[]));
      formFields.push(...part.formFields);
      tables.push(...part.tables);
      links.push(...part.links);
      if (allElements.length >= maxElements) {
        truncated = true;
        break;
      }
    }

    this.refs.register(this.identity.pageId, allElements, { replace: !partial });
    const textChars = text.length;
    return {
      url: this.page.url(),
      title: title ?? (await this.title()),
      viewport,
      scroll,
      frames,
      text,
      headings,
      elements: allElements,
      formFields,
      tables,
      links,
      dialogs: this.lastDialog ? [this.lastDialog] : [],
      truncated,
      stats: {
        elementsTotal,
        elementsShown: allElements.length,
        textChars,
        approxTokens: Math.ceil((textChars + allElements.length * 60) / 4),
      },
    };
  }

  /** One frame's observe pass: the aux world for the main frame, the frame's own world otherwise. */
  private async collect(key: string, frame: Frame, world: AuxWorld | null, args: ObserveScriptArgs): Promise<ObserveScriptResult | undefined> {
    const part = await bounded(
      key === "main" && world
        ? world.call<string>(`__aux.collect(${JSON.stringify(args)})`).then((json) => JSON.parse(json) as ObserveScriptResult)
        : frame.evaluate(collectObservation, args),
      FRAME_OBSERVE_MS,
    );
    if (part) this.refCounter = Math.max(this.refCounter, part.nextRef);
    return part;
  }

  async expandRef(ref: string, maxElements = 60): Promise<ElementRef[]> {
    const entry = this.refs.resolve(this.identity.pageId, ref);
    if (!entry?.selector.css) return [];
    const part = await this.collect(entry.frame, this.frameForKey(entry.frame), await this.world, {
      maxElements,
      maxTextChars: 0,
      subtreeCss: entry.selector.css,
      subtreeRef: ref,
      frameKey: entry.frame,
      refStart: this.refCounter,
      mergeRefs: true,
    });
    const els = (part?.elements ?? []) as ElementRef[];
    this.refs.register(this.identity.pageId, els);
    return els;
  }

  async extract(fields: { name: string; selector?: string; attribute?: string; all?: boolean }[]): Promise<Record<string, unknown>> {
    await this.navigationCommitted();
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.name === "url") {
        out[f.name] = this.page.url();
        continue;
      }
      if (f.name === "title") {
        out[f.name] = await this.title();
        continue;
      }
      if (!f.selector) {
        const values = await this.page.evaluate(extractElements, null).catch(() => [""]);
        out[f.name] = values[0] ?? "";
        continue;
      }
      const loc = this.page.locator(f.selector);
      const values = await (f.all ? loc : loc.first()).evaluateAll(extractElements, f.attribute ?? null);
      out[f.name] = f.all ? values.map(value => value ?? "") : values[0] ?? null;
    }
    return out;
  }

  async evaluate(expression: string): Promise<unknown> {
    return this.page.evaluate(expression);
  }

  rawPage(): Page {
    return this.page;
  }

  async dispose() {
    // We never close the underlying page — lifecycle belongs to the
    // native tab manager or to Chrome. Detach this wrapper's listeners only.
    this.attached = false;
    for (const waiter of this.externalDownloadWaiters.splice(0)) {
      waiter.cleanup?.();
      waiter.reject(new AuxError("target_detached", "Page detached while waiting for download"));
    }
    for (const [event, fn] of this.listeners.splice(0)) this.page.off(event as never, fn as never);
    void this.world.then((w) => w?.dispose());
  }
}
