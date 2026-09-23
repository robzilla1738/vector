import type { Session, OnBeforeRequestListenerDetails, CallbackResponse } from "electron";

/**
 * Single owner of the session's `webRequest.onBeforeRequest` listener —
 * Electron replaces any later listener, so every request policy composes here
 * in one ordered pipeline: local/dev bypass → main-frame HTTPS upgrade →
 * tracker/ad host blocking. Each stage is a pure decision function.
 */

export interface PolicyHooks {
  /** mainFrame http requests may be upgraded — returns the https URL. */
  httpsUpgrade?(details: OnBeforeRequestListenerDetails): string | undefined;
  /** Whether content blocking is enabled at all. */
  blockingEnabled(): boolean;
  /** Hosts currently blocked (built-in seed + maintained lists). */
  blockedHosts(): ReadonlySet<string>;
  /** Site hosts where the user allowed trackers/ads. */
  hostAllowed(hostname: string): boolean;
  onBlocked?(url: string): void;
}

/** Suffix matcher: a host is blocked when it equals, or sits under, a listed domain. */
export function hostBlocked(hosts: ReadonlySet<string>, hostname: string): boolean {
  let host = hostname.toLowerCase();
  while (host) {
    if (hosts.has(host)) return true;
    const dot = host.indexOf(".");
    if (dot < 0) break;
    host = host.slice(dot + 1);
  }
  return false;
}

/**
 * Host of an absolute http(s) URL without allocating a URL object. Chromium
 * hands webRequest canonical URLs (lowercase host, punycode), so a scan
 * between the scheme and the first path delimiter is exact.
 */
export function urlHost(url: string): string {
  const start = url.indexOf("//");
  if (start < 0) return "";
  let end = url.length;
  for (let i = start + 2; i < url.length; i++) {
    const c = url.charCodeAt(i);
    if (c === 47 || c === 63 || c === 35) { end = i; break; } // / ? #
  }
  let authority = url.slice(start + 2, end);
  const at = authority.lastIndexOf("@");
  if (at >= 0) authority = authority.slice(at + 1);
  if (authority.startsWith("[")) return authority.slice(0, authority.indexOf("]") + 1).toLowerCase();
  const colon = authority.indexOf(":");
  return (colon >= 0 ? authority.slice(0, colon) : authority).toLowerCase();
}

/** The site host a subrequest belongs to — its top-level frame's hostname. */
function siteHost(details: OnBeforeRequestListenerDetails): string {
  try {
    const url = details.frame?.url || details.webContents?.getURL() || details.referrer;
    return url ? urlHost(url) : "";
  } catch {
    return "";
  }
}

const DECISION_CACHE = 2048;
let cachedHosts: ReadonlySet<string> | null = null;
const decisions = new Map<string, boolean>();
/** Suffix-walk results per request host, reset whenever the blocked set is swapped. */
function blockedCached(hosts: ReadonlySet<string>, hostname: string): boolean {
  if (cachedHosts !== hosts) { cachedHosts = hosts; decisions.clear(); }
  const hit = decisions.get(hostname);
  if (hit !== undefined) return hit;
  const blocked = hostBlocked(hosts, hostname);
  if (decisions.size >= DECISION_CACHE) decisions.delete(decisions.keys().next().value!);
  decisions.set(hostname, blocked);
  return blocked;
}

/** Runs for every request the session makes — string checks only on the common path. */
export function decideRequest(details: OnBeforeRequestListenerDetails, hooks: PolicyHooks): CallbackResponse {
  const url = details.url;
  const http = url.startsWith("http://");
  if (details.resourceType === "mainFrame") {
    const upgraded = http ? hooks.httpsUpgrade?.(details) : undefined;
    return upgraded ? { redirectURL: upgraded } : {};
  }
  // Page-level decisions: blocking only applies to http(s) subresources.
  if (!http && !url.startsWith("https://")) return {};
  if (!hooks.blockingEnabled()) return {};
  const host = urlHost(url);
  if (!host || !blockedCached(hooks.blockedHosts(), host)) return {};
  const site = siteHost(details);
  if (site && hooks.hostAllowed(site)) return {};
  hooks.onBlocked?.(url);
  return { cancel: true };
}

export function installRequestPolicy(ses: Session, hooks: PolicyHooks) {
  ses.webRequest.onBeforeRequest((details, callback) => {
    try {
      callback(decideRequest(details, hooks));
    } catch {
      callback({});
    }
  });
}
