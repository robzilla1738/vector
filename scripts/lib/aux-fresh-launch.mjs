import {lstat, readFile, realpath} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {assertFreshAuxLaunchIdentity} from './aux-launch-identity.mjs';

// This confines the development launcher; native signed-policy and retained-FD
// checks remain responsible for installation/profile authorization.
export async function readFreshAuxLaunch(app, bundle) {
  const identity = assertFreshAuxLaunchIdentity(bundle);
  if (bundle.finalApp !== app || await realpath(app) !== app) {
    throw Error('Select the exact canonical fresh Aux candidate path.');
  }
  const policyPath = join(app, 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/AuxFreshBootstrapPolicy.json');
  const info = await lstat(policyPath);
  if (!info.isFile() || info.isSymbolicLink() || info.size < 1 || info.size > 65536 ||
      (info.mode & 0o022) || info.uid !== process.getuid()) {
    throw Error('The fixed fresh Aux policy must be a private-owner regular resource.');
  }
  const policy = JSON.parse(await readFile(policyPath, 'utf8'));
  const data = policy.browserStartup?.dataRoot;
  if (policy.format !== 'aux.fresh.bootstrap.policy.v8' || policy.role !== 'daemon' ||
      policy.browserStartup?.format !== 'aux.browser.ordinary-root-lease.v1' || typeof data !== 'string') {
    throw Error('The candidate does not contain the ordinary fresh native policy.');
  }
  const home = dirname(dirname(dirname(data)));
  const scope = dirname(home);
  if (!/^\/private\/tmp\/aux-fresh-browser-[A-Za-z0-9_-]+$/.test(scope) ||
      home !== join(scope, 'home') || data !== join(home, 'Library/Application Support/Aux') ||
      policy.browserStartup.cacheRoot !== join(home, 'Library/Caches/Aux') ||
      policy.canonicalPrivateParent !== join(scope, 'control') ||
      policy.canonicalTaskParent !== join(scope, 'tasks')) {
    throw Error('Fresh startup is confined to the candidate’s fixed disposable roots.');
  }
  for (const path of [scope, home, data, policy.browserStartup.cacheRoot,
                      policy.canonicalPrivateParent, policy.canonicalTaskParent]) {
    const entry = await lstat(path);
    if (!entry.isDirectory() || entry.isSymbolicLink() || entry.uid !== process.getuid() ||
        (entry.mode & 0o7777) !== 0o700 || await realpath(path) !== path) {
      throw Error(`Fresh Aux requires an existing canonical private directory: ${path}`);
    }
  }
  return {identity, scope, home, profile: data};
}
