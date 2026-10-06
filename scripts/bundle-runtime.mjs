#!/usr/bin/env node
/** Build the self-contained Aux Runtime payload for Chromium. */
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  readdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { generateRuntimeSchema } from "./gen-runtime-schema.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = join(root, "apps", "runtime");

// Playwright embeds its generated browser programs as JavaScript strings.
// Minify each complete program without changing public export property names.
function minifyPlaywrightSource(source, filename, transformSync, ts) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const replacements = [];
  const options = {
    loader: "js",
    minify: true,
    keepNames: false,
    target: "esnext",
    legalComments: "none",
    charset: "utf8",
  };
  const visit = (node) => {
    if (ts.isStringLiteral(node) && node.text.includes("// packages/injected/src/")) {
      const parent = node.parent;
      const generated =
        (ts.isBinaryExpression(parent) &&
          parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isIdentifier(parent.left) &&
          /^source\d*$/.test(parent.left.text)) ||
        (ts.isVariableDeclaration(parent) &&
          ts.isIdentifier(parent.name) &&
          /^source\d*$/.test(parent.name.text));
      if (generated)
        replacements.push({
          start: node.getStart(file),
          end: node.end,
          code: JSON.stringify(transformSync(node.text, options).code),
        });
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  for (const replacement of replacements.reverse())
    source = source.slice(0, replacement.start) + replacement.code + source.slice(replacement.end);
  return transformSync(source, options).code;
}

export async function bundleRuntime(rtOut, target) {
  // Generated SQL is a JSON asset: refresh its compiled copy before bundling.
  const schemaAsset = generateRuntimeSchema();
  copyFileSync(schemaAsset, join(runtimeDir, "dist/store/schema.generated.json"));
  // The runtime ships as one esbuild bundle (workspace packages and registry
  // deps inlined, lazy SDK imports split into chunks) plus playwright-core,
  // which stays external for its dynamic requires and assets. It lives in
  // vendor/ and resolves through package.json "imports" because
  // The native runtime bundle does not ship node_modules.
  rmSync(rtOut, { recursive: true, force: true });
  mkdirSync(rtOut, { recursive: true });

  const runtimeRequire = createRequire(join(runtimeDir, "package.json"));
  const { build, transformSync } = runtimeRequire("esbuild");
  const ts = runtimeRequire("typescript");
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
  // Keep injected browser code as self-contained function source. Full lexical
  // minification preserves local references; keepNames would introduce __name
  // closure helpers into serialized functions, so it must remain disabled.
  for (const file of readdirSync(join(playwrightOut, "lib"), { recursive: true })) {
    if (!file.endsWith(".js")) continue;
    const path = join(playwrightOut, "lib", file);
    writeFileSync(path, minifyPlaywrightSource(readFileSync(path, "utf8"), path, transformSync, ts));
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

  const files = readdirSync(rtOut, { recursive: true })
    .map((name) => ({ name, bytes: statSync(join(rtOut, name)) }))
    .filter((item) => item.bytes.isFile())
    .map((item) => ({ name: item.name, bytes: item.bytes.size }));
  const size = {
    entryBytes: statSync(join(rtOut, "dist/main.js")).size,
    javascriptBytes: files
      .filter((item) => /\.m?js$/.test(item.name))
      .reduce((sum, item) => sum + item.bytes, 0),
    totalBytes: files.reduce((sum, item) => sum + item.bytes, 0),
    advisoryTargetBytes: 8 * 1024 * 1024,
  };
  writeFileSync(join(dirname(rtOut), "runtime-size.json"), JSON.stringify(size, null, 2));
  console.log(
    `[runtime bundle] entry ${(size.entryBytes / 1024).toFixed(1)} KiB; JavaScript ${(size.javascriptBytes / 1024 / 1024).toFixed(2)} MiB; payload ${(size.totalBytes / 1024 / 1024).toFixed(2)} MiB (8 MiB advisory target)`,
  );
}
