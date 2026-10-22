'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {Worker}=require('node:worker_threads');
const addonPath=process.argv[2];
const addon=require(addonPath);
let checks=0;
function check(body){body();checks++;}
check(()=>assert.deepEqual(Object.keys(addon).sort(),['fixtureCounts','run','secureFixtureCounts']));
check(()=>assert.equal(typeof addon.run('install-status'),'string'));
check(()=>assert.deepEqual(JSON.parse(addon.run('install-status')),{installed:true,scheme:'p256_v1'}));
check(()=>assert.throws(()=>addon.run(),{name:'TypeError',message:'run(command, input) requires a command'}));
check(()=>assert.throws(()=>addon.run(1),TypeError));
check(()=>assert.throws(()=>addon.run('install-status',undefined),TypeError));
check(()=>assert.throws(()=>addon.run('install-status',{}),TypeError));
check(()=>assert.throws(()=>addon.run('x'.repeat(129)),TypeError));
check(()=>assert.equal(addon.run('install-status'),addon.run('install-status','')));
check(()=>assert.equal(addon.run('install-status','',123),addon.run('install-status')));
const secure=(command,key,data)=>JSON.parse(addon.run(command,JSON.stringify(data===undefined?{key}:{key,data})));
check(()=>assert.deepEqual(secure('secure-read','fixture.credential'),{data:null}));
check(()=>assert.deepEqual(secure('secure-save','fixture.credential','synthetic secret'),{success:true}));
check(()=>assert.deepEqual(secure('secure-read','fixture.credential'),{data:'synthetic secret'}));
check(()=>assert.deepEqual(secure('secure-save','fixture.credential','updated synthetic'),{success:true}));
check(()=>assert.deepEqual(secure('secure-read','fixture.credential'),{data:'updated synthetic'}));
check(()=>assert.match(secure('secure-save','fixture.write-failure','must-not-replace').error,/Secure storage operation failed/));
check(()=>assert.deepEqual(secure('secure-read','fixture.write-failure'),{data:'retained-synthetic'}));
check(()=>assert.match(secure('secure-read','fixture.blocked').error,/Secure storage operation failed/));
check(()=>assert.match(secure('secure-read','fixture.invalid').error,/Secure storage operation failed/));
const beforeRace=addon.secureFixtureCounts();
check(()=>assert.match(secure('secure-save','fixture.add-race','not-written').error,/Secure storage operation failed/));
check(()=>assert.equal(addon.secureFixtureCounts()-beforeRace,2));
check(()=>assert.deepEqual(secure('secure-read','fixture.add-race'),{data:null}));
const beforeDenied=addon.secureFixtureCounts();
check(()=>assert.match(secure('secure-read','arbitrary-unreviewed-key').error,/Secure storage operation failed/));
check(()=>assert.equal(addon.secureFixtureCounts(),beforeDenied));
check(()=>assert.match(JSON.parse(addon.run('secure-read','{"key":"fixture.credential","key":"fixture.blocked"}')).error,/Secure storage operation failed/));
check(()=>assert.equal(addon.secureFixtureCounts(),beforeDenied));
check(()=>assert.match(secure('secure-clear','fixture.clear-failure').error,/Secure storage operation failed/));
check(()=>assert.deepEqual(secure('secure-read','fixture.clear-failure'),{data:'retained-clear'}));
check(()=>assert.deepEqual(secure('secure-clear','fixture.credential'),{success:true}));
check(()=>assert.deepEqual(secure('secure-read','fixture.credential'),{data:null}));
check(()=>assert.deepEqual(secure('secure-clear','fixture.credential'),{success:true}));
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
