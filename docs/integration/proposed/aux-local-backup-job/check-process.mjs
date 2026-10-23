import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { setImmediate } from 'node:timers/promises';
import { waitForCaptureExit } from '../../../../services/aux-cloud/scripts/backup-capture-process.mjs';

const child = new EventEmitter(), statuses = [];
let settled = false;
const waiting = waitForCaptureExit(child, phase => { statuses.push(phase); throw Error('Synthetic persistence failure'); });
const observed = waiting.then(() => { settled = true; }, error => { settled = true; return error; });
child.emit('spawn');
child.emit('error', Error('Synthetic post-spawn kill failure'));
await setImmediate();
assert.equal(settled, false, 'A real spawned child remains owned until actual exit');
assert.deepEqual(statuses, ['capture-child-error-awaiting-actual-exit']);
child.emit('exit', 0);
assert.match((await observed).message, /uncertain/);

const failedSpawn = new EventEmitter();
const failed = waitForCaptureExit(failedSpawn, () => { throw Error('No status expected'); });
failedSpawn.emit('error', Error('Synthetic pre-spawn unavailable'));
await assert.rejects(failed, /before spawn/);
console.log(JSON.stringify({ postSpawnErrorRetainedUntilExit: true, zeroExitAfterErrorRefused: true,
  failedStatusHandled: true, preSpawnFailureRejected: true, captureOrProviderExecuted: false }));
