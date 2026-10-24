/** Counted extensions to actual supplied editor/codec/writer owners. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/standard-profile-isolation/ui-editor-writer-closure-a1/inputs.json',import.meta.url),'utf8'));
const runtime=readFileSync(new URL('./aux-ui-draft-closure-runtime.js.txt',import.meta.url),'utf8');
const sha=value=>createHash('sha256').update(value).digest('hex');
if(sha(runtime)!==pins.runtimeSha256)throw Error('Aux draft closure runtime differs from review');
export function applyAuxUiDraftClosure({component,path,text,original,stateIdentityVersion}){
  if(component!=='agent'||stateIdentityVersion!==2)return{text,anchors:[]};
  const file=pins.files.find(file=>file.path===path);
  if(!file)return{text,anchors:[]};
  if(typeof original!=='string'||sha(original)!==file.sourceSha256)
    throw Error('Aux draft closure original source differs: '+path);
  if(text.includes('auxRegisterDraftMigrationOwner')||text.includes('auxBeginDraftMigrationWork'))throw Error('Repeated Aux draft closure derivation: '+path);
  const anchors=[];
  for(const rule of file.rules){
    if(text.split(rule.find).length-1!==rule.count)throw Error('Aux draft closure source drift: '+path);
    const replace=rule.replace.replace('__AUX_CLOSURE_RUNTIME__',runtime);
    text=text.split(rule.find).join(replace);anchors.push({kind:'integration',...rule,replace});
  }
  return{text,anchors};
}
