import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertFreshResourceBaseline, bundleExclusionOrderProof } from './reuse-development-authority.mjs';

test('reuse requires complete exact unsigned resource bytes/modes/links and identical final relocation path', () => {
  const cache = { finalApp: '/project/out/current/Aux.app', unsignedResources: [{ path: 'Aux.app/Contents/Resources/aux/apps/daemon/code', mode: 0o755, sha256: 'SEA-CURRENT' }, { path: 'Aux.app/Contents/Resources/aux/runtime/python/bin/link', link: '../python3' }] };
  assertFreshResourceBaseline(cache, structuredClone(cache.unsignedResources), cache.finalApp);
  assertFreshResourceBaseline(cache, [...cache.unsignedResources].reverse(), cache.finalApp);
  assert.throws(() => assertFreshResourceBaseline(cache, cache.unsignedResources, '/different/app'));
  for (const change of [list => list[0].sha256 = 'OLD-VAULT-SEA', list => list[0].mode = 0o644, list => list[1].link = '/outside', list => list.push({ path: 'new-resource', sha256: 'extra' }), list => list.pop()]) {
    const bad = structuredClone(cache.unsignedResources); change(bad); assert.throws(() => assertFreshResourceBaseline(cache, bad, cache.finalApp));
  }
});

test('only identical unique excludedFiles records may differ in bundle order', () => {
  const rows = [{ source: 'excluded/a', sha256: 'a'.repeat(64), reason: 'Excluded product' }, { source: 'excluded/b', sha256: 'b'.repeat(64), reason: 'Excluded product' }];
  const encode = (excludedFiles, other = 'unchanged') => Buffer.from(JSON.stringify({ version: 1, other, excludedFiles }));
  const proof = bundleExclusionOrderProof(encode(rows), encode([...rows].reverse()));
  const path = 'Aux.app/Contents/Resources/aux/bundle.json';
  const cache = { finalApp: '/project/Aux.app', unsignedResources: [{ path, mode: 0o644, sha256: proof.beforeSha256 }, { path: 'immutable-addon', sha256: 'original', mode: 0o755 }] };
  const fresh = cache.unsignedResources.map(leaf => leaf.path === path ? { ...leaf, sha256: proof.afterSha256 } : leaf);
  assertFreshResourceBaseline(cache, fresh, cache.finalApp, proof);
  assert.throws(() => assertFreshResourceBaseline(cache, fresh, cache.finalApp));
  assert.throws(() => assertFreshResourceBaseline(cache, fresh.map(leaf => ({ ...leaf, mode: 0o600 })), cache.finalApp, proof));
  assert.throws(() => assertFreshResourceBaseline(cache, [...fresh, { path: 'extra', sha256: 'extra' }], cache.finalApp, proof));
  assert.throws(() => bundleExclusionOrderProof(encode(rows), encode(rows, 'changed')));
  assert.throws(() => bundleExclusionOrderProof(encode(rows), encode([rows[0], rows[0]])));
  assert.throws(() => bundleExclusionOrderProof(encode(rows), encode([{ ...rows[0], sha256: 'c'.repeat(64) }, rows[1]])));
  assert.throws(() => bundleExclusionOrderProof(encode(rows), encode([{ ...rows[0], extra: true }, rows[1]])));
});

test('native-only utility neither re-signs Apple helpers nor runs a Keychain/provisioning/authority probe', () => {
  const source = readFileSync(new URL('./reuse-development-authority.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /runDevelopmentDpProbe|authenticateDevelopmentProfile|SecItem|xcodebuild|allowProvisioning|--deep|install-init|install-destroy/);
  assert.equal((source.match(/codesign\(\['--force', '--sign', '-'/g) ?? []).length, 1);
  assert.match(source, /signingChanges\(copied, after, \[\{ path: 'Aux.app'/);
  assert.match(source, /verifyRetainedSignatures\(target, cache.retainedTargets\)/);
  assert.match(source, /authorityProofInherited: true/);
});
