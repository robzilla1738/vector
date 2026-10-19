/** Inventory only: never loads native code or calls Security APIs. */
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
export function nativePackagingManifest(output = 'out/reuse-inspection/dry-run') {
  const sources = ['aux-native.cjs', 'native-role-pins.cjs', 'build-native-boundary.mjs', 'native/keychain-query-map.h',
    'native/keychain-query-map.mm', 'native/keychain-interpose.mm', 'native/sea-resource-pointer.mm', 'native/native-carrier.mm',
    'native/node-boundary-guard.mm', 'native/cli-launcher.mm', 'native/keychain-query-map-test.mm'].map((name) => {
    const path = resolve(repository, 'vendor/provided', name);
    return { path: relative(repository, path), sha256: digest(path) };
  });
  const outputs = [
    ['aux-native-carrier', 'native/aux-native-carrier'],
    ['libaux-native-boundary.dylib', 'native/libaux-native-boundary.dylib'],
    ['aux-native-guard.node', ['apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-native-guard.node', 'apps/cli/Aux CLI.app/Contents/Resources/native/aux-native-guard.node']],
    ['keychain-query-map-test', null],
    ['aux-cli-launcher', 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli'],
  ].map(([name, destination]) => {
    const path = resolve(repository, output, name);
    let stat;
    try { stat = lstatSync(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat && (!stat.isFile() || stat.isSymbolicLink())) throw new Error('Nonregular native build output');
    return { path, destination, present: Boolean(stat), sha256: stat ? digest(path) : null };
  });
  return { version: 1, verification: 'inventory-only; compilation/load/DP acceptance tracked separately',
    productionReady: false, sources, outputs,
    immutableOriginals: { daemon: 'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb', cli: '66368b6846d2842a5ee0ba3d5c6d5d094fd40098d7819dbb63ef17600c85c3fc' },
    immutableOriginal: { name: 'provided-native.node', sha256: 'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb' } };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(nativePackagingManifest(process.argv[2]), null, 2));
}
