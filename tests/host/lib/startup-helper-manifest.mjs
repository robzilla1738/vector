import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const keys = (value, names) => assert.deepEqual(Object.keys(value ?? {}).sort(), names.sort());
const sha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const canonical = value => JSON.stringify(value, function (_, item) {
  return item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item;
});
const freeze = value => {
  if (value && typeof value === 'object') { for (const item of Object.values(value)) freeze(item); Object.freeze(value); }
  return value;
};
const version = word => `${word >>> 16}.${(word >>> 8) & 255}.${word & 255}`;
/** Bounded original executable metadata readback, never a compilation claim. */
export function readStartupMachO(bytes) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length >= 32 && bytes.length <= 64 * 1024 * 1024);
  assert.equal(bytes.readUInt32LE(0), 0xfeedfacf, 'Startup helper must be a thin little-endian Mach-O64');
  const architecture = ({ [0x100000c]: 'arm64', [0x1000007]: 'x86_64' })[bytes.readUInt32LE(4)];
  assert.ok(architecture); assert.equal(bytes.readUInt32LE(12), 2, 'Helper must be MH_EXECUTE');
  const count = bytes.readUInt32LE(16), size = bytes.readUInt32LE(20);
  assert.ok(count > 0 && count <= 1024 && size <= 1024 * 1024 && 32 + size <= bytes.length);
  let offset = 32, imageUuid, build, entry = false;
  for (let index = 0; index < count; index++) {
    assert.ok(offset + 8 <= 32 + size);
    const command = bytes.readUInt32LE(offset), length = bytes.readUInt32LE(offset + 4);
    assert.ok(length >= 8 && length % 8 === 0 && offset + length <= 32 + size);
    if (command === 0x1b) {
      assert.equal(length, 24); assert.equal(imageUuid, undefined, 'Duplicate LC_UUID');
      imageUuid = bytes.subarray(offset + 8, offset + 24).toString('hex');
      assert.notEqual(imageUuid, '0'.repeat(32));
    }
    if (command === 0x32) {
      assert.equal(build, undefined, 'Duplicate LC_BUILD_VERSION'); assert.ok(length >= 24);
      assert.equal(bytes.readUInt32LE(offset + 8), 1, 'Only actual macOS helpers are supported');
      assert.equal(length, 24 + 8 * bytes.readUInt32LE(offset + 20));
      const minimum = bytes.readUInt32LE(offset + 12), sdk = bytes.readUInt32LE(offset + 16);
      assert.ok(minimum > 0 && sdk >= minimum);
      build = { minimumOS: version(minimum), sdkVersion: version(sdk) };
    }
    if (command === 0x80000028) { assert.equal(length, 24); assert.equal(entry, false); entry = true; }
    offset += length;
  }
  assert.equal(offset, 32 + size); assert.ok(imageUuid && build && entry, 'Missing original executable metadata');
  return Object.freeze({ architecture, imageUuid, ...build });
}
/** Expected digests come from the integrator's independent builder audit.
 * Matching synthetic metadata alone does not become native evidence. */
export function validateStartupCompilerManifest(raw, binary, assembly, audit) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 65536);
  const fields = ['manifestSha256', 'binarySha256', 'sourceSha256', 'assembledSha256', 'compilerSha256', 'compilerVersionSha256', 'sdkSettingsSha256', 'stdoutSha256', 'stderrSha256'];
  keys(audit, fields); for (const field of fields) assert.ok(sha(audit[field]));
  assert.equal(hash(raw), audit.manifestSha256); assert.equal(hash(binary), audit.binarySha256);
  const record = JSON.parse(raw); assert.equal(raw, canonical(record) + '\n', 'Compile manifest must be canonical original bytes');
  keys(record, ['producer', 'version', 'exitCode', 'assembly', 'compiler', 'sdk', 'output', 'stdoutSha256', 'stderrSha256']);
  assert.equal(record.producer, 'aux-startup-helper-compile'); assert.equal(record.version, 1); assert.equal(record.exitCode, 0);
  assert.deepEqual(record.assembly, assembly); assert.equal(assembly.sourceSha256, audit.sourceSha256); assert.equal(assembly.assembledSha256, audit.assembledSha256);
  keys(record.compiler, ['sha256', 'versionSha256']); assert.equal(record.compiler.sha256, audit.compilerSha256); assert.equal(record.compiler.versionSha256, audit.compilerVersionSha256);
  keys(record.sdk, ['settingsSha256', 'version']); assert.equal(record.sdk.settingsSha256, audit.sdkSettingsSha256);
  keys(record.output, ['sha256', 'bytes', 'architecture', 'imageUuid', 'minimumOS', 'sdkVersion']);
  assert.equal(record.output.sha256, audit.binarySha256); assert.equal(record.output.bytes, binary.length);
  const image = readStartupMachO(binary);
  for (const [key, value] of Object.entries(image)) assert.equal(record.output[key], value, `Original Mach-O ${key} mismatch`);
  assert.equal(record.sdk.version, image.sdkVersion);
  assert.equal(record.stdoutSha256, audit.stdoutSha256); assert.equal(record.stderrSha256, audit.stderrSha256);
  return Object.freeze({ record: freeze(record), originalManifestSha256: audit.manifestSha256, image });
}
