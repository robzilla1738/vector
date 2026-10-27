import {repoRoot} from '../../scripts/lib/repo-root.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {validDownloadStem,createFileReviewGuard,proposeDownloadName,runFileAction,filesSections,transformAuxFilesUi,transformAuxFilesDaemon} from './aux-productivity-files.mjs';
import {transformAuxNavigation} from './aux-navigation-command-bar.mjs';
import {transformAuxProductivityUi,transformAuxProductivityDaemon} from './aux-productivity-integration.mjs';
test('filename proposals reject paths, invisible controls and model/provider fallback without file content',async()=>{
 for(const name of ['', '../escape','hidden\u202ename','bad/name','a\\b','a:b','.hidden',' trailing '])assert.throws(()=>validDownloadStem(name));
 const controller=new AbortController();let sent;
 const deps={signal:controller.signal,assertCurrent(){},selection:async()=>({provider:'own',modelId:'selected'}),resolve:async()=>({model:{provider:'own',id:'selected'}}),complete:async(_model,context)=>{sent=context;return{content:[{type:'text',text:'{"stem":"October notes"}'}],stopReason:'stop'}}};
 assert.deepEqual(await proposeDownloadName({filename:'download.pdf',mime:'application/pdf',sourceHost:'example.test',path:'/must/not/send',contents:'must not send'},deps),{stem:'October notes'});
 assert.ok(!JSON.stringify(sent).includes('must'));await assert.rejects(proposeDownloadName({}, {...deps,selection:async()=>({provider:'aux'})}),/own provider/);
 await assert.rejects(proposeDownloadName({}, {...deps,resolve:async()=>({model:{provider:'own',id:'fallback'}})}),/unavailable/);
 controller.abort();await assert.rejects(proposeDownloadName({},deps));
});
test('suggestion remains editable and cannot apply a rename implicitly or after profile drift',async()=>{
 const context={success:true,generation:'review',mode:'commands'},state={view:'rename',prepared:{filename:'old.pdf',extension:'.pdf',capability:'cap',accountId:5,mime:'application/pdf',sourceHost:'example.test'}};
 let mutation=0;const api={getCommandContext:async()=>context,applyDownloadRename:async()=>{mutation++;return{success:true}}};
 const client={models:{downloadNameProposal:{mutate:async()=>({stem:'Suggested'})}}};
 assert.equal((await runFileAction(api,client,async()=>({accountId:5,browserProfile:{profileId:'native-profile'}}),context,state,'old',{kind:'aux-file-suggest'},()=>{})).text,'Suggested');assert.equal(mutation,0);
 await assert.rejects(runFileAction(api,client,async()=>({accountId:6}),context,state,'old',{kind:'aux-file-suggest'},()=>{}),/profile changed/);
 const sections=filesSections(context,state,'Chosen name',[]);assert.equal(sections[0].items[0].title,'Use Chosen name.pdf');
});
test('actual generation and opaque file capability reach native apply; unavailable native state remains an error',async()=>{
 let sent;const result=await runFileAction({applyDownloadRename:async input=>{sent=input;return{success:true,filename:'New.pdf',receiptId:'receipt'}}},null,null,{generation:'native-generation'},{prepared:{capability:'native-capability'}},'New',{kind:'aux-file-apply'});
 assert.deepEqual(sent,{generation:'native-generation',capability:'native-capability',stem:'New'});assert.equal(result.state.view,'renamed');
 await assert.rejects(runFileAction({listRecentFiles:async()=>({success:false,error:'Profile closed'})},null,null,{generation:'x'},null,'',{kind:'aux-files-open'}),/Profile closed/);
});
test('supplied command UI and paired daemon adapters compose and parse without changing CSS classes',()=>{
 const root=repoRoot+'/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux',dir=mkdtempSync(join(tmpdir(),'aux-files-'));
 try{
  const relative='assets/tabsearch-3k_2hgil.js',source=readFileSync(join(root,'apps/extension/dist',relative),'utf8');
  let text=transformAuxNavigation({relative,text:source}).text;text=transformAuxProductivityUi({relative,text}).text;text=transformAuxFilesUi({relative,text}).text;
  assert.deepEqual([...text.matchAll(/className:"([^"]+)"/g)].map(match=>match[1]),[...source.matchAll(/className:"([^"]+)"/g)].map(match=>match[1]));
  const files=[['search.mjs',text]];
  for(const name of ['index.mjs','aux-native-entry.mjs']){let text=readFileSync(join(root,'apps/daemon/Aux Daemon.app/Contents/Resources/node-development',name),'utf8');text=transformAuxProductivityDaemon({text}).text;text=transformAuxFilesDaemon({text}).text;files.push([name,text])}
  for(const [name,text] of files){const path=join(dir,name);writeFileSync(path,text);const parsed=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr)}
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('chosen file rows reveal or drag opaque IDs without invoking provider or download rename',async()=>{
 const context={success:true,generation:'owner',mode:'commands'},state={view:'list',files:[{id:'chosen:native-id',name:'notes.txt',source:'chosen',available:true,sourceHost:'Selected in Aux'}]};
 const row=filesSections(context,state,'',[])[1].items[0];assert.equal(row.actionLabel,'Show');
 let called;
 const api={revealRecentFile:async input=>{called=input;return{success:true}},prepareDownloadRename:()=>assert.fail('chosen files are not download rename targets')};
 assert.equal((await runFileAction(api,null,null,context,state,'',row)).state,state);
 assert.deepEqual(called,{generation:'owner',downloadId:'chosen:native-id'});
 await assert.rejects(runFileAction({...api,revealRecentFile:async()=>({success:false,error:'Attach it again'})},null,null,context,state,'',row),/Attach it again/);
});
test('changing a rename review cancels its provider request and rejects the late UI result',async()=>{
 let finish,started;
 const running=new Promise(resolve=>{started=resolve}),completion=new Promise(resolve=>{finish=resolve});
 const cancelled=[],guard=createFileReviewGuard(request=>{cancelled.push(request);return Promise.resolve()});
 const old=guard.begin(),context={success:true,generation:'owner',mode:'commands'};
 const prepared={filename:'old.pdf',extension:'.pdf',capability:'old-capability',accountId:5,mime:'application/pdf',sourceHost:'example.test'};
 const client={models:{downloadNameProposal:{mutate:async()=>{started();return completion}}}};
 const result=runFileAction({getCommandContext:async()=>context},client,
   async()=>({accountId:5,browserProfile:{profileId:'native-profile'}}),context,
   {view:'rename',prepared},'old',{kind:'aux-file-suggest'},old.setRequest);
 await running;
 const current=guard.begin();
 finish({stem:'Late old name'});
 const returned=await result;
 assert.equal(returned.text,'Late old name');
 assert.equal(old.isCurrent(),false);
 assert.equal(current.isCurrent(),true);
 assert.equal(cancelled.length,1);
 assert.equal(cancelled[0].profileId,'native-profile');
 // The supplied action handler checks this before setting state or input.
 assert.equal(old.isCurrent()?returned:null,null);
});
test('a review changed during account lookup never starts an uncancellable late provider request',async()=>{
 let finishAccount,started=0;
 const account=new Promise(resolve=>{finishAccount=resolve});
 const guard=createFileReviewGuard(()=>Promise.resolve()),old=guard.begin();
 const result=runFileAction({}, {models:{downloadNameProposal:{mutate:async()=>{started++;return {stem:'late'}}}}},
   ()=>account,{generation:'owner'},
   {prepared:{filename:'old.pdf',accountId:5}},'old',{kind:'aux-file-suggest'},old.setRequest);
 guard.begin();
 finishAccount({accountId:5,browserProfile:{profileId:'native-profile'}});
 await assert.rejects(result,/review changed/);
 assert.equal(started,0);
});
test('an obsolete finally callback cannot erase a newer request and cleanup fences pending actions',async()=>{
 const cancelled=[],guard=createFileReviewGuard(request=>{cancelled.push(request);return Promise.resolve()});
 const first=guard.begin();first.setRequest({requestId:'first'});
 const second=guard.begin();second.setRequest({requestId:'second'});
 first.setRequest(null);
 guard.invalidate();
 await Promise.resolve();
 assert.deepEqual(cancelled.map(request=>request.requestId),['first','second']);
 assert.equal(second.isCurrent(),false);
 // React can re-establish an effect after its cleanup; a new explicit action
 // works, while every action from the earlier effect remains stale.
 assert.equal(guard.begin().isCurrent(),true);
});
