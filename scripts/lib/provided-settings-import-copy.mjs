/** Owner scope and branding changes; supplied settings UI/actions stay intact. */
export function transformProvidedSettingsImportCopy({ component, path, text }) {
  if (component !== 'agent') return { text, anchors: [] };
  const anchors = [];
  const replace = (find, replacement, count, kind) => {
    if (text.split(find).length - 1 !== count)
      throw new Error('Supplied Settings anchor changed: ' + find);
    text = text.split(find).join(replacement);
    anchors.push({ kind, find, replace: replacement, count });
  };
  if (path === 'assets/general-3dgRbrRk.js') {
    replace('Bring your browser history, cookies, bookmarks, and passwords',
            'Bring your bookmarks', 2, 'integration');
  }
  const links = {
    'assets/general-3dgRbrRk.js': ['aside://credits/'],
    'assets/appearance-Ceuw3-j6.js': ['aside://settings/appearance'],
    'assets/privacy-BeEEt9Qu.js': ['aside://settings/content',
      'aside://settings/security', 'aside://history/', 'aside://adblock-internals'],
  };
  for (const link of links[path] ?? [])
    replace(link, link.replace('aside://', 'aux://'), 1, 'branding');
  return { text, anchors };
}
