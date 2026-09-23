import { normalizeAuxEnvironment } from "@aux/contracts";
import { resolveBrowserProfileDirectory, resolveDataDirectory } from "@aux/contracts/installation";
import { app } from "electron";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { applyPendingRuntimeRestore } from "../runtime-restore.js";

export const CDP_PORT_FILE = "devtools-port";
export const PRIMARY_WINDOW_ID = "main";
export const desktopStartedAt = Date.now();

export const desktopEnv = normalizeAuxEnvironment(process.env);
export const PROFILE_DIR = resolveBrowserProfileDirectory(app.getPath("appData"), app.isPackaged, desktopEnv);
mkdirSync(PROFILE_DIR, { recursive: true, mode: 0o700 });
// Pin both before app readiness. Package/product renames must not select a new
// Chromium session path implicitly, or separate the user and agent profiles.
app.setPath("userData", PROFILE_DIR);
app.setPath("sessionData", PROFILE_DIR);
if (!app.requestSingleInstanceLock()) {
  // app.exit() does not stop this module: without halting here the losing
  // instance would still restore/swap aux-state.sqlite under the running one.
  app.exit(0);
  await new Promise<never>(() => {});
}
// Chromium rewrites this once remote debugging binds; a leftover from the
// last run would hand the runtime a dead port.
export const DEVTOOLS_PORT_FILE = join(PROFILE_DIR, "DevToolsActivePort");
rmSync(DEVTOOLS_PORT_FILE, { force: true });
export const DATA_DIR = resolveDataDirectory(desktopEnv);
mkdirSync(DATA_DIR, { recursive: true });
applyPendingRuntimeRestore(DATA_DIR);


// CDP must be enabled before app ready. Port 0 → OS picks; the real port is
// written to <userData>/DevToolsActivePort. Bind loopback only (plan A22).
app.commandLine.appendSwitch("remote-debugging-address", "127.0.0.1");
app.commandLine.appendSwitch("remote-debugging-port", "0");

export function log(...args: unknown[]) {
  process.stdout.write(`[main] ${args.join(" ")}\n`);
}
