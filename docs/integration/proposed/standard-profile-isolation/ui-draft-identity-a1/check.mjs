/** Actual supplied draft codec with synthetic page stores; no browser/native IO. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {AUX_UI_DRAFT_MIGRATIONS,migrateAuxUiPreferenceBatch} from '../../../../../vendor/provided/aux-ui-storage-migration.mjs';
import {applyAuxUiDraftIdentity} from '../../../../../vendor/provided/aux-ui-draft-identity.mjs';
const root=process.cwd(),here=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-draft-identity-a1');
const pins=JSON.parse(await fs.readFile(path.join(here,'inputs.json'),'utf8'));
assert.deepEqual(pins.mappings,AUX_UI_DRAFT_MIGRATIONS);
const previous='/private/tmp/aux-ui-storage-stage-20261024-a1/desktop-v1/agent';
const stage='/private/tmp/aux-ui-draft-stage-20261024-a1/desktop-v1/agent';
const snapshot=path.join(root,'out/provided-source-snapshot-1.26.1016.1852/agent');
const sha=value=>createHash('sha256').update(value).digest('hex');let replacements=0;
for(const file of pins.files){
 const original=await fs.readFile(path.join(snapshot,file.path),'utf8');
 const text=await fs.readFile(path.join(previous,file.path),'utf8');assert.equal(sha(text),file.predecessorSha256);
 const input={component:'agent',path:file.path,text,original,stateIdentityVersion:2};
 const result=applyAuxUiDraftIdentity(input),actual=await fs.readFile(path.join(stage,file.path),'utf8');
 assert.equal(result.text,actual);assert.equal(applyAuxUiDraftIdentity({...input,stateIdentityVersion:1}).text,text);
 assert.throws(()=>applyAuxUiDraftIdentity({...input,text:actual}),/drift or repeated/);
 const syntax=spawnSync(process.execPath,['--check',path.join(stage,file.path)],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
 replacements+=result.anchors.reduce((sum,rule)=>sum+rule.count,0);
}
assert.equal(replacements,9);
const captured=(storage,entries,pageId)=>({format:'aux.ui-storage-snapshot.v1',identityProfile:'aux-v1',
 origin:'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm',profileId:'fixture-profile',storage,entries,...pageId?{pageId}:{}});
const durable={version:2,plainText:'Shared text',attachments:[{name:'synthetic.txt',path:'/synthetic/retained',size:12}]};
const pageDraft={...durable,plainText:'Page-specific text'};
const pending={sessionId:'session-one',message:{content:'Synthetic pending content'},mode:'display-only',claimId:'existing-claim',claimedAt:1000};
const captures=[captured('local-storage',{'aside.chat-draft.v2:session-one':JSON.stringify(durable),'aside.chat-draft.v1:new':'Legacy text'}),
 captured('chrome-local',{}),captured('session-storage',{'aside.chat-draft.v2:session-one':JSON.stringify(pageDraft),
 'aside.chat-pending-new-session-message.v1':JSON.stringify(pending)},'page-one')];
const originalCaptures=structuredClone(captures),migrated=migrateAuxUiPreferenceBatch(captures);
assert.deepEqual(captures,originalCaptures);
const storage=entries=>({map:new Map(Object.entries(entries)),failWrites:false,
 getItem(key){return this.map.has(key)?this.map.get(key):null},
 setItem(key,value){if(this.failWrites)throw Error('synthetic quota failure');this.map.set(key,String(value))},
 removeItem(key){this.map.delete(key)}});
const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
async function codec(directory,local,session){
 let source=await fs.readFile(path.join(directory,'assets/draft-storage-ixLojjZ5.js'),'utf8');
 const imports=[...source.matchAll(/import\{[^;]+\}from"[^"]+";/g)];assert.equal(imports.length,3);
 source=source.replace(/import\{[^;]+\}from"[^"]+";/g,'');
 const exports='export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u};';
 assert.equal(source.split(exports).length-1,1);
 source=source.replace(exports,'globalThis.fixtureDraft={read:F,write:J,peek:k,put:W,claim:H,ack:U,release:X};');
 const listeners=new Set(),time={now:2000};
 class FixtureDate extends Date{static now(){return time.now}}
 const context={Date:FixtureDate,crypto:{randomUUID:()=> 'synthetic-new-claim'},window:{
  localStorage:storage(local),sessionStorage:storage(session),
  addEventListener:name=>listeners.add(name),removeEventListener:name=>listeners.delete(name),
 }};
 runInNewContext(source,context,{timeout:1000});
 return{api:context.fixtureDraft,window:context.window,listeners,time};
}
const old=await codec(previous,captures[0].entries,captures[2].entries);
const current=await codec(stage,migrated.snapshots[0].entries,migrated.snapshots[2].entries);
assert.deepEqual(plain(current.api.read('session-one')),plain(old.api.read('session-one')));
assert.deepEqual(plain(current.api.read('session-one')),pageDraft);
assert.deepEqual(plain(current.api.read()),plain(old.api.read()));
assert.equal(current.api.read().plainText,'Legacy text');
assert.deepEqual(plain(current.api.peek('session-one')),plain(old.api.peek('session-one')));
assert.equal(current.api.claim('session-one'),null);assert.equal(old.api.claim('session-one'),null);
old.time.now=current.time.now=20000;
assert.deepEqual(plain(current.api.claim('session-one')),plain(old.api.claim('session-one')));
current.api.ack('session-one','synthetic-new-claim');old.api.ack('session-one','synthetic-new-claim');
assert.equal(current.api.peek('session-one'),null);assert.equal(old.api.peek('session-one'),null);
const changed={...durable,plainText:'Changed but not durably saved'};
old.window.localStorage.failWrites=current.window.localStorage.failWrites=true;
assert.equal(current.api.write('session-one',changed),false);assert.equal(old.api.write('session-one',changed),false);
assert.deepEqual(plain(current.api.read('session-one')),changed);
assert.equal(current.listeners.has('beforeunload'),true);assert.equal(old.listeners.has('beforeunload'),true);
old.window.localStorage.failWrites=current.window.localStorage.failWrites=false;
assert.equal(current.api.write('session-one',changed),true);assert.equal(old.api.write('session-one',changed),true);
assert.equal(current.listeners.has('beforeunload'),false);assert.equal(old.listeners.has('beforeunload'),false);
assert.equal(current.window.localStorage.getItem('aux.chat-draft.v3:session-one'),old.window.localStorage.getItem('aside.chat-draft.v2:session-one'));
assert.equal(current.api.write('session-one',null),true);assert.equal(old.api.write('session-one',null),true);
assert.equal(current.api.read('session-one'),null);assert.equal(old.api.read('session-one'),null);
const report={format:'aux.ui-draft-identity.focused.actual.v1',passed:true,files:pins.files.length,countedReplacements:9,
 exactPredecessorReplayPassed:true,changedScriptsParse:true,compatibilityStateUnchanged:true,
 actualSuppliedCodecExecutedWithSyntheticStores:true,sessionOverLocalPrecedencePreserved:true,legacyTextReaderPreserved:true,
 attachmentMetadataPreserved:true,pendingClaimAndAckBehaviorPreserved:true,quotaFailureKeepsUnsavedDraft:true,
 unloadGuardAndRetryPreserved:true,emptyDraftRemovalPreserved:true,realStorageReadOrChanged:false,
 fileAttachmentsRead:false,appLaunched:false,nativeExecuted:false,runtimeAcceptance:false};
await fs.writeFile(path.join(here,'actual-focused-a1.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,files:pins.files.length,replacements,actualSuppliedCodecFixturePassed:true,appLaunched:false}));
