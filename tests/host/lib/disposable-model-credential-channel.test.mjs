import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeOriginalCredentialGuardianResponse as decode } from './disposable-model-credential-channel.mjs';
const original = { nonce: 'a'.repeat(64), helperPid: 17, profileIdentity: { dev: 12, ino: 34 }, creationWitness: 'b'.repeat(64) };
test('fixed channel retains original exact raw record and original helper/Profile tuple', () => {
  const raw = `READY|${original.nonce}|17|12|34|123456789`;
  assert.deepEqual(decode(raw, original), { status: 'READY', raw, acquiredMach: '123456789' });
  for (const raw of [`READY|${original.nonce}|18|12|34|123456789`, `READY|${original.nonce}|17|12|35|123456789`, `READY|${'c'.repeat(64)}|17|12|34|123456789`]) assert.throws(() => decode(raw, original));
});
test('intent acknowledgment binds actual original creation witness and fixed operation', () => {
  assert.equal(decode(`INTENT-RETAINED|${original.nonce}|${original.creationWitness}`, original).status, 'INTENT-RETAINED');
  assert.throws(() => decode(`INTENT-RETAINED|${original.nonce}|${'c'.repeat(64)}`, original));
  for (const status of ['ABSENT', 'SAVED-RETAINED', 'BROWSER-RETIRED', 'REMOVED']) assert.equal(decode(`${status}|${original.nonce}`, original).status, status);
});
test('closed channel refuses unknown/extra/oversize fields and forged final cleanup', () => {
  for (const raw of [`FINAL|${original.nonce}|saved`, `READY|${original.nonce}|017|12|34`, `REMOVED|${original.nonce}|extra`, `readSecret|${original.nonce}`, `REMOVED|${original.nonce}\n`, 'x'.repeat(4097)]) assert.throws(() => decode(raw, original));
  assert.equal(decode(`FINAL|${original.nonce}|absent`, original).status, 'FINAL');
});

// Execute the actual factory body with source-only imported producer doubles.
// No helper/process/Keychain operation occurs; this does not brand a real pair.
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
function factoryFixture() {
  const module = readFileSync(new URL('./disposable-model-credential-channel.mjs', import.meta.url), 'utf8')
    .replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '');
  const pair = {}, slot = 'original-slot';
  const child = new EventEmitter(), channel = new EventEmitter(); child.pid = 17; child.stdio = [null, null, null, channel];
  const writes = [], spawned = [], cleared = [];
  let now = 0, generation = 1, timer, nonce, held = false;
  const directory = { dev: 12, ino: 34, uid: process.getuid(), mode: 0o40700, isDirectory: () => true };
  const admitted = { compilerArtifact: {}, validate() { assert.equal(generation, 1); } };
  channel.write = (raw, done) => {
    writes.push(raw); const fields = raw.trimEnd().split('|'); nonce = fields[1]; done();
    if (!held) queueMicrotask(() => channel.emit('data', Buffer.from(fields[0] === 'HELLO'
      ? `READY|${nonce}|17|12|34|123456789\n` : `${fields[0] === 'PROFILE' ? 'PROFILE-BOUND' : fields[0] === 'ARM' ? 'ABSENT' : fields[0] === 'INTENT' ? 'INTENT-RETAINED' : fields[0]}|${nonce}${fields[0] === 'INTENT' ? '|' + fields[2] : ''}\n`)));
  };
  const build = new Function('readDisposableModelCredentialEndpoint', 'awaitOriginalCredentialClose', 'assert', 'randomBytes', 'fstatSync', 'spawn', 'fileURLToPath', 'readPackagedRuntimePair', 'readNativeWindowCompilerExecutable', 'performance', 'setTimeout', 'clearTimeout', 'process', 'readNativeSlotForCredentialGrant',
    module.replace("new URL('../native-window.swift', import.meta.url)", "new URL('file:///owned/native-window.swift')") + '\nreturn startOriginalCredentialGuardian;');
  const start = build(() => ({ reservation: 'c'.repeat(64), endpoint: 'http://127.0.0.1:3210/v1' }), async close => close, assert, () => Buffer.alloc(32, 1), () => directory,
    (...args) => { spawned.push(args); return child; }, value => value.pathname,
    candidate => { assert.equal(candidate, pair); return admitted; },
    (artifact, source) => { assert.equal(artifact, admitted.compilerArtifact); assert.equal(source, '/owned/native-window.swift'); return '/original/admitted-helper'; },
    { now: () => now }, callback => { timer = callback; return 23; }, value => cleared.push(value), process, lease => { lease.validate(); return lease; });
  return { start: () => start({ pair, directoryFds: [4, 5, 6], originalSlotToken: slot, originalSlotLease: { directoryFd: 7, ownerFd: 8, validate() {} }, currentOriginal: () => generation === 1 }),
    writes, spawned, child, channel, setHeld(value) { held = value; }, expire() { now = 150_000; timer(); }, replace() { generation = 2; } };
}
test('actual factory reserves original admitted helper and descriptor inheritance; refuses replacement before issuing', async () => {
  const t = factoryFixture(), lease = await t.start();
  assert.deepEqual(t.spawned[0][0], '/original/admitted-helper');
  assert.deepEqual(t.spawned[0][1], ['credential-guardian']);
  assert.deepEqual(t.spawned[0][2].stdio, ['ignore', 'ignore', 'pipe', 'pipe', 4, 5, 6, 7, 8]);
  await lease.bindOriginalProfileAlias('tmp'); await lease.arm(); t.replace(); const before = t.writes.length;
  assert.throws(() => lease.retainIntent('b'.repeat(64))); assert.equal(t.writes.length, before);
  assert.equal(lease.receipt.cleanupDebt, false);
});
test('held intent deadline retains original helper/channel/pending and debt; late ACK cannot rearm', async () => {
  const t = factoryFixture(), lease = await t.start(); await lease.bindOriginalProfileAlias('tmp'); await lease.arm(); t.setHeld(true);
  const original = lease.retainIntent('b'.repeat(64)); const rejected = assert.rejects(original);
  t.expire(); await rejected;
  assert.equal(lease.receipt.pending, true); assert.equal(lease.receipt.cleanupDebt, true);
  assert.equal(lease.helperPid, 17); assert.equal(t.spawned.length, 1);
  const fields = t.writes.at(-1).trim().split('|');
  t.channel.emit('data', Buffer.from(`INTENT-RETAINED|${fields[1]}|${fields[2]}\n`));
  assert.equal(lease.receipt.pending, false); assert.equal(lease.receipt.cleanupDebt, true);
  assert.throws(() => lease.retainIntent('c'.repeat(64))); assert.equal(t.spawned.length, 1);
});

test('original guardian Mach receipt refuses zero, padded and overflow transfer', () => {
  for (const mach of ['0', '01', '18446744073709551616', '1.0', '-1']) {
    assert.throws(() => decode(`READY|${original.nonce}|17|12|34|${mach}`, original));
  }
});
test('actual guardian source protocol binds native alias before ARM once', async () => {
  const f = factoryFixture(); const owner = await f.start();
  assert.equal(owner.acquiredMach, '123456789');
  const result = await owner.bindOriginalProfileAlias('tmp');
  assert.equal(result.status, 'PROFILE-BOUND');
  assert.throws(() => owner.bindOriginalProfileAlias('private-tmp'));
  assert.throws(() => owner.bindOriginalProfileAlias('foreign'));
});
