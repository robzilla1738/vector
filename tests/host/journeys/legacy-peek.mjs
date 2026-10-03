import { captureHomeJourneyState as captureLegacyState } from '../lib/home-capture.mjs';
import { shell, loadedPage, press } from '../fixtures/legacy-ui.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

async function preview(t, url, exclude) {
  await t.ax.waitFor(shell('Open as tab', 'AXButton'));
  return t.until('native temporary Peek page', async () => (await t.rpc('pages.list')).find(page => page.pageId.startsWith('p_peek_') && page.url === url && page.pageId !== exclude && !page.loading));
}
async function library(t) {
  await press(t, shell('More', 'AXPopUpButton'));
  await press(t, shell('Library', 'AXMenuItem'));
  await t.ax.waitFor(shell('Preview Aux Peek Red', 'AXButton'));
}
async function linkPeek(t) {
  const source = await loadedPage(t, '/blue');
  await setTabLayout(t, 'vertical', { role: 'AXRadioButton', name: '^Aux native Blue(?: Close Aux native Blue)?$', match: 'regex', scope: 'shell', index: 0 });
  await t.rpc('bookmarks.add', { url: `${t.fixture.url}/red`, title: 'Aux Peek Red' });
  let promoted;
  await t.step('preview a saved link and promote the same native page', { kind: 'ui', features: ['peek'] }, async () => {
    await library(t);
    await press(t, shell('Preview Aux Peek Red', 'AXButton'));
    promoted = await preview(t, `${t.fixture.url}/red`);
    t.assert.ok((await t.rpc('pages.list')).some(page => page.pageId === source.pageId));
    await t.ax.waitFor({ name: 'Red loopback fixture.', match: 'exact', scope: 'page' });
    await captureLegacyState(t, 'peek-bookmark', 'peek-bookmark');
    await press(t, shell('Open as tab', 'AXButton'));
    await t.ax.waitFor(shell('Open as tab', 'AXButton'), 'absent');
    const rpc = await t.until('same Peek page promoted', async () => {
      const state = await t.rpc('workspace.get');
      return state.activePageId === promoted.pageId && state;
    });
    const ax = await t.ax.dump({ scope: 'any' });
    await captureLegacyState(t, 'peek-promoted', 'peek-promoted');
    return { ax, rpc };
  });
  await t.step('dismiss another Peek without changing the active tab', { kind: 'ui', features: ['peek'] }, async () => {
    await library(t);
    await press(t, shell('Preview Aux Peek Red', 'AXButton'));
    const temporary = await preview(t, `${t.fixture.url}/red`, promoted.pageId);
    await press(t, shell('Close preview', 'AXButton'));
    await t.ax.waitFor(shell('Close preview', 'AXButton'), 'absent');
    const rpc = await t.until('only temporary Peek closed', async () => {
      const state = await t.rpc('workspace.get');
      return state.activePageId === promoted.pageId && !state.pages.some(page => page.pageId === temporary.pageId) && state;
    });
    const ax = await t.ax.dump({ scope: 'any' });
    await captureLegacyState(t, 'peek-dismissed', 'peek-dismissed');
    return { ax, rpc };
  });
}
async function readerPeek(t) {
  const paragraph = 'This article contains enough natural prose for native Reader extraction. It explains attention, browsing, research, navigation and keeping the original document available. ';
  t.fixture.route('/reader-peek', `<!doctype html><title>Aux Reader Peek fixture</title><main><article><h1>Aux Reader Peek fixture</h1><p><a href="/red">Safe relative article link</a></p>${Array.from({ length: 12 }, () => `<p>${paragraph.repeat(4)}</p>`).join('')}</article></main>`);
  const source = await loadedPage(t, '/reader-peek');
  const link = shell('Safe relative article link', 'AXLink');
  let keyboard;
  await t.step('Reader keyboard link opens and dismisses a temporary native Peek', { kind: 'ui', features: ['peek'] }, async () => {
    await t.ax.key('command+alt+r', 'hid');
    await t.ax.waitFor(shell('Back to page', 'AXButton'));
    await t.ax.waitFor(link);
    await t.ax.focus(link);
    await t.ax.key('alt+return', 'hid');
    keyboard = await preview(t, `${t.fixture.url}/red`);
    t.assert.ok((await t.rpc('pages.list')).some(page => page.pageId === source.pageId));
    await captureLegacyState(t, 'reader-peek-keyboard', 'reader-peek-keyboard');
    await press(t, shell('Close preview', 'AXButton'));
    await t.ax.waitFor(shell('Close preview', 'AXButton'), 'absent');
    const rpc = await t.until('Reader temporary page closed', async () => {
      const pages = await t.rpc('pages.list');
      return !pages.some(page => page.pageId === keyboard.pageId) && pages;
    });
    const ax = await t.ax.dump({ scope: 'shell' });
    t.assert.match(JSON.stringify(ax), /Back to page/);
    return { ax, rpc };
  });
  await t.step('Reader Option-click Peek preserves the source then promotes the same page', { kind: 'ui', features: ['peek'] }, async () => {
    await t.ax.click(link, { modifiers: ['alt'] });
    const pointer = await preview(t, `${t.fixture.url}/red`, keyboard.pageId);
    t.assert.equal((await t.rpc('workspace.get')).activePageId, source.pageId);
    await captureLegacyState(t, 'reader-peek-pointer', 'reader-peek-pointer');
    await press(t, shell('Open as tab', 'AXButton'));
    await t.ax.waitFor(shell('Open as tab', 'AXButton'), 'absent');
    const rpc = await t.until('pointer Peek promoted', async () => {
      const state = await t.rpc('workspace.get');
      return state.activePageId === pointer.pageId && state.pages.some(page => page.pageId === pointer.pageId && page.url === `${t.fixture.url}/red`) && state;
    });
    const ax = await t.ax.dump({ scope: 'any' });
    await captureLegacyState(t, 'reader-peek-promoted', 'reader-peek-promoted');
    return { ax, rpc };
  });
}
export const journeys = [
  { journey: { id: 'link-peek', title: 'Preview a saved link, promote its native page and dismiss another preview', features: ['peek'], devAcceptance: ['peek', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 90000, owner: 'LJ' }, run: linkPeek },
  { journey: { id: 'reader-peek', title: 'Open Reader links as native Peek with keyboard and pointer', features: ['peek'], devAcceptance: ['peek', 'reader', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 90000, owner: 'LJ' }, run: readerPeek },
];
