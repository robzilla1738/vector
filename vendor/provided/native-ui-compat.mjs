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
  'Native account gate requires supplied registry and authenticated Vault status',
]);

const identities = [
  ...Object.entries(nativeNamespaces),
  ['at.studio.Aside.blink.expose-wv', 'dev.aux.blink.expose-wv'],
  ['at.studio.Aside.ext.private.pref-get-set', 'dev.aux.ext.private.browserPreferences'],
  ['at.studio.Aside.ext.private.browser-import', 'dev.aux.ext.private.browserImport'],
  ['at.studio.Aside.ext.private.', 'dev.aux.ext.private.'],
  ['AsideDaemonSessionToken', 'AuxDaemonSessionToken'],
  ['AsideSessionToken', 'AuxSessionToken'],
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
  // Rewrite literal extension-command names only. Product prose and numeric tables are untouched.
  for (const method of new Set(text.match(/(?<=["'`])Aside\.[a-z][A-Za-z0-9_]*/g) ?? [])) {
    replace(method, `Aux.${method.slice('Aside.'.length)}`);
  }
  for (const scheme of ['http', 'https', 'ws', 'wss']) {
    for (const host of ['127.0.0.1', 'localhost']) {
      replace(`${scheme}://${host}:21420`, `${scheme}://${host}:21520`, 'integration');
      replace(`${scheme}://${host}:21421`, `${scheme}://${host}:21521`, 'integration');
    }
  }
  return { text, anchors };
}
