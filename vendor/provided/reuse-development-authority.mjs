/** Preserve an exact previously verified signed Aux resource tree across a
 * native rebuild with optional exact reviewed UI updates. No Apple signing, DP calls, provisioning or launch. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { developmentSnapshot, validateDevelopmentSigningPlan, verifyPostSigningClaims, signingChanges } from './execute-development-signing.mjs';
import { fixedScope, regular, pinnedJson, freshOutput, prefix, checkDevelopmentReceiptShape } from './development-dp-review.mjs';
import { validateLaunchAuthorityReport } from './current-development-authority.mjs';
import { inspectProvidedSigningTree } from '../../scripts/lib/provided-signing.mjs';
import { developmentTargetDefinitions } from './plan-development-dp.mjs';
import { inspectSigningCode } from '../../scripts/lib/provided-signing-policy.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sha = file => hash(regular(file));
const stable = value => JSON.stringify(value, (_, item) => item && !Array.isArray(item) && typeof item === 'object' ? Object.fromEntries(Object.entries(item).sort()) : item);
const writeNew = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
function canonical(directory) { if (!path.isAbsolute(directory) || fs.realpathSync(directory) !== directory || !fs.lstatSync(directory).isDirectory()) throw Error('Canonical copied directory required'); return directory; }
function disjoint(a, b) { return a !== b && !a.startsWith(b + '/') && !b.startsWith(a + '/'); }
function codesign(args) {
  const result = spawnSync('/usr/bin/codesign', args, { env: { PATH: '/usr/bin:/bin', LC_ALL: 'C' }, encoding: 'utf8', timeout: 120000, maxBuffer: 1048576 });
  if (result.error || result.signal || result.status !== 0) throw Error('Static signature or explicit outer seal failed: ' + args.at(-1));
}
const withPrefix = inventory => inventory.map(leaf => ({ ...leaf, path: prefix + '/' + leaf.path }));
const resources = inventory => inventory.filter(leaf => leaf.path.startsWith(prefix + '/'));
function assertSameInventory(expected, actual, message) {
  const sorted = values => [...values].sort((a, b) => a.path.localeCompare(b.path, 'en'));
  if (stable(sorted(expected)) !== stable(sorted(actual))) throw Error(message);
}
export function bundleExclusionOrderProof(before, after) {
  const parse = bytes => {
    const value = JSON.parse(bytes);
    if (!Array.isArray(value.excludedFiles) || value.excludedFiles.some(row => !row || typeof row !== 'object' || Array.isArray(row) || stable(Object.keys(row).sort()) !== stable(['reason', 'sha256', 'source']) || typeof row.source !== 'string' || !/^[a-f0-9]{64}$/.test(row.sha256) || typeof row.reason !== 'string') || new Set(value.excludedFiles.map(row => row.source)).size !== value.excludedFiles.length) throw Error('Exact unique exclusion records required');
    return { ...value, excludedFiles: [...value.excludedFiles].sort((a, b) => a.source.localeCompare(b.source, 'en')) };
  };
  if (stable(parse(before)) !== stable(parse(after))) throw Error('Bundle changed beyond exclusion record order');
  return { field: 'excludedFiles', equivalence: 'identical-unique-records-order-only', beforeSha256: hash(before), afterSha256: hash(after) };
}
// A UI-only restage can retain helper signatures when every changed resource
// is explicitly reviewed. Executables, manifests that grant extension access,
// profiles, native addons, and helper bundles are never admitted here.
export function reviewedUiResourceInventory(inventory, review = []) {
  const allowed = new Set([
    'apps/extension/dist/assets/general-3dgRbrRk.js',
    'apps/extension/dist/assets/appearance-Ceuw3-j6.js',
    'apps/extension/dist/assets/privacy-BeEEt9Qu.js',
    'apps/extension/dist/assets/skills-CfSQ7MCw.js',
    'apps/extension/dist/assets/utils-WfPpT5w5.js',
    'apps/extension/dist/assets/draft-storage-ixLojjZ5.js',
    'apps/extension/dist/assets/browser-binding-CzDmxQNA.js',
    'apps/extension/dist/assets/-components-4o0FSqQ9.js',
    'apps/extension/dist/assets/permission-approval-D-GTf91U.js',
    'bundle.json', 'provenance/manifest.json', 'provenance/ui-manifest.json',
    'provenance/apps-manifest.json', 'provenance/distribution-manifest.json',
    'provenance/computer-use-manifest.json',
  ].map(relative => prefix + '/' + relative));
  if (!Array.isArray(review) || new Set(review.map(row => row.path)).size !== review.length)
    throw Error('Unique reviewed UI resource changes required');
  const changes = new Map(review.map(row => {
    const leaf = inventory.find(item => item.path === row.path);
    if (!allowed.has(row.path) || !leaf || leaf.link || leaf.sha256 !== row.beforeSha256 ||
        !/^[a-f0-9]{64}$/.test(row.afterSha256 ?? '') || row.beforeSha256 === row.afterSha256)
      throw Error('Unreviewed UI resource or baseline');
    return [row.path, row.afterSha256];
  }));
  return inventory.map(leaf => changes.has(leaf.path) ? { ...leaf, sha256: changes.get(leaf.path) } : leaf);
}
export function assertFreshResourceBaseline(cache, fresh, nextFinalApp, metadataProof = null, uiResourceReview = []) {
  if (typeof nextFinalApp !== 'string' || nextFinalApp !== cache.finalApp) throw Error('Final app/runtime relocation path changed');
  let expected = reviewedUiResourceInventory(cache.unsignedResources, uiResourceReview);
  if (metadataProof) {
    const bundle = prefix + '/bundle.json', before = expected.find(leaf => leaf.path === bundle), after = fresh.find(leaf => leaf.path === bundle);
    if (metadataProof.field !== 'excludedFiles' || metadataProof.equivalence !== 'identical-unique-records-order-only' || !before || !after || before.link || after.link || before.mode !== after.mode || before.sha256 !== metadataProof.beforeSha256 || after.sha256 !== metadataProof.afterSha256) throw Error('Bundle exclusion order proof mismatch');
    expected = expected.map(leaf => leaf.path === bundle ? { ...leaf, sha256: metadataProof.afterSha256 } : leaf);
  }
  assertSameInventory(expected, fresh, 'Fresh supplied resource payload changed; do not reuse historical authority tree');
}
function verifyRetainedSignatures(root, targets) {
  const expected = developmentTargetDefinitions(true).filter(target => target.path.startsWith(prefix + '/'));
  if (targets.length !== 8 || new Set(targets.map(target => target.path)).size !== 8 || targets.some(target => !expected.some(definition => definition.path === target.path && definition.signer === target.signer))) throw Error('Exact retained eight-target topology required');
  for (const target of targets) codesign(['--verify', '--strict', '--all-architectures', path.join(root, target.path.slice(prefix.length + 1))]);
}
function resourceSnapshot(root) { return withPrefix(developmentSnapshot(root)); }
function readCache(cachePath, cacheSha256) {
  const cache = pinnedJson(cachePath, cacheSha256), scope = fixedScope();
  if (cache.version !== 1 || cache.kind !== 'exact-signed-aux-resource-cache' || cache.scope !== scope.policy.core.scope || cache.proposalSha256 !== scope.proposalSha256 || cache.passwordManagerExcluded !== true || cache.authorityOperation !== 'verify' || !cache.authorityProofInherited || cache.appleSigningPerformed !== false || cache.keychainOperationsPerformed !== false || cache.parentFinalProofs?.length !== 8) throw Error('Exact inherited authority cache required');
  const root = canonical(path.join(path.dirname(cachePath), 'resources'));
  assertSameInventory(cache.signedResources, resourceSnapshot(root), 'Cached signed resources changed');
  verifyRetainedSignatures(root, cache.parentFinalProofs);
  return { cache, root };
}
export function validateResourceParentMetadata(receipt, plan, scope) {
  checkDevelopmentReceiptShape(receipt, scope);
  validateDevelopmentSigningPlan(plan, scope.proposal);
  if (receipt.passwordManagerExcluded !== true || plan.passwordManagerExcluded !== true || receipt.packageRoot !== plan.packageRoot || receipt.proposalSha256 !== plan.proposalSha256 || receipt.packageMayBePartiallySigned !== false) throw Error('Exact nine-target resource parent required');
  const files = new Map(receipt.finalInventory.map(leaf => [leaf.path, leaf]));
  if (files.size !== receipt.finalInventory.length) throw Error('Duplicate signed parent leaf');
  for (const step of plan.targets.filter(target => target.path.startsWith(prefix + '/'))) {
    const proof = receipt.finalProofs.find(item => item.path === step.path);
    if (!proof || proof.signer !== step.signer || proof.sha256 !== files.get(step.codeRelative)?.sha256 || proof.profileSha256 !== (step.profile?.sha256 ?? null)) throw Error('Retained helper proof mismatch');
    verifyPostSigningClaims(step, { flags: proof.flags, entitlements: proof.entitlements }, { team: proof.team }, proof.leaf, scope.proposal);
    if (step.profile && files.get(step.path + '/Contents/embedded.provisionprofile')?.sha256 !== step.profile.sha256) throw Error('Retained profile proof mismatch');
  }
  signingChanges(plan.inventory, receipt.finalInventory, plan.targets);
}
export function cacheSignedDevelopmentResources({ signedReceiptPath, signedReceiptSha256, authorityReportPath, authorityReportSha256, inputPath, inputSha256, output }) {
  const scope = fixedScope(), receipt = pinnedJson(signedReceiptPath, signedReceiptSha256);
  const authority = pinnedJson(authorityReportPath, authorityReportSha256), input = pinnedJson(inputPath, inputSha256), plan = pinnedJson(receipt.planPath, receipt.planSha256);
  validateLaunchAuthorityReport(authority, signedReceiptSha256, scope.policy.core.scope);
  validateResourceParentMetadata(receipt, plan, scope);
  for (const source of receipt.sources ?? []) { if (!source.path || source.path.split('/').some(part => !part || part === '.' || part === '..') || sha(path.join(repository, source.path)) !== source.sha256) throw Error('Parent signing implementation changed'); }
  if (receipt.passwordManagerExcluded !== true || plan.passwordManagerExcluded !== true || input.packageRoot !== receipt.packageRoot || input.preparationSha256 !== plan.preparationSha256) throw Error('Current verified nine-target parent required');
  const prep = pinnedJson(input.preparationPath, input.preparationSha256);
  if (prep.method !== 'current-completed-package-no-provisioning-project' || prep.resourceRoot !== path.join(receipt.packageRoot, prefix)) throw Error('Actual unsigned current preparation required');
  const packageReportPath = path.join(receipt.packageRoot, 'package.json'), packageReport = pinnedJson(packageReportPath, input.packageReportSha256);
  const unsignedResources = prep.inventory.map(leaf => {
    if (!leaf.path.startsWith('Resources/aux/') || leaf.path.split('/').some(part => !part || part === '.' || part === '..')) throw Error('Unsafe parent resource leaf');
    return { ...leaf, path: prefix + '/' + leaf.path.slice('Resources/aux/'.length) };
  });
  const signedResources = resources(receipt.finalInventory), targets = plan.targets.filter(target => target.path.startsWith(prefix + '/'));
  if (signedResources.some(leaf => leaf.path.includes('/Aux Password Importer.app/'))) throw Error('Retired password product cannot be cached');
  const source = canonical(path.join(receipt.packageRoot, prefix));
  output = path.resolve(output);
  if (!output.startsWith(path.join(repository, 'out') + '/')) throw Error('Project-owned cache required');
  output = freshOutput(output, [receipt.packageRoot, scope.policy.core.home]);
  const target = path.join(output, 'resources');
  // The complete copied inventory must match the signed receipt below. No
  // extra source hash pass can strengthen that exact cached-byte assertion.
  fs.cpSync(source, target, { recursive: true, errorOnExist: true, force: false, verbatimSymlinks: true, mode: fs.constants.COPYFILE_FICLONE });
  assertSameInventory(signedResources, resourceSnapshot(target), 'Copied signed resources differ');
  verifyRetainedSignatures(target, targets);
  const cache = { version: 1, kind: 'exact-signed-aux-resource-cache', scope: scope.policy.core.scope, proposalSha256: scope.proposalSha256, finalApp: packageReport.finalApp, parentSignedReceiptPath: signedReceiptPath, parentSignedReceiptSha256: signedReceiptSha256, parentPlanSha256: receipt.planSha256, parentPackageReportSha256: input.packageReportSha256, parentPreparationSha256: input.preparationSha256, parentAuthorityReportPath: authorityReportPath, parentAuthorityReportSha256: authorityReportSha256, authorityOperation: authority.operation, parentValidationScope: 'signed-aux-resources-only', parentOuterBrowserRevalidated: false, authorityProofInherited: true, passwordManagerExcluded: true, boundaryReceiptSha256: packageReport.boundaryReceiptSha256, unsignedResources, signedResources, parentFinalProofs: receipt.finalProofs.filter(proof => proof.path.startsWith(prefix + '/')), retainedTargets: targets, appleSigningPerformed: false, keychainOperationsPerformed: false, productLaunched: false };
  const cachePath = path.join(output, 'cache.json'); writeNew(cachePath, cache);
  return { cachePath, cacheSha256: sha(cachePath), signedResourceLeaves: signedResources.length, preservedNestedSignatures: 8, keychainOperationsPerformed: false, parentAppMutated: false };
}
export function planDevelopmentResourceReuse({ cachePath, cacheSha256, packageRoot, packageReportSha256, output, uiResourceReview = [] }) {
  const { cache, root } = readCache(cachePath, cacheSha256), scope = fixedScope(); packageRoot = canonical(packageRoot);
  if (!packageRoot.startsWith(path.join(repository, 'out') + '/') || !disjoint(packageRoot, path.dirname(cachePath))) throw Error('Fresh copied package separate from cache required');
  const report = pinnedJson(path.join(packageRoot, 'package.json'), packageReportSha256);
  if (report.implementation !== 'supplied' || report.signed !== false || report.developmentDpLayout !== true || report.boundaryReceiptSha256 !== cache.boundaryReceiptSha256) throw Error('Matching current native-boundary development package required');
  const before = developmentSnapshot(packageRoot);
  const marker = before.find(leaf => leaf.path === 'Aux.app/Contents/Resources/package.json');
  if (report.outerPackageBoundary || marker) {
    const expected = { path: 'Contents/Resources/package.json', sha256: hash('{\n  "private": true\n}\n'), mode: 0o644 };
    if (stable(report.outerPackageBoundary) !== stable(expected) || !marker || marker.link ||
        marker.sha256 !== expected.sha256 || marker.mode !== expected.mode)
      throw Error('Exact untyped outer Node package boundary required');
  }
  const oldBundle = cache.unsignedResources.find(leaf => leaf.path === prefix + '/bundle.json'), newBundle = before.find(leaf => leaf.path === prefix + '/bundle.json');
  let resourceMetadataCompatibility = null;
  if (oldBundle?.sha256 !== newBundle?.sha256 && !uiResourceReview.some(row => row.path === oldBundle.path)) {
    const previous = regular(path.join(root, 'bundle.json')), current = regular(path.join(packageRoot, prefix, 'bundle.json'));
    resourceMetadataCompatibility = bundleExclusionOrderProof(previous, current);
    if (resourceMetadataCompatibility.beforeSha256 !== oldBundle?.sha256 || resourceMetadataCompatibility.afterSha256 !== newBundle?.sha256) throw Error('Bundle metadata changed during comparison');
  }
  assertFreshResourceBaseline(cache, resources(before), report.finalApp, resourceMetadataCompatibility, uiResourceReview);
  output = freshOutput(output, [packageRoot, path.dirname(cachePath), scope.policy.core.home]);
  const plan = { version: 1, kind: 'exact-native-descendant-authority-reuse', cachePath, cacheSha256, cachedResourceRoot: root, packageRoot, packageReportSha256, finalApp: report.finalApp, before, resourceMetadataCompatibility, uiResourceReview, parentSignedReceiptSha256: cache.parentSignedReceiptSha256, parentAuthorityReportSha256: cache.parentAuthorityReportSha256, scope: cache.scope, authorizedOperation: 'copy-exact-signed-resources-and-adhoc-outer-only', appleSigningAllowed: false, keychainOperationsAllowed: false, output };
  const planPath = path.join(output, 'reuse-plan.json'); writeNew(planPath, plan);
  return { planPath, planSha256: sha(planPath), packageMutated: false, appleSigningPerformed: false, keychainOperationsPerformed: false };
}
export function validateNativeBundleSealReview(review, inventory) {
  if (!Array.isArray(review)) throw Error('Explicit native bundle review required');
  if (!review.length) return [];
  const framework = 'Aux.app/Contents/Frameworks/Aux Framework.framework';
  const candidates = inventory.filter(leaf => new RegExp('^' + framework.replaceAll('.', '\\.') + '/Versions/[0-9.]+/Aux Framework$').test(leaf.path));
  if (candidates.length !== 1) throw Error('One actual versioned framework required');
  const versionRoot = candidates[0].path.slice(0, -'/Aux Framework'.length);
  const helpers = ['Aux Helper (Alerts)', 'Aux Helper (Aperitif Alerts)', 'Aux Helper (Aperitif GPU)', 'Aux Helper (Aperitif Renderer)', 'Aux Helper (Aperitif)', 'Aux Helper (GPU)', 'Aux Helper (Renderer)', 'Aux Helper'];
  const definitions = helpers.map(name => ({ path: versionRoot + '/Helpers/' + name + '.app', codeRelative: versionRoot + '/Helpers/' + name + '.app/Contents/MacOS/' + name }));
  definitions.push({ path: framework, codeRelative: candidates[0].path });
  if (review.length !== definitions.length || new Set(review.map(step => step.path)).size !== review.length) throw Error('Exact eight helpers and framework review required');
  return definitions.map(definition => {
    const step = review.find(item => item.path === definition.path), leaf = inventory.find(item => item.path === definition.codeRelative);
    if (!step || step.codeRelative !== definition.codeRelative || !leaf || leaf.link || leaf.sha256 !== step.sha256 || stable(step.flags) !== stable(['adhoc', 'linker-signed']) || stable(step.entitlements) !== stable({})) throw Error('Unreviewed native bundle capabilities or bytes');
    return { ...definition, sha256: leaf.sha256, flags: step.flags, entitlements: {} };
  });
}
export function nativeResealChanges(before, after, nativeSeals) {
  const targets = [...nativeSeals, { path: 'Aux.app', codeRelative: 'Aux.app/Contents/MacOS/Aux' }];
  const first = new Map(before.map(leaf => [leaf.path, leaf])), last = new Map(after.map(leaf => [leaf.path, leaf])), changes = [];
  for (const leafPath of new Set([...first.keys(), ...last.keys()])) {
    const a = first.get(leafPath), b = last.get(leafPath);
    if (stable(a) === stable(b)) continue;
    const code = targets.some(target => target.codeRelative === leafPath);
    const signature = targets.some(target => leafPath.startsWith((target.path.endsWith('.framework') ? path.posix.dirname(target.codeRelative) : target.path + '/Contents') + '/_CodeSignature/'));
    if ((!code && !signature) || (code && (!a || !b || a.link || b.link || a.mode !== b.mode)) || (signature && (!b || a?.link || b.link))) throw Error('Change outside exact reviewed native bundle seals');
    changes.push({ path: leafPath, beforeSha256: a?.sha256 ?? null, afterSha256: b.sha256 });
  }
  return changes;
}
export async function applyDevelopmentResourceReuse({ planPath, planSha256, applyAuthorized = false, resumeOverlay = false, nativeSealReview = [] }) {
  if (applyAuthorized !== true) throw Error('Explicit copied-package handoff required');
  const plan = pinnedJson(planPath, planSha256), { cache, root } = readCache(plan.cachePath, plan.cacheSha256);
  if (plan.kind !== 'exact-native-descendant-authority-reuse' || plan.authorizedOperation !== 'copy-exact-signed-resources-and-adhoc-outer-only' || plan.appleSigningAllowed !== false || plan.keychainOperationsAllowed !== false || root !== plan.cachedResourceRoot) throw Error('Exact native descendant plan required');
  const reviewedNativeSeals = validateNativeBundleSealReview(nativeSealReview, plan.before);
  const expectedResources = reviewedUiResourceInventory(cache.signedResources, plan.uiResourceReview ?? []);
  const target = path.join(plan.packageRoot, prefix), backup = path.join(plan.output, 'fresh-unsigned-resources');
  if (resumeOverlay) {
    if (!reviewedNativeSeals.length) throw Error('Explicit native bundle repair review required');
    assertSameInventory(resources(plan.before), resourceSnapshot(backup), 'Fresh unsigned backup changed');
  } else {
    assertSameInventory(plan.before, developmentSnapshot(plan.packageRoot), 'Fresh package changed after review');
    const staged = path.join(path.dirname(target), '.aux-signed-resource-reuse');
    if (fs.existsSync(staged) || fs.existsSync(backup)) throw Error('Resource staging or backup already exists');
    fs.cpSync(root, staged, { recursive: true, errorOnExist: true, force: false, verbatimSymlinks: true, mode: fs.constants.COPYFILE_FICLONE });
    assertSameInventory(cache.signedResources, resourceSnapshot(staged), 'Staged retained resource copy changed');
    verifyRetainedSignatures(staged, cache.retainedTargets);
    for (const row of plan.uiResourceReview ?? []) {
      const relative = row.path.slice(prefix.length + 1);
      const source = path.join(target, relative);
      if (sha(source) !== row.afterSha256) throw Error('Reviewed UI input changed');
      fs.copyFileSync(source, path.join(staged, relative));
    }
    assertSameInventory(expectedResources, resourceSnapshot(staged), 'Reviewed UI overlay differs');
    fs.renameSync(target, backup); fs.renameSync(staged, target);
  }
  const copied = developmentSnapshot(plan.packageRoot);
  assertSameInventory(expectedResources, resources(copied), 'Retained resource overlay differs');
  assertSameInventory(plan.before.filter(leaf => !leaf.path.startsWith(prefix + '/')), copied.filter(leaf => !leaf.path.startsWith(prefix + '/')), 'Overlay changed native browser inputs');
  // Native build's own framework/helper signatures are retained, never blanket
  // re-signed. Any invalid native signature is an explicit blocker, not a reason
  // to silently change capabilities or native code.
  const tree = await inspectProvidedSigningTree(plan.packageRoot), nativeTargets = new Set(tree.bundles.filter(bundle => bundle !== 'Aux.app' && !bundle.startsWith(prefix + '/')));
  for (const file of tree.files) if (file.kind === 'macho' && file.path !== 'Aux.app/Contents/MacOS/Aux' && !file.path.startsWith(prefix + '/')) nativeTargets.add(file.path);
  const nativeSeals = reviewedNativeSeals;
  const entitlements = path.join(plan.output, 'outer-empty.entitlements.plist');
  fs.writeFileSync(entitlements, '<?xml version="1.0"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict/></plist>\n', { flag: 'wx', mode: 0o600 });
  for (const step of nativeSeals) {
    const code = path.join(plan.packageRoot, step.codeRelative), observed = inspectSigningCode(code);
    if (sha(code) !== step.sha256 || stable(observed.flags) !== stable(step.flags) || Object.keys(observed.entitlements).length) throw Error('Native bundle observation changed');
    codesign(['--force', '--sign', '-', '--timestamp=none', '--entitlements', entitlements, path.join(plan.packageRoot, step.path)]);
    codesign(['--verify', '--strict', '--all-architectures', path.join(plan.packageRoot, step.path)]);
    const sealed = inspectSigningCode(code);
    if (stable(sealed.flags) !== stable(['adhoc']) || Object.keys(sealed.entitlements).length) throw Error('Native bundle capabilities changed');
  }
  for (const relative of [...nativeTargets].sort()) codesign(['--verify', '--strict', '--all-architectures', path.join(plan.packageRoot, relative)]);
  const main = path.join(plan.packageRoot, 'Aux.app/Contents/MacOS/Aux'), observed = inspectSigningCode(main);
  if (Object.keys(observed.entitlements).length || observed.flags.some(flag => !['adhoc', 'linker-signed'].includes(flag))) throw Error('Outer browser capability policy requires review');
  codesign(['--force', '--sign', '-', '--timestamp=none', '--entitlements', entitlements, path.join(plan.packageRoot, 'Aux.app')]);
  codesign(['--verify', '--strict', '--all-architectures', path.join(plan.packageRoot, 'Aux.app')]);
  verifyRetainedSignatures(target, cache.retainedTargets);
  const after = developmentSnapshot(plan.packageRoot), changes = nativeResealChanges(copied, after, nativeSeals);
  assertSameInventory(expectedResources, resources(after), 'Inherited helper/resource bytes changed during outer seal');
  const receipt = { version: 1, implementation: 'inherited-development-authority-native-reseal', sourceSha256: sha(fileURLToPath(import.meta.url)), status: 'signed-and-verified', packageRoot: plan.packageRoot, packageReportSha256: plan.packageReportSha256, packageReportIsHistoricalUnsignedInput: true, planPath, planSha256, cachePath: plan.cachePath, cacheSha256: plan.cacheSha256, scope: cache.scope, parentSignedReceiptSha256: cache.parentSignedReceiptSha256, parentAuthorityReportSha256: cache.parentAuthorityReportSha256, retainedHelperSignaturesVerified: 8, nativeSignaturesVerified: [...nativeTargets].sort(), parentAppleSignaturesReused: true, appleSigningPerformed: false, adhocSignedTargets: [...nativeSeals.map(step => step.path), 'Aux.app'], nativeSealReview: nativeSeals, keychainOperationsPerformed: false, authorityProofInherited: true, providedResourcesByteIdentical: !(plan.uiResourceReview?.length), uiResourceReview: plan.uiResourceReview ?? [], resourceMetadataCompatibility: plan.resourceMetadataCompatibility, untargetedLeavesPreserved: true, changes, finalInventory: after, finalSnapshotSha256: hash(stable(after)), productLaunched: false, accountStartupVerified: false, aiRequestVerified: false };
  const receiptPath = path.join(plan.output, 'reuse-receipt.json'); writeNew(receiptPath, receipt);
  return { receiptPath, receiptSha256: sha(receiptPath), status: receipt.status, appleSigningPerformed: false, keychainOperationsPerformed: false };
}
export function verifyReusedDevelopmentReceipt({ receiptPath, receiptSha256 }) {
  const receipt = pinnedJson(receiptPath, receiptSha256), plan = pinnedJson(receipt.planPath, receipt.planSha256), { cache } = readCache(receipt.cachePath, receipt.cacheSha256);
  if (receipt.version !== 1 || receipt.implementation !== 'inherited-development-authority-native-reseal' || receipt.status !== 'signed-and-verified' || receipt.sourceSha256 !== sha(fileURLToPath(import.meta.url)) || receipt.packageRoot !== plan.packageRoot || receipt.cacheSha256 !== plan.cacheSha256 || receipt.parentSignedReceiptSha256 !== cache.parentSignedReceiptSha256 || receipt.parentAuthorityReportSha256 !== cache.parentAuthorityReportSha256 || receipt.scope !== cache.scope || receipt.authorityProofInherited !== true || receipt.appleSigningPerformed !== false || receipt.keychainOperationsPerformed !== false || stable(receipt.adhocSignedTargets) !== stable([...(receipt.nativeSealReview ?? []).map(step => step.path), 'Aux.app']) || receipt.providedResourcesByteIdentical !== !(plan.uiResourceReview?.length) || stable(receipt.uiResourceReview ?? []) !== stable(plan.uiResourceReview ?? []) || receipt.untargetedLeavesPreserved !== true) throw Error('Exact inherited native reseal receipt required');
  const current = developmentSnapshot(receipt.packageRoot);
  assertSameInventory(receipt.finalInventory, current, 'Native descendant changed after sealing');
  if (hash(stable(current)) !== receipt.finalSnapshotSha256) throw Error('Native descendant final snapshot mismatch');
  const expectedResources = reviewedUiResourceInventory(cache.signedResources, plan.uiResourceReview ?? []);
  assertSameInventory(expectedResources, resources(current), 'Inherited helpers or reviewed UI resources changed');
  const expectedOverlay = [...plan.before.filter(leaf => !leaf.path.startsWith(prefix + '/')), ...expectedResources];
  const nativeSeals = validateNativeBundleSealReview(receipt.nativeSealReview ?? [], expectedOverlay);
  nativeResealChanges(expectedOverlay, current, nativeSeals);
  for (const step of nativeSeals) codesign(['--verify', '--strict', '--all-architectures', path.join(receipt.packageRoot, step.path)]);
  codesign(['--verify', '--strict', '--all-architectures', path.join(receipt.packageRoot, 'Aux.app')]);
  verifyRetainedSignatures(path.join(receipt.packageRoot, prefix), cache.retainedTargets);
  const observed = inspectSigningCode(path.join(receipt.packageRoot, 'Aux.app/Contents/MacOS/Aux'));
  if (Object.keys(observed.entitlements).length || stable(observed.flags) !== stable(['adhoc'])) throw Error('Native descendant outer signature differs');
  return receipt;
}
export function writeReusedLaunchHandoff({ receiptPath, receiptSha256, output }) {
  const receipt = verifyReusedDevelopmentReceipt({ receiptPath, receiptSha256 }), scope = fixedScope();
  const app = path.join(receipt.packageRoot, 'Aux.app'), home = scope.policy.core.home, profile = path.join(home, 'preview-profile-local-browser-pass');
  const handoff = { version: 1, kind: 'inherited-signed-preview-launch-handoff', app, home, profile, scope: receipt.scope, receiptPath, receiptSha256, parentSignedReceiptSha256: receipt.parentSignedReceiptSha256, parentAuthorityReportSha256: receipt.parentAuthorityReportSha256, authorityProofInherited: true, signedResourcesByteIdentical: receipt.providedResourcesByteIdentical, uiResourceReview: receipt.uiResourceReview ?? [], packageReportIsHistoricalUnsignedInput: true, command: ['node','scripts/aux.mjs','--home',home,'--profile',profile,'--app',app,'--','--new-window','chrome://newtab/'], environment: { HOME: home, CFFIXED_USER_HOME: home, AUX_ENABLE_PROVIDED_NATIVE_CARRIER: '1', AUX_NATIVE_KEYCHAIN_SCOPE: receipt.scope }, removeEnvironment: ['AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN','AUX_PROVIDED_DP_PROBE','AUX_DP_PROBE_APPROVED','AUX_DP_PROBE_OPERATION','AUX_PROVIDED_NATIVE_LOAD_ONLY'], launched: false, accountStartupVerified: false, aiRequestVerified: false };
  writeNew(path.resolve(output), handoff); return handoff;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, requestPath] = process.argv.slice(2), modes = { cache: cacheSignedDevelopmentResources, plan: planDevelopmentResourceReuse, apply: applyDevelopmentResourceReuse, resume: request => applyDevelopmentResourceReuse({ ...request, resumeOverlay: true }), verify: verifyReusedDevelopmentReceipt, handoff: writeReusedLaunchHandoff };
  if (!modes[mode] || !requestPath || process.argv.length !== 4) throw Error('Usage: reuse-development-authority.mjs cache|plan|apply|resume|verify|handoff explicit-request.json');
  console.log(JSON.stringify(await modes[mode](pinnedJson(path.resolve(requestPath), sha(path.resolve(requestPath))))));
}
