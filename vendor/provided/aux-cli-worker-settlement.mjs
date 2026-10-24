/** Preserve the supplied native Worker body and JSON ABI, await actual exit. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../docs/integration/proposed/standard-profile-isolation/cli-worker-settlement-a1/',import.meta.url);
const pins=JSON.parse(readFileSync(new URL('inputs.json',root),'utf8'));
const originalFunction=readFileSync(new URL('source/original.js.txt',root),'utf8');
const replacementFunction=readFileSync(new URL('source/replacement.js.txt',root),'utf8');
const rules=JSON.parse(readFileSync(new URL('source/anchors.json',root),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
if(sha(originalFunction)!==pins.originalFunctionSha256||sha(replacementFunction)!==pins.replacementFunctionSha256||rules.length!==3)
  throw Error('Aux CLI Worker reviewed source differs');
export function applyAuxCliWorkerSettlement({text,original,stateIdentityVersion}){
  if(stateIdentityVersion!==2)return{text,anchors:[]};
  if(typeof original!=='string'||sha(original)!==pins.sourceSha256||
      original.split(originalFunction).length-1!==1||typeof text!=='string'||text.split(originalFunction).length-1!==1)
    throw Error('Aux CLI Worker original source drift or repeated integration');
  let replacement=originalFunction;
  for(const rule of rules){
    if(replacement.split(rule.find).length-1!==rule.count)throw Error('Aux CLI Worker anchor differs');
    replacement=replacement.split(rule.find).join(rule.replace);
  }
  if(replacement!==replacementFunction)throw Error('Aux CLI Worker replay differs');
  return{text:text.replace(originalFunction,replacementFunction),anchors:rules};
}
