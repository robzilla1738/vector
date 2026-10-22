/** Keep each supplied Lasso port response bound to its active request. */
import { readFileSync } from 'node:fs';
const patch = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/provided-lasso-request-ownership/patch.json', import.meta.url), 'utf8'));
export function transformProvidedLassoOwnership({ component, path, text }) {
  if (component !== patch.component || path !== patch.path) return { text, anchors: [] };
  for (const edit of patch.edits) {
    if (text.split(edit.find).length - 1 !== edit.count) throw new Error('Supplied Lasso request owner anchor changed');
    text = text.replace(edit.find, edit.replace);
  }
  return { text, anchors: patch.edits };
}
