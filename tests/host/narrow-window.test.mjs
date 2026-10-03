import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNarrowWindowPreparation, createNarrowWindowGenerations } from './lib/narrow-window.mjs';
function fixture() {
  const before = { id: 71, layer: 0, x: 20, y: 30, width: 1200, height: 700 };
  const after = { ...before, width: 810 };
  const identity = { producer: 'aux-native-warm-window-identity', version: 1, targetPid: 201, helperPid: 301, targetProcessUuid: '1'.repeat(32), targetProcessStartMachTicks: '7', helperProcessUuid: '2'.repeat(32), helperProcessStartMachTicks: '8' };
  let reads = 0;
  const calls = [];
  const t = { appearanceEnabled: true, app: { pid: 201 }, ax: { pid: 201, helperPid: 301,
    request: async () => identity, windows: async () => [reads++ ? after : before],
    drag: async (...args) => { calls.push(args); return { transport: 'controlled-test-input' }; } } };
  return { t, before, after, identity, calls };
}
test('derives fixed HID coordinates from original frame and retains actual observed geometry', async () => {
  const { t, calls } = fixture();
  const result = await createNarrowWindowPreparation(t).prepare();
  assert.deepEqual(calls, [[{ x: 1219, y: 729 }, { x: 829, y: 729 }, { steps: 20, holdMs: 100, destinationHoldMs: 100 }]]);
  assert.equal(result.after.width, 810); assert.equal(result.before.width, 1200);
  assert.equal(result.windowId, 71); assert.equal(result.visualApproval, false);
});
test('refuses ambiguity, malformed geometry and already narrow input before effects', async () => {
  for (const windows of [[], [{ id: 71, layer: 0, x: 0, y: 0, width: 800, height: 700 }],
    [{ id: 71, layer: 0, x: NaN, y: 0, width: 1200, height: 700 }],
    [{ id: 71, layer: 0 }, { id: 72, layer: 0 }]]) {
    const { t, calls } = fixture(); t.ax.windows = async () => windows;
    await assert.rejects(createNarrowWindowPreparation(t).prepare()); assert.equal(calls.length, 0);
  }
});
test('refuses clamp, unchanged, replacement, movement and out-of-range after real input', async () => {
  for (const change of [{ width: 1200 }, { width: 850 }, { width: 710 }, { id: 72 }, { x: 25 }, { height: 650 }]) {
    const { t, after, calls } = fixture(); Object.assign(after, change);
    await assert.rejects(createNarrowWindowPreparation(t).prepare()); assert.equal(calls.length, 1);
  }
});
test('original generation and owner retirement across awaits refuse before or after input', async () => {
  for (const phase of ['identity', 'windows', 'drag']) {
    const { t, calls } = fixture();
    if (phase === 'identity') t.ax.request = async () => { t.app.pid = 202; return {}; };
    if (phase === 'windows') t.ax.windows = async () => { t.ax.pid = 202; return []; };
    if (phase === 'drag') t.ax.drag = async () => { calls.push('input'); t.app = { pid: 201 }; };
    await assert.rejects(createNarrowWindowPreparation(t).prepare(), /owner retired/);
    assert.equal(calls.length, phase === 'drag' ? 1 : 0);
  }
  const { t, identity, calls } = fixture(); let n = 0;
  t.ax.request = async () => n++ ? { ...identity, targetProcessStartMachTicks: '8' } : identity;
  await assert.rejects(createNarrowWindowPreparation(t).prepare(), /generation changed/); assert.equal(calls.length, 0);
});
test('preserves original input refusal without retry or manufactured geometry', async () => {
  const { t } = fixture(), original = new Error('HID refused');
  t.ax.drag = async () => { throw original; };
  await assert.rejects(createNarrowWindowPreparation(t).prepare(), error => error === original);
});

test('missing or foreign kernel receipt refuses before input', async () => {
  for (const change of [{ producer: 'caller-label' }, { targetPid: 202 }, { helperPid: 302 }, { helperProcessUuid: '0'.repeat(32) }, { targetProcessStartMachTicks: '0' }]) {
    const { t, identity, calls } = fixture(); t.ax.request = async () => ({ ...identity, ...change });
    await assert.rejects(createNarrowWindowPreparation(t).prepare()); assert.equal(calls.length, 0);
  }
});

