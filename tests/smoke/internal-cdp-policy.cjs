// Exercise the production broker policy inside Electron with a foreign session.
const { app, BrowserWindow, session } = require('electron');
const { createRequire } = require('node:module');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const assert = require('node:assert/strict');

const root = resolve(__dirname, '../..');
const desktopRequire = createRequire(join(root, 'apps/desktop/package.json'));
const { buildSync } = desktopRequire('esbuild');
const { WebSocket } = desktopRequire('ws');
const temporary = mkdtempSync(join(tmpdir(), 'aux-internal-policy-'));
app.setPath('userData', temporary);
process.on('exit', () => rmSync(temporary, { recursive: true, force: true }));
const output = join(temporary, 'internal-cdp.cjs');
buildSync({
  entryPoints: [join(root, 'apps/desktop/main/runtime/internal-cdp.ts')],
  outfile: output, bundle: true, platform: 'node', format: 'cjs', external: ['electron'],
});
const { InternalCdpBroker } = require(output);

app.whenReady().then(async () => {
  const regularSession = session.fromPartition('persist:allowed');
  const foreignSession = session.fromPartition('persist:foreign');
  const make = ses => new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true, nodeIntegration: false } });
  const rootWindow = make(regularSession);
  const allowed = make(regularSession);
  const foreign = make(foreignSession);
  let broker;
  try {
    await Promise.all([
      rootWindow.loadURL('data:text/html,<title>Privileged Aux shell</title>'),
      allowed.loadURL('data:text/html,<title>Allowed native tab</title>'),
      foreign.loadURL('data:text/html,<title>Foreign profile tab</title>'),
      regularSession.cookies.set({ url: 'https://broker-policy.example', name: 'allowed', value: 'one' }),
      foreignSession.cookies.set({ url: 'https://broker-policy.example', name: 'foreign', value: 'two' }),
    ]);
    foreign.webContents.debugger.attach('1.3');
    const foreignId = (await foreign.webContents.debugger.sendCommand('Target.getTargetInfo')).targetInfo.targetId;
    let entries = [{ pageId: 'allowed-page', view: { webContents: allowed.webContents } }];
    let changed = () => {};
    const registry = {
      all: () => entries,
      byWebContentsId: id => entries.find(entry => entry.view.webContents.id === id),
      subscribe: listener => { changed = listener; return () => { changed = () => {}; }; },
    };
    broker = await InternalCdpBroker.start(rootWindow.webContents, registry, regularSession);
    const socket = new WebSocket(broker.endpoint());
    await new Promise((resolveOpen, rejectOpen) => { socket.once('open', resolveOpen); socket.once('error', rejectOpen); });
    let seq = 0;
    const pending = new Map();
    socket.on('message', raw => {
      const message = JSON.parse(String(raw));
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      clearTimeout(waiter.timer);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result);
    });
    const send = (method, params = {}, sessionId) => new Promise((resolveResult, rejectResult) => {
      const id = ++seq;
      const timer = setTimeout(() => { pending.delete(id); rejectResult(new Error(`${method} timed out`)); }, 5000);
      pending.set(id, { resolve: resolveResult, reject: rejectResult, timer });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

    const targets = await send('Target.getTargets');
    assert.equal(targets.targetInfos.some(info => info.targetId === foreignId), false);
    assert.equal(targets.targetInfos.some(info => info.title === 'Privileged Aux shell'), false);
    const allowedId = targets.targetInfos.find(info => info.title === 'Allowed native tab')?.targetId;
    assert.ok(allowedId);
    await assert.rejects(send('Target.attachToTarget', { targetId: foreignId, flatten: true }), /not an Aux tab/);
    await assert.rejects(send('Browser.close'), /not available through Aux/);
    const browserSession = (await send('Target.attachToBrowserTarget')).sessionId;
    const cookies = await send('Storage.getCookies', {}, browserSession);
    assert.ok(cookies.cookies.some(cookie => cookie.name === 'allowed'));
    assert.equal(cookies.cookies.some(cookie => cookie.name === 'foreign'), false);

    const pageSession = (await send('Target.attachToTarget', { targetId: allowedId, flatten: true })).sessionId;
    const evaluated = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true }, pageSession);
    assert.equal(evaluated.result.value, 'Allowed native tab');
    entries = [];
    changed();
    await assert.rejects(send('Runtime.evaluate', { expression: 'document.title' }, pageSession), /Unknown target session/);
    await assert.rejects(send('Target.attachToTarget', { targetId: allowedId, flatten: true }), /not an Aux tab/);
    socket.close();
    console.log('Internal broker denies foreign profile/shell targets and browser-wide commands; tab removal revokes its session.');
  } finally {
    await broker?.close();
    rootWindow.destroy();
    allowed.destroy();
    foreign.destroy();
  }
  app.exit(0);
}).catch(error => { console.error(error); app.exit(1); });
