import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, settings, loadedPage, press } from '../fixtures/legacy-ui.mjs';

async function contentBlocking(t) {
  let trackerRequests = 0;
  let redirectRequests = 0;
  const port = new URL(t.fixture.url).port;
  const target = `http://hilltopads.net:${port}/tracker`;
  t.fixture.route('/tracker', () => { trackerRequests++; return Buffer.from('fixture'); }, { headers: { 'content-type': 'image/gif' } });
  t.fixture.route('/redirect', (_request, response) => { redirectRequests++; response.writeHead(302, { location: target }); response.end(); });
  const page = src => `<!doctype html><title>Aux blocking fixture</title><main><h1>Aux blocking fixture</h1><output id="result">Waiting for tracker</output><img src="${src}" onload="document.querySelector('#result').textContent='Tracker finished'" onerror="document.querySelector('#result').textContent='Tracker finished'"></main>`;
  const headers = { 'content-security-policy': `default-src 'self'; script-src 'unsafe-inline'; img-src 'self' http://hilltopads.net:${port}` };
  t.fixture.route('/blocking', page(target), { headers });
  t.fixture.route('/blocking-redirect', page('/redirect'), { headers });
  const blockingState = () => JSON.parse(readFileSync(join(t.app.userDataDir, 'Default/Aux Runtime Data/filters/blocking.json'), 'utf8'));
  const load = async path => {
    if ((await t.ax.query(shell('Privacy & Security', 'AXButton'))).length) {
      await t.ax.key('escape', 'hid');
      await t.ax.waitFor(shell('Privacy & Security', 'AXButton'), 'absent');
    }
    const result = await loadedPage(t, path);
    const observed = await t.until('tracker finished native load', async () => {
      const value = await t.rpc('pages.observe', { pageId: result.pageId });
      return /Tracker finished/.test(JSON.stringify(value)) && value;
    });
    return { page: result, observed };
  };
  await t.step('native tracker blocking cancels the known tracker before network', { kind: 'ui', features: ['contentBlocking'] }, async () => {
    await settings(t, 'Privacy & Security');
    await t.ax.waitFor({ ...shell('Block trackers and ads', 'AXCheckBox'), match: 'contains' });
    await t.ax.waitFor(shell('Filter lists'));
    t.assert.equal(blockingState().enabled, true);
    const rpc = await load('/blocking');
    t.assert.equal(trackerRequests, 0);
    const ax = await t.ax.dump({ scope: 'page' });
    t.assert.match(JSON.stringify(ax), /Tracker finished/);
    await t.capture('blocking-on');
    return { ax, rpc };
  });
  await t.step('disabled blocking allows the same tracker and restoring cancels it again', { kind: 'ui', features: ['contentBlocking'] }, async () => {
    await settings(t, 'Privacy & Security');
    await press(t, { ...shell('Block trackers and ads', 'AXCheckBox'), match: 'contains' });
    await t.until('native blocking disabled', () => blockingState().enabled === false);
    await load('/blocking');
    t.assert.ok(trackerRequests > 0, 'Unblocked tracker control must reach fixture');
    await settings(t, 'Privacy & Security');
    await press(t, { ...shell('Block trackers and ads', 'AXCheckBox'), match: 'contains' });
    await t.until('native blocking restored', () => blockingState().enabled === true);
    const before = trackerRequests;
    await load('/blocking');
    t.assert.equal(trackerRequests, before);
    const rpc = await load('/blocking-redirect');
    t.assert.ok(redirectRequests > 0, 'Same-origin redirect must reach fixture');
    t.assert.equal(trackerRequests, before, 'Redirect cannot bypass native tracker blocking');
    const ax = await t.ax.dump({ scope: 'page' });
    t.assert.match(JSON.stringify(ax), /Tracker finished/);
    await t.capture('blocking-restored-redirect');
    return { ax, rpc: { ...rpc, trackerRequests, redirectRequests } };
  });
}
export const journey = {
  id: 'content-blocking', title: 'Block, allow and reblock a loopback tracker including redirects', features: ['contentBlocking'], devAcceptance: ['contentBlocking', 'sitePermissions'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: { args: ['--host-resolver-rules=MAP hilltopads.net 127.0.0.1', '--no-proxy-server', '--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers'] },
  prepare({ app }) {
    mkdirSync(join(app.userDataDir, 'Default'), { recursive: true });
    writeFileSync(join(app.userDataDir, 'Default/Preferences'), JSON.stringify({ aux: { https_upgrades_enabled: false } }));
  }, timeoutMs: 90000, owner: 'LJ',
};
export const run = contentBlocking;
