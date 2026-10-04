import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { retainNativeSlotForCredentialGrant, readNativeSlotForCredentialGrant } from './disposable-model-credential-slot.mjs';
const originalToken = '12345678-1234-1234-1234-123456789012';
function sourceFixture() {
  const directory = fs.mkdtempSync(join(tmpdir(), 'aux-credential-slot-control-')); fs.chmodSync(directory, 0o700);
  const filename = join(directory, 'owner.json');
  const raw = JSON.stringify({ pid: 123, token: originalToken, startedAt: 1 }); fs.writeFileSync(filename, raw, { mode: 0o600 });
  const module = fs.readFileSync(new URL('./disposable-model-credential-slot.mjs', import.meta.url), 'utf8')
    .replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '');
  const names = ['assert', 'constants', 'openSync', 'closeSync', 'fstatSync', 'lstatSync', 'readSync', 'join', 'nativeSlotPath', 'process'];
  const build = new Function(...names, module + '\nreturn {retainNativeSlotForCredentialGrant,readNativeSlotForCredentialGrant};');
  const functions = build(assert, fs.constants, fs.openSync, fs.closeSync, fs.fstatSync, fs.lstatSync, fs.readSync, join, directory,
    { getuid: process.getuid.bind(process), kill(pid, signal) { assert.equal(pid, 123); assert.equal(signal, 0); } });
  const leases = [];
  return { ...functions, directory, filename, raw,
    retain(token = originalToken) { const lease = functions.retainNativeSlotForCredentialGrant({ token }); leases.push(lease); return lease; },
    dispose() { for (const lease of leases) for (const fd of [lease.directoryFd, lease.ownerFd]) try { fs.closeSync(fd); } catch (error) { if (error.code !== 'EBADF') throw error; } fs.rmSync(directory, { recursive: true }); },
  };
}
test('production reader refuses unbranded slot labels without opening or adopting a slot', () => {
  assert.throws(() => readNativeSlotForCredentialGrant({ directoryFd: 7, ownerFd: 8, validate() {} }));
  assert.equal(typeof retainNativeSlotForCredentialGrant, 'function');
});
test('actual retained source producer pins original directory/file/bytes and exposes no token', () => {
  const t = sourceFixture(); try {
    const lease = t.retain(); assert.equal(t.readNativeSlotForCredentialGrant(lease), lease); lease.validate();
    assert.equal(lease.receipt.ownerPid, 123); assert.equal('token' in lease.receipt, false); lease.release(); assert.throws(() => lease.validate());
  } finally { t.dispose(); }
});
test('foreign token and duplicate producer keys cannot acquire slot FDs', () => {
  const t = sourceFixture(); try {
    assert.throws(() => t.retain('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'));
    fs.writeFileSync(t.filename, t.raw.replace('"pid":123', '"pid":123,"pid":123'));
    assert.throws(() => t.retain());
  } finally { t.dispose(); }
});
test('owner replacement and ABA restoration permanently retire original held lease', () => {
  const t = sourceFixture(); try {
    const lease = t.retain(), old = join(t.directory, 'original-owner'); fs.renameSync(t.filename, old); fs.writeFileSync(t.filename, t.raw, { mode: 0o600 });
    assert.throws(() => lease.validate()); fs.unlinkSync(t.filename); fs.renameSync(old, t.filename);
    assert.throws(() => lease.validate()); assert.throws(() => lease.release());
    assert.equal(fs.readFileSync(t.filename, 'utf8'), t.raw);
  } finally { t.dispose(); }
});
test('same-inode owner mutation or quarantine refuses without removing original files', () => {
  for (const mutation of ['bytes', 'quarantine']) {
    const t = sourceFixture(); try {
      const lease = t.retain();
      if (mutation === 'bytes') fs.writeFileSync(t.filename, t.raw.replace('"startedAt":1', '"startedAt":2'));
      else fs.writeFileSync(join(t.directory, 'quarantine.json'), '{}', { mode: 0o600 });
      assert.throws(() => lease.validate()); assert.throws(() => lease.release()); assert.ok(fs.existsSync(t.filename));
    } finally { t.dispose(); }
  }
});
