#!/usr/bin/env node
/** Pin Node and bundle the Aux Runtime into an unsigned Chromium app. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  createWriteStream,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { bundleRuntime } from "../scripts/bundle-runtime.mjs";

const root = resolve(import.meta.dirname, "..");
const nodeVersion = "26.7.0";
const archiveName = `node-v${nodeVersion}-darwin-arm64.tar.gz`;
const archiveSha256 = "7ee659a7768e641bbfd5360940660b8e8fd0052f77488f365562bac522fc15d4";
const cache = resolve(
  process.env.AUX_NODE_CACHE ?? join(process.env.HOME, "aux-chromium-stable", "node-runtime"),
);
const app = resolve(
  process.argv[2] ??
    join(
      process.env.AUX_CHROMIUM_SRC ?? join(process.env.HOME, "aux-chromium-stable", "chromium", "src"),
      "out",
      "AuxDev",
      "Aux.app",
    ),
);

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0)
    throw new Error(`${basename(command)} failed (${result.status ?? result.error?.message})`);
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

async function fetchArchive(destination) {
  const url = `https://nodejs.org/dist/v${nodeVersion}/${archiveName}`;
  await new Promise((ok, fail) => {
    get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        fail(new Error(`Official Node download returned HTTP ${response.statusCode}`));
        return;
      }
      pipeline(response, createWriteStream(destination)).then(ok, fail);
    }).on("error", fail);
  });
}

if (process.platform !== "darwin" || process.arch !== "arm64") {
  throw new Error("The pinned Aux Chromium runtime currently targets macOS arm64");
}
if (!existsSync(join(app, "Contents", "Info.plist"))) throw new Error(`Unsigned Aux.app is missing: ${app}`);
if (existsSync(join(app, "Contents", "_CodeSignature")))
  throw new Error("Refusing to modify a signed Aux.app");
const appRoot = realpathSync(app);
if (!appRoot.endsWith("/Aux.app")) throw new Error("The target must be an Aux.app bundle");

mkdirSync(cache, { recursive: true });
const archive = join(cache, archiveName);
if (!existsSync(archive)) {
  const temporary = `${archive}.download-${process.pid}`;
  try {
    await fetchArchive(temporary);
    if (digest(temporary) !== archiveSha256) throw new Error("Official Node archive SHA-256 mismatch");
    copyFileSync(temporary, archive);
  } finally {
    rmSync(temporary, { force: true });
  }
}
if (digest(archive) !== archiveSha256) throw new Error("Cached Node archive SHA-256 mismatch");

const extraction = mkdtempSync(join(tmpdir(), "aux-node-"));
const staging = mkdtempSync(join(tmpdir(), "aux-runtime-"));
try {
  run("tar", ["-xzf", archive, "-C", extraction, `${archiveName.replace(".tar.gz", "")}/bin/node`]);
  const node = join(extraction, archiveName.replace(".tar.gz", ""), "bin", "node");
  if (!statSync(node).isFile()) throw new Error("Pinned Node executable is missing");
  const version = spawnSync(node, ["--version"], { encoding: "utf8" });
  if (version.status !== 0 || version.stdout.trim() !== `v${nodeVersion}`)
    throw new Error("Pinned Node executable failed version check");

  run("pnpm", ["exec", "tsc", "-b", "tsconfig.json"]);
  const payload = join(staging, "aux-runtime");
  await bundleRuntime(payload, "node26");
  const entry = join(payload, "dist", "main.js");
  writeFileSync(entry, `process.env.AUX_PROGRAM_SPEND_CAP_USD ??= "50";\n${readFileSync(entry, "utf8")}`);
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
  rmSync(extraction, { recursive: true, force: true });
  rmSync(staging, { recursive: true, force: true });
}
