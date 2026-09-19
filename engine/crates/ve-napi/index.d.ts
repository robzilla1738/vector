/**
 * `@vector/engine-native` — Node bindings for the Vector Engine.
 *
 * Every method that does page work returns a Promise that resolves off the
 * Node event loop (the engine runs on a dedicated thread per browsing
 * context). All payloads cross the boundary as JSON *strings* or UTF-8 JSON *Buffers*
(plan A17). Screenshots also have a typed `screenshotPng` that returns PNG
bytes as a Node `Buffer`. The typed wrappers in
`packages/browser-driver/src/vector-engine.ts` parse them.
 * Results are `{ ok: true, ... }` or `{ ok: false, error: { code, message, detail? } }`
 * where `code` is a runtime `VectorErrorCode`.
 */

export interface EngineConfig {
  /** Viewport for new pages (default 1280×720). */
  viewport?: { width: number; height: number };
  /** Device pixel ratio for screenshots (default 1). */
  scale?: number;
  /** `User-Agent` for network requests. */
  userAgent?: string;
  /** Refuse network schemes (only `data:`, `about:` and `file:` open). */
  offline?: boolean;
  /** Maximum simultaneously open pages per context (default 64). */
  maxPages?: number;
  /**
   * Network policy for contexts (`ve_net::NetworkPolicy`). When omitted the
   * addon uses a strict default (loopback and `file:` blocked). Fixture
   * servers must be allowlisted explicitly.
   */
  policy?: NetworkPolicy;
  /** `developer` (default) or `production`. Production requires `ve-host` + sandbox. */
  securityProfile?: "developer" | "production";
  /** `auto` | `requireProcess` | `inProcess`. Production forces `requireProcess`. */
  isolation?: "auto" | "requireProcess" | "inProcess";
  /** When true, live sockets never open; missing archive entries are blocked (VEC-024). */
  hermetic?: boolean;
  /** Layout text shaper. Omitted JSON defaults to `system`. Rust `Default` stays `metric`. */
  shaper?: "metric" | "system";
  /** Accepted and ignored by the engine today; reserved for cookie/cache persistence. */
  dataDir?: string;
}

export interface NetworkPolicy {
  blockLoopback?: boolean;
  allowlist?: string[];
  allowFile?: boolean;
  httpsOnly?: boolean;
  blockPrivateNetworks?: boolean;
  allowAgentEgress?: boolean;
  agentAllowlist?: string[];
  deniedSchemes?: string[];
}

/** Post-parse routing classification (architecture §11 step 2), from the engine's `RoutingInfo`. */
export interface Routing {
  requiresScript: boolean;
  /** Set when `requiresScript`: same text as `routeReason`. */
  reason?: string;
  kind?: "requiresScript" | "unsupportedContent";
  /** `static` or the engine's classification reason. */
  routeReason: string;
  bodyTextChars: number;
  externalScripts: number;
  cssCoverage?: { declarationsTotal: number; unknown: number; deferred: number };
}

/** One completed response attributed to the page (new since the previous call). */
export interface ResponseMeta {
  requestId: number;
  url: string;
  method: string;
  status: number;
  contentType: string | null;
  resourceType: "document" | "stylesheet" | "script" | "image" | "font" | "other";
  bodyBytes: number;
  startedAt: number;
  endedAt: number;
  fromCache: boolean;
}

export interface NativeError {
  code: string;
  message: string;
  detail?: unknown;
}

export type NativeResult<T> = ({ ok: true } & T) | { ok: false; error: NativeError };

export interface OpenOptions {
  /** Viewport override for this page. */
  viewport?: { width: number; height: number };
  /** Inline markup to parse instead of fetching; `url` becomes the base URL. */
  html?: string;
}

export interface OpenResult {
  page: number;
  context: number;
  url: string | null;
  title: string | null;
  /** HTTP status of the document response (200 for non-HTTP sources). */
  status: number;
  /** Document epoch: 0 for the first document, +1 per completed navigation. */
  generation: number;
  revision: number;
  settled: boolean;
  /** Why the page is not settled (`fetch(2)`, `navigation`, …). */
  blockers: string[];
  /** Wall-clock milliseconds from request to settled. */
  openMs: number;
  routing: Routing;
  /** Responses completed while opening (document fetch included). */
  responses: ResponseMeta[];
}

export interface ObserveOptions {
  scope?: "full" | "forms" | "links" | "tables" | "subtree";
  subtreeRef?: string;
  maxElements?: number;
  maxTextChars?: number;
  sinceRevision?: number;
  /** `compact` (default) or `full`. */
  format?: "compact" | "full";
}

