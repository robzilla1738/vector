import { app } from "electron";
import { spawn as spawnProcess, type ChildProcess } from "node:child_process";
import { channel, runtimeInvoke, runtimeReady } from "../runtime/supervisor.js";
import { focusedRegularWindow } from "../windows/registry.js";
import { PRIMARY_WINDOW_ID, desktopEnv, log } from "./bootstrap.js";
import { browserProfiles } from "./services.js";

export const pendingExternalUrls: string[] = [];

export let shellReady = false;
export let openingExternalUrls = false;

/**
 * External links belong to the profile the user last browsed in. When the OS
 * delivers a link to a different instance, forward it there through the same
 * spawn path `ui.openBrowserProfile` uses — the target's own argv/second-
 * instance handling opens it whether that instance is running or not. The
 * `AUX_EXTERNAL_FORWARD` hop count bounds routing to two hops.
 */
const DIRECT_PROFILE_URL = "--aux-direct-profile-url";

function spawnProfileUrl(target: string, url: string, hop: number, direct = false): ChildProcess {
  const env = { ...browserProfiles.environment(target, process.env), AUX_EXTERNAL_FORWARD: String(hop) };
  const args = [...(app.isPackaged ? [] : [app.getAppPath()]), ...(direct ? [DIRECT_PROFILE_URL] : []), url];
  return spawnProcess(process.execPath, args, { env, detached: true, stdio: "ignore" });
}

export function forwardExternalUrl(target: string, url: string) {
  try {
    const child = spawnProfileUrl(target, url, Number(desktopEnv.AUX_EXTERNAL_FORWARD ?? "0") + 1);
    child.once("error", () => { pendingExternalUrls.push(url); void flushExternalUrls(); });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

/** A cited source goes to its captured Profile, regardless of the last-active Profile. */
export async function openProfileSourceUrl(target: string, url: string): Promise<boolean> {
  if (!isWebUrl(url)) throw new Error("Only web source URLs can open in a browser Profile.");
  const child = spawnProfileUrl(target, url, 2, true);
  return new Promise<boolean>((resolve, reject) => {
    child.once("spawn", () => { child.unref(); resolve(true); });
    child.once("error", reject);
  });
}


export function queueExternalUrl(url: string) {
  if (!isWebUrl(url)) return;
  const hop = Number(desktopEnv.AUX_EXTERNAL_FORWARD ?? "0");
  if (hop < 2) {
    const target = browserProfiles.externalLinkTarget();
    if (target && forwardExternalUrl(target, url)) return;
  }
  pendingExternalUrls.push(url);
  void flushExternalUrls();
}

export async function flushExternalUrls() {
  if (!runtimeReady || !shellReady || !channel || openingExternalUrls) return;
  openingExternalUrls = true;
  try {
    while (pendingExternalUrls.length) {
      const url = pendingExternalUrls.shift()!;
      try {
        const owner = focusedRegularWindow();
        if(owner?.win.isMinimized())owner.win.restore();
        owner?.win.show();owner?.win.focus();
        const target = await runtimeInvoke("pages.open", { url, windowId: owner?.id ?? PRIMARY_WINDOW_ID }) as { pageId: string };
        await runtimeInvoke("pages.activate", { pageId: target.pageId });
      } catch (error) {
        log("external URL failed", new URL(url).origin, error instanceof Error ? error.message : String(error));
      }
    }
  } finally {
    openingExternalUrls = false;
  }
}

export function installExternalUrlHandlers() {
  app.on("second-instance", (_event, argv) => {
    for (const value of argv) {
      if (argv.includes(DIRECT_PROFILE_URL)) queueDirectProfileUrl(value);
      else queueExternalUrl(value);
    }
    const state = focusedRegularWindow();
    if (state?.win.isMinimized()) state.win.restore();
    state?.win.show();
    state?.win.focus();
  });
  app.on("open-url", (event, url) => {
    event.preventDefault();
    queueExternalUrl(url);
  });
  app.on("activate", () => browserProfiles.noteActive(browserProfiles.currentId));
  for (const value of process.argv.slice(1)) {
    if (process.argv.includes(DIRECT_PROFILE_URL)) queueDirectProfileUrl(value);
    else queueExternalUrl(value);
  }
}

function queueDirectProfileUrl(url: string) {
  if (!isWebUrl(url)) return;
  pendingExternalUrls.push(url);
  void flushExternalUrls();
}

export function markShellReady() {
  shellReady = true;
  void flushExternalUrls();
}

/**
 * Only web URLs may be handed to the OS. `file:`, `smb:`, custom schemes
 * etc. reach arbitrary local handlers — never from a page or the renderer.
 */
export function isWebUrl(u: unknown): u is string {
  if (typeof u !== "string") return false;
  try {
    const p = new URL(u).protocol;
    return p === "http:" || p === "https:";
  } catch {
    return false;
  }
}
