#!/usr/bin/env node
/**
 * Local installation helpers for Aux.
 *
 *   node scripts/package-aux.mjs [--app <dir>] [--bin <dir>] [--chromium <Aux.app>]
 *
 * - Installs the staged CLI to ~/.aux/cli/Aux CLI.app and puts an `aux` command in --bin (default ~/.local/bin).
 * - Builds a launcher bundle (default ~/Applications/Aux.app) that starts the daemon, the CDP gate and the browser.
 *
 * The launcher points back at this checkout, so it is for local use only.
 */
import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { AUX_BUNDLE_ID } from "../vendor/aside/patches/daemon.mjs";

const root = resolve(import.meta.dirname, "..");
const staged = join(root, "out/aside-staged");
const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

const appDir = resolve(option("--app", join(homedir(), "Applications/Aux.app")));
const binDir = resolve(option("--bin", join(homedir(), ".local/bin")));
const chromiumApp = resolve(
  option("--chromium", join(homedir(), "Documents/Code/aux-chromium-security-155/chromium/src/out/AuxAside/Aux.app")),
);
const cliSource = join(staged, "cli/Aux CLI.app");
const cliInstall = join(homedir(), ".aux/cli/Aux CLI.app");

if (!existsSync(cliSource)) {
  console.error("Missing staged CLI. Run: node scripts/vendor-aside.mjs");
  process.exit(1);
}

// The CLI hangs at launch from some protected folders (such as ~/Documents), so it runs from ~/.aux.
rmSync(cliInstall, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
mkdirSync(join(cliInstall, ".."), { recursive: true });
execFileSync("cp", ["-cR", cliSource, cliInstall]);
mkdirSync(binDir, { recursive: true });
const command = join(binDir, "aux");
rmSync(command, { force: true });
writeFileSync(command, `#!/bin/sh\nexec "${join(cliInstall, "Contents/MacOS/aux-cli")}" "$@"\n`);
chmodSync(command, 0o755);
console.log(`installed ${command}`);

const contents = join(appDir, "Contents");
rmSync(appDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
mkdirSync(join(contents, "MacOS"), { recursive: true });
mkdirSync(join(contents, "Resources"), { recursive: true });
cpSync(join(root, "assets/brand/Aux.icns"), join(contents, "Resources/Aux.icns"));
writeFileSync(
  join(contents, "Info.plist"),
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Aux</string>
<key>CFBundleDisplayName</key><string>Aux</string>
<key>CFBundleIdentifier</key><string>${AUX_BUNDLE_ID}.launcher</string>
<key>CFBundleExecutable</key><string>Aux</string>
<key>CFBundleIconFile</key><string>Aux</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleVersion</key><string>1</string>
<key>LSUIElement</key><true/>
</dict></plist>
`,
);
const launcher = join(contents, "MacOS/Aux");
writeFileSync(
  launcher,
  `#!/bin/sh
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
exec node "${join(root, "scripts/aux.mjs")}" --chromium "${join(chromiumApp, "Contents/MacOS/Aux")}" "$@"
`,
);
chmodSync(launcher, 0o755);
execFileSync("codesign", ["--force", "--sign", "-", appDir]);
console.log(`built ${appDir}`);
