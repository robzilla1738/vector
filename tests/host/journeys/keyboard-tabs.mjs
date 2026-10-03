import { captureHomeJourneyState as captureMainState } from '../lib/home-capture.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

export const journey = {
  id: 'keyboard-tabs', title: 'Switch native pages through Chromium tab shortcuts', features: ['layouts'],
  devAcceptance: ['layouts', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: ({ appearance }) => ({ args: appearance ? [] : ['--aux-native-performance-observer'] }), timeoutMs: 90_000, owner: 'Integrator',
};

export async function run(t) {
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  const blue = await t.rpc('pages.open', { url: `${t.fixture.url}/blue`, activate: true });
  await t.until('Blue selected', async () => (await t.rpc('workspace.get')).activePageId === blue.pageId);
  for (const layout of ['horizontal', 'vertical']) {
    await setTabLayout(t, layout, { role: 'AXRadioButton', name: '^Aux native Blue(?: Close Aux native Blue)?$', match: 'regex', scope: 'shell', index: 0 });
    for (const [name, chord, page] of [['previous', 'control+shift+tab', red], ['next', 'control+tab', blue]]) {
    await t.step(`${layout} ${name} native tab`, { kind: 'ui', features: ['layouts'] }, async () => {
      await t.ax.key(chord, 'hid');
      const rpc = await t.until(`${name} page selected`, async () => {
        const workspace = await t.rpc('workspace.get');
        return workspace.activePageId === page.pageId && workspace;
      });
      const ax = await t.ax.dump({ scope: 'page' });
      t.assert.match(JSON.stringify(ax), new RegExp(page.pageId === red.pageId ? 'Aux native Red' : 'Aux native Blue'));
      const settings = await t.rpc('settings.get');
      t.assert.equal(settings.tabLayout, layout);
      await captureMainState(t, `keyboard-${layout}-${name}`, `keyboard-${layout}-${name}`);
      return { ax, rpc: { workspace: rpc, tabLayout: settings.tabLayout } };
    });
    }
    if (!t.appearanceEnabled) await t.step(`${layout} 20 AC exact native tab presentations`, { kind: 'ui', features: ['layouts'] }, async () => {
      const report = await t.measureGuestPresentations({ metric: 'tab-switch',
        setup: async () => {
          await t.ax.press({ role: 'AXRadioButton', name: '^Aux native Blue(?: Close Aux native Blue)?$', match: 'regex', scope: 'shell', index: 0 });
          await t.until('Blue native baseline selected', async () => (await t.rpc('workspace.get')).activePageId === blue.pageId);
          await t.ax.waitFor({ role: 'AXWebArea', name: 'Aux native Blue', match: 'exact', scope: 'page' }, 'visible');
        }, input: () => t.ax.key('control+shift+tab', 'hid') });
      t.assert.equal((await t.rpc('workspace.get')).activePageId, red.pageId);
      return { ax: await t.ax.dump(), rpc: { performance: report } };
    });
  }
  if (!t.appearanceEnabled) await t.step('20 AC shell footprint samples with ten idle fixture tabs', { kind: 'ui', features: ['layouts'] }, async () => {
    const expected = new Set([red.pageId, blue.pageId]);
    for (let index = 0; index < 8; index++) {
      const page = await t.rpc('pages.open', { url: `${t.fixture.url}/${index % 2 ? 'red' : 'blue'}`, activate: false });
      expected.add(page.pageId);
    }
    const idle = async () => {
      const pages = await t.rpc('pages.list');
      return pages.length === 10 && pages.every(page => expected.has(page.pageId) && !page.loading &&
        [ `${t.fixture.url}/red`, `${t.fixture.url}/blue` ].includes(page.url)) && pages;
    };
    await t.until('all ten actual fixture tabs finish loading', idle);
    await t.ax.press({ role: 'AXRadioButton', name: '^Aux native Blue(?: Close Aux native Blue)?$', match: 'regex', scope: 'shell', index: 0 });
    await t.ax.waitFor({ role: 'AXWebArea', name: 'Aux native Blue', match: 'exact', scope: 'page' }, 'visible');
    const report = await t.measureShellMemory({ setup: async () => {
      const pages = await idle(); t.assert.ok(pages, 'Memory workload must retain ten loaded fixture tabs');
      return { kind: 'ten-idle-fixture-tabs', pages };
    } });
    t.assert.equal(report.samplesBytes.length, 20);
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list'), performance: report } };
  });
}
