import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('./inputs.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
export function applyAuxNativeTaskPaths(source){
  if(typeof source!=='string'||sha(source)!==pins.sourceSha256)throw Error('Aux task-path source pin mismatch.');
  let text=source;
  const anchors=[];
  for(const rule of pins.rules){
    if(text.split(rule.find).length-1!==rule.count)throw Error(`Aux task-path anchor drift: ${rule.label}`);
    text=text.split(rule.find).join(rule.replace);
    anchors.push({label:rule.label,count:rule.count});
  }
  if(sha(text)!==pins.outputSha256)throw Error('Aux task-path output pin mismatch.');
  return {text,anchors,sourceSha256:pins.sourceSha256,outputSha256:pins.outputSha256};
}
export const auxNativeTaskPathInputs=Object.freeze({source:pins.source,sourceSha256:pins.sourceSha256,outputSha256:pins.outputSha256,nativeContract:Object.freeze(pins.nativeContract)});
