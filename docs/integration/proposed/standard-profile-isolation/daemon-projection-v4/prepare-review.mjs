// Root-only source preparation; never import the product or native code.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {ROOT as root,PREFIX,STAGES,APPENDED_COUNT,OVERLAYS,SHIM,PREVIOUS,PREVIOUS_STAGES} from './contract.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
if(process.argv.length!==2||here!==path.join(root,PREFIX+'daemon-projection-v4')||STAGES.reduce((sum,s)=>sum+s.count,0)!==16||APPENDED_COUNT!==16)throw Error('Exact reviewed v4 producer required');
for(const name of ['immutable-inputs.json','review.json'])try{await fs.lstat(path.join(here,name));throw Error('Review already exists')}catch(error){if(error.code!=='ENOENT')throw error}
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const previousProjection=path.join(root,PREFIX+'daemon-projection-v3/actual-projection-a3.json');
const previous=await read(previousProjection),previousComposition=path.join(previous.output,'composition.json'),composition=await read(previousComposition);
if(previous.format!=='aux.standard-daemon-projection.actual.v3'||previous.passed!==true||previous.independentEntryMatchesProjection!==true||previous.totalAnchorCountPerLeaf!==166||previous.newAnchorCountPerLeaf!==134||previous.publisherHelpersUnchanged!==true||previous.upstreamStagesPreserved!==true||sha(await fs.readFile(previousComposition))!==previous.compositionSha256||composition.passed!==true||composition.files.length!==2||composition.helpers.length!==2)throw Error('Actual successful 166-anchor predecessor required');
for(const key of ['coldFeatureEnabled','runtimeAuthorityGranted','productExecuted','packaged'])if(previous[key]!==false)throw Error('Predecessor activation');
for(const kind of ['source','entry','loader'])if(previous[kind+'Sha256']!==PREVIOUS[kind])throw Error('Reviewed predecessor bytes differ');
const inputs=new Map();
async function pin(file,expected){const actual=sha(await fs.readFile(file));if(expected&&actual!==expected)throw Error('Reviewed input changed: '+file);if(inputs.has(file)&&inputs.get(file)!==actual)throw Error('Dependency conflict');inputs.set(file,actual)}
async function verify(){for(const [file,hash] of inputs)if(sha(await fs.readFile(file))!==hash)throw Error('Frozen preparation input changed: '+file)}
for(const row of composition.standardProjectionInputs)await pin(row.path,row.sha256);
await pin(previousProjection);await pin(previousComposition,previous.compositionSha256);
await pin(path.join(previous.output,'source-receipt.json'),previous.sourceReceiptSha256);
await pin(path.join(previous.output,'projected-entry/results.json'),previous.entryReceiptSha256);
await pin(path.join(previous.output,'projected-entry/aux-native-entry.mjs'),previous.entrySha256);
await pin(path.join(previous.output,'projected-entry/aux-owned-native.cjs'),previous.loaderSha256);
for(const row of composition.files){await pin(row.input,row.beforeSha256);await pin(row.output,row.afterSha256);for(const stage of row.stages)await pin(stage.output,stage.afterSha256)}
for(const row of composition.helpers){await pin(row.input,row.inputSha256);await pin(row.output,row.outputSha256)}
const overlays=[];
for(const [index,spec] of OVERLAYS.entries()){
 const file=path.join(root,PREFIX+spec.name+'/overlay.json');await pin(file,spec.sha256);const overlay=await read(file),stage=STAGES[index];
 if(stage.name!==spec.name||overlay.version!==1||overlay.stage!==stage.name||overlay.changes!==stage.count||overlay.daemonInputs.length!==2||JSON.stringify(overlay.daemonInputs.map(r=>r.kind).sort())!==JSON.stringify(['entry','source'])||JSON.stringify(overlay.sourceFiles.map(r=>r.path).sort())!==JSON.stringify([...spec.sourceFiles].sort()))throw Error('Exact provider overlay differs');
 for(const row of overlay.sourceFiles)await pin(path.join(root,PREFIX+spec.name,row.path),row.sha256);
 overlays.push(overlay);
}
const shimReview=overlays[2].shim;
if(shimReview.count!==SHIM.count||shimReview.repositoryInput!==SHIM.input||shimReview.input!==path.join(root,SHIM.input)||shimReview.packageRelativePath!==SHIM.packageRelativePath)throw Error('Exact ChatGPT shim derivation required');
await pin(shimReview.input,shimReview.inputSha256);await verify();
const transforms=await Promise.all(STAGES.map(async stage=>(await import(pathToFileURL(path.join(root,stage.module))))[stage.export]));
const replay=(input,result,count)=>{if(result.changes.length!==count)throw Error('Exact change count differs');let text=input;for(const edit of result.changes){if(edit.count!==1||typeof edit.find!=='string'||!edit.find||typeof edit.replace!=='string'||text.split(edit.find).length!==2)throw Error('Count-one anchor conflict');text=text.split(edit.find).join(edit.replace)}if(text!==result.text)throw Error('Independent literal replay differs');return text};
const outputs={},expectedStages={};let expectedShim;
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'aux-daemon-v4-review-'));
function syntax(file){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8',maxBuffer:32*1024*1024});if(result.error||result.status!==0)throw Error('Source syntax failed: '+file+' '+(result.error?.message??result.stderr.split('\n').filter(line=>line.length<400).join('\n')))}
try{
 for(const kind of ['source','entry']){
  const prior=composition.files.find(row=>row.kind===kind);
  if(!prior||prior.anchors.length!==166||prior.stages.length!==9||prior.addedAnchorCount!==134||JSON.stringify(prior.stages.map(s=>s.kind))!==JSON.stringify(PREVIOUS_STAGES)||prior.afterSha256!==PREVIOUS[kind])throw Error('Complete predecessor chain differs');
  const original=await fs.readFile(prior.output,'utf8');if(sha(original)!==PREVIOUS[kind])throw Error('Predecessor leaf changed');
  let text=original;expectedStages[kind]=[];
  for(const [index,stage] of STAGES.entries()){
   // Each lane's independent a3 review remains truthful before combining it.
   const isolated=transforms[index](original),isolatedText=replay(original,isolated,stage.count),expected=overlays[index].daemonInputs.find(r=>r.kind===kind);
   if(expected.inputSha256!==sha(original)||expected.outputSha256!==sha(isolatedText)||expected.changesSha256!==sha(JSON.stringify(isolated.changes)))throw Error('Isolated reviewed provider output differs');
   const before=text,result=transforms[index](before);text=replay(before,result,stage.count);
   expectedStages[kind].push({name:stage.name,inputSha256:sha(before),outputSha256:sha(text),changesSha256:sha(JSON.stringify(result.changes))});
  }
  const file=path.join(dir,kind+'.mjs');await fs.writeFile(file,text,{flag:'wx'});syntax(file);outputs[kind]=sha(text);
 }
 const input=await fs.readFile(shimReview.input,'utf8'),transform=(await import(pathToFileURL(path.join(root,SHIM.module))))[SHIM.export];
 const result=transform(input),text=replay(input,result,SHIM.count);
 if(sha(input)!==shimReview.inputSha256||sha(text)!==shimReview.outputSha256||sha(JSON.stringify(result.changes))!==shimReview.changesSha256)throw Error('Exact shim replay differs');
 const file=path.join(dir,'aux-chatgpt.cjs');await fs.writeFile(file,text,{flag:'wx'});syntax(file);
 expectedShim={...SHIM,input:path.join(root,SHIM.input),inputSha256:sha(input),outputSha256:sha(text),changesSha256:sha(JSON.stringify(result.changes)),overlay:path.join(root,PREFIX+'chatgpt-login/overlay.json'),overlaySha256:OVERLAYS[2].sha256};
 await verify();
}finally{await fs.rm(dir,{recursive:true,force:true})}
const fixed={format:'aux.standard.daemon-projection.immutable.v4',root,previousProjection,previousComposition,previousLoader:path.join(previous.output,'projected-entry/aux-owned-native.cjs'),projector:'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs',stages:STAGES,providerOverlays:OVERLAYS,expectedOutputs:outputs,expectedStages,shim:expectedShim,loaderSha256:previous.loaderSha256,inputs:[...inputs].map(([path,sha256])=>({path,sha256}))};
await fs.writeFile(path.join(here,'immutable-inputs.json'),JSON.stringify(fixed,null,2)+'\n',{flag:'wx',mode:0o600});
const review={format:'aux.standard-daemon-projection-v4.preparation.v1',pairedLiteralReplay:true,pairedSyntax:true,isolatedLaneReviewsReplayed:true,shimLiteralReplay:true,shimSyntax:true,previousSourceSha256:PREVIOUS.source,previousEntrySha256:PREVIOUS.entry,expectedOutputs:outputs,expectedStages,expectedShim,editsPerLeaf:16,shimEdits:4,frozenPriorAnchorCount:166,plannedTotalAnchorCount:182,originalProjectorRerun:false,producerRun:false,productExecuted:false,providerRequests:0,nativeBuild:false};
await fs.writeFile(path.join(here,'review.json'),JSON.stringify(review,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({reviewPrepared:true,expectedOutputs:outputs,expectedShim,inputs:inputs.size,pairedSyntax:true,projectorRerun:false}));
