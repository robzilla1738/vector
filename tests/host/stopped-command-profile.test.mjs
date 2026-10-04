// Actual App ownership adapter, controlled process/filesystem only. No launch.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import { modelFixtureEnvironment } from './lib/model-fixture-environment.mjs';
import { importSourceEnvironment } from './lib/import-source-home.mjs';
function fixture({ supplied = false, holdClose = false } = {}) {
  const root = '/private/tmp/aux-native-journey-Controlled', state = { rootInode: 1, now: Date.now(), spawns: 0, slotHook() {} };
  const descriptor = { port: 1234, token: 'controlled', pid: 555, instanceId: 'controlled-instance', startedAt: 1, version: { schema: 2 } };
  const directory = filename => ({ dev: 1, ino: filename === root ? state.rootInode : 2, uid: 100, mode: 0o40700, isSymbolicLink: () => false, isDirectory: () => true });
  let child;
  const imports = {
    './import-source-home.mjs': { importSourceEnvironment, createImportSourceOwner() { return {}; } }, './model-fixture-environment.mjs': { modelFixtureEnvironment },
    'node:os': { homedir: () => '/controlled' }, 'node:path': path, 'node:crypto': crypto,
    'node:child_process': { execFileSync(command) { assert.equal(command, '/usr/libexec/PlistBuddy'); return 'dev.aux.browser\n'; }, spawn() {
      state.spawns++; child = new EventEmitter(); child.pid = 700; child.exitCode = null; child.signalCode = null; child.stderr = new EventEmitter();
      child.kill = signal => { child.exitCode = 0; child.signalCode = signal; child.emit('exit', 0, signal); if (!holdClose) child.emit('close', 0, signal); }; return child;
    } },
    'node:fs': { existsSync: name => !name.endsWith('_CodeSignature') && !name.endsWith('DevToolsActivePort'), realpathSync: name => name === '/tmp' ? '/private/tmp' : name,
      lstatSync: name => name.endsWith('runtime.json') ? { uid: 100, mode: 0o100600, isFile: () => true, isSymbolicLink: () => false } : directory(name),
      mkdirSync() {}, mkdtempSync: () => root, readFileSync: name => name.endsWith('runtime.json') ? JSON.stringify(descriptor) : Buffer.from('controlled source') },
    'node:timers/promises': { setTimeout: async () => {} }, '../../../scripts/native-slot.mjs': { acquireNativeSlot: async () => { state.slotHook(); return { token: 'controlled', release() {} }; } },
    './dev-acceptance.mjs': { nativeProfileName: name => assert.equal(name, 'Default'), validateDisposableProfile: name => assert.equal(name, root + '/profile') },
    './rpc.mjs': { validateDescriptor: value => value, createRpc: () => async () => ({ sessions: [{ sessionId: 'aux', status: 'connected' }] }) },
    './startup-evidence.mjs': { createStartupTrace: () => ({ record() {}, snapshot: () => ({}) }) },
    './performance-mailbox.mjs': { preparePerformanceMailbox() {} }, './ax.mjs': {}, './launch-services-appearance-owner.mjs': {}, './appearance-stream.mjs': {}, './packaged-runtime-pair-artifact.mjs': {}, './private-window-stream.mjs': {}, './private-observation-owner.mjs': {},
  };
  const exports = {}, source = ts.transpileModule(readFileSync(new URL('./lib/app.mjs', import.meta.url), 'utf8').replaceAll('import.meta.dirname', "'/controlled'"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, Buffer, URL, structuredClone, AbortSignal, Date: class extends Date { static now() { return state.now; } }, setTimeout, clearTimeout, process: { platform: 'darwin', getuid: () => 100, env: {} },
    require(name) { assert.ok(imports[name], name); return imports[name]; },
    async fetch(url) { return { ok: true, status: 200, json: async () => ({ service: 'aux-runtime', ready: true, nonce: new URL(url).searchParams.get('nonce'), pid: descriptor.pid, instanceId: descriptor.instanceId, startedAt: descriptor.startedAt, schema: 2 }) }; } });
  const app = exports.createJourneyApp({ appPath: '/controlled/Aux.app', launch: { args: ['--aux-native-performance-observer'] }, ...(supplied ? { profileRoot: root } : {}) });
  return { app, state, read: exports.readStoppedCommandProfile, close: () => child.emit('close', 0, 'SIGTERM') };
}
test('original generated stopped/reaped child mints opaque Profile lease with exact generation', async () => {
  const f = fixture(); assert.throws(() => f.app.claimStoppedCommandProfile()); await f.app.start(); assert.throws(() => f.app.claimStoppedCommandProfile());
  await f.app.quit(); const lease = f.app.claimStoppedCommandProfile(), row = f.read(lease);
  assert.equal(row.userDataDir, '/private/tmp/aux-native-journey-Controlled/profile'); assert.equal(row.originalChild.pid, 700); assert.equal(row.originalChild.closed, true); assert.equal(row.generation, 1);
  assert.throws(() => f.read({}), /Foreign/); assert.throws(() => f.app.claimStoppedCommandProfile('/foreign'));
});
test('process exit without original close/reap refuses even after quit', async () => {
  const f = fixture({ holdClose: true }); await f.app.start(); await f.app.quit(); assert.throws(() => f.app.claimStoppedCommandProfile(), /reaped/);
  f.close(); assert.equal(f.read(f.app.claimStoppedCommandProfile()).originalChild.closed, true);
});
test('supplied path cannot acquire generated Profile authority', async () => {
  const f = fixture({ supplied: true }); await f.app.start(); await f.app.quit(); assert.throws(() => f.app.claimStoppedCommandProfile(), /reaped/);
});
test('failed restart retires old lease before new slot/spawn and replacement tree refuses', async () => {
  const f = fixture(); await f.app.start(); await f.app.quit(); const lease = f.app.claimStoppedCommandProfile();
  f.state.rootInode = 9; assert.throws(() => f.read(lease), /replaced/); f.state.rootInode = 1;
  f.state.slotHook = () => { throw new Error('controlled original slot refusal'); };
  await assert.rejects(f.app.start(), /slot refusal/); assert.equal(f.state.spawns, 1); assert.throws(() => f.read(lease), /retired/);
});

