import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const prefix = 'AUX_NATIVE_FIXTURE_REPLY_V1 ';
const exact = (v, fields) => assert.deepEqual(Object.keys(v ?? {}).sort(), [...fields].sort());
const uint = v => Number.isInteger(v) && v > 0 && v <= 0xffffffff;
const token = v => typeof v === 'string' && /^[a-f0-9]{32}$/i.test(v) && !/^0+$/.test(v);
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v) && !/^0+$/.test(v);
function decimal(v) {
  assert.ok(typeof v === 'string' && /^[1-9][0-9]{0,19}$/.test(v));
  const n = BigInt(v); assert.ok(n <= 9223372036854775807n); return n;
}
function freeze(v) {
  if (v && typeof v === 'object') { for (const child of Object.values(v)) freeze(child); Object.freeze(v); }
  return v;
}
function envelope(raw, operation, launch, sequence) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 16384 && raw.startsWith(prefix) &&
    raw.endsWith('\n') && !raw.slice(0, -1).includes('\n'));
  const outer = JSON.parse(raw.slice(prefix.length, -1));
  assert.equal(raw, `${prefix}${JSON.stringify(outer)}\n`, 'Duplicate or noncanonical native fields');
  exact(outer, ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record']);
  assert.equal(outer.producer, 'aux-native-fixture-reply'); assert.equal(outer.version, 1);
  assert.equal(outer.operation, operation); decimal(sequence); assert.equal(outer.sequence, sequence);
  assert.equal(launch?.record?.kind, 'aux'); assert.ok(hash(launch.receiptSha256));
  assert.equal(outer.pid, launch.record.browserPid); assert.ok(uint(outer.windowId));
  const v = outer.record;
  assert.equal(v?.producer, 'aux-native-warm-window'); assert.equal(v.version, 1);
  if (v.status === 'refused') {
    assert.equal(v.measured, false); assert.ok(typeof v.reason === 'string' && /^[a-z_]{1,128}$/.test(v.reason));
    throw new Error(`Original Aux warm refusal: ${v.reason}`);
  }
  return outer;
}
function receipt(outer, raw) {
  return freeze({ outer, record: outer.record, raw, rawSha256: createHash('sha256').update(raw).digest('hex'),
    compiledNativeProven: false, inputPairProven: false, acPowerProven: false, cohortProven: false });
}
const readyFields = ['producer', 'version', 'status', 'measured', 'requestNonce', 'sampleSequence', 'windowId',
  'browserPid', 'browserProcessUuid', 'browserProcessStart', 'trial', 'launchReceiptNonce', 'launchReceiptSha256',
  'preparedUs', 'launchUs'];
export function decodeAuxWarmReady(raw, launch, cold, kernel, sequence) {
  const outer = envelope(raw, 'prepareAuxWarmWindow', launch, sequence), v = outer.record;
  exact(v, readyFields); assert.equal(v.status, 'ready'); assert.equal(v.measured, false);
  assert.equal(v.sampleSequence, '2'); assert.ok(token(v.requestNonce));
  assert.equal(v.windowId, outer.windowId); assert.equal(v.browserPid, outer.pid);
  assert.equal(v.trial, launch.record.trial); assert.equal(v.launchReceiptNonce, launch.record.nonce);
  assert.equal(v.launchReceiptSha256, launch.receiptSha256);
  assert.equal(cold?.record?.producer, 'aux-native-startup-presentation');
  assert.equal(cold.record.status, 'measured'); assert.equal(cold.record.measured, true);
  assert.equal(cold.record.earliestPresentationProven, true); assert.equal(cold.record.sampleSequence, '1');
  for (const key of ['windowId', 'browserPid', 'trial', 'launchReceiptNonce', 'launchReceiptSha256', 'launchUs'])
    assert.equal(v[key], cold.record[key]);
  assert.equal(kernel?.browserPid, v.browserPid); assert.equal(kernel.browserImageUuid, v.browserProcessUuid);
  assert.equal(kernel.browserStartMachTicks, v.browserProcessStart); assert.ok(token(v.browserProcessUuid));
  decimal(v.browserProcessStart); assert.ok(decimal(cold.record.observedUs) <= decimal(v.preparedUs));
  assert.ok(decimal(v.launchUs) <= decimal(v.preparedUs)); return receipt(outer, raw);
}
const identity = ['trial', 'launchReceiptNonce', 'launchReceiptSha256', 'launcherPid', 'browserPid',
  'helperBinarySha256', 'helperSourceSha256', 'helperProcessUuid', 'helperProcessStart', 'launchMachTicks',
  'spawnReturnedMachTicks', 'nativeDisplayGeneration', 'requestNonce', 'sampleSequence', 'windowId',
  'rendererPid', 'widgetRoutingId', 'nativeDocumentGeneration', 'shellSink', 'displaySink'];
const ticks = ['preparedUs', 'originalInputUs', 'hardwareRegisteredUs', 'typeableObservedUs', 'commitUs',
  'submittedUs', 'drawUs', 'swapStartUs', 'swapEndUs', 'presentedUs', 'observedUs'];
const measuredFields = ['producer', 'version', 'status', 'reason', 'measured', 'earliestPresentationProven',
  ...identity, ...ticks, 'launchUs', 'observationStartedUs', 'observationDeadlineUs', 'classification',
  'warmCreationConfirmed', 'inputLineageProven', 'preparedWindowId', 'browserProcessUuid', 'browserProcessStart',
  'originalEventTimestamp', 'originalCgTimestampNs', 'inputSourcePid', 'inputSourceState', 'inputWindowNumber',
  'inputKeyCode', 'inputCgFlags', 'inputModifierFlags', 'composerInstance', 'elapsedUs', 'shellFrameToken',
  'feedbackFlags', 'drawn'];
