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
  const compilerArtifact={}, helper={close:async()=>{events.push('helper-close');}};
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
    async retireAfterOriginalClose() { assert.notEqual(child.signalCode, null); events.push('close-before-cleanup'); await cleanup; if (state.cleanupError) throw state.cleanupError; return { browser: { originalPid: child.pid }, guardian: { completed: true, record: {status:'FINAL'}, close:{helperPid:666,code:0,signal:null,completed:true,cleanupDebt:false} } }; } };
  const dir = filename => ({ dev: 1, ino: filename === root ? 1 : 2, uid: 100, mode: filename.endsWith('runtime.json') ? 0o100600 : 0o40700, isSymbolicLink: () => false, isDirectory: () => !filename.endsWith('runtime.json'), isFile: () => filename.endsWith('runtime.json') });
  const imports = {
    './disposable-model-credential-launch.mjs': { async prepareOriginalCredentialLaunch(options) { events.push('prepare'); state.preparations++; assert.equal(options.pair, pair); assert.equal(options.credentialEndpoint, endpointLease); if (state.holdPrepare) await heldPrepare; if (state.prepareError) throw state.prepareError; assert.equal(options.currentLaunch(), true); return owner; } },
    './fixture.mjs': { readDisposableModelCredentialEndpoint(lease) { assert.equal(lease, endpointLease); assert.ok(state.endpointValid); return endpoint; } },
    './packaged-runtime-pair-artifact.mjs': { readPackagedRuntimePair(brand) { assert.equal(brand, pair); assert.ok(state.valid); return { bundle, compilerArtifact, validate() { assert.ok(state.valid); } }; } },
    './import-source-home.mjs': { importSourceEnvironment, createImportSourceOwner() { return {}; } }, './model-fixture-environment.mjs': { modelFixtureEnvironment },
    'node:os': { homedir: () => '/controlled' }, 'node:path': path, 'node:crypto': crypto,
    'node:fs': { lstatSync: dir, mkdirSync() {}, mkdtempSync: () => root, realpathSync: name => name === '/tmp' ? '/private/tmp' : name,
      existsSync: name => !name.endsWith('_CodeSignature') && !name.endsWith('DevToolsActivePort') && !name.endsWith('browser.log'),
      readFileSync: name => name.endsWith('runtime.json') ? JSON.stringify(descriptor) : Buffer.from('source'), writeFileSync() {} },
    'node:child_process': { execFileSync(command) { assert.equal(command, '/usr/libexec/PlistBuddy'); return 'dev.aux.browser\n'; }, spawn(executable, args, options) { events.push('spawn'); state.spawns++; state.args = args; state.stdio = options.stdio; return child; } },
    'node:timers/promises': { setTimeout: async () => {} }, '../../../scripts/native-slot.mjs': { async acquireNativeSlot() { events.push('slot'); return { token: 'original', release() { state.released++; events.push('release'); } }; } },
    './dev-acceptance.mjs': { nativeProfileName: name => assert.equal(name, 'Default'), validateDisposableProfile() {} },
    './rpc.mjs': { validateDescriptor() {}, createRpc: () => async method => { assert.equal(method, 'workspace.get'); return { sessions: [{ sessionId: 'aux', status: 'connected' }] }; } },
    './startup-evidence.mjs': { createStartupTrace }, './ax.mjs': {async createAxClient(pid,options){assert.equal(pid,555);assert.equal(options.compilerArtifact,compilerArtifact);if(state.helperHook)await state.helperHook();return helper;}}, './launch-services-appearance-owner.mjs': {}, './appearance-stream.mjs': {}, './performance-mailbox.mjs': {}, './private-window-stream.mjs': {}, './private-observation-owner.mjs': {},
  };
  const exports = {}, script = ts.transpileModule(source.replaceAll('import.meta.dirname', "'/controlled'"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(script, { exports, Buffer, URL, AbortSignal, structuredClone, performance, Date, process: { platform: 'darwin', getuid: () => 100, env: {} },
    async fetch(url) { return { ok: true, status: 200, json: async () => ({ service: 'aux-runtime', ready: true, nonce: new URL(url).searchParams.get('nonce'), ...descriptor, schema: 2 }) }; },
    require(name) { assert.ok(imports[name], `Unexpected source dependency ${name}`); return imports[name]; } });
  const create = overrides => exports.createJourneyApp({ appPath: bundle, credentialPair: pair, credentialEndpoint: endpointLease, launch: { args: ['--aux-native-appearance-observer'] }, ...overrides });
  return { app: create(), create, exports, pair, endpointLease, state, events, child, cleanupRelease, prepareRelease };
}
test('retirement reader requires actual original browser and guardian completion and remains read-only after disposal', async()=>{
 const f=fixture(); assert.throws(()=>f.exports.readOriginalDisposableCredentialRetirement(f.app,f.pair,f.endpointLease));
 await f.app.start();const quit=f.app.quit();await Promise.resolve();assert.throws(()=>f.exports.readOriginalDisposableCredentialRetirement(f.app,f.pair,f.endpointLease));
 f.cleanupRelease();await quit;f.state.endpointValid=false;
 const receipt=f.exports.readOriginalDisposableCredentialRetirement(f.app,f.pair,f.endpointLease);
 assert.equal(receipt.browser.originalPid,555);assert.equal(receipt.guardian.record.status,'FINAL');assert.equal(receipt.guardian.close.cleanupDebt,false);
 receipt.guardian.record.status='forged';assert.equal(f.exports.readOriginalDisposableCredentialRetirement(f.app,f.pair,f.endpointLease).guardian.record.status,'FINAL');
 assert.throws(()=>f.exports.readOriginalDisposableCredentialRetirement(f.app,{},f.endpointLease));assert.throws(()=>f.exports.readOriginalDisposableCredentialRetirement(f.app,f.pair,{}));
 assert.equal(f.state.spawns,1);assert.equal(f.state.released,1);
});
test('failed original guardian cleanup never becomes a retirement receipt',async()=>{
 const f=fixture();await f.app.start();const reason=new Error('original debt');f.state.cleanupError=reason;f.cleanupRelease();await assert.rejects(f.app.quit(),e=>e===reason);
 assert.throws(()=>f.exports.readOriginalDisposableCredentialRetirement(f.app,f.pair,f.endpointLease));assert.equal(f.state.released,0);
});
test('original credential pair creates only its admitted helper and closes it if the original endpoint retires during ACK',async()=>{
 const f=fixture();await f.app.start();const helper=await f.app.createAppearanceHelper();assert.ok(helper);
 f.state.helperHook=async()=>{f.state.endpointValid=false;};await assert.rejects(f.app.createAppearanceHelper());assert.ok(f.events.includes('helper-close'));
 f.state.endpointValid=true;f.cleanupRelease();await f.app.quit();
});
