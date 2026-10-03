import assert from 'node:assert/strict';

/** Identity comes from the original helper inventory and bracketed native producer, never title/size heuristics. */
export async function captureHomeState(t, name, state) {
  assert.equal(t.appearanceEnabled, true, 'Home appearance evidence requires --appearance');
  const owner = t.app.pid;
  assert.ok(Number.isInteger(owner) && owner > 0 && t.ax.pid === owner, 'Home capture requires the current original app/helper owner');
  const windows = (await t.ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
  assert.equal(t.app.pid, owner, 'Original app owner changed during window inventory');
  assert.equal(t.ax.pid, owner, 'Original helper owner changed during window inventory');
  assert.equal(windows.length, 1, 'Home capture requires exactly one current normal fixture window');
  const windowId = windows[0].id;
  assert.ok(Number.isInteger(windowId) && windowId > 0, 'Home native window identity missing');
  return t.capture(name, { windowId, state });
}

/** Qualification remains functional; unpaired diagnostic pixels never count as F21 cells. */
export function captureHomeJourneyState(t, name, state) {
  return t.appearanceEnabled ? captureHomeState(t, name, state) : t.capture(name);
}
