// Run ONLY through scripts/native-build.py after integrator coordination.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url));
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export const sourcePaths = ['vendor/provided/native/profile-cms-auth.mm', 'vendor/provided/build-profile-cms.mjs'];
export function buildProfileCms(output) {
  output = path.resolve(output);
  if (fs.existsSync(output) || fs.realpathSync(path.dirname(output)) !== path.dirname(output)) throw Error('New canonical output required');
  fs.mkdirSync(output, { mode: 0o700 });
  const binary = path.join(output, 'aux-profile-cms-auth');
  const args = ['clang++', '-std=c++17', '-fobjc-arc', '-O2', '-mmacosx-version-min=13.0', path.join(root, sourcePaths[0]), '-framework', 'Foundation', '-framework', 'Security', '-o', binary];
  const sources = sourcePaths.map(p => ({ path: p, sha256: sha(path.join(root, p)) }));
  const sdkQuery = spawnSync('/usr/bin/xcrun', ['--show-sdk-path'], { encoding: 'utf8' });
  if (sdkQuery.status !== 0) throw Error('Cannot pin selected SDK');
  const sdk = sdkQuery.stdout.trim();
  const headers = ['CMSDecoder.h', 'SecPolicy.h', 'SecTrust.h'].map(name => { const file = path.join(sdk, 'System/Library/Frameworks/Security.framework/Headers', name); return { path: file, sha256: sha(file) }; });
  const built = spawnSync('/usr/bin/xcrun', args, { encoding: 'utf8', maxBuffer: 1048576 });
  if (built.status !== 0) throw Error('CMS helper compile failed: ' + (built.stderr ?? '').slice(0, 8192));
  for (const pin of sources) if (sha(path.join(root, pin.path)) !== pin.sha256) throw Error('Source changed during build');
  const receipt = { version: 1, implementation: 'offline-apple-profile-cms', sources, headers, tool: '/usr/bin/xcrun', args, buildExitCode: 0, outputs: [{ path: binary, sha256: sha(binary) }], executed: false, profileInputsRead: false };
  fs.writeFileSync(path.join(output, 'profile-cms-build-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return receipt;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw Error('Usage (under native-build.py): build-profile-cms.mjs NEW_OUTPUT');
  console.log(JSON.stringify(buildProfileCms(process.argv[2])));
}
