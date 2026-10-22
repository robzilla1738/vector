import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { nativePackagingManifest } from './native-packaging-manifest.mjs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('./native/', import.meta.url));
const lock = fileURLToPath(new URL('../../scripts/native-build.py', import.meta.url));
export function buildProvidedNativeBoundary(output, nodeInclude = process.env.AUX_NODE_INCLUDE ?? join(homedir(), '.aside/runtime/node/include/node')) {
  output = resolve(output);
  mkdirSync(output, { recursive: true });
  const receipt = join(output, 'native-build-receipt.json');
  rmSync(receipt, { force: true });
  const repository = fileURLToPath(new URL('../../', import.meta.url));
  const sources = nativePackagingManifest(output).sources;
  const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
  const headers = ['node_api.h', 'js_native_api.h', 'js_native_api_types.h', 'node_api_types.h'].map((name) => ({ path: join(resolve(nodeInclude), name), sha256: sha(join(resolve(nodeInclude), name)) }));
  const invocations = [];
  const carrier = join(output, 'aux-native-carrier');
  const boundary = join(output, 'libaux-native-boundary.dylib');
  const fixture = join(output, 'keychain-query-map-test');
  const inboxFixture = join(output, 'agent-inbox-keychain-map-test');
  const guard = join(output, 'aux-native-guard.node');
  const launcher = join(output, 'aux-cli-launcher');
  const admissionFixture = join(output, 'packaged-identity-admission-test');
  const compile = (args) => {
    const command = ['xcrun', 'clang++', '-std=c++20', '-fobjc-arc', '-framework', 'Foundation', '-framework', 'Security', '-framework', 'LocalAuthentication', ...args];
    invocations.push(command);
    const result = spawnSync('python3', [lock, ...command], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Provided native boundary compilation failed');
  };
  compile(['-dynamiclib', join(source, 'keychain-query-map.mm'), join(source, 'agent-inbox-keychain-map.mm'), join(source, 'keychain-interpose.mm'), join(source, 'sea-resource-pointer.mm'), '-o', boundary]);
  compile([join(source, 'native-carrier.mm'), join(source, 'agent-inbox-master-key.mm'), '-o', carrier]);
  compile([join(source, 'keychain-query-map.mm'), join(source, 'keychain-query-map-test.mm'), '-o', fixture]);
  compile([join(source, 'agent-inbox-keychain-map.mm'), join(source, 'agent-inbox-keychain-map-test.mm'), '-o', inboxFixture]);
  compile(['-shared', '-undefined', 'dynamic_lookup', '-I', resolve(nodeInclude), join(source, 'node-boundary-guard.mm'), '-o', guard]);
  compile([join(source, 'cli-launcher.mm'), '-o', launcher]);
  compile([join(source, 'packaged-identity-admission-test.mm'), '-o', admissionFixture]);
  for (const pin of [...sources.map((e) => ({ ...e, path: resolve(repository, e.path) })), ...headers]) {
    if (sha(pin.path) !== pin.sha256) throw new Error('Native source/header changed during build; no receipt');
  }
  for (const executable of [fixture, inboxFixture, admissionFixture]) {
    const tested = spawnSync('python3', [lock, executable], { stdio: 'inherit' });
    if (tested.status !== 0) throw new Error('Pure native mapping fixture failed; no receipt');
  }
  const outputs = [carrier, boundary, guard, launcher, fixture, inboxFixture, admissionFixture].map((path) => ({ path, sha256: sha(path) }));
  writeFileSync(receipt, `${JSON.stringify({ version: 1, implementation: 'supplied-boundary', sources, headers, invocations, outputs, buildExitCode: 0, mapFixturePassed: true, cliAdmissionFixturePassed: true }, null, 2)}\n`, { flag: 'wx' });
  return { carrier, boundary, fixture, inboxFixture, admissionFixture, guard, launcher, receipt };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = buildProvidedNativeBoundary(process.argv[2] ?? 'out/provided-native', process.argv[3]);
  console.log(JSON.stringify(result));
}
