#!/usr/bin/env node
/** Inspect only a disposable Crashpad database. This script never sends reports. */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

function plist(path) {
  const result = spawnSync("plutil", ["-convert", "json", "-o", "-", path], {
    encoding: "utf8",
  });
  if (result.error || result.status !== 0)
    throw new Error(`Cannot read ${basename(path)}: ${result.error?.message ?? result.stderr}`);
  return JSON.parse(result.stdout);
}

export function inspectLocalCrashpad({ app, crashDir, requireReport = false }) {
  const info = plist(join(app, "Contents", "Info.plist"));
  if (info.CFBundleIdentifier !== "dev.aux.browser" || typeof info.AuxCrashUploadURL !== "string")
    throw new Error("Use an Aux build with the Crashpad consent patch.");
  if (info.AuxCrashUploadURL)
    throw new Error("Offline verification requires a build with no crash upload endpoint.");
  const counts = {};
  for (const area of ["new", "pending", "completed"]) {
    const path = join(crashDir, area);
    counts[area] = existsSync(path)
      ? readdirSync(path).filter((file) => {
          const entry = join(path, file);
          return statSync(entry).isFile() && file.endsWith(".dmp");
        }).length
      : 0;
  }
  const reports = Object.values(counts).reduce((total, count) => total + count, 0);
  if (requireReport && reports === 0)
    throw new Error("No local Crashpad minidump was found in the disposable database.");
  return { app, crashDir, uploadEndpoint: null, reports, ...counts };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const args = new Map();
  for (let index = 2; index < process.argv.length; index += 2) {
    if (!process.argv[index]?.startsWith("--") || !process.argv[index + 1])
      throw new Error("Use --app Aux.app --crash-dir disposable-directory [--require-report true].");
    args.set(process.argv[index], process.argv[index + 1]);
  }
  if (!args.get("--app") || !args.get("--crash-dir"))
    throw new Error("Use --app Aux.app and --crash-dir disposable-directory.");
  console.log(
    JSON.stringify(
      inspectLocalCrashpad({
        app: resolve(args.get("--app")),
        crashDir: resolve(args.get("--crash-dir")),
        requireReport: args.get("--require-report") === "true",
      }),
      null,
      2,
    ),
  );
}
