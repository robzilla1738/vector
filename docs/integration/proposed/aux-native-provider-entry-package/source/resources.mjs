/** Generates only two exact dormant resources inside checked private assembly. */
import { readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { projectProviderNativeEntry } from './project.mjs';
const pins = JSON.parse(await readFile(new URL('../inputs.json', import.meta.url)));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const base = 'apps/daemon/Aux Daemon.app/Contents/Resources/';
export const defaultIndexPath = base + 'node-development/index.mjs';
async function pinned(path, expected) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Regular provider native resource required');
  const bytes = await readFile(path);
  if (hash(bytes) !== expected) throw Error('Provider native resource hash mismatch: ' + path);
  return bytes;
}
export async function currentNativeEntryResources({ repositoryRoot, index }) {
  for (const [path, expected] of Object.entries(pins.entryDependencies))
    await pinned(join(repositoryRoot, path), expected);
  const original = await pinned(join(repositoryRoot, pins.originalDaemon), pins.originalDaemonSha256);
  const entry = projectProviderNativeEntry(original, index, pins);
  const loader = await pinned(join(repositoryRoot, pins.loader.path), pins.loader.sha256);
  return [
    { path: base + 'node-development/aux-native-entry.mjs', bytes: entry, sha256: pins.entrySha256, mode: 0o644 },
    { path: base + 'native/aux-owned-native.cjs', bytes: loader, sha256: pins.loader.sha256, mode: 0o644 }
  ];
}
