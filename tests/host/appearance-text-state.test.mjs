import assert from 'node:assert/strict';
import { test } from 'node:test';
import { captureAppearanceTextState } from './lib/appearance-text-state.mjs';
function fixture() {
  let value = 'Original durable fixture draft', focused = true;
  const events = [], selector = { name: 'Fixture input', match: 'exact' };
  const t = { appearanceEnabled: true, app: { pid: 201 }, ax: { pid: 201,
    windows: async () => [{ id: 71, layer: 0, width: 810, height: 700 }],
    query: async () => [{ value, focused }], focus: async () => { focused = true; events.push('focus'); },
    key: async (...args) => {
      assert.equal(args[1], 'hid'); assert.ok(['command+a', 'backspace'].includes(args[0]));
      if (args[0] === 'backspace') { value = ''; events.push('empty'); } else events.push('select');
    },
    type: async text => { value = text; events.push(text); } },
    capture: async (name, options) => { events.push({ name, options, value, focused }); return { name }; } };
  return { t, events, selector, get value() { return value; }, set value(next) { value = next; } };
}
const options = f => ({ selector: f.selector, text: 'Long controlled fixture text with multiple words and a visible focused input', name: 'long-text', state: 'long-text-focused' });
test('real operation order captures focused fixture text and restores original durable text', async () => {
  const f = fixture(), original = f.value; let ready = false;
  const result = await captureAppearanceTextState(f.t, { ...options(f), ready: async () => { ready = true; } });
  assert.equal(result.name, 'long-text'); assert.equal(f.value, original); assert.equal(ready, true);
  assert.deepEqual(f.events[3], { name: 'long-text', options: { windowId: 71, state: 'long-text-focused' }, value: options(f).text, focused: true });
  assert.deepEqual(f.events.slice(4), ['focus', 'select', original]);
});
test('ordinary mode does not read, edit or capture any temporary text', async () => {
  const f = fixture(); f.t.appearanceEnabled = false;
  await captureAppearanceTextState(f.t, options(f)); assert.deepEqual(f.events, []);
});
test('primary producer failure remains original after genuine original-text restoration', async () => {
  const f = fixture(), original = f.value, primary = new Error('Native capture refused');
  f.t.capture = async () => { throw primary; };
  await assert.rejects(captureAppearanceTextState(f.t, options(f)), error => error === primary); assert.equal(f.value, original);
});
test('partial text error and restoration debt are both retained without false success', async () => {
  const f = fixture(), primary = new Error('Partial text failure'), cleanup = new Error('Original draft restore failed'); let inputs = 0;
  f.t.ax.type = async text => { f.value = text; throw ++inputs === 1 ? primary : cleanup; };
  await assert.rejects(captureAppearanceTextState(f.t, options(f)), error => error instanceof AggregateError && error.errors[0] === primary && error.errors[1] === cleanup && error.cause === primary);
});
test('foreign/replaced owner and missing or ambiguous field refuse before new input', async () => {
  for (const change of [f => { f.t.ax.pid = 202; }, f => { f.t.ax.query = async () => []; },
    f => { f.t.ax.query = async () => [{ value: 'one' }, { value: 'two' }]; },
    f => { f.t.ax.query = async () => { f.t.app = { pid: 201 }; return [{ value: 'original' }]; }; }]) {
    const f = fixture(); change(f);
    await assert.rejects(captureAppearanceTextState(f.t, options(f))); assert.deepEqual(f.events, []);
  }
});

test('original empty Settings search is genuinely cleared through HID Backspace', async () => {
  const f = fixture(); f.value = '';
  await captureAppearanceTextState(f.t, options(f));
  assert.equal(f.value, ''); assert.deepEqual(f.events.slice(-3), ['focus', 'select', 'empty']);
});
