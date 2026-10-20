/** Review artifact generation only. No signing, native execution or profile discovery. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { inspectSigningCode, policyForSigningTarget } from '../../scripts/lib/provided-signing-policy.mjs';
import { nativePackagingManifest } from './native-packaging-manifest.mjs';
import { xmlPlist } from './prepare-development-dp.mjs';
const { bindings } = createRequire(import.meta.url)('./native-role-pins.cjs');
const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const prefix = 'Aux.app/Contents/Resources/aux';
const daemon = `${prefix}/apps/daemon/Aux Daemon.app`, cli = `${prefix}/apps/cli/Aux CLI.app`;
const importer = `${daemon}/Contents/Applications/Aux Password Importer.app`;
export const developmentTargets = [
  { path: 'Aux.app', kind: 'bundle', role: 'browser', signer: 'adhoc' },
  { path: `${prefix}/apps/computer-use/Aux Computer Use.app`, executable: 'Contents/MacOS/aux-computer-use', kind: 'bundle', signer: 'adhoc' },
  { path: importer, executable: 'Contents/MacOS/aux-password-importer', kind: 'bundle', signer: 'adhoc' },
  { path: `${importer}/Contents/PlugIns/AsidePasswordImporterProvider.appex`, executable: 'Contents/MacOS/aux-password-importer-provider', kind: 'bundle', signer: 'adhoc' },
  { path: `${cli}/Contents/MacOS/aux-cli`, kind: 'macho', signer: 'adhoc', emptyCapabilities: true },
  { path: `${prefix}/native/libaux-native-boundary.dylib`, kind: 'macho', signer: 'adhoc' },
  ...[daemon, cli].map(app => ({ path: `${app}/Contents/Resources/native/aux-native-guard.node`, kind: 'macho', signer: 'adhoc' })),
  { path: daemon, executable: 'Contents/MacOS/aux-daemon', kind: 'bundle', role: 'daemon', signer: 'development' },
  { path: cli, executable: 'Contents/MacOS/aux-cli-sea', kind: 'bundle', role: 'cli-sea', signer: 'development', policyPath: `${cli}/Contents/MacOS/aux-cli-sea` },
  { path: `${prefix}/native/Aux Native Carrier.app`, executable: 'Contents/MacOS/aux-native-carrier', kind: 'bundle', role: 'carrier', signer: 'development', policyPath: `${prefix}/native/aux-native-carrier` },
];
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort()));
function regular(file, limit = 512 * 1024 * 1024) {
  if (!path.isAbsolute(file) || fs.realpathSync(file) !== file) throw Error('Canonical input required');
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try { const s = fs.fstatSync(fd); if (!s.isFile() || s.uid !== process.getuid() || s.nlink !== 1 || s.mode & 0o022 || s.size > limit) throw Error('Private regular bounded input required'); return fs.readFileSync(fd); }
  finally { fs.closeSync(fd); }
}
function json(file) { return JSON.parse(regular(file)); }
function expectedJson(file, expected) { const b = regular(file); if (!/^[a-f0-9]{64}$/.test(expected ?? '') || hash(b) !== expected) throw Error('Explicit reviewed metadata hash mismatch'); return JSON.parse(b); }
function plist(file) { const p = spawnSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '--', '-'], { input: regular(file), encoding: 'utf8', timeout: 10000, maxBuffer: 1048576 }); if (p.status !== 0) throw Error('Copied plist unreadable'); return JSON.parse(p.stdout); }
export function developmentTargetDefinitions(passwordManagerExcluded = false) {
  if (typeof passwordManagerExcluded !== 'boolean') throw Error('Explicit password-manager topology required');
  return passwordManagerExcluded ? developmentTargets.filter(target => !target.path.startsWith(importer)) : developmentTargets;
}
export function orderedDevelopmentTargets(targets, { passwordManagerExcluded = false } = {}) {
  const definitions = developmentTargetDefinitions(passwordManagerExcluded), count = definitions.length;
  if (targets.length !== count || targets.filter(t => t.signer === 'adhoc').length !== count - 3 || targets.filter(t => t.signer === 'development').length !== 3 || new Set(targets.map(t => t.path)).size !== count || targets.some(t => !definitions.some(d => d.path === t.path && d.signer === t.signer))) throw Error('Exact reviewed ad hoc and three development targets required');
  return [...targets].sort((a, b) => b.path.split('/').length - a.path.split('/').length || (a.kind === 'macho' ? 0 : 1) - (b.kind === 'macho' ? 0 : 1) || a.path.localeCompare(b.path));
}
export function developmentCapabilities(def, observation, proposal, browserReview) {
  if (def.emptyCapabilities) {
    if (Object.keys(observation.entitlements).length || observation.flags.some(f => !['adhoc', 'linker-signed'].includes(f))) throw Error('Unexpected CLI wrapper capability');
    return { preserveKeys: [], removeKeys: [], addValues: {}, values: {} };
  }
  const old = policyForSigningTarget(def.policyPath ?? def.path, observation, browserReview);
  if (def.signer === 'adhoc') return { ...old, addValues: {}, values: Object.fromEntries(old.preserveKeys.map(k => [k, observation.entitlements[k]])) };
  const host = proposal.proposedDpHosts.find(h => h.role === def.role);
  if (!host) throw Error('Unreviewed development host');
  const expectedKeys = ['com.apple.application-identifier', 'com.apple.developer.team-identifier', 'keychain-access-groups'];
  const values = host.proposedEntitlements, addValues = {};
  if (values['com.apple.application-identifier'] !== proposal.identityInspection.teamId + '.' + host.bundleIdentifier || values['com.apple.developer.team-identifier'] !== proposal.identityInspection.teamId || canonical({ groups: values['keychain-access-groups'] }) !== canonical({ groups: [proposal.proposedFirstAndOnlySharedGroup] })) throw Error('Development identity mismatch');
  for (const [key, value] of Object.entries(values)) {
    if (old.preserveKeys.includes(key)) { if (observation.entitlements[key] !== value) throw Error('Capability changed'); }
    else { if (!expectedKeys.includes(key) && !(old.addDyldEnvironmentForBoundary && key === 'com.apple.security.cs.allow-dyld-environment-variables' && value === true)) throw Error('Unreviewed development capability'); addValues[key] = value; }
  }
  if (old.preserveKeys.some(k => !Object.hasOwn(values, k))) throw Error('Lost supplied capability');
  return { preserveKeys: old.preserveKeys, removeKeys: old.removeKeys, addValues, values };
}
// Pure report gate. A JSON claim is not an authority: reviewed report and actual
// helper/source/input hashes must also be verified by the filesystem entrypoint.
export function checkProfileReport(report, { cmsSha256, proposalSha256, role, now, testMacIdentifier, allowAppleTrustNetwork = false }) {
  if (!Number.isFinite(Date.parse(now)) || !Number.isFinite(Date.parse(report?.evaluatedAt)) || report.version !== 1 || !['cmsSignatureVerified', 'appleProvisioningPolicyVerified', 'metadataClaimsMatch'].every(k => report[k] === true) || report.offlinePositiveRevocationVerified !== !allowAppleTrustNetwork || report.onlinePositiveRevocationVerified !== allowAppleTrustNetwork || report.networkAccessAllowed !== allowAppleTrustNetwork || report.signingAuthorized !== false || report.cmsSha256 !== cmsSha256 || report.proposalSha256 !== proposalSha256 || report.role !== role || report.reviewedDeviceSha256 !== hash(testMacIdentifier) || !(Date.parse(report.profileCreationDate) <= Date.parse(now) && Date.parse(report.profileExpirationDate) > Date.parse(now)) || Math.abs(Date.parse(report.evaluatedAt) - Date.parse(now)) > 300000) throw Error('Fresh exact CMS/profile authentication report required');
}
function samePreparedLeaf(expected, actual) {
  return actual && (expected.link !== undefined
    ? actual.link === expected.link && actual.sha256 === undefined
    : actual.link === undefined && actual.sha256 === expected.sha256 && actual.mode === expected.mode);
}
/** Existing prepared resources remain exact; explicitly reviewed additions such
 * as the eight diagnostic leaves/profiles are captured by the full snapshot. */
