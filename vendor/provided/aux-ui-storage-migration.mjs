/** Offline, in-memory migration of explicitly captured Aux extension snapshots.
 * No browser/filesystem access, no runtime fallback, and no authority creation.
 * The caller must capture/commit under stopped-writer ownership and keep backups.
 */
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';

const entry=(storage,fromKey,toKey,kind)=>Object.freeze({storage,fromKey,toKey,kind});
export const AUX_UI_PREFERENCE_MIGRATIONS=Object.freeze([
  entry('local-storage','aside.new-tab.omnibox-mode.v1','aux.new-tab.omnibox-mode.v2','omnibox'),
  entry('local-storage','aside.browserTabStyle','aux.browserTabStyle.v2','tab-style'),
  entry('local-storage','aside.last-final-confirm.v1','aux.last-final-confirm.v2','boolean-text'),
  entry('local-storage','aside.last-permission-mode.v1','aux.last-permission-mode.v2','permission'),
  entry('local-storage','aside.new-tab.onboarding-helper-state.v1','aux.new-tab.onboarding-helper-state.v2','onboarding'),
  entry('chrome-local','aside.browserColorScheme','aux.browserColorScheme.v2','color-scheme'),
  entry('chrome-local','aside.capture.enabled','aux.capture.enabled.v2','boolean'),
  entry('chrome-local','aside.tabsTidy.customPrompt','aux.tabsTidy.customPrompt.v2','prompt'),
]);
const family=(storages,fromPrefix,toPrefix,kind,exact=false)=>Object.freeze({storages:Object.freeze(storages),fromPrefix,toPrefix,kind,exact});
export const AUX_UI_DRAFT_MIGRATIONS=Object.freeze([
  family(['local-storage','session-storage'],'aside.chat-draft.v2:','aux.chat-draft.v3:','draft-json-v2'),
  family(['local-storage','session-storage'],'aside.chat-draft.v1:','aux.chat-draft-text.v1:','draft-text'),
  family(['session-storage'],'aside.sidepanel-new-session-settings.v1:','aux.sidepanel-new-session-settings.v2:','session-settings-v1'),
  family(['session-storage'],'aside.chat-pending-new-session-message.v1','aux.chat-pending-new-session-message.v2','pending-message',true),
]);
const own=(value,key)=>Object.hasOwn(value,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&
  [Object.prototype,null].includes(Object.getPrototypeOf(value));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function assertJson(value,depth=0,seen=new Set()){
  if(depth>100)throw Error('UI snapshot nesting exceeds the supported bound');
  if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return;
  if((!Array.isArray(value)&&!dictionary(value))||seen.has(value)||Object.getOwnPropertySymbols(value).length)
    throw Error('UI snapshot must contain plain acyclic JSON');
  if(Array.isArray(value)&&Object.keys(value).some((key,index)=>key!==String(index)))
    throw Error('UI snapshot arrays must contain consecutive JSON entries');
  if(Array.isArray(value)&&Object.keys(value).length!==value.length)
    throw Error('UI snapshot arrays must not contain holes');
  seen.add(value);
  for(const [key,property] of Object.entries(Object.getOwnPropertyDescriptors(value))){
    if(Array.isArray(value)&&key==='length')continue;
    if(!own(property,'value')||!property.enumerable)throw Error('UI snapshot accessors or hidden fields are unsupported');
    assertJson(property.value,depth+1,seen);
  }
  seen.delete(value);
}
function valid(value,kind){
  if(kind==='boolean')return typeof value==='boolean';
  if(typeof value!=='string')return false;
  switch(kind){
    case 'omnibox':return ['ask','search'].includes(value);
    case 'tab-style':return ['horizontal','vertical'].includes(value);
    case 'boolean-text':return ['true','false'].includes(value);
    case 'permission':return ['read-only','guard','full-access'].includes(value);
    case 'onboarding':return ['folded','expanded'].includes(value);
    case 'color-scheme':return ['system','light','dark'].includes(value);
    case 'prompt':return value.length<=300;
    default:throw Error('Unsupported UI preference schema');
  }
}
function validDraft(raw,kind){
  if(typeof raw!=='string'||raw.length>5242880)return false;
  if(kind==='draft-text')return true;
  let value;try{value=JSON.parse(raw)}catch{return false}
  if(!dictionary(value))return false;
  if(kind==='draft-json-v2')return value.version===2&&typeof value.plainText==='string';
  if(kind==='session-settings-v1')return value.version===1;
  if(kind==='pending-message')return typeof value.sessionId==='string'&&value.sessionId.length>0&&
    dictionary(value.message)&&(value.mode===undefined||['client-send','display-only'].includes(value.mode))&&
    (value.claimId===undefined||typeof value.claimId==='string')&&
    (value.claimedAt===undefined||typeof value.claimedAt==='number'&&Number.isFinite(value.claimedAt));
  throw Error('Unsupported UI draft schema');
}
function draftSuffix(key,prefix,exact){
  if(exact)return key===prefix?'':null;
  if(!key.startsWith(prefix))return null;
  const suffix=key.slice(prefix.length);
  if(!suffix||suffix.length>4096||/[\p{Cc}]/u.test(suffix))throw Error('Unsupported UI draft scope');
  return suffix;
}
export function migrateAuxUiPreferenceSnapshot(input){
  assertJson(input);
  if(!dictionary(input)||!['aux.ui-storage-snapshot.v1','aux.ui-storage-snapshot.v2'].includes(input.format)||input.identityProfile!=='aux-v1'||
      input.origin!=='chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm'||
      typeof input.profileId!=='string'||input.profileId.length<1||input.profileId.length>256||
      !['local-storage','chrome-local','session-storage'].includes(input.storage)||!dictionary(input.entries)||
      Object.keys(input).some(key=>!['format','identityProfile','origin','profileId','storage','entries','pageId'].includes(key)))
    throw Error('Explicit single-profile Aux extension snapshot required');
  if(input.storage==='session-storage'?(typeof input.pageId!=='string'||!input.pageId||input.pageId.length>256):own(input,'pageId'))
    throw Error('Session Storage requires its own captured page identity');
  if(input.storage!=='chrome-local'&&Object.values(input.entries).some(value=>typeof value!=='string'))
    throw Error('Web Storage snapshot values must retain their raw string representation');
  const snapshot=structuredClone(input),moved=[],alreadyEqual=[];
  snapshot.format='aux.ui-storage-snapshot.v2';
  for(const rule of AUX_UI_PREFERENCE_MIGRATIONS){
    if(rule.storage!==input.storage){
      if(own(input.entries,rule.fromKey)||own(input.entries,rule.toKey))throw Error('Preference key occurs in the wrong storage scope');
      continue;
    }
    const source=own(input.entries,rule.fromKey),target=own(input.entries,rule.toKey);
    if(target&&!valid(input.entries[rule.toKey],rule.kind)||source&&!valid(input.entries[rule.fromKey],rule.kind))
      throw Error('Invalid UI preference value: '+rule.toKey);
    if(!source)continue;
    if(target&&!isDeepStrictEqual(input.entries[rule.fromKey],input.entries[rule.toKey]))
      throw Error('Conflicting UI preference values: '+rule.toKey);
    if(target)alreadyEqual.push(rule.toKey);
    else{snapshot.entries[rule.toKey]=structuredClone(input.entries[rule.fromKey]);moved.push(rule.toKey)}
    delete snapshot.entries[rule.fromKey];
  }
  const drafts={moved:0,alreadyEqual:0};
  for(const rule of AUX_UI_DRAFT_MIGRATIONS){
    for(const [key,raw] of Object.entries(input.entries)){
      const oldSuffix=draftSuffix(key,rule.fromPrefix,rule.exact),newSuffix=draftSuffix(key,rule.toPrefix,rule.exact);
      if(oldSuffix===null&&newSuffix===null)continue;
      if(!rule.storages.includes(input.storage))throw Error('Draft key occurs in the wrong storage scope');
      if(!validDraft(raw,rule.kind))throw Error('Invalid UI draft record: '+rule.kind);
      if(oldSuffix===null)continue;
      const target=rule.toPrefix+oldSuffix;
      if(own(input.entries,target)&&input.entries[target]!==raw)throw Error('Conflicting UI draft values: '+rule.kind);
      if(own(input.entries,target))drafts.alreadyEqual++;
      else{snapshot.entries[target]=raw;drafts.moved++}
      delete snapshot.entries[key];
    }
  }
  return{snapshot,receipt:{format:'aux.ui-storage-migration.v2',storage:input.storage,
    sourceSha256:hash(input),outputSha256:hash(snapshot),moved,alreadyEqual,
    drafts,rawDraftValuesPreserved:true,
    remainingLegacyEntries:Object.keys(snapshot.entries).filter(key=>key.startsWith('aside.')||key.startsWith('aside:')).length,
    changedEntries:!isDeepStrictEqual(input.entries,snapshot.entries),runtimeAcceptance:false}};
}

/** Prepare both shared stores and every captured page before returning a candidate. */
export function migrateAuxUiPreferenceBatch(inputs){
  assertJson(inputs);
  if(!Array.isArray(inputs)||inputs.length<2||inputs.length>130||inputs.some(input=>!dictionary(input))||
      inputs.filter(input=>input.storage==='local-storage').length!==1||
      inputs.filter(input=>input.storage==='chrome-local').length!==1||
      inputs.some(input=>!['local-storage','chrome-local','session-storage'].includes(input.storage))||
      new Set(inputs.filter(input=>input.storage==='session-storage').map(input=>input.pageId)).size!==
        inputs.filter(input=>input.storage==='session-storage').length||
      inputs.some(input=>input.profileId!==inputs[0].profileId||input.origin!==inputs[0].origin))
    throw Error('Both distinct shared stores and unique pages from one captured Aux profile are required');
  const prepared=inputs.map(migrateAuxUiPreferenceSnapshot);
  return{format:'aux.ui-storage-batch.v2',snapshots:prepared.map(item=>item.snapshot),
    receipt:{format:'aux.ui-storage-batch.receipt.v2',sourceSha256:hash(inputs),
      outputSha256:hash(prepared.map(item=>item.snapshot)),stores:prepared.map(item=>item.receipt),
      remainingLegacyEntries:prepared.reduce((sum,item)=>sum+item.receipt.remainingLegacyEntries,0),
      filesystemCommitted:false,runtimeAcceptance:false}};
}
