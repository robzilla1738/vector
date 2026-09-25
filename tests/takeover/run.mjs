#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cases } from "./cases.mjs";

export function run(caseOverride = "") {
  const args = process.argv.slice(2);
  const allowed = new Set(["--case", "--app", "--previous-app", "--next-app", "--dmg", "--output"]);
  for (let index = 0; index < args.length; index += 2) {
    if (!allowed.has(args[index]) || !args[index + 1] || args[index + 1].startsWith("--"))
      throw new Error(
        `Unknown or incomplete option: ${args[index] ?? "<missing>"}. Takeover scripts are dry-run only.`,
      );
  }
  const option = (name) => {
    const index = args.indexOf(name);
    return index < 0 ? "" : (args[index + 1] ?? "");
  };
  const selected = caseOverride || option("--case") || "all";
  const names = selected === "all" ? Object.keys(cases) : [selected];
  if (names.some((name) => !cases[name])) throw new Error(`Unknown takeover case: ${selected}`);
  const app = option("--app");
  const previousApp = option("--previous-app");
  const nextApp = option("--next-app");
  const dmg = option("--dmg");
  const output = option("--output");
  const artifactRoot = resolve(import.meta.dirname, "../../release/test-artifacts");
  const resolved = (path) => (path ? resolve(path) : null);
  const paths = {
    app: resolved(app),
    previousApp: resolved(previousApp),
    nextApp: resolved(nextApp),
    dmg: resolved(dmg),
  };
  const report = {
    mode: "dry-run",
    qualified: false,
    generatedAt: new Date().toISOString(),
    paths,
    missingFiles: Object.entries(paths)
      .filter(([, path]) => path && !existsSync(path))
      .map(([name]) => name),
    cases: names.map((name) => ({ id: name, ...cases[name], status: "requires owner-run evidence" })),
    note: "This plan reads no accounts, Profile data, Keychain items or update feed. It does not qualify a release.",
  };
  if (report.missingFiles.length)
    throw new Error(`Missing supplied file paths: ${report.missingFiles.join(", ")}`);
  if (output) {
    const destination = resolve(output);
    if (!destination.startsWith(`${artifactRoot}/`))
      throw new Error("Takeover reports must stay under release/test-artifacts (local, ignored output).");
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify(report, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) run();
