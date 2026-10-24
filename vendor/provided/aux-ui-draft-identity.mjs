/** Paired draft-key names; preserve supplied codecs, claims and write behavior. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/standard-profile-isolation/ui-draft-identity-a1/inputs.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
export function applyAuxUiDraftIdentity({component,path,text,original,stateIdentityVersion}){
  if(component!=='agent'||stateIdentityVersion!==2)return{text,anchors:[]};
  const file=pins.files.find(file=>file.path===path);
  if(!file)return{text,anchors:[]};
  if(typeof original!=='string'||sha(original)!==file.sourceSha256)throw Error('Aux UI draft original source differs: '+path);
  const anchors=[];
  for(const rule of file.rules){
    if(typeof text!=='string'||text.split(rule.find).length-1!==rule.count||text.includes(rule.replace))
      throw Error('Aux UI draft source drift or repeated derivation: '+path);
    text=text.split(rule.find).join(rule.replace);anchors.push({kind:'identity',...rule});
  }
  return{text,anchors};
}
