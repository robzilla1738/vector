import assert from 'node:assert/strict';
import { fixturePage } from './fixture.mjs';
import { newChat, finished } from './l10-trust-fixtures.mjs';
import { captureHomeState } from './home-capture.mjs';
import { captureSavedSourceState } from './saved-source-recovery.mjs';
import { retainMentionPage, requireChangedMentionPage, closeOriginalMentionPages } from './mentions-appearance.mjs';

const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell' });
const composer = shell('Reply to conversation');
const warning = 'A selected tab changed or closed. Update or remove it before sending.';
export function requireUpdatedSourceRun(run, original) {
  const refs = run.config?.contextPageRefs;
  assert.equal(refs?.length, 1, 'Only the explicitly updated source may be retained');
  for (const key of ['pageId', 'url', 'sessionId', 'documentEpoch']) assert.equal(refs[0][key], original[key], `Original updated source ${key} changed`);
  assert.deepEqual(run.config?.mentions ?? [], [], 'A saved source update must not manufacture mention access');
  const copies = run.config?.isolatedPageSources;
  if (copies?.length) {
    assert.equal(copies.length, 1, 'Only the original source may own a protected copy');
    assert.equal(copies[0].sourcePageId, original.pageId);
    assert.equal(copies[0].url, original.url);
    assert.ok(typeof copies[0].pageId === 'string' && copies[0].pageId !== original.pageId);
    assert.deepEqual(run.pageIds, [copies[0].pageId]);
  } else assert.deepEqual(run.pageIds, [original.pageId]);
}
/** Appearance-only real document drift; no injected store, status, RPC rejection or permission. */
export async function savedSourceUpdate(t) {
  assert.equal(t.appearanceEnabled, true);
  const path = '/first-chat/update-source', nextPath = '/first-chat/update-source-next';
  const url = `${t.fixture.url}${path}`, nextUrl = `${t.fixture.url}${nextPath}`;
  const title = 'Aux update source recovery', nextTitle = 'Aux updated saved source';
  t.fixture.route(path, fixturePage(title, `<a href="${nextPath}">Replace update source document</a>`));
  t.fixture.route(nextPath, fixturePage(nextTitle, '<p>Optional context evidence: copper-467.</p>'));
  const originals = [];
  let primary, result;
  try {
    const page = await t.rpc('pages.open', { url, activate: true }); originals.push(page);
    await t.until('original saved-source person document ready', async () => (await t.rpc('pages.list')).some(row => row.pageId === page.pageId && row.url === url && row.sessionId && !row.loading));
    const original = retainMentionPage(await t.rpc('pages.list'), page.pageId, url); originals[0] = original;
    await newChat(t);
    await t.ax.press(shell('Add context', 'AXButton'));
    await t.ax.press(shell('Browser context', 'AXButton'));
    await t.ax.press({ name: 'No browser context', role: 'AXCheckBox', match: 'contains', scope: 'shell' });
    await t.ax.key('escape', 'hid');
    await t.ax.press(shell('Add context', 'AXButton'));
    await t.ax.press(shell('Add browser tabs', 'AXButton'));
    const choice = { name: title, role: 'AXCheckBox', match: 'contains', scope: 'shell' };
    await t.ax.waitFor(choice);
    const candidates = await t.ax.query(choice);
    assert.equal(candidates.length, 1, 'Only the exact synthetic source may be selected');
    assert.equal(candidates[0].checked, false);
    await t.ax.press(choice);
    await t.ax.waitFor(shell(`Remove ${title}`, 'AXButton'));
    await t.ax.key('escape', 'hid');
    const draft = 'Keep this draft and read the source only after I update it.';
    await t.ax.type(draft, composer);
    const runs = await t.rpc('runs.list'), calls = t.model.calls.length;
    await t.ax.press({ name: `^${title}(?: Close ${title})?$`, role: 'AXRadioButton', match: 'regex', scope: 'shell' });
    await t.ax.press({ name: 'Replace update source document', match: 'exact', scope: 'page' });
    await t.until('same original page replaced its document', async () => (await t.rpc('pages.list')).some(row => row.pageId === original.pageId && row.url === nextUrl && !row.loading && (row.documentEpoch > original.documentEpoch || row.sessionId !== original.sessionId)));
    originals[0] = requireChangedMentionPage(await t.rpc('pages.list'), original, nextUrl);
    await t.ax.waitFor(shell(warning));
    assert.deepEqual(await t.rpc('runs.list'), runs, 'Unsent source drift must not create a run');
    assert.equal(t.model.calls.length, calls, 'Unsent source drift must not dispatch a model');
    await captureSavedSourceState(t, 'first-chat-update-source-changed-kept-draft', draft, false);
    await t.ax.press(shell('Add context', 'AXButton'));
    await t.ax.waitFor(shell(`Use current ${nextTitle}`, 'AXButton'));
    await t.ax.press(shell(`Use current ${nextTitle}`, 'AXButton'));
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell(warning), 'absent');
    await captureSavedSourceState(t, 'first-chat-update-source-acknowledged-kept-draft', draft, true);
    assert.deepEqual(await t.rpc('runs.list'), runs);
    assert.equal(t.model.calls.length, calls);
    assert.deepEqual(retainMentionPage(await t.rpc('pages.list'), original.pageId, nextUrl), originals[0], 'Updated original document changed before Send');
    await t.ax.press(shell('Send message', 'AXButton'));
    const ids = new Set(runs.map(row => row.runId));
    const run = await t.until('original kept draft starts after explicit source update', async () => (await t.rpc('runs.list')).find(row => !ids.has(row.runId) && row.goal === draft));
    requireUpdatedSourceRun(run, originals[0]);
    const details = await finished(t, run.runId);
    requireUpdatedSourceRun(details.run, originals[0]);
    await t.ax.waitFor(shell('Optional context evidence: copper-467.'));
    await captureHomeState(t, 'first-chat-update-source-recovered', 'first-chat-update-source-recovered');
    result = { ax: await t.ax.dump(), rpc: { details, original, replacement: originals[0], pages: await t.rpc('pages.list') } };
  } catch (error) { primary = error; }
  try { await closeOriginalMentionPages(t, originals); }
  catch (cleanup) { if (primary) throw new AggregateError([primary, cleanup], 'Saved-source update failed with original cleanup debt', { cause: primary }); throw cleanup; }
  if (primary) throw primary;
  return result;
}
