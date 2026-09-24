// Two independently signed-in regular Aux Profiles on the same local site.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAux, launchApp, shellWindow } from './launch.mjs';
import { poll } from './poll.mjs';
import { sidebarAction } from './sidebar-action.mjs';

const dir = mkdtempSync(join(tmpdir(), 'aux-two-profiles-'));
const extension = join(dir, 'personal-extension');
mkdirSync(extension);
writeFileSync(join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3,
  name: 'Aux Profile isolation helper', version: '1.0', host_permissions: ['http://127.0.0.1/*'],
  content_scripts: [{ matches: ['http://127.0.0.1/*'], js: ['content.js'], run_at: 'document_end' }] }));
writeFileSync(join(extension, 'content.js'), "document.body.insertAdjacentHTML('beforeend','<aside id=aux-personal-extension>Personal only</aside>');");
const server = createServer((request, response) => {
  if (request.url?.startsWith('/login?account=')) {
    const account = new URL(request.url, 'http://localhost').searchParams.get('account');
    if (account !== 'alice' && account !== 'bob') { response.writeHead(400).end(); return; }
    response.setHeader('Set-Cookie', `session=${account}; HttpOnly; SameSite=Lax; Max-Age=3600; Path=/`);
    response.writeHead(204).end();
    return;
  }
  if (request.url === '/whoami') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ account: /(?:^|;\s*)session=(alice|bob)(?:;|$)/.exec(request.headers.cookie ?? '')?.[1] ?? null }));
    return;
  }
  response.setHeader('Content-Type', 'text/html');
  response.end('<!doctype html><title>Aux Profile account fixture</title><main>Profile account fixture</main>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const common = { PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_LOAD_DOTENV: '0' };
const firstEnv = { ...common, AUX_PROFILE_DIR: join(dir, 'browser'), AUX_DATA_DIR: join(dir, 'data') };
let first, second;
const launch = env => launchApp({ args: ['--use-mock-keychain'], env });
async function shell(app) {
  const page = await shellWindow(app, 15_000);
  await page.locator('.app').waitFor();
  return page;
}
async function open(app, shellPage) {
  const tab = await shellPage.evaluate(url => window.aux.invoke('pages.open', { url, activate: true }), `${base}/page`);
  await poll(shellPage, async id => (await window.aux.invoke('pages.list', {})).some(page => page.pageId === id && !page.loading), tab.pageId);
  const native = app.windows().find(page => page.url() === `${base}/page`);
  assert.ok(native, 'Aux must create a real native website view');
  return { tab, native };
}
async function account(native) { return native.evaluate(async () => (await fetch('/whoami')).json().then(value => value.account)); }
try {
  first = await launch(firstEnv);
  let firstShell = await shell(first);
  const work = await firstShell.evaluate(() => window.aux.createBrowserProfile('Work'));
  assert.ok(work.id && work.id !== 'default');
  const secondEnv = { ...common, AUX_PROFILE_CATALOG_DIR: join(firstEnv.AUX_DATA_DIR, 'browser-profiles'),
    AUX_BROWSER_PROFILE_ID: work.id,
    AUX_DATA_DIR: join(firstEnv.AUX_DATA_DIR, 'browser-profiles', work.id, 'runtime'),
    AUX_PROFILE_DIR: join(firstEnv.AUX_DATA_DIR, 'browser-profiles', work.id, 'browser') };
  second = await launch(secondEnv);
  let secondShell = await shell(second);
  await first.evaluate(({ dialog }, path) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [path] });
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
  }, extension);
  await sidebarAction(firstShell, 'Settings');
  const settings = firstShell.getByRole('region', { name: 'Settings', exact: true });
  await settings.getByRole('button', { name: 'Extensions', exact: true }).click();
  await settings.getByRole('button', { name: 'Install unpacked extension…', exact: true }).click();
  await settings.getByRole('article', { name: 'Aux Profile isolation helper', exact: true }).getByText('Enabled').waitFor();
  const original = await open(first, firstShell);
  const managed = await open(second, secondShell);
  await original.native.locator('#aux-personal-extension').waitFor({ state: 'attached' });
  assert.equal(await managed.native.locator('#aux-personal-extension').count(), 0, 'extension must not cross into Work Profile');
  await original.native.evaluate(async () => { await fetch('/login?account=alice'); localStorage.setItem('aux-profile-account', 'alice'); });
  await managed.native.evaluate(async () => { await fetch('/login?account=bob'); localStorage.setItem('aux-profile-account', 'bob'); });
  assert.equal(await account(original.native), 'alice');
  assert.equal(await account(managed.native), 'bob');
  assert.equal(await original.native.evaluate(() => localStorage.getItem('aux-profile-account')), 'alice');
  assert.equal(await managed.native.evaluate(() => localStorage.getItem('aux-profile-account')), 'bob');
  assert.deepEqual((await firstShell.evaluate(() => window.aux.browserProfiles())).map(profile => profile.name).sort(), ['Personal', 'Work']);
  assert.equal((await secondShell.evaluate(() => window.aux.browserProfiles())).find(profile => profile.current)?.name, 'Work');
  await assert.rejects(firstShell.evaluate(pageId => window.aux.invoke('pages.observe', { pageId }), managed.tab.pageId), /not found|unknown|unavailable|not attached/i);
  await assert.rejects(secondShell.evaluate(pageId => window.aux.invoke('pages.observe', { pageId }), original.tab.pageId), /not found|unknown|unavailable|not attached/i);

  await closeAux(first); first = undefined;
  await closeAux(second); second = undefined;
  first = await launch(firstEnv); firstShell = await shell(first);
  second = await launch(secondEnv); secondShell = await shell(second);
  const restoredOriginal = await open(first, firstShell);
  const restoredManaged = await open(second, secondShell);
  await restoredOriginal.native.locator('#aux-personal-extension').waitFor({ state: 'attached' });
  assert.equal(await restoredManaged.native.locator('#aux-personal-extension').count(), 0, 'managed extension isolation survives restart');
  assert.equal(await account(restoredOriginal.native), 'alice', 'original Profile account survives restart');
  assert.equal(await account(restoredManaged.native), 'bob', 'managed Profile account survives restart');
  assert.equal(await restoredOriginal.native.evaluate(() => localStorage.getItem('aux-profile-account')), 'alice');
  assert.equal(await restoredManaged.native.evaluate(() => localStorage.getItem('aux-profile-account')), 'bob');
  console.log('Two Aux regular Profiles retain distinct HttpOnly account cookies, site storage and managed extensions; agents cannot observe the other Profile tab.');
} finally {
  if (second) await closeAux(second).catch(() => {});
  if (first) await closeAux(first).catch(() => {});
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  rmSync(dir, { recursive: true, force: true });
}
