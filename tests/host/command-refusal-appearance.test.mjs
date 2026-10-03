import test from 'node:test';
import assert from 'node:assert/strict';
import { captureCommandRefusalAppearance } from './lib/command-refusal-appearance.mjs';
function fixture() {
  const pages = [{ pageId: 'original' }], captures = [];
  const records = { 'pages.list': pages, 'runs.list': [], 'workspace.get': { activePageId: 'original' }, 'settings.get': { modelConfigured: false } };
  const t = { appearanceEnabled: true, app: { pid: 917 }, ax: { pid: 917, query: async () => [{ value: 'Original question', focused: true }], dump: async () => ({ text: 'Ask is unavailable. Your prompt is kept.' }), windows: async () => [{ id: 23, layer: 0, width: 800, height: 700 }] }, rpc: async method => structuredClone(records[method]), capture: async (name, options) => { captures.push({ name, options }); return { original: true }; } };
  return { t, records, captures, args: { field: { role: 'AXComboBox', name: 'Address, search, and agent prompt' }, prompt: 'Original question', pages } };
}
test('ordinary qualification performs no observations or effects', async () => {
  assert.deepEqual(await captureCommandRefusalAppearance({ appearanceEnabled: false }, {}), { status: 'not-requested' });
});
test('observed focused refusal binds original owned window and state', async () => {
  const { t, args, captures } = fixture();
  assert.equal((await captureCommandRefusalAppearance(t, args)).status, 'observed');
  assert.deepEqual(captures, [{ name: 'command-ask-unavailable-retained-focused', options: { windowId: 23, state: 'command-ask-unavailable-retained-prompt-focused' } }]);
});
test('actual text, focus, prompt, model and no-run readiness are all required', async () => {
  for (const change of ['text', 'focus', 'prompt', 'model', 'run']) {
    const { t, args, captures, records } = fixture();
    if (change === 'text') t.ax.dump = async () => ({ text: 'Search fallback' });
    if (change === 'focus' || change === 'prompt') t.ax.query = async () => [{ value: change === 'prompt' ? 'Foreign' : args.prompt, focused: change !== 'focus' }];
    if (change === 'model') records['settings.get'].modelConfigured = true;
    if (change === 'run') records['runs.list'] = [{ runId: 'new' }];
    await assert.rejects(captureCommandRefusalAppearance(t, args)); assert.equal(captures.length, 0);
  }
});
test('same-PID object retirement and postcapture native window replacement refuse', async () => {
  for (const change of ['owner', 'window']) {
    const { t, args } = fixture();
    t.capture = async () => { if (change === 'owner') t.app = { pid: 917 }; else t.ax.windows = async () => [{ id: 24, layer: 0, width: 800, height: 700 }]; };
    await assert.rejects(captureCommandRefusalAppearance(t, args));
  }
});
