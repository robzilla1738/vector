import { chromium, type Browser, type BrowserContext, type CDPSession, type Page } from "playwright-core";
import { AuxError } from "@aux/contracts";
import { bounded, PlaywrightDriverPage } from "./playwright-page.js";
import { RefRegistry } from "./ref-registry.js";
import type { BrowserCookie, BrowserDriver, DiscoveredTarget, DriverPage } from "./types.js";

export interface JsonTarget {
  id: string;
  type: string;
  url: string;
  title: string;
  webSocketDebuggerUrl?: string;
}

/** Shared machinery for drivers that attach to a running CDP endpoint. */
export abstract class CdpAttachedDriver implements BrowserDriver {
  abstract readonly backend: "aux" | "chrome";
  /** CDP drivers never place engine pages. */
  protected endpoint: string;
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected refs = new RefRegistry();
  private pagesByTarget = new Map<string, PlaywrightDriverPage>();
  /**
   * Per-target Browser handles opened by attachDirect. Each is its own CDP
   * WebSocket; they must be closed on dispose or when their page goes away,
   * or every fallback attach leaks a connection for the runtime's lifetime.
   */
  private directBrowsers = new Map<string, Browser>();
  /** set while a reconnect() is in flight so concurrent opens share it */
  private reconnecting: Promise<void> | null = null;
  /** true between an unexpected drop and the next successful connect */
  private dropped = false;

  onDisconnected?: () => void;
  onReconnected?: () => void;
  /** CDP connector — injectable so lifecycle tests can run without a browser. */
  protected readonly connectOverCDP: (endpoint: string, opts: { timeout: number }) => Promise<Browser>;

  constructor(
    endpoint: string,
    deps: { connectOverCDP?: (endpoint: string, opts: { timeout: number }) => Promise<Browser> } = {},
  ) {
    this.endpoint = endpoint;
    this.connectOverCDP = deps.connectOverCDP ?? ((e, o) => chromium.connectOverCDP(e, o));
  }

  httpBase(): string {
    return this.endpoint.replace(/^ws/, "http").replace(/\/$/, "");
  }

  async connect(): Promise<void> {
    const endpoint = this.endpoint;
    // connectOverCDP accepts either the http(s) base or a ws URL.
    const browser = await this.connectOverCDP(endpoint, { timeout: 15_000 }).catch((error) => {
      // The internal broker's URL carries a generation capability. Playwright
      // includes its endpoint in connection errors, which can be persisted by
      // the runtime or shown in the UI; do not let that token escape IPC.
      if (endpoint.includes("/aux-cdp/")) {
        const diagnostic = String(error instanceof Error ? error.message : error)
          .replaceAll(endpoint, "[internal CDP endpoint]")
          .replace(/\/aux-cdp\/[a-f0-9]+/g, "/aux-cdp/[redacted]");
        console.error("Aux internal browser connection failed:", diagnostic);
        throw new AuxError("backend_unavailable", "Internal browser connection failed");
      }
      throw error;
    });
    this.browser = browser;
    this.browserSession = null;
    const contexts = browser.contexts();
    this.context = contexts[0] ?? (await browser.newContext());
    this.context.on("page", () => this.notifyTargetsChanged());
    browser.on("disconnected", () => {
      // only the current connection may mark us degraded — a stale handle
      // closing during a reconnect must not clobber the new one
      if (this.browser !== browser) return;
      this.browser = null;
      this.context = null;
      this.browserSession = null;
      this.dropped = true;
      for (const p of this.pagesByTarget.values()) void p.dispose().catch(() => {});
      this.pagesByTarget.clear();
      this.onDisconnected?.();
    });
    if (this.dropped) {
      this.dropped = false;
      this.onReconnected?.();
    }
  }

  /**
   * Lazy recovery for a dropped socket: `pages.open` calls this before
   * failing with backend_unavailable. Concurrent callers share one attempt.
   */
  async reconnect(): Promise<void> {
    if (this.isConnected()) return;
    if (!this.reconnecting) {
      this.reconnecting = this.connect().finally(() => {
        this.reconnecting = null;
      });
    }
    await this.reconnecting;
  }

  async disconnect(): Promise<void> {
    for (const p of this.pagesByTarget.values()) await p.dispose().catch(() => {});
    this.pagesByTarget.clear();
    for (const b of this.directBrowsers.values()) await b.close().catch(() => {});
    this.directBrowsers.clear();
    const browser = this.browser;
    this.browser = null; // clear first so the "disconnected" handler treats this close as intentional
    this.context = null;
    this.browserSession = null;
    await browser?.close().catch(() => {});
  }

  isConnected(): boolean {
    return this.browser?.isConnected() ?? false;
  }

