import { createHash, randomBytes } from 'node:crypto';
import { chmodSync, lstatSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export function validateDisposableProfile(userDataDir) {
  const root = realpathSync(userDataDir);
  const rel = relative(realpathSync('/tmp'), root).split(sep);
  if (rel.length !== 2 || !/^aux-native-journey-[A-Za-z0-9]+$/.test(rel[0]) || rel[1] !== 'profile')
    throw new Error('Expected an owned /tmp/aux-native-journey-*/profile directory');
  const info = lstatSync(userDataDir);
  if (!info.isDirectory() || info.isSymbolicLink() || info.uid !== process.getuid?.() || info.mode & 0o077)
    throw new Error('Disposable Profile directory must be owner-only');
  return root;
}
export function nativeProfileName(name) {
  if (typeof name !== 'string' || !/^(Default|Profile \d+)$/.test(name)) throw new Error('Invalid native Profile name');
  return name;
}
export function createDevelopmentAcceptance({ userDataDir, profiles = ['Default'], features, sourceCommit, token = randomBytes(32).toString('hex') }) {
  const root = validateDisposableProfile(userDataDir);
  if (!/^[a-f0-9]{40}(\+dirty)?$/.test(sourceCommit)) throw new Error('Acceptance needs a native source identity');
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid development acceptance token');
  if (!Array.isArray(features) || !features.length || features.some(feature => typeof feature !== 'string' || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(feature)))
    throw new Error('Acceptance features must be nonempty registry feature names');
  if (!Array.isArray(profiles) || !profiles.length) throw new Error('Acceptance needs native Profiles');
  const markers = [...new Set(profiles)].map(name => {
    nativeProfileName(name);
    const directory = resolve(root, name, 'Aux Runtime Data');
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (realpathSync(directory) !== directory) throw new Error('Acceptance directory must not contain symlinks');
    const marker = join(directory, 'development-acceptance.json');
    writeFileSync(marker, JSON.stringify({ version: 1, sourceCommit,
      tokenHash: createHash('sha256').update(token).digest('hex'), features: [...new Set(features)], createdAt: Date.now(),
    }), { mode: 0o600, flag: 'wx' });
    chmodSync(marker, 0o600);
    return marker;
  });
  return { token, env: { AUX_DEV_ACCEPTANCE_TOKEN: token }, markers };
}
