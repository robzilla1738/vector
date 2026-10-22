/** Source-pinned private bindings and cosmetic request metadata. No runtime I/O. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pin=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-private-daemon-identity/inputs.json',import.meta.url),'utf8'));
export const auxPrivateDaemonIdentityInput=Object.freeze({component:pin.component,path:pin.path,sourceSha256:pin.sourceSha256});
export function applyAuxPrivateDaemonIdentity({component,path,text,original}) {
  if(component!==pin.component||path!==pin.path)throw Error('Unsupported Aux private daemon input');
  if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux private daemon original source pin mismatch');
  if(typeof text!=='string')throw Error('Actual composed daemon text required');
  // Validate the complete generation before producing any changed text.
  for(const rule of pin.rules) {
    if(original.split(rule.find).length-1!==rule.count||text.split(rule.find).length-1!==rule.count)throw Error(`Aux private daemon source drift: ${rule.find}`);
    if(text.includes(rule.replace))throw Error(`Mixed or repeated Aux private daemon identity: ${rule.replace}`);
  }
  let output=text;const anchors=[];
  for(const rule of pin.rules) {
    output=output.split(rule.find).join(rule.replace);
    anchors.push({...rule,kind:'identity',name:`Aux ${rule.kind}`});
  }
  return {text:output,anchors};
}
