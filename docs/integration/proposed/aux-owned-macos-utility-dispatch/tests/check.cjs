'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {Worker}=require('node:worker_threads');
const path=process.argv[2],addon=require(path);
let checks=0;
const check=body=>{body();checks++;};
const run=(command,input)=>JSON.parse(addon.run(command,input===undefined?'':JSON.stringify(input)));
check(()=>assert.deepEqual(run('install-status'),{installed:true,scheme:'p256_v1'}));
const before=addon.osFixtureCounts();
check(()=>assert.match(run('copy-file',{}).error,/requires filePath/));
check(()=>assert.equal(addon.osFixtureCounts(),before));
check(()=>assert.match(run('copy-file',{filePath:'/missing'}).error,/File not found/));
check(()=>assert.deepEqual(run('copy-file',{filePath:'/fixture/file'}),{success:true}));
check(()=>assert.match(run('copy-file',{filePath:'/fixture/file'}).error,/Failed to copy file to clipboard/));
check(()=>assert.match(run('open-with',{filePath:'/fixture/file',appPath:'/fixture/Default.app'}).error,/Captured open failure/));
check(()=>assert.deepEqual(run('generate-thumbnail',{filePath:'/fixture/file',iconOutputPath:'/icon',thumbnailOutputPath:'/thumb'}),{success:true,thumbnailGenerated:false,iconGenerated:true}));
const apps=run('list-open-apps',{filePath:'/fixture/file',iconDirectory:'/cache'}).apps;
check(()=>assert.deepEqual(apps.map(app=>app.appName),['Default','a','z']));
check(()=>assert.equal(apps[0].default,true));
check(()=>assert.deepEqual(run('app-icons',{bundleIds:['fixture.known','missing'],iconDirectory:'/cache'}),{icons:{'fixture.known':'/cache/Default.app.png'}}));
check(()=>assert.deepEqual(run('secure-save',{key:'fixture.credential',data:'paired software fixture'}),{success:true}));
check(()=>assert.deepEqual(run('secure-read',{key:'fixture.credential'}),{data:'paired software fixture'}));
check(()=>assert.deepEqual(run('secure-clear',{key:'fixture.credential'}),{success:true}));
check(()=>assert.equal(run('dk-unwrap').dk,Buffer.alloc(32,15).toString('base64')));
const pub=run('get-public-keys'),raw=Buffer.from(pub.sig,'base64');
const key=crypto.createPublicKey({format:'jwk',key:{kty:'EC',crv:'P-256',x:raw.subarray(1,33).toString('base64url'),y:raw.subarray(33,65).toString('base64url')}});
const challenge=Buffer.from('software paired utility fixture');
const signature=Buffer.from(run('cdp-sign',{challenge:challenge.toString('base64')}).signature,'base64');
check(()=>assert.equal(crypto.verify('sha256',challenge,key,signature),true));
check(()=>assert.match(run('unknown-command').error,/Unknown command: unknown-command/));
check(()=>assert.deepEqual(addon.fixtureCounts(),{created:2,released:1}));
async function workerCheck(){
 const message=await new Promise((resolve,reject)=>{
  const worker=new Worker(`const {parentPort,workerData}=require('node:worker_threads');const a=require(workerData);parentPort.postMessage({reply:JSON.parse(a.run('copy-file','{"filePath":"/fixture/file"}')),installed:JSON.parse(a.run('install-status')).installed});`,{eval:true,workerData:path});
  let message;worker.on('message',value=>{message=value;});worker.on('error',reject);worker.on('exit',code=>code===0?resolve(message):reject(Error('Worker exit '+code)));
 });
 check(()=>assert.deepEqual(message,{reply:{success:true},installed:true}));
}
(async()=>{
 await workerCheck();
 check(()=>assert.deepEqual(addon.fixtureCounts(),{created:4,released:3}));
 addon.run=null;
 const deadline=Date.now()+5000;
 while(addon.fixtureCounts().released<4&&Date.now()<deadline){global.gc();await new Promise(resolve=>setImmediate(resolve));}
 check(()=>assert.deepEqual(addon.fixtureCounts(),{created:4,released:4}));
 await workerCheck(); // new instance must have its own first-copy outcome
 check(()=>assert.deepEqual(addon.fixtureCounts(),{created:6,released:6}));
 console.log(JSON.stringify({checks,realNodeAddon:true,softwareOnly:true,actualAppKitActions:0,productionInitProvided:false}));
})().catch(error=>{console.error(error);process.exitCode=1;});
