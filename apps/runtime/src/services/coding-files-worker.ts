import { snapshotWorktree, copyWorktree, inspectWorktree } from "./coder-worktree-worker.js";
import type { WorktreeFile } from "./coder-worktree-worker.js";
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, rename, unlink } from "node:fs/promises";
import { dirname, join, matchesGlob, relative } from "node:path";
import type { CodingFileState, CodingSearchRequest, CodingSearchResult } from "@aux/contracts/coding-files";
import type { FilesystemPolicy } from "./filesystem-policy.js";

import { canonicalFilePath, filesystemPermits } from "./filesystem-paths.js";
function requireFilesystemPath(policy: FilesystemPolicy, path: string, access: "read" | "write"): string {
  if (!filesystemPermits(policy, path, access)) throw new Error("Path is outside file permissions");
  return canonicalFilePath(path);
}
const hash = (content: string, mode: number) =>
  createHash("sha256")
    .update(JSON.stringify([content, mode]))
    .digest("hex");
export async function fileState(path: string): Promise<CodingFileState> {
  let file;
  try {
    file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { path, content: null, version: null };
    throw error;
  }
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 8 * 1024 * 1024)
      throw new Error("Coding files must be regular files smaller than 8 MiB");
    const bytes = await file.readFile();
    const content = bytes.toString("utf8");
    if (bytes.includes(0) || !Buffer.from(content).equals(bytes)) {
      const contentBase64 = bytes.toString("base64");
      return {
        path,
        content: null,
        contentBase64,
        version: hash(`base64:${contentBase64}`, stat.mode & 0o777),
        mode: stat.mode & 0o777,
      };
    }
    return { path, content, version: hash(content, stat.mode & 0o777), mode: stat.mode & 0o777 };
  } finally {
    await file.close();
  }
}
async function search(policy: FilesystemPolicy, request: CodingSearchRequest): Promise<CodingSearchResult> {
  const root = requireFilesystemPath(policy, request.root, "read");
  const limit = Math.max(1, Math.min(request.limit ?? 100, 500));
  const offset = Number(request.cursor ?? 0);
  if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("Invalid search cursor");
  const result: CodingSearchResult = { matches: [] };
  const expression = request.query && request.regex ? new RegExp(request.query) : undefined;
  let count = 0,
    stopped = false;
  async function visit(directory: string, inherited: { base: string; pattern: string; negate: boolean }[]) {
    let ignores = inherited;
    const ignorePath = join(directory, ".gitignore");
    if (filesystemPermits(policy, ignorePath, "read")) {
      const state = await fileState(ignorePath);
      if (state.content)
        ignores = [
          ...inherited,
          ...state.content
            .split(/\r?\n/)
            .filter((line) => line && !line.startsWith("#"))
            .map((line) => ({
              base: directory,
              pattern: line.replace(/^!/, "").replace(/^\//, ""),
              negate: line.startsWith("!"),
            })),
        ];
    }
    const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const entry of entries) {
      if (stopped) return;
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink() || entry.name === ".git" || !filesystemPermits(policy, path, "read"))
        continue;
      let ignored = ["node_modules", ".cache"].includes(entry.name);
      for (const rule of ignores) {
        const name = relative(rule.base, path).replaceAll("\\", "/");
        const pattern = rule.pattern.replace(/\/$/, "");
        if (matchesGlob(name, pattern) || (!pattern.includes("/") && matchesGlob(entry.name, pattern)))
          ignored = !rule.negate;
      }
      if (ignored) continue;
      if (entry.isDirectory()) {
        await visit(path, ignores);
        continue;
      }
      if (!entry.isFile() || (request.pattern && !matchesGlob(relative(root, path), request.pattern)))
        continue;
      if (request.query === undefined) {
        add({ path });
        continue;
      }
      if ((await lstat(path)).size > 1024 * 1024) continue;
      const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      let content: string;
      try {
        const bytes = await file.readFile();
        content = bytes.toString("utf8");
        if (bytes.includes(0) || !Buffer.from(content).equals(bytes)) continue;
      } finally {
        await file.close();
      }
      for (const [index, text] of content.split(/\r?\n/).entries()) {
        if (expression ? expression.test(text) : text.includes(request.query))
          add({ path, line: index + 1, text: text.slice(0, 2000) });
        if (stopped) break;
      }
    }
  }
  function add(match: CodingSearchResult["matches"][number]) {
    if (count++ < offset) return;
    if (result.matches.length === limit) {
      result.cursor = String(offset + limit);
      stopped = true;
      return;
    }
    result.matches.push(match);
  }
  await visit(root, []);
  return result;
}
export async function executeCodingFileRequest(
  policy: FilesystemPolicy,
  request: Record<string, unknown>,
): Promise<unknown> {
  if (request.kind === "worktree_archive_directory") {
    const path = requireFilesystemPath(policy, String(request.root), "write");
    await mkdir(path, { recursive: true, mode: 0o700 });
    return { created: true };
  }
  if (request.kind === "worktree_inspect") return inspectWorktree(policy, String(request.root));
  if (request.kind === "worktree_snapshot")
    return snapshotWorktree(policy, String(request.root), request.paths as string[]);
  if (request.kind === "worktree_copy") {
    const files = request.files as WorktreeFile[];
    await copyWorktree(policy, String(request.root), files);
    return { copied: files.length };
  }
  const path = requireFilesystemPath(policy, String(request.path ?? request.root), "read");
  if (request.kind === "search") return search(policy, request as unknown as CodingSearchRequest);
  if (request.kind === "list")
    return (await readdir(path, { withFileTypes: true }))
      .filter((entry) => !entry.isSymbolicLink() && filesystemPermits(policy, join(path, entry.name), "read"))
      .map((entry) => ({ path: join(path, entry.name), kind: entry.isDirectory() ? "directory" : "file" }));
  if (request.kind === "stat") {
    try {
      const stat = await lstat(path);
      return {
        path,
        kind: stat.isDirectory() ? "directory" : "file",
        size: stat.size,
        version: stat.isFile() ? (await fileState(path)).version : null,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        return { path, kind: "missing", size: 0, version: null };
      throw error;
    }
  }
  if (request.kind === "read") return fileState(path);
  if (request.kind === "snapshots") {
    const paths = request.paths as string[];
    return Promise.all(paths.map((target) => fileState(requireFilesystemPath(policy, target, "read"))));
  }
  if (request.kind !== "apply") throw new Error("Unknown coding operation");
  const before = request.before as CodingFileState[],
    after = request.after as CodingFileState[];
  for (const expected of before) {
    const target = requireFilesystemPath(policy, expected.path, "write");
    if ((await fileState(target)).version !== expected.version)
      throw new Error("File changed since it was read");
  }
  for (const state of after) {
    const target = requireFilesystemPath(policy, state.path, "write");
    const expected = before.find((item) => item.path === target);
    if (!expected || (await fileState(target)).version !== expected.version)
      throw new Error("File changed before dispatch");
    const mode = state.mode ?? (expected.version === null ? 0o600 : (await lstat(target)).mode & 0o777);
    if (state.version === null) {
      await unlink(target);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    const temporary = join(dirname(target), `.aux-${randomUUID()}`);
    const file = await open(
      temporary,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      mode,
    );
    try {
      await file.chmod(mode);
      await file.writeFile(
        state.contentBase64 !== undefined ? Buffer.from(state.contentBase64, "base64") : state.content!,
        "utf8",
      );
      await file.sync();
    } finally {
      await file.close();
    }
    try {
      await rename(temporary, target);
    } catch (error) {
      await unlink(temporary);
      throw error;
    }
  }
  return after;
}
