import { realpathSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import type { FilesystemPolicy } from "./filesystem-policy.js";
export const CODING_SECRET_PATTERN =
  "(^|/)(\\.npmrc|\\.netrc|\\.pypirc|\\.git-credentials|\\.claude\\.json)$|(^|/)(\\.ssh|\\.gnupg|\\.aws|\\.azure|\\.kube|\\.password-store|Keychains)(/|$)|(^|/)(\\.codex/(auth\\.json|config\\.toml)|\\.claude/\\.credentials\\.json|\\.cursor/mcp\\.json|\\.docker/config\\.json|\\.config/(gh|gcloud|op|1Password))(/|$)";
export const CODING_ENV_PATTERN = "(^|/)\\.env($|\\.[^/]+$)";
export const CODING_ENV_EXAMPLE_PATTERN = "(^|/)\\.env\\.example$";
export const pathInside = (path: string, root: string) =>
  path === root || path.startsWith(root.endsWith(sep) ? root : root + sep);
export function canonicalFilePath(path: string): string {
  let ancestor = resolve(path);
  const tail: string[] = [];
  while (true) {
    try {
      return resolve(realpathSync(ancestor), ...tail);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = dirname(ancestor);
      if (parent === ancestor) throw error;
      tail.unshift(ancestor.slice(parent.length + (parent === sep ? 0 : 1)));
      ancestor = parent;
    }
  }
}
export function filesystemPermits(policy: FilesystemPolicy, path: string, access: "read" | "write"): boolean {
  const target = canonicalFilePath(path);
  if (
    policy.purpose === "coding" &&
    (new RegExp(CODING_SECRET_PATTERN).test(target) ||
      (new RegExp(CODING_ENV_PATTERN).test(target) && !new RegExp(CODING_ENV_EXAMPLE_PATTERN).test(target)))
  )
    return false;
  if (policy.deniedRoots.some((root) => pathInside(target, root))) return false;
  if (
    policy.protectedRoots.some((root) => pathInside(target, root)) &&
    !policy.internalRoots.some((root) => pathInside(target, root))
  )
    return false;
  return policy[access === "read" ? "readRoots" : "writeRoots"].some((root) => pathInside(target, root));
}
