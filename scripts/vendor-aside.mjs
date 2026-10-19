#!/usr/bin/env node
/**
 * Builds the Aside stack that Aux ships, from an installed Aside, into out/aside-staged:
 *
 *   Aux Daemon.app       the patched daemon as a single-executable app (Aside's Node host)
 *   extensions/          agent-manager and password-manager extensions, rebranded
 *   agent-runtime/       Node, Python and tools the agent runs code with
 *
 * Only the product name, logos and icons change; internals keep Aside's names so the
 * copied code behaves exactly as shipped. Re-running produces identical output.
 *
 *   node scripts/vendor-aside.mjs [--support <Aside support dir>] [--only daemon|extensions|runtime]
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { findMachOSeaSection, injectMachOSeaBlob, readSeaBlob, writeSeaBlob } from "../vendor/aside/lib/sea.mjs";
import { applyPatches, daemonPatches, daemonPrelude, AUX_BUNDLE_ID } from "../vendor/aside/patches/daemon.mjs";
import { PRODUCT_WORD, CLI_COMMAND } from "../vendor/aside/patches/brand.mjs";
import { cliPatches } from "../vendor/aside/patches/cli.mjs";
import { extensionPatches, rebrandExtension } from "../vendor/aside/patches/extensions.mjs";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const support = resolve(option("--support") ?? join(homedir(), "Library/Application Support/Aside"));
const only = option("--only");
const out = join(root, "out/aside-staged");

const latest = (directory) => {
  const versions = readdirSync(directory).filter((name) => /^\d+\.\d+\.\d+\.\d+$/.test(name));
  versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!versions.length) throw new Error(`No Aside component versions in ${directory}`);
  return join(directory, versions.at(-1));
};
const run = (command, commandArgs, options = {}) =>
  execFileSync(command, commandArgs, { stdio: ["ignore", "inherit", "inherit"], ...options });
const sha = (data) => createHash("sha256").update(data).digest("hex").slice(0, 16);
const clone = (from, to) => {
  rmSync(to, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  mkdirSync(join(to, ".."), { recursive: true });
  run("cp", ["-cR", from, to]);
  // A quarantined ad-hoc binary makes Gatekeeper block its first launch indefinitely.
  run("xattr", ["-dr", "com.apple.quarantine", to]);
};
const setPlist = (plist, key, value) => run("plutil", ["-replace", key, "-string", value, plist]);

const daemonEntitlements = join(root, "vendor/aside/entitlements/daemon.plist");
function signDaemon(app) {
  for (const nested of ["Contents/Applications"]) {
    const directory = join(app, nested);
    if (!existsSync(directory)) continue;
    for (const entry of readdirSync(directory)) run("codesign", ["--force", "--sign", "-", "--deep", join(directory, entry)]);
  }
  run("codesign", ["--force", "--sign", "-", "--options", "runtime", "--entitlements", daemonEntitlements, app]);
}

/** Renames a nested helper app and gives it Aux's identity, name and icon. */
function brandHelper(app, container, from, to, bundleId) {
  const old = join(app, container, `${from}.app`);
  if (!existsSync(old)) return;
  const next = join(app, container, `${to}.app`);
  renameSync(old, next);
  rmSync(join(next, "Contents/_CodeSignature"), { recursive: true, force: true });
  rmSync(join(next, "Contents/embedded.provisionprofile"), { force: true });
  const plist = join(next, "Contents/Info.plist");
  setPlist(plist, "CFBundleName", to);
  setPlist(plist, "CFBundleDisplayName", to);
  setPlist(plist, "CFBundleIdentifier", bundleId);
  const icons = join(next, "Contents/Resources");
  if (existsSync(join(icons, "AppIcon.icns"))) copyFileSync(join(root, "assets/brand/Aux.icns"), join(icons, "AppIcon.icns"));
}

