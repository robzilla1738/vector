/** Synthetic snapshots and actual supplied readers; no real profile/browser APIs. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {AUX_UI_PREFERENCE_MIGRATIONS,migrateAuxUiPreferenceBatch} from '../../../../../vendor/provided/aux-ui-storage-migration.mjs';
import {applyAuxUiStorageIdentity} from '../../../../../vendor/provided/aux-ui-storage-identity.mjs';
const root=process.cwd(),here=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-storage-identity-a1');
const pins=JSON.parse(await fs.readFile(path.join(here,'inputs.json'),'utf8'));
assert.deepEqual(pins.mappings,AUX_UI_PREFERENCE_MIGRATIONS);
const previous='/private/tmp/aux-ui-transient-stage-20261024-a1/desktop-v1/agent';
const stage='/private/tmp/aux-ui-storage-stage-20261024-a1/desktop-v1/agent';
const snapshot=path.join(root,'out/provided-source-snapshot-1.26.1016.1852/agent');
const sha=value=>createHash('sha256').update(value).digest('hex');
let replacements=0;
for(const file of pins.files){
 const original=await fs.readFile(path.join(snapshot,file.path),'utf8');
 const text=await fs.readFile(path.join(previous,file.path),'utf8');
 assert.equal(sha(text),file.predecessorSha256);
 const input={component:'agent',path:file.path,text,original,stateIdentityVersion:2};
 const result=applyAuxUiStorageIdentity(input),actual=await fs.readFile(path.join(stage,file.path),'utf8');
 assert.equal(result.text,actual);
 assert.equal(applyAuxUiStorageIdentity({...input,stateIdentityVersion:1}).text,text);
 assert.throws(()=>applyAuxUiStorageIdentity({...input,text:actual}),/drift or repeated/);
 const checked=spawnSync(process.execPath,['--check',path.join(stage,file.path)],{encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr);
 replacements+=result.anchors.reduce((sum,rule)=>sum+rule.count,0);
}
assert.equal(replacements,18);
const header={format:'aux.ui-storage-snapshot.v1',identityProfile:'aux-v1',
 origin:'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm',profileId:'synthetic-profile-one'};
const inputs=[{...header,storage:'local-storage',entries:{
 'aside.new-tab.omnibox-mode.v1':'ask','aside.browserTabStyle':'horizontal',
 'aside.last-final-confirm.v1':'false','aside.last-permission-mode.v1':'read-only',
 'aside.new-tab.onboarding-helper-state.v1':'folded',theme:'dark','aux:web-sidebar-state':'open',
}},{...header,storage:'chrome-local',entries:{
 'aside.browserColorScheme':'system','aside.capture.enabled':false,'aside.tabsTidy.customPrompt':'  Keep research together.  ',
}}];
const before=structuredClone(inputs),migrated=migrateAuxUiPreferenceBatch(inputs);
assert.deepEqual(inputs,before);
const storage=entries=>{
 const map=new Map(Object.entries(entries));
 return{getItem:key=>map.has(key)?map.get(key):null,setItem:(key,value)=>map.set(key,String(value)),map};
};
const mode=async(directory,entries)=>{
 const script=await fs.readFile(path.join(directory,'assets/omnibox-mode-preference-CWzOtieV.js'),'utf8');
 const marker='export{n as i,o as n,d as r,t};';assert.equal(script.split(marker).length-1,1);
 const localStorage=storage(entries),context={window:{localStorage}};
 runInNewContext(script.replace(marker,'globalThis.fixtureExports={write:n,normalize:o,resolve:d,read:t};'),context,{timeout:1000});
 return{api:context.fixtureExports,localStorage};
};
const oldMode=await mode(previous,inputs[0].entries),newMode=await mode(stage,migrated.snapshots[0].entries);
assert.equal(oldMode.api.read(),'ask');assert.equal(newMode.api.read(),oldMode.api.read());
assert.equal(newMode.api.resolve('search'),'search');assert.equal(newMode.api.resolve(undefined),'ask');
newMode.api.write('search');assert.equal(newMode.localStorage.map.get('aux.new-tab.omnibox-mode.v2'),'search');
assert.equal(newMode.localStorage.map.has('aside.new-tab.omnibox-mode.v1'),false);
const earlyPaint=async(directory,entries,{incognito=false,search=''}={})=>{
 const attributes={},classes=[],document={documentElement:{dataset:{},classList:{add:value=>classes.push(value)},
  toggleAttribute:(name,value)=>{attributes[name]=value}}};
 runInNewContext(await fs.readFile(path.join(directory,'newtab-theme.js'),'utf8'),{
  document,localStorage:storage(entries),chrome:{extension:{inIncognitoContext:incognito}},
  matchMedia:()=>({matches:false}),location:{search},URLSearchParams,
 },{timeout:1000});
 return{dataset:{...document.documentElement.dataset},attributes,classes};
};
for(const options of [{},{search:'?mode=search'},{incognito:true}]){
 const old=await earlyPaint(previous,inputs[0].entries,options);
 const current=await earlyPaint(stage,migrated.snapshots[0].entries,options);
 assert.deepEqual(current,old);
}
const general=await fs.readFile(path.join(stage,'assets/general-3dgRbrRk.js'),'utf8');
const start=general.indexOf('var Ns="aux.capture.enabled.v2"'),end=general.indexOf('var ym=',start);
assert(start>=0&&end>start);
const chromeEntries=structuredClone(migrated.snapshots[1].entries),context={chrome:{storage:{local:{
 get:async key=>({[key]:chromeEntries[key]}),set:async values=>Object.assign(chromeEntries,values),
}}}};
runInNewContext(general.slice(start,end)+';globalThis.fixtureCapture={read:xm,write:Mm};',context,{timeout:1000});
assert.equal(await context.fixtureCapture.read(),false);
await context.fixtureCapture.write(true);assert.equal(chromeEntries['aux.capture.enabled.v2'],true);
assert.equal(Object.hasOwn(chromeEntries,'aside.capture.enabled'),false);
const result={format:'aux.ui-storage-identity.focused.actual.v1',passed:true,files:pins.files.length,
 countedReplacements:replacements,migrationMappings:8,exactPredecessorReplayPassed:true,changedScriptsParse:true,
 compatibilityStateUnchanged:true,repeatedDerivationRefused:true,actualOmniboxReaderWriterPreserved:true,
 actualEarlyPaintStatesPreserved:3,actualCaptureFalsePreserved:true,isolatedSuppliedFunctionsExecuted:true,
 snapshotInputUnchanged:true,realStorageReadOrChanged:false,appLaunched:false,nativeExecuted:false,
 filesystemMigrationCommitted:false,uiGeometryChanged:false,runtimeAcceptance:false};
await fs.writeFile(path.join(here,'actual-focused-a1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,files:pins.files.length,replacements,actualEarlyPaintStates:3,appLaunched:false}));
