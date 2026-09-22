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

/** The site host a subrequest belongs to — its top-level frame's hostname. */
function siteHost(details: OnBeforeRequestListenerDetails): string {
  try {
    const url = details.frame?.url || details.webContents?.getURL() || details.referrer;
    return url ? new URL(url).hostname.toLowerCase() : "";
  } catch {
    return "";
  }
}

export function decideRequest(details: OnBeforeRequestListenerDetails, hooks: PolicyHooks): CallbackResponse {
  let parsed: URL;
  try {
    parsed = new URL(details.url);
  } catch {
    return {};
  }
  if (details.resourceType === "mainFrame") {
    const upgraded = hooks.httpsUpgrade?.(details);
    return upgraded ? { redirectURL: upgraded } : {};
  }
  // Page-level decisions: blocking only applies to http(s) subresources.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return {};
  if (!hooks.blockingEnabled()) return {};
  const site = siteHost(details);
  if (site && hooks.hostAllowed(site)) return {};
  if (hostBlocked(hooks.blockedHosts(), parsed.hostname)) {
    hooks.onBlocked?.(details.url);
    return { cancel: true };
  }
  return {};
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
