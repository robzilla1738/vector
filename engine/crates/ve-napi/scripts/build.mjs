#!/usr/bin/env node
/**
 * Cargo-only build for `@vector/engine-native` (no @napi-rs/cli needed):
 * `cargo build -p ve-napi --features napi --release`, then copy the cdylib
 * next to index.js as `vector-engine.<platform>-<arch>.node`.
 *
 *   node scripts/build.mjs [--debug]
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, "..");
const engineRoot = resolve(pkg, "../..");
const debug = process.argv.includes("--debug");
const targetDir = process.env.CARGO_TARGET_DIR ? resolve(process.env.CARGO_TARGET_DIR) : join(engineRoot, "target");

const args = ["build", "-p", "ve-napi", "--features", "napi"];
if (!debug) args.push("--release");
console.log(`[engine-native] cargo ${args.join(" ")} (target dir ${targetDir})`);
const r = spawnSync("cargo", args, { cwd: engineRoot, stdio: "inherit", env: { ...process.env, CARGO_TARGET_DIR: targetDir } });
if (r.status !== 0) process.exit(r.status ?? 1);
const hostArgs = ["build", "-p", "ve-host", "--features", "v8"];
if (!debug) hostArgs.push("--release");
console.log(`[engine-native] cargo ${hostArgs.join(" ")}`);
const hr = spawnSync("cargo", hostArgs, { cwd: engineRoot, stdio: "inherit", env: { ...process.env, CARGO_TARGET_DIR: targetDir } });
if (hr.status !== 0) process.exit(hr.status ?? 1);

const ext = process.platform === "win32" ? "dll" : process.platform === "darwin" ? "dylib" : "so";
const libName = process.platform === "win32" ? "ve_napi" : "libve_napi";
const built = join(targetDir, debug ? "debug" : "release", `${libName}.${ext}`);
if (!existsSync(built)) {
  console.error(`[engine-native] expected ${built} after the build`);
  process.exit(1);
}
const out = join(pkg, `vector-engine.${process.platform}-${process.arch}.node`);
copyFileSync(built, out);
console.log(`[engine-native] wrote ${out}`);
const hostName = process.platform === "win32" ? "ve-host.exe" : "ve-host";
const hostBuilt = join(targetDir, debug ? "debug" : "release", hostName);
if (existsSync(hostBuilt)) {
  const hostOut = join(pkg, hostName);
  copyFileSync(hostBuilt, hostOut);
  console.log(`[engine-native] wrote ${hostOut}`);
} else {
  console.warn(`[engine-native] ve-host not found at ${hostBuilt} (build -p ve-host to ship process isolation)`);
}
