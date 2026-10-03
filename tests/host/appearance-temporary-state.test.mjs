import assert from 'node:assert/strict';
import { test } from 'node:test';
import { captureTemporaryAppearanceState, replaceAppearanceField } from './lib/appearance-temporary-state.mjs';

function fixture() {
  const events = [];
  const t = { appearanceEnabled: true, app: { pid: 201 }, ax: { pid: 201,
    windows: async () => [{ id: 71, layer: 0, width: 810, height: 700 }] },
    capture: async (name, options) => { events.push({ name, options }); return { name }; } };
  return { t, events };
}
test('temporary durable label is captured only after preparation and restored before return', async () => {
  const f = fixture(); let label = 'Original';
  f.t.capture = async (name, options) => { assert.equal(label, 'Long actual label'); f.events.push(options); return { name }; };
  const result = await captureTemporaryAppearanceState(f.t, { name: 'long-label', state: 'tab-long-manual-label',
    prepare: async owned => { await owned(async () => { label = 'Long actual label'; }); },
    restore: async owned => { await owned(async () => { label = 'Original'; }); } });
  assert.equal(result.name, 'long-label'); assert.equal(label, 'Original');
  assert.deepEqual(f.events, [{ windowId: 71, state: 'tab-long-manual-label' }]);
});
test('ordinary mode never prepares, restores or captures temporary state', async () => {
  const f = fixture(); f.t.appearanceEnabled = false;
  const forbidden = () => { throw Error('Unexpected ordinary fixture effect'); };
  await captureTemporaryAppearanceState(f.t, { prepare: forbidden, restore: forbidden });
  assert.deepEqual(f.events, []);
});
test('partial preparation is restored and preserves the original primary failure', async () => {
  const f = fixture(), primary = Error('Partial UI input'); let changed = false;
  await assert.rejects(captureTemporaryAppearanceState(f.t, { prepare: async () => { changed = true; throw primary; },
    restore: async () => { assert.equal(changed, true); changed = false; } }), error => error === primary);
  assert.equal(changed, false); assert.deepEqual(f.events, []);
});
test('capture and cleanup failures retain both original errors and primary cause', async () => {
  const f = fixture(), primary = Error('Capture refused'), cleanup = Error('Original name restoration failed');
  f.t.capture = async () => { throw primary; };
  await assert.rejects(captureTemporaryAppearanceState(f.t, { prepare: async () => {}, restore: async () => { throw cleanup; } }),
    error => error instanceof AggregateError && error.errors[0] === primary && error.errors[1] === cleanup && error.cause === primary);
});
test('retired owner refuses capture and cleanup effects while retaining cleanup debt', async () => {
  const f = fixture(); let restored = false;
  await assert.rejects(captureTemporaryAppearanceState(f.t, { prepare: async owned => owned(async () => { f.t.app = { pid: 201 }; }),
    restore: async () => { restored = true; } }), error => error instanceof AggregateError);
  assert.equal(restored, false); assert.deepEqual(f.events, []);
});
test('HID field editing requires actual focus and verifies observed text', async () => {
  const f = fixture(); let value = 'Original', focused = false;
  const events = []; f.t.ax.focus = async () => { focused = true; };
  f.t.ax.query = async () => [{ value, focused }];
  f.t.ax.key = async (...args) => { events.push(args); if (args[0] === 'backspace') value = ''; };
  f.t.ax.type = async next => { value = next; };
  const owned = operation => operation();
  await replaceAppearanceField(f.t, owned, {}, 'Actual long name');
  assert.equal(value, 'Actual long name');
  await replaceAppearanceField(f.t, owned, {}, ''); assert.equal(value, '');
  assert.deepEqual(events, [['command+a', 'hid'], ['command+a', 'hid'], ['backspace', 'hid']]);
  f.t.ax.focus = async () => { focused = false; };
  await assert.rejects(replaceAppearanceField(f.t, owned, {}, 'Foreign'), /Actual field focus/);
});

