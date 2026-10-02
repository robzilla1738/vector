import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const prefix = 'AUX_NATIVE_STARTUP_V1 ';
const ticks = ['launchUs', 'hardwareRegisteredUs', 'typeableObservedUs', 'commitUs', 'submittedUs', 'drawUs', 'swapStartUs', 'swapEndUs', 'presentedUs', 'observedUs'];
const identity = ['trial', 'launchReceiptNonce', 'launchReceiptSha256', 'launcherPid', 'browserPid', 'helperBinarySha256', 'helperSourceSha256', 'helperProcessUuid', 'helperProcessStart', 'launchMachTicks', 'spawnReturnedMachTicks', 'nativeDisplayGeneration', 'requestNonce', 'sampleSequence', 'windowId', 'rendererPid', 'widgetRoutingId', 'nativeDocumentGeneration', 'shellSink', 'displaySink'];
const keys = (value, fields) => assert.deepEqual(Object.keys(value ?? {}).sort(), [...fields].sort());
const uint = n => Number.isInteger(n) && n > 0 && n <= 0xffffffff;
const decimal = n => typeof n === 'string' && /^[1-9][0-9]{0,19}$/.test(n) && BigInt(n) <= 9223372036854775807n;
const token = n => typeof n === 'string' && /^[a-f0-9]{32}$/i.test(n);
function sink(value) { keys(value, ['clientId', 'sinkId']); assert.ok(uint(value.clientId) && uint(value.sinkId)); }
/** Decode original direct-child browser stderr and pair it to the original
 * helper receipt. The native producer alone admits Profile/document/hardware;
 * this parser never fabricates missing native or candidate authority. */
