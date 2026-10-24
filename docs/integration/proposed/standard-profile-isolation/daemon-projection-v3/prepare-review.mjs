// Root-only review preparation. Imports one exact reviewed text adapter; never
// imports generated product code or loads a native module.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {ROOT as root,PREFIX,STAGE,OVERLAY_SHA256,SOURCE_FILES,PREVIOUS,PREVIOUS_STAGES} from './contract.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
if(process.argv.length!==2||here!==path.join(root,PREFIX+'daemon-projection-v3')||STAGE.count<1||! /^[a-f0-9]{64}$/.test(OVERLAY_SHA256))throw Error('Exact committed reviewed producer required');
for(const name of ['immutable-inputs.json','review.json'])try{await fs.lstat(path.join(here,name));throw Error('Review already exists')}catch(error){if(error.code!=='ENOENT')throw error}
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const previousProjection=path.join(root,PREFIX+'daemon-projection-v2/actual-projection-a2.json');
const previous=await read(previousProjection),previousComposition=path.join(previous.output,'composition.json'),composition=await read(previousComposition);
if(previous.format!=='aux.standard-daemon-projection.actual.v2'||previous.passed!==true||previous.independentEntryMatchesProjection!==true||previous.totalAnchorCountPerLeaf!==153||previous.newAnchorCountPerLeaf!==121||previous.publisherHelpersUnchanged!==true||sha(await fs.readFile(previousComposition))!==previous.compositionSha256||composition.passed!==true||composition.files.length!==2||composition.helpers.length!==2)throw Error('Actual successful 153-anchor predecessor required');
for(const key of ['coldFeatureEnabled','runtimeAuthorityGranted','productExecuted','packaged'])if(previous[key]!==false)throw Error('Predecessor activation');
for(const kind of ['source','entry','loader'])if(previous[kind+'Sha256']!==PREVIOUS[kind])throw Error('Reviewed predecessor bytes differ');
const inputs=new Map();
function add(file,hash){if(inputs.has(file)&&inputs.get(file)!==hash)throw Error('Dependency conflict: '+file);inputs.set(file,hash)}
async function pin(file,expected){const actual=sha(await fs.readFile(file));if(expected&&actual!==expected)throw Error('Reviewed input changed: '+file);add(file,actual)}
for(const row of composition.standardProjectionInputs)await pin(row.path,row.sha256);
await pin(previousProjection);await pin(previousComposition,previous.compositionSha256);
await pin(path.join(previous.output,'source-receipt.json'),previous.sourceReceiptSha256);
await pin(path.join(previous.output,'projected-entry/results.json'),previous.entryReceiptSha256);
await pin(path.join(previous.output,'projected-entry/aux-native-entry.mjs'),previous.entrySha256);
await pin(path.join(previous.output,'projected-entry/aux-owned-native.cjs'),previous.loaderSha256);
for(const row of composition.files){await pin(row.input,row.beforeSha256);await pin(row.output,row.afterSha256);for(const stage of row.stages)await pin(stage.output,stage.afterSha256)}
for(const row of composition.helpers){await pin(row.output,row.outputSha256);await pin(row.input,row.inputSha256)}
const overlayPath=path.join(root,PREFIX+'interactive-oauth/overlay.json');await pin(overlayPath,OVERLAY_SHA256);
const overlay=await read(overlayPath);
if(overlay.version!==1||overlay.stage!==STAGE.name||overlay.changes!==STAGE.count||overlay.daemonInputs.length!==2||JSON.stringify(overlay.daemonInputs.map(row=>row.kind).sort())!==JSON.stringify(['entry','source']))throw Error('Exact paired OAuth review required');
if(overlay.sourceFiles.length!==SOURCE_FILES.length||JSON.stringify(overlay.sourceFiles.map(row=>row.path).sort())!==JSON.stringify([...SOURCE_FILES].sort()))throw Error('Only exact OAuth text adapter dependencies allowed');
for(const row of overlay.sourceFiles)await pin(path.join(root,PREFIX+'interactive-oauth',row.path),row.sha256);
for(const [file,hash] of inputs)if(sha(await fs.readFile(file))!==hash)throw Error('Input changed before adapter import');
const transform=(await import(pathToFileURL(path.join(root,STAGE.module))))[STAGE.export];
const outputs={},expectedStages={};
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'aux-daemon-v3-source-review-'));
try{
 for(const kind of ['source','entry']){
  const prior=composition.files.find(row=>row.kind===kind);
  if(!prior||prior.anchors.length!==153||prior.stages.length!==8||prior.addedAnchorCount!==121||JSON.stringify(prior.stages.map(stage=>stage.kind))!==JSON.stringify(PREVIOUS_STAGES)||prior.afterSha256!==PREVIOUS[kind])throw Error('Reviewed complete predecessor differs');
  const before=await fs.readFile(prior.output,'utf8');if(sha(before)!==prior.afterSha256)throw Error('Actual predecessor leaf changed');
  const result=transform(before);if(result.changes.length!==STAGE.count)throw Error('Exact OAuth edit count differs');
  let text=before;for(const edit of result.changes){if(edit.count!==1||typeof edit.find!=='string'||!edit.find||typeof edit.replace!=='string'||text.split(edit.find).length!==2)throw Error('Count-one OAuth anchor conflict');text=text.split(edit.find).join(edit.replace)}
  if(text!==result.text)throw Error('Independent OAuth literal replay differs');
  const expected=overlay.daemonInputs.find(row=>row.kind===kind);
  const measured={name:STAGE.name,inputSha256:sha(before),outputSha256:sha(text),changesSha256:sha(JSON.stringify(result.changes))};
  if(!expected||measured.inputSha256!==expected.inputSha256||measured.outputSha256!==expected.outputSha256||measured.changesSha256!==expected.changesSha256)throw Error('Reviewed OAuth result differs');
  const file=path.join(dir,kind+'.mjs');await fs.writeFile(file,text,{flag:'wx'});
  const syntax=spawnSync(process.execPath,['--check',file],{encoding:'utf8',maxBuffer:32*1024*1024});if(syntax.error||syntax.status!==0)throw Error('Syntax failed: '+kind+' '+(syntax.error?.message??syntax.stderr.split('\n').filter(line=>line.length<400).join('\n')));
  outputs[kind]=measured.outputSha256;expectedStages[kind]=[measured];
 }
 for(const [file,hash] of inputs)if(sha(await fs.readFile(file))!==hash)throw Error('Input changed during review');
}finally{await fs.rm(dir,{recursive:true,force:true})}
const fixed={format:'aux.standard.daemon-projection.immutable.v3',root,previousProjection,previousComposition,previousLoader:path.join(previous.output,'projected-entry/aux-owned-native.cjs'),projector:'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs',stages:[STAGE],oauthOverlay:overlayPath,oauthOverlaySha256:OVERLAY_SHA256,expectedOutputs:outputs,expectedStages,loaderSha256:previous.loaderSha256,inputs:[...inputs].map(([path,sha256])=>({path,sha256}))};
await fs.writeFile(path.join(here,'immutable-inputs.json'),JSON.stringify(fixed,null,2)+'\n',{flag:'wx',mode:0o600});
const review={format:'aux.standard-daemon-projection-v3.preparation.v1',pairedLiteralReplay:true,pairedSyntax:true,previousSourceSha256:PREVIOUS.source,previousEntrySha256:PREVIOUS.entry,expectedOutputs:outputs,expectedStages,editsPerLeaf:STAGE.count,frozenPriorAnchorCount:153,plannedTotalAnchorCount:153+STAGE.count,originalProjectorRerun:false,producerRun:false,productExecuted:false,providerRequests:0,nativeBuild:false};
await fs.writeFile(path.join(here,'review.json'),JSON.stringify(review,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({reviewPrepared:true,expectedOutputs:outputs,inputs:inputs.size,pairedSyntax:true,projectorRerun:false}));
