/** Actual1852 JSON/layout adapter. Produces bytes only; no state I/O or recovery. */
import {createHash} from 'node:crypto';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const auxProviderJsonSourcePins=Object.freeze({layoutVersion:1,daemonSha256:'5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5',agentSettingsSha256:'4acd8450d7c7c4d5ddbf6104192d2fd2d1a6eaf90564e12be3c0550e7bb83897'});
export function verifyAuxProviderJsonSource({daemonText,agentSettingsText}){
 if(typeof daemonText!=='string'||typeof agentSettingsText!=='string'||sha(daemonText)!==auxProviderJsonSourcePins.daemonSha256||sha(agentSettingsText)!==auxProviderJsonSourcePins.agentSettingsSha256)throw Error('Provider JSON source/layout pin mismatch');
 return auxProviderJsonSourcePins;
}

const own=(value,key)=>Object.hasOwn(value,key);
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const thinking=new Set(['off','minimal','low','medium','high','xhigh','max']);
const categories=new Set(['fast','standard','deep','visual']);
const fail=kind=>{throw Error(`Invalid ${kind} snapshot; original must be preserved`)};
function object(value,kind){if(!record(value))fail(kind);return value}
function strings(value,kind){if(!Array.isArray(value)||value.some(v=>typeof v!=='string'))fail(kind)}
function rename(value,from,to){if(!own(value,from))return;if(own(value,to))throw Error(`Ambiguous ${from}/${to} identity migration`);Object.defineProperty(value,to,Object.getOwnPropertyDescriptor(value,from));delete value[from]}
function selection(value,kind,{image=false}={}){
 object(value,kind);if(typeof value.provider!=='string'||typeof value.modelId!=='string'||!value.modelId.length)fail(kind);
 if(!image&&own(value,'thinkingLevel')&&!thinking.has(value.thinkingLevel))fail(kind);
 if(!image&&own(value,'fastMode')&&typeof value.fastMode!=='boolean')fail(kind);
 if(value.provider==='aside')value.provider='aux';
}
/** Exact supplied stripJsonComments semantics: line comments and trailing commas,
 * but never block comments or JSON5. Quoted command/URL strings stay opaque. */
