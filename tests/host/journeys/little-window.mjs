import { captureLittleState } from '../lib/utility-window-capture.mjs';
import { execFileSync } from 'node:child_process';
import { fixturePage } from '../lib/fixture.mjs';

export const journey = {
  id: 'little-window', title: 'Open, inspect and promote real Little windows through external links and keyboard commands',
  features: ['littleWindow'], devAcceptance: ['littleWindow', 'windowSync', 'spaces', 'commandRegistry'],
  needs: ['accessibility', 'screen-recording'], model: 'none', launch: ({ appearance }) => ({ args: appearance ? [] : ['--aux-native-performance-observer'] }), timeoutMs: 240_000, owner: 'L4',
};
const button = name => ({ role: 'AXButton', name, match: 'exact', scope: 'shell', index: 0 });
const promote = button('Open in Aux');
const normalWindows = async t => (await t.ax.windows()).filter(window => window.layer === 0);
async function littlePage(t, url) {
  let page;
  await t.until('authoritative Little page identity', async () => {
    page = (await t.rpc('pages.list')).find(item => item.url === url && item.windowKind === 'little');
    return page && !page.loading;
  }, { intervalMs: 10 });
  return page;
}
async function newWindow(t, before) {
  let window;
  await t.until('new visible native Little window', async () => {
    window = (await normalWindows(t)).find(item => !before.some(old => old.id === item.id));
    return window;
  }, { intervalMs: 10 });
  return window;
}
function geometry(t, window, ax) {
  t.assert.ok(Math.abs(window.width - 960) <= 1 && Math.abs(window.height - 720) <= 1, 'Little window is 960 × 720');
  const page = ax.find(item => item.role === 'AXWebArea' && item.name === 'Aux Little fixture');
  t.assert.ok(page?.frame && Math.abs(page.frame.y - window.y - 40) <= 1, 'Live page starts immediately below the 40 px strip');
  t.assert.ok(page.frame.width >= 958 && page.frame.height >= 678, 'The native guest fills the Little page area');
  const close = ax.find(item => item.role === 'AXButton' && item.names?.some(name => /close/i.test(name)) && item.frame?.x < window.x + 80);
  t.assert.ok(close?.frame?.width > 0, 'Native traffic lights remain available');
}

