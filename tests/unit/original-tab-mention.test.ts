import { expect, it } from 'vitest';
import type { PageTarget } from '@aux/contracts';
import { mentionQuery, insertMention, backspaceMention } from '../../apps/shell/src/mentions/tokens';
import { mentionCandidates } from '../../apps/shell/src/mentions/candidates';
import { originalTabMention, requireOriginalMention, requireMentionReference } from '../host/lib/original-tab-mention.mjs';
const page: PageTarget = { pageId: 'a', targetId: 'native-a', backend: 'aux', url: 'http://127.0.0.1:4321/l10/mentions/a', title: 'Aux mention A', sessionId: 'original-native', documentEpoch: 3, viewStatus: 'visible', lifecycle: 'live', controller: 'none', controllerEpoch: 0, ownedByRuntime: false, lastRevision: 0, createdAt: 1, lastActiveAt: 1 };
it('reproduces whitespace title query refusal using actual product parser', () => {
  const query = '@Aux mention A'; expect(mentionQuery(query, query.length)).toBeNull();
});
it.each([false, true])('actual original URL query yields exact read/act pair and original token (%s)', interact => {
  const original = originalTabMention([page], page.title, interact);
  const query = mentionQuery(original.query, original.query.length)!; expect(query).not.toBeNull();
  const matching = mentionCandidates({ pages: [page, { ...page, pageId: 'b', url: 'http://127.0.0.1:4321/l10/mentions/b', title: 'Aux mention B' }] })
    .filter(candidate => `${candidate.label} ${candidate.detail}`.toLocaleLowerCase().includes(query.query.toLocaleLowerCase()));
  expect(matching.map(candidate => candidate.id)).toEqual(['tab:a:read', 'tab:a:act']);
  const selected = matching[interact ? 1 : 0]!; requireMentionReference(selected.ref, original);
  const draft = insertMention({ text: original.query, tokens: [] }, query, selected.label, selected.ref);
  expect(draft.text).toBe(`@${original.label} `); expect(backspaceMention(draft, draft.text.length)?.draft).toEqual({ text: '', tokens: [] });
});
it('retains original document/session/access and refuses ambiguities', () => {
  const original = originalTabMention([page], page.title);
  for (const pages of [[page, page], [{ ...page, sessionId: 'replacement' }], [{ ...page, documentEpoch: 4 }], [{ ...page, ownedByRuntime: true }], [page, { ...page, pageId: 'b', title: 'Other', url: page.url + '/foreign' }]]) expect(() => requireOriginalMention(pages, original)).toThrow();
  const ref = mentionCandidates({ pages: [page] })[2]!.ref; expect(() => requireMentionReference(ref, original)).toThrow();
});
