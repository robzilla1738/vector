import { applyAuxBrowserRouting } from './aux-browser-routing.mjs';
import { applyAuxCliDeviceRegistration } from './aux-cli-device-registration.mjs';
import { applyAuxColdEntryAdmission } from './aux-cold-entry-admission.mjs';
import { applyAuxRuntimeContractIdentity } from './aux-runtime-contract-identity.mjs';
import { applyAuxProviderIdentity } from './aux-provider-identity.mjs';
import { applyAuxProtocolIdentity, resolveProtocolIdentity, resolveStateIdentityVersion } from './aux-protocol-identity.mjs';
/** Rebrand the pinned supplied CLI without replacing its commands or RPC implementation. */
import { createHash } from 'node:crypto';
import { composeCloudDesktop } from './cloud-desktop-composition.mjs';
import { embedCloudSeaBlob } from './cloud-sea-embedding.mjs';
import { nativeDiagnosticExpression, nativeDiagnosticPredicate } from './native-diagnostic-hook.mjs';
import { brandProductPreservingWires } from './wire-brand.mjs';
import { CLI_COMMAND } from '../aside/patches/brand.mjs';
import { findMachOSeaSection, readSeaBlob, writeSeaBlob, injectMachOSeaBlob } from '../aside/lib/sea.mjs';

export const CLI_VERSION = '1.26.1015';
export const CLI_BINARY_SHA256 = '17a9477fd0e3fe523ff439b76823d7d44e8f3de49cca38b79bc7bed3c599320a';
export const CLI_CODE_SHA256 = '013dbd114ac574df1e4c72f53fd438d4b7da4d2aebbf3c45fa22a6fb2fe1dd62';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function adaptCliCode(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1, featureProfile = 'baseline') {
  resolveProtocolIdentity(identityProfile);
  resolveStateIdentityVersion(stateIdentityVersion, identityProfile);
  if (sha(original) !== CLI_CODE_SHA256) throw new Error('Supplied CLI code hash mismatch');
  let code = original;
  const applied = [];
  function edit(name, kind, find, replace, count) {
    const actual = code.split(find).length - 1;
    if (actual !== count) throw new Error(`${name}: expected ${count}, found ${actual}`);
    code = code.split(find).join(replace);
    applied.push({ name, kind, find, replace, count });
  }
  edit('environment namespace', 'identity', 'ASIDE_', 'AUX_', 49);
  edit('stable daemon port', 'identity', '21420', '21520', 2);
  edit('development daemon port', 'identity', '21421', '21521', 2);
  edit('CLI state directory', 'identity', 'path.join(os.homedir(), ".aside", "cli")', 'path.join(os.homedir(), ".aux", "cli")', 1);
  edit('skill identity', 'identity', 'aside-browser', 'aux-browser', 7);
  edit('program command', 'identity', '.name("aside")', '.name("aux")', 1);
  edit('usage command', 'branding', '       aside [options]', '       aux [options]', 1);
  // Keep the original failed-request behavior at the explicit local-only cloud boundary.
  edit('hosted API unavailable locally', 'integration', 'https://api.aside.com', 'http://127.0.0.1:9/aux-unavailable/api', 1);
  edit('hosted release/installer unavailable locally', 'integration', 'https://releases.aside.com', 'http://127.0.0.1:9/aux-unavailable/releases', 2);
  const binding = code.match(/function candidateBindingPaths\(\) \{[\s\S]*?\n\}/)?.[0];
  if (!binding) throw new Error('Supplied CLI native loader anchor missing');
  edit('isolated native binding', 'integration', binding,
    'function candidateBindingPaths() {\n\treturn [path.resolve(path.dirname(process.execPath), "../Resources/native/aux-native.cjs")];\n}', 1);
  edit('load-only native SEA diagnostic', 'integration', 'buildProgram(actions, CLI_VERSION).parseAsync(process.argv).catch', `if(${nativeDiagnosticPredicate}){await ${nativeDiagnosticExpression};}else buildProgram(actions, CLI_VERSION).parseAsync(process.argv).catch`, 1);
  const branded = brandProductPreservingWires(code, { productCount: 101, wireCounts: {
    'AsideDaemonSessionToken': 2, 'AsideSessionToken': 0,
    'Aside Daemon Auth v1': 1, 'Aside Daemon Dev Auth v1': 0, 'Aside.': 0,
  } });
  code = branded.code; applied.push(...branded.edits);
  const commands = [...code.matchAll(CLI_COMMAND)];
  if (commands.length !== 82) throw new Error(`CLI command branding drift: ${commands.length}`);
  for (const find of new Set(commands.map((match) => match[0])))
    edit('documented CLI command', 'branding', find, 'aux ', code.split(find).length - 1);
  const cloud = composeCloudDesktop({ component: 'cli', path: 'entry.mjs', text: code }, cloudOptions);
  const identity = applyAuxProtocolIdentity({ component: 'cli', text: cloud.text }, identityProfile, cloud.policy.mode);
  code = identity.text;
  applied.push(...cloud.anchors, ...identity.anchors);
  if (stateIdentityVersion === 2) {
    const provider = applyAuxProviderIdentity({ component: 'cli', path: 'entry.mjs', text: code, original, branding: 'aux' });
    const runtime = applyAuxRuntimeContractIdentity({ component: 'cli', path: 'entry.mjs', text: provider.text, original, branding: 'aux' });
    code = runtime.text; applied.push(...provider.anchors, ...runtime.anchors);
    const registration = applyAuxCliDeviceRegistration({component: 'cli', path: 'entry.mjs', text: code, original});
    code = registration.text; applied.push(...registration.anchors);
  }
  const admission = applyAuxColdEntryAdmission({component: 'cli', path: 'entry.mjs', text: code, original, stateIdentityVersion});
  code = admission.text; applied.push(...admission.anchors);
  if (!['baseline', 'desktop-v1'].includes(featureProfile)) throw Error('Unknown browser feature profile');
  if (featureProfile === 'desktop-v1') {
    const features = applyAuxBrowserRouting({component: 'cli', text: code});
    code = features.text; applied.push(...features.anchors);
  }
  return { code, applied, sha256: sha(code), ...(cloud.policy.mode !== 'local' ? { cloudPolicy: cloud.policy, cloudAnchors: cloud.anchors } : {}) };
}

export function adaptCliBinary(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1, featureProfile = 'baseline') {
  if (sha(original) !== CLI_BINARY_SHA256) throw new Error('Supplied CLI binary hash mismatch');
  const section = findMachOSeaSection(original);
  const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
  const result = adaptCliCode(blob.code, cloudOptions, identityProfile, stateIdentityVersion, featureProfile);
  const sea = writeSeaBlob({ ...blob, code: result.code });
  const binary = result.cloudPolicy ? embedCloudSeaBlob(original, sea) : Buffer.from(original);
  if (!result.cloudPolicy) injectMachOSeaBlob(binary, sea);
  return { binary, codeSha256: result.sha256, applied: result.applied,
    ...(result.cloudPolicy ? { cloudPolicy: result.cloudPolicy, cloudAnchors: result.cloudAnchors } : {}),
    assets: blob.assets.map(([name, bytes]) => ({ name, bytes: bytes.length, sha256: sha(bytes) })) };
}
