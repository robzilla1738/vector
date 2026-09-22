import type { Session } from "electron";
import { TRACKER_HOSTS } from "./tracker-hosts.js";

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
 * Cancels requests to known tracker/ad domains for every page in the session.
 * Main-frame navigation is never cancelled — typing a blocked domain into the
 * address bar still opens it. The toggle is read per request so changing it
 * applies without re-registering the handler.
 */
export function installTrackerBlock(ses: Session, options: {
  enabled(): boolean;
  onBlocked?(url: string): void;
}) {
  ses.webRequest.onBeforeRequest((details, callback) => {
    if (!options.enabled() || details.resourceType === "mainFrame") {
      callback({});
      return;
    }
    let host = "";
    try {
      host = new URL(details.url).hostname;
    } catch {
      callback({});
      return;
    }
    if (hostBlocked(TRACKER_HOSTS, host)) {
      options.onBlocked?.(details.url);
      callback({ cancel: true });
      return;
    }
    callback({});
  });
}
