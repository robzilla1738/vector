import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRawStartupBudgets } from './startup-gates.mjs';
const samples = value => Array(20).fill(value);
const base = { firstFrameUs: samples('800000'), interactiveUs: samples('800000'), helloAckUs: samples('1000000'), stockFirstFrameUs: samples('800000') };
test('native microsecond boundaries retain original strings and exact nearest ranks', () => {
  const result = evaluateRawStartupBudgets(base); assert.equal(result.arithmeticPass, true);
  assert.equal(result.firstFrame.p50Us, '800000'); assert.deepEqual(result.firstFrame.rawUs, base.firstFrameUs);
});
test('one microsecond violation never rounds into a pass', () => {
  const result = evaluateRawStartupBudgets({ ...base, firstFrameUs: samples('800001') }); assert.equal(result.checks.firstFrameP50, false);
});
test('stock +10 percent comparison uses exact cross multiplication above safe integer precision', () => {
  const stock = '9007199254740993', aux = '9907919180215093';
  const result = evaluateRawStartupBudgets({ ...base, firstFrameUs: samples(aux), stockFirstFrameUs: samples(stock) });
  assert.equal(result.checks.stockFirstFrameP50, false); assert.equal(result.firstFrame.p50Us, aux);
});
test('p95 outlier and missing or numeric endpoints cannot be omitted', () => {
  const values = samples('800000'); values[18] = '1500001'; values[19] = '1500002';
  assert.equal(evaluateRawStartupBudgets({ ...base, firstFrameUs: values }).checks.firstFrameP95, false);
  for (const invalid of [samples(800000), ['1'], samples('0'), undefined]) assert.throws(() => evaluateRawStartupBudgets({ ...base, firstFrameUs: invalid }));
});
test('hello and interactive remain independent original endpoint datasets', () => {
  assert.equal(evaluateRawStartupBudgets({ ...base, helloAckUs: samples('1000001') }).checks.helloAckP50, false);
  assert.equal(evaluateRawStartupBudgets({ ...base, interactiveUs: samples('800001') }).checks.interactiveP50, false);
});
