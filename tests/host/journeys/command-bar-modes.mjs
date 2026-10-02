const dialog = { role: 'AXGroup', name: 'Command surface', scope: 'shell' };
const field = { role: 'AXComboBox', name: 'Address, search, and agent prompt', scope: 'shell', within: dialog, index: 0 };
export const journey = {
  id: 'command-bar-modes', title: 'One command surface for new pages, addresses and commands',
  features: ['commandBar'], devAcceptance: ['commandBar', 'commandRegistry', 'splitView', 'spaces'],
  needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 120_000, owner: 'L3',
};
export async function run(t) {
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  await t.until('Red loaded', async () => (await t.rpc('pages.list')).some(page => page.pageId === red.pageId && !page.loading));
  await t.step('CmdT opens an empty field and Escape creates no page', { kind: 'ui', features: ['commandBar'] }, async () => {
    const before = await t.rpc('pages.list');
    await t.ax.key('command+t', 'hid'); await t.ax.waitFor(dialog);
    const [input] = await t.ax.query(field);
    t.assert.equal(input.value ?? '', '');
    t.assert.equal((await t.rpc('pages.list')).length, before.length);
    await t.capture('command-new-tab-empty');
    await t.ax.key('escape', 'hid');
    await t.until('surface closed', async () => !(await t.ax.query(dialog)).length);
    const rpc = await t.rpc('pages.list'); t.assert.equal(rpc.length, before.length);
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc };
  });
  await t.step('Enter commits exactly one new native page', { kind: 'ui', features: ['commandBar'] }, async () => {
    const before = await t.rpc('pages.list');
    await t.ax.key('command+t', 'hid'); await t.ax.waitFor(dialog);
    await t.ax.type(`${t.fixture.url}/blue`, field); await t.ax.key('return', 'hid');
    const rpc = await t.until('Blue opened', async () => {
      const pages = await t.rpc('pages.list');
      return pages.length === before.length + 1 && pages.some(page => page.url === `${t.fixture.url}/blue` && !page.loading) ? pages : null;
    });
    await t.capture('command-new-tab-committed'); return { ax: await t.ax.dump({ scope: 'shell' }), rpc };
  });
  await t.step('CmdEnter acknowledges one background page and keeps the active page', { kind: 'ui', features: ['commandBar'] }, async () => {
    const before = await t.rpc('pages.list'); const active = (await t.rpc('workspace.get')).activePageId;
    await t.ax.key('command+t', 'hid'); await t.ax.waitFor(dialog);
    await t.ax.type(`${t.fixture.url}/green`, field); await t.ax.key('command+return', 'hid');
    const rpc = await t.until('background page acknowledged', async () => {
      const pages = await t.rpc('pages.list'); const workspace = await t.rpc('workspace.get');
      return pages.length === before.length + 1 && pages.some(page => page.url === `${t.fixture.url}/green` && !page.loading) && workspace.activePageId === active ? { pages, workspace } : null;
    });
    await t.capture('command-background-page'); return { ax: await t.ax.dump({ scope: 'shell' }), rpc };
  });
  await t.step('CmdL selects the native page URL in the same field', { kind: 'ui', features: ['commandBar'] }, async () => {
    await t.ax.key('command+l', 'hid'); await t.ax.waitFor(dialog);
    const [input] = await t.ax.query(field); t.assert.equal(input.value, `${t.fixture.url}/blue`);
    const rpc = await t.rpc('workspace.get');
    await t.capture('command-edit-url'); await t.ax.key('escape', 'hid');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc };
  });
  await t.step('CmdK lists registered split commands and the split provider', { kind: 'ui', features: ['commandBar'] }, async () => {
    await t.ax.key('command+k', 'hid'); await t.ax.waitFor(dialog); await t.ax.type('split', field);
    const ax = await t.until('split rows present', async () => {
      const tree = await t.ax.dump({ scope: 'shell' }); return /Split view with page|Split with/.test(JSON.stringify(tree)) ? tree : null;
    });
    await t.capture('command-registered-split'); await t.ax.key('escape', 'hid');
    return { ax, rpc: await t.rpc('pages.list') };
  });
  await t.step('an open-tab result switches without creating another page', { kind: 'ui', features: ['commandBar'] }, async () => {
    const before = await t.rpc('pages.list');
    await t.ax.key('command+t', 'hid'); await t.ax.waitFor(dialog); await t.ax.type('@', field); await t.ax.type('Aux native Red', field);
    const target = { role: 'AXStaticText', name: 'Aux native Red 127.0.0.1 Switch to tab', match: 'exact', scope: 'shell', within: dialog, index: 0 };
    await t.ax.waitFor(target); await t.ax.click(target);
    const rpc = await t.until('Red selected without a new page', async () => {
      const workspace = await t.rpc('workspace.get'); const pages = await t.rpc('pages.list');
      return workspace.activePageId === red.pageId && pages.length === before.length ? { workspace, pages } : null;
    });
    await t.capture('command-switch-existing'); return { ax: await t.ax.dump({ scope: 'shell' }), rpc };
  });
  await t.step('three real Ask refusals route the next question to Profile search', { kind: 'ui', features: ['commandBar'] }, async () => {
    // The disposable profile uses only public settings and the loopback fixture.
    // Native Profile search preferences are saved separately by their real API.
    await t.rpc('settings.set', { modelConnection: { provider: 'gateway', enabled: false }, commandRouting: 'automatic' });
    await t.rpc('settings.set', { searchEngine: `${t.fixture.url}/search?q=%s` });
    const question = 'What is the local fixture showing?';
    const before = await t.rpc('pages.list');
    for (let attempt = 0; attempt < 3; attempt++) {
      await t.ax.key('command+t', 'hid'); await t.ax.waitFor(dialog);
      await t.ax.type(question, field); await t.ax.key('return', 'hid');
      await t.until('Ask refusal keeps the prompt', async () => {
        const inputs = await t.ax.query(field); const tree = await t.ax.dump({ scope: 'shell' });
        return inputs[0]?.value === question && /Ask is unavailable/.test(JSON.stringify(tree)) ? tree : null;
      });
      t.assert.equal((await t.rpc('pages.list')).length, before.length);
      await t.ax.key('escape', 'hid');
    }
    await t.ax.key('command+t', 'hid'); await t.ax.waitFor(dialog); await t.ax.type(question, field);
    const ax = await t.until('Search fallback is announced', async () => {
      const tree = await t.ax.dump({ scope: 'shell' }); return /Ask unavailable.*searching/.test(JSON.stringify(tree)) ? tree : null;
    });
    await t.capture('command-ask-search-fallback'); await t.ax.key('return', 'hid');
    const rpc = await t.until('loopback Profile search opens', async () => {
      const pages = await t.rpc('pages.list'); return pages.length === before.length + 1 && pages.some(page => page.url.startsWith(`${t.fixture.url}/search?`) && !page.loading) ? pages : null;
    });
    return { ax, rpc };
  });

}
