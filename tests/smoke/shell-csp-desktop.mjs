// The packaged shell runs under a strict CSP. Launch the built app in an
// isolated profile, exercise the common surfaces, and fail on any refusal.
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { launchAux } from './launch.mjs';
const root = resolve(import.meta.dirname, '../..');
const dir = mkdtempSync(join(tmpdir(), 'aux-csp-'));
const out = join(root, 'release/test-artifacts'); mkdirSync(out, { recursive: true });
const server = createServer((_req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<title>CSP fixture</title><link rel="icon" href="data:,"><h1>Fixture</h1>'); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const refusals = [];
let app;
try {
  let page;({ app, page } = await launchAux({args:['--use-mock-keychain'],env: { PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, 'profile'), AUX_DATA_DIR: join(dir, 'data'), AUX_LOAD_DOTENV: '0' }}));
  page.on('console', m => { const t = m.text(); if (/Content Security Policy|Refused to/i.test(t)) refusals.push(t); });
  page.on('pageerror', e => refusals.push(`pageerror: ${e.message}`));
  await page.locator('.aux-home').waitFor();
  await page.evaluate(async url => { await window.aux.invoke('pages.open', { url, activate: true }); }, `${base}/one`);
  await page.keyboard.press('Meta+K');
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Meta+Shift+A');
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(out, 'aux-shell-csp.png') });
  const csp = await page.evaluate(() => document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') ?? '');
  assert.match(csp, /script-src 'self'/, 'packaged shell carries the CSP');
  assert.deepEqual(refusals, [], `CSP refusals: ${refusals.join('\n')}`);
  console.log('shell CSP: no refusals');
} finally {
  await app?.close().catch(() => {});
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
