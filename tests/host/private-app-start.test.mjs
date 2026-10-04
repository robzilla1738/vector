import { importSourceEnvironment } from './lib/import-source-home.mjs';
import { modelFixtureEnvironment } from './lib/model-fixture-environment.mjs';
// Actual App source against controlled original child/artifact/slot fixtures.
// No application, helper, native slot, credentials or OS launch is accessed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import { createStartupTrace } from './lib/startup-evidence.mjs';
import { createPrivateObservationOwner } from './lib/private-observation-owner.mjs';
const source = readFileSync(new URL('./lib/app.mjs', import.meta.url), 'utf8');
function fixture({ spawnThrows = false, noPid = false, debt = false, appearance = false } = {}) {
  const root = '/private/tmp/aux-native-journey-Controlled', bundle = '/controlled/Aux.app', brand = {};
  const state = { valid: true, validations: 0, slots: 0, releases: 0, spawns: 0, signals: [], beforeSlot: () => {} };
  const native = Object.freeze({ buildId: '195+' + 'b'.repeat(64) + '+' + 'a'.repeat(40), sourceCommit: 'a'.repeat(40), manifestHash: 'b'.repeat(64) });
  const pair = { bundle, native, productIdentity: { commit: 'a'.repeat(40), tree: 'a'.repeat(40), label: 'a'.repeat(40), dirty: false }, shellDigest: 'b'.repeat(64), artifact: Object.freeze({ retained: true }),
    validate() { state.validations++; assert.ok(state.valid, 'Original artifact replaced'); } };
  const child = Object.assign(new EventEmitter(), { pid: noPid ? undefined : 555, exitCode: null, signalCode: null, stderr: new EventEmitter(),
    kill(signal) { state.signals.push(signal); if (!debt) { this.signalCode = signal; this.emit('close', null, signal); } return true; } });
  let pendingResolve, pendingReject, now = 0, discoveryResolve;
  const discoveryReady = new Promise(resolve => { discoveryResolve = resolve; });
  const stream = { discover: () => new Promise((resolve, reject) => { pendingResolve = resolve; pendingReject = reject; discoveryResolve(); }),
    observe: () => stream.discover(), write() {}, dispose() { pendingReject?.(new Error('Original stream retired')); } };
  const directory = () => ({ uid: 100, mode: 0o40700, dev: 1, ino: 1, isSymbolicLink: () => false, isDirectory: () => true });
  const imports = {
    './fixture.mjs': {},
    './disposable-model-credential-launch.mjs': { prepareOriginalCredentialLaunch() { throw new Error('Original ordinary/private source fixture cannot prepare credentials'); } },
    './import-source-home.mjs': { importSourceEnvironment, createImportSourceOwner(filename) { assert.equal(filename, root + '/profile'); return Object.freeze({ fixtureOwned: true }); } },
    './model-fixture-environment.mjs': { modelFixtureEnvironment },
    './ax.mjs': { createAxClient() { throw new Error('Ordinary/private fixture must not create an appearance helper'); } },
    './launch-services-appearance-owner.mjs': { createLaunchServicesAppearanceOwner() { throw new Error('Ordinary/private fixture must not create an LS owner'); } },
    'node:os': { homedir: () => '/controlled' }, 'node:path': path, 'node:crypto': crypto,
    'node:child_process': { execFileSync(command) { if (command === '/usr/libexec/PlistBuddy') return 'dev.aux.browser\n'; assert.equal(command, 'git'); return 'c'.repeat(40); },
      spawn(executable, args, options) { state.env = options.env; state.spawns++; state.executable = executable; state.args = args; if (spawnThrows) throw new Error('Original spawn resource failure'); return child; } },
    'node:fs': { existsSync: filename => !filename.endsWith('_CodeSignature') && !filename.endsWith('DevToolsActivePort') && !filename.endsWith('browser.log'),
      mkdtempSync: () => root, realpathSync: filename => filename === '/tmp' ? '/private/tmp' : filename, lstatSync: directory, mkdirSync() {}, readFileSync: () => Buffer.from('controlled loaded source') },
    'node:timers/promises': { setTimeout: async () => { now += 2000; if (noPid && !state.closed) { state.closed = true; child.emit('error', new Error('Original spawn failed without PID')); child.emit('close', -2, null); } } },
    '../../../scripts/native-slot.mjs': { async quarantineLaunchServicesAppearanceSlot() { state.reservations = (state.reservations ?? 0) + 1; if (state.guardHold) return await state.guardHold; throw new Error('Original reservation refused before LS dispatch'); }, acquireNativeSlot: async () => { state.slots++; state.beforeSlot(); return { token: 'controlled', release() { state.releases++; } }; } },
    './dev-acceptance.mjs': { nativeProfileName: name => assert.equal(name, 'Default'), validateDisposableProfile: value => assert.equal(value, root + '/profile') },
    './rpc.mjs': { createRpc() { throw new Error('Private runtime RPC forbidden'); } },
    './appearance-stream.mjs': {}, './performance-mailbox.mjs': {}, './startup-evidence.mjs': { createStartupTrace },
    './packaged-runtime-pair-artifact.mjs': { readPackagedRuntimePairBytes(owner) { assert.equal(owner, brand); pair.validate(); return pair; }, readPackagedRuntimePair(owner) { assert.equal(owner, brand, 'Foreign artifact brand'); pair.validate(); return pair; } },
    './private-window-stream.mjs': { createPrivateWindowStream({ pid, candidate }) { assert.ok(Number.isInteger(pid), 'Missing original PID'); state.candidate = candidate; return stream; } },
    './private-observation-owner.mjs': { createPrivateObservationOwner },
  };
  const exports = {}, script = ts.transpileModule(source.replaceAll('import.meta.dirname', "'/controlled'"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  class ControlledDate extends Date { static now() { return now; } }
  vm.runInNewContext(script, { exports, Buffer, URL, structuredClone, Date: ControlledDate, process: { platform: 'darwin', getuid: () => 100, env: { NODE_OPTIONS: 'controlled injection', DYLD_INSERT_LIBRARIES: 'controlled loader', AUX_FIXTURE: 'foreign' } },
    require(name) { assert.ok(imports[name], `Unexpected dependency ${name}`); return imports[name]; } });
  const create = (owner = brand, launch = {}, profileRoot) => exports.createJourneyApp({ appPath: bundle, profileRoot, ...(appearance ? { appearancePair: owner } : { admittedPair: owner }), launch: appearance ? { ...launch, args: ['--aux-native-appearance-observer'] } : launch });
  const app = create();
  const complete = change => {
    const receipt = { native, runtimeStatus: 'inactive-private', window: { pid: child.pid, windowKind: 'private', windowId: 700 } };
    change?.(receipt); pendingResolve(receipt);
  };
  const ready = async () => { const pending = app.startPrivateObservation(); await Promise.race([discoveryReady, pending.then(() => { throw new Error('Unexpected readiness without original receipt'); })]); complete(); await pending; };
  return { app, create, ready, complete, child, state };
}
test('fixed original private launch admits an observed native private window without runtime handshake', async () => {
  const f = fixture(); await f.ready();
  assert.equal(f.state.executable, '/controlled/Aux.app/Contents/MacOS/Aux');
  assert.deepEqual(Object.fromEntries(Object.entries(f.state.env)), { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8', HOME: '/private/tmp/aux-native-journey-Controlled', TMPDIR: '/private/tmp/aux-native-journey-Controlled', AUX_NATIVE_SLOT_TOKEN: 'controlled' });
  assert.equal(f.state.args.filter(arg => arg === '--incognito').length, 1);
  assert.equal(f.state.args.filter(arg => arg === '--aux-native-appearance-observer').length, 1);
  assert.equal(f.state.args.some(arg => arg.startsWith('--remote-debugging')), false);
  assert.equal(f.app.privateObservation.windowId, 700); assert.equal(f.app.privateObservation.runtimeStatus, 'inactive-private');
  await assert.rejects(f.app.identity(), /no active runtime/); await assert.rejects(f.app.descriptor(), /no descriptor/);
  await assert.rejects(f.app.start(), /ordinary runtime/); await assert.rejects(f.app.restart(), /another launcher/);
  const receipt = await f.app.quit(); assert.equal(receipt.signal, 'SIGTERM'); assert.equal(f.state.releases, 1);
  assert.throws(() => f.app.privateObservation, /stopping/);
});
test('unbranded, selectable, retired and replaced-before-spawn admission refuses before effects', async () => {
  const f = fixture(); assert.throws(() => f.create({}), /Foreign artifact brand/);
  assert.throws(() => f.create(undefined, {}, '/private/tmp/aux-native-journey-Foreign'), /fixed admitted/);
  assert.throws(() => f.create(undefined, { env: { DYLD_INSERT_LIBRARIES: 'foreign' } }), /fixed admitted/);
  assert.equal(f.state.spawns, 0);
  assert.throws(() => f.create(undefined, { args: ['--incognito'] }), /fixed admitted/);
  await assert.rejects(f.app.startPrivateObservation({}), /zero-argument/);
  f.state.beforeSlot = () => { f.state.valid = false; };
  await assert.rejects(f.app.startPrivateObservation(), /Original artifact replaced/);
  assert.equal(f.state.spawns, 0); assert.equal(f.state.releases, 1);
});
test('actual synchronous spawn failure releases acquired original slot and preserves failure', async () => {
  const f = fixture({ spawnThrows: true }); await assert.rejects(f.app.startPrivateObservation(), /Original spawn resource failure/);
  assert.equal(f.state.slots, 1); assert.equal(f.state.releases, 1);
});
test('spawn without PID waits for original close; no browser PID signaling or helper fallback', async () => {
  const f = fixture({ noPid: true }); await assert.rejects(f.app.startPrivateObservation(), /Missing original PID/);
  assert.deepEqual(f.state.signals, []); assert.equal(f.state.closed, true); assert.equal(f.state.releases, 1);
});
test('close debt retains original slot and rejects cleanup without inventing success', async () => {
  const f = fixture({ debt: true }); await f.ready(); await assert.rejects(f.app.quit(), /slot and artifact retained/);
  assert.equal(f.state.releases, 0); assert.deepEqual(f.state.signals, ['SIGTERM', 'SIGKILL']);
  f.child.signalCode = 'SIGKILL'; f.child.emit('close', null, 'SIGKILL');
  assert.equal((await f.app.quit()).signal, 'SIGKILL'); assert.equal(f.state.releases, 1);
});

test('actual paired App aborts before LS/helper spawn when persistent reservation refuses', async () => {
  const f = fixture({ appearance: true });
  await assert.rejects(f.app.start({ externalUrl: 'http://127.0.0.1:3311/' }), /reservation refused before LS dispatch/);
  assert.equal(f.state.reservations, 1); assert.equal(f.state.spawns, 0);
  assert.equal(f.state.slots, 1); assert.equal(f.state.releases, 1);
});

test('actual paired App retires an awaited reservation on quit before any LS dispatch', async () => {
  const f = fixture({ appearance: true }); let resolve;
  f.state.guardHold = new Promise(done => { resolve = done; });
  const starting = f.app.start({ externalUrl: 'http://127.0.0.1:3311/' });
  while (!f.state.reservations) await Promise.resolve();
  await f.app.quit(); let retired = false;
  resolve({ retire() { retired = true; }, async clearAfterOriginalRetirement() { throw new Error('Unknown original generation cannot clear'); } });
  await assert.rejects(starting, /retired before dispatch/);
  assert.equal(retired, true); assert.equal(f.state.spawns, 0);
});
