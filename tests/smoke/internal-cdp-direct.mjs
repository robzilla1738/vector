// Direct Electron launch: Playwright's launcher adds a debugging switch and
// therefore cannot prove the distributed process has no raw Chromium port.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
let frameClicks = 0;
const fixture = createServer((request, response) => {
  if (request.url === '/posted' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => { body += String(chunk); });
    request.on('end', () => {
      response.setHeader('Content-Type', 'text/html');
      response.end(`<title>Aux POST popup</title><main>${body === 'proof=kept' ? 'Popup POST body kept' : 'Popup POST body lost'}</main>`);
    });
    return;
  }
  if (request.url === '/frame-click') { frameClicks++; response.writeHead(204).end(); return; }
  if (request.url === '/frame-child') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<title>Cross-site child</title><button id="frame-act" onclick="this.textContent=\'Frame clicked\';fetch(\'/frame-click\')">Act inside frame</button>');
    return;
  }
  if (request.url === '/frame-parent') {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<title>Frame parent</title><iframe id="remote" src="http://localhost:${fixture.address().port}/frame-child"></iframe>`);
    return;
  }
  if (request.url === '/popup') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<title>Aux popup proof</title><main id="opener-state"></main><script>document.querySelector("#opener-state").textContent = window.opener && window.opener.location.pathname === "/page" ? "Popup kept its opener" : "Popup lost its opener"</script><button id="popup-act" onclick="this.textContent=\'Popup clicked\'">Click popup</button>');
    return;
  }
  if (request.url === '/background') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<title>Aux background proof</title><main>Background tab loaded</main>');
    return;
  }
  if (request.url === '/private-secret') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<title>Private process secret</title><main>Private only page</main>');
    return;
  }
  if (request.url === '/file') {
    response.setHeader('Content-Type', 'text/plain');
    response.setHeader('Content-Disposition', 'attachment; filename="broker-proof.txt"');
    response.end('Aux download through native session');
    return;
  }
  response.setHeader('Content-Type', 'text/html');
  response.end('<title>Direct broker test</title><main>Scoped agent observation</main><button id="act" onclick="document.querySelector(\'main\').textContent=\'Agent clicked and verified\'">Act</button><button id="open-popup" onclick="window.open(\'/popup\',\'aux-popup\',\'width=500,height=400\')">Open popup</button><form method="post" action="/posted" target="aux-post"><input type="hidden" name="proof" value="kept"><button id="post-popup">POST popup</button></form><a id="background" href="/background">Background tab</a><a id="download" href="/file">Download</a>');
});
await new Promise(resolve => fixture.listen(0, resolve));
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
let privateApp;
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

  const privateReportPath = join(dir, 'private-report.json');
  privateApp = spawn(electron, [join(root, 'apps/desktop'), '--aux-private'], {
    cwd: root,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: undefined, HOME: dir, TMPDIR: dir,
      AUX_PROFILE_DIR: profileDir, AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: '0', AUX_INTERNAL_CDP: '1',
      AUX_PRIVATE_TEST_REPORT: privateReportPath, AUX_PRIVATE_TEST_INITIAL_URL: `http://127.0.0.1:${fixture.address().port}/private-secret` },
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  });
  for (let attempt = 0; attempt < 100 && !existsSync(privateReportPath); attempt++) {
    if (privateApp.exitCode !== null) throw new Error('Private process exited before its isolation report');
    await delay(100);
  }
  assert.ok(existsSync(privateReportPath), 'private process should boot alongside the broker');
  const privateReport = JSON.parse(readFileSync(privateReportPath, 'utf8'));
  assert.equal(privateReport.remoteDebugging, false, 'private process cannot inherit a raw Chromium endpoint');
  assert.equal(privateReport.pageSessionPersistent, false, 'private page session must be transient');
  assert.equal(existsSync(join(privateReport.userData, 'DevToolsActivePort')), false);
  assert.equal((await rpc('workspace.get')).pages.some(item => item.url.endsWith('/private-secret')), false, 'regular runtime cannot discover a private page');

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
  const downloadFolder = join(dataDir, 'downloads');
  renameSync(downloadFolder, `${downloadFolder}-saved`);
  writeFileSync(downloadFolder, 'unavailable destination');
  let brokenDownload;
  try {
    brokenDownload = await rpc('pages.execute', {
      program: { pageId: page.pageId, steps: [
        { id: 'wait-broken', op: 'expectDownload', timeoutMs: 5000 },
        { id: 'trigger-broken', op: 'click', target: 'css:#download' },
      ] },
    });
  } finally {
    rmSync(downloadFolder);
    renameSync(`${downloadFolder}-saved`, downloadFolder);
  }
  assert.equal(brokenDownload.status, 'failed', JSON.stringify(brokenDownload));
  const transferStates = await rpc('downloads.list');
  assert.match(JSON.stringify({ brokenDownload, transferStates }), /interrupted|cancelled/i);
  assert.ok(transferStates.some(item => item.filename === 'broker-proof.txt' && item.state === 'interrupted'), JSON.stringify(transferStates));

  const popupAction = await rpc('pages.execute', { program: { pageId: page.pageId, steps: [{ id: 'open-popup', op: 'click', target: 'css:#open-popup' }] } });
  assert.equal(popupAction.status, 'completed', JSON.stringify(popupAction));
  let popup;
  for (let attempt = 0; attempt < 40 && !popup; attempt++) {
    popup = (await rpc('workspace.get')).pages.find(item => item.url.endsWith('/popup'));
    if (!popup) await delay(100);
  }
  assert.ok(popup?.pageId, 'native popup should register as an Aux page');
  const popupObservation = await rpc('pages.observe', { pageId: popup.pageId });
  assert.match(JSON.stringify(popupObservation), /Popup kept its opener/);
  const popupClick = await rpc('pages.execute', { program: { pageId: popup.pageId, steps: [{ id: 'popup-click', op: 'click', target: 'css:#popup-act' }] } });
  assert.equal(popupClick.status, 'completed', JSON.stringify(popupClick));
  assert.match(JSON.stringify(await rpc('pages.observe', { pageId: popup.pageId })), /Popup clicked/);

  const postAction = await rpc('pages.execute', { program: { pageId: page.pageId, steps: [{ id: 'post-popup', op: 'click', target: 'css:#post-popup' }] } });
  assert.equal(postAction.status, 'completed', JSON.stringify(postAction));
  let postPopup;
  for (let attempt = 0; attempt < 40 && !postPopup; attempt++) {
    postPopup = (await rpc('workspace.get')).pages.find(item => item.url.endsWith('/posted'));
    if (!postPopup) await delay(100);
  }
  assert.ok(postPopup?.pageId, 'POST popup should register as an Aux page');
  assert.match(JSON.stringify(await rpc('pages.observe', { pageId: postPopup.pageId })), /Popup POST body kept/);

  await rpc('pages.activate', { pageId: page.pageId });
  const backgroundAction = await rpc('pages.execute', { program: { pageId: page.pageId, steps: [{ id: 'background-tab', op: 'click', target: 'css:#background', button: 'middle' }] } });
  assert.equal(backgroundAction.status, 'completed', JSON.stringify(backgroundAction));
  let background;
  for (let attempt = 0; attempt < 40 && !background; attempt++) {
    background = (await rpc('workspace.get')).pages.find(item => item.url.endsWith('/background'));
    if (!background) await delay(100);
  }
  assert.ok(background?.pageId, 'middle click should register a background Aux tab');
  assert.match(JSON.stringify(await rpc('pages.observe', { pageId: background.pageId })), /Background tab loaded/);
  assert.equal((await rpc('workspace.get')).activePageId, page.pageId, 'middle click should leave the opener active');

  const framePage = await rpc('pages.open', { url: `http://127.0.0.1:${fixture.address().port}/frame-parent`, activate: true });
  let frameOverview;
  for (let attempt = 0; attempt < 30; attempt++) {
    frameOverview = await rpc('pages.observe', { pageId: framePage.pageId });
    if (frameOverview.content.frames.some(frame => frame.url.includes('/frame-child') && !frame.sameOrigin)) break;
    await delay(100);
  }
  assert.ok(frameOverview.content.frames.some(frame => frame.url.includes('/frame-child') && !frame.sameOrigin), JSON.stringify(frameOverview.content));
  assert.equal(frameOverview.content.elements.some(element => element.name?.includes('Act inside frame')), false, 'default observation skips cross-site content');
  const frameObservation = await rpc('pages.observe', { pageId: framePage.pageId, scope: 'subtree', subtreeRef: 'css:#remote' });
  const frameButton = frameObservation.content.elements.find(element => element.name?.includes('Act inside frame'));
  assert.ok(frameButton?.ref, JSON.stringify(frameObservation));
  const frameAction = await rpc('pages.execute', { program: { pageId: framePage.pageId, steps: [{ id: 'frame-click', op: 'click', target: frameButton.ref }] } });
  assert.equal(frameAction.status, 'completed', JSON.stringify(frameAction));
  const afterFrameClick = await rpc('pages.observe', { pageId: framePage.pageId, scope: 'subtree', subtreeRef: 'css:#remote' });
  assert.ok(afterFrameClick.content.elements.some(element => element.name?.includes('Frame clicked')), JSON.stringify({ frameAction, afterFrameClick, frameClicks }));
  for (let attempt = 0; attempt < 30 && !frameClicks; attempt++) await delay(100);
  assert.equal(frameClicks, 1, 'explicitly selected cross-site frame action reached its own origin');

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
  assert.ok(restarted.pages.some(tab => tab.pageId === framePage.pageId), 'cross-site frame tab survives runtime restart');
  assert.ok(restarted.pages.some(tab => tab.pageId === popup.pageId), 'native popup survives runtime restart');
  assert.ok(restarted.pages.some(tab => tab.pageId === postPopup.pageId), 'POST popup survives runtime restart');
  assert.ok(restarted.pages.some(tab => tab.pageId === background.pageId), 'background tab survives runtime restart');
  assert.equal(restarted.pages.some(tab => tab.url.endsWith('/private-secret')), false, 'private page stays outside runtime after reconnect');
  const afterRestart = await rpc('pages.observe', { pageId: page.pageId });
  assert.match(JSON.stringify(afterRestart), /Agent clicked and verified/);
  assert.ok((output.match(/internal CDP broker listening/g) ?? []).length >= 2, 'runtime generation receives a fresh broker');
  assert.equal((await rpc('pages.close', { pageId: popup.pageId })).ok, true, 'agent can close a native popup');
  assert.equal((await rpc('workspace.get')).pages.some(tab => tab.pageId === popup.pageId), false, 'closed popup leaves the runtime catalog');
  assert.equal((await rpc('pages.close', { pageId: postPopup.pageId })).ok, true, 'agent can close a POST popup');
  const privateControl = action => new Promise((resolveControl, rejectControl) => {
    const requestId = `direct:${action}`;
    const timer = setTimeout(() => rejectControl(new Error(`Private ${action} timed out`)), 5000);
    const onMessage = message => {
      if (message?.type !== 'aux-private-control-result' || message.requestId !== requestId) return;
      clearTimeout(timer);
      privateApp.off('message', onMessage);
      resolveControl(message.ok);
    };
    privateApp.on('message', onMessage);
    privateApp.send({ type: 'aux-private-control', requestId, action }, error => { if (error) { clearTimeout(timer); privateApp.off('message', onMessage); rejectControl(error); } });
  });
  assert.equal(await privateControl('prepare'), true);
  assert.equal(await privateControl('validate'), true);
  const privateExited = once(privateApp, 'exit');
  assert.equal(await privateControl('commit'), true);
  await privateExited;
  assert.equal(existsSync(privateReport.userData), false, 'private scratch profile is removed at clean exit');
  console.log('Direct Aux launch: agent click, popup including POST, background tab, completed and interrupted downloads, cross-site frame action, isolated private process, raw port denial, and runtime reconnect pass.');
} finally {
  if (privateApp?.exitCode === null) privateApp.kill('SIGTERM');
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
