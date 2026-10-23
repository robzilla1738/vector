import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyBuildReceipt,verifyNativeMainPackageInput} from './package-successor/source/native-main-package.mjs';
const root='/Users/rcourson/Documents/Vibe/web';
const here=new URL('./',import.meta.url);const sha=b=>createHash('sha256').update(b).digest('hex');
const receipt=await readFile(new URL('evidence/results.json',here));
assert.equal(verifyBuildReceipt(receipt).readerSha256,'1076fd852428f0db4d0ba4f2a2898b05f88656d9bec36d272418a1fe2bdac2b8');
assert.throws(()=>verifyBuildReceipt(Buffer.from(receipt.toString().replace('"passed": true','"passed": false'))));
const evidence=await verifyNativeMainPackageInput({repositoryRoot:root,
 receiptPath:new URL('evidence/results.json',here).pathname,
 compositionBytes:await readFile(root+'/out/native-reuse-composition-aux-parent-swift-runtime/manifest.json'),
 stage:{identityProfile:'aux-v1',stateIdentityVersion:2}});
assert.equal(evidence.authorityGranted,false);assert.equal(evidence.coldHookEnabled,false);
assert.equal(evidence.fixedNativeEntryReaderSha256,'1076fd852428f0db4d0ba4f2a2898b05f88656d9bec36d272418a1fe2bdac2b8');
const metadata=JSON.parse(await readFile(new URL('package-successor/metadata.json',here)));
const outputs=['inputs.json','source/native-main-package.mjs','resources.mjs','resource-inputs.json'];
for(let i=0;i<metadata.files.length;i++){
 const row=metadata.files[i];assert.ok([row.sourceSha256,row.outputSha256].includes(sha(await readFile(root+'/'+row.path))));
 assert.equal(sha(await readFile(new URL('package-successor/'+outputs[i],here))),row.outputSha256);
}
const resources=await readFile(new URL('package-successor/resources.mjs',here),'utf8');
assert.ok(resources.includes('assembled.nativeMainReplacement.fixedNativeEntryReaderSha256!==pins.reader.proposedSha256'));
assert.ok(resources.includes('assembled.nativeMainReplacement.buildReceiptSha256!==pins.pairedNativeMain.buildReceiptSha256'));
assert.ok(resources.includes('readerSourceLinked:true'));
console.log(JSON.stringify({passed:true,actualNewBuildReceiptAndExecutableVerified:true,sourcePins:evidence.sourceFiles,
 fixedReaderSha256:evidence.fixedNativeEntryReaderSha256,wrongReceiptRejected:true,exactReplacementFiles:metadata.files.length,
 sourceOnlyReaderAssociationChecked:true,executableRun:false,moduleLoaded:false,actualPackageProduced:false},null,2));
