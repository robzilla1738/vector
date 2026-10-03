import assert from 'node:assert/strict';

export const MENTIONS_APPEARANCE_ID = 'mentions-appearance';
export function requireMentionsAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, MENTIONS_APPEARANCE_ID);
  assert.equal(appearance, true, 'Mention draft states require --appearance');
  assert.ok(pair, 'Mention draft states require the original admitted appearance pair');
}
export const mentionComposer = { name: 'Reply to conversation', match: 'exact', scope: 'shell', index: 0 };
export function requireMentionDraft(rows, expected, focused = false) {
  assert.equal(rows.length, 1, 'Original draft field must remain unique');
  assert.equal(rows[0].value, expected, 'Original unsent draft changed');
  if (focused) assert.equal(rows[0].focused, true, 'Original composer must retain actual focus');
  return rows[0];
}
export function retainMentionPage(pages, pageId, url) {
  const matches = pages.filter(page => page.pageId === pageId);
  assert.equal(matches.length, 1, 'Original temporary page must remain unique');
  const page = matches[0];
  assert.equal(page.url, url);
  assert.ok(page.sessionId && !page.loading && !page.detached && !page.crashed);
  assert.equal(page.ownedByRuntime, false, 'Only genuine person pages belong to this fixture');
  assert.ok(Number.isSafeInteger(page.documentEpoch) && page.documentEpoch >= 0);
  assert.ok(!page.agentIsolation, 'Mention appearance must not isolate a page');
  return Object.freeze({ pageId, url, sessionId: page.sessionId, documentEpoch: page.documentEpoch });
}
export function requireChangedMentionPage(pages, original, url) {
  const next = retainMentionPage(pages, original.pageId, url);
  assert.ok(next.documentEpoch > original.documentEpoch || next.sessionId !== original.sessionId,
    'Changed state requires actual document or native session replacement');
  return next;
}
/** Refuse unknown/replaced scope; never rediscover a page by title. */
export async function closeOriginalMentionPages(t, originals) {
  const failures = [];
  for (const original of originals) {
    try {
      const pages = await t.rpc('pages.list');
      if (!pages.some(page => page.pageId === original.pageId)) continue;
      assert.deepEqual(retainMentionPage(pages, original.pageId, original.url), original,
        'Original temporary-page cleanup identity changed');
      await t.rpc('pages.close', { pageId: original.pageId });
      await t.until('original temporary page closed', async () => !(await t.rpc('pages.list')).some(page => page.pageId === original.pageId));
    } catch (error) { failures.push(error); }
  }
  if (failures.length) throw new AggregateError(failures, 'Original mention fixture cleanup refused');
}
