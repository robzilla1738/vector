import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {auxCreateProductivityAccountGuard,auxRunProductivityRequest,auxStopProductivityRequests,auxCancelProductivityRequest,transformAuxProductivityDaemon} from './aux-productivity-integration.mjs';
import {auxRunDownloadNameRequest,auxStopDownloadNameRequests,auxCancelDownloadNameRequest,proposeDownloadName,validDownloadStem,transformAuxFilesDaemon} from './aux-productivity-files.mjs';
import {runProductivityPlan,validateTidyPlan} from './aux-productivity-proposals.mjs';

// Only selected static account methods execute. The 12 MB bundle is never
// imported, initialized, connected to a browser, or given filesystem access.
const source=readFileSync(process.env.AUX_PRODUCTIVITY_SOURCE??'/private/tmp/aux-offline-runtime-source-20261023/index.mjs','utf8');
const between=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert.ok(a>=0&&b>a);return source.slice(a,b)};
const pieces={
 assertion:between('function assertAccountInstance(', 'function scheduleIdleCleanup('),
 notifications:between('function onAccountAuthChange(', 'var listeners,'),
 revoke:between('function revokeExternalOwner(', 'var epochs,'),
 getAccount:between('getAccount(Cn){','getCurrentAccountId(){'),
 removeAccount:between('removeAccount(Cn,ei=', 'resolveAnalyticsId(Cn){')
};
const provenance=createHash('sha256').update(JSON.stringify(pieces)).digest('hex');
assert.equal(provenance,'d440bb5454ac54845c70b731be814e76cdc4dc05a3832ba7f41790af24fa5bb7');
const pause=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return{promise,release}};
function fixture(kind) {
 const started=pause(),gate=pause();let point='resolve',completeCalls=0,inferenceSignal;
 const account={id:7,name:'Fixture',createdAt:111,incarnationId:'original',provider:'anonymous',mode:'local',authStatus:'active'};
 const selection={provider:'fixture',modelId:'fixture-model'};
 const response={stopReason:'stop',content:[{type:'text',text:JSON.stringify(kind==='tidy'?{groups:[{title:'Fixture',tabIds:['one','two']}]}:{stem:'Fixture name'})}]};
 const context=vm.createContext({AbortController,Error,JSON,Date,Map,Set,Promise,structuredClone,setTimeout,clearTimeout,console,
   TRPCError:class extends Error{constructor(value){super(value.message);this.code=value.code}},
   boundary:{assertOwner(){},registerProducerStop(){},async awaited(fn){const result=await fn();if(point==='response')context.remove();return result}},
   selection,original:account,
   choose(){if(point==='selection')queueMicrotask(()=>context.remove());return selection},
   async resolveModel(){if(point==='resolve'){started.release();await gate.promise}return{model:{provider:selection.provider,id:selection.modelId},apiKey:'synthetic-fixture-only'}},
   async complete(_model,_prompt,options){++completeCalls;inferenceSignal=options.signal;if(point==='completion'){started.release();await gate.promise}return response}
 });
 vm.runInContext(`
 const listeners=new Set(),epochs=new Map(),suspended=new Set();
 const externalOwnerEpoch=id=>epochs.get(id)??0,isExternalOwnerSuspended=id=>suspended.has(id);
 const init_accounts=()=>{},init_notify=()=>{},init_lifecycle=()=>{},init_runtime$1=()=>{},init_models=()=>{},init_settings$1=()=>{};
 const clone$1=structuredClone,normalizeAccountRegistryState=value=>structuredClone(value),accountRegistrySchema={parse:value=>value};
 const backupAccountRegistryBeforeCriticalMutation=()=>{throw Error('No credential or backup fixture is permitted')};
 const createDefaultAccountRegistry=()=>{throw Error('The unrelated fixture account must remain')};
 ${pieces.assertion}${pieces.notifications}${pieces.revoke}
 const AccountRegistry={data:{accounts:[original,{id:99,createdAt:999}],currentAccountId:99,sessions:{},localBootstraps:{},profileBindings:{},profileAccountBindings:{'native-profile':{profileId:'native-profile',accountId:7,updatedAt:1}}},getAll(){return structuredClone(this.data)},${pieces.getAccount},${pieces.removeAccount}};
 AccountRegistry.storage={withLock(fn){const result=fn(AccountRegistry.data);if(result.next)AccountRegistry.data=result.next;return result.result}};
 const auxBrokerBoundary=()=>boundary,settings=()=>({get:key=>key==='modelCategories'?{fast:choose()}:selection}),models=()=>({resolve:resolveModel}),modelRuntime={completeSimple:complete};
 const auxProductivityRequests=new Map(),auxDownloadNameRequests=new Map();
 ${[validateTidyPlan,runProductivityPlan,validDownloadStem,proposeDownloadName,auxCreateProductivityAccountGuard,auxRunProductivityRequest,auxStopProductivityRequests,auxCancelProductivityRequest,auxRunDownloadNameRequest,auxStopDownloadNameRequests,auxCancelDownloadNameRequest].map(fn=>fn.toString()).join('\n')}
 globalThis.remove=()=>AccountRegistry.removeAccount(7);
 globalThis.replaceSameTimestamp=()=>{AccountRegistry.data.accounts=AccountRegistry.data.accounts.map(account=>account.id===7?{...account,incarnationId:'replacement'}:account);notifyAccountAuthChange(7)};
 globalThis.changeBinding=()=>{AccountRegistry.data.profileAccountBindings['native-profile']={profileId:'native-profile',accountId:99,updatedAt:2}};
 globalThis.renameAccount=()=>{AccountRegistry.data.accounts[0].name='Renamed';notifyAccountAuthChange(7)};
 globalThis.state=()=>({listeners:listeners.size,requests:auxProductivityRequests.size+auxDownloadNameRequests.size});
 globalThis.run=()=>${kind==='tidy'?'auxRunProductivityRequest':'auxRunDownloadNameRequest'}(7,{profileId:'native-profile',requestId:'request',tabs:[{id:'one',title:'One',origin:'https://fixture.test'},{id:'two',title:'Two',origin:'https://fixture.test'}],filename:'fixture.pdf',mime:'application/pdf',sourceHost:'fixture.test'},AccountRegistry.getAccount(7));
 `,context);
 return{context,started,gate,setPoint(value){point=value},get completeCalls(){return completeCalls},get signal(){return inferenceSignal}};
}
for(const kind of ['tidy','filename']) {
 test(`${kind}: actual supplied removal during selection prevents model inference`,async()=>{
  const f=fixture(kind);f.setPoint('selection');await assert.rejects(f.context.run(),/changed/);assert.equal(f.completeCalls,0);assert.equal(f.context.state().listeners,0);
 });
 test(`${kind}: replacement with same createdAt while resolving is rejected by incarnation`,async()=>{
  const f=fixture(kind),running=f.context.run();await f.started.promise;f.context.replaceSameTimestamp();f.gate.release();await assert.rejects(running,/changed/);assert.equal(f.completeCalls,0);assert.equal(f.context.state().requests,0);
 });
 test(`${kind}: actual account removal aborts active inference and suppresses late response`,async()=>{
  const f=fixture(kind);f.setPoint('completion');const running=f.context.run();await f.started.promise;assert.equal(f.signal.aborted,false);f.context.remove();assert.equal(f.signal.aborted,true);f.gate.release();await assert.rejects(running,/changed/);assert.equal(f.context.state().listeners,0);
 });
 test(`${kind}: native binding changes during resolution cannot fall back to another profile`,async()=>{
  const f=fixture(kind),running=f.context.run();await f.started.promise;f.context.changeBinding();f.gate.release();await assert.rejects(running,/changed/);assert.equal(f.completeCalls,0);
 });
 test(`${kind}: final broker await is rechecked; benign name updates remain valid`,async()=>{
  const late=fixture(kind);late.setPoint('response');await assert.rejects(late.context.run(),/changed/);
  const stable=fixture(kind),running=stable.context.run();await stable.started.promise;stable.context.renameAccount();stable.gate.release();await running;assert.equal(stable.completeCalls,1);assert.equal(stable.context.state().listeners,0);
 });
}
test('paired routes retain actual authenticated ctx.account and require originating profile identity',()=>{
 const paired=transformAuxFilesDaemon({text:transformAuxProductivityDaemon({text:source}).text}).text;
 for(const name of ['auxRunProductivityRequest','auxRunDownloadNameRequest'])assert.ok(paired.includes(`${name}(ctx.accountId,input,ctx.account)`));
 assert.equal(paired.split('profileId:string$3().min(1).max(256)').length-1>=4,true);
 assert.ok(paired.includes('onAccountAuthChange(changed=>'));
});
