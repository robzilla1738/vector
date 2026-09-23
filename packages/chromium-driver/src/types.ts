import type {
  Backend,
  Condition,
  ElementRef,
  ObservationContent,
  ObservationRequest,
  SelectorStrategy,
} from "@aux/contracts";

export interface PageIdentity {
  /** Aux page id assigned by the target registry. */
  pageId: string;
  /** Backend-native target id (CDP target id or marker). */
  targetId: string;
  backend: Backend;
}

export interface ScreenshotResult {
  buffer: Buffer;
  width: number;
  height: number;
  /** devicePixelRatio — needed to interpret clickPoint coords. */
  scale: number;
}

export interface DriverPageEvents {
  onNavigated?: (url: string, documentEpoch: number) => void;
  onTitleChanged?: (title: string) => void;
  onLoading?: (loading: boolean) => void;
  onDestroyed?: (reason: "closed" | "crashed" | "detached") => void;
  onDialog?: (info: { type: string; message: string }) => void;
  onConsole?: (info: { level: string; message: string; atMs?: number }) => void;
  onDownload?: (info: { suggestedFilename: string; path?: string }) => void;
  onPopup?: (targetId: string | null, url: string) => void;
  /** passive response capture — fired for every completed HTTP response. */
  onResponse?: (info: {
    requestId: string;
    url: string;
    method: string;
    status: number;
    contentType?: string;
    /** Playwright resource type: document, script, stylesheet, xhr, fetch, image, … */
    resourceType?: string;
    /** response body — captured only for capture-worthy types, may be truncated */
    body?: Buffer;
    bodyBytes?: number;
    truncated?: boolean;
    startedAt: number;
    endedAt: number;
  }) => void;
}

export interface WaitOutcome {
  ok: boolean;
  timedOut: boolean;
  detail?: string;
}

/**
 * The single page abstraction used by the executor, scheduler, and API.
 * Implementations wrap a Playwright Page reached over CDP; no Playwright
 * objects escape this interface into the runtime.
 */
export interface DriverPage {
  readonly identity: PageIdentity;
  url(): string;
  title(): Promise<string>;
  isAttached(): boolean;

  navigate(url: string, timeoutMs?: number): Promise<void>;
  back(timeoutMs?: number): Promise<void>;
  forward(timeoutMs?: number): Promise<void>;
  reload(timeoutMs?: number): Promise<void>;
  stop(): Promise<void>;

  click(target: string, button?: "left" | "right" | "middle", timeoutMs?: number): Promise<void>;
  dblclick(target: string, timeoutMs?: number): Promise<void>;
  hover(target: string, timeoutMs?: number): Promise<void>;
  fill(target: string, value: string, timeoutMs?: number): Promise<void>;
  typeText(target: string, value: string, delayMs?: number, timeoutMs?: number): Promise<void>;
  press(key: string, target?: string, timeoutMs?: number): Promise<void>;
  check(target: string, timeoutMs?: number): Promise<void>;
  uncheck(target: string, timeoutMs?: number): Promise<void>;
  select(target: string, value: string | string[], timeoutMs?: number): Promise<void>;
  scroll(opts: { target?: string; direction: "up" | "down" | "top" | "bottom"; amount?: number }): Promise<void>;
  dragTo(target: string, to: string, timeoutMs?: number): Promise<void>;
  clickPoint(x: number, y: number, button?: "left" | "right" | "middle"): Promise<void>;
  uploadFiles(target: string, files: string[], timeoutMs?: number): Promise<void>;

  waitFor(condition: Condition): Promise<WaitOutcome>;
  waitForDownload(timeoutMs?: number): Promise<{ suggestedFilename: string; path?: string }>;
  handleDialog(action: "accept" | "dismiss", promptText?: string): Promise<void>;

