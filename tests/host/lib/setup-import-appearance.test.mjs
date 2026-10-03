import test from 'node:test';
import assert from 'node:assert/strict';
import { requireSetupImportAppearance, assertSyntheticImportPreview, assertSyntheticImportCompletion, captureSetupImport, retirePreparedImportSource, readCompletedImport } from './setup-import-appearance.mjs';
const profile = { profileId: 'Default', categories: [{ category: 'bookmarks', available: true, count: 1 }, { category: 'history', available: true, bytes: 12288 }] };
const preview = { sources: [{ id: 'chrome', profiles: ['Default'], profileCategories: [profile], categories: profile.categories }, { id: 'attached-chrome', profiles: [], profileCategories: [], categories: [{ category: 'tabs', available: false }] }], recentJobs: [] };
const completed = { jobId: 'imp_original', done: true, cancelled: false, selections: [{ sourceId: 'chrome', profileId: 'Default', categories: ['bookmarks', 'history'] }], progress: ['bookmarks', 'history'].map(category => ({ source: 'chrome', profileId: 'Default', category, state: 'done', imported: 1, skipped: 0 })) };
test('fixed appearance ID, flag and original external admission are mandatory', () => {
  requireSetupImportAppearance({ journeyId: 'setup-import-appearance', appearance: true, pair: '/original-admitted' });
  for (const change of [{ journeyId: 'setup-appearance' }, { appearance: false }, { pair: undefined }]) assert.throws(() => requireSetupImportAppearance({ journeyId: 'setup-import-appearance', appearance: true, pair: '/original-admitted', ...change }));
});
test('preview refuses foreign sources, profiles, category widening and attached live tabs', () => {
  assertSyntheticImportPreview(preview);
  for (const alter of [p => p.sources.push(p.sources[0]), p => p.sources[0].profiles.push('Profile 1'), p => p.sources[0].profileCategories[0].categories.push({ category: 'passwords', available: true }), p => p.sources[1].categories[0].available = true]) {
    const candidate = structuredClone(preview); alter(candidate); assert.throws(() => assertSyntheticImportPreview(candidate));
  }
});
test('completion requires real two-category success with no interruption/error/skip', () => {
  assertSyntheticImportCompletion(completed);
  for (const change of [{ done: false }, { cancelled: true }, { interrupted: true }, { error: 'original error' }, { progress: [{ ...completed.progress[0], skipped: 1 }, completed.progress[1]] }]) assert.throws(() => assertSyntheticImportCompletion({ ...completed, ...change }));
});
function context({ premature = false, unknownCheckbox = false } = {}) {
  let confirmed = false, checked = false, presses = 0, sourceReads = 0;
  const calls = [], captures = [], lease = Object.freeze({ source: 'chrome', home: '/owned/synthetic', files: [] });
  const t = { appearanceEnabled: true, assert, fixture: { url: 'http://127.0.0.1:32123' }, app: { pid: 77, readImportSourceHome: () => { sourceReads++; return lease; } },
    ax: { pid: 77, waitFor: async () => {}, click: async selector => { calls.push(['click', selector.name]); if (selector.name === 'Import selected (2)') confirmed = true; }, press: async selector => { calls.push(['press', selector.name]); checked = ++presses === 2; }, query: async () => [{ checked: unknownCheckbox ? undefined : checked }], windows: async () => [{ id: 12, layer: 0, width: 800, height: 600 }], dump: async () => ({ sourceControl: true }) },
    capture: async (name, options) => { captures.push({ name, options }); }, step: async (_name, _options, work) => work(), until: async (_name, check) => assert.equal(await check(), true),
    rpc: async (method) => {
      calls.push(['rpc', method]);
      if (method === 'settings.get') return { modelConfigured: false };
      if (['pages.list', 'runs.list'].includes(method)) return [];
      if (method === 'bookmarks.list') return confirmed ? [{ url: 'http://127.0.0.1:32123/setup/bookmark' }] : [];
      if (method === 'history.list') return confirmed ? [{ url: 'http://127.0.0.1:32123/setup/history' }] : [];
      if (method === 'import.preview') return { ...preview, recentJobs: confirmed ? [completed] : [] };
      if (method === 'import.status') { if (confirmed || premature) return completed; throw Object.assign(new Error('No original job'), { code: 'not_found' }); }
      assert.fail(`Unexpected RPC ${method}`);
    },
  };
  return { t, calls, captures, sourceReads: () => sourceReads };
}
test('actual journey work sequence confirms through one original UI click, reads destinations, and revisits without import RPC', async () => {
  const fixture = context(); await captureSetupImport(fixture.t);
  assert.equal(fixture.calls.filter(([kind, name]) => kind === 'click' && name === 'Import selected (2)').length, 1);
  assert.equal(fixture.calls.some(([kind, name]) => kind === 'rpc' && ['import.run', 'import.cancel'].includes(name)), false);
  assert.equal(fixture.captures.length, 5); assert.ok(fixture.sourceReads() >= 5);
});
test('pre-consent existing job and missing actual checkbox state stop before confirmation', async () => {
  for (const options of [{ premature: true }, { unknownCheckbox: true }]) {
    const fixture = context(options); await assert.rejects(captureSetupImport(fixture.t));
    assert.equal(fixture.calls.some(([kind, name]) => kind === 'click' && name === 'Import selected (2)'), false);
  }
});
test('unexpected status errors propagate without being mistaken for absent original job', async () => {
  const fixture = context(), rpc = fixture.t.rpc;
  fixture.t.rpc = (method, params) => method === 'import.status' ? Promise.reject(new Error('original transport failure')) : rpc(method, params);
  await assert.rejects(captureSetupImport(fixture.t), /original transport failure/);
});

test('source cleanup waits original App stop completion and propagates original refusal', async () => {
  let finish, removed = false;
  const stop = new Promise(resolve => { finish = resolve; });
  const work = retirePreparedImportSource({ quit: () => stop, disposeImportSourceHome: () => { removed = true; } });
  await Promise.resolve(); assert.equal(removed, false); finish(); await work; assert.equal(removed, true);
  const refusal = new Error('original stop refused'); removed = false;
  await assert.rejects(retirePreparedImportSource({ quit: () => Promise.reject(refusal), disposeImportSourceHome: () => { removed = true; } }), error => error === refusal);
  assert.equal(removed, false);
});
test('unknown source cleanup debt surfaces after original stop', async () => {
  const debt = new Error('original changed source retained'); let stopped = false;
  await assert.rejects(retirePreparedImportSource({ quit: async () => { stopped = true; }, disposeImportSourceHome: () => { assert.equal(stopped, true); throw debt; } }), error => error === debt);
});

test('original UI may precede job creation; only exact absent-job state waits, transport errors propagate', async () => {
  assert.equal(await readCompletedImport(async () => { throw Object.assign(new Error('not yet created'), { code: 'not_found' }); }), null);
  assert.equal(await readCompletedImport(async () => ({ ...completed, done: false })), null);
  assert.strictEqual(await readCompletedImport(async () => completed), completed);
  const failure = new Error('original disconnected');
  await assert.rejects(readCompletedImport(async () => { throw failure; }), error => error === failure);
});
