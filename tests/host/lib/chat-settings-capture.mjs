import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
async function one(t, selector) {
  const rows = await t.ax.query(selector);
  assert.equal(rows.length, 1, `Expected one actual ${selector.name}`);
  return rows[0];
}

export async function captureFreshChat(t) {
  if (!t.appearanceEnabled) return;
  const settings = await t.rpc('settings.get'), runs = await t.rpc('runs.list');
  assert.deepEqual(await t.rpc('pages.list'), [], 'Fresh welcome capture must remain page-free');
  const composer = shell('Reply to conversation');
  await t.ax.waitFor(shell('What would you like to work on?'), 'visible');
  assert.equal((await one(t, composer)).focused, true, 'Fresh full-window chat must genuinely focus its composer');
  await captureHomeState(t, 'first-chat-fresh-welcome-focused', 'full-chat-fresh-welcome-focused');
  const queue = shell('Queue for tonight', 'AXButton');
  const rows = await t.ax.query(queue);
  if (!rows.length) return { queueFooter: 'pending-unavailable' };
  assert.equal(rows.length, 1, 'Queue footer must be an actual unambiguous control');
  assert.equal(rows[0].enabled, true, 'Queue footer must be genuinely enabled');
  await captureHomeState(t, 'first-chat-fresh-queue-footer', 'full-chat-fresh-queue-footer');
  let failure;
  try {
    await t.ax.click(queue);
    await t.ax.waitFor({ name: 'Choose saved work and a spending limit.', match: 'contains', scope: 'shell', index: 0 }, 'visible');
    await captureHomeState(t, 'first-chat-queue-unsubmitted', 'full-chat-queue-unsubmitted');
  } catch (error) { failure = error; }
  try {
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor({ name: 'Choose saved work and a spending limit.', match: 'contains', scope: 'shell', index: 0 }, 'absent');
    assert.equal((await one(t, queue)).focused, true, 'Queue dismissal must return focus to its original footer control');
    await captureHomeState(t, 'first-chat-queue-focus-returned', 'full-chat-queue-focus-returned');
    await t.ax.focus(composer);
    assert.equal((await one(t, composer)).focused, true);
    assert.deepEqual(await t.rpc('settings.get'), settings, 'Queue inspection must not change settings');
    assert.deepEqual(await t.rpc('runs.list'), runs, 'Queue inspection must not create a run');
    assert.deepEqual(await t.rpc('pages.list'), []);
  } catch (cleanup) {
    if (failure) throw new AggregateError([failure, cleanup], 'Queue capture and original UI restoration failed');
    throw cleanup;
  }
  if (failure) throw failure;
  return { queueFooter: 'observed-unsubmitted' };
}

export function observedRailOrientation(general, appearance) {
  for (const row of [general, appearance]) {
    assert.ok(row?.frame && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(row.frame[key])) &&
      row.frame.width > 0 && row.frame.height > 0, 'Settings categories require positive finite actual frames');
  }
  if (general.frame.y === appearance.frame.y && appearance.frame.x >= general.frame.x + general.frame.width) return 'row';
  if (general.frame.x === appearance.frame.x && appearance.frame.y >= general.frame.y + general.frame.height) return 'column';
  throw new Error('Actual Settings category geometry does not prove row or column');
}

export async function captureSettingsRail(t, layout) {
  if (!t.appearanceEnabled || !t.narrowEnabled) return;
  const general = shell('General', 'AXButton'), appearance = shell('Appearance', 'AXButton');
  const orientation = observedRailOrientation(await one(t, general), await one(t, appearance));
  if (orientation !== 'row') {
    await t.step('observe Settings category column; responsive row evidence remains pending', { kind: 'rpc', features: ['layouts'] }, async () =>
      ({ rpc: { settingsRow: 'pending-observed-column', general: await one(t, general), appearance: await one(t, appearance) } }));
    return { settingsRow: 'pending-observed-column' };
  }
  const originalSettings = await t.rpc('settings.get'), originalPages = await t.rpc('pages.list'), originalRuns = await t.rpc('runs.list');
  const search = shell('Search settings', 'AXTextField');
  let failure;
  try {
    await t.ax.focus(general);
    assert.equal((await one(t, general)).focused, true);
    await captureHomeState(t, `settings-${layout}-row-general-focused`, 'settings-row-general-focused');
    await t.ax.key('right', 'hid');
    assert.equal((await one(t, appearance)).focused, true, 'Actual horizontal rail must use Right to move focus');
    await captureHomeState(t, `settings-${layout}-row-appearance-focused`, 'settings-row-appearance-focused');
    const downloads = shell('Downloads', 'AXButton');
    const first = (await t.ax.query(downloads)).length ? downloads : general;
    await t.ax.key('home', 'hid');
    assert.equal((await one(t, first)).focused, true, 'Home must focus the actual first available category');
    await captureHomeState(t, `settings-${layout}-row-home-focused`, 'settings-row-first-focused');
  } catch (error) { failure = error; }
  try {
    await t.ax.focus(search);
    assert.equal((await one(t, search)).focused, true, 'Settings search focus must be restored');
    assert.deepEqual(await t.rpc('settings.get'), originalSettings);
    assert.deepEqual(await t.rpc('pages.list'), originalPages);
    assert.deepEqual(await t.rpc('runs.list'), originalRuns);
  } catch (cleanup) {
    if (failure) throw new AggregateError([failure, cleanup], 'Settings capture and original focus restoration failed');
    throw cleanup;
  }
  if (failure) throw failure;
  return { settingsRow: 'observed-row' };
}
