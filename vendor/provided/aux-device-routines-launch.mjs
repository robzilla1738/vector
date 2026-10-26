import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/desktop/device-routines-launch/source-pins.json',import.meta.url),'utf8'));
export function transformAuxDeviceRoutines({path,text,source}) {
  const name=path.replaceAll('\\','/');
  const pin=pins.files.find(row=>name===row.path||name.endsWith('/'+row.path)||name.split('/').at(-1)===row.path.split('/').at(-1));
  if(!pin)return {text,anchors:[]};
  if(typeof source!=='string'||typeof text!=='string'||createHash('sha256').update(source).digest('hex')!==pin.inputSha256)
    throw Error('Device routines require exact original A38 source separately from accumulated final text.');
  const anchors=[];
  for(const rule of pin.anchors){
    if(source.split(rule.find).length-1!==rule.count||text.split(rule.find).length-1!==rule.count)
      throw Error(`Device-routine source drift: ${pin.path} ${rule.find.slice(0,100)}`);
    text=text.replaceAll(rule.find,()=>rule.replace);
    anchors.push({kind:'launch-scope',scope:'Device routines only; cloud records preserved and never reinterpreted',...rule});
  }
  return {text,anchors};
}
