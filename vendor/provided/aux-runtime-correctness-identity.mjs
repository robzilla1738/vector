/** Paired local behavior corrections; no state, native, provider or UI mutation. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pin=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-runtime-correctness-identity/inputs.json',import.meta.url),'utf8'));
export const auxRuntimeCorrectnessInput=Object.freeze({component:pin.component,path:pin.path,sourceSha256:pin.sourceSha256});
export function applyAuxRuntimeCorrectnessIdentity({component='daemon',path='entry.mjs',text,original,scope='behavior-only'}) {
 if(!['behavior-only','complete-review'].includes(scope))throw Error('Unsupported Aux runtime correctness scope');
 if(component!==pin.component||path!==pin.path)throw Error('Unsupported Aux runtime correctness input');
 if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux runtime correctness original source pin mismatch');
 if(typeof text!=='string')throw Error('Exact composed daemon source required');
 let output=text;const anchors=[];
 for(const rule of pin.rules){
  // Matching a process name grants no same-home authority to terminate it.
  // Keep this prepared correction out of delivered code until that boundary exists.
  if(scope==='behavior-only'&&rule.find==='/aside[- ]?daemon/i.test(Cn)')continue;
  if(output.includes(rule.replace))throw Error('Mixed or repeated Aux runtime correctness identities');
  if(output.split(rule.find).length-1!==rule.count)throw Error('Aux runtime correctness source drift');
  output=output.split(rule.find).join(rule.replace);anchors.push({kind:'identity',name:'Aux local runtime correctness',...rule});
 }
 return {text:output,anchors};
}
