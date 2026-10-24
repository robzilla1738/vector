// Static source producer. Never imports or executes generated product code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {ROOT,PREFIX,STAGES,APPENDED_COUNT,OVERLAYS,SHIM,PREVIOUS,PREVIOUS_STAGES,PRODUCER_FILES} from './contract.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const [pinsArg,outputArg]=process.argv.slice(2);
if(![pinsArg,outputArg].every(value=>value&&path.isAbsolute(value)))throw Error('Absolute frozen pins and fresh output required');
const pinsBytes=await fs.readFile(pinsArg),pins=JSON.parse(pinsBytes),output=outputArg,root=pins.root;
if(root!==ROOT||here!==path.join(ROOT,PREFIX+'daemon-projection-v5')||pins.format!=='aux.standard.daemon-projection.inputs.v5'||pins.producer!==here||pins.output!==output||pins.node!==process.execPath||pins.nodeVersion!==process.version||path.dirname(output)!=='/private/tmp'||path.resolve(output)!==output)throw Error('Frozen producer/output/Node mismatch');
async function verify(){for(const row of pins.inputs)if(sha(await fs.readFile(row.path))!==row.sha256)throw Error('Frozen input changed: '+row.path)}
await verify();
const fixedBytes=await fs.readFile(path.join(here,'immutable-inputs.json')),fixed=JSON.parse(fixedBytes);
if(sha(fixedBytes)!==pins.immutableSha256||fixed.root!==root||fixed.format!=='aux.standard.daemon-projection.immutable.v5')throw Error('Immutable review differs');
if(JSON.stringify(fixed.stages)!==JSON.stringify(STAGES)||JSON.stringify(fixed.providerOverlays)!==JSON.stringify(OVERLAYS)||APPENDED_COUNT!==15||fixed.shim.kind!==SHIM.kind||fixed.shim.stage!==SHIM.stage||fixed.shim.module!==SHIM.module||fixed.shim.export!==SHIM.export||fixed.shim.count!==SHIM.count||fixed.shim.input!==SHIM.input||fixed.shim.packageRelativePath!==SHIM.packageRelativePath||fixed.shim.overlay!==path.join(root,PREFIX+'native-credential-lock-a1/overlay.json')||fixed.shim.overlaySha256!==OVERLAYS[0].sha256)throw Error('Exact reviewed provider adapters and shim required');
for(const required of fixed.inputs)if(!pins.inputs.some(row=>row.path===required.path&&row.sha256===required.sha256))throw Error('Missing reviewed input '+required.path);
for(const name of PRODUCER_FILES)if(!pins.inputs.some(row=>row.path===path.join(here,name)))throw Error('Producer not frozen');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
if(fixed.previousProjection!==path.join(ROOT,PREFIX+'daemon-projection-v4/actual-projection-a4.json')||fixed.projector!=='docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs')throw Error('Exact predecessor and original projector required');
const previous=await read(fixed.previousProjection);
if(fixed.previousComposition!==path.join(previous.output,'composition.json')||fixed.previousLoader!==path.join(previous.output,'projected-entry/aux-owned-native.cjs'))throw Error('Predecessor receipt association changed');
const old=await read(fixed.previousComposition);
if(previous.format!=='aux.standard-daemon-projection.actual.v4'||previous.passed!==true||previous.independentEntryMatchesProjection!==true||previous.upstreamStagesPreserved!==true||previous.newAnchorCountPerLeaf!==150||previous.totalAnchorCountPerLeaf!==182||old.passed!==true||old.files.length!==2||old.helpers.length!==2||sha(await fs.readFile(fixed.previousComposition))!==previous.compositionSha256)throw Error('Actual 182-anchor a4 predecessor required');
for(const kind of ['source','entry','loader'])if(previous[kind+'Sha256']!==PREVIOUS[kind])throw Error('Reviewed a4 bytes differ');
if(previous.chatgptShimSha256!==PREVIOUS.shim||previous.chatgptShimDerivedWithoutExecution!==true)throw Error('Reviewed predecessor shim differs');
for(const key of ['coldFeatureEnabled','runtimeAuthorityGranted','productExecuted','packaged'])if(previous[key]!==false)throw Error('Predecessor is not inactive');
const replay=(input,anchors,one=false)=>{let text=input;for(const edit of anchors){if(typeof edit.find!=='string'||!edit.find||typeof edit.replace!=='string'||!Number.isSafeInteger(edit.count)||edit.count<1||(one&&edit.count!==1)||text.split(edit.find).length-1!==edit.count)throw Error('Exact source anchor conflict');text=text.split(edit.find).join(edit.replace)}return text};
function syntax(file){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8',maxBuffer:32*1024*1024});if(result.error||result.status!==0)throw Error('Syntax failed: '+file+' '+(result.error?.message??result.stderr.split('\n').filter(line=>line.length<500).join('\n')))}
await fs.mkdir(output,{mode:0o700});await fs.mkdir(path.join(output,'predecessor'),{mode:0o700});
for(const [name,file] of [['projection-evidence.json',fixed.previousProjection],['composition.json',fixed.previousComposition],['source-receipt.json',path.join(previous.output,'source-receipt.json')],['entry-receipt.json',path.join(previous.output,'projected-entry/results.json')]])await fs.writeFile(path.join(output,'predecessor',name),await fs.readFile(file),{flag:'wx',mode:0o600});
const report={...old,passed:false,files:[],helpers:[],artifacts:[],previousProviderProjection:fixed.previousProjection,previousProviderProjectionSha256:sha(await fs.readFile(fixed.previousProjection)),previousProviderComposition:fixed.previousComposition,previousProviderCompositionSha256:previous.compositionSha256,previousProviderProjectionInputs:old.standardProjectionInputs,previousProviderAppendedStages:old.appendedStages,standardProjectionInputsSha256:sha(pinsBytes),standardProjectionInputs:pins.inputs,adapterInputs:pins.inputs.filter(row=>row.path.startsWith(root+path.sep)).map(row=>({path:path.relative(root,row.path),sha256:row.sha256})),appendedStages:STAGES.map(stage=>stage.name),appendedAnchorCountPerLeaf:APPENDED_COUNT,newAnchorCountPerLeaf:150+APPENDED_COUNT,totalAnchorCountPerLeaf:182+APPENDED_COUNT,nativePairingPending:true,freshDescendantObserverRequired:true,nativeCredentialLockRequired:true,ownedMetaContextRequired:true,previousProviderArtifacts:old.artifacts};
// Original research/a1, 153/166/182 ancestry and previousCombinedReview remain intact.
const outputs={};
try{
 for(const kind of ['source','entry']){
  const prior=old.files.find(row=>row.kind===kind);
  if(!prior||prior.anchors.length!==182||prior.addedAnchorCount!==150||prior.stages.length!==12||JSON.stringify(prior.stages.map(stage=>stage.kind))!==JSON.stringify(PREVIOUS_STAGES)||prior.afterSha256!==previous[kind+'Sha256'])throw Error('Exact a4 chain differs');
  const base=await fs.readFile(prior.input,'utf8');if(sha(base)!==prior.beforeSha256)throw Error('Protected baseline differs');
  let text=base,offset=0;
  for(const stage of prior.stages){
   const anchors=stage.kind==='features'?prior.anchors.slice(0,27):stage.anchors;
   if(JSON.stringify(prior.anchors.slice(offset,offset+anchors.length))!==JSON.stringify(anchors)||sha(text)!==stage.beforeSha256)throw Error('Historical stage association differs');
   text=replay(text,anchors);offset+=anchors.length;
   if(sha(text)!==stage.afterSha256||text!==await fs.readFile(stage.output,'utf8'))throw Error('Historical stage output differs');
  }
  if(offset!==182||sha(text)!==prior.afterSha256||text!==await fs.readFile(prior.output,'utf8'))throw Error('Actual a4 leaf differs');
  const anchors=[...prior.anchors],stages=structuredClone(prior.stages);let appended=0;
  for(const stage of fixed.stages){
   const transform=(await import(pathToFileURL(path.join(root,stage.module))))[stage.export];
   const before=text,result=transform(before);text=replay(before,result.changes,true);
   if(text!==result.text||result.changes.length!==stage.count)throw Error('Successor stage replay/count differs');
   const expected=fixed.expectedStages[kind].find(value=>value.name===stage.name);
   if(sha(before)!==expected.inputSha256||sha(text)!==expected.outputSha256||sha(JSON.stringify(result.changes))!==expected.changesSha256)throw Error('Reviewed stage hashes differ');
   const target=path.join(output,kind+'-'+stage.name+'.mjs');await fs.writeFile(target,text,{flag:'wx',mode:0o600});
   stages.push({kind:stage.name,beforeSha256:sha(before),output:target,afterSha256:sha(text),anchors:result.changes});anchors.push(...result.changes);appended+=result.changes.length;
  }
  if(appended!==APPENDED_COUNT||anchors.length!==182+APPENDED_COUNT||replay(base,anchors)!==text||sha(text)!==fixed.expectedOutputs[kind])throw Error('Final exact OAuth successor chain differs');
  const target=path.join(output,kind==='source'?'index.mjs':'aux-native-entry.mjs');await fs.writeFile(target,text,{flag:'wx',mode:0o600});syntax(target);outputs[kind]=text;
  report.files.push({...prior,output:target,afterSha256:sha(text),anchors,stages,addedAnchorCount:150+APPENDED_COUNT,appendedAnchorCount:APPENDED_COUNT,previousAnchorCount:182});
 }
 await fs.mkdir(path.join(output,'native'),{mode:0o700});
 for(const prior of old.helpers){
  if(!['seed','bootstrap'].includes(prior.kind))throw Error('Unexpected runtime helper');
  const input=await fs.readFile(prior.input,'utf8'),bytes=await fs.readFile(prior.output);
  if(sha(input)!==prior.inputSha256||sha(bytes)!==prior.outputSha256||replay(input,prior.edits)!==bytes.toString())throw Error('Unchanged publisher helper replay differs');
  const target=path.join(output,'native','runtime-'+prior.kind+'.cjs');await fs.writeFile(target,bytes,{flag:'wx',mode:0o600});syntax(target);
  report.helpers.push({...prior,output:target,previousProviderOutput:prior.output});
 }
 // Derive the separate coupled shim without importing or executing it.
 const shimInput=await fs.readFile(fixed.shim.input,'utf8');
 if(sha(shimInput)!==fixed.shim.inputSha256)throw Error('Pinned shim input differs');
 const shimTransform=(await import(pathToFileURL(path.join(root,SHIM.module))))[SHIM.export];
 const shimResult=shimTransform(shimInput),shimText=replay(shimInput,shimResult.changes,true);
 if(shimResult.changes.length!==5||shimText!==shimResult.text||sha(shimText)!==fixed.shim.outputSha256||sha(JSON.stringify(shimResult.changes))!==fixed.shim.changesSha256)throw Error('Reviewed shim derivation differs');
 const shimOutput=path.join(output,'native/aux-chatgpt.cjs');await fs.writeFile(shimOutput,shimText,{flag:'wx',mode:0o600});syntax(shimOutput);
 if(old.artifacts?.length!==1)throw Error('Exact original shim artifact required');
 const priorShim=old.artifacts[0];
 if(priorShim.kind!==SHIM.kind||priorShim.stage!=='chatgpt-login'||priorShim.output!==fixed.shim.input||priorShim.outputSha256!==fixed.shim.inputSha256||priorShim.anchors.length!==4||priorShim.packageRelativePath!==SHIM.packageRelativePath)throw Error('Predecessor shim association differs');
 const originalShim=await fs.readFile(priorShim.input,'utf8');
 const shimAnchors=[...priorShim.anchors,...shimResult.changes];
 if(sha(originalShim)!==priorShim.inputSha256||replay(originalShim,priorShim.anchors,true)!==shimInput||shimAnchors.length!==9||replay(originalShim,shimAnchors,true)!==shimText)throw Error('Complete nine-anchor shim chain differs');
 report.artifacts.push({kind:SHIM.kind,stage:SHIM.stage,input:priorShim.input,inputSha256:priorShim.inputSha256,output:shimOutput,outputSha256:sha(shimText),anchors:shimAnchors,stages:[{kind:'chatgpt-login',beforeSha256:priorShim.inputSha256,output:priorShim.output,afterSha256:priorShim.outputSha256,anchors:priorShim.anchors,overlay:priorShim.overlay,overlaySha256:priorShim.overlaySha256},{kind:SHIM.stage,beforeSha256:fixed.shim.inputSha256,output:shimOutput,afterSha256:sha(shimText),anchors:shimResult.changes,overlay:fixed.shim.overlay,overlaySha256:fixed.shim.overlaySha256}],previousArtifact:priorShim,appendedAnchorCount:5,previousAnchorCount:4,overlay:fixed.shim.overlay,overlaySha256:fixed.shim.overlaySha256,packageRelativePath:SHIM.packageRelativePath});
 await fs.writeFile(path.join(output,'chatgpt-shim-receipt.json'),JSON.stringify({format:'aux.standard-chatgpt-shim.derivation.v2',passed:true,...report.artifacts[0],changesSha256:sha(JSON.stringify(shimAnchors)),appendedChangesSha256:sha(JSON.stringify(shimResult.changes)),previousReceipt:path.join(previous.output,'chatgpt-shim-receipt.json'),previousReceiptSha256:previous.chatgptShimReceiptSha256,producerInputsSha256:sha(pinsBytes),executed:false,packaged:false},null,2)+'\n',{flag:'wx',mode:0o600});
 await verify();report.passed=true;
}catch(error){report.error=String(error);throw error}
finally{await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600})}
const source=report.files.find(row=>row.kind==='source'),entry=report.files.find(row=>row.kind==='entry');
const {AUX_COLD_ENTRY_REFUSAL}=await import(pathToFileURL(path.join(root,'vendor/provided/aux-cold-entry-admission.mjs')));
if(!outputs.source.startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Ordinary refusal changed');
const sourceReceipt=path.join(output,'source-receipt.json');
await fs.writeFile(sourceReceipt,JSON.stringify({format:'aux.browser-features.composed-source.v1',passed:true,inputSha256:source.beforeSha256,composedSha256:source.afterSha256,compositionReceiptSha256:sha(await fs.readFile(path.join(output,'composition.json'))),chatgptShimSha256:fixed.shim.outputSha256,chatgptShimReceiptSha256:sha(await fs.readFile(path.join(output,'chatgpt-shim-receipt.json'))),coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:true,nativePairingPending:true,freshDescendantObserverRequired:true,nativeCredentialLockRequired:true,ownedMetaContextRequired:true},null,2)+'\n',{flag:'wx',mode:0o600});
await verify();
const projected=path.join(output,'projected-entry');
const result=spawnSync(process.execPath,[path.join(root,fixed.projector),source.output,sourceReceipt,projected],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
await fs.writeFile(path.join(output,'projection.log'),(result.stdout??'')+(result.stderr??''),{flag:'wx',mode:0o600});
if(result.error||result.status!==0)throw Error('Original dormant-entry projector failed');
const receipt=await read(path.join(projected,'results.json'));
for(const key of ['passed','ordinarySourceUnchanged','defaultEntryRefusalPreserved','dormant'])if(receipt[key]!==true)throw Error('Projector gate failed: '+key);
for(const key of ['executed','appChanged','runtimeAuthorityGranted','packaged'])if(receipt[key]!==false)throw Error('Projector activation: '+key);
if(receipt.sourceSha256!==source.afterSha256||receipt.sourceReceiptSha256!==sha(await fs.readFile(sourceReceipt))||receipt.entrySha256!==entry.afterSha256||!Buffer.from(outputs.entry).equals(await fs.readFile(path.join(projected,'aux-native-entry.mjs')))||receipt.loaderSha256!==fixed.loaderSha256||!Buffer.from(await fs.readFile(fixed.previousLoader)).equals(await fs.readFile(path.join(projected,'aux-owned-native.cjs'))))throw Error('Independent projected entry/loader differs');
await verify();
const evidence={format:'aux.standard-daemon-projection.actual.v5',passed:true,output,compositionSha256:sha(await fs.readFile(path.join(output,'composition.json'))),sourceReceiptSha256:sha(await fs.readFile(sourceReceipt)),entryReceiptSha256:sha(await fs.readFile(path.join(projected,'results.json'))),sourceSha256:source.afterSha256,entrySha256:entry.afterSha256,loaderSha256:fixed.loaderSha256,independentEntryMatchesProjection:true,newAnchorCountPerLeaf:150+APPENDED_COUNT,appendedAnchorCountPerLeaf:APPENDED_COUNT,totalAnchorCountPerLeaf:182+APPENDED_COUNT,upstreamStagesPreserved:true,previousStandardProjectionSha256:report.previousStandardProjectionSha256,previousManagedProjectionSha256:report.previousManagedProjectionSha256,previousInteractiveProjectionSha256:report.previousInteractiveProjectionSha256,previousProviderProjectionSha256:report.previousProviderProjectionSha256,publisherHelpersUnchanged:true,chatgptShimSha256:fixed.shim.outputSha256,chatgptShimReceiptSha256:sha(await fs.readFile(path.join(output,'chatgpt-shim-receipt.json'))),chatgptShimDerivedWithoutExecution:true,freshDescendantObserverRequired:true,nativeAbiChanged:true,nativePairingPending:true,nativeCredentialLockRequired:true,ownedMetaContextRequired:true,coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false,packaged:false};
await fs.writeFile(path.join(output,'projection-evidence.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(evidence));
