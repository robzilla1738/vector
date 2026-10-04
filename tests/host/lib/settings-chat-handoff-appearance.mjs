import assert from 'node:assert/strict';
import {captureHomeState} from './home-capture.mjs';
import {readUtilityAppearanceJson} from './utility-appearance-owner.mjs';
const shell=(name,role)=>({name,role,match:'exact',scope:'shell'});
const composer=shell('Reply to conversation','AXTextArea'),search=shell('Search settings','AXTextField');
const github=shell('GitHub live folders','AXHeading'),connection=shell('Connection name','AXTextField'),token=shell('Personal access token','AXTextField');
/** Read-only Models/Services navigation and explicit registered page-free New chat. */
export async function captureSettingsChatHandoff(t){
 assert.equal(t.appearanceEnabled,true);assert.equal(t.narrowEnabled,true);
 const app=t.app,ax=t.ax,model=t.model,fixture=t.fixture,calls=model.calls,pid=app.pid,processOwner=structuredClone(app.processObservation);
 assert.ok(Number.isInteger(pid)&&pid>0&&ax.pid===pid);assert.ok(Array.isArray(calls));
 const current=()=>{assert.ok(t.app===app&&t.ax===ax&&t.model===model&&t.fixture===fixture&&model.calls===calls&&app.pid===pid&&ax.pid===pid&&!t.signal.aborted,'Original Settings handoff owner retired');assert.deepEqual(app.processObservation,processOwner);};
 const owned=async fn=>{current();const value=await fn();current();return value;};
 const rows=s=>owned(()=>ax.query(s));
 const one=async s=>{const nodes=await rows(s);assert.equal(nodes.length,1,`Original unique ${s.name} required`);return nodes[0];};
 const absent=async s=>assert.equal((await rows(s)).length,0,`Unexpected ${s.name}`);
 await absent(search);await absent(shell('New chat','AXHeading'));await one(shell('What would you like to work on?','AXHeading'));const draft=(await one(composer)).value;assert.equal(typeof draft,'string');
 const before={};for(const method of ['settings.get','pages.list','runs.list','workspace.get'])before[method]=await owned(()=>t.rpc(method));
 assert.deepEqual(before['pages.list'],[]);assert.deepEqual(before['runs.list'],[]);assert.equal(before['settings.get'].modelProvider,'openai-compatible');assert.equal(before['settings.get'].compatibleEndpoint,model.endpoint);assert.equal(before['settings.get'].modelApiKey,undefined);
 assert.equal(new URL(model.endpoint).origin,new URL(fixture.url).origin);assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(model.endpoint).hostname));
 const originalCalls=structuredClone(calls),nativeSamples=[];
 const inventory=async()=>{const list=(await owned(()=>ax.windows())).filter(w=>w.layer===0&&w.width>0&&w.height>0);assert.equal(list.length,1);assert.ok(Number.isInteger(list[0].id)&&list[0].id>0);assert.ok(list[0].width>=720&&list[0].width<=900);return list[0].id;};
 const windowId=await inventory();
 const unchanged=async()=>{assert.equal(await inventory(),windowId);for(const method of Object.keys(before))assert.deepEqual(await owned(()=>t.rpc(method)),before[method]);assert.deepEqual(calls,originalCalls);const start=Date.now(),raw=await owned(()=>app.observeAppearance({windowId,notBefore:new Date(start).toISOString()})),end=Date.now(),sample=readUtilityAppearanceJson(raw);assert.equal(sample.pid,pid);assert.equal(sample.windowId,windowId);assert.equal(sample.windowKind,'normal');assert.ok(sample.observedAtUnixMs>=start&&sample.observedAtUnixMs<=end);nativeSamples.push(raw);};
 const press=async s=>{await unchanged();assert.equal((await one(s)).enabled,true);await owned(()=>ax.press(s));await unchanged();};
 const captures=[];const capture=async(name,state)=>{await unchanged();captures.push(await owned(()=>captureHomeState(t,name,state)));await unchanged();};
 let opened=false,sidebarOpened=false,primary,services='pending-unavailable';const debts=[];
 try{
  opened=true;await owned(()=>ax.key('command+,','hid'));await owned(()=>ax.waitFor(search,'present'));await press(shell('Models','AXButton'));await owned(()=>ax.waitFor(shell('Planner model','AXComboBox'),'present'));
  for(const s of [github,connection,token])await absent(s);
  await capture('models-form-separated-from-services','models-form-no-unrelated-service-form');
  const tab=shell('Services','AXRadioButton'),tabs=await rows(tab);assert.ok(tabs.length<=1);
  if(tabs.length){await press(tab);const forms=await rows(github);assert.ok(forms.length<=1);if(forms.length){await one(connection);const secure=await one(token);assert.equal(secure.subrole,'AXSecureTextField');assert.equal(Object.hasOwn(secure,'value'),false,'Original secure helper field must suppress values');await capture('services-form-owned-category','services-form-owned-category-no-credential-read');services='observed-original-service-form';}}
  const newChat=shell('New chat','AXButton');let choices=await rows(newChat);assert.ok(choices.length<=1,'Ambiguous original New chat action');
  if(!choices.length){sidebarOpened=true;await press(shell('Show sidebar','AXButton'));await owned(()=>ax.waitFor(newChat,'enabled'));}
  await press(newChat);opened=false;await owned(()=>ax.waitFor(search,'absent'));await one(shell('New chat','AXHeading'));const input=await one(composer);assert.equal(input.focused,true,'Settings teardown must preserve original New chat textarea focus');assert.equal(input.value,draft,'Page-free Home and explicit new-chat share the original agentDraft');
  await capture('settings-to-new-chat-original-draft-focused','settings-to-page-free-new-chat-original-agent-draft-focused');assert.equal((await one(composer)).focused,true);assert.equal((await one(composer)).value,draft);
 }catch(reason){primary=reason;}
 finally{
  if(opened)try{if((await rows(search)).length){await owned(()=>ax.key('escape','hid'));await owned(()=>ax.waitFor(search,'absent'));}}catch(reason){debts.push(reason);}
  if(sidebarOpened)try{await press(shell('Hide sidebar','AXButton'));}catch(reason){debts.push(reason);}
  try{await unchanged();assert.equal((await one(composer)).value,draft);await owned(()=>ax.focus(composer));assert.equal((await one(composer)).focused,true);}catch(reason){debts.push(reason);}
 }
 if(debts.length)throw new AggregateError([primary,...debts].filter(Boolean),'Settings handoff and original cleanup debt');if(primary)throw primary;
 return{ax:await owned(()=>ax.query(composer)),rpc:{...before,nativeSamples},captures,services,qualification:false,privateChatIdentity:'unobserved',originalAgentDraftRetained:true};
}