function stageDaemon() {
  const daemonRoot = latest(join(support, "AsideDaemon/mac-arm64"));
  const source = join(daemonRoot, "Aside Daemon.app");
  const binary = join(source, "Contents/MacOS/aside-daemon");
  const original = readFileSync(binary);
  const section = findMachOSeaSection(original);
  const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));

  const prelude = daemonPrelude();
  const code = `${prelude}\n${applyPatches(blob.code, daemonPatches)}`;

  const shim = join(root, "vendor/aside/shims/aux-native.cjs");
  const app = join(out, "Aux Daemon.app");
  clone(source, app);
  rmSync(join(app, "Contents/_CodeSignature"), { recursive: true, force: true });
  rmSync(join(app, "Contents/embedded.provisionprofile"), { force: true });
  renameSync(join(app, "Contents/MacOS/aside-daemon"), join(app, "Contents/MacOS/aux-daemon"));
  const plist = join(app, "Contents/Info.plist");
  setPlist(plist, "CFBundleExecutable", "aux-daemon");
  setPlist(plist, "CFBundleIdentifier", `${AUX_BUNDLE_ID}.daemon`);
  setPlist(plist, "CFBundleName", "Aux Daemon");
  setPlist(plist, "CFBundleDisplayName", "Aux Daemon");
  copyFileSync(shim, join(app, "Contents/Resources/native/aux-native.cjs"));
  brandHelper(app, "Contents/Applications", "Aside Password Importer", "Aux Password Importer", `${AUX_BUNDLE_ID}.PasswordImporter`);

  const target = join(app, "Contents/MacOS/aux-daemon");
  run("codesign", ["--remove-signature", target]);
  const host = readFileSync(target);
  injectMachOSeaBlob(host, writeSeaBlob({ ...blob, code }));
  writeFileSync(target, host);
  chmodSync(target, 0o755);
  rebrandSkills(join(app, "Contents/Resources/static/skills"));
  const icons = join(app, "Contents/Resources/AppIcon.icns");
  if (existsSync(icons)) copyFileSync(join(root, "assets/brand/Aux.icns"), icons);
  signDaemon(app);
  console.log(`daemon ${blob.entryPath.split("/").slice(-3).join("/")} · ${sha(code)}`);
}

function rebrandSkills(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) rebrandSkills(path);
    else if (entry.name.endsWith(".md")) writeFileSync(path, readFileSync(path, "utf8").replace(PRODUCT_WORD, "Aux").replace(CLI_COMMAND, "aux "));
  }
}

const original_daemon_host = () => readFileSync(join(latest(join(support, "AsideDaemon/mac-arm64")), "Aside Daemon.app/Contents/MacOS/aside-daemon"));

function stageCli() {
  const source = join(homedir(), ".aside/cli/Aside CLI.app");
  if (!existsSync(source)) throw new Error("Aside CLI not found; open Aside once so it installs the CLI");
  const binary = join(source, "Contents/MacOS/aside");
  const original = readFileSync(binary);
  const section = findMachOSeaSection(original);
  const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
  const code = applyPatches(blob.code, cliPatches);

  const app = join(out, "cli/Aux CLI.app");
  clone(source, app);
  rmSync(join(app, "Contents/_CodeSignature"), { recursive: true, force: true });
  rmSync(join(app, "Contents/CodeResources"), { force: true });
  rmSync(join(app, "Contents/embedded.provisionprofile"), { force: true });
  rmSync(join(app, "Contents/Resources/native/aside-native.node"), { force: true });
  renameSync(join(app, "Contents/MacOS/aside"), join(app, "Contents/MacOS/aux-cli"));
  const plist = join(app, "Contents/Info.plist");
  setPlist(plist, "CFBundleExecutable", "aux-cli");
  setPlist(plist, "CFBundleIdentifier", `${AUX_BUNDLE_ID}.cli`);
  setPlist(plist, "CFBundleName", "Aux CLI");
  setPlist(plist, "CFBundleDisplayName", "Aux CLI");
  copyFileSync(join(root, "vendor/aside/shims/aux-native.cjs"), join(app, "Contents/Resources/native/aux-native.cjs"));

  // The daemon's Node runtime carries the CLI. The executable cannot be named `aux`: macOS
  // stalls such a binary at exec, so `aux` is a symlink to `aux-cli`.
  const target = join(app, "Contents/MacOS/aux-cli");
  writeFileSync(target, original_daemon_host());
  run("codesign", ["--remove-signature", target]);
  const host = readFileSync(target);
  injectMachOSeaBlob(host, writeSeaBlob({ ...blob, code }));
  writeFileSync(target, host);
  chmodSync(target, 0o755);
  run("codesign", ["--force", "--sign", "-", "--entitlements", daemonEntitlements, app]);
  console.log(`cli ${sha(code)}`);
}

function stageExtensions() {
  const targets = [
    ["AsideAgentManager", "agent-manager"],
    ["AsidePasswordManager", "password-manager"],
  ];
  rmSync(join(out, "extensions"), { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  for (const [component, name] of targets) {
    const from = latest(join(support, component));
    const to = join(out, "extensions", name);
    mkdirSync(to, { recursive: true });
    cpSync(from, to, { recursive: true });
    rebrandExtension(to, name, extensionPatches);
    console.log(`extension ${name} · ${from.split("/").at(-1)}`);
  }
}

function stageRuntime() {
  const from = join(homedir(), ".aside/runtime");
  if (!existsSync(join(from, "version.txt"))) throw new Error("Aside agent runtime not found; open Aside once so it installs");
  clone(from, join(out, "agent-runtime"));
  console.log(`agent runtime · ${readFileSync(join(from, "version.txt"), "utf8").trim()}`);
}

mkdirSync(out, { recursive: true });
if (!only || only === "daemon") stageDaemon();
if (!only || only === "cli") stageCli();
if (!only || only === "extensions") stageExtensions();
if (!only || only === "runtime") stageRuntime();
console.log(`staged at ${out}`);
