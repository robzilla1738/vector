import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {applyAuxUiDraftClosure} from '../../../../../vendor/provided/aux-ui-draft-closure.mjs';
const here=new URL('./',import.meta.url),pins=JSON.parse(await readFile(new URL('../ui-editor-writer-closure-a1/inputs.json',here),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const snapshot='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/';
const scratch=await mkdtemp('/private/tmp/aux-ui-editor-writer-closure-');
const files=[];
for(const file of pins.files){
 const original=await readFile(snapshot+file.path,'utf8'),text=await readFile(pins.predecessorStage+'/'+file.path,'utf8');
 assert.equal(sha(original),file.sourceSha256);assert.equal(sha(text),file.predecessorSha256);
 const input={component:'agent',path:file.path,text,original,stateIdentityVersion:2};
 const result=applyAuxUiDraftClosure(input);let replay=text;
 for(const anchor of result.anchors){assert.equal(replay.split(anchor.find).length-1,anchor.count);replay=replay.split(anchor.find).join(anchor.replace)}
 assert.equal(replay,result.text);assert.equal(applyAuxUiDraftClosure({...input,stateIdentityVersion:1}).text,text);
 assert.throws(()=>applyAuxUiDraftClosure({...input,text:result.text}),/Repeated/);
 assert.deepEqual([...result.text.matchAll(/className:"([^"]*)"/g)].map(x=>x[1]),[...text.matchAll(/className:"([^"]*)"/g)].map(x=>x[1]));
 const checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:result.text,encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
 const output=new URL('source/'+file.path,here);await mkdir(new URL('./',output),{recursive:true});await writeFile(output,result.text);
 await writeFile(scratch+'/'+file.path.split('/').at(-1),result.text);
 files.push({path:file.path,sourceSha256:sha(original),inputSha256:sha(text),output:output.pathname,outputSha256:sha(result.text),anchors:result.anchors,syntaxPassed:true,suppliedClassNamesPreserved:true});
}
const receipt={format:'aux.ui-editor-writer-closure.projection.actual.v1',passed:true,baselineCommit:pins.baselineCommit,
 predecessorStage:pins.predecessorStage,scratch,files,countedAnchors:files.reduce((n,f)=>n+f.anchors.length,0),
 adapterSha256:sha(await readFile(new URL('../../../../../vendor/provided/aux-ui-draft-closure.mjs',here))),
 runtimeSha256:pins.runtimeSha256,originalsAndPriorStageUnchanged:true,stateV1Unchanged:true,
 nativeExecuted:false,productExecuted:false,completeWriterCoverage:false,runtimeAccepted:false};
await writeFile(new URL('source-plan.json',here),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({passed:true,files:files.length,countedAnchors:receipt.countedAnchors,scratch}));
