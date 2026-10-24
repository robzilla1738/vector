/** Actual adapted codec/factory/file-reader/composer callbacks in bounded fakes. */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';
import {applyAuxUiDraftCapture} from '../../../../../vendor/provided/aux-ui-draft-capture.mjs';
const here=new URL('./',import.meta.url),plan=JSON.parse(await readFile(new URL('source-plan.json',here),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
const sources={};for(const row of plan.files){const source=await readFile(row.output,'utf8');assert.equal(sha(source),row.outputSha256);sources[row.path.split('/').at(-1)]=source;}
const capturePins=JSON.parse(await readFile(new URL('../ui-draft-capture-a1/inputs.json',here),'utf8'));
const old=await readFile('/private/tmp/aux-ui-draft-stage-20261024-a1/desktop-v1/agent/'+capturePins.path,'utf8');
assert.equal(sha(old),capturePins.predecessorSha256);
const original=await readFile('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/'+capturePins.path,'utf8');
assert.equal(applyAuxUiDraftCapture({component:'agent',path:capturePins.path,text:old,original,stateIdentityVersion:2}).text,sources['draft-storage-ixLojjZ5.js']);
let cases=0;
function storage(){return{map:new Map,reads:[],failWrites:false,failRemoves:false,get length(){return this.map.size},key(i){return[...this.map.keys()][i]??null},getItem(k){this.reads.push(k);return this.map.get(k)??null},setItem(k,v){if(this.failWrites)throw Error('synthetic quota');this.map.set(k,String(v))},removeItem(k){if(this.failRemoves)throw Error("synthetic remove failure");this.map.delete(k)}}}
function fixture(){
 const id='gokkffaiccpmoeodpmeamcjajcagjmkm',sessionStorage=storage(),localStorage=storage(),elements=[],listeners=new Map;
 const context={Date,JSON,Map,Set,Number,Error,TextEncoder,crypto:{randomUUID:()=> '00000000-0000-4000-8000-000000000001'},
  chrome:{runtime:{id}},document:{querySelectorAll:()=>elements},window:{sessionStorage,localStorage,location:{protocol:'chrome-extension:',pathname:'/newtab.html',hostname:id,origin:'chrome-extension://'+id},
   addEventListener:(type,fn)=>{if(!listeners.has(type))listeners.set(type,new Set);listeners.get(type).add(fn)},removeEventListener:(type,fn)=>listeners.get(type)?.delete(fn)},
  p:fn=>Object.assign(value=>fn(value),{flush(){}}),v:()=>({}),h:()=>({}),P:{},_:()=>({catch:()=>({})}),E:()=>({nullable(){return this},catch(){return this},parse:value=>value})};
 let source=sources['draft-storage-ixLojjZ5.js'].replace(/import\{[^;]+\}from"[^"]+";/g,'');
 source=source.replace(/export\{[^;]+\};/,'globalThis.fixture={read:F,write:J,settings:j,readSettings:$,put:W,claim:H,ack:U,releaseClaim:X,recoveryPrepare:auxPrepareDraftMigrationRecoveryCapture,rawPrepare:auxPrepareDraftMigrationCapture,prepare:()=>auxPrepareDraftMigrationCapture("00000000-0000-4000-8000-000000000002"),readCapture:auxReadDraftMigrationCapture,seal:auxSealDraftMigrationCapture,observeTarget:auxObserveDraftMigrationTarget,settingsOwner:auxGetNewtabDraftSettingsOwner,validate:auxValidateDraftMigrationCapture,release:auxReleaseDraftMigrationCapture,register:auxRegisterDraftMigrationOwner,begin:auxBeginDraftMigrationWork,changed:auxDraftMigrationChanged};');
 runInNewContext(source,context,{timeout:1000});
 const f={api:context.fixture,context,sessionStorage,localStorage,elements,listeners,editor:null};
 const prepare=f.api.prepare;f.api.prepare=()=>{if(!f.editor)editor(f);return prepare()};return f;
}
function editor(f,{text='latest unreported text',onChange}={}){
 const source=sources['create-editor-B-Br5Wz9.js'];const start=source.indexOf('function ye('),end=source.indexOf('function Se(',start);assert(start>=0&&end>start);
 class NativeEditorFake{
  constructor(options){this.options=options;this.doc=options.content;this.isDestroyed=false;this.view={composing:false,dom:{contains:()=>false},focus(){}};this.commands={};}
  getJSON(){return this.doc}get isEmpty(){return !this.doc.plainText}get isEditable(){return this.options.editable}setEditable(value,emit=true){this.options.editable=value;if(emit)this.options.onUpdate()}
  update(value){this.doc=value;this.options.onUpdate()}destroy(){this.isDestroyed=true;this.options.onDestroy()}
 }
 const runtime={root:{disabled:false},composition:{isComposing:false},callbacks:{onChange:onChange??(snapshot=>f.api.write('session-one',{version:2,...snapshot}))}};
 const context={V:NativeEditorFake,C:()=>({plainText:text,doc:{type:'doc'}}),y:value=>value,le:()=>[],oe:{configure:()=>({})},ae:()=>({}),fe:()=>({}),me:'supplied-editor-class',
  auxRegisterDraftMigrationOwner:f.api.register,auxDraftMigrationChanged:f.api.changed,cancelAnimationFrame(){},clearTimeout(){},runtime};
 runInNewContext(source.slice(start,end)+';globalThis.result=ye({},runtime);',context,{timeout:1000});
 const result={...context.result,runtime};f.editor=result;
 const newtab=sources['newtab-editor-u_GbForB.js'],from=newtab.indexOf('const auxRetireNewtab='),to=newtab.indexOf(';window.addEventListener("pagehide",auxRetireNewtab',from);assert(from>=0&&to>from);
 const n={pendingFiles:[],pendingAsk:null,draftPersistenceManaged:false};
 runInNewContext(newtab.slice(from,to)+';',{
  auxRegisterDraftMigrationOwner:f.api.register,auxScope:'newtab-page:synthetic',auxReadNewtabDraftSettings:scope=>f.api.readSettings(scope),auxWriteNewtabDraftSettings:(_,value)=>f.api.settings('newtab-page:synthetic',value),
  n,r:result.editor,m:result.controller,a:'ask',u:false,i:{getDraft:()=>f.api.read('session-one'),write:record=>f.api.write('session-one',record),flush(){}}},{timeout:1000});
 result.newtab=n;return result;
}
// Neither empty registry nor a committed core preceding its real manager
// may qualify. Unknown routes stay unsupported even with a genuine editor.
{
 const f=fixture();assert.equal(f.api.rawPrepare('00000000-0000-4000-8000-000000000002').ok,false);
 const e=editor(f);e.newtab.draftPersistenceManaged=true;assert.equal(f.api.prepare().ok,false);assert.equal(e.editor.isEditable,true);
 e.newtab.draftPersistenceManaged=false;f.context.window.location.pathname='/tabsearch.html';assert.equal(f.api.prepare().ok,false);
 f.context.window.location.pathname='/newtab.html';const lease=f.api.prepare();assert.equal(lease.ok,true);f.api.release(lease.leaseId);cases++;
}
// Latest actual editor state is flushed even before its ordinary update callback.
{
 const f=fixture(),e=editor(f);const lease=plain(f.api.prepare());assert.equal(lease.ok,true);assert.equal(e.editor.isEditable,false);
 assert.equal(JSON.parse(lease.capture.localEntries['aux.chat-draft.v3:session-one']).plainText,'latest unreported text');
 assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,true);assert.equal(f.api.prepare().ok,false);
 const before=JSON.stringify([...f.sessionStorage.map]),observed=plain(f.api.readCapture());assert.equal(observed.ok,true);assert.equal(observed.requestId,lease.requestId);assert.deepEqual(observed.capture,lease.capture);assert.equal(JSON.stringify([...f.sessionStorage.map]),before);assert.equal(f.api.rawPrepare(null).ok,false);
 assert.equal(f.api.release('wrong').released,false);assert.equal(e.editor.isEditable,false);
 assert.equal(f.api.release(lease.leaseId).released,true);assert.equal(e.editor.isEditable,true);cases++;
}
// Native target key changes do not rewrite the sealed source or owner baseline.
{
 const f=fixture();editor(f);const lease=f.api.prepare();
 assert.equal(f.api.observeTarget(lease.leaseId,lease.revision).ok,false);
 const sealed=plain(f.api.seal(lease.leaseId,lease.revision));assert.equal(sealed.ok,true);
 const key='aux.chat-draft.v3:session-one',target='{"version":2,"plainText":"native target"}';
 f.localStorage.map.set(key,target);
 assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);
 const observed=plain(f.api.observeTarget(lease.leaseId,lease.revision));assert.equal(observed.ok,true);
 assert.equal(observed.stores.localEntries[key],target);assert.equal('mutations' in observed.stores,false);
 assert.equal(observed.requestId,lease.requestId);assert.equal('closed' in observed,false);
 f.localStorage.map.set(key,sealed.capture.localEntries[key]);
 assert.deepEqual(plain(f.api.readCapture()).capture,sealed.capture);
 f.api.write('session-one',{version:2,plainText:'productive late edit'});
 assert.equal(f.api.observeTarget(lease.leaseId,lease.revision).ok,false);f.api.release(lease.leaseId);cases++;
}
// Failed restoration retains only failed callbacks and exact cleanup identity.
{
 const f=fixture(),e=editor(f),lease=f.api.prepare();let failed=false;
 const original=e.editor.setEditable.bind(e.editor);
 e.editor.setEditable=(value,emit)=>{if(value&&!failed){failed=true;throw Error('synthetic restore failure')}return original(value,emit)};
 const first=plain(f.api.release(lease.leaseId));assert.equal(first.released,false);assert.equal(first.retained,true);assert.equal(first.leaseId,lease.leaseId);
 const held=plain(f.api.readCapture());assert.equal(held.retained,true);assert.equal(held.requestId,lease.requestId);assert.equal(held.leaseId,lease.leaseId);
 const second=plain(f.api.release(lease.leaseId));assert.equal(second.released,true);assert.equal(second.restored,true);assert.equal(e.editor.isEditable,true);
 const observed=plain(f.api.readCapture());assert.equal(observed.retained,false);assert.equal(observed.released,true);assert.equal(observed.leaseId,lease.leaseId);assert.equal(observed.requestId,lease.requestId);cases++;
}
// Native wire mode preserves exact UTF16, including lone surrogates, without
// embedding decoded store strings that an RFC-native JSON parser can reject.
{
 const f=fixture();editor(f);const key='aux.chat-draft-text.v1:orphan',raw='plain '+String.fromCharCode(0xd800)+' '+String.fromCodePoint(0x1f600);
 f.localStorage.map.set(key,raw);const lease=f.api.rawPrepare('00000000-0000-4000-8000-000000000002','utf16-v1');assert.equal(lease.ok,true);assert.equal(lease.sealed,false);assert.equal('capture' in lease,false);const wire=plain(f.api.seal(lease.leaseId,lease.revision,'utf16-v1'));
 assert.equal(wire.ok,true);assert.equal('capture' in wire,false);assert.equal(typeof wire.captureJson,'string');
 const entry=wire.storeUnits.localEntries.find(record=>String.fromCharCode(...record.key)===key);
 assert.equal(String.fromCharCode(...entry.value),raw);assert(entry.value.includes(0xd800));assert(entry.value.includes(0xd83d));
 assert.equal(JSON.parse(wire.captureJson).localEntries[key],raw);
 assert.deepEqual(plain(f.api.readCapture('utf16-v1')).storeUnits,wire.storeUnits);
 const observed=plain(f.api.observeTarget(lease.leaseId,lease.revision,'utf16-v1'));assert.equal(observed.ok,true);assert.equal('stores' in observed,false);assert.deepEqual(observed.storeUnits.mutations,[]);
 f.api.release(lease.leaseId);cases++;
}
// IME is a real owner predicate; refusal does not alter editable state or draft.
{
 const f=fixture(),e=editor(f);e.runtime.composition.isComposing=true;const before=JSON.stringify([...f.sessionStorage.map]);
 assert.equal(f.api.prepare().ok,false);assert.equal(e.editor.isEditable,true);assert.equal(JSON.stringify([...f.sessionStorage.map]),before);cases++;
}
// A late write is retained by the original failed-draft mechanism and taints.
{
 const f=fixture(),e=editor(f),lease=f.api.prepare();assert.equal(lease.ok,true);
 assert.equal(f.api.write('session-one',{version:2,plainText:'late preserved edit'}),false);
 assert.equal(f.api.read('session-one').plainText,'late preserved edit');assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);assert.equal(f.api.readCapture().retained,true);assert.equal(f.api.readCapture().leaseId,lease.leaseId);
 f.api.release(lease.leaseId);assert.equal(e.editor.isEditable,true);assert.equal(f.api.write('session-one',f.api.read('session-one')),true);cases++;
}
// Claim timeout is not writer completion; bytes and the existing claim survive.
{
 const f=fixture();f.api.put('session-one',{content:'pending'});const claim=f.api.claim('session-one');assert(claim);
 const key='aux.chat-pending-new-session-message.v2',record=JSON.parse(f.sessionStorage.map.get(key));record.claimedAt=1;f.sessionStorage.map.set(key,JSON.stringify(record));
 const before=f.sessionStorage.map.get(key);assert.equal(f.api.prepare().ok,false);assert.equal(f.sessionStorage.map.get(key),before);
 f.api.ack('session-one',claim.claimId);assert.equal(f.api.prepare().ok,true);cases++;
}
// Actual file-reader wrapper retains its productive lifetime through completion.
{
 const f=fixture();let reader;
 class Reader{constructor(){reader=this}readAsDataURL(){}finish(){this.result='data:text/plain;base64,ZmFrZQ==';this.onload()}}
 const context={n:{error(){}},FileReader:Reader,crypto:{randomUUID:()=> 'file'},auxBeginDraftMigrationWork:f.api.begin};
 let source=sources['file-attachments-D5m1O8aA.js'].replace(/import\{[^;]+\}from"[^"]+";/g,'').replace(/export\{[^;]+\};/,'globalThis.upload=_;');
 runInNewContext(source,context,{timeout:1000});
 const pending=context.upload({name:'fixture.txt',type:'text/plain'});assert.equal(f.api.prepare().ok,false);reader.finish();const attachment=await pending;assert.equal(attachment.data,'ZmFrZQ==');
 const lease=f.api.prepare();assert.equal(lease.ok,true);
 const late=context.upload({name:'late.txt',type:'text/plain'});assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);reader.finish();assert.equal((await late).name,'late.txt');f.api.release(lease.leaseId);cases++;
}
// Execute the actual transformed composer inspection/flush registration with
// controlled native editor refs, including the upload-publication barrier.
{
 const f=fixture(),e=editor(f),source=sources['permission-approval-D-GTf91U.js'];
 e.newtab.draftPersistenceManaged=true;f.api.register('session-owner',{inspect:()=>({scope:'same'}),flush(){},freeze:()=>()=>{}});
 const start=source.indexOf('const auxDraftMigrationInspect='),end=source.indexOf('return(0,n.jsx)(lt,',start);assert(start>=0&&end>start);
 const peStart=source.indexOf('const pe='),peEnd=source.indexOf(',vt=',peStart);assert(peStart>=0&&peEnd>peStart);
 const busy={current:true},te=[{id:'attachment',type:'file',name:'fixture.txt',data:'ZmFrZQ=='}];
 const refs={M:{current:e.controller},z:{current:e.controller.getSnapshot()},U:{current:null},Z:{current:'same'},Y:'same',te,X:{current:null},auxDraftSaveFailed:{current:false},se:{error(){}},Ee:()=>false,
  je:record=>f.api.write('session-one',record),ee:{current:0},ze:[],auxFileUnload:busy,oe:{current:null},G:{current:null},ae:{current:false},ce:{current:[]},q:{current:false},w:false,t:'idle',
  a:{useEffectEvent:fn=>fn,useLayoutEffect:fn=>fn()},auxRegisterDraftMigrationOwner:f.api.register};
 runInNewContext(source.slice(peStart,peEnd)+';'+source.slice(start,end),refs,{timeout:1000});
 assert.equal(f.api.prepare().ok,false);busy.current=null;const lease=plain(f.api.prepare());assert.equal(lease.ok,true);
 assert.equal(JSON.parse(lease.capture.localEntries['aux.chat-draft.v3:session-one']).attachments[0].name,'fixture.txt');
 busy.current=true;assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);f.api.release(lease.leaseId);cases++;
}
// Unknown inputs and mounts refuse qualification; no unrelated secret is read.
{
 const f=fixture(),e=editor(f);f.localStorage.map.set('synthetic-provider-secret','do-not-read');
 f.elements.push({tagName:'INPUT',type:'password',value:'synthetic-not-read-out',getAttribute:()=>null});assert.equal(f.api.prepare().ok,false);
 f.elements.length=0;const lease=f.api.prepare();assert.equal(lease.ok,true);editor(f,{text:'new mounted editor'});assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);
 assert(!f.localStorage.reads.includes('synthetic-provider-secret'));f.api.release(lease.leaseId);assert.equal(e.editor.isEditable,true);cases++;
}
// Pending-message replacement during hold is preserved in codec memory and
// never reported as a stable capture. An async flush refuses and restores input.
{
 const f=fixture(),e=editor(f),lease=f.api.prepare();f.api.put('session-two',{content:'late pending message'});assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);f.api.release(lease.leaseId);
 assert.equal(f.context.a.message.content,'late pending message');e.editor.destroy();
 const asyncEditor=editor(f,{onChange:()=>Promise.resolve()});assert.equal(f.api.prepare().ok,false);assert.equal(asyncEditor.editor.isEditable,true);cases++;
}

