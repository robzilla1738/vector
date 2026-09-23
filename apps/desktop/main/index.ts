/**
 * Aux desktop — Electron main process.
 *
 * Owns: windows, native WebContentsViews, the persistent profile session,
 * downloads, context menus, keyboard forwarding, and the forked runtime.
 * The runtime (separate process) is the execution authority; this process
 * exposes native.* methods to it over fork IPC and forwards its event
 * stream to the renderer.
 *
 * This entry only wires process-level side effects; bootstrap must stay the
 * first import (single-instance lock, profile paths, CDP switches).
 */
import "./app/bootstrap.js";
import { app } from "electron";
import { installHttpAuth } from "./http-auth.js";
import { boot } from "./app/boot.js";
import { installExitHandlers } from "./app/exit.js";
import { installExternalUrlHandlers } from "./app/external-urls.js";
import { browserProfiles, registry } from "./app/services.js";
import { PRIMARY_WINDOW_ID } from "./app/bootstrap.js";
import { notifyHttpAuthChanged, regularWindows, requireShellUi } from "./windows/registry.js";
import { watchAppearance } from "./windows/appearance.js";

browserProfiles.markInstance();
setInterval(() => browserProfiles.markInstance(), 120_000).unref();
installExternalUrlHandlers();
watchAppearance(() => regularWindows.values());
installHttpAuth({
  owner: contents => {
    const entry = registry.byWebContentsId(contents.id);
    return entry ? entry.windowId ?? PRIMARY_WINDOW_ID : null;
  },
  requireShell: event => requireShellUi(event).id,
  changed: notifyHttpAuthChanged,
});
installExitHandlers();

app.whenReady().then(boot).then(()=>{if(process.connected)process.send?.({type:"aux-profile-ready",profileId:browserProfiles.currentId},()=>{});}).catch((e) => {
  console.error("boot failed:", e);
  app.exit(1);
});
