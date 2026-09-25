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
import { basename, dirname, join, resolve } from "node:path";
import {
  PASSKEY_ENTITLEMENT,
  expectedPasskeyEntitlements,
  validatePasskeySigning,
} from "./lib/passkey-signing.mjs";

const root = resolve(import.meta.dirname, "..");
const flags = new Map();
const options = new Set(["--input", "--output", "--identity", "--team-id", "--passkey-profile"]);
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
const passkeyProfile = flags.get("--passkey-profile") ? resolve(String(flags.get("--passkey-profile"))) : "";
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
const parsePlist = (xml) => {
  const result = spawnSync("plutil", ["-convert", "json", "-o", "-", "-"], {
    encoding: "utf8",
    input: xml,
  });
  if (result.error || result.status !== 0) throw new Error("Provisioning plist is unreadable.");
  return JSON.parse(result.stdout);
};
const decodeProvisioningProfile = (path) => {
  const result = spawnSync("security", ["cms", "-D", "-i", path], { encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error("Provisioning profile cannot be decoded.");
  return parsePlist(result.stdout);
};
const signedEntitlementsFor = (path) => {
  const result = spawnSync("codesign", ["-d", "--entitlements", ":-", path], { encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error("Signed entitlements cannot be read.");
  return parsePlist(result.stdout);
};
const signingScript = existsSync(input)
  ? readdirSync(input)
      .filter((name) => name.endsWith(" Packaging"))
      .map((name) => join(input, name, "sign_chrome.py"))
      .find(existsSync)
  : undefined;
const app = join(input, "Aux.app");
const runtimeHelper = join(app, "Contents", "Helpers", "Aux Runtime");
const signingPackage = signingScript ? join(dirname(signingScript), "signing") : "";
const runtimeEntitlementsPath = signingScript
  ? join(dirname(signingScript), "aux-runtime-entitlements.plist")
  : "";
const packagedEntitlementsPath = signingScript ? join(dirname(signingScript), "app-entitlements.plist") : "";
const argsPath = join(input, "args.gn");
const args = existsSync(argsPath) ? readFileSync(argsPath, "utf8") : "";
const blockers = [];
if (process.platform !== "darwin") blockers.push("macOS is required");
if (!signingScript) blockers.push("the generated * Packaging/sign_chrome.py is missing");
if (!/\bis_component_build\s*=\s*false\b/.test(args))
  blockers.push("GN build must set is_component_build=false");
if (!/\bis_debug\s*=\s*false\b/.test(args)) blockers.push("GN build must set is_debug=false");
if (!/\benable_aux_shell\s*=\s*true\b/.test(args))
  blockers.push("GN build must enable the Aux shell");
if (/\baux_allow_remote_debugging_for_tests\s*=\s*true\b/.test(args))
  blockers.push("Release builds must disable remote debugging test access");
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
if (!runtimeEntitlementsPath || !existsSync(runtimeEntitlementsPath))
  blockers.push("Chromium packaging lacks Aux Runtime JIT entitlements");
if (
  !signingPackage ||
  !existsSync(join(signingPackage, "parts.py")) ||
  !readFileSync(join(signingPackage, "parts.py"), "utf8").includes("'aux-runtime'")
)
  blockers.push("Chromium signing pipeline does not register Aux Runtime");
if (!adhoc && !identity.startsWith("Developer ID Application: "))
  blockers.push("Developer ID signing identity must start with 'Developer ID Application: '");
let packagedEntitlements;
try {
  if (packagedEntitlementsPath && existsSync(packagedEntitlementsPath))
    packagedEntitlements = plist(packagedEntitlementsPath);
  else blockers.push("Chromium packaging lacks app entitlements");
} catch {
  blockers.push("Chromium packaged app entitlements are unreadable");
}
let approvedProfile;
if (passkeyProfile) {
  try {
    approvedProfile = decodeProvisioningProfile(passkeyProfile);
  } catch {
    blockers.push("Aux passkey provisioning profile is unreadable or invalid");
  }
}
blockers.push(
  ...validatePasskeySigning({
    args,
    entitlements: packagedEntitlements,
    profile: approvedProfile,
    teamId,
    adhoc,
    profileRequested: !!passkeyProfile,
  }),
);
if (
  passkeyProfile &&
  signingScript &&
  existsSync(join(signingPackage, "driver.py")) &&
  !readFileSync(join(signingPackage, "driver.py"), "utf8").includes("--aux-passkey-profile")
)
  blockers.push("Chromium signing pipeline lacks Aux passkey profile embedding");

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
if (passkeyProfile) signArgs.push("--aux-passkey-profile", passkeyProfile, "--aux-passkey-team-id", teamId);
const plan = {
  input,
  output,
  bundleId: "dev.aux.browser",
  version,
  signing: adhoc ? "ad-hoc" : "Developer ID",
  teamId: teamId || null,
  passkeyProvisioning: passkeyProfile ? "approved profile supplied" : "omitted",
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
const signedEntitlements = signedEntitlementsFor(signedApp);
if (Boolean(signedEntitlements[PASSKEY_ENTITLEMENT]) !== Boolean(passkeyProfile))
  throw new Error("Signed Aux passkey entitlement differs from the reviewed provisioning plan.");
if (passkeyProfile) {
  const expected = expectedPasskeyEntitlements(teamId);
  if (
    Object.entries(expected).some(([key, value]) =>
      Array.isArray(value)
        ? !Array.isArray(signedEntitlements[key]) ||
          value.some((item) => !signedEntitlements[key].includes(item))
        : signedEntitlements[key] !== value,
    )
  )
    throw new Error("Signed Aux passkey entitlement or group differs from the approved profile.");
  const embedded = join(signedApp, "Contents", "embedded.provisionprofile");
  if (!existsSync(embedded)) throw new Error("Signed Aux app lacks the approved provisioning profile.");
}
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
