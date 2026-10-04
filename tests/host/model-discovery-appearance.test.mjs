import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SettingsService, Repo, openDb } from '@aux/runtime';
import { createFixture } from './lib/fixture.mjs';
import { holdModelDiscovery, discoveryModel, requireModelDiscoveryAppearance, captureModelDiscoveryAppearance } from './lib/model-discovery-appearance.mjs';
const until = async (_label, read) => { for (let i = 0; i < 1000; i++) { const value = await read(); if (value) return value; await new Promise(resolve => setImmediate(resolve)); } assert.fail('Controlled observation absent'); };
test('closed discovery ID refuses absent appearance or pair and unrelated IDs', () => {
  const args = { journeyId: 'model-discovery-appearance', appearance: true, pair: 'original-pair' }; requireModelDiscoveryAppearance(args);
  for (const change of [{ journeyId: 'other' }, { appearance: false }, { pair: null }]) assert.throws(() => requireModelDiscoveryAppearance({ ...args, ...change }));
});
test('actual installed SettingsService HTTP discovery remains pending then consumes real released catalog', async () => {
  const fixture = await createFixture(), controller = new AbortController(), http = holdModelDiscovery(fixture, controller.signal);
  const dir = mkdtempSync(join(tmpdir(), 'aux-discovery-test-')), db = openDb(':memory:');
  try {
    const settings = new SettingsService(new Repo(db), join(dir, 'settings.json'), {});
    await settings.set({ modelProvider: 'openai-compatible', compatibleEndpoint: http.endpoint, plannerModel: 'aux-owned-configured-model' });
    let completed = false; const pending = settings.listModels().then(result => { completed = true; return result; });
    await until('actual GET', () => http.receipts.length); http.requirePending(); assert.equal(completed, false);
    http.release(); const result = await pending;
    assert.ok(result.models.some(row => row.id === discoveryModel)); assert.ok(result.models.some(row => row.id === 'aux-owned-configured-model'));
    assert.equal(http.receipts[0].state, 'delivered'); assert.equal(result.source, 'configured');
  } finally { http.dispose(); db.close(); await fixture.close(); rmSync(dir, { recursive: true, force: true }); }
});
test('original HTTP cancellation retires pending response and never admits release', async () => {
  const fixture = await createFixture(), controller = new AbortController(), http = holdModelDiscovery(fixture, controller.signal);
  try {
    const request = fetch(`${http.endpoint}/models`).catch(error => error);
    await until('actual GET', () => http.receipts.length); http.requirePending(); controller.abort();
    assert.throws(() => http.requirePending()); assert.throws(() => http.release()); assert.ok(await request instanceof Error);
  } finally { http.dispose(); await fixture.close(); }
});
async function host() {
  const fixture = await createFixture(), controller = new AbortController(); let settings = { modelProvider: 'openai-compatible', compatibleEndpoint: `${fixture.url}/v1`, plannerModel: 'fixture-model' }, open = false, pending, focused = '', delivered = false;
  const original = { ...settings }, app = { pid: 234, processObservation: { pid: 234, generation: 1, launchKind: 'child' } }, captures = [], writes = [];
  const ax = { pid: 234, windows: async () => [{ id: 3, layer: 0, width: 810, height: 700 }], dump: async () => ({ open, focused }),
    query: async selector => {
      if (selector.name === 'Search settings') return open ? [{}] : [];
      if (selector.name === 'Reply to conversation') return [{ value: 'Retained original draft', focused: focused === selector.name }];
      if (selector.name === 'Discovering…') return !delivered ? [{ enabled: false }] : [];
      if (selector.name === 'Discover models') return delivered ? [{ enabled: true }] : [];
      if (selector.name === 'Planner model') { assert.equal(selector.role, 'AXComboBox', 'Actual input[list] Cocoa role'); return [{ role: 'AXComboBox', value: settings.plannerModel, focused: focused === selector.name }]; }
      return [];
    },
    key: async key => { if (key === 'command+,') open = true; if (key === 'escape') open = false; },
    press: async selector => { writes.push(selector.name); assert.equal(selector.name, 'Models'); pending = fetch(`${settings.compatibleEndpoint}/models`).then(response => response.json()).then(value => { assert.equal(value.data[0].id, discoveryModel); delivered = true; }); },
    focus: async selector => { focused = selector.name; },
    waitFor: async (selector, mode) => until(selector.name, async () => { const nodes = await ax.query(selector); return mode === 'absent' ? !nodes.length : nodes.length; }),
  };
  const t = { appearanceEnabled: true, app, ax, fixture, model: { calls: [] }, signal: controller.signal, until,
    rpc: async (method, patch) => { if (method === 'settings.set') { settings = { ...settings, ...patch }; return {}; } if (method === 'settings.get') return { ...settings }; if (method === 'pages.list' || method === 'runs.list') return []; if (method === 'workspace.get') return { workspaceId: 'original' }; assert.fail(method); },
    capture: async (name, options) => captures.push({ name, options }),
  };
  return { t, captures, original, read: () => ({ settings, focused, open }), close: async () => { controller.abort(); if (pending) await pending.catch(() => {}); await fixture.close(); } };
}
test('actual HTTP/source UI composition captures pending/released focus and restores settings draft and owner', async () => {
  const f = await host();
  try {
    const result = await captureModelDiscoveryAppearance(f.t);
    assert.deepEqual(f.captures.map(row => row.options), [{ windowId: 3, state: 'provider-model-discovery-real-http-pending' }, { windowId: 3, state: 'provider-model-discovery-released-planner-focused' }]);
    assert.deepEqual(f.read().settings, f.original); assert.equal(f.read().open, false); assert.equal(f.read().focused, 'Reply to conversation'); assert.equal(result.http[0].state, 'delivered'); assert.equal(result.unknownAvailability.status, 'unproven');
  } finally { await f.close(); }
});
test('same-PID replacement at pending capture preserves primary and original restoration debt', async () => {
  const f = await host(), primary = new Error('Original capture failed');
  f.t.capture = async () => { f.t.ax = { ...f.t.ax }; throw primary; };
  try { await assert.rejects(captureModelDiscoveryAppearance(f.t), error => error instanceof AggregateError && error.errors[0] === primary && error.errors.length > 1); }
  finally { await f.close(); }
});
test('pending UI falsely enabled refuses capture and restores original settings', async () => {
  const f = await host(), query = f.t.ax.query;
  f.t.ax.query = async selector => selector.name === 'Discovering…' ? [{ enabled: true }] : query(selector);
  try { await assert.rejects(captureModelDiscoveryAppearance(f.t)); assert.deepEqual(f.captures, []); assert.deepEqual(f.read().settings, f.original); }
  finally { await f.close(); }
});

