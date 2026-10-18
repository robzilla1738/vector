import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, test } from "node:test";
import {
  assertAuxCandidateUnchanged,
  assertCandidateBrowserVersion,
  assertExternalControlPath,
  inspectAuxCandidate,
} from "./native-candidate.mjs";

const directories = [];
afterEach(() => {
  for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true });
});
const version = readFileSync(new URL("../../chromium/version.txt", import.meta.url), "utf8").split("\n")[0];
const hash = "a".repeat(64);
function xml(fields) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict>' +
    Object.entries(fields)
      .map(([key, value]) => `<key>${key}</key><string>${value}</string>`)
      .join("") +
    "</dict></plist>"
  );
}
function macho(type) {
  const bytes = Buffer.alloc(32 + 176 + 65);
  bytes.writeUInt32LE(0xfeedfacf, 0);
  bytes.writeUInt32LE(0x0100000c, 4);
  bytes.writeUInt32LE(type, 12);
  bytes.writeUInt32LE(2, 16);
  bytes.writeUInt32LE(176, 20);
  bytes.writeUInt32LE(0x1b, 32);
  bytes.writeUInt32LE(24, 36);
  bytes.fill(type, 40, 56);
  bytes.writeUInt32LE(0x19, 56);
  bytes.writeUInt32LE(152, 60);
  bytes.writeUInt32LE(1, 120);
  bytes.write("__cstring", 128);
  bytes.write("__TEXT", 144);
  bytes.writeBigUInt64LE(65n, 168);
  bytes.writeUInt32LE(208, 176);
  bytes.write(hash, 208);
  return bytes;
}
function fixture(flavor = "AuxFast") {
  const source = mkdtempSync(join(tmpdir(), "aux-candidate-fixture-"));
  directories.push(source);
  const output = join(source, "out", flavor),
    app = join(output, "Aux.app"),
    binary = join(app, "Contents/MacOS/Aux");
  const framework = join(app, "Contents/Frameworks/Aux Framework.framework/Versions/Current/Aux Framework");
  const paths = {
    args: join(output, "args.gn"),
    browser: join(output, "gen/chrome/browser/buildflags.h"),
    extensions: join(output, "gen/extensions/buildflags/buildflags.h"),
    branding: join(output, "gen/build/branding_buildflags.h"),
  };
  const write = (path, value) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, value);
  };
  write(
    join(source, "chrome/VERSION"),
    ["MAJOR", "MINOR", "BUILD", "PATCH"]
      .map((key, index) => `${key}=${version.split(".")[index]}`)
      .join("\n"),
  );
  write(
    join(app, "Contents/Info.plist"),
    xml({
      CFBundleExecutable: "Aux",
      CFBundleIdentifier: "dev.aux.browser",
      CFBundleShortVersionString: version,
    }),
  );
  write(
    join(dirname(framework), "Resources/Info.plist"),
    xml({
      CFBundleExecutable: "Aux Framework",
      CFBundleIdentifier: "dev.aux.browser.framework",
      CFBundleShortVersionString: version,
    }),
  );
  write(binary, macho(2));
  chmodSync(binary, 0o700);
  write(framework, macho(6));
  const generatedHeader = join(source, "manifest.h");
  write(generatedHeader, `kManifestHash = "${hash}";`);
  write(
    paths.args,
    'target_cpu = "arm64"\nis_debug = false\nis_official_build = true\nis_component_build = false\nenable_aux_shell = true\naux_test_hooks = false\n',
  );
  write(
    paths.browser,
    "#define BUILDFLAG_INTERNAL_ENABLE_AUX_SHELL() (1)\n#define BUILDFLAG_INTERNAL_AUX_TEST_HOOKS() (0)\n",
  );
  write(
    paths.extensions,
    "#define BUILDFLAG_INTERNAL_ENABLE_EXTENSIONS() (1)\n#define BUILDFLAG_INTERNAL_ENABLE_EXTENSIONS_CORE() (1)\n",
  );
  write(paths.branding, "#define BUILDFLAG_INTERNAL_GOOGLE_CHROME_BRANDING() (0)\n");
  return {
    source,
    output,
    app,
    binary,
    framework,
    paths,
    generatedHeader,
    options: { source, generatedHeader, capability: "extensions" },
  };
}

