#!/usr/bin/env node
/**
 * `pnpm package:local` — private Chromium desktop build.
 * Stage production deps, build the renderer, and run electron-builder
 * for the current platform (unsigned dir target).
 */
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { bundleRuntime } from "./bundle-runtime.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const signed = process.argv.includes('--signed');
if (signed) {
  if (process.platform !== 'darwin') throw new Error('Signed Aux qualification currently requires macOS.');
  const feed = new URL(process.env.AUX_UPDATE_BASE_URL || 'https://invalid.example/');
  if (feed.protocol !== 'https:' || feed.username || feed.password || feed.search || feed.hash || feed.hostname === 'invalid.example')
    throw new Error('Set AUX_UPDATE_BASE_URL to the HTTPS directory that will host update metadata and packages.');
  if (!process.env.CSC_NAME?.startsWith('Developer ID Application: '))
    throw new Error('Set CSC_NAME to the Aux Developer ID Application identity.');
  const appleIdCredentials = process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID;
  const apiKeyCredentials = process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID && process.env.APPLE_API_ISSUER;
  if (!appleIdCredentials && !apiKeyCredentials) throw new Error('Notarization credentials are required (Apple ID or App Store Connect API key).');
}
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", ...opts });
  if (r.status !== 0) {
    console.error(`✗ ${cmd} ${args.join(" ")} failed`);
    process.exit(r.status ?? 1);
  }
};

console.log("▸ build workspace");
// Clean vendored outputs first: tsc --force re-emits sources but never removes
// orphaned files from renamed/deleted modules, and stale emit would ship.
for (const dist of ["packages/contracts", "packages/chromium-driver", "apps/runtime"]) {
  rmSync(join(root, dist, "dist"), { recursive: true, force: true });
}
run("node_modules/.bin/tsc", ["-b", "tsconfig.json", "--force"]);

const desktopDir = join(root, "apps", "desktop");

console.log("▸ bundle main+preload");
run(process.execPath, [join(desktopDir, "bundle.mjs")]);

console.log("▸ build renderer");
run(join(desktopDir, "node_modules", ".bin", "vite"), ["build"], { cwd: desktopDir });

// Share the verified runtime bundle with the Chromium app staging path.
console.log("▸ bundle runtime");
const staging = join(root, "release", ".staging");
rmSync(staging, { recursive: true, force: true });
const rtOut = join(staging, "runtime");
const { nodeTarget } = await import(pathToFileURL(join(desktopDir, "node-target.mjs")).href);
await bundleRuntime(rtOut, nodeTarget);

console.log("▸ electron-builder");
run(join(desktopDir, "node_modules", ".bin", "electron-builder"), signed
  ? ["--config", "electron-builder.signed.cjs", "--publish", "never"]
  : ["--config", "electron-builder.yml"], {
  cwd: desktopDir,
  env: signed ? { ...process.env } : { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: "false" },
});

const platformOutput = process.platform === "darwin"
  ? (process.arch === "x64" ? "mac" : `mac-${process.arch}`)
  : `${process.platform === "win32" ? "win" : "linux"}${process.arch === "x64" ? "" : `-${process.arch}`}-unpacked`;
const out = join(root, "release");
console.log(`\n✓ packaged app in ${out}`);
if (process.platform === "darwin") console.log(signed ? '  → signed DMG/ZIP and update metadata; no artifacts were published' : `  → ${join(out, platformOutput, "Aux Browser.app")}`);
