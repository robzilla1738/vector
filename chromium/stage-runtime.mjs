#!/usr/bin/env node
/** Pin Node and bundle the Aux Runtime into an unsigned Chromium app. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { nativeSource, nativeFlavor, nativeOutput } from "./dev-config.mjs";
import { bundleRuntime } from "../scripts/bundle-runtime.mjs";
import {
  ensureSlimNode,
  nodeVersion,
  nodeLicenseName,
  nodeIcuData,
  nodeIcuDataName,
  nodeIcuDataSha256,
  nodeIcuDataBytes,
} from "./slim-node.mjs";

import { assertDevLock } from "../scripts/dev.mjs";

import { productIdentity } from "../scripts/lib/product-identity.mjs";

const root = resolve(import.meta.dirname, "..");
const app = resolve(process.argv[2] ?? join(nativeSource, "out", nativeOutput[nativeFlavor], "Aux.app"));

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0)
    throw new Error(`${basename(command)} failed (${result.status ?? result.error?.message})`);
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

if (process.platform !== "darwin" || process.arch !== "arm64") {
  throw new Error("The pinned Aux Chromium runtime currently targets macOS arm64");
}
if (!existsSync(join(app, "Contents", "Info.plist"))) throw new Error(`Unsigned Aux.app is missing: ${app}`);
if (existsSync(join(app, "Contents", "_CodeSignature")))
  throw new Error("Refusing to modify a signed Aux.app");
const appRoot = realpathSync(app);
if (!appRoot.endsWith("/Aux.app")) throw new Error("The target must be an Aux.app bundle");

assertDevLock();
const node = await ensureSlimNode();
const staging = mkdtempSync(join(tmpdir(), "aux-runtime-"));
try {
  const version = spawnSync(node, ["--version"], { encoding: "utf8" });
  if (version.status !== 0 || version.stdout.trim() !== `v${nodeVersion}`)
    throw new Error("Pinned Node executable failed version check");

  run("pnpm", ["exec", "tsc", "-b", "tsconfig.json"]);
  const payload = join(staging, "aux-runtime");
  await bundleRuntime(payload, "node26");
  const fullData = await nodeIcuData(node);
  const icuDirectory = join(payload, "vendor", "icu");
  mkdirSync(icuDirectory, { recursive: true });
  copyFileSync(fullData, join(icuDirectory, nodeIcuDataName));
  writeFileSync(
    join(icuDirectory, "identity.json"),
    JSON.stringify({ nodeVersion, icuVersion: 78, sha256: nodeIcuDataSha256, bytes: nodeIcuDataBytes }),
  );
  // Constructor success is insufficient: trimmed Node data crashes during iteration.
  // Validate the same helper and actual staged dataset before replacing app resources.
  run(node, [
    `--icu-data-dir=${icuDirectory}`,
    "--eval",
    `
    if (process.versions.icu.split('.')[0] !== '78') throw new Error('Pinned ICU version mismatch');
    for (const text of ['Synthetic memory recall greeting.', '漢字と日本語の記憶検索', 'ภาษาไทยสำหรับการค้นหา', 'Synthetic 😀 recall']) {
      const parts = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)];
      if (parts.map(part => part.segment).join('') !== text || !parts.some(part => part.isWordLike)) throw new Error('Runtime word segmentation failed');
      parts.filter(part => part.isWordLike).map(part => part.segment.toLocaleLowerCase());
    }
  `,
  ]);
  console.log(`[runtime ICU] full data ${nodeIcuDataBytes} bytes (included in installed payload)`);

  copyFileSync(join(dirname(node), nodeLicenseName), join(payload, nodeLicenseName));
  writeFileSync(join(payload, "aux-runtime-identity.json"), `${JSON.stringify(productIdentity(root))}\n`);
  run(node, ["--check", join(payload, "dist", "main.js")]);
  run(node, ["--check", join(payload, "dist", "mcp.js")]);
  run(node, ["--check", join(payload, "dist", "privacy-checkpoint-worker.js")]);

  const helper = join(appRoot, "Contents", "Helpers", "Aux Runtime");
  const resources = join(appRoot, "Contents", "Resources", "aux-runtime");
  mkdirSync(dirname(helper), { recursive: true });
  mkdirSync(dirname(resources), { recursive: true });
  rmSync(helper, { force: true });
  rmSync(resources, { recursive: true, force: true });
  copyFileSync(node, helper);
  chmodSync(helper, 0o755);
  cpSync(payload, resources, { recursive: true, dereference: true });
  console.log(`Staged Node v${nodeVersion} (${digest(helper)}) and Aux Runtime in ${appRoot}`);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
