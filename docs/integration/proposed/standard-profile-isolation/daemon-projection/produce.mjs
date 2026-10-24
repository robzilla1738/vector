// Static code composition/projector only. Never imports the product source.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const [pinsArg,outputArg]=process.argv.slice(2);
if(!pinsArg||!outputArg||!path.isAbsolute(pinsArg)||!path.isAbsolute(outputArg))throw Error('Absolute frozen pins and fresh output required');
const pinsBytes=await fs.readFile(pinsArg),pins=JSON.parse(pinsBytes);
if(pins.format!=='aux.standard.daemon-projection.inputs.v1'||pins.producer!==here||pins.output!==outputArg||pins.node!==process.execPath||pins.nodeVersion!==process.version||path.dirname(outputArg)!=='/private/tmp'||path.resolve(outputArg)!==outputArg)throw Error('Frozen producer/output/Node mismatch');
const output=outputArg,root=pins.root;
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
async function verify(){for(const row of pins.inputs)if(sha(await fs.readFile(row.path))!==row.sha256)throw Error('Frozen input changed: '+row.path)}
await verify();
const immutableBytes=await fs.readFile(path.join(here,'immutable-inputs.json'));
if(sha(immutableBytes)!==pins.immutableSha256)throw Error('Immutable review differs');
const fixed=JSON.parse(immutableBytes);
if(fixed.root!==root)throw Error('Root differs');
// The frozen file list must include every reviewed input, not a caller subset.
for(const required of fixed.inputs)if(!pins.inputs.some(row=>row.path===required.path&&row.sha256===required.sha256))throw Error('Missing reviewed input '+required.path);
for(const name of ['freeze.mjs','produce.mjs','immutable-inputs.json','README.md'])if(!pins.inputs.some(row=>row.path===path.join(here,name)))throw Error('Producer not frozen');
const {composeAuxDaemonPair}=await import(pathToFileURL(path.join(root,fixed.compositionModule)));
const compositionInputs=await read(path.join(root,fixed.compositionInputs));
const {outputs,receipt:combined}=await composeAuxDaemonPair({workspace:root});
for(const kind of ['source','entry'])if(sha(outputs[kind])!==fixed.expectedOutputs[kind])throw Error('Reviewed combined output differs: '+kind);
if(sha(outputs.loader)!==fixed.loaderSha256)throw Error('Loader changed');
const upstream=await read(fixed.upstreamComposition);
if(!upstream.passed||upstream.coldFeatureEnabled||upstream.runtimeAuthorityGranted||upstream.productExecuted||upstream.files.length!==2)throw Error('Inactive actual upstream required');
const pairBytes=await fs.readFile(upstream.predecessorSourcePair),pair=JSON.parse(pairBytes);
if(sha(pairBytes)!==upstream.predecessorSourcePairSha256||!pair.passed||pair.coldFeatureEnabled||pair.runtimeAuthorityGranted)throw Error('Protected source-pair predecessor differs');
const replay=(input,anchors,strictOne=false)=>{let text=input;for(const edit of anchors){if(typeof edit.find!=='string'||!edit.find||typeof edit.replace!=='string'||!Number.isSafeInteger(edit.count)||edit.count<1||(strictOne&&edit.count!==1)||text.split(edit.find).length-1!==edit.count)throw Error('Exact source anchor conflict');text=text.split(edit.find).join(edit.replace)}return text};
await fs.mkdir(output,{mode:0o700});
await fs.mkdir(path.join(output,'upstream'),{mode:0o700});
for(const [name,file] of [['composition.json',fixed.upstreamComposition],['source-receipt.json',fixed.upstreamSourceReceipt],['entry-receipt.json',fixed.upstreamEntryReceipt]])await fs.writeFile(path.join(output,'upstream',name),await fs.readFile(file),{flag:'wx',mode:0o600});
const report={format:'aux.browser-features.daemon-source-composition.v1',passed:false,predecessorSourcePair:upstream.predecessorSourcePair,predecessorSourcePairSha256:upstream.predecessorSourcePairSha256,upstreamComposition:fixed.upstreamComposition,upstreamCompositionSha256:sha(await fs.readFile(fixed.upstreamComposition)),upstreamAdapterInputs:upstream.adapterInputs,upstreamHelpers:upstream.helpers,standardProjectionInputsSha256:sha(pinsBytes),standardProjectionInputs:pins.inputs,combinedReview:combined,adapterInputs:pins.inputs.filter(row=>row.path.startsWith(root+path.sep)).map(row=>({path:path.relative(root,row.path),sha256:row.sha256})),files:[],helpers:[],coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false,nativePairingPending:true};
function syntax(file){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8',maxBuffer:32*1024*1024});if(result.error||result.status!==0)throw Error('Syntax failed: '+file+' '+(result.error?.message??result.stderr.split('\n').filter(line=>line.length<500).join('\n')))}
try{
 for(const kind of ['source','entry']){
  const old=upstream.files.find(row=>row.kind===kind),input=compositionInputs.artifacts.find(row=>row.kind===kind);
  if(!old||old.input!==pair[kind]||old.beforeSha256!==pair[kind+'Sha256']||old.afterSha256!==input.sha256)throw Error('Upstream chain differs');
  const base=await fs.readFile(old.input,'utf8');
  if(sha(base)!==old.beforeSha256)throw Error('Protected input changed');
  let text=replay(base,old.anchors);
  if(sha(text)!==input.sha256||text!==await fs.readFile(input.path,'utf8'))throw Error('Actual upstream anchors do not reproduce research input');
  const anchors=[...old.anchors],stages=structuredClone(old.stages);let added=0;
  for(const stage of compositionInputs.stages){
   const transform=(await import(pathToFileURL(path.join(root,stage.module))))[stage.export];
   const before=text,result=transform(before);text=replay(before,result.changes,true);
   if(text!==result.text)throw Error('Independent stage replay differs');
   const expected=combined.daemonOutputs.find(row=>row.kind===kind).stages.find(row=>row.name===stage.name);
   if(sha(before)!==expected.inputSha256||sha(text)!==expected.outputSha256||sha(JSON.stringify(result.changes))!==expected.changesSha256)throw Error('Reviewed intermediate differs');
   const target=path.join(output,kind+'-'+stage.name+'.mjs');
   await fs.writeFile(target,text,{flag:'wx',mode:0o600});
   stages.push({kind:stage.name,beforeSha256:sha(before),output:target,afterSha256:sha(text),anchors:result.changes});anchors.push(...result.changes);added+=result.changes.length;
  }
  if(added!==86||text!==outputs[kind]||replay(base,anchors)!==text)throw Error('Complete 86-edit successor replay differs');
  const target=path.join(output,kind==='source'?'index.mjs':'aux-native-entry.mjs');await fs.writeFile(target,text,{flag:'wx',mode:0o600});syntax(target);
  report.files.push({kind,input:old.input,beforeSha256:old.beforeSha256,output:target,afterSha256:sha(text),anchors,stages,addedAnchorCount:added});
 }
 const publisherPath=path.join(root,fixed.publisherOverlay),publisher=await read(publisherPath),publisherRoot=path.dirname(publisherPath);
 await fs.mkdir(path.join(output,'native'),{mode:0o700});
 for(const kind of ['seed','bootstrap']){
  const name='runtime-'+kind+'.cjs',row=publisher.files.find(item=>item.source==='source/'+name),old=upstream.helpers.find(item=>item.kind===kind);
  if(!row||!old||row.target!==old.output||row.beforeSha256!==old.outputSha256)throw Error('Publisher helper predecessor differs');
  const before=await fs.readFile(row.target,'utf8'),after=await fs.readFile(path.join(publisherRoot,row.source),'utf8');
  if(sha(before)!==row.beforeSha256||sha(after)!==row.afterSha256||replay(before,row.changes)!==after)throw Error('Publisher helper exact replay differs');
  const target=path.join(output,'native',name);await fs.writeFile(target,after,{flag:'wx',mode:0o600});syntax(target);
  report.helpers.push({kind,input:row.target,inputSha256:row.beforeSha256,output:target,outputSha256:row.afterSha256,preparedOutput:path.join(publisherRoot,row.source),edits:row.changes,upstream:old,publisherOverlay:publisherPath,publisherOverlaySha256:sha(await fs.readFile(publisherPath))});
 }
 await verify();report.passed=true;
}catch(error){report.error=String(error);throw error}
finally{await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600})}
const source=report.files.find(row=>row.kind==='source'),entry=report.files.find(row=>row.kind==='entry');
const {AUX_COLD_ENTRY_REFUSAL}=await import(pathToFileURL(path.join(root,'vendor/provided/aux-cold-entry-admission.mjs')));
if(!outputs.source.startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Ordinary refusal changed');
const sourceReceiptPath=path.join(output,'source-receipt.json');
await fs.writeFile(sourceReceiptPath,JSON.stringify({format:'aux.browser-features.composed-source.v1',passed:true,inputSha256:source.beforeSha256,composedSha256:source.afterSha256,compositionReceiptSha256:sha(await fs.readFile(path.join(output,'composition.json'))),coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:true,nativePairingPending:true},null,2)+'\n',{flag:'wx',mode:0o600});
await verify();
const projected=path.join(output,'projected-entry');
const result=spawnSync(process.execPath,[path.join(root,fixed.projector),source.output,sourceReceiptPath,projected],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
await fs.writeFile(path.join(output,'projection.log'),(result.stdout??'')+(result.stderr??''),{flag:'wx',mode:0o600});
if(result.error||result.status!==0)throw Error('Original dormant-entry projector failed');
const receipt=await read(path.join(projected,'results.json'));
if(!receipt.passed||!receipt.defaultEntryRefusalPreserved||!receipt.dormant||receipt.executed||receipt.runtimeAuthorityGranted||receipt.packaged||receipt.sourceSha256!==source.afterSha256||receipt.sourceReceiptSha256!==sha(await fs.readFile(sourceReceiptPath))||receipt.entrySha256!==entry.afterSha256||!Buffer.from(outputs.entry).equals(await fs.readFile(path.join(projected,'aux-native-entry.mjs')))||receipt.loaderSha256!==fixed.loaderSha256||!outputs.loader.equals(await fs.readFile(path.join(projected,'aux-owned-native.cjs'))))throw Error('Actual projector, independent entry or unchanged loader disagree');
await verify();
const evidence={format:'aux.standard-daemon-projection.actual.v1',passed:true,output,compositionSha256:sha(await fs.readFile(path.join(output,'composition.json'))),sourceReceiptSha256:sha(await fs.readFile(sourceReceiptPath)),entryReceiptSha256:sha(await fs.readFile(path.join(projected,'results.json'))),sourceSha256:source.afterSha256,entrySha256:entry.afterSha256,loaderSha256:fixed.loaderSha256,independentEntryMatchesProjection:true,newAnchorCountPerLeaf:86,upstreamStagesPreserved:true,nativeAbiChanged:true,nativePairingPending:true,coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false,packaged:false};
await fs.writeFile(path.join(output,'projection-evidence.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(evidence));
