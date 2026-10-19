import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyPackageInventory } from './provided-package.mjs';

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
