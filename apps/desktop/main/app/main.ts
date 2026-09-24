/** Process-level wiring for the primary instance; bootstrap stays the first import (data dir, restore, CDP switches). */
import "./bootstrap.js";
import { app } from "electron";
import { installHttpAuth } from "../http-auth.js";
import { boot } from "./boot.js";
import { installExitHandlers } from "./exit.js";
import { installExternalUrlHandlers } from "./external-urls.js";
import { browserHealth, browserProfiles, registry } from "./services.js";
import { setSwallowedSink } from "../swallowed.js";
import { PRIMARY_WINDOW_ID } from "./bootstrap.js";
import { notifyHttpAuthChanged, regularWindows, requireShellUi } from "../windows/registry.js";
import { watchAppearance } from "../windows/appearance.js";
import { registerResultPreviewScheme } from "../result-preview-protocol.js";

registerResultPreviewScheme();
setSwallowedSink(site => browserHealth.noteSwallowed(site));
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