function sink(v) { exact(v, ['clientId', 'sinkId']); assert.ok(uint(v.clientId) && uint(v.sinkId)); }
export function decodeAuxWarmPresentation(raw, launch, ready, sequence, helperImageUuid) {
  const outer = envelope(raw, 'completeAuxWarmWindow', launch, sequence), v = outer.record, r = ready?.record;
  exact(v, measuredFields); assert.equal(r?.producer, 'aux-native-warm-window'); assert.equal(r.status, 'ready');
  assert.ok(decimal(sequence) > decimal(ready.outer.sequence)); assert.equal(outer.windowId, r.windowId);
  assert.equal(v.status, 'measured'); assert.equal(v.reason, 'first_full_interactive_shell_hardware');
  assert.equal(v.measured, true); assert.equal(v.earliestPresentationProven, true);
  assert.equal(v.classification, 'warm-additional-window'); assert.equal(v.warmCreationConfirmed, true); assert.equal(v.inputLineageProven, false);
  assert.equal(v.preparedWindowId, r.windowId); assert.ok(uint(v.windowId) && v.windowId !== r.windowId);
  for (const key of ['requestNonce', 'sampleSequence', 'browserPid', 'browserProcessUuid', 'browserProcessStart',
    'trial', 'launchReceiptNonce', 'launchReceiptSha256', 'preparedUs', 'launchUs']) assert.equal(v[key], r[key]);
  for (const key of ['trial', 'launcherPid', 'browserPid', 'helperBinarySha256', 'helperSourceSha256',
    'launchMachTicks', 'spawnReturnedMachTicks']) assert.equal(v[key], launch.record[key]);
  assert.ok(hash(v.helperBinarySha256) && hash(v.helperSourceSha256) && token(helperImageUuid));
  assert.equal(v.helperProcessUuid.toLowerCase(), helperImageUuid.toLowerCase()); decimal(v.helperProcessStart);
  for (const key of ['windowId', 'rendererPid', 'widgetRoutingId', 'shellFrameToken']) assert.ok(uint(v[key]));
  assert.equal(v.nativeDocumentGeneration, '1'); decimal(v.nativeDisplayGeneration);
  assert.ok(decimal(v.launchUs) < decimal(v.originalInputUs));
  for (let i = 1; i < ticks.length; i++) assert.ok(decimal(v[ticks[i - 1]]) <= decimal(v[ticks[i]]));
  assert.ok(decimal(v.originalInputUs) <= decimal(v.observationStartedUs) &&
    decimal(v.observationStartedUs) <= decimal(v.hardwareRegisteredUs));
  assert.ok(decimal(v.observationDeadlineUs) <= decimal(v.observationStartedUs) + 5000000n &&
    decimal(v.observationDeadlineUs) <= decimal(v.preparedUs) + 5000000n &&
    decimal(v.observedUs) <= decimal(v.observationDeadlineUs));
  assert.equal(decimal(v.elapsedUs), decimal(v.presentedUs) - decimal(v.originalInputUs));
  assert.ok(typeof v.composerInstance === 'string' && /^composer-[1-9][0-9]{0,15}$/.test(v.composerInstance));
  sink(v.shellSink); sink(v.displaySink); assert.notDeepEqual(v.shellSink, v.displaySink);
  assert.ok(Number.isInteger(v.feedbackFlags) && v.feedbackFlags >= 0 && v.feedbackFlags <= 0xffffffff && (v.feedbackFlags & 4) !== 0 && (v.feedbackFlags & 16) === 0);
  assert.ok(Array.isArray(v.drawn) && v.drawn.length === 1); const row = v.drawn[0];
  exact(row, ['surface', 'token', 'surfaceSize', 'visibleBounds']); assert.equal(row.token, v.shellFrameToken);
  exact(row.surface, ['frameSink', 'parentSequenceNumber', 'childSequenceNumber', 'embedToken']);
  sink(row.surface.frameSink); assert.deepEqual(row.surface.frameSink, v.shellSink);
  assert.ok(uint(row.surface.parentSequenceNumber) && uint(row.surface.childSequenceNumber) && token(row.surface.embedToken));
  exact(row.surfaceSize, ['width', 'height']); exact(row.visibleBounds, ['x', 'y', 'width', 'height']);
  assert.equal(row.visibleBounds.x, 0); assert.equal(row.visibleBounds.y, 0);
  for (const k of ['width', 'height']) assert.ok(uint(row.surfaceSize[k]) && row.surfaceSize[k] <= 32768 &&
    row.visibleBounds[k] === row.surfaceSize[k]);
  assert.ok(typeof v.originalEventTimestamp === 'number' && Number.isFinite(v.originalEventTimestamp) && v.originalEventTimestamp > 0);
  decimal(v.originalCgTimestampNs); decimal(v.inputSourcePid); assert.ok(uint(v.inputWindowNumber));
  assert.equal(v.inputSourceState, '-1'); assert.equal(v.inputKeyCode, 45);
  assert.equal(v.inputCgFlags, '1048576'); assert.equal(v.inputModifierFlags, '1048576');
  return receipt(outer, raw);
}
