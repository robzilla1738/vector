// Controlled original child/await controls, no app, artifact admission or native launch.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { createPrivateObservationOwner } from './lib/private-observation-owner.mjs';
function fixture() {
  const child = Object.assign(new EventEmitter(), { pid: 123, exitCode: null, signalCode: null });
  const native = { sourceCommit: 'a'.repeat(40), buildId: '195+' + 'b'.repeat(64) + '+' + 'a'.repeat(40), manifestHash: 'b'.repeat(64) };
  const receipt = { native, runtimeStatus: 'inactive-private', window: { pid: 123, windowKind: 'private' } };
  const state = { valid: true, validations: 0, disposals: 0 };
  let resolveRead, rejectRead;
  const read = () => new Promise((resolve, reject) => { resolveRead = resolve; rejectRead = reject; });
  const pair = { native, validate() { state.validations++; assert.equal(state.valid, true, 'Original artifact replaced'); } };
  const stream = { discover: read, observe: read, dispose() { state.disposals++; rejectRead?.(new Error('Original stream retired')); } };
  const owner = createPrivateObservationOwner({ child, generation: 1, pair, stream });
  return { child, receipt, state, owner, resolve() { resolveRead(receipt); } };
}
test('original live receipt rechecks held pair on both sides of the actual await', async () => {
  const f = fixture(), pending = f.owner.discover(); f.resolve();
  assert.deepEqual(await pending, f.receipt); assert.equal(f.state.validations, 3);
  assert.throws(() => f.owner.discover({ pid: 123 }), /no selectors/);
});
test('exit status gap, artifact replacement and explicit retirement refuse before receipt delivery', async () => {
  for (const change of [f => { f.child.exitCode = 0; }, f => { f.child.signalCode = 'SIGTERM'; },
    f => { f.state.valid = false; }, f => { f.owner.retire(new Error('Cancelled original owner')); }]) {
    const f = fixture(), pending = f.owner.discover(); f.resolve(); change(f);
    await assert.rejects(pending);
  }
});
test('retirement does not fabricate close/reap; original code and signal survive actual close', async () => {
  const f = fixture(); f.owner.retire(new Error('Cancelled original owner'));
  assert.equal(f.owner.closeReceipt, undefined);
  f.child.exitCode = null; f.child.signalCode = 'SIGTERM'; f.child.emit('close', null, 'SIGTERM');
  assert.deepEqual(await f.owner.closed, { pid: 123, generation: 1, code: null, signal: 'SIGTERM' });
  assert.equal(f.state.disposals, 1); assert.throws(f.owner.assertLive, /Cancelled/);
});
test('actual child error retires pending observation but close debt remains until original close', async () => {
  const f = fixture(), pending = f.owner.discover();
  f.child.emit('error', new Error('Original child transport failure'));
  await assert.rejects(pending, /retired/); assert.equal(f.owner.closeReceipt, undefined);
  f.child.emit('close', -1, null); assert.equal((await f.owner.closed).code, -1);
});
test('foreign native or PID receipt cannot escape original child observation', async () => {
  for (const change of [f => { f.receipt.window.pid++; }, f => { f.receipt.native = { ...f.receipt.native, buildId: 'foreign' }; }]) {
    const f = fixture(), pending = f.owner.discover(); change(f); f.resolve(); await assert.rejects(pending);
  }
});
