import { configureModel, finished, observations } from '../lib/l10-trust-fixtures.mjs';
import { captureHomeJourneyState } from '../lib/home-capture.mjs';

export const journey = {
  id: 'home-composer', title: 'Home keeps a page-free draft and optional browser context through remount',
  features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'loopback',
  launch: {}, timeoutMs: 150000, owner: 'Design reviewer Home capture preparation',
};
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const composer = shell('Reply to conversation');
const greeting = shell('What would you like to work on?');

export async function run(t) {
  const draft = 'Keep this Home draft without opening or attaching a browser page.';
  const decisions = [];
  t.model.respond(payload => {
    if (!payload.tools?.length) return { content: 'Home synthetic chat title' };
    const seen = observations(payload); decisions.push(seen);
    t.assert.deepEqual(seen, [], 'Home without explicit context must not observe a page');
    return { content: 'Home page-free answer indigo-593.' };
  });
  await t.step('Home exposes a usable composer and explicit setup with no configured model', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.waitFor(greeting);
    await t.ax.waitFor(composer, 'enabled');
    t.assert.equal((await t.rpc('settings.get')).modelConfigured, false, 'Fresh fixture must genuinely lack a configured model');
    await t.ax.waitFor(shell('Connect an AI model', 'AXButton'));
    t.assert.deepEqual(await t.rpc('pages.list'), []);
    await captureHomeJourneyState(t, 'home-model-missing', 'home-model-missing');
    await t.ax.type(draft, composer);
    t.assert.equal((await t.ax.query(composer))[0]?.value, draft);
    t.assert.deepEqual(await t.rpc('runs.list'), [], 'Draft typing must not start a run');
    await captureHomeJourneyState(t, 'home-draft-before-setup', 'home-draft-model-missing');
    return { ax: await t.ax.dump(), rpc: { settings: await t.rpc('settings.get'), pages: await t.rpc('pages.list') } };
  });
  await configureModel(t);
  await t.step('Home nested context picker keeps the original page-free draft and returns keyboard focus', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.until('loopback model configuration becomes real', async () => (await t.rpc('settings.get')).modelConfigured === true);
    await t.ax.waitFor(shell('Connect an AI model', 'AXButton'), 'absent');
    t.assert.equal((await t.ax.query(composer))[0]?.value, draft);
    await t.ax.click(shell('Add context', 'AXButton'));
    await t.ax.waitFor(shell('Browser context', 'AXButton'));
    await captureHomeJourneyState(t, 'home-add-context', 'home-add-context-menu');
    await t.ax.click(shell('Browser context', 'AXButton'));
    const search = shell('Find browser context');
    await t.ax.waitFor(search);
    await t.ax.focus(search);
    t.assert.equal((await t.ax.query(search))[0]?.focused, true, 'Nested picker must accept genuine native keyboard focus');
    await t.ax.waitFor({ name: 'No browser context', role: 'AXButton', match: 'contains', scope: 'shell', index: 0 });
    await captureHomeJourneyState(t, 'home-context-picker', 'home-context-picker-focused');
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(search, 'absent');
    t.assert.equal((await t.ax.query(shell('Browser context', 'AXButton')))[0]?.focused, true, 'Escape from child must return to the parent trigger');
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell('Browser context', 'AXButton'), 'absent');
    t.assert.equal((await t.ax.query(shell('Add context', 'AXButton')))[0]?.focused, true, 'Escape from parent must restore the composer context trigger');
    t.assert.equal((await t.ax.query(composer))[0]?.value, draft);
    t.assert.deepEqual(await t.rpc('pages.list'), [], 'Opening context controls must not manufacture a page');
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });
  await t.restart();
  await t.step('a real Home remount restores the draft then sends without browser context', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.waitFor(greeting);
    await t.ax.waitFor(composer, 'enabled');
    t.assert.equal((await t.ax.query(composer))[0]?.value, draft, 'Original Home draft must survive actual browser restart');
    t.assert.deepEqual(await t.rpc('pages.list'), []);
    await captureHomeJourneyState(t, 'home-draft-remounted', 'home-draft-remounted');
    const old = new Set((await t.rpc('runs.list')).map(run => run.runId));
    await t.ax.click(shell('Send message', 'AXButton'));
    const requested = await t.until('Home submission starts the real retained draft', async () =>
      (await t.rpc('runs.list')).find(run => !old.has(run.runId) && run.goal === draft), 30000);
    t.assert.deepEqual(requested.pageIds, []);
    const details = await finished(t, requested.runId);
    await t.ax.waitFor(shell('Home page-free answer indigo-593.'));
    t.assert.deepEqual(details.run.pageIds, []);
    t.assert.deepEqual(await t.rpc('pages.list'), []);
    t.assert.ok(decisions.length > 0); t.assert.equal(t.model.errors.length, 0);
    await captureHomeJourneyState(t, 'home-submitted-page-free-answer', 'page-free-answer-after-home-submit');
    return { ax: await t.ax.dump(), rpc: { details, pages: await t.rpc('pages.list'), decisions } };
  });
}
