#!/usr/bin/env node
/** One local build/launch owner. Children inherit the plain PID lock. */
import { runCommand } from "./lib/run-command.mjs";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(import.meta.dirname, "..");
const source = resolve(process.env.AUX_CHROMIUM_SRC ?? join(homedir(), "aux-chromium-stable/chromium/src"));
const lock = join(source, "out", ".aux-dev-lock");
function alive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}
export function assertDevLock() {
  const pid = Number(process.env.AUX_DEV_LOCK_PID);
  const owner = JSON.parse(readFileSync(join(lock, "owner.json"), "utf8"));
  if (owner.pid !== pid || !alive(pid)) throw new Error("Native staging requires the dev lock");
}
function acquire() {
  mkdirSync(join(source, "out"), { recursive: true });
  try {
    mkdirSync(lock);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const owner = JSON.parse(readFileSync(join(lock, "owner.json"), "utf8"));
    if (alive(owner.pid)) throw new Error(`Native build is already owned by PID ${owner.pid}`);
    const reclaim = `${lock}.reclaim`;
    mkdirSync(reclaim);
    try {
      const current = JSON.parse(readFileSync(join(lock, "owner.json"), "utf8"));
      if (current.pid !== owner.pid || alive(current.pid))
        throw new Error("Native lock changed during reclaim");
      rmSync(lock, { recursive: true });
      mkdirSync(lock);
    } finally {
      rmSync(reclaim, { recursive: true });
    }
  }
  writeFileSync(join(lock, "owner.json"), JSON.stringify({ pid: process.pid }), { flag: "wx", mode: 0o600 });
  process.env.AUX_DEV_LOCK_PID = String(process.pid);
  return () => {
    assertDevLock();
    rmSync(lock, { recursive: true });
  };
}
async function run(command, args, env = {}) {
  assertDevLock();
  await runCommand(command, args, { cwd: root, env: { ...process.env, ...env } });
}
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("Usage: node scripts/dev.mjs [--temp-profile] | -- command [args...]");
    return;
  }
  const commandIndex = args.indexOf("--");
  if (commandIndex < 0 && args.some((arg) => arg !== "--temp-profile"))
    throw new Error("Unknown dev option; use --help");
  const inherited = process.env.AUX_DEV_LOCK_PID;
  const release = inherited ? (assertDevLock(), () => {}) : acquire();
  let temporary;
  try {
    if (commandIndex >= 0) {
      const [command, ...commandArgs] = args.slice(commandIndex + 1);
      if (!command) throw new Error("Expected a command after --");
      await run(command, commandArgs);
      return;
    }
    await run("node", ["scripts/gen-runtime-schema.mjs"]);
    await run("npx", ["tsc", "-b"]);
    await run("npx", ["tsc", "-p", "apps/shell/tsconfig.json"]);
    await run("pnpm", ["--filter", "@aux/shell", "build"], { AUX_CHROMIUM_SHELL_BUILD: "1" });
    await run("node", ["chromium/stage-shell.mjs", "install"]);
    await run("chromium/aux-chromium", ["build"]);
    const app = join(source, "out/AuxDev/Aux.app");
    await run("node", ["chromium/stage-runtime.mjs", app]);
    const profile = args.includes("--temp-profile")
      ? (temporary = mkdtempSync(join(tmpdir(), "aux-dev-")))
      : join(homedir(), "aux-dev-profile");
    await run(join(app, "Contents/MacOS/Aux"), [`--user-data-dir=${profile}`]);
  } finally {
    if (temporary) rmSync(temporary, { recursive: true, force: true });
    release();
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
