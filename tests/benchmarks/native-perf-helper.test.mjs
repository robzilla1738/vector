import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { assertNativePerfHelperCurrent, prepareNativePerfHelper } from "./native-perf-helper.mjs";

const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
function fixture(t) {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "aux-perf-helper-unit-")));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = join(directory, "native-perf.swift"),
    path = join(directory, "approved-helper");
  writeFileSync(source, "reviewed Swift source\n");
  writeFileSync(path, "reviewed helper bytes\n", { mode: 0o755 });
  const approved = { path, sha256: hash(path), sourceSha256: hash(source) };
  return { source, approved, output: join(directory, "new-report-helper") };
}
const noCompile = () => {
  throw new Error("Approved helper must never be recompiled");
};

test("reuses exact approved bytes across fresh reports without invoking the compiler", (t) => {
  const f = fixture(t),
    original = readFileSync(f.approved.path);
  const first = prepareNativePerfHelper(f, noCompile);
  const second = prepareNativePerfHelper({ ...f, output: f.output + "-next" }, noCompile);
  assert.deepEqual(first, second);
  assert.equal(first.mode, "reused");
  assertNativePerfHelperCurrent(first);
  assert.deepEqual(readFileSync(f.approved.path), original);
});

test("requires both explicit approved pins and exact current source and helper bytes", (t) => {
  const f = fixture(t);
  let compilations = 0;
  const compile = () => {
    compilations++;
    throw new Error("Invalid approval must not invoke the compiler");
  };
  for (const approved of [
    { path: f.approved.path },
    { ...f.approved, sha256: undefined },
    { ...f.approved, sourceSha256: undefined },
    { ...f.approved, sha256: "0".repeat(64) },
    { ...f.approved, sourceSha256: "0".repeat(64) },
    { ...f.approved, path: "relative-helper" },
  ])
    assert.throws(() => prepareNativePerfHelper({ ...f, approved }, compile));
  assert.equal(compilations, 0);
});

test("refuses a symlink or non-executable approved helper without recompiling", (t) => {
  const f = fixture(t),
    link = f.approved.path + "-link";
  symlinkSync(f.approved.path, link);
  assert.throws(() => prepareNativePerfHelper({ ...f, approved: { ...f.approved, path: link } }, noCompile));
  chmodSync(f.approved.path, 0o644);
  assert.throws(() => prepareNativePerfHelper(f, noCompile));
});

test("refuses changed bytes, replaced same-byte file identity, and later source changes before spawn", (t) => {
  const f = fixture(t),
    original = readFileSync(f.approved.path);
  const helper = prepareNativePerfHelper(f, noCompile);
  writeFileSync(f.approved.path, "different helper bytes\n");
  assert.throws(() => assertNativePerfHelperCurrent(helper), /identity changed/);
  writeFileSync(f.approved.path, original);
  renameSync(f.approved.path, f.approved.path + "-retired");
  writeFileSync(f.approved.path, original, { mode: 0o755 });
  assert.throws(() => assertNativePerfHelperCurrent(helper), /identity changed/);
  const replacement = prepareNativePerfHelper(f, noCompile);
  writeFileSync(f.source, "new source\n");
  assert.throws(() => assertNativePerfHelperCurrent(replacement), /source changed/);
});

test("keeps fresh compilation explicit and refuses replacing an existing output", (t) => {
  const f = fixture(t);
  let calls = 0;
  const compile = (source, output) => {
    calls++;
    assert.equal(source, f.source);
    writeFileSync(output, "new compiled bytes\n", { mode: 0o755 });
  };
  const helper = prepareNativePerfHelper({ ...f, approved: undefined }, compile);
  assert.equal(calls, 1);
  assert.equal(helper.mode, "compiled");
  assertNativePerfHelperCurrent(helper);
  assert.throws(() => prepareNativePerfHelper({ ...f, approved: undefined }, compile), /Never replace/);
  assert.equal(calls, 1);
});