export async function run(t) {
  t.fixture.route('/little-fixture', (_request, _response, url) => fixturePage(url.searchParams.has('trial') ? `Aux Little trial ${url.searchParams.get('trial')}` : url.searchParams.has('main') ? 'Aux Little main' : url.searchParams.has('gesture') ? 'Aux Little gesture' : url.searchParams.has('cold') ? 'Aux Little cold' : 'Aux Little fixture', '<a href="/little-fixture?gesture=1">Open a Little fixture link</a><label>Little draft <textarea aria-label="Little draft" oninput="document.querySelector(\'output\').textContent=this.value"></textarea></label><output></output><a download="little-note.txt" href="/little-note.txt">Download Little note</a>'));
  t.fixture.route('/little-note.txt', 'Disposable Little fixture note', { headers: { 'content-type': 'text/plain', 'content-disposition': 'attachment; filename="little-note.txt"' } });
  const main = await t.rpc('pages.open', { url: `${t.fixture.url}/little-fixture?main=1`, activate: true });
  const mainWindowId = (await t.rpc('pages.list')).find(page => page.pageId === main.pageId).windowId;
  const before = await normalWindows(t);
  let first;
  await t.step('external link opens the native Little page with its own chrome', { kind: 'ui', features: ['littleWindow'] }, async () => {
    const url = `${t.fixture.url}/little-fixture?external=1`;
    await t.app.openExternal(url);
    first = await littlePage(t, url);
    const window = await newWindow(t, before);
    await t.ax.waitFor(promote, 'visible');
    await t.ax.type('Little draft remains live', { role: 'AXTextArea', name: 'Little draft', match: 'exact', index: 0, within: { role: 'AXWebArea', name: 'Aux Little fixture', match: 'exact', index: 0 } });
    const ax = await t.ax.dump();
    geometry(t, window, ax);
    t.assert.notEqual(first.windowId, mainWindowId);
    await captureLittleState(t, 'little-window-external', 'little-window-external-draft', window.id);
    if (t.narrowEnabled) await t.captureUtilityNarrowWindow(first, 'little-window-external-narrow', 'little-window-external-draft-narrow');
    return { ax, rpc: { pages: await t.rpc('pages.list'), window } };
  });
  await t.step('Space picker and the 280 px downloads tray restore focus on Escape', { kind: 'ui', features: ['littleWindow'] }, async () => {
    await t.ax.press(button('Choose destination Space'));
    await t.ax.waitFor({ role: 'AXMenu', name: 'Open in Aux Space', match: 'exact', index: 0 });
    await t.ax.key('tab', 'hid');
    await t.ax.waitFor(button('Copy link'), 'focused');
    await t.ax.press(button('Choose destination Space'));
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(button('Choose destination Space'), 'focused');
    await t.ax.click({ role: 'AXLink', name: 'Download Little note', match: 'exact', index: 0, within: { role: 'AXWebArea', name: 'Aux Little fixture', match: 'exact', index: 0 } });
    await t.ax.press(button('Downloads for this page'));
    await t.ax.waitFor({ name: 'Downloads', match: 'exact', scope: 'shell', index: 0 });
    await t.ax.waitFor({ name: 'little-note.txt', match: 'exact', scope: 'shell', index: 0 });
    const tray = { role: 'AXDialog', name: 'Downloads for this page', match: 'exact', index: 0 };
    await t.ax.waitFor({ role: 'AXTextField', name: 'Search downloads', match: 'exact', index: 0, within: tray }, 'focused');
    for (let tab = 0; tab < 20; tab++) {
      await t.ax.key('tab', 'hid');
      await t.until('native modal focus stays inside the downloads tray', async () => (await t.ax.dump(tray)).some(item => item.focused));
    }
    const ax = await t.ax.dump();
    const heading = ax.find(item => item.name === 'Downloads' && item.frame?.width > 0);
    t.assert.ok(heading?.frame && heading.frame.width <= 280, 'Download tray content fits its narrow viewport');
    await t.ax.key('escape');
    await t.ax.waitFor(button('Downloads for this page'), 'focused');
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });
  await t.step('Open in Aux promotes the same page and closes its empty utility window', { kind: 'ui', features: ['littleWindow'] }, async () => {
    await t.ax.press(promote);
    await t.until('same page promoted into the main window', async () => (await t.rpc('pages.list')).some(page => page.pageId === first.pageId && page.windowId === mainWindowId && page.windowKind === 'normal'));
    await t.until('Little native window closed', async () => (await normalWindows(t)).length === before.length);
    await t.ax.waitFor({ name: 'Little draft remains live', match: 'exact', index: 0 });
    await t.capture('little-window-promoted');
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list'), workspace: await t.rpc('workspace.get') } };
  });
  await t.step('Option Shift link gesture and remappable keyboard commands use real Little windows', { kind: 'ui', features: ['littleWindow'] }, async () => {
    await t.ax.click({ role: 'AXLink', name: 'Open a Little fixture link', match: 'exact', index: 0, within: { role: 'AXWebArea', name: 'Aux Little fixture', match: 'exact', index: 0 } }, { modifiers: ['option', 'shift'] });
    const gesture = await littlePage(t, `${t.fixture.url}/little-fixture?gesture=1`);
    await t.ax.key('command+option+o', 'hid');
    await t.until('keyboard promotion retains gesture page', async () => (await t.rpc('pages.list')).some(page => page.pageId === gesture.pageId && page.windowId === mainWindowId));
    await t.ax.key('command+option+n', 'hid');
    await t.ax.waitFor({ name: 'Take a quick look', match: 'exact', index: 0 });
    const empty = await newWindow(t, before);
    await captureLittleState(t, 'little-window-empty', 'little-window-empty', empty.id);
    const emptyPage = (await t.rpc('pages.list')).find(page => page.windowKind === 'little');
    t.assert.ok(emptyPage, 'Empty Little owns one authoritative native page');
    await t.ax.key('command+t', 'hid');
    await t.ax.key('escape');
    t.assert.deepEqual((await t.rpc('pages.list')).filter(page => page.windowKind === 'little').map(page => page.pageId), [emptyPage.pageId], 'New-tab mode does not create hidden extra Little tabs');
    await t.ax.key('command+w', 'hid');
    await t.until('empty Little closes', async () => !(await normalWindows(t)).some(window => window.id === empty.id));
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });
  await t.step('twenty warm external opens reach a real first paint within the budget on AC', { kind: 'ui', features: ['littleWindow'] }, async () => {
    const power = execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8' });
    t.assert.match(power, /AC Power/, 'Performance trials require AC power');
    const trials = [];
    let page;
    const setup = async () => {
        t.assert.equal((await normalWindows(t)).length, before.length, 'No prior utility target survives into native Arm');
    };
    const input = async trial => {
      const url = `${t.fixture.url}/little-fixture?trial=${trial}`;
      const start = performance.now();
      await t.app.openExternal(url);
      await t.ax.waitFor({ role: 'AXWebArea', name: `Aux Little trial ${trial}`, match: 'exact', index: 0 }, 'visible');
      page = await littlePage(t, url);
      trials.push(performance.now() - start);
    };
    const cleanup = async (_trial, result) => {
      if (result) t.assert.ok((await normalWindows(t)).some(window => window.id === result.measured.target.windowId), 'Genuine measured creation target is still present before promotion');
      await t.ax.press(promote);
      await t.until('trial utility window closed' , async () => (await normalWindows(t)).length === before.length, { intervalMs: 10 });
      await t.rpc('pages.close', { pageId: page.pageId });
    };
    let hardware;
    if (t.appearanceEnabled) {
      // Appearance captures are diagnostic; timed native qualification runs separately.
      for (let trial = 0; trial < 20; trial++) { await setup(); await input(trial); await cleanup(trial); }
      hardware = { status: 'not_measured', reason: 'appearance diagnostic run' };
    } else hardware = await t.measureGuestPresentations({ metric: 'little-window', setup, input, cleanup });
    const p95 = [...trials].sort((a, b) => a - b)[18];
    t.assert.ok(p95 <= 600, `Warm first-paint p95 ${p95.toFixed(1)} ms exceeds 600 ms`);
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list'), performance: { power: 'AC', trials, p95, diagnosticEndpoint: 'Node trigger→AX/readiness; original assertion retained', hardware } } };
  });
  await t.step('cold external launch starts a normal window and shows Little above it without restoring old utility windows', { kind: 'ui', features: ['littleWindow'] }, async () => {
    const url = `${t.fixture.url}/little-fixture?cold=1`;
    await t.restart({ externalUrl: url });
    const page = await littlePage(t, url);
    await t.ax.waitFor(promote, 'visible');
    const windows = await normalWindows(t);
    t.assert.equal(windows.length, before.length + 1, 'Cold launch has one normal window and one new Little window');
    const pages = await t.rpc('pages.list');
    t.assert.equal(pages.filter(item => item.windowKind === 'little').length, 1, 'Old Little windows are absent from session restore');
    t.assert.ok(pages.some(item => item.windowKind === 'normal'));
    if (t.narrowEnabled) await t.captureDistinctNarrowGeneration('little-cold-owned', 'little-cold-functional-proof');
    await t.ax.press(promote);
    await t.until('cold page can be promoted safely', async () => (await t.rpc('pages.list')).some(item => item.pageId === page.pageId && item.windowKind === 'normal'));
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list'), windows } };
  });
}
