import { dialog, ipcMain } from "electron";
import { registry } from "../app/services.js";
import { applyCosmeticAll, blockedRequests, filterOps, httpsFirst, insecureBypass, privacy, savePrivacy, saveSitePermissions, sitePermissions, trackersAllowed } from "../privacy/state.js";
import { broadcastToShells, requireOwnedEntry, requireShellUi } from "../windows/registry.js";

export function wirePrivacyIpc() {
  ipcMain.handle("app.clearSiteData", async (event, pageId: unknown) => {
    const state=requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId);
    const wc = entry.view.webContents;
    const url = new URL(wc.getURL());
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Choose an HTTP or HTTPS website.");
    const origin = url.origin;
    const { response } = await dialog.showMessageBox(state.win, {
      type: "warning", title: "Clear website data", message: `Clear cookies and stored data for ${origin}?`,
      detail: "This can sign you out and remove locally saved work. Cookies for related subdomains are also cleared. Bookmarks, history and saved permission decisions remain. Other open pages for this site can recreate data; reload them after clearing.",
      buttons: ["Cancel", "Clear website data"], defaultId: 0, cancelId: 0, noLink: true,
    });
    if (response !== 1) return false;
    if (registry.get(entry.pageId) !== entry || wc.isDestroyed() || new URL(wc.getURL()).origin !== origin) throw new Error("The tab changed while confirmation was open. Choose the website again.");
    await wc.session.clearData({ origins: [origin], originMatchingMode: "origin-in-all-contexts",
      dataTypes: ['cookies', 'localStorage', 'indexedDB', 'fileSystems', 'serviceWorkers', 'webSQL'] });
    return true;
  });
  ipcMain.handle("app.siteInfo", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId);
    const wc = entry.view.webContents;
    const url = new URL(wc.getURL());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Site controls are available for HTTP and HTTPS websites.");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const cookies = await wc.session.cookies.get({ url: url.href });
    if (wc.isDestroyed() || registry.get(entry.pageId) !== entry || wc.getURL() !== url.href) throw new Error("The page changed. Open site controls again.");
    return {
      pageId: entry.pageId, url: url.href, origin: url.origin, title: wc.getTitle(),
      security: url.protocol === "https:" ? "secure" : local ? "local" : "insecure",
      cookieCount: cookies.length,
      permissions: { ...sitePermissions[url.origin] },
      trackersAllowed: trackersAllowed(url.hostname),
    };
  });

  ipcMain.handle("app.sitePermissions", event => { requireShellUi(event); return sitePermissions; });
  ipcMain.handle("app.privacy", event => { requireShellUi(event); return { trackerBlock: privacy.trackerBlock, blocked: blockedRequests, allowedHosts: privacy.allowedHosts, httpsUpgrade: privacy.httpsUpgrade }; });
  ipcMain.handle("app.setHttpsUpgrade", (event, enabled: unknown) => {
    requireShellUi(event);
    if (typeof enabled !== "boolean") throw new Error("Choose whether secure connections are required first.");
    savePrivacy({ ...privacy, httpsUpgrade: enabled });
    httpsFirst.enabled = enabled;
    broadcastToShells("privacy-changed", { trackerBlock: privacy.trackerBlock, blocked: blockedRequests });
    return privacy.httpsUpgrade;
  });
  ipcMain.handle("app.setTrackerBlock", (event, enabled: unknown) => {
    requireShellUi(event);
    if (typeof enabled !== "boolean") throw new Error("Choose whether tracker blocking is on or off.");
    savePrivacy({ ...privacy, trackerBlock: enabled });
    applyCosmeticAll();
    broadcastToShells("privacy-changed", { trackerBlock: privacy.trackerBlock, blocked: blockedRequests });
    return { trackerBlock: privacy.trackerBlock, blocked: blockedRequests };
  });
  ipcMain.handle("app.setSiteTrackers", (event, pageId: unknown, allowed: unknown) => {
    const state = requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId);
    if (typeof allowed !== "boolean") throw new Error("Choose whether this site allows trackers and ads.");
    const wc = entry.view.webContents;
    const hostname = new URL(wc.getURL()).hostname.toLowerCase();
    if (!hostname) throw new Error("Site controls are available for HTTP and HTTPS websites.");
    const set = new Set(privacy.allowedHosts.map(h => h.toLowerCase()));
    if (allowed) set.add(hostname); else set.delete(hostname);
    savePrivacy({ ...privacy, allowedHosts: [...set] });
    applyCosmeticAll();
    broadcastToShells("privacy-changed", { trackerBlock: privacy.trackerBlock, blocked: blockedRequests });
    return { hostname, allowed: trackersAllowed(hostname) };
  });
  ipcMain.handle("app.removeAllowedHost", (event, hostname: unknown) => {
    requireShellUi(event);
    if (typeof hostname !== "string" || !hostname) throw new Error("Choose a website exception to remove.");
    savePrivacy({ ...privacy, allowedHosts: privacy.allowedHosts.filter(host => host !== hostname.toLowerCase()) });
    applyCosmeticAll();
    broadcastToShells("privacy-changed", { trackerBlock: privacy.trackerBlock, blocked: blockedRequests });
    return privacy.allowedHosts;
  });
  ipcMain.handle("app.filterLists", event => { requireShellUi(event); return filterOps.status(); });
  ipcMain.handle("app.updateFilters", async event => { requireShellUi(event); return filterOps.update(); });
  ipcMain.handle("app.addFilterSource", async (event, name: unknown, url: unknown) => { requireShellUi(event); return filterOps.add(name, url); });
  ipcMain.handle("app.removeFilterSource", (event, id: unknown) => { requireShellUi(event); return filterOps.remove(id); });
  ipcMain.handle("app.proceedInsecure", (event, url: unknown) => {
    requireShellUi(event);
    if (typeof url !== "string") throw new Error("An HTTPS address is required.");
    insecureBypass.proceed(url);
    return true;
  });
  ipcMain.handle("app.useHttp", (event, pageId: unknown, url: unknown) => {
    const state = requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId);
    if (typeof url !== "string") throw new Error("An address is required.");
    let target: URL;
    try { target = new URL(url); }
    catch { throw new Error("Invalid address."); }
    if (target.protocol !== "http:") throw new Error("Only unencrypted addresses can be continued to.");
    httpsFirst.allowHttp(target.hostname);
    void entry.view.webContents.loadURL(target.href).catch(() => {});
    return true;
  });
  ipcMain.handle("app.clearSitePermission", (event, origin: unknown, permission?: unknown) => {
    requireShellUi(event);
    if (typeof origin !== "string" || !sitePermissions[origin]) return false;
    const next = { ...sitePermissions };
    if (typeof permission === "string") {
      next[origin] = { ...next[origin] };
      delete next[origin][permission];
      if (Object.keys(next[origin]).length === 0) delete next[origin];
    } else {
      delete next[origin];
    }
    saveSitePermissions(next);
    return true;
  });
}
