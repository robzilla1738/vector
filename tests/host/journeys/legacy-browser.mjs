import { captureQuickAskState } from '../lib/utility-window-capture.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, settings, loadedPage, press } from '../fixtures/legacy-ui.mjs';

async function sitePermissions(t) {
  let loads = 0;
  let cookieReturned = false;
  t.fixture.route('/site-controls', (request, response) => {
    loads++;
    if (loads > 1) cookieReturned = String(request.headers.cookie ?? '').includes('aux_site_fixture=1');
    if (loads === 1) response.setHeader('set-cookie', 'aux_site_fixture=1; Path=/; SameSite=Lax');
    return `<!doctype html><title>Aux site controls fixture</title><main><h1>Site controls fixture</h1><p id="storage"></p></main><script>${loads === 1 ? 'localStorage.setItem("aux_site_fixture","present");' : ''}document.querySelector('#storage').textContent=localStorage.getItem('aux_site_fixture')==='present'?'Stored fixture present':'Stored fixture cleared';</script>`;
  });
  const page = await loadedPage(t, '/site-controls');
  await t.until('fixture storage initialized', async () => /Stored fixture present/.test(JSON.stringify(await t.rpc('pages.observe', { pageId: page.pageId }))));
  await t.rpc('pages.reload', { pageId: page.pageId });
  await t.until('fixture cookie returned before clearing', () => loads >= 2 && cookieReturned);
  cookieReturned = false;
  await t.step('clear website data without clearing the saved permission', { kind: 'ui', features: ['sitePermissions'] }, async () => {
    await t.ax.key('command+l', 'hid');
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell('Site controls', 'AXButton'));
    await press(t, shell('Site controls', 'AXButton'));
    await t.ax.waitFor(shell('1 cookie'));
    await t.ax.waitFor(shell('Reset Notifications', 'AXButton'));
    await t.ax.waitFor(shell('Blocked'));
    await press(t, shell('Clear…', 'AXButton'));
    await t.ax.waitFor({ ...shell('Cookies and stored website data cleared'), match: 'contains' });
    await t.ax.waitFor(shell('0 cookies'));
    await t.ax.waitFor(shell('Reset Notifications', 'AXButton'));
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.capture('site-permissions-cleared');
    await press(t, shell('Close site controls', 'AXButton'));
    await t.rpc('pages.reload', { pageId: page.pageId });
    const rpc = await t.until('localStorage removed after reload', async () => {
      const state = await t.rpc('pages.observe', { pageId: page.pageId });
      return loads >= 2 && /Stored fixture cleared/.test(JSON.stringify(state)) && state;
    });
    t.assert.equal(cookieReturned, false, 'Cleared fixture cookie must not return on reload');
    t.assert.doesNotMatch(JSON.stringify(rpc), /Stored fixture present/);
    return { ax, rpc };
  });
  await t.step('reset only the saved notification decision', { kind: 'ui', features: ['sitePermissions'] }, async () => {
    await t.ax.key('command+l', 'hid');
    await t.ax.key('escape', 'hid');
    await press(t, shell('Site controls', 'AXButton'));
    await t.ax.waitFor(shell('Reset Notifications', 'AXButton'));
    await press(t, shell('Reset Notifications', 'AXButton'));
    await t.ax.waitFor(shell('Notifications will ask again.'));
    await t.ax.waitFor(shell('Reset Notifications', 'AXButton'), 'absent');
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('pages.observe', { pageId: page.pageId });
    t.assert.match(JSON.stringify(rpc), /Stored fixture cleared/);
    await t.capture('site-permissions-reset');
    await press(t, shell('Close site controls', 'AXButton'));
    return { ax, rpc };
  });
}
async function quickAsk(t) {
  const before = (await t.ax.windows()).filter(window => window.layer === 0);
  await t.step('open Quick Ask with the native composer focused', { kind: 'ui', features: ['quickAsk'] }, async () => {
    await settings(t, 'Quick Ask');
    await t.ax.waitFor(shell('Open Quick Ask', 'AXButton'));
    await press(t, shell('Open Quick Ask', 'AXButton'));
    const composer = shell('Reply to conversation', 'AXTextArea');
    await t.ax.waitFor(composer, 'focused');
    await t.ax.waitFor(shell('Ask Aux'));
    const windows = await t.until('compact native Quick Ask window', async () => {
      const current = (await t.ax.windows()).filter(window => window.layer === 0);
      return current.length > before.length && current;
    });
    const compact = windows.filter(window => !before.some(old => old.id === window.id) && window.width < 1000);
    t.assert.equal(compact.length, 1, 'Quick Ask must create exactly one compact native window');
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('workspace.get');
    t.assert.ok(rpc.sessions.some(session => session.sessionId === 'aux' && session.status === 'connected'));
    await captureQuickAskState(t, 'quick-ask-focused', 'quick-ask-composer-focused', compact[0].id);
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell('Ask Aux'), 'absent');
    await t.until('Quick Ask native window dismissed', async () => (await t.ax.windows()).filter(window => window.layer === 0).length === before.length);
    return { ax, rpc: { workspace: rpc, windows } };
  });
}
export const journeys = [
  { journey: { id: 'site-permissions', title: 'Clear disposable website data and reset its notification decision', features: ['sitePermissions'], devAcceptance: ['sitePermissions'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 90000, owner: 'LJ',
    prepare({ app, fixture }) {
      mkdirSync(join(app.userDataDir, 'Default'), { recursive: true });
      writeFileSync(join(app.userDataDir, 'Default/Preferences'), JSON.stringify({ profile: { content_settings: { exceptions: { notifications: { [`${fixture.url},*`]: { setting: 2 } } } } } }));
    },
  }, run: sitePermissions },
  { journey: { id: 'quick-ask', title: 'Open and dismiss a focused native Quick Ask window', features: ['quickAsk'], devAcceptance: ['quickAsk'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 90000, owner: 'LJ' }, run: quickAsk },
];
