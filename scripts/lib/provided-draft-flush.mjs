/** Keep supplied draft storage/format; commit edits before native profile teardown. */
export function transformProvidedDraftFlush({ component, path, text }) {
  if (component !== 'agent' || path !== 'assets/draft-storage-ixLojjZ5.js')
    return { text, anchors: [] };
  const find = 'write:(o,s=!1)=>{t=o,r(t),(s||!t)&&r.flush()}';
  const replacement = 'write:(o,s=!1)=>{t=o,r(t),r.flush()}';
  if (text.split(find).length - 1 !== 1)
    throw new Error('Supplied draft persistence anchor changed');
  return { text: text.replace(find, replacement),
    anchors: [{ kind: 'integration', find, replace: replacement, count: 1 }] };
}
