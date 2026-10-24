// Review preparation only: two fixed source adapters, literal replay and syntax.
// Arguments identify their isolated worktrees before integrator cherry-pick.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const root='/Users/rcourson/Documents/Vibe/web';
const [refreshRoot,managedRoot]=process.argv.slice(2);
if(![refreshRoot,managedRoot].every(value=>value&&path.isAbsolute(value)))throw Error('Two absolute isolated worktree roots required');
const prefix='docs/integration/proposed/standard-profile-isolation/';
const stages=[{name:'refresh-and-skill',module:prefix+'refresh-and-skill/source/transform.mjs',export:'transformAuxRefreshAndSkill',count:15,worktree:refreshRoot},{name:'managed-producers',module:prefix+'managed-producers/source/transform.mjs',export:'transformAuxManagedProducers',count:20,worktree:managedRoot}];
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const previousProjection=root+'/'+prefix+'daemon-projection/actual-projection-a1.json';
const previous=await read(previousProjection),previousComposition=previous.output+'/composition.json',composition=await read(previousComposition);
if(sha(await fs.readFile(previousComposition))!==previous.compositionSha256)throw Error('Actual predecessor differs');
const inputs=new Map(composition.standardProjectionInputs.map(row=>[row.path,row.sha256]));
function add(file,hash){if(inputs.has(file)&&inputs.get(file)!==hash)throw Error('Dependency hash conflict '+file);inputs.set(file,hash)}
async function pin(file){add(file,sha(await fs.readFile(file)))}
await pin(previousProjection);add(previousComposition,previous.compositionSha256);
add(previous.output+'/source-receipt.json',previous.sourceReceiptSha256);add(previous.output+'/projected-entry/results.json',previous.entryReceiptSha256);
add(previous.output+'/projected-entry/aux-native-entry.mjs',previous.entrySha256);add(previous.output+'/projected-entry/aux-owned-native.cjs',previous.loaderSha256);
for(const row of composition.files){add(row.input,row.beforeSha256);add(row.output,row.afterSha256);for(const stage of row.stages)add(stage.output,stage.afterSha256)}
for(const row of composition.helpers){add(row.output,row.outputSha256);add(row.input,row.inputSha256)}
const refreshManifest=await read(path.join(refreshRoot,prefix+'refresh-and-skill/manifest.json'));
for(const row of refreshManifest.files){const relative=prefix+'refresh-and-skill/'+row.path;const bytes=await fs.readFile(path.join(refreshRoot,relative));if(sha(bytes)!==row.sha256)throw Error('Refresh dependency changed');add(path.join(root,relative),row.sha256)}
for(const [worker,relative] of [[refreshRoot,prefix+'refresh-and-skill/manifest.json'],[managedRoot,prefix+'managed-producers/overlay.json'],[managedRoot,prefix+'managed-producers/source/transform.mjs'],[managedRoot,prefix+'managed-producers/source/anchors.json'],[managedRoot,prefix+'managed-producers/source/managed-producers.js']])add(path.join(root,relative),sha(await fs.readFile(path.join(worker,relative))));
const outputs={},expectedStages={};const dir=await fs.mkdtemp(path.join(os.tmpdir(),'aux-daemon-v2-source-review-'));
try {
 for(const kind of ['source','entry']){
  const row=composition.files.find(value=>value.kind===kind);let text=await fs.readFile(row.output,'utf8');if(sha(text)!==row.afterSha256)throw Error('Actual a1 leaf changed');expectedStages[kind]=[];
  for(const stage of stages){
   const transform=(await import(pathToFileURL(path.join(stage.worktree,stage.module))))[stage.export];const before=text,result=transform(before);
   if(result.changes.length!==stage.count)throw Error('Stage count differs');
   for(const edit of result.changes){if(edit.count!==1||!edit.find||text.split(edit.find).length!==2)throw Error('Count-one composition conflict');text=text.split(edit.find).join(edit.replace)}
   if(text!==result.text)throw Error('Literal composition differs');expectedStages[kind].push({name:stage.name,inputSha256:sha(before),outputSha256:sha(text),changesSha256:sha(JSON.stringify(result.changes))});
  }
  const file=path.join(dir,kind+'.mjs');await fs.writeFile(file,text);const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr.split('\n').filter(line=>line.length<400).join('\n'));outputs[kind]=sha(text);
 }
} finally {await fs.rm(dir,{recursive:true,force:true})}
const fixed={format:'aux.standard.daemon-projection.immutable.v2',root,previousProjection,previousComposition,previousLoader:previous.output+'/projected-entry/aux-owned-native.cjs',projector:'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs',stages:stages.map(({worktree,...value})=>value),expectedOutputs:outputs,expectedStages,loaderSha256:previous.loaderSha256,inputs:[...inputs].map(([path,sha256])=>({path,sha256}))};
await fs.writeFile(path.join(here,'immutable-inputs.json'),JSON.stringify(fixed,null,2)+'\n');
const evidence={format:'aux.standard-daemon-projection-v2.preparation.v1',pairedLiteralReplay:true,pairedSyntax:true,previousSourceSha256:previous.sourceSha256,previousEntrySha256:previous.entrySha256,expectedOutputs:outputs,expectedStages,editsPerLeaf:[15,20],frozenPriorAnchorCount:118,plannedTotalAnchorCount:153,originalProjectorRerun:false,producerRun:false,productExecuted:false,providerRequests:0,nativeBuild:false};
await fs.writeFile(path.join(here,'review.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({expectedOutputs:outputs,inputs:inputs.size,pairedSyntax:true,projectorRerun:false}));
