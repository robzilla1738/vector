import assert from 'node:assert/strict';
import { captureHomeJourneyState } from './home-capture.mjs';

function effects(value) {
  assert.deepEqual(Object.keys(value).sort(), ['deletes', 'logins'], 'Only original synthetic HTTP counters are evidence');
  for (const count of Object.values(value)) assert.ok(Number.isSafeInteger(count) && count >= 0, 'Actual bounded effect count required');
  return { logins: value.logins, deletes: value.deletes };
}
/** Does not grant, execute, poll effects or convert source assertions into native proof. */
export async function capturePermissionState(t, name, state, readEffects, expected) {
  const before = effects(readEffects()), wanted = effects(expected);
  assert.deepEqual(before, wanted, 'Consent/refusal state has unexpected original HTTP effects');
  const owner = t.app, helper = t.ax, pid = owner.pid;
  async function originalWindow() {
    assert.ok(t.app === owner && t.ax === helper && Number.isInteger(pid) && pid > 0 && owner.pid === pid && helper.pid === pid,
      'Original permission appearance owner changed');
    const windows = (await helper.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
    assert.equal(windows.length, 1, 'Permission state requires one original normal window');
    assert.ok(Number.isInteger(windows[0].id) && windows[0].id > 0);
    return windows[0].id;
  }
  const windowId = t.appearanceEnabled ? await originalWindow() : undefined;
  const record = await captureHomeJourneyState(t, name, state);
  if (t.appearanceEnabled) {
    assert.ok(t.app === owner && t.ax === helper && owner.pid === pid && helper.pid === pid,
      'Original permission appearance owner changed during capture');
    assert.equal(await originalWindow(), windowId, 'Original permission window replaced during capture');
  }
  const after = effects(readEffects());
  assert.deepEqual(after, before, 'Original HTTP effects changed during consent/refusal capture');
  return { capture: record, effectsBefore: before, effectsAfter: after };
}
