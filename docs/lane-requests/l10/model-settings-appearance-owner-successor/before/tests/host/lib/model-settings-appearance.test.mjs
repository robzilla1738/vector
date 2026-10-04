import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captureModelSettingsAppearance,requireModelSettingsAppearance,MODEL_SETTINGS_APPEARANCE_ID} from './model-settings-appearance.mjs';
function fixture(){
  const state={opened:false,menu:false,focused:false,settings:{modelProvider:'openai-compatible',compatibleEndpoint:'http://127.0.0.1:12345/v1',plannerModel:'fixture-model'},reads:[],actions:[],captures:[]};
  const app={pid:123};const ax={pid:123,windows:async()=>[{id:12,layer:0,width:900,height:700}],query:async s=>{
    if(s.name==='Search settings')return state.opened?[{name:s.name}]:[];
    if(s.name==='Reply to conversation')return [{value:'kept unsent draft',focused:state.focused}];
    if(s.name==='Provider API key')return [{value:''}];
    if(s.name==='Planner model')return [{value:'fixture-model'}];
    if(s.name==='Save key')return [{enabled:false}];
    if(s.name==='Remove saved key')return state.menu?[{enabled:false}]:[];
    return [{enabled:true}];
  },key:async key=>{state.actions.push(key);if(key==='command+,')state.opened=true;else if(state.menu)state.menu=false;else state.opened=false;},press:async s=>{state.actions.push(s.name);if(s.name==='Manage OpenAI-compatible')state.menu=true;},waitFor:async()=>{},focus:async()=>{state.focused=true;}};
  const t={app,ax,signal:new AbortController().signal,appearanceEnabled:true,fixture:{url:'http://127.0.0.1:12345'},model:{endpoint:'http://127.0.0.1:12345/v1',model:'fixture-model',calls:[]},rpc:async method=>{state.reads.push(method);if(method==='settings.get')return structuredClone(state.settings);if(method==='workspace.get')return {spaces:[]};assert.ok(['pages.list','runs.list'].includes(method));return [];},capture:async(name,options)=>{state.captures.push({name,options});return {name,...options};}};
  return {t,state};
}
test('exact fixed appearance admission refuses unpaired/generic modes',()=>{
  requireModelSettingsAppearance({journeyId:MODEL_SETTINGS_APPEARANCE_ID,appearance:true,pair:{}});
  for(const input of [{journeyId:'models',appearance:true,pair:{}},{journeyId:MODEL_SETTINGS_APPEARANCE_ID,appearance:false,pair:{}},{journeyId:MODEL_SETTINGS_APPEARANCE_ID,appearance:true}])assert.throws(()=>requireModelSettingsAppearance(input));
});
test('read-only source sequence retains settings/draft/no-model calls and original window captures',async()=>{
  const {t,state}=fixture();const result=await captureModelSettingsAppearance(t);
  assert.equal(result.qualification,false);assert.equal(result.readOnly,true);assert.equal(state.captures.length,2);assert.ok(state.captures.every(row=>row.options.windowId===12));
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
