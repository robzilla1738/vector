import { applyAuxContextLedgerIdentity } from './aux-context-ledger-identity.mjs';
import { applyAuxEphemeralRuntimeIdentity } from './aux-ephemeral-runtime-identity.mjs';
import { applyAuxPrivateDaemonIdentity } from './aux-private-daemon-identity.mjs';
import { applyAuxRuntimeCorrectnessIdentity } from './aux-runtime-correctness-identity.mjs';
import { applyAuxCaptureContractIdentity } from './aux-capture-contract-identity.mjs';
import { applyAuxProfileContextIdentity } from './aux-profile-context-identity.mjs';
import { applyAuxAutomationIdentity } from './aux-automation-identity.mjs';
import { applyAuxRuntimeContractIdentity } from './aux-runtime-contract-identity.mjs';
import { applyAuxProviderIdentity } from './aux-provider-identity.mjs';
import { applyAuxProtocolIdentity, resolveProtocolIdentity, resolveStateIdentityVersion } from './aux-protocol-identity.mjs';
/** Pinned supplied daemon adaptation. No substitute RPC handlers or plan bypasses. */
import { createHash } from 'node:crypto';
import { composeCloudDesktop } from './cloud-desktop-composition.mjs';
import { embedCloudSeaBlob } from './cloud-sea-embedding.mjs';
import { nativeDiagnosticExpression, nativeDiagnosticPredicate } from './native-diagnostic-hook.mjs';
import { excludeVaultProduct, edits as vaultProductEdits } from './vault-product-exclusion.mjs';
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
];
export const platformEdits = [
  edit('computer-use executable', 'aside-computer-use', 'aux-computer-use', 3),
  edit('bundled computer-use source', 'COMPUTER_USE_HELPER_SOURCE_APP_PATH=process.platform', 'COMPUTER_USE_HELPER_SOURCE_APP_PATH=process.env.AUX_COMPUTER_USE_SOURCE_APP?path.resolve(process.env.AUX_COMPUTER_USE_SOURCE_APP):process.platform', 1),
  edit('secure storage namespace', 'AUX_KEYCHAIN_ID_PREFIX=`aside`', 'AUX_KEYCHAIN_ID_PREFIX=`aux`', 1),
  edit('bundled runtime path', 'AUX_RUNTIME_DIR=path.join(AUX_HOME_PATH,`runtime`)', 'AUX_RUNTIME_DIR=process.env.AUX_AGENT_RUNTIME_DIR?path.resolve(process.env.AUX_AGENT_RUNTIME_DIR):path.join(AUX_HOME_PATH,`runtime`)', 1),
  edit('explicit external skill synchronization', 'syncInstalledAsideBrowserSkills().catch(()=>{})', 'process.env.AUX_ALLOW_EXTERNAL_SKILL_SYNC===`1`&&syncInstalledAsideBrowserSkills().catch(()=>{})', 1),
  // Never fall through to the original binding (custom Keychain and OS grants).
  edit('isolated native binding', 'return[process.env.AUX_NATIVE_HELPER_BINDING,materializeEmbeddedBinding(),path.resolve(ei,`../Resources/native/aside-native.node`),path.resolve(ei,`native/aside-native.node`),...Cn.flatMap(Cn=>[path.resolve(packageRoot,`../../packages/native-helper-binding/prebuilds`,Cn,`aside-native.node`),path.resolve(packageRoot,`prebuilds`,Cn,`aside-native.node`)])].filter(Cn=>!!Cn)', 'return[path.resolve(ei,`../Resources/native/aux-native.cjs`)]', 1),
  edit('bundled runtime lazy cache provisioning', 'async function performInstall(Cn){let ei=path.resolve(Cn.runtimeDir??AUX_RUNTIME_DIR),ti=resolveAgentRuntimeTarget(Cn.platform,Cn.arch);setAgentRuntimeProgress(', 'async function performInstall(Cn){let ei=path.resolve(Cn.runtimeDir??AUX_RUNTIME_DIR),ti=resolveAgentRuntimeTarget(Cn.platform,Cn.arch);await (await import(`node:module`)).createRequire(process.execPath)(path.resolve(path.dirname(process.execPath),`../Resources/native/runtime-bootstrap.cjs`))(ei);setAgentRuntimeProgress(', 1),
  edit('bundled memory startup provisioning', 'async function main(){(0,import_undici.setGlobalDispatcher)', 'async function main(){await (await import(`node:module`)).createRequire(process.execPath)(path.resolve(path.dirname(process.execPath),`../Resources/native/memory-bootstrap.cjs`))();(0,import_undici.setGlobalDispatcher)', 1),
  edit('load-only native SEA diagnostic', '(process.argv.includes(`--verify-local-memory`)?', `(${nativeDiagnosticPredicate}?${nativeDiagnosticExpression}:process.argv.includes(\`--verify-local-memory\`)?`, 1),
  edit('telemetry disabled', 'new PostHog(ASIDE_POSTHOG_PROJECT_API_KEY,{'.replace('ASIDE_', 'AUX_'), 'new PostHog(AUX_POSTHOG_PROJECT_API_KEY,{disabled:!0,', 1),
  // Local-only boundary: rejected network requests retain their original errors;
  // nothing here invents plans, account state, search results or sync success.
  edit('hosted API unavailable locally', 'https://api.aside.com', 'http://127.0.0.1:9/aux-unavailable/api', 8),
  edit('legacy hosted API unavailable locally', 'https://api.asidehq.com', 'http://127.0.0.1:9/aux-unavailable/legacy-api', 1),
  edit('hosted releases unavailable locally', 'https://releases.aside.com', 'http://127.0.0.1:9/aux-unavailable/releases', 6),
  edit('hosted sharing unavailable locally', 'https://share.aside.com', 'http://127.0.0.1:9/aux-unavailable/share', 1),
];


