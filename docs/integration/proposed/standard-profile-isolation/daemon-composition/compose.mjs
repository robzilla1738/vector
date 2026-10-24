import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const inputs=JSON.parse(readFileSync(new URL('./inputs.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
function verifyPins(workspace) {
 for(const pin of inputs.files){const file=path.join(workspace,pin.path);if(sha(readFileSync(file))!==pin.sha256)throw Error('Reviewed composition dependency changed: '+pin.path)}
 for(const pin of inputs.artifacts)if(sha(readFileSync(pin.path))!==pin.sha256)throw Error('Reviewed input artifact changed: '+pin.kind);
}
function replay(before,changes,stage,kind) {
 if(!Array.isArray(changes)||changes.length===0)throw Error(stage+': missing counted changes');
 let text=before;
 for(const [index,change] of changes.entries()){
  if(typeof change.find!=='string'||change.find.length===0||typeof change.replace!=='string'||change.count!==1||text.split(change.find).length!==2)
   throw Error(kind+'/'+stage+': exact count-one conflict at edit '+index);
  // Literal replay, independent of each transform's String.replace semantics.
  text=text.split(change.find).join(change.replace);
 }
 return text;
}
export async function composeAuxDaemonPair({workspace=inputs.workspace}={}) {
 workspace=path.resolve(workspace);verifyPins(workspace);
 const modules=[];
 for(const stage of inputs.stages){const module=await import(pathToFileURL(path.join(workspace,stage.module)).href);if(typeof module[stage.export]!=='function')throw Error('Missing reviewed export '+stage.export);modules.push({stage,transform:module[stage.export]})}
 const outputs={},receipts=[];
 for(const kind of ['source','entry']){
  const input=inputs.artifacts.find(value=>value.kind===kind);let text=readFileSync(input.path,'utf8');const stages=[];
  for(const {stage,transform} of modules){
   const before=text;let result;
   try{result=transform(before)}catch(error){throw Error(kind+'/'+stage.name+': '+error.message,{cause:error})}
   if(!result||typeof result.text!=='string'||replay(before,result.changes,stage.name,kind)!==result.text)throw Error(kind+'/'+stage.name+': transform differs from independent literal replay');
   text=result.text;stages.push({name:stage.name,inputSha256:sha(before),outputSha256:sha(text),editCount:result.changes.length,changesSha256:sha(JSON.stringify(result.changes))});
  }
  outputs[kind]=text;receipts.push({kind,inputPath:input.path,inputSha256:input.sha256,outputSha256:sha(text),stages});
 }
 const loader=inputs.artifacts.find(value=>value.kind==='loader');outputs.loader=readFileSync(loader.path);
 verifyPins(workspace);
 const receipt={format:'aux.standard.daemon-composition.review.v1',inputsSha256:sha(readFileSync(new URL('./inputs.json',import.meta.url))),files:inputs.files,upstreamArtifacts:inputs.artifacts,daemonOutputs:receipts,loader:{path:loader.path,inputSha256:loader.sha256,outputSha256:sha(outputs.loader),unchanged:true},independentLiteralReplay:true,originalProjectorRerun:false,newNativePairingEstablished:false,productExecuted:false,packaged:false};
 return {outputs,receipt};
}
export async function checkAuxDaemonComposition(options={}) {
 const {outputs,receipt}=await composeAuxDaemonPair(options);
 const dir=mkdtempSync(path.join(tmpdir(),'aux-standard-daemon-composition-'));
 try {
  for(const kind of ['source','entry']){
   const file=path.join(dir,kind+'.mjs');writeFileSync(file,outputs[kind]);
   const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8',maxBuffer:32*1024*1024});
   if(result.error||result.status!==0)throw Error(kind+': syntax check failed: '+(result.error?.message??result.stderr.split('\n').filter(line=>line.length<500).join('\n')));
  }
 } finally {rmSync(dir,{recursive:true,force:true})}
 return {...receipt,ordinaryAndDormantSyntax:true,nodeVersion:process.version};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=='--receipt')throw Error('Usage: node compose.mjs --receipt /absolute/new-review.json');
 const output=path.resolve(args[1]);
 const receipt=await checkAuxDaemonComposition();
 // A review receipt is the only persistent CLI output. No stage/product writes.
 writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({passed:true,receipt:output,sourceSha256:receipt.daemonOutputs[0].outputSha256,entrySha256:receipt.daemonOutputs[1].outputSha256,edits:receipt.daemonOutputs.map(value=>value.stages.map(stage=>stage.editCount)),loaderUnchanged:true,productExecuted:false,projectorRerun:false}));
}
