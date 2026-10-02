import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateStartupBudgets, startupDistribution } from './startup-gates.mjs';
const repeated = value => Array(20).fill(value);
const input = () => ({ firstFrameMs: repeated(800), interactiveMs: repeated(800),
  helloAckMs: repeated(1000), stockFirstFrameMs: repeated(800) });
test('retains original order and uses unrounded nearest rank endpoints', () => {
  const samples = Array.from({length: 20}, (_, i) => 20 - i);
  assert.deepEqual(startupDistribution(samples), {count:20,p50Ms:10,p95Ms:19,maxMs:20,rawMs:samples});
});
test('exact thresholds pass arithmetic without claiming qualification', () => {
  assert.equal(evaluateStartupBudgets(input()).arithmeticPass, true);
  assert.equal(Object.hasOwn(evaluateStartupBudgets(input()), 'qualified'), false);
});
test('submillisecond boundary violations do not round into passes', () => {
  for (const key of ['firstFrameMs','interactiveMs','helloAckMs']) {
    const sample = input(); sample[key] = repeated(key === 'helloAckMs' ? 1000.0001 : 800.0001);
    assert.equal(evaluateStartupBudgets(sample).arithmeticPass, false);
  }
});
test('p95 tail violations remain visible while p50 passes', () => {
  const sample = input(); sample.firstFrameMs = [...Array(18).fill(100), 1500.001, 1600];
  const result = evaluateStartupBudgets(sample);
  assert.equal(result.checks.firstFrameP50, true); assert.equal(result.checks.firstFrameP95, false);
});
test('runtime fast acknowledgement cannot replace slow interactive composer', () => {
  const sample = input(); sample.interactiveMs = repeated(1600); sample.helloAckMs = repeated(1);
  const result = evaluateStartupBudgets(sample);
  assert.equal(result.checks.helloAckP50, true); assert.equal(result.checks.interactiveP50, false);
});
test('stock p50 and p95 +10 percent comparisons both retain raw violations', () => {
  const sample = input(); sample.stockFirstFrameMs = repeated(700);
  assert.equal(evaluateStartupBudgets(sample).checks.stockFirstFrameP50, false);
});
test('partial, invalid and zero stock datasets fail instead of dropping trials', () => {
  for (const values of [Array(19).fill(1), repeated(NaN), repeated(-1)])
    assert.throws(() => startupDistribution(values));
  const sample = input(); sample.helloAckMs.push(1); assert.throws(() => evaluateStartupBudgets(sample), /matched/);
  sample.helloAckMs.pop(); sample.stockFirstFrameMs = repeated(0);
  assert.throws(() => evaluateStartupBudgets(sample), /positive/);
});
