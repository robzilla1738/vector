// Actual static source composition and original entry projection; never daemon execution.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const sha=value=>createHash('sha256').update(value).digest('hex');
const here=path.dirname(fileURLToPath(import.meta.url));
const [pinsPath]=process.argv.slice(2);
if(!pinsPath||!path.isAbsolute(pinsPath))throw Error('Exact frozen input file required');
const pinsBytes=await fs.readFile(pinsPath),pins=JSON.parse(pinsBytes),root=pins.root,output=pins.output;
if(pins.format!=='aux.productivity-adapter-pairing.inputs.v1'||pins.producer!==here||!path.isAbsolute(output)||!output.startsWith('/private/tmp/'))
  throw Error('Fixed reviewed producer/output required');
const read=async name=>JSON.parse(await fs.readFile(name));
const verify=async()=>{for(const row of pins.inputs)if(sha(await fs.readFile(row.path))!==row.sha256)throw Error('Frozen operand changed: '+row.path)};
await verify();
const prior=await read(pins.historicalComposition),priorFeature=await read(prior.featureBaseComposition),pair=await read(pins.predecessorSourcePair);
if(!prior.passed||prior.coldFeatureEnabled||prior.runtimeAuthorityGranted||prior.productExecuted||prior.files.length!==2||
 sha(await fs.readFile(pins.predecessorSourcePair))!==prior.predecessorSourcePairSha256)throw Error('Inactive actual predecessor changed');
