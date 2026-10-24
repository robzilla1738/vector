// Bind the actual latest inactive app/source pair, never an earlier feature base.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../../..');
const sha=value=>createHash('sha256').update(value).digest('hex');
const [pinsPath,output]=process.argv.slice(2);
if(![pinsPath,output].every(p=>p&&path.isAbsolute(p)&&p.startsWith('/private/tmp/')))throw Error('Fresh absolute /private/tmp paths required');
for(const p of [pinsPath,output])try{await fs.lstat(p);throw Error('Existing destination refused')}catch(error){if(error.code!=='ENOENT')throw error}
const read=async p=>JSON.parse(await fs.readFile(p));
const inputs=new Map(),pin=async(p,expected)=>{const digest=sha(await fs.readFile(p));if(expected&&digest!==expected)throw Error('Input drift: '+p);if(inputs.has(p)&&inputs.get(p)!==digest)throw Error('Freeze race');inputs.set(p,digest);return digest};
for(const file of ['freeze.mjs','compose.mjs'])await pin(path.join(here,file));
const scope=path.join(root,'docs/integration/proposed/standard-profile-isolation');
const latestPair=path.join(scope,'runtime-package-a1/source-pair.json');await pin(latestPair);
const pair=await read(latestPair);
if(!pair.passed||pair.coldFeatureEnabled||pair.runtimeAuthorityGranted||pair.productExecuted)throw Error('Inactive latest pair required');
for(const kind of ['source','entry','loader','daemon','pty'])await pin(pair[kind],pair[kind+'Sha256']);
const priorRoot=path.dirname(pair.source),priorComposition=path.join(priorRoot,'composition.json');
await pin(priorComposition,pair.sourceCompositionReceiptSha256);
await pin(path.join(priorRoot,'source-receipt.json'),pair.sourceReceiptSha256);
await pin(path.join(priorRoot,'projected-entry/results.json'),pair.entryReceiptSha256);
const prior=await read(priorComposition);
if(!prior.passed||prior.productExecuted||prior.runtimeAuthorityGranted||prior.coldFeatureEnabled||prior.files.length!==2)throw Error('Actual cumulative predecessor required');
await pin(prior.predecessorSourcePair,prior.predecessorSourcePairSha256);
for(const row of prior.files){await pin(row.input,row.beforeSha256);await pin(row.output,row.afterSha256)}
for(const row of [...prior.helpers,...prior.artifacts])await pin(row.output,row.outputSha256);
const latestPackage=path.join(scope,'ui-draft-identity-a1/actual-package-a1.json');await pin(latestPackage);
const candidate=await read(latestPackage);if(!candidate.passed||candidate.testable||candidate.runtimeAuthorityGranted||candidate.appExecuted||candidate.acceptedAppReplaced)throw Error('Actual inactive latest package required');
await pin(candidate.receipt.path,candidate.receipt.sha256);
const appReceipt=await read(candidate.receipt.path),packageLeaves=[];
const base='Contents/Resources/aux/';
const relativeLeaves=[
 base+'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs',
 base+'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs',
 base+'apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon',
 base+'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli',
 base+'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea',
 ...['aux-owned-native.cjs','runtime-seed.cjs','runtime-bootstrap.cjs','aux-chatgpt.cjs'].map(name=>base+'apps/daemon/Aux Daemon.app/Contents/Resources/native/'+name),
];
for(const relative of relativeLeaves){const leaf=appReceipt.files.find(row=>row.path===relative);if(!leaf||leaf.type!=='file')throw Error('Actual package leaf missing: '+relative);const absolute=path.join(candidate.app,relative);await pin(absolute,leaf.sha256);packageLeaves.push({path:absolute,relative,sha256:leaf.sha256,mode:leaf.mode})}
for(const helper of [...prior.helpers,...prior.artifacts]){const leaf=packageLeaves.find(row=>row.relative.endsWith('/native/'+path.basename(helper.output)));if(!leaf||leaf.sha256!==helper.outputSha256)throw Error('Latest packaged helper/artifact differs from current source chain')}
if(packageLeaves[0].sha256!==pair.sourceSha256||packageLeaves[1].sha256!==pair.entrySha256||packageLeaves[2].sha256!==pair.daemonSha256)throw Error('Current package/source tuple differs');
const context=path.join(root,'vendor/provided/aux-productivity-context-read.mjs');await pin(context);
const contextPlan=path.join(root,'docs/integration/proposed/browser-feature-expansion/productivity-adapter-pairing-a1/context-successor-plan.json');await pin(contextPlan);
// Original current ordinary→dormant projector and transitive static operands.
const projectionInputs=path.join(root,'docs/integration/proposed/browser-feature-expansion/productivity-adapter-pairing-a1/actual-inputs.json');await pin(projectionInputs);
const originalCopies=(await read(projectionInputs)).projectionCopies;
for(const copy of originalCopies)await pin(copy.source,copy.sha256);
const nativeReceipt=path.join(scope,'ui-native-capture-transport-a1/actual-daemon-link-a3.json');await pin(nativeReceipt);
const native=await read(nativeReceipt),nativeInputs=path.join(scope,'ui-native-capture-transport-a1/daemon-link-inputs.json');await pin(nativeInputs,native.inputsSha256);
const link=await read(nativeInputs),nativeBinary=link.command[link.command.lastIndexOf('-o')+1];await pin(nativeBinary,native.binarySha256);
if(!native.passed||!native.postLinkVerificationPassed||native.signed||native.executed||native.nativeApiExecuted||native.packageIntegrated)throw Error('Exact unexecuted native input required');
for(const [p,digest] of inputs)await pin(p,digest);
const result={format:'aux.productivity-latest-context.inputs.v1',root,producer:here,output,latestPair,priorRoot,priorComposition,latestPackage,
 context,contextPlan,projectionCopies:originalCopies,packageLeaves,nativeReceipt,nativeInputs,nativeBinary,
 inputs:[...inputs].map(([path,sha256])=>({path,sha256})),productExecuted:false,runtimeAuthorityGranted:false};
await fs.writeFile(pinsPath,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({frozen:true,inputs:inputs.size,packageLeaves:packageLeaves.length,pinsPath,output}));
