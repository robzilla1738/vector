// Bounded acceptance for the real Aux renderer inside the isolated //chrome
// candidate. Run only after the Store proof and shell integration. DOM/bridge
// checks here do not replace a native-window visual and input inspection.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(import.meta.dirname, '../..');
const { chromium } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
const profile = process.env.AUX_CANDIDATE_PROFILE ?? join(root, 'release/test-artifacts/chromium-candidate-profile');
const shellPrefix = process.env.AUX_CANDIDATE_SHELL_URL ?? 'chrome://aux/';
const reportPath = join(root, 'release/test-artifacts/aux-candidate-shell-proof.json');
const steps = [];
const facts = { profile, shellPrefix, nativeWindowDetails: 'requires separate CUA inspection' };
let browser;
let server;

function record(name, passed, detail) {
  steps.push({ name, passed, detail });
  if (!passed) throw new Error(`${name}: ${detail}`);
}
async function port() {
  const file = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 40; i++) {
    if (existsSync(file)) {
      const value = Number(readFileSync(file, 'utf8').split('\n')[0]);
      if (value > 0) return value;
    }
    await delay(500);
  }
  throw new Error(`Running candidate profile has no DevToolsActivePort: ${file}`);
}
async function shellPage() {
  for (let i = 0; i < 40; i++) {
    const page = browser.contexts().flatMap(context => context.pages()).find(item => item.url().startsWith(shellPrefix));
    if (page) return page;
    await delay(500);
  }
  throw new Error(`No Aux shell page found at ${shellPrefix}; stock Chromium chrome is not Aux integration`);
}
async function waitForTarget(url) {
  for (let i = 0; i < 40; i++) {
    const page = browser.contexts().flatMap(context => context.pages()).find(item => item.url() === url);
    if (page) return page;
    await delay(500);
  }
  throw new Error(`No native page target for ${url}`);
}
async function waitForTargetGone(url) {
  for (let i = 0; i < 40; i++) {
    if (!browser.contexts().some(context => context.pages().some(page => page.url() === url))) return;
    await delay(500);
  }
  throw new Error(`Closed Aux tab left a native page target for ${url}`);
}