export function stripProvidedModelsJsonComments(text){return text.replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*/g,token=>token[0]==='"'?token:'').replace(/"(?:\\.|[^"\\])*"|,(\s*[}\]])/g,(token,suffix)=>suffix??(token[0]==='"'?token:''))}
function rejectDuplicateKeys(text){
 const stack=[];
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   let end=i+1;for(;end<text.length;end++){if(text[end]==='\\'){end++;continue}if(text[end]==='"')break}
   const frame=stack.at(-1);if(frame?.object&&frame.key){const key=JSON.parse(text.slice(i,end+1));if(frame.keys.has(key))throw Error('Duplicate JSON key');frame.keys.add(key);frame.key=false}i=end;
  }else if(c==='{')stack.push({object:true,key:true,keys:new Set});else if(c==='[')stack.push({object:false});else if(c==='}'||c===']')stack.pop();else if(c===','&&stack.at(-1)?.object)stack.at(-1).key=true;
 }
}
function decode(bytes,kind){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength>16*1024*1024)fail(kind);
 try{const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);if(text.charCodeAt(0)===0xFEFF)fail(kind);const json=kind==='models'?stripProvidedModelsJsonComments(text):text;rejectDuplicateKeys(json);return JSON.parse(json)}catch{fail(kind)}
}
function configMetadata(value,kind){
 if(kind==='model')rename(value,'asideSource','auxSource');
 if(kind==='provider')rename(value,'asideDisconnected','auxDisconnected');
 if(value.api==='aside-provider')value.api='aux-provider';if(value.api==='aside-images')value.api='aux-images';
}
function modelConfig(value,kind){
 object(value,kind);if(typeof value.id!=='string'||!value.id.length)fail(kind);
 for(const key of ['name','api','baseUrl'])if(own(value,key)&&(typeof value[key]!=='string'||!value[key].length))fail(kind);
 if(own(value,'provider')){if(typeof value.provider!=='string')fail(kind);if(value.provider==='aside')value.provider='aux'}
 if(own(value,'headers')){object(value.headers,kind);if(Object.values(value.headers).some(v=>typeof v!=='string'))fail(kind)}
 configMetadata(value,'model');
}
function providerConfig(value){
 object(value,'models provider');for(const key of ['name','baseUrl','apiKey','api'])if(own(value,key)&&(typeof value[key]!=='string'||!value[key].length))fail('models provider');
 if(own(value,'headers')){object(value.headers,'models headers');if(Object.values(value.headers).some(v=>typeof v!=='string'))fail('models headers')}
 if(own(value,'authHeader')&&typeof value.authHeader!=='boolean')fail('models provider');
 if(own(value,'models')){if(!Array.isArray(value.models))fail('models list');value.models.forEach(model=>modelConfig(model,'models model'))}
 if(own(value,'modelOverrides')){object(value.modelOverrides,'model overrides');for(const entry of Object.values(value.modelOverrides)){object(entry,'model override');configMetadata(entry,'model')}}
 configMetadata(value,'provider');
}
function settings(value){
 object(value,'settings');if(own(value,'defaultModel'))selection(value.defaultModel,'default model');
 if(own(value,'imageGenerationModel')&&value.imageGenerationModel!==null)selection(value.imageGenerationModel,'image model',{image:true});
 if(own(value,'customModels')){if(!Array.isArray(value.customModels))fail('custom models');for(const model of value.customModels){object(model,'custom model');if(typeof model.id!=='string'||typeof model.provider!=='string')fail('custom model');if(model.provider==='aside')model.provider='aux';configMetadata(model,'model')}}
 if(own(value,'modelCategories')){object(value.modelCategories,'model categories');for(const[key,model]of Object.entries(value.modelCategories)){if(!categories.has(key))fail('model category');selection(model,'model category')}}
 rename(value,'asideModelCatalog','auxModelCatalog');
 if(own(value,'auxModelCatalog')){object(value.auxModelCatalog,'managed catalog');for(const key of ['added','removed'])if(own(value.auxModelCatalog,key))strings(value.auxModelCatalog[key],'managed catalog')}
}
function cache(value){
 object(value,'model cache');for(const key of Object.keys(value)){
  let parts;try{parts=JSON.parse(key)}catch{continue}
  let next=key;if(Array.isArray(parts)&&parts.length===3&&parts[0]==='models'&&parts[1]==='provider-catalog'&&parts[2]==='aside')next=JSON.stringify(['models','provider-catalog','aux']);
  if(Array.isArray(parts)&&parts.length===2&&parts[0]==='models'&&parts[1]==='aside-catalog')next=JSON.stringify(['models','aux-catalog']);
  if(next===key)continue;
  const entry=object(value[key],'model cache entry');if(typeof entry.updatedAt!=='number'||!Number.isFinite(entry.updatedAt))fail('model cache timestamp');if(own(entry,'invalidated')&&typeof entry.invalidated!=='boolean')fail('model cache flag');
  const payload=object(entry.value,'model cache value');if(own(payload,'models')){if(!Array.isArray(payload.models))fail('model cache models');for(const model of payload.models){object(model,'cached model');if(model.provider==='aside')model.provider='aux'}}
  if(own(payload,'visibleModelIds'))strings(payload.visibleModelIds,'visible model IDs');
  rename(value,key,next);
 }
}
export function classifyAuxProviderJsonPath(path){
 if(path==='accounts.json')return{kind:'accounts',accountId:null};
 if(typeof path!=='string')throw Error('Unsupported provider JSON path');
 const match=/^u\/(0|[1-9]\d*)\/(credentials\.json|models\.json|settings\.json|cache\/models\.json)$/.exec(path);
 if(!match||!Number.isSafeInteger(Number(match[1])))throw Error('Unsupported provider JSON path');
 return{kind:({'credentials.json':'credentials','models.json':'models','settings.json':'settings','cache/models.json':'cache'})[match[2]],accountId:Number(match[1])};
}
/** Returns a transaction-ready snapshot; caller must quiesce supplied writers,
 * validate source hashes again and durably commit/reload before new consumers run. */
