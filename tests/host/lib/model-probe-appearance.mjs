import assert from 'node:assert/strict';
import {lstatSync,realpathSync} from 'node:fs';
import {basename,dirname,join} from 'node:path';
import {captureHomeState} from './home-capture.mjs';
import {readUtilityAppearanceJson} from './utility-appearance-owner.mjs';
import {createSuccessfulModelProbeFixture,createRejectedModelProbeFixture} from './model-probe-fixture.mjs';
const successId='model-probe-success-appearance',failureId='model-probe-failure-appearance';
const shell=(name,role,match='exact')=>({name,...(role?{role}:{}),match,scope:'shell'});
const search=shell('Search settings','AXTextField'),composer=shell('Reply to conversation','AXTextArea');
export function requireModelProbeAppearance({journeyId,appearance,pair}){
  assert.ok(journeyId===successId||journeyId===failureId);assert.equal(appearance,true);assert.ok(pair,'Original admitted appearance pair is mandatory');
}
function profileIdentity(app){
  const root=realpathSync(app.profileRoot),data=realpathSync(app.userDataDir);
  assert.equal(dirname(root),realpathSync('/tmp'));assert.match(basename(root),/^aux-native-journey-[A-Za-z0-9]+$/);assert.equal(data,join(root,'profile'));
  return [app.profileRoot,app.userDataDir].map(path=>{const info=lstatSync(path);assert.ok(info.isDirectory()&&!info.isSymbolicLink()&&info.uid===process.getuid()&&(info.mode&0o077)===0);return {path,realpath:realpathSync(path),dev:info.dev,ino:info.ino,uid:info.uid,mode:info.mode};});
}
async function capture(t,rejectResponse){
  assert.equal(t.appearanceEnabled,true);assert.equal(t.model,undefined,'This separate fresh Profile has no other model fixture');
  const app=t.app,ax=t.ax,fixture=t.fixture,signal=t.signal,pid=app.pid,processOwner=structuredClone(app.processObservation),profile=profileIdentity(app);
  const live=()=>{assert.ok(t.app===app&&t.ax===ax&&t.fixture===fixture&&t.signal===signal&&t.model===undefined&&app.pid===pid&&ax.pid===pid&&!signal.aborted);assert.deepEqual(app.processObservation,processOwner);assert.deepEqual(profileIdentity(app),profile);};
  const owned=async producer=>{live();const result=await producer();live();return result;};
  const one=async selector=>{const rows=await owned(()=>ax.query(selector));assert.equal(rows.length,1,`Original ${selector.name} is not unique`);return rows[0];};
  const fresh=await owned(()=>t.rpc('settings.get'));assert.equal(fresh.modelConfigured,false);assert.equal(fresh.modelApiKey,undefined);assert.equal(fresh.modelProbe,undefined);
  assert.equal((await owned(()=>ax.query(search))).length,0);
  const pages=await owned(()=>t.rpc('pages.list')),runs=await owned(()=>t.rpc('runs.list')),workspace=await owned(()=>t.rpc('workspace.get'));assert.deepEqual(pages,[]);assert.deepEqual(runs,[]);
  const draft=(await one(composer)).value;assert.equal(typeof draft,'string');
  const windows=(await owned(()=>ax.windows())).filter(row=>row.layer===0&&row.width>0&&row.height>0);assert.equal(windows.length,1);const windowId=windows[0].id;assert.ok(Number.isInteger(windowId)&&windowId>0);
  const nativeSamples=[],captures=[];
  const normal=async()=>{const start=Date.now(),raw=await owned(()=>app.observeAppearance({windowId,notBefore:new Date(start).toISOString()})),end=Date.now(),value=readUtilityAppearanceJson(raw);assert.equal(value.producer,'aux-native-appearance-snapshot');assert.equal(value.version,1);assert.equal(value.pid,pid);assert.equal(value.windowId,windowId);assert.equal(value.windowKind,'normal');assert.ok(Number.isFinite(value.observedAtUnixMs)&&value.observedAtUnixMs>=start&&value.observedAtUnixMs<=end);nativeSamples.push(raw);};
  await normal();
  const http=rejectResponse?createRejectedModelProbeFixture(fixture,signal):createSuccessfulModelProbeFixture(fixture,signal);
  let opened=false,started=false,completed=false,primary,configured;const debts=[];
  const originalOwner={app,ax,fixture,signal,pid,processOwner,profile,http,captures,nativeSamples};
  const withoutProbe=value=>{const copy={...value};delete copy.modelProbe;return copy;};
  const untouched=async()=>{await normal();assert.deepEqual(await owned(()=>t.rpc('pages.list')),pages);assert.deepEqual(await owned(()=>t.rpc('runs.list')),runs);assert.deepEqual(await owned(()=>t.rpc('workspace.get')),workspace);const now=await owned(()=>t.rpc('settings.get'));assert.deepEqual(withoutProbe(now),withoutProbe(configured));const actual=(await owned(()=>ax.windows())).filter(row=>row.layer===0&&row.width>0&&row.height>0);assert.equal(actual.length,1);assert.equal(actual[0].id,windowId);await normal();return now;};
  const record=async(name,state)=>{await untouched();captures.push(await owned(()=>captureHomeState(t,name,state)));await untouched();};
  try{
    await owned(()=>t.rpc('settings.set',{modelProvider:'openai-compatible',compatibleEndpoint:http.endpoint,plannerModel:http.model}));configured=await owned(()=>t.rpc('settings.get'));assert.equal(configured.modelConfigured,true);assert.equal(configured.modelApiKey,undefined);assert.equal(configured.modelProbe,undefined);assert.equal(configured.modelProvider,'openai-compatible');assert.equal(configured.compatibleEndpoint,http.endpoint);assert.equal(configured.plannerModel,http.model);
    opened=true;await owned(()=>ax.key('command+,','hid'));await owned(()=>ax.press(shell('Models','AXButton')));await owned(()=>ax.waitFor(shell('Discover models','AXButton'),'enabled'));
    started=true;await owned(()=>ax.press(shell('Test connection','AXButton')));await owned(()=>t.until('original structured loopback probe is pending',()=>http.receipts.length===1));http.requirePending();assert.equal((await one(shell('Testing…','AXButton'))).enabled,false);
    await record(`models-probe-${http.kind}-pending`,`models-probe-${http.kind}-original-http-pending`);http.requirePending();http.release();
    await owned(()=>ax.waitFor(shell('Test connection','AXButton'),'enabled'));
    await owned(()=>t.until('original probe persisted its actual result',async()=>{const result=await t.rpc('settings.get');live();return result.modelProbe?.modelId===http.model&&result.modelProbe.provider==='openai-compatible'&&result.modelProbe.ok===!rejectResponse;}));
    const result=(await untouched()).modelProbe;assert.ok(Number.isFinite(result.checkedAt)&&result.checkedAt>0);assert.equal(http.receipts.length,rejectResponse?1:2);assert.ok(http.receipts.every(row=>row.state==='delivered'&&row.status===(rejectResponse?503:200)));assert.equal(http.unresolved,0);completed=true;
    if(rejectResponse){
      await one(shell('Connection test failed. Check your provider settings, then try again.',undefined,'contains'));
      await record('models-probe-failure-result','models-probe-failure-real-http503');
      await owned(()=>ax.press(shell('Connection test details')));await one(shell('Owned synthetic probe unavailable',undefined,'contains'));
      await record('models-probe-failure-details','models-probe-failure-original-diagnostic-expanded');
    }else{assert.equal(result.vision,true);await one(shell('Connection tested',undefined,'contains'));await record('models-probe-success-result','models-probe-success-real-json-and-vision');}
  }catch(reason){primary=reason;}
  finally{
    try{http.dispose();assert.equal(http.unresolved,0);}catch(reason){debts.push(reason);}
    if(opened)try{if((await owned(()=>ax.query(search))).length){await owned(()=>ax.key('escape','hid'));await owned(()=>ax.waitFor(search,'absent'));}}catch(reason){debts.push(reason);}
    if(configured)try{await untouched();assert.equal((await one(composer)).value,draft);await owned(()=>ax.focus(composer));assert.equal((await one(composer)).focused,true);}catch(reason){debts.push(reason);}
  }
  if(primary||debts.length){const reason=debts.length?new AggregateError([primary,...debts].filter(Boolean),'Original probe or disposable Profile ownership/restoration unresolved'):primary;throw Object.assign(reason,{ownedProbeAppearance:originalOwner,originalProbeStarted:started,originalProbeCompleted:completed});}
  return {ax:await owned(()=>ax.query(composer)),rpc:{settings:await owned(()=>t.rpc('settings.get')),nativeSamples},captures,nativeSamples,http:structuredClone(http.receipts),profile,processOwner,modelProbe:(await owned(()=>t.rpc('settings.get'))).modelProbe,disposableProfileMutationRetained:true,qualification:false};
}
export const captureSuccessfulModelProbeAppearance=t=>capture(t,false);
export const captureRejectedModelProbeAppearance=t=>capture(t,true);
