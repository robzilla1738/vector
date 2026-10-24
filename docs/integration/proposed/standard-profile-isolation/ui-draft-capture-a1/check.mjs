/** Exercise the actual supplied codec and new capture in synthetic page stores. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {applyAuxUiDraftCapture} from '../../../../../vendor/provided/aux-ui-draft-capture.mjs';

const root=process.cwd(),here=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-draft-capture-a1');
const pins=JSON.parse(await fs.readFile(path.join(here,'inputs.json'),'utf8'));
const previous=await fs.readFile(path.join('/private/tmp/aux-ui-draft-stage-20261024-a1/desktop-v1/agent',pins.path),'utf8');
const original=await fs.readFile(path.join(root,'out/provided-source-snapshot-1.26.1016.1852/agent',pins.path),'utf8');
const sha=value=>createHash('sha256').update(value).digest('hex');
assert.equal(sha(previous),pins.predecessorSha256);
const input={component:'agent',path:pins.path,text:previous,original,stateIdentityVersion:2};
const current=applyAuxUiDraftCapture(input);
assert.equal(current.anchors.length,10);
assert.equal(applyAuxUiDraftCapture({...input,stateIdentityVersion:1}).text,previous);
assert.throws(()=>applyAuxUiDraftCapture({...input,text:current.text}),/Repeated/);
assert.throws(()=>applyAuxUiDraftCapture({...input,original:'changed'}),/original source/);
const output=await fs.mkdtemp('/private/tmp/aux-ui-draft-capture-focused-');
await fs.writeFile(path.join(output,'codec.mjs'),current.text);
const parse=spawnSync(process.execPath,['--check',path.join(output,'codec.mjs')],{encoding:'utf8'});
assert.equal(parse.status,0,parse.stderr);

const plain=value=>JSON.parse(JSON.stringify(value));
function storage(entries={}){
  return {map:new Map(Object.entries(entries)),failWrites:false,failRemoves:false,failReads:false,
    writes:0,reads:[],get length(){return this.map.size},key(index){return [...this.map.keys()][index]??null},
    getItem(key){this.reads.push(key);if(this.failReads)throw Error('Synthetic read failure');return this.map.get(key)??null},
    setItem(key,value){this.writes++;if(this.failWrites)throw Error('Synthetic quota failure');this.map.set(key,String(value))},
    removeItem(key){this.writes++;if(this.failRemoves)throw Error('Synthetic remove failure');this.map.delete(key)}};
}
function codec(source,{local={},session={}}={}){
  const imports=[...source.matchAll(/import\{[^;]+\}from"[^"]+";/g)];assert.equal(imports.length,3);
  source=source.replace(/import\{[^;]+\}from"[^"]+";/g,'');
  const exportText=source===previous?'export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u};':
    'export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u,auxCaptureDraftMigration};';
  // Import removal makes direct string comparison unsuitable; the named capture
  // export is the only intentional difference in the original export cohort.
  const selected=source.includes(',auxCaptureDraftMigration};')?exportText:
    'export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u};';
  assert.equal(source.split(selected).length-1,1);
  source=source.replace(selected,'globalThis.fixture={read:F,write:J,put:W,peek:k,claim:H,ack:U,release:X,settings:j'+
    (selected.includes('auxCaptureDraftMigration')?',capture:auxCaptureDraftMigration':'')+'};');
  const listeners=new Set(),id='gokkffaiccpmoeodpmeamcjajcagjmkm';
  const context={Date,crypto:{randomUUID:()=> 'synthetic-existing-claim'},chrome:{runtime:{id}},window:{
    localStorage:storage(local),sessionStorage:storage(session),
    location:{protocol:'chrome-extension:',hostname:id,origin:'chrome-extension://'+id},
    addEventListener:name=>listeners.add(name),removeEventListener:name=>listeners.delete(name)}};
  runInNewContext(source,context,{timeout:1000});
  return {api:context.fixture,window:context.window,listeners};
}
const draft={version:2,plainText:'Synthetic unsaved text',attachments:[{name:'fixture.txt',path:'/synthetic/retained',size:3}]};
const active='aux.chat-draft.v3:',legacy='aux.chat-draft-text.v1:',pending='aux.chat-pending-new-session-message.v2';
const apply=(entries,mutations,scope)=>{
  const result={...entries};for(const mutation of mutations.filter(item=>item.storage===scope)){
    if(mutation.operation==='remove')delete result[mutation.key];else result[mutation.key]=mutation.value;
  }return result;
};

// Quota failure retains the actual in-memory payload, including attachment
// metadata. Capturing it performs reads only, and never reads unrelated values.
{
  const old=codec(previous),next=codec(current.text,{local:{'unrelated-provider-key':'synthetic-do-not-read'}});
  old.window.localStorage.failWrites=next.window.localStorage.failWrites=true;
  assert.equal(old.api.write('session-one',draft),false);assert.equal(next.api.write('session-one',draft),false);
  const before=next.window.localStorage.writes+next.window.sessionStorage.writes;
  const captured=plain(next.api.capture());
  assert.equal(next.window.localStorage.writes+next.window.sessionStorage.writes,before);
  assert(!next.window.localStorage.reads.includes('unrelated-provider-key'));
  assert.deepEqual(plain(next.api.read('session-one')),plain(old.api.read('session-one')));
  assert.deepEqual(JSON.parse(apply(captured.localEntries,captured.mutations,'local-storage')[active+'session-one']),draft);
  assert(next.listeners.has('beforeunload'));
  next.window.localStorage.failWrites=false;
  assert.equal(next.api.write('session-one',draft),true);
  assert.equal(next.api.capture().mutations.length,0);
  assert(!next.listeners.has('beforeunload'));
}

// An ephemeral draft must not become a shared local draft. A failed empty
// draft removal is represented by tombstones in both stores, never new text.
{
  const next=codec(current.text,{local:{[active+'new']:'stale shared draft'}});
  next.window.localStorage.failRemoves=true;
  assert.equal(next.api.write(undefined,draft,'new'),false);
  let captured=plain(next.api.capture());
  assert.equal(apply(captured.localEntries,captured.mutations,'local-storage')[active+'new'],undefined);
  assert.deepEqual(JSON.parse(apply(captured.sessionEntries,captured.mutations,'session-storage')[active+'new']),draft);
  assert.equal(next.api.write(undefined,null,'new'),false);
  captured=plain(next.api.capture());
  for(const scope of ['session-storage','local-storage']){
    const entries=apply(scope==='local-storage'?captured.localEntries:captured.sessionEntries,captured.mutations,scope);
    assert.equal(entries[active+'new'],undefined);assert.equal(entries[legacy+'new'],undefined);
  }
}

// Existing in-flight claims survive capture. Failed acknowledgement removal
// remains a removal intent even though the serialized record is still present.
{
  const next=codec(current.text);next.api.put('session-two',{content:'Synthetic pending message'},{mode:'display-only'});
  next.window.sessionStorage.failWrites=true;
  const claim=next.api.claim('session-two');assert(claim);
  let captured=plain(next.api.capture());
  let value=JSON.parse(apply(captured.sessionEntries,captured.mutations,'session-storage')[pending]);
  assert.equal(value.claimId,claim.claimId);assert.equal(value.mode,'display-only');
  const claimedAt=value.claimedAt;captured=plain(next.api.capture());
  value=JSON.parse(apply(captured.sessionEntries,captured.mutations,'session-storage')[pending]);
  assert.equal(value.claimedAt,claimedAt);assert.equal(next.api.claim('session-two'),null);
  next.window.sessionStorage.failWrites=false;next.window.sessionStorage.failRemoves=true;
  next.api.ack('session-two',claim.claimId);captured=plain(next.api.capture());
  assert.equal(apply(captured.sessionEntries,captured.mutations,'session-storage')[pending],undefined);
  assert(next.window.sessionStorage.map.has(pending));
}

// Settings quota failure is captured with original bytes. Unsupported/cyclic
// payloads, unavailable stores and the wrong origin refuse a complete result.
{
  const next=codec(current.text);next.window.sessionStorage.failWrites=true;
  const settings={draftModelOverride:null,draftPermissionMode:'guard',draftRuntimeConfig:{finalConfirm:true},draftMode:'agent',draftProjectId:null};
  next.api.settings('page-one',settings);
  const mutation=next.api.capture().mutations.find(item=>item.key==='aux.sidepanel-new-session-settings.v2:page-one');
  assert.deepEqual(JSON.parse(mutation.value),{version:1,...settings});
  next.window.sessionStorage.failWrites=false;next.api.settings('page-one',settings);
  assert.equal(next.api.capture().mutations.length,0);
  const cyclic={};cyclic.self=cyclic;next.api.settings('page-two',{draftRuntimeConfig:cyclic});
  assert.throws(()=>next.api.capture(),/cannot be serialized/);
  const wrong=codec(current.text);wrong.window.location.protocol='https:';
  assert.throws(()=>wrong.api.capture(),/extension context/);
  const missing=codec(current.text);missing.window.sessionStorage.failReads=true;
  missing.window.sessionStorage.map.set(active+'session-three','raw');
  assert.throws(()=>missing.api.capture(),/read failure/);
}
const receipt={format:'aux.ui-draft-capture.focused.actual.v1',passed:true,countedEdits:10,
  suppliedCodecExecutedWithSyntheticStores:true,readOnlyCapturePassed:true,
  unsavedDurableAndEphemeralDraftsCaptured:true,removalTombstonesCaptured:true,
  pendingClaimAndFailedAcknowledgementPreserved:true,settingsQuotaAndSerializationRefusalPassed:true,
  originalReadWriteBehaviorPreserved:true,unrelatedValuesUnread:true,changedSourceParses:true,
  realStorageReadOrChanged:false,attachmentFilesRead:false,appLaunched:false,nativeExecuted:false,
  callerAdmissionImplemented:false,runtimeAcceptance:false,sourceSha256:sha(current.text),
  adapterSha256:sha(await fs.readFile(path.join(root,'vendor/provided/aux-ui-draft-capture.mjs'))),
  runtimeSha256:pins.runtimeSha256,output};
await fs.writeFile(path.join(here,'actual-focused-a1.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,countedEdits:10,output,appLaunched:false}));
