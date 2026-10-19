import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createPublicKey, generateKeyPairSync, randomBytes, verify } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { adaptDaemonCode, DAEMON_CODE_SHA256 } from './daemon-adapter.mjs';
const { createAdapter, run } = createRequire(import.meta.url)('./daemon-native.cjs');

test('browser P256 identity, encrypted test storage, domain separation and refusal boundaries', () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-provided-auth-'));
  try {
    const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const keyfile = join(home, 'installation-private.pem');
    writeFileSync(keyfile, privateKey.export({ format: 'pem', type: 'pkcs8' }), { mode: 0o600 });
    writeFileSync(join(home, 'installation-public.pem'), publicKey.export({ format: 'pem', type: 'spki' }));
    const adapter = createAdapter(home);
    const call = (command, data) => JSON.parse(adapter.run(command, JSON.stringify(data ?? {})));
    assert.equal(call('install-status').installed, false);
    const init = call('install-init');
    assert.equal(init.scheme, 'p256_v1');
    assert.equal(call('install-status').installed, true);
    assert.deepEqual(call('install-init'), init);
    const jwk = createPublicKey(privateKey).export({ format: 'jwk' });
    assert.equal(init.sig_pub, Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]).toString('base64'));
    const challenge = Buffer.concat([Buffer.from('Aside Daemon Auth v1\0'), randomBytes(32)]);
    const signature = Buffer.from(call('cdp-sign', { challenge: challenge.toString('base64') }).signature, 'base64');
    assert.ok(verify('sha256', challenge, publicKey, signature));
    assert.equal(verify('sha256', Buffer.concat([Buffer.from('Aux Daemon Auth v1\0'), challenge.subarray(21)]), publicKey, signature), false);
    const secret = 'disposable fixture secret';
    assert.deepEqual(call('secure-save', { key: 'fixture', data: secret }), {});
    const dir = join(home, 'installation-runtime', 'secure');
    const f = join(dir, readdirSync(dir)[0]);
    assert.equal(readFileSync(f).includes(secret), false);
    assert.equal(statSync(f).mode & 0o777, 0o600);
    assert.equal(call('secure-read', { key: 'fixture' }).data, secret);
    const corrupted = readFileSync(f); corrupted[corrupted.length - 1] ^= 1; writeFileSync(f, corrupted);
    assert.ok(call('secure-read', { key: 'fixture' }).error);
    assert.ok(call('install-destroy').error);
    assert.ok(call('list-open-apps').error);
    assert.ok(JSON.parse(run('install-status', '')).error);
    chmodSync(keyfile, 0o644);
    assert.ok(call('get-public-keys').error);
  } finally { rmSync(home, { recursive: true, force: true }); }
});

test('unknown supplied bundle rejected before any rewrite', () => {
  assert.throws(() => adaptDaemonCode('export {};'), /hash mismatch/);
});

const source = process.env.AUX_PROVIDED_DAEMON_CODE;
test('pinned actual daemon keeps real plan checks and count-checked Aux branding with supplied wire spellings', { skip: !source }, () => {
  const original = readFileSync(source, 'utf8');
  assert.equal(createHash('sha256').update(original).digest('hex'), DAEMON_CODE_SHA256);
  const result = adaptDaemonCode(original);
  assert.ok(result.code.includes('ei.includes(Cn?.subscriptionPlan??`free`)'));
  for (const wire of ['AsideDaemonSessionToken', 'AsideSessionToken', 'Aside Daemon Auth v1', 'Aside Daemon Dev Auth v1', 'aside.daemon.auth.', 'aside-daemon-localhost', '`aside-daemon`']) {
    assert.equal(result.code.split(wire).length, original.split(wire).length, wire);
  }
  assert.equal(result.code.includes('AuxDaemonSessionToken'), false);
  assert.ok(result.code.includes('DAEMON_AUTH_TOKEN_TYPE=`AsideDaemonSessionToken`'));
  assert.ok(result.code.includes('ei.slice(24).trim()'));
  assert.ok(result.code.includes('let ei=ti.slice(18)'));
  assert.ok(result.code.includes('Cn.startsWith(`Aside.`)'));
  for (const m of original.matchAll(/Aside\.[A-Za-z_$][\w$]*/g)) assert.equal(result.code.split(m[0]).length, original.split(m[0]).length, m[0]);
  assert.ok(result.code.includes('specialist for Aux.')); 
  assert.equal(result.code.includes('return[process.env.AUX_NATIVE_HELPER_BINDING,materializeEmbeddedBinding()'), false);
  assert.ok(result.code.includes('/auth/onboarding/complete'));
  assert.ok(result.code.includes('process.env.AUX_AGENT_RUNTIME_DIR?path.resolve(process.env.AUX_AGENT_RUNTIME_DIR)'));
  assert.ok(result.code.includes('process.env.AUX_ALLOW_EXTERNAL_SKILL_SYNC===`1`&&syncInstalledAuxBrowserSkills()'));
  assert.ok(result.code.includes('service:`aside-daemon`'));
  assert.equal(result.code.split('aside.dk.').length - 1, 4);
  assert.equal(result.code.includes('aux.dk.'), false);
  assert.ok(result.code.includes('DK_WRAP_INFO=`aside.wrap.dk.v1`'));
  const startup = 'async function main(){await (await import(`node:module`)).createRequire(process.execPath)(path.resolve(path.dirname(process.execPath),`../Resources/native/memory-bootstrap.cjs`))();(0,import_undici.setGlobalDispatcher)';
  assert.equal(result.code.split(startup).length - 1, 1);
  assert.ok(result.applied.some((e) => e.name === 'bundled memory startup provisioning' && e.count === 1));
  assert.ok(result.applied.some((e) => e.name === 'load-only native SEA diagnostic' && e.count === 1));
  assert.equal(result.code.split('(process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY===`1`||process.env.AUX_PROVIDED_DP_PROBE===`1`?').length - 1, 1);
  assert.ok(result.applied.some((e) => e.name === 'bundled runtime lazy cache provisioning' && e.count === 1));
  assert.ok(result.code.includes('runtime-bootstrap.cjs`))(ei);setAgentRuntimeProgress('));
  assert.ok(result.applied.some((e) => e.name === 'restore supplied wire spelling'));
});
