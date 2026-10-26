import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { auxFixedComputerUseFactory, auxComputerUseProcessState, auxComputerUseActorIdentity, auxAccountComputerUseProcess, auxCloseComputerUseProcesses } from '../../../../../../vendor/provided/aux-fixed-computer-use.mjs';

const source = readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs', 'utf8');
const guardStart = source.indexOf('function auxCreateProductivityAccountGuard(');
const guard = source.slice(guardStart, source.indexOf('async function auxRunProductivityRequest(', guardStart));

test('fixed actor keeps real account guard, bounded pipe protocol and native close lifetime', async () => {
  let account = { id: 7, mode: 'local', provider: 'anonymous', authStatus: 'active', createdAt: 11, incarnationId: 'original' }, epoch = 0;
  const profile = { profileId: 'profile-original', accountId: 7, profileIndex: 0, profilePath: '/disposable/Profile 0', updatedAt: 11 };
  const changes = new Set(), writes = [];
  let callback, kills = 0, completeClose;
  const closing = new Promise(resolve => { completeClose = resolve; });
  const binding = {};
  Object.defineProperties(binding, {
    supervisedTasksEnabled: { value: false },
    createAccountComputerUseProcess: { value(id, expected, cb) {
      assert.equal(id, 7); assert.deepEqual(JSON.parse(expected).profileBinding, profile);
      callback = cb;
      return Object.freeze({ write(bytes) { writes.push(Buffer.from(bytes)); return Promise.resolve(); }, endInput: () => Promise.resolve(), kill() { kills++; }, close: () => closing });
    } },
  });
  const context = { Buffer, AbortController, Error, require$2: createRequire(import.meta.url),
    process: { platform: 'darwin', _linkedBinding: () => binding },
    AccountRegistry: { getAccount: () => ({ ...account }), getAll: () => ({ profileAccountBindings: { [profile.profileId]: { ...profile } } }) },
    auxSelectedAccountIdentity: () => ({ account, profileBinding: profile }),
    auxBrokerBoundary: () => ({ assertOwner() {} }),
    init_accounts() {}, init_notify() {}, init_lifecycle() {},
    externalOwnerEpoch: () => epoch, isExternalOwnerSuspended: () => false,
    assertAccountInstance(current, expected) { if (current.createdAt !== expected) throw Error('account changed'); },
    onAccountAuthChange(fn) { changes.add(fn); return () => changes.delete(fn); },
  };
  const helpers = [auxFixedComputerUseFactory, auxComputerUseProcessState, auxComputerUseActorIdentity, auxAccountComputerUseProcess, auxCloseComputerUseProcesses].map(fn => fn.toString()).join('\n');
  const api = runInNewContext(guard + '\n' + helpers + '\n({capture:auxComputerUseActorIdentity,spawn:auxAccountComputerUseProcess,close:auxCloseComputerUseProcesses,state:auxComputerUseProcessState})', context);
  const child = api.spawn(api.capture({ id: 7, createdAt: 11 }));
  child.on('error', () => {});
  child.stdin.on('error', () => {});
  callback('spawn', 400);
  const command = { command: 'policy', excludedBundleIds: [], excludedDomains: [], captureTypedText: false, screenText: false };
  await new Promise((resolve, reject) => child.stdin.write(JSON.stringify(command) + '\n', error => error ? reject(error) : resolve()));
  assert.deepEqual(JSON.parse(writes[0]), command);
  account = { ...account, incarnationId: 'replacement' }; epoch++;
  for (const notify of changes) notify(7);
  assert.equal(kills, 1);
  await new Promise(resolve => child.stdin.write('{"command":"health"}\n', error => { assert.match(error.message, /changed/); resolve(); }));
  assert.equal(writes.length, 1);
  let settled = false;
  const ending = api.close().then(() => { settled = true; });
  callback('error', 'native close still pending');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  assert.equal(api.state().children.size, 1);
  callback('stdoutEnd'); callback('stderrEnd'); callback('close', { code: 0, signal: null });
  completeClose(); await ending;
  assert.equal(api.state().children.size, 0);
  assert.equal(changes.size, 0);
  assert.throws(() => api.spawn(api.capture({ id: 7, createdAt: 11 })), /closing/);
});
