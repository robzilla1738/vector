import { existsSync, readFileSync } from "node:fs";
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

export function resolveNativeUserDataDir(source: AuxEnvironment = process.env, userHome = homedir()): string {
  if (source.AUX_USER_DATA_DIR) {
    if (!isAbsolute(source.AUX_USER_DATA_DIR)) throw new Error("AUX_USER_DATA_DIR must be an absolute path.");
    return source.AUX_USER_DATA_DIR;
  }
  return join(userHome, "Library", "Application Support", "Aux");
}

export interface NativeProfile { id: string; name: string; archived: boolean; current: boolean }

/** Discovery reads only the native Profile names and directory identifiers. */
export function listNativeProfiles(userDataDir = resolveNativeUserDataDir()): NativeProfile[] {
  let state: { profile?: { last_used?: string; info_cache?: Record<string, { name?: string; is_omitted?: boolean }> } };
  try { state = JSON.parse(readFileSync(join(userDataDir, "Local State"), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  return Object.entries(state.profile?.info_cache ?? {})
    .filter(([id]) => /^(Default|Profile \d+)$/.test(id))
    .map(([id, info]) => ({ id, name: typeof info.name === "string" ? info.name : id,
      archived: info.is_omitted === true, current: id === (state.profile?.last_used ?? "Default") }))
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
}

export function resolveRuntimeDescriptor(source: AuxEnvironment = process.env): string {
  const env = normalizeAuxEnvironment(source);
  if (env.AUX_RUNTIME_FILE) return env.AUX_RUNTIME_FILE;
  if (env.AUX_DATA_DIR) return join(env.AUX_DATA_DIR, "runtime.json");
  const userDataDir = resolveNativeUserDataDir(env);
  const profiles = listNativeProfiles(userDataDir);
  const selector = env.profile ?? env.AUX_BROWSER_PROFILE_ID;
  const matches = selector ? profiles.filter(profile => profile.id === selector || profile.name.toLowerCase() === selector.toLowerCase()) : [];
  if (matches.length > 1) throw new Error(`Ambiguous Profile ${selector}: ${matches.map(profile => `${profile.name} (${profile.id})`).join(", ")}`);
  if (selector && !matches.length && !/^(Default|Profile \d+)$/.test(selector)) throw new Error(`Unknown Profile: ${selector}`);
  const profile = matches[0]?.id ?? selector ?? profiles.find(profile => profile.current && !profile.archived)?.id ?? "Default";
  return join(userDataDir, profile, "Aux Runtime Data", "runtime.json");
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
