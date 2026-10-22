/** Recover late notification clicks within their original extension profile. */
import { readFileSync } from 'node:fs';
const patch = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/provided-notification-window-routing/patch.json', import.meta.url), 'utf8'));
export function transformProvidedNotificationRouting({ component, path, text }) {
  if (component !== patch.component || path !== patch.path) return { text, anchors: [] };
  for (const edit of patch.edits) {
    if (text.split(edit.find).length - 1 !== edit.count) throw new Error('Supplied notification routing anchor changed');
    text = text.replace(edit.find, edit.replace);
  }
  return { text, anchors: patch.edits };
}
