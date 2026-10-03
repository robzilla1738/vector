import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { stockStartupPrefix, validateStockStartupPresentation } from './native-stock-startup-protocol.mjs';

// Synthetic decoder controls only: no native launch, kernel audit or timing
// measurement is performed. Production callers must retain original receipts.
function fixture() {
  const launch = { receiptSha256: '1'.repeat(64), record: { kind: 'stock', trial: '2'.repeat(32),
    nonce: '33333333-3333-4333-8333-333333333333', launcherPid: 111, browserPid: 222, helperBinarySha256: '4'.repeat(64),
    helperSourceSha256: '5'.repeat(64), launchMachTicks: '100', spawnReturnedMachTicks: '110' } };
  const record = { producer: 'aux-native-stock-startup-presentation', version: 1, status: 'measured',
    reason: 'first_full_interactive_stock_native_root_hardware', measured: true, earliestPresentationProven: true,
    trial: launch.record.trial, launchReceiptNonce: launch.record.nonce, launchReceiptSha256: launch.receiptSha256,
    launcherPid: 111, browserPid: 222, helperBinarySha256: launch.record.helperBinarySha256,
    helperSourceSha256: launch.record.helperSourceSha256, helperProcessUuid: '6'.repeat(32), helperProcessStart: '1',
    launchMachTicks: '100', spawnReturnedMachTicks: '110', launchedUs: '1000', spawnReturnedUs: '1010',
    deadlineUs: '5001000', browserWindowId: 1, displayGeneration: '1', documentReceipt: '7'.repeat(32),
    measurementNonce: '8'.repeat(32), sampleSequence: '1', registeredUs: '1020', typeableObservedUs: '1030',
    commitUs: '1040', submittedUs: '1050', drawUs: '1060', swapStartUs: '1070', swapEndUs: '1080',
    presentedUs: '1090', observedUs: '1100', elapsedUs: '90', rootFrameToken: 10,
    rootSurface: { frameSink: { clientId: 1, sinkId: 2 }, parentSequenceNumber: 1, childSequenceNumber: 1,
      embedToken: '9'.repeat(32) }, rootBounds: [0, 0, 800, 600], feedbackFlags: 4, alphaReadbackAttempted: false };
  return { launch, record, pins: { helperImageUuid: '6'.repeat(32) } };
}
const raw = record => `${stockStartupPrefix}${JSON.stringify(record)}\n`;
test('preserves original Stock raw identity and integer elapsed without claiming cold qualification', () => {
  const { launch, record, pins } = fixture(); const original = raw(record);
  const result = validateStockStartupPresentation(original, launch, pins);
  assert.equal(result.raw, original); assert.equal(result.rawSha256, createHash('sha256').update(original).digest('hex'));
  assert.equal(result.elapsedUs, '90'); assert.equal(result.classificationProven, false);
  assert.throws(() => { result.record.rootSurface.embedToken = 'a'.repeat(32); }, TypeError);
});
test('Aux launch and abbreviated SurfaceId are not Stock native root evidence', () => {
  const { launch, record, pins } = fixture(); launch.record.kind = 'aux';
  assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins)); launch.record.kind = 'stock';
  record.rootSurface.embedToken = '9999...'; assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins));
});
test('software, failed and partial root records fail closed', () => {
  for (const flags of [0, 16, 20]) {
    const { launch, record, pins } = fixture(); record.feedbackFlags = flags;
    assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins));
  }
  for (const bounds of [[1, 0, 800, 600], [0, 0, 0, 600], [0, 0, 800, 600, 1]]) {
    const { launch, record, pins } = fixture(); record.rootBounds = bounds;
    assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins));
  }
});
test('causal submission, exact deadline and original elapsed cannot be replaced by rounded values', () => {
  for (const change of [{ submittedUs: '1039' }, { observedUs: '5001001' }, { elapsedUs: '91' },
    { deadlineUs: '5001001' }, { launchedUs: 1000 }, { elapsedUs: '090' }]) {
    const { launch, record, pins } = fixture(); Object.assign(record, change);
    assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins));
  }
});
test('original helper, receipt, native one-use sequence and root fields remain exact', () => {
  for (const change of [{ helperProcessUuid: 'a'.repeat(32) }, { launchReceiptNonce: 'b'.repeat(32) },
    { launchReceiptSha256: 'c'.repeat(64) }, { browserPid: 111 }, { sampleSequence: '2' },
    { runtimeHelloUs: '1100' }, { rootFrameToken: 0 }]) {
    const { launch, record, pins } = fixture(); Object.assign(record, change);
    assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins));
  }
});
test('native refusal and malformed or concatenated stderr never become measurements', () => {
  const { launch, record, pins } = fixture();
  assert.throws(() => validateStockStartupPresentation(raw({ producer: record.producer, version: 1,
    status: 'refused', reason: 'first_eligible_native_paint_before_launch_admission', measured: false,
    earliestPresentationProven: false }), launch, pins), /native Stock startup refusal/);
  for (const value of [raw(record).slice(0, -1), raw(record) + raw(record), raw(record).replace(stockStartupPrefix, 'AUX_NATIVE_STARTUP_V1 ')])
    assert.throws(() => validateStockStartupPresentation(value, launch, pins));
});

test('duplicate identity and nested native root keys fail raw admission', () => {
  const { launch, record, pins } = fixture();
  for (const [needle, replacement] of [
    ['"browserPid":222', '"browserPid":999,"browserPid":222'],
    ['"rootFrameToken":10', '"rootFrameToken":999,"rootFrameToken":10'],
    ['"clientId":1', '"clientId":999,"clientId":1'],
    ['"embedToken":"' + '9'.repeat(32) + '"', '"embedToken":"' + 'a'.repeat(32) + '","embedToken":"' + '9'.repeat(32) + '"'],
  ]) {
    const original = raw(record); assert.ok(original.includes(needle));
    assert.throws(() => validateStockStartupPresentation(original.replace(needle, replacement), launch, pins), /Noncanonical/);
  }
});
test('whitespace, decimal, exponent and escaped field variants fail raw admission', () => {
  const { launch, record, pins } = fixture(); const original = raw(record);
  for (const variant of [original.replace('{', '{ '), original.replace('"rootFrameToken":10', '"rootFrameToken":10.0'),
    original.replace('"rootFrameToken":10', '"rootFrameToken":1e1'),
    original.replace('"version"', '"\\u0076ersion"')])
    assert.throws(() => validateStockStartupPresentation(variant, launch, pins), /Noncanonical/);
});
test('registration before original spawn return is refused even with ordered paint timestamps', () => {
  const { launch, record, pins } = fixture(); record.registeredUs = '1005';
  assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins), /registration preceded/);
});

test('original Stock GPU instrumentation is retained, unknown never becomes matched comparison', () => {
  for (const value of [false, true]) {
    const { launch, record, pins } = fixture(); record.alphaReadbackAttempted = value;
    const result = validateStockStartupPresentation(raw(record), launch, pins);
    assert.equal(result.instrumentation.alphaReadbackAttempted, value);
    assert.equal(result.relativeComparisonProven, false);
  }
  for (const value of [null, undefined, 0, 'false']) {
    const { launch, record, pins } = fixture(); record.alphaReadbackAttempted = value;
    assert.throws(() => validateStockStartupPresentation(raw(record), launch, pins));
  }
});
