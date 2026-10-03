// Controlled filesystem/signature tests only, never native appearance evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, statSync, writeFileSync, appendFileSync, renameSync, symlinkSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { generateKeyPairSync, sign, createHash } from 'node:crypto';
import { createAppearanceFileReader } from './lib/appearance-file-reader.mjs';
function fixture(t) {
  const root = mkdtempSync('/tmp/aux-file-reader-control-'); chmodSync(root, 0o700);
  mkdirSync(join(root, 'profile'), { mode: 0o700 });
  const file = join(root, 'native-appearance-channel.jsonl'); writeFileSync(file, '', { mode: 0o600 });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const pin = path => { const s = statSync(path, { bigint: true }); return [s.dev.toString(), s.ino.toString()]; };
  const [rootDevice, rootInode] = pin(root), [profileDevice, profileInode] = pin(join(root, 'profile')), [fileDevice, fileInode] = pin(file);
  const header = { producer: 'aux-native-appearance-file-channel', version: 1, pid: 42, processUuid: 'a'.repeat(32), processStartMachTicks: '9', buildId: 'controlled-source', sourceCommit: 'a'.repeat(40), nonce: 'b'.repeat(32), basename: 'native-appearance-channel.jsonl', rootDevice, rootInode, profileName: 'Default', profileDevice, profileInode, fileDevice, fileInode, publicKeySpkiHex: publicKey.export({ type: 'spki', format: 'der' }).toString('hex') };
  const bytes = Buffer.from(JSON.stringify(header) + '\n'); writeFileSync(file, bytes);
  const capabilityReceipt = { ...header, headerSha256: createHash('sha256').update(bytes).digest('hex') };
  const frame = (sequence = 1) => {
    const payload = JSON.stringify({ producer: 'aux-native-appearance-file-record', version: 1, nonce: header.nonce, sequence, raw: '{"controlled":true}' });
    return JSON.stringify({ payload, signatureHex: sign(null, Buffer.from(`AUX_NATIVE_APPEARANCE_FILE_V1\n${payload}`), privateKey).toString('hex') }) + '\n';
  };
  const make = options => {
    const reader = createAppearanceFileReader({ root, capabilityReceipt, validateOriginal() {}, ...options }); t.after(() => reader.retire()); return reader;
  };
  return { root, file, make, frame };
}
test('retained original file reads incremental signed bytes without rereading prior records', async t => {
  const f = fixture(t), reader = f.make(); assert.deepEqual(await reader.read(), []);
  appendFileSync(f.file, f.frame()); assert.equal((await reader.read())[0].sequence, 1); assert.deepEqual(await reader.read(), []);
  appendFileSync(f.file, f.frame(2)); assert.equal((await reader.read())[0].sequence, 2);
});
test('replacement, symlink, truncation and mode changes permanently refuse', async t => {
  for (const kind of ['replacement', 'symlink', 'truncation', 'mode']) {
    const f = fixture(t), reader = f.make(); await reader.read();
    if (kind === 'truncation') writeFileSync(f.file, '');
    else if (kind === 'mode') chmodSync(f.file, 0o644);
    else { renameSync(f.file, f.file + '.original'); if (kind === 'symlink') symlinkSync(f.file + '.original', f.file); else writeFileSync(f.file, '', { mode: 0o600 }); }
    await assert.rejects(reader.read()); await assert.rejects(reader.read());
  }
});
test('retired original owner during awaited revalidation cannot return records', async t => {
  const f = fixture(t); let active = true, release;
  const held = new Promise(resolve => { release = resolve; });
  const reader = f.make({ validateOriginal() { assert.ok(active, 'Owner retired'); }, revalidateOriginal: () => held });
  appendFileSync(f.file, f.frame()); const reading = reader.read(); active = false; release(); await assert.rejects(reading, /Owner retired/);
});
test('one original read reserves synchronously and retirement invalidates held read', async t => {
  const f = fixture(t); let release; const held = new Promise(resolve => { release = resolve; });
  const reader = f.make({ revalidateOriginal: () => held }); const reading = reader.read();
  await assert.rejects(reader.read(), /Concurrent/); reader.retire(); release(); await assert.rejects(reading, /retired/);
});
test('foreign signing bytes refuse despite unchanged original file inode', async t => {
  const f = fixture(t), reader = f.make(); appendFileSync(f.file, f.frame().replace(/signatureHex":"[a-f0-9]+/, 'signatureHex":"' + '0'.repeat(128)));
  await assert.rejects(reader.read(), /signature invalid/);
});
