#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { parseArgs } from "node:util";

const {
  positionals: [mode],
  values,
} = parseArgs({
  allowPositionals: true,
  options: {
    worktree: { type: "string", default: process.cwd() },
    source: { type: "string", default: join(homedir(), "aux-chromium-stable/chromium/src") },
    file: { type: "string", multiple: true },
    patch: { type: "string" },
  },
});
const worktree = resolve(values.worktree);
const mirror = join(worktree, ".native");
const baseline = join(worktree, ".native-base");
const manifestPath = join(baseline, "manifest.json");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const safe = (path) => {
  if (
    !path ||
    isAbsolute(path) ||
    path.split(/[\\/]/).some((part) => !part || part === "." || part === "..") ||
    path.includes("\0")
  )
    throw new Error(`Invalid native relative path: ${path}`);
  return path;
};
function checked(root, path) {
  let target = root;
  for (const part of safe(path).split(/[\\/]/)) {
    target = join(target, part);
    try {
      if (lstatSync(target).isSymbolicLink()) throw new Error(`Native path contains a symlink: ${target}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return target;
}
function write(root, path, bytes) {
  const target = checked(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
}

if (mode === "init") {
  if (!values.file?.length)
    throw new Error("init requires --file <Chromium relative path> for each owned file");
  if (existsSync(baseline) || existsSync(mirror))
    throw new Error("Native mirrors already exist; refusing to overwrite edits");
  const paths = [...new Set(values.file.map(safe))].sort();
  const manifest = {};
  for (const path of paths) {
    const source = checked(resolve(values.source), path);
    if (existsSync(source) && !lstatSync(source).isFile())
      throw new Error(`Native source is not a regular file: ${path}`);
    const bytes = existsSync(source) ? readFileSync(source) : null;
    manifest[path] = bytes === null ? null : digest(bytes);
    if (bytes !== null) {
      write(baseline, path, bytes);
      write(mirror, path, bytes);
    }
  }
  write(baseline, "manifest.json", JSON.stringify(manifest, null, 2) + "\n");
  mkdirSync(mirror, { recursive: true });
  console.log(`Mirrored ${paths.length} owned native paths into ${mirror}`);
} else if (mode === "diff") {
  if (!values.patch) throw new Error("diff requires --patch chromium/patches/aux/runtime/<reserved>.patch");
  safe(values.patch);
  const patch = checked(worktree, values.patch);
  const patchRoot = join(worktree, "chromium/patches") + sep;
  if (
    !patch.startsWith(patchRoot) ||
    !/^\d{4}-[a-z0-9-]+\.patch$/.test(patch.slice(patch.lastIndexOf(sep) + 1))
  )
    throw new Error("Patch must use its reserved number under chromium/patches");
  checked(worktree, ".native-base/manifest.json");
  checked(worktree, ".native");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const paths = Object.keys(manifest).map(safe).sort();
  const scratch = mkdtempSync(join(tmpdir(), "aux-native-diff-"));
  const git = (args) => execFileSync("git", args, { cwd: scratch });
  try {
    git(["init", "--quiet"]);
    for (const path of paths) {
      const original = manifest[path] === null ? null : readFileSync(checked(baseline, path));
      if (original !== null && digest(original) !== manifest[path])
        throw new Error(`Native baseline changed: ${path}`);
      if (original !== null) write(scratch, path, original);
    }
    git(["add", "."]);
    for (const path of paths) {
      const edited = checked(mirror, path);
      if (existsSync(edited)) {
        if (!lstatSync(edited).isFile()) throw new Error(`Native mirror is not a regular file: ${path}`);
        write(scratch, path, readFileSync(edited));
      } else rmSync(join(scratch, path), { force: true });
    }
    const added = paths.filter((path) => manifest[path] === null && existsSync(join(mirror, path)));
    if (added.length) git(["add", "--intent-to-add", "--", ...added]);
    const diff = git(["diff", "--binary", "--no-ext-diff", "--", ...paths]);
    if (!diff.length) throw new Error("No native changes in reserved paths");
    git(["diff", "--check"]);
    mkdirSync(dirname(patch), { recursive: true });
    writeFileSync(patch, diff);
    git(["apply", "--reverse", "--check", patch]);
    console.log(`Saved ${patch} (${digest(diff)})`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
} else
  throw new Error(
    "Usage: native-diff.mjs init --file <path>… | diff --patch <reserved path> [--worktree <dir>]",
  );
