import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import { importSourceEnvironment } from './lib/import-source-home.mjs';
import { modelFixtureEnvironment } from './lib/model-fixture-environment.mjs';
import { createStartupTrace } from './lib/startup-evidence.mjs';
const source = readFileSync(new URL('./lib/app.mjs', import.meta.url), 'utf8');
function fixture() {
  const root = '/private/tmp/aux-native-journey-Controlled', bundle = '/controlled/Aux.app', pair = {}, endpointLease = { dispose() { events.push('endpoint-retired'); } }, events = [];
  const state = { valid: true, endpointValid: true, preparations: 0, spawns: 0, released: 0, bound: false };
  const child = Object.assign(new EventEmitter(), { pid: 555, exitCode: null, signalCode: null, stderr: new EventEmitter(),
    kill(signal) { this.signalCode = signal; this.emit('close', null, signal); return true; } });
  let cleanupRelease, prepareRelease;
  const cleanup = new Promise(resolve => { cleanupRelease = resolve; });
  const heldPrepare = new Promise(resolve => { prepareRelease = resolve; });
  const endpoint = { endpoint: 'http://127.0.0.1:3210/v1', reservation: 'c'.repeat(64) };
  const descriptor = { port: 1234, token: 'controlled', pid: 777, instanceId: 'controlled', startedAt: 1, version: { schema: 2 } };
  const owner = { retainedDeadline: performance.now() + 150000, stdio: ['ignore', 'ignore', 'pipe', 'pipe', 4, 5, 6, 7, 8],
    bindOriginalChild(original) { assert.equal(original, child); state.bound = true; events.push('bind'); },
    get receipt() { return { originalBrowser: state.bound ? child.pid : null, guardian: { cleanupDebt: true } }; },
    async retireAfterOriginalClose() { assert.notEqual(child.signalCode, null); events.push('close-before-cleanup'); await cleanup; if (state.cleanupError) throw state.cleanupError; return { browser: { originalPid: child.pid }, guardian: { completed: true } }; } };
  const dir = filename => ({ dev: 1, ino: filename === root ? 1 : 2, uid: 100, mode: filename.endsWith('runtime.json') ? 0o100600 : 0o40700, isSymbolicLink: () => false, isDirectory: () => !filename.endsWith('runtime.json'), isFile: () => filename.endsWith('runtime.json') });
  const imports = {
    './disposable-model-credential-launch.mjs': { async prepareOriginalCredentialLaunch(options) { events.push('prepare'); state.preparations++; assert.equal(options.pair, pair); assert.equal(options.credentialEndpoint, endpointLease); if (state.holdPrepare) await heldPrepare; if (state.prepareError) throw state.prepareError; assert.equal(options.currentLaunch(), true); return owner; } },
    './fixture.mjs': { readDisposableModelCredentialEndpoint(lease) { assert.equal(lease, endpointLease); assert.ok(state.endpointValid); return endpoint; } },
    './packaged-runtime-pair-artifact.mjs': { readPackagedRuntimePair(brand) { assert.equal(brand, pair); assert.ok(state.valid); return { bundle, validate() { assert.ok(state.valid); } }; } },
    './import-source-home.mjs': { importSourceEnvironment, createImportSourceOwner() { return {}; } }, './model-fixture-environment.mjs': { modelFixtureEnvironment },
    'node:os': { homedir: () => '/controlled' }, 'node:path': path, 'node:crypto': crypto,
    'node:fs': { lstatSync: dir, mkdirSync() {}, mkdtempSync: () => root, realpathSync: name => name === '/tmp' ? '/private/tmp' : name,
      existsSync: name => !name.endsWith('_CodeSignature') && !name.endsWith('DevToolsActivePort') && !name.endsWith('browser.log'),
      readFileSync: name => name.endsWith('runtime.json') ? JSON.stringify(descriptor) : Buffer.from('source'), writeFileSync() {} },
    'node:child_process': { execFileSync(command) { assert.equal(command, '/usr/libexec/PlistBuddy'); return 'dev.aux.browser\n'; }, spawn(executable, args, options) { events.push('spawn'); state.spawns++; state.args = args; state.stdio = options.stdio; return child; } },
    'node:timers/promises': { setTimeout: async () => {} }, '../../../scripts/native-slot.mjs': { async acquireNativeSlot() { events.push('slot'); return { token: 'original', release() { state.released++; events.push('release'); } }; } },
    './dev-acceptance.mjs': { nativeProfileName: name => assert.equal(name, 'Default'), validateDisposableProfile() {} },
    './rpc.mjs': { validateDescriptor() {}, createRpc: () => async method => { assert.equal(method, 'workspace.get'); return { sessions: [{ sessionId: 'aux', status: 'connected' }] }; } },
    './startup-evidence.mjs': { createStartupTrace }, './ax.mjs': {}, './launch-services-appearance-owner.mjs': {}, './appearance-stream.mjs': {}, './performance-mailbox.mjs': {}, './private-window-stream.mjs': {}, './private-observation-owner.mjs': {},
  };
  const exports = {}, script = ts.transpileModule(source.replaceAll('import.meta.dirname', "'/controlled'"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(script, { exports, Buffer, URL, AbortSignal, structuredClone, performance, Date, process: { platform: 'darwin', getuid: () => 100, env: {} },
    async fetch(url) { return { ok: true, status: 200, json: async () => ({ service: 'aux-runtime', ready: true, nonce: new URL(url).searchParams.get('nonce'), ...descriptor, schema: 2 }) }; },
    require(name) { assert.ok(imports[name], `Unexpected source dependency ${name}`); return imports[name]; } });
  const create = overrides => exports.createJourneyApp({ appPath: bundle, credentialPair: pair, credentialEndpoint: endpointLease, launch: { args: ['--aux-native-appearance-observer'] }, ...overrides });
  return { app: create(), create, exports, pair, endpointLease, state, events, child, cleanupRelease, prepareRelease };
}
test('actual App prepares retained endpoint/guardian before original spawn and slot release follows original cleanup ACK', async () => {
  const f = fixture(); await f.app.start(); assert.deepEqual(f.events.slice(0, 4), ['slot', 'prepare', 'spawn', 'bind']);
  assert.equal(f.state.args.filter(arg => arg === '--aux-fixed-disposable-model-credential').length, 1); assert.equal(f.state.stdio.length, 9);
  const owned = f.exports.readDisposableCredentialApp(f.app, f.pair, f.endpointLease); assert.equal(owned.endpoint, 'http://127.0.0.1:3210/v1'); assert.equal(owned.pid, 555);
  const quitting = f.app.quit(); await Promise.resolve(); assert.equal(f.state.released, 0);
  f.cleanupRelease(); await quitting; assert.equal(f.state.released, 1); assert.equal(f.events.at(-1), 'release');
  await assert.rejects(f.app.restart(), /cannot restart/); assert.throws(() => f.exports.readDisposableCredentialApp(f.app, f.pair, f.endpointLease), /retired/);
});
test('fixed source refuses LS, private/foreign/raw opt-in and duplicate start before effects', async () => {
  const f = fixture(); await assert.rejects(f.app.start({ externalUrl: 'http://127.0.0.1:3210/' }), /one original/); assert.equal(f.state.spawns, 0);
  assert.throws(() => f.create({ profileRoot: '/foreign' }), /generated normal/);
  assert.throws(() => f.create({ credentialPair: {} }));
  assert.throws(() => f.create({ credentialPair: undefined, credentialEndpoint: undefined, launch: { args: ['--aux-fixed-disposable-model-credential'] } }), /Launch args/);
  f.state.holdPrepare = true; const first = f.app.start(); await Promise.resolve(); await Promise.resolve(); await assert.rejects(f.app.start(), /one original/);
  f.prepareRelease(); await first; f.cleanupRelease(); await f.app.quit(); assert.equal(f.state.spawns, 1);
});
test('lost preparation ACK and original cleanup failure retain slot with original rejection debt', async () => {
  for (const phase of ['prepare', 'cleanup']) {
    const f = fixture(), original = new Error('original retained failure');
    if (phase === 'prepare') { f.state.prepareError = original; await assert.rejects(f.app.start(), error => { assert.equal(error.cause, original); return true; }); assert.equal(f.state.spawns, 0); }
    else { await f.app.start(); f.state.cleanupError = original; f.cleanupRelease(); await assert.rejects(f.app.quit(), error => error === original); }
    assert.equal(f.state.released, 0);
  }
});
