import { setTabLayout } from '../lib/tab-layout.mjs';

export const journey = {
  id: 'keyboard-tabs', title: 'Switch native pages through Chromium tab shortcuts', features: ['layouts'],
  devAcceptance: ['layouts', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 90_000, owner: 'Integrator',
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
      await t.capture(`keyboard-${layout}-${name}`);
      return { ax, rpc: { workspace: rpc, tabLayout: settings.tabLayout } };
    });
    }
  }
}
