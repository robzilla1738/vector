import assert from 'node:assert/strict';

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
export async function prepareNarrowWindow(t) {
  assert.equal(t.appearanceEnabled, true, 'Narrow preparation requires appearance opt-in');
  const app = t.app, ax = t.ax, pid = app.pid;
  const current = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid,
    'Original narrow-window owner retired');
  current();
  const rawIdentity = await ax.request('warmWindowIdentity'); current();
  assert.deepEqual(Object.keys(rawIdentity).sort(), ['helperPid', 'helperProcessStartMachTicks', 'helperProcessUuid', 'producer', 'targetPid', 'targetProcessStartMachTicks', 'targetProcessUuid', 'version'], 'Invalid native identity fields');
  assert.ok(rawIdentity.producer === 'aux-native-warm-window-identity' && rawIdentity.version === 1 &&
    Number.isInteger(rawIdentity.helperPid) && rawIdentity.helperPid > 0 &&
    ['targetProcessUuid', 'helperProcessUuid'].every(key => /^[a-f0-9]{32}$/.test(rawIdentity[key]) && rawIdentity[key] !== '0'.repeat(32)) &&
    ['targetProcessStartMachTicks', 'helperProcessStartMachTicks'].every(key => typeof rawIdentity[key] === 'string' && /^[1-9][0-9]*$/.test(rawIdentity[key])), 'Invalid native kernel identity');
  const identity = Object.freeze({ ...rawIdentity });
  assert.equal(identity.targetPid, pid, 'Foreign native target');
  assert.equal(identity.helperPid, ax.helperPid, 'Foreign native helper');
  const beforeWindows = await ax.windows(); current();
  const before = frame(beforeWindows);
  assert.ok(before.width > 900, 'Narrow preparation requires a wider original frame');
  assert.deepEqual(await ax.request('warmWindowIdentity'), identity, 'Original native generation changed'); current();
  const from = Object.freeze({ x: before.x + before.width - 1, y: before.y + before.height - 1 });
  const to = Object.freeze({ x: before.x + width - 1, y: from.y });
  const input = await ax.drag(from, to, { steps: 20, holdMs: 100, destinationHoldMs: 100 }); current();
  const afterWindows = await ax.windows(); current();
  const after = frame(afterWindows);
  assert.deepEqual(await ax.request('warmWindowIdentity'), identity, 'Original native generation changed'); current();
  assert.equal(after.id, before.id, 'Original native window replaced');
  assert.ok(after.width >= 720 && after.width <= 900 && Math.abs(after.width - width) <= 2 &&
    after.width < before.width && Math.abs(after.height - before.height) <= 2 &&
    Math.abs(after.x - before.x) <= 2 && Math.abs(after.y - before.y) <= 2,
  'Native resize was clamped, unchanged, moved or outside the preparation target');
  return Object.freeze({ pid, identity: Object.freeze({ ...identity }), windowId: before.id, before, after, input,
    target: Object.freeze({ minimumWidth: 720, maximumWidth: 900, requestedWidth: width }), visualApproval: false });
}
