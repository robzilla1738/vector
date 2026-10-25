/** Exact eight-module replay plus only the newly added adoption boundary. */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
const here=new URL('./',import.meta.url),plan=JSON.parse(await readFile(new URL('source-plan.json',here),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex'),plain=value=>JSON.parse(JSON.stringify(value));
const sources={},tree=await mkdtemp('/private/tmp/aux-ui-owner-adoption-replay-');
const git=(...args)=>{const result=spawnSync('git',['-C',tree,...args],{encoding:'utf8'});assert.equal(result.status,0,result.stderr)};
for(const row of plan.files){
 const original=await readFile(row.input,'utf8');assert.equal(sha(original),row.inputSha256);
 let output=original;
 for(const anchor of row.anchors){assert.equal(output.split(anchor.find).length-1,anchor.count);output=output.replace(anchor.find,anchor.replace)}
 assert.equal(sha(output),row.outputSha256);assert.equal(output,await readFile(row.output,'utf8'));
 const classes=text=>[...text.matchAll(/className:(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g)].map(value=>value[0]);
 assert.deepEqual(classes(output),classes(original),'Provided class strings changed: '+row.path);
 const syntax=spawnSync('node',['--check',row.output],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
 const input=join(tree,row.path);await mkdir(dirname(input),{recursive:true});await writeFile(input,original);
 sources[row.path.split('/').at(-1)]=output;
}
git('init','-q');git('add','--all');
git('apply','--check',new URL('modules.patch',here).pathname);git('apply',new URL('modules.patch',here).pathname);
for(const row of plan.files)assert.equal(sha(await readFile(join(tree,row.path))),row.outputSha256);
git('apply','--reverse','--check',new URL('modules.patch',here).pathname);git('diff','--check');
const runtime=await readFile(new URL('runtime-output.js.txt',here),'utf8');assert.equal(sha(runtime),plan.runtimeOutputSha256);
assert(sources['draft-storage-ixLojjZ5.js'].includes(runtime));
let cases=0;
const scope='newtab-page:00000000-0000-4000-8000-000000000010';
const doc=text=>({type:'doc',content:[{type:'paragraph',content:text?[{type:'text',text}]:[]}]}),
 snapshot=value=>({doc:value,plainText:value.content[0].content.map(item=>item.text).join(''),attachments:[],mentions:[]}),
 record=text=>({version:2,plainText:text,doc:doc(text),attachments:[]});
function storage(){return{map:new Map,writes:0,fail:false,get length(){return this.map.size},key(i){return[...this.map.keys()][i]??null},getItem(key){return this.map.get(key)??null},setItem(key,value){this.writes++;if(this.fail)throw Error('synthetic unavailable');this.map.set(key,String(value))},removeItem(key){this.writes++;if(this.fail)throw Error('synthetic unavailable');this.map.delete(key)}}}
function fixture(text='saved source'){
 const sessionStorage=storage(),localStorage=storage(),id='gokkffaiccpmoeodpmeamcjajcagjmkm',listeners=new Map;let serial=1;
 const initial=record(text);for(const store of [sessionStorage,localStorage])store.map.set('aux.chat-draft.v3:'+scope,JSON.stringify(initial));
 const context={Date,JSON,Map,Set,Number,Error,TextEncoder,crypto:{randomUUID:()=>`00000000-0000-4000-8000-${String(serial++).padStart(12,'0')}`},
  chrome:{runtime:{id}},document:{querySelectorAll:()=>[]},window:{sessionStorage,localStorage,location:{protocol:'chrome-extension:',pathname:'/newtab.html',hostname:id,origin:'chrome-extension://'+id},
   addEventListener:(kind,fn)=>{if(!listeners.has(kind))listeners.set(kind,new Set);listeners.get(kind).add(fn)},removeEventListener:(kind,fn)=>listeners.get(kind)?.delete(fn)},
  p:fn=>Object.assign(value=>fn(value),{flush(){}}),v:()=>({}),h:()=>({}),P:{},_:()=>({catch:()=>({})}),E:()=>({nullable(){return this},catch(){return this},parse:value=>value})};
 let source=sources['draft-storage-ixLojjZ5.js'].replace(/import\{[^;]+\}from"[^"]+";/g,'');
 source=source.replace(/export\{[^;]+\};/,'globalThis.api={read:F,write:J,put:W,claim:H,ack:U,get:g,writer:b,prepare:auxPrepareDraftMigrationCapture,recovery:auxPrepareDraftMigrationRecoveryCapture,seal:auxSealDraftMigrationCapture,readCapture:auxReadDraftMigrationCapture,release:auxReleaseDraftMigrationCapture,register:auxRegisterDraftMigrationOwner,changed:auxDraftMigrationChanged,applying:auxDraftMigrationRecoveryApplying,readDraft:auxDraftRecoveryDraftForScope,adopt:auxAdoptDraftMigrationRecovery,readAdoption:auxReadDraftMigrationRecoveryAdoption,handoff:auxHandoffDraftMigrationRecovery,readHandoff:auxReadDraftMigrationRecoveryHandoff};');
 runInNewContext(source,context,{timeout:1000});const api=context.api;
 class Editor{
  constructor(options){this.options=options;this.doc=options.content;this.isDestroyed=false;this.view={composing:false,dom:{contains:()=>false,isConnected:true},focus:()=>{this.focused=true}};
   this.schema={nodeFromJSON:value=>({toJSON:()=>value})};this.commands={setContent:(value,opts)=>{this.doc=value;if(opts.emitUpdate)this.options.onUpdate()},focus:()=>{this.focused=true},setTextSelection(){}};}
  getJSON(){return this.doc}get isEmpty(){return !snapshot(this.doc).plainText}get isEditable(){return this.options.editable}setEditable(value,emit=true){this.options.editable=value;if(emit)this.options.onUpdate()}
  update(text){this.doc=doc(text);this.options.onUpdate()}
 }
 const original=sources['create-editor-B-Br5Wz9.js'],first=original.indexOf('function ye('),last=original.indexOf('function Se(',first);
 const runtime={root:{disabled:false},composition:{isComposing:false},callbacks:{onChange:value=>api.write(undefined,{version:2,...value},scope)}};
 const editorContext={V:Editor,C:()=>doc(text),y:snapshot,le:()=>[],oe:{configure:()=>({})},ae:()=>({}),fe:()=>({}),me:'provided class',auxRegisterDraftMigrationOwner:api.register,auxDraftMigrationChanged:api.changed,auxDraftMigrationRecoveryApplying:api.applying,cancelAnimationFrame(){},clearTimeout(){},runtime};
 runInNewContext(original.slice(first,last)+';globalThis.editorResult=ye({},runtime);',editorContext,{timeout:1000});
 const result=editorContext.editorResult;
 const writer=api.writer(initial,value=>api.write(undefined,value,scope));
 const newtab=sources['newtab-editor-u_GbForB.js'],from=newtab.indexOf('const auxRetireNewtab='),to=newtab.indexOf(';window.addEventListener("pagehide",auxRetireNewtab',from);
 const refs={auxRegisterDraftMigrationOwner:api.register,auxScope:scope,auxReadNewtabDraftSettings:()=>null,auxWriteNewtabDraftSettings(){},auxDraftRecoveryDraftForScope:api.readDraft,
  n:{pendingFiles:[],pendingAsk:null,draftPersistenceManaged:false,setMode(value){refs.a=value}},r:result.editor,m:result.controller,a:'ask',u:false,i:writer,auxRecoveryModeRevision:0,C:value=>['ask','search'].includes(value)?value:null,M:value=>snapshot(value?.doc??doc('')),auxRestorePending:false};
 runInNewContext(newtab.slice(from,to)+';',refs,{timeout:1000});
 return{api,context,sessionStorage,localStorage,editor:result.editor,controller:result.controller,writer,refs,listeners};
}
function storedTarget(source){const result=plain(source);for(const mutation of result.mutations??[]){const entries=mutation.storage==='session-storage'?result.sessionEntries:result.localEntries;if(mutation.operation==='set')entries[mutation.key]=mutation.value;else delete entries[mutation.key]}result.mutations=[];return result}
function oldJournal(){
 const f=fixture();f.sessionStorage.fail=f.localStorage.fail=true;f.editor.update('latest unsaved');f.writer.write(record('latest unsaved'));
 const held=f.api.prepare('00000000-0000-4000-8000-000000000020','utf16-v1');assert.equal(held.ok,true);
 const source=plain(f.api.seal(held.leaseId,held.revision,'utf16-v1'));assert.equal(source.ok,true);
 return{source,sourceCapture:JSON.parse(source.captureJson),targetCapture:storedTarget(JSON.parse(source.captureJson))};
}
function planFor(journal,desired){return{format:'aux.ui-draft-owner-adoption.v1',desired,
 sourceOwnerStateJson:journal.source.ownerStateJson,targetOwnerStateJson:journal.source.ownerStateJson,
 sourceMemoryStateJson:journal.source.memoryStateJson,targetMemoryStateJson:journal.source.memoryStateJson,
 sourceCaptureJson:JSON.stringify(journal.sourceCapture),targetCaptureJson:JSON.stringify(journal.targetCapture)}}
// Actual core controller, writer and New Tab setters restore captured latest
// text; source stores remain older and failed-memory intent remains intact.
{
 const journal=oldJournal(),f=fixture(),held=f.api.recovery('00000000-0000-4000-8000-000000000030','utf16-v1');assert.equal(held.ok,true);f.api.seal(held.leaseId,held.revision,'utf16-v1');
 const writes=f.sessionStorage.writes+f.localStorage.writes,original=f.api.readCapture('utf16-v1').captureJson;
 const adopted=plain(f.api.adopt(held.leaseId,held.revision,planFor(journal,'source')));assert.equal(adopted.ok,true,adopted.error);assert.equal(adopted.complete,true);
 assert.equal(f.controller.getSnapshot().plainText,'latest unsaved');assert.equal(f.writer.getDraft().plainText,'latest unsaved');assert.equal(f.editor.focused,undefined);
 assert.equal(JSON.parse(adopted.memoryStateJson).drafts[0][1].plainText,'latest unsaved');assert.equal(f.sessionStorage.writes+f.localStorage.writes,writes);
 const successor=plain(f.api.handoff(held.leaseId,held.revision,'00000000-0000-4000-8000-000000000031'));assert.equal(successor.ok,true,successor.error);assert.equal(successor.sealed,false);assert.equal(successor.recoveryReadOnly,false);assert.equal(successor.closedHandoff,true);assert.equal(f.editor.isEditable,false);assert.equal(f.api.applying(),true);
 assert.equal(f.api.release(held.leaseId).released,false);assert.equal(f.editor.isEditable,false);
 assert.equal(f.api.readHandoff(held.leaseId,held.revision,'00000000-0000-4000-8000-000000000031').leaseId,successor.leaseId);
 assert.equal(f.api.handoff(held.leaseId,held.revision,'00000000-0000-4000-8000-000000000031').leaseId,successor.leaseId);
 assert.equal(f.api.readHandoff(held.leaseId,held.revision,'00000000-0000-4000-8000-000000000099').ok,false);
 assert.notEqual(original,successor.captureJson);assert.equal(JSON.parse(successor.captureJson).sessionEntries['aux.chat-draft.v3:'+scope],journal.sourceCapture.sessionEntries['aux.chat-draft.v3:'+scope]);
 assert.equal(f.api.release(successor.leaseId).released,true);assert.equal(f.editor.isEditable,true);cases++;
}
// Target adoption retires only dirty records whose exact physical intents are
// actually present; no ordinary storage setter or File object is invoked.
{
 const journal=oldJournal(),f=fixture('latest unsaved');for(const store of [f.sessionStorage,f.localStorage])store.map.set('aux.chat-draft.v3:'+scope,journal.targetCapture.sessionEntries['aux.chat-draft.v3:'+scope]);
 const held=f.api.recovery('00000000-0000-4000-8000-000000000032','utf16-v1');assert.equal(held.ok,true);f.api.seal(held.leaseId,held.revision,'utf16-v1');
 const result=plain(f.api.adopt(held.leaseId,held.revision,planFor(journal,'target')));assert.equal(result.complete,true,result.error);assert.equal(JSON.parse(result.memoryStateJson).drafts.length,0);assert.equal(f.sessionStorage.writes+f.localStorage.writes,0);f.api.release(held.leaseId);cases++;
}
// A real newer clear back to the old stored value must not be overwritten.
{
 const journal=oldJournal(),f=fixture();f.controller.clear();
 // Native-like fixture storage is the empty source but the supplied editor
 // clear counter proves this owner has performed real newer work.
 f.editor.doc=doc('saved source');
 const held=f.api.recovery('00000000-0000-4000-8000-000000000033','utf16-v1');assert.equal(held.ok,true);f.api.seal(held.leaseId,held.revision,'utf16-v1');
 const before=f.controller.getSnapshot(),result=f.api.adopt(held.leaseId,held.revision,planFor(journal,'source'));assert.equal(result.ok,false);assert.deepEqual(plain(f.controller.getSnapshot()),plain(before));f.api.release(held.leaseId);cases++;
}
// Every owner preflights before the first mutation; unknown attachments refuse.
{
 const journal=oldJournal(),f=fixture(),held=f.api.recovery('00000000-0000-4000-8000-000000000034','utf16-v1');f.api.seal(held.leaseId,held.revision,'utf16-v1');
 const plan=planFor(journal,'source'),owners=JSON.parse(plan.sourceOwnerStateJson),value=owners.find(value=>value.kind==='newtab');const data=JSON.parse(value.signatureJson);data.draft.attachments=[{type:'file',id:'unknown'}];value.signatureJson=JSON.stringify(data);plan.sourceOwnerStateJson=plan.targetOwnerStateJson=JSON.stringify(owners);
 const result=f.api.adopt(held.leaseId,held.revision,plan);assert.equal(result.ok,false);assert.equal(result.pending,false);assert.equal(f.controller.getSnapshot().plainText,'saved source');f.api.release(held.leaseId);cases++;
}
// Actual pending-message read/claim methods preserve a real failed-ACK
// tombstone while a newer stored claim stays visible and cannot be stolen.
{
 const f=fixture();f.api.put('session-one',{content:'already sent'});const claim=f.api.claim('session-one');assert(claim);f.sessionStorage.fail=true;f.api.ack('session-one',claim.claimId);assert.equal(f.api.get('session-one'),null);assert.equal(f.api.claim('session-one'),null);
 const newer={sessionId:'session-one',message:{content:'new owner'},claimId:'new-claim',claimedAt:Date.now(),mode:'client-send'};f.sessionStorage.map.set('aux.chat-pending-new-session-message.v2',JSON.stringify(newer));assert.equal(f.api.get('session-one').claimId,'new-claim');assert.equal(f.api.claim('session-one'),null);cases++;
}
// Actual session hook setters retain pending custody through an old passive
// effect; only the committed next state identity settles it. Same state is
// a no-op and cannot wait forever for a dependency-identical effect.
{
 const source=sources['session-composer-Dc0LRfZA.js'];
 const begin=source.indexOf('const auxRecoverySessionAdopt='),end=source.indexOf(';(0,g.useLayoutEffect)',begin);
 assert(begin>=0&&end>begin);
 const effectBegin=source.indexOf('(0,g.useEffect)(()=>{if(auxDraftMigrationRecoveryApplying())'),effectEnd=source.indexOf('},[o,se,O.draftPermissionMode,U,_,he,i]);',effectBegin);
 assert(effectBegin>=0&&effectEnd>effectBegin);
 const initial={draftModelOverride:null,draftPermissionMode:'guard',draftRuntimeConfig:{},draftMode:'client',draftProjectId:null};
 const pending={current:null},refs={g:{useEffectEvent:fn=>fn,useEffect:fn=>{refs.effect=fn}},
  auxSessionDraftState:()=>({scope:'actual-page',mode:'client',settings:refs.settings}),
  auxRecoveryOptionsRevision:{current:0},auxRecoveryOptionsPending:pending,
  auxDraftMigrationRecoveryApplying:()=>true,auxDraftRecoverySettingsForScope:()=>null,
  o:'actual-page',x:{},O:{...initial,stateKey:'actual-page'},settings:initial,v:[],Gt:()=>true,
  Hn:()=>({...initial,stateKey:'actual-page'}),i:()=>{throw Error('ordinary persistence must stay paused')},
  I:value=>{refs.next=value},R:{current:false},j:{current:'actual-page'},se:'client',U:null,_:{},he:null};
 runInNewContext(source.slice(begin,end)+';globalThis.adoptOptions=auxRecoverySessionAdopt;',refs,{timeout:1000});
 const same=refs.adoptOptions({scope:'actual-page',mode:'client',settings:initial},{matched:true});same();assert.equal(pending.current,null);
 const changed={...initial,draftPermissionMode:'ask'};
 const apply=refs.adoptOptions({scope:'actual-page',mode:'client',settings:changed},{matched:true});apply();assert.equal(pending.current,refs.next);
 const effect=source.slice(effectBegin,effectEnd+'},[o,se,O.draftPermissionMode,U,_,he,i]);'.length);
 runInNewContext(effect,refs,{timeout:1000});refs.effect();assert.equal(pending.current,refs.next,'stale effect settled a later commit');
 refs.O=refs.next;refs.settings=changed;runInNewContext(effect,refs,{timeout:1000});refs.effect();assert.equal(pending.current,null);cases++;
}
const result={format:'aux.ui-owner-adoption.focused.actual.v1',passed:true,modules:plan.files.length,
 changedModules:plan.files.filter(row=>row.anchors.length).length,countedAnchors:plan.files.reduce((n,row)=>n+row.anchors.length,0),
 focusedActualCodeSyntheticCases:cases,exactReplayPassed:true,reversePatchPassed:true,moduleSyntaxPassed:true,providedClassStringsPreserved:true,
 sourcePlanSha256:sha(await readFile(new URL('source-plan.json',here))),activeAdaptersChanged:false,nativeExecuted:false,productExecuted:false,runtimeAcceptance:false};
await writeFile(new URL('actual-focused-a27.json',here),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
