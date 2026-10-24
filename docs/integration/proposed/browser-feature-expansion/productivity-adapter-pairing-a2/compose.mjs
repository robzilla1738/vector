// Preserve every byte of the latest packaged source except one exact helper delta.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),sha=v=>createHash('sha256').update(v).digest('hex');
const [pinsPath]=process.argv.slice(2);if(!pinsPath)throw Error('Reviewed frozen inputs required');
const pinsBytes=await fs.readFile(pinsPath),pins=JSON.parse(pinsBytes),output=pins.output,root=pins.root;
if(pins.format!=='aux.productivity-latest-context.inputs.v1'||pins.producer!==here||!path.isAbsolute(output)||!output.startsWith('/private/tmp/'))throw Error('Fixed producer/output required');
const read=async p=>JSON.parse(await fs.readFile(p));
const verify=async()=>{for(const row of pins.inputs)if(sha(await fs.readFile(row.path))!==row.sha256)throw Error('Pinned operand changed: '+row.path)};await verify();
const prior=await read(pins.priorComposition),pair=await read(pins.latestPair),plan=await read(pins.contextPlan);
const context=await import(pathToFileURL(pins.context));
const body=['auxReferencesFromMessages','auxValidateReferenceMessages','auxDrainValidatedQueue','auxReferenceCdpClient'].map(n=>'\n'+context[n].toString()+'\n').join('');
const replay=(text,anchors)=>{for(const edit of anchors){if(!edit.find||typeof edit.replace!=='string'||!Number.isSafeInteger(edit.count)||edit.count<1||text.split(edit.find).length-1!==edit.count)throw Error('Count drift: '+edit.name);text=text.split(edit.find).join(edit.replace)}return text};
const syntax=p=>{const run=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});if(run.status!==0)throw Error('Syntax refused: '+run.stderr)};
await fs.mkdir(output,{mode:0o700});
const files=[];
for(const kind of ['source','entry']){
 const row=prior.files.find(r=>r.kind===kind),delta=plan.files.find(r=>r.kind===kind).anchors;
 if(delta.length!==1||delta[0].count!==1||delta[0].replace!==body)throw Error('Actual active context helper bundle required');
 const bytes=await fs.readFile(pair[kind]),input=bytes.toString();
 if(sha(bytes)!==row.afterSha256||sha(await fs.readFile(row.output))!==row.afterSha256)throw Error('Exact actual latest source required');
 const original=await fs.readFile(row.input,'utf8');
 if(replay(original,row.anchors)!==input)throw Error('Complete existing identity/runtime/memory chain does not replay');
 const text=replay(input,delta),target=path.join(output,kind==='source'?'index.mjs':'aux-native-entry.mjs');
 const anchors=[...row.anchors,...delta];if(replay(original,anchors)!==text)throw Error('Complete successor replay differs');
 // Replace exactly once in reverse too; no earlier-base reconstruction may win.
 if(replay(text,[{find:delta[0].replace,replace:delta[0].find,count:1}])!==input)throw Error('Non-context bytes changed');
 await fs.writeFile(target,text,{flag:'wx',mode:0o600});syntax(target);
 files.push({...row,output:target,afterSha256:sha(text),anchors,stages:[...row.stages,{kind:'context-original-capability-lifetime',input:pair[kind],beforeSha256:sha(bytes),output:target,afterSha256:sha(text),anchors:delta}],
  actualLatestInput:pair[kind],actualLatestInputSha256:sha(bytes),previousAnchorCount:row.anchors.reduce((sum,a)=>sum+a.count,0),appendedAnchorCount:1,addedAnchorCount:row.addedAnchorCount+1,anchorObjects:anchors.length,countedMatches:anchors.reduce((sum,a)=>sum+a.count,0)});
}
const copied=[];await fs.mkdir(path.join(output,'native'),{mode:0o700});
for(const row of [...prior.helpers,...prior.artifacts]){const bytes=await fs.readFile(row.output);if(sha(bytes)!==row.outputSha256)throw Error('Current helper/artifact changed');const target=path.join(output,'native',path.basename(row.output));await fs.writeFile(target,bytes,{flag:'wx',mode:0o600});syntax(target);copied.push({...row,preparedOutput:row.output,output:target})}
const adapterInputs=prior.adapterInputs.map(row=>({...row}));
for(const absolute of [pins.context,path.join(here,'freeze.mjs'),path.join(here,'compose.mjs')]){
 const relative=path.relative(root,absolute),digest=sha(await fs.readFile(absolute)),old=adapterInputs.find(r=>r.path===relative);
 if(old&&old.sha256!==digest)throw Error('Current successor adapter pin conflicts with actual prior');
 if(!old)adapterInputs.push({path:relative,sha256:digest});
}
const report={...prior,files,adapterInputs,helpers:copied.filter(r=>r.kind==='seed'||r.kind==='bootstrap'),artifacts:copied.filter(r=>r.kind==='chatgpt-shim'),
 format:'aux.productivity-latest-context.composition.v1',passed:true,
 actualLatestSourcePair:pins.latestPair,actualLatestSourcePairSha256:sha(await fs.readFile(pins.latestPair)),
 contextPredecessorComposition:pins.priorComposition,contextPredecessorCompositionSha256:sha(await fs.readFile(pins.priorComposition)),
 contextPairingInputsSha256:sha(pinsBytes),contextPairingInputs:pins.inputs,
 contextHelperAnchorCountPerLeaf:1,anchorObjectsPerLeaf:files[0].anchorObjects,totalAnchorCountPerLeaf:files[0].countedMatches,
 previousTotalAnchorCountPerLeaf:prior.totalAnchorCountPerLeaf,appendedAnchorCountPerLeaf:1,newAnchorCountPerLeaf:prior.newAnchorCountPerLeaf+1,
 contextChanged:true,allOtherLatestSourceBytesPreserved:true,nativeApiChanged:false,nativePairingPending:true,
 historicalInputRecordsDescribeTheirOriginalStage:true,productExecuted:false,uiChanged:false};
