// Actual owner implementation with controlled byte/compilation admission seams.
// No native process, helper, launch, capture or artifact admission occurs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, mkdtempSync, mkdirSync, chmodSync, writeFileSync, appendFileSync, statSync, rmSync } from 'node:fs';
import { generateKeyPairSync, createHash, sign } from 'node:crypto';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createAppearanceFileReader } from './lib/appearance-file-reader.mjs';
import { verifyAppearanceFileRecord } from './lib/appearance-file-records.mjs';
import { decodeWarmWindowHelperIdentity } from './lib/native-warm-helper-identity.mjs';
import { normalizeNativeAppearance } from './lib/appearance-provenance.mjs';
const proofSource = readFileSync(new URL('./lib/appearance-file-proof.mjs', import.meta.url), 'utf8');
const source = readFileSync(new URL('./lib/launch-services-appearance-owner.mjs', import.meta.url), 'utf8');
function fixture(t) {
  const root = mkdtempSync('/tmp/aux-ls-owner-control-'); chmodSync(root, 0o700); mkdirSync(join(root, 'profile'), { mode: 0o700 });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const file = join(root, 'native-appearance-channel.jsonl'); writeFileSync(file, '', { mode: 0o600 });
  const pin = path => { const s = statSync(path, { bigint: true }); return [s.dev.toString(), s.ino.toString()]; };
  const [rootDevice, rootInode] = pin(root), [profileDevice, profileInode] = pin(join(root, 'profile')), [fileDevice, fileInode] = pin(file);
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const product = { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false };
  const native = { buildId: 'controlled', sourceCommit: product.commit, manifestHash: 'c'.repeat(64) };
  const candidate = { productIdentity: product, native, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
  const header = { producer: 'aux-native-appearance-file-channel', version: 1, pid: 42, processUuid: 'a'.repeat(32), processStartMachTicks: '9', buildId: native.buildId, sourceCommit: native.sourceCommit, nonce: 'b'.repeat(32), basename: 'native-appearance-channel.jsonl', rootDevice, rootInode, profileName: 'Default', profileDevice, profileInode, fileDevice, fileInode, publicKeySpkiHex: publicKey.export({ type: 'spki', format: 'der' }).toString('hex') };
  const bytes = Buffer.from(JSON.stringify(header) + '\n'); writeFileSync(file, bytes);
  const receipt = { ...header, headerSha256: createHash('sha256').update(bytes).digest('hex') };
  const kernel = { producer: 'aux-native-warm-window-identity', version: 1, targetPid: 42, helperPid: 43, targetProcessUuid: header.processUuid, targetProcessStartMachTicks: '9', helperProcessUuid: 'c'.repeat(32), helperProcessStartMachTicks: '10' };
  const state = { live: true, runtime: product, calls: 0, append: false, kernel, hold: null };
  const raw = () => JSON.stringify({ producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7, windowKind: 'little', frame: { x: 0, y: 0, width: 960, height: 720 }, observedAtUnixMs: Date.now(), nativeTheme: 'dark', backing: null, material: null, shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false }, utilityOwnership: { producer: 'aux-native-utility-appearance-owner', version: 1, windowId: 7, browserWindowId: '12', windowKind: 'little', shellDocumentToken: 'A'.repeat(32), pages: [{ pageId: 'p_fixture', documentToken: 'B'.repeat(32), selected: true }] } });
  const publish = () => { const payload = JSON.stringify({ producer: 'aux-native-appearance-file-record', version: 1, nonce: header.nonce, sequence: 1, raw: raw() }); appendFileSync(file, JSON.stringify({ payload, signatureHex: sign(null, Buffer.from(`AUX_NATIVE_APPEARANCE_FILE_V1\n${payload}`), privateKey).toString('hex') }) + '\n'); };
  const pair = {}, artifact = { productIdentity: product, native, shellDigest: candidate.shellDigest, image: { imageUuid: header.processUuid }, helper: { manifest: { output: { uuid: kernel.helperProcessUuid } } }, validate() { assert.ok(state.live, 'Byte lease retired'); } };
  const compilerArtifact = { artifact: { binarySha256: '1'.repeat(64), sourceSha256: '2'.repeat(64), imageUuid: kernel.helperProcessUuid }, executablePath: '/controlled/helper', validate: artifact.validate };
  const api = {};
  vm.runInNewContext(source.replace(/^import .*;\n/gm, '').replace('export async function', 'api.create = async function'), {
    api, assert, delay, structuredClone, performance, Date,
    createAppearanceFileReader, normalizeNativeAppearance,
    readPackagedRuntimePairBytes: value => { assert.equal(value, pair); artifact.validate(); return artifact; },
    readPackagedRuntimePair: value => { assert.equal(value, pair); return { compilerArtifact }; },
    readNativeWindowCompilerExecutable: (value, path) => { assert.equal(value, compilerArtifact); assert.equal(path, '/controlled/native-window.swift'); compilerArtifact.validate(); return compilerArtifact.executablePath; },
  });
  const original = { pid: 42, generation: 123, root, assertLive() { assert.ok(state.live, 'Owner retired'); }, async readIdentity() {
    ++state.calls; if (state.hold) await state.hold;
    if (state.append && state.calls === 8) publish();
    return { native: { ...native, nativeAppearanceFileChannel: receipt }, runtime: state.runtime };
  } };
  const helper = { helperPid: 43, helperSource: '/controlled/native-window.swift', helperExecutable: '/controlled/helper', async request(name) { assert.equal(name, 'warmWindowIdentity'); return state.kernel; } };
  const proofApi = {};
  vm.runInNewContext(proofSource.replace(/^import .*;\n/gm, '').replace('export function verifyAppearanceFileProof', 'proofApi.verify = function'), {
    proofApi, assert: Object.assign((...args) => assert(...args), assert, { deepEqual: (a, b, message) => assert.deepEqual(structuredClone(a), structuredClone(b), message) }), verifyAppearanceFileRecord, decodeWarmWindowHelperIdentity,
    readPackagedRuntimePairBytes: value => { assert.equal(value, pair); artifact.validate(); return artifact; },
    readPackagedRuntimePair: value => { assert.equal(value, pair); return { compilerArtifact }; },
  });
  return { state, pair, original, verify: proof => proofApi.verify(proof, { pair, candidate, targetPid: 42, helperSha256: '1'.repeat(64), helperSourceSha256: '2'.repeat(64) }), create: () => api.create({ original, pair, helper, candidate }) };
}
test('actual owner joins active identities and retains original signed raw receipt', async t => {
  const f = fixture(t), owner = await f.create(); t.after(() => owner.retire()); f.state.append = true;
  const raw = await owner.observe({ windowId: 7, notBefore: new Date(Date.now() - 10).toISOString() });
  assert.equal(JSON.parse(raw).windowId, 7); assert.equal(owner.proof(raw).raw, raw); assert.equal(owner.proof(raw).sequence, 1); assert.equal(f.verify(owner.proof(raw)), raw);
  const changed = structuredClone(owner.proof(raw)); changed.activeIdentity.native.nativeAppearanceFileChannel.nonce = 'f'.repeat(32); assert.throws(() => f.verify(changed));
});
test('runtime or helper kernel generation drift refuses before returning a sample', async t => {
  for (const kind of ['runtime', 'helper']) {
    const f = fixture(t), owner = await f.create(); t.after(() => owner.retire());
    if (kind === 'runtime') f.state.runtime = { ...f.state.runtime, commit: 'f'.repeat(40) };
    else f.state.kernel = { ...f.state.kernel, helperProcessStartMachTicks: '11' };
    await assert.rejects(owner.observe({ windowId: 7, notBefore: new Date().toISOString() }));
  }
});
test('held original identity retirement and concurrent observation do not admit stale raw records', async t => {
  const f = fixture(t), owner = await f.create(); t.after(() => owner.retire()); let release;
  f.state.hold = new Promise(resolve => { release = resolve; });
  const reading = owner.observe({ windowId: 7, notBefore: new Date().toISOString() });
  await assert.rejects(owner.observe({ windowId: 7, notBefore: new Date().toISOString() }), /Concurrent/);
  owner.retire(); release(); await assert.rejects(reading, /retired/);
});
