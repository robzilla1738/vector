import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PageTargetSchema } from '@aux/contracts';
import { capturePageRecoveryAppearance, requirePageRecoveryAppearance } from './lib/page-recovery-appearance.mjs';

function fixture() {
  const page = { pageId: 'original-page', windowId: 'runtime-original', targetId: 'native:original-page', documentEpoch: 2, backend: 'aux', title: 'Owned TLS recovery', lastRevision: 0, controller: 'human', controllerEpoch: 0, createdAt: 1, lastActiveAt: 1, ownedByRuntime: false, url: 'https://127.0.0.1:9143/appearance-page-recovery', viewStatus: 'visible', loading: false, navigationError: { url: 'https://127.0.0.1:9143/appearance-page-recovery', message: 'net::ERR_CERT_AUTHORITY_INVALID', code: -202 } };
  let open = false, expanded = false, focused = false, seq = 1;
  const captures = [], calls = [], effects = [];
  const workspace = () => ({ activePageId: open ? page.pageId : null, sets: [], members: [], sessions: [], lastSeq: seq, streamId: 'original-stream', tabPlacements: {} });
  const t = { appearanceEnabled: true, narrowEnabled: true, signal: new AbortController().signal, app: { pid: 913 }, fixture: { tlsUrl: 'https://127.0.0.1:9143', certificate: 'owned-original', certificateSpki: 'owned-original-spki', route: () => () => { effects.push('remove-route'); } }, until: async (_label, read) => { const result = await read(); assert.ok(result); return result; }, rpc: async (method, args) => {
    calls.push({ method, args });
    if (method === 'settings.get') return { original: true };
    if (method === 'runs.list') return [];
    if (method === 'workspace.get') return workspace();
    if (method === 'pages.list') return open ? [structuredClone(page)] : [];
    if (method === 'pages.open') { open = true; seq++;  return { ...structuredClone(page), documentEpoch: 1 }; }
    if (method === 'pages.close') { assert.equal(args.pageId, page.pageId); open = false; seq++; return { ok: true }; }
    throw new Error(method);
  }, capture: async (name, options) => { captures.push({ name, options }); } };
  t.ax = { pid: 913, windows: async () => [{ id: 27, layer: 0, width: 800, height: 720 }], query: async selector => selector.name === 'Reply to conversation' ? [{ value: 'Original retained draft', focused }] : [{ focused }], waitFor: async (selector, state) => {
    if (selector.name.includes('net::ERR_CERT')) assert.equal(expanded, state === 'visible');
  }, focus: async selector => { effects.push(selector.name); focused = true; }, key: async (chord, via) => { assert.equal(chord, 'space'); assert.equal(via, 'hid'); expanded = !expanded; }, dump: async () => ({ retained: true }) };
  return { t, page, captures, calls, effects };
}
test('closed paired route refuses foreign ID, ordinary mode or missing original pair', () => {
  for (const change of [{ journeyId: 'https-first' }, { appearance: false }, { pair: undefined }]) assert.throws(() => requirePageRecoveryAppearance({ journeyId: 'page-recovery-appearance', appearance: true, pair: 'original', ...change }));
});
test('native-person certificate receipt requires no CDP session and three bracketed real UI states', async () => {
  const { t, captures, calls, effects } = fixture();
  const report = await capturePageRecoveryAppearance(t);
  assert.equal(report.rpc.originalError.navigationError.message, 'net::ERR_CERT_AUTHORITY_INVALID');
  assert.equal(report.rpc.certificateExceptionRequested, false);
  assert.deepEqual(captures.map(row => row.options.windowId), [27, 27, 27]);
  assert.deepEqual(captures.map(row => row.options.state), ['page-native-certificate-error-details-collapsed', 'page-native-certificate-error-details-expanded-focused', 'page-native-certificate-error-details-recollapsed-focused']);
  assert.equal(calls.filter(row => row.method === 'pages.close').length, 1);
  assert.equal(calls.find(row => row.method === 'pages.open').args.url, 'https://127.0.0.1:9143/appearance-page-recovery');
  assert.ok(!calls.some(row => /proceed|http|grant|permission/.test(row.method)));
  assert.equal(effects.at(-1), 'remove-route');
});
test('non-original error/URL/session/window/doc replacement cannot borrow a certificate capture', async () => {
  for (const kind of ['code', 'message', 'url', 'session', 'window', 'document']) {
    const { t, page, captures } = fixture(); const originalRpc = t.rpc;
    t.rpc = async (method, args) => {
      const value = await originalRpc(method, args);
      if (method === 'pages.list' && value.length) {
        if (kind === 'code') value[0].navigationError.code = -102;
        if (kind === 'message') value[0].navigationError.message = 'net::ERR_CONNECTION_REFUSED';
        if (kind === 'url') value[0].navigationError.url += '/foreign';
        if (kind === 'session') value[0].sessionId = 'foreign-agent-session';
        if (kind === 'window') value[0].windowId = 'foreign';
        if (kind === 'document') value[0].documentEpoch = 0;
      }
      return value;
    };
    await assert.rejects(capturePageRecoveryAppearance(t)); assert.equal(captures.length, 0);
    assert.equal(page.pageId, 'original-page');
  }
});
test('postcapture focus/document/owner loss refuses while preserving original cleanup or debt', async () => {
  for (const kind of ['focus', 'document', 'owner', 'close']) {
    const { t, page, calls } = fixture(); const originalRpc = t.rpc;
    t.capture = async name => {
      if (!name.endsWith('expanded-focused')) return;
      if (kind === 'focus') { const query = t.ax.query; t.ax.query = async selector => selector.name === 'Connection details' ? [{ focused: false }] : query(selector); }
      if (kind === 'document') page.documentEpoch++;
      if (kind === 'owner') t.app = { pid: 913 };
      if (kind === 'close') t.rpc = async (method, args) => { if (method === 'pages.close') throw new Error('original close failed'); return originalRpc(method, args); };
    };
    await assert.rejects(capturePageRecoveryAppearance(t));
    if (kind === 'focus' || kind === 'document') assert.equal(calls.filter(row => row.method === 'pages.close').length, 1);
    if (kind === 'owner') assert.equal(calls.filter(row => row.method === 'pages.close').length, 0);
  }
});
test('observed narrow geometry and original fresh Home are admission requirements', async () => {
  for (const kind of ['geometry', 'pages', 'draft']) {
    const { t, captures, calls } = fixture(); const originalRpc = t.rpc;
    if (kind === 'geometry') t.ax.windows = async () => [{ id: 27, layer: 0, width: 901, height: 720 }];
    if (kind === 'pages') t.rpc = async (method, args) => method === 'pages.list' ? [{ pageId: 'existing-person-page' }] : originalRpc(method, args);
    if (kind === 'draft') t.ax.query = async () => [];
    await assert.rejects(capturePageRecoveryAppearance(t)); assert.equal(captures.length, 0); assert.ok(!calls.some(row => row.method === 'pages.open'));
  }
});
test('fixed caller enables original owned TLS without trust bypass or developer feature flags', () => {
  const source = readFileSync(new URL('./appearance-journeys/page-recovery-appearance.mjs', import.meta.url), 'utf8');
  assert.match(source, /fixture: \{ tls: true \}, launch: \{\}/);
  assert.doesNotMatch(source, /ignore-certificate|disable-features|devAcceptance|proceedInsecure/);
});

test('installed PageTarget schema accepts original native-person receipt with absent CDP session', () => {
  const { page } = fixture();
  assert.deepEqual(PageTargetSchema.parse(page), page);
  assert.equal(page.sessionId, undefined);
});

test('false original close ACK remains cleanup debt even if the page is already absent', async () => {
  const { t } = fixture(); const original = t.rpc;
  t.rpc = async (method, args) => { const result = await original(method, args); return method === 'pages.close' ? { ok: false } : result; };
  await assert.rejects(capturePageRecoveryAppearance(t), error => error instanceof AggregateError && error.errors.some(reason => /not acknowledged/.test(reason.message)));
});
