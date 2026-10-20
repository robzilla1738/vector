import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertFreshResourceBaseline } from './reuse-development-authority.mjs';

test('reuse requires complete exact unsigned resource bytes/modes/links and identical final relocation path', () => {
  const cache = { finalApp: '/project/out/current/Aux.app', unsignedResources: [{ path: 'Aux.app/Contents/Resources/aux/apps/daemon/code', mode: 0o755, sha256: 'SEA-CURRENT' }, { path: 'Aux.app/Contents/Resources/aux/runtime/python/bin/link', link: '../python3' }] };
  assertFreshResourceBaseline(cache, structuredClone(cache.unsignedResources), cache.finalApp);
  assertFreshResourceBaseline(cache, [...cache.unsignedResources].reverse(), cache.finalApp);
  assert.throws(() => assertFreshResourceBaseline(cache, cache.unsignedResources, '/different/app'));
  for (const change of [list => list[0].sha256 = 'OLD-VAULT-SEA', list => list[0].mode = 0o644, list => list[1].link = '/outside', list => list.push({ path: 'new-resource', sha256: 'extra' }), list => list.pop()]) {
    const bad = structuredClone(cache.unsignedResources); change(bad); assert.throws(() => assertFreshResourceBaseline(cache, bad, cache.finalApp));
  }
});

test('native-only utility neither re-signs Apple helpers nor runs a Keychain/provisioning/authority probe', () => {
  const source = readFileSync(new URL('./reuse-development-authority.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /runDevelopmentDpProbe|authenticateDevelopmentProfile|SecItem|xcodebuild|allowProvisioning|--deep|install-init|install-destroy/);
  assert.equal((source.match(/codesign\(\['--force', '--sign', '-'/g) ?? []).length, 1);
  assert.match(source, /signingChanges\(copied, after, \[\{ path: 'Aux.app'/);
  assert.match(source, /verifyRetainedSignatures\(target, cache.retainedTargets\)/);
  assert.match(source, /authorityProofInherited: true/);
});
