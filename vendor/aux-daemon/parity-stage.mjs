// Test-only: stages the composed daemon entry for parity-harness.mjs. The entry is built from the
// sealed candidate exactly as transforms.mjs builds it, then opened up: startup removed and the
// internals the harness needs exported. The app layout is the one the entry checks, with the
// native modules replaced by inert stand-ins.
import {copyFileSync, cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {repoRoot} from '../../scripts/lib/repo-root.mjs';
import {RUNTIME_FILES as PROVIDER_FILES, integrateDaemon as integrateProviderDaemon} from '../provided/provider-cli/integration.mjs';
import {DAEMON_FILES as AGENT_FILES, integrateDaemon as integrateAgentDaemon} from '../provided/agent/integration.mjs';
import {ROOT_NAMESPACES, RUNTIME_FILES, integrateDaemon, withoutStoreEdits} from './integration.mjs';

const resources = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources';
const START = 'Promise.resolve().then(()=>(init_src(),src_exports)).then(({startDaemon:Cn})=>Cn())';
/** The evidence key as a fixed test key and its IV as fixed bytes, so nothing reaches the Keychain
 * and both runs store the same ciphertext. */
const TEST_EVIDENCE_CRYPTO = [['function resolveEvidenceKey(Cn){', 'function resolveEvidenceKey(Cn){return Buffer.alloc(32,7)}function auxSupplied_resolveEvidenceKey(Cn){'],
  ['ni=randomBytes(IV_BYTES),ri=createCipheriv(', 'ni=Buffer.alloc(IV_BYTES),ri=createCipheriv(']];
const COMMON = ['auxRouter', 'init_router', 'toJSONSchema', 'getAppErrorCode', 'init_accounts', 'tryMigrateStateDb', 'stateDb', 'AccountRegistry', 'auxOwnedDaemon', 'auxOwnedDaemonBindings'];

/** Each root namespace's supplied router and its lazy module initializer, exported as
 * `supplied_<root>` and `initRouter_<root>`, plus `extra` bundle names. */
function harnessEntry(candidate, roots, extra) {
  let text = readFileSync(path.join(candidate, 'node-development/aux-native-entry.mjs'), 'utf8');
  const target = `${resources}/node-development/aux-native-entry.mjs`;
  for (const rule of JSON.parse(readFileSync(path.join(repoRoot, 'scripts/release/package-edits.json'), 'utf8')).edits)
    if (rule.target === target) text = text.split(rule.find).join(rule.replace);
  text = integrateDaemon(integrateAgentDaemon(integrateProviderDaemon(text)));
  for (const [find, replace] of TEST_EVIDENCE_CRYPTO) {
    if (text.split(find).length !== 2) throw Error(`parity stage: expected one ${find}`);
    text = text.replace(find, replace);
  }
  if (text.split(START).length !== 2) throw Error('parity stage: expected one daemon start');
  const names = roots.map(namespace => {
    const router = ROOT_NAMESPACES[namespace], escaped = router.replaceAll('$', '\\$');
    const init = text.match(new RegExp(`[,\\s]${escaped},(init_[\\w$]+)=__esmMin\\(`))?.[1];
    if (!init) throw Error(`parity stage: no module initializer for ${router}`);
    return `${router} as supplied_${namespace},${init} as initRouter_${namespace}`;
  });
  return `${text.replace(START, 'Promise.resolve()')}export{${[...names, ...COMMON, ...extra].join(',')}};\n`;
}

/** Root namespaces of `sessions.tabs`-style paths. */
export const rootsOf = namespaces => [...new Set(namespaces.map(namespace => namespace.split('.')[0]))];

/** Writes the staged daemon under `scratch` and returns two entries: `aux`, as the release composes
 * it, and `supplied`, the same with the bundle's own stores in place of Aux's. */
export function stageParityEntry(scratch, namespaces, extra = []) {
  const candidate = path.join(requireInput('candidateApp'), resources);
  const app = path.join(scratch, 'Aux Daemon.app/Contents/Resources');
  cpSync(path.join(candidate, 'node-development'), path.join(app, 'node-development'), {recursive: true});
  const copy = (from, to) => {
    mkdirSync(path.dirname(to), {recursive: true});
    copyFileSync(from, to);
  };
  for (const file of PROVIDER_FILES) copy(path.join(repoRoot, 'vendor/provided/provider-cli', file), path.join(app, 'node-development/provider-cli', file));
  for (const file of AGENT_FILES) copy(path.join(repoRoot, 'vendor/provided/agent', file), path.join(app, 'node-development/aux-agent', file));
  for (const file of RUNTIME_FILES) copy(path.join(repoRoot, 'vendor/aux-daemon', file), path.join(app, 'node-development/aux-daemon', file));
  mkdirSync(path.join(app, 'native'));
  for (const file of readdirSync(path.join(candidate, 'native')).filter(file => file.endsWith('.cjs'))) writeFileSync(path.join(app, 'native', file), 'module.exports={};\n');
  // The ChatGPT plan module as it is with no ChatGPT plan connected (Aux has no provider sign-in).
  writeFileSync(path.join(app, 'native/aux-chatgpt.cjs'), [
    'const none=name=>()=>{throw Error(`parity harness: no ChatGPT plan (${name})`)};',
    'class AccountModelCatalog{getCachedModelIds(){return[]}async getModelIds(){return[]}}',
    'module.exports=new Proxy({configureLifetime(){},AccountModelCatalog,captureAccount:()=>({}),hasPlanCredentials:()=>false,planModels:()=>[],planResponsesApi:()=>({})},',
    '{get:(target,name)=>typeof name!=="string"||name==="__esModule"||name==="then"?undefined:target[name]??none(name)});',
  ].join('\n'));
  writeFileSync(path.join(app, 'native/runtime-bootstrap.cjs'), 'exports.inspectRetainedRuntime=()=>{};\n');
  writeFileSync(path.join(app, 'native/aux-owned-native.cjs'), 'module.exports=Object.freeze({run(){throw Error("parity harness: no native commands")},withAccountRegistryLock:work=>work()});\n');
  const text = harnessEntry(candidate, rootsOf(namespaces), extra);
  const entries = {aux: path.join(app, 'node-development/parity-entry.mjs'), supplied: path.join(app, 'node-development/parity-entry-supplied.mjs')};
  writeFileSync(entries.aux, text);
  writeFileSync(entries.supplied, withoutStoreEdits(text));
  return entries;
}
