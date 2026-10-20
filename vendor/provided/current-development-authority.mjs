/** Explicit current copied-app workflow. No provisioning, key reset, implicit
 * initialization, launch, or owner-profile discovery. Prepare only after root
 * hands over an exact completed package; sign/verify are separate commands. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fixedScope, regular, json, pinnedJson, freshOutput, prefix } from './development-dp-review.mjs';
import { developmentSnapshot, executeDevelopmentSigning, verifySignedDevelopmentReceipt } from './execute-development-signing.mjs';
import { prepareDevelopmentDpDiagnostic } from './prepare-development-dp-diagnostic.mjs';
import { authenticateDevelopmentProfile } from './authenticate-development-profile.mjs';
import { planDevelopmentDp } from './plan-development-dp.mjs';
import { inspectSigningCode } from '../../scripts/lib/provided-signing-policy.mjs';
import { createDevelopmentDpReview, runDevelopmentDpProbe } from './run-development-dp-probe.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sha = file => hash(regular(file));
const PUBLIC_PROFILE_SHA256 = 'faa4760e2746dcea329ad272390a33d9960c3419bb8b991654a35ac5b7ee1a6d';
const roles = [
  ['daemon', 'apps/daemon/Aux Daemon.app'],
  ['cli-sea', 'apps/cli/Aux CLI.app'],
  ['carrier', 'native/Aux Native Carrier.app'],
];
function writeNew(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); }
function canonicalDirectory(directory) {
  if (!path.isAbsolute(directory) || fs.realpathSync(directory) !== directory || !fs.lstatSync(directory).isDirectory()) throw Error('Canonical real directory required');
  return directory;
}
export function validateCurrentAuthorityRequest(request, scope) {
  if (request.packageHandoff !== true || request.localSigningAuthorized !== true || request.allowAppleTrustNetwork !== true || request.scope !== scope.policy.core.scope || request.home !== scope.policy.core.home || request.profileSha256 !== PUBLIC_PROFILE_SHA256 || !/^[a-f0-9]{64}$/.test(request.packageReportSha256 ?? '') || typeof request.testMacIdentifier !== 'string' || !request.testMacIdentifier) throw Error('Explicit exact-package signing handoff and existing scope required');
  if (request.operation !== 'verify-existing' || request.provisioningAllowed !== false || request.initializeAllowed !== false) throw Error('Only existing authority verification is authorized');
}
function authenticateProfiles(profiles, input, outputRoot) {
  const reports = [];
  for (const profile of profiles) {
    const proof = authenticateDevelopmentProfile({ profilePath: profile.path, expectedProfileSha256: profile.sha256, receiptPath: input.cmsReceiptPath, proposalPath: path.join(repository, 'docs/integration/proposed/development-dp-signing/proposal.json'), role: profile.role, testMacIdentifier: input.testMacIdentifier, now: new Date().toISOString(), allowAppleTrustNetwork: true });
    const reportPath = path.join(outputRoot, `profile-${profile.role}.json`); writeNew(reportPath, proof);
    reports.push({ role: profile.role, reportPath, reportSha256: sha(reportPath), helperReceiptPath: input.cmsReceiptPath, helperReceiptSha256: input.cmsReceiptSha256 });
  }
  return reports;
}
export function prepareCurrentDevelopmentAuthority(request) {
  const scope = fixedScope(); validateCurrentAuthorityRequest(request, scope);
  const packageRoot = canonicalDirectory(request.packageRoot), output = path.resolve(request.output);
  if (!packageRoot.startsWith(path.join(repository, 'out') + '/') || packageRoot === scope.policy.core.home || packageRoot.startsWith(scope.policy.core.home + '/')) throw Error('Copied project output required');
  const packageReport = pinnedJson(path.join(packageRoot, 'package.json'), request.packageReportSha256);
  if (packageReport.signed !== false || packageReport.implementation !== 'supplied' || packageReport.developmentDpLayout !== true || !packageReport.sourceRoots?.length) throw Error('Completed unsigned development package required');
  for (const source of packageReport.sourceRoots) {
    const real = canonicalDirectory(source);
    if (real === packageRoot || real.startsWith(packageRoot + '/') || packageRoot.startsWith(real + '/')) throw Error('Package must be separate from immutable source');
  }
  const resourceRoot = path.join(packageRoot, prefix), marker = json(path.join(resourceRoot, 'bundle.json'));
  if (marker.daemonRuntime !== 'provided-sea' || marker.nativeCarrierLayout !== 'profile-bundle' || fs.existsSync(path.join(resourceRoot, 'apps/daemon/Aux Daemon.app/Contents/Applications/Aux Password Importer.app'))) throw Error('Current SEA/no-password-manager topology required');
  const profile = regular(request.profileSourcePath, 2 * 1024 * 1024);
  if (hash(profile) !== PUBLIC_PROFILE_SHA256 || sha(request.cmsReceiptPath) !== request.cmsReceiptSha256 || sha(request.boundaryReceiptPath) !== packageReport.boundaryReceiptSha256) throw Error('Exact existing profile/current receipts required');
  // Validate the actual current CMS/device claims before any app mutation.
  for (const [role] of roles) authenticateDevelopmentProfile({ profilePath: request.profileSourcePath, expectedProfileSha256: PUBLIC_PROFILE_SHA256, receiptPath: request.cmsReceiptPath, proposalPath: path.join(repository, 'docs/integration/proposed/development-dp-signing/proposal.json'), role, testMacIdentifier: request.testMacIdentifier, now: new Date().toISOString(), allowAppleTrustNetwork: true });
  const baseline = developmentSnapshot(packageRoot);
  const targets = roles.map(([role, relative]) => ({ role, path: path.join(resourceRoot, relative, 'Contents/embedded.provisionprofile'), sha256: PUBLIC_PROFILE_SHA256 }));
  for (const target of targets) if (fs.existsSync(target.path) || fs.realpathSync(path.dirname(target.path)) !== path.dirname(target.path)) throw Error('Fresh canonical profile destinations required');
  freshOutput(output, [packageRoot, scope.policy.core.home]);
  const preparation = { version: 1, kind: 'unsigned-development-preparation-not-executable-signing-policy', method: 'current-completed-package-no-provisioning-project', proposalSha256: scope.proposalSha256, boundaryReceiptSha256: packageReport.boundaryReceiptSha256, resourceRoot, inventory: baseline.filter(leaf => leaf.path.startsWith(prefix + '/')).map(leaf => ({ ...leaf, path: 'Resources/aux/' + leaf.path.slice(prefix.length + 1) })), signingPerformed: false, dpExecuted: false, packageReportSha256: request.packageReportSha256 };
  const preparationPath = path.join(output, 'preparation.json'); writeNew(preparationPath, preparation);
  // Only the explicit profile/diagnostic additions touch the copied app. They
  // are captured by the subsequent full plan before the first signature.
  for (const target of targets) { fs.writeFileSync(target.path, profile, { flag: 'wx', mode: 0o600 }); if (sha(target.path) !== target.sha256) throw Error('Copied public profile mismatch'); }
  const overlay = prepareDevelopmentDpDiagnostic({ packageRoot, helperReceiptPath: request.diagnosticHelperReceiptPath, output: path.join(output, 'overlay') });
  const input = { ...request, output, packageRoot, profiles: targets, preparationPath, preparationSha256: sha(preparationPath), overlayPath: path.join(output, 'overlay/overlay.json'), overlaySha256: overlay.overlaySha256, signingPerformed: false, dpExecuted: false };
  const inputPath = path.join(output, 'inputs.json'); writeNew(inputPath, input);
  return { inputPath, inputSha256: sha(inputPath), profilesEmbedded: 3, diagnosticLeaves: overlay.copiedLeaves, provisioningPerformed: false, signingPerformed: false, dpExecuted: false };
}
export function planCurrentDevelopmentAuthority({ inputPath, inputSha256, output }) {
  const input = pinnedJson(inputPath, inputSha256), scope = fixedScope(); validateCurrentAuthorityRequest(input, scope);
  if (sha(path.join(input.packageRoot, 'package.json')) !== input.packageReportSha256 || sha(input.cmsReceiptPath) !== input.cmsReceiptSha256) throw Error('Prepared input changed');
  canonicalDirectory(path.dirname(path.resolve(output))); if (fs.existsSync(output)) throw Error('Fresh signing plan output required');
  const reportsRoot = path.join(input.output, 'cms-reports'); freshOutput(reportsRoot, [input.packageRoot, scope.policy.core.home]);
  const profileReports = authenticateProfiles(input.profiles, input, reportsRoot);
  const browserPath = path.join(input.packageRoot, 'Aux.app/Contents/MacOS/Aux'), observation = inspectSigningCode(browserPath);
  if (Object.keys(observation.entitlements).length) throw Error('Current browser capabilities need an explicit additional review');
  const browserReview = { version: 1, executable: 'Contents/MacOS/Aux', sha256: sha(browserPath), signatureFlags: observation.flags, observedEntitlements: observation.entitlements, entitlements: { preserveKeys: [], removeKeys: [] } };
  const planned = planDevelopmentDp({ preparationPath: input.preparationPath, preparationSha256: input.preparationSha256, boundaryReceiptPath: input.boundaryReceiptPath, packageRoot: input.packageRoot, output, now: new Date().toISOString(), testMacIdentifier: input.testMacIdentifier, browserReview, profileReports, allowAppleTrustNetwork: true, passwordManagerExcluded: true });
  const planPath = path.join(planned.output, 'development-review-plan.json');
  const execution = { planPath, planSha256: sha(planPath), receiptPath: path.join(input.output, 'signing-receipt.json'), mode: 'sign', testMacIdentifier: input.testMacIdentifier, allowAppleTrustNetwork: true, cmsInputs: input.profiles.map(profile => ({ role: profile.role, receiptPath: input.cmsReceiptPath, receiptSha256: input.cmsReceiptSha256 })) };
  const executionPath = path.join(input.output, 'signing-request.json'); writeNew(executionPath, execution);
  return { executionPath, executionSha256: sha(executionPath), planPath, planSha256: execution.planSha256, targetCount: planned.actualTargetCount, signingPerformed: false };
}
export function signCurrentDevelopmentAuthority({ inputPath, inputSha256, executionPath, executionSha256 }) {
  const input = pinnedJson(inputPath, inputSha256); validateCurrentAuthorityRequest(input, fixedScope());
  const execution = pinnedJson(executionPath, executionSha256), plan = pinnedJson(execution.planPath, execution.planSha256);
  if (plan.packageRoot !== input.packageRoot || plan.passwordManagerExcluded !== true || execution.receiptPath !== path.join(input.output, 'signing-receipt.json') || execution.mode !== 'sign') throw Error('Current exact signed plan required');
  return executeDevelopmentSigning(execution);
}
export async function verifyCurrentDevelopmentAuthority({ inputPath, inputSha256, signedReceiptPath, signedReceiptSha256 }) {
  const input = pinnedJson(inputPath, inputSha256); validateCurrentAuthorityRequest(input, fixedScope());
  const signed = verifySignedDevelopmentReceipt({ receiptPath: signedReceiptPath, receiptSha256: signedReceiptSha256 });
  if (signed.packageRoot !== input.packageRoot || signed.passwordManagerExcluded !== true) throw Error('Current no-password-manager signed copy required');
  const review = await createDevelopmentDpReview({ signedReceiptPath, signedReceiptSha256, overlayPath: input.overlayPath, overlaySha256: input.overlaySha256, cmsReceiptPath: input.cmsReceiptPath, cmsReceiptSha256: input.cmsReceiptSha256, testMacIdentifier: input.testMacIdentifier, allowAppleTrustNetwork: true, output: path.join(input.output, 'authority-review') });
  const reportPath = path.join(input.output, 'authority-verify.json');
  const result = await runDevelopmentDpProbe({ ...review, testMacIdentifier: input.testMacIdentifier, phase: 'verify-existing', reportPath });
  if (!result.ok || result.operation !== 'verify' || result.results.length !== 3) throw Error('Existing shared authority verification failed; no reset/initialization allowed');
  return { reportPath, reportSha256: sha(reportPath), ok: true, operation: 'verify', signedReceiptPath, signedReceiptSha256 };
}
export function validateLaunchAuthorityReport(report, receiptSha256, scope) {
  if (report.ok !== true || report.operation !== 'verify' || report.phase !== 'verify-existing' || report.scope !== scope || report.signedReceiptSha256 !== receiptSha256 || report.productMainStarted !== false || report.secretsLogged !== false || report.results?.length !== 3 || new Set(report.results.map(result => result.host)).size !== 3 || report.results.some(result => !['daemon','carrier','cli'].includes(result.host) || result.result?.ok !== true || result.result.rawCdpVerified !== true || result.result.httpDomainVerified !== true || result.result.tamperRefused !== true || result.result.originalFormatPreserved !== true || result.host !== 'carrier' && result.result.defaultGroupVerified !== true)) throw Error('Actual verify-only three-host authority receipt required');
  const keys = report.results.map(result => result.result.publicKeyHash), schemes = report.results.map(result => result.result.scheme);
  if (keys.some(key => !/^[a-f0-9]{64}$/.test(key ?? '')) || new Set(keys).size !== 1 || new Set(schemes).size !== 1) throw Error('All three hosts must prove the same actual authority');
}
export function currentSignedLaunchHandoff({ signedReceiptPath, signedReceiptSha256, authorityReportPath, authorityReportSha256, output }) {
  const scope = fixedScope(), receipt = verifySignedDevelopmentReceipt({ receiptPath: signedReceiptPath, receiptSha256: signedReceiptSha256 }), report = pinnedJson(authorityReportPath, authorityReportSha256);
  if (receipt.passwordManagerExcluded !== true) throw Error('Current no-password-manager copy required');
  validateLaunchAuthorityReport(report, signedReceiptSha256, scope.policy.core.scope);
  const app = path.join(receipt.packageRoot, 'Aux.app'), home = scope.policy.core.home, profile = path.join(home, 'preview-profile-local-browser-pass');
  const handoff = { version: 1, kind: 'signed-current-preview-launch-handoff', app, home, profile, scope: scope.policy.core.scope, signedReceiptPath, signedReceiptSha256, authorityReportPath, authorityReportSha256, packageReportIsHistoricalUnsignedInput: true, command: ['node','scripts/aux.mjs','--home',home,'--profile',profile,'--app',app,'--','--new-window','chrome://newtab/'], environment: { HOME: home, CFFIXED_USER_HOME: home, AUX_ENABLE_PROVIDED_NATIVE_CARRIER: '1', AUX_NATIVE_KEYCHAIN_SCOPE: scope.policy.core.scope }, removeEnvironment: ['AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN','AUX_PROVIDED_DP_PROBE','AUX_DP_PROBE_APPROVED','AUX_DP_PROBE_OPERATION','AUX_PROVIDED_NATIVE_LOAD_ONLY'], signed: true, sharedAuthorityVerified: true, accountStartupVerified: false, aiRequestVerified: false, launched: false };
  writeNew(path.resolve(output), handoff); return handoff;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, requestPath] = process.argv.slice(2), functions = { prepare: prepareCurrentDevelopmentAuthority, plan: planCurrentDevelopmentAuthority, sign: signCurrentDevelopmentAuthority, verify: verifyCurrentDevelopmentAuthority, handoff: currentSignedLaunchHandoff };
  if (!functions[mode] || !requestPath || process.argv.length !== 4) throw Error('Usage: current-development-authority.mjs prepare|plan|sign|verify|handoff explicit-request.json');
  const result = await functions[mode](json(path.resolve(requestPath))); console.log(JSON.stringify(mode === 'sign' ? { status: result.status, signed: result.signed, signingAttempted: result.signingAttempted, untargetedLeavesPreserved: result.untargetedLeavesPreserved, productionReady: false } : result));
  if (mode === 'sign' && result.signed !== true) process.exitCode = 1;
}
