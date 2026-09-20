#!/usr/bin/env node
/**
 * Bundle the Electron main + preload into self-contained files so the
 * packaged app needs no node_modules (workspace deps like @vector/contracts
 * are inlined). Build from source so incremental tsc cannot leave an old
 * in-place bundle as the next build’s input. electron is external — provided by the runtime.
 */
import { buildSync } from "esbuild";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

buildSync({
  entryPoints: [join(here, "main/launcher.ts")],
  outfile: join(here, "dist/main/index.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["electron"],
  allowOverwrite: true,
  sourcemap: false,
});

buildSync({
  entryPoints: [join(here, "preload/index.cts")],
  outfile: join(here, "dist/preload/index.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron"],
  allowOverwrite: true,
  sourcemap: false,
});

buildSync({
  entryPoints: [join(here, "preload/engine-paint.cts")],
  outfile: join(here, "dist/preload/engine-paint.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron"],
  allowOverwrite: true,
  sourcemap: false,
});

buildSync({
  entryPoints: [join(here, "../../packages/mcp/dist/main.js")],
  outfile: join(here, "dist/mcp/aux-mcp.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  banner: { js: 'import { createRequire as auxCreateRequire } from "node:module"; const require = auxCreateRequire(import.meta.url);' },
  sourcemap: false,
});
buildSync({
  entryPoints: [join(here, "reader/extract.mjs")],
  outfile: join(here, "dist/main/reader-extract.js"),
  bundle: true,
  platform: "browser",
  format: "iife",
  globalName: "AuxReader",
});

console.log("bundled main, preload, and Aux MCP bridge");
