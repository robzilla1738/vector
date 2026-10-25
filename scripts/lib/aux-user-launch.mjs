import {lstat, readFile, realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {assertNativeUserAuxLaunchIdentity} from './aux-launch-identity.mjs';

// Package preflight only: this must never derive, create or admit user roots.
// The actual native parent validates signatures and the sealed daemon policy.
export async function readNativeUserAuxLaunch(app, bundle) {
  const identity = assertNativeUserAuxLaunchIdentity(bundle);
  if (await realpath(app) !== app) throw Error('Select a canonical Aux app path.');
  const path = join(app, 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/AuxFreshBootstrapPolicy.json');
  const entry = await lstat(path);
  if (!entry.isFile() || entry.isSymbolicLink() || entry.nlink !== 1 ||
      entry.size < 1 || entry.size > 65536 || (entry.mode & 0o022) ||
      ![0, process.getuid()].includes(entry.uid)) {
    throw Error('The native-user Aux policy must be an owned regular package resource.');
  }
  const policy = JSON.parse(await readFile(path, 'utf8'));
  const keys = ['format', 'role', 'accessGroup', 'authoritySelection',
    'nativeHostLayout', 'taskLayout', 'storageLocation'].sort();
  if (Object.keys(policy).sort().join('\0') !== keys.join('\0') ||
      policy.format !== 'aux.fresh.bootstrap.policy.v9' || policy.role !== 'daemon' ||
      policy.authoritySelection !== 'aux.fresh.authority.host-availability.v1' ||
      typeof policy.accessGroup !== 'string' || !/^[A-Z0-9]{10}\.dev\.aux\.local$/.test(policy.accessGroup) ||
      policy.nativeHostLayout !== 'embedded-daemon' ||
      policy.taskLayout !== 'aux.native.task-control-split.v1' ||
      !policy.storageLocation || Object.keys(policy.storageLocation).join() !== 'format' ||
      policy.storageLocation.format !== 'aux.current-os-user-location.v1') {
    throw Error('The candidate does not contain the fixed native-user location policy.');
  }
  return {identity};
}
