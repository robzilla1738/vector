import assert from 'node:assert/strict';

async function captureUtility(t, name, state, windowId, expectedWindowKind) {
  if (!t.appearanceEnabled) return t.capture(name, { windowId });
  const app = t.app, ax = t.ax, owner = app.pid;
  const current = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(owner) && owner > 0 && app.pid === owner && ax.pid === owner,
    'Original utility capture owner changed');
  current();
  assert.ok(Number.isInteger(windowId) && windowId > 0, 'Missing observed utility window');
  const windows = await ax.windows(); current();
  assert.equal(windows.filter(window => window.id === windowId && window.layer === 0 && window.width > 0 && window.height > 0).length, 1,
    'Utility window absent or ambiguous in original helper inventory');
  // Kind is enforced inside BOTH actual native capture samples, not by this selector.
  const record = await t.capture(name, { windowId, state, expectedWindowKind }); current();
  return record;
}
export const captureQuickAskState = (t, name, state, windowId) => captureUtility(t, name, state, windowId, 'quick-ask');
export const captureLittleState = (t, name, state, windowId) => captureUtility(t, name, state, windowId, 'little');
