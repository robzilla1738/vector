// Read-only validation modeled on Chromium's native_messaging_host_manifest.cc
// and chrome_paths.cc. Never opens a host executable or browser account.
import { accessSync, readFileSync, readdirSync, realpathSync, statSync, constants } from "node:fs";
import { homedir } from "node:os";
import { basename, isAbsolute, join } from "node:path";

const NAME = /^[a-z0-9_]+(?:[a-z0-9_.]*[a-z0-9_])?$/;
const ORIGIN = /^chrome-extension:\/\/[a-p]{32}\/(?:\*)?$/;
const MAX_MANIFEST_BYTES = 64 * 1024;
const MAX_MANIFESTS_PER_LOCATION = 256;

export function macNativeMessagingLocations(userDataDir, home = homedir()) {
  const support = join(home, "Library/Application Support");
  return [
    { label: "active-disposable-profile", path: join(userDataDir, "NativeMessagingHosts") },
    { label: "chrome-user-default", path: join(support, "Google/Chrome/NativeMessagingHosts") },
    { label: "chrome-for-testing-user-default", path: join(support, "Google/Chrome for Testing/NativeMessagingHosts") },
    { label: "chromium-user-default", path: join(support, "Chromium/NativeMessagingHosts") },
    { label: "chrome-global", path: "/Library/Google/Chrome/NativeMessagingHosts" },
    { label: "chrome-for-testing-global", path: "/Library/Google/ChromeForTesting/NativeMessagingHosts" },
    { label: "chromium-global", path: "/Library/Application Support/Chromium/NativeMessagingHosts" },
  ];
}

export function validateNativeMessagingManifest(file) {
  try {
    if (!file.endsWith(".json") || statSync(file).size > MAX_MANIFEST_BYTES)
      return { valid: false, reason: "format_or_size" };
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) ||
        typeof manifest.name !== "string" || manifest.name.length > 256 || !NAME.test(manifest.name) ||
        manifest.name.startsWith(".") || manifest.name.endsWith(".") || manifest.name.includes("..") ||
        basename(file) !== `${manifest.name}.json`)
      return { valid: false, reason: "name" };
    if (typeof manifest.description !== "string" || !manifest.description || manifest.type !== "stdio")
      return { valid: false, reason: "description_or_type" };
    if (typeof manifest.path !== "string" || !isAbsolute(manifest.path))
      return { valid: false, reason: "path" };
    try {
      if (!statSync(realpathSync(manifest.path)).isFile()) return { valid: false, reason: "host_not_file" };
      accessSync(manifest.path, constants.X_OK);
    } catch { return { valid: false, reason: "host_not_executable" }; }
    if (!Array.isArray(manifest.allowed_origins) || manifest.allowed_origins.length === 0 ||
        manifest.allowed_origins.length > 256 || manifest.allowed_origins.some(origin =>
          typeof origin !== "string" || !ORIGIN.test(origin)) ||
        new Set(manifest.allowed_origins).size !== manifest.allowed_origins.length)
      return { valid: false, reason: "allowed_origins" };
    if (manifest.supports_native_initiated_connections !== undefined &&
        typeof manifest.supports_native_initiated_connections !== "boolean")
      return { valid: false, reason: "native_initiated_flag" };
    return { valid: true, name: manifest.name, allowedOrigins: [...manifest.allowed_origins] };
  } catch { return { valid: false, reason: "unreadable_or_invalid_json" }; }
}

/** Sanitized inventory: no unrelated host names, paths, descriptions or origin IDs leave this function. */
export function scanNativeMessagingLocations(locations) {
  return locations.map(({ label, path }) => {
    let files;
    try { files = readdirSync(path).filter(file => file.endsWith(".json")); }
    catch (error) { const absent = error?.code === "ENOENT";
      return { location: label, present: absent ? false : "unreadable",
        manifests: 0, valid: 0, invalid: 0, onePassword: absent ? "absent" : "unknown" }; }
    const sampled = files.slice(0, MAX_MANIFESTS_PER_LOCATION);
    const checks = sampled.map(file => validateNativeMessagingManifest(join(path, file)));
    const onePassword = sampled.findIndex(file => file === "com.1password.1password.json");
    return {
      location: label, present: true, manifests: files.length,
      valid: checks.filter(check => check.valid).length,
      invalid: checks.filter(check => !check.valid).length,
      truncated: files.length > MAX_MANIFESTS_PER_LOCATION,
      onePassword: onePassword < 0 ? "absent" : checks[onePassword].valid ? "valid_manifest" : "invalid_manifest",
    };
  });
}
