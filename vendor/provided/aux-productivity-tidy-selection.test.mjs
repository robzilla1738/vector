import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
import {transformAuxProductivityUi,prepareTidyProposal} from './aux-productivity-integration.mjs';
import {createTidyProposal,eligibleTidyTabs,validateTidyPlan} from './aux-productivity-proposals.mjs';
import {transformAuxNavigation} from './aux-navigation-command-bar.mjs';
import {transformAuxTidySelection,assertNativeTidyScope} from './aux-productivity-tidy-selection.mjs';
const base='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux/apps/extension/dist/';
test('actual supplied background and review compose once without CSS changes',()=>{
 for(const relative of ['background.js','assets/tabsearch-3k_2hgil.js']){
  let text=readFileSync(base+relative,'utf8');if(relative.includes('tabsearch'))text=transformAuxNavigation({relative,text}).text;
  text=transformAuxProductivityUi({relative,text}).text;const result=transformAuxTidySelection({relative,text});
  assert.deepEqual([...result.text.matchAll(/className:"([^"]*)"/g)].map(m=>m[1]),[...text.matchAll(/className:"([^"]*)"/g)].map(m=>m[1]));
  const checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:result.text,encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
  assert.throws(()=>transformAuxTidySelection({relative,text:result.text}),/expected one/);
 }
});
test('selected native snapshot limits real producer metadata and reviewed moves; stale scope refuses',async()=>{
 const snapshot={success:true,scopeToken:'native-token',scope:'selected-tabs',accountId:1,windowId:4,ownerGeneration:'epoch',revision:'2',spaceId:'space',tabs:[{id:'a',spaceId:'space',url:'https://example.test/a'},{id:'b',spaceId:'space',url:'https://example.test/b'}]};
 const original=[eligibleTidyTabs,validateTidyPlan,createTidyProposal,prepareTidyProposal].map(f=>f.toString()).join('\n');
 // Apply the same exact producer replacements exercised on real bundled source.
 let source=original;const transformed=transformAuxTidySelection({relative:'background.js',text:transformAuxProductivityUi({relative:'background.js',text:readFileSync(base+'background.js','utf8')}).text});
 for(const edit of transformed.anchors)if(edit.find&&source.includes(edit.find))source=source.replace(edit.find,edit.replace);
 const prepare=new Function('assertNativeTidyScope',source+';return prepareTidyProposal')(assertNativeTidyScope);
 let sent,shown;const deps={snapshot:async()=>structuredClone(snapshot),account:async()=>({accountId:1,browserProfile:{profileId:'p'}}),uuid:()=>crypto.randomUUID(),customPrompt:async()=>'',plan:async input=>(sent=input,{groups:[{title:'Chosen',tabIds:['a','b']}]}),cancel:async()=>{},show:async input=>(shown=input,{success:true}),interval:()=>1,clearInterval:()=>{}};
 await prepare(deps);assert.deepEqual(sent.tabs.map(t=>t.id),['a','b']);assert.equal(shown.proposal.scopeToken,'native-token');assert.equal(shown.proposal.scope,'selected-tabs');
 await assert.rejects(prepare({...deps,plan:async()=>({groups:[{title:'Injected',tabIds:['unselected']} ]})}),/unknown/);
 let reads=0;await assert.rejects(prepare({...deps,snapshot:async()=>({...snapshot,scopeToken:++reads>1?'changed':'native-token'})}),/changed/);
 assert.throws(()=>assertNativeTidyScope({...snapshot,scopeToken:''}),/Choose/);
});
