import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/desktop/agent-remaining-identity/source-pins.json',import.meta.url),'utf8'));
export function transformAuxAgentRemainingIdentity({path,text,source}) {
  const name=path.replaceAll('\\','/');
  const pin=pins.files.find(file=>name===file.path||name.endsWith('/'+file.path)||name===file.path.split('/extension/dist/')[1]||name.split('/').at(-1)===file.path.split('/').at(-1));
  if(!pin)return {text,anchors:[]};
  if(typeof source!=='string'||typeof text!=='string'||createHash('sha256').update(source).digest('hex')!==pin.inputSha256)
    throw Error('Remaining Aux v2 Agent identity requires exact original A38 source separately from accumulated text.');
  const anchors=[];
  for(const rule of pin.anchors){
    if(source.split(rule.find).length-1!==rule.count||text.split(rule.find).length-1!==rule.count)
      throw Error(`Remaining Aux Agent identity drift: ${pin.path} ${rule.find}`);
    text=text.replaceAll(rule.find,()=>rule.replace);
    anchors.push({kind:'identity',scope:'Fresh Aux v2 owned Agent producer/receiver; known legacy error reader retained',...rule});
  }
  return {text,anchors};
}
