import { captureComposerImageRejection } from "../lib/composer-image-appearance.mjs";
import { captureTemporaryAppearanceState } from '../lib/appearance-temporary-state.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { captureAppearanceTextState } from '../lib/appearance-text-state.mjs';
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
    if (t.appearanceEnabled) {
      await captureAppearanceTextState(t, { selector: composer,
        text: 'Help me plan a thoughtful weekend: compare a quiet morning walk, a small museum visit, and a relaxed dinner, with enough detail to share the plan with friends.',
        name: 'home-long-draft-focused', state: 'home-long-draft-focused' });
      t.assert.equal((await t.ax.query(composer))[0]?.value, draft);
      t.assert.deepEqual(await t.rpc('runs.list'), [], 'Appearance draft must not start a run');
    }
    return { ax: await t.ax.dump(), rpc: { settings: await t.rpc('settings.get'), pages: await t.rpc('pages.list') } };
  });
  if (t.appearanceEnabled) await t.step("Home native image rejection and cancellation preserve the page-free draft", { kind: "ui", features: ["electronMigration"] }, () => captureComposerImageRejection(t));
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
    if (t.appearanceEnabled) {
      const title = 'Weekend museum visits and a relaxed dinner with friends';
      const url = `${t.fixture.url}/home-long-context-title`;
      t.fixture.route('/home-long-context-title', `<!doctype html><title>${title}</title><main>Owned optional context fixture.</main>`);
      const activeSpace = () => JSON.parse(readFileSync(join(t.app.userDataDir, 'Default/Preferences'), 'utf8')).aux?.organization?.v2?.window?.activeSpaceId;
      const originalSpace = activeSpace(), originalWorkspace = await t.rpc('workspace.get'), originalRuns = await t.rpc('runs.list');
      t.assert.equal(typeof originalSpace, 'string', 'Actual original active Space required');
      t.assert.deepEqual(originalWorkspace.pages, []);
      let pageId;
      await captureTemporaryAppearanceState(t, { name: 'home-long-context-picker', state: 'home-long-context-picker-owned-fixture',
        prepare: async owned => {
          await owned(async () => {
            const page = await t.rpc('pages.open', { url, background: true, activate: false });
            pageId = page.pageId; // Retain exact cleanup identity before any subsequent await or owner recheck.
            t.assert.ok(typeof pageId === 'string' && pageId.length > 0);
          });
          await owned(() => t.until('owned loopback context title is genuinely loaded', async () =>
            (await t.rpc('pages.list')).some(page => page.pageId === pageId && page.url === url && page.title === title && !page.loading)));
          await owned(() => t.ax.waitFor({ name: title, role: 'AXButton', match: 'contains', scope: 'shell', index: 0 }));
          t.assert.equal(activeSpace(), originalSpace);
          t.assert.equal((await owned(() => t.rpc('workspace.get'))).activePageId, originalWorkspace.activePageId);
          t.assert.deepEqual(await owned(() => t.rpc('runs.list')), originalRuns);
        },
        restore: async owned => {
          if (pageId) {
            const page = (await owned(() => t.rpc('pages.list'))).find(item => item.pageId === pageId);
            t.assert.ok(page && page.url === url, 'Exact temporary page identity must remain owned before cleanup');
            await owned(() => t.rpc('pages.close', { pageId }));
          }
          await owned(() => t.until('temporary context page removed', async () => (await t.rpc('pages.list')).length === 0));
          t.assert.equal(activeSpace(), originalSpace);
          t.assert.equal((await owned(() => t.rpc('workspace.get'))).activePageId, originalWorkspace.activePageId);
          t.assert.deepEqual(await owned(() => t.rpc('runs.list')), originalRuns);
          t.assert.equal((await owned(() => t.ax.query(composer)))[0]?.value, draft);
          await owned(() => t.ax.waitFor(search));
        } });
    }
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(search, 'absent');
    t.assert.equal((await t.ax.query(shell('Browser context', 'AXButton')))[0]?.focused, true, 'Escape from child must return to the parent trigger');
    if (t.appearanceEnabled) await captureHomeJourneyState(t, 'home-context-parent-focus-returned', 'home-context-parent-focus-returned');
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell('Browser context', 'AXButton'), 'absent');
    t.assert.equal((await t.ax.query(shell('Add context', 'AXButton')))[0]?.focused, true, 'Escape from parent must restore the composer context trigger');
    if (t.appearanceEnabled) await captureHomeJourneyState(t, 'home-context-trigger-focus-returned', 'home-context-trigger-focus-returned');
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