export function validateStartupPresentation(raw, launch, { helperImageUuid }) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 16384 && raw.startsWith(prefix) && raw.endsWith('\n') && !raw.slice(0, -1).includes('\n'));
  assert.ok(launch?.record && /^[a-f0-9]{64}$/.test(launch.receiptSha256));
  assert.equal(launch.record.kind, 'aux', 'Stock requires its distinct genuine native endpoint');
  assert.ok(token(helperImageUuid), 'Missing actual pinned helper image UUID');
  const record = JSON.parse(raw.slice(prefix.length, -1));
  assert.equal(record.producer, 'aux-native-startup-presentation'); assert.equal(record.version, 1);
  if (record.status === 'refused') {
    assert.equal(record.measured, false); assert.equal(record.earliestPresentationProven, false);
    assert.ok(typeof record.reason === 'string' && /^[a-z_]{1,128}$/.test(record.reason));
    throw new Error(`Original native startup refusal: ${record.reason}`);
  }
  keys(record, ['producer', 'version', 'status', 'reason', 'measured', 'earliestPresentationProven', ...identity, ...ticks, 'composerInstance', 'elapsedUs', 'shellFrameToken', 'feedbackFlags', 'drawn', 'runtimeHelloUs', 'runtimePeerConfirmedUs', 'observationStartedUs', 'observationDeadlineUs', 'runtimeHelloElapsedUs', 'runtimeConnectionGeneration', 'runtimePid', 'runtimePidVersion', 'runtimeAuditToken']);
  assert.equal(record.status, 'measured'); assert.equal(record.reason, 'first_full_interactive_shell_hardware');
  assert.equal(record.measured, true); assert.equal(record.earliestPresentationProven, true);
  for (const key of ['trial', 'launcherPid', 'browserPid', 'helperBinarySha256', 'helperSourceSha256', 'launchMachTicks', 'spawnReturnedMachTicks'])
    assert.equal(record[key], launch.record[key], `Original launch ${key} changed`);
  assert.equal(record.launchReceiptNonce, launch.record.nonce); assert.equal(record.launchReceiptSha256, launch.receiptSha256);
  assert.ok(token(record.helperProcessUuid)); assert.equal(record.helperProcessUuid.toLowerCase(), helperImageUuid.toLowerCase());
  for (const key of ['helperProcessStart', 'nativeDisplayGeneration', 'sampleSequence', 'nativeDocumentGeneration', ...ticks, 'elapsedUs']) assert.ok(decimal(record[key]), `Missing actual ${key}`);
  assert.equal(record.sampleSequence, '1'); assert.equal(record.nativeDocumentGeneration, '1'); assert.ok(token(record.requestNonce));
  for (const key of ['windowId', 'rendererPid', 'widgetRoutingId']) assert.ok(uint(record[key]));
  sink(record.shellSink); sink(record.displaySink); assert.notDeepEqual(record.shellSink, record.displaySink);
  assert.ok(typeof record.composerInstance === 'string' && /^composer-[1-9][0-9]{0,15}$/.test(record.composerInstance));
  for (let i = 1; i < ticks.length; i++) assert.ok(BigInt(record[ticks[i]]) >= BigInt(record[ticks[i - 1]]), 'Reversed original startup causal chain');
  assert.equal(BigInt(record.elapsedUs), BigInt(record.presentedUs) - BigInt(record.launchUs));
  assert.ok(decimal(record.observationStartedUs) && decimal(record.observationDeadlineUs));
  assert.equal(BigInt(record.observationDeadlineUs) - BigInt(record.observationStartedUs), 5000000n);
  assert.ok(BigInt(record.observationStartedUs) >= BigInt(record.launchUs) &&
    BigInt(record.observedUs) <= BigInt(record.observationDeadlineUs));
  assert.ok(decimal(record.runtimeHelloUs) && decimal(record.runtimePeerConfirmedUs) && decimal(record.runtimeHelloElapsedUs));
  assert.equal(record.runtimeConnectionGeneration, '1');
  assert.ok(uint(record.runtimePid) && uint(record.runtimePidVersion));
  assert.notEqual(record.runtimePid, record.browserPid);
  assert.notEqual(record.runtimePid, record.rendererPid);
  assert.ok(Array.isArray(record.runtimeAuditToken) && record.runtimeAuditToken.length === 8 &&
    record.runtimeAuditToken.every(word => Number.isInteger(word) && word >= 0 && word <= 0xffffffff));
  assert.ok(BigInt(record.runtimeHelloUs) >= BigInt(record.launchUs) &&
    BigInt(record.runtimeHelloUs) <= BigInt(record.runtimePeerConfirmedUs) &&
    BigInt(record.presentedUs) <= BigInt(record.runtimePeerConfirmedUs) &&
    BigInt(record.runtimePeerConfirmedUs) <= BigInt(record.observedUs));
  assert.equal(BigInt(record.runtimeHelloElapsedUs), BigInt(record.runtimeHelloUs) - BigInt(record.launchUs));
  assert.ok(uint(record.shellFrameToken)); assert.ok(Number.isInteger(record.feedbackFlags) && record.feedbackFlags >= 0 && record.feedbackFlags <= 0xffffffff && (record.feedbackFlags & 4) !== 0 && (record.feedbackFlags & 16) === 0);
  assert.ok(Array.isArray(record.drawn) && record.drawn.length === 1);
  const row = record.drawn[0]; keys(row, ['surface', 'token', 'surfaceSize', 'visibleBounds']);
  keys(row.surface, ['frameSink', 'parentSequenceNumber', 'childSequenceNumber', 'embedToken']);
  sink(row.surface.frameSink); assert.deepEqual(row.surface.frameSink, record.shellSink);
  assert.ok(uint(row.surface.parentSequenceNumber) && uint(row.surface.childSequenceNumber) && token(row.surface.embedToken));
  assert.equal(row.token, record.shellFrameToken); keys(row.surfaceSize, ['width', 'height']); keys(row.visibleBounds, ['x', 'y', 'width', 'height']);
  for (const key of ['width', 'height']) assert.ok(uint(row.surfaceSize[key]) && uint(row.visibleBounds[key]) && row.surfaceSize[key] === row.visibleBounds[key]);
  for (const key of ['x', 'y']) assert.ok(Number.isSafeInteger(row.visibleBounds[key]));
  return Object.freeze({ record, raw, rawSha256: createHash('sha256').update(raw).digest('hex'),
    elapsedUs: record.elapsedUs, runtimeHelloElapsedUs: record.runtimeHelloElapsedUs, diagnosticElapsedMs: Number(BigInt(record.elapsedUs)) / 1000, endpoint: 'original OS launch → first eligible full interactive shell hardware' });
}
