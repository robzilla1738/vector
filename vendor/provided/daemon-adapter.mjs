/** Pinned supplied daemon adaptation. No substitute RPC handlers or plan bypasses. */
import { createHash } from 'node:crypto';
import { brandProductPreservingWires } from './wire-brand.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findMachOSeaSection, readSeaBlob, writeSeaBlob, injectMachOSeaBlob } from '../aside/lib/sea.mjs';

export const DAEMON_VERSION = '1.26.1016.1852';
export const DAEMON_BINARY_SHA256 = '60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286';
export const DAEMON_CODE_SHA256 = '5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5';
export const nativeShimPath = fileURLToPath(new URL('./aux-native.cjs', import.meta.url));
export const disposableTestShimPath = fileURLToPath(new URL('./daemon-native.cjs', import.meta.url));
const sha = (value) => createHash('sha256').update(value).digest('hex');
const edit = (name, from, to, count) => ({ name, from, to, count });

// Keep branding separate from the necessary platform/auth/local-service changes.
export const identityEdits = [
  edit('browser skill identity', 'aside-browser', 'aux-browser', 6),
  edit('embedded CLI guide', 'aside guide', 'aux guide', 5),
  edit('embedded CLI update', 'aside --update', 'aux --update', 2),
  edit('embedded CLI presence', '`aside` is not installed', '`aux` is not installed', 1),
  edit('environment namespace', 'ASIDE_', 'AUX_', 241),
  edit('bundle identity', 'at.studio.AsideBrowser', 'dev.aux.browser', 9),
  edit('Agent identity', 'fjdhphbdlfjogobdofoaagnlnkoibdge', 'gokkffaiccpmoeodpmeamcjajcagjmkm', 1),
  edit('Vault identity', 'clcdgiameigmljcbkkcbjiljinmfkncl', 'nbpghnminpifekjbgjefioajhiilbfla', 1),
  edit('home', 'path.join(os.homedir(),`.aside`)', 'path.join(os.homedir(),`.aux`)', 1),
  edit('daemon port', '||21420', '||21520', 1),
  edit('daemon URL', 'localhost:21420', 'localhost:21520', 1),
  edit('CDP URL', 'localhost:45103', 'localhost:45203', 1),
  edit('data key derivation namespace', 'aside.dk.', 'aux.dk.', 4),
];
export const platformEdits = [
  edit('computer-use executable', 'aside-computer-use', 'aux-computer-use', 3),
  edit('bundled computer-use source', 'COMPUTER_USE_HELPER_SOURCE_APP_PATH=process.platform', 'COMPUTER_USE_HELPER_SOURCE_APP_PATH=process.env.AUX_COMPUTER_USE_SOURCE_APP?path.resolve(process.env.AUX_COMPUTER_USE_SOURCE_APP):process.platform', 1),
  edit('secure storage namespace', 'AUX_KEYCHAIN_ID_PREFIX=`aside`', 'AUX_KEYCHAIN_ID_PREFIX=`aux`', 1),
  edit('bundled runtime path', 'AUX_RUNTIME_DIR=path.join(AUX_HOME_PATH,`runtime`)', 'AUX_RUNTIME_DIR=process.env.AUX_AGENT_RUNTIME_DIR?path.resolve(process.env.AUX_AGENT_RUNTIME_DIR):path.join(AUX_HOME_PATH,`runtime`)', 1),
  edit('explicit external skill synchronization', 'syncInstalledAsideBrowserSkills().catch(()=>{})', 'process.env.AUX_ALLOW_EXTERNAL_SKILL_SYNC===`1`&&syncInstalledAsideBrowserSkills().catch(()=>{})', 1),
  // Never fall through to the original binding (custom Keychain and OS grants).
  edit('isolated native binding', 'return[process.env.AUX_NATIVE_HELPER_BINDING,materializeEmbeddedBinding(),path.resolve(ei,`../Resources/native/aside-native.node`),path.resolve(ei,`native/aside-native.node`),...Cn.flatMap(Cn=>[path.resolve(packageRoot,`../../packages/native-helper-binding/prebuilds`,Cn,`aside-native.node`),path.resolve(packageRoot,`prebuilds`,Cn,`aside-native.node`)])].filter(Cn=>!!Cn)', 'return[path.resolve(ei,`../Resources/native/aux-native.cjs`)]', 1),
  edit('bundled memory startup provisioning', 'async function main(){(0,import_undici.setGlobalDispatcher)', 'async function main(){await (await import(`node:module`)).createRequire(process.execPath)(path.resolve(path.dirname(process.execPath),`../Resources/native/memory-bootstrap.cjs`))();(0,import_undici.setGlobalDispatcher)', 1),
  edit('telemetry disabled', 'new PostHog(ASIDE_POSTHOG_PROJECT_API_KEY,{'.replace('ASIDE_', 'AUX_'), 'new PostHog(AUX_POSTHOG_PROJECT_API_KEY,{disabled:!0,', 1),
  // Local-only boundary: rejected network requests retain their original errors;
  // nothing here invents plans, account state, search results or sync success.
  edit('hosted API unavailable locally', 'https://api.aside.com', 'http://127.0.0.1:9/aux-unavailable/api', 8),
  edit('legacy hosted API unavailable locally', 'https://api.asidehq.com', 'http://127.0.0.1:9/aux-unavailable/legacy-api', 1),
  edit('hosted releases unavailable locally', 'https://releases.aside.com', 'http://127.0.0.1:9/aux-unavailable/releases', 6),
  edit('hosted sharing unavailable locally', 'https://share.aside.com', 'http://127.0.0.1:9/aux-unavailable/share', 1),
];

export function adaptDaemonCode(original) {
  if (sha(original) !== DAEMON_CODE_SHA256) throw new Error('Supplied daemon code hash mismatch');
  let code = original;
  const applied = [];
  for (const e of [...identityEdits, ...platformEdits]) {
    const count = code.split(e.from).length - 1;
    if (count !== e.count) throw new Error(`${e.name}: expected ${e.count}, got ${count}`);
    code = code.split(e.from).join(e.to);
    applied.push({ name: e.name, count });
  }
  const branded = brandProductPreservingWires(code, { productCount: 654, wireCounts: {
    'AsideDaemonSessionToken ': 3, 'AsideSessionToken': 1,
    'Aside Daemon Auth v1': 2, 'Aside Daemon Dev Auth v1': 1, 'Aside.': 78,
  } });
  code = branded.code;
  applied.push(...branded.edits);
  return { code, applied, sha256: sha(code) };
}

export function adaptDaemonBinary(original) {
  if (sha(original) !== DAEMON_BINARY_SHA256) throw new Error('Supplied daemon binary hash mismatch');
  const section = findMachOSeaSection(original);
  const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
  const result = adaptDaemonCode(blob.code);
  const binary = Buffer.from(original);
  injectMachOSeaBlob(binary, writeSeaBlob({ ...blob, code: result.code }));
  return { binary, codeSha256: result.sha256, applied: result.applied,
    assets: blob.assets.map(([name, data]) => ({ name, bytes: data.length, sha256: sha(data) })) };
}

export function readPinnedDaemon(binaryPath) { return adaptDaemonBinary(readFileSync(binaryPath)); }
