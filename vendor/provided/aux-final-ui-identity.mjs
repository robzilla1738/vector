import {createHash} from 'node:crypto';

// These remaining names are transient popup/search identities and CLI help.
// Persisted storage and cryptographic labels require their own versioned change.
const files = new Map([
  ['assets/developers-DTvaoVBC.js', {
    sourceSha256: 'c5f9e7bb2a2c1439ac9d28fa5c56f22b97e78a148ae8a1b516287073d8ab807d',
    rules: [['aside', 'aux', 25]],
  }],
  ['assets/connect-dialog-CacgpFap.js', {
    sourceSha256: '276c770d80c67db2d1af08fac1ba44c9fb9c76e5595b63e098ebe0010ad739c2',
    rules: [
      ['aside-openai-codex-oauth', 'aux-openai-codex-oauth', 1],
      ['aside-github-copilot-oauth', 'aux-github-copilot-oauth', 1],
      ['aside-meta-muse-oauth', 'aux-meta-muse-oauth', 1],
      ['aside-xai-grok-oauth', 'aux-xai-grok-oauth', 1],
      ['aside-kimi-code', 'aux-kimi-code', 1],
      ['aside-claude-oauth', 'aux-claude-oauth', 1],
    ],
  }],
  ['assets/newtab-CnOLQ0yu.js', {
    sourceSha256: 'e300bb70a84a0630c94f20469822517ca0ca02be902d9bb150492994f719cb19',
    rules: [
      ['aside-optimistic-search', 'aux-optimistic-search', 1],
      ['aside|chrome', 'aux|chrome', 4],
      ['/^aside:', '/^aux:', 1],
      ['"aside://"', '"aux://"', 1],
    ],
  }],
]);

export function applyAuxFinalUiIdentity({component, path, text, original, stateIdentityVersion}) {
  const file = files.get(path);
  if (component !== 'agent' || stateIdentityVersion !== 2 || !file) return {text, anchors: []};
  if (typeof original !== 'string' || createHash('sha256').update(original).digest('hex') !== file.sourceSha256)
    throw Error('Aux final UI identity source changed: ' + path);
  const anchors = [];
  for (const [find, replace, count] of file.rules) {
    if (text.split(find).length - 1 !== count) throw Error('Aux final UI identity anchor changed: ' + path + ': ' + find);
    text = text.split(find).join(replace);
    anchors.push({kind: 'identity', name: 'Aux transient identity and CLI help', find, replace, count});
  }
  return {text, anchors};
}
