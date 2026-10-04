import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';
import { readUtilityAppearanceJson } from './utility-appearance-owner.mjs';
export const MODEL_SETTINGS_APPEARANCE_ID = 'model-settings-appearance';
const shell = (name, role) => ({name, ...(role ? {role} : {}), match:'exact',scope:'shell'});
const search = shell('Search settings','AXTextField');
const composer = shell('Reply to conversation','AXTextArea');
export function requireModelSettingsAppearance({journeyId,appearance,pair}) {
  assert.equal(journeyId,MODEL_SETTINGS_APPEARANCE_ID); assert.equal(appearance,true);
  assert.ok(pair,'The original externally admitted appearance pair is required');
}
/** Read-only preparation. Actual capture retains the existing original native
 * before/pixels/after producer; source controls are not native qualification. */
export async function captureModelSettingsAppearance(t) {
  assert.equal(t.appearanceEnabled,true);
  const app=t.app, ax=t.ax, model=t.model, fixture=t.fixture, calls=model.calls, pid=app.pid, processOwner=structuredClone(app.processObservation);
  assert.ok(Number.isInteger(pid)&&pid>0&&ax.pid===pid&&!t.signal.aborted);
  const current=()=>{assert.deepEqual(app.processObservation,processOwner);assert.ok(t.app===app&&t.ax===ax&&t.model===model&&t.fixture===fixture&&model.calls===calls&&app.pid===pid&&ax.pid===pid&&!t.signal.aborted,'Original model appearance owner retired');};
  const owned=async producer=>{current();const result=await producer();current();return result;};
  assert.equal((await owned(()=>ax.query(search))).length,0,'Models capture begins with Settings closed');
  const settings=await owned(()=>t.rpc('settings.get'));
  assert.equal(settings.modelProvider,'openai-compatible');
  assert.equal(settings.compatibleEndpoint,model.endpoint,'Only the original disposable loopback endpoint is admitted');
  const endpoint=new URL(settings.compatibleEndpoint),fixtureUrl=new URL(fixture.url);
  assert.ok(['127.0.0.1','[::1]','localhost'].includes(endpoint.hostname)&&endpoint.origin===fixtureUrl.origin);
  assert.equal(settings.plannerModel,model.model);
  assert.equal(settings.modelApiKey,undefined,'No saved or environment credential may be prepared by this read-only cohort');
  const pages=await owned(()=>t.rpc('pages.list')),runs=await owned(()=>t.rpc('runs.list')),workspace=await owned(()=>t.rpc('workspace.get'));
  assert.deepEqual(pages,[]);assert.deepEqual(runs,[]);
  const originalDraft=await owned(()=>ax.query(composer)); assert.equal(originalDraft.length,1);assert.equal(typeof originalDraft[0].value,'string');
  const modelCalls=calls.length;
  const inventory=async()=>{const rows=(await owned(()=>ax.windows())).filter(row=>row.layer===0&&row.width>0&&row.height>0);assert.equal(rows.length,1);assert.ok(Number.isInteger(rows[0].id)&&rows[0].id>0);return rows[0].id;};
  const windowId=await inventory(),nativeSamples=[];
  const normal=async()=>{current();const started=Date.now();const raw=await owned(()=>app.observeAppearance({windowId,notBefore:new Date(started).toISOString()}));const completed=Date.now(),sample=readUtilityAppearanceJson(raw);assert.equal(sample.producer,'aux-native-appearance-snapshot');assert.equal(sample.version,1);assert.equal(sample.pid,pid);assert.equal(sample.windowId,windowId);assert.equal(sample.windowKind,'normal');assert.ok(Number.isFinite(sample.observedAtUnixMs)&&sample.observedAtUnixMs>=started&&sample.observedAtUnixMs<=completed);nativeSamples.push(raw);};
  await normal();
  const unchanged=async()=>{await normal();assert.deepEqual(await owned(()=>t.rpc('settings.get')),settings);assert.deepEqual(await owned(()=>t.rpc('pages.list')),pages);assert.deepEqual(await owned(()=>t.rpc('runs.list')),runs);assert.deepEqual(await owned(()=>t.rpc('workspace.get')),workspace);assert.equal(calls.length,modelCalls,'Read-only Models cannot send a chat or probe');assert.equal(await inventory(),windowId);await normal();};
  const one=async selector=>{const rows=await owned(()=>ax.query(selector));assert.equal(rows.length,1,`Original ${selector.name} must be unique`);return rows[0];};
  let opened=false,menuOpen=false,primary;const captures=[],debts=[];
  try {
    opened=true;await owned(()=>ax.key('command+,','hid'));await owned(()=>ax.press(shell('Models','AXButton')));
    await owned(()=>ax.waitFor(shell('Discover models','AXButton'),'enabled'));
    for(const name of ['Model provider','OpenAI-compatible endpoint','Provider API key','Planner model','Vision model','Fast model ID','Standard model ID','Deep model ID','Visual model ID','Parallel worker pages','Max model turns per run']) await one(shell(name));
    const keyField=await one(shell('Provider API key','AXTextField'));assert.equal(keyField.subrole,'AXSecureTextField');assert.equal(Object.hasOwn(keyField,'value'),false,'Original helper must suppress secure field values');
    assert.equal((await one(shell('Save key','AXButton'))).enabled,false);
    assert.equal((await one(shell('Planner model'))).value,settings.plannerModel);
    await unchanged();captures.push(await owned(()=>captureHomeState(t,'models-local-provider-roles-limits','models-local-provider-readonly')));await unchanged();
    menuOpen=true;await owned(()=>ax.press(shell('Manage OpenAI-compatible','AXButton')));
    assert.equal((await one(shell('Remove saved key','AXMenuItem'))).enabled,false,'No key removal review may be fabricated');
    await unchanged();captures.push(await owned(()=>captureHomeState(t,'models-local-connection-menu-no-key','models-local-connection-menu-disabled-removal')));await unchanged();
    await owned(()=>ax.key('escape','hid'));menuOpen=false;
  } catch(reason){primary=reason;}
  finally {
    if(menuOpen)try{await owned(()=>ax.key('escape','hid'));}catch(reason){debts.push(reason);}
    if(opened)try{if((await owned(()=>ax.query(search))).length){await owned(()=>ax.key('escape','hid'));await owned(()=>ax.waitFor(search,'absent'));}}catch(reason){debts.push(reason);}
    try{await unchanged();const draft=await one(composer);assert.equal(draft.value,originalDraft[0].value);await owned(()=>ax.focus(composer));assert.equal((await one(composer)).focused,true);}catch(reason){debts.push(reason);}
  }
  if(debts.length)throw new AggregateError([primary,...debts].filter(Boolean),'Original Models capture or UI restoration unresolved');
  if(primary)throw primary;
  return {ax:await owned(()=>ax.query(composer)),rpc:{settings,pages,runs,workspace,nativeSamples},captures,nativeSamples,readOnly:true,qualification:false,pending:['saved-key-mask-and-removal-review','probe-success-and-failure','private-inactive-runtime','long-model-label'],settingsUnchanged:true,modelCallsUnchanged:true};
}
