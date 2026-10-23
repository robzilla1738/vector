import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
const root='/Users/rcourson/Documents/Vibe/web';
const proposal=join(root,'docs/integration/proposed/aux-native-current-entry-package');
const {currentNativeEntryResources,projectCurrentNativeEntry,addDormantCurrentNativeEntry,defaultIndexPath}=await import(pathToFileURL(join(proposal,'source/resources.mjs')));
const pins=JSON.parse(await readFile(join(proposal,'inputs.json')));
const index=await readFile(join(root,'out/provided-reuse-aux-current-native/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'));
const original=await readFile(join(root,pins.originalDaemon));
const files=await currentNativeEntryResources({repositoryRoot:root,index});
assert.equal(files.length,2);assert.equal(createHash('sha256').update(files[0].bytes).digest('hex'),pins.entrySha256);
assert.throws(()=>projectCurrentNativeEntry(original,Buffer.concat([index,Buffer.from(' ')])),/Exact current20748/);
const syntax=spawnSync(process.execPath,['--check','--input-type=module'],{input:files[0].bytes,encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
const source=await readFile(join(root,pins.reader.sourcePath),'utf8');assert.equal(source.split('index.mjs').length-1,4);
const successor=await readFile(join(proposal,'source/AuxSealedNativeDaemonEntry.swift'),'utf8');
assert.equal(successor,source.replaceAll('index.mjs','aux-native-entry.mjs'));
const patch=JSON.parse(await readFile(join(proposal,'package-metadata.json')));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const actualScript=await readFile(join(root,patch.path),'utf8');
assert.ok([patch.sourceSha256,patch.outputSha256].includes(hash(actualScript)));
let script=await readFile(join(root,'docs/integration/proposed/aux-native-main-package-integration/source',patch.path),'utf8');
assert.equal(hash(script),patch.sourceSha256);
for(const edit of patch.edits){assert.equal(script.split(edit.find).length-1,edit.count);script=script.replace(edit.find,edit.replace)}
assert.equal(hash(script),patch.outputSha256);
if(hash(actualScript)===patch.outputSha256)assert.equal(actualScript,script);
assert.equal(pins.pairedNativeMain.readerSha256,pins.reader.proposedSha256);
const resources=await mkdtemp(join(tmpdir(),'aux-dormant-entry-fixture-'));
try{
 for(const suffix of ['node-development','native'])await mkdir(join(resources,'apps/daemon/Aux Daemon.app/Contents/Resources',suffix),{recursive:true});
 await writeFile(join(resources,defaultIndexPath),index);
 const assembled={identityProfile:'aux-v1',stateIdentityVersion:2,daemonRuntime:'provided-node-development',nativeMainReplacement:{mode:'inactive-embedded-native-main',buildReceiptSha256:pins.pairedNativeMain.buildReceiptSha256,outputSha256:pins.pairedNativeMain.executableSha256,fixedNativeEntryReaderSha256:pins.pairedNativeMain.readerSha256},files:[{path:defaultIndexPath,type:'file',sha256:pins.inputIndexSha256,mode:0o644}]};
 await assert.rejects(addDormantCurrentNativeEntry({resources,assembled:{...assembled,nativeMainReplacement:{...assembled.nativeMainReplacement,buildReceiptSha256:'0'.repeat(64)}},repositoryRoot:root}),/Inactive state2/);
 const result=await addDormantCurrentNativeEntry({resources,assembled,repositoryRoot:root});
 assert.equal(result.files.length,2);assert.equal(result.dormant,true);assert.equal(assembled.files.length,3);
 assert.equal(result.readerSourceLinked,true);assert.equal(result.pairedBuildReceiptSha256,pins.pairedNativeMain.buildReceiptSha256);
 assert.equal(result.pairedExecutableSha256,pins.pairedNativeMain.executableSha256);
 assert.deepEqual(await readFile(join(resources,defaultIndexPath)),index);
 await assert.rejects(addDormantCurrentNativeEntry({resources,assembled,repositoryRoot:root}),/Inactive state2/);
}finally{await rm(resources,{recursive:true,force:true})}
console.log(JSON.stringify({format:'aux.current-native-entry.source-check.v1',passed:true,current20748InputMatchesPriorReviewedProjection:true,
 inputSha256:pins.inputIndexSha256,outputSha256:pins.entrySha256,generatedFiles:files.map(({path,sha256,bytes})=>({path,sha256,bytes:bytes.length})),
 syntaxOnly:true,actualPrivateResourceCopierDisposableFixture:true,defaultIndexPreserved:true,readerLiteralChanges:4,
 mainRebuilt:false,entryExecuted:false,nativeModuleLoaded:false,currentStageChanged:false,actualPackageProduced:false},null,2));
