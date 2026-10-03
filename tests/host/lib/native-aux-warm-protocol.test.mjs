import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeAuxWarmReady, decodeAuxWarmPresentation } from './native-aux-warm-protocol.mjs';
// Synthetic protocol controls only. No native app, helper, kernel inventory,
// hardware presentation, power or measured timing is produced by this file.
const token = 'A'.repeat(32), uuid = 'b'.repeat(32), sha = 'c'.repeat(64);
function fixture() {
  const launch = { receiptSha256: sha, record: { kind: 'aux', trial: 'trial-one', nonce: token,
    launcherPid: 11, browserPid: 12, helperBinarySha256: sha, helperSourceSha256: sha,
    launchMachTicks: '100', spawnReturnedMachTicks: '101' } };
  const ready = { producer: 'aux-native-warm-window', version: 1, status: 'ready', measured: false,
    requestNonce: token, sampleSequence: '2', windowId: 30, browserPid: 12, browserProcessUuid: uuid,
    browserProcessStart: '90', trial: 'trial-one', launchReceiptNonce: token, launchReceiptSha256: sha,
    preparedUs: '200', launchUs: '100' };
  const cold = { record: { producer: 'aux-native-startup-presentation', status: 'measured', measured: true,
    earliestPresentationProven: true, sampleSequence: '1', observedUs: '190',
    ...Object.fromEntries(['windowId', 'browserPid', 'trial', 'launchReceiptNonce', 'launchReceiptSha256', 'launchUs'].map(k => [k, ready[k]])) } };
  const kernel = { browserPid: 12, browserImageUuid: uuid, browserStartMachTicks: '90' };
  const sink = { clientId: 1, sinkId: 2 };
  const measured = { producer: 'aux-native-warm-window', version: 1, status: 'measured',
    reason: 'first_full_interactive_shell_hardware', measured: true, earliestPresentationProven: true,
    trial: ready.trial, launchReceiptNonce: token, launchReceiptSha256: sha, launcherPid: 11, browserPid: 12,
    helperBinarySha256: sha, helperSourceSha256: sha, helperProcessUuid: uuid, helperProcessStart: '80',
    launchMachTicks: '100', spawnReturnedMachTicks: '101', nativeDisplayGeneration: '2', requestNonce: token,
    sampleSequence: '2', windowId: 31, rendererPid: 13, widgetRoutingId: 9, nativeDocumentGeneration: '1',
    shellSink: sink, displaySink: { clientId: 3, sinkId: 4 }, preparedUs: '200', originalInputUs: '210',
    hardwareRegisteredUs: '220', typeableObservedUs: '230', commitUs: '240', submittedUs: '250', drawUs: '260',
    swapStartUs: '270', swapEndUs: '280', presentedUs: '290', observedUs: '300', launchUs: '100',
    observationStartedUs: '215', observationDeadlineUs: '5000200', classification: 'warm-additional-window',
    warmCreationConfirmed: true, inputLineageProven: false, preparedWindowId: 30, browserProcessUuid: uuid, browserProcessStart: '90',
    originalEventTimestamp: 0.000210, originalCgTimestampNs: '210000', inputSourcePid: '14',
    inputSourceState: '-1', inputWindowNumber: 30, inputKeyCode: 45, inputCgFlags: '1048576',
    inputModifierFlags: '1048576', composerInstance: 'composer-1', elapsedUs: '80', shellFrameToken: 4,
    feedbackFlags: 4, drawn: [{ surface: { frameSink: { ...sink }, parentSequenceNumber: 1, childSequenceNumber: 1,
      embedToken: token }, token: 4, surfaceSize: { width: 800, height: 600 },
      visibleBounds: { x: 0, y: 0, width: 800, height: 600 } }] };
  const raw = (operation, record, sequence) => 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({
    producer: 'aux-native-fixture-reply', version: 1, pid: 12, windowId: 30, sequence, operation, record }) + '\n';
  const readReady = () => decodeAuxWarmReady(raw('prepareAuxWarmWindow', ready, '1'), launch, cold, kernel, '1');
  const readMeasured = () => decodeAuxWarmPresentation(raw('completeAuxWarmWindow', measured, '2'), launch, readReady(), '2', uuid);
  return { launch, ready, cold, kernel, measured, raw, readReady, readMeasured };
}
test('strict synthetic Aux warm pair retains original bytes without claiming qualification', () => {
  const f = fixture(), r = f.readMeasured(); assert.equal(r.record.elapsedUs, '80');
  assert.equal(r.compiledNativeProven, false); assert.equal(r.inputPairProven, false);
  assert.equal(r.acPowerProven, false); assert.equal(r.cohortProven, false); assert.ok(Object.isFrozen(r.record.drawn[0]));
});
test('foreign process, cold window, nonce and generations cannot become warm', () => {
  for (const [key, value] of [['windowId', 30], ['requestNonce', 'D'.repeat(32)], ['sampleSequence', '1'],
    ['browserPid', 999], ['browserProcessStart', '91'], ['browserProcessUuid', 'D'.repeat(32)],
    ['preparedWindowId', 999], ['warmCreationConfirmed', false], ['classification', 'cold-process']]) {
    const f = fixture(); f.measured[key] = value; assert.throws(f.readMeasured, key);
  }
});
test('every causal endpoint, deadline and unrounded elapsed remain exact', () => {
  for (const [key, value] of [['originalInputUs', '99'], ['hardwareRegisteredUs', '209'], ['commitUs', '229'],
    ['submittedUs', '239'], ['drawUs', '249'], ['swapStartUs', '259'], ['swapEndUs', '269'],
    ['presentedUs', '279'], ['observedUs', '289'], ['observationStartedUs', '209'],
    ['observationDeadlineUs', '5000201'], ['elapsedUs', '79']]) {
    const f = fixture(); f.measured[key] = value; assert.throws(f.readMeasured, key);
  }
});
test('partial, different token, software or overflow feedback refuses', () => {
  for (const mutate of [v => v.drawn[0].visibleBounds.width--, v => v.drawn[0].visibleBounds.x = 1,
    v => v.drawn[0].token++, v => v.drawn[0].surface.frameSink.clientId = 99,
    v => v.feedbackFlags = 0, v => v.feedbackFlags = 20, v => v.feedbackFlags = 4294967300]) {
    const f = fixture(); mutate(f.measured); assert.throws(f.readMeasured);
  }
});
test('raw duplicate, whitespace, exponent, foreign operation and sequence refuse', () => {
  const f = fixture(), ready = f.readReady(), original = f.raw('completeAuxWarmWindow', f.measured, '2');
  for (const raw of [original.replace('"version":1', '"version":1,"version":1'),
    original.replace('"sinkId":2', '"sinkId":2,"sinkId":2'), original.replace('"version":1', '"version":1e0'),
    original.replace('{', '{ '), original.replace('completeAuxWarmWindow', 'completeGuestPresentation'),
    original.replace('"sequence":"2"', '"sequence":"1"')])
    assert.throws(() => decodeAuxWarmPresentation(raw, f.launch, ready, '2', uuid));
});
test('original cold and kernel continuity required before Ready', () => {
  for (const mutate of [f => f.kernel.browserStartMachTicks = '91', f => f.cold.record.windowId = 999,
    f => f.cold.record.observedUs = '201', f => f.cold.record.earliestPresentationProven = false,
    f => f.launch.record.kind = 'stock']) { const f = fixture(); mutate(f); assert.throws(f.readReady); }
});
