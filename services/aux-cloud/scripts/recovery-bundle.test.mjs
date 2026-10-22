import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile, stat, access, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable } from 'node:stream';
import { writeBundle, unpackBundle } from './recovery-bundle.mjs';

test('sealed database, private bytes and wrapping key recover together with private permissions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'aux-bundle-test-'));
  try {
    const key = randomBytes(32), payload = randomBytes(257 * 1024), secret = randomBytes(32).toString('base64');
    const directory = join(root, 'sealed'), destination = join(root, 'recovered');
    await writeBundle({ directory, key, maxBytes: 1024 * 1024, metadata: { wrappingKey: secret }, entries: [
      { name: 'database.dump', source: Readable.from([Buffer.from('PGDMP synthetic')]) },
      { name: 'blob-0.bin', source: Readable.from([payload.subarray(0, 10000), payload.subarray(10000)]), object: { pathname: 'synthetic' } },
    ] });
    assert(!(await readFile(join(directory, 'manifest.sealed'))).includes(Buffer.from(secret)));
    const restored = await unpackBundle({ directory, key, destination, maxBytes: 1024 * 1024 });
    assert.equal(restored.manifest.metadata.wrappingKey, secret);
    assert((await readFile(join(destination, 'blob-0.bin'))).equals(payload));
    assert.equal((await stat(destination)).mode & 0o777, 0o700);
    assert.equal((await stat(join(destination, 'manifest.json'))).mode & 0o777, 0o600);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('wrong key, truncated entry, cross-entry substitution and budget violations leave no plaintext staging', async () => {
  const root = await mkdtemp(join(tmpdir(), 'aux-bundle-reject-'));
  try {
    const key = randomBytes(32), directory = join(root, 'sealed');
    await writeBundle({ directory, key, metadata: {}, maxBytes: 100, entries: [
      { name: 'database.dump', source: Readable.from(['database']) },
      { name: 'blob-0.bin', source: Readable.from(['object']) },
    ] });
    const reject = async (name, selectedKey = key, maxBytes = 100) => {
      const destination = join(root, name);
      await assert.rejects(unpackBundle({ directory, key: selectedKey, destination, maxBytes }));
      await assert.rejects(access(destination));
    };
    await reject('wrong-key', randomBytes(32));
    await reject('too-small', key, 1);
    const original = await readFile(join(directory, 'blob-0.bin.sealed'));
    await writeFile(join(directory, 'blob-0.bin.sealed'), original.subarray(0, original.length - 1));
    await reject('truncated');
    await copyFile(join(directory, 'database.dump.sealed'), join(directory, 'blob-0.bin.sealed'));
    await reject('substituted');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('unsafe paths and interrupted exports cannot publish a completed bundle or replace existing directories', async () => {
  const root = await mkdtemp(join(tmpdir(), 'aux-bundle-path-'));
  try {
    const key = randomBytes(32), directory = join(root, 'sealed');
    await assert.rejects(writeBundle({ directory, key, metadata: {}, maxBytes: 100, entries: [
      { name: '../escape', source: Readable.from(['unsafe']) },
    ] }));
    await assert.rejects(access(directory));
    await assert.rejects(writeBundle({ directory, key, metadata: {}, maxBytes: 1, entries: [
      { name: 'database.dump', source: Readable.from(['too large']) },
    ] }));
    await assert.rejects(access(directory));
    await writeFile(join(root, 'owner.txt'), 'preserved');
    await assert.rejects(writeBundle({ directory: root, key, metadata: {}, maxBytes: 100, entries: [] }));
    assert.equal(await readFile(join(root, 'owner.txt'), 'utf8'), 'preserved');
  } finally { await rm(root, { recursive: true, force: true }); }
});
