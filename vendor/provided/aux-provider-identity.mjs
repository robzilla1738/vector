/** Reviewed provider contract migration; no state, provider or native operations. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const inputs = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-provider-identity/inputs.json', import.meta.url), 'utf8'));
const sha = text => createHash('sha256').update(text).digest('hex');
const branded = (text, branding) => branding === 'aux' ? text.replaceAll('ASIDE_', 'AUX_').replaceAll('Aside', 'Aux') : text;
export const auxProviderIdentityInputs = Object.freeze(inputs.files.map(({component,path,sourceSha256}) => Object.freeze({component,path,sourceSha256})));

/** Authenticate original input separately from composed text. All replacements are
 * exact count-checked anchors, including the aux-branded supplied symbol variant.
 * Call before broad lower-case identity edits, never twice. Unsupported files no-op.
 */
export function applyAuxProviderIdentity({ component, path, text, original, branding = 'aux', authProtocolMarkerCount = 0 }) {
  if (!['aux', 'supplied'].includes(branding)) throw Error('Unknown provider source branding');
  const pin = inputs.files.find(file => file.component === component && file.path === path);
  if (!pin) return { text, anchors: [] };
  if (typeof original !== 'string' || sha(original) !== pin.sourceSha256) throw Error('Aux provider source pin mismatch');
  let output = text;
  const anchors = [];
  for (const rule of pin.rules) {
    const find = branded(rule.find, branding), replace = branded(rule.replace, branding);
    if (output.split(find).length - 1 !== rule.count) throw Error(`Aux provider input drift: ${component}/${path}: ${find}`);
    output = output.split(find).join(replace);
    anchors.push({kind:'identity', name:'Aux provider contract', find, replace, count:rule.count});
  }
  const marker = /(["'`])X-Aside-Auth-Protocol\1/g;
  const matches = [...output.matchAll(marker)];
  if (!Number.isSafeInteger(authProtocolMarkerCount) || authProtocolMarkerCount < 0 || matches.length !== authProtocolMarkerCount) throw Error('Aux provider auth-marker count drift');
  for (const find of new Set(matches.map(match => match[0]))) {
    const count = output.split(find).length - 1, replace = find.replace('X-Aside-', 'X-Aux-');
    output = output.split(find).join(replace);
    anchors.push({kind:'identity',name:'Aux provider auth marker',find,replace,count});
  }
  return { text: output, anchors };
}

const own = (object, key) => Object.hasOwn(object, key);
function renameKey(object, from, to) {
  if (!object || typeof object !== 'object' || Array.isArray(object) || !own(object, from)) return;
  if (own(object, to)) throw Error(`Ambiguous provider migration: both ${from} and ${to}`);
  const descriptor = Object.getOwnPropertyDescriptor(object, from);
  Object.defineProperty(object, to, descriptor);
  delete object[from];
}
function selections(value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach(selections); return; }
  if (value.providerId === 'aside') value.providerId = 'aux';
  if (value.modelProvider === 'aside' && typeof value.modelId === 'string') value.modelProvider = 'aux';
  if (Array.isArray(value.providerOptions)) for (const provider of value.providerOptions) if (provider?.id === 'aside') provider.id = 'aux';
  if (value.provider === 'aside' && (typeof value.modelId === 'string' || typeof value.id === 'string')) value.provider = 'aux';
  for (const child of Object.values(value)) selections(child);
}
function configMetadata(value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach(configMetadata); return; }
  renameKey(value, 'asideSource', 'auxSource');
  renameKey(value, 'asideDisconnected', 'auxDisconnected');
  if (value.api === 'aside-provider') value.api = 'aux-provider';
  if (value.api === 'aside-images') value.api = 'aux-images';
  for (const child of Object.values(value)) configMetadata(child);
}
/** Explicit offline v1 -> v2 envelope. Caller must load only its authorized Aux
 * state and transactionally validate/persist this result. Never reads files,
 * decrypts or replaces credentials, changes model choice or resets a key.
 * Unknown fields/credential bytes are cloned intact. Ciphertext is opaque.
 */
export function migrateAuxProviderState(input) {
  if (!input || ![1,2].includes(input.version)) throw Error('Unsupported provider migration version');
  const output = structuredClone(input);
  if (input.version === 2) return output;
  for (const field of ['settings','sessions','agentSettings']) selections(output[field]);
  renameKey(output.settings, 'asideModelCatalog', 'auxModelCatalog');
  for (const field of ['credentialStore','providerCache']) renameKey(output[field], 'aside', 'aux');
  renameKey(output.modelsJson?.providers, 'aside', 'aux');
  selections(output.modelsJson); configMetadata(output.modelsJson);
  if (output.modelCatalog?.provider === 'aside') output.modelCatalog.provider = 'aux';
  if (output.browserStorage) for (const [from, to] of [['aside.agent-settings.v2', 'aux.agent-settings.v3'], ['aside.settings-inventory.v1', 'aux.settings-inventory.v2']]) {
    for (const key of Object.keys(output.browserStorage)) {
      if (key !== from && !key.startsWith(from + ':')) continue;
      const next = to + key.slice(from.length);
      if (own(output.browserStorage, next)) throw Error('Ambiguous provider browser-storage migration');
      const stored = output.browserStorage[key];
      let value;
      try { value = typeof stored === 'string' ? JSON.parse(stored) : stored; }
      catch { throw Error('Malformed historical provider browser storage; preserve original'); }
      selections(value);
      output.browserStorage[next] = typeof stored === 'string' ? JSON.stringify(value) : value;
      delete output.browserStorage[key];
    }
  }
  output.version = 2;
  return output;
}
