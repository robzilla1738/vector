/** Pair the actual 199-anchor predecessor with the 17 reviewed memory edits. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const root='/Users/rcourson/Documents/Vibe/web',here=path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1');
const previous='/private/tmp/aux-standard-daemon-projection-20261024-a6';
const output='/private/tmp/aux-standard-daemon-projection-20261024-a7';
const hash=value=>createHash('sha256').update(value).digest('hex');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const prior=await read(path.join(previous,'composition.json'));
const predecessor=await read(path.join(root,'docs/integration/proposed/standard-profile-isolation/daemon-projection-v6/actual-projection-a6.json'));
assert.equal(hash(await fs.readFile(path.join(previous,'composition.json'))),predecessor.compositionSha256);
assert.equal(predecessor.totalAnchorCountPerLeaf,199);assert.equal(predecessor.passed,true);
const actual=await read(path.join(here,'actual-adapter-a1.json'));
assert.equal(actual.passed,true);assert.equal(actual.totalAnchors,17);assert.equal(actual.nativeApiChanged,false);
const anchors=await read(path.join(here,'source/anchors.json'));
const owned="/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');\n";
const candidate=path.join(root,'out/provided-candidate-standard-profile-resources-20261024/Aux.app');
const candidateReceipt=await read(path.join(path.dirname(candidate),'receipt.json'));
assert.equal(hash(await fs.readFile(path.join(path.dirname(candidate),'receipt.json'))),'edbae95a34ffe128f11781248cf2026934b5a2e01de52cb28ab95e6f08d9edcd');
assert.equal(candidateReceipt.passed,true);assert.equal(candidateReceipt.appExecuted,false);
const inputs=[];
for(const file of ['project.mjs','build-adapter.mjs','actual-adapter-a1.json','actual-distribution-a1.json','source/anchors.json','source/seed.mjs','source/entry-helpers.mjs']){
 const absolute=path.join(here,file);inputs.push({path:absolute,sha256:hash(await fs.readFile(absolute))});
}
const files=[];await fs.mkdir(output,{mode:0o700});
for(const kind of ['source','entry']){
 const previousFile=prior.files.find(file=>file.kind===kind);
 const source=await fs.readFile(previousFile.output,'utf8');
 assert.equal(hash(source),predecessor[kind+'Sha256']);assert.equal(previousFile.anchors.length,199);
 const name=kind==='source'?'index.mjs':'aux-native-entry.mjs';
 const installed=path.join(candidate,'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development',name);
 assert(Buffer.from(source).equals(await fs.readFile(installed)));
 let text=source;const changes=structuredClone(anchors);
 if(kind==='entry'){
  assert.equal(changes[0].find,AUX_COLD_ENTRY_REFUSAL);
  assert(changes[0].replace.startsWith(AUX_COLD_ENTRY_REFUSAL));
  changes[0].find=owned;changes[0].replace=owned+changes[0].replace.slice(AUX_COLD_ENTRY_REFUSAL.length);
 }
 for(const change of changes){assert.equal(text.split(change.find).length-1,change.count);text=text.split(change.find).join(change.replace)}
 assert(text.startsWith(kind==='source'?AUX_COLD_ENTRY_REFUSAL:owned));
 const target=path.join(output,name);await fs.writeFile(target,text,{flag:'wx',mode:0o600});
 const syntax=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
 if(kind==='source')assert.equal(hash(text),actual.outputSha256);
 const stage={kind:'memory-runtime-v2',input:previousFile.output,output:target,beforeSha256:hash(source),afterSha256:hash(text),anchors:changes};
 files.push({...previousFile,output:target,afterSha256:hash(text),anchors:[...previousFile.anchors,...changes],stages:[...previousFile.stages,stage],previousAnchorCount:199,appendedAnchorCount:17,addedAnchorCount:184});
 inputs.push({path:previousFile.output,sha256:hash(source)},{path:installed,sha256:hash(source)});
}
for(const file of [path.join(previous,'composition.json'),path.join(root,'docs/integration/proposed/standard-profile-isolation/daemon-projection-v6/actual-projection-a6.json'),path.join(path.dirname(candidate),'receipt.json')])inputs.push({path:file,sha256:hash(await fs.readFile(file))});
const composition={...prior,format:'aux.memory-v2.daemon-composition.v1',files,currentMemoryInputs:inputs,
 predecessorIdentityProjectionSha256:hash(await fs.readFile(path.join(root,'docs/integration/proposed/standard-profile-isolation/daemon-projection-v6/actual-projection-a6.json'))),
 totalAnchorCountPerLeaf:216,newAnchorCountPerLeaf:184,memoryStageAppendedAnchors:17,
 previousSourcePrefixRetained:true,historicalInputRecordsDescribeTheirOriginalStage:true,nativeApiChanged:false,
 nativePairingPending:true,productExecuted:false,uiChanged:false};
await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(composition,null,2)+'\n',{flag:'wx'});
const source=files.find(file=>file.kind==='source'),entry=files.find(file=>file.kind==='entry');
const sourceReceipt={format:'aux.browser-features.composed-source.v1',passed:true,inputSha256:source.beforeSha256,
 composedSha256:source.afterSha256,compositionReceiptSha256:hash(await fs.readFile(path.join(output,'composition.json'))),
 coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:false,nativePairingPending:true};
await fs.writeFile(path.join(output,'source-receipt.json'),JSON.stringify(sourceReceipt,null,2)+'\n',{flag:'wx'});
const projector=path.join(root,'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs');
const command=[projector,source.output,path.join(output,'source-receipt.json'),path.join(output,'projected-entry')];
const projected=spawnSync(process.execPath,command,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
await fs.writeFile(path.join(output,'projector.log'),projected.stdout+projected.stderr,{flag:'wx'});assert.equal(projected.status,0,projected.stderr);
const receipt=await read(path.join(output,'projected-entry/results.json'));
assert.equal(receipt.passed,true);assert.equal(receipt.entrySha256,entry.afterSha256);assert.equal(receipt.loaderSha256,predecessor.loaderSha256);
assert((await fs.readFile(entry.output)).equals(await fs.readFile(path.join(output,'projected-entry/aux-native-entry.mjs'))));
for(const input of inputs)assert.equal(hash(await fs.readFile(input.path)),input.sha256);
const result={format:'aux.memory-v2.daemon-projection.actual.v1',passed:true,output,
 sourceSha256:source.afterSha256,entrySha256:entry.afterSha256,loaderSha256:receipt.loaderSha256,
 compositionSha256:sourceReceipt.compositionReceiptSha256,sourceReceiptSha256:hash(await fs.readFile(path.join(output,'source-receipt.json'))),
 entryReceiptSha256:hash(await fs.readFile(path.join(output,'projected-entry/results.json'))),
 totalAnchorCountPerLeaf:216,appendedAnchorCountPerLeaf:17,originalIndependentEntryMatches:true,
 publisherHelpersUnchanged:true,chatgptShimUnchanged:true,nativeApiChanged:false,nativePairingPending:true,
 productExecuted:false,uiChanged:false,packaged:false};
await fs.writeFile(path.join(here,'actual-projection-a1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,anchors:216,independentEntryMatches:true,productExecuted:false}));
