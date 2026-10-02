import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmodSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleStartupHelper } from '../host/assemble-startup-helper.mjs';
import { readStartupMachO } from '../host/lib/startup-helper-manifest.mjs';
import { retainStartupHelperArtifact } from '../host/lib/startup-helper-artifact.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const assembly = assembleStartupHelper(readFileSync(new URL('../host/startup-receipt-writer.swift', import.meta.url)), readFileSync(new URL('../host/startup-launch.swift', import.meta.url)), readFileSync(new URL('../host/assemble-startup-helper.mjs', import.meta.url)), readFileSync(new URL('../host/startup-child-lifetime.swift', import.meta.url))).manifest;
function fixture(run) {
  const root = realpathSync(mkdtempSync('/tmp/aux-startup-artifact-test-'));
  const path = join(root, 'not-a-compiled-helper'), compilerManifestPath = join(root, 'synthetic-compiler-manifest');
  // Synthetic metadata only, never compiled or executed.
  const binary = Buffer.alloc(104); binary.writeUInt32LE(0xfeedfacf, 0); binary.writeUInt32LE(0x100000c, 4);
  binary.writeUInt32LE(2, 12); binary.writeUInt32LE(3, 16); binary.writeUInt32LE(72, 20);
  binary.writeUInt32LE(0x1b, 32); binary.writeUInt32LE(24, 36); binary.fill(0xaa, 40, 56);
  binary.writeUInt32LE(0x32, 56); binary.writeUInt32LE(24, 60); binary.writeUInt32LE(1, 64);
  binary.writeUInt32LE(0x0f0000, 68); binary.writeUInt32LE(0x1a0000, 72);
  binary.writeUInt32LE(0x80000028, 80); binary.writeUInt32LE(24, 84);
  const record = { producer: 'aux-startup-helper-compile', version: 1, exitCode: 0, assembly,
    compiler: { sha256: hash('compiler'), versionSha256: hash('version') },
    sdk: { settingsSha256: hash('settings'), version: '26.0.0' },
    output: { sha256: hash(binary), bytes: binary.length, ...readStartupMachO(binary) },
    stdoutSha256: hash('stdout'), stderrSha256: hash('stderr') };
  const compiler = Buffer.from(JSON.stringify(record, function (_, item) {
    return item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item;
  }) + '\n');
  const audit = { manifestSha256: hash(compiler), binarySha256: hash(binary),
    sourceSha256: assembly.sourceSha256, assembledSha256: assembly.assembledSha256,
    compilerSha256: record.compiler.sha256, compilerVersionSha256: record.compiler.versionSha256,
    sdkSettingsSha256: record.sdk.settingsSha256, stdoutSha256: record.stdoutSha256, stderrSha256: record.stderrSha256 };
  writeFileSync(path, binary, { mode: 0o700 }); writeFileSync(compilerManifestPath, compiler, { mode: 0o600 });
  const helper = { path, compilerManifestPath, sha256: hash(binary), compilerManifestSha256: hash(compiler), sourceSha256: assembly.sourceSha256, assembledSha256: assembly.assembledSha256, imageUuid: 'a'.repeat(32) };
  try { run(helper, root, audit); } finally { rmSync(root, { recursive: true }); }
}
test('original artifact FD hash validation is positional and repeatable, never a compile proof', () => fixture((helper, _, audit) => {
  const lease = retainStartupHelperArtifact(helper, audit); lease.validate(); lease.validate(); lease.release(); lease.release(); assert.throws(() => lease.validate(), /Retired/);
}));
test('source/assembly mismatch and wrong original bytes refuse', () => fixture((helper, _, audit) => {
  for (const key of ['sourceSha256', 'assembledSha256', 'sha256', 'compilerManifestSha256']) assert.throws(() => retainStartupHelperArtifact({ ...helper, [key]: 'f'.repeat(64) }, audit));
}));
test('in-place executable changes cannot be hidden by retaining an original descriptor', () => fixture((helper, _, audit) => {
  const lease = retainStartupHelperArtifact(helper, audit); writeFileSync(helper.path, 'replaced bytes'); assert.throws(() => lease.validate()); lease.release();
}));
test('symlink and weak helper permissions refuse', () => fixture((helper, root, audit) => {
  const alias = join(root, 'alias'); symlinkSync(helper.path, alias); assert.throws(() => retainStartupHelperArtifact({ ...helper, path: alias }, audit));
  chmodSync(helper.path, 0o722); assert.throws(() => retainStartupHelperArtifact(helper, audit));
}));

test('missing independent compile audit and original UUID mismatch refuse', () => fixture((helper, _, audit) => {
  assert.throws(() => retainStartupHelperArtifact(helper));
  assert.throws(() => retainStartupHelperArtifact({ ...helper, imageUuid: 'b'.repeat(32) }, audit));
}));
