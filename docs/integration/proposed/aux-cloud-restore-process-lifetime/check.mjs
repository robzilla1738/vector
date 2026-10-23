import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { setImmediate } from 'node:timers/promises';
import { mock } from 'node:test';
import { waitForRestoreExit } from '../../../../services/aux-cloud/scripts/recovery-restore-process.mjs';

mock.timers.enable({ apis: ['setTimeout'] });
try {
  const child = new EventEmitter(), statuses = [];
  let settled = false;
  const observed = waitForRestoreExit(child, value => {
    statuses.push(value.phase);
    throw Error('Synthetic persistence failure');
  }).then(() => { settled = true; }, error => { settled = true; return error; });
  child.emit('spawn');
  child.emit('error', Error('Synthetic post-spawn failure'));
  await setImmediate();
  assert.equal(settled, false, 'Do not remove staging while the importer remains alive');
  child.emit('exit', 0);
  assert.match((await observed).message, /uncertain/);
  assert.deepEqual(statuses, ['archive-child-error-awaiting-actual-exit']);

  const timed = new EventEmitter(), timedStatuses = [];
  let kills = 0, timedSettled = false;
  timed.kill = signal => { assert.equal(signal, 'SIGTERM'); kills++; return false; };
  const timedObserved = waitForRestoreExit(timed, value => timedStatuses.push(value.phase))
    .then(() => { timedSettled = true; }, error => { timedSettled = true; return error; });
  timed.emit('spawn');
  mock.timers.tick(300_000);
  await setImmediate();
  assert.equal(kills, 1);
  assert.equal(timedSettled, false, 'An ignored stop request cannot authorize cleanup');
  timed.emit('exit', 0);
  assert.match((await timedObserved).message, /uncertain/);
  assert.deepEqual(timedStatuses, ['archive-stop-requested-outcome-uncertain']);

  const unavailable = new EventEmitter();
  const failed = waitForRestoreExit(unavailable, () => assert.fail('No status expected'));
  unavailable.emit('error', Error('Synthetic missing executable'));
  await assert.rejects(failed, /before spawn/);
  const succeeded = new EventEmitter();
  const success = waitForRestoreExit(succeeded, () => assert.fail('No status expected'));
  succeeded.emit('spawn'); succeeded.emit('exit', 0);
  await success;
  console.log(JSON.stringify({ postSpawnErrorWaitsForExit: true, timedStopWaitsForExit: true,
    zeroExitAfterUncertaintyRefused: true, failedCheckpointHandled: true,
    unavailableSpawnRefused: true, ordinarySuccessAccepted: true, providerOrRestoreExecuted: false }));
} finally { mock.timers.reset(); }
