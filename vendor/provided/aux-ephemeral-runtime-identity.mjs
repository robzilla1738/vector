/** Count-pinned ephemeral runtime values and prompt formatter/guard pairing.
 * No archive, transcript, credential, account, catalog or native ABI migration.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pin=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-ephemeral-runtime-identity/inputs.json',import.meta.url),'utf8'));
export const auxEphemeralRuntimeIdentityInput=Object.freeze({component:pin.component,path:pin.path,sourceSha256:pin.sourceSha256});
export function applyAuxEphemeralRuntimeIdentity({component,path,text,original}) {
  if(component!==pin.component||path!==pin.path)throw Error('Unsupported Aux ephemeral runtime input');
  if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux ephemeral runtime original source pin mismatch');
  if(typeof text!=='string')throw Error('Actual composed daemon source required');
  for(const rule of pin.rules) {
    if(original.split(rule.find).length-1!==rule.count||text.split(rule.find).length-1!==rule.count)throw Error(`Aux ephemeral runtime source drift: ${rule.scope}`);
    if(text.includes(rule.replace))throw Error(`Mixed or repeated Aux ephemeral runtime generation: ${rule.scope}`);
  }
  let output=text;const anchors=[];
  for(const rule of pin.rules) {
    output=output.split(rule.find).join(rule.replace);
    anchors.push({...rule,kind:'identity',name:`Aux ${rule.scope}`});
  }
  return {text:output,anchors};
}
