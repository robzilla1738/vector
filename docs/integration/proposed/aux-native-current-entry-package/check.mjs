import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {currentNativeEntryResources,projectCurrentNativeEntry,addDormantCurrentNativeEntry,defaultIndexPath} from './source/resources.mjs';
const root='/Users/rcourson/Documents/Vibe/web';
const pins=JSON.parse(await readFile(new URL('inputs.json',import.meta.url)));
const index=await readFile(join(root,'out/provided-reuse-aux-current-native/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'));
const original=await readFile(join(root,pins.originalDaemon));
const files=await currentNativeEntryResources({repositoryRoot:root,index});
assert.equal(files.length,2);assert.equal(createHash('sha256').update(files[0].bytes).digest('hex'),pins.entrySha256);
assert.throws(()=>projectCurrentNativeEntry(original,Buffer.concat([index,Buffer.from(' ')])),/Exact current20748/);
const syntax=spawnSync(process.execPath,['--check','--input-type=module'],{input:files[0].bytes,encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
const source=await readFile(join(root,pins.reader.sourcePath),'utf8');assert.equal(source.split('index.mjs').length-1,4);
const successor=await readFile(new URL('source/AuxSealedNativeDaemonEntry.swift',import.meta.url),'utf8');
assert.equal(successor,source.replaceAll('index.mjs','aux-native-entry.mjs'));
const patch=JSON.parse(await readFile(new URL('package-metadata.json',import.meta.url)));
let script=await readFile(join(root,patch.path),'utf8');assert.equal(createHash('sha256').update(script).digest('hex'),patch.sourceSha256);
for(const edit of patch.edits){assert.equal(script.split(edit.find).length-1,1);script=script.replace(edit.find,edit.replace)}
assert.equal(createHash('sha256').update(script).digest('hex'),patch.outputSha256);
const resources=await mkdtemp(join(tmpdir(),'aux-dormant-entry-fixture-'));
try{
 for(const suffix of ['node-development','native'])await mkdir(join(resources,'apps/daemon/Aux Daemon.app/Contents/Resources',suffix),{recursive:true});
 await writeFile(join(resources,defaultIndexPath),index);
 const assembled={identityProfile:'aux-v1',stateIdentityVersion:2,daemonRuntime:'provided-node-development',nativeMainReplacement:{mode:'inactive-embedded-native-main'},files:[{path:defaultIndexPath,type:'file',sha256:pins.inputIndexSha256,mode:0o644}]};
 const result=await addDormantCurrentNativeEntry({resources,assembled,repositoryRoot:root});
 assert.equal(result.files.length,2);assert.equal(result.dormant,true);assert.equal(assembled.files.length,3);
 assert.deepEqual(await readFile(join(resources,defaultIndexPath)),index);
 await assert.rejects(addDormantCurrentNativeEntry({resources,assembled,repositoryRoot:root}),/Inactive state2/);
}finally{await rm(resources,{recursive:true,force:true})}
console.log(JSON.stringify({format:'aux.current-native-entry.source-check.v1',passed:true,current20748InputMatchesPriorReviewedProjection:true,
 inputSha256:pins.inputIndexSha256,outputSha256:pins.entrySha256,generatedFiles:files.map(({path,sha256,bytes})=>({path,sha256,bytes:bytes.length})),
 syntaxOnly:true,actualPrivateResourceCopierDisposableFixture:true,defaultIndexPreserved:true,readerLiteralChanges:4,
 mainRebuilt:false,entryExecuted:false,nativeModuleLoaded:false,currentStageChanged:false,actualPackageProduced:false},null,2));
