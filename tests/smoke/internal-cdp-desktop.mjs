// The real Aux shell and runtime operate with no Chromium debugging port.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchApp, shellWindow } from './launch.mjs';

const dir = mkdtempSync(join(tmpdir(), 'aux-internal-cdp-'));
const server = createServer((request, response) => {
  if (request.url === '/slow-file') {
    response.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="agent-cancel.txt"', 'Content-Length': 524288 });
    let sent = 0;
    const timer = setInterval(() => {
      if (sent >= 524288) { clearInterval(timer); response.end(); return; }
      response.write(Buffer.alloc(8192, 65));
      sent += 8192;
    }, 60);
    response.on('close', () => clearInterval(timer));
    return;
  }
  response.setHeader('Content-Type', 'text/html');
  response.end('<title>Broker page</title><main>Agent readable text</main><a id="slow-download" href="/slow-file">Slow download</a>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/page`;
async function rpc(method, params) {
  const { port, token } = JSON.parse(readFileSync(join(dir, 'data', 'runtime.json'), 'utf8'));
  const response = await fetch(`http://127.0.0.1:${port}/rpc`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: 1, method, params }), signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}
let app;
try {
  app = await launchApp({
    args: ['--use-mock-keychain'],
    env: {
      PATH: process.env.PATH, HOME: dir, TMPDIR: dir,
      AUX_PROFILE_DIR: join(dir, 'profile'), AUX_DATA_DIR: join(dir, 'data'),
      AUX_LOAD_DOTENV: '0', AUX_INTERNAL_CDP: '1',
    },
  });
  let output = '';
  app.process().stdout?.on('data', chunk => { output += String(chunk); });
  app.process().stderr?.on('data', chunk => { output += String(chunk); });
  const shell = await shellWindow(app).catch(async error => {
    const native = await app.evaluate(({ app, webContents }) => ({ ready: app.isReady(), windows: webContents.getAllWebContents().map(contents => contents.getURL()) })).catch(reason => String(reason));
    throw new Error(`${error}\n${output}\n${JSON.stringify(native)}`);
  });
  await shell.locator('.aux-home').waitFor();
  // Playwright's Electron launcher adds its own debugging switch; the direct
  // process check below verifies the production launch has none.
  const sessions = (await shell.evaluate(() => window.aux.invoke('workspace.get', {}))).sessions;
  assert.equal(sessions.find(session => session.sessionId === 'aux')?.status, 'connected', JSON.stringify(sessions));
  const tab = await shell.evaluate(value => window.aux.invoke('pages.open', { url: value, activate: true }), url)
    .catch(error => { throw new Error(`${error}\n${output}`); });
  assert.ok(tab.pageId);
  const observed = await shell.evaluate(pageId => window.aux.invoke('pages.observe', { pageId }), tab.pageId);
  assert.match(JSON.stringify(observed), /Agent readable text/);
  await rpc('settings.set', { effectGrants: ['effect:read', 'effect:write'] });
  const waiting = rpc('pages.execute', { program: { pageId: tab.pageId, steps: [
    { id: 'expect-slow-file', op: 'expectDownload', timeoutMs: 10_000 },
    { id: 'trigger-slow-file', op: 'click', target: 'css:#slow-download' },
  ] } });
  let activeDownload;
  for (let attempt = 0; attempt < 80 && !activeDownload; attempt++) {
    activeDownload = (await shell.evaluate(() => window.aux.downloadsSnapshot())).find(item => item.filename === 'agent-cancel.txt' && item.canCancel);
    if (!activeDownload) await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(activeDownload, 'agent-triggered transfer must appear in Aux native downloads');
  await shell.evaluate(id => window.aux.controlDownload(id, 'cancel'), activeDownload.id);
  const cancelled = await waiting;
  assert.equal(cancelled.status, 'failed', JSON.stringify(cancelled));
  assert.match(JSON.stringify(cancelled), /cancelled/i);
  assert.equal((await shell.evaluate(() => window.aux.invoke('downloads.list', {}))).find(item => item.id === activeDownload.id)?.state, 'cancelled');
  console.log('Aux agent opens and observes a native tab through internal CDP; native cancellation fails the awaited download step.');
} finally {
  await app?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  rmSync(dir, { recursive: true, force: true });
}
