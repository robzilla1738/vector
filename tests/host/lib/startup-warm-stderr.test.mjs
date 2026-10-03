import test from 'node:test';
import assert from 'node:assert/strict';
import { createWarmStderrRelay } from './startup-warm-stderr.mjs';
// Controlled byte/lifecycle fixtures only. No helper, browser or native operation.
const launch = () => ({ record: { kind: 'stock', browserPid: 100 }, receiptSha256: 'a'.repeat(64) });
function fixture() {
  const writes = [], refusals = [];
  return { writes, refusals, mailbox: { write(bytes, scope) { writes.push([Buffer.from(bytes), scope]); }, dispose(error) { refusals.push(error); } } };
}
test('buffers original bytes then feeds exact original browser generation once', () => {
  const relay = createWarmStderrRelay('stock'), f = fixture(), bytes = Buffer.from('native cold\n');
  relay.push(bytes); bytes.fill(0); relay.attach(launch(), f.mailbox, 7);
  relay.push(Buffer.from('native warm\n')); relay.assertLive();
  assert.deepEqual(f.writes.map(([v]) => v.toString()), ['native cold\n', 'native warm\n']);
  assert.deepEqual(f.writes.map(([, s]) => s), [{ pid: 100, generation: 7 }, { pid: 100, generation: 7 }]);
  assert.ok(Object.isFrozen(f.writes[0][1]));
});
test('refuses replacing the original attached mailbox even with the same PID', () => {
  const relay = createWarmStderrRelay('stock'), a = fixture(), b = fixture(); relay.attach(launch(), a.mailbox, 1);
  assert.throws(() => relay.attach(launch(), b.mailbox, 2)); assert.throws(() => relay.assertLive());
  assert.equal(a.refusals.length, 1); assert.equal(b.refusals.length, 1);
});
for (const [name, mutate] of [['foreign kind', v => { v.record.kind = 'aux'; }], ['missing original PID', v => { delete v.record.browserPid; }], ['missing raw receipt hash', v => { delete v.receiptSha256; }]])
  test(`refuses ${name} before flushing buffered bytes`, () => {
    const relay = createWarmStderrRelay('stock'), f = fixture(), v = launch(); relay.push(Buffer.from('held')); mutate(v);
    assert.throws(() => relay.attach(v, f.mailbox, 1)); assert.equal(f.writes.length, 0); assert.throws(() => relay.assertLive());
  });
test('pre-admission overflow remains refused after attempted attach', () => {
  const relay = createWarmStderrRelay('stock'), f = fixture();
  assert.throws(() => relay.push(Buffer.alloc(2 * 1024 * 1024 + 1, 65)));
  assert.throws(() => relay.attach(launch(), f.mailbox, 1)); assert.equal(f.writes.length, 0);
});
test('post-admission invalid bytes dispose pending mailbox and preserve first failure', () => {
  const relay = createWarmStderrRelay('stock'), f = fixture(); relay.attach(launch(), f.mailbox, 1);
  let original; try { relay.push(Buffer.from([0])); } catch (e) { original = e; }
  assert.ok(original); assert.throws(() => relay.assertLive(), e => e === original);
  assert.equal(f.refusals[0], original); assert.throws(() => relay.push(Buffer.from('late')), e => e === original);
});
test('mailbox reader callback failure retires original transport', () => {
  const relay = createWarmStderrRelay('stock'), error = new Error('original callback failed'), f = fixture();
  f.mailbox.write = () => { throw error; }; relay.push(Buffer.from('buffered'));
  assert.throws(() => relay.attach(launch(), f.mailbox, 1), e => e === error); assert.throws(() => relay.assertLive(), e => e === error);
});
test('close retires pending transport and cannot attach or forward again', () => {
  const relay = createWarmStderrRelay('stock'), f = fixture(); relay.attach(launch(), f.mailbox, 1);
  relay.retire(); relay.retire(); assert.equal(f.refusals.length, 1);
  assert.throws(() => relay.push(Buffer.from('late'))); assert.throws(() => relay.assertLive());
});

test('Aux uses the same bounded original relay but cannot accept Stock kind', () => {
  const relay = createWarmStderrRelay('aux'), f = fixture(), v = launch();
  assert.throws(() => relay.attach(v, f.mailbox, 1)); assert.equal(f.writes.length, 0);
  const admitted = createWarmStderrRelay('aux'); v.record.kind = 'aux'; admitted.attach(v, f.mailbox, 1);
  admitted.push(Buffer.from('original Aux')); assert.equal(f.writes.length, 1);
});
test('unknown kind never creates a private transport', () => assert.throws(() => createWarmStderrRelay('private')));
