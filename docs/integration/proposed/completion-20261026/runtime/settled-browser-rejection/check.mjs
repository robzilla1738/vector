import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const plan=JSON.parse(fs.readFileSync(new URL('./plan.json',import.meta.url)));
for(const row of plan.resources){
 let source=fs.readFileSync(row.path,'utf8');for(const rule of plan.rules)source=source.replace(rule.find,rule.replace);
 const begin=source.indexOf('const auxSettledBrowserActionErrors=new WeakSet;');
 const end=source.indexOf('// Pinned actual producers only.',begin);assert(begin>=0&&end>begin);
 // Marker is still inside the exact matched, authenticated connection reply path.
 assert(source.includes('ci&&ci.connectionId===ai.connectionId&&(this.pendingCommandRequests.delete(si.id),clearTimeout(ci.timeout),si.error?ci.reject(ci.boundBrowserAction?auxMarkSettledBrowserActionError(Error(si.error)):Error(si.error))'));
 const fixture=(authorityLost=false)=>{
  const state={nativeUnknown:0,untracked:0,closed:0};const binding={};
  const f={assertBrokerOwner(){},withBrokerSync:fn=>fn(),async withBrokerAwaited(fn){try{const value=await fn();if(authorityLost)throw Error('authority lost');return value}catch(error){state.nativeUnknown++;throw error}},closeBrokerWriteAdmission(){state.closed++},noteUntrackedBrokerWork(){state.untracked++},captureSelectedBuiltinSession(){}};
  for(const [key,value]of Object.entries(f))Object.defineProperty(binding,key,{value});
  const context=vm.createContext({process:{_linkedBinding:()=>binding},auxShutdownDiagnostic(){}});
  vm.runInContext(source.slice(begin,end),context);return{state,context,boundary:vm.runInContext('auxBrokerBoundary()',context)};
 };
 {const {state,context,boundary}=fixture();const error=vm.runInContext("auxMarkSettledBrowserActionError(Error('rejected'))",context);let release;const wait=new Promise(r=>release=r);const action=boundary.awaited(async()=>{await wait;throw error});const observed=action.catch(e=>e);let finished=false;const closing=boundary.beginShutdown().then(()=>finished=true);await Promise.resolve();assert.equal(finished,false);release();assert.equal(await observed,error);await closing;assert.equal(state.nativeUnknown,0);assert.equal(state.untracked,0);assert.equal(state.closed,1);}
 for(const forged of [false,true]){const {state,boundary}=fixture();const error=Object.assign(Error('uncertain'),forged?{auxBrowserActionSettled:true}:{});const action=boundary.awaited(async()=>{await Promise.resolve();throw error});await assert.rejects(action,e=>e===error);await assert.rejects(boundary.beginShutdown(),e=>e===error);assert.equal(state.nativeUnknown,1);assert.equal(state.untracked,1);}
 {const {state,context,boundary}=fixture(true);const error=vm.runInContext("auxMarkSettledBrowserActionError(Error('rejected'))",context);await assert.rejects(boundary.awaited(async()=>{throw error}),/authority lost/);await assert.rejects(boundary.beginShutdown(),/authority lost/);assert.equal(state.nativeUnknown,1);}
 {const {boundary}=fixture();const error=Error('producer cleanup uncertain');boundary.registerProducerStop(()=>Promise.reject(error));await assert.rejects(boundary.beginShutdown(),e=>e===error);}
}
console.log('PASS four actual broker leaves: settled rejection retained for caller; shutdown awaits physical completion; unmarked/forged/asynchronous uncertainty, stale authority and producer cleanup remain failing.');
