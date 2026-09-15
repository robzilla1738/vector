/**
 * `@vector/engine-native` — Node bindings for the Vector Engine.
 *
 * Every method that does page work returns a Promise that resolves off the
 * Node event loop (the engine runs on a dedicated thread per browsing
 * context). All payloads cross the boundary as JSON *strings*; the typed
 * wrappers in `packages/browser-driver/src/vector-engine.ts` parse them.
 * Results are `{ ok: true, ... }` or `{ ok: false, error: { code, message, detail? } }`
 * where `code` is a runtime `VectorErrorCode`.
 */

export interface EngineConfig {
  /** Viewport for new pages (default 1280×720). */
  viewport?: { width: number; height: number };
  /** `User-Agent` for network requests. */
  userAgent?: string;
  /** Refuse network schemes (only `data:`, `about:` and `file:` open). */
  offline?: boolean;
  /** Maximum simultaneously open pages per context (default 64). */
  maxPages?: number;
  /** Accepted and ignored by the engine today; reserved for cookie/cache persistence. */
  dataDir?: string;
}

/** Post-parse routing classification (architecture §11 step 2). */
export interface Routing {
  requiresScript: boolean;
  reason?: string;
  kind?: "requiresScript" | "unsupportedContent";
}

export interface NativeError {
  code: string;
  message: string;
  detail?: unknown;
}

export type NativeResult<T> = ({ ok: true } & T) | { ok: false; error: NativeError };

export interface OpenResult {
  page: number;
  context: number;
  url: string | null;
  title: string | null;
  /** Document epoch: 0 for the first document, +1 per completed navigation. */
  generation: number;
  revision: number;
  settled: boolean;
  routing: Routing;
  /** Response metadata for the document fetch — empty until ve-api surfaces it. */
  responses: unknown[];
}

export interface ObserveOptions {
  scope?: "full" | "forms" | "links" | "tables" | "subtree";
  subtreeRef?: string;
  maxElements?: number;
  maxTextChars?: number;
  sinceRevision?: number;
}

export interface ObserveResult {
  /** `ObservationContent` from `@vector/contracts`. */
  content: unknown;
  revision: number;
  generation: number;
  settled: boolean;
  blockers: string[];
  /** Refs touched since `sinceRevision` (when requested and the journal covers it). */
  changed: string[] | null;
}

export interface ExecuteOptions {
  /** Observe in the same call after the last step (act-and-observe). */
  returnObservation?: ObserveOptions;
  /** Keep running after a non-optional failure (default false). */
  stopOnError?: boolean;
}

export interface ExecuteResult {
  status: "completed" | "failed";
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
  responses: unknown[];
  observation?: NativeResult<ObserveResult>;
}

export declare class Engine {
  /** `configJson` is a JSON-encoded `EngineConfig`. */
  constructor(configJson?: string | null);
  /** Creates an isolated context (own cookie jar, own thread). Context 1 always exists. */
  newContext(optionsJson?: string | null): number;
  /** Resolves to JSON `NativeResult<OpenResult>`. */
  open(contextId: number, url: string, optionsJson?: string | null): Promise<string>;
  /** Resolves to JSON `NativeResult<ObserveResult>`; `optionsJson` is an `ObserveOptions`. */
  observe(page: number, optionsJson?: string | null): Promise<string>;
  /** Resolves to JSON `NativeResult<ExecuteResult>`; `stepsJson` is a contracts `Step[]`. */
  execute(page: number, stepsJson: string, optionsJson?: string | null): Promise<string>;
  /** Resolves to a `capability_unsupported` error in M1. */
  screenshot(page: number, optionsJson?: string | null): Promise<string>;
  /** Resolves to JSON `{ ok, closed }`. */
  close(page: number): Promise<string>;
  /** Resolves to JSON `{ ok, cookies: BrowserCookie[] }`. */
  getCookies(contextId: number, url?: string | null): Promise<string>;
  /** `cookiesJson` is a `BrowserCookie[]`; resolves to JSON `{ ok, count }`. */
  setCookies(contextId: number, cookiesJson: string): Promise<string>;
  /** Page ids this engine tracks. */
  pages(): number[];
  /** Stops every engine thread. */
  shutdown(): void;
}

/** JSON: `{ abiVersion, engine, enabled, http, capabilities }`. */
export declare function describe(): string;
export declare function version(): string;

/** Where the binary was found, for diagnostics. */
export declare const binaryPath: string;
