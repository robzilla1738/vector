import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, settings, press } from '../fixtures/legacy-ui.mjs';

export const journey = {
  id: 'https-first', title: 'Verify native HTTPS upgrading against a disposable protocol probe', features: ['httpsFirst'], devAcceptance: ['httpsFirst', 'sitePermissions'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch({ fixture }) {
    const port = new URL(fixture.url).port;
    return { args: [`--host-resolver-rules=MAP aux-off.notarealdomain-auxprobe.com 127.0.0.1:${port}, MAP aux-on.notarealdomain-auxprobe.com 127.0.0.1:${port}`, '--no-proxy-server', '--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers'] };
  }, timeoutMs: 90000, owner: 'LJ',
};
export async function run(t) {
  t.fixture.route('/probe', '<!doctype html><title>Aux HTTPS-first fixture</title><h1>Aux HTTPS-first fixture</h1>');
  const preferences = join(t.app.userDataDir, 'Default/Preferences');
  const saved = () => existsSync(preferences) ? JSON.parse(readFileSync(preferences, 'utf8')).aux?.https_upgrades_enabled : undefined;
  const control = { ...shell('Automatically upgrade eligible HTTP pages', 'AXCheckBox'), match: 'contains' };
  const checked = async () => {
    const controls = await t.ax.query(control);
    t.assert.equal(controls.length, 1);
    t.assert.equal(typeof controls[0].checked, 'boolean', 'Native HTTPS checkbox must expose actual checked state');
    return controls[0].checked;
  };
  await t.step('turn HTTPS-first off and prove plaintext without a TLS upgrade', { kind: 'ui', features: ['httpsFirst'] }, async () => {
    await settings(t, 'Privacy & Security');
    await t.ax.waitFor(control);
    const initiallyChecked = await checked();
    if (initiallyChecked) await press(t, control);
    await t.until('native HTTPS checkbox unchecked', async () => await checked() === false);
    await t.until('native HTTPS-first disabled', () => saved() === false);
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(shell('Privacy & Security', 'AXButton'), 'absent');
    const before = t.fixture.requests.filter(request => request.path === '/probe').length;
    const hellos = t.fixture.tlsHellos;
    const page = await t.rpc('pages.open', { url: 'http://aux-off.notarealdomain-auxprobe.com/probe', activate: true });
    await t.until('plaintext native request', () => t.fixture.requests.filter(request => request.path === '/probe').length > before);
    const rpc = await t.until('plaintext native content', async () => {
      const observed = await t.rpc('pages.observe', { pageId: page.pageId });
      return /Aux HTTPS-first fixture/.test(JSON.stringify(observed)) && observed;
    });
    t.assert.equal(t.fixture.tlsHellos, hellos, 'Disabled HTTPS-first cannot start TLS');
    const ax = await t.ax.dump({ scope: 'page' });
    t.assert.match(JSON.stringify(ax), /Aux HTTPS-first fixture/);
    await t.capture('https-first-off');
    return { ax, rpc: { page: rpc, tlsHellos: t.fixture.tlsHellos, saved: saved() } };
  });
  await t.step('turn HTTPS-first on and prove a native TLS upgrade attempt', { kind: 'ui', features: ['httpsFirst'] }, async () => {
    await settings(t, 'Privacy & Security');
    await t.ax.waitFor(control);
    t.assert.equal(await checked(), false, 'Second step starts with the native HTTPS checkbox off');
    await press(t, control);
    await t.until('native HTTPS checkbox checked', checked);
    await t.until('native HTTPS-first enabled', () => saved() === true);
    const settingsAx = await t.ax.dump({ scope: 'shell' });
    t.assert.match(JSON.stringify(settingsAx), /Automatically upgrade eligible HTTP pages/);
    const hellos = t.fixture.tlsHellos;
    const page = await t.rpc('pages.open', { url: 'http://aux-on.notarealdomain-auxprobe.com/probe', activate: true });
    await t.until('native TLS ClientHello', () => t.fixture.tlsHellos > hellos, 30000);
    const rpc = await t.rpc('pages.list');
    t.assert.ok(rpc.some(item => item.pageId === page.pageId && /aux-on\.notarealdomain-auxprobe\.com/.test(item.url)));
    const ax = [...settingsAx, ...await t.ax.dump({ scope: 'any' })];
    await t.capture('https-first-on');
    return { ax, rpc: { pages: rpc, tlsHellos: t.fixture.tlsHellos, saved: saved() } };
  });
}
