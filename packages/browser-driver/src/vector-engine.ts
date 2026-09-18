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
import {
  BrowserServiceClient,
  ServiceNativeEngine,
  browserServiceAddr,
  spawnVeShellService,
  type OwnedBrowserService,
} from "./browser-service.js";
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
  SceneUpdate,
  WaitOutcome,
} from "./types.js";

/** The subset of the native `Engine` class the driver uses (JSON in/out). */
export interface NativeEngine {
  newContext(optionsJson?: string | null): number;
  identity?(): string;
  open(contextId: number, url: string, optionsJson?: string | null): Promise<string>;
  observe(page: number, optionsJson?: string | null): Promise<string>;
  observeBuf?(page: number, options?: Buffer | null): Promise<Buffer>;
  execute(page: number, stepsJson: string, optionsJson?: string | null): Promise<string>;
  executeBuf?(page: number, steps: Buffer, options?: Buffer | null): Promise<Buffer>;
  screenshot(page: number, optionsJson?: string | null): Promise<string>;
  screenshotPng?(page: number, fullPage?: boolean | null): Promise<{ width: number; height: number; scale: number; fullPage: boolean; png: Buffer }>;
  scene?(): Promise<string>;
  close(page: number): Promise<string>;
  getCookies(contextId: number, url?: string | null): Promise<string>;
  setCookies(contextId: number, cookiesJson: string): Promise<string>;
  pages(): number[];
  shutdown(): void;
  takeover?(): Promise<string>;
  resume?(): Promise<string>;
  inputEvent?(event: Record<string, unknown>): Promise<string>;
}

export interface BrowserServiceHandle {
  addr(): string;
  shutdown(): void;
}

export interface NativeModule {
  Engine: new (configJson?: string | null) => NativeEngine;
  BrowserServiceHandle?: {
    listen(bind?: string | null, configJson?: string | null): BrowserServiceHandle;
  };
  describe(): string;
  version(): string;
  binaryPath?: string;
}

export type { OwnedBrowserService } from "./browser-service.js";

export interface EngineNativeConfig {
  viewport?: { width: number; height: number };
  userAgent?: string;
  offline?: boolean;
  maxPages?: number;
  dataDir?: string;
  /** attach a V8 VM to every page and run document scripts (plan A13); needs an addon built with the `v8` feature */
  scripting?: boolean;
  securityProfile?: "developer" | "production";
  isolation?: "auto" | "requireProcess" | "inProcess";
  policy?: {
    blockLoopback?: boolean;
    allowlist?: string[];
    allowFile?: boolean;
    httpsOnly?: boolean;
    allowPrivateNetwork?: boolean;
    allowAgentEgress?: boolean;
    agentAllowlist?: string[];
  };
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
  protocolVersion?: number;
  binaryPath?: string;
  hostPath?: string;
  isolation?: "process" | "in-process";
  securityProfile?: "production" | "developer";
  capabilities?: Record<string, boolean>;
  error?: string;
}

