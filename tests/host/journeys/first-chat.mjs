import { restoredPageFreeChat, RESTORED_CHAT_TITLE, RESTORED_CHAT_ANSWER } from "../lib/restored-page-free-chat.mjs";
import { retainClosedContextProof, requireClosedContextUnsent, requireClosedContextRecoveredRun } from '../lib/closed-context-recovery-proof.mjs';
import { retryOriginalReadMention } from '../lib/retry-original-mention.mjs';
import { savedSourceUpdate } from '../lib/saved-source-update.mjs';
import { savedSourceRecovery } from '../lib/saved-source-recovery.mjs';
import { captureFailedTurnDetailsAppearance } from "../lib/failed-turn-details-appearance.mjs";
import { captureFreshChat } from '../lib/chat-settings-capture.mjs';
import { captureHomeJourneyState } from '../lib/home-capture.mjs';
import { withFailureEvidence } from '../lib/journey-diagnostics.mjs';
import { fixturePage } from '../lib/fixture.mjs';
import { configureModel, finished, mentionedRun, newChat, observations, tool } from '../lib/l10-trust-fixtures.mjs';

export const journey = {
  id: 'first-chat', title: 'Answer and retry without a page; open a real page only through a tool',
  features: ['electronMigration'], devAcceptance: ['tabMentions'],
  needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: ({ fixture }) => ({ args: [
    `--host-resolver-rules=MAP aux-recovery.fixture.test 127.0.0.1:${new URL(fixture.url).port}`,
    '--no-proxy-server',
  ] }),
  timeoutMs: 150000, owner: 'Builder first-chat regression',
};
const selector = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });

async function send(t, text) {
  const previous = new Set((await t.rpc('runs.list')).map(run => run.runId));
  await t.ax.type(text, selector('Reply to conversation'));
  await t.ax.press(selector('Send message', 'AXButton'));
  return t.until('the submitted real conversation run exists', async () =>
    (await t.rpc('runs.list')).find(run => !previous.has(run.runId) && run.goal === text), 30000);
}

