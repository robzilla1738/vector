// Synthetic protocol controls, never physical input or performance qualification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeNativeCommandReady, decodeNativeCommandPresentation } from './native-command-presentation.mjs';
const scope = { producer: 'aux-native-command-presentation', version: 1, sampleSequence: '1', windowId: 2, widgetRoutingId: 3, rendererPid: 4, nativeDocumentGeneration: '5', frameSinkClientId: 6, frameSinkSinkId: 7, resultsSource: 'history', surfaceMode: 'new-tab' };
const ready = value => 'AUX_NATIVE_COMMAND_PRESENTATION_READY_V1 ' + JSON.stringify({ ...value, status: 'ready' });
const sample = () => ({ ...scope, rendererMeasured: true, rendererFailure: 0, frameToken: 9, activated: true, submittedFrame: true, submissionFailure: -1, feedbackFlags: 4, nativeInputUs: '1000000', nativeReceiptUs: '1000010', rendererInputUs: '1000000', mutationUs: '1001000', commitUs: '1002000', submittedUs: '1003000', receivedUs: '1004000', embeddedUs: '1005000', drawUs: '1006000', presentationUs: '1030004', nativeInputSourcePid: 0, measured: true, elapsedMs: 30.004, status: 'measured' });
test('all actual mode/source pairs retain fractional native hardware interval and no cardinality label', () => {
  for (const surfaceMode of ['new-tab', 'edit', 'command']) {
    const value = { ...sample(), surfaceMode, resultsSource: surfaceMode === 'command' ? 'registry' : 'history' };
    const result = decodeNativeCommandPresentation(JSON.stringify(value), ready(valueScope(value)));
    assert.equal(result.elapsedUs, '30004'); assert.ok(result.elapsedMs > 30); assert.equal(result.datasetCardinalityProven, false); assert.equal(result.nativeQualificationProven, false);
  }
});
function valueScope(value) { return Object.fromEntries(Object.keys(scope).map(key => [key, value[key]])); }
for (const [name, mutate] of [
  ['foreign READY mode', value => { value.surfaceMode = 'edit'; }],
  ['changed sample', value => { value.sampleSequence = '2'; }],
  ['changed document', value => { value.nativeDocumentGeneration = '6'; }],
  ['software feedback', value => { value.feedbackFlags = 0; }],
  ['failed feedback', value => { value.feedbackFlags = 20; }],
  ['different renderer input', value => { value.rendererInputUs = '1000001'; }],
  ['receipt before input', value => { value.nativeReceiptUs = '999999'; }],
  ['received before submit', value => { value.receivedUs = '1002999'; }],
  ['missing activation', value => { value.activated = false; }],
  ['failed submit', value => { value.submissionFailure = 0; }],
  ['invented elapsed', value => { value.elapsedMs = 30; }],
  ['overflow timestamp', value => { value.presentationUs = '9007199254740992'; }],
]) test(`original command pair refuses ${name}`, () => { const value = sample(); mutate(value); assert.throws(() => decodeNativeCommandPresentation(JSON.stringify(value), ready(scope))); });
test('duplicate/extra fields and unobserved or inconsistent READY refuse', () => {
  assert.throws(() => decodeNativeCommandReady(ready({ ...scope, surfaceMode: 'unknown' })));
  assert.throws(() => decodeNativeCommandReady(ready({ ...scope, surfaceMode: 'command' })));
  assert.throws(() => decodeNativeCommandPresentation(JSON.stringify({ ...sample(), callerMode: 'new-tab' }), ready(scope)));
  assert.throws(() => decodeNativeCommandPresentation(JSON.stringify(sample()).replace('{', '{"windowId":2,'), ready(scope)));
});

test('actual Chromium integer-valued double serialization remains original', () => {
  const raw = JSON.stringify(sample()).replace('"frameSinkClientId":6', '"frameSinkClientId":6.0');
  assert.ok(raw.includes('"frameSinkClientId":6.0'));
  assert.equal(decodeNativeCommandPresentation(raw, ready(scope)).frameSinkClientId, 6);
});
