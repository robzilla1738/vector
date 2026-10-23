import { AUX_COLD_ENTRY_REFUSAL } from '../../vendor/provided/aux-cold-entry-admission.mjs';
import {relocateAuxVisualBaseline, canonicalizeAuxVisualAssetInventory} from '../../vendor/provided/aux-asset-path-identity.mjs';
import {loadAuxBrowserIconReplacement} from './aux-browser-icon.mjs';
/** Read-only, fail-closed identity pairing and accepted visual payload checks.
 * These checks prove static agreement only, never an authenticated runtime handshake.
 */
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMachOSeaSection, readSeaBlob } from '../../vendor/aside/lib/sea.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const safe = path => typeof path === 'string' && path.length && !isAbsolute(path) && !path.split('/').some(p => ['', '.', '..'].includes(p));
const profiles = new Set(['compatibility', 'aux-v1']);
export const nativeIdentityPaths = Object.freeze([
  'chrome/browser/aux/account_profile_updater.cc',
  'chrome/browser/aux/auth_scheme_probe.cc',
  'chrome/browser/aux/browser_platform.cc',
  'chrome/browser/aux/daemon_supervisor.cc',
  'chrome/browser/aux/installation_auth.cc',
  'chrome/browser/aux/profile_security_client.cc',
  'chrome/browser/devtools/aux_cdp_authority.cc',
  'chrome/browser/ui/views/frame/aux_chat_navigation.cc',
]);
const nativeToken = ['daemonToken', 'challenge', 'daemonToken', 'daemonToken', 'challenge', 'daemonToken', 'sessionToken', 'daemonToken'];
const names = profile => profile === 'aux-v1'
  ? { prefix: 'Aux.', daemonToken: 'AuxDaemonSessionToken', sessionToken: 'AuxSessionToken', auth: 'aux.daemon.auth.', service: 'aux-daemon', challenge: 'Aux Daemon Auth v1', devChallenge: 'Aux Daemon Dev Auth v1' }
  : { prefix: 'Aside.', daemonToken: 'AsideDaemonSessionToken', sessionToken: 'AsideSessionToken', auth: 'aside.daemon.auth.', service: 'aside-daemon', challenge: 'Aside Daemon Auth v1', devChallenge: 'Aside Daemon Dev Auth v1' };
