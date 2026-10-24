// Inert changed-boundary check: no store, server, process, network or product.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
const helper=fs.readFileSync(new URL('./source/chatgpt-lifetimes.js',import.meta.url),'utf8');
const factory=vm.runInNewContext(helper.slice(0,helper.indexOf('let auxChatGPTLifetimeOwner;'))+'\nauxCreateChatGPTLifetime',{AbortController,AbortSignal,URL,Error,AggregateError});
let brokerResolve,transportResolve,unknown=0,aborts=0,closed=false;
const boundary={noteUntracked(){unknown++},awaited:fn=>fn()};
const gate=new Promise(resolve=>{brokerResolve=resolve});
const transportGate=new Promise(resolve=>{transportResolve=resolve});
const life=factory({boundary,isClosing:()=>false,
 createTransport(signal){signal.addEventListener('abort',()=>aborts++);return {fetch:async()=>({ok:true}),close:()=>transportGate};},
 createServer:()=>({}),handleRequest(){},ownServer:()=>({listen:async()=>{},close:()=>gate}),
 probeOrigin:()=> 'http://127.0.0.1:1455',callbackPath:()=>'/auth/callback',probeTimeout:()=>1000,messageType:()=> 'aux.callback',ackType:()=> 'aux.ack'});
await life.listen('127.0.0.1',1455);
const request=life.request('https://invalid.example');
await Promise.resolve();
const stop=life.stop().then(()=>{closed=true});
await Promise.resolve();assert.equal(closed,false);assert.equal(aborts,1);
brokerResolve();await Promise.resolve();await Promise.resolve();assert.equal(closed,false);
transportResolve();await request;await stop;assert.equal(closed,true);assert.equal(unknown,0);
assert.throws(()=>life.run(()=>{}),/AUX_CHATGPT_CLOSED/);
const shim=fs.readFileSync(new URL('./source/aux-chatgpt.cjs',import.meta.url),'utf8');
const lock=vm.runInNewContext(shim.slice(shim.indexOf('function acquireChatGPTLock('),shim.indexOf('class LocalChatGPTStore'))+'\nacquireChatGPTLock',{Error,Promise});
for(const mode of ['error','abort']){
 const child=new EventEmitter(),controller=new AbortController();let outcome=false,marked=0,killed=0,cleared=0;
 child.kill=()=>{killed++;return true};
 const lifetime={admit(){},unknown(){marked++},signal:controller.signal};
 const operation=lock(99,lifetime,()=>child,{setTimeout:()=>42,clearTimeout:id=>{assert.equal(id,42);cleared++}}).then(()=>{outcome=true},()=>{outcome=true});
 if(mode==='error')child.emit('error',Error('synthetic'));else controller.abort();
 await Promise.resolve();assert.equal(outcome,false);assert.equal(marked,1);
 child.emit('close',null,mode==='abort'?'SIGKILL':null);await operation;
 assert.equal(outcome,true);assert.equal(cleared,1);assert.equal(killed,mode==='abort'?1:0);
}
console.log(JSON.stringify({inert:true,brokerAndTransportCloseRetained:true,lockErrorAndAbortWaitForClose:true,lockDescendantsRemainUnknown:true,productExecuted:false,network:false,childSpawned:false}));