// Run the actual private chat-command method with an artificial socket/ACK.
// A lost ACK remains unknown after the local Promise rejects; no reset exists.
{
 const source=sources['provider-Cw0zhujt.js'],start=source.indexOf('async#w('),end=source.indexOf('#q(e){',start);assert(start>=0&&end>start);
 function wire(f){
  let resolve,reject;const pending=new Promise((a,b)=>{resolve=a;reject=b});
  const tracker={pendingPromise:null,track:()=>({promise:pending}),reject};
  const socket={isReady:true,sent:false,connect:async()=>{},send(){this.sent=true}};
  const context={socket,tracker,auxBeginDraftMigrationWork:f.api.begin,crypto:{randomUUID:()=> 'wire-command'}};
  runInNewContext('class Client{#i=socket;#d=tracker;send(){return this.#w({type:"prompt"},"wire-command")}'+source.slice(start,end)+'};globalThis.client=new Client;',context,{timeout:1000});
  return{client:context.client,socket,resolve,reject};
 }
 const f=fixture(),good=wire(f),sending=good.client.send();await new Promise(resolve=>setImmediate(resolve));assert.equal(good.socket.sent,true);assert.equal(f.api.prepare().ok,false);good.resolve();await sending;assert.equal(f.api.prepare().ok,true);
 const g=fixture(),lost=wire(g),unknown=lost.client.send();await new Promise(resolve=>setImmediate(resolve));assert.equal(lost.socket.sent,true);lost.reject(Error('synthetic lost acknowledgement'));await assert.rejects(unknown,/lost acknowledgement/);assert.equal(g.api.prepare().ok,false);cases++;
}
// Run actual new-session orchestration. Its physical mutation Promise stays
// productive even when the original caller ignores the returned Promise.
{
 const source=sources['session-composer-Dc0LRfZA.js'],start=source.indexOf('handleCreateAndSend:(0,g.useCallback)(async D=>')+'handleCreateAndSend:(0,g.useCallback)('.length,end=source.indexOf(',[y,k,M,X,fe,E,ae,U,_,c,e,t,h,l,n,u])',start);assert(start>0&&end>start);
 function create(f){
  let resolve,reject;const pending=new Promise((a,b)=>{resolve=a;reject=b});
  const query={queryKey:()=>[],queryFilter:()=>[],infiniteQueryFilter:()=>[]};
  const context={auxBeginDraftMigrationWork:f.api.begin,fe:false,N:{current:false},auxReadResearchIntent:()=>null,auxAssertResearchIntent(){},c:null,cl:async()=>null,U:null,X:{},ae:'guard',_:{},E:'default',n:'new-tab',Oh:()=>false,t:undefined,
   y:{mutateAsync:()=>pending},k:{mutateAsync:()=>pending},M:{},l:0,h:{setQueryData(){},invalidateQueries(){}},u:{sessions:{get:query,messages:query,listPreviewItems:query}},Qr:f.api.put,e(){},ll:async()=>({title:'synthetic error'}),de:{error(){}},Xo(error){if(error?.name==="ReferenceError")throw error}};
  runInNewContext('globalThis.create='+source.slice(start,end),context,{timeout:1000});return{create:context.create,resolve,reject,N:context.N};
 }
 const f=fixture(),good=create(f),creating=good.create({role:'user',content:'synthetic draft'});await Promise.resolve();assert.equal(good.N.current,true);assert.equal(f.api.prepare().ok,false);good.resolve({id:'created-session'});await creating;assert.equal(good.N.current,false);const lease=f.api.prepare();assert.equal(lease.ok,true);assert.equal(JSON.parse(lease.capture.sessionEntries['aux.chat-pending-new-session-message.v2']).mode,'display-only');
 const g=fixture(),lost=create(g),uncertain=lost.create({role:'user',content:'retained draft'});await Promise.resolve();lost.reject(Error('synthetic create reply lost'));await uncertain;assert.equal(lost.N.current,false);assert.equal(g.api.prepare().ok,false);cases++;
}
// The actual session state callback refuses private/unknown serializers and
// serializes normal New Tab options through its registered original codec.
{
 const f=fixture(),source=sources['session-composer-Dc0LRfZA.js'];
 const start=source.indexOf('const auxSessionDraftState='),end=source.indexOf('return{createSessionMutation:y,',start);assert(start>=0&&end>start);
 const settings={draftModelOverride:null,draftPermissionMode:'guard',draftRuntimeConfig:{finalConfirm:true},draftMode:'default',draftProjectId:null};
 const refs={a:null,g:{useEffectEvent:fn=>fn,useLayoutEffect:fn=>fn()},auxRegisterDraftMigrationOwner:f.api.register,N:{current:false},F:false,E:'incognito',i:value=>f.api.settings('newtab-page:synthetic',value),O:{},Hn:()=>({}),s:undefined,o:'newtab-page:synthetic',x:false,he:null,_:settings.draftRuntimeConfig,se:'default',U:null};
 runInNewContext(source.slice(start,end),refs,{timeout:1000});assert.equal(f.api.prepare().ok,false);refs.E='default';refs.O.draftPermissionMode='guard';const lease=f.api.prepare();assert.equal(lease.ok,true);assert.deepEqual(JSON.parse(lease.capture.sessionEntries['aux.sidepanel-new-session-settings.v2:newtab-page:synthetic']),{version:1,...settings});f.api.release(lease.leaseId);cases++;
}
// Actual New Tab session initialization adopts only the settings owner
// registered by the real standalone module, using the existing codec/schema.
{
 const f=fixture();editor(f);const owner=f.api.settingsOwner();assert.equal(owner.scope,'newtab-page:synthetic');
 owner.write({draftModelOverride:null,draftPermissionMode:'guard',draftRuntimeConfig:{finalConfirm:true},draftMode:'default',draftProjectId:null});
 const source=sources['session-composer-Dc0LRfZA.js'],start=source.indexOf('const auxNewtabSettings=auxGetNewtabDraftSettingsOwner();'),end=source.indexOf('const{accountId:l}=ge()',start);assert(start>=0&&end>start);
 const refs={s:undefined,o:undefined,i:undefined,auxGetNewtabDraftSettingsOwner:f.api.settingsOwner};runInNewContext(source.slice(start,end),refs,{timeout:1000});
 assert.equal(refs.o,owner.scope);assert.equal(refs.s.draftRuntimeConfig.finalConfirm,true);assert.equal(refs.i,owner.write);
 const lease=f.api.prepare();assert.equal(lease.ok,true);assert.equal(JSON.parse(lease.capture.sessionEntries['aux.sidepanel-new-session-settings.v2:'+owner.scope]).draftPermissionMode,'guard');f.api.release(lease.leaseId);cases++;
}
// Another prepared frame may legitimately flush shared-origin/namespace
// stores. Seal reads final stores once after the native cohort gates; it does
// not rerun ordinary writers. Thereafter byte changes invalidate qualification.
{
 const f=fixture(),lease=f.api.prepare();assert.equal(lease.sealed,false);
 const key='aux.chat-draft.v3:cohort-other',raw=JSON.stringify({version:2,plainText:'other frame latest'});
 f.localStorage.map.set(key,raw);f.sessionStorage.map.set(key,raw);assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,true);assert.equal(f.api.readCapture().capture.localEntries[key],undefined);
 const sealed=plain(f.api.seal(lease.leaseId,lease.revision));assert.equal(sealed.ok,true);assert.equal(sealed.sealed,true);assert.equal(sealed.capture.localEntries[key],raw);
 assert.deepEqual(plain(f.api.seal(lease.leaseId,lease.revision)),sealed);assert.deepEqual(plain(f.api.readCapture()),sealed);
 f.localStorage.map.set(key,'changed after seal');assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,false);f.api.release(lease.leaseId);cases++;
}
// Cached page memory cannot hide another actual stored claim. A known failed
// ACK removal only supersedes that exact acknowledged claim, never a new one.
{
 const f=fixture(),key='aux.chat-pending-new-session-message.v2';f.api.put('session-one',{content:'cached'});f.sessionStorage.map.set(key,JSON.stringify({sessionId:'session-one',message:{content:'cached'},claimId:'other-current-claim',claimedAt:1}));assert.equal(f.api.prepare().ok,false);
 const g=fixture();g.api.put('session-one',{content:'acknowledged'});const claim=g.api.claim('session-one');g.sessionStorage.failRemoves=true;g.api.ack('session-one',claim.claimId);
 const lease=g.api.prepare();assert.equal(lease.ok,true);assert(lease.capture.mutations.some(value=>value.key===key&&value.operation==='remove'));
 const stored=JSON.parse(g.sessionStorage.map.get(key));stored.claimId='new-claim';g.sessionStorage.map.set(key,JSON.stringify(stored));assert.equal(g.api.validate(lease.leaseId,lease.revision).ok,false);g.api.release(lease.leaseId);cases++;
}
// The real recovery entry freezes and inspects without invoking actual owner
// flush callbacks or changing any durable storage values.
{
 const f=fixture(),e=editor(f,{onChange:()=>{throw Error('flush must not run')}});
 const before=JSON.stringify([[...f.sessionStorage.map],[...f.localStorage.map]]);
 const lease=plain(f.api.recoveryPrepare('00000000-0000-4000-8000-000000000003','utf16-v1'));
 assert.equal(lease.ok,true);assert.equal(lease.recoveryReadOnly,true);assert.equal(e.editor.isEditable,false);
 assert.equal(JSON.stringify([[...f.sessionStorage.map],[...f.localStorage.map]]),before);
 assert(JSON.parse(lease.ownerStateJson).some(row=>row.kind==='rich-editor'&&row.signatureJson.includes('latest unreported text')));
 assert.equal(typeof lease.memoryStateJson,'string');assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,true);
 assert.equal(f.api.release(lease.leaseId).released,true);assert.equal(e.editor.isEditable,true);cases++;
}
// Owner/memory facts remain immutable read-only observations of this held lease;
// an actual late editor change refuses rather than rebasing the captured data.
{
 const f=fixture(),e=editor(f);const lease=plain(f.api.recoveryPrepare('00000000-0000-4000-8000-000000000004','utf16-v1'));
 assert.equal(lease.ok,true);const read=plain(f.api.readCapture('utf16-v1'));
 assert.equal(read.ownerStateJson,lease.ownerStateJson);assert.equal(read.memoryStateJson,lease.memoryStateJson);
 e.editor.update({plainText:'new input',doc:{type:'doc'}});
 assert.equal(f.api.readCapture('utf16-v1').ok,false);f.api.release(lease.leaseId);cases++;
}
const receipt={format:'aux.ui-editor-writer-closure.focused.actual.v1',passed:true,cases,
 actualCodecEditorFactoryFileReaderAndComposerCallbacksExecuted:true,
 actualChatWireMethodAndSessionCreateCallbacksExecuted:true,unknownSentCommandsAndCreateResultsRemainRefused:true,
 retainedLeaseReadOnlyRecoveryAndRequestCorrelationPassed:true,failedRestorationRetriesAndCorrelatedReleaseObservationPassed:true,utf16WirePreservesLoneSurrogatesAndOriginalCaptureJsonPassed:true,
 zeroOwnerMountingManagerMismatchAndUnknownRouteRefused:true,
 cohortReadOnlySealAndPostSealByteValidationPassed:true,readOnlyTargetObservationPreservesSealedSourceAndRefusesProductiveWrites:true,exactAckTombstoneAndStoredClaimFencesPassed:true,privateModeAndSessionSettingsCallbacksChecked:true,consumedCaptureAdapterCompositionPassed:true,
 latestEditorFlushPassed:true,imeUploadPublicationAndClaimRefusalPassed:true,heldLateWritesRetainedAndTainted:true,
 unknownInputsAndOwnerChangesRefused:true,unrelatedStorageValuesUnread:true,
 originalUiClassesPreserved:true,stateV1Unchanged:true,syntheticStoresOnly:true,
 nativeExecuted:false,productExecuted:false,completeWriterCoverage:false,runtimeAccepted:false,
 sourcePlanSha256:sha(await readFile(new URL('source-plan.json',here))),
 consumedAdapterSha256:sha(await readFile(new URL('../../../../../vendor/provided/aux-ui-draft-capture.mjs',here)))};
await writeFile(new URL('actual-focused-a1.json',here),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
