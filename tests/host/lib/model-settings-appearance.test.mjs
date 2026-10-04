import {test} from 'node:test';
import {run as runSettings} from '../appearance-journeys/model-settings-appearance.mjs';
import assert from 'node:assert/strict';
import {captureModelSettingsAppearance,requireModelSettingsAppearance,MODEL_SETTINGS_APPEARANCE_ID} from './model-settings-appearance.mjs';
function fixture(){
  const state={opened:false,menu:false,focused:false,settings:{modelProvider:'openai-compatible',compatibleEndpoint:'http://127.0.0.1:12345/v1',plannerModel:'fixture-model'},reads:[],actions:[],captures:[]};
  const app={pid:123,processObservation:{pid:123,generation:1,launchKind:'child'},observeAppearance:async()=>JSON.stringify({producer:'aux-native-appearance-snapshot',version:1,pid:123,windowId:12,windowKind:'normal',observedAtUnixMs:Date.now()})};const ax={pid:123,windows:async()=>[{id:12,layer:0,width:900,height:700}],query:async s=>{
    if(s.name==='Search settings')return state.opened?[{name:s.name}]:[];
    if(s.name==='Reply to conversation')return [{value:'kept unsent draft',focused:state.focused}];
    if(s.name==='Provider API key')return [{role:'AXTextField',subrole:'AXSecureTextField'}];
    if(s.name==='Planner model')return [{value:'fixture-model'}];
    if(s.name==='Save key')return [{enabled:false}];
    if(s.name==='Remove saved key')return state.menu?[{enabled:false}]:[];
    return [{enabled:true}];
  },key:async key=>{state.actions.push(key);if(key==='command+,')state.opened=true;else if(state.menu)state.menu=false;else state.opened=false;},press:async s=>{state.actions.push(s.name);if(s.name==='Manage OpenAI-compatible')state.menu=true;},waitFor:async()=>{},focus:async()=>{state.focused=true;}};
  const t={step:async(name,options,action)=>{const observations=await action();assert.equal(options.kind,'ui');assert.ok(state.actions.length>0);assert.ok(observations?.ax&&observations?.rpc,'UI step needs AX and RPC/native observations');return observations;},app,ax,signal:new AbortController().signal,appearanceEnabled:true,fixture:{url:'http://127.0.0.1:12345'},model:{endpoint:'http://127.0.0.1:12345/v1',model:'fixture-model',calls:[]},rpc:async(method,patch)=>{state.reads.push(method);if(method==='settings.set'){assert.deepEqual(patch,{modelProvider:state.settings.modelProvider,compatibleEndpoint:state.settings.compatibleEndpoint,plannerModel:state.settings.plannerModel});return {ok:true};}if(method==='settings.get')return structuredClone(state.settings);if(method==='workspace.get')return {spaces:[]};assert.ok(['pages.list','runs.list'].includes(method));return [];},capture:async(name,options)=>{state.captures.push({name,options});return {name,...options};}};
  return {t,state};
}
test('exact fixed appearance admission refuses unpaired/generic modes',()=>{
  requireModelSettingsAppearance({journeyId:MODEL_SETTINGS_APPEARANCE_ID,appearance:true,pair:{}});
  for(const input of [{journeyId:'models',appearance:true,pair:{}},{journeyId:MODEL_SETTINGS_APPEARANCE_ID,appearance:false,pair:{}},{journeyId:MODEL_SETTINGS_APPEARANCE_ID,appearance:true}])assert.throws(()=>requireModelSettingsAppearance(input));
});
test('read-only source sequence retains settings/draft/no-model calls and original window captures',async()=>{
  const {t,state}=fixture();const result=await captureModelSettingsAppearance(t);
  assert.ok(result.nativeSamples.length>=3);assert.equal(result.qualification,false);assert.equal(result.readOnly,true);assert.equal(state.captures.length,2);assert.ok(state.captures.every(row=>row.options.windowId===12));
  assert.ok(state.reads.every(method=>['settings.get','workspace.get','pages.list','runs.list'].includes(method)));assert.equal(t.model.calls.length,0);assert.equal(state.menu,false);assert.equal(state.opened,false);assert.equal(state.focused,true);
  assert.ok(!state.actions.includes('Remove saved key'));
});
test('foreign endpoint or credential mask refuses before any Settings action',async()=>{
  for(const field of [{compatibleEndpoint:'https://foreign.invalid/v1'},{modelApiKey:'••••••••'}]){
    const {t,state}=fixture();Object.assign(state.settings,field);await assert.rejects(()=>captureModelSettingsAppearance(t));assert.deepEqual(state.actions,[]);assert.deepEqual(state.captures,[]);
  }
});
test('capture owner replacement retains refusal and cleanup debt, not a success label',async()=>{
  const {t,state}=fixture();t.capture=async()=>{t.app={pid:123};return {};};
  await assert.rejects(()=>captureModelSettingsAppearance(t),reason=>reason instanceof AggregateError&&reason.errors.every(error=>error instanceof Error));assert.equal(state.opened,true);
});
test('settings drift during capture fails exact before/after equality and retains original captured record',async()=>{
  const {t,state}=fixture();t.capture=async(name,options)=>{state.captures.push({name,options});state.settings.plannerModel='foreign-replacement';return {name};};
  await assert.rejects(()=>captureModelSettingsAppearance(t),AggregateError);assert.equal(state.captures.length,1);assert.equal(state.settings.plannerModel,'foreign-replacement');assert.equal(state.opened,false);
});
test('equal-shaped model, call-ledger or fixture replacement is not original ownership',async()=>{
  for(const replace of [t=>{t.model={...t.model};},t=>{t.model.calls=[];},t=>{t.fixture={...t.fixture};}]){
    const {t}=fixture();const original=t.ax.press;t.ax.press=async selector=>{await original(selector);replace(t);};
    await assert.rejects(()=>captureModelSettingsAppearance(t),AggregateError);
  }
});
test('duplicate original AX matches refuse instead of selecting index zero',async()=>{
  const {t,state}=fixture();const query=t.ax.query;t.ax.query=async selector=>{assert.equal(Object.hasOwn(selector,'index'),false);return selector.name==='Planner model'?[{value:'fixture-model'},{value:'fixture-model'}]:query(selector);};
  await assert.rejects(()=>captureModelSettingsAppearance(t),/must be unique/);assert.equal(state.captures.length,0);
});
test('foreign or stale native window cannot supply a normal Models capture',async()=>{
  for(const fields of [{windowKind:'private'},{pid:999},{windowId:99},{observedAtUnixMs:1}]){
    const {t,state}=fixture();t.app.observeAppearance=async()=>JSON.stringify({producer:'aux-native-appearance-snapshot',version:1,pid:123,windowId:12,windowKind:'normal',observedAtUnixMs:Date.now(),...fields});
    await assert.rejects(()=>captureModelSettingsAppearance(t));assert.equal(state.captures.length,0);assert.equal(state.actions.length,0);
  }
});
test('unexpected password-field subrole refuses without reading a value',async()=>{
  const {t,state}=fixture();const query=t.ax.query;t.ax.query=async selector=>selector.name==='Provider API key'?[{role:'AXTextField',subrole:'AXSearchField'}]:query(selector);
  await assert.rejects(()=>captureModelSettingsAppearance(t));assert.equal(state.captures.length,0);
});
test('a fabricated secure value is refused without inspecting its getter',async()=>{
  const {t,state}=fixture();const query=t.ax.query;let reads=0;const field={role:'AXTextField',subrole:'AXSecureTextField'};Object.defineProperty(field,'value',{get(){reads++;throw new Error('Secure value must not be read');}});
  t.ax.query=async selector=>selector.name==='Provider API key'?[field]:query(selector);
  await assert.rejects(()=>captureModelSettingsAppearance(t));assert.equal(reads,0);assert.equal(state.captures.length,0);
});

test('actual settings wrapper callback satisfies original runner UI evidence gate',async()=>{const {t}=fixture();const result=await runSettings(t);assert.ok(result.ax&&result.rpc);assert.equal(result.rpc.settings.modelApiKey,undefined);assert.ok(result.rpc.nativeSamples.length>0);});
test('same object and PID with changed original launch generation is refused',async()=>{const {t}=fixture();t.capture=async()=>{t.app.processObservation.generation++;return {};};await assert.rejects(()=>captureModelSettingsAppearance(t),AggregateError);});
