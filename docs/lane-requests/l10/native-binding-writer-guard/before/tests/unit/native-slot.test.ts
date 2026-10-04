import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';
import { acquireNativeSlot, withNativeSlot, assertNativeSlotOwned } from '../../scripts/native-slot.mjs';

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

it('recognizes a symlinked CLI entrypoint without treating an imported module as a command', () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-native-slot-entry-'));
  const entry = join(root, 'native-slot.mjs');
  try {
    symlinkSync(fileURLToPath(new URL('../../scripts/native-slot.mjs', import.meta.url)), entry);
    for (const flags of [[], ['--preserve-symlinks-main']]) {
      const cli = spawnSync(process.execPath, [...flags, entry], { encoding: 'utf8', timeout: 5_000 });
      expect(cli.error).toBeUndefined();
      expect(cli.status).toBe(1);
      expect(cli.stderr).toContain('Usage: node scripts/native-slot.mjs');
    }
    const wrapper = join(root, 'import-slot.mjs');
    writeFileSync(wrapper, `await import(${JSON.stringify(entry)});`);
    for (const argv of [[wrapper], ['--input-type=module', '-e',
      'await import(process.argv[2])', 'unused-module-argument', entry]]) {
      const imported = spawnSync(process.execPath, argv, { encoding: 'utf8', timeout: 5_000 });
      expect(imported.error).toBeUndefined();
      expect(imported.status).toBe(0);
      expect(imported.stdout).toBe('');
      expect(imported.stderr).toBe('');
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});


it('refuses unowned, dead and replaced native writers without taking or changing a slot', async () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-native-writer-'));
  const path = join(root, 'slot');
  try {
    expect(() => assertNativeSlotOwned({ path })).toThrow();
    const slot = await acquireNativeSlot({ path });
    const original = assertNativeSlotOwned({ path, token: slot.token });
    expect(original.pid).toBe(process.pid);
    expect(() => assertNativeSlotOwned({ path, token: 'foreign' })).toThrow('original live slot');
    expect(() => assertNativeSlotOwned({ path, token: '', expectedOwner: original })).toThrow('original live slot');
    writeFileSync(join(path, 'owner.json'), JSON.stringify({ pid: 2147483647, token: slot.token }));
    expect(() => assertNativeSlotOwned({ path, token: slot.token })).toThrow('original live slot');
    writeFileSync(join(path, 'owner.json'), JSON.stringify({ pid: process.pid, token: 'replacement' }));
    expect(() => assertNativeSlotOwned({ path, token: 'replacement', expectedOwner: original })).toThrow('original live slot');
    writeFileSync(join(path, 'owner.json'), JSON.stringify({ pid: process.pid, token: slot.token }));
    expect(assertNativeSlotOwned({ path, token: slot.token, expectedOwner: original })).toEqual(original);
    slot.release();
    expect(() => assertNativeSlotOwned({ path, token: slot.token, expectedOwner: original })).toThrow();
  } finally { rmSync(root, { recursive: true, force: true }); }
});
