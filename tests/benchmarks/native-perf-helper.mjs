import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute } from "node:path";

const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function inspect(path) {
  assert.ok(isAbsolute(path ?? "") && !/[\r\n]/.test(path), "Helper requires an absolute file path");
  const original = lstatSync(path, { bigint: true });
  assert.ok(
    original.isFile() && (original.mode & 0o111n) !== 0n,
    "Helper must be a regular executable, not a symlink",
  );
  const canonical = realpathSync(path);
  const sha256 = hash(canonical);
  const current = lstatSync(path, { bigint: true });
  assert.ok(
    original.dev === current.dev &&
      original.ino === current.ino &&
      original.size === current.size &&
      original.mtimeNs === current.mtimeNs &&
      original.ctimeNs === current.ctimeNs,
    "Helper changed while its identity was inspected",
  );
  return {
    path: canonical,
    sha256,
    device: String(original.dev),
    inode: String(original.ino),
    bytes: Number(original.size),
  };
}

/** Reuse is an explicit approval of these bytes, not proof of source-to-binary equivalence. */
export function prepareNativePerfHelper({ source, output, approved }, compile) {
  const sourcePath = realpathSync(source);
  const sourceSha256 = hash(sourcePath);
  if (approved) {
    assert.match(approved.sha256 ?? "", /^[a-f0-9]{64}$/, "--input-helper-sha256 is required");
    assert.match(approved.sourceSha256 ?? "", /^[a-f0-9]{64}$/, "--input-helper-source-sha256 is required");
    assert.equal(sourceSha256, approved.sourceSha256, "Approved helper source does not match current source");
    const identity = inspect(approved.path);
    assert.equal(identity.sha256, approved.sha256, "Approved helper bytes changed");
    return Object.freeze({
      ...identity,
      sourcePath,
      sourceSha256,
      mode: "reused",
      provenance:
        "Operator-approved binary and current source pins; compilation equivalence is not independently established",
    });
  }
  assert.ok(!existsSync(output), "Never replace an existing native performance helper");
  compile(sourcePath, output);
  assert.equal(hash(sourcePath), sourceSha256, "Helper source changed during compilation");
  return Object.freeze({
    ...inspect(output),
    sourcePath,
    sourceSha256,
    mode: "compiled",
    provenance: "Compiled by this runner with xcrun swiftc -O from the recorded unchanged source",
  });
}

/** Called before each original browser's helper spawn; OS trust remains a separate real check. */
export function assertNativePerfHelperCurrent(helper) {
  assert.deepEqual(
    inspect(helper.path),
    {
      path: helper.path,
      sha256: helper.sha256,
      device: helper.device,
      inode: helper.inode,
      bytes: helper.bytes,
    },
    "Original helper bytes or file identity changed",
  );
  assert.equal(hash(helper.sourcePath), helper.sourceSha256, "Original helper source changed");
}
