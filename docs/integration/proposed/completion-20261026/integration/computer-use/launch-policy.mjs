import { createHash } from 'node:crypto';
export function computerUseLaunchPolicy(sourceBytes, deliveredBytes) {
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
  const sourceSha256 = 'debc03deb3f94eb7e8b50fa88d25e617f970b75f1e515b757b131655ad3dde51';
  if (sha256(sourceBytes) !== sourceSha256 || deliveredBytes.length < sourceBytes.length || deliveredBytes.length > 64 * 1024 * 1024)
    throw Error('Computer Use launch policy requires the exact supplied identity derivative and bounded delivered image.');
  return { format: 'aux.computer-use.fixed-helper-launch.v1', sourceSha256, sha256: sha256(deliveredBytes), bytes: deliveredBytes.length,
    identifier: 'dev.aux.browser.computer-use', team: '9F2JXY8TCK' };
}
