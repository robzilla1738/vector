import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

export const SETUP_APPEARANCE_ID = 'setup-appearance';

export function requireSetupAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, SETUP_APPEARANCE_ID, 'Setup retention requires the exact setup appearance journey');
  assert.equal(appearance, true, 'Setup retention requires --appearance');
  assert.ok(pair, 'Setup retention requires the original externally admitted appearance pair');
}

export function setupDisposition(journeyId, appearance, pair) {
  if (journeyId !== SETUP_APPEARANCE_ID) return 'dismiss';
  requireSetupAppearance({ journeyId, appearance, pair });
  return 'retain';
}

const shell = name => ({ name, match: 'exact', scope: 'shell', index: 0 });

export async function captureSetupDisclosures(t) {
  assert.equal(t.appearanceEnabled, true, 'Setup disclosures require genuine appearance sampling');
  const originalSettings = await t.rpc('settings.get');
  assert.equal(originalSettings.modelConfigured, false, 'Fresh setup must genuinely have no configured model');
  assert.deepEqual(await t.rpc('pages.list'), [], 'Setup disclosure capture must begin without a browser page');
  assert.deepEqual(await t.rpc('runs.list'), [], 'Setup disclosure capture must begin without a chat run');
  async function unchanged() {
    const settings = await t.rpc('settings.get');
    assert.deepEqual(settings, originalSettings, 'Disclosure navigation must not change model, theme or permissions');
    assert.deepEqual(await t.rpc('pages.list'), [], 'Disclosure navigation must not open or attach a page');
    assert.deepEqual(await t.rpc('runs.list'), [], 'Disclosure navigation must not create a run');
    return { settings, pages: [], runs: [] };
  }
  await t.step('observe actual fresh welcome without dismissing setup', { kind: 'rpc', features: ['electronMigration'] }, async () => {
    await t.ax.waitFor(shell('Welcome to Aux'), 'visible');
    await captureHomeState(t, 'setup-welcome', 'setup-welcome-unreviewed');
    return { ax: await t.ax.dump(), rpc: await unchanged() };
  });
  await t.step('expand optional setup tips and return to the quiet welcome', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('Setup tips'));
    await t.ax.waitFor({ name: 'Your progress stays with this Profile.', match: 'contains', scope: 'shell', index: 0 }, 'visible');
    await captureHomeState(t, 'setup-welcome-tips-expanded', 'setup-welcome-tips-expanded');
    await t.ax.click(shell('Setup tips'));
    await captureHomeState(t, 'setup-welcome-tips-collapsed', 'setup-welcome-tips-collapsed');
    return { ax: await t.ax.dump(), rpc: await unchanged() };
  });
  await t.step('review actual model data disclosure without granting consent or configuring a provider', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('3. model'));
    await t.ax.waitFor(shell('Choose your AI model'), 'visible');
    await t.ax.waitFor(shell('I’ve reviewed model data use'), 'enabled');
    await t.ax.waitFor({ name: 'Model requests send your prompt', match: 'contains', scope: 'shell', index: 0 }, 'visible');
    await captureHomeState(t, 'setup-model-data-unreviewed', 'setup-model-data-unreviewed');
    return { ax: await t.ax.dump(), rpc: await unchanged() };
  });
  await t.step('inspect permissions disclosure without enabling Memory or granting access', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('6. permissions'));
    await t.ax.waitFor(shell('You stay in charge'), 'visible');
    await t.ax.waitFor({ name: 'Setup does not enable Memory', match: 'contains', scope: 'shell', index: 0 }, 'visible');
    const policies = [
      'Review the source, recipient and action when Aux asks for approval.',
      'Connected services need their own reviewed grants.',
      'Browser tasks use a separate, temporary browsing session.',
      'You can stop a task, take control of a page, or change permissions in Settings.',
      'Memory is optional. Review remembered information and pasted assistant notes',
    ];
    const policy = name => ({ name, match: 'contains', scope: 'shell', index: 0 });
    await t.ax.waitFor(shell('How permissions and browsing work'), 'enabled');
    for (const name of policies) await t.ax.waitFor(policy(name), 'absent');
    await unchanged();
    await captureHomeState(t, 'setup-permissions-ungranted', 'setup-permissions-ungranted');
    await t.ax.click(shell('How permissions and browsing work'));
    for (const name of policies) await t.ax.waitFor(policy(name), 'visible');
    await unchanged();
    await captureHomeState(t, 'setup-permissions-details-expanded', 'setup-permissions-details-expanded-ungranted');
    await t.ax.click(shell('How permissions and browsing work'));
    for (const name of policies) await t.ax.waitFor(policy(name), 'absent');
    await unchanged();
    await captureHomeState(t, 'setup-permissions-details-collapsed', 'setup-permissions-details-collapsed-ungranted');
    await t.ax.click(shell('1. welcome'));
    await t.ax.waitFor(shell('Welcome to Aux'), 'visible');
    return { ax: await t.ax.dump(), rpc: await unchanged() };
  });
}
