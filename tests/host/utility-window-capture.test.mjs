import assert from 'node:assert/strict';
import { test } from 'node:test';
import { captureQuickAskState, captureLittleState } from './lib/utility-window-capture.mjs';
function fixture() {
  const calls = [];
  const t = { appearanceEnabled: true, app: { pid: 201 }, ax: { pid: 201,
    windows: async () => [{ id: 70, layer: 0, width: 1200, height: 800 }, { id: 71, layer: 0, width: 400, height: 300 }] },
    capture: async (...args) => { calls.push(args); return args; } };
  return { t, calls };
}
test('distinct kind is handed to actual capture bracket with original observed identity', async () => {
  for (const [capture, expectedWindowKind] of [[captureQuickAskState, 'quick-ask'], [captureLittleState, 'little']]) {
    const { t, calls } = fixture(); await capture(t, 'utility', 'focused', 71);
    assert.deepEqual(calls, [['utility', { windowId: 71, state: 'focused', expectedWindowKind }]]);
  }
});
test('ordinary diagnostics keep original exact window selection without appearance authority', async () => {
  const { t, calls } = fixture(); t.appearanceEnabled = false;
  t.ax.windows = async () => { throw new Error('No appearance read'); };
  await captureLittleState(t, 'utility', 'ignored-diagnostic-state', 71);
  assert.deepEqual(calls, [['utility', { windowId: 71 }]]);
});
test('absent, floating, duplicate and foreign owners refuse before capture', async () => {
  for (const windows of [[], [{ id: 71, layer: 3, width: 400, height: 300 }],
    [{ id: 71, layer: 0, width: 400, height: 300 }, { id: 71, layer: 0, width: 400, height: 300 }]]) {
    const { t, calls } = fixture(); t.ax.windows = async () => windows;
    await assert.rejects(captureQuickAskState(t, 'utility', 'focused', 71)); assert.equal(calls.length, 0);
  }
  const { t, calls } = fixture(); t.ax.pid = 202;
  await assert.rejects(captureLittleState(t, 'utility', 'empty', 71)); assert.equal(calls.length, 0);
});
test('awaited owner retirement and original producer failure remain failures', async () => {
  const { t, calls } = fixture(); t.ax.windows = async () => { t.app.pid = 202; return []; };
  await assert.rejects(captureLittleState(t, 'utility', 'empty', 71), /owner changed/); assert.equal(calls.length, 0);
  const f = fixture(), original = new Error('Native required kind refused'); f.t.capture = async () => { throw original; };
  await assert.rejects(captureQuickAskState(f.t, 'utility', 'focused', 71), error => error === original);
});
