/**
 * `vector-engine` backend: BrowserDriver + DriverPage over the in-process
 * Vector Engine (`@vector/engine-native`, built from engine/crates/ve-napi).
 *
 * Architecture §11: pages are engine pages in the default browsing context;
 * `targetId = "ve-<contextId>-<pageId>"`. Every DriverPage method builds a
 * one-step contracts Program, and `executeProgram` hands the engine whole
 * step lists in a single native call (the zero-IPC path). Observations
 * arrive already shaped as `ObservationContent`; refs are `r<index>` and
 * `documentEpoch` is the engine's generation. Anything the engine cannot do
 * in this milestone surfaces as `capability_unsupported`, which the
 * runtime's router turns into a Chromium fallback.
 */
import {
  VectorError,
  type Condition,
  type ElementRef,
  type ObservationContent,
  type ObservationRequest,
  type Step,
  type StepOutcome,
  type VectorErrorCode,
} from "@vector/contracts";
import { RefRegistry } from "./ref-registry.js";
import type {
  BrowserCookie,
  BrowserDriver,
  DiscoveredTarget,
  DriverPage,
  DriverPageEvents,
  ExecuteProgramOptions,
  ExecuteProgramResult,
  PageIdentity,
  PageRouting,
  ScreenshotResult,
  WaitOutcome,
} from "./types.js";

/** The subset of the native `Engine` class the driver uses (JSON in/out). */
export interface NativeEngine {
  newContext(optionsJson?: string | null): number;
  open(contextId: number, url: string, optionsJson?: string | null): Promise<string>;
  observe(page: number, optionsJson?: string | null): Promise<string>;
  execute(page: number, stepsJson: string, optionsJson?: string | null): Promise<string>;
  screenshot(page: number, optionsJson?: string | null): Promise<string>;
  close(page: number): Promise<string>;
  getCookies(contextId: number, url?: string | null): Promise<string>;
  setCookies(contextId: number, cookiesJson: string): Promise<string>;
  pages(): number[];
  shutdown(): void;
}

export interface NativeModule {
  Engine: new (configJson?: string | null) => NativeEngine;
  describe(): string;
  version(): string;
  binaryPath?: string;
}

export interface EngineNativeConfig {
  viewport?: { width: number; height: number };
  userAgent?: string;
  offline?: boolean;
  maxPages?: number;
  dataDir?: string;
}

/** Loads the addon; rejects with the loader's diagnostic when no binary exists. */
export async function loadEngineNative(): Promise<NativeModule> {
  const mod = (await import("@vector/engine-native")) as unknown as NativeModule & { default?: NativeModule };
  return mod.Engine ? mod : (mod.default as NativeModule);
}

export interface EngineAvailability {
  available: boolean;
  version?: string;
  abiVersion?: number;
  binaryPath?: string;
  capabilities?: Record<string, boolean>;
  error?: string;
}

/** Non-throwing probe used by `runtime.describe` and at startup. */
export async function probeEngineNative(load: () => Promise<NativeModule> = loadEngineNative): Promise<EngineAvailability> {
  try {
    const mod = await load();
    const info = JSON.parse(mod.describe()) as { abiVersion?: number; engine?: string; capabilities?: Record<string, boolean> };
    return {
      available: true,
      version: info.engine ?? mod.version(),
      abiVersion: info.abiVersion,
      binaryPath: mod.binaryPath,
      capabilities: info.capabilities,
    };
  } catch (e) {
    return { available: false, error: e instanceof Error ? e.message : String(e) };
  }
}

interface NativeError {
  code: string;
  message: string;
  detail?: unknown;
}
type NativeResult<T> = ({ ok: true } & T) | { ok: false; error: NativeError };

interface OpenResult {
  page: number;
  context: number;
  url: string | null;
  title: string | null;
  generation: number;
  revision: number;
  settled: boolean;
  routing: PageRouting;
  responses?: ResponseMeta[];
}
interface ObserveResult {
  content: ObservationContent;
  revision: number;
  generation: number;
  settled: boolean;
  blockers?: string[];
  changed?: string[] | null;
}
interface ExecuteResult {
  status: "completed" | "failed";
  steps: StepOutcome[];
  extracted: Record<string, unknown> | null;
  error: string | null;
  url: string | null;
  title: string | null;
  titleChanged: boolean;
  generation: number;
  navigated: boolean;
  revision: number;
  responses?: ResponseMeta[];
  observation?: NativeResult<ObserveResult>;
}
interface ResponseMeta {
  url: string;
  method?: string;
  status: number;
  contentType?: string;
  resourceType?: string;
}

