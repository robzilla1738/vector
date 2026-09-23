import { normalizeAuxEnvironment } from "@aux/contracts";
import { resolveBrowserProfileDirectory } from "@aux/contracts/installation";
import { app } from "electron";
import { mkdirSync } from "node:fs";

export const desktopEnv = normalizeAuxEnvironment(process.env);
export const PROFILE_DIR = resolveBrowserProfileDirectory(app.getPath("appData"), app.isPackaged, desktopEnv);
mkdirSync(PROFILE_DIR, { recursive: true, mode: 0o700 });
// Pin both before app readiness. Package/product renames must not select a new
// Chromium session path implicitly, or separate the user and agent profiles.
app.setPath("userData", PROFILE_DIR);
app.setPath("sessionData", PROFILE_DIR);
/** The single-instance lock is per userData directory, so it is claimed only after the paths above. */
export const primaryInstance = app.requestSingleInstanceLock();