// Run the actual Home journey callback with controlled AX/RPC records, not native evidence.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run as homeRun } from './journeys/home-composer.mjs';
async function homeFixture(check, changes = {}) {
  const root = mkdtempSync(join(tmpdir(), 'aux-home-long-name-control-'));
  mkdirSync(join(root, 'Default'));
  writeFileSync(join(root, 'Default/Preferences'), JSON.stringify({ aux: { organization: { v2: { window: { activeSpaceId: 'original-space' } } } } }));
  const f = fixture(), events = [], draft = 'Keep this Home draft without opening or attaching a browser page.';
  let pages = [], popup = 0;
  Object.assign(f.t.app, { userDataDir: root });
  f.t.assert = assert;
  f.t.fixture = { url: 'http://127.0.0.1:35117', route: (path, html) => { events.push(['route', path]); assert.match(html, /<title>Weekend museum/); } };
  f.t.model = { respond() {}, endpoint: 'http://127.0.0.1:35118', model: 'source-control' };
  f.t.step = async (name, _meta, run) => { if (name.includes('nested context picker')) await run(); };
  f.t.restart = async () => {};
  f.t.until = async (_name, read) => { const result = await read(); assert.ok(result); return result; };
  f.t.rpc = async (method, params) => {
    events.push(['rpc', method, params]);
    if (method === 'settings.set') return {};
    if (method === 'settings.get') return { modelConfigured: true };
    if (method === 'runs.list') return [];
    if (method === 'workspace.get') return { activePageId: null, pages };
    if (method === 'pages.list') return pages;
    if (method === 'pages.open') {
      assert.deepEqual(params, { url: `${f.t.fixture.url}/home-long-context-title`, background: true, activate: false });
      const page = { pageId: 'exact-owned-temporary-id', url: params.url, title: 'Weekend museum visits and a relaxed dinner with friends', loading: false };
      pages = [page]; return page;
    }
    if (method === 'pages.close') { assert.deepEqual(params, { pageId: 'exact-owned-temporary-id' }); pages = []; return {}; }
    throw Error(`Unexpected RPC ${method}`);
  };
  f.t.ax.query = async selector => [{ value: selector.name === 'Reply to conversation' ? draft : '', focused: true }];
  f.t.ax.waitFor = async selector => { events.push(['wait', selector.name]); };
  f.t.ax.focus = async () => {};
  f.t.ax.click = async selector => { assert.ok(['Add context', 'Browser context'].includes(selector.name), 'No context row selection or grant allowed'); popup++; };
  f.t.ax.key = async (key, transport) => { assert.equal(key, 'escape'); assert.equal(transport, 'hid'); popup--; };
  f.t.ax.dump = async () => ({ controlled: true });
  f.t.capture = async (name, options) => {
    events.push(['capture', name, options]);
    if (name === 'home-long-context-picker') { assert.equal(pages[0]?.pageId, 'exact-owned-temporary-id'); assert.equal(popup, 2); }
    return { name };
  };
  changes.mutate?.(f.t);
  try { await check({ t: f.t, events, pages: () => pages }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}
test('actual Home branch captures a real title row without selection then closes only its returned page ID', async () => {
  await homeFixture(async f => {
    await homeRun(f.t);
    assert.deepEqual(f.pages(), []);
    const record = f.events.find(event => event[0] === 'capture' && event[1] === 'home-long-context-picker');
    assert.deepEqual(record[2], { windowId: 71, state: 'home-long-context-picker-owned-fixture' });
    assert.equal(f.events.filter(event => event[0] === 'rpc' && event[1] === 'pages.close').length, 1);
  });
});
test('actual Home producer refusal preserves failure after exact temporary page cleanup', async () => {
  const primary = Error('Native long context capture refused');
  await homeFixture(async f => {
    await assert.rejects(homeRun(f.t), error => error === primary);
    assert.deepEqual(f.pages(), []);
  }, { mutate: t => { const capture = t.capture; t.capture = (name, options) => name === 'home-long-context-picker' ? Promise.reject(primary) : capture(name, options); } });
});
test('actual Home capture failure and exact-page close refusal retain both debts', async () => {
  const primary = Error('Capture refused'), cleanup = Error('Close refused');
  await homeFixture(async f => {
    await assert.rejects(homeRun(f.t), error => error instanceof AggregateError && error.errors[0] === primary && error.errors[1] === cleanup);
    assert.equal(f.pages()[0].pageId, 'exact-owned-temporary-id');
  }, { mutate: t => {
    const capture = t.capture, rpc = t.rpc;
    t.capture = (name, options) => name === 'home-long-context-picker' ? Promise.reject(primary) : capture(name, options);
    t.rpc = (method, params) => method === 'pages.close' ? Promise.reject(cleanup) : rpc(method, params);
  } });
});
