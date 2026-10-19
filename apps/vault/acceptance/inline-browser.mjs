/** Disposable own-site trusted-input observation; no owner Chrome/profile/daemon. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import WebSocket from 'ws';

const directory = mkdtempSync(join(tmpdir(), 'aux-inline-fixture-'));
await build({
  entryPoints: [fileURLToPath(new URL('./inline-browser.ts', import.meta.url))],
  outfile: join(directory, 'fixture.js'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  logLevel: 'error',
});
const server = createServer((request, response) => {
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'none'; frame-src 'self'",
  );
  if (request.url === '/fixture.js') {
    response.setHeader('content-type', 'text/javascript');
    response.end(readFileSync(join(directory, 'fixture.js')));
    return;
  }
  response.setHeader('content-type', 'text/html');
  response.end(
    `<!doctype html><html><head><title>Aux disposable inline fixture</title><style>body{font:16px system-ui;margin:32px}form{width:350px;padding:12px}label{display:block;margin:10px}input{display:block;width:240px;height:30px}</style></head><body><form><label>Username<input id="username" autocomplete="username"></label><label>Password<input id="password" type="password" autocomplete="current-password"></label><input type="hidden" id="hidden-password" value="unchanged"><button>Submit fixture</button></form><form><label>Other form<input id="other-password" type="password" autocomplete="current-password"></label></form><script type="module" src="/fixture.js"></script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string')
  throw new Error('Fixture server unavailable');
const chrome = spawn(
  process.env.AUX_FIXTURE_CHROME ??
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  [
    `--user-data-dir=${join(directory, 'profile')}`,
    '--headless=new',
    '--remote-debugging-port=0',
    '--no-first-run',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--use-mock-keychain',
    '--window-size=900,800',
  ],
  { stdio: 'ignore' },
);
let socket;
try {
  const activePort = join(directory, 'profile/DevToolsActivePort');
  for (let n = 0; n < 100 && !existsSync(activePort); n++) await delay(100);
  if (!existsSync(activePort))
    throw new Error('Disposable Chrome did not start');
  const port = Number(readFileSync(activePort, 'utf8').split('\n')[0]);
  const page = await (
    await fetch(
      `http://127.0.0.1:${port}/json/new?${encodeURIComponent(`http://127.0.0.1:${address.port}/`)}`,
      { method: 'PUT' },
    )
  ).json();
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  let sequence = 0;
  const waiting = new Map();
  socket.on('message', (data) => {
    const value = JSON.parse(String(data)),
      pending = waiting.get(value.id);
    if (!pending) return;
    waiting.delete(value.id);
    clearTimeout(pending.timer);
    if (value.error) pending.reject(new Error(value.error.message));
    else pending.resolve(value.result);
  });
  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      waiting.set(id, {
        resolve,
        reject,
        timer: setTimeout(() => {
          waiting.delete(id);
          reject(new Error(`Fixture CDP deadline: ${method}`));
        }, 8000),
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', {
      expression,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error('Fixture evaluation failed');
    return result.result.value;
  }
  async function until(expression) {
    for (let n = 0; n < 80; n++) {
      if (await evaluate(expression)) return;
      await delay(50);
    }
    throw new Error(`Fixture condition timed out: ${expression}`);
  }
  async function node(predicate) {
    const { root } = await call('DOM.getDocument', { depth: -1, pierce: true });
    const nodes = [root];
    while (nodes.length) {
      const candidate = nodes.pop();
      if (predicate(candidate)) return candidate;
      nodes.push(
        ...(candidate.children ?? []),
        ...(candidate.shadowRoots ?? []),
      );
    }
    throw new Error('Fixture target node missing');
  }
  const attr = (node, name) => {
    const i = node.attributes?.indexOf(name) ?? -1;
    return i < 0 ? undefined : node.attributes[i + 1];
  };
  async function click(predicate) {
    const found = await node(predicate);
    const { model } = await call('DOM.getBoxModel', { nodeId: found.nodeId });
    const quad = model.content,
      x = (quad[0] + quad[4]) / 2,
      y = (quad[1] + quad[5]) / 2;
    await call('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
    await call('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
  }
  await until("document.documentElement.dataset.actorReady==='true'");
  await click((node) => attr(node, 'id') === 'password');
  await click((node) => attr(node, 'aria-haspopup') === 'dialog');
  await until('fixture.state.metadataReads===1');
  assert.equal(await evaluate('fixture.state.secretReads'), 0);
  assert.equal(await evaluate('fixture.genericTextOmitsSuggestions()'), true);
  assert.equal(
    await evaluate(
      "document.querySelector('aux-vault-controls').shadowRoot===null",
    ),
    true,
  );
  await click(
    (node) =>
      attr(node, 'class') === 'option' && !attr(node, 'data-unavailable'),
  );
  await until('fixture.filled()');
  assert.equal(await evaluate('fixture.unrelatedUntouched()'), true);
  assert.equal(await evaluate('fixture.state.submits'), 0);
  assert.equal(await evaluate('fixture.state.secretReads'), 1);
  // A DOM identity mutation after suggestions invalidates the saved form target.
  await evaluate(
    "document.querySelector('#password').value='';document.querySelector('#username').value=''",
  );
  await click((node) => attr(node, 'id') === 'password');
  await click((node) => attr(node, 'aria-haspopup') === 'dialog');
  await until('fixture.state.metadataReads===2');
  await evaluate(
    "document.querySelector('#password').name='changed-after-consent'",
  );
  await click(
    (node) =>
      attr(node, 'class') === 'option' && !attr(node, 'data-unavailable'),
  );
  await delay(150);
  assert.equal(await evaluate('fixture.filled()'), false);
  assert.equal(await evaluate('fixture.state.secretReads'), 1);
  assert.equal(await evaluate('fixture.state.submits'), 0);
  console.log(
    'PASS: trusted inline choice fills exact form, keeps secrets absent before choice, leaves other/hidden fields untouched, never submits, and rejects stale DOM. Synthetic profile/daemon only; no native runtime acceptance.',
  );
  await call('Browser.close').catch(() => undefined);
} finally {
  socket?.close();
  if (chrome.exitCode === null)
    await new Promise((resolve) => {
      chrome.once('exit', resolve);
      setTimeout(resolve, 3000);
    });
  await new Promise((resolve) => server.close(resolve));
  // Browser.close is sent only through our fresh profile CDP endpoint. No historical PID kill.
  if (chrome.exitCode !== null)
    rmSync(directory, { recursive: true, force: true });
}
