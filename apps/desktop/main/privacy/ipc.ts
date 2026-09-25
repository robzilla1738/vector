import { BaseWindow, type WebContents, dialog } from "electron";
import { HttpsFirst } from "../https-first.js";
import { createInsecureBypass } from "../insecure-bypass.js";

/** Process-neutral: regular windows persist these choices, private windows keep them in memory. */
export type PermissionDecisions = Record<string, Record<string, "allow" | "deny">>;
export interface PrivacySettings { trackerBlock: boolean; allowedHosts: string[]; httpsUpgrade: boolean }
export interface PrivacyStore {
  settings(): PrivacySettings;
  blocked(): number;
  blockedForSite(hostname: string): number;
  update(next: PrivacySettings): void;
  httpsFirst: HttpsFirst;
  insecureBypass: ReturnType<typeof createInsecureBypass>;
  trackersAllowed(hostname: string): boolean;
  /** Re-apply cosmetic filtering to open pages after a toggle/allow change. */
  applyCosmetic(): void;
  permissions(): PermissionDecisions;
  savePermissions(next: PermissionDecisions): void;
  filters: { status(): unknown; update(): Promise<unknown>; add(name: unknown, url: unknown, kind: unknown): Promise<unknown>;
    remove(id: unknown): unknown; setEnabled(id: unknown, enabled: unknown): Promise<unknown> };
  broadcast(channel: string, payload: unknown): void;
  clearSiteDataPrompt: { title: string; detail: string };
}
/** The calling shell's window and its pages; `page` throws for tabs it doesn't own. */
export interface PrivacyScope { win: BaseWindow; page(pageId: unknown): { wc: WebContents; current(): boolean } }
type Handle = <A extends unknown[]>(channel: string, fn: (scope: PrivacyScope, ...args: A) => unknown) => void;

export function wirePrivacyHandlers(handle: Handle, store: PrivacyStore) {
  const changed = () => store.broadcast("privacy-changed", { trackerBlock: store.settings().trackerBlock, blocked: store.blocked() });
  handle("app.clearSiteData", async (scope, pageId: unknown) => {
    const page = scope.page(pageId);
    const wc = page.wc;
    const url = new URL(wc.getURL());
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Choose an HTTP or HTTPS website.");
    const origin = url.origin;
    const { response } = await dialog.showMessageBox(scope.win, {
      type: "warning", title: store.clearSiteDataPrompt.title, message: `Clear cookies and stored data for ${origin}?`,
      detail: store.clearSiteDataPrompt.detail,
      buttons: ["Cancel", "Clear website data"], defaultId: 0, cancelId: 0, noLink: true,
    });
    if (response !== 1) return false;
    if (!page.current() || wc.isDestroyed() || new URL(wc.getURL()).origin !== origin) throw new Error("The tab changed while confirmation was open. Choose the website again.");
    await wc.session.clearData({ origins: [origin], originMatchingMode: "origin-in-all-contexts",
      dataTypes: ['cookies', 'localStorage', 'indexedDB', 'fileSystems', 'serviceWorkers', 'webSQL'] });
    return true;
  });
  handle("app.siteInfo", async (scope, pageId: unknown) => {
    const page = scope.page(pageId);
    const wc = page.wc;
    const url = new URL(wc.getURL());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Site controls are available for HTTP and HTTPS websites.");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const cookies = await wc.session.cookies.get({ url: url.href });
    if (wc.isDestroyed() || !page.current() || wc.getURL() !== url.href) throw new Error("The page changed. Open site controls again.");
    return {
      pageId, url: url.href, origin: url.origin, title: wc.getTitle(),
      security: url.protocol === "https:" ? "secure" : local ? "local" : "insecure",
      cookieCount: cookies.length,
      permissions: { ...store.permissions()[url.origin] },
      trackersAllowed: store.trackersAllowed(url.hostname),
      blockedCount: store.blockedForSite(url.hostname),
    };
  });
  handle("app.sitePermissions", () => store.permissions());
  handle("app.privacy", () => ({ ...store.settings(), blocked: store.blocked() }));
  handle("app.setHttpsUpgrade", (_, enabled: unknown) => {
    if (typeof enabled !== "boolean") throw new Error("Choose whether secure connections are required first.");
    store.update({ ...store.settings(), httpsUpgrade: enabled });
    changed();
    return store.settings().httpsUpgrade;
  });
  handle("app.setTrackerBlock", (_, enabled: unknown) => {
    if (typeof enabled !== "boolean") throw new Error("Choose whether tracker blocking is on or off.");
    store.update({ ...store.settings(), trackerBlock: enabled });
    store.applyCosmetic();
    changed();
    return { trackerBlock: store.settings().trackerBlock, blocked: store.blocked() };
  });
  handle("app.setSiteTrackers", (scope, pageId: unknown, allowed: unknown) => {
    const { wc } = scope.page(pageId);
    if (typeof allowed !== "boolean") throw new Error("Choose whether this site allows trackers and ads.");
    const hostname = new URL(wc.getURL()).hostname.toLowerCase();
    if (!hostname) throw new Error("Site controls are available for HTTP and HTTPS websites.");
    const set = new Set(store.settings().allowedHosts.map(h => h.toLowerCase()));
    if (allowed) set.add(hostname); else set.delete(hostname);
    store.update({ ...store.settings(), allowedHosts: [...set] });
    store.applyCosmetic();
    changed();
    return { hostname, allowed: store.trackersAllowed(hostname) };
  });
  handle("app.removeAllowedHost", (_, hostname: unknown) => {
    if (typeof hostname !== "string" || !hostname) throw new Error("Choose a website exception to remove.");
    store.update({ ...store.settings(), allowedHosts: store.settings().allowedHosts.filter(host => host !== hostname.toLowerCase()) });
    store.applyCosmetic();
    changed();
    return store.settings().allowedHosts;
  });
  handle("app.filterLists", () => store.filters.status());
  handle("app.updateFilters", () => store.filters.update());
  handle("app.addFilterSource", (_, name: unknown, url: unknown, kind: unknown = "hosts") => store.filters.add(name, url, kind));
  handle("app.removeFilterSource", (_, id: unknown) => store.filters.remove(id));
  handle("app.setFilterSourceEnabled", (_, id: unknown, enabled: unknown) => store.filters.setEnabled(id, enabled));
  handle("app.proceedInsecure", (_, url: unknown) => {
    if (typeof url !== "string") throw new Error("An HTTPS address is required.");
    store.insecureBypass.proceed(url);
    return true;
  });
  handle("app.useHttp", (scope, pageId: unknown, url: unknown) => {
    const { wc } = scope.page(pageId);
    if (typeof url !== "string") throw new Error("An address is required.");
    let target: URL;
    try { target = new URL(url); }
    catch { throw new Error("Invalid address."); }
    if (target.protocol !== "http:") throw new Error("Only unencrypted addresses can be continued to.");
    store.httpsFirst.allowHttp(target.hostname);
    void wc.loadURL(target.href).catch(() => {});
    return true;
  });
  handle("app.clearSitePermission", (_, origin: unknown, permission?: unknown) => {
    const current = store.permissions();
    if (typeof origin !== "string" || !current[origin]) return false;
    const next = { ...current };
    if (typeof permission === "string") {
      next[origin] = { ...next[origin] };
      delete next[origin][permission];
      if (Object.keys(next[origin]).length === 0) delete next[origin];
    } else {
      delete next[origin];
    }
    store.savePermissions(next);
    return true;
  });
}
