import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRunningPartial, assertCancelledPartial, assertMergedRetry, requireImportInterruptionAppearance, readInterruptionHistory, readStableInterruptionDestinations } from './setup-import-interruption.mjs';
const selected = [{ sourceId: 'chrome', profileId: 'Default', categories: ['history'] }];
const running = { jobId: 'original', done: false, cancelled: false, selections: selected, progress: [{ source: 'chrome', profileId: 'Default', category: 'history', state: 'running', imported: 500, skipped: 0 }] };
const cancelled = { ...running, done: true, cancelled: true, progress: [{ ...running.progress[0], state: 'done' }] };
const retry = { ...cancelled, jobId: 'retry', cancelled: false, progress: [{ ...cancelled.progress[0], imported: 4501, skipped: 500 }] };
test('partial running is mandatory; first completion or declared zero work cannot prove interruption', () => {
  assertRunningPartial(running);
  for (const patch of [{ done: true }, { cancelled: true }, { progress: [{ ...running.progress[0], imported: 0 }] }, { progress: [{ ...running.progress[0], imported: 5001 }] }, { progress: [{ ...running.progress[0], state: 'done' }] }]) assert.throws(() => assertRunningPartial({ ...running, ...patch }));
});
test('actual cancelled partial receipt required, then distinct reviewed merge preserves exact total', () => {
  assertCancelledPartial(cancelled); assertMergedRetry(retry, cancelled);
  assert.throws(() => assertCancelledPartial({ ...cancelled, cancelled: false }));
  assert.throws(() => assertMergedRetry({ ...retry, jobId: 'original' }, cancelled));
  assert.throws(() => assertMergedRetry({ ...retry, progress: [{ ...retry.progress[0], skipped: 0 }] }, cancelled));
});
test('only exact interruption appearance ID and original paired appearance flag admitted', () => {
  const base = { journeyId: 'setup-import-interruption-appearance', appearance: true, pair: '/original' }; requireImportInterruptionAppearance(base);
  for (const patch of [{ journeyId: 'setup-import-appearance' }, { appearance: false }, { pair: null }]) assert.throws(() => requireImportInterruptionAppearance({ ...base, ...patch }));
});
const rows = Array.from({ length: 5001 }, (_, i) => { const id = 5001 - i; return { url: `http://127.0.0.1:32123/setup/interrupt-history/${id}`, title: `Synthetic interruption history ${id}`, visitedAt: id * 1000 }; });
test('bounded original cursor pagination reads exact5001 independent destination rows', async () => {
  const calls = [];
  const result = await readInterruptionHistory(async (method, params) => {
    assert.equal(method, 'history.list'); assert.equal(params.limit, 500); calls.push(params);
    return rows.filter(row => !params.before || row.visitedAt < params.before.visitedAt).slice(0, 500);
  }, 'http://127.0.0.1:32123');
  assert.deepEqual(result, rows); assert.equal(calls.length, 11); assert.equal(calls[1].before.url, rows[499].url);
});
test('foreign URL, duplicate, wrong title and oversized destination batches refuse', async () => {
  for (const candidate of [[{ ...rows[0], url: 'http://example.com/private' }], [rows[0], rows[0]], [{ ...rows[0], title: 'Foreign' }], rows.slice(0, 501)]) await assert.rejects(readInterruptionHistory(async () => candidate, 'http://127.0.0.1:32123'));
});

test('original native projection count drift waits rather than inventing a stable destination proof', async () => {
  let counts = 0;
  assert.equal(await readStableInterruptionDestinations(async method => method === 'history.count' ? { count: counts++ ? 1 : 0 } : [rows[0]], 'http://127.0.0.1:32123'), null);
  assert.deepEqual(await readStableInterruptionDestinations(async method => method === 'history.count' ? { count: 1 } : [rows[0]], 'http://127.0.0.1:32123'), [rows[0]]);
  await assert.rejects(readStableInterruptionDestinations(async method => method === 'history.count' ? { count: 2 } : [rows[0]], 'http://127.0.0.1:32123'), /Stable fresh Profile/);
});
