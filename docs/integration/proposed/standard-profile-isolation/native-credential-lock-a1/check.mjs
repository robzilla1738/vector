// Inert source/lifetime fixture: no product import, native call, FS credential
// operation, subprocess, network or login. Native syscall acceptance is separate.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {AsyncLocalStorage} from 'node:async_hooks';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxChatGPTNativeCredentialLock, transformAuxChatGPTCredentialLockShim, transformAuxChatGPTCredentialLockHost} from './source/transform.mjs';
const hash = text => createHash('sha256').update(text).digest('hex');
const base='/private/tmp/aux-standard-daemon-projection-20261024-a4';
const results=[];
for (const [kind,path,transform,output] of [
  ['source',base+'/index.mjs',transformAuxChatGPTNativeCredentialLock],
  ['entry',base+'/projected-entry/aux-native-entry.mjs',transformAuxChatGPTNativeCredentialLock],
  ['shim',base+'/native/aux-chatgpt.cjs',transformAuxChatGPTCredentialLockShim,'source/aux-chatgpt.cjs'],
  ['host','/private/tmp/aux-standard-native-source-20261023-a4/AuxDevelopmentWorkerHost.cc',transformAuxChatGPTCredentialLockHost,'source/AuxDevelopmentWorkerHost.cc']]) {
  const input=fs.readFileSync(path,'utf8'), changed=transform(input);
  let replay=input;for(const edit of changed.changes){assert.equal(replay.split(edit.find).length-1,edit.count);replay=replay.replace(edit.find,()=>edit.replace);}
  assert.equal(replay,changed.text);
  if(output)assert.equal(replay,fs.readFileSync(new URL(output,import.meta.url),'utf8'));
  if(kind!=='host') {const checked=spawnSync(process.execPath,['--input-type',kind==='shim'?'commonjs':'module','--check'],{input:replay,encoding:'utf8',maxBuffer:1024*1024});assert.equal(checked.status,0,checked.stderr);}
  results.push({kind,path,inputSha256:hash(input),outputSha256:hash(replay),changes:changed.changes.length,changesSha256:hash(JSON.stringify(changed.changes))});
}
const shim=fs.readFileSync(new URL('source/aux-chatgpt.cjs',import.meta.url),'utf8');
const start=shim.indexOf('const credentialStores = new WeakMap();'),end=shim.indexOf('class ChatGPTPlanClient');
const state={pending:0,writes:0,closes:0};
const controller=new AbortController();
const native={
 begin(key){state.pending++;return {root:'/inert/native-root',key,active:0,closed:false,finished:false};},
 sync(token,fn){assert(!token.closed,'native admission closed');token.active++;try {const result=fn();assert(!(result instanceof Promise));return result;}finally{token.active--;if(token.closed&&!token.active&&!token.finished){token.finished=true;state.pending--;state.closes++;}}},
 close(token){token.closed=true;if(!token.active&&!token.finished){token.finished=true;state.pending--;state.closes++;}}
};
const lifetime={credentialLocks:native,signal:controller.signal,admit(){controller.signal.throwIfAborted()},unknown(){assert.fail('unexpected unknown')}};
const context=vm.createContext({AsyncLocalStorage,Map,WeakMap,Object,Promise,need:(ok,text)=>assert(ok,text)});
vm.runInContext(shim.slice(start,end)+'\nthis.Store=LocalChatGPTStore;',context);
// Replace only the original synchronous bodies before constructor captures them.
// No source implementation is invoked for these inert records.
context.Store.prototype.hostId=function(){return 'host'};
context.Store.prototype.read=function(account){this.hostId();return account};
context.Store.prototype.write=function(){state.writes++};
const store=new context.Store(undefined,lifetime);
assert.equal(store.read('account:fixture'),'account:fixture');assert.equal(state.pending,0);
let resume;const gate=new Promise(resolve=>resume=resolve);
const operation=store.locked('account:fixture',async()=>{store.write('account:fixture',{});await gate;store.write('account:fixture',{});});
await Promise.resolve();await Promise.resolve();await Promise.resolve();
assert.equal(state.writes,1);assert.equal(state.pending,1);
controller.abort();assert.equal(state.pending,0);resume();await assert.rejects(operation);assert.equal(state.writes,1);
// Closing inside an admitted synchronous body retains physical accounting until
// that actual stack returns; the holder, not Promise timing, changes the count.
const token=native.begin('account:fixture');native.sync(token,()=>{native.close(token);assert.equal(state.pending,1);});assert.equal(state.pending,0);
assert.throws(()=>native.sync(token,()=>state.writes++));
const report={format:'aux.chatgpt-native-credential-lock.source-check.v1',passed:true,inputs:results,inertChecks:['paired counted source replay','JS syntax without product import','nested finite store methods','abort rejects late credential write','close waits actual synchronous stack','closed lease rejects reuse'],nativeCompiled:false,nativeSyscallsExecuted:false,providerExecuted:false,productExecuted:false,runtimeAccepted:false};
fs.writeFileSync(new URL('source-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:true,changes:results.map(x=>({kind:x.kind,count:x.changes})),nativeCompiled:false}));