test("admits current output layouts using synthetic Mach-O fixtures, separating byte identity from generated flags", () => {
  for (const flavor of ["AuxProof", "AuxDev", "AuxFast"]) {
    const value = fixture(flavor),
      result = inspectAuxCandidate(value.binary, value.options);
    assert.equal(result.executable.path, realpathSync(value.binary));
    assert.equal(result.flavor, flavor);
    assert.equal(result.version, version);
    assert.equal(
      result.executable.sha256,
      createHash("sha256").update(readFileSync(value.binary)).digest("hex"),
    );
    assert.equal(result.framework.uuid, "06".repeat(16));
    assert.equal(result.configurationEvidence.explicitGn.is_official_build, "true");
    assert.equal(result.configurationEvidence.generated.enableExtensions, true);
    assert.match(result.configurationEvidence.scope, /not proof/);
    assertAuxCandidateUnchanged(result);
    assertCandidateBrowserVersion({ browser: () => ({ version: () => version }) }, result);
  }
});
test("rejects mismatched source, reference/signed output and executable symlink substitutions", () => {
  const value = fixture(),
    other = fixture();
  assert.throws(() => inspectAuxCandidate(value.binary, other.options), /actual current Aux/);
  const alias = join(value.output, "Reference.app");
  symlinkSync(value.app, alias);
  assert.throws(
    () => inspectAuxCandidate(join(alias, "Contents/MacOS/Aux"), value.options),
    /symlinked candidate bundle/,
  );
  const replacement = join(value.source, "Reference");
  writeFileSync(replacement, macho(2));
  rmSync(value.binary);
  symlinkSync(replacement, value.binary);
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /symlink/);
  rmSync(value.binary);
  writeFileSync(value.binary, macho(2));
  chmodSync(value.binary, 0o700);
  mkdirSync(join(value.app, "Contents/_CodeSignature"));
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /unsigned developer output/);
});
test("fails closed on missing/disabled generated extension flags or Google branding", () => {
  const value = fixture();
  writeFileSync(value.paths.extensions, "#define BUILDFLAG_INTERNAL_ENABLE_EXTENSIONS() (0)\n");
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /ENABLE_EXTENSIONS/);
  writeFileSync(value.paths.extensions, "#define BUILDFLAG_INTERNAL_ENABLE_EXTENSIONS() (1)\n");
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /ENABLE_EXTENSIONS_CORE/);
  writeFileSync(value.paths.branding, "#define BUILDFLAG_INTERNAL_GOOGLE_CHROME_BRANDING() (1)\n");
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /GOOGLE_CHROME_BRANDING/);
});
test("requires explicit current fast flags rather than treating directory name as build proof", () => {
  const value = fixture();
  for (const flag of [
    "is_official_build",
    "is_debug",
    "is_component_build",
    "enable_aux_shell",
    "aux_test_hooks",
  ]) {
    const original = readFileSync(value.paths.args, "utf8");
    writeFileSync(value.paths.args, original.replace(new RegExp(`^${flag}.*\\n`, "m"), ""));
    assert.throws(() => inspectAuxCandidate(value.binary, value.options), new RegExp(flag));
    writeFileSync(value.paths.args, original);
  }
});
test("rejects stale bundle/framework version, Aux identity and actual linked native ABI", () => {
  const value = fixture(),
    info = join(value.app, "Contents/Info.plist");
  writeFileSync(
    info,
    xml({
      CFBundleExecutable: "Aux",
      CFBundleIdentifier: "org.chromium.Chromium",
      CFBundleShortVersionString: version,
    }),
  );
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /real Aux bundle identity/);
  writeFileSync(
    info,
    xml({
      CFBundleExecutable: "Aux",
      CFBundleIdentifier: "dev.aux.browser",
      CFBundleShortVersionString: "1.0.0.0",
    }),
  );
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /bundle\/source version/);
  writeFileSync(
    info,
    xml({
      CFBundleExecutable: "Aux",
      CFBundleIdentifier: "dev.aux.browser",
      CFBundleShortVersionString: version,
    }),
  );
  writeFileSync(
    join(dirname(value.framework), "Resources/Info.plist"),
    xml({ CFBundleShortVersionString: "1.0.0.0" }),
  );
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /framework\/source version/);
  writeFileSync(
    join(dirname(value.framework), "Resources/Info.plist"),
    xml({
      CFBundleExecutable: "Aux Framework",
      CFBundleIdentifier: "dev.aux.browser.framework",
      CFBundleShortVersionString: version,
    }),
  );
  writeFileSync(value.generatedHeader, `kManifestHash = "${"b".repeat(64)}";`);
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /matching host contracts/);
});
test("binds original files and rejects replacement/version drift before evidence publication", () => {
  const value = fixture(),
    result = inspectAuxCandidate(value.binary, value.options);
  assert.throws(
    () => assertCandidateBrowserVersion({ browser: () => ({ version: () => "1.0.0.0" }) }, result),
    /Running browser version/,
  );
  appendFileSync(value.binary, "replacement");
  assert.throws(() => assertAuxCandidateUnchanged(result), /Original candidate changed/);
});
test("virtual WebAuthn does not invent an extension/FIDO flag proof or permit Aux as an external control", () => {
  const value = fixture();
  rmSync(value.paths.extensions);
  const result = inspectAuxCandidate(value.binary, { ...value.options, capability: "webauthn" });
  assert.equal(result.configurationEvidence.generated.enableExtensions, undefined);
  assert.match(result.capabilityScope, /Actual CDP/);
  assert.throws(() => assertExternalControlPath(value.binary), /AUX_CANDIDATE_BIN/);
  const control = join(value.source, "External Chromium");
  writeFileSync(control, "fixture-control");
  assert.doesNotThrow(() => assertExternalControlPath(control));
});

test("rejects missing native UUID, wrong architecture and source pin mismatch", () => {
  const value = fixture();
  const original = readFileSync(value.binary);
  const wrongCpu = Buffer.from(original);
  wrongCpu.writeUInt32LE(0x01000007, 4);
  writeFileSync(value.binary, wrongCpu);
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /arm64/);
  const noUuid = Buffer.from(original);
  noUuid.writeUInt32LE(0x22, 32);
  writeFileSync(value.binary, noUuid);
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /Missing actual Mach-O UUID/);
  writeFileSync(value.binary, original);
  writeFileSync(join(value.source, "chrome/VERSION"), "MAJOR=1\nMINOR=0\nBUILD=0\nPATCH=0\n");
  assert.throws(() => inspectAuxCandidate(value.binary, value.options), /pinned Chromium VERSION/);
});
