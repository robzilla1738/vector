import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertFreshResourceBaseline, bundleExclusionOrderProof, validateNativeBundleSealReview, nativeResealChanges } from './reuse-development-authority.mjs';

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

test('reviewed native resume permits only exact linker bundle bytes and signature directories', () => {
  const framework = 'Aux.app/Contents/Frameworks/Aux Framework.framework', version = framework + '/Versions/155.0.8059.85';
  const names = ['Aux Helper (Alerts)', 'Aux Helper (Aperitif Alerts)', 'Aux Helper (Aperitif GPU)', 'Aux Helper (Aperitif Renderer)', 'Aux Helper (Aperitif)', 'Aux Helper (GPU)', 'Aux Helper (Renderer)', 'Aux Helper'];
  const review = names.map(name => ({ path: version + '/Helpers/' + name + '.app', codeRelative: version + '/Helpers/' + name + '.app/Contents/MacOS/' + name, sha256: 'a'.repeat(64), flags: ['adhoc', 'linker-signed'], entitlements: {} }));
  review.push({ path: framework, codeRelative: version + '/Aux Framework', sha256: 'b'.repeat(64), flags: ['adhoc', 'linker-signed'], entitlements: {} });
  const before = [...review.map(step => ({ path: step.codeRelative, sha256: step.sha256, mode: 0o755 })), { path: version + '/Libraries/original.dylib', sha256: 'immutable', mode: 0o755 }, { path: 'Aux.app/Contents/Resources/aux/original.node', sha256: 'immutable', mode: 0o755 }];
  const seals = validateNativeBundleSealReview(review, before);
  const after = before.map(leaf => review.some(step => step.codeRelative === leaf.path) ? { ...leaf, sha256: 'resealed' } : leaf);
  after.push({ path: version + '/_CodeSignature/CodeResources', sha256: 'seal', mode: 0o644 });
  nativeResealChanges(before, after, seals);
  assert.throws(() => validateNativeBundleSealReview(review.slice(1), before));
  assert.throws(() => validateNativeBundleSealReview(review.map((step, i) => i ? step : { ...step, entitlements: { 'com.apple.security.cs.allow-jit': true } }), before));
  assert.throws(() => validateNativeBundleSealReview(review.map((step, i) => i ? step : { ...step, sha256: 'changed' }), before));
  for (const leafPath of [version + '/Libraries/original.dylib', 'Aux.app/Contents/Resources/aux/original.node']) assert.throws(() => nativeResealChanges(before, after.map(leaf => leaf.path === leafPath ? { ...leaf, sha256: 'changed' } : leaf), seals));
  assert.throws(() => nativeResealChanges(before, [...after, { path: version + '/unexpected', sha256: 'extra', mode: 0o644 }], seals));
});

test('native-only utility never re-signs Apple helpers or runs a Keychain/provisioning/authority probe', () => {
  const source = readFileSync(new URL('./reuse-development-authority.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /runDevelopmentDpProbe|authenticateDevelopmentProfile|SecItem|xcodebuild|allowProvisioning|--deep|install-init|install-destroy/);
  assert.equal((source.match(/codesign\(\['--force', '--sign', '-'/g) ?? []).length, 2);
  assert.match(source, /nativeResealChanges\(copied, after, nativeSeals\)/);
  assert.match(source, /verifyRetainedSignatures\(target, cache.retainedTargets\)/);
  assert.match(source, /authorityProofInherited: true/);
});
