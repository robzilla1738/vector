// Functional native-messaging transport probe, using only disposable HOME and extensions.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { closeAux, launchAux } from './launch.mjs';

const root = resolve(import.meta.dirname, '../..');
const { chromium } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
const candidateBinary = process.env.AUX_CANDIDATE_BIN;
if (candidateBinary) {
  assert.ok(existsSync(candidateBinary), `Aux candidate executable missing: ${candidateBinary}`);
  assert.match(realpathSync(candidateBinary), /\/out\/AuxProof\//, 'Use the isolated AuxProof build, not a reference browser');
}
const dir = mkdtempSync(join(tmpdir(), 'aux-native-message-'));
const extension = join(dir, 'extension');
mkdirSync(extension);
writeFileSync(join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3, name: 'Aux native host probe',
  version: '1.0', permissions: ['nativeMessaging'], background: { service_worker: 'worker.js' } }));
writeFileSync(join(extension, 'worker.js'), 'chrome.runtime.onInstalled.addListener(()=>{});');
writeFileSync(join(extension, 'probe.html'), '<title>Native messaging probe</title>');
const hostScript = join(dir, 'host.mjs');
writeFileSync(hostScript, `let bytes=Buffer.alloc(0);process.stdin.on('data',chunk=>{bytes=Buffer.concat([bytes,chunk]);if(bytes.length<4)return;const size=bytes.readUInt32LE(0);if(bytes.length<4+size)return;const request=JSON.parse(bytes.subarray(4,4+size).toString());const data=Buffer.from(JSON.stringify({nonce:request.nonce,origin:process.argv[2]}));const header=Buffer.alloc(4);header.writeUInt32LE(data.length);process.stdout.write(Buffer.concat([header,data]),()=>process.exit(0));});`);
const host = join(dir, 'host');
writeFileSync(host, `#!/bin/sh\nexec '${process.execPath}' '${hostScript}' "$@"\n`);
chmodSync(host, 0o755);
const hostName = `dev.aux.native_probe_${randomBytes(4).toString('hex')}`;
function register(id) {
  const manifest = { name: hostName, description: 'Aux disposable transport probe', path: host, type: 'stdio',
    allowed_origins: [`chrome-extension://${id}/`] };
  for (const browser of ['Google/ChromeForTesting', 'Google/Chrome', 'Chromium', 'Electron', 'Aux Browser']) {
    const directory = join(dir, 'Library/Application Support', browser, 'NativeMessagingHosts');
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, `${hostName}.json`), JSON.stringify(manifest));
  }
  // Chromium resolves its user-level host directory from --user-data-dir.
  for (const profile of ['chromium-profile', 'aux-profile']) {
    const directory = join(dir, profile, 'NativeMessagingHosts');
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, `${hostName}.json`), JSON.stringify(manifest));
  }
}
const send = `new Promise(resolve=>{const timer=setTimeout(()=>resolve({response:null,error:'Native host timed out'}),5000);try{chrome.runtime.sendNativeMessage('${hostName}',{nonce:'aux-fixture'},response=>{clearTimeout(timer);resolve({response,error:chrome.runtime.lastError?.message??null})});}catch(error){clearTimeout(timer);resolve({response:null,error:String(error)})}})`;
let aux, reference;
const results = {};
try {
 if (!candidateBinary) {
  ({ app: aux } = await launchAux({ args: ['--use-mock-keychain'], env: {
    PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, 'aux-profile'),
    AUX_DATA_DIR: join(dir, 'aux-data'), AUX_LOAD_DOTENV: '0' } }));
  const electronId = await aux.evaluate(async ({ session }, path) => {
    const profile = session.fromPartition('persist:aux-default');
    return (await profile.extensions.loadExtension(path)).id;
  }, extension);
  register(electronId);
  results.electron = await aux.evaluate(async ({ session, WebContentsView }, input) => {
    const profile = session.fromPartition('persist:aux-default');
    const view = new WebContentsView({ webPreferences: { session: profile, sandbox: true, contextIsolation: true, nodeIntegration: false } });
    try {
      await view.webContents.loadURL(`chrome-extension://${input.id}/probe.html`);
      const result = await view.webContents.executeJavaScript(input.send);
      return { extensionId: input.id, ...result };
    } finally { view.webContents.close(); profile.extensions.removeExtension(input.id); }
  }, { id: electronId, send });
 }
} catch (error) { results.electron = { error: String(error) }; }
try {
  reference = await chromium.launchPersistentContext(join(dir, 'chromium-profile'), { headless: false,
    ...(candidateBinary ? { executablePath: realpathSync(candidateBinary) } : {}),
    env: { PATH: process.env.PATH, HOME: dir, TMPDIR: dir },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--use-mock-keychain', '--password-store=basic'] });
  const worker = reference.serviceWorkers()[0] ?? await reference.waitForEvent('serviceworker');
  const id = new URL(worker.url()).host;
  register(id);
  const page = await reference.newPage();
  await page.goto(`chrome-extension://${id}/probe.html`);
  results[candidateBinary ? 'candidate' : 'chromiumReference'] = { extensionId: id, ...await page.evaluate(send) };
} catch (error) { results[candidateBinary ? 'candidate' : 'chromiumReference'] = { error: String(error) }; }
finally {
  await reference?.close();
  if (aux) await closeAux(aux).catch(() => {});
  writeFileSync(join(root, 'release/test-artifacts', candidateBinary ? 'aux-candidate-native-messaging.json' : 'aux-native-messaging-hosts.json'), `${JSON.stringify({ at: new Date().toISOString(), scope: candidateBinary ? 'Isolated Aux //chrome candidate executable and disposable synthetic native host; neither Store nor 1Password integration' : 'Disposable synthetic native host; neither Store nor 1Password integration', ...(candidateBinary ? { candidateBinary: realpathSync(candidateBinary) } : {}), ...results }, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
  rmSync(dir, { recursive: true, force: true });
  const installed = results[candidateBinary ? 'candidate' : 'chromiumReference'];
  assert.equal(installed?.response?.nonce, 'aux-fixture', `${candidateBinary ? 'Aux candidate' : 'Chromium reference'} must execute the native host`);
  assert.equal(installed.response.origin, `chrome-extension://${installed.extensionId}/`);
  assert.equal(installed.error, null);
}
