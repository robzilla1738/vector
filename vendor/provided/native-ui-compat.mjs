/** Identity-only adaptations for the pinned 1.26.1016.1852 supplied UI.
 * The stager replays every returned anchor with an exact occurrence count.
 * This does not install JS emulations for missing Chromium capabilities.
 */
export const nativeNamespaces = Object.freeze({
  asideAccount: 'auxAccount',
  asideAdblock: 'auxAdblock',
  asideBrowserImport: 'auxBrowserImport',
  asideBrowserPreferences: 'auxBrowserPreferences',
  asideMiniPopup: 'auxMiniPopup',
  asideNotification: 'auxNotification',
  asideOmnibox: 'auxOmnibox',
});

export const unresolvedNativeCapabilities = Object.freeze([
  'dev.aux.blink.expose-wv',
  'dev.aux.ext.private.capture-tab-without-userinteraction',
  'dev.aux.ext.private.launch-extension',
  'Packaged supplied extension-command bridge registration/routing acceptance remains unverified',
  'Native account gate requires supplied registry and authenticated Vault status',
]);

const identities = [
  ...Object.entries(nativeNamespaces),
  ['at.studio.Aside.blink.expose-wv', 'dev.aux.blink.expose-wv'],
  ['at.studio.Aside.ext.private.pref-get-set', 'dev.aux.ext.private.browserPreferences'],
  ['at.studio.Aside.ext.private.browser-import', 'dev.aux.ext.private.browserImport'],
  ['at.studio.Aside.ext.private.', 'dev.aux.ext.private.'],
  ['VITE_ASIDE_DAEMON_BASE_URL', 'VITE_AUX_DAEMON_BASE_URL'],
  ['VITE_ASIDE_DAEMON_AUTH_TOKEN', 'VITE_AUX_DAEMON_AUTH_TOKEN'],
  ['@browser-aside/', '@browser-aux/'],
  ['aside:google-docs-', 'aux:google-docs-'],
  ['aside:passkey-conditional-', 'aux:passkey-conditional-'],
  ['data-aside-handle-with-aside', 'data-aux-handle-with-aux'],
  ['data-aside-', 'data-aux-'],
  ['asideSurface', 'auxSurface'],
  ['__asideGoogleDocsSelectionBridgeInstalled', '__auxGoogleDocsSelectionBridgeInstalled'],
  ['asideGoogleDocsSelectionBridge', 'auxGoogleDocsSelectionBridge'],
  ['asideSelectionPrevUserSelect', 'auxSelectionPrevUserSelect'],
  ['asideSelectionPrevWebkitUserSelect', 'auxSelectionPrevWebkitUserSelect'],
  ['asideSelectionPrevWebkitUserDrag', 'auxSelectionPrevWebkitUserDrag'],
  ['aside-password-manager', 'aux-password-manager'],
  ['__ASIDE_PM_', '__AUX_PM_'],
  ['__asideFido2PageScriptInstalled', '__auxFido2PageScriptInstalled'],
  ['aside-recovery-key-', 'aux-recovery-key-'],
  ['port 21420', 'port 21520'],
];

/** Hook for scripts/lib/provided-ui.mjs; never performs I/O or edits source roots. */
export function transformProvidedNativeUi({ component, path, text }) {
  if (!['agent', 'vault'].includes(component)) throw new Error('Unknown supplied UI component');
  if (typeof text !== 'string' || typeof path !== 'string') throw new TypeError('Expected text file input');
  const anchors = [];
  const replace = (find, replacement, kind = 'identity') => {
    const count = text.split(find).length - 1;
    if (!count) return;
    anchors.push({ kind, find, replace: replacement, count });
    text = text.split(find).join(replacement);
  };
  for (const [find, replacement] of identities) replace(find, replacement);
  if (component === 'agent' && path === 'manifest.json') {
    // Current native MiniPopup has a distinct permission; the supplied actor uses it.
    replace('"dev.aux.ext.private.browserPreferences"', '"dev.aux.ext.private.browserPreferences",\n    "dev.aux.ext.private.miniPopup"', 'integration');
  }
  if (component === 'agent' && path === 'assets/extension-main-Dz1-AsCT.js') {
    // The browser's local workspace resolves its real profile/account first.
    // A bare main.html must open the supplied composer rather than hosted login.
    const rootRoute = 'const t=It()?"/u/$userId/sidepanel":vt()?"/u/$userId/minipopup":null;';
    if (text.split(rootRoute).length - 1 !== 1)
      throw new Error('Supplied default workspace route changed');
    replace(rootRoute, 'const t=It()?"/u/$userId/sidepanel":vt()?"/u/$userId/minipopup":"/u/$userId/tasks/new";', 'integration');
  }
  if (component === 'agent' && path === 'assets/session-composer-Dc0LRfZA.js') {
    // No configured local model is a provider-setup action, not hosted sign-in.
    // Preserve the supplied notice component and the actual empty model state.
    const emptyModels = 'if(!o&&r.length===0&&(l||u))return';
    if (text.split(emptyModels).length - 1 !== 1)
      throw new Error('Supplied local model notice changed');
    replace(emptyModels, 'if(!o&&r.length===0&&u)return{kind:"ai-subscription-connect",description:"Connect an AI provider to start chatting",actionLabel:"Connect",actionPath:`/u/${t}/settings/model`};if(!o&&r.length===0&&l)return', 'integration');
  }
  if (component === 'agent' && path === 'assets/skills-CfSQ7MCw.js') {
    // The runnable signed daemon can still report this retired built-in entry.
    // Filter its exact catalog path before all Settings skill groups consume it.
    const catalog = 'a.projects.listSkillsForSettings.queryOptions({projectId:null,accountId:i},{select:be})';
    if (text.split(catalog).length - 1 !== 1)
      throw new Error('Supplied Settings skill catalog consumer changed');
    replace(catalog, 'a.projects.listSkillsForSettings.queryOptions({projectId:null,accountId:i},{select:t=>{const p=be(t);return{...p,skills:p.skills.filter(t=>t.path!=="builtin/password-manager")}}})', 'integration');
  }
  if (component === 'agent' && path === 'assets/utils-WfPpT5w5.js') {
    // Preserve the supplied name/path used by skill resolution and REPL APIs.
    const displayName = 'E=a=>{const e=s(a.path)?';
    if (text.split(displayName).length - 1 !== 1)
      throw new Error('Supplied skill display-name helper changed');
    replace(displayName, 'E=a=>{if(a.name==="aside"&&a.path==="builtin/aside")return"Aux";const e=s(a.path)?', 'identity');
  }
  // Supplied Aside.* commands and authentication wire names remain unchanged.
  for (const scheme of ['http', 'https', 'ws', 'wss']) {
    for (const host of ['127.0.0.1', 'localhost']) {
      replace(`${scheme}://${host}:21420`, `${scheme}://${host}:21520`, 'integration');
      replace(`${scheme}://${host}:21421`, `${scheme}://${host}:21521`, 'integration');
    }
  }
  return { text, anchors };
}
