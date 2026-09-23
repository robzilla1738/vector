import type { Page } from "playwright-core";
import { CdpAttachedDriver } from "./cdp-driver.js";

/**
 * Driver for the user's existing Chrome, launched with remote debugging
 * (`--remote-debugging-port=9222`) or attached per Chrome's documented
 * existing-session workflow. Target identity is the real CDP target id —
 * same-URL tabs are distinguished correctly.
 *
 * Borrowed tabs are never closed by this driver and their lifecycle belongs
 * to the user's browser.
 */
export class AttachedChromeDriver extends CdpAttachedDriver {
  readonly backend = "chrome" as const;

  protected async identityOfPage(page: Page): Promise<string | null> {
    return this.cdpTargetId(page);
  }
}
