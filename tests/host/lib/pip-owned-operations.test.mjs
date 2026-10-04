import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPipOwnedOperations } from './pip-owned-operations.mjs';

test('expired original interval never starts even a cleanup read', async () => {
  let calls = 0;
  const operations = createPipOwnedOperations({}, () => Date.now() - 1);
  await assert.rejects(operations.bounded(() => { calls++; }), /deadline/);
  assert.equal(calls, 0); assert.equal(operations.retained().length, 0);
});
test('expiry between reservation and original producer microtask never issues', async () => {
  let calls = 0; const now = Date.now; let clock = now();
  Date.now = () => clock;
  try {
    const operations = createPipOwnedOperations({}, () => clock + 1);
    const result = operations.bounded(() => { calls++; }); clock += 2;
    await assert.rejects(result, /deadline/); assert.equal(calls, 0); assert.equal(operations.retained().length, 0);
  } finally { Date.now = now; }
});
test('timed-out pre-ACK open retains original App/helper/mailbox/child and late actual page ACK', async () => {
  const owners = { app: {}, ax: {}, mailbox: {}, originalChild: { pid: 4, generation: 2 } };
  let resolve, calls = 0;
  const operations = createPipOwnedOperations(owners, () => Date.now() + 10);
  const completion = operations.bounded(() => { calls++; return new Promise(done => { resolve = done; }); });
  await assert.rejects(completion, /deadline/); assert.equal(calls, 1);
  const debt = operations.retained(); assert.equal(debt.length, 1); assert.equal(debt[0].originalOwners, owners); assert.equal(debt[0].pending, true);
  const actualOriginalAck = { pageId: 'original-late-page' }; resolve(actualOriginalAck);
  await debt[0].promise; await Promise.resolve();
  assert.equal(debt[0].result, actualOriginalAck); assert.equal(debt[0].pending, false); assert.equal(operations.retained()[0], debt[0]);
});
test('successful original operation retires its reservation and preserves ACK/rejection objects', async () => {
  const operations = createPipOwnedOperations({}, () => Date.now() + 1000);
  const ack = {}; assert.equal(await operations.bounded(() => ack), ack);
  const reason = new Error('actual original producer failure');
  await assert.rejects(operations.bounded(() => { throw reason; }), error => error === reason);
  assert.deepEqual(operations.retained(), []);
});
