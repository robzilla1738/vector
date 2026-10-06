#!/usr/bin/env node
/** Build the version-pinned runtime executable outside the checkout. */
import { createHash } from "node:crypto";
import { runCommand } from "../scripts/lib/run-command.mjs";
import { copyFile, mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { get } from "node:https";
import { availableParallelism, homedir } from "node:os";
import { join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";
import { assertDevLock } from "../scripts/dev.mjs";

export const nodeVersion = "26.7.0";
export const nodeLicenseName = "LICENSE_NODE.txt";
const archiveName = `node-v${nodeVersion}.tar.xz`;
const archiveSha256 = "e6b182cbeeab032d1082ca4ac4fe15e3a57de691d3bde78ecf8a761fd56ee356";
const configureArgs = ["--with-intl=small-icu", "--without-npm", "--enable-lto"];
// Node 26 no longer distributes Corepack or accepts --without-corepack.

async function run(command, args, cwd) {
  await runCommand(command, args, { cwd });
}

export async function ensureSlimNode() {
  assertDevLock();
  if (process.platform !== "darwin" || process.arch !== "arm64")
    throw new Error("The Aux runtime executable currently targets macOS arm64");
  const cache = resolve(process.env.AUX_NODE_CACHE ?? join(homedir(), "aux-node-slim"));
  const buildRoot = join(cache, `v${nodeVersion}-darwin-arm64-small-icu-lto`);
  const executable = join(buildRoot, "node");
  const source = join(buildRoot, `node-v${nodeVersion}`);
  const license = join(buildRoot, nodeLicenseName);
  await mkdir(buildRoot, { recursive: true });
  try {
    if ((await stat(executable)).isFile()) {
      await copyFile(join(source, "LICENSE"), license);
      return executable;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const archive = join(cache, archiveName);
  try {
    await stat(archive);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const temporary = `${archive}.download-${process.pid}`;
    try {
      await new Promise((ok, fail) => {
        get(`https://nodejs.org/dist/v${nodeVersion}/${archiveName}`, (response) => {
          if (response.statusCode !== 200) {
            response.resume();
            fail(new Error(`Official Node source download returned HTTP ${response.statusCode}`));
            return;
          }
          pipeline(response, createWriteStream(temporary)).then(ok, fail);
        }).on("error", fail);
      });
      await rename(temporary, archive);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  const hash = createHash("sha256")
    .update(await readFile(archive))
    .digest("hex");
  if (hash !== archiveSha256) throw new Error("Official Node source archive SHA-256 mismatch");
  try {
    await stat(join(source, "configure"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const extraction = join(buildRoot, `.source-${process.pid}`);
    await mkdir(extraction);
    try {
      await run("tar", ["-xJf", archive, "-C", extraction], cache);
      await rename(join(extraction, `node-v${nodeVersion}`), source);
    } finally {
      await rm(extraction, { recursive: true, force: true });
    }
  }
  await run("python3", ["configure", ...configureArgs], source);
  await run(
    "make",
    ["-C", "out", "BUILDTYPE=Release", `-j${Math.min(8, availableParallelism())}`, "node"],
    source,
  );
  const temporary = `${executable}.build-${process.pid}`;
  try {
    await copyFile(join(source, "out/Release/node"), temporary);
    await run("strip", ["-x", temporary], source);
    await run(temporary, ["--version"], source);
    await rename(temporary, executable);
  } finally {
    await rm(temporary, { force: true });
  }
  await copyFile(join(source, "LICENSE"), license);
  const bytes = (await stat(executable)).size;
  console.log(`Slim Node v${nodeVersion}: ${(bytes / 1e6).toFixed(2)} MB (target ≤90 MB)`);
  return executable;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  console.log(await ensureSlimNode());
