import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStartupLaunchReceipt } from '../host/lib/startup-launch-receipt.mjs';
import { validateStartupPresentation } from '../host/lib/native-startup-protocol.mjs';
// Synthetic protocol fixtures only, no native admission/launch/paint evidence.
const helperImageUuid = 'd'.repeat(32);
const pins = { trial: 'a'.repeat(32), kind: 'aux', launcherPid: 101,
  helperBinarySha256: 'b'.repeat(64), helperSourceSha256: 'c'.repeat(64) };
const launchRecord = { producer: 'aux-native-startup-launch', version: 1, ...pins,
  browserPid: 202, launchMachTicks: '10000', spawnReturnedMachTicks: '10001',
  nonce: '11111111-2222-3333-4444-555555555555', sequence: '1' };
const canonical = value => JSON.stringify(Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])));
const launch = parseStartupLaunchReceipt(`AUX_STARTUP_LAUNCH_V1 ${canonical(launchRecord)}\n`, pins);
const sink = { clientId: 2, sinkId: 2 };
const record = {
  producer: 'aux-native-startup-presentation', version: 1, status: 'measured', reason: 'first_full_interactive_shell_hardware', measured: true, earliestPresentationProven: true,
  trial: pins.trial, launchReceiptNonce: launchRecord.nonce, launchReceiptSha256: launch.receiptSha256,
  launcherPid: 101, browserPid: 202, helperBinarySha256: pins.helperBinarySha256, helperSourceSha256: pins.helperSourceSha256,
  helperProcessUuid: helperImageUuid, helperProcessStart: '9000', launchMachTicks: '10000', spawnReturnedMachTicks: '10001',
  nativeDisplayGeneration: '3', requestNonce: 'e'.repeat(32), sampleSequence: '1', windowId: 10,
  rendererPid: 303, widgetRoutingId: 12, nativeDocumentGeneration: '1', shellSink: sink, displaySink: { clientId: 1, sinkId: 1 },
  launchUs: '9007199254740993', hardwareRegisteredUs: '9007199254740994', typeableObservedUs: '9007199254740995',
  commitUs: '9007199254740996', submittedUs: '9007199254740997', drawUs: '9007199254740998',
  swapStartUs: '9007199254740999', swapEndUs: '9007199254741000', presentedUs: '9007199254741001', observedUs: '9007199254741002',
  observationStartedUs: '9007199254740993', observationDeadlineUs: '9007199259740993',
  runtimeHelloUs: '9007199254740997', runtimePeerConfirmedUs: '9007199254741002', runtimeHelloElapsedUs: '4', runtimeConnectionGeneration: '1',
  runtimePid: 404, runtimePidVersion: 5, runtimeAuditToken: [1, 2, 3, 4, 5, 6, 7, 8],
  composerInstance: 'composer-1', elapsedUs: '8', shellFrameToken: 7, feedbackFlags: 4,
  drawn: [{ surface: { frameSink: sink, parentSequenceNumber: 1, childSequenceNumber: 1, embedToken: 'f'.repeat(32) },
    token: 7, surfaceSize: { width: 800, height: 600 }, visibleBounds: { x: 0, y: 0, width: 800, height: 600 } }],
};
const raw = value => `AUX_NATIVE_STARTUP_V1 ${JSON.stringify(value)}\n`;
const decode = value => validateStartupPresentation(raw(value), launch, { helperImageUuid });
test('retains original integer endpoints above safe number precision and exact launch pairing', () => {
  const result = decode(record); assert.equal(result.diagnosticElapsedMs, 0.008);
  assert.equal(result.record.launchUs, '9007199254740993'); assert.equal(result.raw, raw(record));
});
test('foreign helper, original launch nonce/hash/trial and stock are refused', () => {
  for (const changed of [{ trial: 'f'.repeat(32) }, { launcherPid: 102 }, { browserPid: 204 },
    { helperBinarySha256: 'f'.repeat(64) }, { helperProcessUuid: 'f'.repeat(32) },
    { launchReceiptSha256: 'f'.repeat(64) }, { launchReceiptNonce: '11111111-2222-3333-4444-666666666666' }])
    assert.throws(() => decode({ ...record, ...changed }));
  assert.throws(() => validateStartupPresentation(raw(record), { ...launch, record: { ...launch.record, kind: 'stock' } }, { helperImageUuid }));
});
test('late registration, reversed submission and invented elapsed refuse', () => {
  for (const changed of [{ hardwareRegisteredUs: record.commitUs }, { submittedUs: record.swapEndUs },
    { observedUs: record.launchUs }, { elapsedUs: '7' }, { launchUs: 9007199254740993 }])
    assert.throws(() => decode({ ...record, ...changed }));
});
test('software/failure/upperbound and partial or wrong token cannot become first hardware', () => {
  for (const changed of [{ feedbackFlags: 0 }, { feedbackFlags: 20 }, { earliestPresentationProven: false },
    { shellFrameToken: 8 }, { drawn: [{ ...record.drawn[0], visibleBounds: { x: 0, y: 0, width: 10, height: 10 } }] },
    { drawn: [{ ...record.drawn[0], surface: { ...record.drawn[0].surface, frameSink: record.displaySink } }] }])
    assert.throws(() => decode({ ...record, ...changed }));
});
test('missing, unknown, repeated and scope-less refusal evidence never count', () => {
  assert.throws(() => decode({ ...record, requestedTheme: 'dark' }));
  assert.throws(() => decode({ ...record, drawn: [] }));
  assert.throws(() => validateStartupPresentation(raw(record) + raw(record), launch, { helperImageUuid }));
  assert.throws(() => decode({ producer: record.producer, version: 1, status: 'refused', reason: 'unavailable_initial_shell', measured: false, earliestPresentationProven: false }), /Original native startup refusal/);
});

test('hello uses its original independent endpoint and refuses foreign or impossible receipts', () => {
  assert.equal(decode(record).runtimeHelloElapsedUs, '4');
  for (const changed of [{ runtimeHelloUs: record.launchUs, runtimeHelloElapsedUs: '4' },
    { runtimeHelloUs: '9007199254741010' }, { runtimePeerConfirmedUs: record.launchUs }, { runtimeConnectionGeneration: '2' },
    { runtimePid: record.browserPid }, { runtimePidVersion: 0 }, { runtimeAuditToken: [] },
    { runtimeHelloElapsedUs: '3' }]) assert.throws(() => decode({ ...record, ...changed }));
  const noHello = { ...record }; delete noHello.runtimeHelloUs;
  assert.throws(() => decode(noHello));
});

test('blocked delivery cannot pass the unchanged original five-second deadline', () => {
  for (const changed of [{ observationStartedUs: '9007199254740992' },
    { observationDeadlineUs: '9007199259740994' }, { observedUs: '9007199259740994' }])
    assert.throws(() => decode({ ...record, ...changed }));
});
