import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

/** Temporary loopback fixture text only. No submission or persistent setting. */
export async function captureAppearanceTextState(t, { selector, text, name, state, ready }) {
  if (!t.appearanceEnabled) return;
  const app = t.app, ax = t.ax, pid = app.pid;
  const current = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid,
    'Original appearance text owner changed');
  current();
  assert.equal(typeof text, 'string', 'Fixture text required');
  const original = await ax.query(selector); current();
  assert.equal(original.length, 1, 'Original fixture field must be unique');
  assert.equal(typeof original[0].value, 'string', 'Original fixture field value unavailable');
  const value = original[0].value;
  let effectStarted = false, failure, record;
  async function replace(next) {
    current();
    await ax.focus(selector); current();
    const focused = await ax.query(selector); current();
    assert.ok(focused.length === 1 && focused[0].focused === true, 'Fixture field must own actual native focus');
    await ax.key('command+a', 'hid'); current();
    if (next) await ax.type(next, selector);
    else await ax.key('backspace', 'hid');
    current();
    const observed = await ax.query(selector); current();
    assert.ok(observed.length === 1 && observed[0].focused === true && observed[0].value === next,
      'Actual focused fixture text differs');
  }
  try {
    effectStarted = true; // A refused input can follow selection or partial text.
    await replace(text);
    if (ready) { await ready(); current(); }
    record = await captureHomeState(t, name, state); current();
  } catch (error) { failure = error; }
  if (effectStarted) {
    try { await replace(value); }
    catch (cleanup) {
      if (failure) throw new AggregateError([failure, cleanup], `Appearance text failed (${failure.message}); original text restoration refused (${cleanup.message})`, { cause: failure });
      throw cleanup;
    }
  }
  if (failure) throw failure;
  return record;
}
