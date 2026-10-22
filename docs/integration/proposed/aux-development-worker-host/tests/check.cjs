'use strict';
const assert=require('node:assert/strict');
const {Worker}=require('node:worker_threads');
const file=process.argv[2], native=require(file);
let checks=0;function check(fn){fn();checks++;}
function worker(body){const child=new Worker(`const {parentPort}=require('node:worker_threads');const assert=require('node:assert/strict');const native=require(${JSON.stringify(file)});${body}`,{eval:true});return child;}
function message(child){return new Promise((resolve,reject)=>{child.once('message',resolve);child.once('error',reject);});}
function exited(child){return new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject);});}
(async()=>{
 const target={};check(()=>assert.equal(native.register(target),0));
 check(()=>assert.equal(JSON.parse(target.run('install-status')).installed,true));
 check(()=>assert.notEqual(native.register({}),0));
 check(()=>assert.notEqual(native.registerOther({}),0));
 check(()=>assert.equal(native.counts().attempted,1));
 const live=worker(`const t={};assert.equal(native.register(t),0);parentPort.postMessage(JSON.parse(t.run('install-status')).installed);parentPort.on('message',()=>{let closed=false;try{closed=typeof JSON.parse(t.run('install-status')).error==='string'}catch{closed=true}parentPort.postMessage(closed);});`);
 check(()=>assert.equal(typeof live.threadId,'number'));
 const liveReady=await message(live);check(()=>assert.equal(liveReady,true));
 const failed=worker(`native.failNext();const a=native.register({});const before=native.counts().attempted;const b=native.register({});parentPort.postMessage({a,b,before,after:native.counts().attempted});`);
 const failedExit=exited(failed),failure=await message(failed);await failedExit;
 check(()=>assert.notEqual(failure.a,0));check(()=>assert.notEqual(failure.b,0));
 check(()=>assert.equal(failure.before,failure.after));
 check(()=>assert.equal(native.counts().created,2));
 // Actual worker termination invokes its environment cleanup and releases the
 // actual synthetic Swift owner, without closing the independent main owner.
 const disposable=worker(`const t={};assert.equal(native.register(t),0);parentPort.postMessage(true);setInterval(()=>{},1000);`);
 const disposableReady=await message(disposable);check(()=>assert.equal(disposableReady,true));
 await disposable.terminate();
 check(()=>assert.equal(native.counts().released,1));
 check(()=>assert.equal(JSON.parse(target.run('install-status')).installed,true));
 // Close consumes the actual registry's retire/drain for both remaining envs.
 native.setDrain(1);
 check(()=>assert.equal(native.beginLease(),0));
 check(()=>assert.equal(native.close(),1));
 check(()=>assert.equal(native.leaseCompleted(),1));
 check(()=>assert.equal(typeof JSON.parse(target.run('install-status')).error,'string'));
 live.postMessage('observe-close');const closed=await message(live);check(()=>assert.equal(closed,true));
 check(()=>assert.equal(native.close(),1));
 check(()=>assert.notEqual(native.register({}),0));
 await live.terminate();
 check(()=>assert.equal(native.counts().released,1));
 // Old environment is gone but its retained generation remains pending.
 // Another native host may bind a genuinely new environment, never adopting
 // the old retained owner or relying on a dead Environment address.
 native.setDrain(0);
 const fresh=worker(`const t={};const status=native.registerOther(t);parentPort.postMessage({status,installed:status===0&&JSON.parse(t.run('install-status')).installed});`);
 const freshExit=exited(fresh),freshResult=await message(fresh);await freshExit;
 check(()=>assert.equal(freshResult.status,0));check(()=>assert.equal(freshResult.installed,true));
 check(()=>assert.equal(native.counts().released,2));
 native.setDrain(2);check(()=>assert.equal(native.close(),2));
 check(()=>assert.equal(native.counts().released,2));
 native.setDrain(0);check(()=>assert.equal(native.close(),0));
 check(()=>assert.equal(native.close(),0));
 // Main adapter still owns the original retain until environment cleanup;
 // its closed Swift dispatcher has already refused every further command.
 check(()=>assert.equal(native.counts().released,3));
 check(()=>assert.equal(native.counts().created,4));
 console.log(`${checks} actual Node environment/worker lifecycle checks; synthetic software authority only; signed loader/Security never invoked`);
})().catch(error=>{console.error(error);process.exit(1);});
