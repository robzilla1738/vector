import assert from 'node:assert/strict';
import test from 'node:test';
import { capturePermissionState } from './permission-state-capture.mjs';
const counts = { logins: 2, deletes: 0 };
function fixture(appearanceEnabled = false) {
  const calls = [];
  return { calls, appearanceEnabled, app: { pid: 44 }, ax: { pid: 44, windows: async () => [{ id: 7, layer: 0, width: 800, height: 600 }] },
    capture: async (...args) => { calls.push(args); return { name: args[0] }; } };
}
test('normal functional capture retains its original name-only transport', async () => {
  const t = fixture(); const result = await capturePermissionState(t, 'denied', 'permission-denied', () => counts, counts);
  assert.deepEqual(t.calls, [['denied']]); assert.deepEqual(result.effectsBefore, counts); assert.deepEqual(result.effectsAfter, counts);
});
test('paired pixels select exactly the original native owner window', async () => {
  const t = fixture(true); await capturePermissionState(t, 'denied', 'permission-denied', () => counts, counts);
  assert.deepEqual(t.calls, [['denied', { windowId: 7, state: 'permission-denied' }]]);
});
test('unexpected pre-consent effect refuses before pixels', async () => {
  const t = fixture(); await assert.rejects(capturePermissionState(t, 'denied', 'permission-denied', () => ({ ...counts, deletes: 1 }), counts)); assert.deepEqual(t.calls, []);
});
test('effect arriving during pixels invalidates the state', async () => {
  const t = fixture(); let reads = 0;
  await assert.rejects(capturePermissionState(t, 'denied', 'permission-denied', () => ++reads === 1 ? counts : { ...counts, deletes: 1 }, counts));
});
test('replaced helper after pixels refuses despite same numeric PID', async () => {
  const t = fixture(true); t.capture = async () => { t.ax = { ...t.ax }; return {}; };
  await assert.rejects(capturePermissionState(t, 'denied', 'permission-denied', () => counts, counts));
});
test('ambiguous normal windows refuse before pixels', async () => {
  const t = fixture(true); t.ax.windows = async () => [{ id: 7, layer: 0, width: 800, height: 600 }, { id: 8, layer: 0, width: 800, height: 600 }];
  await assert.rejects(capturePermissionState(t, 'denied', 'permission-denied', () => counts, counts)); assert.deepEqual(t.calls, []);
});
test('unknown, fractional or negative synthetic counters refuse', async () => {
  for (const bad of [{ ...counts, unknown: 1 }, { logins: 1.5, deletes: 0 }, { logins: 2, deletes: -1 }]) await assert.rejects(capturePermissionState(fixture(), 'denied', 'permission-denied', () => bad, counts));
});
test('native capture failure is retained unchanged', async () => {
  const t = fixture(true), error = new Error('original native capture refused'); t.capture = async () => { throw error; };
  await assert.rejects(capturePermissionState(t, 'denied', 'permission-denied', () => counts, counts), e => e === error);
});

test('native window replacement during pixels refuses', async () => {
  const t = fixture(true); let id = 7;
  t.ax.windows = async () => [{ id, layer: 0, width: 800, height: 600 }];
  t.capture = async () => { id = 8; return {}; };
  await assert.rejects(capturePermissionState(t, 'denied', 'permission-denied', () => counts, counts));
});
