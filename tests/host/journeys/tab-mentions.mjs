import { configureModel, finished, installTrustPages, mentionedRun, tool } from '../lib/l10-trust-fixtures.mjs';
export const journey = {
  id: 'tab-mentions', title: 'Mention A and refuse a person-replaced document without observing B', features: ['tabMentions'],
  devAcceptance: ['tabMentions'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 90_000, owner: 'L10 Agent trust',
};
export async function run(t) {
  installTrustPages(t.fixture); await configureModel(t);
  const a = await t.rpc('pages.open', { url: `${t.fixture.url}/l10/mentions/a`, activate: true });
  const b = await t.rpc('pages.open', { url: `${t.fixture.url}/l10/mentions/b`, activate: true });
  await t.until('both attachments are live', async () => {
    const pages = await t.rpc('pages.list');
    return [a, b].every(page => pages.some(live => live.pageId === page.pageId && live.sessionId && !live.loading));
  });
  let release; const held = new Promise(resolve => { release = resolve; });
  let turns = 0;
  t.model.respond(async payload => {
    if (!payload.tools?.length) return { content: 'Aux mention A summary' };
    if (++turns === 1) return tool('snapshot', {}, 'l10-a-only-snapshot');
    if (turns === 2) {
      t.assert.match(JSON.stringify(payload.messages), /violet-271/, 'The explicit A mention must provide real A evidence while B is selected');
      t.assert.ok(!JSON.stringify(payload.messages).includes('amber-839'), 'The first snapshot must not expose B content');
      await held;
      return tool('goal_program', { code: 'const observed = snapshot(); if (observed.status === "unavailable") { display(observed); submitResult("The mentioned page is unavailable after its document changed."); } else { throw new Error("The person-replaced document was incorrectly readable"); }', answerLabel: '' }, 'l10-drift-snapshot');
    }
    t.assert.match(JSON.stringify(payload.messages), /"status"\s*:\s*"unavailable"/);
    return tool('submit_result', { report: 'The mentioned page is unavailable after its document changed.' }, 'l10-drift-finish');
  });
  t.signal.addEventListener('abort', release, { once: true });
  try {
  let run;
  await t.step('mention A while B is selected and send through the composer', { kind: 'ui', features: ['tabMentions'] }, async () => {
    run = await mentionedRun(t, 'Aux mention A', 'summarize L10 explicit A');
    t.assert.deepEqual(run.pageIds, [a.pageId]);
    t.assert.equal(run.config.mentions.length, 1);
    t.assert.equal(run.config.mentions[0].pageId, a.pageId);
    await t.until('the model has read A and is waiting on its second real turn', async () => t.model.calls.filter(call => call.tools?.length).length === 2);
    await t.capture('mention-a-selected');
    return { ax: await t.ax.dump(), rpc: { run } };
  });
  await t.step('navigate A as the person and observe the authoritative refusal', { kind: 'ui', features: ['tabMentions'] }, async () => {
    await t.ax.press({ role: 'AXRadioButton', name: '^Aux mention A(?: Close Aux mention A)?$', match: 'regex', scope: 'shell', index: 0 });
    await t.ax.waitFor({ name: 'Replace A document', match: 'exact', scope: 'page', index: 0 });
    await t.ax.press({ name: 'Replace A document', match: 'exact', scope: 'page', index: 0 });
    await t.until('A has a new document epoch', async () => (await t.rpc('pages.list')).some(page => page.pageId === a.pageId && page.url.endsWith('/l10/mentions/replaced') && page.documentEpoch > run.config.mentions[0].documentEpoch));
    release();
    const details = await finished(t, run.runId);
    t.assert.match(JSON.stringify(details.transcript), /unavailable/i);
    t.assert.ok(!JSON.stringify(details.steps).includes(b.pageId), 'No observe or execution step may target B');
    t.assert.ok(!JSON.stringify(t.model.calls).includes('amber-839'), 'B page content must never reach the model');
    t.assert.equal(t.model.errors.length, 0);
    await t.capture('mention-drift-refused');
    return { ax: await t.ax.dump(), rpc: details };
  });
  } finally { release(); t.signal.removeEventListener('abort', release); }
}
