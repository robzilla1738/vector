import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { fixturePage } from './lib/fixture.mjs';
import { stockFixtureUrls, createStockMemoryFixture, compactStockMemoryReport, persistStockMemoryReport, stockCleanupDebt, stockCollectionFailure, awaitStockCleanupDebt } from './native-stock-memory.mjs';
function trials(port = 49152) {
  const tabs = Array.from({ length: 10 }, (_, index) => ({ pageId: `page-${index}`, sessionId: `session-${index}`, documentEpoch: 1, url: `http://127.0.0.1:${port}/memory/human-${index + 1}` }));
  return Array.from({ length: 20 }, (_, index) => ({ trial: index + 1, mode: 'idle', status: 'sampled', idleBefore: structuredClone(tabs), idleAfter: structuredClone(tabs) }));
}
test('setup selects ten exact retained URLs from twenty original idle trials', () => {
  const original = trials(); assert.deepEqual(stockFixtureUrls(original), original[0].idleBefore.map(tab => tab.url));
});
test('missing trial, source order drift and unsafe nonfixture URLs refuse', () => {
  assert.throws(() => stockFixtureUrls(trials().slice(1)));
  const reordered = trials(); reordered[2].idleBefore.reverse(); assert.throws(() => stockFixtureUrls(reordered));
  const unsafe = trials(); unsafe[0].idleBefore[0].url = 'http://example.com/memory/human-1'; assert.throws(() => stockFixtureUrls(unsafe));
  const selected = trials(); selected[0].idleBefore[0].url = 'http://127.0.0.1:49152/memory/human-1?pid=2'; assert.throws(() => stockFixtureUrls(selected));
});
test('unchanged URL cannot hide original attachment/document change within a trial', () => {
  const source = trials(); source[7].idleAfter[0].documentEpoch++; assert.throws(() => stockFixtureUrls(source));
});
test('compact evidence retains refused/failed originals and removes only decoded clones', () => {
  const raw = '{"producer":"original","status":"refused"}';
  const observation = { raw, receipt: { raw: 'original envelope', recordRaw: raw }, before: { power: 'actual' }, after: { power: 'actual' }, native: { redundant: true }, decoded: { redundant: true }, transportRefusalRaw: 'actual refusal' };
  const report = { setup: [{ status: 'refused', observation }], trials: [{ status: 'failed', error: 'original failure', observation }], cleanupFailures: [{ message: 'actual cleanup' }] };
  const compact = compactStockMemoryReport(report);
  assert.equal(compact.trials[0].observation.raw, raw); assert.deepEqual(compact.trials[0].observation.receipt, observation.receipt);
  assert.equal(compact.setup[0].observation.transportRefusalRaw, 'actual refusal'); assert.equal(compact.trials[0].error, 'original failure'); assert.deepEqual(compact.cleanupFailures, report.cleanupFailures);
  assert.equal(Object.hasOwn(compact.trials[0].observation, 'native'), false); assert.equal(Object.hasOwn(compact.trials[0].observation, 'decoded'), false);
  assert.deepEqual(report.trials[0].observation.native, { redundant: true });
});
test('original report is exclusive and bounded; oversized originals never truncate', () => {
  const root = mkdtempSync(join(tmpdir(), 'stock-report-control-')), path = join(root, 'report.json');
  try {
    assert.match(persistStockMemoryReport(path, { status: 'failed', trials: [{ observation: { raw: 'original', native: 'redundant', decoded: 'redundant' } }] }), /^[a-f0-9]{64}$/);
    assert.equal(JSON.parse(readFileSync(path)).trials[0].observation.raw, 'original');
    assert.throws(() => persistStockMemoryReport(path, {}), /EEXIST/);
    assert.throws(() => persistStockMemoryReport(join(root, 'overflow.json'), { original: 'x'.repeat(1024 * 1024) }), /1MiB/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('genuine owned HTTP fixture serves identical source HTML and refuses selectors', async () => {
  const reserve = createServer(); await new Promise(resolve => reserve.listen(0, '127.0.0.1', resolve));
  const port = reserve.address().port; await new Promise(resolve => reserve.close(resolve));
  const urls = stockFixtureUrls(trials(port)); const fixture = await createStockMemoryFixture(urls);
  try {
    const response = await fetch(urls[0]); assert.equal(response.status, 200);
    assert.equal(await response.text(), fixturePage('Aux memory source 1', '<p>Disposable memory workload source.</p>'));
    const denied = await fetch(`${urls[0]}?pid=1`); assert.equal(denied.status, 404);
    assert.deepEqual(fixture.requests, [{ method: 'GET', path: '/memory/human-1' }]);
  } finally { await fixture.close(); }
});

function heldReap() { let release; const promise = new Promise(resolve => { release = resolve; }); return { promise, release }; }
test('nested launch cleanup debt reaches the final collection error with exact original handles', async () => {
  const child = { pid: 456 }, reap = heldReap(); let released = 0;
  const slot = { release() { released++; } };
  const cleanup = new AggregateError([new Error('exact owned child did not reap')], 'launch cleanup'); cleanup.ownedChild = child; cleanup.reaped = reap.promise;
  const primary = new AggregateError([new Error('mailbox setup failed'), cleanup], 'nested launch failure');
  const debt = stockCleanupDebt([primary], slot), failure = stockCollectionFailure([primary], { status: 'failed' }, '/original/report', debt);
  assert.equal(failure.ownedChild, child); assert.equal(failure.reaped, reap.promise); assert.equal(failure.retainedSlot, slot);
  assert.equal(failure.errors[0], primary); assert.equal(failure.cleanupDebt.children.length, 1);
  const wait = awaitStockCleanupDebt(failure.cleanupDebt); assert.equal(awaitStockCleanupDebt(failure.cleanupDebt), wait);
  await Promise.resolve(); assert.equal(released, 0); reap.release({ code: null, signal: 'SIGKILL' }); await wait;
  assert.equal(released, 1); assert.equal(failure.report.status, 'failed');
});
test('collection cleanup keeps owner until every distinct original child reap; duplicate error paths do not double-release', async () => {
  const first = { pid: 456 }, second = { pid: 789 }, a = heldReap(), b = heldReap(); let released = 0;
  const ea = Object.assign(new Error('first cleanup'), { ownedChild: first, reaped: a.promise });
  const eb = Object.assign(new Error('second cleanup'), { ownedChild: second, reaped: b.promise });
  const wrapped = new AggregateError([ea, new AggregateError([eb, ea], 'nested')], 'collection'); wrapped.cause = ea;
  const debt = stockCleanupDebt([wrapped], { release() { released++; } }); assert.equal(debt.children.length, 2);
  const failure = stockCollectionFailure([wrapped], { status: 'failed' }, '/original/report', debt);
  const wait = awaitStockCleanupDebt(failure.cleanupDebt); a.release(); await Promise.resolve(); await Promise.resolve(); assert.equal(released, 0);
  b.release(); await wait; assert.equal(released, 1); assert.equal(failure.errors[0], wrapped);
});
test('ordinary failed measurement cannot fabricate cleanup debt or change failed evidence', () => {
  const error = new Error('actual rejected native receipt'); assert.equal(stockCleanupDebt([error], { release() {} }), undefined);
  const failure = stockCollectionFailure([error], { status: 'failed' }, '/original/report', undefined);
  assert.equal(failure.cleanupDebt, undefined); assert.equal(failure.errors[0], error); assert.equal(failure.report.status, 'failed');
});
