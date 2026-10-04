import assert from 'node:assert/strict';
import { requireClosedContextRecoveredRun } from './closed-context-recovery-proof.mjs';
import { finished } from './l10-trust-fixtures.mjs';

export const RESTORED_CHAT_TITLE = 'Removed context recovery cerulean-619';
export const RESTORED_CHAT_GOAL = 'Continue this same restored conversation without reopening or attaching any browser tab.';
export const RESTORED_CHAT_ANSWER = 'Restored page-free continuation cerulean-619.';
const phase = 'restored-page-free';
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });

export function retainRestoredPageFreeProof(closed, recovered, pages, runs, calls, conversation) {
  requireClosedContextRecoveredRun(closed, recovered, recovered.goal);
  assert.equal(recovered.status, 'completed');
  assert.ok(typeof recovered.config?.chatId === 'string' && recovered.config.chatId);
  assert.equal(conversation.chatId, recovered.config.chatId);
  assert.equal(conversation.title, RESTORED_CHAT_TITLE);
  assert.ok(!pages.some(page => page.pageId === closed.source.pageId));
  const matches = runs.filter(run => run.runId === recovered.runId);
  assert.equal(matches.length, 1);
  assert.deepEqual(matches[0], recovered);
  return structuredClone({ closed, recovered, runs, calls, conversation });
}
export function requireRestoredPageFreeBeforeSend(proof, pages, runs, calls, recovered) {
  assert.ok(!pages.some(page => page.pageId === proof.closed.source.pageId), 'Removed original context must remain closed after restart');
  assert.deepEqual(runs, proof.runs, 'Restoring/reading the existing conversation cannot create or alter a run');
  assert.deepEqual(calls, proof.calls, 'Restoring the existing conversation cannot dispatch a model request');
  assert.deepEqual(recovered, proof.recovered, 'The original completed turn must remain the same retained conversation');
}
export function requireRestoredPageFreeFollowup(proof, run, decisions) {
  assert.ok(typeof run.runId === 'string' && run.runId);
  assert.ok(!proof.runs.some(previous => previous.runId === run.runId));
  assert.equal(run.goal, RESTORED_CHAT_GOAL);
  assert.equal(run.config?.chatId, proof.conversation.chatId, 'A fresh unrelated chat cannot stand in for the restored conversation');
  for (const values of [run.pageIds, run.config?.mentions ?? [], run.config?.contextPageRefs ?? [], run.config?.isolatedPageSources ?? []])
    assert.deepEqual(values, [], 'Removed browser context cannot return as pages, mentions, document refs or protected-copy scope');
  const actual = decisions.filter(decision => decision.phase === phase);
  assert.ok(actual.length > 0, 'The explicit next Send must reach the actual fixture model request');
  for (const decision of actual) assert.deepEqual(decision.observations, [], 'Restored page-free continuation cannot observe an old or unrelated page');
}

/** Caller proof only: actual owned App restart, original native UI, runtime records and fixture requests. */
export async function restoredPageFreeChat(t, closed, recovered, decisions, selectPhase) {
  assert.ok(typeof recovered.config?.chatId === "string" && recovered.config.chatId);
  const conversation = await t.until('the original recovered conversation title is durably available', async () => {
    const actual = await t.rpc('conversations.get', { chatId: recovered.config?.chatId });
    return actual?.title === RESTORED_CHAT_TITLE && actual;
  }, 30000);
  const proof = retainRestoredPageFreeProof(closed, recovered, await t.rpc('pages.list'), await t.rpc('runs.list'), t.model.calls, conversation);
  await t.restart();
  const restored = (await t.rpc('runs.get', { runId: recovered.runId })).run;
  requireRestoredPageFreeBeforeSend(proof, await t.rpc('pages.list'), await t.rpc('runs.list'), t.model.calls, restored);
  const caption = { name: RESTORED_CHAT_TITLE, role: "AXButton", match: "exact", scope: "shell" };
  if (!(await t.ax.query(shell('New chat', 'AXButton'))).length) {
    const sidebar = shell('Show sidebar', 'AXButton');
    if ((await t.ax.query(sidebar)).length) await t.ax.press(sidebar);
    if (!(await t.ax.query(shell('New chat', 'AXButton'))).length) {
      const chats = shell('Chats', 'AXButton');
      await t.ax.waitFor(chats); await t.ax.press(chats);
    }
  }
  await t.ax.waitFor(caption);
  assert.equal((await t.ax.query(caption)).length, 1, 'Only the exact original visible conversation may be reopened');
  const summaries = await t.rpc('conversations.list', { limit: 100 });
  const matches = summaries.filter(item => item.title === RESTORED_CHAT_TITLE);
  assert.equal(matches.length, 1); assert.equal(matches[0].chatId, proof.conversation.chatId);
  await t.ax.press(caption);
  await t.ax.waitFor(shell('Reply to conversation'), 'enabled');
  await t.ax.waitFor(shell('Keep this reply when the explicitly selected browser tab closes.'));
  await t.ax.waitFor(shell('The selected tab is unavailable. Choose another browser context before sending.'), 'absent');
  requireRestoredPageFreeBeforeSend(proof, await t.rpc('pages.list'), await t.rpc('runs.list'), t.model.calls,
    (await t.rpc('runs.get', { runId: recovered.runId })).run);
  selectPhase(phase);
  await t.ax.type(RESTORED_CHAT_GOAL, shell('Reply to conversation'));
  await t.ax.waitFor(shell('Send message', 'AXButton'), 'enabled');
  requireRestoredPageFreeBeforeSend(proof, await t.rpc('pages.list'), await t.rpc('runs.list'), t.model.calls,
    (await t.rpc('runs.get', { runId: recovered.runId })).run);
  await t.ax.press(shell('Send message', 'AXButton'));
  const requested = await t.until('the explicit next turn belongs to the restored original conversation', async () =>
    (await t.rpc('runs.list')).find(run => !proof.runs.some(previous => previous.runId === run.runId) && run.goal === RESTORED_CHAT_GOAL), 30000);
  const details = await finished(t, requested.runId);
  requireRestoredPageFreeFollowup(proof, requested, decisions);
  requireRestoredPageFreeFollowup(proof, details.run, decisions);
  await t.ax.waitFor(shell(RESTORED_CHAT_ANSWER));
  assert.ok(!(await t.rpc('pages.list')).some(page => page.pageId === proof.closed.source.pageId));
  assert.equal(t.model.errors.length, 0);
  return { ax: await t.ax.dump(), rpc: { proof, details, decisions, pages: await t.rpc('pages.list') } };
}
