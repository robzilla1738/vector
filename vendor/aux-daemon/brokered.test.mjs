import assert from 'node:assert/strict';
import test from 'node:test';
import {brokered} from './tools/common.mjs';

const settled = [];
const boundary = {awaited: work => work().then(value => { settled.push('fulfilled'); return value; }, error => { settled.push('rejected'); throw error; })};

test('a failed write keeps broker custody known and still reaches the caller', async () => {
  await assert.rejects(brokered(boundary, async () => { throw Error('ENOSPC'); }), /ENOSPC/);
  assert.equal(await brokered(boundary, async () => 'written'), 'written');
  assert.deepEqual(settled, ['fulfilled', 'fulfilled'], 'the native host never sees a rejection');
});
