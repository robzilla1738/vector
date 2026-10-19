/** Explicit local development signing only; default is static verification.
 * Never provisions, launches product code, changes profiles or performs DP calls.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash, X509Certificate } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { developmentTargets, orderedDevelopmentTargets, developmentCapabilities, checkProfileReport } from './plan-development-dp.mjs';
import { inspectSigningCode } from '../../scripts/lib/provided-signing-policy.mjs';
import { authenticateDevelopmentProfile } from './authenticate-development-profile.mjs';
const { bindings } = createRequire(import.meta.url)('./native-role-pins.cjs');
const repository = fileURLToPath(new URL('../../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const signingSourcePaths = ['vendor/provided/execute-development-signing.mjs', 'vendor/provided/plan-development-dp.mjs', 'vendor/provided/authenticate-development-profile.mjs', 'vendor/provided/prepare-development-dp.mjs', 'vendor/provided/native-role-pins.cjs', 'scripts/lib/provided-signing-policy.mjs'];
const stable = value => JSON.stringify(value, (_, v) => v && !Array.isArray(v) && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort()) : v);
function relative(p) { if (typeof p !== 'string' || !p || path.isAbsolute(p) || p.includes('\\') || p.split('/').some(s => !s || s === '.' || s === '..')) throw Error('invalid-relative-path'); return p; }
function regular(p, max = 1024 * 1024 * 1024) {
  if (!path.isAbsolute(p) || fs.realpathSync(p) !== p) throw Error('noncanonical-input');
  const fd = fs.openSync(p, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try { const s = fs.fstatSync(fd); if (!s.isFile() || s.uid !== process.getuid() || s.nlink !== 1 || s.mode & 0o022 || s.size > max) throw Error('unsafe-regular-input'); const bytes = fs.readFileSync(fd); if (bytes.length !== s.size) throw Error('input-changed'); return bytes; }
  finally { fs.closeSync(fd); }
}
function pin(p, sha) { const bytes = regular(p); if (!/^[a-f0-9]{64}$/.test(sha ?? '') || hash(bytes) !== sha) throw Error('input-pin-mismatch'); return bytes; }
function command(args) {
  const result = spawnSync('/usr/bin/codesign', args, { encoding: 'utf8', env: { PATH: '/usr/bin:/bin', LC_ALL: 'C', ...(process.env.HOME ? { HOME: process.env.HOME } : {}) }, timeout: 120000, maxBuffer: 2 * 1024 * 1024 });
  if (result.error || result.signal || result.status !== 0) { const error = Error('codesign-command-failed'); error.exitCode = result.status; error.signal = result.signal; throw error; }
  return result;
}
function plist(bytes) { const r = spawnSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '--', '-'], { input: bytes, encoding: 'utf8', timeout: 10000, maxBuffer: 1048576 }); if (r.status !== 0) throw Error('invalid-plist'); return JSON.parse(r.stdout); }
export function developmentSnapshot(root) {
  if (!path.isAbsolute(root) || fs.realpathSync(root) !== root || !fs.lstatSync(root).isDirectory()) throw Error('invalid-package-root');
  const files = [];
  function walk(dir) { for (const name of fs.readdirSync(dir).sort()) { const p = path.join(dir, name), s = fs.lstatSync(p), rel = path.relative(root, p); if (s.isSymbolicLink()) { const link = fs.readlinkSync(p); if (path.isAbsolute(link) || !fs.realpathSync(p).startsWith(root + '/')) throw Error('escaping-package-link'); files.push({ path: rel, link }); } else if (s.isDirectory()) walk(p); else files.push({ path: rel, sha256: hash(regular(p)), mode: s.mode & 0o777 }); } }
  walk(root); return files;
}
export function signingChanges(before, after, targets) {
  const first = new Map(before.map(f => [relative(f.path), f])), last = new Map(after.map(f => [relative(f.path), f])), changes = [];
  for (const p of new Set([...first.keys(), ...last.keys()])) {
    const a = first.get(p), b = last.get(p); if (stable(a) === stable(b)) continue;
    const code = targets.some(t => t.codeRelative === p);
    const signature = targets.some(t => t.kind === 'bundle' && p.startsWith(t.path + '/Contents/_CodeSignature/'));
    // Even allowed code must remain a regular executable with unchanged mode.
    if (!code && !signature || code && (!a || !b || a.link || b.link || a.mode !== b.mode) || signature && ((a?.link || b?.link) || !b)) throw Error('untargeted-or-unsafe-package-change');
    changes.push({ path: p, beforeSha256: a?.sha256 ?? null, afterSha256: b?.sha256 ?? null });
  }
  return changes;
}
export function validateDevelopmentSigningPlan(plan, proposal) {
  if (plan.version !== 1 || plan.kind !== 'development-diagnostic-signing-review-only' || plan.signingAuthorized !== false || plan.dpExecutionAuthorized !== false || plan.signingPerformed !== false || plan.defaultAdhocChanged !== false || !plan.packageRoot || !Array.isArray(plan.inventory) || plan.inventory.length === 0 || plan.targets.length !== 11 || plan.artifacts.length !== 11) throw Error('complete-development-plan-required');
  const group = proposal.identityInspection.teamId + '.dev.aux.dp.' + proposal.exactScope;
  if (proposal.exactScope !== hash(proposal.exactExistingDisposableHome) || proposal.proposedFirstAndOnlySharedGroup !== group || plan.postSigningGate.expectedDevelopmentCertificateSha1 !== proposal.identityInspection.publicCertificateSha1 || plan.postSigningGate.expectedTeam !== proposal.identityInspection.teamId || plan.postSigningGate.expectedFirstAndOnlyGroup !== group || plan.diagnostic.scope !== proposal.exactScope || plan.diagnostic.home !== proposal.exactExistingDisposableHome) throw Error('proposal-authority-mismatch');
  if (stable(orderedDevelopmentTargets(plan.targets).map(t => t.path)) !== stable(plan.targets.map(t => t.path))) throw Error('signing-order-mismatch');
  const paths = new Set();
  for (const f of plan.inventory) { relative(f.path); if (paths.has(f.path)) throw Error('duplicate-inventory-path'); paths.add(f.path); }
  const files = new Map(plan.inventory.map(f => [f.path, f]));
  for (const t of plan.targets) {
    const d = developmentTargets.find(d => d.path === t.path);
    if (!d || t.kind !== d.kind || t.signer !== d.signer || t.role !== d.role || t.authorized !== false || (d.executable ? t.executable !== d.executable : d.kind === 'macho' && t.executable !== undefined)) throw Error('unreviewed-target');
    if (d.role === 'browser' && !/^Contents\/MacOS\/[A-Za-z0-9._ -]+$/.test(t.executable ?? '')) throw Error('unreviewed-browser-main');
    const code = t.kind === 'bundle' ? t.path + '/' + t.executable : t.path;
    if (t.codeRelative !== code || files.get(code)?.sha256 !== t.sha256 || !/^[a-f0-9]{64}$/.test(t.sha256)) throw Error('target-inventory-mismatch');
    const review = d.role === 'browser' ? { version: 1, executable: t.executable, sha256: t.sha256, observedEntitlements: t.observed.entitlements, signatureFlags: t.observed.flags, entitlements: { preserveKeys: t.capabilities.preserveKeys, removeKeys: t.capabilities.removeKeys } } : undefined;
    const expected = developmentCapabilities(d, t.observed, proposal, review);
    if (stable(expected) !== stable(t.capabilities) || t.preserveRuntime !== t.observed.flags.includes('runtime')) throw Error('capability-policy-mismatch');
    if (t.signer === 'development' && !t.profile) throw Error('authenticated-profile-required');
  }
  for (const role of ['daemon', 'cli']) {
    const p = `Aux.app/Contents/Resources/aux/apps/${role}/Aux ${role === 'daemon' ? 'Daemon' : 'CLI'}.app/Contents/Resources/native/provided-native.node`;
    if (files.get(p)?.sha256 !== bindings[role].sha256) throw Error('original-role-binding-mismatch');
  }
}
export function verifyPostSigningClaims(step, observation, metadata, leaf, proposal) {
  if (stable(observation.entitlements) !== stable(step.capabilities.values) || observation.flags.includes('runtime') !== step.preserveRuntime || observation.flags.some(f => !['adhoc', 'runtime'].includes(f)) || observation.flags.includes('adhoc') !== (step.signer === 'adhoc')) throw Error('post-sign-capability-or-flags-mismatch');
  if (step.signer === 'development') {
    if (leaf?.sha1 !== proposal.identityInspection.publicCertificateSha1.toUpperCase() || leaf.team !== proposal.identityInspection.teamId || metadata.team !== proposal.identityInspection.teamId) throw Error('post-sign-leaf-or-team-mismatch');
  } else if (metadata.team !== 'not set') throw Error('adhoc-unexpected-team');
}
/** Bounded callback sequence used with fixed production commands below; fixtures
 * exercise cancellation/failure bookkeeping without signing or native execution. */
