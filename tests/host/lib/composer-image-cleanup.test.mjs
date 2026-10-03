import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, lstat, mkdir, rmdir, rename, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createInvalidImageFixture } from './composer-image-appearance.mjs';

test('changed original file refuses while retaining exact lease for restored cleanup retry', async () => {
  const fixture = await createInvalidImageFixture(), bytes = await readFile(fixture.path), original = await lstat(fixture.path);
  try {
    await writeFile(fixture.path, Buffer.alloc(bytes.length, 120));
    await assert.rejects(fixture.dispose(), error => error instanceof AggregateError && error.ownedImageFixture === fixture && error.cleanupPhase === 'live' && error.errors.length === 1);
    const current = await lstat(fixture.path); assert.equal(current.ino, original.ino); assert.equal(current.dev, original.dev);
    await writeFile(fixture.path, bytes); await fixture.validate(); await fixture.dispose();
    await assert.rejects(lstat(dirname(fixture.path)), { code: 'ENOENT' }); await fixture.dispose();
  } finally {
    try { await writeFile(fixture.path, bytes); } catch(error) { if (error.code !== 'ENOENT') throw error; }
    await fixture.dispose();
  }
});
test('unknown original-tree entry is never removed and exact lease survives correction', async () => {
  const fixture = await createInvalidImageFixture(), unknown = join(dirname(fixture.path), 'owned-test-blocker');
  await mkdir(unknown, { mode: 0o700 });
  try { await assert.rejects(fixture.dispose(), error => error.ownedImageFixture === fixture); assert.ok((await lstat(unknown)).isDirectory()); await fixture.validate().then(() => assert.fail('Unknown entry must refuse'), () => {}); }
  finally { await rmdir(unknown); await fixture.validate(); await fixture.dispose(); }
});
test('replaced path cannot be adopted by retained FD even when bytes match', async () => {
  const fixture = await createInvalidImageFixture(), bytes = await readFile(fixture.path), original = await lstat(fixture.path), saved = fixture.path + '.original';
  await rename(fixture.path, saved); await writeFile(fixture.path, bytes, { flag: 'wx', mode: 0o600 });
  try { await assert.rejects(fixture.dispose(), error => error.ownedImageFixture === fixture); assert.notEqual((await lstat(fixture.path)).ino, original.ino); }
  finally { await unlink(fixture.path); await rename(saved, fixture.path); await fixture.validate(); await fixture.dispose(); }
});
