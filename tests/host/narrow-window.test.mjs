import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareNarrowWindow } from './lib/narrow-window.mjs';
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
  const result = await prepareNarrowWindow(t);
  assert.deepEqual(calls, [[{ x: 1219, y: 729 }, { x: 829, y: 729 }, { steps: 20, holdMs: 100, destinationHoldMs: 100 }]]);
  assert.equal(result.after.width, 810); assert.equal(result.before.width, 1200);
  assert.equal(result.windowId, 71); assert.equal(result.visualApproval, false);
});
test('refuses ambiguity, malformed geometry and already narrow input before effects', async () => {
  for (const windows of [[], [{ id: 71, layer: 0, x: 0, y: 0, width: 800, height: 700 }],
    [{ id: 71, layer: 0, x: NaN, y: 0, width: 1200, height: 700 }],
    [{ id: 71, layer: 0 }, { id: 72, layer: 0 }]]) {
    const { t, calls } = fixture(); t.ax.windows = async () => windows;
    await assert.rejects(prepareNarrowWindow(t)); assert.equal(calls.length, 0);
  }
});
test('refuses clamp, unchanged, replacement, movement and out-of-range after real input', async () => {
  for (const change of [{ width: 1200 }, { width: 850 }, { width: 710 }, { id: 72 }, { x: 25 }, { height: 650 }]) {
    const { t, after, calls } = fixture(); Object.assign(after, change);
    await assert.rejects(prepareNarrowWindow(t)); assert.equal(calls.length, 1);
  }
});
test('original generation and owner retirement across awaits refuse before or after input', async () => {
  for (const phase of ['identity', 'windows', 'drag']) {
    const { t, calls } = fixture();
    if (phase === 'identity') t.ax.request = async () => { t.app.pid = 202; return {}; };
    if (phase === 'windows') t.ax.windows = async () => { t.ax.pid = 202; return []; };
    if (phase === 'drag') t.ax.drag = async () => { calls.push('input'); t.app = { pid: 201 }; };
    await assert.rejects(prepareNarrowWindow(t), /owner retired/);
    assert.equal(calls.length, phase === 'drag' ? 1 : 0);
  }
  const { t, identity, calls } = fixture(); let n = 0;
  t.ax.request = async () => n++ ? { ...identity, targetProcessStartMachTicks: '8' } : identity;
  await assert.rejects(prepareNarrowWindow(t), /generation changed/); assert.equal(calls.length, 0);
});
test('preserves original input refusal without retry or manufactured geometry', async () => {
  const { t } = fixture(), original = new Error('HID refused');
  t.ax.drag = async () => { throw original; };
  await assert.rejects(prepareNarrowWindow(t), error => error === original);
});

test('missing or foreign kernel receipt refuses before input', async () => {
  for (const change of [{ producer: 'caller-label' }, { targetPid: 202 }, { helperPid: 302 }, { helperProcessUuid: '0'.repeat(32) }, { targetProcessStartMachTicks: '0' }]) {
    const { t, identity, calls } = fixture(); t.ax.request = async () => ({ ...identity, ...change });
    await assert.rejects(prepareNarrowWindow(t)); assert.equal(calls.length, 0);
  }
});
