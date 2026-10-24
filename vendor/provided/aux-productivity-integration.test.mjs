import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {eligibleTidyTabs,createTidyProposal,runProductivityPlan,productivitySections} from './aux-productivity-proposals.mjs';
import {prepareTidyProposal,commitProductivityAction,transformAuxProductivityUi,transformAuxProductivityDaemon} from './aux-productivity-integration.mjs';
import {transformAuxNavigation} from './aux-navigation-command-bar.mjs';
const snapshot={success:true,accountId:7,windowId:31,ownerGeneration:'generation',revision:'42',spaceId:'space',tabs:[
  {id:'a',title:'Docs',url:'https://example.test/docs?private=omitted',spaceId:'space'},
  {id:'b',title:'Docs copy',url:'https://example.test/docs?private=omitted',spaceId:'space'},
  {id:'pin',title:'Mail',url:'https://mail.test',spaceId:'space',pinned:true},
  {id:'other',title:'Other Space',url:'https://other.test',spaceId:'other'},
  {id:'protected',title:'Active form',url:'https://form.test',spaceId:'space',protected:true}]};
const plan={groups:[{title:'Research',tabIds:['a','b']}]};
test('proposal keeps duplicate URLs as distinct tabs and refuses unknown or repeated identities',()=>{
 let id=0;const p=createTidyProposal(snapshot,plan,()=>`id-${++id}`);
 assert.equal(p.moves.length,2);assert.deepEqual(p.moves.map(x=>x.tabId),['a','b']);assert.equal(p.expectedRevision,'42');assert.equal(p.windowId,31);
 assert.equal(eligibleTidyTabs(snapshot).length,2);
 assert.throws(()=>createTidyProposal(snapshot,{groups:[{title:'Bad',tabIds:['pin']}]},()=>''),/unknown/);
 assert.throws(()=>createTidyProposal(snapshot,{groups:[{title:'Bad',tabIds:['a','a']}]},()=>''),/duplicate/);
});
test('real dispatch requests only titles and origins, revalidates snapshot, and never applies before review',async()=>{
 let sent,shown;let id=0;const deps={snapshot:async()=>structuredClone(snapshot),account:async()=>({accountId:7,browserProfile:{profileId:'native-profile'}}),uuid:()=>`id-${++id}`,customPrompt:async()=>'',plan:async input=>{sent=input;return plan},cancel:async()=>{},show:async input=>{shown=input;return{success:true}},interval:()=>1,clearInterval:()=>{}};
 const result=await prepareTidyProposal(deps);assert.equal(result.phase,'review');assert.equal(shown.proposal.moves.length,2);
 assert.deepEqual(sent.tabs.map(t=>t.origin),['https://example.test','https://example.test']);assert.ok(!JSON.stringify(sent).includes('private='));
 let windows=0;await assert.rejects(prepareTidyProposal({...deps,snapshot:async()=>({...snapshot,windowId:++windows<3?31:32})}),/changed/);
 let n=0;await assert.rejects(prepareTidyProposal({...deps,snapshot:async()=>({...snapshot,revision:++n<3?'42':'43'})}),/changed/);
 await assert.rejects(prepareTidyProposal({...deps,account:async()=>({accountId:9})}),/Profile changed/);
});
test('provider path refuses hosted/fallback models, malformed output, and cancellation before completion',async()=>{
 const signal=new AbortController().signal,selection={provider:'custom',modelId:'model'},resolved={model:{provider:'custom',id:'model'}};
 let calls=0;const deps={signal,assertCurrent:()=>{},selection:async()=>selection,resolve:async()=>resolved,complete:async()=>{calls++;return{stopReason:'stop',content:[{type:'text',text:JSON.stringify(plan)}]}}};
 assert.deepEqual(await runProductivityPlan({tabs:eligibleTidyTabs(snapshot).map(t=>({...t,origin:'https://example.test'}))},deps),plan);
 await assert.rejects(runProductivityPlan({tabs:[]},{...deps,selection:async()=>({provider:'aux'})}),/own provider/);
 await assert.rejects(runProductivityPlan({tabs:[]},{...deps,resolve:async()=>({model:{provider:'other',id:'model'}})}),/unavailable/);
 await assert.rejects(runProductivityPlan({tabs:[]},{...deps,complete:async()=>({content:[{type:'text',text:'not json'}]})}),SyntaxError);
 const controller=new AbortController;controller.abort();await assert.rejects(runProductivityPlan({tabs:[]},{...deps,signal:controller.signal}));assert.equal(calls,1);
});
test('review applies native retained ID only and undo uses revision plus independent operation id',async()=>{
 const context={mode:'tidy',organizationProposal:{proposalId:'p',ownerGeneration:'g',moves:[{}],createFolders:[{}],summaryRows:[]}};
 let applied,undone;const api={applyOrganizationProposal:async input=>{applied=input;return{success:true,revision:'43',undoToken:'u'}},undoOrganization:async input=>{undone=input;return{success:true,revision:'44'}}};
 const result=await commitProductivityAction(api,context,null,{kind:'aux-tidy-apply'});assert.deepEqual(applied,{proposalId:'p'});
 const undo=await commitProductivityAction(api,context,result.receipt,{kind:'aux-tidy-undo'});assert.equal(undone.expectedRevision,'43');assert.equal(undone.ownerGeneration,'g');assert.ok(undone.operationId);assert.ok(undo.receipt.undone);
 assert.equal(productivitySections(context,result.receipt)[0].items[0].kind,'aux-tidy-undo');
});
test('counted transforms parse on actual supplied handlers and keep existing UI classes',()=>{
 const base='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux';
 const directory=mkdtempSync(join(tmpdir(),'aux-productivity-fixture-'));
 try{
  for(const relative of ['background.js','assets/tabsearch-3k_2hgil.js']) {
   const source=readFileSync(join(base,'apps/extension/dist',relative),'utf8');
   const navigation=transformAuxNavigation({relative,text:source}).text;
   const result=transformAuxProductivityUi({relative,text:navigation});assert.ok(result.anchors.length);
   if(relative==='background.js') {assert.ok(!result.text.includes('removeDuplicatesBeforePlan'));assert.ok(!result.text.includes('Sw("/tabs-tidy/plan"'));assert.ok(result.text.includes('D.models.productivityPlan.mutate'))}
   else assert.deepEqual([...result.text.matchAll(/className:"([^"]+)"/g)].map(x=>x[1]),[...source.matchAll(/className:"([^"]+)"/g)].map(x=>x[1]));
   const path=join(directory,relative.replaceAll('/','-')+'.mjs');writeFileSync(path,result.text);assert.equal(spawnSync(process.execPath,['--check',path],{encoding:'utf8'}).status,0);
  }
  const source=readFileSync(join(base,'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'),'utf8');
  const result=transformAuxProductivityDaemon({text:source});const path=join(directory,'daemon.mjs');writeFileSync(path,result.text);const check=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);
  assert.ok(result.text.includes('productivityPlan:accountProcedure.input'));assert.ok(result.text.includes('boundary.awaited'));assert.ok(result.text.includes('registerProducerStop(auxStopProductivityRequests)'));
 }finally{rmSync(directory,{recursive:true,force:true})}
});
