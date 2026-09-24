// Live Chrome Web Store proof for the isolated Aux //chrome candidate.
// This never loads an unpacked extension or treats a reference browser as Aux.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(import.meta.dirname, '../..');
const { chromium } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
const outputDir = join(root, 'release/test-artifacts');
const profile = process.env.AUX_CANDIDATE_PROFILE ?? join(outputDir, 'chromium-candidate-profile');
const binary = process.env.AUX_CANDIDATE_BIN;
const extensionId = process.env.AUX_STORE_EXTENSION_ID ?? 'ddkjiahejlhfcafbddmgiahcphecmpfh';
const storeUrl = process.env.AUX_STORE_URL ?? `https://chromewebstore.google.com/detail/ublock-origin-lite/${extensionId}`;
const statePath = join(outputDir, 'aux-candidate-store-state.json');
const reportPath = join(outputDir, 'aux-candidate-store-proof.json');
const action = process.argv[2];
mkdirSync(outputDir, { recursive: true });

function saveState(state) { writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`); }
function state() { return JSON.parse(readFileSync(statePath, 'utf8')); }
function extensionRecord() {
  const versionsDir = join(profile, 'Default', 'Extensions', extensionId);
  const versions = existsSync(versionsDir) ? readdirSync(versionsDir).filter(v => existsSync(join(versionsDir, v, 'manifest.json'))) : [];
  const preferencesPath = join(profile, 'Default', 'Preferences');
  const preferences = existsSync(preferencesPath) ? JSON.parse(readFileSync(preferencesPath, 'utf8')) : {};
  const setting = preferences.extensions?.settings?.[extensionId] ?? null;
  return { extensionId, versions, setting: setting && {
    state: setting.state, location: setting.location, from_webstore: setting.from_webstore,
    manifestVersion: setting.manifest?.version, updateUrl: setting.manifest?.update_url ?? null,
  } };
}
async function endpoint() {
  const portPath = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 120; i++) {
    if (existsSync(portPath)) {
      const port = Number(readFileSync(portPath, 'utf8').split('\n')[0]);
      if (port > 0) {
        try {
          const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1000) });
          if (response.ok) return { port, metadata: await response.json() };
        } catch { /* Browser may still be starting. */ }
      }
    }
    await delay(500);
  }
  throw new Error(`Candidate did not expose its local proof endpoint within 60 seconds: ${portPath}`);
}
async function connect() {
  const { port, metadata } = await endpoint();
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  return { browser, metadata };
}
async function launch() {
  assert.ok(binary && existsSync(binary), 'Set AUX_CANDIDATE_BIN to the built Aux //chrome executable');
  const prior = existsSync(statePath) ? state() : null;
  assert.ok(!prior || prior.profile === profile && prior.binary === binary,
    'Existing proof state points at a different profile or executable');
  if (prior) {
    try { process.kill(prior.pid, 0); throw new Error(`Candidate ${prior.pid} is still running; stop it before relaunch`); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
  }
  if (!prior) assert.equal(extensionRecord().versions.length, 0, 'Start the proof with an extension-free candidate profile');
  const child = spawn(binary, [
    `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run',
    '--no-default-browser-check', '--use-mock-keychain', '--password-store=basic',
  ], { detached: true, stdio: ['ignore', 'ignore', 'ignore'] });
  child.unref();
  const { browser, metadata } = await connect();
  try {
    const context = browser.contexts()[0];
    assert.ok(context, 'Candidate did not create a browser context');
    const page = context.pages()[0] ?? await context.newPage();
    let navigationError = null;
    try { await page.goto(storeUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
    catch (error) { navigationError = String(error); }
    const result = {
      at: new Date().toISOString(), phase: prior?.phase === 'installed' ? 'restarted' : 'opened-store',
      pid: child.pid, binary, profile, storeUrl, extensionId,
      browser: metadata.Browser, userAgent: metadata['User-Agent'],
      page: { url: page.url(), title: await page.title(), navigationError,
        addButtonCount: await page.getByRole('button', { name: /add to (chrome|chromium)/i }).count() },
    };
    saveState({ ...result, phase: result.phase });
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
}
async function inspect() {
  const prior = state();
  assert.equal(prior.profile, profile);
  assert.equal(prior.extensionId, extensionId);
  const { browser, metadata } = await connect();
  try {
    const record = extensionRecord();
    const workers = browser.contexts()[0]?.serviceWorkers().map(worker => worker.url()) ?? [];
    // MV3 workers may sleep. Installation and restart persistence are profile
    // facts; worker execution is a separate API test.
    const installed = record.versions.length > 0 && record.setting?.state === 1 &&
      record.setting?.from_webstore === true;
    const report = { at: new Date().toISOString(), scope: 'Aux //chrome candidate only; live Store install and persistent profile',
      binary, profile, storeUrl, browser: metadata.Browser, phase: prior.phase, installed,
      restartPersisted: installed && prior.phase === 'restarted',
      record, workers: workers.filter(url => url.startsWith(`chrome-extension://${extensionId}/`)) };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    if (installed) saveState({ ...prior, phase: 'installed', installedAt: report.at });
    console.log(JSON.stringify(report, null, 2));
    assert.ok(installed, 'No active Store-origin extension and worker found in the candidate');
  } finally { await browser.close(); }
}
async function stop() {
  const prior = state();
  assert.equal(prior.profile, profile);
  process.kill(prior.pid, 'SIGTERM');
  for (let i = 0; i < 60; i++) {
    try { process.kill(prior.pid, 0); } catch { console.log(`Stopped candidate ${prior.pid}`); return; }
    await delay(500);
  }
  throw new Error(`Candidate ${prior.pid} did not exit within 30 seconds`);
}

if (action === 'launch') await launch();
else if (action === 'inspect') await inspect();
else if (action === 'stop') await stop();
else throw new Error('Usage: node tests/host/candidate-store.mjs launch|inspect|stop');
