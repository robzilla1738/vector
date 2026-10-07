import {
  canonicalFilePath,
  filesystemPermits,
  pathInside,
  CODING_SECRET_PATTERN,
  CODING_ENV_PATTERN,
  CODING_ENV_EXAMPLE_PATTERN,
} from "./filesystem-paths.js";
export { canonicalFilePath, filesystemPermits, pathInside } from "./filesystem-paths.js";
import { AuxError } from "@aux/contracts";

export type FileAccessMode = "guard" | "read-only" | "full";
export interface FilesystemPolicy {
  mode: FileAccessMode;
  purpose?: "coding";
  revision: number;
  readRoots: string[];
  writeRoots: string[];
  deniedRoots: string[];
  protectedRoots: string[];
  internalRoots: string[];
}
export function requireFilesystemPath(
  policy: FilesystemPolicy,
  path: string,
  access: "read" | "write",
): string {
  const target = canonicalFilePath(path);
  if (!filesystemPermits(policy, target, access))
    throw new AuxError("permission_denied", "This path is outside the current file permissions.");
  return target;
}
const literal = (value: string) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const subpaths = (roots: string[]) => roots.map((root) => `(subpath ${literal(root)})`).join(" ");
/** Sensitive denies are last; a broad Home grant can never override them. */
export function filesystemSeatbelt(
  policy: FilesystemPolicy,
  network: boolean,
  bootstrapFiles: string[] = [],
): string {
  const lines = [
    "(version 1)",
    "(deny default)",
    "(allow process-exec process-fork signal sysctl-read mach-lookup)",
    "(allow file-read-metadata)",
    "(allow file-read-data)",
    '(deny file-read-data (subpath "/Users") (subpath "/Volumes") (subpath "/private/tmp") (subpath "/private/var/folders"))',
  ];
  if (bootstrapFiles.length)
    lines.push(
      `(allow file-read-data ${bootstrapFiles.map((file) => `(literal ${literal(file)})`).join(" ")})`,
    );
  if (policy.readRoots.length) lines.push(`(allow file-read-data ${subpaths(policy.readRoots)})`);
  if (policy.writeRoots.length) lines.push(`(allow file-write* ${subpaths(policy.writeRoots)})`);
  lines.push(
    '(allow file-write* (literal "/dev/null") (literal "/dev/zero") (literal "/dev/random") (literal "/dev/urandom"))',
  );
  for (const root of policy.protectedRoots) {
    const exceptions = policy.internalRoots.filter((internal) => pathInside(internal, root));
    const filter = exceptions.length
      ? `(require-all (subpath ${literal(root)}) ${exceptions.map((internal) => `(require-not (subpath ${literal(internal)}))`).join(" ")})`
      : `(subpath ${literal(root)})`;
    lines.push(`(deny file-read-data file-write* ${filter})`);
  }
  if (policy.deniedRoots.length)
    lines.push(`(deny file-read-data file-write* ${subpaths(policy.deniedRoots)})`);
  if (policy.purpose === "coding") {
    lines.push(`(deny file-read-data file-write* (regex ${literal(CODING_SECRET_PATTERN)}))`);
    lines.push(
      `(deny file-read-data file-write* (require-all (regex ${literal(CODING_ENV_PATTERN)}) (require-not (regex ${literal(CODING_ENV_EXAMPLE_PATTERN)}))))`,
    );
  }
  lines.push(network ? "(allow network-outbound)" : "(deny network-inbound network-outbound network-bind)");
  return lines.join("\n");
}
