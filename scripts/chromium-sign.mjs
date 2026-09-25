#!/usr/bin/env node
/** Sign an official Aux Chromium build with Chromium's own signing pipeline. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const flags = new Map();
const options = new Set(["--input", "--output", "--identity", "--team-id"]);
for (let index = 2; index < process.argv.length; index += 1) {
  const flag = process.argv[index];
  if (flag === "--execute") flags.set(flag, true);
  else if (options.has(flag) && process.argv[index + 1] && !process.argv[index + 1].startsWith("--"))
    flags.set(flag, process.argv[++index]);
  else throw new Error(`Unknown or incomplete option: ${flag}`);
}
const execute = flags.has("--execute");
const input = resolve(String(flags.get("--input") ?? process.env.AUX_CHROMIUM_BUILD_DIR ?? ""));
const output = resolve(String(flags.get("--output") ?? join(root, "release")));
const identity = String(flags.get("--identity") ?? process.env.AUX_SIGNING_IDENTITY ?? "").trim();
const teamId = String(flags.get("--team-id") ?? process.env.AUX_TEAM_ID ?? "").trim();
const adhoc = !identity && !teamId;
if (!!identity !== !!teamId)
  throw new Error("Signing identity and Team ID must both be set, or both be empty for ad-hoc signing.");
if (teamId && !/^[A-Z0-9]{10}$/.test(teamId))
  throw new Error("Team ID must be ten uppercase letters or digits.");
if (input === resolve(""))
  throw new Error("Supply --input or AUX_CHROMIUM_BUILD_DIR for the official static build.");

const run = (command, args, stream = false) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: stream ? "inherit" : ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `${basename(command)} failed: ${result.error?.message ?? result.stderr?.trim() ?? "see output above"}`,
    );
  return stream ? "" : `${result.stdout}${result.stderr}`;
};
const plist = (path) => JSON.parse(run("plutil", ["-convert", "json", "-o", "-", path]));
const signingScript = existsSync(input)
  ? readdirSync(input)
      .filter((name) => name.endsWith(" Packaging"))
      .map((name) => join(input, name, "sign_chrome.py"))
      .find(existsSync)
  : undefined;
const app = join(input, "Aux.app");
const runtimeHelper = join(app, "Contents", "Helpers", "Aux Runtime");
const argsPath = join(input, "args.gn");
const args = existsSync(argsPath) ? readFileSync(argsPath, "utf8") : "";
const blockers = [];
if (process.platform !== "darwin") blockers.push("macOS is required");
if (!signingScript) blockers.push("the generated * Packaging/sign_chrome.py is missing");
if (!/\bis_component_build\s*=\s*false\b/.test(args))
  blockers.push("GN build must set is_component_build=false");
if (!/\bis_debug\s*=\s*false\b/.test(args)) blockers.push("GN build must set is_debug=false");
if (!existsSync(app)) blockers.push("official Aux.app is missing from the build directory");
else if (process.platform === "darwin") {
  try {
    const identityPlist = plist(join(app, "Contents", "Info.plist"));
    if (identityPlist.CFBundleIdentifier !== "dev.aux.browser")
      blockers.push(`bundle ID is ${identityPlist.CFBundleIdentifier}, expected dev.aux.browser`);
  } catch (error) {
    blockers.push(`app Info.plist is unreadable: ${error.message}`);
  }
}
if (!existsSync(runtimeHelper)) blockers.push("bundled Contents/Helpers/Aux Runtime is missing");
if (!adhoc && !identity.startsWith("Developer ID Application: "))
  blockers.push("Developer ID signing identity must start with 'Developer ID Application: '");

let version = "unknown";
if (existsSync(join(app, "Contents", "Info.plist")) && process.platform === "darwin") {
  try {
    version = String(plist(join(app, "Contents", "Info.plist")).CFBundleShortVersionString ?? "unknown");
  } catch {
    /* Already reported by preflight. */
  }
}
const signedApp = join(output, "Aux.app");
const dmg = join(output, `Aux-${version}-${adhoc ? "adhoc" : "signed"}.dmg`);
const stage = join(output, ".chromium-sign-stage");
const signArgs = [
  String(signingScript ?? "<generated sign_chrome.py>"),
  "--input",
  input,
  "--output",
  stage,
  "--identity",
  adhoc ? "-" : identity,
  "--notarize",
  "none",
  "--disable-packaging",
];
if (adhoc) signArgs.push("--development");
const plan = {
  input,
  output,
  bundleId: "dev.aux.browser",
  version,
  signing: adhoc ? "ad-hoc" : "Developer ID",
  teamId: teamId || null,
  ready: blockers.length === 0,
  blockers,
  commands: [
    ["python3", ...signArgs],
    ["hdiutil", "create", "-srcfolder", signedApp, "-volname", "Aux", "-format", "UDZO", dmg],
  ],
  notarization: "not submitted",
};
if (!execute) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}
if (blockers.length) throw new Error(`Signing preflight failed: ${blockers.join("; ")}`);
if (existsSync(stage) || existsSync(signedApp) || existsSync(dmg))
  throw new Error(
    "Signing output already exists. Choose a clean --output directory; existing artifacts are never replaced.",
  );
mkdirSync(output, { recursive: true });
run("python3", signArgs, true);
const stagedApp = join(stage, "Aux.app");
if (!existsSync(stagedApp)) throw new Error(`Chromium signing produced no ${stagedApp}`);
cpSync(stagedApp, signedApp, { recursive: true, preserveTimestamps: true });
run("codesign", ["--verify", "--deep", "--strict", signedApp]);
const signedRuntime = join(signedApp, "Contents", "Helpers", "Aux Runtime");
run("codesign", ["--verify", "--strict", signedRuntime]);
const runtimeEntitlements = run("codesign", ["-d", "--entitlements", ":-", signedRuntime]);
if (!runtimeEntitlements.includes("com.apple.security.cs.allow-jit"))
  throw new Error("Signed Aux Runtime is missing its JIT entitlement.");
const signedPlist = plist(join(signedApp, "Contents", "Info.plist"));
if (signedPlist.CFBundleIdentifier !== "dev.aux.browser") throw new Error("Signed bundle ID changed.");
const signature = run("codesign", ["-dv", "--verbose=4", signedApp]);
if (adhoc && !/Signature=adhoc/.test(signature)) throw new Error("Expected an ad-hoc signature.");
if (!adhoc && !signature.includes(`TeamIdentifier=${teamId}`))
  throw new Error("Signed Team ID differs from configuration.");
run("hdiutil", ["create", "-srcfolder", signedApp, "-volname", "Aux", "-format", "UDZO", dmg], true);
run("hdiutil", ["verify", dmg], true);
const digest = createHash("sha256");
for await (const chunk of createReadStream(dmg)) digest.update(chunk);
const hash = digest.digest("hex");
const metadata = {
  ...plan,
  ready: true,
  blockers: [],
  signedApp,
  dmg,
  dmgSha256: hash,
  dmgBytes: statSync(dmg).size,
  signature,
  notarization: "not submitted",
  generatedAt: new Date().toISOString(),
};
writeFileSync(join(output, "Aux-release.json"), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify({ signedApp, dmg, dmgSha256: hash, notarization: "not submitted" }, null, 2));
