import { captureHomeJourneyState as captureMainState } from '../lib/home-capture.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

export const journey = {
  id: 'split-view', title: 'Create and close a split through the native tab menu', features: ['splitView'],
  devAcceptance: ['splitView', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 90_000, owner: 'Integrator',
};

export async function run(t) {
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  const blue = await t.rpc('pages.open', { url: `${t.fixture.url}/blue`, activate: false });
  await t.until('fixture pages loaded', async () => {
    const pages = await t.rpc('pages.list');
    return [red.pageId, blue.pageId].every(id => pages.some(page => page.pageId === id && !page.loading));
  });
  await t.step('open Blue beside Red from its tab menu', { kind: 'ui', features: ['splitView'] }, async () => {
    const tab = { role: 'AXRadioButton', name: '^Aux native Blue(?: Close Aux native Blue)?$', match: 'regex', scope: 'shell', index: 0 };
    await setTabLayout(t, 'vertical', tab);
    await t.ax.press({ role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 });
    await t.until('Red is the active native tab', async () => (await t.rpc('workspace.get')).activePageId === red.pageId);
    await t.ax.waitFor(tab);
    await t.ax.contextMenu(tab);
    const split = { name: 'Open beside current tab', scope: 'shell', index: 0 };
    await t.ax.waitFor(split);
    await t.ax.press(split);
    await t.ax.waitFor({ role: 'AXSplitter', name: 'Resize split divider 1', scope: 'shell' });
    const showSidebar = { role: 'AXButton', name: 'Show sidebar', match: 'exact', scope: 'shell', index: 0 };
    if ((await t.ax.query(showSidebar)).length) await t.ax.press(showSidebar);
    await t.ax.waitFor({ name: 'Swap split sides', scope: 'shell' });
    await t.ax.hover({ role: 'AXSplitter', name: 'Resize split divider 1', scope: 'shell', index: 0 });
    await t.ax.waitFor({ role: 'AXGroup', name: 'New Tab newtab', match: 'exact', scope: 'shell' }, 'absent');
    const ax = await t.ax.dump();
    t.assert.match(JSON.stringify(ax), /Aux native Red/);
    t.assert.match(JSON.stringify(ax), /Aux native Blue/);
    const panes = ax.filter(item => item.role === 'AXWebArea' && ['Aux native Red', 'Aux native Blue'].includes(item.name));
    t.assert.equal(panes.length, 2, 'Both fixture WebContents must be visible in the split');
    t.assert.ok(panes.every(pane => pane.frame?.width >= 200 && pane.frame?.height >= 200));
    const pages = await t.rpc('pages.list');
    t.assert.ok(pages.some(page => page.pageId === red.pageId) && pages.some(page => page.pageId === blue.pageId));
    await captureMainState(t, 'split-open', 'split-open');
    return { ax, rpc: { pages, workspace: await t.rpc('workspace.get') } };
  });
  await t.step('close the split while retaining both pages', { kind: 'ui', features: ['splitView'] }, async () => {
    await t.ax.press({ name: 'Separate split tabs', scope: 'shell', index: 0 });
    await t.ax.waitFor({ name: 'Swap split sides', scope: 'shell' }, 'absent');
    const pages = await t.rpc('pages.list');
    t.assert.ok(pages.some(page => page.pageId === red.pageId) && pages.some(page => page.pageId === blue.pageId));
    return { ax: await t.ax.dump(), rpc: { pages } };
  });
}
