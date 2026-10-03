import { captureTemporaryAppearanceState, replaceAppearanceField } from '../lib/appearance-temporary-state.mjs';
import { captureHomeJourneyState as captureLegacyState } from '../lib/home-capture.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, loadedPage, press } from '../fixtures/legacy-ui.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

async function configureModel(t) {
  await t.rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: t.model.endpoint, plannerModel: t.model.model });
}
async function translate(t) {
  const inputs = [];
  t.model.respond(payload => {
    const prompt = payload.messages.findLast(message => message.role === 'user').content;
    const segments = JSON.parse(String(prompt).split('Segments (JSON array):\n')[1]);
    t.assert.ok(Array.isArray(segments));
    inputs.push(segments);
    return { content: JSON.stringify({ lang: 'Spanish', translations: segments.map(text => `EN: ${text}`) }) };
  });
  t.fixture.route('/translation', '<!doctype html><title>Aux translation fixture</title><main><h1>Hola mundo de Aux</h1><p>Esta página se puede traducir.</p><p hidden>HIDDEN TRANSLATION SECRET</p><label>Private input <input value="FORM VALUE SECRET"></label><code>CODE TRANSLATION SECRET</code></main>');
  await configureModel(t);
  const page = await loadedPage(t, '/translation');
  await t.step('translate visible native page text through the command surface', { kind: 'ui', features: ['aiTranslate'] }, async () => {
    await t.ax.key('command+k', 'hid');
    await t.ax.waitFor(shell('Command palette', 'AXComboBox'));
    await t.ax.type('/Translate this page', shell('Command palette', 'AXComboBox'));
    await t.ax.waitFor({ name: '^Translate this page', role: 'AXStaticText', match: 'regex', scope: 'shell', index: 0 });
    await t.ax.key('return', 'hid');
    const rpc = await t.until('translated native text', async () => {
      const observed = await t.rpc('pages.observe', { pageId: page.pageId });
      return /EN: Hola mundo de Aux/.test(JSON.stringify(observed)) && observed;
    }, 20000);
    await t.ax.waitFor({ name: 'EN: Hola mundo de Aux', match: 'exact', scope: 'page' });
    t.assert.equal(inputs.length, 1, 'Short page must use one model batch');
    const sent = inputs.flat();
    t.assert.ok(sent.includes('Hola mundo de Aux'));
    t.assert.ok(sent.includes('Esta página se puede traducir.'));
    t.assert.ok(!sent.some(text => /HIDDEN TRANSLATION SECRET|FORM VALUE SECRET|CODE TRANSLATION SECRET/.test(text)), 'Hidden, form and code text must not enter the model request');
    const ax = await t.ax.dump({ scope: 'any' });
    await captureLegacyState(t, 'translation-applied', 'translation-applied');
    return { ax, rpc };
  });
  await t.step('restore original text without another model request', { kind: 'ui', features: ['aiTranslate'] }, async () => {
    await press(t, shell('Show original', 'AXButton'));
    const rpc = await t.until('original native text restored', async () => {
      const observed = await t.rpc('pages.observe', { pageId: page.pageId });
      const text = JSON.stringify(observed);
      return /Hola mundo de Aux/.test(text) && !/EN: Hola mundo de Aux/.test(text) && observed;
    });
    t.assert.equal(inputs.length, 1);
    await t.ax.waitFor({ name: 'Hola mundo de Aux', match: 'exact', scope: 'page' });
    const ax = await t.ax.dump({ scope: 'any' });
    await captureLegacyState(t, 'translation-original', 'translation-original');
    return { ax, rpc };
  });
}
async function tabName(t) {
  t.model.respond(payload => {
    const input = JSON.parse(String(payload.messages.findLast(message => message.role === 'user').content));
    t.assert.deepEqual(input, { title: 'Aux native Red', siteOrigin: t.fixture.url }, 'Naming model receives only title and site origin');
    return { content: JSON.stringify({ name: 'Red research' }) };
  });
  await configureModel(t);
  const page = await loadedPage(t, '/red');
  const tab = label => ({ role: 'AXRadioButton', name: `^${label}(?: Close ${label})?$`, match: 'regex', scope: 'shell', index: 0 });
  await setTabLayout(t, 'vertical', tab('Aux native Red'));
  const preferences = join(t.app.userDataDir, 'Default/Preferences');
  const organization = () => existsSync(preferences) ? JSON.parse(readFileSync(preferences, 'utf8')).aux?.organization?.v2 : undefined;
  const baseline = await t.until('durable organization includes the native fixture tab', () => {
    const value = organization();
    return value?.revision >= 1 && value.shared?.order?.includes(page.pageId) && value;
  }, 30000);
  await t.step('review AI name before applying the tab label', { kind: 'ui', features: ['titleRules', 'aiTabNaming'] }, async () => {
    await t.ax.contextMenu(tab('Aux native Red'));
    await press(t, shell('Name tab…', 'AXMenuItem'));
    await press(t, shell('Suggest with AI', 'AXMenuItem'));
    await t.until('suggestion present in tab label field', async () => JSON.stringify(await t.ax.query(shell('Tab label', 'AXTextField'))).includes('Red research'));
    t.assert.equal(t.model.calls.length, 1);
    const reviewed = await t.ax.query(shell('Tab label', 'AXTextField'));
    t.assert.equal(reviewed.length, 1);
    t.assert.equal(reviewed[0].placeholder, 'Aux native Red', 'The live organization label must remain unchanged while the proposed field says Red research');
    t.assert.ok(reviewed[0].names.includes('Red research'));
    const current = organization();
    t.assert.ok(current?.revision >= baseline.revision, 'A missing or unflushed organization is not review evidence');
    t.assert.equal(current.shared.tabNames?.[page.pageId], undefined, 'Suggestion must not persist a label before Save');
    t.assert.equal((await t.rpc('pages.list')).find(item => item.pageId === page.pageId).title, 'Aux native Red');
    await captureLegacyState(t, 'tab-name-reviewed', 'tab-name-reviewed');
    await press(t, shell('Save tab label', 'AXMenuItem'));
    await t.ax.waitFor(tab('Red research'));
    await t.ax.waitFor(tab('Aux native Red'), 'absent');
    await t.until('reviewed tab label committed in a newer native organization revision', () => {
      const current = organization();
      return current?.revision > baseline.revision && current.shared.tabNames?.[page.pageId]?.title === 'Red research';
    }, 30000);
    const rpc = await t.rpc('pages.list');
    t.assert.equal(rpc.find(item => item.pageId === page.pageId).title, 'Aux native Red');
    const ax = await t.ax.dump({ scope: 'shell' });
    await captureLegacyState(t, 'tab-name-applied', 'tab-name-applied');
    if (t.appearanceEnabled) {
      const longName = 'Planning weekend museum visits and dinner with friends';
      const originalLabel = organization()?.shared.tabNames?.[page.pageId];
      t.assert.deepEqual(originalLabel, { title: 'Red research', url: page.url });
      const rename = async (owned, next) => {
        const currentName = organization()?.shared.tabNames?.[page.pageId]?.title;
        t.assert.ok(currentName === 'Red research' || currentName === longName, 'Only the original owned tab label may be edited');
        if ((await owned(() => t.ax.query(shell('Tab label', 'AXTextField')))).length === 0) {
          await owned(() => t.ax.contextMenu(tab(currentName)));
          await owned(() => press(t, shell('Name tab…', 'AXMenuItem')));
        }
        await replaceAppearanceField(t, owned, shell('Tab label', 'AXTextField'), next);
        await owned(() => press(t, shell('Save tab label', 'AXMenuItem')));
        await owned(() => t.until('actual owned tab label persisted', () => organization()?.shared.tabNames?.[page.pageId]?.title === next));
        t.assert.deepEqual(organization()?.shared.tabNames?.[page.pageId], { ...originalLabel, title: next });
        await owned(() => t.ax.waitFor(tab(next)));
        const pages = await owned(() => t.rpc('pages.list'));
        const nativePage = pages.find(item => item.pageId === page.pageId);
        t.assert.equal(nativePage?.title, 'Aux native Red');
        t.assert.equal(nativePage?.url, page.url);
        t.assert.equal(t.model.calls.length, 1, 'Manual appearance labels must not call the model');
      };
      await captureTemporaryAppearanceState(t, { name: 'tab-long-label', state: 'tab-long-manual-label',
        prepare: owned => rename(owned, longName), restore: owned => rename(owned, 'Red research') });
    }
    return { ax, rpc };
  });
  await t.restart();
  await t.step('restore the persisted tab label to its native page title', { kind: 'ui', features: ['titleRules', 'aiTabNaming'] }, async () => {
    await t.ax.waitFor(tab('Red research'));
    await t.ax.contextMenu(tab('Red research'));
    await press(t, shell('Name tab…', 'AXMenuItem'));
    await press(t, shell('Use page title again', 'AXMenuItem'));
    await t.ax.waitFor(tab('Aux native Red'));
    await t.ax.waitFor(tab('Red research'), 'absent');
    t.assert.equal(t.model.calls.length, 1, 'Restoration must not call the model');
    const rpc = await t.rpc('pages.list');
    t.assert.ok(rpc.some(item => item.url === `${t.fixture.url}/red` && item.title === 'Aux native Red'));
    const ax = await t.ax.dump({ scope: 'shell' });
    await captureLegacyState(t, 'tab-name-restored', 'tab-name-restored');
    return { ax, rpc };
  });
}
export const journeys = [
  { journey: { id: 'translation', title: 'Translate visible text and restore the original without leaking private text', features: ['aiTranslate'], devAcceptance: ['aiTranslate', 'commandBar'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 90000, owner: 'LJ' }, run: translate },
  { journey: { id: 'tab-name', title: 'Review, persist and reset an AI tab label without changing its page title', features: ['titleRules', 'aiTabNaming'], devAcceptance: ['titleRules', 'aiTabNaming', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 90000, owner: 'LJ' }, run: tabName },
];
