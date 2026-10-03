import test from 'node:test';
import assert from 'node:assert/strict';
import { captureSettingsRowCompletion } from './lib/settings-row-completion-appearance.mjs';
function context(orientation = 'row') {
  let open = true, focused = 'Search settings', category = 'Appearance';
  const calls = [], captures = [];
  const records = { 'settings.get': { tabLayout: 'vertical' }, 'pages.list': [{ pageId: 'original' }], 'runs.list': [], 'workspace.get': { activePageId: 'original' } };
  const t = { appearanceEnabled: true, narrowEnabled: true, app: { pid: 993 },
    rpc: async method => structuredClone(records[method]), step: async (_name, _meta, work) => work(),
    capture: async (name, options) => { captures.push({ name, options }); },
    ax: { pid: 993, windows: async () => [{ id: 31, layer: 0, width: 800, height: 700 }],
      query: async selector => {
        if (selector.within) return ['General', 'Appearance', 'Archived chats'].map(name => ({ name }));
        if (selector.name === 'Search settings') return open ? [{ name: selector.name, focused: focused === selector.name, value: '' }] : [];
        const frame = selector.name === 'Appearance' ? orientation === 'row' ? { x: 110, y: 10, width: 100, height: 36 } : { x: 10, y: 46, width: 100, height: 36 } : { x: 10, y: 10, width: 100, height: 36 };
        return [{ name: selector.name, focused: focused === selector.name, frame }];
      },
      focus: async selector => { calls.push(['focus', selector.name]); focused = selector.name; },
      press: async selector => { calls.push(['press', selector.name]); category = selector.name; },
      key: async key => { calls.push(['key', key]); if (key === 'end') focused = 'Archived chats'; if (key === 'return') category = focused; if (key === 'escape') open = false; if (key === 'command+,') open = true; },
      waitFor: async (selector, state) => { if (selector.name === 'Search settings') assert.equal(open, state !== 'absent'); if (selector.name === 'Appearance settings') assert.equal(category, 'Appearance'); if (selector.name === 'Archived chats settings') assert.equal(category, 'Archived chats'); },
    },
  };
  return { t, calls, captures, records, read: () => ({ open, focused, category }) };
}
test('ordinary and non-narrow appearance runs do not add keyboard interactions', async () => {
  assert.deepEqual(await captureSettingsRowCompletion({ appearanceEnabled: false }, 'vertical'), { status: 'not-requested' });
  assert.deepEqual(await captureSettingsRowCompletion({ appearanceEnabled: true, narrowEnabled: false }, 'vertical'), { status: 'not-requested' });
});
test('actual observed column remains pending without End, activation, dismissal or capture', async () => {
  const { t, calls, captures } = context('column');
  assert.deepEqual(await captureSettingsRowCompletion(t, 'vertical'), { status: 'pending-observed-column' });
  assert.deepEqual(calls, []); assert.deepEqual(captures, []);
});
test('real row sequence observes End, activation, dismissal then original Appearance/search focus', async () => {
  const { t, calls, captures, read } = context();
  assert.deepEqual(await captureSettingsRowCompletion(t, 'vertical'), { status: 'observed-row-completion' });
  assert.deepEqual(calls.filter(row => row[0] === 'key').map(row => row[1]), ['end', 'return', 'escape', 'command+,']);
  assert.deepEqual(captures.map(row => row.options), [
    { windowId: 31, state: 'settings-row-last-focused' }, { windowId: 31, state: 'settings-row-last-category-activated' },
    { windowId: 31, state: 'settings-row-escape-dismissed' }, { windowId: 31, state: 'settings-row-reopened-original-category-search-focused' },
  ]);
  assert.deepEqual(read(), { open: true, focused: 'Search settings', category: 'Appearance' });
});
test('unexpected last category, original query or wrong capture layout refuses before input', async () => {
  for (const change of ['last', 'query', 'layout']) {
    const { t, calls } = context(); const query = t.ax.query;
    t.ax.query = async selector => { const rows = await query(selector); if (change === 'last' && selector.within) rows.at(-1).name = 'Foreign'; if (change === 'query' && selector.name === 'Search settings') rows[0].value = 'Original ongoing search'; return rows; };
    await assert.rejects(captureSettingsRowCompletion(t, change === 'layout' ? 'horizontal' : 'vertical'));
    assert.deepEqual(calls, []);
  }
});
test('original action failure and recovery failure retain both debts', async () => {
  const { t } = context(); const primary = new Error('Original End refused'), cleanup = new Error('Original category restoration refused');
  t.ax.key = async () => { throw primary; }; t.ax.press = async () => { throw cleanup; };
  await assert.rejects(captureSettingsRowCompletion(t, 'vertical'), error => error instanceof AggregateError && error.errors[0] === primary && error.errors[1] === cleanup);
});
test('same-PID object retirement and changed original window refuse further actions/captures', async () => {
  for (const change of ['owner', 'window']) {
    const { t, captures } = context();
    t.capture = async (name, options) => { captures.push({ name, options }); if (change === 'owner') t.app = { pid: 993 }; else t.ax.windows = async () => [{ id: 32, layer: 0, width: 800, height: 700 }]; };
    await assert.rejects(captureSettingsRowCompletion(t, 'vertical'));
    assert.equal(captures.length, 1);
  }
});
