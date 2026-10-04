import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePipPresentationPair, validatePipPresentationRetirement } from './native-pip-performance-protocol.mjs';
// Synthetic decoder falsification only: these literals are never native proof.
function specimen() {
  const ready = {
    producer: 'aux-native-pip-root-presentation', version: 1, status: 'ready', reason: 'original_native_arm', measured: false,
    metric: 'pip-window', startKind: 'native-arm-upperbound', rootHardwareCoverage: true, videoGuestCoverage: false,
    earliestPresentationProven: false, firstFrameProven: false, requestNonce: 'a'.repeat(32),
    sourcePageId: '00000000-0000-4000-8000-000000000001', windowId: 1, widgetRoutingId: 2, rendererPid: 3,
    shellSink: { clientId: 1, sinkId: 2 }, displaySink: { clientId: 1, sinkId: 3 }, armedUs: '1000000', deadlineUs: '6000000',
  };
  const target = { targetWidgetReceipt: 'b'.repeat(32), surfaceKind: 'video-pip', createdUs: '1000100', registeredUs: '1000200', displayGeneration: '1' };
  const measured = { ...ready, ...target, status: 'measured', reason: 'created_native_pip_root_hardware_upperbound', measured: true,
    readyUs: '1000300', commitUs: '1000400', submittedUs: '1000500', drawUs: '1000600', swapStartUs: '1000700', swapEndUs: '1000800', presentedUs: '1000900', observedUs: '1001000', elapsedUs: '900',
    rootSurface: { frameSink: { clientId: 1, sinkId: 4 }, parentSequenceNumber: 1, childSequenceNumber: 1, embedToken: 'c'.repeat(32) }, frameToken: 1,
    output: [0, 0, 400, 300], feedbackFlags: 4, alphaReadbackAttempted: false,
  };
  const retired = { ...ready, ...target, producer: 'aux-native-pip-root-retirement', status: 'retired', reason: 'original_native_widget_destroyed', nativeWidgetDestroyed: true, destroyedUs: '1001100' };
  return { ready, measured, retired };
}
const raw = value => JSON.stringify(value);
const pair = value => validatePipPresentationPair(raw(value.ready), raw(value.measured));
const retirement = value => validatePipPresentationRetirement(raw(value.ready), raw(value.measured), raw(value.retired));
test('retains unrounded whole native upperbound with explicit root-only coverage', () => {
  const value = specimen(); value.measured.presentedUs = '1000901'; value.measured.observedUs = '1001001'; value.measured.elapsedUs = '901';
  const actual = retirement(value); assert.equal(actual.elapsedMs, 0.901); assert.equal(actual.measured.videoGuestCoverage, false); assert.equal(actual.measured.firstFrameProven, false);
});
test('requires original exact Widget destruction rather than Hide or receipt replacement', () => {
  for (const mutation of [r => { r.nativeWidgetDestroyed = false; }, r => { r.targetWidgetReceipt = 'd'.repeat(32); }, r => { delete r.destroyedUs; }]) {
    const value = specimen(); mutation(value.retired); assert.throws(() => retirement(value));
  }
});
test('refuses equality at the original five-second deadline for measurement and cleanup', () => {
  const measured = specimen(); measured.measured.observedUs = measured.ready.deadlineUs; assert.throws(() => pair(measured));
  const retired = specimen(); retired.retired.destroyedUs = retired.ready.deadlineUs; assert.throws(() => retirement(retired));
});
test('rejects rewritten start, source, root sink and native frame identity', () => {
  for (const mutation of [m => { m.armedUs = '1000001'; }, m => { m.sourcePageId = '00000000-0000-4000-8000-000000000002'; }, m => { m.rootSurface.frameSink = { clientId: 1, sinkId: 3 }; }, m => { m.frameToken = 0; }]) {
    const value = specimen(); mutation(value.measured); assert.throws(() => pair(value));
  }
});
test('rejects guessed earliest/video coverage or missing hardware completion', () => {
  for (const mutation of [m => { m.earliestPresentationProven = true; }, m => { m.videoGuestCoverage = true; }, m => { m.firstFrameProven = true; }, m => { m.feedbackFlags = 0; }, m => { m.feedbackFlags = 20; }]) {
    const value = specimen(); mutation(value.measured); assert.throws(() => pair(value));
  }
});
test('retains original lexical bytes and rejects duplicated nested native fields', () => {
  const value = specimen(); const original = raw(value.measured).replace('"frameToken":1', '"frameToken":1.0');
  assert.ok(original.includes('"frameToken":1.0')); assert.equal(validatePipPresentationPair(raw(value.ready), original).measured.frameToken, 1); assert.ok(original.includes('"frameToken":1.0'));
  assert.throws(() => validatePipPresentationPair(raw(value.ready), raw(value.measured).replace('"frameToken":1', '"frameToken":1,"frameToken":2')));
  assert.throws(() => validatePipPresentationPair(raw(value.ready), original.replace('"sinkId":4', '"sinkId":4,"sinkId":5')));
});
test('rejects original native refusal and causal reversal without substituting a later frame', () => {
  const refused = specimen(); refused.measured.status = 'refused'; refused.measured.measured = false; refused.measured.reason = 'original_full_root_paint_refused'; assert.throws(() => pair(refused), /original_full_root_paint_refused/);
  const reversed = specimen(); reversed.measured.commitUs = '1000201'; assert.throws(() => pair(reversed));
});
