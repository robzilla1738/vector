#!/usr/bin/env node
// A persistent, separate profile for the founder's private macOS review.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const platformDirectory = process.arch === "x64" ? "mac" : `mac-${process.arch}`;
const executable = join(root, "release", platformDirectory, "Aux Browser.app", "Contents", "MacOS", "Aux Browser");
if (process.platform !== "darwin" || !existsSync(executable)) {
  console.error("Build the private macOS application first with pnpm package:local.");
  process.exit(1);
}
const previewRoot = join(homedir(), "Library", "Application Support", "Aux Preview");
mkdirSync(previewRoot, { recursive: true, mode: 0o700 });
// Do not import shell provider keys, dotenv files, or existing browser profiles.
const env = Object.fromEntries(["PATH", "HOME", "TMPDIR", "LANG", "LC_ALL", "DISPLAY"].flatMap(key => process.env[key] === undefined ? [] : [[key, process.env[key]]]));
Object.assign(env, {
  AUX_PROFILE_DIR: join(previewRoot, "Browser Profile"),
  AUX_DATA_DIR: join(previewRoot, "Runtime"),
  AUX_LOAD_DOTENV: "0",
});
console.log(`Opening Aux private preview. Review data stays in ${previewRoot}`);
const child = spawn(executable, [], { cwd: previewRoot, env, stdio: "inherit" });
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
