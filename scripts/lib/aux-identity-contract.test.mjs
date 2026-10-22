import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { assertAuxIdentityPairing, nativeIdentityPaths, compareAuxVisualAssets, assertAuxVisualAssets } from './aux-identity-contract.mjs';
const digest = s => createHash('sha256').update(s).digest('hex');
function fixture(profile = 'aux-v1') {
  const brand = profile === 'aux-v1' ? 'Aux' : 'Aside', lower = brand.toLowerCase();
  const commands = ['listTabs', 'resolveBindingWindow', 'getThirdPartyCookies'].map(name => `method:literal("${brand}.${name}");case "${brand}.${name}":`).join(' ');
  const auth = `${brand}DaemonSessionToken ${brand}SessionToken Buffer.from("${brand} Daemon Auth v1\\0") Buffer.from("${brand} Daemon Dev Auth v1\\0") ${lower}-daemon`;
  const sources = Object.fromEntries(nativeIdentityPaths.map(path => [path, `${brand}DaemonSessionToken ${brand}SessionToken ${lower}-daemon std::string("${brand} Daemon Auth v1\\0", sizeof("${brand} Daemon Auth v1\\0") - 1)`]));
  return { identityProfile: profile, declaredProfiles: { stage: profile, ui: profile, apps: profile }, texts: { agent: `${commands} ${lower}.daemon.auth.`, daemon: `${commands} ${auth} ${lower}.daemon.auth.`, cli: auth }, nativeSources: sources };
}
test('paired real-entrypoint contract accepts both explicit generations with complete NUL domains', () => {
  assert.equal(assertAuxIdentityPairing(fixture()).challengeBytes, 19);
  assert.equal(assertAuxIdentityPairing(fixture()).developmentChallengeBytes, 23);
  assert.equal(assertAuxIdentityPairing(fixture('compatibility')).challengeBytes, 21);
});
test('reject mismatched declared profile before packaging; declarations alone cannot prove pairing', () => {
  const f = fixture(); f.declaredProfiles.ui = 'compatibility';
  assert.throws(() => assertAuxIdentityPairing(f), /profile mismatch/);
  const mixed = fixture(); mixed.texts.daemon += ' Aside.listTabs';
  assert.throws(() => assertAuxIdentityPairing(mixed), /Mixed identity/);
  const absent = fixture(); absent.texts.agent = 'Aux.unrelated aux.daemon.auth.';
  assert.throws(() => assertAuxIdentityPairing(absent), /Agent schema/);
});
test('reject native mixed caller and truncated challenge, including navigation caller', () => {
  const mixed = fixture(); mixed.nativeSources[nativeIdentityPaths.at(-1)] = 'AsideDaemonSessionToken';
  assert.throws(() => assertAuxIdentityPairing(mixed), /Mixed identity/);
  const truncated = fixture(); const path = nativeIdentityPaths[1];
  truncated.nativeSources[path] = 'std::string("Aux Daemon Auth v1\\0", 21)';
  assert.throws(() => assertAuxIdentityPairing(truncated), /19 bytes/);
  const missing = fixture(); delete missing.nativeSources[path];
  assert.throws(() => assertAuxIdentityPairing(missing), /Missing pinned/);
});
test('visual inventory reports actual missing, changed and extra and never reads acceptedRoot', async t => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'aux-visual-contract-'))); t.after(() => rm(root, {recursive:true,force:true}));
  const agentRoot = join(root, 'successor'); await mkdir(agentRoot);
  const baselinePath = join(root, 'baseline.json');
  const entries = ['stable.css','change.svg','missing.png'].map(path => ({ path, sha256: digest('old'), bytes:3 }));
  await writeFile(baselinePath, JSON.stringify({ version:1, acceptedRoot:'/do-not-read-owner-state', files:entries }));
  await writeFile(join(agentRoot,'stable.css'),'old'); await writeFile(join(agentRoot,'change.svg'),'new'); await writeFile(join(agentRoot,'extra.webp'),'extra');
  const report = await compareAuxVisualAssets({agentRoot,baselinePath});
  assert.deepEqual(report.missing,['missing.png']); assert.deepEqual(report.extra,['extra.webp']); assert.equal(report.changed[0].path,'change.svg');
  await assert.rejects(assertAuxVisualAssets({agentRoot,baselinePath}), error => error.report === undefined ? false : !error.report.unchanged);
  await writeFile(join(agentRoot,'missing.png'),'old'); await writeFile(join(agentRoot,'change.svg'),'old'); await rm(join(agentRoot,'extra.webp'));
  assert.equal((await assertAuxVisualAssets({agentRoot,baselinePath})).unchanged,true);
});