  /** Scroll a container/viewport, accumulating items by stable key (virtualized/infinite lists). */
  collectScroll(opts: {
    item: string;
    container?: string;
    key?: string;
    fields?: { name: string; selector?: string; attribute?: string }[];
    limit?: number;
    maxScrolls?: number;
    settleMs?: number;
  }): Promise<{ items: Record<string, unknown>[]; collected: number }>;

  screenshot(opts?: { fullPage?: boolean }): Promise<ScreenshotResult>;
  observe(req?: Partial<ObservationRequest>): Promise<ObservationContent>;
  /**
   * Cheap state fingerprint for the observation cache (plan A6): changes
   * whenever the DOM mutated, the URL/scroll/viewport moved, a form value
   * changed or focus moved. Two equal fingerprints mean `observe()` would
   * return the same content, so the runtime can serve the previous one
   * without re-walking the page. Optional; absent means "always re-observe".
   */
  observeFingerprint?(): Promise<string>;
  expandRef(ref: string, maxElements?: number): Promise<ElementRef[]>;
  extract(fields: { name: string; selector?: string; attribute?: string; all?: boolean }[]): Promise<Record<string, unknown>>;
  evaluate(expression: string): Promise<unknown>;
  /** Page `console.*` lines when the backend keeps a buffer. */
  console?(): Promise<{ level: string; message: string; atMs?: number }[]>;

  setEvents(events: DriverPageEvents): void;
  dispose(): Promise<void>;
}

export interface DiscoveredTarget {
  targetId: string;
  url: string;
  title: string;
  type: string;
}

/** Portable cookie shape — maps to CDP Network.CookieParam / Electron cookies.set. */
export interface BrowserCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  /** unix seconds; absent = session cookie */
  expires?: number;
}

/**
 * A backend connection: Aux's own Electron views over the app CDP port,
 * or the user's existing Chrome over its remote-debugging port.
 */
export interface BrowserDriver {
  readonly backend: Backend;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  /** Targets the backend reports as attachable pages. */
  listTargets(): Promise<DiscoveredTarget[]>;
  /**
   * Attach to a target. For backend "aux" the targetId is the marker id
   * (`atab-<webContentsId>`) injected by the main process; for "chrome" it is
   * the CDP target id.
   */
  attach(targetId: string, pageId: string): Promise<DriverPage>;
  /** Reattach a recovered renderer without reusing a crashed protocol handle. */
  recoverPage?(targetId: string, pageId: string, documentEpoch?: number): Promise<DriverPage>;
  /** Look up the registered element entry for an observation ref. */
  refEntry?(pageId: string, ref: string): ElementRef | undefined;
  /** Create a new tab in the backend browser; returns its target id. */
  createTarget?(url: string): Promise<string>;
  /** Bring a borrowed tab forward in its owning browser. */
  activateTarget?(targetId: string): Promise<void>;
  /** Read the backend's full cookie store (browser-level CDP). */
  getAllCookies?(): Promise<BrowserCookie[]>;
  /** Write cookies into the backend's storage partition. Returns count set. */
  setCookies?(cookies: BrowserCookie[]): Promise<number>;
  onTargetsChanged?: (targets: DiscoveredTarget[]) => void;
  /**
   * Re-establish the backend connection after the socket dropped. Resolves
   * immediately when already connected; rejects when the backend is gone.
   */
  reconnect?(): Promise<void>;
  /** The backend socket dropped — the runtime marks the session degraded. */
  onDisconnected?: () => void;
  /** A reconnect() succeeded after a drop. */
  onReconnected?: () => void;
  /**
   * Human takeover on the shared browser authority (Finding 1 / Gate B).
   * Stops subsequent agent dispatch for every client of the same service.
   */
  takeover?(pageId?: string): Promise<{ controller: string; controllerEpoch: number }>;
  /** Release human takeover after revalidating page and authorization state. */
  resume?(pageId?: string): Promise<{ controller: string; controllerEpoch: number }>;
}

export interface ResolvedRef {
  frame: string;
  strategy: SelectorStrategy;
  ordinal: number;
}
