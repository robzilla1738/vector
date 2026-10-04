import {test} from 'node:test';
import {run as runSuccess} from '../appearance-journeys/model-probe-success-appearance.mjs';
import {run as runFailure} from '../appearance-journeys/model-probe-failure-appearance.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';
import {createFixture} from './fixture.mjs';
import {captureSuccessfulModelProbeAppearance,captureRejectedModelProbeAppearance,requireModelProbeAppearance} from './model-probe-appearance.mjs';
async function context(){
 const server=await createFixture(),controller=new AbortController(),root=mkdtempSync('/tmp/aux-native-journey-'),data=join(root,'profile');mkdirSync(data,{mode:0o700});
 const state={settings:{modelConfigured:false},opened:false,testing:false,details:false,focus:false,actions:[],captures:[],work:undefined,probeError:''};
 const app={pid:123,profileRoot:root,userDataDir:data,processObservation:{pid:123,generation:1,launchKind:'child',exitCode:null,signal:null,spawnError:null,exitStatusAvailable:false},observeAppearance:async()=>JSON.stringify({producer:'aux-native-appearance-snapshot',version:1,pid:123,windowId:12,windowKind:'normal',observedAtUnixMs:Date.now()})};
 const ax={pid:123,windows:async()=>[{id:12,layer:0,width:900,height:700}],query:async selector=>{
   assert.equal(Object.hasOwn(selector,'index'),false);
   if(selector.name==='Search settings')return state.opened?[{}]:[];
   if(selector.name==='Reply to conversation')return [{value:'kept original draft',focused:state.focus}];
   if(selector.name==='Testing…')return state.testing?[{enabled:false}]:[];
   if(selector.name==='Owned synthetic probe unavailable')return state.details&&state.probeError?[{}]:[];
   return [{enabled:true}];
 },focus:async()=>{state.focus=true;},key:async key=>{state.actions.push(key);state.opened=key==='command+,';},press:async selector=>{
   state.actions.push(selector.name);if(selector.name==='Connection test details'){state.details=true;return;}
   if(selector.name!=='Test connection')return;state.testing=true;
   state.work=(async()=>{
     const input={model:state.settings.plannerModel,messages:[{role:'system',content:'You answer probes with strict JSON.'},{role:'user',content:'Return {"ok":true}'}]};
     const call=async()=>{const response=await fetch(`${state.settings.compatibleEndpoint}/chat/completions`,{method:'POST',signal:controller.signal,headers:{'content-type':'application/json',authorization:'Bearer aux-local'},body:JSON.stringify(input)});return {response,body:await response.json()};};
     const first=await call();
     if(first.response.ok){assert.deepEqual(JSON.parse(first.body.choices[0].message.content),{ok:true});input.messages=[{role:'system',content:''},{role:'user',content:[{type:'text',text:'What color dominates this image? One word.'},{type:'image_url',image_url:{url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='}}]}];assert.equal((await call()).body.choices[0].message.content,'blue');}
     else state.probeError=first.body.error.message;
     state.settings.modelProbe={provider:'openai-compatible',modelId:input.model,ok:first.response.ok,checkedAt:Date.now(),...(first.response.ok?{vision:true}:{})};state.testing=false;
   })();state.work.catch(()=>{});
 },waitFor:async selector=>{if(selector.name==='Test connection'&&state.work)await state.work;}};
 const t={step:async(name,options,action)=>{const observations=await action();assert.ok(options.kind==='ui');assert.ok(state.actions.length>0);assert.ok(observations?.ax&&observations?.rpc,'UI step needs AX and RPC/native observations');return observations;},app,ax,fixture:server,model:undefined,signal:controller.signal,appearanceEnabled:true,
   rpc:async(method,patch)=>{
     if(method==='settings.get')return structuredClone(state.settings);
     if(method==='settings.set'){assert.deepEqual(Object.keys(patch).sort(),['compatibleEndpoint','modelProvider','plannerModel']);Object.assign(state.settings,patch,{modelConfigured:true});return true;}
     if(method==='workspace.get')return {spaces:[]};assert.ok(['pages.list','runs.list'].includes(method));return [];
   },until:async(_,predicate)=>{const deadline=Date.now()+4000;while(!(await predicate())){assert.ok(Date.now()<deadline);await wait(5);}},
   capture:async(name,options)=>{state.captures.push({name,options});return {name,...options};}};
 return {t,state,async dispose(){controller.abort();await state.work?.catch(()=>{});await server.close();rmSync(root,{recursive:true,force:true});}};
}
test('probe appearance requires its fixed paired mode',()=>{for(const journeyId of ['model-probe-success-appearance','model-probe-failure-appearance'])requireModelProbeAppearance({journeyId,appearance:true,pair:{}});assert.throws(()=>requireModelProbeAppearance({journeyId:'anything',appearance:true,pair:{}}));assert.throws(()=>requireModelProbeAppearance({journeyId:'model-probe-success-appearance',appearance:false,pair:{}}));});
test('successful source sequence retains actual HTTP receipts and intentional Profile mutation', {timeout:10000},async()=>{const c=await context();try{const result=await runSuccess(c.t);assert.equal(result.qualification,false);assert.equal(result.disposableProfileMutationRetained,true);assert.equal(result.modelProbe.ok,true);assert.ok(result.ax&&result.rpc);assert.equal(result.rpc.settings.modelProbe.ok,true);assert.deepEqual(result.http.map(row=>row.kind),['structured','vision']);assert.equal(result.http.length,2);assert.ok(result.http.every(row=>row.state==='delivered'));assert.equal(result.captures.length,2);assert.equal(c.state.opened,false);assert.equal(c.state.focus,true);assert.ok(result.nativeSamples.length>=3);}finally{await c.dispose();}});
test('rejected source sequence retains genuine HTTP503 and expands only its original Details', {timeout:10000},async()=>{const c=await context();try{const result=await runFailure(c.t);assert.equal(result.modelProbe.ok,false);assert.equal(result.http.length,1);assert.equal(result.http[0].status,503);assert.equal(result.captures.length,3);assert.ok(c.state.actions.includes('Connection test details'));assert.equal(c.state.opened,false);}finally{await c.dispose();}});
test('native owner retirement during pending capture retains original App/Profile debt without guessing replacement', {timeout:10000},async()=>{const c=await context();try{c.t.capture=async()=>{c.t.app={...c.t.app};return {};};await assert.rejects(()=>captureSuccessfulModelProbeAppearance(c.t),reason=>{assert.ok(reason instanceof AggregateError);assert.equal(reason.ownedProbeAppearance.app.pid,123);assert.equal(reason.originalProbeStarted,true);assert.equal(reason.originalProbeCompleted,false);return true;});assert.equal(c.state.opened,true);}finally{await c.dispose();}});

test('same refs and PID with mutated original process generation refuses probe capture', {timeout:10000},async()=>{const c=await context();try{c.t.capture=async()=>{c.t.app.processObservation.generation++;return {};};await assert.rejects(()=>captureSuccessfulModelProbeAppearance(c.t),reason=>reason instanceof AggregateError&&reason.originalProbeStarted===true);assert.equal(c.state.opened,true);}finally{await c.dispose();}});
