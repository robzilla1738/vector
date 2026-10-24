/** Append only the two reviewed vendor privilege removals to the actual v5 pair. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxVendorEntitlementRemoval} from '../vendor-entitlement-removal-a1/source/transform.mjs';
import {transformAuxVendorExperimentalRemoval} from '../vendor-experimental-removal-a1/source/transform.mjs';
const ROOT='/Users/rcourson/Documents/Vibe/web',here=path.dirname(fileURLToPath(import.meta.url));
if(here!==path.join(ROOT,'docs/integration/proposed/standard-profile-isolation/daemon-projection-v6'))throw Error('Fixed producer required');
const oldRoot='/private/tmp/aux-standard-daemon-projection-20261024-a5',out='/private/tmp/aux-standard-daemon-projection-20261024-a6';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const evidencePath=path.join(ROOT,'docs/integration/proposed/standard-profile-isolation/daemon-projection-v5/actual-projection-a5.json');
const previous=await read(evidencePath),old=await read(path.join(oldRoot,'composition.json'));
if(!previous.passed||previous.totalAnchorCountPerLeaf!==197||previous.output!==oldRoot||previous.compositionSha256!==sha(await fs.readFile(path.join(oldRoot,'composition.json'))))throw Error('Actual v5 required');
const stages=[['vendor-entitlement-removal',transformAuxVendorEntitlementRemoval],['vendor-experimental-removal',transformAuxVendorExperimentalRemoval]];
const inputs=[{path:evidencePath,sha256:sha(await fs.readFile(evidencePath))},{path:path.join(oldRoot,'composition.json'),sha256:previous.compositionSha256}];
for(const row of old.standardProjectionInputs)inputs.push(row);
for(const name of ['produce.mjs','../vendor-entitlement-removal-a1/source/transform.mjs','../vendor-entitlement-removal-a1/source/anchors.json','../vendor-entitlement-removal-a1/overlay.json','../vendor-experimental-removal-a1/source/transform.mjs','../vendor-experimental-removal-a1/source/anchors.json','../vendor-experimental-removal-a1/overlay.json']){
 const p=path.resolve(here,name);inputs.push({path:p,sha256:sha(await fs.readFile(p))});
}
for(const row of old.files)inputs.push({path:row.output,sha256:row.afterSha256});
for(const row of old.helpers)inputs.push({path:row.output,sha256:row.outputSha256});
for(const row of old.artifacts)inputs.push({path:row.output,sha256:row.outputSha256});
inputs.push({path:path.join(oldRoot,'projected-entry/aux-owned-native.cjs'),sha256:previous.loaderSha256});
async function verify(){for(const row of inputs)if(sha(await fs.readFile(row.path))!==row.sha256)throw Error('Input drift: '+row.path)}
await verify();await fs.mkdir(out,{mode:0o700});
await fs.writeFile(path.join(out,'inputs.json'),JSON.stringify({format:'aux.vendor-source.inputs.v1',inputs},null,2)+'\n',{flag:'wx'});
const files=[],outputs={};
for(const kind of ['source','entry']){
 const prior=old.files.find(x=>x.kind===kind);let text=await fs.readFile(prior.output,'utf8');
 if(prior.anchors.length!==197||sha(text)!==previous[kind+'Sha256'])throw Error('Prior complete leaf differs');
 const chain=structuredClone(prior.stages),anchors=[...prior.anchors];
 for(const [name,transform] of stages){
  const before=sha(text),next=transform(text);if(next.changes.length!==1)throw Error('Exactly one literal edit per stage required');
  for(const change of next.changes){if(change.count!==1||text.split(change.find).length-1!==1)throw Error('Anchor conflict');text=text.replace(change.find,change.replace)}
  if(text!==next.text)throw Error('Independent literal replay differs');
  const target=path.join(out,kind+'-'+name+'.mjs');await fs.writeFile(target,text,{flag:'wx'});
  chain.push({kind:name,beforeSha256:before,afterSha256:sha(text),output:target,anchors:next.changes});anchors.push(...next.changes);
 }
 const destination=path.join(out,kind==='source'?'index.mjs':'aux-native-entry.mjs');await fs.writeFile(destination,text,{flag:'wx'});
 const check=spawnSync(process.execPath,['--check',destination],{encoding:'utf8'});if(check.status!==0)throw Error('Syntax refused');
 files.push({...prior,output:destination,afterSha256:sha(text),anchors,stages:chain,previousAnchorCount:197,appendedAnchorCount:2,addedAnchorCount:167});outputs[kind]=text;
}
const composition={...old,files,passed:true,previousIdentityProjection:evidencePath,previousIdentityProjectionSha256:sha(await fs.readFile(evidencePath)),previousIdentityComposition:path.join(oldRoot,'composition.json'),previousIdentityCompositionSha256:previous.compositionSha256,identityStages:stages.map(x=>x[0]),totalAnchorCountPerLeaf:199,newAnchorCountPerLeaf:167,identityAppendedAnchorCountPerLeaf:2,identityInputs:inputs,identityProjectionNativePairingPending:true};
await fs.writeFile(path.join(out,'composition.json'),JSON.stringify(composition,null,2)+'\n',{flag:'wx'});
const source=files.find(x=>x.kind==='source'),sourceReceipt={format:'aux.browser-features.composed-source.v1',passed:true,inputSha256:source.beforeSha256,composedSha256:source.afterSha256,compositionReceiptSha256:sha(await fs.readFile(path.join(out,'composition.json'))),coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:false,nativePairingPending:true};
await fs.writeFile(path.join(out,'source-receipt.json'),JSON.stringify(sourceReceipt,null,2)+'\n',{flag:'wx'});
const projector=path.join(ROOT,'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs');
const check=spawnSync(process.execPath,[projector,source.output,path.join(out,'source-receipt.json'),path.join(out,'projected-entry')],{cwd:ROOT,encoding:'utf8',maxBuffer:32*1024*1024});
await fs.writeFile(path.join(out,'projector.log'),(check.stdout??'')+(check.stderr??''),{flag:'wx'});if(check.status!==0)throw Error('Original projector refused');
const entry=await read(path.join(out,'projected-entry/results.json'));
if(entry.passed!==true||entry.entrySha256!==sha(outputs.entry)||entry.loaderSha256!==previous.loaderSha256||!Buffer.from(outputs.entry).equals(await fs.readFile(path.join(out,'projected-entry/aux-native-entry.mjs'))))throw Error('Independent entry/loader mismatch');
await verify();
const result={format:'aux.vendor-source-projection.actual.v1',passed:true,output:out,previousProjectionSha256:sha(await fs.readFile(evidencePath)),compositionSha256:sha(await fs.readFile(path.join(out,'composition.json'))),sourceSha256:sha(outputs.source),entrySha256:sha(outputs.entry),sourceReceiptSha256:sha(await fs.readFile(path.join(out,'source-receipt.json'))),entryReceiptSha256:sha(await fs.readFile(path.join(out,'projected-entry/results.json'))),loaderSha256:entry.loaderSha256,totalAnchorCountPerLeaf:199,appendedAnchorCountPerLeaf:2,independentEntryMatchesProjection:true,publisherHelpersUnchanged:true,chatgptShimUnchanged:true,uiChanged:false,productExecuted:false,packaged:false,nativePairingPending:true};
await fs.writeFile(path.join(out,'projection-evidence.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
