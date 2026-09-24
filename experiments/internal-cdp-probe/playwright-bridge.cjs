// Isolated host experiment only. Method forwarding below is not a production security policy.
const { app, BrowserWindow, session } = require('electron');
const { createRequire } = require('node:module');
const { randomBytes } = require('node:crypto');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const userData = mkdtempSync(join(tmpdir(), 'aux-playwright-bridge-probe-'));
app.setPath('userData', userData);
process.on('exit', () => { try { rmSync(userData, { recursive: true, force: true }); } catch { /* temporary probe files only */ } });

const root = resolve(__dirname, '../..');
const runtimeRequire = createRequire(resolve(root, 'apps/runtime/package.json'));
const driverRequire = createRequire(resolve(root, 'packages/chromium-driver/package.json'));
const { WebSocket, WebSocketServer } = runtimeRequire('ws');
const { chromium } = driverRequire('playwright-core');

const report = { electron: process.versions.electron, rawDebuggingPort: app.commandLine.hasSwitch('remote-debugging-port'), commands: [], denied: [], events: [], connected: false, pages: [] };
const raceTimeout = (work, label) => Promise.race([work, new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), 8000))]);

app.whenReady().then(async () => {
  const regular = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const second = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const isolatedSession = session.fromPartition('aux-cdp-probe-other');
  const isolated = new BrowserWindow({ show: false, webPreferences: { session: isolatedSession, nodeIntegration: false, contextIsolation: true } });
  await Promise.all([
    session.defaultSession.cookies.set({ url: 'https://aux-probe.example', name: 'allowed-cookie', value: 'allowed' }),
    isolatedSession.cookies.set({ url: 'https://aux-probe.example', name: 'denied-cookie', value: 'denied' }),
  ]);
  await Promise.all([
    regular.loadURL(`data:text/html,${encodeURIComponent('<title>Aux allowed target</title><main>allowed</main><iframe id="child" src="data:text/html,<body>frame child</body>"></iframe>')}`),
    second.loadURL('data:text/html,<title>Aux second target</title><main>second</main>'),
    isolated.loadURL('data:text/html,<title>Aux denied target</title><main>denied</main>'),
  ]);
  const debuggerApi = regular.webContents.debugger;
  debuggerApi.attach('1.3');
  const targetList = await debuggerApi.sendCommand('Target.getTargets');
  const allowedIds = new Set(targetList.targetInfos.filter(target => target.title === 'Aux allowed target' || target.title === 'Aux second target').map(target => target.targetId));
  const deniedId = targetList.targetInfos.find(target => target.title === 'Aux denied target').targetId;
  const sessions = new Set();
  const browserSessions = new Set();
  let reportedAttached = false;
  const capabilityPath = `/probe/${randomBytes(32).toString('hex')}`;
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0, path: capabilityPath });
  const listen = new Promise(resolveListen => server.once('listening', resolveListen));
  await listen;
  const socket = new Promise(resolveSocket => server.once('connection', resolveSocket));
  server.on('connection', client => {
    debuggerApi.on('message', (_event, method, params, sessionId) => {
      if (method === 'Target.targetCreated' || method === 'Target.targetInfoChanged' || method === 'Target.targetDestroyed') {
        const id = params.targetInfo?.targetId ?? params.targetId;
        if (!allowedIds.has(id)) return;
      }
      if (method === 'Target.attachedToTarget') {
        if (!allowedIds.has(params.targetInfo?.targetId)) {
          report.denied.push(`auto-attached:${params.targetInfo?.targetId}`);
          void debuggerApi.sendCommand('Target.detachFromTarget', { sessionId: params.sessionId }).catch(() => {});
          return;
        }
        sessions.add(params.sessionId);
      }
      if (method === 'Target.detachedFromTarget') sessions.delete(params.sessionId);
      report.events.push(method === 'Target.attachedToTarget' ? `${method}:${sessionId || 'root'}` : method);
      const rootEvent = method === 'Target.attachedToTarget' || method === 'Target.detachedFromTarget' || method.startsWith('Target.target');
      client.send(JSON.stringify({ method, params, ...(sessionId && !rootEvent ? { sessionId } : {}) }));
    });
    client.on('message', async raw => {
      const message = JSON.parse(String(raw));
      const { id, method, params = {}, sessionId } = message;
      report.commands.push(method);
      try {
        if (sessionId && !sessions.has(sessionId) && !browserSessions.has(sessionId)) throw new Error('Denied target session');
        if (method === 'Target.attachToTarget' && !allowedIds.has(params.targetId)) throw new Error('Denied target');
        if (method === 'Target.activateTarget' && !allowedIds.has(params.targetId)) throw new Error('Denied target');
        if (method === 'Target.createTarget' || method === 'Target.createBrowserContext') throw new Error('Target creation requires the Aux main process');
        let result;
        if (method === 'Target.attachToBrowserTarget') {
          const childSessionId = 'aux-probe-browser-session';
          browserSessions.add(childSessionId);
          result = { sessionId: childSessionId };
        } else if (method === 'Target.detachFromTarget' && browserSessions.has(params.sessionId)) {
          browserSessions.delete(params.sessionId);
          result = {};
        } else if (method === 'Storage.getCookies' && browserSessions.has(sessionId)) {
          const cookies = await session.defaultSession.cookies.get({ url: 'https://aux-probe.example' });
          result = { cookies: cookies.map(cookie => ({ name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path, secure: cookie.secure, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite, expires: cookie.expirationDate ?? -1, session: !cookie.expirationDate })) };
        } else {
          result = await debuggerApi.sendCommand(method, params, browserSessions.has(sessionId) ? undefined : sessionId);
        }
        if (method === 'Target.getTargets') result = { targetInfos: result.targetInfos.filter(target => allowedIds.has(target.targetId)) };
        if (method === 'Target.attachToTarget') sessions.add(result.sessionId);
        client.send(JSON.stringify({ id, result, ...(sessionId ? { sessionId } : {}) }));
        if (method === 'Target.setAutoAttach' && params.autoAttach && !reportedAttached) {
          reportedAttached = true;
          try {
            for (const targetId of allowedIds) {
              const attached = await debuggerApi.sendCommand('Target.attachToTarget', { targetId, flatten: true });
              sessions.add(attached.sessionId);
            }
          } catch (error) {
            report.denied.push(`self-attach:${String(error)}`);
          }
        }
      } catch (error) {
        client.send(JSON.stringify({ id, error: { code: -32000, message: String(error) }, ...(sessionId ? { sessionId } : {}) }));
      }
    });
  });
  const port = server.address().port;
  report.invalidCapabilityRejected = await new Promise(resolveResult => {
    const unauthorized = new WebSocket(`ws://127.0.0.1:${port}/probe/invalid`);
    unauthorized.once('open', () => { unauthorized.close(); resolveResult(false); });
    unauthorized.once('error', () => resolveResult(true));
  });
  try {
    const browser = await raceTimeout(chromium.connectOverCDP(`ws://127.0.0.1:${port}${capabilityPath}`, { timeout: 7000 }), 'Playwright connect');
    report.connected = true;
    report.contextCount = browser.contexts().length;
    report.pages = browser.contexts().flatMap(context => context.pages().map(page => page.title()));
    report.pages = await Promise.all(report.pages);
    const allowedPage = browser.contexts().flatMap(context => context.pages()).find(page => page.url().includes('Aux%20allowed%20target'));
    report.frameText = await allowedPage?.frameLocator('#child').locator('body').innerText();
    const cdp = await browser.newBrowserCDPSession();
    const exposed = await cdp.send('Target.getTargets');
    report.deniedTargetListed = exposed.targetInfos.some(target => target.targetId === deniedId);
    const scopedCookies = await cdp.send('Storage.getCookies');
    report.cookieNames = scopedCookies.cookies.map(cookie => cookie.name);
    try {
      await cdp.send('Target.attachToTarget', { targetId: deniedId, flatten: true });
      report.deniedTargetAttachRejected = false;
    } catch {
      report.deniedTargetAttachRejected = true;
    }
    await cdp.detach();
    await browser.close();
  } catch (error) {
    report.error = String(error);
  }
  const client = await socket;
  client.close();
  server.close();
  debuggerApi.detach();
  report.allowedTargetIds = [...allowedIds];
  report.deniedTargetVisible = report.pages?.includes('Aux denied target') ?? false;
  report.deniedTargetId = deniedId;
  console.log(`AUX_PLAYWRIGHT_BRIDGE_PROBE ${JSON.stringify(report)}`);
  const passed = !report.rawDebuggingPort && report.invalidCapabilityRejected && report.connected
    && report.pages.includes('Aux allowed target') && report.pages.includes('Aux second target') && report.frameText === 'frame child'
    && !report.deniedTargetVisible && !report.deniedTargetListed && report.deniedTargetAttachRejected
    && report.cookieNames.includes('allowed-cookie') && !report.cookieNames.includes('denied-cookie');
  regular.destroy();
  second.destroy();
  isolated.destroy();
  app.exit(passed ? 0 : 1);
}).catch(error => {
  console.error(`AUX_PLAYWRIGHT_BRIDGE_PROBE_ERROR ${String(error)}`);
  app.exit(1);
});