export interface ObserveResult {
  /** `ObservationContent` from `@vector/contracts`. */
  content: unknown;
  revision: number;
  /** Document epoch (also present as `documentEpoch`). */
  generation: number;
  documentEpoch: number;
  settled: boolean;
  blockers: string[];
  /** `changesSince` lines relative to `sinceRevision` (null when not requested / not derivable). */
  changed: string[] | null;
  changesSince?: string[];
  /** Structured diff (`format: "full"` with `sinceRevision`). */
  delta?: unknown;
}

export interface ExecuteOptions {
  /** Observe in the same call after the last step (act-and-observe); `true` for the defaults. */
  returnObservation?: ObserveOptions | boolean;
  /** Accepted for compatibility; the engine always stops at the first non-optional failure. */
  stopOnError?: boolean;
}

export interface ExecuteResult {
  status: "completed" | "failed" | "cancelled";
  /** `StepOutcome[]` from `@vector/contracts`. */
  steps: unknown[];
  extracted: Record<string, unknown> | null;
  error: string | null;
  url: string | null;
  title: string | null;
  titleChanged: boolean;
  generation: number;
  navigated: boolean;
  revision: number;
  /** Responses completed since the previous call on this page. */
  responses: ResponseMeta[];
  observation?: NativeResult<ObserveResult>;
}

export interface ScreenshotResult {
  width: number;
  height: number;
  scale: number;
  fullPage: boolean;
  format: "png";
  bytes: number;
  pngBase64: string;
}

/** Typed screenshot (ABI 4): PNG bytes as a Buffer, no base64. */
export interface ScreenshotPng {
  width: number;
  height: number;
  scale: number;
  fullPage: boolean;
  png: Buffer;
}

export interface EngineIdentity {
  engine: string;
  abiVersion: number;
  protocolVersion: number;
  isolation: "process" | "in-process";
  sandbox: boolean;
  securityProfile: "developer" | "production";
  hostPath: string | null;
}

export declare class Engine {
  /** `configJson` is a JSON-encoded `EngineConfig`. */
  constructor(configJson?: string | null);
  /** Process vs in-process identity JSON (`EngineIdentity`). */
  identity(): string;
  /** Creates an isolated context (own cookie jar, own thread). Context 1 always exists. `optionsJson` may carry `{ policy }`. */
  newContext(optionsJson?: string | null): number;
  /** Resolves to JSON `NativeResult<OpenResult>`; `optionsJson` is an `OpenOptions`. */
  open(contextId: number, url: string, optionsJson?: string | null): Promise<string>;
  /** Resolves to JSON `NativeResult<ObserveResult>`; `optionsJson` is an `ObserveOptions`. */
  observe(page: number, optionsJson?: string | null): Promise<string>;
  /** Observe; request/reply are UTF-8 JSON Buffers (plan A17). */
  observeBuf(page: number, options?: Buffer | null): Promise<Buffer>;
  /** Resolves to JSON `NativeResult<ExecuteResult>`; `stepsJson` is a contracts `Step[]`. */
  execute(page: number, stepsJson: string, optionsJson?: string | null): Promise<string>;
  /** Execute; steps and reply are UTF-8 JSON Buffers. */
  executeBuf(page: number, steps: Buffer, options?: Buffer | null): Promise<Buffer>;
  /** Resolves to JSON `NativeResult<ScreenshotResult>`; `optionsJson` may carry `{ fullPage }`. */
  screenshot(page: number, optionsJson?: string | null): Promise<string>;
  /** PNG as a typed object with a Buffer body. */
  screenshotPng(page: number, fullPage?: boolean | null): Promise<ScreenshotPng>;
  /** Resolves to JSON `{ ok, closed }`. */
  close(page: number): Promise<string>;
  /** Resolves to JSON `{ ok, cookies: BrowserCookie[] }`. */
  getCookies(contextId: number, url?: string | null): Promise<string>;
  /** `cookiesJson` is a `BrowserCookie[]`; resolves to JSON `{ ok, count, imported }`. */
  setCookies(contextId: number, cookiesJson: string): Promise<string>;
  /** Page ids this engine tracks. */
  pages(): number[];
  /** Stops every engine thread. */
  shutdown(): void;
}

/**
 * Finding 1: shared page authority. Node starts this and attaches as a
 * client instead of constructing a second in-process `Engine`.
 */
export declare class BrowserServiceHandle {
  /** Bind `127.0.0.1:0` by default. `configJson` is `EngineConfig`. */
  static listen(bind?: string | null, configJson?: string | null): BrowserServiceHandle;
  /** Bound `host:port` for `VECTOR_BROWSER_SERVICE`. */
  addr(): string;
  shutdown(): void;
}

/** JSON: `{ abiVersion, engine, enabled, http, protocolVersion, capabilities }`. */
export declare function describe(): string;
export declare function version(): string;

/** Where the binary was found, for diagnostics. */
export declare const binaryPath: string;
