import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { bindOriginalCredentialBrowser } from './disposable-model-credential-browser-channel.mjs';
const turn = () => new Promise(resolve => setImmediate(resolve));
function fixture() {
  const child = new EventEmitter(), channel = new EventEmitter(), sent = [], calls = [];
  child.pid = 123; child.stdio = [null, null, null, channel]; channel.write = line => sent.push(line.trimEnd());
  let current = true, debt = false, release;
  const held = new Promise(resolve => { release = resolve; });
  const guardian = { reservation: 'c'.repeat(64), endpoint: 'http://127.0.0.1:3210/v1', acquiredMach: '123456789', bindOriginalProfileAlias: async alias => { calls.push(['profile', alias]); }, helperPid: 456, originalClose: Promise.resolve({ helperPid: 456, code: 0, signal: null, completed: true, cleanupDebt: false }), arm: async () => { calls.push('absence'); }, retainIntent: async witness => { debt = true; calls.push(['intent', witness]); await held; },
    retainSaved: async (witness, ref) => { calls.push(['saved', witness, ref]); },
    retireOriginalBrowser: async () => { calls.push('retire'); }, cleanup: async () => { calls.push('cleanup'); debt = false; },
    finish: async () => { calls.push('finish'); return { status: 'FINAL' }; }, get receipt() { return { cleanupDebt: debt }; } };
  const owner = bindOriginalCredentialBrowser({ child, guardian, currentOriginal: () => current, deadline: performance.now() + 5000 });
  const nonce = sent[0].split('|')[1], identity = 'A'.repeat(32) + '|1';
  return { child, channel, sent, calls, owner, nonce, identity, release, retire: () => { current = false; } };
}
test('fixed original child only receives witness after retained guardian intent ACK', async () => {
  const f = fixture(); f.channel.emit('data', Buffer.from(`ACQUIRE|${f.nonce}|${f.identity}|tmp|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}\n`)); await turn();
  assert.equal(f.sent.length, 1); assert.equal(f.owner.receipt.pending, true); assert.deepEqual(f.calls[0], ['profile', 'tmp']); assert.equal(f.calls[1], 'absence');
  f.release(); await turn(); assert.equal(f.sent.length, 2); const witness = f.sent[1].split('|')[4];
  assert.equal(witness, f.calls[2][1]); assert.equal(f.owner.receipt.pending, false);
  f.channel.emit('data', Buffer.from(`SAVED|${f.nonce}|${f.identity}|${witness}|AQ==\n`)); await turn();
  assert.deepEqual(f.calls[3], ['saved', witness, 'AQ==']); assert.equal(f.sent[2], `RETAINED|${f.nonce}|${f.identity}`);
});
test('retirement during held intent never emits grant and actual original close retains cleanup', async () => {
  const f = fixture(); f.channel.emit('data', Buffer.from(`ACQUIRE|${f.nonce}|${f.identity}|tmp|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}\n`)); await turn();
  f.retire(); f.release(); await turn(); assert.equal(f.sent.length, 1); assert.equal(f.owner.receipt.retired, true);
  let done = false; const cleanup = f.owner.retireAfterOriginalClose().then(value => { done = true; return value; }); await turn();
  assert.equal(done, false); assert.equal(f.calls.includes('retire'), false);
  f.child.emit('close', 0, null); const receipt = await cleanup;
  assert.deepEqual(f.calls.slice(-3), ['retire', 'cleanup', 'finish']); assert.equal(receipt.browser.originalPid, 123);
});
test('duplicate/foreign/replacement host and malformed operations refuse without further Security producer', async () => {
  for (const operation of ['UNKNOWN', 'foreign', 'duplicate']) {
    const f = fixture();
    if (operation === 'duplicate') { f.channel.emit('data', Buffer.from(`ACQUIRE|${f.nonce}|${f.identity}|tmp|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}\n`)); await turn(); f.release(); await turn(); }
    const line = operation === 'foreign' ? `ACQUIRE|${'b'.repeat(64)}|${f.identity}|tmp|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}` : `${operation === 'duplicate' ? 'ACQUIRE' : 'UNKNOWN'}|${f.nonce}|${f.identity}|tmp|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}`;
    f.channel.emit('data', Buffer.from(line + '\n')); await turn(); assert.equal(f.owner.receipt.retired, true);
    assert.equal(f.calls.filter(value => value === 'absence').length, operation === 'duplicate' ? 1 : 0);
  }
});

test('original Mach acquisition is transferred verbatim, never browser bind time', () => {
  const f = fixture();
  assert.equal(f.sent[0], `GRANT|${f.nonce}|123|123456789|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}`);
});
test('unknown profile alias cannot arm original guardian', async () => {
  const f = fixture();
  f.channel.emit('data', Buffer.from(`ACQUIRE|${f.nonce}|${f.identity}|foreign|${'c'.repeat(64)}|${Buffer.from('http://127.0.0.1:3210/v1').toString('base64')}\n`)); await turn();
  assert.equal(f.owner.receipt.retired, true); assert.deepEqual(f.calls, []);
});
