// Disposable populated protected Profile; never reads a user's Profile or Keychain.
import { createHash, randomBytes } from 'node:crypto';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb, Repo, startRuntime } from '../../../apps/runtime/dist/index.js';
import { prepareProtectedDatabase } from '../../../apps/runtime/dist/store/protected-startup.js';

const root = mkdtempSync(join(tmpdir(), 'aux-populated-startup-'));
const profileId = 'disposable-populated-startup';
const secrets = new Map();
const secretName = kind => `${kind}_${createHash('sha256').update(profileId).digest('hex').slice(0, 24)}`;
const native = {
  async readSecret(name) { return { value: secrets.get(name) }; },
  async storeSecret(name, value) { secrets.set(name, value); return { ok: true }; },
  async profileStorageRoot() {
    const name = secretName('aux_root_v1');
    if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString('base64'));
    return { value: secrets.get(name) };
  },
  async profileStorageFactor() {
    const name = secretName('sqlite_factor_v1');
    if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString('base64'));
    return { value: secrets.get(name) };
  },
};
let runtime;
let db;
let socket;
let readyMs;
let connectBeforeReady = false;
let ready = false;
let releaseVersion;
const server = createServer(client => {
  socket = client;
  let buffer = '';
  const send = frame => client.write(JSON.stringify(frame) + '\n');
  client.on('data', chunk => {
    buffer += chunk;
    for (let end; (end = buffer.indexOf('\n')) >= 0;) {
      const frame = JSON.parse(buffer.slice(0, end));
      buffer = buffer.slice(end + 1);
      if (frame.kind === 'hello') send({ kind: 'hello-ack', protocol: frame.protocol, nonce: frame.nonce, generation: frame.generation });
      else if (frame.kind === 'note' && frame.type === 'runtime.ready') {
        ready = true;
        readyMs = performance.now() - bootStart;
      } else if (frame.kind === 'req') {
        const reply = result => send({ kind: 'res', id: frame.id, result });
        if (frame.method === 'native.readSecret') void native.readSecret(frame.params.name).then(reply);
        else if (frame.method === 'native.storeSecret') void native.storeSecret(frame.params.name, frame.params.value).then(reply);
        else if (frame.method === 'native.capabilities') reply({ buildId: 'synthetic-startup', sourceCommit: '0'.repeat(40), methods: [] });
        else if (frame.method === 'native.cdpVersion') {
          connectBeforeReady ||= !ready;
          releaseVersion = () => reply({ version: '154.0.0.0' });
          void observeHealth().then(releaseVersion);
        } else if (frame.method === 'native.cdpCatalog' || frame.method === 'native.listPages') reply({ pages: [] });
        else if (frame.method === 'native.cdpReset') reply({});
        else send({ kind: 'res', id: frame.id, error: { code: 'backend_unavailable', message: 'Synthetic fixture has no native surface' } });
      }
    }
  });
});
let bootStart;
let healthStatus;
async function observeHealth() {
  const descriptor = JSON.parse(readFileSync(join(root, 'copy', 'runtime.json'), 'utf8'));
  const health = await fetch(`http://127.0.0.1:${descriptor.port}/health`);
  healthStatus = health.status;
  await health.body?.cancel();
}
try {
  mkdirSync(join(root, 'source'));
  db = openDb(join(root, 'source', 'state.sqlite'));
  const cipher = await prepareProtectedDatabase(db, native, profileId);
  const repo = new Repo(db, cipher);
  db.exec('BEGIN');
  for (let i = 0; i < 10000; i++) {
    repo.saveModelCall({ callId: `model-${i}`, runId: 'fixture', role: 'agent', modelId: 'fixture-model',
      durationMs: 1, error: `Synthetic saved text ${i}`, createdAt: Date.now() });
    repo.setSetting(`fixture-${i}`, { value: `Synthetic saved setting ${i}` });
  }
  db.exec('COMMIT');
  db.close(); db = undefined;
  cpSync(join(root, 'source'), join(root, 'copy'), { recursive: true });
  const path = join(root, 'host.sock');
  await new Promise(resolve => server.listen(path, resolve));
  bootStart = performance.now();
  runtime = await startRuntime({ AUX_DATA_DIR: join(root, 'copy'), AUX_API_PORT: '0', AUX_LOAD_DOTENV: '0',
    AUX_HOST_SOCKET: path, AUX_HOST_TOKEN: 'a'.repeat(64), AUX_HOST_GENERATION: '1', AUX_BROWSER_PROFILE_ID: profileId });
  const result = { fixture: 'copy of synthetic populated protected Profile', modelCalls: 10000, settings: 10000,
    runtimeReadyMs: Math.round(readyMs * 100) / 100, healthStatusWhileDriverConnectPending: healthStatus,
    driverConnectedBeforeReady: connectBeforeReady, nativeBuildOrRealProfileUsed: false,
    passed: readyMs < 1000 && healthStatus === 200 && !connectBeforeReady };
  writeFileSync(new URL('./result.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  if (!result.passed) process.exitCode = 1;
} finally {
  releaseVersion?.();
  await runtime?.close();
  db?.close();
  socket?.destroy();
  await new Promise(resolve => server.close(resolve));
  rmSync(root, { recursive: true, force: true });
}
