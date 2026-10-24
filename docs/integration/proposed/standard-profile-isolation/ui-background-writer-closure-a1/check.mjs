/** Actual projected worker methods against finite callback fakes; no native run. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';
import {transformAuxBrowserFeatureUi} from '../../../../../vendor/provided/aux-browser-feature-composition.mjs';
import {transformAuxUiBackgroundWriterClosure} from '../../../../../vendor/provided/aux-ui-background-writer-closure.mjs';
const here=new URL('./',import.meta.url),sha=value=>createHash('sha256').update(value).digest('hex');
const plan=JSON.parse(await readFile(new URL('source-plan.json',here),'utf8'));
const source=await readFile(plan.output,'utf8');assert.equal(sha(source),plan.outputSha256);
const runtime=await readFile(new URL('../../../../../vendor/provided/aux-ui-background-writer-runtime.js.txt',here),'utf8');
const pins=JSON.parse(await readFile(new URL('inputs.json',here),'utf8'));assert.equal(sha(runtime),pins.runtimeSha256);
const plain=value=>JSON.parse(JSON.stringify(value));
const request='00000000-0000-4000-8000-000000000002',rpc='00000000-0000-4000-8000-000000000003';
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject}}
async function turn(){for(let i=0;i<16;i++)await Promise.resolve()}
function fixture({started=true,inspector=()=>{},chrome={}}={}){
 const listeners=[],replies=[];
 const context={Promise,Map,Set,Number,Object,JSON,Error,TextEncoder,TextDecoder,Blob,AbortController,structuredClone,console,
  crypto:{randomUUID:()=> '00000000-0000-4000-8000-000000000001'},ServiceWorkerGlobalScope:class{},
  chrome:{storage:{local:{set:()=>Promise.resolve(),remove:()=>Promise.resolve()}},alarms:{create:()=>Promise.resolve()},runtime:{},
   auxBrowserPreferences:{onUiMigrationWorkerControl:{addListener:listener=>listeners.push(listener)},replyUiMigrationWorkerControl:reply=>{replies.push(plain(reply));return Promise.resolve()}},...chrome}};
 runInNewContext(runtime+'\nglobalThis.api={prepare:auxWorkerPrepare,read:auxWorkerRead,validate:auxWorkerValidate,release:auxWorkerRelease,produce:auxWorkerProduce,physical:auxWorkerPhysical,set:auxWorkerStorageLocalSet,remove:auxWorkerStorageLocalRemove,install:auxWorkerInstallInspector,unknown:auxWorkerNoteUnknown};',context,{timeout:1000});
 if(started)context.api.install(inspector);
 return{context,api:context.api,listeners,replies,run:text=>runInNewContext(text,context,{timeout:1000})};
}
let cases=0;
// Child native writes started by a real completion drain before prepare can hold.
{
 const first=deferred(),second=deferred();let writes=0;
 const f=fixture({chrome:{storage:{local:{set:()=>++writes===1?first.promise:second.promise}}}});
 const work=f.api.set({one:1}).then(()=>f.api.set({two:2}));let held=false;
 const preparing=f.api.prepare(request).then(value=>{held=true;return value});await turn();assert.equal(held,false);
 first.resolve();await turn();assert.equal(writes,2);assert.equal(held,false);
 second.resolve();await work;const lease=await preparing;assert.equal(lease.ok,true);assert.equal(lease.pendingCount,0);
 assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,true);cases++;
}
// Deferred native intent retains argument bytes and real callback lifetime.
{
 const native=deferred(),received=[];const f=fixture({chrome:{storage:{local:{set:value=>{received.push(plain(value));return native.promise}}}}});
 const lease=await f.api.prepare(request),intent={draft:{text:'original'}};let done=false;
 const write=f.api.set(intent).then(()=>{done=true});intent.draft.text='later caller mutation';await turn();
 assert.equal(received.length,0);assert.equal(done,false);assert.equal(f.api.validate(lease.leaseId,lease.revision).ok,true);
 assert.equal(f.api.release('wrong').released,false);assert.equal(received.length,0);
 const release=f.api.release(lease.leaseId);assert.equal(release.closed,false);assert.equal(release.pendingCount,1);assert.deepEqual(received,[{draft:{text:'original'}}]);
 await turn();assert.equal(done,false);native.resolve();await write;assert.equal(f.api.read().pendingCount,0);cases++;
}
// Caller catch, release and fresh prepare cannot erase unknown physical outcomes.
{
 const native=deferred(),f=fixture({chrome:{storage:{local:{set:()=>native.promise}}}});
 const work=f.api.set({x:1}).catch(()=>{});native.reject(Error('synthetic native failure'));await work;await turn();
 let lease=await f.api.prepare(request);assert.equal(lease.ok,false);assert.deepEqual(plain(lease.unknownKinds),['chrome-local-set']);
 f.api.release(lease.leaseId);lease=await f.api.prepare(rpc);assert.equal(lease.ok,false);assert.equal(lease.unknownKinds.includes('chrome-local-set'),true);cases++;
}
// Execute the actual bridge command/abort methods, not a copied queue model.
const classStart=source.indexOf('Sy = class {'),classEnd=source.indexOf('}, Ge = null',classStart);assert(classStart>0&&classEnd>classStart);
const classSource=source.slice(classStart+'Sy = '.length,classEnd)+'receive(...args){return this.#r(...args)} disconnect(reason){return this.#n(reason)}}';
function bridgeFixture(f,operation){
 const parse=method=>({safeParse:value=>({success:value?.method===method,data:value})});
 f.context.Ne={pingMessageSchema:parse('ping'),cancelCommandMessageSchema:parse('cancel'),runCommandMessageEnvelopeSchema:parse('run'),runCommandMessageSchema:parse('run')};
 f.context.nc=()=>Promise.resolve({accountId:1,profileId:'synthetic',browserMode:'normal'});f.context.vy=operation;f.context.yy='ws://synthetic.invalid';
 f.run('globalThis.Bridge='+classSource+';');const bridge=new f.context.Bridge(),socket={};bridge.socket=socket;const sent=[];bridge.send=value=>sent.push(plain(value));
 const command=id=>JSON.stringify({method:'run',id,route:{accountId:1,profileId:'synthetic',browserMode:'normal'},command:{method:'synthetic'}});
 return{bridge,socket,sent,command};
}
{
 const native=deferred(),f=fixture();let signal;
 const b=bridgeFixture(f,(_command,actualSignal)=>{signal=actualSignal;return native.promise});
 const work=b.bridge.receive(b.command('run-one'),b.socket,0);await turn();assert.equal(b.bridge.runningCommands.size,1);
 let held=false;const preparing=f.api.prepare(request).then(value=>{held=true;return value});b.bridge.disconnect('synthetic close');
 assert.equal(signal.aborted,true);assert.equal(b.bridge.runningCommands.size,0);await turn();assert.equal(held,false);assert.equal(f.api.read().pendingCount,1);
 native.resolve({complete:true});await work;const lease=await preparing;assert.equal(lease.ok,true);cases++;
}
{
 const f=fixture();let commands=0;const b=bridgeFixture(f,()=>{commands++;return Promise.resolve()});
 const lease=await f.api.prepare(request),work=b.bridge.receive(b.command('queued'),b.socket,0);await turn();assert.equal(commands,0);assert.equal(f.api.read().deferredCount,1);
 await b.bridge.receive(JSON.stringify({method:'cancel',id:'queued'}),b.socket,0);await work;
 assert.equal(f.api.read().deferredCount,0);assert.equal(b.sent.length,1);assert.match(b.sent[0].error,/cancelled/);
 f.api.release(lease.leaseId);await turn();assert.equal(commands,0);cases++;
}
// Actual supplied timeout wrapper may reject while original signing stays live.
{
 const native=deferred(),f=fixture();let signCalls=0;f.context.chrome.auxAccount={signDaemonAuthChallenge:()=>{signCalls++;return native.promise}};
 const from=source.indexOf('async function Ps('),to=source.indexOf('var ql =',from),ts=source.indexOf('async function Ts('),end=source.indexOf('var Os =',ts);assert(from>0&&to>from&&ts>to&&end>ts);
 const controller=new AbortController();f.context.AbortSignal={timeout:()=>controller.signal};f.context.Gl=5000;f.context.jl=()=>Error('aborted');
 f.run(source.slice(from,to)+source.slice(ts,end)+';globalThis.sign=Ts;');
 const work=f.context.sign('synthetic challenge').catch(error=>error);controller.abort();await work;assert.equal(signCalls,1);
 let held=false;const preparing=f.api.prepare(request).then(value=>{held=true;return value});await turn();assert.equal(held,false);assert.equal(f.api.read().pendingCount,1);
 native.resolve({signedChallenge:'synthetic'});const lease=await preparing;assert.equal(lease.ok,true);cases++;
}
// Real context-menu update failure is not completion of its fallback create.
{
 let update,create;const f=fixture({chrome:{runtime:{},contextMenus:{update:(_id,_value,callback)=>{update=callback},create:(_value,callback)=>{create=callback}}}});
 const start=source.indexOf('function Hg(...args)'),end=source.indexOf('var di =',start);assert(start>0&&end>start);f.run(source.slice(start,end)+';globalThis.menu=Hg;');
 const work=f.context.menu({id:'synthetic',title:'test'});let held=false;const preparing=f.api.prepare(request).then(value=>{held=true;return value});
 f.context.chrome.runtime.lastError={message:'not found'};update();delete f.context.chrome.runtime.lastError;await turn();assert.equal(held,false);assert.equal(typeof create,'function');
 create();await work;assert.equal((await preparing).ok,true);cases++;
}
// Native control correlation separates fresh RPCs from retained capture IDs.
{
 const f=fixture(),listener=f.listeners[0];assert.equal(f.listeners.length,1);
 listener({requestId:request,operation:'prepare'});await turn();let reply=f.replies.at(-1),lease=JSON.parse(reply.resultJson);assert.equal(lease.ok,true);
 listener({requestId:rpc,operation:'read'});await turn();reply=f.replies.at(-1);assert.equal(reply.requestId,rpc);assert.equal(JSON.parse(reply.resultJson).requestId,request);assert(Buffer.byteLength(reply.resultJson)<=65536);
 listener({requestId:rpc,operation:'release',leaseId:lease.leaseId,profileId:'forbidden selector'});await turn();assert.equal(JSON.parse(f.replies.at(-1).resultJson).ok,false);assert.equal(f.api.read().retained,true);
 f.context.chrome.auxBrowserPreferences.replyUiMigrationWorkerControl=()=>Promise.reject(Error('lost reply'));
 listener({requestId:rpc,operation:'read'});await turn();assert.equal(f.api.read().retained,true);assert.equal(f.api.read().leaseId,lease.leaseId);cases++;
}
// Module startup and actual active tab-capture owner inspection are mandatory.
{
 const f=fixture({started:false});assert.equal((await f.api.prepare(request)).ok,false);
 f.api.install(()=>{throw Error('Tab capture subscribers are still active')});assert.equal((await f.api.prepare(request)).ok,false);cases++;
}
// Prove final post-feature composition matches the pinned canonical predecessor.
const baseline='/private/tmp/aux-ui-draft-capture-stage-20261024-a3/baseline/agent/background.js';
const before=await readFile(baseline,'utf8'),features=transformAuxBrowserFeatureUi({relative:'background.js',text:before});assert.equal(sha(features.text),pins.predecessorSha256);
const composed=transformAuxUiBackgroundWriterClosure({relative:'background.js',text:features.text,stateIdentityVersion:2});assert.equal(composed.text,source);cases++;
const nativeRoot='/private/tmp/aux-chromium-recovery-snapshot-20261023/src/';
const nativeContracts=[];for(const path of ['extensions/common/api/alarms.webidl','extensions/common/api/storage.json'])nativeContracts.push({path,sha256:sha(await readFile(nativeRoot+path))});
const receipt={format:'aux.ui-background-writer-closure.focused.actual.v1',passed:true,cases,
 actualProjectedBridgeCommandAndDisconnectMethodsExecuted:true,actualSuppliedSignTimeoutAndContextMenuCallbacksExecuted:true,
 nativePromiseCompletionNotAbortMapClearOrCallerCatch:true,deferredIntentBytesRetained:true,unknownOutcomesNeverReset:true,
 knownDeferredCommandCancellationRetainsOriginalReplySemantics:true,freshNativeRpcAndRetainedCaptureCorrelationChecked:true,
 startupAndActiveCaptureOwnerRefusalChecked:true,lastPostFeatureCompositionPassed:true,nativeContracts,
 sourcePlanSha256:sha(await readFile(new URL('source-plan.json',here))),syntheticNativeCallbacksOnly:true,
 nativeExecuted:false,productExecuted:false,completeWriterCoverage:false,runtimeAccepted:false};
await writeFile(new URL('actual-focused-a1.json',here),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
