'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {Worker}=require('node:worker_threads');
const addonPath=process.argv[2];
const addon=require(addonPath);
let checks=0;
function check(body){body();checks++;}
check(()=>assert.deepEqual(Object.keys(addon).sort(),['fixtureCounts','run']));
check(()=>assert.equal(typeof addon.run('install-status'),'string'));
check(()=>assert.deepEqual(JSON.parse(addon.run('install-status')),{installed:true,scheme:'p256_v1'}));
check(()=>assert.throws(()=>addon.run(),{name:'TypeError',message:'run(command, input) requires a command'}));
check(()=>assert.throws(()=>addon.run(1),TypeError));
check(()=>assert.throws(()=>addon.run('install-status',undefined),TypeError));
check(()=>assert.throws(()=>addon.run('install-status',{}),TypeError));
check(()=>assert.throws(()=>addon.run('x'.repeat(129)),TypeError));
check(()=>assert.equal(addon.run('install-status'),addon.run('install-status','')));
check(()=>assert.equal(addon.run('install-status','',123),addon.run('install-status')));
const root=Buffer.alloc(32,15).toString('base64');
check(()=>assert.equal(JSON.parse(addon.run('dk-unwrap')).dk,root));
check(()=>assert.match(JSON.parse(addon.run('other')).error,/Unknown command: other/));
check(()=>assert.equal(JSON.parse(addon.run('cdp-sign','{"challenge":"YQ==","challenge":"Yg=="}')).error,'Invalid native command input'));
const publicReply=JSON.parse(addon.run('get-public-keys'));
const raw=Buffer.from(publicReply.sig,'base64');
const key=crypto.createPublicKey({format:'jwk',key:{kty:'EC',crv:'P-256',x:raw.subarray(1,33).toString('base64url'),y:raw.subarray(33,65).toString('base64url')}});
const challenge=Buffer.from('synthetic NAPI command challenge');
const signature=Buffer.from(JSON.parse(addon.run('cdp-sign',JSON.stringify({challenge:challenge.toString('base64')}))).signature,'base64');
check(()=>assert.equal(crypto.verify('sha256',challenge,key,signature),true));
check(()=>assert.deepEqual(addon.fixtureCounts(),{created:2,released:1}));
async function workerCase(){
 await new Promise((resolve,reject)=>{
  const worker=new Worker(`const {parentPort,workerData}=require('node:worker_threads');const addon=require(workerData);const status=JSON.parse(addon.run('install-status'));parentPort.postMessage(status.installed);`,{eval:true,workerData:addonPath});
  worker.on('message',value=>assert.equal(value,true));worker.on('error',reject);worker.on('exit',code=>code===0?resolve():reject(Error('Worker exit '+code)));
 });
}
(async()=>{
 await workerCase();
 check(()=>assert.deepEqual(addon.fixtureCounts(),{created:4,released:3}));
 // Finalizer must close this instance while cleanup's reference remains alive.
 addon.run=null;
 const deadline=Date.now()+5000;
 while(addon.fixtureCounts().released<4 && Date.now()<deadline){global.gc();await new Promise(resolve=>setImmediate(resolve));}
 check(()=>assert.deepEqual(addon.fixtureCounts(),{created:4,released:4}));
 await workerCase(); // A new environment cannot revive the old retired context.
 check(()=>assert.deepEqual(addon.fixtureCounts(),{created:6,released:6}));
 console.log(JSON.stringify({checks,realNodeAddon:true,softwareOnly:true,securityExecuted:false,productionInitProvided:false}));
})().catch(error=>{console.error(error);process.exitCode=1;});
