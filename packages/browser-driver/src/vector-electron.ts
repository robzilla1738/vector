import type { Page } from "playwright-core";
import { CdpAttachedDriver } from "./cdp-driver.js";

/**
 * Driver for Vector-owned pages: real WebContentsView instances created by
 * the Electron main process. The main process injects a marker
 * `globalThis.__vectorTid = "vtab-<webContentsId>"` into every document of
 * each page view; that marker is the target identity — immune to same-URL
 * ambiguity, unlike URL matching or array position.
 */
export const VECTOR_MARKER_GLOBAL = "__vectorTid";
export const vectorMarkerForWebContents = (webContentsId: number) => `vtab-${webContentsId}`;

export class VectorElectronDriver extends CdpAttachedDriver {
  readonly backend = "vector" as const;

  protected async identityOfPage(page: Page): Promise<string | null> {
    return this.markerOf(page, VECTOR_MARKER_GLOBAL);
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
      const marker = await this.markerOf(page, VECTOR_MARKER_GLOBAL).catch(() => null);
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
