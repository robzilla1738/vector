import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUntil } from '../host/lib/until.mjs';

test('numeric deadline and requested interval options both execute real predicates', async () => {
  const until = createUntil(new AbortController().signal);
  assert.equal(await until('numeric', () => 'ready', 100), 'ready');
  let calls = 0;
  assert.equal(await until('options', () => ++calls === 3 && 'ready', { intervalMs: 1, timeoutMs: 100 }), 'ready');
  assert.equal(calls, 3);
});
test('failed predicates obey actual deadline', async () => {
  const until = createUntil(new AbortController().signal);
  await assert.rejects(until('missing', () => false, { timeoutMs: 10, intervalMs: 1 }), /Timed out: missing/);
});
test('invalid bounds or ignored option keys refuse before predicate', async () => {
  const until = createUntil(new AbortController().signal);
  for (const options of [NaN, 0, 120001, [], null, { intervalMs: 0 }, { intervalMs: 1001 }, { timeoutMs: 1, typo: 1 }]) {
    await assert.rejects(until('invalid', () => { throw new Error('predicate must not run'); }, options), /Invalid/);
  }
});
test('abort during predicate withholds success', async () => {
  const controller = new AbortController(), until = createUntil(controller.signal);
  await assert.rejects(until('abort', () => { controller.abort(new Error('stop')); return true; }), /stop/);
});
