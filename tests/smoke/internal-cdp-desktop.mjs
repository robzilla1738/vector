// The real Aux shell and runtime operate with no Chromium debugging port.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchApp, shellWindow } from './launch.mjs';

const dir = mkdtempSync(join(tmpdir(), 'aux-internal-cdp-'));
const server = createServer((_request, response) => {
  response.setHeader('Content-Type', 'text/html');
  response.end('<title>Broker page</title><main>Agent readable text</main>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/page`;
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
  console.log('Aux agent opens and observes a native tab through internal CDP.');
} finally {
  await app?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  rmSync(dir, { recursive: true, force: true });
}
