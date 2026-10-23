const assert=require('node:assert/strict'),path=require('node:path'),{Worker}=require('node:worker_threads');
const resources=path.resolve(path.dirname(process.execPath),'../Resources/native'),consumer=require(path.join(resources,'consumer.node')),modulePath=path.join(resources,'aux-macos-utilities.node'),scenario=process.argv[2];let checks=0;const check=x=>{assert(x);checks++};
(async()=>{
 if(scenario==='absent'){check(consumer.capture()===0);check(consumer.inspect()===undefined);check(consumer.close()===0);}
 else if(scenario==='late'){check(consumer.capture()===0);require(modulePath);check(consumer.close()===3);check(consumer.retained()===1);}
 else {
  const utility=require(modulePath);check(consumer.capture()===1);check(consumer.inspect()===undefined);
  check(JSON.parse(utility.run('copy-file',JSON.stringify({filePath:'/synthetic'}))).success===true);
  const w=new Worker(`const{parentPort,workerData}=require('node:worker_threads');const b=require(workerData);parentPort.postMessage(b.run('generate-thumbnail',JSON.stringify({filePath:'/pending',iconOutputPath:'/i',thumbnailOutputPath:'/t'})));setInterval(()=>{},1000)`,{eval:true,execArgv:[],workerData:modulePath});
  const reply=await new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject)});check(JSON.parse(reply).thumbnailGenerated===true);await w.terminate();
  check(consumer.close()===2);check(consumer.retained()===1);consumer.drop();check(consumer.retained()===1);
  check(consumer.observeRetained()===2);utility.fixtureComplete();check(consumer.observeRetained()===1);check(consumer.retained()===0);
 }
 console.log(JSON.stringify({scenario,checks,actualCapturedUtilityModule:true,protectedFactoryCalled:false,realOSCalled:false}));
})().catch(e=>{console.error(e);process.exitCode=1});