/** Non-throwing probe used by `runtime.describe` and at startup. */
export async function probeEngineNative(load: () => Promise<NativeModule> = loadEngineNative): Promise<EngineAvailability> {
  try {
    const mod = await load();
    const info = JSON.parse(mod.describe()) as {
      abiVersion?: number;
      engine?: string;
      protocolVersion?: number;
      capabilities?: Record<string, boolean>;
    };
    return {
      available: true,
      version: info.engine ?? mod.version(),
      abiVersion: info.abiVersion,
      protocolVersion: info.protocolVersion,
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
  "model_output_invalid", "needs_input", "conflict", "permission_denied", "assertion_failed", "operation_not_found", "internal",
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

const FERRY_MAGIC = Buffer.from("VEJ1", "ascii");

/** Length-prefixed JSON Buffer (`VEJ1` + u32le + UTF-8). Raw UTF-8 JSON is still accepted. */
export function encodeFerry(json: string): Buffer {
  const body = Buffer.from(json, "utf8");
  const out = Buffer.allocUnsafe(8 + body.length);
  FERRY_MAGIC.copy(out, 0);
  out.writeUInt32LE(body.length, 4);
  body.copy(out, 8);
  return out;
}

/** Decodes a ferry Buffer or falls back to UTF-8 JSON. */
export function decodeFerry(buf: Buffer): string {
  if (buf.length >= 8 && buf.subarray(0, 4).equals(FERRY_MAGIC)) {
    const len = buf.readUInt32LE(4);
    return buf.subarray(8, 8 + len).toString("utf8");
  }
  return buf.toString("utf8");
}

function unwrapNativeFromBuf<T>(buf: Buffer): T {
  return unwrapNative<T>(decodeFerry(buf));
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
    format: req?.format,
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
      const optionsJson = JSON.stringify({ returnObservation: opts.returnObservation ? JSON.parse(observeOptions(opts.returnObservation)) : undefined });
      if (this.native.executeBuf) {
        res = unwrapNativeFromBuf<ExecuteResult>(
          await this.native.executeBuf(this.pageNum, encodeFerry(JSON.stringify(steps)), encodeFerry(optionsJson)),
        );
      } else {
        res = unwrapNative<ExecuteResult>(
          await this.native.execute(this.pageNum, JSON.stringify(steps), optionsJson),
        );
      }
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
    const navigated =
      res.navigated || (typeof res.generation === "number" && res.generation !== this.generation);
    if (navigated) {
      this.generation = typeof res.generation === "number" ? res.generation : this.generation + 1;
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

  async humanEvent(event: Record<string, unknown>): Promise<void> {
    if (!this.native.inputEvent) {
      throw new VectorError("capability_unsupported", "humanEvent requires BrowserService input.event");
    }
    unwrapNative(await this.native.inputEvent(event));
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
    const res = await this.executeProgram([{ id: `ve${++this.stepCounter}`, op: "waitFor", condition: { kind: "downloadCompleted" } }]);
    const outcome = res.steps[0];
    if (!outcome || outcome.status !== "ok") {
      throw new VectorError(
        outcome?.error?.code === "capability_unsupported" ? "capability_unsupported" : "condition_timeout",
        outcome?.error?.message ?? "download did not complete",
      );
    }
    return { suggestedFilename: outcome.detail ?? "download" };
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
    if (this.native.screenshotPng) {
      const shot = await this.native.screenshotPng(this.pageNum, opts?.fullPage);
      return { buffer: Buffer.from(shot.png), width: shot.width, height: shot.height, scale: shot.scale };
    }
    const res = unwrapNative<{
      pngBase64?: string;
      width?: number;
      height?: number;
      scale?: number;
      scene?: SceneUpdate;
      kind?: string;
      transport?: string;
      png?: boolean;
      itemCount?: number;
      items?: Record<string, unknown>[];
    }>(
      await this.native.screenshot(this.pageNum, JSON.stringify(opts ?? {})),
    );
    const scene = res.scene ?? (res.kind === "displayList" ? (res as unknown as SceneUpdate) : undefined);
    if (!res.pngBase64 && !scene) throw new VectorError("capability_unsupported", "screenshot returned no image");
    return {
      buffer: Buffer.from(res.pngBase64 ?? "", "base64"),
      width: res.width ?? scene?.width ?? 0,
      height: res.height ?? scene?.height ?? 0,
      scale: res.scale ?? scene?.scale ?? 1,
      scene,
    };
  }

  async scene(): Promise<SceneUpdate> {
    this.ensureAttached();
    if (this.native.scene) {
      return unwrapNative<SceneUpdate>(await this.native.scene());
    }
    const shot = await this.screenshot();
    if (shot.scene) return shot.scene;
    throw new VectorError("capability_unsupported", "engine did not export a display list");
  }

  async observe(req?: Partial<ObservationRequest>): Promise<ObservationContent> {
    this.ensureAttached();
    const res = this.native.observeBuf
      ? unwrapNativeFromBuf<ObserveResult>(await this.native.observeBuf(this.pageNum, encodeFerry(observeOptions(req))))
      : unwrapNative<ObserveResult>(await this.native.observe(this.pageNum, observeOptions(req)));
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

  async evaluate(expression?: string): Promise<unknown> {
    const outcome = await this.one({ op: "evaluate", expression: expression ?? "undefined" });
    return outcome.extracted?.value ?? outcome.extracted ?? outcome.detail ?? null;
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
  /** Attach to a running BrowserService instead of creating a local engine. */
  serviceAddr?: string;
  /**
   * Finding 1: start a local BrowserService and attach as a client.
   * Default true unless `load` is injected (unit tests keep a fake Engine).
   */
  ownService?: boolean;
  /** Test hook that starts a BrowserService and returns its bind address. */
  startService?: () => Promise<OwnedBrowserService>;
}

/**
 * Driver over the native engine. Finding 1: the Node planner is a client of
 * BrowserService (GUI `--service` or an owned listener). Injected `load`
 * keeps a local Engine for unit tests. Pages live in the default context
 * (`DEFAULT_CONTEXT`). `createTarget(url)` performs the navigation and
 * `attach` wraps the result — the runtime reads `page.routing()` to decide
 * whether to keep the page or fall back.
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
  private serviceAddr?: string;
  private readonly ownService: boolean;
  private readonly startService?: () => Promise<OwnedBrowserService>;
  private owned?: OwnedBrowserService;

  onDisconnected?: () => void;
  onReconnected?: () => void;
  onTargetsChanged?: (targets: DiscoveredTarget[]) => void;

  constructor(opts: VectorEngineDriverOptions = {}) {
    this.load = opts.load ?? loadEngineNative;
    this.config = opts.config ?? {};
    this.serviceAddr = opts.serviceAddr ?? browserServiceAddr();
    this.ownService = opts.ownService ?? opts.load == null;
    this.startService = opts.startService;
  }

  async connect(): Promise<void> {
    if (this.native) return;
    // Packaged production uses `Engine` + ve-host (Gate A). In-process
    // `ve-shell --service` is the developer / native-GUI attach path.
    const production = this.config.securityProfile === "production";
    if (!this.serviceAddr && this.ownService && !production) {
      this.owned = this.startService
        ? await this.startService()
        : await this.startNativeService();
      if (this.owned) this.serviceAddr = this.owned.addr;
    }
    if (this.serviceAddr) {
      const client = new BrowserServiceClient(this.serviceAddr);
      await client.connect();
      this.native = new ServiceNativeEngine(client);
      const probed = this.availability.available
        ? this.availability
        : await probeEngineNative(this.load);
      this.availability = {
        available: true,
        version: probed.available && probed.version ? probed.version : "browser-service",
        abiVersion: probed.abiVersion,
        protocolVersion: probed.protocolVersion,
        binaryPath: probed.binaryPath,
        isolation: "process",
        securityProfile: this.config.securityProfile,
        capabilities: { ...probed.capabilities, screenshot: probed.capabilities?.screenshot ?? false, service: true },
      };
      return;
    }
    this.availability = await probeEngineNative(this.load);
    if (!this.availability.available) {
      throw new VectorError("backend_unavailable", `vector-engine native module unavailable: ${this.availability.error}`);
    }
    this.mod = await this.load();
    this.native = new this.mod.Engine(JSON.stringify(this.config));
    const identRaw = this.native.identity?.();
    if (identRaw) {
      try {
        const ident = JSON.parse(identRaw) as {
          abiVersion?: number;
          protocolVersion?: number;
          engine?: string;
          isolation?: "process" | "in-process";
          securityProfile?: "production" | "developer";
          host?: string | null;
        };
        this.availability = {
          ...this.availability,
          abiVersion: ident.abiVersion ?? this.availability.abiVersion,
          protocolVersion: ident.protocolVersion,
          version: ident.engine ?? this.availability.version,
          isolation: ident.isolation,
          securityProfile: ident.securityProfile,
          hostPath: ident.host ?? undefined,
        };
      } catch {
        /* describe() already populated version/abi */
      }
    }
  }

  private async startNativeService(): Promise<OwnedBrowserService | undefined> {
    this.availability = await probeEngineNative(this.load);
    if (this.availability.available) {
      this.mod = await this.load();
      const handle = this.mod.BrowserServiceHandle?.listen(
        "127.0.0.1:0",
        JSON.stringify(this.config),
      );
      if (handle) return { addr: handle.addr(), shutdown: () => handle.shutdown() };
    }
    const spawned = await spawnVeShellService();
    if (spawned) return spawned;
    if (!this.availability.available) {
      throw new VectorError(
        "backend_unavailable",
        `vector-engine native module unavailable: ${this.availability.error}`,
      );
    }
    return undefined;
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
    try {
      this.owned?.shutdown();
    } catch {
      /* already down */
    }
    if (this.owned) this.serviceAddr = undefined;
    this.owned = undefined;
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

  /**
   * Human takeover on BrowserService (Finding 1 / Gate B / Gate F).
   * Local-only engines without `takeover` flip nothing on the service.
   */
  async takeover(): Promise<{ controller: string; controllerEpoch: number }> {
    const native = this.engine();
    if (!native.takeover) return { controller: "human", controllerEpoch: 0 };
    const r = unwrapNative<{ controller?: string; controllerEpoch?: number }>(await native.takeover());
    return {
      controller: r.controller ?? "human",
      controllerEpoch: r.controllerEpoch ?? 0,
    };
  }

  /** Resume after takeover. Requires the service to report a non-human controller. */
  async resume(): Promise<{ controller: string; controllerEpoch: number }> {
    const native = this.engine();
    if (!native.resume) return { controller: "none", controllerEpoch: 0 };
    const r = unwrapNative<{ controller?: string; controllerEpoch?: number }>(await native.resume());
    if (r.controller === "human") {
      throw new VectorError("conflict", "resume left the page under human control");
    }
    return {
      controller: r.controller ?? "none",
      controllerEpoch: r.controllerEpoch ?? 0,
    };
  }
}
