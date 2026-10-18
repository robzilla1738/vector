// Read-only qualification of a developer-output candidate, not a capability result.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  statSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import { assertCompiledRuntimeAbi } from "../../scripts/lib/compiled-runtime-abi.mjs";

function fileIdentity(path, expectedType) {
  const descriptor = openSync(path, "r");
  try {
    const before = fstatSync(descriptor, { bigint: true });
    assert.ok(before.isFile(), "Candidate identity must be a regular file");
    const header = Buffer.alloc(32);
    assert.equal(readSync(descriptor, header, 0, 32, 0), 32, "Missing Mach-O header");
    assert.equal(header.readUInt32LE(0), 0xfeedfacf, "Candidate must be a native64-bit Mach-O");
    assert.equal(header.readUInt32LE(4), 0x0100000c, "Candidate must be arm64");
    assert.equal(header.readUInt32LE(12), expectedType, "Wrong candidate Mach-O file type");
    const count = header.readUInt32LE(16),
      size = header.readUInt32LE(20);
    assert.ok(count > 0 && count <= 32768 && size <= 4 * 1024 * 1024 && size + 32 <= before.size);
    const commands = Buffer.alloc(size);
    assert.equal(readSync(descriptor, commands, 0, size, 32), size);
    let uuid;
    let at = 0;
    for (let index = 0; index < count; index++) {
      assert.ok(at + 8 <= size, "Truncated Mach-O load command");
      const commandSize = commands.readUInt32LE(at + 4);
      assert.ok(commandSize >= 8 && at + commandSize <= size, "Invalid Mach-O load command");
      if (commands.readUInt32LE(at) === 0x1b) {
        assert.equal(commandSize, 24, "Invalid Mach-O UUID");
        assert.equal(uuid, undefined, "Ambiguous Mach-O UUID");
        uuid = commands.subarray(at + 8, at + 24).toString("hex");
      }
      at += commandSize;
    }
    assert.equal(at, size);
    assert.match(uuid ?? "", /^[a-f0-9]{32}$/, "Missing actual Mach-O UUID");
    const digest = createHash("sha256"),
      chunk = Buffer.alloc(1024 * 1024);
    for (let offset = 0; offset < before.size;) {
      const bytes = readSync(descriptor, chunk, 0, chunk.length, offset);
      assert.ok(bytes > 0, "Candidate changed while hashing");
      digest.update(chunk.subarray(0, bytes));
      offset += bytes;
    }
    const after = fstatSync(descriptor, { bigint: true });
    assert.equal(stamp(before), stamp(after), "Candidate changed while inspecting it");
    return { path, uuid, sha256: digest.digest("hex"), bytes: Number(after.size), stamp: stamp(after) };
  } finally {
    closeSync(descriptor);
  }
}
function stamp(stat) {
  return [stat.dev, stat.ino, stat.size, stat.mtimeNs, stat.ctimeNs].join(":");
}
function plist(path, key) {
  return execFileSync("/usr/bin/plutil", ["-extract", key, "raw", "-o", "-", path], {
    encoding: "utf8",
    timeout: 5000,
  }).trim();
}
function configuration(path) {
  const bytes = readFileSync(path);
  return { text: bytes.toString(), sha256: createHash("sha256").update(bytes).digest("hex") };
}
function requireFlag(text, name, enabled) {
  const pattern = new RegExp(`^#define BUILDFLAG_INTERNAL_${name}\\(\\) \\(${enabled ? 1 : 0}\\)$`, "m");
  assert.match(text, pattern, `Missing required generated ${name}=${enabled}`);
}

