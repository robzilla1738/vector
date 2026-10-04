import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluatePipTrials } from './native-pip-collector.mjs';
// Synthetic parser/cohort falsification only. No literal below is admission,
// hardware feedback, AC qualification or a genuinely executed native sample.
function cohort(elapsedUs = 900n) {
  return ['video-pip', 'document-pip'].flatMap((kind, group) => Array.from({ length: 20 }, (_, index) => {
    const ordinal = group * 20 + index + 1, start = BigInt(ordinal) * 10_000_000n;
    const pageId = `00000000-0000-4000-8000-${String(ordinal).padStart(12, '0')}`;
    const ready = { producer: 'aux-native-pip-root-presentation', version: 1, status: 'ready', reason: 'original_native_arm', measured: false,
      metric: 'pip-window', startKind: 'native-arm-upperbound', rootHardwareCoverage: true, videoGuestCoverage: false, earliestPresentationProven: false, firstFrameProven: false,
      requestNonce: ordinal.toString(16).padStart(32, '0'), sourcePageId: pageId, windowId: 1, widgetRoutingId: 2, rendererPid: 3,
      shellSink: { clientId: 1, sinkId: 2 }, displaySink: { clientId: 1, sinkId: 3 }, armedUs: String(start), deadlineUs: String(start + 5_000_000n) };
    const target = { targetWidgetReceipt: (100 + ordinal).toString(16).padStart(32, '0'), surfaceKind: kind, createdUs: String(start + 100n), registeredUs: String(start + 200n), displayGeneration: '1' };
    const measured = { ...ready, ...target, status: 'measured', reason: 'created_native_pip_root_hardware_upperbound', measured: true,
      readyUs: String(start + 300n), commitUs: String(start + 400n), submittedUs: String(start + 500n), drawUs: String(start + 600n), swapStartUs: String(start + 700n), swapEndUs: String(start + 800n),
      presentedUs: String(start + elapsedUs), observedUs: String(start + elapsedUs + 100n), elapsedUs: String(elapsedUs),
      rootSurface: { frameSink: { clientId: 1, sinkId: ordinal + 4 }, parentSequenceNumber: 1, childSequenceNumber: 1, embedToken: 'c'.repeat(32) }, frameToken: ordinal, output: [0, 0, 400, 300], feedbackFlags: 4, alphaReadbackAttempted: false };
    const retired = { ...ready, ...target, producer: 'aux-native-pip-root-retirement', status: 'retired', reason: 'original_native_widget_destroyed', nativeWidgetDestroyed: true, destroyedUs: String(start + elapsedUs + 200n) };
    return { kind, trial: index + 1, status: 'measured', pageId, powerBefore: "Now drawing from 'AC Power'", powerAfter: "Now drawing from 'AC Power'", close: { ok: true }, originalPageAbsent: true,
      readyRaw: JSON.stringify(ready), measuredRaw: JSON.stringify(measured), retiredRaw: JSON.stringify(retired) };
  }));
}
test('requires twenty nonoverlapping fresh native source/Widget lifetimes for each kind', () => {
  assert.deepEqual(evaluatePipTrials(cohort(), 20).map(row => [row.trials, row.maxMs, row.pass]), [[20, 0.9, true], [20, 0.9, true]]);
  assert.throws(() => evaluatePipTrials(cohort().slice(1), 20));
  const reused = cohort(); reused[1] = { ...reused[0], trial: 2 }; assert.throws(() => evaluatePipTrials(reused, 20), /reused/);
});
test('retains max500 gate and unrounded failing boundary', () => {
  assert.equal(evaluatePipTrials(cohort(500_000n), 20)[0].pass, true);
  assert.equal(evaluatePipTrials(cohort(500_001n), 20)[0].maxMs, 500.001);
  assert.equal(evaluatePipTrials(cohort(500_001n), 20)[0].pass, false);
});
test('refuses battery, missing cleanup ACK and source absence without native destruction', () => {
  for (const mutate of [row => { row.powerAfter = "Now drawing from 'Battery Power'"; }, row => { row.close.ok = false; }, row => { row.originalPageAbsent = false; }, row => { row.retiredRaw = row.retiredRaw.replace('"nativeWidgetDestroyed":true', '"nativeWidgetDestroyed":false'); }]) {
    const rows = cohort(); mutate(rows[0]); assert.throws(() => evaluatePipTrials(rows, 20));
  }
});
