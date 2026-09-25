#!/usr/bin/env node
/** Prepare notarization after the owner supplies Developer ID and credentials. Never submits. */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const argumentsList = process.argv.slice(2);
const allowed = new Set(["--app", "--dmg", "--profile"]);
for (let index = 0; index < argumentsList.length; index += 2) {
  if (
    !allowed.has(argumentsList[index]) ||
    !argumentsList[index + 1] ||
    argumentsList[index + 1].startsWith("--")
  )
    throw new Error(
      `Unknown or incomplete option: ${argumentsList[index] ?? "<missing>"}. This script is dry-run only.`,
    );
}
const option = (name) => {
  const index = argumentsList.indexOf(name);
  return index < 0 ? "" : (argumentsList[index + 1] ?? "");
};
const app = option("--app") ? resolve(option("--app")) : "<Developer ID signed Aux.app>";
const dmg = option("--dmg") ? resolve(option("--dmg")) : "<Developer ID signed Aux.dmg>";
const profile = option("--profile") || "<notarytool keychain profile>";
const blockers = [];
if (app.startsWith("<") || !existsSync(app)) blockers.push("Developer ID signed Aux.app is required");
if (dmg.startsWith("<") || !existsSync(dmg)) blockers.push("Developer ID signed Aux.dmg is required");
if (profile.startsWith("<")) blockers.push("a keychain profile name is required");
if (process.platform !== "darwin") blockers.push("macOS is required");
if (existsSync(app) && process.platform === "darwin") {
  const signature = spawnSync("codesign", ["-dv", "--verbose=4", app], { encoding: "utf8" });
  if (signature.status !== 0 || !/Authority=Developer ID Application:/.test(signature.stderr))
    blockers.push("app is not signed by a Developer ID Application identity");
  const verified = spawnSync("codesign", ["--verify", "--deep", "--strict", app], { encoding: "utf8" });
  if (verified.status !== 0) blockers.push("app code signature does not verify");
}
const commands = [
  ["codesign", "--verify", "--deep", "--strict", app],
  ["xcrun", "notarytool", "submit", dmg, "--keychain-profile", profile, "--wait"],
  ["xcrun", "stapler", "staple", app],
  ["xcrun", "stapler", "staple", dmg],
  ["xcrun", "stapler", "validate", app],
  ["xcrun", "stapler", "validate", dmg],
  ["spctl", "--assess", "--type", "execute", "--verbose=2", app],
];
console.log(
  JSON.stringify(
    {
      mode: "dry-run",
      ready: blockers.length === 0,
      blockers,
      commands,
      submitted: false,
      credentialsPrinted: false,
    },
    null,
    2,
  ),
);