export async function run(t) {
  const pageIdentity = pages => pages.map(({ pageId, url, documentEpoch }) => ({ pageId, url, documentEpoch }));
  const captureInitialPages = async () => {
    const pages = await t.rpc('pages.list');
    t.assert.ok(pages.length === 0 || pages.length === 1, 'Fresh launch has only its optional native new-tab singleton');
    for (const page of pages) {
      t.assert.equal(page.url, 'chrome://newtab/', 'Only the exact native startup new tab is permitted');
      t.assert.equal(page.ownedByRuntime, false);
      t.assert.ok(typeof page.pageId === 'string' && page.pageId.length > 0);
      t.assert.ok(Number.isInteger(page.documentEpoch));
    }
    return pageIdentity(pages);
  };
  let initialPageIdentity = await captureInitialPages();
  const requireInitialPages = pages => {
    t.assert.equal(pages.filter(page => /^https?:/.test(page.url)).length, 0, 'Page-free chat has no eligible website context');
    t.assert.deepEqual(pageIdentity(pages), initialPageIdentity, 'Page-free actions retain only the exact initial native page identity');
  };
  await configureModel(t);
  const openedUrl = `http://aux-recovery.fixture.test/first-chat/opened`;
  const contextUrl = `${t.fixture.url}/first-chat/context`;
  t.fixture.route('/first-chat/opened', fixturePage('Aux first-chat tool page', '<p>Explicit tool destination ready.</p>'));
  t.fixture.route('/first-chat/context', fixturePage('Aux first-chat optional context', '<p>Optional context evidence: copper-467.</p>'));
  const heldAnswer = t.model.holdText('Page-free answer', ' violet-271.');
  let phase = 'answer', contextTurns = 0, openTurns = 0, openContinuationReached = false;
  const decisions = [];
  let releaseOpen;
  const openGate = new Promise(resolve => { releaseOpen = resolve; });
  let releaseOpenCompletion;
  const openCompletionGate = new Promise(resolve => { releaseOpenCompletion = resolve; });
  t.model.respond(async payload => {
    if (!payload.tools?.length) return { content: phase === 'closed-recovery' ? RESTORED_CHAT_TITLE : 'Aux synthetic first chat' };
    decisions.push({ phase, stream: payload.stream === true, observations: observations(payload) });
    if (phase === 'answer' || phase === 'retry' || phase === 'closed-recovery' || phase === 'restored-page-free') {
      t.assert.equal(observations(payload).length, 0, 'Page-free requests must contain no page observation');
      t.assert.equal(payload.stream, true, 'The answer must use the actual streaming transport');
      return phase === 'answer' ? heldAnswer.response : { content: phase === 'restored-page-free' ? RESTORED_CHAT_ANSWER : 'Page-free retry amber-839.' };
    }
    if (phase === 'open') {
      await openGate;
      if (++openTurns === 1)
        return tool('repl', { code: `const opened = openTab(${JSON.stringify(openedUrl)}); display(opened);` }, 'first-chat-open-real-url');
      openContinuationReached = true;
      await openCompletionGate;
      return tool('submit_result', { report: 'Explicit tool destination opened.' }, 'first-chat-complete-real-url');
    }
    if (++contextTurns === 1) return tool('snapshot', {}, 'first-chat-explicit-context');
    const observed = observations(payload).find(item => item.text.includes('copper-467'));
    t.assert.ok(observed, 'The explicitly attached page must produce a real observation');
    return tool('submit_result', { report: 'Optional context evidence: copper-467.', citations: [{
      pageId: observed.pageId, revision: observed.revision, observationId: observed.observationId,
      quote: 'Optional context evidence: copper-467.',
    }] }, 'first-chat-context-answer');
  });
  let first;
  await t.step('send first chat with no page and observe the streamed answer', { kind: 'ui', features: ['electronMigration'] }, async () => {
    requireInitialPages(await t.rpc('pages.list'));
    await newChat(t);
    requireInitialPages(await t.rpc('pages.list'));
    const freshAppearance = await captureFreshChat(t);
    let partial;
    try {
      first = await send(t, 'Give a short greeting without opening or attaching any browser page.');
      t.assert.deepEqual(first.pageIds, []);
      await t.ax.waitFor(selector('Page-free answer'));
      partial = await t.rpc('runs.get', { runId: first.runId });
      t.assert.ok(['running', 'planning'].includes(partial.run.status), 'Partial native answer must be visible before the real run becomes terminal');
      t.assert.deepEqual(partial.run.pageIds, []);
      requireInitialPages(await t.rpc('pages.list'));
      t.assert.equal((await t.ax.query(selector('Page-free answer violet-271.'))).length, 0, 'The held suffix must not be visible yet');
      await captureHomeJourneyState(t, 'first-chat-held-partial-answer', 'first-chat-held-partial-answer');
    } finally { heldAnswer.release(); }
    const details = await finished(t, first.runId);
    await t.ax.waitFor(selector('Page-free answer violet-271.'));
    t.assert.deepEqual(details.run.pageIds, []);
    requireInitialPages(await t.rpc('pages.list'));
    t.assert.ok(decisions.some(row => row.phase === 'answer' && row.stream));
    await captureHomeJourneyState(t, 'first-chat-page-free-answer', 'first-chat-page-free-answer');
    return { freshAppearance, ax: await t.ax.dump(), rpc: { partial, details, pages: await t.rpc('pages.list'), decisions } };
  });
  await t.step('retry the same page-free run without manufacturing page context', { kind: 'ui', features: ['electronMigration'] }, async () => {
    phase = 'retry';
    const previous = new Set((await t.rpc('runs.list')).map(run => run.runId));
    const retry = selector('Retry this turn', 'AXButton');
    await t.ax.waitFor(retry);
    await t.ax.press(retry);
    const retried = await t.until('the person-requested retry exists', async () =>
      (await t.rpc('runs.list')).find(run => !previous.has(run.runId) && run.config?.retryOfRunId === first.runId), 30000);
    t.assert.notEqual(retried.runId, first.runId);
    t.assert.deepEqual(retried.pageIds, []);
    t.assert.equal(retried.config.retryOfRunId, first.runId);
    const details = await finished(t, retried.runId);
    await t.ax.waitFor(selector('Page-free retry amber-839.'));
    t.assert.deepEqual(details.run.pageIds, []);
    requireInitialPages(await t.rpc('pages.list'));
    return { ax: await t.ax.dump(), rpc: { details, decisions } };
  });
  let requested;
  await t.step('an actual model tool opens exactly one real URL', { kind: 'ui', features: ['electronMigration'] }, async () => withFailureEvidence(t, 'first-chat-tool-open', async () => {
    phase = 'open';
    requested = await send(t, 'Open the explicit synthetic destination using openTab, then report completion.');
    try {
      await t.until('the actual model request reaches the held explicit open decision', async () => decisions.some(row => row.phase === 'open'), 30000);
      t.assert.deepEqual(requested.pageIds, [], 'Sending the request must not eagerly open a page');
      requireInitialPages(await t.rpc('pages.list'));
    } finally { releaseOpen(); }
    const allow = selector('Allow once', 'AXButton');
    await t.ax.waitFor(allow);
    requireInitialPages(await t.rpc('pages.list'));
    await t.ax.press(allow);
    let pages;
    try {
      await t.until('the model continuation follows the genuine tool open', async () => openContinuationReached, 30000);
      pages = await t.until('the one tool-opened real URL finishes loading', async () => {
        const pages = await t.rpc('pages.list');
        const retained = pages.filter(page => initialPageIdentity.some(initial => initial.pageId === page.pageId));
        const opened = pages.filter(page => !initialPageIdentity.some(initial => initial.pageId === page.pageId));
        t.assert.deepEqual(pageIdentity(retained), initialPageIdentity, 'The tool must retain the exact initial native page');
        return opened.length === 1 && opened[0].url === openedUrl && !opened[0].loading && opened;
      }, 30000);
      const active = await t.rpc('runs.get', { runId: requested.runId });
      t.assert.ok(['running', 'planning'].includes(active.run.status), 'Observe the original page before terminal authority retirement');
      t.assert.equal(pages[0].ownedByRuntime, true);
      t.assert.ok(!pages.some(page => page.url === 'about:blank'));
      t.assert.equal(t.model.errors.length, 0);
      await captureHomeJourneyState(t, 'first-chat-explicit-tool-open', 'first-chat-explicit-tool-open');
    } finally { releaseOpenCompletion(); }
    const details = await finished(t, requested.runId);
    t.assert.equal(details.run.result.report, 'Explicit tool destination opened.');
    return { ax: await t.ax.dump(), rpc: { details, pages, decisions } };
  }, async () => {
    const details = requested ? await t.rpc('runs.get', { runId: requested.runId }) : null;
    return { transcript: details?.transcript, requestedRunId: requested?.runId,
      run: details?.run, steps: details?.steps.slice(-8), modelCalls: details?.modelCalls,
      usage: details?.usage, pages: await t.rpc('pages.list') };
  }));
  await t.step('choose an optional person-owned page through the mention UI', { kind: 'ui', features: ['electronMigration', 'tabMentions'] }, async () => {
    const page = await t.rpc('pages.open', { url: contextUrl, activate: true });
    await t.until('the explicit context document is ready', async () =>
      (await t.rpc('pages.list')).some(item => item.pageId === page.pageId && item.url === contextUrl && !item.loading), 30000);
    phase = 'context';
    const requested = await mentionedRun(t, 'Aux first-chat optional context', 'Read only this explicitly attached page.');
    t.assert.deepEqual(requested.pageIds, [page.pageId]);
    t.assert.equal(requested.config.mentions.length, 1);
    t.assert.equal(requested.config.mentions[0].pageId, page.pageId);
    const details = await finished(t, requested.runId);
    await t.ax.waitFor(selector('Optional context evidence: copper-467.'));
    t.assert.ok(decisions.filter(row => row.phase === 'context').every(row => row.observations.every(item => item.pageId === page.pageId)), 'Optional attachment must not read the runtime-owned tool page');
    t.assert.equal(t.model.errors.length, 0);
    await captureHomeJourneyState(t, 'first-chat-optional-explicit-context', 'first-chat-optional-explicit-context');
    phase = 'context-retry'; contextTurns = 0;
    const retried = await retryOriginalReadMention(t, details.run);
    t.assert.ok(decisions.filter(row => row.phase === 'context-retry').length > 0, 'Retry must make a genuine model request');
    t.assert.ok(decisions.filter(row => row.phase === 'context-retry').every(row => row.observations.every(item => item.pageId === page.pageId)), 'Explicit retry must never observe the runtime-owned tool page');
    t.assert.equal(t.model.errors.length, 0);
    return { ax: await t.ax.dump(), rpc: { details, pages: await t.rpc('pages.list'), retried, decisions } };
  });
  let recoveredClosedContext;
  await t.step('remove closed explicit context and send the preserved draft without a page', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await newChat(t);
    const context = selector('Browser context', 'AXPopUpButton');
    await t.ax.press(selector('Add context', 'AXPopUpButton'));
    await t.ax.press(context);
    await t.ax.press({ name: 'Aux first-chat optional context', role: 'AXCheckBox', match: 'contains', scope: 'shell', index: 0 });
    await t.ax.key('escape', 'hid');
    const draft = 'Keep this reply when the explicitly selected browser tab closes.';
    const composer = selector('Reply to conversation');
    await t.ax.type(draft, composer);
    const closedProof = retainClosedContextProof(await t.rpc('pages.list'), contextUrl, await t.rpc('runs.list'), t.model.calls);
    await t.rpc('pages.close', { pageId: closedProof.source.pageId });
    await t.ax.waitFor(selector('The selected tab is unavailable. Choose another browser context before sending.'));
    const [input] = await t.ax.query(composer);
    const [submit] = await t.ax.query(selector('Send message', 'AXButton'));
    t.assert.equal(input?.value, draft, 'Closing explicit context must preserve the reply');
    t.assert.equal(submit?.enabled, false, 'Closed explicit context must not silently fall back to another page');
    requireClosedContextUnsent(closedProof, await t.rpc('pages.list'), await t.rpc('runs.list'), t.model.calls);
    await captureHomeJourneyState(t, 'first-chat-closed-context-kept-draft', 'first-chat-closed-context-kept-draft');
    await t.ax.press(selector('Add context', 'AXPopUpButton'));
    await t.ax.press(context);
    await t.ax.press({ name: 'No browser context', role: 'AXCheckBox', match: 'contains', scope: 'shell', index: 0 });
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(selector('The selected tab is unavailable. Choose another browser context before sending.'), 'absent');
    t.assert.equal((await t.ax.query(composer))[0]?.value, draft);
    requireClosedContextUnsent(closedProof, await t.rpc('pages.list'), await t.rpc('runs.list'), t.model.calls);
    phase = 'closed-recovery';
    const previous = new Set((await t.rpc('runs.list')).map(run => run.runId));
    await t.ax.press(selector('Send message', 'AXButton'));
    const requested = await t.until('the preserved draft starts after removing closed context', async () =>
      (await t.rpc('runs.list')).find(run => !previous.has(run.runId) && run.goal === draft), 30000);
    requireClosedContextRecoveredRun(closedProof, requested, draft);
    const details = await finished(t, requested.runId);
    requireClosedContextRecoveredRun(closedProof, details.run, draft);
    t.assert.deepEqual(details.run.pageIds, []);
    await t.ax.waitFor(selector('Page-free retry amber-839.'));
    await captureHomeJourneyState(t, 'first-chat-closed-context-recovered', 'first-chat-closed-context-recovered');
    recoveredClosedContext = { proof: closedProof, run: details.run };
    return { ax: await t.ax.dump(), rpc: { details, closedProof, pages: await t.rpc('pages.list'), decisions } };
  });
  await t.step('reopen the same recovered conversation after restart and send without removed browser context', { kind: 'ui', features: ['electronMigration'] }, () =>
    restoredPageFreeChat(t, recoveredClosedContext.proof, recoveredClosedContext.run, decisions, next => { phase = next; }));
  if (t.appearanceEnabled) await t.step('Saved browser-source drift preserves the original draft until explicit removal', { kind: 'ui', features: ['electronMigration'] }, () => savedSourceRecovery(t));
  if (t.appearanceEnabled) await t.step('Explicitly update the changed saved source before sending the kept draft', { kind: 'ui', features: ['electronMigration'] }, async () => { phase = 'updated-source'; contextTurns = 0; return savedSourceUpdate(t); });
  if (t.appearanceEnabled) await t.step("A real loopback provider failure keeps its failed turn and keyboard diagnostics", { kind: "ui", features: ["electronMigration"] }, () => captureFailedTurnDetailsAppearance(t));
}
