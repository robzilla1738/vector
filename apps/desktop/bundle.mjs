#!/usr/bin/env node
/**
 * Bundle the Electron main + preload into self-contained files so the
 * packaged app needs no node_modules (workspace deps like @vector/contracts
 * are inlined). electron is external — provided by the runtime.
 */
import { buildSync } from "esbuild";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

buildSync({
  entryPoints: [join(here, "dist/main/index.js")],
  outfile: join(here, "dist/main/index.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["electron"],
  allowOverwrite: true,
  sourcemap: false,
});

buildSync({
  entryPoints: [join(here, "dist/preload/index.cjs")],
  outfile: join(here, "dist/preload/index.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron"],
  allowOverwrite: true,
  sourcemap: false,
});

buildSync({
  entryPoints: [join(here, "dist/preload/engine-paint.cjs")],
  outfile: join(here, "dist/preload/engine-paint.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron"],
  allowOverwrite: true,
  sourcemap: false,
});

console.log("bundled main + preload");