try {
  const endpoint = await port();
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${endpoint}`);
  const response = await fetch(`http://127.0.0.1:${endpoint}/json/version`, { signal: AbortSignal.timeout(2000) });
  facts.browser = (await response.json()).Browser;
  const shell = await shellPage();
  facts.shellUrl = shell.url();
  const bridge = await shell.evaluate(() => ({
    present: !!window.aux, mock: !!window.__auxMock,
    windowId: window.aux?.windowId,
    commands: typeof window.aux?.tabCommand,
    snapshot: typeof window.aux?.tabsSnapshot,
    runtime: typeof window.aux?.invoke,
    stage: typeof window.aux?.setStage,
    host: window.auxHostProof?.host,
  }));
  record('production Aux bridge', bridge.present && !bridge.mock && bridge.host === 'chromium-fork' &&
    bridge.commands === 'function' && bridge.snapshot === 'function' && bridge.runtime === 'function' && bridge.stage === 'function' && !!bridge.windowId,
    JSON.stringify(bridge));

  server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(`<!doctype html><title>Aux candidate ${request.url}</title><h1>Aux candidate ${request.url}</h1><button id="act">Act</button><script>document.querySelector('#act').onclick=()=>document.body.dataset.acted='yes'</script>`);
  });
  await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const baseline = await shell.evaluate(() => window.aux.tabsSnapshot());
  const aUrl = `${origin}/a`;
  const bUrl = `${origin}/b`;
  const a = await shell.evaluate(url => window.aux.tabCommand({ kind: 'open', url, activate: true }), aUrl);
  const b = await shell.evaluate(url => window.aux.tabCommand({ kind: 'open', url, activate: true }), bUrl);
  facts.tabA = a.pageId;
  facts.tabB = b.pageId;
  record('typed open acknowledgments', a.status === 'applied' && b.status === 'applied' && !!a.pageId && !!b.pageId && a.pageId !== b.pageId,
    JSON.stringify({ a, b }));
  await waitForTarget(aUrl);
  await waitForTarget(bUrl);
  const opened = await shell.evaluate(() => window.aux.tabsSnapshot());
  record('native tabs match one Aux catalog', opened.tabs.some(tab => tab.pageId === a.pageId && tab.url === aUrl) &&
    opened.tabs.some(tab => tab.pageId === b.pageId && tab.url === bUrl) && opened.version > baseline.version,
    JSON.stringify({ before: baseline.version, after: opened.version, matching: opened.tabs.filter(tab => [a.pageId, b.pageId].includes(tab.pageId)) }));

  await shell.evaluate(() => window.aux.invoke('settings.set', { tabLayout: 'horizontal' }));
  await shell.waitForSelector('.app.tabs-horizontal .horizontal-chrome', { timeout: 10000 });
  const horizontal = await shell.evaluate(() => ({ className: document.querySelector('.app')?.className,
    stage: document.querySelector('.stage-card')?.getBoundingClientRect().toJSON() }));
  record('current Aux horizontal native layout', !!horizontal.stage?.width &&
    horizontal.className?.includes('tabs-horizontal') && horizontal.className?.includes('native-host'), JSON.stringify(horizontal));

  await shell.evaluate(() => window.aux.invoke('settings.set', { tabLayout: 'vertical' }));
  await shell.waitForSelector('.app.tabs-vertical', { timeout: 10000 });
  const vertical = await shell.evaluate(() => ({ className: document.querySelector('.app')?.className,
    stage: document.querySelector('.stage-card')?.getBoundingClientRect().toJSON() }));
  record('current Aux vertical native layout', !!vertical.stage?.width &&
    vertical.className?.includes('tabs-vertical') && vertical.className?.includes('native-host'), JSON.stringify(vertical));

  const activate = await shell.evaluate(pageId => window.aux.tabCommand({ kind: 'activate', pageId }), a.pageId);
  const selected = await shell.evaluate(() => window.aux.tabsSnapshot());
  record('selection stays in Aux window', activate.status === 'applied' &&
    selected.windows.some(win => win.windowId === bridge.windowId && win.activePageId === a.pageId), JSON.stringify({ activate, windows: selected.windows }));

  const runtimePages = await shell.evaluate(() => window.aux.invoke('pages.list', {}));
  record('runtime sees the same target identities', Array.isArray(runtimePages) &&
    runtimePages.some(page => page.pageId === a.pageId) && runtimePages.some(page => page.pageId === b.pageId),
    JSON.stringify(runtimePages?.filter?.(page => [a.pageId, b.pageId].includes(page.pageId)) ?? runtimePages));

  const close = await shell.evaluate(pageId => window.aux.tabCommand({ kind: 'close', pageId }), b.pageId);
  const closed = await shell.evaluate(() => window.aux.tabsSnapshot());
  await waitForTargetGone(bUrl);
  record('close reconciles catalog and native target', close.status === 'applied' && !closed.tabs.some(tab => tab.pageId === b.pageId),
    JSON.stringify({ close, version: closed.version }));
  facts.stageBounds = { horizontal: horizontal.stage, vertical: vertical.stage };
} catch (error) {
  steps.push({ name: 'terminal failure', passed: false, detail: String(error) });
  process.exitCode = 1;
} finally {
  const report = { at: new Date().toISOString(), scope: 'Isolated Aux //chrome candidate shell and synthetic local pages; native window details, Store and signed accounts require separate evidence', ...facts, steps,
    passed: steps.length > 0 && steps.every(step => step.passed) };
  mkdirSync(join(root, 'release/test-artifacts'), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  await browser?.close();
  server?.closeAllConnections();
  if (server) await new Promise(resolveClose => server.close(resolveClose));
}
