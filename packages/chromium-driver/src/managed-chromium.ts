import type { Browser, Page } from "playwright-core";
import { AuxError } from "@aux/contracts";
import { CdpAttachedDriver } from "./cdp-driver.js";
import type { DiscoveredTarget, DriverPage } from "./types.js";

/**
 * Driver for Aux-owned pages: real WebContentsView instances created by
 * the Electron main process. The main process injects a marker
 * `globalThis.__auxTid = "atab-<webContentsId>"` into every document of
 * each page view; that marker is the target identity — immune to same-URL
 * ambiguity, unlike URL matching or array position.
 */
export const AUX_MARKER_GLOBAL = "__auxTid";
export const auxMarkerForWebContents = (webContentsId: number) => `atab-${webContentsId}`;

export interface TrustedAuxPage {
  pageId: string;
  marker: string;
  cdpTargetId?: string;
}

export class ManagedChromiumDriver extends CdpAttachedDriver {
  readonly backend = "aux" as const;

  private readonly trustedPages?: () => Promise<TrustedAuxPage[]>;

  constructor(endpoint: string, deps: {
    connectOverCDP?: (endpoint: string, opts: { timeout: number }) => Promise<Browser>;
    trustedPages?: () => Promise<TrustedAuxPage[]>;
  } = {}) {
    super(endpoint, deps);
    this.trustedPages = deps.trustedPages;
  }

  private async trusted(pageId: string, marker: string): Promise<TrustedAuxPage | undefined> {
    return (await this.trustedPages?.())?.find(page => page.pageId === pageId && page.marker === marker);
  }

  override async listTargets(): Promise<DiscoveredTarget[]> {
    const targets = await super.listTargets();
    if (!this.trustedPages) return targets;
    const allowed = new Set((await this.trustedPages()).map(page => page.marker));
    return targets.filter(target => allowed.has(target.targetId));
  }

  override async attach(targetId: string, pageId: string, hint?: { cdpTargetId?: string; initialDocumentEpoch?: number }): Promise<DriverPage> {
    if (this.trustedPages) {
      const page = await this.trusted(pageId, targetId);
      if (!page) throw new AuxError("target_detached", "This tab is no longer owned by Aux.");
      // A hint supplied by another process cannot redirect the attach to a
      // different native view. Main's registry is the source of target IDs.
      hint = { ...(page.cdpTargetId ? { cdpTargetId: page.cdpTargetId } : {}),
        ...(hint?.initialDocumentEpoch !== undefined ? { initialDocumentEpoch: hint.initialDocumentEpoch } : {}) };
    }
    return super.attach(targetId, pageId, hint);
  }

  protected async identityOfPage(page: Page): Promise<string | null> {
    return this.markerOf(page, AUX_MARKER_GLOBAL);
  }

  async recoverPage(targetId: string, pageId: string, documentEpoch = 0) {
    const trusted = this.trustedPages ? await this.trusted(pageId, targetId) : undefined;
    if (this.trustedPages && !trusted) throw new AuxError("target_detached", "This tab is no longer owned by Aux.");
    // The internal broker permits one runtime connection. Session restore
    // already has a fresh connection, so attach the new native view there.
    if (this.endpoint.includes("/aux-cdp/"))
      return this.attach(targetId, pageId, { initialDocumentEpoch: documentEpoch });
    // Playwright retains the crashed flag on its old Page proxy. A fresh CDP
    // connection observes the recovered renderer without disturbing other tabs.
    const browser = await this.connectOverCDP(this.endpoint, { timeout: 15_000 }).catch(error => {
      if (this.endpoint.includes("/aux-cdp/")) throw new AuxError("backend_unavailable", "Internal browser recovery connection failed");
      throw error;
    });
    try {
      for (const context of browser.contexts()) for (const page of context.pages()) {
        if (trusted?.cdpTargetId) {
          const session = await context.newCDPSession(page).catch(() => null);
          if (!session) continue;
          const info = await session.send("Target.getTargetInfo").catch(() => null) as { targetInfo?: { targetId?: string } } | null;
          await session.detach().catch(() => {});
          if (info?.targetInfo?.targetId !== trusted.cdpTargetId) continue;
        }
        if (await this.markerOf(page, AUX_MARKER_GLOBAL) !== targetId) continue;
        const { PlaywrightDriverPage } = await import("./playwright-page.js");
        this.refs.clear(pageId);
        const driver = new PlaywrightDriverPage({ page, context, identity: { pageId, targetId, backend: this.backend }, refs: this.refs, initialDocumentEpoch: documentEpoch });
        return this.trackDirect(targetId, browser, page, driver);
      }
      throw new Error("Recovered tab could not be identified on the browser connection");
    } catch (error) { await browser.close().catch(() => {}); throw error; }
  }

  /** attachDirect fallback matches by marker too — /json/list only has ids. */
  protected override async attachDirect(targetId: string, pageId: string) {
    if (this.endpoint.includes("/aux-cdp/")) return null; // broker has no unrestricted /json/list endpoint
    const trusted = this.trustedPages ? await this.trusted(pageId, targetId) : undefined;
    if (this.trustedPages && !trusted?.cdpTargetId) return null;
    const targets = await this.jsonTargets().catch(() => []);
    for (const t of targets) {
      if (t.type !== "page" || !t.webSocketDebuggerUrl) continue;
      if (trusted && t.id !== trusted.cdpTargetId) continue;
      let browser;
      try {
        browser = await this.connectOverCDP(t.webSocketDebuggerUrl, { timeout: 6_000 });
      } catch {
        continue;
      }
      const ctx = browser.contexts()[0];
      const page = ctx?.pages()[0];
      if (!page) {
        await browser.close().catch(() => {});
        continue;
      }
      const marker = await this.markerOf(page, AUX_MARKER_GLOBAL).catch(() => null);
      if (marker === targetId) {
        const { PlaywrightDriverPage } = await import("./playwright-page.js");
        const dp = new PlaywrightDriverPage({
          page,
          context: ctx!,
          identity: { pageId, targetId, backend: this.backend },
          refs: this.refs,
        });
        // the per-target connection is owned by the driver and closed with the page/dispose
        return this.trackDirect(targetId, browser, page, dp);
      }
      // keep the extra connection alive only if needed elsewhere — close it
      await browser.close().catch(() => {});
    }
    return null;
  }
}