const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function requireIncludes(text, token, label) {
  if (typeof text !== 'string' || !text.includes(token)) throw Error(`Missing ${label}: ${token}`);
}
function rejectMixed(text, profile, label) {
  const other = names(profile === 'aux-v1' ? 'compatibility' : 'aux-v1');
  for (const token of Object.values(other)) {
    // Visible Aux prose is valid even in a compatibility source. Only a method-shaped
    // reference or dispatch prefix is a protocol generation marker.
    const mixed = token === other.prefix
      ? new RegExp(escaped(token) + '[A-Za-z_$]').test(text) || ['"', "'", '`'].some(quote => text.includes('startsWith(' + quote + token + quote))
      : text.includes(token);
    if (mixed) throw Error(`Mixed identity profile in ${label}: ${token}`);
  }
}
function challengeSource(text, token, label) {
  const literal = `"${token}\\0"`;
  const length = Buffer.byteLength(token) + 1;
  requireIncludes(text, literal, label);
  // A complete literal is insufficient: old hard-coded sizes truncate the challenge.
  const normalized = text.replace(/\s+/g, '');
  if (!normalized.includes(`std::string(${literal},${length})`.replace(/\s+/g, '')) &&
      !normalized.includes(`std::string(${literal},sizeof(${literal})-1)`.replace(/\s+/g, ''))) throw Error(`Incomplete challenge domain in ${label}; expected ${length} bytes`);
}
/** Pure contract over actual extracted text, suitable for small deterministic fixtures. */
export function assertAuxIdentityPairing({ identityProfile, declaredProfiles, texts, nativeSources }) {
  if (!profiles.has(identityProfile)) throw Error('Explicit supported identity profile required');
  for (const label of ['stage', 'ui', 'apps']) {
    if (declaredProfiles?.[label] !== identityProfile) throw Error(`Identity profile mismatch: ${label}`);
  }
  const n = names(identityProfile);
  for (const label of ['agent', 'daemon', 'cli']) {
    const text = texts?.[label];
    if (typeof text !== 'string' || !text.length) throw Error(`Missing actual protocol text: ${label}`);
    rejectMixed(text, identityProfile, label);
  }
  for (const method of ['listTabs', 'resolveBindingWindow', 'getThirdPartyCookies']) {
    const literal = escaped(n.prefix + method);
    for (const label of ['agent', 'daemon']) if (!new RegExp('method:\\s*[A-Za-z_$][\\w$]*\\([\"\'`]' + literal + '[\"\'`]\\)').test(texts[label])) throw Error(`Missing ${label} Agent schema method: ${n.prefix + method}`);
    if (!new RegExp('case\\s+[\"\'`]' + literal + '[\"\'`]').test(texts.agent)) throw Error(`Missing Agent dispatch method: ${n.prefix + method}`);
  }
  requireIncludes(texts.agent, n.auth, 'Agent authentication');
  requireIncludes(texts.daemon, n.auth, 'daemon websocket authentication');
  for (const label of ['daemon', 'cli']) {
    for (const domain of label === 'daemon' ? [n.challenge, n.devChallenge] : [n.challenge]) {
      const literal = escaped(domain + '\\0');
      if (!new RegExp('(?:Buffer[\\w$]*\\.from|new\\s+TextEncoder\\(\\)\\.encode)\\([\"\'`]' + literal + '[\"\'`]').test(texts[label])) throw Error(`Missing complete NUL challenge literal in ${label}: ${domain}`);
    }
  }
  for (const token of [n.daemonToken, n.sessionToken, n.challenge, n.devChallenge, n.service]) requireIncludes(texts.daemon, token, 'daemon authentication');
  for (const token of [n.daemonToken, n.challenge]) requireIncludes(texts.cli, token, 'CLI authentication');
  const nativeEvidence = [];
  for (const [index, path] of nativeIdentityPaths.entries()) {
    const text = nativeSources?.[path];
    if (typeof text !== 'string') throw Error(`Missing pinned native source: ${path}`);
    rejectMixed(text, identityProfile, path);
    if (nativeToken[index] === 'challenge') challengeSource(text, n.challenge, path);
    else requireIncludes(text, n[nativeToken[index]], path);
    if (path.endsWith('/daemon_supervisor.cc')) requireIncludes(text, n.service, path);
    nativeEvidence.push({ path, sha256: sha(text) });
  }
  return { version: 1, identityProfile, staticPairing: true, runtimeAcceptance: false, challengeBytes: Buffer.byteLength(n.challenge) + 1, developmentChallengeBytes: Buffer.byteLength(n.devChallenge) + 1, nativeEvidence };
}
async function regular(path) {
  if (await realpath(path) !== resolve(path)) throw Error(`Identity input traverses a symlink: ${path}`);
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error(`Regular identity input required: ${path}`);
  return readFile(path);
}
async function pinnedText(root, path, entries) {
  if (!safe(path)) throw Error('Unsafe identity input path');
  const matches = entries?.filter(item => item.path === path);
  if (matches?.length !== 1) throw Error(`Missing or duplicate identity input pin: ${path}`);
  const entry = matches[0];
  if (!entry || !/^[a-f0-9]{64}$/.test(entry.outputSha256)) throw Error(`Missing identity input pin: ${path}`);
  const bytes = await regular(join(root, path));
  if (sha(bytes) !== entry.outputSha256) throw Error(`Identity input hash mismatch: ${path}`);
  return bytes;
}
/** Invoke before creating any package output or temporary copy. No input is mutated. */
export async function verifyAuxIdentityContract({ stageRoot, composition, nativeRoot = composition?.sourceRoot, identityProfile }) {
  if (!profiles.has(identityProfile)) throw Error('Explicit supported identity profile required');
  if (nativeRoot !== composition?.sourceRoot) throw Error('Native identity source root differs from composition');
  const load = async path => JSON.parse(await regular(join(stageRoot, path)));
  const [stage, ui, apps] = await Promise.all(['manifest.json', 'ui/manifest.json', 'apps/manifest.json'].map(load));
  for (const [label, manifest] of Object.entries({stage,ui,apps})) if (manifest.identityProfile !== identityProfile) throw Error(`Identity profile mismatch: ${label}`);
  let developmentText;
  const texts = { agent: (await pinnedText(join(stageRoot, 'ui/agent'), 'background.js', ui.components?.agent?.files)).toString() };
  for (const label of ['daemon', 'cli']) {
    const component = apps.components?.[label];
    if (component?.app !== `${label}/Aux ${label === 'daemon' ? 'Daemon' : 'CLI'}.app`) throw Error('Unexpected identity application layout');
    const executable = `Contents/MacOS/${label === 'daemon' ? 'aux-daemon' : 'aux-cli'}`;
    const root = join(stageRoot, 'apps', component?.app ?? 'invalid');
    const bytes = await pinnedText(root, executable, component?.files);
    const section = findMachOSeaSection(bytes);
    texts[label] = readSeaBlob(bytes.subarray(section.offset, section.offset + section.size)).code;
    if (label === 'daemon' && component.nodeDevelopment) {
      const path = 'Contents/Resources/node-development/index.mjs';
      const generated = (await pinnedText(root, path, component.files)).toString();
      developmentText = generated;
      // The SEA and development host are alternative real entrypoints, both must agree.
      const n = names(identityProfile);
      rejectMixed(generated, identityProfile, 'daemon development entry');
      for (const token of [n.daemonToken, n.sessionToken, n.challenge, n.devChallenge, n.service]) requireIncludes(generated, token, 'daemon development entry');
    }
  }
  let coldEntryQuarantineChecked = false;
  if (stage.stateIdentityVersion === 2) {
    for (const label of ['daemon', 'cli']) {
      const prefix = (label === 'cli' ? '#!/usr/bin/env node\n' : '') + AUX_COLD_ENTRY_REFUSAL;
      if (!texts[label].startsWith(prefix) || texts[label].split(AUX_COLD_ENTRY_REFUSAL).length !== 2)
        throw Error(`Missing exact state2 cold-entry quarantine: ${label}`);
    }
    let cryptoPreload = '', providerNodePreload = '';
    if (apps.components.daemon.cryptoRuntime) {
      const crypto = JSON.parse(await regular(join(repository, 'docs/integration/proposed/aux-crypto-stage-integration/inputs.json')));
      const policy = stage.cloudPolicy?.mode ?? 'local';
      const utilityPins = apps.components.daemon.macOSUtilities
        ? JSON.parse(await regular(join(repository, 'docs/integration/proposed/aux-macos-utility-integration/inputs.json'))) : null;
      const variants = (utilityPins ?? crypto).variants[policy];
      const provider = apps.components.daemon.nodeDevelopment?.providerFundedEntry;
      let providerSeaPreload = '', expectedSea = variants?.sea.outputSha256, expectedNode = variants?.['node-development'].outputSha256;
      if (provider) {
        // A separately reviewed successor; never replace the frozen predecessor
        // hashes with a stage-declared arbitrary digest or accept a prefix alone.
        const pins = JSON.parse(await regular(join(repository, 'docs/integration/proposed/provider-funded-integration/entry-projections.json')));
        if (!variants || pins.format !== 'aux.provider-funded.entry-projections.v1' || pins.policy !== policy ||
            provider.format !== 'aux.provider-funded.entry.v1' || provider.sourceSha256 !== expectedNode ||
            provider.outputSha256 !== pins['node-development'].sha256 || provider.runtimeAccepted !== false ||
            provider.startupRefusalPreserved !== true || provider.policy?.paymentsEnabled !== false || provider.policy?.hostedAiEnabled !== false)
          throw Error('Unreviewed provider-funded entry successor');
        expectedSea = pins.sea.sha256; expectedNode = pins['node-development'].sha256;
        providerSeaPreload = pins.sea.prelude; providerNodePreload = pins['node-development'].prelude;
      }
      if (!variants || sha(texts.daemon) !== expectedSea || sha(developmentText) !== expectedNode ||
          !texts.daemon.startsWith(AUX_COLD_ENTRY_REFUSAL + providerSeaPreload + crypto.preloads.sea))
        throw Error('Unreviewed state2 crypto entry projection');
      cryptoPreload = utilityPins ? utilityPins.preloads['node-development'] : crypto.preloads['node-development'];
    }
    const generatedPrefix = AUX_COLD_ENTRY_REFUSAL + providerNodePreload + cryptoPreload + 'const { daemonResources: __auxDaemonResources, daemonMacOS: __auxDaemonMacOS, daemonAppRoot: __auxDaemonAppRoot, getAsset: __auxProvidedGetAsset } = await import("./assets.mjs");\n';
    if (typeof developmentText !== 'string' || !developmentText.startsWith(generatedPrefix) || developmentText.split(AUX_COLD_ENTRY_REFUSAL).length !== 2)
      throw Error('Missing state2 generated-entry quarantine before asset initialization');
    coldEntryQuarantineChecked = true;
  }
  const nativeSources = {};
  for (const path of nativeIdentityPaths) nativeSources[path] = (await pinnedText(nativeRoot, path, composition?.files)).toString();
  const declaredProfiles = { stage: stage.identityProfile, ui: ui.identityProfile, apps: apps.identityProfile };
  const report = assertAuxIdentityPairing({ identityProfile, declaredProfiles, texts, nativeSources });
  if (developmentText) assertAuxIdentityPairing({ identityProfile, declaredProfiles, texts: {...texts, daemon:developmentText}, nativeSources });
  return {...report, developmentEntrypointChecked: Boolean(developmentText), coldEntryQuarantineChecked};
}
const visual = path => /\.(?:css|svg|png|jpe?g|webp|gif|avif|ico|icns|woff2?|ttf|otf)$/i.test(path);
/** Explicit successor only: the acceptedRoot field is documentary and is never read. */
export async function compareAuxVisualAssets({ agentRoot, baselinePath = join(repository, 'docs/acceptance/aux-identity-ui-baseline.json'), assetIdentity = 'compatibility' }) {
  const baseline = JSON.parse(await regular(baselinePath));
  if (baseline.version !== 1 || !Array.isArray(baseline.files) || !baseline.files.length) throw Error('Invalid visual preservation baseline');
  if (!['compatibility','aux'].includes(assetIdentity)) throw Error('Explicit supported visual asset identity required');
  const reviewedReplacements = assetIdentity === 'aux' ? [await loadAuxBrowserIconReplacement()] : [];
  const relocation = assetIdentity === 'aux' ? relocateAuxVisualBaseline(baseline.files,{reviewedReplacements}) : null;
  const expected = new Map();
  for (const entry of relocation?.files ?? baseline.files) {
    if (!safe(entry.path) || !visual(entry.path) || expected.has(entry.path) || !/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isSafeInteger(entry.bytes)) throw Error('Invalid visual preservation entry');
    expected.set(entry.path, entry);
  }
  if (await realpath(agentRoot) !== resolve(agentRoot) || !(await lstat(agentRoot)).isDirectory()) throw Error('Canonical successor Agent directory required');
  const observed = new Map();
  async function walk(prefix = '') {
    for (const name of await readdir(join(agentRoot, prefix))) {
      const path = prefix ? `${prefix}/${name}` : name;
      const stat = await lstat(join(agentRoot, path));
      if (stat.isSymbolicLink()) throw Error(`Successor visual inventory contains symlink: ${path}`);
      if (stat.isDirectory()) await walk(path);
      else if (visual(path)) {
        const bytes = await regular(join(agentRoot, path));
        observed.set(path, { path, sha256: sha(bytes), bytes: bytes.length });
      }
    }
  }
  await walk();
  if (relocation) canonicalizeAuxVisualAssetInventory([...observed.values()],{reviewedReplacements});
  const missing = [...expected.keys()].filter(path => !observed.has(path)).sort();
  const extra = [...observed.keys()].filter(path => !expected.has(path)).sort();
  const changed = [...expected.keys()].filter(path => observed.has(path) && (expected.get(path).sha256 !== observed.get(path).sha256 || expected.get(path).bytes !== observed.get(path).bytes)).sort().map(path => ({ path, expected: expected.get(path), actual: observed.get(path) }));
  const preserved = !missing.length && !extra.length && !changed.length;
  return { version: 1, preserved, unchanged: preserved && !(relocation?.assetByteChanges), expectedFiles: expected.size, actualFiles: observed.size, cssFiles: [...observed.keys()].filter(path => path.endsWith('.css')).length, missing, changed, extra,
    ...(relocation ? {assetIdentity, pathRelocations: relocation.relocations, explicitBrandingReplacements: relocation.explicitBrandingReplacements, expectedUnchangedVisualFiles: relocation.expectedUnchangedVisualFiles} : {}),
    scope: 'Agent visual payload with explicit reviewed identity mapping only; rendered/native UI behavior remains separate.' };

}
export async function assertAuxVisualAssets(options) {
  const report = await compareAuxVisualAssets(options);
  if (!report.preserved) throw Object.assign(Error('Accepted Aux visual payload changed'), { report });
  return report;
}