test('same App and PID with replaced original process generation refuses restoration authority', async () => {
  const f = await host();
  f.t.capture = async () => { f.t.app.processObservation.generation++; };
  try { await assert.rejects(captureModelDiscoveryAppearance(f.t), /original restoration unresolved/); assert.equal(f.read().open, true); }
  finally { await f.close(); }
});
test('replacement request ledger refuses even when foreign ledger is empty', async () => {
  const f = await host(), original = f.t.model.calls;
  f.t.capture = async () => { original.push({ original: true }); f.t.model.calls = []; };
  try { await assert.rejects(captureModelDiscoveryAppearance(f.t), /original restoration unresolved/); assert.deepEqual(original, [{ original: true }]); }
  finally { await f.close(); }
});
test('duplicate actual planner control refuses instead of selecting an indexed candidate', async () => {
  const f = await host(), query = f.t.ax.query;
  f.t.ax.query = async selector => { assert.equal(selector.index, undefined); const nodes = await query(selector); return selector.name === 'Planner model' ? [...nodes, ...nodes] : nodes; };
  try { await assert.rejects(captureModelDiscoveryAppearance(f.t)); assert.deepEqual(f.read().settings, f.original); }
  finally { await f.close(); }
});

test('discovery cannot overwrite a preexisting fixed route', async () => {
  const fixture = await createFixture(), controller = new AbortController();
  try { fixture.route('/appearance-model-discovery/v1/models', { owner: 'original' }); assert.throws(() => holdModelDiscovery(fixture, controller.signal), /already has an owner/); assert.deepEqual(await (await fetch(`${fixture.url}/appearance-model-discovery/v1/models`)).json(), { owner: 'original' }); }
  finally { await fixture.close(); }
});
test('replaced held discovery route refuses release and preserves replacement during cleanup', async () => {
  const fixture = await createFixture(), controller = new AbortController(), http = holdModelDiscovery(fixture, controller.signal);
  let pending;
  try { pending = fetch(`${http.endpoint}/models`).catch(error => error); await until('original pending GET', () => http.receipts.length); fixture.route('/appearance-model-discovery/v1/models', { owner: 'replacement' }); assert.throws(() => http.release()); assert.throws(() => http.dispose(), /cleanup debt/); assert.deepEqual(await (await fetch(`${http.endpoint}/models`)).json(), { owner: 'replacement' }); await pending; }
  finally { controller.abort(); await fixture.close(); }
});
