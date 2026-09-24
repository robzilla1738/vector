// Direct Electron launch: Playwright's launcher adds a debugging switch and
// therefore cannot prove the distributed process has no raw Chromium port.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const desktopRequire = createRequire(join(root, 'apps/desktop/package.json'));
const electron = desktopRequire('electron');
const { WebSocket } = desktopRequire('ws');
const dir = mkdtempSync(join(tmpdir(), 'aux-internal-cdp-direct-'));
const profileDir = join(dir, 'profile');
const dataDir = join(dir, 'data');
mkdirSync(dataDir);
writeFileSync(join(dataDir, 'settings.json'), JSON.stringify({ effectGrants: ['effect:read', 'effect:write'] }));
const fixture = createServer((request, response) => {
  if (request.url === '/file') {
    response.setHeader('Content-Type', 'text/plain');
    response.setHeader('Content-Disposition', 'attachment; filename="broker-proof.txt"');
    response.end('Aux download through native session');
    return;
  }
  response.setHeader('Content-Type', 'text/html');
  response.end('<title>Direct broker test</title><main>Scoped agent observation</main><button id="act" onclick="document.querySelector(\'main\').textContent=\'Agent clicked and verified\'">Act</button><a id="download" href="/file">Download</a>');
});
await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
const targetUrl = `http://127.0.0.1:${fixture.address().port}/page`;
const app = spawn(electron, [join(root, 'apps/desktop'), '--use-mock-keychain'], {
  cwd: root,
  env: {
    ...process.env, ELECTRON_RUN_AS_NODE: undefined,
    HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: profileDir, AUX_DATA_DIR: dataDir,
    AUX_LOAD_DOTENV: '0', AUX_INTERNAL_CDP: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
app.stdout.on('data', chunk => { output += String(chunk); });
app.stderr.on('data', chunk => { output += String(chunk); });
const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
const runtimeFile = join(dataDir, 'runtime.json');
async function rpc(method, params = {}) {
  const { port, token } = JSON.parse(readFileSync(runtimeFile, 'utf8'));
  const response = await fetch(`http://127.0.0.1:${port}/rpc`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: 1, method, params }), signal: AbortSignal.timeout(10_000),
  });
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}
try {
  const deadline = Date.now() + 20_000;
  let workspace;
  while (Date.now() < deadline && !workspace) {
    if (app.exitCode !== null) throw new Error(`Electron exited early: ${output}`);
    if (existsSync(runtimeFile)) {
      workspace = await rpc('workspace.get').catch(() => null);
      if (workspace?.sessions?.find(session => session.sessionId === 'aux')?.status !== 'connected') workspace = null;
    }
    if (!workspace) await delay(100);
  }
  assert.ok(workspace, `Aux runtime did not connect through the broker: ${output}`);
  assert.equal(existsSync(join(profileDir, 'DevToolsActivePort')), false, 'raw Chromium debugging port must be absent');
  assert.equal(existsSync(join(dataDir, 'devtools-port')), false, 'legacy port file must be absent');

  const brokerPort = Number(output.match(/internal CDP broker listening (\d+)/)?.[1]);
  assert.ok(brokerPort > 0, `broker port not reported: ${output}`);
  const rejected = await new Promise(resolveReject => {
    const socket = new WebSocket(`ws://127.0.0.1:${brokerPort}/aux-cdp/invalid`);
    socket.once('open', () => { socket.close(); resolveReject(false); });
    socket.once('error', () => resolveReject(true));
    socket.once('unexpected-response', () => resolveReject(true));
  });
  assert.equal(rejected, true, 'unrelated local process must not connect without the runtime capability');

  const page = await rpc('pages.open', { url: targetUrl, activate: true });
  assert.ok(page.pageId);
  const second = await rpc('pages.open', { url: `${targetUrl}?second`, activate: true });
  assert.ok(second.pageId && second.pageId !== page.pageId);
  const observation = await rpc('pages.observe', { pageId: page.pageId });
  assert.match(JSON.stringify(observation), /Scoped agent observation/);
  const action = await rpc('pages.execute', {
    program: { pageId: page.pageId, steps: [{ id: 'click', op: 'click', target: 'css:#act', expect: [{ kind: 'textVisible', text: 'Agent clicked and verified' }] }] },
    returnObservation: { format: 'compact' },
  });
  assert.equal(action.status, 'completed', JSON.stringify(action));
  assert.match(JSON.stringify(action.observation), /Agent clicked and verified/);
  const download = await rpc('pages.execute', {
    program: { pageId: page.pageId, steps: [
      { id: 'wait-download', op: 'expectDownload' },
      { id: 'trigger-download', op: 'click', target: 'css:#download' },
    ] },
  });
  assert.equal(download.status, 'completed', JSON.stringify(download));
  let savedDownload;
  for (let attempt = 0; attempt < 30 && !savedDownload; attempt++) {
    savedDownload = (await rpc('downloads.list')).find(item => item.filename === 'broker-proof.txt' && item.state === 'completed');
    if (!savedDownload) await delay(100);
  }
  assert.ok(savedDownload?.path.startsWith(join(dataDir, 'downloads')), 'download remains in Aux native profile storage');
  assert.equal(readFileSync(savedDownload.path, 'utf8'), 'Aux download through native session');

  const firstRuntimePid = JSON.parse(readFileSync(runtimeFile, 'utf8')).pid;
  process.kill(firstRuntimePid, 'SIGTERM');
  let restarted;
  const restartDeadline = Date.now() + 25_000;
  while (Date.now() < restartDeadline && !restarted) {
    await delay(150);
    if (app.exitCode !== null) throw new Error(`Desktop exited during runtime restart: ${output}`);
    const current = JSON.parse(readFileSync(runtimeFile, 'utf8'));
    if (current.pid === firstRuntimePid) continue;
    const state = await rpc('workspace.get').catch(() => null);
    if (state?.sessions?.find(session => session.sessionId === 'aux')?.status === 'connected') restarted = state;
  }
  assert.ok(restarted, `Broker/runtime did not recover: ${output}`);
  assert.ok(restarted.pages.some(tab => tab.pageId === page.pageId), 'first tab survives runtime restart');
  assert.ok(restarted.pages.some(tab => tab.pageId === second.pageId), 'second tab survives runtime restart');
  const afterRestart = await rpc('pages.observe', { pageId: page.pageId });
  assert.match(JSON.stringify(afterRestart), /Agent clicked and verified/);
  assert.ok((output.match(/internal CDP broker listening/g) ?? []).length >= 2, 'runtime generation receives a fresh broker');
  console.log('Direct Aux launch: two tabs, agent click and download, raw port denial, invalid capability denial, and runtime reconnect pass.');
} finally {
  if (app.exitCode === null) {
    const exited = once(app, 'exit');
    app.kill('SIGTERM');
    const timeout = setTimeout(() => app.kill('SIGKILL'), 5000);
    try { await exited; } finally { clearTimeout(timeout); }
  }
  fixture.closeAllConnections();
  await new Promise(resolveClose => fixture.close(resolveClose));
  rmSync(dir, { recursive: true, force: true });
}
