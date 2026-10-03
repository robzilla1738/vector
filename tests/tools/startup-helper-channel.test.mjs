import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ownStartupHelperChannel } from '../host/lib/startup-helper-channel.mjs';
const canonical = object => JSON.stringify(Object.fromEntries(Object.keys(object).sort().map(key => [key, object[key]])));
const pins = { kind: 'aux', trial: 'a'.repeat(32), launcherPid: 101,
  helperBinarySha256: 'b'.repeat(64), helperSourceSha256: 'c'.repeat(64) };
const launch = { producer: 'aux-native-startup-launch', version: 1, ...pins,
  browserPid: 202, launchMachTicks: '100', spawnReturnedMachTicks: '101',
  nonce: '11111111-2222-3333-4444-555555555555', sequence: '1' };
const exit = { producer: 'aux-native-startup-exit', version: 1,
  trial: pins.trial, launcherPid: 101, browserPid: 202, waitStatus: 0, cleanupRequested: false };
const browser = { sha256: 'd'.repeat(64), imageUuid: 'e'.repeat(32), device: '1', inode: '2' };
const cold = { producer: 'aux-native-startup-cold', version: 1, kind: pins.kind, trial: pins.trial,
  launcherPid: pins.launcherPid, browserPid: launch.browserPid, browserBinarySha256: browser.sha256,
  browserImageUuid: browser.imageUuid, browserDevice: browser.device, browserInode: browser.inode,
  inventoryStartedMachTicks: '90', inventoryFinishedMachTicks: '99', launchMachTicks: '100',
  browserStartMachTicks: '100', spawnReturnedMachTicks: '101', childObservedMachTicks: '102' };
const coldLine = value => `AUX_STARTUP_COLD_V1 ${canonical(value)}\n`;
const expected = { ...pins, browser };
const line = value => `AUX_STARTUP_LAUNCH_V1 ${canonical(value)}\n`;
function helper() {
  const child = new EventEmitter(); child.pid = 101;
  child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
  child.signals = []; child.kill = signal => { child.signals.push(signal); return true; };
  return child;
}
test('fragmented original launch and child exit preserve raw pins and reaping', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  const bytes = line(launch); child.stdout.emit('data', Buffer.from(bytes.slice(0, 20)));
  child.stdout.emit('data', Buffer.from(bytes.slice(20))); child.stdout.emit('data', Buffer.from(coldLine(cold))); assert.equal((await owner.launched).record.browserPid, 202);
  child.stderr.emit('data', Buffer.from('original native stderr\n'));
  child.stdout.emit('data', Buffer.from(line(exit))); child.emit('close', 0, null);
  const result = await owner.stop(); assert.equal(result.cleanupDebt, false); assert.equal(result.primary, undefined);
  assert.equal(result.exit.record.waitStatus, 0); assert.equal(owner.nativeStderr.toString(), 'original native stderr\n');
  assert.deepEqual(child.signals, []);
});
test('replayed or wrong-child exit refuses and only signals original helper', async () => {
  for (const invalid of [line({ ...exit, browserPid: 203 }), line(exit) + line(exit)]) {
    const child = helper(), owner = ownStartupHelperChannel(child, expected);
    child.stdout.emit('data', Buffer.from(line(launch))); child.stdout.emit('data', Buffer.from(coldLine(cold))); await owner.launched;
    child.stdout.emit('data', Buffer.from(invalid)); child.emit('close', 125, null);
    const result = await owner.stop(); assert.ok(result.primary); assert.equal(result.cleanupDebt, true);
    assert.deepEqual(child.signals, ['SIGTERM']);
  }
});
test('helper hard-exit without child exit receipt retains original primary and cleanup debt', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch))); child.stdout.emit('data', Buffer.from(coldLine(cold))); await owner.launched;
  const primary = new Error('native first frame refused'); const stopping = owner.stop(primary);
  child.emit('close', 125, null); const result = await stopping;
  assert.equal(result.primary, primary); assert.equal(result.cleanupDebt, true);
  assert.deepEqual(child.signals, ['SIGTERM']);
});
test('cleanup deadline never signals cached browser PID or kills unreaped parent', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected, { cleanupMs: 1 });
  child.stdout.emit('data', Buffer.from(line(launch))); child.stdout.emit('data', Buffer.from(coldLine(cold))); await owner.launched;
  const result = await owner.stop(new Error('trial cancelled'));
  assert.equal(result.cleanupDebt, true); assert.equal(result.helperMayBeLive, true);
  assert.deepEqual(child.signals, ['SIGTERM']);
  child.emit('close', 125, null); assert.equal((await owner.closed).cleanupDebt, true);
});
test('missing/truncated launch fails rather than claiming owned browser identity', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch).slice(0, -1))); child.emit('close', 0, null);
  await assert.rejects(owner.launched); assert.equal(owner.originalBrowserReceipt, undefined);
  assert.equal((await owner.closed).cleanupDebt, true);
});
test('nonzero actual child wait status retains failure despite proved reap', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch))); child.stdout.emit('data', Buffer.from(coldLine(cold))); await owner.launched;
  child.stdout.emit('data', Buffer.from(line({ ...exit, waitStatus: 256 }))); child.emit('close', 0, null);
  const result = await owner.closed; assert.equal(result.cleanupDebt, false); assert.ok(result.primary);
});
test('bounded raw streams fail closed without replacing failed trials', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.alloc(4097, 65)); await assert.rejects(owner.launched);
  child.emit('close', 1, null); assert.ok((await owner.closed).primary);
  assert.deepEqual(child.signals, ['SIGTERM']);
});
test('cancellation before a launch immediately refuses while retaining unreaped helper debt', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected, { cleanupMs: 1 });
  const stopping = owner.stop(new Error('cancelled before launch'));
  await assert.rejects(owner.launched, /cancelled before launch/);
  assert.equal((await stopping).cleanupDebt, true);
  child.emit('close', 125, null);
});
test('requested cleanup receipt proves actual reap without erasing original trial failure', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch))); child.stdout.emit('data', Buffer.from(coldLine(cold))); await owner.launched;
  const primary = new Error('original trial failure'); const stopping = owner.stop(primary);
  child.stdout.emit('data', Buffer.from(line({ ...exit, cleanupRequested: true, waitStatus: 15 })));
  child.emit('close', 0, null); const result = await stopping;
  assert.equal(result.cleanupDebt, false); assert.equal(result.primary, primary);
  assert.equal(result.exit.record.cleanupRequested, true);
});
test('unsolicited cleanup remains a failed trial even with a proved reap', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch))); child.stdout.emit('data', Buffer.from(coldLine(cold))); await owner.launched;
  child.stdout.emit('data', Buffer.from(line({ ...exit, cleanupRequested: true, waitStatus: 15 })));
  child.emit('close', 0, null); const result = await owner.closed;
  assert.equal(result.cleanupDebt, false); assert.match(result.primary.message, /Unsolicited/);
});