export function assertPreparedOverlayInventory(prepared, packaged) {
  const actual = new Map(packaged.map(f => [f.path, f]));
  if (actual.size !== packaged.length) throw Error('Duplicate packaged inventory leaf');
  let matched = 0;
  for (const leaf of prepared) {
    if (!leaf.path.startsWith('Resources/aux/')) continue;
    if (!samePreparedLeaf(leaf, actual.get('Aux.app/Contents/' + leaf.path))) throw Error('Full package is not exact prepared three-host overlay');
    matched++;
  }
  return matched;
}
function snapshot(directory) {
  const files = [];
  function walk(dir) { for (const name of fs.readdirSync(dir).sort()) { const absolute = path.join(dir, name), stat = fs.lstatSync(absolute), relative = path.relative(directory, absolute); if (stat.isDirectory() && !stat.isSymbolicLink()) walk(absolute); else if (stat.isSymbolicLink()) { const link = fs.readlinkSync(absolute), real = fs.realpathSync(absolute); if (path.isAbsolute(link) || !real.startsWith(directory + '/')) throw Error('Escaping package link'); files.push({ path: relative, link }); } else { files.push({ path: relative, sha256: hash(regular(absolute, 1024 * 1024 * 1024)), mode: stat.mode & 0o777 }); } } }
  walk(directory); return files;
}
export function planDevelopmentDp(request) {
  const { preparationPath, preparationSha256, boundaryReceiptPath, packageRoot, output, now, testMacIdentifier, browserReview, profileReports = [], allowAppleTrustNetwork = false, passwordManagerExcluded = false } = request;
  if (typeof allowAppleTrustNetwork !== 'boolean' || typeof passwordManagerExcluded !== 'boolean') throw Error('Explicit Boolean trust/topology mode required');
  if (!Number.isFinite(Date.parse(now)) || Math.abs(Date.now() - Date.parse(now)) > 60000 || typeof testMacIdentifier !== 'string' || !testMacIdentifier) throw Error('Current review time and reviewed test Mac required');
  const proposalPath = path.join(root, 'docs/integration/proposed/development-dp-signing/proposal.json'), proposalBytes = regular(proposalPath), proposal = JSON.parse(proposalBytes), proposalSha256 = hash(proposalBytes);
  if (proposal.signingAuthorized !== false || proposal.provisioningOperationsAuthorized !== false || proposal.dpExecutionAuthorizedByThisProposal !== false || proposal.proposedDpHosts.length !== 3) throw Error('Fixed unauthorized development proposal required');
  const prep = expectedJson(preparationPath, preparationSha256), receiptBytes = regular(boundaryReceiptPath), receipt = JSON.parse(receiptBytes);
  if (prep.kind !== 'unsigned-development-preparation-not-executable-signing-policy' || prep.signingPerformed !== false || prep.dpExecuted !== false || prep.proposalSha256 !== proposalSha256 || prep.boundaryReceiptSha256 !== hash(receiptBytes) || receipt.buildExitCode !== 0 || receipt.mapFixturePassed !== true) throw Error('Concrete unsigned preparation/current boundary receipt required');
  for (const pin of nativePackagingManifest().sources) if (!receipt.sources.some(p => p.path === pin.path && p.sha256 === pin.sha256)) throw Error('Current boundary source pin mismatch');
  for (const name of ['aux-native-carrier', 'libaux-native-boundary.dylib', 'aux-native-guard.node', 'aux-cli-launcher']) { const pin = receipt.outputs?.find(p => path.basename(p.path) === name); if (!pin || hash(regular(pin.path)) !== pin.sha256) throw Error('Boundary artifact pin mismatch'); }
  const preparationRoot = path.dirname(preparationPath);
  const blocked = [], artifacts = [];
  for (const file of prep.inventory) { const p = path.join(preparationRoot, file.path), actual = file.link !== undefined ? { link: fs.readlinkSync(p) } : { sha256: hash(regular(p)), mode: fs.lstatSync(p).mode & 0o777 }; if (!samePreparedLeaf(file, actual)) throw Error('Prepared three-host input changed'); }
  if (!packageRoot) blocked.push('Full disposable package with reviewed three-host overlay is absent; outer browser/computer-use cannot be fabricated');
  let inventory = [], targets = [];
  if (packageRoot) {
    if (!path.isAbsolute(packageRoot) || fs.realpathSync(packageRoot) !== packageRoot || packageRoot === proposal.exactExistingDisposableHome || packageRoot.startsWith(proposal.exactExistingDisposableHome + '/')) throw Error('Canonical copied package outside approved home required');
    const packageReport = json(path.join(packageRoot, 'package.json'));
    if (packageReport.implementation !== 'supplied' || packageReport.signed !== false || packageReport.app !== 'Aux.app' || !packageReport.sourceRoots?.length) throw Error('Unsigned supplied full package required');
    for (const source of packageReport.sourceRoots) { const s = fs.realpathSync(source); if (s === packageRoot || s.startsWith(packageRoot + '/') || packageRoot.startsWith(s + '/')) throw Error('Package/source overlap'); }
    inventory = snapshot(packageRoot);
    const live = new Map(inventory.map(f => [f.path, f]));
    assertPreparedOverlayInventory(prep.inventory, inventory);
    for (const role of ['daemon', 'cli']) if (live.get(`${prefix}/apps/${role}/Aux ${role === 'daemon' ? 'Daemon' : 'CLI'}.app/Contents/Resources/native/provided-native.node`)?.sha256 !== bindings[role].sha256) throw Error('Original role binding changed');
    if (passwordManagerExcluded && inventory.some(file => file.path.startsWith(importer + '/'))) throw Error('Excluded password importer is present');
    for (const d of developmentTargetDefinitions(passwordManagerExcluded)) {
      const def = d.role === 'browser' ? { ...d, executable: browserReview?.executable } : d;
      if (d.role === 'browser' && !/^Contents\/MacOS\/[A-Za-z0-9._ -]+$/.test(def.executable ?? '')) throw Error('Reviewed browser executable required');
      const codeRelative = def.executable ? def.path + '/' + def.executable : def.path, file = path.join(packageRoot, codeRelative), bytes = regular(file);
      if (!['cffaedfe', 'cefaedfe', 'feedfacf', 'feedface', 'cafebabe', 'bebafeca', 'cafebabf', 'bfbafeca'].includes(bytes.subarray(0, 4).toString('hex'))) throw Error('Target is not Mach-O');
      if (def.kind === 'bundle' && 'Contents/MacOS/' + plist(path.join(packageRoot, def.path, 'Contents/Info.plist')).CFBundleExecutable !== def.executable) throw Error('Bundle main mismatch');
      const observation = { ...inspectSigningCode(file), sha256: hash(bytes) }, capabilities = developmentCapabilities(def, observation, proposal, browserReview);
      const step = { ...def, codeRelative, sha256: observation.sha256, observed: observation, capabilities, preserveRuntime: observation.flags.includes('runtime'), authorized: false };
      if (def.signer === 'development') {
        const embedded = path.join(packageRoot, def.path, 'Contents/embedded.provisionprofile');
        if (!fs.existsSync(embedded)) blocked.push(`Missing actual embedded profile for ${def.role}`);
        else {
          const entry = profileReports.find(r => r.role === def.role); if (!entry) blocked.push(`Missing reviewed CMS report for ${def.role}`);
          else {
            const report = expectedJson(entry.reportPath, entry.reportSha256), helperBytes = regular(entry.helperReceiptPath), helper = JSON.parse(helperBytes);
            if (hash(helperBytes) !== entry.helperReceiptSha256 || report.receiptSha256 !== entry.helperReceiptSha256 || helper.implementation !== 'offline-apple-profile-cms' || helper.buildExitCode !== 0 || helper.outputs?.length !== 1 || helper.outputs[0].sha256 !== report.helperSha256 || hash(regular(helper.outputs[0].path)) !== report.helperSha256) throw Error('Actual CMS helper receipt/output mismatch');
            for (const p of ['vendor/provided/native/profile-cms-auth.mm', 'vendor/provided/build-profile-cms.mjs']) if (!helper.sources.some(s => s.path === p && s.sha256 === hash(regular(path.join(root, p))))) throw Error('CMS source drift');
            checkProfileReport(report, { cmsSha256: hash(regular(embedded)), proposalSha256, role: def.role, now, testMacIdentifier, allowAppleTrustNetwork });
            step.profile = { sha256: report.cmsSha256, authenticationReportSha256: entry.reportSha256, helperReceiptSha256: entry.helperReceiptSha256, expirationDate: report.profileExpirationDate };
          }
        }
      }
      targets.push(step);
    }
    targets = orderedDevelopmentTargets(targets, { passwordManagerExcluded });
    if (JSON.stringify(snapshot(packageRoot)) !== JSON.stringify(inventory)) throw Error('Package changed during inspection');
  }
  if (profileReports.length && (!packageRoot || new Set(profileReports.map(r => r.role)).size !== profileReports.length || profileReports.some(r => !['daemon', 'cli-sea', 'carrier'].includes(r.role)))) throw Error('Unreviewed CMS report role');
  blocked.push('Root must bind this final exact plan and new diagnostic preview to scoped human authorization before execution; generator grants no permission', 'Development carrier source/layout hook must be reviewed, compiled and pinned before diagnostic execution', 'Post-sign signatures/entitlements/preserved-byte receipt and newly approved diagnostic preview required');
  const out = path.resolve(output);
  if (fs.existsSync(out) || fs.realpathSync(path.dirname(out)) !== path.dirname(out) || [proposal.exactExistingDisposableHome, packageRoot, preparationRoot].filter(Boolean).some(p => out === p || out.startsWith(p + '/') || p.startsWith(out + '/'))) throw Error('New disjoint review output required');
  fs.mkdirSync(out, { mode: 0o700 });
  for (const [index, step] of targets.entries()) {
    const entitlementsFile = path.join(out, `${index}.entitlements.plist`); fs.writeFileSync(entitlementsFile, xmlPlist(step.capabilities.values), { flag: 'wx', mode: 0o600 });
    artifacts.push({ path: entitlementsFile, sha256: hash(regular(entitlementsFile)) });
    step.prospectiveCodesign = { tool: '/usr/bin/codesign', args: ['--force', '--sign', step.signer === 'adhoc' ? '-' : proposal.identityInspection.publicCertificateSha1, '--timestamp=none', ...(step.preserveRuntime ? ['--options', 'runtime'] : []), '--entitlements', entitlementsFile, path.join(packageRoot, step.path)], authorized: false, executed: false };
  }
  const plan = { version: 1, kind: 'development-diagnostic-signing-review-only', createdAt: now, allowAppleTrustNetwork, proposalSha256, preparationSha256, boundaryReceiptSha256: hash(receiptBytes), packageRoot: packageRoot ?? null, passwordManagerExcluded, targetTopology: developmentTargetDefinitions(passwordManagerExcluded), targets, inventory, artifacts, blocked, postSigningGate: { expectedDevelopmentCertificateSha1: proposal.identityInspection.publicCertificateSha1, expectedTeam: proposal.identityInspection.teamId, expectedFirstAndOnlyGroup: proposal.proposedFirstAndOnlySharedGroup, inspectActualLeafCertificate: true, placeholderAutomaticSelectorIsNotIdentityProof: true, exactPostSignCodeProfileEntitlementsAndPreservedInventoryReceiptRequired: true, implementedByThisGenerator: false }, signingAuthorized: false, dpExecutionAuthorized: false, signingPerformed: false, nativeExecuted: false, defaultAdhocChanged: false, diagnostic: { home: proposal.exactExistingDisposableHome, scope: proposal.exactScope, sharedGroup: proposal.proposedFirstAndOnlySharedGroup, hosts: proposal.proposedDpHosts.map(h => ({ role: h.role, executable: `${prefix}/${h.proposedBundleRelativeToAuxRoot}/${h.proposedMainExecutable}`, allowedOriginalCommands: ['install-status', 'get-public-keys', 'cdp-sign'], initialize: h.role === 'daemon' ? 'Only once after exact fresh-row baseline and explicit new preview approval; existing marker must verify/refuse' : 'Never' })), carrierPath: `${prefix}/native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier`, cliLaunch: `${cli}/Contents/MacOS/aux-cli`, executionImplemented: false, oldApprovalPreviewReusable: false, prerequisites: ['Exact signed artifact hashes and profile gate current at execution', 'Actual Aux-only group enforcement/default-group inspect with original selectors', 'Exact-scope helper receipt/group review; existing helper cannot be silently reused as development authority', 'New explicit human-approved preview; preserve prior stage/home; no unseen family/biometric/UI grants'] } };
  const bytes = JSON.stringify(plan, null, 2) + '\n'; fs.writeFileSync(path.join(out, 'development-review-plan.json'), bytes, { flag: 'wx', mode: 0o600 });
  return { output: out, planSha256: hash(bytes), signingPerformed: false, nativeExecuted: false, actualTargetCount: targets.length, blocked };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw Error('Usage: plan-development-dp.mjs explicit-request.json');
  console.log(JSON.stringify(planDevelopmentDp(json(path.resolve(process.argv[2])))));
}
