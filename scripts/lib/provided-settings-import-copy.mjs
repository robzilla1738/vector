/** Owner scope exception: Aux does not import or store user passwords. */
export function transformProvidedSettingsImportCopy({ component, path, text }) {
  if (component !== 'agent' || path !== 'assets/general-3dgRbrRk.js')
    return { text, anchors: [] };
  const find = 'Bring your browser history, cookies, bookmarks, and passwords';
  const replacement = 'Bring your bookmarks';
  if (text.split(find).length - 1 !== 2)
    throw new Error('Supplied Settings import description anchors changed');
  return {
    text: text.split(find).join(replacement),
    anchors: [{ kind: 'integration', find, replace: replacement, count: 2 }],
  };
}
