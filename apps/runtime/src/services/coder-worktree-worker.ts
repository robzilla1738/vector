import { constants } from "node:fs";
import { open, mkdir, rename, unlink, readdir, lstat } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { dirname, join, isAbsolute } from "node:path";
import { canonicalFilePath, filesystemPermits } from "./filesystem-paths.js";
import type { FilesystemPolicy } from "./filesystem-policy.js";
export type WorktreeFile = {
  path: string;
  contentBase64: string | null;
  mode?: number;
  version: string | null;
};
const forbidden =
  /(^|\/)(\.env(?:\..*)?|\.npmrc|\.netrc|\.pypirc|\.git-credentials|\.aws|\.azure|\.kube|\.ssh|\.gnupg|\.docker|\.git|credentials?|cookies?|vault)(\/|$)/i;
function target(policy: FilesystemPolicy, root: string, path: string, access: "read" | "write") {
  if (!path || isAbsolute(path) || path.split("/").some((part) => part === ".." || part === "."))
    throw new Error("Invalid worktree path");
  const value = canonicalFilePath(join(root, path));
  if (!filesystemPermits(policy, value, access))
    throw new Error("Worktree path is outside current permissions");
  return value;
}
export async function snapshotWorktree(
  policy: FilesystemPolicy,
  root: string,
  paths: string[],
): Promise<WorktreeFile[]> {
  const files: WorktreeFile[] = [];
  for (const path of paths) {
    if (forbidden.test(path) || !filesystemPermits(policy, join(root, path), "read")) continue;
    const destination = target(policy, root, path, "read");
    let file;
    try {
      file = await open(destination, constants.O_RDONLY | constants.O_NOFOLLOW);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        files.push({ path, contentBase64: null, version: null });
        continue;
      }
      throw error;
    }
    try {
      const info = await file.stat();
      if (!info.isFile()) throw new Error("Worktree snapshots require regular files");
      const bytes = await file.readFile(),
        mode = info.mode & 0o777;
      const text = bytes.toString("utf8"),
        contentBase64 = bytes.toString("base64");
      const data = !text.includes("\0") && Buffer.from(text).equals(bytes) ? text : "base64:" + contentBase64;
      const version = createHash("sha256")
        .update(JSON.stringify([data, mode]))
        .digest("hex");
      files.push({ path, contentBase64, mode, version });
    } finally {
      await file.close();
    }
  }
  return files;
}
export async function copyWorktree(
  policy: FilesystemPolicy,
  root: string,
  files: WorktreeFile[],
): Promise<void> {
  for (const file of files) {
    const destination = target(policy, root, file.path, "write");
    if (file.contentBase64 === null) {
      await unlink(destination).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
      continue;
    }
    await mkdir(dirname(destination), { recursive: true });
    const temporary = join(dirname(destination), `.aux-${randomUUID()}`);
    const output = await open(
      temporary,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      file.mode ?? 0o600,
    );
    try {
      await output.chmod(file.mode ?? 0o600);
      await output.writeFile(Buffer.from(file.contentBase64, "base64"));
      await output.sync();
    } finally {
      await output.close();
    }
    await rename(temporary, destination);
  }
}

export async function inspectWorktree(policy: FilesystemPolicy, root: string) {
  if (!filesystemPermits(policy, canonicalFilePath(root), "read"))
    throw new Error("Worktree inspection is outside current permissions");
  let rootState;
  try {
    rootState = await lstat(root);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { exists: false, files: [], directories: [], blockedPaths: [] };
    throw error;
  }
  if (!rootState.isDirectory() || rootState.isSymbolicLink())
    throw new Error("Worktree recovery root must be its original directory");
  const paths: string[] = [];
  const directories: string[] = [];
  const blockedPaths: string[] = [];
  async function visit(directory: string, relative: string) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (path === ".git" || path === ".aux-coder-baseline.json") continue;
      const absolute = join(root, path);
      if (forbidden.test(path) || entry.isSymbolicLink() || !filesystemPermits(policy, absolute, "read")) {
        blockedPaths.push(path);
        continue;
      }
      if (entry.isDirectory()) {
        directories.push(path);
        await visit(absolute, path);
      } else if (entry.isFile()) paths.push(path);
      else blockedPaths.push(path);
    }
  }
  try {
    await visit(root, "");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" && !paths.length && !directories.length)
      return { exists: false, files: [], directories: [], blockedPaths: [] };
    throw error;
  }
  paths.sort();
  directories.sort();
  blockedPaths.sort();
  return { exists: true, files: await snapshotWorktree(policy, root, paths), directories, blockedPaths };
}