await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
const source=files.find(r=>r.kind==='source'),entry=files.find(r=>r.kind==='entry');
const sourceReceiptPath=path.join(output,'source-receipt.json');
await fs.writeFile(sourceReceiptPath,JSON.stringify({format:'aux.browser-features.composed-source.v1',passed:true,inputSha256:source.beforeSha256,
 composedSha256:source.afterSha256,compositionReceiptSha256:sha(await fs.readFile(path.join(output,'composition.json'))),
 coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:false,nativePairingPending:true},null,2)+'\n',{flag:'wx',mode:0o600});
const projectionRoot=path.join(output,'projector-inputs'),copies=[];
for(const row of pins.projectionCopies){const target=path.join(projectionRoot,row.relative);await fs.mkdir(path.dirname(target),{recursive:true,mode:0o700});await fs.copyFile(row.source,target);if(sha(await fs.readFile(target))!==row.sha256)throw Error('Static projector operand changed');copies.push({...row,output:target})}
await fs.writeFile(path.join(output,'projection-operands.json'),JSON.stringify(copies,null,2)+'\n',{flag:'wx',mode:0o600});
const command=[path.join(projectionRoot,'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs'),source.output,sourceReceiptPath,path.join(output,'projected-entry')];
const projected=spawnSync(process.execPath,command,{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
await fs.writeFile(path.join(output,'projector.log'),(projected.stdout??'')+(projected.stderr??''),{flag:'wx',mode:0o600});if(projected.status!==0)throw Error('Original current projector refused: '+projected.stderr);
const receipt=await read(path.join(output,'projected-entry/results.json'));
if(!receipt.passed||!receipt.dormant||!receipt.defaultEntryRefusalPreserved||receipt.executed||receipt.runtimeAuthorityGranted||receipt.appChanged||receipt.packaged||
 receipt.sourceReceiptSha256!==sha(await fs.readFile(sourceReceiptPath))||receipt.sourceSha256!==source.afterSha256||receipt.entrySha256!==entry.afterSha256||receipt.loaderSha256!==pair.loaderSha256||
 sha(await fs.readFile(path.join(output,'projected-entry/aux-native-entry.mjs')))!==entry.afterSha256||sha(await fs.readFile(path.join(output,'projected-entry/aux-owned-native.cjs')))!==pair.loaderSha256)throw Error('Independent latest-source entry/loader mismatch');
for(const row of copies)if(sha(await fs.readFile(row.output))!==row.sha256)throw Error('Original projector copy changed');
await verify();
const evidence={format:'aux.productivity-latest-context.projection.actual.v1',passed:true,output,
 inputsSha256:sha(pinsBytes),actualLatestSourcePairSha256:sha(await fs.readFile(pins.latestPair)),
 compositionSha256:sha(await fs.readFile(path.join(output,'composition.json'))),sourceReceiptSha256:sha(await fs.readFile(sourceReceiptPath)),entryReceiptSha256:sha(await fs.readFile(path.join(output,'projected-entry/results.json'))),
 sourceSha256:source.afterSha256,entrySha256:entry.afterSha256,loaderSha256:pair.loaderSha256,
 priorSourceSha256:pair.sourceSha256,priorEntrySha256:pair.entrySha256,
 actualLatestPackageLeavesMatch:true,independentEntryMatchesProjection:true,activeContextHelpersMatch:true,
 helperBundleDeltaAnchorsPerLeaf:1,anchorObjectsPerLeaf:source.anchorObjects,countedMatchesPerLeaf:source.countedMatches,
 allOtherLatestSourceBytesPreserved:true,publisherHelpersAndChatgptShimUnchanged:true,packagedCliAndRefusalsUnchanged:true,
 nativeApiChanged:false,nativePairingPending:true,nativeBuildRun:false,productExecuted:false,nativeApiExecuted:false,
 coldFeatureEnabled:false,runtimeAuthorityGranted:false,packaged:false,uiChanged:false};
await fs.writeFile(path.join(output,'projection-evidence.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(evidence));
