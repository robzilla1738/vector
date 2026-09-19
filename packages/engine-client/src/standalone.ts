import { chromium, type Browser, type BrowserContext, type Page } from "playwright-core";
import { VectorError } from "@vector/contracts";
import { PlaywrightDriverPage } from "./playwright-page.js";
import { RefRegistry } from "./ref-registry.js";
import type { BrowserDriver, DiscoveredTarget, DriverPage } from "./types.js";

/**
 * Fallback driver for a runtime running without the Electron shell —
 * launches a headless system Chrome (no bundled browser download needed)
 * and owns the whole browser. Pages get synthetic target ids.
 */
export class StandaloneDriver implements BrowserDriver {
  readonly backend = "vector" as const;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private refs = new RefRegistry();
  private targets = new Map<string, Page>();
  private counter = 0;
  private reconnecting: Promise<void> | null = null;
  private dropped = false;

  onDisconnected?: () => void;
  onReconnected?: () => void;
  /** launcher — injectable so lifecycle tests can run without a browser */
  private readonly launch: (opts: Record<string, unknown>) => Promise<Browser>;

  constructor(deps: { launch?: (opts: Record<string, unknown>) => Promise<Browser> } = {}) {
    this.launch = deps.launch ?? ((o) => chromium.launch(o));
  }

  async connect(): Promise<void> {
    const attempts: Record<string, unknown>[] = [
      { channel: "chrome", headless: true },
      { channel: "chrome-headless-shell", headless: true },
      { channel: "chromium", headless: true },
    ];
    if (process.env.VECTOR_BROWSER_PATH) attempts.unshift({ executablePath: process.env.VECTOR_BROWSER_PATH, headless: true });
    let lastErr: unknown;
    for (const a of attempts) {
      try {
        this.browser = await this.launch(a);
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!this.browser) {
      throw new VectorError(
        "backend_unavailable",
        `standalone browser launch failed (install Chrome or set VECTOR_BROWSER_PATH): ${lastErr instanceof Error ? lastErr.message : lastErr}`,
      );
    }
    const browser = this.browser;
    this.context = await browser.newContext({ acceptDownloads: true });
    browser.on("disconnected", () => {
      if (this.browser !== browser) return; // intentional disconnect() or a stale handle
      this.browser = null;
      this.context = null;
      this.targets.clear();
      this.dropped = true;
      this.onDisconnected?.();
    });
    if (this.dropped) {
      this.dropped = false;
      this.onReconnected?.();
    }
  }

  /** Relaunch the headless browser after a crash/drop; concurrent callers share one attempt. */
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
    const browser = this.browser;
    this.browser = null;
    this.context = null;
    this.targets.clear();
    await browser?.close().catch(() => {});
  }

  isConnected(): boolean {
    return this.browser?.isConnected() ?? false;
  }

  async createTarget(url: string): Promise<string> {
    if (!this.context) throw new VectorError("backend_unavailable", "not connected");
    const page = await this.context.newPage();
    const targetId = `pw-${++this.counter}`;
    this.targets.set(targetId, page);
    page.on("close", () => this.targets.delete(targetId));
    page.on("crash", () => this.targets.delete(targetId));
    if (url && url !== "about:blank") {
      try {
        await page.goto(url);
      } catch (e) {
        // a target whose first navigation failed is not a usable page —
        // surface the failure instead of handing back a healthy-looking id
        this.targets.delete(targetId);
        await page.close().catch(() => {});
        throw new VectorError("step_failed", `navigation to ${url} failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return targetId;
  }

  async listTargets(): Promise<DiscoveredTarget[]> {
    const out: DiscoveredTarget[] = [];
    for (const [targetId, page] of this.targets) {
      if (page.isClosed()) continue;
      out.push({ targetId, url: page.url(), title: await page.title().catch(() => ""), type: "page" });
    }
    return out;
  }

  async attach(targetId: string, pageId: string): Promise<DriverPage> {
    const page = this.targets.get(targetId);
    if (!page || page.isClosed()) throw new VectorError("target_detached", `no standalone target ${targetId}`);
    return new PlaywrightDriverPage({
      page,
      context: this.context!,
      identity: { pageId, targetId, backend: "vector" },
      refs: this.refs,
    });
  }

  refEntry(pageId: string, ref: string) {
    return this.refs.resolve(pageId, ref);
  }
}
