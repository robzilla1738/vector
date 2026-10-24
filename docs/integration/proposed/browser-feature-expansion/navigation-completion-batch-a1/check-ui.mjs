import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {transformAuxBrowserFeatureUi} from '../../../../../vendor/provided/aux-browser-feature-composition.mjs';
import {NAVIGATION_ASSETS} from '../../../../../vendor/provided/aux-navigation-command-bar.mjs';

const here=new URL('./',import.meta.url);
const baseline='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux/apps/extension/dist/';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=[];
for(const relative of Object.values(NAVIGATION_ASSETS)){
  const text=await readFile(baseline+relative,'utf8');
  const result=transformAuxBrowserFeatureUi({relative,text});
  let replay=text;
  for(const anchor of result.anchors){
    assert.equal(replay.split(anchor.find).length-1,anchor.count);
    replay=replay.split(anchor.find).join(anchor.replace);
  }
  assert.equal(replay,result.text);
  const checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:result.text,encoding:'utf8'});
  assert.equal(checked.status,0,checked.stderr);
  const classes=[...text.matchAll(/className:"([^"]*)"/g)].map(match=>match[1]);
  const after=[...result.text.matchAll(/className:"([^"]*)"/g)].map(match=>match[1]);
  for(const value of classes)assert.ok(after.includes(value),relative+': missing supplied class');
  if(relative===NAVIGATION_ASSETS.search){
    assert.ok(result.text.includes('kind:"new-blank-tab"')||result.text.includes("kind:'new-blank-tab'"));
    assert.ok(result.text.includes('n.kind==="aux-new-blank-tab"'));
  }
  files.push({relative,inputSha256:hash(text),outputSha256:hash(result.text),
    countedAnchors:result.anchors.length,syntaxPassed:true,suppliedClassNamesPreserved:true});
}
const receipt={format:'aux.navigation-completion.ui-composition.actual.v1',passed:true,
  baseline,adapterSha256:hash(await readFile(new URL('../../../../../vendor/provided/aux-navigation-command-bar.mjs',import.meta.url))),
  files,fullFeatureComposition:true,assetsOrStylesEdited:false,
  productExecuted:false,runtimeAccepted:false};
await writeFile(new URL('actual-ui-composition-a1.json',here),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
