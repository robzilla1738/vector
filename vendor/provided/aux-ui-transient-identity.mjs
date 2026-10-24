/** Paired transient UI identities; original structure/styles/state are retained. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/standard-profile-isolation/ui-transient-identity-a1/inputs.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');

export function applyAuxUiTransientIdentity({component,path,text,original,stateIdentityVersion}) {
  if(component!=='agent'||stateIdentityVersion!==2)return{text,anchors:[]};
  const file=pins.files.find(file=>file.path===path);
  if(!file)return{text,anchors:[]};
  if(typeof original!=='string'||sha(original)!==file.sourceSha256)
    throw Error('Aux transient UI original source differs: '+path);
  const anchors=[];
  for(const rule of file.rules){
    if(typeof text!=='string'||text.split(rule.find).length-1!==rule.count||text.includes(rule.replace))
      throw Error('Aux transient UI source drift or repeated derivation: '+path+': '+rule.name);
    text=text.split(rule.find).join(rule.replace);
    anchors.push({kind:'identity',...rule});
  }
  return{text,anchors};
}
