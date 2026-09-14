import type { BrowserContext, Dialog, Frame, Locator, Page, Response } from "playwright-core";
import {
  VectorError,
  type Condition,
  type ElementRef,
  type FrameInfo,
  type ObservationContent,
  type ObservationRequest,
  type SelectorStrategy,
} from "@vector/contracts";
import { collectObservation, type ObserveScriptResult } from "./observe-script.js";
import { parseTarget, RefRegistry } from "./ref-registry.js";
import type { DriverPage, DriverPageEvents, PageIdentity, ScreenshotResult, WaitOutcome } from "./types.js";

const DEFAULT_STEP_TIMEOUT = 15_000;
const DEFAULT_CONDITION_TIMEOUT = 10_000;
const FRAME_PROBE_MS = 2_000;
const FRAME_OBSERVE_MS = 10_000;

/** Race a promise against a timeout — resolves undefined on timeout.
 * The underlying promise keeps running (frame evaluates can't be cancelled)
 * so rejections are swallowed to avoid unhandled rejections later. */
export function bounded<T>(p: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([
    p.catch(() => undefined),
    new Promise<undefined>((r) => setTimeout(() => r(undefined), ms)),
  ]);
}

/** Passive response capture — env-off switch plus the capture policy. */
const CAPTURE_RESPONSES = process.env.VECTOR_CAPTURE_RESPONSES !== "0";
const BODY_CAP = 256 * 1024;
const CAPTURABLE_TYPE = /json|text\/|xml|javascript|x-www-form-urlencoded|csv|html/i;

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
  private externalDownloadWaiters: {
    resolve: (v: { suggestedFilename: string; path?: string }) => void;
    reject: (e: Error) => void;
    timer: NodeJS.Timeout;
  }[] = [];
  private attached = true;

  constructor(opts: {
    page: Page;
    context: BrowserContext;
    identity: PageIdentity;
    refs: RefRegistry;
  }) {
    this.page = opts.page;
    this.context = opts.context;
    this.identity = opts.identity;
    this.refs = opts.refs;
    this.wireEvents();
  }

  private wireEvents() {
    this.page.on("framenavigated", (frame) => {
      if (frame === this.page.mainFrame()) {
        this.documentEpoch++;
        this.refs.clear(this.identity.pageId);
        this.frameKeys.keyToFrame.clear();
        this.events.onNavigated?.(frame.url(), this.documentEpoch);
      }
    });
    this.page.on("close", () => {
      this.attached = false;
      this.events.onDestroyed?.("closed");
    });
    this.page.on("crash", () => {
      this.attached = false;
      this.events.onDestroyed?.("crashed");
    });
    this.page.on("dialog", (dialog) => {
      void this.onDialog(dialog);
    });
    this.page.on("download", (download) => {
      const info = { suggestedFilename: download.suggestedFilename(), path: undefined as string | undefined };
      const waiters = this.externalDownloadWaiters.splice(0);
      for (const w of waiters) {
        clearTimeout(w.timer);
        w.resolve(info);
      }
      this.events.onDownload?.(info);
    });
    if (CAPTURE_RESPONSES) {
      this.page.on("response", (response) => {
        void this.captureResponse(response);
      });
    }
  }

  private responseSeq = 0;

  /**
   * Passive response capture (§8): every completed response reports metadata;
   * bodies are fetched only for machine-readable types under a size cap.
   * Failures (redirect chains, aborted fetches) are swallowed — capture must
   * never interfere with the page.
   */
  private async captureResponse(response: Response) {
    const handler = this.events.onResponse;
    if (!handler) return;
    const endedAt = Date.now();
    const req = response.request();
    const timing = req.timing();
    const headers = response.headers();
    const contentType = headers["content-type"];
    const info: Parameters<NonNullable<DriverPageEvents["onResponse"]>>[0] = {
      requestId: `rq_${this.identity.pageId}_${++this.responseSeq}`,
      url: response.url(),
      method: req.method(),
      status: response.status(),
      contentType,
      // timing().startTime is already epoch-ms — -1 when unavailable
      startedAt: timing.startTime > 0 ? Math.round(timing.startTime) : endedAt,
      endedAt,
    };
    if (CAPTURABLE_TYPE.test(contentType ?? "")) {
      try {
        const body = await response.body();
        info.bodyBytes = body.length;
        if (body.length <= BODY_CAP) info.body = body;
        else {
          info.body = body.subarray(0, BODY_CAP);
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
      const handler = this.dialogHandler;
      if (handler?.action === "accept") await dialog.accept(handler.promptText);
      else await dialog.dismiss();
    } catch {
      /* dialog already handled */
    }
  }

  /** Called by the runtime when the native side reports a finished download. */
  notifyDownload(info: { suggestedFilename: string; path?: string }) {
    const waiters = this.externalDownloadWaiters.splice(0);
    for (const w of waiters) {
      clearTimeout(w.timer);
      w.resolve(info);
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
    await this.page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" });
  }
  async back(timeoutMs = 15_000) {
    const res = await this.page.goBack({ timeout: timeoutMs, waitUntil: "domcontentloaded" }).catch(() => null);
    if (!res) throw new VectorError("step_failed", "No back history");
  }
  async forward(timeoutMs = 15_000) {
    const res = await this.page.goForward({ timeout: timeoutMs, waitUntil: "domcontentloaded" }).catch(() => null);
    if (!res) throw new VectorError("step_failed", "No forward history");
  }
  async reload(timeoutMs = 30_000) {
    await this.page.reload({ timeout: timeoutMs, waitUntil: "domcontentloaded" });
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
    throw new VectorError("target_detached", `Frame ${key} no longer exists on ${this.identity.pageId}`);
  }

  private assignFrameKeys() {
    const map = new Map<string, Frame>();
    map.set("main", this.page.mainFrame());
    const frames = this.page.frames().filter((f) => f !== this.page.mainFrame());
    frames.forEach((f, i) => map.set(`f${i + 1}`, f));
    this.frameKeys.keyToFrame = map;
    return map;
  }

  private locatorIn(frame: Frame, strategy: SelectorStrategy): Locator {
    const candidates: Locator[] = [];
    if (strategy.role) {
      candidates.push(
        frame.getByRole(strategy.role.role as never, {
          name: strategy.role.name,
          exact: false,
        }),
      );
    }
    if (strategy.css) candidates.push(frame.locator(strategy.css));
    if (strategy.xpath) candidates.push(frame.locator(strategy.xpath));
    if (strategy.text) candidates.push(frame.getByText(strategy.text, { exact: false }));
    if (candidates.length === 0) throw new VectorError("invalid_params", "Empty selector strategy");
    return candidates[0]!;
  }

  /** Resolve a step target to a Locator in the right frame. */
  private async resolveLocator(target: string): Promise<Locator> {
    const parsed = parseTarget(target);
    let strategy: SelectorStrategy;
    let frameKey = "main";
    if (parsed.kind === "ref") {
      const entry = this.refs.resolve(this.identity.pageId, parsed.ref);
      if (!entry) {
        throw new VectorError(
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

    // Try strategies in order of reliability; require exactly one match.
    const attempts: Locator[] = [];
    if (strategy.role) attempts.push(frame.getByRole(strategy.role.role as never, { name: strategy.role.name, exact: false }));
    if (strategy.css) attempts.push(frame.locator(strategy.css));
    if (strategy.xpath) attempts.push(frame.locator(strategy.xpath));
    if (strategy.text) attempts.push(frame.getByText(strategy.text, { exact: false }));

    let lastErr: unknown = null;
    for (const loc of attempts) {
      try {
        const count = await loc.count();
        if (count === 1) return loc;
        if (count > 1) {
          // narrow to first visible match rather than failing blind
          const visible = loc.filter({ visible: true });
          const vc = await visible.count();
          if (vc === 1) return visible;
          throw new VectorError(
            "target_ambiguous",
            `Target "${target}" matched ${count} elements — re-observe or use a more specific selector`,
          );
        }
      } catch (e) {
        if (e instanceof VectorError) throw e;
        lastErr = e;
      }
    }
    throw new VectorError(
      "target_detached",
      `Target "${target}" did not match any element${lastErr ? ` (${String(lastErr)})` : ""}`,
    );
  }

  // ---------- actions ----------

  async click(target: string, button: "left" | "right" | "middle" = "left", timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.click({ button, timeout: timeoutMs });
  }
  async dblclick(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.dblclick({ timeout: timeoutMs });
  }
  async hover(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.hover({ timeout: timeoutMs });
  }
  async fill(target: string, value: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.fill(value, { timeout: timeoutMs });
  }
  async typeText(target: string, value: string, delayMs = 20, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.pressSequentially(value, { delay: delayMs, timeout: timeoutMs });
  }
  async press(key: string, target?: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    if (target) {
      const loc = await this.resolveLocator(target);
      await loc.press(key, { timeout: timeoutMs });
    } else {
      await this.page.keyboard.press(key);
    }
  }
  async check(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.check({ timeout: timeoutMs });
  }
  async uncheck(target: string, timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.uncheck({ timeout: timeoutMs });
  }
  async select(target: string, value: string | string[], timeoutMs = DEFAULT_STEP_TIMEOUT) {
    const loc = await this.resolveLocator(target);
    await loc.selectOption(Array.isArray(value) ? value.map((v) => ({ label: v })) : { label: value }, { timeout: timeoutMs });
  }
  async scroll(opts: { target?: string; direction: "up" | "down" | "top" | "bottom"; amount?: number }) {
    const amount = opts.amount ?? 700;
    if (opts.target) {
      const loc = await this.resolveLocator(opts.target);
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
    const loc = await this.resolveLocator(target);
    await loc.setInputFiles(files, { timeout: timeoutMs });
  }

  /**
   * Scroll through a container or the viewport, accumulating items keyed by a
   * stable attribute/text so virtualized and infinite lists collect fully.
   * Stops on item-limit, at scroller end with nothing new, or after repeated
   * scrolls yield no new keys.
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
    type Batch = { rows: { k: string; data: Record<string, unknown> }[]; atEnd: boolean };
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
          return { rows, atEnd };
        },
        { container: opts.container, item: opts.item, key: opts.key, fields: opts.fields, doScroll: scroll },
      );
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
    let stagnant = 0;
    for (let i = 0; i < maxScrolls && collected.size < limit; i++) {
      const added = absorb(await collectOnce(true));
      if (added === 0) stagnant++;
      else stagnant = 0;
      if (stagnant >= 4) break;
      await new Promise((r) => setTimeout(r, settle));
      // hitting the bottom is exactly what makes infinite scrollers load —
      // before treating it as the end, settle and re-scan without scrolling;
      // a batch can still be in flight past the first wait
      if (stagnant >= 2) {
        let revived = false;
        for (let j = 0; j < 2 && !revived; j++) {
          if (absorb(await collectOnce(false)) > 0) revived = true;
          else if (!(await collectOnce(false)).atEnd) break; // not actually at the end
          else await new Promise((r) => setTimeout(r, settle));
        }
        if (revived) {
          stagnant = 0;
          continue;
        }
        if ((await collectOnce(false)).atEnd) break;
      }
    }
    return { items: [...collected.values()], collected: collected.size };
  }

  // ---------- waits ----------

  async waitFor(condition: Condition): Promise<WaitOutcome> {
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
          const matcher = p.startsWith("/") && p.endsWith("/") ? new RegExp(p.slice(1, -1)) : `**/*${p}*`;
          await this.page.waitForURL(matcher as never, { timeout });
          break;
        }
        case "navigationSettled":
          await this.page.waitForLoadState("domcontentloaded", { timeout });
          await this.page.waitForLoadState("load", { timeout: Math.min(timeout, 10_000) }).catch(() => {});
          break;
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

  waitForDownload(timeoutMs = 30_000): Promise<{ suggestedFilename: string; path?: string }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.externalDownloadWaiters = this.externalDownloadWaiters.filter((w) => w.resolve !== resolve);
        reject(new VectorError("condition_timeout", "Timed out waiting for download"));
      }, timeoutMs);
      this.externalDownloadWaiters.push({ resolve, reject, timer });
    });
  }

  async handleDialog(action: "accept" | "dismiss", promptText?: string) {
    this.dialogHandler = { action, promptText };
    // clear after one use to avoid silently swallowing later dialogs
    setTimeout(() => {
      if (this.dialogHandler?.action === action) this.dialogHandler = null;
    }, 30_000);
  }

  // ---------- observation ----------

  async screenshot(opts?: { fullPage?: boolean }): Promise<ScreenshotResult> {
    const buffer = await this.page.screenshot({ fullPage: opts?.fullPage ?? false, type: "png" });
    const meta = await this.page
      .evaluate(() => ({ w: innerWidth, h: innerHeight, s: devicePixelRatio || 1 }))
      .catch(() => ({ w: 0, h: 0, s: 1 }));
    return { buffer, width: meta.w, height: meta.h, scale: meta.s };
  }

  async observe(req?: Partial<ObservationRequest>): Promise<ObservationContent> {
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
    let refStart = 1;

    let mainOrigin: string | null = null;
    try {
      mainOrigin = new URL(this.page.url()).origin;
    } catch {
      /* unparsable — every frame falls through to the probe */
    }
    // Origin check first: a provably-cross-origin frame is skipped with no
    // round-trip. Only ambiguous frames (about:, srcdoc, unparsable urls)
    // pay for an evaluate — and every call is bounded, so a wedged
    // ad/tracking iframe cannot stall the lane that serializes behind it.
    const sameOriginOf = async (frame: Frame): Promise<boolean> => {
      try {
        const origin = new URL(frame.url()).origin;
        if (mainOrigin !== null && origin !== "null") return origin === mainOrigin;
      } catch {
        /* ambiguous url — probe below */
      }
      return (
        (await bounded(
          frame.evaluate(() => true).then(() => true).catch(() => false),
          FRAME_PROBE_MS,
        )) === true
      );
    };
    for (const [key, frame] of frameMap) {
      const sameOrigin = await sameOriginOf(frame);
      frames.push({ frame: key, url: frame.url(), name: frame.name() || undefined, sameOrigin });
      if (!sameOrigin) continue;
      let part: ObserveScriptResult | undefined;
      try {
        part = await bounded(
          frame.evaluate(collectObservation, {
            maxElements: Math.max(10, maxElements - allElements.length),
            maxTextChars,
            subtreeCss: req?.scope === "subtree" ? req.subtreeRef : undefined,
            frameKey: key,
            refStart,
          }),
          FRAME_OBSERVE_MS,
        );
      } catch {
        continue; // frame navigated mid-observe or is not evaluatable
      }
      if (!part) continue; // frame timed out — skip it rather than stall the lane
      refStart = part.nextRef;
      elementsTotal += part.elementsTotal;
      truncated ||= part.truncated;
      if (key === "main") {
        viewport = part.viewport;
        scroll = part.scroll;
        text = part.text;
        headings = part.headings;
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

    this.refs.register(this.identity.pageId, allElements);
    const textChars = text.length;
    return {
      url: this.page.url(),
      title: await this.title(),
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

  async expandRef(ref: string, maxElements = 60): Promise<ElementRef[]> {
    const entry = this.refs.resolve(this.identity.pageId, ref);
    if (!entry?.selector.css) return [];
    const frame = this.frameForKey(entry.frame);
    const part = await frame.evaluate(collectObservation, {
      maxElements,
      maxTextChars: 0,
      subtreeCss: entry.selector.css,
      frameKey: entry.frame,
      refStart: 10_000 + Math.floor(Math.random() * 1000),
    });
    const els = part.elements as ElementRef[];
    this.refs.register(this.identity.pageId, els);
    return els;
  }

  async extract(fields: { name: string; selector?: string; attribute?: string; all?: boolean }[]): Promise<Record<string, unknown>> {
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
        out[f.name] = await this.page
          .evaluate(() => {
            const base = (document.body?.innerText ?? "") as string;
            const shadowTextOf = (sr: any): string => {
              const parts: string[] = [];
              const walk = (n: any) => {
                for (const c of Array.from(n.childNodes ?? []) as any[]) {
                  if (c.nodeType === 3) {
                    const t = (c.nodeValue ?? "").replace(/\s+/g, " ").trim();
                    if (t) parts.push(t);
                  } else if (c.nodeType === 1) {
                    const tag = (c.tagName as string).toLowerCase();
                    if (tag === "style" || tag === "script" || tag === "template" || tag === "noscript") continue;
                    walk(c);
                  }
                }
              };
              walk(sr);
              return parts.join(" ");
            };
            const chunks: string[] = [];
            const visit = (container: any) => {
              for (const el of Array.from(container.querySelectorAll?.("*") ?? []) as any[]) {
                const sr = (el as any).shadowRoot;
                if (!sr) continue;
                const t = shadowTextOf(sr).slice(0, 400);
                if (t) chunks.push(t);
                visit(sr);
              }
            };
            visit(document.body ?? document.documentElement);
            const joined = chunks.length ? `— shadow DOM —\n${chunks.join("\n")}\n\n${base}` : base;
            return joined.slice(0, 4000);
          })
          .catch(() => "");
        continue;
      }
      const loc = this.page.locator(f.selector);
      // innerText skips shadow roots — collect text through open shadow
      // descendants so widgets like <shadow-counter> stay readable. The
      // walker must live inside each serialized callback (no outer refs).
      if (f.all) {
        const items = await loc.evaluateAll((els, attr) =>
          els.map((el) => {
            if (attr) return (el as HTMLElement).getAttribute(attr) ?? "";
            const parts: string[] = [];
            const walk = (n: Node) => {
              n.childNodes.forEach((c) => {
                if (c.nodeType === 3) {
                  const t = (c.nodeValue ?? "").replace(/\s+/g, " ").trim();
                  if (t) parts.push(t);
                } else if (c.nodeType === 1) {
                  const tag = (c as Element).tagName.toLowerCase();
                  if (tag === "style" || tag === "script" || tag === "template" || tag === "noscript") return;
                  walk(c);
                  const sr = (c as Element).shadowRoot;
                  if (sr) walk(sr);
                }
              });
            };
            walk(el);
            const sr = (el as Element).shadowRoot;
            if (sr) walk(sr);
            return parts.join(" ").trim();
          }),
          f.attribute ?? null,
        );
        out[f.name] = items;
      } else {
        const first = loc.first();
        const exists = (await first.count()) > 0;
        if (!exists) {
          out[f.name] = null;
        } else if (f.attribute) {
          out[f.name] = await first.getAttribute(f.attribute);
        } else {
          out[f.name] = await first.evaluate((el) => {
            const parts: string[] = [];
            const walk = (n: Node) => {
              n.childNodes.forEach((c) => {
                if (c.nodeType === 3) {
                  const t = (c.nodeValue ?? "").replace(/\s+/g, " ").trim();
                  if (t) parts.push(t);
                } else if (c.nodeType === 1) {
                  const tag = (c as Element).tagName.toLowerCase();
                  if (tag === "style" || tag === "script" || tag === "template" || tag === "noscript") return;
                  walk(c);
                  const sr = (c as Element).shadowRoot;
                  if (sr) walk(sr);
                }
              });
            };
            walk(el);
            const sr = (el as Element).shadowRoot;
            if (sr) walk(sr);
            return parts.join(" ").trim();
          });
        }
      }
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
    // native tab manager or to Chrome. Detach listeners only.
    this.attached = false;
    this.page.removeAllListeners();
  }
}
