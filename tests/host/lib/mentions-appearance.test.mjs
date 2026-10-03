import assert from 'node:assert/strict';
import test from 'node:test';
import { requireMentionsAppearance, requireMentionDraft, retainMentionPage, requireChangedMentionPage, closeOriginalMentionPages } from './mentions-appearance.mjs';
const page = { pageId: 'original-a', url: 'http://127.0.0.1:1234/a', sessionId: 'native-original', documentEpoch: 2, ownedByRuntime: false, loading: false };
const original = retainMentionPage([page], page.pageId, page.url);
test('only the exact paired appearance ID is admitted', () => {
  requireMentionsAppearance({ journeyId: 'mentions-appearance', appearance: true, pair: {} });
  for (const args of [{ journeyId: 'tab-mentions', appearance: true, pair: {} }, { journeyId: 'mentions-appearance', appearance: false, pair: {} }, { journeyId: 'mentions-appearance', appearance: true }]) assert.throws(() => requireMentionsAppearance(args));
});
test('actual draft uniqueness, value and focus are required', () => {
  requireMentionDraft([{ value: '@A ', focused: true }], '@A ', true);
  for (const rows of [[], [{ value: '@A ', focused: false }], [{ value: 'changed', focused: true }], [{ value: '@A ', focused: true }, { value: '@A ', focused: true }]]) assert.throws(() => requireMentionDraft(rows, '@A ', true));
});
test('Changed requires original native document or session drift', () => {
  assert.throws(() => requireChangedMentionPage([page], original, page.url));
  assert.equal(requireChangedMentionPage([{ ...page, documentEpoch: 3 }], original, page.url).documentEpoch, 3);
  assert.equal(requireChangedMentionPage([{ ...page, sessionId: 'native-next' }], original, page.url).sessionId, 'native-next');
});
test('foreign, duplicate, owned and invalid document records refuse', () => {
  for (const rows of [[], [page, page], [{ ...page, url: 'http://foreign/' }], [{ ...page, ownedByRuntime: true }], [{ ...page, agentIsolation: {} }], [{ ...page, documentEpoch: -1 }], [{ ...page, documentEpoch: 1.5 }]]) assert.throws(() => retainMentionPage(rows, page.pageId, page.url));
});
function fixture(pages) {
  const closed = [];
  return { closed, rpc: async (method, args) => {
    if (method === 'pages.list') return pages;
    assert.equal(method, 'pages.close'); closed.push(args.pageId); pages = pages.filter(p => p.pageId !== args.pageId);
  }, until: async (_label, predicate) => assert.ok(await predicate()) };
}
test('cleanup uses original exact IDs and tolerates already closed original', async () => {
  const t = fixture([page]); await closeOriginalMentionPages(t, [original, { ...original, pageId: 'already-closed' }]); assert.deepEqual(t.closed, [page.pageId]);
});
test('cleanup refuses replacement and continues other original pages', async () => {
  const b = { ...page, pageId: 'original-b' }, t = fixture([{ ...page, sessionId: 'replacement' }, b]);
  await assert.rejects(closeOriginalMentionPages(t, [original, retainMentionPage([b], b.pageId, b.url)]), AggregateError);
  assert.deepEqual(t.closed, [b.pageId]);
});
test('missing source read and native close failures both remain cleanup debt', async () => {
  let reads = 0; const one = new Error('read refused'), two = new Error('close refused');
  const t = { rpc: async method => { if (method === 'pages.list') { if (++reads === 1) throw one; return [page]; } throw two; } };
  await assert.rejects(closeOriginalMentionPages(t, [original, original]), error => error instanceof AggregateError && error.errors[0] === one && error.errors[1] === two);
});
