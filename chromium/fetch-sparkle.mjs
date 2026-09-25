#!/usr/bin/env node
/** Stage the exact Sparkle release used by the Aux Chromium patch. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";

export const SPARKLE_VERSION = "2.10.0";
export const SPARKLE_SHA256 = "c2bf58aa8387266ac179357b1415d6f2635f044da8be41042af32425dae6da0c";
export const SPARKLE_URL = `https://github.com/sparkle-project/Sparkle/releases/download/${SPARKLE_VERSION}/Sparkle-${SPARKLE_VERSION}.tar.xz`;

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error || result.status !== 0)
    throw new Error(`${basename(command)} failed: ${result.error?.message ?? result.stderr?.trim()}`);
  return result.stdout.trim();
}

export function verifyArchive(path) {
  const digest = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (digest !== SPARKLE_SHA256) throw new Error("Sparkle archive SHA-256 differs from the pinned release.");
  return digest;
}

export function stageSparkle({ source, archive }) {
  const vendor = join(resolve(source), "third_party", "aux_sparkle");
  const framework = join(vendor, "Sparkle.framework");
  const tools = join(vendor, "bin");
  const license = join(vendor, "LICENSE");
  if (existsSync(framework) || existsSync(tools) || existsSync(license))
    throw new Error("Sparkle is already staged; remove the old verified stage before replacing it.");
  mkdirSync(vendor, { recursive: true });
  const temporary = mkdtempSync(join(vendor, ".fetch-"));
  let moved = false;
  try {
    const tarball = archive ? resolve(archive) : join(temporary, `Sparkle-${SPARKLE_VERSION}.tar.xz`);
    if (!archive)
      run("curl", ["--fail", "--location", "--silent", "--show-error", SPARKLE_URL, "--output", tarball]);
    verifyArchive(tarball);
    run("tar", [
      "-xf",
      tarball,
      "-C",
      temporary,
      "./Sparkle.framework",
      "./bin/sign_update",
      "./bin/generate_appcast",
      "./LICENSE",
    ]);
    const version = run("plutil", [
      "-extract",
      "CFBundleShortVersionString",
      "raw",
      "-o",
      "-",
      join(temporary, "Sparkle.framework", "Resources", "Info.plist"),
    ]);
    if (version !== SPARKLE_VERSION)
      throw new Error("Sparkle framework version differs from the pinned release.");
    renameSync(join(temporary, "Sparkle.framework"), framework);
    moved = true;
    renameSync(join(temporary, "bin"), tools);
    renameSync(join(temporary, "LICENSE"), license);
    return { version, sha256: SPARKLE_SHA256, framework, tools };
  } catch (error) {
    if (moved) {
      rmSync(framework, { recursive: true, force: true });
      rmSync(tools, { recursive: true, force: true });
      rmSync(license, { force: true });
    }
    throw error;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const sourceFlag = process.argv.indexOf("--source");
  const archiveFlag = process.argv.indexOf("--archive");
  const source = sourceFlag >= 0 ? process.argv[sourceFlag + 1] : undefined;
  const archive = archiveFlag >= 0 ? process.argv[archiveFlag + 1] : undefined;
  if (!source || source.startsWith("--") || (archiveFlag >= 0 && (!archive || archive.startsWith("--"))))
    throw new Error("Use --source /path/to/chromium/src [--archive verified-release.tar.xz].");
  console.log(JSON.stringify(stageSparkle({ source, archive }), null, 2));
}
