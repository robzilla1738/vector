// Explicit input only; no profile discovery, signing, credentials or provisioning.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sourcePaths } from './build-profile-cms.mjs';
import { validateDevelopmentProfileMetadata } from './prepare-development-dp.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = data => createHash('sha256').update(data).digest('hex');
function readRegular(file, limit) {
  file = path.resolve(file);
  if (fs.realpathSync(file) !== file) throw Error('Canonical regular input required');
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const s = fs.fstatSync(fd);
    if (!s.isFile() || s.size <= 0 || s.size > limit || s.mode & 0o022) throw Error('Regular bounded nonshared input required');
    const bytes = fs.readFileSync(fd);
    if (bytes.length !== s.size || bytes.length > limit) throw Error('Input changed');
    return bytes;
  } finally { fs.closeSync(fd); }
}
/** Pure joining gate: authored fixtures cannot establish real CMS authentication. */
export function validateAuthenticatedProfile(reply, bytes, host, proposal, options) {
  if (reply?.version !== 1 || reply.authenticated !== true || reply.offline !== true || reply.positiveRevocationRequired !== true || reply.policy !== 'AppleOSXProvisioningProfileSigning' || reply.signingAuthorized !== false || reply.cmsSha256 !== hash(bytes) || !/^[a-f0-9]{64}$/.test(reply.payloadSha256 ?? '')) throw Error('Exact authenticated offline CMS result required');
  validateDevelopmentProfileMetadata(reply.profile, host, proposal, options);
  return { version: 1, cmsSignatureVerified: true, appleProvisioningPolicyVerified: true, offlinePositiveRevocationVerified: true, metadataClaimsMatch: true, cmsSha256: reply.cmsSha256, payloadSha256: reply.payloadSha256, role: host.role, evaluatedAt: options.now, reviewedDeviceSha256: hash(options.testMacIdentifier), profileCreationDate: reply.profile.CreationDate, profileExpirationDate: reply.profile.ExpirationDate, signingAuthorized: false, requiredNext: 'Explicit owner authorization and final exact-byte package/signing review; this read-only result does not authorize signing or provisioning' };
}
export function authenticateDevelopmentProfile({ profilePath, expectedProfileSha256, receiptPath, proposalPath, role, testMacIdentifier, now }) {
  if (!Number.isFinite(Date.parse(now)) || Math.abs(Date.now() - Date.parse(now)) > 60000) throw Error('Current review time within 60 seconds required');
  if (!/^[a-f0-9]{64}$/.test(expectedProfileSha256 ?? '')) throw Error('Explicit reviewed profile SHA256 required');
  const bytes = readRegular(profilePath, 2 * 1024 * 1024);
  if (hash(bytes) !== expectedProfileSha256) throw Error('Reviewed profile bytes changed');
  const receipt = JSON.parse(readRegular(receiptPath, 1048576));
  if (receipt.version !== 1 || receipt.implementation !== 'offline-apple-profile-cms' || receipt.buildExitCode !== 0 || receipt.outputs?.length !== 1 || receipt.sources?.length !== sourcePaths.length) throw Error('Actual CMS helper build receipt required');
  for (const p of sourcePaths) if (!receipt.sources.some(s => s.path === p && s.sha256 === hash(readRegular(path.join(root, p), 1048576)))) throw Error('CMS helper source mismatch');
  const output = receipt.outputs[0];
  if (!path.isAbsolute(output.path) || path.basename(output.path) !== 'aux-profile-cms-auth' || hash(readRegular(output.path, 16 * 1024 * 1024)) !== output.sha256) throw Error('CMS helper artifact mismatch');
  const proposal = JSON.parse(readRegular(proposalPath, 1048576));
  const host = proposal.proposedDpHosts?.find(h => h.role === role);
  if (!host || proposal.signingAuthorized !== false) throw Error('Exact proposed host required');
  // No inherited DYLD, trust overrides, original home, or executable lookup.
  const child = spawnSync(output.path, ['--authenticated-json'], { input: bytes, encoding: 'utf8', env: { PATH: '/usr/bin:/bin', LC_ALL: 'C' }, timeout: 20000, maxBuffer: 6 * 1024 * 1024 });
  if (child.error) throw Error('CMS helper unavailable or timed out');
  let reply; try { reply = JSON.parse(child.stdout); } catch { throw Error('CMS helper refused without valid report'); }
  if (child.status !== 0) throw Error('CMS authentication refused at ' + (/^[a-z-]{1,80}$/.test(reply.stage ?? '') ? reply.stage : 'unknown') + ' OSStatus=' + (Number.isInteger(reply.osStatus) ? reply.osStatus : 'unknown'));
  return { ...validateAuthenticatedProfile(reply, bytes, host, proposal, { now, testMacIdentifier }), helperSha256: output.sha256, receiptSha256: hash(readRegular(receiptPath, 1048576)), proposalSha256: hash(readRegular(proposalPath, 1048576)) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw Error('Usage: authenticate-development-profile.mjs explicit-request.json');
  const request = JSON.parse(readRegular(process.argv[2], 1048576));
  console.log(JSON.stringify(authenticateDevelopmentProfile(request)));
}
