/** Fail closed at the real state2 SEA entry, before bundled initialization. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-cold-entry-admission/inputs.json',import.meta.url),'utf8'));
export const AUX_COLD_ENTRY_REFUSAL='/* aux-cold-entry-admission-v1 */\nthrow Object.assign(new Error("Aux state identity generation 2 is quarantined; migration admission is not implemented."), {code:"AUX_STATE_IDENTITY_QUARANTINED"});\n';
export const auxColdEntryAdmissionInputs=Object.freeze(pins.inputs.map(({component,path,sourceSha256})=>Object.freeze({component,path,sourceSha256})));
export function applyAuxColdEntryAdmission({component,path='entry.mjs',text,original,stateIdentityVersion}){
 if(![1,2].includes(stateIdentityVersion))throw Error('Explicit supported state identity version required');
 const pin=pins.inputs.find(input=>input.component===component&&input.path===path);
 if(!pin||typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux cold entry source pin mismatch');
 if(typeof text!=='string')throw Error('Actual composed executable entry required');
 if(text.includes('aux-cold-entry-admission-v1'))throw Error('Mixed or repeated Aux cold entry gate');
 if(stateIdentityVersion===1)return{text,anchors:[]};
 const hashbang=component==='cli'?'#!/usr/bin/env node\n':'';
 // The gate is the first executable statement. Static imports are Node builtins
 // only (pinned/tested); ESM import hoisting therefore introduces no user module.
 if(!text.startsWith(hashbang+pin.find)||text.split(pin.find).length-1!==1)throw Error('Aux cold entry prefix drift');
 const anchor={kind:'integration',name:'Unaccepted state2 direct-entry admission refusal',find:pin.find,replace:AUX_COLD_ENTRY_REFUSAL+pin.find,count:1};
 return{text:text.replace(anchor.find,anchor.replace),anchors:[anchor]};
}