  /** Register a page reached through its own per-target connection; owns that connection. */
  protected trackDirect(
    targetId: string,
    browser: Browser,
    page: Page,
    dp: PlaywrightDriverPage,
  ): PlaywrightDriverPage {
    const prev = this.directBrowsers.get(targetId);
    if (prev && prev !== browser) void prev.close().catch(() => {});
    this.directBrowsers.set(targetId, browser);
    this.pagesByTarget.set(targetId, dp);
    const drop = () => {
      this.pagesByTarget.delete(targetId);
      if (this.directBrowsers.get(targetId) === browser) {
        this.directBrowsers.delete(targetId);
        void browser.close().catch(() => {});
      }
    };
    page.on("close", drop);
    page.on("crash", drop);
    browser.on("disconnected", () => {
      if (this.directBrowsers.get(targetId) === browser) this.directBrowsers.delete(targetId);
    });
    return dp;
  }

  /** Test/diagnostic: number of per-target connections currently owned. */
  directConnectionCount(): number {
    return this.directBrowsers.size;
  }

  protected abstract identityOfPage(page: Page): Promise<string | null>;

  protected pages(): Page[] {
    if (!this.context) return [];
    return this.context.pages();
  }

  /** Target ids are fixed for a page's lifetime — resolved once per page, not per scan. */
  private targetIds = new WeakMap<Page, Promise<string | null>>();

  /** CDP target id for a playwright page via Target.getTargetInfo on its session. */
  protected cdpTargetId(page: Page): Promise<string | null> {
    let id = this.targetIds.get(page);
    if (!id) {
      const context = this.context;
      id = (async () => {
        try {
          const session = await context!.newCDPSession(page);
          const info = (await session.send("Target.getTargetInfo")) as { targetInfo?: { targetId?: string } };
          void session.detach().catch(() => {});
          return info?.targetInfo?.targetId ?? null;
        } catch {
          return null;
        }
      })().then((v) => {
        if (!v) this.targetIds.delete(page); // not ready yet — ask again next time
        return v;
      });
      this.targetIds.set(page, id);
    }
    return id;
  }

