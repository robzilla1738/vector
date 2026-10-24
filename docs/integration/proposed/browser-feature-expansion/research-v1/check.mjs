import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxResearchDaemon,researchRuntimeSource} from './source/aux-research-daemon.mjs';
import {transformAuxResearchUi} from './source/aux-research-ui.mjs';
const sha=text=>createHash('sha256').update(text).digest('hex');
const base='/private/tmp/aux-browser-features-async-daemon-20261023-a1';
const stage='/Users/rcourson/Documents/Vibe/web/out/browser-feature-stage-pair-20261023-a4/desktop-v1/ui/agent';
const tmp=mkdtempSync(join(tmpdir(),'aux-research-source-'));
const daemonInputs=[],uiInputs=[];
function replay(input,result){let text=input;for(const p of result.changes){assert.equal(text.split(p.find).length-1,p.count);text=text.replace(p.find,p.replace)}assert.equal(text,result.text)}
function syntax(text,name){const path=join(tmp,name+'.mjs');writeFileSync(path,text);const run=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(run.status,0,run.stderr)}
try{
 for(const [kind,path] of [['source',base+'/index.mjs'],['entry',base+'/projected-entry/aux-native-entry.mjs']]){
  const input=readFileSync(path,'utf8'),result=transformAuxResearchDaemon(input);replay(input,result);syntax(result.text,kind);
  daemonInputs.push({kind,inputSha256:sha(input),outputSha256:sha(result.text),changes:result.changes.map(p=>({count:p.count,findSha256:sha(p.find),replaceSha256:sha(p.replace)}))});
 }
 for(const name of ['session-composer-Dc0LRfZA.js','ask-omnibox-panel-DkxXbN8c.js']){
  const path='assets/'+name,input=readFileSync(join(stage,path),'utf8'),result=transformAuxResearchUi(input,path);replay(input,result);syntax(result.text,name);
  uiInputs.push({path,inputSha256:sha(input),outputSha256:sha(result.text),changes:result.changes.length});
 }
 // Execute only the extracted new helper in a synthetic owner, never product code.
 let searches=0,requests=0,controller,bodyRelease,bodyStarted,abortObserved=false;
 const persisted=[];
 const context=vm.createContext({URL,AbortController,Date,JSON,Error,Map,Set,console,crypto:{randomUUID:()=> 'synthetic-run'},EMPTY_USAGE$1:{input:0,output:0},toToolDeclaration:tool=>({name:tool.name,description:tool.description,parameters:tool.parameters}),init_models(){},init_google_search(){},models:()=>({resolve:async(id,provider)=>({model:{id,provider}})}),auxBrokerBoundary:()=>({assertOwner(){},registerProducerStop(){},awaited:fn=>fn()}),AccountRegistry:{getAccount:()=>({id:7})},auxCreateProductivityAccountGuard:(_id,_account,_profile,c)=>{controller=c;return{assertCurrent(){c.signal.throwIfAborted()},dispose(){}}},auxValidateReferenceMessages:async()=>{},withReplContext:async(_context,fn)=>fn(),GoogleSearchClient:class{constructor(browser){this.browser=browser}async search(){searches++;const response=await this.browser.fetch('https://search.example/query',{});await response.text();return[{url:'https://evidence.example/article',title:'Observed source',snippet:'Observed excerpt'},{url:'javascript:bad()',title:'Unsafe'}]}}});
 vm.runInContext(researchRuntimeSource,context);
 const helpers=vm.runInContext('({auxRunResearchSession,auxObservedResearchSources,auxResearchCapability})',context);
 const binding={profileId:'profile-one',windowId:9,anchorTargetId:'target-one'};
 const makeOwner=()=>{
  const agent={state:{model:{api:'synthetic',provider:'owner-provider',id:'owner-model'},tools:[{name:'websearch',parameters:{},execute(){throw Error('Original hosted search must not run')}}]},prepareRequest:async r=>r,processEvents:async e=>persisted.push(e),abort(){this.abortController?.abort(Error('cancelled'))}};
  const owner={accountId:7,session:{browserBinding:binding,model:{provider:'owner-provider',modelId:'owner-model'}},agent,browser:{extensionBridgeRoute:{accountId:7,profileId:'profile-one'},fetch:async(_url,options)=>({text:async()=>{if(bodyStarted){bodyStarted();await new Promise(resolve=>{bodyRelease=resolve;options.signal.addEventListener('abort',()=>{abortObserved=true},{once:true})});options.signal.throwIfAborted()}return '<synthetic only>'}})},prompt:async function(){agent.abortController=new AbortController();const request={context:{messages:[]}};const result=await agent.prepareRequest(request,agent.abortController.signal);assert.equal(result.context.messages.filter(m=>m.role==='toolResult').length,1);requests++;assert.equal(result.context.tools.length,1);const cached=await result.context.tools[0].execute('model-call',{objective:'explicit test query',search_queries:['explicit test query']});assert.equal(cached.details.sources.length,1);await assert.rejects(result.context.tools[0].execute('model-call',{objective:'another',search_queries:['another']}));await agent.prepareRequest(result,agent.abortController.signal);await agent.processEvents({type:'message_end',message:{role:'assistant',stopReason:'stop',content:[{type:'text',text:'Synthetic answer'}]}})}};
  return owner;
 };
 let owner=makeOwner(),originalPrepare=owner.agent.prepareRequest,originalProcess=owner.agent.processEvents;
 await helpers.auxRunResearchSession(owner,[],{query:'explicit test query'});
 assert.equal(searches,1);assert.equal(requests,1);assert.equal(owner.agent.prepareRequest,originalPrepare);assert.equal(owner.agent.processEvents,originalProcess);
 const result=persisted.find(e=>e.type==='message_end'&&e.message.role==='toolResult').message;
 assert.equal(result.details.sources.length,1);assert.equal(result.details.sources[0].url,'https://evidence.example/article');
 assert.match(persisted.at(-1).message.content.at(-1).text,/Searched sources.*research-synthetic-run-1/);
 assert.equal((await helpers.auxResearchCapability(7,{id:7},{browserBinding:binding,model:{provider:'aux',modelId:'hosted'}})).available,false);
 // Cancellation must not resolve the reader lifetime early or publish its result.
 persisted.length=0;owner=makeOwner();let started;const ready=new Promise(r=>started=r);bodyStarted=started;
 let settled=false;const work=helpers.auxRunResearchSession(owner,[],{query:'cancel query'}).finally(()=>settled=true);work.catch(()=>{});
 await ready;owner.agent.abort();await new Promise(r=>setImmediate(r));assert.equal(abortObserved,true);assert.equal(settled,false);bodyRelease();await assert.rejects(work);assert.equal(persisted.some(e=>e.message?.role==='toolResult'),false);assert.equal(requests,1);
 const files=['source/aux-research-daemon.mjs','source/research-runtime.js','source/aux-research-ui.mjs','source/research-ui.js'];
 const sourceFiles=files.map(path=>({path,sha256:sha(readFileSync(new URL(path,import.meta.url)))}));
 writeFileSync(new URL('manifest.json',import.meta.url),JSON.stringify({schema:1,daemonInputs,uiInputs,sourceFiles,integration:'post-async ordinary and independent dormant entry; UI after existing browser-feature transforms',runtimeVerified:false,providerCalled:false},null,2)+'\n');
 writeFileSync(new URL('check-result.json',import.meta.url),JSON.stringify({passed:true,checks:['counted ordinary/dormant replay and syntax','composed actual Agent UI replay and syntax','search once across request preparation retry','observed sources only; unsafe URLs excluded','deterministic original-citation footer','Aux hosted-provider refusal','cancellation aborts fetch and waits for physical body settlement; no late source persistence','per-session callbacks restored'],appExecuted:false,providerCalled:false,nativeBuilt:false},null,2)+'\n');
 console.log('Focused research boundary/source checks passed. No product or provider execution.');
}finally{rmSync(tmp,{recursive:true,force:true})}
