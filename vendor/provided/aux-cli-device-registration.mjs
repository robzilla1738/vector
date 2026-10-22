/** Paired Mac installation status/public-key caller adaptation. No key init. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../../docs/integration/proposed/aux-cli-device-registration/', import.meta.url);
const pin = JSON.parse(readFileSync(new URL('inputs.json', root), 'utf8'));
const find = readFileSync(new URL('original-function.js.txt', root), 'utf8');
const replace = readFileSync(new URL('replacement-function.js.txt', root), 'utf8');
const sha = text => createHash('sha256').update(text).digest('hex');
if (sha(find) !== pin.findSha256 || sha(replace) !== pin.replaceSha256) throw Error('Aux CLI registration reviewed patch pin mismatch');
export function applyAuxCliDeviceRegistration({component, path, text, original}) {
  if (component !== pin.component || path !== pin.path) return {text, anchors: []};
  if (typeof original !== 'string' || sha(original) !== pin.sourceSha256) throw Error('Aux CLI registration original source pin mismatch');
  if (typeof text !== 'string' || original.split(find).length - 1 !== pin.count ||
      text.split(find).length - 1 !== pin.count || text.includes(replace)) throw Error('Aux CLI registration caller drift or repeated generation');
  return {text: text.replace(find, replace), anchors: [{kind: 'integration',
    name: 'Mac CLI native status and public scheme pairing', find, replace, count: pin.count}]};
}
