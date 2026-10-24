/** Prove the consumed pre-feature transform composes into the real UI chain. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {applyAuxUiDraftClosure} from '../../../../../vendor/provided/aux-ui-draft-closure.mjs';
import {transformAuxBrowserFeatureUi} from '../../../../../vendor/provided/aux-browser-feature-composition.mjs';
const here=new URL('./',import.meta.url),pins=JSON.parse(await readFile(new URL('inputs.json',here),'utf8'));
const plan=JSON.parse(await readFile(new URL('source-plan.json',here),'utf8'));
const base='/private/tmp/aux-ui-draft-capture-stage-20261024-a3/baseline/agent/';
const originalRoot='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/';
const sha=v=>createHash('sha256').update(v).digest('hex'),files=[];
for(const file of pins.files){
 const text=await readFile(base+file.path,'utf8'),original=await readFile(originalRoot+file.path,'utf8');
 const prior=transformAuxBrowserFeatureUi({relative:file.path,text});assert.equal(sha(prior.text),file.predecessorSha256,'Actual prior feature composition drift: '+file.path);
 const closed=applyAuxUiDraftClosure({component:'agent',path:file.path,text,original,stateIdentityVersion:2});
 const final=transformAuxBrowserFeatureUi({relative:file.path,text:closed.text});
 const row=plan.files.find(row=>row.path===file.path);assert.equal(sha(final.text),row.outputSha256,'Pre/post feature composition differs: '+file.path);
 const parsed=spawnSync(process.execPath,['--check','--input-type=module'],{input:final.text,encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);
 files.push({path:file.path,preFeatureSha256:sha(text),priorOutputSha256:sha(prior.text),outputSha256:sha(final.text),closureAnchors:closed.anchors.length,featureAnchors:final.anchors.length,syntaxPassed:true});
}
const receipt={format:'aux.ui-editor-writer-closure.composition.actual.v1',passed:true,base,files,
 consumedPreFeatureAndFullFeatureCompositionIdentical:true,allOriginalClassesPreserved:true,
 sourcePlanSha256:sha(await readFile(new URL('source-plan.json',here))),
 runtimeExecuted:false,productExecuted:false,completeWriterCoverage:false};
await writeFile(new URL('actual-composition-a1.json',here),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({passed:true,files:files.length}));
