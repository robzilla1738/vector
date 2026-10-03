import assert from 'node:assert/strict';
import { fixturePage } from './fixture.mjs';
import { newChat, finished } from './l10-trust-fixtures.mjs';
import { captureHomeState } from './home-capture.mjs';
import { retainMentionPage, requireChangedMentionPage, closeOriginalMentionPages, requireMentionDraft } from './mentions-appearance.mjs';

const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell' });
const composer = shell('Reply to conversation');
const warning = 'A selected tab changed or closed. Update or remove it before sending.';
export function requireSourceSendState(rows, enabled) {
  assert.equal(rows.length, 1, 'Original Send control must remain unique');
  assert.equal(rows[0].enabled, enabled, 'Changed source must block sending until an explicit person choice');
}
export async function captureSavedSourceState(t, name, draft, enabled) {
  assert.equal(t.appearanceEnabled, true);
  const app = t.app, helper = t.ax, pid = app.pid;
  async function window() {
    assert.ok(t.app === app && t.ax === helper && app.pid === pid && helper.pid === pid && Number.isInteger(pid) && pid > 0);
    const rows = (await helper.windows()).filter(row => row.layer === 0 && row.width > 0 && row.height > 0);
    assert.equal(rows.length, 1);
    assert.ok(Number.isInteger(rows[0].id) && rows[0].id > 0, 'Original native window ID missing');
    return rows[0].id;
  }
  const originalWindow = await window();
  requireMentionDraft(await helper.query(composer), draft);
  requireSourceSendState(await helper.query(shell('Send message', 'AXButton')), enabled);
  const record = await captureHomeState(t, name, name);
  assert.equal(await window(), originalWindow, 'Original window replaced during source recovery capture');
  requireMentionDraft(await helper.query(composer), draft);
  requireSourceSendState(await helper.query(shell('Send message', 'AXButton')), enabled);
  return record;
}
/** Appearance-only real document drift; no injected store, status, RPC rejection or permission. */
export async function savedSourceRecovery(t) {
  assert.equal(t.appearanceEnabled, true);
  const path = '/first-chat/saved-source', nextPath = '/first-chat/saved-source-next';
  const url = `${t.fixture.url}${path}`, nextUrl = `${t.fixture.url}${nextPath}`;
  const title = 'Aux saved source recovery', nextTitle = 'Aux changed saved source';
  t.fixture.route(path, fixturePage(title, `<a href="${nextPath}">Replace saved source document</a>`));
  t.fixture.route(nextPath, fixturePage(nextTitle, '<p>Changed person document.</p>'));
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
    const draft = 'Keep this draft when the saved browser source changes.';
    await t.ax.type(draft, composer);
    const runs = await t.rpc('runs.list'), calls = t.model.calls.length;
    await t.ax.press({ name: `^${title}(?: Close ${title})?$`, role: 'AXRadioButton', match: 'regex', scope: 'shell' });
    await t.ax.press({ name: 'Replace saved source document', match: 'exact', scope: 'page' });
    await t.until('same original page replaced its document', async () => (await t.rpc('pages.list')).some(row => row.pageId === original.pageId && row.url === nextUrl && !row.loading && (row.documentEpoch > original.documentEpoch || row.sessionId !== original.sessionId)));
    originals[0] = requireChangedMentionPage(await t.rpc('pages.list'), original, nextUrl);
    await t.ax.waitFor(shell(warning));
    assert.deepEqual(await t.rpc('runs.list'), runs, 'Unsent source drift must not create a run');
    assert.equal(t.model.calls.length, calls, 'Unsent source drift must not dispatch a model');
    await captureSavedSourceState(t, 'first-chat-saved-source-changed-kept-draft', draft, false);
    await t.ax.press(shell('Add context', 'AXButton'));
    await t.ax.waitFor(shell(`Remove ${nextTitle}`, 'AXButton'));
    await t.ax.press(shell(`Remove ${nextTitle}`, 'AXButton'));
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell(warning), 'absent');
    await captureSavedSourceState(t, 'first-chat-saved-source-removed-kept-draft', draft, true);
    assert.deepEqual(await t.rpc('runs.list'), runs);
    assert.equal(t.model.calls.length, calls);
    await t.ax.press(shell('Send message', 'AXButton'));
    const ids = new Set(runs.map(row => row.runId));
    const run = await t.until('original kept draft starts after explicit source removal', async () => (await t.rpc('runs.list')).find(row => !ids.has(row.runId) && row.goal === draft));
    assert.deepEqual(run.pageIds, []);
    assert.deepEqual(run.config.contextPageRefs ?? [], []);
    assert.deepEqual(run.config.mentions ?? [], []);
    const details = await finished(t, run.runId);
    assert.deepEqual(details.run.pageIds, []);
    await t.ax.waitFor(shell('Page-free retry amber-839.'));
    await captureHomeState(t, 'first-chat-saved-source-recovered', 'first-chat-saved-source-recovered');
    result = { ax: await t.ax.dump(), rpc: { details, original, replacement: originals[0], pages: await t.rpc('pages.list') } };
  } catch (error) { primary = error; }
  try { await closeOriginalMentionPages(t, originals); }
  catch (cleanup) { if (primary) throw new AggregateError([primary, cleanup], 'Saved-source recovery failed with original cleanup debt', { cause: primary }); throw cleanup; }
  if (primary) throw primary;
  return result;
}