// Owner-directed product exception: no built-in Vault. Keep installation and
// provider authentication intact, and retain external-manager integration.
export const passwordManagerScopeEdits = [
  edit('disable built-in password manager default', 'useBuiltinPasswordManager:!0', 'useBuiltinPasswordManager:!1', 1),
  edit('disable built-in password manager in persisted settings', 'let ti={...DEFAULT_APP_SETTINGS,...Cn},ni=appSettingsSchema.safeParse(ti)', 'let ti={...DEFAULT_APP_SETTINGS,...Cn,useBuiltinPasswordManager:!1},ni=appSettingsSchema.safeParse(ti)', 1),
  edit('omit built-in password manager REPL', 'ui=Cn.incognito?null:new PasswordManagerRepl(ei,ai,Cn.agentSessionId)', 'ui=null', 1),
  edit('exclude Vault skills and retain external manager skills', "async function resolveSessionSkills(Cn,ei){let ti=Cn.session.incognito?ei.filter(Cn=>!INCOGNITO_BLOCKED_SKILL_NAMES.has(Cn.name)):ei;if(Cn.session.incognito||!ti.some(Cn=>Cn.name===`password-manager`))return ti;let ni=settings(Cn.accountId).get(`externalPasswordManagers`).map(Cn=>Cn.provider),ri=await prependConnectedExternalPasswordManagerSkills(await Cn.skills.list(),ti,ni);try{let{accounts:ei,connections:ri}=PwmAccountRegistry.list(),ii=ei.filter(({id:ei})=>ri.some(ti=>ti.profileId===`app-account:${Cn.accountId}`&&ti.pwmAccountId===ei)),ai=await Promise.allSettled(ii.map(({id:Cn})=>getPasswordManagerSettings(Cn))),oi=ai.flatMap(Cn=>Cn.status===`fulfilled`?[Cn.value]:[]),si=oi.length&&ai.every(Cn=>Cn.status===`fulfilled`)&&oi.every(Cn=>Cn.useBuiltinPasswordManager===!1)?ti.filter(Cn=>Cn.name!==`password-manager`):ti;return prependConnectedExternalPasswordManagerSkills(await Cn.skills.list(),si,ni)}catch(Cn){return logger.warn(`[Skills] Password Manager preferences unavailable`,{error:Cn}),ri}}",
    'async function resolveSessionSkills(Cn,ei){let ti=ei.filter(Cn=>Cn.name!==`password-manager`);if(Cn.session.incognito)return ti.filter(Cn=>!INCOGNITO_BLOCKED_SKILL_NAMES.has(Cn.name));let ni=settings(Cn.accountId).get(`externalPasswordManagers`).map(Cn=>Cn.provider);return prependConnectedExternalPasswordManagerSkills(await Cn.skills.list(),ti,ni)}', 1),
];

