import assert from 'node:assert/strict';
import test from 'node:test';
import { captureSavedSourceState, requireSourceSendState, savedSourceRecovery } from './saved-source-recovery.mjs';

function context(change = () => {}) {
  const t = { appearanceEnabled: true, app: { pid: 71 }, ax: {
    pid: 71, windows: async () => [{ id: 81, layer: 0, width: 600, height: 500 }],
    query: async selector => selector.name === 'Reply to conversation' ? [{ value: 'kept draft' }] : [{ enabled: false }],
  }, capture: async (_name, value) => { change(t); return value; } };
  return t;
}
test('actual unique Send enabled Boolean is mandatory', () => {
  requireSourceSendState([{ enabled: false }], false);
  requireSourceSendState([{ enabled: true }], true);
  for (const rows of [[], [{ enabled: true }], [{ enabled: 0 }], [{ enabled: false }, { enabled: false }]]) assert.throws(() => requireSourceSendState(rows, false));
});
test('capture retains original draft, disabled control and native window', async () => {
  const t = context();
  assert.deepEqual(await captureSavedSourceState(t, 'changed', 'kept draft', false), { windowId: 81, state: 'changed' });
});
test('unpaired captures and ambiguous original fields refuse', async () => {
  const t = context(); t.appearanceEnabled = false;
  await assert.rejects(captureSavedSourceState(t, 'changed', 'kept draft', false));
  const ambiguous = context(); ambiguous.ax.query = async () => [];
  await assert.rejects(captureSavedSourceState(ambiguous, 'changed', 'kept draft', false));
});
test('replacement App/helper/window after capture refuses', async () => {
  for (const change of [t => { t.app = { pid: 71 }; }, t => { t.ax = { ...t.ax }; }, t => { t.ax.windows = async () => [{ id: 82, layer: 0, width: 600, height: 500 }]; }]) {
    await assert.rejects(captureSavedSourceState(context(change), 'changed', 'kept draft', false));
  }
});
test('draft overwrite or send becoming enabled during capture refuses', async () => {
  for (const change of [t => { t.ax.query = async selector => selector.name === 'Reply to conversation' ? [{ value: 'other draft' }] : [{ enabled: false }]; }, t => { t.ax.query = async selector => selector.name === 'Reply to conversation' ? [{ value: 'kept draft' }] : [{ enabled: true }]; }]) {
    await assert.rejects(captureSavedSourceState(context(change), 'changed', 'kept draft', false));
  }
});

function setupFailure(closeError) {
  const page = { pageId: 'original', url: 'http://127.0.0.1:71/first-chat/saved-source', sessionId: 'native-original', documentEpoch: 1, ownedByRuntime: false, loading: false };
  const primary = new Error('Original person document readiness failed');
  let live = [page];
  const closed = [];
  return { primary, closed, t: { appearanceEnabled: true, fixture: { url: 'http://127.0.0.1:71', route() {} }, ax: { query: async () => { throw primary; }, press: async () => { throw primary; } },
    rpc: async (method, args) => {
      if (method === 'pages.open') return page;
      if (method === 'pages.list') return live;
      assert.equal(method, 'pages.close'); assert.equal(args.pageId, page.pageId);
      closed.push(args.pageId); if (closeError) throw closeError; live = [];
    }, until: async (_label, predicate) => assert.ok(await predicate()),
  } };
}
test('setup failure still cleans only original retained native page and rethrows primary', async () => {
  const { t, primary, closed } = setupFailure();
  await assert.rejects(savedSourceRecovery(t), error => error === primary);
  assert.deepEqual(closed, ['original']);
});
test('setup failure retains original primary and actual cleanup refusal', async () => {
  const cleanup = new Error('Original native close refused'), { t, primary } = setupFailure(cleanup);
  await assert.rejects(savedSourceRecovery(t), error => error instanceof AggregateError && error.errors[0] === primary && error.errors[1].errors[0] === cleanup);
});
