import { chromium, type Browser, type BrowserContext, type Page } from "playwright-core";
import { VectorError } from "@vector/contracts";
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
  abstract readonly backend: "vector" | "chrome";
  protected endpoint: string;
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected refs = new RefRegistry();
  private pagesByTarget = new Map<string, PlaywrightDriverPage>();

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  httpBase(): string {
    return this.endpoint.replace(/^ws/, "http").replace(/\/$/, "");
  }

  async connect(): Promise<void> {
    const endpoint = this.endpoint;
    // connectOverCDP accepts either the http(s) base or a ws URL.
    this.browser = await chromium.connectOverCDP(endpoint, { timeout: 15_000 });
    const contexts = this.browser.contexts();
    this.context = contexts[0] ?? (await this.browser.newContext());
    this.context.on("page", () => this.notifyTargetsChanged());
  }

  async disconnect(): Promise<void> {
    for (const p of this.pagesByTarget.values()) await p.dispose().catch(() => {});
    this.pagesByTarget.clear();
    await this.browser?.close().catch(() => {});
    this.browser = null;
    this.context = null;
  }

  isConnected(): boolean {
    return this.browser?.isConnected() ?? false;
  }

  protected abstract identityOfPage(page: Page): Promise<string | null>;

  protected pages(): Page[] {
    if (!this.context) return [];
    return this.context.pages();
  }

  /** CDP target id for a playwright page via Target.getTargetInfo on its session. */
  protected async cdpTargetId(page: Page): Promise<string | null> {
    try {
      const session = await this.context!.newCDPSession(page);
      const info = (await session.send("Target.getTargetInfo")) as { targetInfo?: { targetId?: string } };
      const id = info?.targetInfo?.targetId ?? null;
      await session.detach().catch(() => {});
      return id;
    } catch {
      return null;
    }
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
    if (!res.ok) throw new VectorError("backend_unavailable", `CDP /json/list failed: ${res.status}`);
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

  async attach(targetId: string, pageId: string): Promise<DriverPage> {
    const existing = this.pagesByTarget.get(targetId);
    if (existing?.isAttached()) return existing;

    // Marker+CDP-target surfacing can take seconds on a busy shell (app boot,
    // heavy parallel loads) — 8s proved too short in practice.
    const deadline = Date.now() + 30_000;
    let lastSeen: string[] = [];
    while (Date.now() < deadline) {
      for (const page of this.pages()) {
        if (page.isClosed()) continue;
        const id = await this.identityOfPage(page);
        if (id === targetId) {
          const dp = new PlaywrightDriverPage({
            page,
            context: this.context!,
            identity: { pageId, targetId, backend: this.backend },
            refs: this.refs,
          });
          page.on("close", () => this.pagesByTarget.delete(targetId));
          page.on("crash", () => this.pagesByTarget.delete(targetId));
          this.pagesByTarget.set(targetId, dp);
          return dp;
        }
        if (id) lastSeen.push(id);
      }
      // Fallback path: the shared CDP context may not surface every target
      // (e.g. webview-typed targets). Attach per-target via its own ws URL.
      const hit = await this.attachDirect(targetId, pageId).catch(() => null);
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 150));
    }
    throw new VectorError(
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
      const browser = await chromium.connectOverCDP(t.webSocketDebuggerUrl, { timeout: 8_000 });
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
      this.pagesByTarget.set(targetId, dp);
      return dp;
    }
    return null;
  }

  refEntry(pageId: string, ref: string) {
    return this.refs.resolve(pageId, ref);
  }

  async createTarget(url: string): Promise<string> {
    if (!this.browser) throw new VectorError("backend_unavailable", "not connected");
    const session = await this.browser.newBrowserCDPSession();
    try {
      const res = (await session.send("Target.createTarget", { url, newWindow: false, background: false })) as {
        targetId: string;
      };
      return res.targetId;
    } finally {
      await session.detach().catch(() => {});
    }
  }

  async activateTarget(targetId: string): Promise<void> {
    if (!this.browser) throw new VectorError("backend_unavailable", "not connected");
    const session = await this.browser.newBrowserCDPSession();
    try {
      await session.send("Target.activateTarget", { targetId });
    } finally {
      await session.detach().catch(() => {});
    }
  }

  /** Browser-level Storage.getCookies — returns the backend's whole cookie jar. */
  async getAllCookies(): Promise<BrowserCookie[]> {
    if (!this.browser) throw new VectorError("backend_unavailable", "not connected");
    const session = await this.browser.newBrowserCDPSession();
    try {
      const res = (await session.send("Storage.getCookies")) as unknown as { cookies?: Record<string, unknown>[] };
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
    } finally {
      await session.detach().catch(() => {});
    }
  }

  /**
   * Network.setCookies on a page-level session — writes into that page's
   * storage partition (all vector views share one partition). Creates an
   * about:blank target if the backend has no page to borrow.
   */
  async setCookies(cookies: BrowserCookie[]): Promise<number> {
    if (!this.context) throw new VectorError("backend_unavailable", "not connected");
    let page = this.pages().find((p) => !p.isClosed());
    if (!page) {
      const targetId = await this.createTarget("about:blank");
      const deadline = Date.now() + 6_000;
      while (!page && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 120));
        page = this.pages().find((p) => !p.isClosed());
      }
      if (!page) throw new VectorError("target_detached", `no page to scope cookie writes (created ${targetId})`);
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
