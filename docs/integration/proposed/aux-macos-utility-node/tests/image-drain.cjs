'use strict';
const assert=require('node:assert/strict'),{Worker}=require('node:worker_threads');
const file=process.argv[2],binding=require(file);let checks=0;function check(value){assert(value);++checks;}
async function spawn(input,hold=false){const worker=new Worker(`const{parentPort,workerData}=require('node:worker_threads');try{const b=require(workerData.file);parentPort.postMessage({output:b.run('generate-thumbnail',JSON.stringify(workerData.input))});if(workerData.hold)setInterval(()=>{},1000)}catch(error){parentPort.postMessage({error:error.message})}`,{eval:true,execArgv:[],workerData:{file,input,hold}});const reply=await new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject)});await worker.terminate();return reply;}
(async()=>{
 check(binding.fixtureImagePending()===1n);
 const first=await spawn({filePath:'/pending',iconOutputPath:'/synthetic/i',thumbnailOutputPath:'/synthetic/t'},true);
 check(JSON.parse(first.output).thumbnailGenerated===true);
 check(binding.fixtureImagePending()===2n); // Main open owner + postcleanup pending worker.
 const released=binding.fixtureReleased();check(binding.fixtureImageClose()===1);check(binding.fixtureImagePending()===1n);
 assert.throws(()=>binding.run('copy-file','{}'),/closed/);checks++;
 const refused=await spawn({filePath:'/synthetic',iconOutputPath:'/synthetic/i',thumbnailOutputPath:'/synthetic/t'});check(/attach refused/.test(refused.error));
 check(binding.fixtureImageClose()===1);check(binding.fixtureImagePending()===1n);
 binding.fixtureComplete();check(binding.fixtureImagePending()===1n); // Observation alone never releases.
 check(binding.fixtureImageClose()===0);check(binding.fixtureImagePending()===0n);check(binding.fixtureReleased()>=released+2);
 check(binding.fixtureImageClose()===0);
 const stillRefused=await spawn({filePath:'/synthetic',iconOutputPath:'/synthetic/i',thumbnailOutputPath:'/synthetic/t'});check(/attach refused/.test(stillRefused.error));
 check(binding.fixtureImagePending()===0n);
 console.log(JSON.stringify({imageDrainChecks:checks,actualWorkerCleanup:true,quarantinedOwnerReobserved:true,lateCompletionVerified:true,futureEnvironmentsPermanentlyRefused:true,realOSCalls:0}));
})().catch(error=>{console.error(error);process.exitCode=1});
