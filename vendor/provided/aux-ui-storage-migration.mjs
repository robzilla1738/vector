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
export function migrateAuxUiPreferenceSnapshot(input){
  assertJson(input);
  if(!dictionary(input)||!['aux.ui-storage-snapshot.v1','aux.ui-storage-snapshot.v2'].includes(input.format)||input.identityProfile!=='aux-v1'||
      input.origin!=='chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm'||
      typeof input.profileId!=='string'||input.profileId.length<1||input.profileId.length>256||
      !['local-storage','chrome-local'].includes(input.storage)||!dictionary(input.entries)||
      Object.keys(input).some(key=>!['format','identityProfile','origin','profileId','storage','entries'].includes(key)))
    throw Error('Explicit single-profile Aux extension snapshot required');
  if(input.storage==='local-storage'&&Object.values(input.entries).some(value=>typeof value!=='string'))
    throw Error('Local Storage snapshot values must retain their raw string representation');
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
  return{snapshot,receipt:{format:'aux.ui-preference-migration.v1',storage:input.storage,
    sourceSha256:hash(input),outputSha256:hash(snapshot),moved,alreadyEqual,
    remainingLegacyEntries:Object.keys(snapshot.entries).filter(key=>key.startsWith('aside.')||key.startsWith('aside:')).length,
    changedEntries:!isDeepStrictEqual(input.entries,snapshot.entries),runtimeAcceptance:false}};
}

/** Prepare both stores for one profile before returning any commit candidate. */
export function migrateAuxUiPreferenceBatch(inputs){
  assertJson(inputs);
  if(!Array.isArray(inputs)||inputs.length!==2||inputs.some(input=>!dictionary(input))||
      new Set(inputs.map(input=>input.storage)).size!==2||
      inputs.some(input=>input.profileId!==inputs[0].profileId||input.origin!==inputs[0].origin))
    throw Error('Both distinct UI storage scopes from one captured Aux profile are required');
  const prepared=inputs.map(migrateAuxUiPreferenceSnapshot);
  return{format:'aux.ui-preference-batch.v1',snapshots:prepared.map(item=>item.snapshot),
    receipt:{format:'aux.ui-preference-batch.receipt.v1',sourceSha256:hash(inputs),
      outputSha256:hash(prepared.map(item=>item.snapshot)),stores:prepared.map(item=>item.receipt),
      remainingLegacyEntries:prepared.reduce((sum,item)=>sum+item.receipt.remainingLegacyEntries,0),
      filesystemCommitted:false,runtimeAcceptance:false}};
}
