// Static package inventory only. No native load, startup evaluation or PDF call.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,constants} from 'node:fs';
import {lstat,open,readFile,readdir,readlink} from 'node:fs/promises';
import path from 'node:path';
import {findMachOSeaSection,readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';
process.dlopen=()=>{throw Error('Native loads forbidden in static inventory probe');};
const root='/Users/rcourson/Documents/Vibe/web';
const app=path.join(root,'out/provided-candidate-aux-recovery-enrollment/Aux.app');
const prior=path.join(root,'out/provided-candidate-aux-recovery-utilities/Aux.app');
const pins=JSON.parse(await readFile(new URL('../aux-crypto-stage-package-inventory/reviewed-pins.json',import.meta.url)));
for(const field of ['compositionSha256','nativeReceiptSha256','frameworkSha256'])assert.match(pins[field]??'',/^[a-f0-9]{64}$/,`Pending ${field}`);
assert(typeof pins.nativeReceiptPath==='string'&&pins.nativeReceiptPath.startsWith('out/')&&!pins.nativeReceiptPath.split('/').includes('..'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function hash(file){const h=createHash('sha256');for await(const block of createReadStream(file))h.update(block);return h.digest('hex');}
async function regular(file){const stat=await lstat(file);assert(stat.isFile()&&!stat.isSymbolicLink(),file);return stat;}
async function sea(file){
 const stat=await regular(file),fd=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{const header=Buffer.alloc(32);assert.equal((await fd.read(header,0,32,0)).bytesRead,32);const n=header.readUInt32LE(20);assert(n>0&&n<16*1024*1024);const commands=Buffer.alloc(32+n);assert.equal((await fd.read(commands,0,commands.length,0)).bytesRead,commands.length);const section=findMachOSeaSection(commands);assert(section.offset>=commands.length&&section.size>0&&section.size<256*1024*1024&&section.offset+section.size<=stat.size);const blob=Buffer.alloc(section.size);assert.equal((await fd.read(blob,0,blob.length,section.offset)).bytesRead,blob.length);return readSeaBlob(blob).code;}finally{await fd.close();}
}
async function tree(root,relative=''){
 const rows=[];for(const entry of(await readdir(path.join(root,relative),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){const name=path.posix.join(relative,entry.name);assert(!entry.isSymbolicLink(),name);if(entry.isDirectory())rows.push(...await tree(root,name));else{assert(entry.isFile());const file=path.join(root,name);rows.push({path:name,bytes:(await lstat(file)).size,sha256:await hash(file)});}}return rows;
}
const receiptBytes=await readFile(path.join(root,pins.nativeReceiptPath)),receipt=JSON.parse(receiptBytes);
assert.equal(sha(receiptBytes),pins.nativeReceiptSha256);assert.equal(receipt.buildExitCode,0);assert.equal(receipt.compositionSha256,pins.compositionSha256);
const packageBytes=await readFile(path.join(path.dirname(app),'package.json')),packaged=JSON.parse(packageBytes);
assert.equal(packaged.signed,false);assert.equal(packaged.productionReady,false);assert.equal(packaged.stateIdentityVersion,2);assert.equal(packaged.identityProfile,'aux-v1');
assert.equal(packaged.identityEvidence?.coldEntryQuarantineChecked,true);assert.equal(packaged.nativeReceiptSha256,pins.nativeReceiptSha256);assert.equal(packaged.compositionSha256,pins.compositionSha256);
assert.equal(await hash(process.execPath),pins.nodeSha256);
// Exact native build receipt leaf comparison includes the new helper aggregate.
assert(Array.isArray(receipt.appFiles)&&receipt.appFiles.length>0);
assert.equal(packaged.nativeInputFiles,receipt.appFiles.length);
// The established assembler intentionally retires ONLY the independent runtime.
// Authenticate the exact excluded receipt rows and require that root absent.
const retiredRoot='Contents/Resources/aux-runtime';
const retired=receipt.appFiles.filter(item=>item.path.startsWith(retiredRoot+'/'));
assert.equal(packaged.retiredIndependentRuntime?.root,retiredRoot);
assert.equal(packaged.retiredIndependentRuntime?.packageName,'@aux/runtime');
assert.equal(packaged.retiredIndependentRuntime?.packageVersion,'0.1.0');
assert.deepEqual(packaged.retiredIndependentRuntime?.files,retired);
await assert.rejects(lstat(path.join(app,retiredRoot)),error=>error.code==='ENOENT');
const retained=receipt.appFiles.filter(item=>!item.path.startsWith(retiredRoot+'/'));
assert.equal(packaged.nativeFiles,retained.length);
// Same exact successful native receipt/composition as the accepted prior
// inventory. Do not repeat unchanged418-leaf hashing for this crypto-only copy.
const framework='Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework';
await regular(path.join(app,framework));assert.equal(await hash(path.join(app,framework)),pins.frameworkSha256);
const native=path.join(app,'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native');
for(const [name,digest]of[['aux-pdf.node',pins.pdfModuleSha256],['aux-pdf.cjs',pins.pdfLoaderSha256],['aux-pdf-pins.cjs',pins.pdfPinsSha256]]){await regular(path.join(native,name));assert.equal(await hash(path.join(native,name)),digest,name);}
assert.equal((await lstat(path.join(native,'aux-pdf.node'))).size,pins.pdfModuleBytes);
const aux=path.join(app,'Contents/Resources/aux');
const sources=[['daemon-sea',await sea(path.join(aux,'apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon'))],['cli-sea',await sea(path.join(aux,'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea'))],['node-development',await readFile(path.join(aux,'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'),'utf8')]];
for(const [label,source]of sources){let executable=source;if(label==='cli-sea'){assert(source.startsWith('#!/usr/bin/env node\n'));executable=source.slice('#!/usr/bin/env node\n'.length);}assert(executable.startsWith('/* aux-cold-entry-admission-v1 */\nthrow Object.assign(new Error("Aux state identity generation 2 is quarantined; migration admission is not implemented.")'),label);}
// Compare source-pinned generated manifests to actual fixed asset locations.
assert.equal(sha(await readFile(path.join(root,'docs/integration/proposed/aux-crypto-stage-integration/inputs.json'))),pins.crypto.stageInputsSha256);
assert.equal(sha(await readFile(path.join(root,'docs/integration/proposed/aux-crypto-runtime-assets/source-pins.json'))),pins.crypto.assetsSpecSha256);
const stageRoot=path.join(root,'out/provided-reuse-aux-recovery-enrollment');
const appsBytes=await readFile(path.join(stageRoot,'apps/manifest.json')),apps=JSON.parse(appsBytes);
const appsReference=packaged.externalSourceAudit?.manifestReferences?.filter(item=>item.role==='apps');
assert.equal(appsReference?.length,1);assert.equal(appsReference[0].manifestSha256,sha(appsBytes));assert.equal(appsReference[0].bytes,appsBytes.length);
const report=apps.components.daemon,profile=report.executable.cloudPolicy?.mode??'local';
assert(['local','development'].includes(profile),'Production crypto staging is unsupported');
const currentPins=JSON.parse(await readFile(new URL('../aux-macos-utility-integration/inputs.json',import.meta.url)));
assert.equal(sha(sources[0][1]),currentPins.variants[profile].sea.outputSha256);
assert.equal(sha(sources[2][1]),currentPins.variants[profile]['node-development'].outputSha256);
const guard='/* aux-cold-entry-admission-v1 */\nthrow Object.assign(new Error("Aux state identity generation 2 is quarantined; migration admission is not implemented."), {code:"AUX_STATE_IDENTITY_QUARANTINED"});\n';
for(const [index,mode]of [[0,'sea'],[2,'node-development']])assert(sources[index][1].startsWith(guard+pins.crypto.preloads[mode]),mode);
assert.equal(report.cryptoRuntime.format,'aux.crypto-runtime-assets.v1');assert.equal(report.cryptoRuntime.mode,'sea');assert.equal(report.cryptoRuntime.activation,false);assert.equal(report.cryptoRuntime.startupRefusalPreserved,true);
assert.equal(report.nodeDevelopment.cryptoIntegration.format,'aux.crypto.stage.v1');assert.equal(report.nodeDevelopment.cryptoIntegration.activation,false);assert.equal(report.nodeDevelopment.cryptoIntegration.startupRefusalPreserved,true);assert.equal(report.nodeDevelopment.cryptoIntegration.outputEntrySha256,currentPins.variants[profile]['node-development'].inputSha256);assert.equal(report.nodeDevelopment.macOSUtilitiesEntry.sourceSha256,currentPins.variants[profile]['node-development'].inputSha256);assert.equal(report.nodeDevelopment.macOSUtilitiesEntry.outputSha256,sha(sources[2][1]));
const cryptoAssets=[];
for(const [mode,directory,manifest]of [
 ['sea','apps/daemon/Aux Daemon.app/Contents/Resources/aux-crypto',report.cryptoRuntime],
 ['node-development','apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-crypto',report.nodeDevelopment.cryptoIntegration.assets]]){
 assert.equal(manifest.directory,directory);assert.equal(manifest.mode,mode);assert.equal(manifest.activation,false);assert.equal(manifest.files.length,4);
 const actualDirectory=path.join(aux,directory);assert.deepEqual((await readdir(actualDirectory)).sort(),[...pins.crypto.assets.map(a=>a.name),'aux-sync-recovery.mjs'].sort());
 for(const asset of pins.crypto.assets){
  const relative=directory+'/'+asset.name,file=path.join(aux,relative),stat=await regular(file),bytes=await readFile(file);
  assert.equal(stat.mode&0o777,0o644);assert.equal(sha(bytes),asset.outputSha256,relative);
  const generated=report.files.filter(item=>item.path===relative.slice(('apps/'+report.app+'/').length));assert.equal(generated.length,1);
  assert.equal(generated[0].added,true);assert.equal(generated[0].generatedBy,'vendor/provided/aux-crypto-stage.mjs');assert.equal(generated[0].outputSha256,asset.outputSha256);assert.equal(generated[0].outputMode,0o644);
  const entry=manifest.files.filter(item=>item.path===relative);assert.equal(entry.length,1);assert.equal(entry[0].sha256,asset.outputSha256);assert.equal(entry[0].bytes,bytes.length);assert.equal(entry[0].mode,0o644);
  // Static module graph only: imports remain builtin or one of these4 assets.
  const imports=[...bytes.toString().matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]);
  for(const target of imports)assert(target.startsWith('node:')||(target.startsWith('./')&&pins.crypto.assets.some(a=>target==='./'+a.name)),relative+':'+target);
  cryptoAssets.push({mode,path:relative,bytes:bytes.length,sha256:sha(bytes),modeBits:stat.mode&0o777,imports});
 }
}
// Verify only the newly generated utility/recovery assets against the source-pinned stage and exact package manifest.
const added=[];for(const item of report.files.filter(item=>item.added&&item.generatedBy==='vendor/provided/aux-macos-utility-stage.mjs'&&item.path!=='Contents/Resources/node-development/index.mjs')){
 const file=path.join(aux,'apps',report.app,item.path),bytes=await readFile(file),stat=await regular(file);assert.equal(sha(bytes),item.outputSha256);assert.equal(stat.mode&0o777,item.outputMode);added.push({path:item.path,bytes:bytes.length,sha256:sha(bytes)});
}
const utilityPaths=['Contents/Resources/native/aux-macos-utilities.cjs','Contents/Resources/native/aux-macos-utilities.node'];
const recoveryPaths=['Contents/Resources/aux-crypto/aux-sync-recovery.mjs','Contents/Resources/node-development/aux-crypto/aux-sync-recovery.mjs'];
assert.deepEqual(added.map(f=>f.path).sort(),[...utilityPaths,...recoveryPaths].sort());
assert.equal(report.macOSUtilities.files.length,2);assert.deepEqual(report.macOSUtilities.files.map(f=>f.path.slice(('apps/'+report.app+'/').length)).sort(),utilityPaths);
const recoveryManifest=report.macOSUtilities.syncRecovery;assert.equal(recoveryManifest.format,'aux.sync-recovery.resources.v1');assert.equal(recoveryManifest.activation,false);assert.equal(recoveryManifest.files.length,2);assert.deepEqual(recoveryManifest.files.map(f=>f.path.slice(('apps/'+report.app+'/').length)).sort(),recoveryPaths);
let recoveryBytes;for(const item of recoveryManifest.files){const file=path.join(aux,item.path),bytes=await readFile(file),stat=await regular(file);assert.equal(stat.mode&0o777,0o644);assert.equal(item.mode,0o644);assert.equal(bytes.length,currentPins.recoveryArtifact.bytes);assert.equal(sha(bytes),currentPins.recoveryArtifact.sha256);assert.equal(item.sha256,currentPins.recoveryArtifact.sha256);assert.equal(item.bytes,bytes.length);if(recoveryBytes)assert.deepEqual(bytes,recoveryBytes);else recoveryBytes=bytes;}
assert.equal(report.macOSUtilities.format,'aux.macos.utilities.resources.v1');assert.equal(report.macOSUtilities.activation,false);assert.equal(report.macOSUtilities.protectedHostPolicy,'aux.development.host.policy.v4');
for(const item of report.macOSUtilities.files){const file=path.join(aux,item.path);assert.equal(await hash(file),item.sha256);assert.equal((await regular(file)).size,item.bytes);}
// New enrollment UI is the only permitted UI successor:1215 original+2fixed.
const ui='Contents/Resources/aux/apps/extension/dist';
const previous=await tree(path.join(prior,ui)),current=await tree(path.join(app,ui));
assert.equal(previous.length,1215);assert.equal(current.length,1217);
assert.equal(sha(JSON.stringify(previous)),pins.uiInventorySha256);
const enrollmentPins=JSON.parse(await readFile(new URL('../aux-sync-recovery-enrollment-ui/source-pins.json',import.meta.url)));
assert.equal(enrollmentPins.format,'aux.sync-recovery.enrollment-ui.v2');
const enrollmentPaths=['assets/aux-sync-recovery-enrollment-controller.js','assets/aux-sync-recovery-enrollment.js'];
assert.deepEqual(enrollmentPins.assets.map(file=>file.path),enrollmentPaths);
const previousByPath=new Map(previous.map(file=>[file.path,file]));
const currentByPath=new Map(current.map(file=>[file.path,file]));
assert.deepEqual(current.filter(file=>!previousByPath.has(file.path)).map(file=>file.path).sort(),[...enrollmentPaths].sort());
const changedUI=[];
for(const before of previous){const after=currentByPath.get(before.path);assert(after,'Removed UI path '+before.path);if(before.sha256!==after.sha256||before.bytes!==after.bytes)changedUI.push(before.path);}
assert.deepEqual(changedUI.sort(),['assets/account-Dr_CA8LL.js','manifest.json']);
assert.equal(previous.length-changedUI.length,1213);
const stylesheets=current.filter(file=>file.path.endsWith('.css'));assert.equal(stylesheets.length,5);assert.equal(stylesheets.length,pins.stylesheets);
for(const stylesheet of stylesheets)assert.deepEqual(stylesheet,previousByPath.get(stylesheet.path));
assert.equal(currentByPath.get(enrollmentPins.ui.path).sha256,enrollmentPins.ui.outputSha256);
assert.equal(previousByPath.get(enrollmentPins.ui.path).sha256,enrollmentPins.ui.inputSha256);
const uiManifestBytes=await readFile(path.join(stageRoot,'ui/manifest.json')),uiManifest=JSON.parse(uiManifestBytes),uiReport=uiManifest.components.agent;
assert.equal(uiManifest.stateIdentityVersion,2);assert.equal(uiManifest.identityProfile,'aux-v1');assert.equal(uiReport.sourceVersion,'1.26.1016.1852');
const uiReference=packaged.externalSourceAudit?.manifestReferences?.filter(item=>item.role==='ui');
assert.equal(uiReference?.length,1);assert.equal(uiReference[0].manifestSha256,sha(uiManifestBytes));assert.equal(uiReference[0].bytes,uiManifestBytes.length);
assert.equal(uiReport.files.length,1217);assert.deepEqual(uiReport.files.map(file=>file.path).sort(),current.map(file=>file.path).sort());
for(const file of uiReport.files)assert.equal(file.outputSha256,currentByPath.get(file.path).sha256,file.path);
const enrollmentGenerator='docs/integration/proposed/aux-sync-recovery-enrollment-ui/source/adapt.mjs';
const expectedEnrollment=[],expectedGenerated=[];
for(const asset of enrollmentPins.assets){
 const expectedSource='docs/integration/proposed/aux-sync-recovery-enrollment-ui/source/'+asset.path.slice('assets/'.length);assert.equal(asset.source,expectedSource);
 const source=await readFile(path.join(root,asset.source));assert.equal(sha(source),asset.sha256);assert.equal(source.length,asset.bytes);
 const image=path.join(app,ui,asset.path),stat=await regular(image),bytes=await readFile(image);assert.equal(stat.mode&0o777,0o644);assert.deepEqual(bytes,source);
 expectedEnrollment.push({path:asset.path,bytes:asset.bytes,mode:0o644,repositorySource:asset.source,sourceSha256:asset.sha256,outputSha256:asset.sha256,generatedBy:enrollmentGenerator});
 expectedGenerated.push({path:asset.path,sourceSha256:asset.sha256,repositorySource:asset.source,outputSha256:asset.sha256,outputMode:0o644,bytes:asset.bytes,generatedBy:enrollmentGenerator,added:true,changeKinds:['integration']});
}
assert.deepEqual(uiReport.recoveryEnrollment,{format:'aux.sync-recovery.enrollment-ui.resources.v1',activation:false,files:expectedEnrollment});
assert.deepEqual(uiReport.files.filter(file=>file.generatedBy),expectedGenerated);
const manifestText=await readFile(path.join(app,ui,'manifest.json'),'utf8'),manifest=JSON.parse(manifestText),previousManifest=JSON.parse(await readFile(path.join(prior,ui,'manifest.json'),'utf8'));
assert.equal(manifest.version,'1.26.1016.1863');assert.equal(manifest.version_name,'1.26.1016.1852');assert.equal(previousManifest.version,'1.26.1016.1862');
assert.deepEqual({...manifest,version:previousManifest.version},previousManifest);
const manifestEntry=uiReport.files.find(file=>file.path==='manifest.json'),versionAnchor=manifestEntry.anchors.at(-1);
assert.deepEqual(versionAnchor,{kind:'integration',find:'"version": "1.26.1016.1852"',replace:'"version": "1.26.1016.1863",\n  "version_name": "1.26.1016.1852"',count:1});
assert.equal(manifestText.split(versionAnchor.replace).length,2);
const unrevised=manifestText.replace(versionAnchor.replace,versionAnchor.find);
const fingerprint=sha(JSON.stringify(current.map(file=>[file.path,file.path==='manifest.json'?sha(unrevised):file.sha256]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0)));
assert.equal(fingerprint,'ade97244902afdc5dd345af447090b2c79a715a0500ccc4aed6eeb82ca75eb1d');
const review=JSON.parse(await readFile(path.join(root,'vendor/provided/agent-revisions.json'))).find(item=>item.revision===11);assert.equal(review.fingerprint,fingerprint);assert.equal(review.profile,'development');assert.equal(review.identityProfile,'aux-v1');assert.equal(review.stateIdentityVersion,2);
const accountRecord=uiReport.files.find(file=>file.path===enrollmentPins.ui.path);
for(const edit of enrollmentPins.ui.stagePreBranding.edits)assert.equal(accountRecord.anchors.filter(anchor=>anchor.find===edit.find&&anchor.replace===edit.replace&&anchor.count===1).length,1);

console.log(JSON.stringify({version:1,app,nativeReceiptSha256:sha(receiptBytes),compositionSha256:pins.compositionSha256,packageReceiptSha256:sha(packageBytes),frameworkSha256:pins.frameworkSha256,nativeInputFiles:receipt.appFiles.length,nativeRetainedLeafCount:retained.length,nativeLeafFilesCompared:0,fullNativeInventoryRepeated:false,nativeFrameworkCompared:true,retiredIndependentRuntime:{root:retiredRoot,exactReceiptFiles:retired.length,absent:true},newUtilityAndRecoveryAssets:added,crypto:{profile,generatedManifestSha256:sha(appsBytes),assets:cryptoAssets,entrypointsImported:false,activation:false},pdf:{moduleSha256:pins.pdfModuleSha256,moduleBytes:pins.pdfModuleBytes,loaderSha256:pins.pdfLoaderSha256,pinFileSha256:pins.pdfPinsSha256,loaded:false,extractionRepeated:false},ui:{baseline:prior,comparedFiles:current.length,priorFiles:previous.length,originalFilesByteIdentical:1213,allowedChangedPaths:changedUI,addedAssets:expectedEnrollment,stylesheets:stylesheets.length,stylesheetsByteIdentical:true,revision:11,version:manifest.version,fingerprint,accountSha256:currentByPath.get(enrollmentPins.ui.path).sha256,accountAnchorCount:3,inventorySha256:sha(JSON.stringify(current)),renderedComparison:false},coldRefusals:sources.map(([label,source])=>({label,codeSha256:sha(source),firstRefusal:true,preservedCliShebang:label==='cli-sea',evaluated:false})),nativeOrPdfFixturesRepeated:false,appLaunched:false,entrypointsEvaluated:false,protectedOrOSOrCloudOperations:false,productionReady:false,signed:false,state2Authorized:false},null,2));