export function adaptDaemonCode(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1) {
  resolveProtocolIdentity(identityProfile);
  resolveStateIdentityVersion(stateIdentityVersion, identityProfile);
  if (sha(original) !== DAEMON_CODE_SHA256) throw new Error('Supplied daemon code hash mismatch');
  let code = original;
  const applied = [];
  for (const e of [...identityEdits, ...platformEdits, ...passwordManagerScopeEdits]) {
    const count = code.split(e.from).length - 1;
    if (count !== e.count) throw new Error(`${e.name}: expected ${e.count}, got ${count}`);
    code = code.split(e.from).join(e.to);
    applied.push({ name: e.name, count });
  }
  const branded = brandProductPreservingWires(code, { productCount: 654, wireCounts: {
    'AsideDaemonSessionToken': 4, 'AsideSessionToken': 1,
    'Aside Daemon Auth v1': 2, 'Aside Daemon Dev Auth v1': 1, 'Aside.': 78,
  } });
  code = excludeVaultProduct(branded.code).code;
  applied.push(...branded.edits, ...vaultProductEdits.map(({ name, count }) => ({ name, count })));
  const cloud = composeCloudDesktop({ component: 'daemon', path: 'entry.mjs', text: code }, cloudOptions);
  const identity = applyAuxProtocolIdentity({ component: 'daemon', text: cloud.text }, identityProfile, cloud.policy.mode);
  code = identity.text;
  applied.push(...cloud.anchors, ...identity.anchors);
  if (stateIdentityVersion === 2) {
    const provider = applyAuxProviderIdentity({ component: 'daemon', path: 'entry.mjs', text: code, original, branding: 'aux' });
    const runtime = applyAuxRuntimeContractIdentity({ component: 'daemon', path: 'entry.mjs', text: provider.text, original, branding: 'aux' });
    const automation = applyAuxAutomationIdentity({component: 'daemon', path: 'entry.mjs', text: runtime.text, original});
    const ledger = applyAuxContextLedgerIdentity({text: automation.text, original});
    const privateIdentity = applyAuxPrivateDaemonIdentity({component: 'daemon', path: 'entry.mjs', text: ledger.text, original});
    const behavior = applyAuxRuntimeCorrectnessIdentity({text: privateIdentity.text, original});
    const capture = applyAuxCaptureContractIdentity({component: 'daemon', path: 'entry.mjs', text: behavior.text, original});
    const profileContext = applyAuxProfileContextIdentity({component: 'daemon', path: 'entry.mjs', text: capture.text, original});
    const ephemeral = applyAuxEphemeralRuntimeIdentity({component: 'daemon', path: 'entry.mjs', text: profileContext.text, original});
    code = ephemeral.text; applied.push(...provider.anchors, ...runtime.anchors, ...automation.anchors, ...ledger.anchors, ...privateIdentity.anchors, ...behavior.anchors, ...capture.anchors, ...profileContext.anchors, ...ephemeral.anchors);
    const find = 'if(Cn===`aside`&&ei===`builtin/aside`)return`Aux`';
    const replace = 'if(Cn===`aux`&&ei===`builtin/aux`)return`Aux`';
    if (code.split(find).length - 1 !== 1) throw Error('Aux builtin skill display integration drift');
    code = code.replace(find, replace);
    applied.push({kind: 'identity', name: 'Aux builtin skill display', find, replace, count: 1});
  }
  return { code, applied, sha256: sha(code), ...(cloud.policy.mode !== 'local' ? { cloudPolicy: cloud.policy, cloudAnchors: cloud.anchors } : {}) };
}

export function adaptDaemonBinary(original, cloudOptions = {}, identityProfile = 'compatibility', stateIdentityVersion = 1) {
  if (sha(original) !== DAEMON_BINARY_SHA256) throw new Error('Supplied daemon binary hash mismatch');
  const section = findMachOSeaSection(original);
  const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
  const result = adaptDaemonCode(blob.code, cloudOptions, identityProfile, stateIdentityVersion);
  const sea = writeSeaBlob({ ...blob, code: result.code });
  const binary = result.cloudPolicy ? embedCloudSeaBlob(original, sea) : Buffer.from(original);
  if (!result.cloudPolicy) injectMachOSeaBlob(binary, sea);
  return { binary, codeSha256: result.sha256, applied: result.applied,
    ...(result.cloudPolicy ? { cloudPolicy: result.cloudPolicy, cloudAnchors: result.cloudAnchors } : {}),
    assets: blob.assets.map(([name, data]) => ({ name, bytes: data.length, sha256: sha(data) })) };
}

export function readPinnedDaemon(binaryPath) { return adaptDaemonBinary(readFileSync(binaryPath)); }
