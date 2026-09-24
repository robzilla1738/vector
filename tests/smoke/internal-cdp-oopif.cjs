// Out-of-process iframe qualification through the production broker.
const { app, BrowserWindow, session } = require('electron');
const { createServer } = require('node:http');
const { createRequire } = require('node:module');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const root = resolve(__dirname, '../..');
const desktopRequire = createRequire(join(root, 'apps/desktop/package.json'));
const driverRequire = createRequire(join(root, 'packages/chromium-driver/package.json'));
const { buildSync } = desktopRequire('esbuild');
const { chromium } = driverRequire('playwright-core');
const temporary = mkdtempSync(join(tmpdir(), 'aux-oopif-probe-'));
app.setPath('userData', temporary);
app.commandLine.appendSwitch('site-per-process');
process.on('exit', () => rmSync(temporary, { recursive: true, force: true }));
const output = join(temporary, 'broker.cjs');
buildSync({ entryPoints: [join(root, 'apps/desktop/main/runtime/internal-cdp.ts')], outfile: output, bundle: true, platform: 'node', format: 'cjs', external: ['electron'] });
const { InternalCdpBroker } = require(output);

app.whenReady().then(async () => {
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html');
    if (request.url === '/child') response.end('<title>Cross-site child</title><body>Cross-site frame text<button id="action" onclick="this.textContent=\'Frame clicked\'">Click frame</button><input id="entry" aria-label="Frame entry"><div style="height:2000px">Scrollable frame</div></body>');
    else response.end(`<title>Parent</title><iframe id="first" src="http://localhost:${server.address().port}/child"></iframe><iframe id="remote" style="transform:scale(1.1);transform-origin:top left" src="http://localhost:${server.address().port}/child"></iframe>`);
  });
  await new Promise(resolveListen => server.listen(0, resolveListen));
  const shell = new BrowserWindow({ show: false });
  const allowed = new BrowserWindow({ show: false, webPreferences: { session: session.fromPartition('persist:oopif') } });
  let broker;
  let browser;
  try {
    await Promise.all([shell.loadURL('data:text/html,<title>Aux shell</title>'), allowed.loadURL(`http://127.0.0.1:${server.address().port}/parent`)]);
    allowed.show();
    allowed.focus();
    const entry = { pageId: 'allowed', view: { webContents: allowed.webContents } };
    const registry = { all: () => [entry], byWebContentsId: id => id === allowed.webContents.id ? entry : undefined, subscribe: () => () => {} };
    broker = await InternalCdpBroker.start(shell.webContents, registry, allowed.webContents.session);
    browser = await chromium.connectOverCDP(broker.endpoint(), { timeout: 5000 });
    const page = browser.contexts().flatMap(context => context.pages()).find(candidate => candidate.url().includes('/parent'));
    if (!page) throw new Error('Allowed parent target did not surface');
    const content = await page.frameLocator('#remote').locator('body').innerText({ timeout: 5000 });
    const frames = allowed.webContents.mainFrame.framesInSubtree.map(frame => ({ url: frame.url, processId: frame.processId }));
    if (!content.includes('Cross-site frame text') || new Set(frames.map(frame => frame.processId)).size < 2) throw new Error('OOPIF not qualified');
    await page.frameLocator('#remote').locator('#action').click({ timeout: 5000 });
    const changed = await page.frameLocator('#remote').locator('#action').innerText({ timeout: 5000 });
    if (changed !== 'Frame clicked') throw new Error(`OOPIF click did not land: ${changed}`);
    const untouched = await page.frameLocator('#first').locator('#action').innerText({ timeout: 5000 });
    if (untouched !== 'Click frame') throw new Error(`Same-URL sibling iframe was clicked: ${untouched}`);
    await page.frameLocator('#remote').locator('#entry').fill('Aux in frame', { timeout: 5000 });
    const typed = await page.frameLocator('#remote').locator('#entry').inputValue({ timeout: 5000 });
    if (typed !== 'Aux in frame') throw new Error(`OOPIF text input did not land: ${typed}`);
    const box = await page.locator('#remote').boundingBox();
    if (!box) throw new Error('OOPIF has no visible box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(150);
    const scrollY = await page.frameLocator('#remote').locator('body').evaluate(() => window.scrollY);
    if (scrollY < 100) throw new Error(`OOPIF wheel input did not land: ${scrollY}`);
    console.log('Playwright reads, clicks, types, and scrolls the correct transformed OOPIF while a same-URL sibling remains untouched.');
  } finally {
    await browser?.close().catch(() => {});
    await broker?.close();
    shell.destroy();
    allowed.destroy();
    server.closeAllConnections();
    await new Promise(resolveClose => server.close(resolveClose));
  }
  app.exit(0);
}).catch(error => { console.error('OOPIF qualification failed:', String(error)); app.exit(1); });
