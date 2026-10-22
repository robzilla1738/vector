/** Paired injected selection/translation identity, after the capture identity step. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-selection-contract-identity/inputs.json',import.meta.url),'utf8'));
export const auxSelectionIdentityInputs=Object.freeze(pins.inputs.map(({component,path,sourceSha256})=>Object.freeze({component,path,sourceSha256})));
export function applyAuxSelectionContractIdentity({component,path,text,original}){
 const pin=pins.inputs.find(input=>input.component===component&&input.path===path);
 if(!pin)return{text,anchors:[]};
 if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux selection original source pin mismatch');
 if(typeof text!=='string')throw Error('Actual composed selection source required');
 let output=text;const anchors=[];
 for(const rule of pin.rules){
  if(output.includes(rule.replace))throw Error('Mixed or repeated Aux selection contract');
  if(output.split(rule.find).length-1!==rule.count)throw Error('Aux selection source drift or missing capture predecessor');
  output=output.split(rule.find).join(rule.replace);anchors.push({kind:'identity',name:'Aux paired selection/translation contract',...rule});
 }
 return{text:output,anchors};
}
