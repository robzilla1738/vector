/** Inventory only: never loads native code or calls Security APIs. */
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
export function nativePackagingManifest(output = 'out/reuse-inspection/dry-run') {
  const sources = ['aux-native.cjs', 'build-native-boundary.mjs', 'native/keychain-query-map.h',
    'native/keychain-query-map.mm', 'native/keychain-interpose.mm', 'native/native-carrier.mm',
    'native/node-boundary-guard.mm'].map((name) => {
    const path = resolve(repository, 'vendor/provided', name);
    return { path: relative(repository, path), sha256: digest(path) };
  });
  const outputs = [
    ['aux-native-carrier', 'native/aux-native-carrier'],
    ['libaux-native-boundary.dylib', 'native/libaux-native-boundary.dylib'],
    ['aux-native-guard.node', ['apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-native-guard.node', 'apps/cli/Aux CLI.app/Contents/Resources/native/aux-native-guard.node']],
    ['keychain-query-map-test', null],
  ].map(([name, destination]) => {
    const path = resolve(repository, output, name);
    let stat;
    try { stat = lstatSync(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat && (!stat.isFile() || stat.isSymbolicLink())) throw new Error('Nonregular native build output');
    return { path, destination, present: Boolean(stat), sha256: stat ? digest(path) : null };
  });
  return { version: 1, verification: 'inventory-only; compilation/load/DP acceptance tracked separately',
    productionReady: false, sources, outputs,
    immutableOriginal: { name: 'provided-native.node', sha256: 'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb' } };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(nativePackagingManifest(process.argv[2]), null, 2));
}
