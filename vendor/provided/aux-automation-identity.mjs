/** Exact source-pinned private automation identities; no persistent-state I/O. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const pin = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-automation-identity/inputs.json', import.meta.url), 'utf8'));
const sha = text => createHash('sha256').update(text).digest('hex');
export const auxAutomationIdentityInput = Object.freeze({component:pin.component,path:pin.path,sourceSha256:pin.sourceSha256});

/** Apply once after provider/runtime transforms. Input remains tied to original
 * bytes, while each composed anchor is checked independently. Neither HTML aside
 * nor aside_dom, persistent key domains, catalogs or native ABI names are edited.
 */
export function applyAuxAutomationIdentity({ component, path, text, original }) {
  if (component !== pin.component || path !== pin.path) {
    if (typeof text === 'string' && /__aside|_aside_image_worker_default|aside:aux:(?:context-awareness-summary|memory-dream|taxonomy_migrate|lasso)/.test(text)) throw Error('Unpinned Aux automation input');
    return {text,anchors:[]};
  }
  if (typeof original !== 'string' || sha(original) !== pin.sourceSha256) throw Error('Aux automation original source pin mismatch');
  if (typeof text !== 'string') throw Error('Actual composed daemon text required');
  // Check mixed generations against incoming composed text, before earlier rules
  // create the shared __aux prefix. Require the complete reviewed name.
  for (const rule of pin.rules) {
    const escaped = rule.replace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(escaped + '(?![A-Za-z0-9_])').test(text)) throw Error(`Mixed Aux automation identity: ${rule.replace}`);
  }
  let output = text;
  const anchors = [];
  for (const rule of pin.rules) {
    const count = output.split(rule.find).length - 1;
    if (count !== rule.count) throw Error(`Aux automation input drift: ${rule.find}`);
    output = output.split(rule.find).join(rule.replace);
    anchors.push({kind:'identity',name:'Aux private automation contract',...rule});
  }
  return {text:output,anchors};
}
