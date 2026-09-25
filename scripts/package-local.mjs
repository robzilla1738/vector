#!/usr/bin/env node
/**
 * `pnpm package:local` — private Chromium desktop build.
 * Stage production deps, build the renderer, and run electron-builder
 * for the current platform (unsigned dir target).
 */
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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

// The runtime ships as one esbuild bundle (workspace packages and registry
// deps inlined, lazy SDK imports split into chunks) plus playwright-core,
// which stays external for its dynamic requires and assets. It lives in
// vendor/ and resolves through package.json "imports" because
// electron-builder drops node_modules from extraResources.
console.log("▸ bundle runtime");
const staging = join(root, "release", ".staging");
rmSync(staging, { recursive: true, force: true });
const rtOut = join(staging, "runtime");
mkdirSync(rtOut, { recursive: true });

const desktopRequire = createRequire(join(desktopDir, "package.json"));
const { build, transformSync } = desktopRequire("esbuild");
const { nodeTarget } = await import(pathToFileURL(join(desktopDir, "node-target.mjs")).href);
const runtimeBuild = await build({
  entryPoints: [join(root, "apps/runtime/dist/main.js")],
  outdir: join(rtOut, "dist"),
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
  bundle: true,
  splitting: true,
  platform: "node",
  format: "esm",
  target: nodeTarget,
  minify: true,
  legalComments: "none",
  sourcemap: false,
  metafile: true,
  plugins: [{
    name: "vendored-playwright",
    setup(build) {
      build.onResolve({ filter: /^playwright-core$/ }, () => ({ path: "#playwright-core", external: true }));
      // Native .node bindings cannot be bundled; keep resvg's JS loader beside
      // the exact platform binary that the packaged runtime will load.
      build.onResolve({ filter: /^@resvg\/resvg-js$/ }, () => ({ path: "#resvg", external: true }));
    },
  }],
  banner: { js: 'import { createRequire as auxCreateRequire } from "node:module"; const require = auxCreateRequire(import.meta.url);' },
});
writeFileSync(join(staging, "runtime-meta.json"), JSON.stringify(runtimeBuild.metafile));

const playwrightDir = dirname(createRequire(join(root, "packages/chromium-driver/package.json")).resolve("playwright-core/package.json"));
const playwrightVersion = JSON.parse(readFileSync(join(playwrightDir, "package.json"), "utf8")).version;
const playwrightOut = join(rtOut, "vendor", "playwright-core");
cpSync(playwrightDir, playwrightOut, { recursive: true, dereference: true });
// Type declarations, docs, the CLI, and the trace viewer / recorder / report UIs are never loaded by the runtime.
for (const unused of ["types", "index.d.ts", "README.md", "cli.js", "lib/vite", "lib/tools"]) {
  rmSync(join(playwrightOut, unused), { recursive: true, force: true });
}
// playwright-core ships its bundles unminified. Strip whitespace only: no renaming
// or syntax rewrites, so functions it serializes into pages keep their meaning.
for (const file of readdirSync(join(playwrightOut, "lib"), { recursive: true })) {
  if (!file.endsWith(".js")) continue;
  const path = join(playwrightOut, "lib", file);
  writeFileSync(path, transformSync(readFileSync(path, "utf8"), { loader: "js", minifyWhitespace: true, charset: "utf8" }).code);
}

// Stage the maintained resvg loader with its platform binding in one package
// directory. js-binding.js probes a local binary before optional dependencies.
const resvgRequire=createRequire(join(root,"apps/runtime/package.json"));
const resvgDir=dirname(resvgRequire.resolve("@resvg/resvg-js/package.json"));
const resvgPkg=JSON.parse(readFileSync(join(resvgDir,"package.json"),"utf8"));
const runtimeTag=process.platform==="linux"
  ? process.arch==="arm" ? "linux-arm-gnueabihf"
    : `linux-${process.arch}-${process.report.getReport().header.glibcVersionRuntime?"gnu":"musl"}`
  : process.platform==="win32" ? `win32-${process.arch}-msvc`
    : `${process.platform}-${process.arch}`;
const bindingName=`@resvg/resvg-js-${runtimeTag}`;
if(!Object.hasOwn(resvgPkg.optionalDependencies??{},bindingName))throw new Error(`resvg has no binding for ${runtimeTag}`);
const bindingPath=createRequire(join(resvgDir,"package.json")).resolve(bindingName);
if(!bindingPath.endsWith(".node"))throw new Error(`resvg binding for ${runtimeTag} is not a native module`);
const resvgOut=join(rtOut,"vendor","resvg-js");
mkdirSync(resvgOut,{recursive:true});
for(const file of ["index.js","js-binding.js","package.json","LICENSE"])cpSync(join(resvgDir,file),join(resvgOut,file));
cpSync(bindingPath,join(resvgOut,basename(bindingPath)));

const runtimePkg = JSON.parse(readFileSync(join(root, "apps/runtime/package.json"), "utf8"));
writeFileSync(join(rtOut, "package.json"), JSON.stringify({
  name: runtimePkg.name,
  version: runtimePkg.version,
  private: true,
  type: "module",
  imports: { "#playwright-core": "./vendor/playwright-core/index.mjs", "#resvg": "./vendor/resvg-js/index.js" },
  dependencies: { "playwright-core": playwrightVersion },
}, null, 2));

// Catch a missing or incompatible native binding before packaging succeeds.
const resvgSmoke=join(rtOut,"resvg-smoke.mjs");
writeFileSync(resvgSmoke,'export { Resvg } from "#resvg";');
try{
  const {Resvg}=await import(pathToFileURL(resvgSmoke).href);
  const png=new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="blue"/></svg>').render().asPng();
  if(!Buffer.from(png).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('Packaged resvg did not render a PNG.');
}finally{rmSync(resvgSmoke,{force:true});}

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
