import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

// Explicit preparation target, not a native minimum or F21 approval.
const width = 810;
function frame(windows) {
  const normal = windows.filter(window => window.layer === 0);
  assert.equal(normal.length, 1, 'Narrow preparation requires one original layer-zero window');
  const window = normal[0];
  assert.ok(Number.isInteger(window.id) && window.id > 0 &&
    ['x', 'y', 'width', 'height'].every(key => Number.isFinite(window[key])) &&
    window.width > 0 && window.height > 0, 'Invalid observed native frame');
  return Object.freeze({ id: window.id, x: window.x, y: window.y, width: window.width, height: window.height });
}
export function createNarrowWindowPreparation(t) {
  assert.equal(t.appearanceEnabled, true, 'Narrow preparation requires appearance opt-in');
  const app = t.app, ax = t.ax, pid = app.pid;
  const current = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid,
    'Original narrow-window owner retired');
  let identity, before, record, started = false, effectStarted = false, restored = false, pending, restoration;
  function active() { current(); t.signal?.throwIfAborted(); }
  async function sameIdentity() {
    current(); const observed = await ax.request('warmWindowIdentity'); current();
    assert.deepEqual(observed, identity, 'Original native generation changed');
  }
  async function observed() {
    current(); const windows = await ax.windows(); current();
    const value = frame(windows);
    if (before) assert.equal(value.id, before.id, 'Original native window replaced');
    return value;
  }
  function matches(value, target) {
    return ['x', 'y', 'width', 'height'].every(key => Math.abs(value[key] - target[key]) <= 2);
  }
  async function settle(target, cleanup = false) {
    const end = performance.now() + 2000;
    let last;
    while (performance.now() < end) {
      if (!cleanup) active();
      const value = await observed();
      assert.ok(performance.now() <= end, 'Native settling deadline exceeded');
      if (!cleanup) active();
      if (matches(value, target) && last && ['x', 'y', 'width', 'height'].every(key => value[key] === last[key])) {
        await sameIdentity(); assert.ok(performance.now() <= end, 'Native settling deadline exceeded');
        if (!cleanup) active(); return value;
      }
      last = value;
      await delay(50, undefined, cleanup ? undefined : { signal: t.signal });
    }
    throw new Error('Native resize was clamped, unchanged, unstable, moved or outside the preparation target');
  }
  async function prepare() {
    assert.ok(!started, 'Original narrow preparation is one-use'); started = true;
    active();
    const rawIdentity = await ax.request('warmWindowIdentity'); active();
    assert.deepEqual(Object.keys(rawIdentity).sort(), ['helperPid', 'helperProcessStartMachTicks', 'helperProcessUuid', 'producer', 'targetPid', 'targetProcessStartMachTicks', 'targetProcessUuid', 'version'], 'Invalid native identity fields');
    assert.ok(rawIdentity.producer === 'aux-native-warm-window-identity' && rawIdentity.version === 1 &&
      Number.isInteger(rawIdentity.helperPid) && rawIdentity.helperPid > 0 &&
      ['targetProcessUuid', 'helperProcessUuid'].every(key => /^[a-f0-9]{32}$/.test(rawIdentity[key]) && rawIdentity[key] !== '0'.repeat(32)) &&
      ['targetProcessStartMachTicks', 'helperProcessStartMachTicks'].every(key => typeof rawIdentity[key] === 'string' && /^[1-9][0-9]*$/.test(rawIdentity[key])), 'Invalid native kernel identity');
    identity = Object.freeze({ ...rawIdentity });
    assert.equal(identity.targetPid, pid, 'Foreign native target');
    assert.equal(identity.helperPid, ax.helperPid, 'Foreign native helper');
    before = await observed(); active();
    assert.ok(before.width > 900, 'Narrow preparation requires a wider original frame');
    await sameIdentity(); active();
    const from = { x: before.x + before.width - 1, y: before.y + before.height - 1 };
    const to = { x: before.x + width - 1, y: from.y };
    // Record cleanup debt before effect admission; HID refusal may follow mouse-down.
    effectStarted = true;
    const input = await ax.drag(from, to, { steps: 20, holdMs: 100, destinationHoldMs: 100 }); active();
    const after = await settle({ ...before, width });
    assert.ok(after.width >= 720 && after.width <= 900 && after.width < before.width, 'Observed native width is outside the test band');
    record = Object.freeze({ pid, identity, windowId: before.id, before, after, input,
      target: Object.freeze({ minimumWidth: 720, maximumWidth: 900, requestedWidth: width }), visualApproval: false });
    return record;
  }
  async function restore() {
    if (pending) await pending.catch(() => {}); // Primary preparation failure remains with its original caller.
    if (!effectStarted || restored) return { restorationRequired: false };
    await sameIdentity();
    const value = await observed();
    await sameIdentity();
    if (!matches(value, before)) {
      assert.ok(Math.abs(value.x - before.x) <= 2 && Math.abs(value.y - before.y) <= 2 && Math.abs(value.height - before.height) <= 2,
        'Original window moved; restoration input refused');
      await ax.drag({ x: value.x + value.width - 1, y: value.y + value.height - 1 },
        { x: before.x + before.width - 1, y: before.y + before.height - 1 },
        { steps: 20, holdMs: 100, destinationHoldMs: 100 });
    }
    const after = await settle(before, true); restored = true;
    return Object.freeze({ restorationRequired: true, pid, windowId: before.id, original: before, observed: after });
  }
  return Object.freeze({
    prepare() { assert.ok(!pending, 'Original narrow preparation already started'); pending = prepare(); return pending; },
    restore() { return restoration ??= restore(); },
    get record() { return record ?? Object.freeze({ pid, identity, before, effectStarted, restored, visualApproval: false }); },
  });
}
