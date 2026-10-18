#!/usr/bin/env node
/** One local build/launch owner. Children inherit the plain PID lock. */
import { runCommand } from "./lib/run-command.mjs";
import { nativeSource, nativeFlavor, nativeOutput } from "../chromium/dev-config.mjs";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(import.meta.dirname, "..");
const typescriptCli = createRequire(import.meta.url).resolve("typescript/bin/tsc");
const source = nativeSource;
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
function assertLock(path, pid) {
  const owner = JSON.parse(readFileSync(join(path, "owner.json"), "utf8"));
  if (owner.pid !== pid || !alive(pid)) throw new Error("Native staging requires the dev lock");
}
export function assertDevLock() {
  assertLock(lock, Number(process.env.AUX_DEV_LOCK_PID));
}
export function acquireDevLock(sourceDirectory = source) {
  const acquisitionSource = resolve(sourceDirectory);
  const acquisitionLock = join(acquisitionSource, "out", ".aux-dev-lock");
  mkdirSync(join(acquisitionSource, "out"), { recursive: true });
  try {
    mkdirSync(acquisitionLock);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const owner = JSON.parse(readFileSync(join(acquisitionLock, "owner.json"), "utf8"));
    if (alive(owner.pid)) throw new Error(`Native build is already owned by PID ${owner.pid}`);
    const reclaim = `${acquisitionLock}.reclaim`;
    mkdirSync(reclaim);
    try {
      const current = JSON.parse(readFileSync(join(acquisitionLock, "owner.json"), "utf8"));
      if (current.pid !== owner.pid || alive(current.pid))
        throw new Error("Native lock changed during reclaim");
      rmSync(acquisitionLock, { recursive: true });
      mkdirSync(acquisitionLock);
    } finally {
      rmSync(reclaim, { recursive: true });
    }
  }
  writeFileSync(join(acquisitionLock, "owner.json"), JSON.stringify({ pid: process.pid }), {
    flag: "wx",
    mode: 0o600,
  });
  process.env.AUX_DEV_LOCK_PID = String(process.pid);
  return () => {
    assertLock(acquisitionLock, process.pid);
    rmSync(acquisitionLock, { recursive: true });
  };
}
async function run(command, args, env = {}) {
  assertDevLock();
  await runCommand(command, args, { cwd: root, env: { ...process.env, ...env } });
}
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(
      "Usage: node scripts/dev.mjs [--temp-profile] [--runtime-only] [--debug-native] [--fake-media-devices] [--window-size WIDTH,HEIGHT] [--flavor dev|fast] | -- command [args...] (default: product checkout, fast)",
    );
    return;
  }
  const commandIndex = args.indexOf("--");
  let flavor = nativeFlavor;
  const runtimeOnly = args.includes("--runtime-only");
  const debugNative = args.includes("--debug-native");
  const fakeMediaDevices = args.includes("--fake-media-devices");
  let windowSize;
  if (runtimeOnly && (commandIndex >= 0 || !args.includes("--temp-profile")))
    throw new Error("Use --runtime-only with --temp-profile and no custom command.");
  if (debugNative && (commandIndex >= 0 || !args.includes("--temp-profile")))
    throw new Error("Use --debug-native with --temp-profile and no custom command.");
  if (fakeMediaDevices && (commandIndex >= 0 || !args.includes("--temp-profile")))
    throw new Error("Use --fake-media-devices with --temp-profile and no custom command.");
  if (commandIndex < 0) {
    for (let index = 0; index < args.length; index++) {
      if (
        ["--temp-profile", "--runtime-only", "--debug-native", "--fake-media-devices"].includes(args[index])
      )
        continue;
      if (args[index] === "--flavor" && ["dev", "fast"].includes(args[index + 1])) {
        flavor = args[++index];
        continue;
      }
      if (args[index] === "--window-size") {
        const value = args[++index];
        if (
          !args.includes("--temp-profile") ||
          windowSize ||
          !/^\d{3,4},\d{3,4}$/.test(value ?? "") ||
          value.split(",").some((part) => Number(part) < 400 || Number(part) > 4096)
        )
          throw new Error("Use one --window-size WIDTH,HEIGHT (400–4096) with --temp-profile.");
        windowSize = value;
        continue;
      }
      throw new Error("Unknown dev option; use --help");
    }
  }
  const inherited = process.env.AUX_DEV_LOCK_PID;
  const release = inherited ? (assertDevLock(), () => {}) : acquireDevLock();
  let temporary;
  try {
    if (commandIndex >= 0) {
      const [command, ...commandArgs] = args.slice(commandIndex + 1);
      if (!command) throw new Error("Expected a command after --");
      await run(command, commandArgs);
      return;
    }
    console.log(`Aux development: ${source} · ${flavor}`);
    await run("node", ["scripts/gen-command-routing.mjs"]);
    await run("node", ["scripts/gen-runtime-schema.mjs"]);
    const app = join(source, "out", nativeOutput[flavor], "Aux.app");
    if (runtimeOnly) {
      console.log("Runtime-only: reusing the built native app and renderer; checking its compiled host ABI.");
      await run("node", ["chromium/stage-runtime.mjs", app, "--runtime-only"]);
    } else {
      await run(process.execPath, [typescriptCli, "-b"]);
      await run(process.execPath, [typescriptCli, "-p", "apps/shell/tsconfig.json"]);
      await run("pnpm", ["--filter", "@aux/shell", "build"], { AUX_CHROMIUM_SHELL_BUILD: "1" });
      await run("node", ["chromium/stage-shell.mjs", "install"]);
      await run("chromium/aux-chromium", ["build", "--flavor", flavor]);
      await run("node", ["chromium/stage-runtime.mjs", app]);
    }
    const profile = args.includes("--temp-profile")
      ? (temporary = mkdtempSync(join(tmpdir(), "aux-dev-")))
      : join(homedir(), "aux-dev-profile");
    const executable = join(app, "Contents/MacOS/Aux");
    const launchArgs = [
      `--user-data-dir=${profile}`,
      ...(temporary ? ["--enable-logging=stderr"] : []),
      ...(fakeMediaDevices ? ["--use-fake-device-for-media-stream"] : []),
      ...(windowSize ? [`--window-size=${windowSize}`] : []),
    ];
    if (debugNative)
      await run("lldb", [
        "-o",
        "settings set target.disable-aslr false",
        "-o",
        "settings set target.detach-on-error false",
        "-o",
        "run",
        "--",
        executable,
        ...launchArgs,
      ]);
    else await run(executable, launchArgs);
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
