import assert from 'node:assert/strict';
import { finished } from './l10-trust-fixtures.mjs';

const retryButton = { name: 'Retry this turn', role: 'AXButton', match: 'exact', scope: 'shell', index: 0 };
const identity = ['pageId', 'url', 'sessionId', 'documentEpoch'];
function retainedSource(original) {
  assert.equal(original.status, 'completed', 'Retry measurement starts from the genuinely completed original turn');
  assert.ok(typeof original.runId === 'string' && original.runId);
  assert.equal(original.config?.mentions?.length, 1, 'Original explicit read mention must remain unique');
  const mention = original.config.mentions[0];
  assert.equal(mention.kind, 'tab');
  assert.ok(typeof mention.pageId === 'string' && mention.pageId);
  assert.ok(typeof mention.url === 'string' && ['http:', 'https:'].includes(new URL(mention.url).protocol));
  assert.equal(mention.access, 'read', 'This journey cannot widen a read mention to interaction');
  assert.ok(typeof mention.sessionId === 'string' && mention.sessionId);
  assert.ok(Number.isSafeInteger(mention.documentEpoch) && mention.documentEpoch >= 0);
  assert.deepEqual(original.pageIds, [mention.pageId], 'Original read turn contains only its explicit source');
  assert.equal(original.config.contextPageRefs?.length, 1);
  for (const key of identity) assert.equal(original.config.contextPageRefs[0][key], mention[key], `Original context ${key} differs from its retained mention`);
  assert.deepEqual(original.config.isolatedPageSources ?? [], [], 'Read-only retry must not create task copy authority');
  return mention;
}
export function requireLiveOriginalReadSource(pages, original) {
  const source = retainedSource(original);
  const matches = pages.filter(page => page.pageId === source.pageId);
  assert.equal(matches.length, 1, 'Only the actual original selected source may satisfy retry readiness');
  const page = matches[0];
  for (const key of identity) assert.equal(page[key], source[key], `Original source ${key} changed before Retry`);
  assert.equal(page.ownedByRuntime, false);
  assert.ok(!page.agentIsolation && !page.loading && !page.detached && !page.crashed && !['detached', 'crashed'].includes(page.viewStatus));
  return page;
}
export function requireOriginalReadMentionRetry(original, retried) {
  retainedSource(original);
  assert.ok(typeof retried.runId === 'string' && retried.runId && retried.runId !== original.runId);
  assert.equal(retried.config?.retryOfRunId, original.runId);
  assert.equal(retried.goal, original.goal);
  assert.equal(retried.config.chatId, original.config.chatId);
  assert.deepEqual(retried.config.mentions, original.config.mentions, 'Retry must retain the complete original mention and access snapshot');
  assert.deepEqual(retried.config.contextPageRefs, original.config.contextPageRefs, 'Retry must retain the complete selected document/session snapshot');
  assert.deepEqual(retried.pageIds, original.pageIds, 'Retry cannot adopt another selected or runtime-owned page');
  assert.deepEqual(retried.config.isolatedPageSources ?? [], [], 'Retry cannot mint a protected copy from read authority');
}
/** Real registered Retry button + actual runs.list/get; this helper only asserts producer evidence. */
export async function retryOriginalReadMention(t, completed) {
  const original = structuredClone(completed);
  requireLiveOriginalReadSource(await t.rpc('pages.list'), original);
  const before = new Set((await t.rpc('runs.list')).map(run => run.runId));
  await t.ax.waitFor(retryButton);
  const controls = await t.ax.query(retryButton);
  assert.equal(controls.length, 1, 'The original conversation must expose one enabled Retry control');
  assert.equal(controls[0].enabled, true);
  requireLiveOriginalReadSource(await t.rpc('pages.list'), original);
  await t.ax.press(retryButton);
  const retried = await t.until('real explicit read-mention retry exists', async () => (await t.rpc('runs.list')).find(run => !before.has(run.runId) && run.config?.retryOfRunId === original.runId), 30000);
  requireOriginalReadMentionRetry(original, retried);
  requireLiveOriginalReadSource(await t.rpc('pages.list'), original);
  const details = await finished(t, retried.runId);
  requireOriginalReadMentionRetry(original, details.run);
  requireLiveOriginalReadSource(await t.rpc('pages.list'), original);
  return { original, retried, details, pages: await t.rpc('pages.list') };
}
