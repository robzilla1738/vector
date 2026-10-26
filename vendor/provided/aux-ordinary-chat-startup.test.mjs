import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { auxCreateLazyDesktopRepl, auxCaptureAgentStartAttempt, auxReportAgentStartFailure, transformAuxOrdinaryChatStartup } from './aux-ordinary-chat-startup.mjs';
import { transformAuxEventPolling } from './aux-event-poll-integration.mjs';
import { transformAuxFinalRuntimeIdentity } from './aux-final-runtime-identity.mjs';
import { upgradeCloudTransfers } from '../../docs/integration/proposed/completion-20261026/integration/transform.mjs';
const root='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development';
const source=readFileSync(root+'/index.mjs','utf8');
const begin=source.indexOf('function createCoreToolset('),end=source.indexOf('function createAgentToolset(',begin);

test('actual core toolset construction needs no privileged REPL; its first execution retains the native refusal',()=>{
  const transformed=transformAuxOrdinaryChatStartup({text:source}).text;
  const fn=transformed.slice(transformed.indexOf('function createCoreToolset('),transformed.indexOf('function createAgentToolset(',transformed.indexOf('function createCoreToolset(')));
  let constructed=0;
  const context=vm.createContext({auxCreateLazyDesktopRepl,createDesktopRepl:()=>{constructed++;throw Object.assign(Error('Synthetic native refusal'),{code:'AUX_SUPERVISED_TASKS_DISABLED'});},
    createReplTool:repl=>({name:'repl',execute:()=>repl.run('synthetic code')}),
    createReadFileTool:()=>({name:'read_file'}),createTerminalTool:()=>({name:'bash'}),createTerminalInteractTool:()=>({name:'bash_interact'}),createWebFetchTool:()=>({name:'webfetch'}),createWebSearchTool:()=>({name:'websearch'}),createGetTimeTool:()=>({name:'get_time'}),createMemoryReadTool:()=>({name:'memory_read'}),settings:()=>({}),isReadOnlySubagent:()=>false});
  new vm.Script(fn).runInContext(context);
  const tools=context.createCoreToolset({browser:{},session:{id:'synthetic',permissionMode:'read-only'},settings:{get:()=>({})}});
  assert.equal(constructed,0);assert.equal(tools.length,8);
  assert.throws(()=>tools[0].execute(),error=>error.code==='AUX_SUPERVISED_TASKS_DISABLED');assert.equal(constructed,1);
  tools[0].dispose();assert.throws(()=>tools[0].execute(),/closed/);assert.equal(constructed,1);
});

test('unused and initialized lazy resources dispose without constructing or settling a different lifetime',async()=>{
  let constructed=0,disposed=0,finish;
  const pending=new Promise(resolve=>{finish=resolve;});
  const unused=auxCreateLazyDesktopRepl(()=>{constructed++;return{};});unused.dispose();assert.equal(constructed,0);
  const repl=auxCreateLazyDesktopRepl(()=>{constructed++;return{run:input=>'result:'+input,dispose:()=>{disposed++;return pending;}};});
  assert.equal(repl.run('one'),'result:one');assert.equal(repl.run('two'),'result:two');assert.equal(constructed,1);
  assert.equal(repl.dispose(),pending);assert.equal(repl.dispose(),pending);assert.equal(disposed,1);finish();await pending;
});

test('early startup failure changes only its exact idle unarchived attempt, including late same-timestamp completion',()=>{
  const owner={id:0,createdAt:123,incarnationId:'original'},writes=[];let current={...owner};
  let session={id:'fixture',status:'idle',createdAt:1000,updatedAt:2000,archivedAt:null,systemPrompt:'before'},revision=0,turns=[];
  const context=vm.createContext({AccountRegistry:{getAccount:()=>current},SessionStore:{get:()=>({...session}),listTurnOverviews:()=>({transcriptRevision:revision,turns}),update:(...args)=>writes.push(args)},TRPCError:class extends Error{constructor(input){super(input.message);this.code=input.code;}}});
  new vm.Script(auxCaptureAgentStartAttempt.toString()+'\n'+auxReportAgentStartFailure.toString()).runInContext(context);
  const attempt=context.auxCaptureAgentStartAttempt(0,'fixture');session.systemPrompt='prepared by this initializer';
  assert.throws(()=>context.auxReportAgentStartFailure(0,'fixture',owner,attempt,{code:'AUX_SUPERVISED_TASKS_DISABLED',message:'must-not-relay-secret-payload'}),error=>error.code==='PRECONDITION_FAILED'&&!error.message.includes('must-not-relay'));
  assert.equal(writes.length,1);assert.equal(writes[0][2].status,'errored');
  // A newer run can complete back to idle within the same SQLite second.
  // Its transcript revision/turn, not the unchanged timestamp, protects it.
  revision=2;turns=[{id:'newer-turn',status:'completed'}];
  assert.throws(()=>context.auxReportAgentStartFailure(0,'fixture',owner,attempt,Error('late initializer failure')),/could not initialize/);
  assert.equal(writes.length,1);
  revision=0;turns=[];session.archivedAt=3000;
  assert.throws(()=>context.auxReportAgentStartFailure(0,'fixture',owner,attempt,Error('archived meanwhile')));assert.equal(writes.length,1);
  session.archivedAt=null;current={...owner,incarnationId:'replacement'};
  assert.throws(()=>context.auxReportAgentStartFailure(0,'fixture',owner,attempt,Error('private error body')));assert.equal(writes.length,1);
});

test('both complete current successor leaves preserve execution guard and parse with the lazy startup/error join',()=>{
  for(const file of ['index.mjs','aux-native-entry.mjs']){
    const raw=readFileSync(root+'/'+file,'utf8'),cloud=upgradeCloudTransfers(raw).text,identity=transformAuxFinalRuntimeIdentity({component:'daemon',path:file,text:cloud}).text,events=transformAuxEventPolling({text:identity}).text;
    const result=transformAuxOrdinaryChatStartup({text:events});assert.equal(result.anchors.length,3);
    const guard=raw.slice(raw.indexOf('function auxRequireSupervisedTasks('),raw.indexOf('\nlet auxMemoryV2SeedPending'));
    assert.ok(result.text.includes(guard));assert.ok(result.text.includes('function createDesktopRepl(Cn){auxRequireSupervisedTasks();'));
    execFileSync(process.execPath,['--check','--input-type=module'],{input:result.text});
    assert.throws(()=>transformAuxOrdinaryChatStartup({text:result.text,source:events}),/repeated/);
  }
});
