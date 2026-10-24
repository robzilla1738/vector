import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxUiBackgroundWriterClosure} from '../../../../../vendor/provided/aux-ui-background-writer-closure.mjs';
const here=new URL('./',import.meta.url),pins=JSON.parse(await readFile(new URL('inputs.json',here),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex'),text=await readFile(pins.predecessor,'utf8');
assert.equal(sha(text),pins.predecessorSha256);
const input={relative:'background.js',text,stateIdentityVersion:2},result=transformAuxUiBackgroundWriterClosure(input);
let replay=text;for(const anchor of result.anchors){assert.equal(replay.split(anchor.find).length-1,anchor.count);replay=replay.split(anchor.find).join(anchor.replace)}assert.equal(replay,result.text);
assert.equal(transformAuxUiBackgroundWriterClosure({...input,stateIdentityVersion:1}).text,text);
assert.throws(()=>transformAuxUiBackgroundWriterClosure({...input,text:result.text}),/Repeated/);
assert.throws(()=>transformAuxUiBackgroundWriterClosure({...input,text:'unreviewed'}),/Unreviewed/);
const checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:result.text,encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
assert.deepEqual([...result.text.matchAll(/className:\s*"([^"]*)"/g)].map(x=>x[1]),[...text.matchAll(/className:\s*"([^"]*)"/g)].map(x=>x[1]));
const scratch=await mkdtemp('/private/tmp/aux-ui-background-writer-closure-');await writeFile(scratch+'/background.js',result.text);
await mkdir(new URL('source/',here),{recursive:true});const output=new URL('source/background.js',here);await writeFile(output,result.text);
const shared=[];
for(const [path,find,replace]of[
 ['vendor/provided/aux-browser-feature-composition.mjs',"import { transformAuxNavigation } from './aux-navigation-command-bar.mjs';", "import { transformAuxUiBackgroundWriterClosure } from './aux-ui-background-writer-closure.mjs';\nimport { transformAuxNavigation } from './aux-navigation-command-bar.mjs';"],
 ['vendor/provided/aux-browser-feature-composition.mjs',"? applyAuxBrowserRouting({...value, component:'agent'}) : {text:value.text, anchors:[]}]);", "? applyAuxBrowserRouting({...value, component:'agent'}) : {text:value.text, anchors:[]},\n    value => transformAuxUiBackgroundWriterClosure({...value, stateIdentityVersion:input.stateIdentityVersion})]);"],
 ['scripts/stage-provided.mjs','return transformAuxBrowserFeatureUi({relative: input.path, text: input.text});','return transformAuxBrowserFeatureUi({relative: input.path, text: input.text, stateIdentityVersion});']
]){
 const source=await readFile(new URL('../../../../../'+path,here),'utf8');assert.equal(source.split(find).length-1,1);
 shared.push({path,inputSha256:sha(source),find,replace,count:1});
}
const receipt={format:'aux.ui-background-writer-closure.projection.actual.v1',passed:true,baselineCommit:pins.baselineCommit,
 path:'background.js',inputSha256:sha(text),output:output.pathname,outputSha256:sha(result.text),anchors:result.anchors,
 countedRules:result.anchors.length,literalMatches:result.anchors.reduce((n,a)=>n+a.count,0),scratch,
 sharedCompositionRequests:shared,sourceVersion:'1.26.1016.1852',stateV1Unchanged:true,originalClassesPreserved:true,
 sourceAndStageUnchanged:true,nativeExecuted:false,productExecuted:false,completeWriterCoverage:false,runtimeAccepted:false};
await writeFile(new URL('source-plan.json',here),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({passed:true,rules:receipt.countedRules,literalMatches:receipt.literalMatches,scratch}));
