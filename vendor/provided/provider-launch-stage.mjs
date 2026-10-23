/** Successor composition after the immutable crypto/utility projections.
 * Static staging only; no provider load, credentials, authority or startup. */
import { createHash } from 'node:crypto';
import { adaptDaemonCodeWithMacUtilities, buildDaemonNodeDevelopmentWithMacUtilities } from './aux-macos-utility-stage.mjs';
import { DAEMON_BINARY_SHA256 } from './daemon-adapter.mjs';
import { AUX_COLD_ENTRY_REFUSAL } from './aux-cold-entry-admission.mjs';
import { transformProviderFundedLaunch, providerFundedLaunchPolicy } from './provider-funded-launch.mjs';
import { applyOfficialChatGPT } from '../aside/patches/chatgpt.mjs';
import { findMachOSeaSection, readSeaBlob, writeSeaBlob, injectMachOSeaBlob } from '../aside/lib/sea.mjs';
import { embedCloudSeaBlob } from './cloud-sea-embedding.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');
const runtime = {
  sea: "auxChatGPTCreateRequire(import.meta.url)('node:path').resolve(process.execPath,'../../Resources/native/aux-chatgpt.cjs')",
  node: "auxChatGPTCreateRequire(import.meta.url)('node:url').fileURLToPath(new URL('../native/aux-chatgpt.cjs',import.meta.url))",
};
function compose(text, stateIdentityVersion, kind) {
  const launch = transformProviderFundedLaunch({component: 'daemon', path: 'entry.mjs', text, stateIdentityVersion});
  const official = applyOfficialChatGPT(launch.text, {runtimeExpression: runtime[kind]});
  const offset = stateIdentityVersion === 2 ? AUX_COLD_ENTRY_REFUSAL.length : 0;
  if (offset && !official.source.startsWith(AUX_COLD_ENTRY_REFUSAL)) throw Error('Provider successor must retain cold-entry refusal first');
  const code = official.source.slice(0, offset) + official.prelude + official.source.slice(offset);
  return {code, sha256: sha(code), applied: [...launch.anchors, ...official.patches]};
}
export function adaptProviderLaunchCode(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1) {
  const base = adaptDaemonCodeWithMacUtilities(original, cloudOptions, identityProfile, stateIdentityVersion);
  const output = compose(base.code, stateIdentityVersion, 'sea');
  return {...base, ...output, applied: [...base.applied, ...output.applied]};
}
export function adaptProviderLaunchBinary(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1) {
  if (sha(original) !== DAEMON_BINARY_SHA256) throw Error('Supplied provider-launch daemon binary differs');
  const section = findMachOSeaSection(original), blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
  const output = adaptProviderLaunchCode(blob.code, cloudOptions, identityProfile, stateIdentityVersion);
  const sea = writeSeaBlob({...blob, code: output.code});
  const binary = output.cloudPolicy ? embedCloudSeaBlob(original, sea) : Buffer.from(original);
  if (!output.cloudPolicy) injectMachOSeaBlob(binary, sea);
  return {binary, codeSha256: output.sha256, applied: output.applied,
    ...(output.cloudPolicy ? {cloudPolicy: output.cloudPolicy, cloudAnchors: output.cloudAnchors} : {}),
    assets: blob.assets.map(([name, bytes]) => ({name, bytes: bytes.length, sha256: sha(bytes)}))};
}
export function buildProviderLaunchNode(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1) {
  const base = buildDaemonNodeDevelopmentWithMacUtilities(original, cloudOptions, identityProfile, stateIdentityVersion);
  const index = base.files.find(file => file.path.endsWith('/node-development/index.mjs'));
  if (!index) throw Error('Actual supplied provider-launch entry required');
  const output = compose(index.bytes.toString('utf8'), stateIdentityVersion, 'node');
  const files = base.files.map(file => file === index ? {...file, bytes: Buffer.from(output.code), generatedBy: 'vendor/provided/provider-launch-stage.mjs'} : file);
  return {files, manifest: {...base.manifest, providerFundedEntry: {
    format: 'aux.provider-funded.entry.v1', policy: providerFundedLaunchPolicy,
    sourceSha256: sha(index.bytes), outputSha256: output.sha256,
    edits: output.applied, startupRefusalPreserved: stateIdentityVersion === 2, runtimeAccepted: false,
  }, files: files.map(({path, bytes, mode}) => ({path, bytes: bytes.length, mode, sha256: sha(bytes)}))}};
}
