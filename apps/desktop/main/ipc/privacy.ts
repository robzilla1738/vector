import { registry } from "../app/services.js";
import { type PrivacyScope, wirePrivacyHandlers } from "../privacy/ipc.js";
import { applyCosmeticAll, blockedCounts, blockedRequests, filterOps, httpsFirst, insecureBypass, privacy, savePrivacy, saveSitePermissions, sitePermissions, trackersAllowed } from "../privacy/state.js";
import { type RegularWindowState, broadcastToShells, handleShell, requireOwnedEntry } from "../windows/registry.js";

const scope = (state: RegularWindowState): PrivacyScope => ({
  win: state.win,
  page: pageId => {
    const entry = requireOwnedEntry(state, pageId);
    return { wc: entry.view.webContents, current: () => registry.get(entry.pageId) === entry };
  },
});

export function wirePrivacyIpc() {
  wirePrivacyHandlers(<A extends unknown[]>(channel: string, fn: (scope: PrivacyScope, ...args: A) => unknown) => handleShell<A>(channel, (state, ...args) => fn(scope(state), ...args)), {
    settings: () => privacy,
    blocked: () => blockedRequests,
    blockedForSite: hostname => blockedCounts.forSite(hostname),
    update: next => { savePrivacy(next); httpsFirst.enabled = next.httpsUpgrade; },
    httpsFirst,
    insecureBypass,
    trackersAllowed,
    applyCosmetic: applyCosmeticAll,
    permissions: () => sitePermissions,
    savePermissions: saveSitePermissions,
    filters: filterOps,
    broadcast: broadcastToShells,
    clearSiteDataPrompt: {
      title: "Clear website data",
      detail: "This can sign you out and remove locally saved work. Cookies for related subdomains are also cleared. Bookmarks, history and saved permission decisions remain. Other open pages for this site can recreate data; reload them after clearing.",
    },
  });
}
