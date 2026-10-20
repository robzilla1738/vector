import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { retireCopiedIndependentRuntime, verifyPackageInventory } from './provided-package.mjs';

async function runtimeFixture(directory, name = '@aux/runtime') {
  const files = {
    'Contents/MacOS/Aux': 'native browser',
    'Contents/Resources/aux-runtime/package.json': JSON.stringify({ name, version: '0.1.0' }),
    'Contents/Resources/aux-runtime/dist/daemon.js': 'retired independent daemon',
    'Contents/Resources/aux/agent-runtime/node': 'supplied runtime',
    'Contents/Resources/aux-runtime-other/resource': 'unrelated resource',
  };
  const entries = [];
  for (const [path, contents] of Object.entries(files)) {
    await mkdir(join(directory, path, '..'), { recursive: true });
    await writeFile(join(directory, path), contents);
    await chmod(join(directory, path), 0o644);
    entries.push({ path, type: 'file', mode: 0o644, sha256: createHash('sha256').update(contents).digest('hex') });
  }
  return entries;
}

test('retirement omits only the identified copied independent runtime and preserves the native seed', async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'aux-package-retirement-')));
  try {
    const seed = join(directory, 'seed'), copy = join(directory, 'copy');
    const entries = await runtimeFixture(seed);
    await cp(seed, copy, { recursive: true });
    await verifyPackageInventory(copy, entries);
    const retired = await retireCopiedIndependentRuntime(copy, entries);
    assert.equal(retired.packageName, '@aux/runtime');
    assert.equal(retired.files.length, 2);
    const kept = entries.filter(entry => !retired.files.includes(entry));
    await verifyPackageInventory(copy, kept);
    await verifyPackageInventory(seed, entries);
    assert.equal(await readFile(join(copy, 'Contents/Resources/aux/agent-runtime/node'), 'utf8'), 'supplied runtime');
    await assert.rejects(readFile(join(copy, retired.root, 'package.json')), { code: 'ENOENT' });
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('an unrecognized runtime is retained and blocks retirement', async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'aux-package-unknown-runtime-')));
  try {
    const entries = await runtimeFixture(directory, '@other/runtime');
    await assert.rejects(retireCopiedIndependentRuntime(directory, entries), /Unrecognized runtime/);
    await verifyPackageInventory(directory, entries);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('retirement refuses a managed-root symlink without removing its target', async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'aux-package-runtime-link-')));
  try {
    const entries = await runtimeFixture(directory);
    await rm(join(directory, 'Contents/Resources/aux-runtime'), { recursive: true });
    await symlink('aux/agent-runtime', join(directory, 'Contents/Resources/aux-runtime'));
    await assert.rejects(retireCopiedIndependentRuntime(directory, entries), /real copied directory/);
    assert.equal(await readFile(join(directory, 'Contents/Resources/aux/agent-runtime/node'), 'utf8'), 'supplied runtime');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('native package receipt covers resources, modes and contained dependency links', async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'aux-package-inventory-')));
  try {
    await writeFile(join(directory, 'native'), 'immutable native resource');
    await chmod(join(directory, 'native'), 0o755);
    await symlink('native', join(directory, 'link'));
    const entries = [
      { path: 'native', type: 'file', mode: 0o755, sha256: createHash('sha256').update('immutable native resource').digest('hex') },
      { path: 'link', type: 'symlink', mode: 0o755, linkTarget: 'native' },
    ];
    // Symlink mode is platform-specific; receipt records the actual lstat mode.
    const { lstat } = await import('node:fs/promises');
    entries[1].mode = (await lstat(join(directory, 'link'))).mode & 0o777;
    await verifyPackageInventory(directory, entries);
    await writeFile(join(directory, 'unrecorded'), 'extra');
    await assert.rejects(verifyPackageInventory(directory, entries), /Unreported/);
    await rm(join(directory, 'unrecorded'));
    await writeFile(join(directory, 'native'), 'changed');
    await assert.rejects(verifyPackageInventory(directory, entries), /hash\/type mismatch/);
    await rm(join(directory, 'link'));
    await symlink('../outside', join(directory, 'link'));
    await assert.rejects(verifyPackageInventory(directory, entries));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
