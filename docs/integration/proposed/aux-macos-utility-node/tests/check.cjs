'use strict';
const assert=require('node:assert/strict');const {Worker}=require('node:worker_threads');
const modulePath=process.argv[2],binding=require(modulePath);let checks=0;const check=(x)=>{assert(x);++checks};
const run=(c,x={})=>JSON.parse(binding.run(c,JSON.stringify(x)));
(async()=>{
 check(Object.getOwnPropertyDescriptor(binding,'run').value instanceof Function);
 assert.throws(()=>binding.run(),/requires a command/);checks++;
 assert.throws(()=>binding.run(7),/must be strings/);checks++;
 check(run('secure-read',{key:'aux.csk_7'}).error==='Unknown native macOS utility command');
 check(run('copy-file',{filePath:'/synthetic/file'}).success===true);
 check(run('open-with',{filePath:'/synthetic/file',appPath:'/synthetic/A.app'}).success===true);
 check(run('list-open-apps',{filePath:'/synthetic/file'}).apps[0].default===true);
 check(run('app-icons',{bundleIds:['test.synthetic'],iconDirectory:'/synthetic'}).icons['test.synthetic']==='/synthetic/captured.png');
 check(run('generate-thumbnail',{filePath:'/synthetic/file',iconOutputPath:'/synthetic/icon',thumbnailOutputPath:'/synthetic/thumb'}).thumbnailGenerated===true);
 check(run('copy-file',{filePath:'/missing'}).error==='File not found');
 check(binding.fixtureAgain()!==0);
 async function worker(command,input,hold=false){
  const w=new Worker(`const {parentPort,workerData}=require('node:worker_threads');const binding=require(workerData.bindingPath);parentPort.postMessage({output:binding.run(workerData.command,workerData.input)});if(workerData.hold)setInterval(()=>{},1000)`,{eval:true,execArgv:[],workerData:{bindingPath:modulePath,command,input:JSON.stringify(input),hold}});
  const reply=await new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject)});
  check(JSON.parse(reply.output).thumbnailGenerated===true);await w.terminate();return w;
 }
 await worker('generate-thumbnail',{filePath:'/synthetic/file',iconOutputPath:'/synthetic/icon',thumbnailOutputPath:'/synthetic/thumb'});
 check(binding.fixtureReleased()>=1);
 await worker('generate-thumbnail',{filePath:'/pending',iconOutputPath:'/synthetic/icon',thumbnailOutputPath:'/synthetic/thumb'},true);
 check(binding.fixtureClose()===1); // Pending real custody retained after worker cleanup.
 assert.throws(()=>binding.run('copy-file','{}'),/closed/);checks++;
 const before=binding.fixtureReleased();binding.fixtureComplete();check(binding.fixtureClose()===0);check(binding.fixtureReleased()>before);
 console.log(JSON.stringify({checks,actualNodeEnvironment:true,actualWorkerReload:true,capturedOSOnly:true,pendingAfterWorkerCleanupRetained:true,lateCompletionDrained:true}));
})().catch(error=>{console.error(error);process.exitCode=1});
