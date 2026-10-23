/** Final shipped Agent link identities. Styling and component structure are unchanged.
 * Aux destination publication is a separate operational gate; never fall back to
 * the source product's policy, docs or community when a destination is unavailable.
 */
const rows = new Map([
  ['assets/add-on-credits-dialog-Dn5FxOyZ.js', [
    ['https://asidehq.com/policy/terms', 'https://getaux.co/policy/terms', 1],
    ['https://asidehq.com/policy/privacy', 'https://getaux.co/policy/privacy', 1],
  ]],
  ['assets/ai-CzEX5E7S.js', [
    ['https://asidehq.com/policy/terms', 'https://getaux.co/policy/terms', 1],
    ['https://asidehq.com/policy/privacy', 'https://getaux.co/policy/privacy', 1],
  ]],
  ['assets/subscription-C_XzJh5Z.js', [
    ['const r=e?.email?.toLowerCase();return r?.endsWith("@aside.com")||r?.endsWith("@at.studio")?!0:a.includes(e?.subscriptionPlan??"free")', 'return a.includes(e?.subscriptionPlan??"free")', 1],
  ]],
  ['assets/route-TQyeTEXE.js', [
    ['https://docs.aside.com', 'https://getaux.co/docs', 1],
    ['https://discord.gg/2h4cNW6ayc', 'https://getaux.co/community', 1],
  ]],
]);

export function applyAuxProductLinks({component, path, text, stateIdentityVersion}) {
  if (component !== 'agent' || stateIdentityVersion !== 2) return {text, anchors: []};
  const anchors = [];
  for (const [find, replace, count] of rows.get(path) ?? []) {
    if (text.split(find).length - 1 !== count) throw Error(`Product link anchor changed: ${path}`);
    text = text.split(find).join(replace);
    anchors.push({kind: 'identity', name: 'Aux-owned product destination', find, replace, count});
  }
  return {text, anchors};
}

// Both actual publisher and reader are in the fixed supplied Agent inventory.
// This is transient page state, not a persisted key or cryptographic format.
const editorPeers = new Set(['assets/newtab-editor-u_GbForB.js', 'assets/search-navigation-TWhZq3-H.js']);
export function applyAuxEditorGlobalIdentity({component, path, text, stateIdentityVersion}) {
  if (component !== 'agent' || stateIdentityVersion !== 2 || !editorPeers.has(path)) return {text, anchors: []};
  const find = 'window.__asideNewTabEditor', replace = 'window.__auxNewTabEditor';
  if (text.split(find).length !== 2) throw Error(`Editor global peer changed: ${path}`);
  return {text: text.replace(find, replace), anchors: [{kind: 'identity', name: 'Aux new-tab editor publisher and reader', find, replace, count: 1}]};
}
