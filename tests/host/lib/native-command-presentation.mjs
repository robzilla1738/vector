import assert from 'node:assert/strict';
const readyPrefix = 'AUX_NATIVE_COMMAND_PRESENTATION_READY_V1 ';
const scopeKeys = ['producer', 'version', 'sampleSequence', 'windowId', 'widgetRoutingId', 'rendererPid', 'nativeDocumentGeneration', 'frameSinkClientId', 'frameSinkSinkId', 'resultsSource', 'surfaceMode'];
const ticks = ['nativeInputUs', 'nativeReceiptUs', 'rendererInputUs', 'mutationUs', 'commitUs', 'submittedUs', 'receivedUs', 'embeddedUs', 'drawUs', 'presentationUs'];
function keys(value, expected) { assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), 'Unexpected command receipt fields'); }
function parse(raw) {
  assert.equal(typeof raw, 'string'); assert.ok(Buffer.byteLength(raw) <= 4000);
  // Chromium retains doubles as e.g. 6.0; do not rewrite original scalar bytes.
  assert.ok(raw.startsWith('{') && raw.endsWith('}'));
  const property = /"((?:[^"\\]|\\.)*)":(?:"(?:[^"\\]|\\.)*"|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?|true|false|null)/y;
  const seen = new Set(); let offset = 1;
  while (offset < raw.length - 1) {
    property.lastIndex = offset; const match = property.exec(raw); assert.ok(match, 'Invalid flat native record');
    const key = JSON.parse('"' + match[1] + '"'); assert.ok(!seen.has(key), 'Duplicate command receipt field'); seen.add(key);
    offset = property.lastIndex;
    if (offset < raw.length - 1) { assert.equal(raw[offset], ','); offset++; assert.ok(offset < raw.length - 1); }
  }
  assert.equal(offset, raw.length - 1);
  const value = JSON.parse(raw);
  assert.ok(value && typeof value === 'object' && !Array.isArray(value)); return value;
}
function positive(value) { assert.ok(Number.isSafeInteger(value) && value > 0); }
function counter(value) { assert.equal(typeof value, 'string'); assert.match(value, /^[1-9][0-9]*$/); assert.ok(BigInt(value) <= 9007199254740991n); }
function scope(value) {
  assert.equal(value.producer, 'aux-native-command-presentation'); assert.equal(value.version, 1);
  counter(value.sampleSequence); counter(value.nativeDocumentGeneration);
  for (const field of ['windowId', 'widgetRoutingId', 'rendererPid', 'frameSinkClientId', 'frameSinkSinkId']) positive(value[field]);
  assert.ok(['new-tab', 'edit', 'command'].includes(value.surfaceMode), 'Mode was not observed');
  assert.equal(value.resultsSource, value.surfaceMode === 'command' ? 'registry' : 'history', 'Observed mode/source mismatch');
}
export function decodeNativeCommandReady(raw) {
  assert.equal(typeof raw, 'string'); assert.ok(raw.startsWith(readyPrefix));
  const value = parse(raw.slice(readyPrefix.length)); keys(value, [...scopeKeys, 'status']); scope(value); assert.equal(value.status, 'ready');
  return Object.freeze(value);
}
// Original READY and final raw bodies are mandatory; parsed caller labels grant nothing.
export function decodeNativeCommandPresentation(raw, originalReadyRaw) {
  const ready = decodeNativeCommandReady(originalReadyRaw), value = parse(raw);
  keys(value, [...scopeKeys, ...ticks, 'rendererMeasured', 'rendererFailure', 'frameToken', 'activated', 'submittedFrame', 'submissionFailure', 'feedbackFlags', 'nativeInputSourcePid', 'measured', 'elapsedMs', 'status']);
  scope(value); for (const field of scopeKeys) assert.equal(value[field], ready[field], `Changed original READY ${field}`);
  assert.equal(value.status, 'measured'); assert.equal(value.measured, true); assert.equal(value.rendererMeasured, true);
  assert.equal(value.rendererFailure, 0); assert.equal(value.activated, true); assert.equal(value.submittedFrame, true);
  positive(value.frameToken); assert.ok(value.frameToken <= 0xffffffff);
  assert.ok(Number.isInteger(value.submissionFailure) && value.submissionFailure < 0);
  assert.ok(Number.isInteger(value.feedbackFlags) && value.feedbackFlags >= 0 && value.feedbackFlags <= 0xffffffff);
  assert.ok((value.feedbackFlags & 4) !== 0 && (value.feedbackFlags & 16) === 0, 'Missing successful hardware completion');
  assert.ok(Number.isInteger(value.nativeInputSourcePid) && value.nativeInputSourcePid >= 0);
  const time = Object.fromEntries(ticks.map(field => { counter(value[field]); return [field, BigInt(value[field])]; }));
  assert.equal(time.nativeInputUs, time.rendererInputUs, 'Different original input clocks');
  assert.ok(time.nativeReceiptUs >= time.nativeInputUs && time.nativeReceiptUs <= time.presentationUs);
  const ordered = ['nativeInputUs', 'mutationUs', 'commitUs', 'submittedUs', 'receivedUs', 'embeddedUs', 'drawUs', 'presentationUs'];
  for (let index = 1; index < ordered.length; index++) assert.ok(time[ordered[index]] >= time[ordered[index - 1]], 'Broken command causal timing');
  const elapsedUs = time.presentationUs - time.nativeInputUs;
  assert.ok(elapsedUs <= 5000000n); assert.equal(value.elapsedMs, Number(elapsedUs) / 1000);
  return Object.freeze({ ...value, elapsedUs: String(elapsedUs), firstFrameProven: false, ordinaryNavigationTimingProven: false, datasetCardinalityProven: false, nativeQualificationProven: false });
}

// Extract the original nested body without serializing parsed native evidence.
export function extractNativeCommandFixtureRecord(raw) {
  assert.equal(typeof raw, 'string'); assert.ok(Buffer.byteLength(raw) <= 16384);
  const prefix = 'AUX_NATIVE_FIXTURE_REPLY_V1 '; assert.ok(raw.startsWith(prefix));
  const body = raw.slice(prefix.length), string = /"(?:[^"\\]|\\.)*"/y;
  const scalar = /(?:"(?:[^"\\]|\\.)*"|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|true|false|null)/y;
  let offset = 0, recordRaw;
  function object(depth) {
    assert.ok(depth <= 2); assert.equal(body[offset++], '{'); const seen = new Set();
    if (body[offset] === '}') { offset++; return; }
    while (offset < body.length) {
      string.lastIndex = offset; const keyToken = string.exec(body); assert.ok(keyToken); offset = string.lastIndex;
      const key = JSON.parse(keyToken[0]); assert.ok(!seen.has(key), 'Duplicate original fixture field'); seen.add(key);
      assert.equal(body[offset++], ':'); const start = offset;
      if (body[offset] === '{') object(depth + 1);
      else { scalar.lastIndex = offset; assert.ok(scalar.exec(body)); offset = scalar.lastIndex; }
      if (depth === 1 && key === 'record') { assert.equal(body[start], '{'); recordRaw = body.slice(start, offset); }
      if (body[offset] === '}') { offset++; return; }
      assert.equal(body[offset++], ',');
    }
    assert.fail('Incomplete original fixture object');
  }
  object(1); assert.equal(offset, body.length); assert.equal(typeof recordRaw, 'string');
  return recordRaw;
}
