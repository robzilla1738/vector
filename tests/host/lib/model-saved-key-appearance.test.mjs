import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {captureHomeState} from './home-capture.mjs';
import {readUtilityAppearanceJson} from './utility-appearance-owner.mjs';
const body=readFileSync(new URL('./model-saved-key-appearance.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace(/^export /gm,'');
function fixture(){
  const state={opened:false,menu:false,focused:false,settings:{modelApiKey:'••••••••',modelCredentialSource:'saved',modelConfigured:true,modelConnections:[{provider:'openai-compatible',credentialSource:'saved'}],modelProvider:'openai-compatible',compatibleEndpoint:'http://127.0.0.1:12345/v1',plannerModel:'fixture-model'},reads:[],actions:[],captures:[]};
  const app={pid:123,processObservation:{pid:123,generation:1},observeAppearance:async()=>JSON.stringify({producer:'aux-native-appearance-snapshot',version:1,pid:123,windowId:12,windowKind:'normal',observedAtUnixMs:Date.now()})};const ax={pid:123,windows:async()=>[{id:12,layer:0,width:900,height:700}],query:async s=>{
    if(s.name==='Search settings')return state.opened?[{name:s.name}]:[];
    if(s.name==='Reply to conversation')return [{value:'kept unsent draft',focused:state.focused}];
    if(s.name==='Provider API key')return [{role:'AXTextField',subrole:'AXSecureTextField'}];
    if(s.name==='Planner model')return [{value:'fixture-model'}];
    if(s.name==='Save key')return [{enabled:false}];
    if(s.name==='Remove saved key')return state.menu?[{enabled:true}]:[];
    return [{enabled:true}];
  },key:async key=>{state.actions.push(key);if(key==='command+,')state.opened=true;else if(state.menu)state.menu=false;else state.opened=false;},press:async s=>{state.actions.push(s.name);if(s.name==='Manage OpenAI-compatible')state.menu=true;},waitFor:async()=>{},focus:async()=>{state.focused=true;}};
  const t={app,ax,signal:new AbortController().signal,appearanceEnabled:true,fixture:{url:'http://127.0.0.1:12345'},model:{endpoint:'http://127.0.0.1:12345/v1',model:'fixture-model',calls:[]},rpc:async method=>{state.reads.push(method);if(method==='settings.get')return structuredClone(state.settings);if(method==='workspace.get')return {spaces:[]};assert.ok(['pages.list','runs.list'].includes(method));return [];},capture:async(name,options)=>{state.captures.push({name,options});return {name,...options};}};
  const pair={},endpointLease={},endpoint={endpoint:t.model.endpoint,model:t.model.model,reservation:'c'.repeat(64),observations:[]};
  const owner={pid:123,generation:1,process:{pid:123,generation:1},owner:{guardian:{records:[{status:'SAVED-RETAINED'}]}}};
  t.credentialPair=pair;t.credentialEndpoint=endpointLease;
  const {capture,requireMode}=new Function('assert','captureHomeState','readUtilityAppearanceJson','readDisposableCredentialApp','readDisposableModelCredentialEndpoint',body+'\nreturn {capture:captureModelSavedKeyAppearance,requireMode:requireModelSavedKeyAppearance};')
   (assert,captureHomeState,readUtilityAppearanceJson,(a,p,l)=>{assert.equal(a,app);assert.equal(p,pair);assert.equal(l,endpointLease);return structuredClone(owner);},l=>{assert.equal(l,endpointLease);return structuredClone(endpoint);});
  return {t,state,owner,endpoint,capture:()=>capture(t),requireMode};
}
test('saved-state original source helper returns actual UI envelope without Save/removal/provider use',async()=>{
 const f=fixture();const result=await f.capture();assert.equal(result.qualification,false);assert.equal(result.personSaveRemoveInvoked,false);assert.ok(result.ax.length);assert.equal(result.rpc.settings.modelCredentialSource,'saved');assert.equal(f.state.captures.length,2);
 assert.deepEqual(f.endpoint.observations,[]);assert.ok(!f.state.actions.includes('Save key')&&!f.state.actions.includes('Remove saved key'));assert.equal(f.state.opened,false);assert.equal(f.state.menu,false);assert.equal(f.state.focused,true);
});
test('missing original saved ACK or wrong mask/source refuses before Settings actions',async()=>{
 for(const fault of ['ack','mask','source']){const f=fixture();if(fault==='ack')f.owner.owner.guardian.records=[];if(fault==='mask')f.state.settings.modelApiKey=undefined;if(fault==='source')f.state.settings.modelCredentialSource='environment';await assert.rejects(f.capture());assert.deepEqual(f.state.actions,[]);}
});
test('same PID generation mutation and equal-shaped endpoint replacement refuse retained capture',async()=>{
 for(const fault of ['process','lease']){const f=fixture();f.t.capture=async()=>{if(fault==='process')f.t.app.processObservation.generation++;else f.t.credentialEndpoint={};return {};};await assert.rejects(f.capture(),AggregateError);}
});
test('unexpected secure value is not read and actionable saved removal stays explicit no-consent',async()=>{
 const f=fixture();const query=f.t.ax.query;let reads=0;const field={subrole:'AXSecureTextField'};Object.defineProperty(field,'value',{get(){reads++;throw new Error('no value read');}});f.t.ax.query=async s=>s.name==='Provider API key'?[field]:query(s);await assert.rejects(f.capture());assert.equal(reads,0);assert.equal(f.state.captures.length,0);
});
test('provider request, foreign native window and duplicate selection are not accepted',async()=>{
 for(const fault of ['request','window','duplicate']){const f=fixture();if(fault==='request')f.endpoint.observations.push({method:'GET'});if(fault==='window')f.t.app.observeAppearance=async()=>JSON.stringify({producer:'aux-native-appearance-snapshot',version:1,pid:123,windowId:12,windowKind:'private',observedAtUnixMs:Date.now()});if(fault==='duplicate'){const q=f.t.ax.query;f.t.ax.query=async s=>s.name==='Planner model'?[{},{}]:q(s);}await assert.rejects(f.capture());assert.equal(f.state.captures.length,0);}
});

test('actual fixed wrapper invokes its UI callback and returns the runner-required real helper observations',async()=>{
 const f=fixture(),order=[];
 const wrapper=readFileSync(new URL('../appearance-journeys/model-saved-key-appearance.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace(/^export /gm,'');
 const run=new Function('requireModelSavedKeyAppearance','captureModelSavedKeyAppearance','MODEL_SAVED_KEY_APPEARANCE_ID','configureOriginalDisposableCredentialModel',wrapper+'\nreturn run;')
 (f.requireMode,async t=>{order.push('capture');assert.equal(t,f.t);return f.capture();},'model-saved-key-appearance',async options=>{order.push('configure');assert.equal(options.app,f.t.app);assert.equal(options.pair,f.t.credentialPair);assert.equal(options.endpointLease,f.t.credentialEndpoint);});
 f.t.step=async(name,options,callback)=>{assert.equal(options.kind,'ui');const result=await callback();assert.ok(result.ax||result.rpc,'Original UI runner gate');assert.equal(result.rpc.settings.modelCredentialSource,'saved');};
 await run(f.t);assert.deepEqual(order,['configure','capture']);
 f.t.appearanceEnabled=false;await assert.rejects(run(f.t));assert.deepEqual(order,['configure','capture']);
});