test('actual original delayed close resolves retained wait without another child lookup', async () => {
  const f = fixture({ holdClose: true }); await f.app.start(); await f.app.quit();
  const waiting = f.app.waitForStoppedCommandProfile(); f.close();
  const lease = await waiting; assert.equal(f.read(lease).originalChild.closed, true);
});

test('original close wait refuses expired first-quit deadline without refreshing on repeated quit', async () => {
  const f = fixture({ holdClose: true }); await f.app.start(); await f.app.quit();
  f.state.now += 10000; await f.app.quit();
  await assert.rejects(f.app.waitForStoppedCommandProfile(), /unavailable/);
});
test('failed restart retires pending original close waiter without adopting late close', async () => {
  const f = fixture({ holdClose: true }); await f.app.start(); await f.app.quit();
  const waiting = f.app.waitForStoppedCommandProfile();
  f.state.slotHook = () => { throw new Error('original restart refusal'); };
  await assert.rejects(f.app.start(), /restart refusal/); f.close();
  await assert.rejects(waiting, /retired/);
});

test('late original quit cannot resurrect stopped capability after failed restart', async () => {
  const f = fixture(); await f.app.start();
  const originalQuit = f.app.quit();
  f.state.slotHook = () => { throw new Error('original concurrent restart refusal'); };
  await assert.rejects(f.app.start(), /concurrent restart refusal/);
  await originalQuit;
  assert.throws(() => f.app.claimStoppedCommandProfile(), /reaped/);
});
