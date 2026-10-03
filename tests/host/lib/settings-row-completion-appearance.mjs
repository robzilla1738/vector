import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';
import { observedRailOrientation } from './chat-settings-capture.mjs';
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const general = shell('General', 'AXButton'), appearance = shell('Appearance', 'AXButton');
const last = shell('Archived chats', 'AXButton'), search = shell('Search settings', 'AXTextField');
const categories = { name: 'Settings categories', match: 'exact', scope: 'shell' };

export async function captureSettingsRowCompletion(t, layout) {
  if (!t.appearanceEnabled || !t.narrowEnabled) return { status: 'not-requested' };
  const app = t.app, ax = t.ax, pid = app.pid;
  const stable = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid && !t.signal?.aborted, 'Settings keyboard original owner retired');
  const one = async selector => { stable(); const rows = await ax.query(selector); stable(); assert.equal(rows.length, 1, `Original ${selector.name} must be unique`); return rows[0]; };
  const generalRow = await one(general), appearanceRow = await one(appearance);
  const orientation = observedRailOrientation(generalRow, appearanceRow);
  if (orientation !== 'row') {
    await t.step('Settings End and activation remain pending for observed column', { kind: 'rpc', features: ['layouts'] }, async () => ({ rpc: { status: 'pending-observed-column', general: generalRow, appearance: appearanceRow } }));
    return { status: 'pending-observed-column' };
  }
  const settings = await t.rpc('settings.get'); stable();
  const pages = await t.rpc('pages.list'); stable();
  const runs = await t.rpc('runs.list'); stable();
  const workspace = await t.rpc('workspace.get'); stable();
  assert.equal(settings.tabLayout, layout, 'Capture layout label must match original settings');
  assert.equal((await one(search)).value, '', 'Only the original empty search permits category End preparation');
  await ax.waitFor(shell('Appearance settings')); stable();
  const buttons = await ax.query({ role: 'AXButton', within: categories, scope: 'shell' }); stable();
  assert.ok(buttons.length >= 3); assert.equal(buttons.at(-1).name, 'Archived chats', 'End target must be the genuine last available category');
  const inventory = async () => { const windows = (await ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0); stable(); assert.equal(windows.length, 1); assert.ok(Number.isInteger(windows[0].id) && windows[0].id > 0); return windows[0].id; };
  const windowId = await inventory();
  const unchanged = async () => { stable(); assert.deepEqual(await t.rpc('settings.get'), settings); stable(); assert.deepEqual(await t.rpc('pages.list'), pages); stable(); assert.deepEqual(await t.rpc('runs.list'), runs); stable(); assert.deepEqual(await t.rpc('workspace.get'), workspace); stable(); assert.equal(await inventory(), windowId); stable(); };
  const row = async () => assert.equal(observedRailOrientation(await one(general), await one(appearance)), 'row', 'Actual horizontal category row changed');
  let primary, started = false, result;
  const debts = [];
  try {
    started = true;
    await ax.focus(general); assert.equal((await one(general)).focused, true);
    await ax.key('end', 'hid'); assert.equal((await one(last)).focused, true);
    await row(); await unchanged();
    await captureHomeState(t, `settings-${layout}-row-end-focused`, 'settings-row-last-focused'); stable();
    await ax.key('return', 'hid'); stable(); await ax.waitFor(shell('Archived chats settings'));
    await row(); await unchanged();
    await captureHomeState(t, `settings-${layout}-row-archived-activated`, 'settings-row-last-category-activated'); stable();
    await ax.key('escape', 'hid'); stable(); await ax.waitFor(search, 'absent');
    assert.equal((await ax.query(search)).length, 0); await unchanged();
    await captureHomeState(t, `settings-${layout}-escape-dismissed`, 'settings-row-escape-dismissed'); stable();
    result = { status: 'observed-row-completion' };
  } catch (error) { primary = error; }
  finally {
    if (started) {
      try {
        stable();
        if (!(await ax.query(search)).length) { stable(); await ax.key('command+,', 'hid'); stable(); await ax.waitFor(search); stable(); }
        stable(); await ax.press(appearance); stable(); await ax.waitFor(shell('Appearance settings')); stable();
        await ax.focus(search); assert.equal((await one(search)).focused, true); assert.equal((await one(search)).value, '');
        await row(); await unchanged();
        if (!primary) { await captureHomeState(t, `settings-${layout}-reopened-search-focused`, 'settings-row-reopened-original-category-search-focused'); stable(); }
      } catch (error) { debts.push(error); }
    }
  }
  if (debts.length) throw new AggregateError([primary, ...debts].filter(Boolean), 'Settings keyboard preparation or original category/focus restoration unresolved');
  if (primary) throw primary;
  return result;
}
