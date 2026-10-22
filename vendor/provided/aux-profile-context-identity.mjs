/** Paired transient profile context identity. No state or native operations. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-profile-context-identity/inputs.json',import.meta.url),'utf8'));
export function applyAuxProfileContextIdentity({component,path,text,original}){
 const pin=pins.inputs.find(input=>input.component===component&&input.path===path);
 if(!pin)return{text,anchors:[]};
 if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux profile context original source pin mismatch');
 if(typeof text!=='string'||original.split(pin.find).length-1!==pin.count||text.split(pin.find).length-1!==pin.count||text.includes(pin.replace))throw Error('Aux profile context generation drift');
 const output=text.split(pin.find).join(pin.replace);
 return{text:output,anchors:[{kind:'identity',name:'Aux transient profile context field',find:pin.find,replace:pin.replace,count:pin.count}]};
}