const replay=(text,anchors)=>{for(const anchor of anchors){
 if(!anchor.find||typeof anchor.replace!=='string'||anchor.count!==1||text.split(anchor.find).length-1!==anchor.count)
  throw Error('Count-one anchor drift: '+anchor.name);
 text=text.replace(anchor.find,anchor.replace);
}return text};
const syntax=target=>{const run=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});if(run.status!==0)throw Error('Syntax failed: '+run.stderr)};
const run=async(script,args,log)=>{
 const child=spawnSync(process.execPath,[script,...args],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
 await fs.writeFile(path.join(output,log),(child.stdout??'')+(child.stderr??''),{flag:'wx',mode:0o600});
 if(child.status!==0)throw Error('Static producer failed: '+script);
};
await fs.mkdir(output,{mode:0o700});
await run(path.join(root,'docs/integration/proposed/browser-feature-expansion/integration/compose-daemon.mjs'),[path.join(output,'feature-base')],'feature-base.log');
const current=await read(path.join(output,'feature-base/composition.json'));
if(!current.passed||current.coldFeatureEnabled||current.runtimeAuthorityGranted||current.productExecuted||current.files.length!==2||
 JSON.stringify(current.adapterInputs)!==JSON.stringify(pins.adapterInputs)||
 current.predecessorSourcePair!==pins.predecessorSourcePair||current.predecessorSourcePairSha256!==prior.predecessorSourcePairSha256)
 throw Error('Actual fresh feature producer association changed');
const {applyRuntimeCacheInspection}=await import(pathToFileURL(path.join(root,'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-integration/transform.mjs')));
const {transformAuxResearchDaemon}=await import(pathToFileURL(path.join(root,'docs/integration/proposed/browser-feature-expansion/research-v1/source/aux-research-daemon.mjs')));
const context=await import(pathToFileURL(path.join(root,'vendor/provided/aux-productivity-context-read.mjs')));
const {AUX_COLD_ENTRY_REFUSAL}=await import(pathToFileURL(path.join(root,'vendor/provided/aux-cold-entry-admission.mjs')));
const name='aux-context-helper-auxReferencesFromMessages,aux-context-helper-auxValidateReferenceMessages,aux-context-helper-auxDrainValidatedQueue,aux-context-helper-auxReferenceCdpClient';
const native=await read(pins.nativeReceipt);
const report={format:'aux.browser-features.daemon-source-composition.v1',passed:false,
 predecessorSourcePair:current.predecessorSourcePair,predecessorSourcePairSha256:current.predecessorSourcePairSha256,
 predecessorFeatureComposition:pins.historicalComposition,predecessorFeatureCompositionSha256:sha(await fs.readFile(pins.historicalComposition)),
 pairingInputsSha256:sha(pinsBytes),pairingInputs:pins.inputs,
 featureBaseComposition:path.join(output,'feature-base/composition.json'),featureBaseCompositionSha256:sha(await fs.readFile(path.join(output,'feature-base/composition.json'))),
 adapterInputs:pins.adapterInputs,files:[],helpers:[],nativeEvidence:{receipt:pins.nativeReceipt,inputs:pins.nativeInputs,binary:pins.nativeBinary,binarySha256:native.binarySha256},
 coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false};
try{
 for(const kind of ['source','entry']){
  const old=prior.files.find(row=>row.kind===kind),base=priorFeature.files.find(row=>row.kind===kind),fresh=current.files.find(row=>row.kind===kind);
  if(!old||!base||!fresh||fresh.input!==pair[kind]||fresh.beforeSha256!==pair[kind+'Sha256'])throw Error('Exact protected predecessor required');
  const input=await fs.readFile(fresh.input,'utf8');
  if(replay(input,old.anchors)!==await fs.readFile(old.output,'utf8')||replay(input,base.anchors)!==await fs.readFile(base.output,'utf8'))
   throw Error('Historical actual anchor chain failed');
  if(fresh.anchors.length!==base.anchors.length)throw Error('Unreviewed new feature edits');
  const oldHelper=base.anchors.find(a=>a.name===name),newHelper=fresh.anchors.find(a=>a.name===name);
  if(!oldHelper||!newHelper||oldHelper.find!==newHelper.find||oldHelper.count!==1||newHelper.count!==1)throw Error('Exact shared context append anchor required');
  for(let index=0;index<fresh.anchors.length;index++){
   const before=base.anchors[index],after=fresh.anchors[index];
   if(before.name!==after.name)throw Error('Feature anchor order changed');
   if(after.name===name||JSON.stringify(before)===JSON.stringify(after))continue;
   // The next appended helper uses the preceding context tail as its anchor.
   // Its payload must remain byte-identical while that tail is reanchored.
   if(after.name!=='aux-files-provider-helpers'||before.kind!==after.kind||before.count!==1||after.count!==1||
      !before.replace.startsWith(before.find)||!after.replace.startsWith(after.find)||
      before.replace.slice(before.find.length)!==after.replace.slice(after.find.length))
    throw Error('Unrelated daemon feature change refused');
  }
  const oldBody=oldHelper.replace.slice(oldHelper.find.length),newBody=newHelper.replace.slice(newHelper.find.length);
  if(oldBody===newBody||!oldHelper.replace.startsWith(oldHelper.find)||!newHelper.replace.startsWith(newHelper.find))throw Error('Real context-only helper successor required');
  const expectedBody=['auxReferencesFromMessages','auxValidateReferenceMessages','auxDrainValidatedQueue','auxReferenceCdpClient'].map(n=>'\n'+context[n].toString()+'\n').join('');
  if(newBody!==expectedBody)throw Error('Produced helpers differ from actual active context adapter');
  const contextAnchor={name:'aux-context-original-capability-lifetime',kind:'integration',find:oldBody,replace:newBody,count:1};
  const freshBytes=await fs.readFile(fresh.output,'utf8');
  if(replay(await fs.readFile(base.output,'utf8'),[contextAnchor])!==freshBytes||replay(input,fresh.anchors)!==freshBytes)
   throw Error('Actual feature delta is not exclusively the reviewed context helper bundle');
  const cache=applyRuntimeCacheInspection(freshBytes,{kind:'daemon',inputSha256:fresh.afterSha256});
  const cacheAnchors=cache.edits.map(edit=>({find:edit.before,replace:edit.after,count:edit.count}));
  const oldCache=old.stages.find(s=>s.kind==='async-runtime-inspection');
  if(JSON.stringify(cacheAnchors)!==JSON.stringify(oldCache.anchors))throw Error('Async API/authority transform changed');
  let text=replay(freshBytes,cacheAnchors);
  if(text!==cache.source)throw Error('Unreported async mutation');
  const asyncOutput=path.join(output,kind==='source'?'async-index.mjs':'async-native-entry.mjs');
  await fs.writeFile(asyncOutput,text,{flag:'wx',mode:0o600});
  const research=transformAuxResearchDaemon(text),oldResearch=old.stages.find(s=>s.kind==='research-v1');
  if(JSON.stringify(research.changes)!==JSON.stringify(oldResearch.anchors))throw Error('Research source/runtime/API changed');
  text=replay(text,research.changes);
  if(text!==research.text||replay(await fs.readFile(old.output,'utf8'),[contextAnchor])!==text)
   throw Error('Final output contains an unreported non-context delta');
  const anchors=[...fresh.anchors,...cacheAnchors,...research.changes];
  if(replay(input,anchors)!==text)throw Error('Full protected-to-successor replay differs');
  const target=path.join(output,kind==='source'?'index.mjs':'aux-native-entry.mjs');
  await fs.writeFile(target,text,{flag:'wx',mode:0o600});syntax(target);
  report.files.push({kind,input:fresh.input,beforeSha256:fresh.beforeSha256,output:target,afterSha256:sha(text),anchors,
   deltaFromResearch:{input:old.output,inputSha256:old.afterSha256,anchors:[contextAnchor],nativeApiChanged:false,loaderChanged:false},
   stages:[{kind:'features',input:fresh.input,beforeSha256:fresh.beforeSha256,output:fresh.output,afterSha256:fresh.afterSha256},
    {kind:'async-runtime-inspection',input:fresh.output,beforeSha256:fresh.afterSha256,output:asyncOutput,afterSha256:sha(cache.source),anchors:cacheAnchors},
    {kind:'research-v1',input:asyncOutput,beforeSha256:sha(cache.source),output:target,afterSha256:sha(text),anchors:research.changes}]});
 }
 await fs.mkdir(path.join(output,'native'),{mode:0o700});
 for(const helper of prior.helpers){const bytes=await fs.readFile(helper.output);if(sha(bytes)!==helper.outputSha256)throw Error('Runtime helper changed');
  const target=path.join(output,'native',path.basename(helper.output));await fs.writeFile(target,bytes,{flag:'wx',mode:0o600});syntax(target);
  report.helpers.push({...helper,preparedOutput:helper.output,output:target});
 }
 await verify();report.passed=true;
}finally{await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600})}
const source=report.files.find(r=>r.kind==='source'),entry=report.files.find(r=>r.kind==='entry');
if(!(await fs.readFile(source.output,'utf8')).startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Ordinary refusal changed');
const sourceReceiptPath=path.join(output,'source-receipt.json');
await fs.writeFile(sourceReceiptPath,JSON.stringify({format:'aux.browser-features.composed-source.v1',passed:true,
 inputSha256:source.beforeSha256,composedSha256:source.afterSha256,compositionReceiptSha256:sha(await fs.readFile(path.join(output,'composition.json'))),
 coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:true,nativePairingPending:true,nativeApiChangedByThisSlice:false},null,2)+'\n',{flag:'wx',mode:0o600});
// Preserve original script bytes and relative imports in a fresh static operand tree.
// The worker checkout has no generated snapshot; this copies the exact frozen
// project snapshot, never the installed product or an owner profile.
const projectionRoot=path.join(output,'projector-inputs'),projectionCopies=[];
for(const operand of pins.projectionCopies){
 const target=path.join(projectionRoot,operand.relative);
 await fs.mkdir(path.dirname(target),{recursive:true,mode:0o700});
 await fs.copyFile(operand.source,target);
 if(sha(await fs.readFile(target))!==operand.sha256)throw Error('Original projector copy changed');
 projectionCopies.push({...operand,output:target});
}
await fs.writeFile(path.join(output,'projection-operands.json'),JSON.stringify(projectionCopies,null,2)+'\n',{flag:'wx',mode:0o600});
const projected=path.join(output,'projected-entry');
await run(path.join(projectionRoot,'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs'),[source.output,sourceReceiptPath,projected],'projection.log');
const receipt=await read(path.join(projected,'results.json'));
if(!receipt.passed||!receipt.dormant||!receipt.defaultEntryRefusalPreserved||receipt.executed||receipt.runtimeAuthorityGranted||receipt.appChanged||receipt.packaged||
 receipt.sourceReceiptSha256!==sha(await fs.readFile(sourceReceiptPath))||receipt.sourceSha256!==source.afterSha256||receipt.entrySha256!==entry.afterSha256||
 sha(await fs.readFile(path.join(projected,'aux-native-entry.mjs')))!==entry.afterSha256||receipt.loaderSha256!==pair.loaderSha256||
 sha(await fs.readFile(path.join(projected,'aux-owned-native.cjs')))!==pair.loaderSha256)throw Error('Actual original projection/loader/association differs');
for(const operand of projectionCopies)if(sha(await fs.readFile(operand.output))!==operand.sha256)throw Error('Static projector copy changed after run');
await verify();
const evidence={format:'aux.productivity-adapter-pairing.actual.v1',passed:true,output,
 inputsSha256:sha(pinsBytes),projectionOperandsSha256:sha(await fs.readFile(path.join(output,'projection-operands.json'))),compositionSha256:sha(await fs.readFile(path.join(output,'composition.json'))),
 sourceReceiptSha256:sha(await fs.readFile(sourceReceiptPath)),entryReceiptSha256:sha(await fs.readFile(path.join(projected,'results.json'))),
 sourceSha256:source.afterSha256,entrySha256:entry.afterSha256,loaderSha256:pair.loaderSha256,
 nativeBinarySha256:native.binarySha256,independentEntryMatchesProjection:true,
 featureAnchorCount:current.files[0].anchors.length,fullAnchorCountPerLeaf:source.anchors.length,contextDeltaAnchorCountPerLeaf:1,
 activeContextHelpersMatch:true,unrelatedDaemonFeaturesUnchanged:true,asyncResearchAnchorsUnchanged:true,runtimeHelpersUnchanged:true,
 nativeApiChangedByThisSlice:false,nativeAbiChanged:true,nativePairingPending:true,
 coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false,nativeApiExecuted:false,nativeBuildRun:false,packaged:false,uiChanged:false};
await fs.writeFile(path.join(output,'projection-evidence.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(evidence));
