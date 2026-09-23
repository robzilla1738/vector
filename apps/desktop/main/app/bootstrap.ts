import { resolveDataDirectory } from "@aux/contracts/installation";
import { desktopEnv, PROFILE_DIR } from "./instance.js";
import { app } from "electron";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { applyPendingRuntimeRestore } from "../runtime-restore.js";

export const CDP_PORT_FILE = "devtools-port";
export const PRIMARY_WINDOW_ID = "main";
export const desktopStartedAt = Date.now();

export { desktopEnv, PROFILE_DIR } from "./instance.js";
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
