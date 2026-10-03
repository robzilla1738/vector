import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStockStartupNativeStream } from './startup-stock-native-stream.mjs';
const prefix = 'AUX_NATIVE_STOCK_STARTUP_V1 ';
const refusal = prefix + JSON.stringify({ producer: 'aux-native-stock-startup-presentation', version: 1,
  status: 'refused', measured: false, earliestPresentationProven: false, reason: 'lost_original_scope' }) + '\n';
const launch = { receiptSha256: 'a'.repeat(64), record: { kind: 'stock' } };
const helper = { helperImageUuid: 'b'.repeat(32) };
test('incremental original native refusal rejects pending measurement, never counts a line', async () => {
  const stream = createStockStartupNativeStream();
  const measured = stream.measured(launch, helper);
  for (const byte of Buffer.from(refusal)) stream.push(Buffer.from([byte]));
  await assert.rejects(measured, /lost_original_scope/);
  stream.finish();
});
test('late duplicate poisons completed stream even after original line arrives', async () => {
  const stream = createStockStartupNativeStream(); stream.push(Buffer.from(refusal));
  assert.throws(() => stream.push(Buffer.from(refusal)), /Repeated/);
  stream.finish(); assert.throws(() => stream.assertComplete(), /Repeated/);
  await assert.rejects(stream.measured(launch, helper), /Repeated/);
});
test('Aux receipt and unknown diagnostics cannot satisfy Stock endpoint', async () => {
  const stream = createStockStartupNativeStream();
  stream.push(Buffer.from('AUX_NATIVE_STARTUP_V1 {}\nGPU diagnostic\n')); stream.finish();
  await assert.rejects(stream.measured(launch, helper), /Missing/);
});
test('malformed UTF8, NUL and bounded line refuse without hanging a pending consumer', async () => {
  for (const bytes of [Buffer.from([0xff]), Buffer.from([0]), Buffer.alloc(16385, 65)]) {
    const stream = createStockStartupNativeStream();
    const measured = stream.measured(launch, helper);
    assert.throws(() => stream.push(bytes)); await assert.rejects(measured);
  }
});
test('truncated prefixed record and retired stream cannot become successful cleanup', async () => {
  const stream = createStockStartupNativeStream(); stream.push(Buffer.from(prefix + '{}'));
  stream.finish(); await assert.rejects(stream.measured(launch, helper), /truncated/);
  assert.throws(() => stream.assertComplete()); assert.throws(() => stream.push(Buffer.from('\n')), /Retired/);
});
test('channel failure after native bytes still rejects original measurement and completion', async () => {
  const stream = createStockStartupNativeStream(); stream.push(Buffer.from(refusal));
  stream.refuse(new Error('Original browser cleanup debt')); stream.finish();
  await assert.rejects(stream.measured(launch, helper), /cleanup debt/);
  assert.throws(() => stream.assertComplete(), /cleanup debt/);
});