test('missing cold proof refuses qualification while valid exit still proves original child reaped', async () => {
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch))); await owner.launched;
  child.stdout.emit('data', Buffer.from(line(exit))); child.emit('close', 0, null);
  await assert.rejects(owner.coldMeasured, /Missing original kernel/);
  const result = await owner.closed; assert.equal(result.cleanupDebt, false); assert.ok(result.primary);
});
test('original cold receipt joins launch and refuses replacement executable, generation or replay', async () => {
  for (const invalid of [{ ...cold, browserInode: '3' }, { ...cold, browserStartMachTicks: '99' },
    { ...cold, inventoryFinishedMachTicks: '101' }, { ...cold, browserPid: 303 }]) {
    const child = helper(), owner = ownStartupHelperChannel(child, expected);
    child.stdout.emit('data', Buffer.from(line(launch))); await owner.launched;
    child.stdout.emit('data', Buffer.from(coldLine(invalid))); await assert.rejects(owner.coldMeasured);
    child.stdout.emit('data', Buffer.from(line({ ...exit, cleanupRequested: true })));
    child.emit('close', 0, null); const result = await owner.closed;
    assert.ok(result.primary); assert.equal(result.cleanupDebt, false); assert.deepEqual(child.signals, ['SIGTERM']);
  }
  const child = helper(), owner = ownStartupHelperChannel(child, expected);
  child.stdout.emit('data', Buffer.from(line(launch) + coldLine(cold))); await owner.coldMeasured;
  child.stdout.emit('data', Buffer.from(coldLine(cold))); child.emit('close', 125, null);
  assert.ok((await owner.closed).primary);
});
test('paired pre-spawn refusal stays failed and proves no browser cleanup debt', async () => {
  const refusal = { producer: 'aux-native-startup-prelaunch-refusal', version: 1, ...pins, browserSpawnAttempted: false };
  for (const mutation of [undefined, { launcherPid: 303 }, { browserSpawnAttempted: true }]) {
    const child = helper(), owner = ownStartupHelperChannel(child, expected);
    child.stdout.emit('data', Buffer.from(`AUX_STARTUP_REFUSAL_V1 ${canonical({ ...refusal, ...mutation })}\n`));
    child.emit('close', 1, null); await assert.rejects(owner.launched); await assert.rejects(owner.coldMeasured);
    const result = await owner.closed; assert.ok(result.primary);
    assert.equal(result.cleanupDebt, Boolean(mutation));
    assert.deepEqual(child.signals, mutation ? ['SIGTERM'] : []);
  }
});