  /**
   * The context page with this CDP target id: known pages are matched by
   * their cached ids, and a tab that has not surfaced yet is caught by the
   * context's "page" event instead of polling.
   */
  private pageWithTargetId(id: string, timeoutMs: number): Promise<Page | null> {
    const context = this.context;
    if (!context) return Promise.resolve(null);
    return new Promise((resolve) => {
      let done = false;
      const finish = (page: Page | null) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        context.off("page", check);
        resolve(page);
      };
      const check = (page: Page) => {
        if (!page.isClosed()) void this.cdpTargetId(page).then((tid) => tid === id && finish(page));
      };
      const timer = setTimeout(() => finish(null), timeoutMs);
      context.on("page", check);
      for (const page of context.pages()) check(page);
    });
  }

  /** One page event or `ms`, whichever comes first. */
  private nextPage(ms: number): Promise<void> {
    const context = this.context;
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        context?.off("page", done);
        resolve();
      };
      const timer = setTimeout(done, ms);
      context?.on("page", done);
    });
  }

  private browserSession: Promise<CDPSession> | null = null;

  /** One browser-level CDP session per connection, shared by target/cookie commands. */
  protected browserCdp(): Promise<CDPSession> {
    const browser = this.browser;
    if (!browser) throw new AuxError("backend_unavailable", "not connected");
    this.browserSession ??= browser.newBrowserCDPSession().catch((e) => {
      this.browserSession = null;
      throw e;
    });
    return this.browserSession;
  }

  protected async markerOf(page: Page, globalName: string): Promise<string | null> {
    // bounded — a busy/hung renderer would otherwise stall the attach scan
    // (and the page lane behind it) indefinitely
    const v = await bounded(
      page.evaluate((name) => (globalThis as Record<string, unknown>)[name], globalName),
      3_000,
    );
    return typeof v === "string" ? v : null;
  }

  async jsonTargets(): Promise<JsonTarget[]> {
    const res = await fetch(`${this.httpBase()}/json/list`);
    if (!res.ok) throw new AuxError("backend_unavailable", `CDP /json/list failed: ${res.status}`);
    return (await res.json()) as JsonTarget[];
  }

  async listTargets(): Promise<DiscoveredTarget[]> {
    const out: DiscoveredTarget[] = [];
    for (const page of this.pages()) {
      const targetId = await this.identityOfPage(page);
      if (!targetId) continue;
      out.push({
        targetId,
        url: page.url(),
        title: await page.title().catch(() => ""),
        type: "page",
      });
    }
    return out;
  }

  private track(
    page: Page,
    targetId: string,
    pageId: string,
    initialDocumentEpoch?: number,
  ): PlaywrightDriverPage {
    const dp = new PlaywrightDriverPage({
      page,
      context: this.context!,
      identity: { pageId, targetId, backend: this.backend },
      refs: this.refs,
      initialDocumentEpoch,
    });
    page.on("close", () => this.pagesByTarget.delete(targetId));
    page.on("crash", () => this.pagesByTarget.delete(targetId));
    this.pagesByTarget.set(targetId, dp);
    return dp;
  }

  async attach(
    targetId: string,
    pageId: string,
    hint?: { cdpTargetId?: string; initialDocumentEpoch?: number },
  ): Promise<DriverPage> {
    const existing = this.pagesByTarget.get(targetId);
    if (existing?.isAttached()) return existing;
    // the shell named the tab's CDP target: match it directly, no marker scan
    if (hint?.cdpTargetId) {
      const page = await this.pageWithTargetId(hint.cdpTargetId, 10_000);
      if (page) return this.track(page, targetId, pageId, hint.initialDocumentEpoch);
    }

    // Marker+CDP-target surfacing can take seconds on a busy shell (app boot,
    // heavy parallel loads) — 8s proved too short in practice.
    const deadline = Date.now() + 30_000;
    let lastSeen: string[] = [];
    while (Date.now() < deadline) {
      for (const page of this.pages()) {
        if (page.isClosed()) continue;
        const id = await this.identityOfPage(page);
        if (id === targetId) return this.track(page, targetId, pageId, hint?.initialDocumentEpoch);
        if (id) lastSeen.push(id);
      }
      // Fallback path: the shared CDP context may not surface every target
      // (e.g. webview-typed targets). Attach per-target via its own ws URL.
      const hit = await this.attachDirect(targetId, pageId).catch(() => null);
      if (hit) return hit;
      await this.nextPage(150);
    }
    throw new AuxError(
      "target_detached",
      `No page with target id ${targetId} on ${this.backend} backend (saw: ${lastSeen.slice(0, 8).join(", ") || "none"})`,
    );
  }

  /**
   * Direct per-target attach through its webSocketDebuggerUrl — used when the
   * shared CDP connection does not expose the target as a context page.
   */
  protected async attachDirect(targetId: string, pageId: string): Promise<DriverPage | null> {
    const targets = await this.jsonTargets().catch(() => [] as JsonTarget[]);
    for (const t of targets) {
      if (t.type !== "page" || !t.webSocketDebuggerUrl) continue;
      if (t.id !== targetId) continue;
      const browser = await this.connectOverCDP(t.webSocketDebuggerUrl, { timeout: 8_000 });
      const ctx = browser.contexts()[0];
      const page = ctx?.pages()[0];
      if (!page) {
        await browser.close().catch(() => {});
        return null;
      }
      const dp = new PlaywrightDriverPage({
        page,
        context: ctx!,
        identity: { pageId, targetId, backend: this.backend },
        refs: this.refs,
      });
      return this.trackDirect(targetId, browser, page, dp);
    }
    return null;
  }

  refEntry(pageId: string, ref: string) {
    return this.refs.resolve(pageId, ref);
  }

  async createTarget(url: string): Promise<string> {
    const session = await this.browserCdp();
    const res = (await session.send("Target.createTarget", { url, newWindow: false, background: false })) as {
      targetId: string;
    };
    return res.targetId;
  }

  async activateTarget(targetId: string): Promise<void> {
    await (await this.browserCdp()).send("Target.activateTarget", { targetId });
  }

  /** Browser-level Storage.getCookies — returns the backend's whole cookie jar. */
  async getAllCookies(): Promise<BrowserCookie[]> {
    const session = await this.browserCdp();
    const res = (await session.send("Storage.getCookies")) as unknown as {
      cookies?: Record<string, unknown>[];
    };
    return (res.cookies ?? []).map((c) => ({
      name: String(c.name),
      value: String(c.value ?? ""),
      domain: String(c.domain ?? ""),
      path: String(c.path ?? "/"),
      secure: Boolean(c.secure),
      httpOnly: Boolean(c.httpOnly),
      sameSite: ["Strict", "Lax", "None"].includes(String(c.sameSite))
        ? (c.sameSite as BrowserCookie["sameSite"])
        : undefined,
      expires: c.session ? undefined : typeof c.expires === "number" && c.expires > 0 ? c.expires : undefined,
    }));
  }

  /**
   * Network.setCookies on a page-level session — writes into that page's
   * storage partition (all aux views share one partition). Creates an
   * about:blank target if the backend has no page to borrow.
   */
  async setCookies(cookies: BrowserCookie[]): Promise<number> {
    if (!this.context) throw new AuxError("backend_unavailable", "not connected");
    let page = this.pages().find((p) => !p.isClosed());
    if (!page) {
      const targetId = await this.createTarget("about:blank");
      const deadline = Date.now() + 6_000;
      while (!page && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 120));
        page = this.pages().find((p) => !p.isClosed());
      }
      if (!page)
        throw new AuxError("target_detached", `no page to scope cookie writes (created ${targetId})`);
    }
    const session = await this.context.newCDPSession(page);
    try {
      const params = cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path || "/",
        secure: c.secure,
        httpOnly: c.httpOnly,
        ...(c.sameSite ? { sameSite: c.sameSite } : {}),
        ...(c.expires ? { expires: Math.floor(c.expires) } : {}),
      }));
      const res = (await session.send("Network.setCookies", { cookies: params })) as { success?: boolean };
      return res.success === false ? 0 : params.length;
    } finally {
      await session.detach().catch(() => {});
    }
  }

  protected notifyTargetsChanged() {
    if (this.onTargetsChanged) {
      void this.listTargets()
        .then((t) => this.onTargetsChanged?.(t))
        .catch(() => {});
    }
  }

  onTargetsChanged?: (targets: DiscoveredTarget[]) => void;
}
