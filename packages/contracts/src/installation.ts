import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { normalizeAuxEnvironment, type AuxEnvironment } from "./environment.js";

export const AUX_DATABASE_NAME = "aux-state.sqlite";
export const LEGACY_DATABASE_NAME = "vector.sqlite";

export function resolveDataDirectory(
  source: AuxEnvironment = process.env,
  userHome = homedir(),
  platform: NodeJS.Platform = process.platform,
): string {
  const env = normalizeAuxEnvironment(source);
  if (env.AUX_DATA_DIR) return env.AUX_DATA_DIR;

  let root = join(userHome, ".local", "share");
  if (platform === "darwin") root = join(userHome, "Library", "Application Support");
  if (platform === "linux" && env.XDG_DATA_HOME) root = env.XDG_DATA_HOME;
  if (platform === "win32") root = env.LOCALAPPDATA || join(userHome, "AppData", "Local");
  return join(root, "Aux Browser");
}

/**
 * Resolve the runtime database inside the selected data directory. A legacy
 * `vector.sqlite` found here is incompatible data: it is preserved untouched
 * and reported rather than opened or overwritten.
 */
export function resolveDatabasePath(dataDir: string): string {
  const current = join(dataDir, AUX_DATABASE_NAME);
  const legacy = join(dataDir, LEGACY_DATABASE_NAME);
  if (existsSync(legacy)) {
    throw new Error(
      `The selected data directory contains a legacy Vector database (${LEGACY_DATABASE_NAME}). ` +
      `It was preserved unchanged — remove or archive it, or point AUX_DATA_DIR elsewhere.`,
    );
  }
  return current;
}

export function resolveRuntimeDescriptor(source: AuxEnvironment = process.env): string {
  const env = normalizeAuxEnvironment(source);
  return env.AUX_RUNTIME_FILE || join(resolveDataDirectory(env), "runtime.json");
}

/** Select a Chromium profile without opening, copying, or decrypting its contents. */
export function resolveBrowserProfileDirectory(
  appData: string,
  packaged: boolean,
  source: AuxEnvironment = process.env,
): string {
  const env = normalizeAuxEnvironment(source);
  if (env.AUX_PROFILE_DIR) {
    if (!isAbsolute(env.AUX_PROFILE_DIR)) throw new Error("AUX_PROFILE_DIR must be an absolute path.");
    return env.AUX_PROFILE_DIR;
  }
  // Keep Chromium storage separate from runtime roots: creating a profile must
  // not accidentally create a second runtime installation during discovery.
  return join(appData, packaged ? "Aux Browser Profile" : "Aux Browser Development Profile");
}
