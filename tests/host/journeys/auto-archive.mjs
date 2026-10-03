import { captureHomeJourneyState } from '../lib/home-capture.mjs';
const s = (name, role = 'AXButton', scope = 'shell') => ({ name, role, scope, match: 'exact', index: 0 });
export const journey = {
  id: 'auto-archive', title: 'Protect active, audible and unsaved tabs; Undo and restart durable archive', features: ['autoArchive', 'archive'],
  devAcceptance: ['autoArchive', 'archive', 'spaces', 'tabSections'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: { args: ['--aux-test-clock-scale=3600'] }, timeoutMs: 180_000, owner: 'L8',
};
export async function run(t) {
  t.assert.equal(t.clock.delayMs(12 * 3_600_000), 12_000, 'The canonical native clock must scale twelve hours to twelve seconds');
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  const blue = await t.rpc('pages.open', { url: `${t.fixture.url}/audible`, activate: true });
  await t.until('audible fixture loaded', async () => (await t.rpc('workspace.get')).activePageId === blue.pageId);
  await t.ax.waitFor(s('Play tone', 'AXButton', 'page')); await t.ax.press(s('Play tone', 'AXButton', 'page'));
  const green = await t.rpc('pages.open', { url: `${t.fixture.url}/dirty`, activate: true });
  await t.ax.waitFor(s('Draft', 'AXTextArea', 'page')); await t.ax.type('Keep this unsaved draft', s('Draft', 'AXTextArea', 'page'));
  const active = await t.rpc('pages.open', { url: `${t.fixture.url}/blue`, activate: true });
  const reveal = s('Show sidebar'); if ((await t.ax.query(reveal)).length) await t.ax.press(reveal);
  await t.step('education acknowledgment enables the twelve-hour policy', { kind: 'ui', features: ['autoArchive'] }, async () => {
    await t.ax.waitFor(s('Got it')); await t.ax.press(s('Got it')); await t.ax.waitFor(s('Got it'), 'absent');
    const settings = await t.rpc('settings.get'); t.assert.equal(settings.autoArchive.acknowledged, true);
    await captureHomeJourneyState(t, 'archive-policy-acknowledged', 'archive-policy-acknowledged'); return { ax: await t.ax.dump(), rpc: { settings } };
  });
  await t.step('only the idle clean tab archives and Undo restores its exact page ID', { kind: 'ui', features: ['autoArchive', 'archive'] }, async () => {
    await t.until('idle Red archived', async () => !(await t.rpc('pages.list')).some(page => page.pageId === red.pageId), 25_000);
    const retained = await t.rpc('pages.list');
    for (const page of [blue, green, active]) t.assert.ok(retained.some(item => item.pageId === page.pageId), `Protected ${page.pageId} stays open`);
    await t.ax.waitFor(s('Undo')); await captureHomeJourneyState(t, 'idle-only-archived', 'archive-idle-only-undo-toast'); await t.ax.press(s('Undo'));
    const restored = await t.until('same Red page ID restored', async () => {
      const pages = await t.rpc('pages.list'); return pages.some(page => page.pageId === red.pageId && page.url === `${t.fixture.url}/red`) && pages;
    });
    await captureHomeJourneyState(t, 'archive-undo-same-id', 'archive-undo-restored-bound-tab'); return { ax: await t.ax.dump(), rpc: { retained, restored } };
  });
  await t.step('archive persists after native restart and restores from Library', { kind: 'ui', features: ['autoArchive', 'archive'] }, async () => {
    await t.until('Red archived again after another scaled idle period', async () => !(await t.rpc('pages.list')).some(page => page.pageId === red.pageId), 25_000);
    await t.ax.waitFor(s('View archive')); await t.ax.press(s('View archive')); await t.ax.waitFor(s('Search archived tabs', 'AXTextField'));
    await t.ax.type('Aux native Red', s('Search archived tabs', 'AXTextField')); await t.ax.waitFor(s('Restore'));
    await captureHomeJourneyState(t, 'archive-before-restart', 'library-archive-filtered-result'); await t.restart();
    // The registered palette action opens the same archive surface after a fresh native boot.
    await t.ax.key('command+k', 'hid'); await t.ax.type('Show archived tabs'); await t.ax.key('return', 'hid');
    await t.ax.waitFor(s('Search archived tabs', 'AXTextField')); await t.ax.type('Aux native Red', s('Search archived tabs', 'AXTextField'));
    await t.ax.waitFor(s('Restore')); await captureHomeJourneyState(t, 'archive-durable-restart', 'library-archive-durable-restored-result'); await t.ax.press(s('Restore'));
    const pages = await t.until('Library restore reused original identity', async () => { const pages = await t.rpc('pages.list'); return pages.some(page => page.pageId === red.pageId) && pages; });
    return { ax: await t.ax.dump(), rpc: { pages } };
  });
}