export function prepareAuxProviderJsonFile({path,bytes,version=1}){
 if(version!==1)throw Error('Unsupported provider JSON migration version');
 if(!(bytes instanceof Uint8Array))fail('provider JSON bytes');
 const {kind,accountId}=classifyAuxProviderJsonPath(path),before=Buffer.from(bytes),value=decode(before,kind),initial=JSON.stringify(value);
 object(value,kind);
 if(kind==='accounts'){
  if(!Array.isArray(value.accounts))fail('accounts');for(const account of value.accounts){object(account,'account');if(!['google','email','anonymous'].includes(account.provider))fail('account login provider')}
 }else if(kind==='credentials')rename(value,'aside','aux');
 else if(kind==='models'){if(own(value,'providers')){object(value.providers,'models providers');rename(value.providers,'aside','aux');for(const config of Object.values(value.providers))providerConfig(config)}}
 else if(kind==='settings')settings(value);else cache(value);
 const changed=JSON.stringify(value)!==initial,after=changed?Buffer.from(JSON.stringify(value,null,2)+'\n'):Buffer.from(before);
 return{path,accountId,kind,sourceVersion:1,targetVersion:2,before,after,beforeSha256:sha(before),afterSha256:sha(after),changed};
}
function accountIdValue(value){if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid renderer account identity');return String(value)}
/** Exact renderer localStorage strings, kept separate from filesystem snapshots. */
export function prepareAuxProviderRendererStorage({accountId,entries,version=1}){
 if(version!==1)throw Error('Unsupported renderer provider migration version');object(entries,'renderer storage');const id=accountIdValue(accountId),operations=[];
 for(const[from,to,kind]of [['aside.agent-settings.v2:','aux.agent-settings.v3:','selection'],['aside.settings-inventory.v1:','aux.settings-inventory.v2:','inventory']]){
  const sourceKey=from+id,targetKey=to+id;if(!own(entries,sourceKey))continue;if(own(entries,targetKey))throw Error('Ambiguous account-qualified renderer provider state');
  const before=entries[sourceKey];if(typeof before!=='string')fail('renderer JSON');let value;try{value=JSON.parse(before)}catch{fail('renderer JSON')}object(value,'renderer value');
  if(kind==='selection'){
   if(own(value,'modelProvider')&&typeof value.modelProvider!=='string')fail('renderer selection');if(own(value,'modelId')&&typeof value.modelId!=='string')fail('renderer selection');
   if(own(value,'thinkingLevel')&&!thinking.has(value.thinkingLevel))fail('renderer selection');for(const key of ['fastMode','proactiveMode'])if(own(value,key)&&typeof value[key]!=='boolean')fail('renderer selection');if(value.modelProvider==='aside')value.modelProvider='aux';
  }else{
   if(!Array.isArray(value.availableModels)||!Array.isArray(value.connectedProviders))fail('renderer inventory');
   for(const model of value.availableModels){object(model,'renderer model');if(typeof model.provider!=='string')fail('renderer model');if(model.provider==='aside')model.provider='aux'}
   for(const provider of value.connectedProviders){object(provider,'renderer provider');if(typeof provider.providerId!=='string')fail('renderer provider');if(provider.providerId==='aside')provider.providerId='aux'}
   if(own(value,'visibleModelIdsByProvider')){object(value.visibleModelIdsByProvider,'renderer visible-model map');for(const ids of Object.values(value.visibleModelIdsByProvider))strings(ids,'renderer visible-model IDs');rename(value.visibleModelIdsByProvider,'aside','aux')}
  }
  operations.push({sourceKey,targetKey,before,after:JSON.stringify(value)});
 }
 return{accountId,sourceVersion:1,targetVersion:2,operations};
}
