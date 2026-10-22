/** Source-pinned paired custom capture identities; standard HTML remains intact. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-capture-contract-identity/inputs.json',import.meta.url),'utf8'));
export const auxCaptureIdentityInputs=Object.freeze(pins.inputs.map(({component,path,sourceSha256})=>Object.freeze({component,path,sourceSha256})));
export function applyAuxCaptureContractIdentity({component,path,text,original}){
 const pin=pins.inputs.find(input=>input.component===component&&input.path===path);
 if(!pin)return{text,anchors:[]};
 if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux capture original source pin mismatch');
 if(typeof text!=='string')throw Error('Actual composed capture source required');
 let output=text;const anchors=[];
 for(const rule of pin.rules){
  if(output.includes(rule.replace))throw Error('Mixed or repeated Aux capture contract');
  if(output.split(rule.find).length-1!==rule.count)throw Error('Aux capture source drift');
  output=output.split(rule.find).join(rule.replace);anchors.push({kind:'identity',name:'Aux paired custom capture contract',...rule});
 }
 return{text:output,anchors};
}