const CODES: ReadonlySet<string> = new Set<VectorErrorCode>([
  "not_found", "invalid_params", "target_detached", "target_ambiguous", "backend_unavailable",
  "capability_unsupported", "step_failed", "condition_timeout", "cancelled", "model_error",
  "model_output_invalid", "needs_input", "conflict", "assertion_failed", "operation_not_found", "internal",
]);

function toVectorError(e: NativeError): VectorError {
  const code = (CODES.has(e.code) ? e.code : "internal") as VectorErrorCode;
  return new VectorError(code, e.message, e.detail);
}

/** Parses a native JSON reply and throws a VectorError on `ok: false`. */
export function unwrapNative<T>(json: string): T {
  let parsed: NativeResult<T>;
  try {
    parsed = JSON.parse(json) as NativeResult<T>;
  } catch {
    throw new VectorError("internal", `engine returned malformed JSON: ${json.slice(0, 200)}`);
  }
  if (!parsed.ok) throw toVectorError(parsed.error);
  return parsed as T;
}

/** `Omit` that distributes over the Step union so each op keeps its own fields. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type StepInput = DistributiveOmit<Step, "id"> & { id?: string };

export const DEFAULT_CONTEXT = 1;
export const engineTargetId = (contextId: number, page: number) => `ve-${contextId}-${page}`;
export function parseEngineTargetId(targetId: string): { contextId: number; page: number } | null {
  const m = /^ve-(\d+)-(\d+)$/.exec(targetId);
  return m ? { contextId: Number(m[1]), page: Number(m[2]) } : null;
}

/** Observation requests the engine understands (scope/subtree/budgets/since). */
function observeOptions(req?: Partial<ObservationRequest>): string {
  return JSON.stringify({
    scope: req?.scope,
    subtreeRef: req?.subtreeRef,
    maxElements: req?.maxElements,
    maxTextChars: req?.maxTextChars,
    sinceRevision: req?.sinceRevision,
  });
}

export class VectorEnginePage implements DriverPage {
  readonly identity: PageIdentity;
  private events: DriverPageEvents = {};
  private attached = true;
  private urlValue: string;
  private titleValue: string;
  private generation: number;
  private routingValue: PageRouting;
  private stepCounter = 0;

  constructor(
    private readonly native: NativeEngine,
    private readonly pageNum: number,
    private readonly refs: RefRegistry,
    identity: PageIdentity,
    opened: OpenResult,
    private readonly onDisposed?: () => void,
  ) {
    this.identity = identity;
    this.urlValue = opened.url ?? "about:blank";
    this.titleValue = opened.title ?? "";
    this.generation = opened.generation;
    this.routingValue = opened.routing;
  }

  url(): string {
    return this.urlValue;
  }
  async title(): Promise<string> {
    return this.titleValue;
  }
  isAttached(): boolean {
    return this.attached;
  }
  routing(): PageRouting | undefined {
    return this.routingValue;
  }
  /** Engine document epoch (generation). */
  documentEpoch(): number {
    return this.generation;
  }

  private ensureAttached() {
    if (!this.attached) throw new VectorError("target_detached", `engine page ${this.identity.pageId} is closed`);
  }

  /** Whole-program path: one native call for every step (+ optional observation). */
  async executeProgram(steps: Step[], opts: ExecuteProgramOptions = {}): Promise<ExecuteProgramResult> {
    this.ensureAttached();
    if (opts.signal?.aborted) {
      return {
        status: "cancelled",
        steps: steps.map((s) => ({ stepId: s.id, op: s.op, status: "skipped" as const, startedAt: Date.now(), durationMs: 0 })),
      };
    }
    const mayNavigate = steps.some((s) => s.op === "navigate" || s.op === "reload" || s.op === "click" || s.op === "press");
    if (mayNavigate) this.events.onLoading?.(true);
    let res: ExecuteResult;
    try {
      res = unwrapNative<ExecuteResult>(
        await this.native.execute(
          this.pageNum,
          JSON.stringify(steps),
          JSON.stringify({ returnObservation: opts.returnObservation ? JSON.parse(observeOptions(opts.returnObservation)) : undefined }),
        ),
      );
    } finally {
      if (mayNavigate) this.events.onLoading?.(false);
    }
    this.absorb(res);
    let observation: ObservationContent | undefined;
    if (res.observation) {
      if (res.observation.ok) {
        observation = res.observation.content;
        this.refs.register(this.identity.pageId, observation.elements);
      }
    }
    const out: ExecuteProgramResult = {
      status: res.status,
      steps: res.steps,
      extracted: res.extracted ?? undefined,
      error: res.error ?? undefined,
    };
    if (observation) out.observation = observation;
    return out;
  }

