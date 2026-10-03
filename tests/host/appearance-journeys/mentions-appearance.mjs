import assert from 'node:assert/strict';
import { installTrustPages, newChat } from '../lib/l10-trust-fixtures.mjs';
import { captureHomeState } from '../lib/home-capture.mjs';
import { closeOriginalMentionPages, mentionComposer, requireMentionDraft, retainMentionPage, requireChangedMentionPage } from '../lib/mentions-appearance.mjs';

export const journey = {
  id: 'mentions-appearance', title: 'Unsent mention listbox and original-document drift states',
  features: ['tabMentions'], devAcceptance: ['tabMentions'], needs: ['accessibility', 'screen-recording'],
  model: 'loopback', launch: {}, timeoutMs: 90_000, owner: 'L10 Agent trust',
};
const shell = name => ({ name, match: 'exact', scope: 'shell', index: 0 });
export async function run(t) {
  installTrustPages(t.fixture);
  const originalRuns = await t.rpc('runs.list');
  const originalCalls = t.model.calls.length;
  const originals = new Map();
  let primary;
  const urlA = `${t.fixture.url}/l10/mentions/a`, urlB = `${t.fixture.url}/l10/mentions/b`;
  async function unchanged() {
    assert.deepEqual(await t.rpc('runs.list'), originalRuns, 'An unsent mention must not create or alter a run');
    assert.equal(t.model.calls.length, originalCalls, 'An unsent mention must not dispatch a model call');
    return { pages: await t.rpc('pages.list'), runs: originalRuns };
  }
  async function capture(name, state, text, focused = false) {
    requireMentionDraft(await t.ax.query(mentionComposer), text, focused);
    const rpc = await unchanged();
    await captureHomeState(t, name, state);
    return { ax: await t.ax.dump(), rpc };
  }
  try {
    const a = await t.rpc('pages.open', { url: urlA, activate: true });
    // Retain the returned identity even when later live readiness fails.
    originals.set(a.pageId, a);
    await t.until('A original person document ready', async () => (await t.rpc('pages.list')).some(p => p.pageId === a.pageId && p.sessionId && !p.loading));
    const original = retainMentionPage(await t.rpc('pages.list'), a.pageId, urlA); originals.set(a.pageId, original);
    const b = await t.rpc('pages.open', { url: urlB, activate: true }); originals.set(b.pageId, b);
    await t.until('B original person document ready', async () => (await t.rpc('pages.list')).some(p => p.pageId === b.pageId && p.sessionId && !p.loading));
    originals.set(b.pageId, retainMentionPage(await t.rpc('pages.list'), b.pageId, urlB));
    await newChat(t);
    await t.step('open the actual caret mention listbox with B selected', { kind: 'ui', features: ['tabMentions'] }, async () => {
      await t.ax.type('@Aux mention A', mentionComposer);
      await t.ax.waitFor(shell('Mention a source'));
      return capture('mentions-caret-listbox', 'mentions-caret-listbox', '@Aux mention A', true);
    });
    await t.step('select the available source and delete its whole token', { kind: 'ui', features: ['tabMentions'] }, async () => {
      await t.ax.key('enter', 'hid');
      await t.ax.waitFor(shell('Mention a source'), 'absent');
      await t.ax.waitFor(shell('Remove @Aux mention A'));
      assert.equal((await t.ax.query(shell('Changed'))).length, 0);
      assert.equal((await t.ax.query(shell('Closed'))).length, 0);
      const available = await capture('mentions-available-focused', 'mentions-available-focused', '@Aux mention A ', true);
      await t.ax.key('backspace', 'hid');
      await t.ax.waitFor(shell('Remove @Aux mention A'), 'absent');
      requireMentionDraft(await t.ax.query(mentionComposer), '', true);
      await captureHomeState(t, 'mentions-whole-token-deleted', 'mentions-whole-token-deleted');
      await unchanged();
      return available;
    });
    await t.ax.type('@Aux mention A', mentionComposer);
    await t.ax.waitFor(shell('Mention a source'));
    await t.ax.key('enter', 'hid');
    await t.ax.waitFor(shell('Mention a source'), 'absent');
    await t.ax.type('Keep this unsent draft.', mentionComposer);
    const draft = '@Aux mention A Keep this unsent draft.';
    await t.step('person navigation preserves the unsent original token as Changed', { kind: 'ui', features: ['tabMentions'] }, async () => {
      await t.ax.press({ role: 'AXRadioButton', name: '^Aux mention A(?: Close Aux mention A)?$', match: 'regex', scope: 'shell', index: 0 });
      await t.ax.press({ name: 'Replace A document', match: 'exact', scope: 'page', index: 0 });
      const nextUrl = `${t.fixture.url}/l10/mentions/replaced`;
      await t.until('original A genuinely replaced', async () => (await t.rpc('pages.list')).some(p => p.pageId === a.pageId && p.url === nextUrl && !p.loading && (p.documentEpoch > original.documentEpoch || p.sessionId !== original.sessionId)));
      const next = requireChangedMentionPage(await t.rpc('pages.list'), original, nextUrl); originals.set(a.pageId, next);
      await t.ax.waitFor(shell('Changed'));
      return capture('mentions-changed-draft', 'mentions-changed-draft', draft);
    });
    await t.step('person closes the exact replaced A and retains the Closed draft', { kind: 'ui', features: ['tabMentions'] }, async () => {
      const next = originals.get(a.pageId);
      assert.deepEqual(retainMentionPage(await t.rpc('pages.list'), a.pageId, next.url), next);
      await t.ax.press({ role: 'AXButton', ...shell('Close Aux replacement A') });
      await t.until('original A closed', async () => !(await t.rpc('pages.list')).some(p => p.pageId === a.pageId));
      await t.ax.waitFor(shell('Closed'));
      return capture('mentions-closed-draft', 'mentions-closed-draft', draft);
    });
    await t.step('remove the closed source through its registered control without sending', { kind: 'ui', features: ['tabMentions'] }, async () => {
      await t.ax.press({ role: 'AXButton', ...shell('Remove @Aux mention A') });
      await t.ax.waitFor(shell('Remove @Aux mention A'), 'absent');
      await t.until('original composer focus restored', async () => (await t.ax.query(mentionComposer))[0]?.focused === true);
      return capture('mentions-removed-kept-draft', 'mentions-removed-kept-draft', 'Keep this unsent draft.', true);
    });
  } catch (error) { primary = error; }
  try { await closeOriginalMentionPages(t, [...originals.values()]); }
  catch (cleanup) {
    if (primary) throw new AggregateError([primary, cleanup], 'Mention appearance failed with retained cleanup debt', { cause: primary });
    throw cleanup;
  }
  if (primary) throw primary;
}
