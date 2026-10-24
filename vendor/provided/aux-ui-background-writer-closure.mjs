/** Last, exact canonical desktop-v2 worker adaptation. No runtime API patching. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/standard-profile-isolation/ui-background-writer-closure-a1/inputs.json',import.meta.url),'utf8'));
const runtime=readFileSync(new URL('./aux-ui-background-writer-runtime.js.txt',import.meta.url),'utf8');
const sha=value=>createHash('sha256').update(value).digest('hex');
if(sha(runtime)!==pins.runtimeSha256)throw Error('Aux worker closure runtime differs from review');
export function transformAuxUiBackgroundWriterClosure({relative,text,stateIdentityVersion}){
 if(relative!=='background.js'||stateIdentityVersion!==2)return{text,anchors:[]};
 if(text.includes('const auxWorkerPending='))throw Error('Repeated Aux worker closure derivation');
 if(sha(text)!==pins.predecessorSha256)throw Error('Unreviewed canonical Aux background worker input');
 const anchors=[];
 for(const rule of pins.rules){
  if(text.split(rule.find).length-1!==rule.count)throw Error('Aux worker closure source drift');
  const replace=rule.replace.replace('__AUX_WORKER_RUNTIME__',runtime);
  text=text.split(rule.find).join(replace);anchors.push({kind:'integration',...rule,replace});
 }
 return{text,anchors};
}
