import test from 'node:test';
import assert from 'node:assert/strict';
import { observeAuxWarmWindow } from './native-aux-warm-observation.mjs';
// Controlled orchestration fixtures only. These do not execute a native input.
function fixture() {
 const calls=[], signal=new AbortController(), primary=new Error('source fixture stop'),
  helper={pid:101,imageUuid:'c'.repeat(32),processStartMachTicks:'500',binarySha256:'d'.repeat(64),sourceSha256:'e'.repeat(64)};
 const startup={async presentation(){calls.push('cold');return {record:{browserPid:100}};},async prepareWarmWindow(){calls.push('ready');return {record:{browserPid:100}};},
  async completeWarmWindow(){calls.push('complete');throw primary;},async stop(error){calls.push('stop');assert.equal(error,primary);return {cleanupDebt:true,nativeSlotRetained:true};}};
 const ax={helperPid:101,targetPid:100,async request(...args){calls.push(['input',...args]);return {};}};
 const readInputHelperIdentity=async()=>{calls.push('helper');return helper;};
 return {calls,signal,primary,startup,ax,readInputHelperIdentity};
}
test('native Ready precedes the fixed one-shot input and Complete; original cleanup debt retained',async()=>{
 const f=fixture();await assert.rejects(observeAuxWarmWindow({...f,signal:f.signal.signal}),error=>{
  assert.equal(error,f.primary);assert.deepEqual(error.cleanup,{cleanupDebt:true,nativeSlotRetained:true});return true;
 });assert.deepEqual(f.calls,['helper','cold','ready',['input','warmWindowKeyReceipt'],'complete','stop']);
});
test('native Ready refusal never posts input',async()=>{
 const f=fixture();f.startup.prepareWarmWindow=async()=>{f.calls.push('ready');throw f.primary;};
 await assert.rejects(observeAuxWarmWindow({...f,signal:f.signal.signal}),f.primary);
 assert.deepEqual(f.calls,['helper','cold','ready','stop']);
});
test('cancellation after Ready refuses before helper input',async()=>{
 const f=fixture();f.startup.prepareWarmWindow=async()=>{f.calls.push('ready');f.signal.abort(f.primary);return {record:{browserPid:100}};};
 await assert.rejects(observeAuxWarmWindow({...f,signal:f.signal.signal}),f.primary);
 assert.deepEqual(f.calls,['helper','cold','ready','stop']);
});
test('cleanup exception does not mask original failed native measurement',async()=>{
 const f=fixture(),cleanup=new Error('original reap unavailable');f.startup.stop=async()=>{throw cleanup;};
 await assert.rejects(observeAuxWarmWindow({...f,signal:f.signal.signal}),e=>e===f.primary&&e.cleanupFailure===cleanup);
});
test('helper generation change after input is a primary refusal, never a counted sample',async()=>{
 const f=fixture();let reads=0;f.readInputHelperIdentity=async()=>({pid:101,processStartMachTicks:++reads===1?'500':'501'});
 f.startup.completeWarmWindow=async()=>({record:{browserPid:100}});
 let primary;f.startup.stop=async e=>{primary=e;return {cleanupDebt:true};};
 await assert.rejects(observeAuxWarmWindow({...f,signal:f.signal.signal}),/process generation changed/);
 assert.ok(primary);assert.deepEqual(primary.cleanup,{cleanupDebt:true});
});