/** The configured source must be the same checkout protected by the original dev lock. */
export function inspectAuxCandidate(binary, { source, generatedHeader, capability }) {
  assert.ok(isAbsolute(binary), "AUX_CANDIDATE_BIN must be an absolute executable path");
  assert.ok(
    !lstatSync(dirname(dirname(dirname(binary)))).isSymbolicLink(),
    "Do not substitute a symlinked candidate bundle",
  );
  const executable = realpathSync(binary),
    sourcePath = realpathSync(source);
  assert.ok(!lstatSync(binary).isSymbolicLink(), "Do not substitute a candidate executable symlink");
  const location = relative(sourcePath, executable).split("/");
  assert.ok(
    location.length === 6 &&
      location[0] === "out" &&
      ["AuxProof", "AuxDev", "AuxFast"].includes(location[1]) &&
      location.slice(2).join("/") === "Aux.app/Contents/MacOS/Aux",
    "Use the actual current Aux.app executable in this checkout's out/AuxProof, out/AuxDev or out/AuxFast",
  );
  const output = join(sourcePath, "out", location[1]),
    app = join(output, "Aux.app");
  assert.equal(realpathSync(app), app, "Do not substitute a symlinked candidate bundle");
  assert.ok(
    !existsSync(join(app, "Contents/_CodeSignature")),
    "Qualification requires the unsigned developer output, not a signed distribution",
  );
  accessSync(executable, constants.X_OK);
  assert.equal(plist(join(app, "Contents/Info.plist"), "CFBundleExecutable"), "Aux");
  assert.equal(
    plist(join(app, "Contents/Info.plist"), "CFBundleIdentifier"),
    "dev.aux.browser",
    "Candidate must retain its real Aux bundle identity",
  );
  const versionParts = Object.fromEntries(
    readFileSync(join(sourcePath, "chrome/VERSION"), "utf8")
      .trim()
      .split("\n")
      .map((line) => line.split("=")),
  );
  const version = ["MAJOR", "MINOR", "BUILD", "PATCH"].map((key) => versionParts[key]).join(".");
  assert.match(version, /^\d+\.\d+\.\d+\.\d+$/);
  assert.equal(
    version,
    readFileSync(new URL("../../chromium/version.txt", import.meta.url), "utf8").split("\n")[0],
    "Candidate source must match this workspace's pinned Chromium VERSION",
  );
  assert.equal(
    plist(join(app, "Contents/Info.plist"), "CFBundleShortVersionString"),
    version,
    "Candidate bundle/source version mismatch",
  );
  const framework = realpathSync(
    join(app, "Contents/Frameworks/Aux Framework.framework/Versions/Current/Aux Framework"),
  );
  assert.ok(
    framework.startsWith(join(app, "Contents/Frameworks/Aux Framework.framework/Versions/")),
    "Framework must belong to the original candidate bundle",
  );
  assert.equal(
    plist(join(dirname(framework), "Resources/Info.plist"), "CFBundleShortVersionString"),
    version,
    "Candidate framework/source version mismatch",
  );
  assert.equal(
    plist(join(dirname(framework), "Resources/Info.plist"), "CFBundleExecutable"),
    "Aux Framework",
    "Candidate must retain its real framework executable identity",
  );
  assert.equal(
    plist(join(dirname(framework), "Resources/Info.plist"), "CFBundleIdentifier"),
    "dev.aux.browser.framework",
    "Candidate must retain its real framework bundle identity",
  );
  assertCompiledRuntimeAbi(app, generatedHeader);

  const inputs = {
    args: configuration(join(output, "args.gn")),
    browser: configuration(join(output, "gen/chrome/browser/buildflags.h")),
    branding: configuration(join(output, "gen/build/branding_buildflags.h")),
  };
  requireFlag(inputs.browser.text, "ENABLE_AUX_SHELL", true);
  requireFlag(inputs.browser.text, "AUX_TEST_HOOKS", false);
  requireFlag(inputs.branding.text, "GOOGLE_CHROME_BRANDING", false);
  assert.match(inputs.args.text, /^target_cpu\s*=\s*"arm64"\s*$/m);
  if (location[1] === "AuxFast") {
    for (const [name, value] of Object.entries({
      is_debug: false,
      is_official_build: true,
      is_component_build: false,
      enable_aux_shell: true,
      aux_test_hooks: false,
    }))
      assert.match(
        inputs.args.text,
        new RegExp(`^${name}\\s*=\\s*${value}\\s*$`, "m"),
        `AuxFast requires explicit ${name}=${value}`,
      );
  }
  assert.ok(["extensions", "webauthn"].includes(capability));
  if (capability === "extensions") {
    inputs.extensions = configuration(join(output, "gen/extensions/buildflags/buildflags.h"));
    requireFlag(inputs.extensions.text, "ENABLE_EXTENSIONS", true);
    requireFlag(inputs.extensions.text, "ENABLE_EXTENSIONS_CORE", true);
  }
  return {
    source: sourcePath,
    output,
    app,
    flavor: location[1],
    version,
    executable: fileIdentity(executable, 2),
    framework: fileIdentity(framework, 6),
    configurationEvidence: {
      files: Object.fromEntries(
        Object.entries(inputs).map(([name, value]) => [name, { sha256: value.sha256 }]),
      ),
      generated: {
        enableAuxShell: true,
        auxTestHooks: false,
        googleChromeBranding: false,
        ...(capability === "extensions" ? { enableExtensions: true, enableExtensionsCore: true } : {}),
      },
      explicitGn: Object.fromEntries(
        inputs.args.text.split("\n").flatMap((line) => {
          const match = line.match(
            /^(is_debug|is_official_build|is_component_build|enable_aux_shell|aux_test_hooks|target_cpu)\s*=\s*(true|false|"arm64")\s*$/,
          );
          return match ? [[match[1], match[2]]] : [];
        }),
      ),
      scope:
        "Current source/output configuration, recorded separately; not proof of flags embedded in the running binary",
    },
    capabilityScope:
      capability === "webauthn"
        ? "Actual CDP virtual-authenticator protocol must still pass; no platform/synced passkey claim"
        : "Actual extension/Store probe must still pass; generated configuration is not running-binary capability proof",
  };
}

export function assertAuxCandidateUnchanged(candidate) {
  for (const file of [candidate.executable, candidate.framework]) {
    assert.equal(realpathSync(file.path), file.path, "Original candidate path changed");
    assert.equal(
      stamp(statSync(file.path, { bigint: true })),
      file.stamp,
      "Original candidate changed; rebuild evidence and relaunch under its owner",
    );
  }
}

export function assertCandidateBrowserVersion(context, candidate) {
  if (!candidate) return;
  const actual = context.browser()?.version();
  assert.equal(
    actual?.match(/(?:^|\/)(\d+\.\d+\.\d+\.\d+)$/)?.[1],
    candidate.version,
    "Running browser version must match the original inspected candidate",
  );
  assertAuxCandidateUnchanged(candidate);
}

export function assertExternalControlPath(binary) {
  const actual = realpathSync(binary);
  assert.ok(
    !/\/out\/(?:AuxProof|AuxDev|AuxFast)\//.test(actual) && !actual.endsWith("/Aux.app/Contents/MacOS/Aux"),
    "An Aux executable must use AUX_CANDIDATE_BIN and its original dev-lock checks, not the external-control route",
  );
}
