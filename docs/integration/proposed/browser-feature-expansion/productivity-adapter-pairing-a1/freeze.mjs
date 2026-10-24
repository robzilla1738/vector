// Freeze only static producer operands. No product/native module is evaluated.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../../..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const [pinsPath,output]=process.argv.slice(2);
if(![pinsPath,output].every(p=>p&&path.isAbsolute(p)&&p.startsWith('/private/tmp/')))
  throw Error('Fresh absolute /private/tmp pins and output required');
for(const target of [pinsPath,output])try{await fs.lstat(target);throw Error('Existing destination: '+target)}catch(error){if(error.code!=='ENOENT')throw error}
const read=async name=>JSON.parse(await fs.readFile(name));
const inputs=new Map();
const pin=async(name,expected)=>{
  const digest=sha(await fs.readFile(name));
  if(expected&&digest!==expected)throw Error('Reviewed input changed: '+name);
  if(inputs.has(name)&&inputs.get(name)!==digest)throw Error('Input changed during freeze');
  inputs.set(name,digest);return digest;
};
for(const name of ['freeze.mjs','compose.mjs'])await pin(path.join(here,name));
const historicalProjection=path.join(root,'docs/integration/proposed/browser-feature-expansion/async-daemon-projection-research-v1/actual-projection.json');
await pin(historicalProjection);
const prior=await read(historicalProjection);
if(!prior.passed||!prior.independentEntryMatchesProjection||prior.runtimeAuthorityGranted||prior.productExecuted||prior.packaged)
  throw Error('Actual inactive research projection required');
const historicalComposition=path.join(prior.output,'composition.json');
await pin(historicalComposition,prior.compositionSha256);
const composition=await read(historicalComposition);
await pin(composition.featureBaseComposition,composition.featureBaseCompositionSha256);
await pin(path.join(prior.output,'source-receipt.json'),prior.sourceReceiptSha256);
await pin(path.join(prior.output,'projected-entry/results.json'),prior.entryReceiptSha256);
await pin(path.join(prior.output,'projected-entry/aux-native-entry.mjs'),prior.entrySha256);
await pin(path.join(prior.output,'projected-entry/aux-owned-native.cjs'),prior.loaderSha256);
await pin(composition.predecessorSourcePair,composition.predecessorSourcePairSha256);
const pairPath=path.join(root,'docs/integration/proposed/profile-isolation-protected-startup/integration/source-pair.json');
await pin(pairPath,composition.predecessorSourcePairSha256);
const pair=await read(pairPath);
if(!pair.passed||pair.coldFeatureEnabled||pair.runtimeAuthorityGranted)throw Error('Inactive protected source pair required');
for(const kind of ['source','entry','loader'])await pin(pair[kind],pair[kind+'Sha256']);
for(const row of composition.files){
  await pin(row.input,row.beforeSha256);await pin(row.output,row.afterSha256);
  for(const stage of row.stages){await pin(stage.input,stage.beforeSha256);await pin(stage.output,stage.afterSha256)}
}
for(const helper of composition.helpers){await pin(helper.input,helper.inputSha256);await pin(helper.output,helper.outputSha256)}
// Bind current producer inventory anew; historical adapter hashes stay historical.
const listPath=path.join(root,'scripts/lib/provided-stage-inputs.mjs');await pin(listPath);
const {providedStageInputs}=await import(pathToFileURL(listPath));
if(!Array.isArray(providedStageInputs)||!providedStageInputs.length||new Set(providedStageInputs).size!==providedStageInputs.length)
  throw Error('Unique actual adapter inventory required');
const adapterInputs=[];
for(const relative of providedStageInputs){
  if(path.isAbsolute(relative)||path.normalize(relative).startsWith('..'))throw Error('Invalid adapter path');
  adapterInputs.push({path:relative,sha256:await pin(path.join(root,relative))});
}
const dependencies=[
  'docs/integration/proposed/browser-feature-expansion/integration/compose-daemon.mjs',
  'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs',
  'docs/integration/proposed/aux-final-local-entry-package/inputs.json',
  'docs/integration/proposed/aux-final-local-entry-package/source/project.mjs',
  'docs/integration/proposed/aux-native-owned-entry-routing/edits.json',
  'docs/integration/proposed/aux-native-exec-lifetime/edits.json',
  'docs/integration/proposed/aux-native-fixed-pty-loading/anchor.json',
  'docs/integration/proposed/aux-native-fixed-pty-loading/transform.mjs',
  'vendor/aside/lib/sea.mjs',
  'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-integration/transform.mjs',
  'docs/integration/proposed/browser-feature-expansion/research-v1/source/aux-research-daemon.mjs',
  'docs/integration/proposed/browser-feature-expansion/research-v1/source/research-runtime.js',
];
for(const name of dependencies)await pin(path.join(root,name));
const projection=await read(path.join(root,'docs/integration/proposed/aux-final-local-entry-package/inputs.json'));
const canonicalRoot=composition.predecessorSourcePair.split('/docs/integration/proposed/')[0];
const originalDaemon=path.join(canonicalRoot,projection.originalDaemon);
await pin(originalDaemon,projection.originalDaemonSha256);
await pin(path.join(root,projection.loader.path),projection.loader.sha256);
const projectionCopies=dependencies.filter(name=>name.includes('project-entry.mjs')||name.includes('aux-final-local-entry-package/')||name.includes('aux-native-owned-entry-routing/')||name.includes('aux-native-exec-lifetime/')||name.includes('aux-native-fixed-pty-loading/')||name==='vendor/aside/lib/sea.mjs').map(relative=>({relative,source:path.join(root,relative),sha256:inputs.get(path.join(root,relative))}));
for(const relative of ['vendor/provided/aux-cold-entry-admission.mjs','docs/integration/proposed/aux-cold-entry-admission/inputs.json',projection.loader.path]){
 const source=path.join(root,relative);projectionCopies.push({relative,source,sha256:await pin(source)});
}
projectionCopies.push({relative:projection.originalDaemon,source:originalDaemon,sha256:projection.originalDaemonSha256});
// Existing compiled daemon evidence is an input, never a new pairing claim.
const nativeReceipt=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-native-capture-transport-a1/actual-daemon-link-a3.json');
const nativeInputs=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-native-capture-transport-a1/daemon-link-inputs.json');
await pin(nativeReceipt);const native=await read(nativeReceipt);
if(!native.passed||!native.postLinkVerificationPassed||native.signed||native.executed||native.nativeApiExecuted||native.packageIntegrated||native.runtimeAcceptance)
  throw Error('Exact unexecuted unsigned native-capture a3 evidence required');
await pin(nativeInputs,native.inputsSha256);
const link=await read(nativeInputs),nativeBinary=link.command[link.command.lastIndexOf('-o')+1];
if(!nativeBinary||!nativeBinary.startsWith(native.output+'/'))throw Error('Actual native output association changed');
await pin(nativeBinary,native.binarySha256);
for(const [name,expected] of inputs)await pin(name,expected);
const result={format:'aux.productivity-adapter-pairing.inputs.v1',root,producer:here,output,
 historicalProjection,historicalComposition,predecessorSourcePair:pairPath,
 nativeReceipt,nativeInputs,nativeBinary,adapterInputs,projectionCopies,
 inputs:[...inputs].map(([path,sha256])=>({path,sha256})),
 preparedOnly:true,productExecuted:false,runtimeAuthorityGranted:false};
await fs.writeFile(pinsPath,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({frozen:true,inputs:inputs.size,adapterInputs:adapterInputs.length,pinsPath,output,productExecuted:false}));
