import { surfaceMediaPage } from '../fixtures/surface-media.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

export const journey = {
  id: 'pip', title: 'Manual, automatic and Document picture in picture', features: ['pictureInPicture'],
  devAcceptance: ['pictureInPicture', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  fixture: { tls: true },
  launch: ({ fixture }) => ({ args: [`--ignore-certificate-errors-spki-list=${fixture.certificateSpki}`, '--host-resolver-rules=MAP slack.com 127.0.0.1, MAP meet.google.com 127.0.0.1, MAP teams.microsoft.com 127.0.0.1, MAP youtube.com 127.0.0.1'] }),
  timeoutMs: 240_000, owner: 'L5',
};
const selector = (name, scope = 'page', role) => ({ name, match: 'exact', scope, ...(role ? { role } : {}), index: 0 });
const tab = name => ({ role: 'AXRadioButton', name: `^${name}(?: Close ${name})?$`, match: 'regex', scope: 'shell', index: 0 });
const pipWindows = async (t, baseline) => (await t.ax.windows()).filter(window => !baseline.some(before => before.id === window.id) && window.width >= 160 && window.height >= 90);
async function observation(t, page) { return { ax: await t.ax.dump(), rpc: { page: await t.rpc('pages.observe', { pageId: page.pageId }), windows: await t.ax.windows() } }; }
async function playing(t, page) {
  await t.until('real video playback is visible to native observation', async () => /Videos playing:/.test(JSON.stringify(await t.rpc('pages.observe', { pageId: page.pageId }))));
}
export async function run(t) {
  t.assert.ok(t.fixture.tlsUrl && t.fixture.certificateSpki, 'The owned TLS fixture and certificate-specific startup trust must be present');
  t.fixture.route('/pip-two', surfaceMediaPage('Aux PiP two videos', 2));
  t.fixture.route('/pip-one', surfaceMediaPage('Aux PiP one video', 1));
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: false });
  const page = await t.rpc('pages.open', { url: `${t.fixture.url}/pip-two`, activate: true });
  await playing(t, page);
  await t.step('the remappable command selects the largest playing video and exits', { kind: 'ui', features: ['pictureInPicture'] }, async () => {
    await setTabLayout(t, 'vertical', tab('Aux PiP two videos'));
    const baseline = await t.ax.windows(); await t.ax.key('control+command+p', 'hid');
    await t.ax.waitFor(selector('Video PiP: large')); await t.until('native video PiP window appears', async () => (await pipWindows(t, baseline)).length === 1);
    await t.ax.waitFor(selector('Exit picture in picture', 'shell', 'AXButton'));
    const entered = await observation(t, page); t.assert.match(JSON.stringify(entered.rpc.page), /Video PiP: large/);
    await t.capture('pip-largest-video'); await t.ax.key('control+command+p', 'hid');
    await t.ax.waitFor(selector('Video PiP: none')); await t.until('native PiP window closes', async () => !(await pipWindows(t, baseline)).length);
    return { ax: await t.ax.dump(), rpc: { entered: entered.rpc, exited: (await observation(t, page)).rpc } };
  });
  await t.step('the registered MediaSession handler enters PiP', { kind: 'ui', features: ['pictureInPicture'] }, async () => {
    await t.ax.press(selector('Register media session handler', 'page', 'AXButton'));
    await t.ax.key('control+command+p', 'hid'); await t.ax.waitFor(selector('Media session handler: invoked'));
    await t.ax.waitFor(selector('Video PiP: large')); const entered = await observation(t, page);
    t.assert.match(JSON.stringify(entered.rpc.page), /Media session handler: invoked/);
    await t.ax.key('control+command+p', 'hid'); await t.ax.waitFor(selector('Video PiP: none'));
    return entered;
  });
  await t.step('paused video retains the control; destroyed video clears it and the empty command explains why', { kind: 'ui', features: ['pictureInPicture'] }, async () => {
    await t.ax.press(selector('Clear media session handler', 'page', 'AXButton'));
    await t.ax.press(selector('Pause all videos', 'page', 'AXButton')); await t.ax.waitFor(selector('Videos paused: 2'));
    await t.ax.waitFor(selector('Picture in picture', 'shell', 'AXButton'));
    await t.ax.key('control+command+p', 'hid'); await t.ax.waitFor(selector('No playing video on this page', 'shell'));
    await t.ax.press(selector('Destroy all videos', 'page', 'AXButton')); await t.ax.waitFor(selector('Videos destroyed'));
    await t.ax.waitFor(selector('Picture in picture', 'shell', 'AXButton'), 'absent');
    return observation(t, page);
  });
  await t.step('Document PiP owns a real window and native state', { kind: 'ui', features: ['pictureInPicture'] }, async () => {
    const baseline = await t.ax.windows(); await t.ax.press(selector('Document picture in picture', 'page', 'AXButton'));
    await t.ax.waitFor(selector('Document PiP fixture', 'any')); await t.until('native Document PiP window appears', async () => (await pipWindows(t, baseline)).length === 1);
    const opened = await observation(t, page); await t.ax.press(selector('Close Document PiP', 'any', 'AXButton'));
    await t.until('native Document PiP window closes', async () => !(await pipWindows(t, baseline)).length);
    return opened;
  });
  await t.step('allow automatic PiP through its real Settings control', { kind: 'ui', features: ['pictureInPicture'] }, async () => {
    await t.ax.key('command+,', 'hid'); const search = selector('Search settings', 'shell', 'AXTextField');
    await t.ax.waitFor(search, 'visible');
    await t.ax.type('Automatic picture in picture', search);
    await t.ax.press(selector('General Automatic picture in picture Control whether sites may open floating video automatically. Manual picture in picture remains available.', 'shell', 'AXButton'));
    await t.ax.press(selector('Automatic picture in picture', 'shell', 'AXPopUpButton'));
    await t.ax.press(selector('Allow on all sites', 'any')); await t.ax.press(selector('Close settings', 'shell', 'AXButton'));
    return { ax: await t.ax.dump(), rpc: await t.rpc('workspace.get') };
  });
  const tls = new URL(t.fixture.tlsUrl);
  for (const host of ['127.0.0.1', 'youtube.com', 'slack.com', 'meet.google.com', 'teams.microsoft.com']) {
    await t.step(`${host} follows its automatic PiP policy on tab switch`, { kind: 'ui', features: ['pictureInPicture'] }, async () => {
      const video = await t.rpc('pages.open', { url: `https://${host}:${tls.port}/pip-one`, activate: true }); await playing(t, video);
      if (host !== 'youtube.com') { await t.ax.press(selector('Play audible video', 'page', 'AXButton')); await t.ax.waitFor(selector('Audible video playing')); }
      const baseline = await t.ax.windows(); await t.ax.press(tab('Aux native Red'));
      const allows = host === '127.0.0.1' || host === 'youtube.com';
      if (allows) await t.until('automatic native PiP window appears', async () => (await pipWindows(t, baseline)).length === 1);
      else {
        const deadline = performance.now() + 2000;
        while (performance.now() < deadline) { t.assert.equal((await pipWindows(t, baseline)).length, 0, 'Call sites never automatically enter PiP'); await new Promise(resolve => setTimeout(resolve, 50)); }
      }
      const observed = await observation(t, video);
      t.assert.match(JSON.stringify(observed.rpc.page), allows ? /Video PiP: large/ : /Video PiP: none/);
      await t.capture(`pip-auto-${host.replaceAll('.', '-')}`);
      // Returning to the owning tab must close auto-PiP before the next trial.
      await t.ax.press(tab('Aux PiP one video')); await t.until('auto PiP closes on return', async () => !(await pipWindows(t, baseline)).length);
      await t.ax.key('command+w', 'hid'); await t.until('the exact auto-PiP fixture is closed', async () => !(await t.rpc('pages.list')).some(item => item.pageId === video.pageId));
      t.assert.ok((await t.rpc('pages.list')).some(item => item.pageId === red.pageId)); return observed;
    });
  }
}
