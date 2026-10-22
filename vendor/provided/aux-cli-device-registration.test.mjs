import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash, generateKeyPairSync} from 'node:crypto';
import {runInNewContext, SourceTextModule} from 'node:vm';
import {findMachOSeaSection, readSeaBlob} from '../aside/lib/sea.mjs';
import {adaptCliCode} from './cli-adapter.mjs';
import {applyAuxCliDeviceRegistration} from './aux-cli-device-registration.mjs';
const binary = readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/cli/Contents/MacOS/aside');
const section = findMachOSeaSection(binary);
const original = readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code;
const transform = text => applyAuxCliDeviceRegistration({component: 'cli', path: 'entry.mjs', text, original});
const root = new URL('../../docs/integration/proposed/aux-cli-device-registration/', import.meta.url);
const replacement = readFileSync(new URL('replacement-function.js.txt', root), 'utf8');
const baseline = readFileSync(new URL('original-function.js.txt', root), 'utf8');
function fixture(platform, responses, fn = replacement) {
  const calls = [];
  const sandbox = {process: {platform}, Buffer, createHash, os: {hostname: () => 'Synthetic Aux'}, CLI_VERSION: 'fixture',
    runNativeHelperCommand: command => {calls.push(command); if (responses[command] instanceof Error) throw responses[command]; return responses[command];}};
  runInNewContext(`let cachedCliDevice = null; ${fn};globalThis.registration = getCliDeviceRegistration;`, sandbox);
  const result = sandbox.registration();
  assert.ok(!calls.some(command => /init|destroy/.test(command)), 'registration must never mutate authority');
  return {result: result === undefined ? undefined : JSON.parse(JSON.stringify(result)), calls, run: sandbox.registration};
}
const jwk = generateKeyPairSync('ec', {namedCurve: 'prime256v1'}).publicKey.export({format: 'jwk'});
const publicKey = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]);
const sig = publicKey.toString('base64');

test('exact original and fully composed CLI are patched once and remain parseable', () => {
  for (const text of [original]) {
    const result = transform(text);
    assert.equal(result.anchors.length, 1);
    assert.equal(result.text.replace(replacement, baseline), text, 'all bytes outside actual reviewed function unchanged');
    new SourceTextModule(result.text);
    assert.throws(() => transform(result.text), /drift/);
  }
  const composed = adaptCliCode(original, {}, 'aux-v1', 2);
  assert.equal(composed.applied.filter(anchor => anchor.name === 'Mac CLI native status and public scheme pairing').length, 1);
  assert.ok(composed.code.includes(replacement));
  new SourceTextModule(composed.code);
  assert.throws(() => transform(composed.code), /drift/);
  assert.throws(() => applyAuxCliDeviceRegistration({component: 'cli', path: 'entry.mjs', text: original, original: original + ' '}), /pin/);
  assert.throws(() => transform(original.replace('function getCliDeviceRegistration()', 'function changedDeviceRegistration()')), /drift/);
});

test('Mac P256 and PQ read paired native commands and advertise actual cloud device shapes', () => {
  for (const [scheme, bytes] of [['p256_v1', publicKey], ['pq_v1', Buffer.alloc(1952, 7)]]) {
    const f = fixture('darwin', {'install-status': {installed: true, scheme}, 'get-public-keys': {scheme, sig: bytes.toString('base64')}});
    assert.deepEqual(f.calls, ['install-status', 'get-public-keys']);
    assert.equal(f.result.installationScheme, scheme);
    assert.equal(f.result.ikSigKeyFingerprint, `sha256:${createHash('sha256').update(bytes).digest('hex')}`);
    assert.equal(f.result.platform, 'macos');
    if (scheme === 'p256_v1') assert.deepEqual(f.result.ikSigPublicKeyJwk, {kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, ext: true, key_ops: ['verify']});
    else assert.deepEqual(f.result.ikSigPublicKeyJwk, {kty: 'RAW', alg: 'ML-DSA-65', public_key_b64: bytes.toString('base64')});
    f.run(); assert.equal(f.calls.length, 2, 'retains original cached registration behavior');
  }
  const cloud = readFileSync(new URL('../../services/aux-cloud/src/auth.ts', import.meta.url), 'utf8');
  assert.ok(cloud.includes("installationScheme: z.enum(['p256_v1','pq_v1'])"));
  assert.ok(cloud.includes("alg: z.literal('ML-DSA-65')") && cloud.includes('bytes.length !== 1952'));
});

test('Mac rejects unavailable, malformed, unknown and mismatched authority without creating keys', () => {
  const cases = [
    [undefined, {scheme: 'p256_v1', sig}],
    [{error: 'unavailable'}, {scheme: 'p256_v1', sig}],
    [{installed: false, scheme: 'p256_v1'}, {scheme: 'p256_v1', sig}],
    [{installed: 1, scheme: 'p256_v1'}, {scheme: 'p256_v1', sig}],
    [{keysInstalled: true, scheme: 'p256_v1'}, {scheme: 'p256_v1', sig}],
    [{installed: true}, {scheme: 'p256_v1', sig}],
    [{installed: true, scheme: 'future'}, {scheme: 'future', sig}],
    [{installed: true, scheme: 'pq_v1'}, {scheme: 'p256_v1', sig}],
    [{installed: true, scheme: 'p256_v1'}, {error: 'unavailable'}],
    [{installed: true, scheme: 'p256_v1'}, {scheme: 'p256_v1', sig: sig.replace(/=+$/, '')}],
    [{installed: true, scheme: 'p256_v1'}, {scheme: 'p256_v1', sig: Buffer.alloc(65).toString('base64')}],
    [{installed: true, scheme: 'pq_v1'}, {scheme: 'pq_v1', sig}],
    [{installed: true, scheme: 'p256_v1'}, new Error('synthetic load failure')],
  ];
  for (const [status, keys] of cases) assert.equal(fixture('darwin', {'install-status': status, 'get-public-keys': keys}).result, undefined);
  assert.deepEqual(fixture('linux', {}).calls, []);
});

test('Windows generic commands, truthiness and existing result behavior remain unchanged', () => {
  for (const responses of [
    {'keys-status': {keysInstalled: true}, 'public-keys': {sig}},
    {'keys-status': {keysInstalled: 1}, 'public-keys': {sig: 'YQ=='}},
    {'keys-status': {keysInstalled: false}},
    {'keys-status': {error: 'unavailable'}},
    {'keys-status': {keysInstalled: true}, 'public-keys': {error: 'unavailable'}},
  ]) {
    const old = fixture('win32', responses, baseline), next = fixture('win32', responses);
    assert.deepEqual(next.calls, old.calls); assert.deepEqual(next.result, old.result);
  }
});