test('bounded settling requires repeated observed target and restoration uses original geometry', async () => {
  const { t, before, identity, calls } = fixture(); let width = before.width, reads = 0;
  t.ax.windows = async () => [{ ...before, width: reads++ === 1 ? 1000 : width }];
  t.ax.drag = async (...args) => { calls.push(args); width = calls.length === 1 ? 810 : before.width; };
  const session = createNarrowWindowPreparation(t), record = await session.prepare();
  assert.equal(record.after.width, 810); assert.ok(reads >= 4);
  const cleanup = await session.restore();
  assert.equal(cleanup.observed.width, 1200); assert.deepEqual(cleanup.original, { id: 71, x: 20, y: 30, width: 1200, height: 700 });
  assert.deepEqual(calls[1].slice(0, 2), [{ x: 829, y: 729 }, { x: 1219, y: 729 }]);
  assert.equal(await session.restore(), cleanup);
  assert.deepEqual(record.identity, identity);
});
test('original partial-input failure retains separate restoration refusal and original debt', async () => {
  const { t, before } = fixture(); const primary = new Error('Original drag failure'), cleanup = new Error('Restoration drag failure');
  let width = before.width, count = 0;
  t.ax.windows = async () => [{ ...before, width }];
  t.ax.drag = async () => { if (++count === 1) { width = 810; throw primary; } throw cleanup; };
  const session = createNarrowWindowPreparation(t);
  await assert.rejects(session.prepare(), error => error === primary);
  await assert.rejects(session.restore(), error => error === cleanup);
  assert.equal(session.record.effectStarted, true); assert.equal(session.record.restored, false);
});
test('cancellation after actual resize still allows only original-owner cleanup', async () => {
  const { t, before } = fixture(), controller = new AbortController(); t.signal = controller.signal;
  let width = before.width, inputs = 0;
  t.ax.windows = async () => [{ ...before, width }];
  t.ax.drag = async () => { width = ++inputs === 1 ? 810 : before.width; if (inputs === 1) controller.abort(new Error('Original cancellation')); };
  const session = createNarrowWindowPreparation(t);
  await assert.rejects(session.prepare(), /Original cancellation/);
  assert.equal((await session.restore()).observed.width, before.width); assert.equal(inputs, 2);
});
test('replacement during cleanup refuses all restoration input', async () => {
  const { t, calls } = fixture(); const session = createNarrowWindowPreparation(t); await session.prepare();
  t.app.pid = 202;
  await assert.rejects(session.restore(), /owner retired/); assert.equal(calls.length, 1);
});
test('concurrent cleanup joins one original restoration effect and receipt', async () => {
  const { t, before } = fixture(); let width = before.width, inputs = 0, release;
  t.ax.windows = async () => [{ ...before, width }];
  t.ax.drag = async () => { if (++inputs === 1) width = 810; else { await new Promise(resolve => { release = resolve; }); width = before.width; } };
  const session = createNarrowWindowPreparation(t); await session.prepare();
  const first = session.restore(), second = session.restore(); assert.equal(first, second);
  while (!release) await new Promise(resolve => setImmediate(resolve));
  release(); const record = await first; assert.equal(inputs, 2); assert.equal(await second, record);
});


test('actual restored old geometry retires before fresh native helper/PID admission', async () => {
  const manifest = {}, original = fixture(); let current = original.t;
  let width = original.before.width;
  original.t.ax.windows = async () => [{ ...original.before, width }];
  original.t.ax.drag = async (_from, to) => { width = to.x - original.before.x + 1; };
  const generations = createNarrowWindowGenerations(() => current, manifest);
  await generations.prepare();
  await assert.rejects(generations.prepare(), /retire before replacement/);
  await generations.restore(); assert.equal(width, original.before.width);
  const fresh = fixture(); fresh.t.app.pid = fresh.t.ax.pid = 202; fresh.t.ax.helperPid = 302;
  fresh.identity.targetPid = 202; fresh.identity.helperPid = 302; fresh.identity.targetProcessStartMachTicks = '9';
  let freshWidth = 1200;
  fresh.t.ax.windows = async () => [{ ...fresh.before, id: 72, width: freshWidth }];
  fresh.t.ax.drag = async (_from, to) => { freshWidth = to.x - fresh.before.x + 1; };
  current = fresh.t; await generations.prepare(); await generations.restore();
  assert.equal(manifest.narrowGenerations.length, 2);
  assert.equal(manifest.narrowGenerations[0].preparation.pid, 201);
  assert.equal(manifest.narrowGenerations[1].preparation.pid, 202);
  assert.equal(manifest.narrowGenerations[1].preparation.windowId, 72);
  assert.equal(manifest.narrowGenerations[1].restoration.observed.width, 1200);
  assert.equal(manifest.cleanupErrors, undefined);
});
test('old cleanup refusal prevents new generation and records original debt only once', async () => {
  const manifest = {}, f = fixture(); const generations = createNarrowWindowGenerations(() => f.t, manifest);
  await generations.prepare(); f.t.app.pid = 202;
  await assert.rejects(generations.restore(), /owner retired/);
  await assert.rejects(generations.restore(), /owner retired/);
  await assert.rejects(generations.prepare(), /retire before replacement/);
  assert.equal(manifest.cleanupErrors.length, 1); assert.equal(manifest.cleanupErrors[0].ordinal, 1);
  assert.equal(manifest.narrowGenerations.length, 1); assert.ok(manifest.narrowGenerations[0].cleanupError);
});
test('fresh generation preparation error retains its own original partial-input cleanup debt', async () => {
  const manifest = {}, f = fixture(), primary = new Error('New generation input refused'), cleanup = new Error('New generation cleanup refused');
  let width = f.before.width, inputs = 0;
  f.t.ax.windows = async () => [{ ...f.before, width }];
  f.t.ax.drag = async () => { width = 810; throw ++inputs === 1 ? primary : cleanup; };
  const generations = createNarrowWindowGenerations(() => f.t, manifest);
  await assert.rejects(generations.prepare(), error => error === primary);
  await assert.rejects(generations.restore(), error => error === cleanup);
  assert.match(manifest.narrowGenerations[0].preparationError, /New generation input refused/);
  assert.match(manifest.cleanupErrors[0].error, /New generation cleanup refused/);
});
test('concurrent generation cleanup joins original retirement without false debt', async () => {
  const manifest = {}, f = fixture(); let width = f.before.width, count = 0, release;
  f.t.ax.windows = async () => [{ ...f.before, width }];
  f.t.ax.drag = async () => { if (++count === 1) width = 810; else { await new Promise(resolve => { release = resolve; }); width = f.before.width; } };
  const generations = createNarrowWindowGenerations(() => f.t, manifest); await generations.prepare();
  const first = generations.restore(), second = generations.restore(); assert.equal(first, second);
  while (!release) await new Promise(resolve => setImmediate(resolve));
  release(); await Promise.all([first, second]); assert.equal(count, 2); assert.equal(manifest.cleanupErrors, undefined);
});
