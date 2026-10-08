#!/usr/bin/env node
import { nativeSource } from "./dev-config.mjs";
/** Stage the current renderer build; CSP and bootstrap order prevent broken apps. */
import { cpSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { assertDevLock } from "../scripts/dev.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "apps/shell/dist");
const source = nativeSource;
const destination = resolve(process.argv[3] ?? join(source, "chrome/browser/resources/aux/assets"));
function files(path, prefix = "") {
  return readdirSync(join(path, prefix), { withFileTypes: true })
    .flatMap((entry) => {
      const name = join(prefix, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlink in shell assets: ${name}`);
      if (entry.isDirectory()) return entry.name === ".vite" ? [] : files(path, name);
      if (!entry.isFile()) throw new Error(`Unsupported shell asset: ${name}`);
      return name === "manifest.json" ? [] : [name];
    })
    .sort();
}
function check(path) {
  const html = readFileSync(join(path, "index.html"), "utf8");
  const csp = html.indexOf("Content-Security-Policy");
  const bootstrap = html.indexOf('<script type="module" src="/aux_host_bootstrap.js"></script>');
  const entry = html.search(/<script type="module"[^>]+src="\/assets\/index-[^"]+\.js"/);
  if (!html.includes("object-src &#39;self&#39;") || csp < 0 || bootstrap <= csp || entry <= bootstrap)
    throw new Error("Shell requires self-only SurfaceEmbed CSP and Mojo bootstrap before the app entry");
  return files(path);
}
const mode = process.argv[2];
if (mode === "verify") {
  console.log(`Checked ${check(process.argv[3] ? destination : dist).length} renderer assets`);
} else if (mode === "install") {
  assertDevLock();
  const assets = check(dist);
  const staging = `${destination}.staging-${process.pid}`;
  mkdirSync(dirname(destination), { recursive: true });
  try {
    mkdirSync(staging);
    for (const path of assets) {
      mkdirSync(dirname(join(staging, path)), { recursive: true });
      cpSync(join(dist, path), join(staging, path));
    }
    // GN needs a file inventory; there are no pinned hashes or qualification gates.
    writeFileSync(
      join(staging, "manifest.json"),
      JSON.stringify({ files: assets.map((path) => ({ path })) }),
    );
    assertDevLock();
    rmSync(destination, { recursive: true, force: true });
    renameSync(staging, destination);
    console.log(`Staged ${assets.length} renderer assets from apps/shell/dist`);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
} else throw new Error("Usage: node chromium/stage-shell.mjs install [destination] | verify [directory]");
