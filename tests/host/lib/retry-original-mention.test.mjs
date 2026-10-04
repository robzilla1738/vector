import test from 'node:test';
import assert from 'node:assert/strict';
import { requireLiveOriginalReadSource, requireOriginalReadMentionRetry, retryOriginalReadMention } from './retry-original-mention.mjs';
const mention = { kind: 'tab', pageId: 'source', url: 'http://127.0.0.1:71/context', sessionId: 'native-document', documentEpoch: 4, access: 'read', token: '@Original source', selectedAt: 10 };
const original = () => ({ runId: 'original', goal: 'Read only this source', status: 'completed', pageIds: ['source'], config: { chatId: 'chat', mentions: [{ ...mention }], contextPageRefs: [{ pageId: mention.pageId, url: mention.url, sessionId: mention.sessionId, documentEpoch: mention.documentEpoch, selectedAt: 10 }] } });
const retry = () => ({ ...original(), runId: 'retry', config: { ...original().config, retryOfRunId: 'original' } });
const page = () => ({ ...mention, ownedByRuntime: false, loading: false, viewStatus: 'live' });
test('complete original read mention and source snapshot survive actual retry result', () => requireOriginalReadMentionRetry(original(), retry()));
test('same-page retry omitting mention passes a page-only check but fails required original provenance', () => {
 const value = retry(); delete value.config.mentions;
 assert.deepEqual(value.pageIds, original().pageIds);
 assert.equal(value.config.retryOfRunId, original().runId);
 assert.throws(() => requireOriginalReadMentionRetry(original(), value), /complete original mention/);
});
test('same URL epoch/session drift, changed access/token and foreign scope refuse', () => {
 for (const mutate of [value => { value.config.mentions[0].documentEpoch++; }, value => { value.config.mentions[0].sessionId = 'replacement'; }, value => { value.config.mentions[0].access = 'act'; }, value => { value.config.mentions[0].token = '@Other'; }, value => { value.config.contextPageRefs[0].documentEpoch++; }, value => { value.pageIds.push('foreign'); }, value => { value.config.isolatedPageSources = [{ pageId: 'copy', sourcePageId: 'source' }]; }, value => { value.config.retryOfRunId = 'other'; }, value => { value.config.chatId = 'other'; }]) {
  const value = retry(); mutate(value); assert.throws(() => requireOriginalReadMentionRetry(original(), value));
 }
});
test('missing/ambiguous original source or runtime-owned/replaced document cannot satisfy readiness', () => {
 for (const pages of [[], [page(), page()], [{ ...page(), sessionId: 'old' }], [{ ...page(), documentEpoch: 5 }], [{ ...page(), ownedByRuntime: true }], [{ ...page(), agentIsolation: {} }], [{ ...page(), loading: true }], [{ ...page(), viewStatus: 'detached' }]]) assert.throws(() => requireLiveOriginalReadSource(pages, original()));
});
function harness({ afterPress, beforePress, completed = retry(), controls = [{ enabled: true }] } = {}) {
 let pressed = 0, pageReads = 0;
 const calls = [];
 const t = { rpc: async (method, params) => { calls.push({ method, params }); if (method === 'pages.list') { pageReads++; return pressed ? afterPress ?? [page()] : pageReads > 1 ? beforePress ?? [page()] : [page()]; } if (method === 'runs.list') return pressed ? [original(), retry()] : [original()]; if (method === 'runs.get') return { run: completed }; throw new Error(`Unexpected producer ${method}`); }, ax: { waitFor: async () => {}, query: async () => controls, press: async control => { assert.equal(control.name, 'Retry this turn'); pressed++; } }, until: async (_name, predicate, deadline) => { assert.equal(deadline, 30000); const value = await predicate(); assert.ok(value); return value; } };
 return { t, calls, get pressed() { return pressed; } };
}
test('real helper uses original UI retry once and validates actual original RPC snapshots', async () => {
 const h = harness(); const result = await retryOriginalReadMention(h.t, original());
 assert.equal(h.pressed, 1); assert.equal(result.details.run.runId, 'retry');
 assert.ok(h.calls.some(call => call.method === 'runs.get' && call.params.runId === 'retry'));
 assert.ok(!h.calls.some(call => call.method === 'runs.retry' || call.method === 'pages.open'));
});
test('late readiness drift or ambiguous/disabled Retry refuses before original button press', async () => {
 for (const options of [{ beforePress: [{ ...page(), documentEpoch: 5 }] }, { controls: [] }, { controls: [{ enabled: true }, { enabled: true }] }, { controls: [{ enabled: false }] }]) {
  const h = harness(options); await assert.rejects(retryOriginalReadMention(h.t, original())); assert.equal(h.pressed, 0);
 }
});
test('completed retry cannot replace original scope after initial accepted result', async () => {
 const completed = retry(); completed.config.mentions[0].access = 'act';
 const h = harness({ completed }); await assert.rejects(retryOriginalReadMention(h.t, original()), /complete original mention/); assert.equal(h.pressed, 1);
});
test('source drift after original Retry is an explicit failure, never new document admission', async () => {
 const h = harness({ afterPress: [{ ...page(), sessionId: 'new-document' }] });
 await assert.rejects(retryOriginalReadMention(h.t, original()), /Original source sessionId changed/); assert.equal(h.pressed, 1);
});
