import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

/** Appearance-only fixture effects; restoration is owed even after partial preparation. */
export async function captureTemporaryAppearanceState(t, { name, state, prepare, restore }) {
  if (!t.appearanceEnabled) return;
  const app = t.app, ax = t.ax, pid = app.pid;
  const current = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid,
    'Original temporary appearance owner changed');
  current();
  const owned = async operation => { current(); const result = await operation(); current(); return result; };
  let failure, record;
  try {
    await owned(() => prepare(owned));
    record = await owned(() => captureHomeState(t, name, state));
  } catch (error) { failure = error; }
  try { await owned(() => restore(owned)); }
  catch (cleanup) {
    if (failure) throw new AggregateError([failure, cleanup], 'Temporary appearance preparation and restoration failed', { cause: failure });
    throw cleanup;
  }
  if (failure) throw failure;
  return record;
}

/** Existing genuine HID editing only; never commits a form or selects context. */
export async function replaceAppearanceField(t, owned, selector, value) {
  await owned(() => t.ax.focus(selector));
  const focused = await owned(() => t.ax.query(selector));
  assert.ok(focused.length === 1 && focused[0].focused === true, 'Actual field focus required');
  await owned(() => t.ax.key('command+a', 'hid'));
  await owned(() => value ? t.ax.type(value, selector) : t.ax.key('backspace', 'hid'));
  const observed = await owned(() => t.ax.query(selector));
  assert.ok(observed.length === 1 && observed[0].value === value, 'Actual fixture text differs');
}
