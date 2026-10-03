import assert from 'node:assert/strict';
import { test } from 'node:test';
import { captureHomeState, captureHomeJourneyState } from './lib/home-capture.mjs';

function context(windows = [{ id: 71, layer: 0, width: 880, height: 640 }]) {
  const calls = [];
  return { appearanceEnabled: true, app: { pid: 201 }, ax: { pid: 201, windows: async () => windows },
    calls, capture: async (name, options) => { calls.push({ name, options }); return { name, ...options }; } };
}
test('requires actual appearance opt-in and original app/helper ownership before capture', async () => {
  for (const change of [t => { t.appearanceEnabled = false; }, t => { t.ax.pid = 202; }, t => { t.app.pid = 0; }]) {
    const t = context(); change(t);
    await assert.rejects(captureHomeState(t, 'home', 'home-ready'));
    assert.deepEqual(t.calls, []);
  }
});
test('refuses ambiguous, absent or invalid native windows rather than selecting largest/title', async () => {
  for (const windows of [[], [{ id: 71, layer: 3, width: 880, height: 640 }],
    [{ id: 71, layer: 0, width: 880, height: 640 }, { id: 72, layer: 0, width: 400, height: 300 }],
    [{ id: -1, layer: 0, width: 880, height: 640 }]]) {
    const t = context(windows);
    await assert.rejects(captureHomeState(t, 'home', 'home-ready'));
    assert.deepEqual(t.calls, []);
  }
});
test('refuses original app or helper retirement during awaited inventory', async () => {
  for (const key of ['app', 'ax']) {
    const t = context();
    t.ax.windows = async () => { t[key].pid = 202; return [{ id: 71, layer: 0, width: 880, height: 640 }]; };
    await assert.rejects(captureHomeState(t, 'home', 'home-ready'), /owner changed/);
    assert.deepEqual(t.calls, []);
  }
});
test('passes only exact owned window/state into the real bracketed capture and preserves refusal', async () => {
  const t = context();
  assert.deepEqual(await captureHomeState(t, 'home', 'home-ready'), { name: 'home', windowId: 71, state: 'home-ready' });
  assert.deepEqual(t.calls, [{ name: 'home', options: { windowId: 71, state: 'home-ready' } }]);
  const original = new Error('Genuine appearance producer refused');
  t.capture = async () => { throw original; };
  await assert.rejects(captureHomeState(t, 'home', 'home-ready'), error => error === original);
});

test('ordinary journey captures remain diagnostic, while appearance mode retains strict admission', async () => {
  const t = context(); t.appearanceEnabled = false;
  t.ax.windows = async () => { throw new Error('Diagnostic capture must not claim appearance admission'); };
  t.capture = async (...args) => args;
  assert.deepEqual(await captureHomeJourneyState(t, 'home', 'home-ready'), ['home']);
  t.appearanceEnabled = true;
  await assert.rejects(captureHomeJourneyState(t, 'home', 'home-ready'), /appearance admission/);
});