  /** Applies url/title/generation from a result and fires the matching events. */
  private absorb(res: ExecuteResult) {
    for (const r of res.responses ?? []) {
      this.events.onResponse?.({
        requestId: `ve-${this.pageNum}-${Date.now().toString(36)}`,
        url: r.url,
        method: r.method ?? "GET",
        status: r.status,
        contentType: r.contentType,
        resourceType: r.resourceType ?? "document",
        startedAt: Date.now(),
        endedAt: Date.now(),
      });
    }
    if (res.url) this.urlValue = res.url;
    if (res.navigated) {
      this.generation = res.generation;
      this.refs.clear(this.identity.pageId);
      this.events.onNavigated?.(this.urlValue, this.generation);
    }
    if (res.titleChanged || (res.title ?? "") !== this.titleValue) {
      this.titleValue = res.title ?? "";
      this.events.onTitleChanged?.(this.titleValue);
    }
  }

  /** Runs one step and throws its error as a VectorError. */
  private async one(step: StepInput): Promise<StepOutcome> {
    const full = { ...step, id: step.id ?? `ve${++this.stepCounter}` } as Step;
    const res = await this.executeProgram([full]);
    const outcome = res.steps[0];
    if (!outcome) throw new VectorError("internal", "engine returned no step outcome");
    if (outcome.status === "failed") {
      const code = (outcome.error && CODES.has(outcome.error.code) ? outcome.error.code : "step_failed") as VectorErrorCode;
      throw new VectorError(code, outcome.error?.message ?? `${step.op} failed`);
    }
    return outcome;
  }

