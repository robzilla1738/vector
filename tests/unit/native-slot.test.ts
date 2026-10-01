import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';
import { acquireNativeSlot, withNativeSlot } from '../../scripts/native-slot.mjs';

it('serializes native work and releases the slot after a failed operation', async () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-native-slot-'));
  const path = join(root, 'slot');
  try {
    const first = await acquireNativeSlot({ path });
    await expect(acquireNativeSlot({ path, timeoutMs: 0 })).rejects.toThrow(/Timed out/);
    first.release();
    await expect(withNativeSlot(() => { throw new Error('build failed'); }, { path })).rejects.toThrow('build failed');
    const next = await acquireNativeSlot({ path });
    next.release();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('reclaims a dead owner while refusing a malformed owner', async () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-native-slot-'));
  const path = join(root, 'slot');
  try {
    mkdirSync(path);
    writeFileSync(join(path, 'owner.json'), JSON.stringify({ pid: 2147483647, token: 'dead' }));
    const slot = await acquireNativeSlot({ path });
    slot.release();
    mkdirSync(path);
    writeFileSync(join(path, 'owner.json'), '{}');
    await expect(acquireNativeSlot({ path })).rejects.toThrow('Invalid native slot owner');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('times out if a crashed reclaimer still holds the reclamation lock', async () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-native-slot-'));
  const path = join(root, 'slot');
  try {
    mkdirSync(path);
    writeFileSync(join(path, 'owner.json'), JSON.stringify({ pid: 2147483647, token: 'dead' }));
    mkdirSync(`${path}.reclaim`);
    await expect(acquireNativeSlot({ path, timeoutMs: 20 })).rejects.toThrow(/Timed out/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
