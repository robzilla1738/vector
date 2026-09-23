#!/usr/bin/env node
/**
 * Bundle the Electron main + preload into self-contained files so the
 * packaged app needs no node_modules (workspace deps like @aux/contracts
 * are inlined). Build from source so incremental tsc cannot leave an old
 * in-place bundle as the next build’s input. electron is external — provided by the runtime.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { nodeTarget } from "./node-target.mjs";

const here = dirname(fileURLToPath(import.meta.url));

// tsc and esbuild never delete emit for removed sources — clear stale output
// before bundling. Keep only the mtime-cached native binaries in dist/main.
for (const dir of ["dist/preload", "dist/mcp"]) {
  rmSync(join(here, dir), { recursive: true, force: true });
}
const mainOut = join(here, "dist/main");
if (existsSync(mainOut)) {
  const natives = new Set(["liquid-glass.node", "aux-dictation"]);
  for (const entry of readdirSync(mainOut)) {
    if (natives.has(entry)) continue;
    rmSync(join(mainOut, entry), { recursive: true, force: true });
  }
}

// Composition reports for each bundle (excluded from packaging).
const metaDir = join(here, "dist", ".bundle-meta");
mkdirSync(metaDir, { recursive: true });
const bundle = (name, options) => {
  const { metafile } = buildSync({
    bundle: true,
    platform: "node",
    target: nodeTarget,
    minify: true,
    legalComments: "none",
    sourcemap: false,
    metafile: true,
    ...options,
  });
  writeFileSync(join(metaDir, `${name}.json`), JSON.stringify(metafile));
};

bundle("main", {
  entryPoints: [join(here, "main/launcher.ts")],
  outfile: join(here, "dist/main/index.js"),
  format: "esm",
  external: ["electron"],
});

bundle("preload", {
  entryPoints: [join(here, "preload/index.cts")],
  outfile: join(here, "dist/preload/index.cjs"),
  format: "cjs",
  external: ["electron"],
});

bundle("mcp", {
  entryPoints: [join(here, "../../packages/mcp/dist/main.js")],
  outfile: join(here, "dist/mcp/aux-mcp.mjs"),
  format: "esm",
  banner: { js: 'import { createRequire as auxCreateRequire } from "node:module"; const require = auxCreateRequire(import.meta.url);' },
});

bundle("reader-extract", {
  entryPoints: [join(here, "reader/extract.mjs")],
  outfile: join(here, "dist/main/reader-extract.js"),
  platform: "browser",
  target: undefined,
  format: "iife",
  globalName: "AuxReader",
});

bundle("document-worker", {
  entryPoints: [join(here, "main/document-worker.ts")],
  outfile: join(here, "dist/main/document-worker.cjs"),
  format: "cjs",
});

bundle("browser-store", {
  entryPoints: [join(here, "main/tabs/browser-store.worker.ts")],
  outfile: join(here, "dist/main/browser-store.cjs"),
  format: "cjs",
});

// unpdf embeds its own pdf.js build; the cmaps and standard fonts must come
// from the same pdf.js release or glyph lookups silently degrade.
const desktopRequire = createRequire(import.meta.url);
const pdfjsVersion = desktopRequire("pdfjs-dist/package.json").version;
const unpdfPdfjs = readFileSync(fileURLToPath(import.meta.resolve("unpdf/pdfjs")), "utf8").match(/apiVersion:`([^`]+)`/)?.[1];
if (unpdfPdfjs !== pdfjsVersion) {
  throw new Error(`unpdf embeds pdf.js ${unpdfPdfjs ?? "(unknown)"} but pdfjs-dist is ${pdfjsVersion}; align them so PDF cmaps match.`);
}
const pdfAssets = dirname(desktopRequire.resolve("pdfjs-dist/package.json"));
for (const directory of ["cmaps", "standard_fonts"]) {
  cpSync(join(pdfAssets, directory), join(here, "dist/main/pdf-assets", directory), { recursive: true });
}

console.log("bundled main, preload, and Aux MCP bridge");

if (process.platform === "darwin") {
  const headers = dirname(createRequire(import.meta.url).resolve("node-api-headers/package.json"));
  const glass = spawnSync("xcrun", ["clang++", "-std=c++17", "-fobjc-arc", "-mmacosx-version-min=13.0", "-shared", "-undefined", "dynamic_lookup", "-framework", "AppKit", "-I", join(headers, "include"), join(here, "native/liquid-glass.mm"), "-o", join(here, "dist/main/liquid-glass.node")], { stdio: "inherit" });
  if (glass.error || glass.status !== 0) throw glass.error ?? new Error("Could not build Aux Liquid Glass integration.");
  const source = join(here, "native/dictation.swift");
  const info = join(here, "native/dictation-info.plist");
  const output = join(here, "dist/main/aux-dictation");
  if (!existsSync(output) || [source, info, fileURLToPath(import.meta.url)].some(path => statSync(path).mtimeMs > statSync(output).mtimeMs)) {
    const result = spawnSync("xcrun", ["swiftc", "-O", "-swift-version", "5", "-target", `${process.arch === "arm64" ? "arm64" : "x86_64"}-apple-macosx13.0`, source, "-o", output,
      "-Xlinker", "-sectcreate", "-Xlinker", "__TEXT", "-Xlinker", "__info_plist", "-Xlinker", info], {stdio:"inherit"});
    if (result.error || result.status !== 0) throw result.error ?? new Error("Could not build Aux dictation helper.");
  }
}
