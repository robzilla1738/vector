import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, settings, loadedPage, press } from '../fixtures/legacy-ui.mjs';
import { createFilterTls } from '../fixtures/filter-tls.mjs';

let transport;
const name = 'Disposable hosts fixture';
const host = 'cdn.appround.biz';
export const journey = {
  id: 'custom-blocking-list', title: 'Review, download, refresh and pause a disposable HTTPS hosts list with native network proof', features: ['contentBlocking'], devAcceptance: ['contentBlocking', 'sitePermissions'], needs: ['accessibility', 'screen-recording'], model: 'none', timeoutMs: 150000, owner: 'LJ',
  launch: { args: ['--host-resolver-rules=MAP cdn.appround.biz 127.0.0.1', '--no-proxy-server', '--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers'] },
  async prepare({ app, fixture }) {
    mkdirSync(join(app.userDataDir, 'Default'), { recursive: true });
    writeFileSync(join(app.userDataDir, 'Default/Preferences'), JSON.stringify({ aux: { https_upgrades_enabled: false } }));
    transport = await createFilterTls(join(app.userDataDir, 'filter-fixture'));
    fixture.tunnel('aux-filter.fixture.test:443', transport.server);
    return { env: { NODE_USE_ENV_PROXY: '1', HTTPS_PROXY: fixture.url, NODE_EXTRA_CA_CERTS: transport.ca } };
  },
};
export async function run(t) {
  let trackerRequests = 0;
  const filters = join(t.app.userDataDir, 'Default/Aux Runtime Data/filters');
  const snapshotPath = join(t.app.userDataDir, 'Default/Aux Blocking/snapshot.json');
  const snapshot = () => JSON.parse(readFileSync(snapshotPath, 'utf8'));
  const sources = () => JSON.parse(readFileSync(join(filters, 'sources.json'), 'utf8'));
  const target = `http://${host}:${new URL(t.fixture.url).port}/custom-tracker`;
  t.fixture.route('/custom-tracker', () => { trackerRequests++; return Buffer.from('fixture'); }, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' } });
  t.fixture.route('/custom-list-page', `<!doctype html><title>Custom hosts fixture</title><h1>Custom hosts fixture</h1><output>Waiting</output><img src="${target}" onload="document.querySelector('output').textContent='Tracker finished'" onerror="document.querySelector('output').textContent='Tracker finished'">`, { headers: { 'content-security-policy': `default-src 'self'; script-src 'unsafe-inline'; img-src 'self' http://${host}:${new URL(t.fixture.url).port}`, 'cache-control': 'no-store' } });
  const load = async () => {
    if ((await t.ax.query(shell('Close settings', 'AXButton'))).length) await press(t, shell('Close settings', 'AXButton'));
    const page = await loadedPage(t, '/custom-list-page');
    return t.until('real custom host request finishes or is canceled', async () => {
      const observed = await t.rpc('pages.observe', { pageId: page.pageId });
      return JSON.stringify(observed).includes('Tracker finished') && observed;
    });
  };
  let source;
  await t.step('unlisted tracker reaches the receiver and review does not install rules', { kind: 'ui', features: ['contentBlocking'] }, async () => {
    await t.until('native blocking snapshot exists', () => existsSync(snapshotPath));
    t.assert.ok(!snapshot().hosts.includes(host), 'The custom fixture must be absent from the built-in host set');
    await load();
    t.assert.equal(trackerRequests, 1);
    await settings(t, 'Privacy & Security');
    await t.ax.type(name, shell('Filter list name', 'AXTextField'));
    await t.ax.type(transport.url, shell('Filter list URL', 'AXTextField'));
    await press(t, shell('Review list', 'AXButton'));
    await t.ax.waitFor(shell('Download this list?', 'AXStaticText'));
    await t.ax.waitFor({ ...shell(`${name} · ${transport.url}`, 'AXStaticText'), match: 'exact' });
    t.assert.equal(transport.requests.length, 0, 'Source review must not fetch before confirmation');
    t.assert.ok(!snapshot().hosts.includes(host));
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.capture('custom-list-review');
    return { ax, rpc: { trackerRequests, native: snapshot() } };
  });
  await t.step('confirmed HTTPS list installs the exact host and refresh uses its validated cache', { kind: 'ui', features: ['contentBlocking'] }, async () => {
    await press(t, shell('Add selected list', 'AXButton'));
    await t.until('custom host installed in Chromium', () => snapshot().hosts.includes(host), 30000);
    source = sources().find(item => item.name === name);
    t.assert.ok(source?.id);
    t.assert.equal(source.url, transport.url);
    t.assert.equal(source.enabled, true);
    t.assert.equal(transport.requests.length, 1);
    const metaPath = join(filters, `${source.id}.meta.json`);
    const first = JSON.parse(readFileSync(metaPath, 'utf8'));
    t.assert.equal(first.hosts, 1);
    t.assert.ok(!first.error);
    const before = trackerRequests;
    await load();
    t.assert.equal(trackerRequests, before);
    await settings(t, 'Privacy & Security');
    await press(t, shell('Update enabled lists', 'AXButton'));
    const refreshed = await t.until('fresh source metadata and native snapshot committed', () => {
      const value = JSON.parse(readFileSync(metaPath, 'utf8'));
      return value.fetchedAt > first.fetchedAt && !value.error && snapshot().hosts.includes(host) && value;
    }, 30000);
    t.assert.equal(transport.requests.length, 2);
    t.assert.equal(transport.requests[1].etag, '"aux-fixture-v1"');
    await load();
    t.assert.equal(trackerRequests, before);
    const ax = await t.ax.dump({ scope: 'page' });
    await t.capture('custom-list-refreshed-block');
    return { ax, rpc: { source, refreshed, native: snapshot(), trackerRequests, received: transport.requests } };
  });
  await t.step('pausing the reviewed source removes its native host and restores the request', { kind: 'ui', features: ['contentBlocking'] }, async () => {
    await settings(t, 'Privacy & Security');
    await press(t, shell('Pause list', 'AXButton'));
    await t.until('paused source host removed from native snapshot', () => !snapshot().hosts.includes(host));
    t.assert.equal(sources().find(item => item.id === source.id).enabled, false);
    const before = trackerRequests;
    await load();
    t.assert.equal(trackerRequests, before + 1);
    const ax = await t.ax.dump({ scope: 'page' });
    await t.capture('custom-list-paused-positive');
    return { ax, rpc: { native: snapshot(), trackerRequests } };
  });
}
