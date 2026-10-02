import assert from 'node:assert/strict';
const identity = ['metric', 'startKind', 'earliestPresentationProven', 'requestNonce', 'sampleSequence', 'windowId', 'widgetRoutingId', 'rendererPid', 'nativeDocumentGeneration', 'shellSink', 'displaySink', 'armedUs'];
const integer = n => Number.isInteger(n) && n > 0 && n <= 0xffffffff;
const decimal = n => typeof n === 'string' && /^[1-9][0-9]{0,19}$/.test(n) && BigInt(n) <= 18446744073709551615n;
const token = n => typeof n === 'string' && /^[a-f0-9]{32}$/i.test(n);
const keys = (value, expected) => assert.deepEqual(Object.keys(value ?? {}).sort(), [...expected].sort());
function sink(value) { keys(value, ['clientId', 'sinkId']); assert.ok(integer(value.clientId) && integer(value.sinkId)); }
function decode(raw) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 16384, 'Missing bounded native original');
  const value = JSON.parse(raw); assert.equal(value.producer, 'aux-native-little-presentation-upperbound'); assert.equal(value.version, 1);
  if (value.status === 'refused') {
    assert.equal(value.measured, false); assert.ok(typeof value.reason === 'string' && value.reason.length > 0 && value.reason.length <= 128);
    throw new Error(`Original native refusal: ${value.reason}`);
  }
  assert.equal(value.metric, 'little-window'); assert.equal(value.startKind, 'native-arm-upperbound'); assert.equal(value.earliestPresentationProven, false);
  for (const key of ['windowId', 'widgetRoutingId', 'rendererPid']) assert.ok(integer(value[key]), `Invalid native ${key}`);
  for (const key of ['sampleSequence', 'nativeDocumentGeneration', 'armedUs']) assert.ok(decimal(value[key]), `Missing genuine ${key}`);
  assert.ok(token(value.requestNonce)); sink(value.shellSink); sink(value.displaySink);
  return value;
}
export function validateLittlePresentationReady(raw) {
  const value = decode(raw); assert.equal(value.status, 'ready'); assert.equal(value.reason, 'ready'); assert.equal(value.measured, false);
  keys(value, ['producer', 'version', 'status', 'reason', 'measured', ...identity]); return value;
}
export function validateLittlePresentationPair(readyRaw, measuredRaw) {
  const ready = validateLittlePresentationReady(readyRaw), measured = decode(measuredRaw);
  for (const key of identity) assert.deepEqual(measured[key], ready[key], `Origin ${key} changed`);
  assert.equal(measured.status, 'measured'); assert.equal(measured.measured, true); assert.equal(measured.reason, 'measured-upperbound');
  const timestamps = ['armedUs', 'guestCommittedUs', 'witnessObservedUs', 'commitUs', 'submittedUs', 'drawUs', 'swapStartUs', 'swapEndUs', 'presentedUs', 'observedUs'];
  for (const key of [...timestamps, 'elapsedUs']) assert.ok(decimal(measured[key]), `Missing native ${key}`);
  for (let i = 1; i < timestamps.length; i++) assert.ok(BigInt(measured[timestamps[i]]) >= BigInt(measured[timestamps[i - 1]]), 'Reversed actual causal chain');
  assert.equal(BigInt(measured.elapsedUs), BigInt(measured.presentedUs) - BigInt(ready.armedUs), 'Upperbound differs from whole native Arm→HW interval');
  assert.ok(BigInt(measured.observedUs) - BigInt(ready.armedUs) <= 5_000_000n, 'Expired creation ticket');
  keys(measured.target, ['windowId', 'widgetRoutingId', 'rendererPid', 'nativeDocumentGeneration', 'shellSink', 'displaySink']);
  for (const key of ['windowId', 'widgetRoutingId', 'rendererPid']) assert.ok(integer(measured.target[key]));
  assert.notEqual(measured.target.windowId, ready.windowId, 'Target borrowed originating window');
  assert.ok(decimal(measured.target.nativeDocumentGeneration)); sink(measured.target.shellSink); sink(measured.target.displaySink);
  assert.ok(integer(measured.shellFrameToken));
  assert.ok(Number.isInteger(measured.feedbackFlags) && measured.feedbackFlags >= 0 && measured.feedbackFlags <= 0xffffffff && (measured.feedbackFlags & 4) !== 0 && (measured.feedbackFlags & 16) === 0, 'No hardware completion');
  assert.ok(Array.isArray(measured.drawn) && measured.drawn.length === 2, 'Missing exact shell+guest inclusion');
  let shell = 0; const surfaces = new Set();
  for (const row of measured.drawn) {
    keys(row, ['surface', 'token', 'surfaceSize', 'visibleBounds']); keys(row.surface, ['frameSink', 'parentSequenceNumber', 'childSequenceNumber', 'embedToken']); sink(row.surface.frameSink);
    assert.ok(integer(row.token) && integer(row.surface.parentSequenceNumber) && integer(row.surface.childSequenceNumber) && token(row.surface.embedToken));
    const id = JSON.stringify(row.surface); assert.ok(!surfaces.has(id), 'Duplicate inclusion'); surfaces.add(id);
    keys(row.surfaceSize, ['width', 'height']); keys(row.visibleBounds, ['x', 'y', 'width', 'height']);
    for (const key of ['width', 'height']) assert.ok(integer(row.surfaceSize[key]) && integer(row.visibleBounds[key]));
    for (const key of ['x', 'y']) assert.ok(Number.isInteger(row.visibleBounds[key]));
    if (row.surface.frameSink.clientId === measured.target.shellSink.clientId && row.surface.frameSink.sinkId === measured.target.shellSink.sinkId) {
      assert.equal(row.token, measured.shellFrameToken); shell++;
    }
  }
  assert.equal(shell, 1, 'Target shell token absent or ambiguous');
  keys(measured, ['producer', 'version', 'status', 'reason', 'measured', ...identity, ...timestamps.slice(1), 'elapsedUs', 'target', 'shellFrameToken', 'feedbackFlags', 'drawn']);
  return { ready, measured, elapsedMs: Number(BigInt(measured.elapsedUs)) / 1000 };
}
