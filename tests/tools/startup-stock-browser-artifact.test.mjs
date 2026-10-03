import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { retainStartupBrowserArtifact } from '../host/lib/startup-browser-artifact.mjs';
function fixture(run, kind = 'stock') {
  const root = realpathSync(mkdtempSync('/tmp/aux-browser-artifact-control-'));
  const bundle = join(root, kind === 'stock' ? 'Chromium.app' : 'Aux.app');
  const path = join(bundle, kind === 'stock' ? 'Contents/MacOS/Chromium' : 'Contents/MacOS/Aux');
  mkdirSync(join(bundle, 'Contents/MacOS'), { recursive: true });
  // Metadata controls only. This file is never compiled or executed.
  const bytes = Buffer.alloc(104); bytes.writeUInt32LE(0xfeedfacf, 0); bytes.writeUInt32LE(0x100000c, 4);
  bytes.writeUInt32LE(2, 12); bytes.writeUInt32LE(3, 16); bytes.writeUInt32LE(72, 20);
  bytes.writeUInt32LE(0x1b, 32); bytes.writeUInt32LE(24, 36); bytes.fill(0xab, 40, 56);
  bytes.writeUInt32LE(0x32, 56); bytes.writeUInt32LE(24, 60); bytes.writeUInt32LE(1, 64);
  bytes.writeUInt32LE(0x0f0000, 68); bytes.writeUInt32LE(0x1b0000, 72);
  bytes.writeUInt32LE(0x80000028, 80); bytes.writeUInt32LE(24, 84);
  writeFileSync(path, bytes, { mode: 0o700 });
  const pins = { sha256: createHash('sha256').update(bytes).digest('hex'), imageUuid: 'ab'.repeat(16) };
  try { run({ bundle, path, pins, kind }); } finally { rmSync(root, { recursive: true }); }
}
test('holds exact original browser bytes and inode through explicit retirement', () => fixture(({ bundle, pins }) => {
  const held = retainStartupBrowserArtifact(bundle, pins, 'stock'); held.validate(); held.validate();
  assert.equal(held.identity.sha256, pins.sha256); assert.match(held.identity.inode, /^[1-9][0-9]*$/);
  held.release(); held.release(); assert.throws(() => held.validate(), /Retired/);
}));
test('same-byte replacement inode and in-place changes both refuse', () => {
  for (const replace of [false, true]) fixture(({ bundle, path, pins }) => {
    const held = retainStartupBrowserArtifact(bundle, pins, 'stock');
    if (replace) { writeFileSync(path + '.replacement', readFileSync(path), { mode: 0o700 }); renameSync(path + '.replacement', path); }
    else writeFileSync(path, 'changed original executable');
    assert.throws(() => held.validate()); held.release();
  });
});
test('wrong original pins and executable permissions refuse', () => fixture(({ bundle, path, pins }) => {
  for (const key of ['sha256', 'imageUuid'])
    assert.throws(() => retainStartupBrowserArtifact(bundle, { ...pins, [key]: 'f'.repeat(key === 'sha256' ? 64 : 32) }, 'stock'));
  chmodSync(path, 0o722); assert.throws(() => retainStartupBrowserArtifact(bundle, pins, 'stock'));
}));
test('fixed executable symlink cannot substitute another file or caller path', () => fixture(({ bundle, path, pins }) => {
  renameSync(path, path + '.original'); symlinkSync(path + '.original', path);
  assert.throws(() => retainStartupBrowserArtifact(bundle, pins, 'stock'));
  assert.throws(() => retainStartupBrowserArtifact(bundle, { ...pins, path: path + '.original' }, 'stock'));
}));

test('original Aux default is preserved and cross-kind or arbitrary basename refuses', () => {
  fixture(({ bundle, pins }) => {
    const held = retainStartupBrowserArtifact(bundle, pins); held.validate(); held.release();
    assert.throws(() => retainStartupBrowserArtifact(bundle, pins, 'stock'));
  }, 'aux');
  fixture(({ bundle, pins }) => {
    assert.throws(() => retainStartupBrowserArtifact(bundle, pins));
    for (const kind of ['Chromium', '../Chromium', 'foreign', null])
      assert.throws(() => retainStartupBrowserArtifact(bundle, pins, kind));
  });
});
