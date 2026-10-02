import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readStartupMachO, validateStartupCompilerManifest } from '../host/lib/startup-helper-manifest.mjs';
// Synthetic metadata controls only. These bytes are never compiled or executed.
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const canonical = value => JSON.stringify(value, function (_, item) {
  return item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item;
});
function fixture() {
  const binary = Buffer.alloc(104); binary.writeUInt32LE(0xfeedfacf, 0); binary.writeUInt32LE(0x100000c, 4);
  binary.writeUInt32LE(2, 12); binary.writeUInt32LE(3, 16); binary.writeUInt32LE(72, 20);
  binary.writeUInt32LE(0x1b, 32); binary.writeUInt32LE(24, 36); binary.fill(0xab, 40, 56);
  binary.writeUInt32LE(0x32, 56); binary.writeUInt32LE(24, 60); binary.writeUInt32LE(1, 64);
  binary.writeUInt32LE(0x0f0000, 68); binary.writeUInt32LE(0x1a0000, 72);
  binary.writeUInt32LE(0x80000028, 80); binary.writeUInt32LE(24, 84);
  const assembly = { sourceSha256: hash('source'), assembledSha256: hash('assembly') };
  const record = { producer: 'aux-startup-helper-compile', version: 1, exitCode: 0, assembly,
    compiler: { sha256: hash('compiler'), versionSha256: hash('compiler version') },
    sdk: { settingsSha256: hash('sdk settings'), version: '26.0.0' },
    output: { sha256: hash(binary), bytes: binary.length, ...readStartupMachO(binary) },
    stdoutSha256: hash('stdout'), stderrSha256: hash('stderr') };
  const raw = canonical(record) + '\n';
  const audit = { manifestSha256: hash(raw), binarySha256: hash(binary), ...assembly,
    compilerSha256: record.compiler.sha256, compilerVersionSha256: record.compiler.versionSha256,
    sdkSettingsSha256: record.sdk.settingsSha256, stdoutSha256: record.stdoutSha256, stderrSha256: record.stderrSha256 };
  return { binary, assembly, record, raw, audit };
}
test('pairs original UUID/build metadata and all independent audit digests', () => {
  const f = fixture(); const result = validateStartupCompilerManifest(f.raw, f.binary, f.assembly, f.audit);
  assert.equal(result.image.imageUuid, 'ab'.repeat(16)); assert.equal(result.image.architecture, 'arm64');
  assert.equal(result.image.sdkVersion, '26.0.0');
});
test('missing audit and mismatched compiler, SDK, source and original executable refuse', () => {
  const f = fixture(); assert.throws(() => validateStartupCompilerManifest(f.raw, f.binary, f.assembly, {}));
  for (const field of Object.keys(f.audit)) assert.throws(() => validateStartupCompilerManifest(f.raw, f.binary, f.assembly, { ...f.audit, [field]: hash('foreign') }));
});
test('a pinned failed compile, forged UUID or additional field still refuses', () => {
  for (const change of [r => { r.exitCode = 1; }, r => { r.output.imageUuid = 'cd'.repeat(16); },
    r => { r.sdk.version = '25.0.0'; }, r => { r.output.architecture = 'x86_64'; }, r => { r.requestedLabel = 'compiled'; }]) {
    const f = fixture(); change(f.record); const raw = canonical(f.record) + '\n';
    assert.throws(() => validateStartupCompilerManifest(raw, f.binary, f.assembly, { ...f.audit, manifestSha256: hash(raw) }));
  }
});
test('truncated or oversized command regions and unsupported images refuse', () => {
  for (const change of [b => b.writeUInt32LE(0xcafebabe, 0), b => b.writeUInt32LE(1, 12),
    b => b.writeUInt32LE(1025, 16), b => b.writeUInt32LE(1000, 20), b => b.writeUInt32LE(4, 36),
    b => b.writeUInt32LE(2, 64), b => b.writeUInt32LE(1, 76)]) {
    const f = fixture(); change(f.binary); assert.throws(() => readStartupMachO(f.binary));
  }
  assert.throws(() => readStartupMachO(fixture().binary.subarray(0, 90)));
});
test('duplicate UUID, zero UUID and absent entry metadata refuse', () => {
  const duplicate = fixture().binary; duplicate.writeUInt32LE(0x1b, 80); duplicate.fill(0xcd, 88, 104);
  assert.throws(() => readStartupMachO(duplicate), /Duplicate LC_UUID/);
  const zero = fixture().binary; zero.fill(0, 40, 56); assert.throws(() => readStartupMachO(zero));
  const noEntry = fixture().binary; noEntry.writeUInt32LE(0x99, 80); assert.throws(() => readStartupMachO(noEntry));
});
test('noncanonical or duplicate-key manifest cannot borrow a hash pin', () => {
  const f = fixture();
  for (const raw of [JSON.stringify(f.record) + '\n', f.raw.replace('"exitCode":0', '"exitCode":1,"exitCode":0')])
    assert.throws(() => validateStartupCompilerManifest(raw, f.binary, f.assembly, { ...f.audit, manifestSha256: hash(raw) }));
});
