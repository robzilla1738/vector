import assert from 'node:assert/strict';
import test from 'node:test';
import { originalTabMention, openOriginalTabMention, selectOriginalTabMention } from './original-tab-mention.mjs';
const page = { pageId: 'a', url: 'http://127.0.0.1:4321/a', title: 'Aux mention A', sessionId: 'native-a', documentEpoch: 1, ownedByRuntime: false };
function fixture(original) {
  const keys = []; let selected = false;
  return { keys, rpc: async () => [page], until: async (_label, check) => assert.ok(await check()), ax: {
    type: async query => assert.equal(query, original.query), waitFor: async () => {}, key: async key => { keys.push(key); if (key === 'enter') selected = true; },
    query: async selector => selector.name === 'Reply to conversation' ? [{ focused: true, value: selected ? `@${original.label} ` : original.query }] : [{ focused: true, name: `${original.label} Read ${original.url}` }],
  } };
}
test('read and act use genuine keyboard option focus and original labels', async () => {
  for (const act of [false, true]) { const original = originalTabMention([page], page.title, act), t = fixture(original); await openOriginalTabMention(t, original); await selectOriginalTabMention(t, original); assert.deepEqual(t.keys, act ? ['down', 'end', 'enter'] : ['down', 'enter']); }
});
test('document replacement after opening refuses before Enter', async () => {
  const original = originalTabMention([page], page.title), t = fixture(original); await openOriginalTabMention(t, original); t.rpc = async () => [{ ...page, documentEpoch: 2 }]; await assert.rejects(selectOriginalTabMention(t, original)); assert.deepEqual(t.keys, []);
});
test('foreign or ambiguous native focused option refuses before Enter', async () => {
  const original = originalTabMention([page], page.title), t = fixture(original); t.ax.query = async () => [{ focused: true, name: original.label }]; await assert.rejects(selectOriginalTabMention(t, original)); assert.deepEqual(t.keys, ['down']);
});
