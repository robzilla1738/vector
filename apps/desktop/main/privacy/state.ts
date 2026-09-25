import { chmodSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR, log } from "../app/bootstrap.js";
import { registry } from "../app/services.js";
import { applyCosmetic } from "../cosmetic-filter.js";
import { fetchFilterText } from "../filter-fetch.js";
import { FilterLists } from "../filter-lists.js";
import { HttpsFirst } from "../https-first.js";
import { createInsecureBypass } from "../insecure-bypass.js";
import { TRACKER_HOSTS } from "../tracker-hosts.js";
import { BlockedCountState } from "@aux/contracts";

export const SITE_PERMISSIONS_FILE = join(DATA_DIR, "site-permissions.json");
export type PermissionDecision = "allow" | "deny";
export let sitePermissions: Record<string, Record<string, PermissionDecision>> = (() => {
  try {
    return JSON.parse(readFileSync(SITE_PERMISSIONS_FILE, "utf8")) as Record<string, Record<string, PermissionDecision>>;
  } catch {
    return {};
  }
})();

export function saveSitePermissions(next: typeof sitePermissions) {
  const temporary = `${SITE_PERMISSIONS_FILE}.tmp`;
  writeFileSync(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
  chmodSync(temporary, 0o600);
  renameSync(temporary, SITE_PERMISSIONS_FILE);
  sitePermissions = next;
}

export const PRIVACY_FILE = join(DATA_DIR, "privacy.json");
export interface PrivacyState { trackerBlock: boolean; allowedHosts: string[]; httpsUpgrade: boolean }
export let privacy: PrivacyState = (() => {
  try {
    const parsed = JSON.parse(readFileSync(PRIVACY_FILE, "utf8")) as Partial<PrivacyState>;
    return {
      trackerBlock: parsed.trackerBlock !== false,
      allowedHosts: Array.isArray(parsed.allowedHosts) ? parsed.allowedHosts.filter(h => typeof h === "string") : [],
      httpsUpgrade: parsed.httpsUpgrade !== false,
    };
  } catch {
    return { trackerBlock: true, allowedHosts: [], httpsUpgrade: true };
  }
})();
export let blockedRequests = 0;
export const blockedCounts = new BlockedCountState();
export const noteBlockedRequest = (_url: string, siteHost: string) => {
  blockedCounts.note(siteHost);
  blockedRequests = blockedCounts.total;
};
export const insecureBypass = createInsecureBypass();
export const httpsFirst = new HttpsFirst();
httpsFirst.enabled = privacy.httpsUpgrade;
export const filterLists = new FilterLists(DATA_DIR);
// Built-in seed + every enabled, downloaded list. Rebuilt on boot and after
// each update so the request policy reads the merged set live. Lists parse
// off-thread; the seed applies until the merged set swaps in.
export let blockedHostSet = new Set<string>(TRACKER_HOSTS);
// Shared by the regular IPC surface and the private-process proxy so list
// mutations always run in this process — the shared cache stays single-writer.
export const filterOps = {
  status: () => filterLists.status(TRACKER_HOSTS.size),
  update: async () => {
    const status = await filterLists.update(fetchFilterText);
    await refreshBlockedHosts();
    return status;
  },
  add: async (name: unknown, url: unknown) => {
    if (typeof name !== "string" || typeof url !== "string") throw new Error("Choose a filter list URL.");
    const sources = filterLists.addSource(name, url);
    await filterLists.update(fetchFilterText);
    await refreshBlockedHosts();
    return sources;
  },
  remove: (id: unknown) => {
    if (typeof id !== "string") throw new Error("Choose a filter list to remove.");
    const sources = filterLists.removeSource(id);
    return refreshBlockedHosts().then(() => sources);
  },
  setEnabled: async (id: unknown, enabled: unknown) => {
    if (typeof id !== "string" || typeof enabled !== "boolean")
      throw new Error("Choose a filter list and whether it is enabled.");
    const sources = filterLists.setEnabled(id, enabled);
    if (enabled) await filterLists.update(fetchFilterText);
    await refreshBlockedHosts();
    return sources;
  },
};

export let blockedHostsGeneration = 0;
export async function refreshBlockedHosts() {
  const generation = ++blockedHostsGeneration;
  try {
    const hosts = await filterLists.loadHostsOffThread();
    if (generation !== blockedHostsGeneration) return;
    const next = new Set(TRACKER_HOSTS);
    for (const host of hosts) next.add(host);
    blockedHostSet = next;
  } catch (error) { log("filter lists unavailable:", String(error)); }
}
void refreshBlockedHosts();
/** Re-apply cosmetic filtering to open pages after toggle/allow changes. */
export function applyCosmeticAll() {
  for (const entry of registry.all()) {
    try { applyCosmetic(entry.view.webContents, privacy.trackerBlock && !trackersAllowed(new URL(entry.view.webContents.getURL()).hostname)); }
    catch { /* page mid-navigation */ }
  }
}
/** Site-level allow — a listed host and everything under it is exempt. */
export function trackersAllowed(hostname: string): boolean {
  let host = hostname.toLowerCase();
  while (host) {
    if (privacy.allowedHosts.includes(host)) return true;
    const dot = host.indexOf(".");
    if (dot < 0) break;
    host = host.slice(dot + 1);
  }
  return false;
}

// First run seeds one maintained list; afterwards lists refresh in the
// background when the newest copy is over a day old. Startup never waits —
// the built-in seed plus whatever is already cached always applies.
export const FILTER_STALE_MS = 24 * 60 * 60 * 1000;
export function maintainFilterLists() {
  try {
    // Network lists are installed only after the user selects them in Settings.
    if (!filterLists.sources().some(source => source.enabled)) return;
    const stale = filterLists.status(TRACKER_HOSTS.size).sources
      .every(source => !source.enabled || !source.meta?.fetchedAt || Date.now() - source.meta.fetchedAt > FILTER_STALE_MS);
    if (!stale) return;
    void filterLists.update(fetchFilterText).then(() => refreshBlockedHosts()).catch(() => {});
  } catch { /* blocking still works from the built-in seed */ }
}

export function savePrivacy(next: PrivacyState) {
  const temporary = `${PRIVACY_FILE}.tmp`;
  writeFileSync(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
  chmodSync(temporary, 0o600);
  renameSync(temporary, PRIVACY_FILE);
  privacy = next;
}