  async navigate(url: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "navigate", url, timeoutMs });
  }
  async back(timeoutMs?: number): Promise<void> {
    await this.one({ op: "back", timeoutMs });
  }
  async forward(timeoutMs?: number): Promise<void> {
    await this.one({ op: "forward", timeoutMs });
  }
  async reload(timeoutMs?: number): Promise<void> {
    await this.one({ op: "reload", timeoutMs });
  }
  async stop(): Promise<void> {
    await this.one({ op: "stop" });
  }

  async click(target: string, button?: "left" | "right" | "middle", timeoutMs?: number): Promise<void> {
    await this.one({ op: "click", target, button, timeoutMs });
  }
  async dblclick(target: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "dblclick", target, timeoutMs });
  }
  async hover(target: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "hover", target, timeoutMs });
  }
  async fill(target: string, value: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "fill", target, value, timeoutMs });
  }
  async typeText(target: string, value: string, delayMs?: number, timeoutMs?: number): Promise<void> {
    await this.one({ op: "type", target, value, delayMs, timeoutMs });
  }
  async press(key: string, target?: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "press", key, target, timeoutMs });
  }
  async check(target: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "check", target, timeoutMs });
  }
  async uncheck(target: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "uncheck", target, timeoutMs });
  }
  async select(target: string, value: string | string[], timeoutMs?: number): Promise<void> {
    await this.one({ op: "select", target, value, timeoutMs });
  }
  async scroll(opts: { target?: string; direction: "up" | "down" | "top" | "bottom"; amount?: number }): Promise<void> {
    await this.one({ op: "scroll", target: opts.target, direction: opts.direction, amount: opts.amount });
  }
  async dragTo(target: string, to: string, timeoutMs?: number): Promise<void> {
    await this.one({ op: "dragTo", target, to, timeoutMs });
  }
  async clickPoint(x: number, y: number, button?: "left" | "right" | "middle"): Promise<void> {
    await this.one({ op: "clickPoint", x, y, button });
  }
  async uploadFiles(target: string, files: string[], timeoutMs?: number): Promise<void> {
    await this.one({ op: "upload", target, files, timeoutMs });
  }

  async waitFor(condition: Condition): Promise<WaitOutcome> {
    this.ensureAttached();
    const res = await this.executeProgram([{ id: `ve${++this.stepCounter}`, op: "waitFor", condition }]);
    const outcome = res.steps[0];
    if (!outcome) return { ok: false, timedOut: false, detail: "no outcome" };
    if (outcome.status === "ok") return { ok: true, timedOut: false, detail: outcome.detail };
    // unsupported conditions are a capability gap, not a timeout — surface the code
    if (outcome.error?.code === "capability_unsupported") throw new VectorError("capability_unsupported", outcome.error.message);
    return { ok: false, timedOut: outcome.error?.code === "condition_timeout", detail: outcome.error?.message };
  }

  async waitForDownload(): Promise<{ suggestedFilename: string; path?: string }> {
    throw new VectorError("capability_unsupported", "downloads are not available on the vector-engine backend in M1");
  }
  async handleDialog(action: "accept" | "dismiss", promptText?: string): Promise<void> {
    await this.one({ op: "dialog", action, promptText });
  }

  async collectScroll(opts: {
    item: string;
    container?: string;
    key?: string;
    fields?: { name: string; selector?: string; attribute?: string }[];
    limit?: number;
    maxScrolls?: number;
    settleMs?: number;
  }): Promise<{ items: Record<string, unknown>[]; collected: number }> {
    const outcome = await this.one({ op: "collectScroll", ...opts });
    const ex = (outcome.extracted ?? {}) as { items?: Record<string, unknown>[]; count?: number };
    return { items: ex.items ?? [], collected: ex.count ?? ex.items?.length ?? 0 };
  }

  async screenshot(opts?: { fullPage?: boolean }): Promise<ScreenshotResult> {
    this.ensureAttached();
    const res = unwrapNative<{ pngBase64?: string; width?: number; height?: number; scale?: number }>(
      await this.native.screenshot(this.pageNum, JSON.stringify(opts ?? {})),
    );
    if (!res.pngBase64) throw new VectorError("capability_unsupported", "screenshot returned no image");
    return { buffer: Buffer.from(res.pngBase64, "base64"), width: res.width ?? 0, height: res.height ?? 0, scale: res.scale ?? 1 };
  }

  async observe(req?: Partial<ObservationRequest>): Promise<ObservationContent> {
    this.ensureAttached();
    const res = unwrapNative<ObserveResult>(await this.native.observe(this.pageNum, observeOptions(req)));
    this.generation = res.generation;
    this.urlValue = res.content.url;
    this.titleValue = res.content.title;
    this.refs.register(this.identity.pageId, res.content.elements);
    // engine metadata the runtime may read without a second call
    return Object.assign(res.content, { engine: { revision: res.revision, generation: res.generation, settled: res.settled, changed: res.changed ?? undefined } });
  }

  async expandRef(ref: string, maxElements = 60): Promise<ElementRef[]> {
    this.ensureAttached();
    const res = unwrapNative<ObserveResult>(
      await this.native.observe(this.pageNum, observeOptions({ scope: "subtree", subtreeRef: ref, maxElements })),
    );
    this.refs.register(this.identity.pageId, res.content.elements);
    return res.content.elements;
  }

  async extract(fields: { name: string; selector?: string; attribute?: string; all?: boolean }[]): Promise<Record<string, unknown>> {
    const outcome = await this.one({ op: "extract", fields });
    return (outcome.extracted ?? {}) as Record<string, unknown>;
  }

  async evaluate(): Promise<unknown> {
    throw new VectorError("capability_unsupported", "evaluate needs ve-script (M2); the router replays evaluate programs on Chromium");
  }

  setEvents(events: DriverPageEvents): void {
    this.events = events;
  }

  async dispose(): Promise<void> {
    if (!this.attached) return;
    this.attached = false;
    this.refs.clear(this.identity.pageId);
    this.onDisposed?.();
    try {
      await this.native.close(this.pageNum);
    } catch {
      /* engine already gone */
    }
  }
}

export interface VectorEngineDriverOptions {
  config?: EngineNativeConfig;
  /** module loader — injectable so unit tests run without the addon */
  load?: () => Promise<NativeModule>;
}

