import { posix } from "node:path";
import { CODING_SECRET_PATTERN, CODING_ENV_PATTERN, CODING_ENV_EXAMPLE_PATTERN } from "./filesystem-paths.js";

export const CLOUD_PROJECT_ROOT = "/vercel/sandbox/project";
export const CLOUD_FILE_BYTES = 32 * 1024 * 1024;
export const CLOUD_FILE_PROGRAM_BYTES = 96 * 1024;
const kinds = new Set(["read", "list", "stat", "search", "versions", "snapshots", "apply"]);

/** Syntax only on the host; canonical/symlink authority is checked inside the original VM. */
export function requireCloudFilePath(path: string, root = CLOUD_PROJECT_ROOT): string {
  if (
    typeof path !== "string" ||
    path.includes("\0") ||
    path.includes("\\") ||
    !posix.isAbsolute(path) ||
    posix.normalize(path) !== path ||
    (path !== root && !path.startsWith(`${root}/`)) ||
    path.split("/").some((part) => part === ".aux" || part.startsWith(".aux-")) ||
    new RegExp(CODING_SECRET_PATTERN).test(path) ||
    (new RegExp(CODING_ENV_PATTERN).test(path) && !new RegExp(CODING_ENV_EXAMPLE_PATTERN).test(path))
  )
    throw new Error("Cloud files must remain inside the original project and exclude protected paths.");
  return path;
}

export function validateCloudFileRequest(
  request: Record<string, unknown>,
  root = CLOUD_PROJECT_ROOT,
): string[] {
  if (!kinds.has(String(request.kind))) throw new Error("Unsupported cloud file operation.");
  const paths = [requireCloudFilePath(String(request.path ?? request.root), root)];
  if (request.kind === "versions" || request.kind === "snapshots") {
    if (!Array.isArray(request.paths) || request.paths.length > 200) throw new Error("Invalid file batch.");
    for (const path of request.paths) paths.push(requireCloudFilePath(path, root));
  }
  if (request.kind === "apply") {
    if (
      !Array.isArray(request.before) ||
      !Array.isArray(request.after) ||
      !request.before.length ||
      request.before.length > 200 ||
      request.after.length > 200
    )
      throw new Error("Invalid file changes.");
    for (const state of [...request.before, ...request.after])
      paths.push(requireCloudFilePath(state.path, root));
  }
  return [...new Set(paths)];
}
