#!/usr/bin/env node
/**
 * `pnpm package:local` — native product. Builds `ve-shell` (window + V8 + HTTP)
 * into `release/ve-shell`. Electron hybrid is `pnpm package:electron`.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, copyFileSync, existsSync, writeFileSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const engine = join(root, "engine");
const release = join(root, "release");
mkdirSync(release, { recursive: true });

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: engine, stdio: "inherit", ...opts });
  if (r.status !== 0) {
    console.error(`✗ ${cmd} ${args.join(" ")} failed`);
    process.exit(r.status ?? 1);
  }
};

console.log("▸ cargo build -p ve-shell --release --features product");
run("cargo", ["build", "-p", "ve-shell", "--release", "--features", "product"]);

const src = join(engine, "target", "release", process.platform === "win32" ? "ve-shell.exe" : "ve-shell");
const dest = join(release, process.platform === "win32" ? "ve-shell.exe" : "ve-shell");
if (!existsSync(src)) {
  console.error(`✗ missing ${src}`);
  process.exit(1);
}
copyFileSync(src, dest);
try { chmodSync(dest, 0o755); } catch { /* windows */ }
writeFileSync(
  join(release, "PRODUCT.txt"),
  "Vector native product: ve-shell (no Electron, no Chromium).\nHybrid Electron desktop: pnpm package:electron\n",
);
console.log(`\n✓ native product ${dest}`);
