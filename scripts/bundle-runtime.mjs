#!/usr/bin/env node
/** Build the self-contained Aux Runtime payload for Chromium. */
import { copyFileSync, cpSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = join(root, "apps", "runtime");

export async function bundleRuntime(rtOut, target) {
  // The runtime ships as one esbuild bundle (workspace packages and registry
  // deps inlined, lazy SDK imports split into chunks) plus playwright-core,
  // which stays external for its dynamic requires and assets. It lives in
  // vendor/ and resolves through package.json "imports" because
  // The native runtime bundle does not ship node_modules.
  rmSync(rtOut, { recursive: true, force: true });
  mkdirSync(rtOut, { recursive: true });

  const runtimeRequire = createRequire(join(runtimeDir, "package.json"));
  const { build, transformSync } = runtimeRequire("esbuild");
  const runtimeBuild = await build({
    entryPoints: {
      main: join(root, "apps/runtime/dist/main.js"),
      mcp: join(root, "packages/mcp/dist/main.js"),
      "privacy-checkpoint-worker": join(root, "apps/runtime/dist/store/privacy-checkpoint-worker.js"),
    },
    outdir: join(rtOut, "dist"),
    entryNames: "[name]",
    chunkNames: "chunks/[name]-[hash]",
    bundle: true,
    splitting: true,
    platform: "node",
    format: "esm",
    target,
    minify: true,
    legalComments: "none",
    sourcemap: false,
    metafile: true,
    plugins: [
      {
        name: "vendored-playwright",
        setup(build) {
          build.onResolve({ filter: /^playwright-core$/ }, () => ({
            path: "#playwright-core",
            external: true,
          }));
          // Native .node bindings cannot be bundled; keep resvg's JS loader beside
          // the exact platform binary that the packaged runtime will load.
          build.onResolve({ filter: /^@resvg\/resvg-js$/ }, () => ({ path: "#resvg", external: true }));
        },
      },
    ],
    banner: {
      js: 'import { createRequire as auxCreateRequire } from "node:module"; const require = auxCreateRequire(import.meta.url);',
    },
  });
  writeFileSync(join(dirname(rtOut), "runtime-meta.json"), JSON.stringify(runtimeBuild.metafile));

  // QuickJS's async release variant loads its WASM beside the esbuild chunk at
  // runtime. esbuild bundles the loader JS but does not copy that sibling file.
  const quickjsRequire = createRequire(runtimeRequire.resolve("quickjs-emscripten/package.json"));
  const quickjsVariant = dirname(
    quickjsRequire.resolve("@jitl/quickjs-wasmfile-release-asyncify/package.json"),
  );
  const quickjsWasm = readFileSync(join(quickjsVariant, "dist", "emscripten-module.wasm"));
  await WebAssembly.compile(quickjsWasm);
  copyFileSync(
    join(quickjsVariant, "dist", "emscripten-module.wasm"),
    join(rtOut, "dist", "chunks", "emscripten-module.wasm"),
  );

  const playwrightDir = dirname(
    createRequire(join(root, "packages/chromium-driver/package.json")).resolve(
      "playwright-core/package.json",
    ),
  );
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
    writeFileSync(
      path,
      transformSync(readFileSync(path, "utf8"), { loader: "js", minifyWhitespace: true, charset: "utf8" })
        .code,
    );
  }

  // Stage the maintained resvg loader with its platform binding in one package
  // directory. js-binding.js probes a local binary before optional dependencies.
  const resvgRequire = createRequire(join(root, "apps/runtime/package.json"));
  const resvgDir = dirname(resvgRequire.resolve("@resvg/resvg-js/package.json"));
  const resvgPkg = JSON.parse(readFileSync(join(resvgDir, "package.json"), "utf8"));
  const runtimeTag =
    process.platform === "linux"
      ? process.arch === "arm"
        ? "linux-arm-gnueabihf"
        : `linux-${process.arch}-${process.report.getReport().header.glibcVersionRuntime ? "gnu" : "musl"}`
      : process.platform === "win32"
        ? `win32-${process.arch}-msvc`
        : `${process.platform}-${process.arch}`;
  const bindingName = `@resvg/resvg-js-${runtimeTag}`;
  if (!Object.hasOwn(resvgPkg.optionalDependencies ?? {}, bindingName))
    throw new Error(`resvg has no binding for ${runtimeTag}`);
  const bindingPath = createRequire(join(resvgDir, "package.json")).resolve(bindingName);
  if (!bindingPath.endsWith(".node"))
    throw new Error(`resvg binding for ${runtimeTag} is not a native module`);
  const resvgOut = join(rtOut, "vendor", "resvg-js");
  mkdirSync(resvgOut, { recursive: true });
  for (const file of ["index.js", "js-binding.js", "package.json", "LICENSE"])
    cpSync(join(resvgDir, file), join(resvgOut, file));
  cpSync(bindingPath, join(resvgOut, basename(bindingPath)));

  const runtimePkg = JSON.parse(readFileSync(join(root, "apps/runtime/package.json"), "utf8"));
  writeFileSync(
    join(rtOut, "package.json"),
    JSON.stringify(
      {
        name: runtimePkg.name,
        version: runtimePkg.version,
        private: true,
        type: "module",
        imports: {
          "#playwright-core": "./vendor/playwright-core/index.mjs",
          "#resvg": "./vendor/resvg-js/index.js",
        },
        dependencies: { "playwright-core": playwrightVersion },
      },
      null,
      2,
    ),
  );

  // Catch a missing or incompatible native binding before packaging succeeds.
  const resvgSmoke = join(rtOut, "resvg-smoke.mjs");
  writeFileSync(resvgSmoke, 'export { Resvg } from "#resvg";');
  try {
    const { Resvg } = await import(pathToFileURL(resvgSmoke).href);
    const png = new Resvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="blue"/></svg>',
    )
      .render()
      .asPng();
    if (
      !Buffer.from(png)
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      throw new Error("Packaged resvg did not render a PNG.");
  } finally {
    rmSync(resvgSmoke, { force: true });
  }
}
