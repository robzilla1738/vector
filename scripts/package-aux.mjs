#!/usr/bin/env node
/**
 * Local installation helpers for Aux.
 *
 *   node scripts/package-aux.mjs [--app <dir>] [--bin <dir>] [--chromium <Aux.app>] [--dev]
 *
 * - Installs the staged CLI to ~/.aux/cli/Aux CLI.app and puts an `aux` command in --bin (default ~/.local/bin).
 * - Builds Aux.app (default ~/Applications/Aux.app). It carries the browser, daemon, extensions, agent runtime
 *   and launcher scripts, and starts the daemon, the CDP gate and the browser. The launcher scripts need a
 *   `node` (22 or newer) on PATH. Files are APFS clones, so the copy costs no extra disk space.
 * - With --dev the app is a thin launcher that points back at this checkout instead.
 *
 * The result is ad-hoc signed at most. Developer ID signing and notarization are release steps, not done here.
 */
import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
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

const dev = args.includes("--dev");
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

const clone = (from, to) => {
  mkdirSync(join(to, ".."), { recursive: true });
  execFileSync("cp", ["-c", "-R", from, to]);
};
const launcher = join(contents, "MacOS/Aux");
const preamble = `#!/bin/sh
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Aux needs Node.js" message "Install Node.js 22 or newer (for example: brew install node), then open Aux again."' >/dev/null 2>&1
  exit 1
fi
`;

if (dev) {
  writeFileSync(launcher, `${preamble}exec node "${join(root, "scripts/aux.mjs")}" --chromium "${join(chromiumApp, "Contents/MacOS/Aux")}" "$@"\n`);
} else {
  const browserOut = join(chromiumApp, "..");
  const resources = join(contents, "Resources");
  const browser = join(resources, "browser");
  mkdirSync(browser, { recursive: true });
  // A component build resolves its dylibs relative to the directory that holds Aux.app.
  clone(chromiumApp, join(browser, "Aux.app"));
  for (const name of readdirSync(browserOut)) {
    if (name.endsWith(".dylib") || ["angledata", "MEIPreload", "icudtl.dat", "chrome_crashpad_handler", "hyphen-data"].includes(name)) {
      clone(join(browserOut, name), join(browser, name));
    }
  }

  const aux = join(resources, "aux");
  clone(staged, join(aux, "out/aside-staged"));
  for (const file of [
    "scripts/aux.mjs",
    "vendor/aside/shims/aux-cdp-gate.mjs",
    "vendor/aside/patches/daemon.mjs",
    "vendor/aside/patches/brand.mjs",
  ]) {
    mkdirSync(join(aux, file, ".."), { recursive: true });
    cpSync(join(root, file), join(aux, file));
  }
  // pnpm links node_modules entries into its store; ws has no dependencies, so copy the real directory.
  clone(realpathSync(join(root, "node_modules/ws")), join(aux, "node_modules/ws"));
  writeFileSync(
    launcher,
    `${preamble}here="$(cd "$(dirname "$0")/../Resources" && pwd)"
exec node "$here/aux/scripts/aux.mjs" --chromium "$here/browser/Aux.app/Contents/MacOS/Aux" "$@"
`,
  );
}
chmodSync(launcher, 0o755);
execFileSync("codesign", ["--force", "--sign", "-", appDir], { stdio: "inherit" });
console.log(`built ${appDir}${dev ? " (dev launcher)" : ""}`);