export function signingSequence(steps, { before, sign, after, persist }) {
  const state = { attempted: [], verified: [], current: null, signingAttempted: false, complete: false };
  try {
    for (const step of steps) {
      state.current = step.path; before(step);
      state.signingAttempted = true; state.attempted.push(step.path); persist(state);
      sign(step); const proof = after(step); state.verified.push(proof); persist(state);
    }
    state.current = null; state.complete = true; persist(state); return state;
  } catch (error) { state.error = { code: /^[a-z-]{1,80}$/.test(error.message) ? error.message : 'signing-failed', exitCode: Number.isInteger(error.exitCode) ? error.exitCode : null, signal: typeof error.signal === 'string' ? error.signal : null }; persist(state); return state; }
}
export function executeDevelopmentSigning({ planPath, planSha256, receiptPath, mode = 'verify-only', testMacIdentifier, cmsInputs = [], allowAppleTrustNetwork = false }) {
  if (typeof allowAppleTrustNetwork !== 'boolean') throw Error('explicit-trust-network-boolean-required');
  if (!['verify-only', 'sign'].includes(mode)) throw Error('unsupported-mode');
  const planBytes = pin(planPath, planSha256), plan = JSON.parse(planBytes);
  const proposalPath = path.join(repository, 'docs/integration/proposed/development-dp-signing/proposal.json'), proposalBytes = regular(proposalPath), proposal = JSON.parse(proposalBytes);
  if (hash(proposalBytes) !== plan.proposalSha256) throw Error('proposal-source-pin-mismatch');
  validateDevelopmentSigningPlan(plan, proposal);
  if (typeof plan.allowAppleTrustNetwork !== 'boolean' || plan.allowAppleTrustNetwork !== allowAppleTrustNetwork) throw Error('trust-network-mode-mismatch');
  const packageRoot = plan.packageRoot;
  if (packageRoot === proposal.exactExistingDisposableHome || packageRoot.startsWith(proposal.exactExistingDisposableHome + '/')) throw Error('package-overlaps-approved-home');
  receiptPath = path.resolve(receiptPath);
  if (fs.existsSync(receiptPath) || fs.realpathSync(path.dirname(receiptPath)) !== path.dirname(receiptPath) || [packageRoot, proposal.exactExistingDisposableHome].some(p => receiptPath === p || receiptPath.startsWith(p + '/'))) throw Error('new-outside-receipt-required');
  const initial = developmentSnapshot(packageRoot);
  if (stable(initial) !== stable(plan.inventory)) throw Error('full-package-prehash-mismatch');
  const packageReport = JSON.parse(regular(path.join(packageRoot, 'package.json')));
  if (packageReport.implementation !== 'supplied' || packageReport.signed !== false || !packageReport.sourceRoots?.length) throw Error('unsigned-supplied-copy-required');
  for (const p of packageReport.sourceRoots) { const source = fs.realpathSync(p); if (source === packageRoot || source.startsWith(packageRoot + '/') || packageRoot.startsWith(source + '/')) throw Error('copy-overlaps-source'); }
  const artifacts = new Map(plan.artifacts.map(a => [a.path, a.sha256]));
  if (artifacts.size !== 11) throw Error('duplicate-entitlement-artifact');
  function staticStep(step, index) {
    const code = path.join(packageRoot, step.codeRelative); pin(code, step.sha256);
    if (stable({ ...inspectSigningCode(code), sha256: step.sha256 }) !== stable(step.observed)) throw Error('pre-sign-observation-changed');
    if (step.kind === 'bundle') { const info = plist(regular(path.join(packageRoot, step.path, 'Contents/Info.plist'))); if ('Contents/MacOS/' + info.CFBundleExecutable !== step.executable || step.signer === 'development' && info.CFBundleIdentifier !== proposal.proposedDpHosts.find(h => h.role === step.role).bundleIdentifier) throw Error('bundle-identity-main-mismatch'); }
    const ent = path.join(path.dirname(planPath), index + '.entitlements.plist');
    if (stable(plist(pin(ent, artifacts.get(ent)))) !== stable(step.capabilities.values)) throw Error('entitlement-artifact-mismatch');
    return ent;
  }
  const entitlementPaths = plan.targets.map(staticStep);
  for (const role of ['daemon', 'cli']) command(['--verify', '--strict', '--all-architectures', path.join(packageRoot, `Aux.app/Contents/Resources/aux/apps/${role}/Aux ${role === 'daemon' ? 'Daemon' : 'CLI'}.app/Contents/Resources/native/provided-native.node`)]);
  for (const t of plan.targets.filter(t => t.signer === 'development')) pin(path.join(packageRoot, t.path, 'Contents/embedded.provisionprofile'), t.profile.sha256);
  const sources = signingSourcePaths.map(p => ({ path: p, sha256: hash(regular(path.join(repository, p))) }));
  function checkSources() { for (const p of sources) pin(path.join(repository, p.path), p.sha256); }
  const base = { version: 1, implementation: 'exact-development-signing', planPath, planSha256, proposalSha256: plan.proposalSha256, packageRoot, mode, sources, dpExecuted: false, productLaunched: false, defaultAdhocChanged: false, allowAppleTrustNetwork, packageReportIsHistoricalInput: true, initialSnapshotSha256: hash(stable(initial)), expectedDevelopmentLeafSha1: proposal.identityInspection.publicCertificateSha1, expectedTeam: proposal.identityInspection.teamId, expectedGroup: proposal.proposedFirstAndOnlySharedGroup };
  const receiptFd = fs.openSync(receiptPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  function write(value) { const bytes = JSON.stringify({ ...base, ...value }, null, 2) + '\n'; fs.ftruncateSync(receiptFd, 0); fs.writeSync(receiptFd, bytes, 0, 'utf8'); fs.fsyncSync(receiptFd); }
  write({ status: 'preflight-in-progress', signingAttempted: false, signed: false, productionReady: false });
  if (mode === 'verify-only') { const result = { status: 'static-plan-verified-no-signing', signingAttempted: false, cmsReauthenticated: false, signed: false, productionReady: false, targetCount: 11 }; write(result); fs.closeSync(receiptFd); return { ...base, ...result }; }
  let workspace, live = initial, sequence, lastProgress = null, attempted = false, certificateSequence = 0;
  const cmsProofs = [];
  function authenticate(step) {
    if (typeof testMacIdentifier !== 'string' || !testMacIdentifier || cmsInputs.length !== 3 || new Set(cmsInputs.map(i => i.role)).size !== 3) throw Error('exact-three-cms-inputs-required');
    const input = cmsInputs.find(i => i.role === step.role); if (!input || input.receiptSha256 !== step.profile.helperReceiptSha256) throw Error('cms-receipt-pin-mismatch');
    pin(input.receiptPath, input.receiptSha256);
    const proof = authenticateDevelopmentProfile({ profilePath: path.join(packageRoot, step.path, 'Contents/embedded.provisionprofile'), expectedProfileSha256: step.profile.sha256, receiptPath: input.receiptPath, proposalPath, role: step.role, testMacIdentifier, now: new Date().toISOString(), allowAppleTrustNetwork });
    checkProfileReport(proof, { cmsSha256: step.profile.sha256, proposalSha256: plan.proposalSha256, role: step.role, testMacIdentifier, now: new Date().toISOString(), allowAppleTrustNetwork });
    cmsProofs.push(proof); return proof;
  }
  function observeSigned(step, index) {
    command(['--verify', '--strict', '--all-architectures', path.join(packageRoot, step.path)]);
    const code = path.join(packageRoot, step.codeRelative), observed = inspectSigningCode(code), display = command(['-dvvv', code]);
    const match = display.stderr.match(/^TeamIdentifier=(.+)$/m); if (!match) throw Error('missing-post-sign-team');
    let leaf = null;
    if (step.signer === 'development') {
      const prefix = path.join(workspace, `cert-${index}-${certificateSequence++}-`); command(['-d', '--extract-certificates=' + prefix, code]);
      const certificate = new X509Certificate(regular(prefix + '0', 1048576));
      const units = [...certificate.subject.matchAll(/^OU=(.+)$/gm)].map(m => m[1]);
      leaf = { sha1: certificate.fingerprint.replaceAll(':', '').toUpperCase(), team: units.length === 1 ? units[0] : null };
    }
    verifyPostSigningClaims(step, observed, { team: match[1] }, leaf, proposal);
    if (step.signer === 'development') authenticate(step);
    return { path: step.path, signer: step.signer, sha256: hash(regular(code)), flags: observed.flags, entitlements: observed.entitlements, team: match[1], leaf, profileSha256: step.profile?.sha256 ?? null };
  }
  try {
    workspace = fs.mkdtempSync(path.join(path.dirname(receiptPath), '.aux-development-signing-')); fs.chmodSync(workspace, 0o700);
    // All three are authenticated before any private-key/signing operation.
    for (const step of plan.targets.filter(t => t.signer === 'development')) authenticate(step);
    if (stable(developmentSnapshot(packageRoot)) !== stable(live)) throw Error('package-changed-before-signing');
    sequence = signingSequence(plan.targets, {
      before(step) {
        checkSources(); pin(planPath, planSha256); if (hash(regular(proposalPath)) !== plan.proposalSha256) throw Error('proposal-changed');
        if (stable(developmentSnapshot(packageRoot)) !== stable(live)) throw Error('concurrent-package-change');
        staticStep(step, plan.targets.indexOf(step));
        const hosts = plan.targets.filter(t => t.signer === 'development');
        for (const host of hosts) { const latest = [...cmsProofs].reverse().find(p => p.role === host.role); if (!latest || Date.now() - Date.parse(latest.evaluatedAt) > 60000) authenticate(host); }
        if (step.signer === 'development') authenticate(step);
      },
      sign(step) { const index = plan.targets.indexOf(step); command(['--force', '--sign', step.signer === 'adhoc' ? '-' : proposal.identityInspection.publicCertificateSha1, '--timestamp=none', ...(step.preserveRuntime ? ['--options', 'runtime'] : []), '--entitlements', entitlementPaths[index], path.join(packageRoot, step.path)]); },
      after(step) { const proof = observeSigned(step, plan.targets.indexOf(step)), next = developmentSnapshot(packageRoot); signingChanges(live, next, [step]); signingChanges(initial, next, plan.targets); live = next; return proof; },
      persist(state) { lastProgress = structuredClone(state); attempted ||= state.signingAttempted; write({ status: state.complete ? 'signing-complete-final-verification-pending' : state.signingAttempted ? 'signing-in-progress-or-partial' : 'refused-before-signing', packageMayBePartiallySigned: state.signingAttempted && !state.complete, sequence: state, cmsProofs, signed: state.signingAttempted ? null : false, productionReady: false }); },
    });
    if (!sequence.complete) throw Error(sequence.error?.code ?? 'signing-incomplete');
    // Enclosing bundle sealing must not invalidate already signed inner code.
    const finalProofs = plan.targets.map(observeSigned), final = developmentSnapshot(packageRoot), changes = signingChanges(initial, final, plan.targets);
    const finalFiles = new Map(final.map(f => [f.path, f]));
    for (const [i, step] of plan.targets.entries()) {
      if (finalFiles.get(step.codeRelative)?.sha256 !== finalProofs[i].sha256 || step.profile && finalFiles.get(step.path + '/Contents/embedded.provisionprofile')?.sha256 !== step.profile.sha256) throw Error('post-sign-concurrent-target-change');
    }
    checkSources(); pin(planPath, planSha256);
    const result = { status: 'signed-and-verified', signed: true, signingAttempted: true, packageMayBePartiallySigned: false, sequence, finalProofs, cmsProofs, finalInventory: final, finalSnapshotSha256: hash(stable(final)), changes, untargetedLeavesPreserved: true, productionReady: false, remaining: ['Actual original shared DP authority/runtime diagnostic has not been performed', 'New diagnostic preview must bind exact signed receipt/artifacts to scoped human authorization'] };
    write(result); return { ...base, ...result };
  } catch (error) {
    let finalInventory = null, preservationVerified = false;
    try { finalInventory = developmentSnapshot(packageRoot); signingChanges(initial, finalInventory, plan.targets); preservationVerified = true; } catch {}
    const result = { status: attempted ? 'failed-after-signing-attempt' : 'refused-before-signing', signed: attempted ? null : false, signingAttempted: attempted, packageMayBePartiallySigned: attempted, unsignedClaimMade: false, sequence: sequence ?? lastProgress, code: /^[a-z-]{1,80}$/.test(error.message) ? error.message : 'development-signing-failed', finalInventory, untargetedLeavesPreserved: preservationVerified, cmsProofs, productionReady: false };
    write(result); return { ...base, ...result };
  } finally { if (workspace) { try { fs.rmSync(workspace, { recursive: true, force: true }); } catch {} } fs.closeSync(receiptFd); }
}

/** Read-only filesystem validation of a reviewed success receipt. Signature and
 * CMS proofs are from the pinned executor receipt; this never invokes hosts. */
export function verifySignedDevelopmentReceipt({ receiptPath, receiptSha256 }) {
  const receipt = JSON.parse(pin(receiptPath, receiptSha256));
  if (receipt.version !== 1 || receipt.implementation !== 'exact-development-signing' || receipt.status !== 'signed-and-verified' || receipt.mode !== 'sign' || receipt.signed !== true || receipt.signingAttempted !== true || receipt.packageMayBePartiallySigned !== false || receipt.untargetedLeavesPreserved !== true || receipt.dpExecuted !== false || receipt.productLaunched !== false || receipt.finalProofs?.length !== 11) throw Error('verified-signing-success-receipt-required');
  const plan = JSON.parse(pin(receipt.planPath, receipt.planSha256));
  const proposalBytes = regular(path.join(repository, 'docs/integration/proposed/development-dp-signing/proposal.json')), proposal = JSON.parse(proposalBytes);
  if (hash(proposalBytes) !== receipt.proposalSha256 || receipt.proposalSha256 !== plan.proposalSha256 || receipt.packageRoot !== plan.packageRoot || receipt.allowAppleTrustNetwork !== plan.allowAppleTrustNetwork) throw Error('signed-receipt-proposal-plan-mismatch');
  validateDevelopmentSigningPlan(plan, proposal);
  if (!Array.isArray(receipt.sources) || receipt.sources.length !== signingSourcePaths.length || new Set(receipt.sources.map(s => s.path)).size !== signingSourcePaths.length || receipt.sources.some(s => !signingSourcePaths.includes(s.path)) || receipt.expectedDevelopmentLeafSha1 !== proposal.identityInspection.publicCertificateSha1 || receipt.expectedTeam !== proposal.identityInspection.teamId || receipt.expectedGroup !== proposal.proposedFirstAndOnlySharedGroup) throw Error('signed-receipt-source-authority-mismatch');
  for (const source of receipt.sources) pin(path.join(repository, relative(source.path)), source.sha256);
  const current = developmentSnapshot(receipt.packageRoot);
  if (stable(current) !== stable(receipt.finalInventory) || hash(stable(current)) !== receipt.finalSnapshotSha256) throw Error('signed-package-changed');
  const files = new Map(current.map(f => [f.path, f]));
  for (const [index, step] of plan.targets.entries()) {
    const proof = receipt.finalProofs[index];
    if (proof.path !== step.path || proof.signer !== step.signer || proof.sha256 !== files.get(step.codeRelative)?.sha256 || proof.profileSha256 !== (step.profile?.sha256 ?? null)) throw Error('signed-target-proof-mismatch');
    verifyPostSigningClaims(step, { flags: proof.flags, entitlements: proof.entitlements }, { team: proof.team }, proof.leaf, proposal);
    if (step.profile && files.get(step.path + '/Contents/embedded.provisionprofile')?.sha256 !== step.profile.sha256) throw Error('signed-profile-changed');
  }
  signingChanges(plan.inventory, current, plan.targets);
  return receipt;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw Error('Usage: execute-development-signing.mjs explicit-execution-request.json');
  const result = executeDevelopmentSigning(JSON.parse(regular(path.resolve(process.argv[2]), 1048576)));
  console.log(JSON.stringify({ status: result.status, signingAttempted: result.signingAttempted, signed: result.signed, productionReady: false }));
  if (!['signed-and-verified', 'static-plan-verified-no-signing'].includes(result.status)) process.exitCode = 1;
}