/**
 * Driver over the native engine. One `Engine` per driver; pages live in
 * the default context (`DEFAULT_CONTEXT`). `createTarget(url)` performs the
 * navigation (the engine parses and classifies synchronously on its
 * thread) and `attach` wraps the result — the runtime reads
 * `page.routing()` to decide whether to keep the page or fall back.
 */
export class VectorEngineDriver implements BrowserDriver {
  readonly backend = "vector-engine" as const;
  private mod: NativeModule | null = null;
  private native: NativeEngine | null = null;
  private refs = new RefRegistry();
  private opened = new Map<string, OpenResult>();
  private pages = new Map<string, VectorEnginePage>();
  private availability: EngineAvailability = { available: false };
  private readonly load: () => Promise<NativeModule>;
  private readonly config: EngineNativeConfig;

  onDisconnected?: () => void;
  onReconnected?: () => void;
  onTargetsChanged?: (targets: DiscoveredTarget[]) => void;

  constructor(opts: VectorEngineDriverOptions = {}) {
    this.load = opts.load ?? loadEngineNative;
    this.config = opts.config ?? {};
  }

  async connect(): Promise<void> {
    if (this.native) return;
    this.availability = await probeEngineNative(this.load);
    if (!this.availability.available) {
      throw new VectorError("backend_unavailable", `vector-engine native module unavailable: ${this.availability.error}`);
    }
    this.mod = await this.load();
    this.native = new this.mod.Engine(JSON.stringify(this.config));
  }

  async reconnect(): Promise<void> {
    return this.connect();
  }

  async disconnect(): Promise<void> {
    for (const p of this.pages.values()) await p.dispose().catch(() => {});
    this.pages.clear();
    this.opened.clear();
    try {
      this.native?.shutdown();
    } catch {
      /* already down */
    }
    this.native = null;
  }

  isConnected(): boolean {
    return this.native !== null;
  }

  /** Engine version/binary/capabilities for `runtime.describe`. */
  describe(): EngineAvailability {
    return this.availability;
  }

  private engine(): NativeEngine {
    if (!this.native) throw new VectorError("backend_unavailable", "vector-engine is not connected");
    return this.native;
  }

  async listTargets(): Promise<DiscoveredTarget[]> {
    return [...this.pages.entries()].map(([targetId, p]) => ({ targetId, url: p.url(), title: "", type: "page" }));
  }

  /** Opens `url` in the default context; the page is parsed and classified before this resolves. */
  async createTarget(url: string): Promise<string> {
    const res = unwrapNative<OpenResult>(await this.engine().open(DEFAULT_CONTEXT, url, "{}"));
    const targetId = engineTargetId(res.context, res.page);
    this.opened.set(targetId, res);
    return targetId;
  }

  /** Classification of a target opened by `createTarget` (before attach). */
  routingOf(targetId: string): PageRouting | undefined {
    return this.opened.get(targetId)?.routing ?? this.pages.get(targetId)?.routing();
  }

  async attach(targetId: string, pageId: string): Promise<DriverPage> {
    const existing = this.pages.get(targetId);
    if (existing?.isAttached()) return existing;
    const parsed = parseEngineTargetId(targetId);
    const opened = this.opened.get(targetId);
    if (!parsed || !opened) throw new VectorError("target_detached", `no engine page for target ${targetId}`);
    const page = new VectorEnginePage(
      this.engine(),
      parsed.page,
      this.refs,
      { pageId, targetId, backend: "vector-engine" },
      opened,
      () => {
        this.pages.delete(targetId);
        this.opened.delete(targetId);
      },
    );
    this.pages.set(targetId, page);
    return page;
  }

  refEntry(pageId: string, ref: string): ElementRef | undefined {
    return this.refs.resolve(pageId, ref);
  }

  async getAllCookies(): Promise<BrowserCookie[]> {
    const res = unwrapNative<{ cookies: BrowserCookie[] }>(await this.engine().getCookies(DEFAULT_CONTEXT, null));
    return res.cookies;
  }

  async setCookies(cookies: BrowserCookie[]): Promise<number> {
    const res = unwrapNative<{ count: number }>(await this.engine().setCookies(DEFAULT_CONTEXT, JSON.stringify(cookies)));
    return res.count;
  }
}
