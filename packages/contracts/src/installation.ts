import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { normalizeAuxEnvironment, type AuxEnvironment } from "./environment.js";

/** Existing profiles stay in place until the explicit, backed-up migration runs. */
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
  const current = join(root, "Aux Browser");
  const legacy = join(userHome, "Library", "Application Support", "Vector");
  if (existsSync(current) && existsSync(legacy)) {
    throw new Error("Both Aux and legacy Vector data exist. Set AUX_DATA_DIR to the intended installation; profiles cannot be merged automatically.");
  }
  return existsSync(legacy) ? legacy : current;
}

export function resolveDatabasePath(dataDir: string): string {
  const current = join(dataDir, "aux-state.sqlite");
  const legacy = join(dataDir, "vector.sqlite");
  if (existsSync(current) && existsSync(legacy)) {
    throw new Error("Both Aux and legacy Vector databases exist in the selected directory. Resolve the migration before starting the runtime.");
  }
  return existsSync(legacy) ? legacy : current;
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
  const current = join(appData, packaged ? "Aux Browser Profile" : "Aux Browser Development Profile");
  // Historical package.json names Electron's app @vector/desktop in packaged
  // builds too. A Vector directory may hold runtime data only; count it as a
  // browser profile only when Chromium profile markers exist.
  const legacyPackage = join(appData, "@vector/desktop");
  const legacyProduct = join(appData, "Vector");
  const candidates = [current, legacyPackage].filter(existsSync);
  if (["Partitions", "Local State", "Preferences"].some(name => existsSync(join(legacyProduct, name)))) {
    candidates.push(legacyProduct);
  }
  if (candidates.length > 1) {
    throw new Error("Both Aux and legacy browser profiles exist. Set AUX_PROFILE_DIR to the intended profile; profiles cannot be merged automatically.");
  }
  return candidates[0] ?? current;
}
