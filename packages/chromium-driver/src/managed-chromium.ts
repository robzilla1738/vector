import type { Page } from "playwright-core";
import { CdpAttachedDriver } from "./cdp-driver.js";

/**
 * Driver for Aux-owned pages: real WebContentsView instances created by
 * the Electron main process. The main process injects a marker
 * `globalThis.__auxTid = "atab-<webContentsId>"` into every document of
 * each page view; that marker is the target identity — immune to same-URL
 * ambiguity, unlike URL matching or array position.
 */
export const AUX_MARKER_GLOBAL = "__auxTid";
export const auxMarkerForWebContents = (webContentsId: number) => `atab-${webContentsId}`;

export class ManagedChromiumDriver extends CdpAttachedDriver {
  readonly backend = "aux" as const;

  protected async identityOfPage(page: Page): Promise<string | null> {
    return this.markerOf(page, AUX_MARKER_GLOBAL);
  }

  async recoverPage(targetId: string, pageId: string, documentEpoch = 0) {
    // Playwright retains the crashed flag on its old Page proxy. A fresh CDP
    // connection observes the recovered renderer without disturbing other tabs.
    const browser = await this.connectOverCDP(this.endpoint, { timeout: 15_000 });
    try {
      for (const context of browser.contexts()) for (const page of context.pages()) {
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
    const targets = await this.jsonTargets().catch(() => []);
    for (const t of targets) {
      if (t.type !== "page" || !t.webSocketDebuggerUrl) continue;
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
