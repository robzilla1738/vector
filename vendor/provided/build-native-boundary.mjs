import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('./native/', import.meta.url));
const lock = fileURLToPath(new URL('../../scripts/native-build.py', import.meta.url));
export function buildProvidedNativeBoundary(output, nodeInclude = process.env.AUX_NODE_INCLUDE ?? join(homedir(), '.aside/runtime/node/include/node')) {
  output = resolve(output);
  mkdirSync(output, { recursive: true });
  const carrier = join(output, 'aux-native-carrier');
  const boundary = join(output, 'libaux-native-boundary.dylib');
  const fixture = join(output, 'keychain-query-map-test');
  const guard = join(output, 'aux-native-guard.node');
  const compile = (args) => {
    const result = spawnSync('python3', [lock, 'xcrun', 'clang++', '-std=c++20', '-fobjc-arc', '-framework', 'Foundation', '-framework', 'Security', ...args], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Provided native boundary compilation failed');
  };
  compile(['-dynamiclib', join(source, 'keychain-query-map.mm'), join(source, 'keychain-interpose.mm'), '-o', boundary]);
  compile([join(source, 'native-carrier.mm'), '-o', carrier]);
  compile([join(source, 'keychain-query-map.mm'), join(source, 'keychain-query-map-test.mm'), '-o', fixture]);
  compile(['-shared', '-undefined', 'dynamic_lookup', '-I', resolve(nodeInclude), join(source, 'node-boundary-guard.mm'), '-o', guard]);
  return { carrier, boundary, fixture, guard };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = buildProvidedNativeBoundary(process.argv[2] ?? 'out/provided-native', process.argv[3]);
  console.log(JSON.stringify(result));
}
