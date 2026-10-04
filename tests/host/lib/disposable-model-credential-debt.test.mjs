import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DisposableModelCredentialDebt } from './disposable-model-credential-debt.mjs';
const owner = () => ({ grant: 'a'.repeat(64), profile: 'b'.repeat(64), host: 'c'.repeat(64), generation: 1 });
const witness = 'd'.repeat(64), ref = Buffer.from('original-fixed-ref').toString('base64');
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
function setup() {
  const original = owner(); let current = true, item = { kind: 'absent' }, removed = [];
  const backend = { async observeFixedOriginal() { return item; }, async removeFixedOriginal(original) { removed.push(original); item = { kind: 'absent' }; } };
  const ledger = new DisposableModelCredentialDebt(original, () => current, backend);
  return { ledger, original, backend, removed, setItem(value) { item = value; }, retire() { current = false; }, revive() { current = true; } };
}
async function saved(t, ack = true) {
  await t.ledger.arm(t.original);
  t.ledger.retainWriteIntent({ ...t.original, creationWitness: witness });
  t.setItem({ kind: 'original', creationWitness: witness, persistentReference: ref });
  if (ack) t.ledger.retainSavedReference({ ...t.original, creationWitness: witness, persistentReference: ref });
  t.ledger.browserRetired(t.original);
}
test('intent is retained before write and genuine browser retirement preserves cleanup ownership', async () => {
  const t = setup(); await saved(t);
  assert.equal(t.ledger.receipt.cleanupDebt, true);
  const result = await t.ledger.cleanup();
  assert.equal(result.state, 'removed'); assert.equal(result.cleanupDebt, false);
  assert.deepEqual(t.removed, [{ creationWitness: witness, persistentReference: ref }]);
  assert.throws(() => t.ledger.retainWriteIntent({ ...t.original, creationWitness: witness }));
});
test('lost saved ACK recovers only original creation witness and actual persistent reference', async () => {
  const t = setup(); await saved(t, false);
  assert.equal((await t.ledger.cleanup()).state, 'removed'); assert.equal(t.removed.length, 1);
});
test('existing foreign item cannot arm or create write intent', async () => {
  const t = setup(); t.setItem({ kind: 'foreign' });
  await assert.rejects(t.ledger.arm(t.original));
  assert.throws(() => t.ledger.retainWriteIntent({ ...t.original, creationWitness: witness }));
  assert.equal(t.removed.length, 0); assert.equal(t.ledger.receipt.cleanupDebt, false);
});
test('foreign generation, witness or replacement reference retains debt without deletion', async () => {
  for (const changed of [{ creationWitness: 'e'.repeat(64), persistentReference: ref },
    { creationWitness: witness, persistentReference: Buffer.from('replacement').toString('base64') }]) {
    const t = setup(); await saved(t); t.setItem({ kind: 'original', ...changed });
    await assert.rejects(t.ledger.cleanup()); assert.equal(t.removed.length, 0); assert.equal(t.ledger.receipt.cleanupDebt, true);
    assert.throws(() => t.ledger.browserRetired({ ...t.original, generation: 2 }));
  }
});
test('held cleanup owner retirement is permanent and cannot be revived', async () => {
  const t = setup(); await saved(t); const held = deferred(); t.backend.observeFixedOriginal = () => held.promise;
  const pending = t.ledger.cleanup(); t.retire(); held.resolve({ kind: 'original', creationWitness: witness, persistentReference: ref });
  await assert.rejects(pending); t.revive(); assert.throws(() => t.ledger.cleanup());
  assert.equal(t.removed.length, 0); assert.equal(t.ledger.receipt.cleanupDebt, true);
});
test('locked removal rejection remains original failure and debt, retry uses original scope', async () => {
  const t = setup(); await saved(t); const locked = new Error('synthetic locked Security');
  const original = t.backend.removeFixedOriginal; t.backend.removeFixedOriginal = () => Promise.reject(locked);
  await assert.rejects(t.ledger.cleanup(), error => error === locked);
  assert.equal(t.ledger.receipt.cleanupDebt, true);
  t.backend.removeFixedOriginal = original; assert.equal((await t.ledger.cleanup()).cleanupDebt, false);
});
test('unconfirmed deletion never reports removed and repeated retirement cannot refresh authority', async () => {
  const t = setup(); await saved(t); t.backend.removeFixedOriginal = async () => {};
  await assert.rejects(t.ledger.cleanup()); assert.equal(t.ledger.receipt.cleanupDebt, true);
  t.ledger.browserRetired(t.original); assert.equal(t.ledger.receipt.state, 'cleanup');
});
