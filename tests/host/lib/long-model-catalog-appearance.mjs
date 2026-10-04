import assert from 'node:assert/strict';
import {captureHomeState} from './home-capture.mjs';
import {readUtilityAppearanceJson} from './utility-appearance-owner.mjs';
export const LONG_MODEL_CATALOG_ID='long-model-catalog-appearance';
export const longModelId='aux-owned-long-model-'+ 'catalog-segment-'.repeat(10)+'final';
const route='/appearance-long-model-catalog/v1/models';
const shell=(name,role)=>({name,...(role?{role}:{}),match:'exact',scope:'shell'});
const planner=shell('Planner model','AXComboBox'),composer=shell('Reply to conversation','AXTextArea');
export function requireLongModelCatalogAppearance({journeyId,appearance,pair}){assert.equal(journeyId,LONG_MODEL_CATALOG_ID);assert.equal(appearance,true);assert.ok(typeof pair==='string'&&pair.length>0)}
/** Fixed bounded actual HTTP catalog. No caller IDs/body/path/status or delay. */
export function createLongModelCatalog(fixture,signal){
 assert.ok(signal instanceof AbortSignal&&!signal.aborted);const url=new URL(fixture.url);assert.ok(['127.0.0.1','localhost','[::1]'].includes(url.hostname));
 const payload={data:[{id:longModelId}]};assert.ok(Buffer.byteLength(JSON.stringify(payload))<1024&&longModelId.length<256);
 const receipts=[];let retired=false;const lease=fixture.claimRoute(route,(request,response)=>{assert.ok(!retired&&!signal.aborted&&lease.current(),'Original long catalog route retired');assert.equal(request.method,'GET');assert.equal(request.url,route);assert.ok(!Object.hasOwn(request.headers,'authorization'),'No credential header admitted');assert.equal(receipts.length,0);const receipt={method:request.method,path:request.url,status:200,state:'responding',modelId:longModelId};receipts.push(receipt);response.once('finish',()=>receipt.state='delivered');return payload},{headers:{'content-type':'application/json'}});
 const retire=()=>{retired=true};const dispose=()=>{retired=true;lease.remove();signal.removeEventListener('abort',retire)};signal.addEventListener('abort',retire,{once:true});
 return{endpoint:`${fixture.url}/appearance-long-model-catalog/v1`,receipts,dispose,current:()=>!retired&&!signal.aborted&&lease.current()};
}
/** Long returned ID is typed into the real unsaved input. No datalist selection claim. */
export async function captureLongModelCatalogAppearance(t){
 assert.equal(t.appearanceEnabled,true);const app=t.app,ax=t.ax,fixture=t.fixture,model=t.model,calls=model.calls,pid=app.pid,processOwner=structuredClone(app.processObservation);
 assert.ok(processOwner&&processOwner.pid===pid&&Number.isSafeInteger(processOwner.generation)&&processOwner.generation>0,'Original long-model process receipt is required');
 const live=()=>{assert.deepEqual(app.processObservation,processOwner,'Original long-model process generation retired');assert.ok(t.app===app&&t.ax===ax&&t.fixture===fixture&&t.model===model&&model.calls===calls&&Number.isSafeInteger(pid)&&pid>0&&app.pid===pid&&ax.pid===pid&&!t.signal.aborted,'Original long-model owner retired')};
 const owned=async action=>{live();const result=await action();live();return result};
 const one=async selector=>{const nodes=await owned(()=>ax.query(selector));assert.equal(nodes.length,1);return nodes[0]};
 assert.deepEqual(calls,[]);assert.equal((await owned(()=>ax.query(shell('Search settings')))).length,0);
 const settings=await owned(()=>t.rpc('settings.get'));assert.equal(settings.modelProvider,'openai-compatible');assert.equal(settings.compatibleEndpoint,model.endpoint);assert.equal(settings.plannerModel,model.model);assert.equal(settings.modelApiKey,undefined);assert.equal(settings.modelProbe,undefined);
 const pages=await owned(()=>t.rpc('pages.list')),runs=await owned(()=>t.rpc('runs.list')),workspace=await owned(()=>t.rpc('workspace.get'));assert.deepEqual(pages,[]);assert.deepEqual(runs,[]);const draft=(await one(composer)).value;assert.equal(typeof draft,'string');
 const inventory=async()=>{const rows=(await owned(()=>ax.windows())).filter(w=>w.layer===0&&w.width>0&&w.height>0);assert.equal(rows.length,1);assert.ok(Number.isSafeInteger(rows[0].id)&&rows[0].id>0);return rows[0].id};const windowId=await inventory(),nativeSamples=[];
 const normal=async()=>{const start=Date.now(),raw=await owned(()=>app.observeAppearance({windowId,notBefore:new Date(start).toISOString()})),end=Date.now(),sample=readUtilityAppearanceJson(raw);assert.equal(sample.producer,'aux-native-appearance-snapshot');assert.equal(sample.version,1);assert.equal(sample.pid,pid);assert.equal(sample.windowId,windowId);assert.equal(sample.windowKind,'normal');assert.ok(Number.isFinite(sample.observedAtUnixMs)&&sample.observedAtUnixMs>=start&&sample.observedAtUnixMs<=end);nativeSamples.push(raw)};await normal();
 const http=createLongModelCatalog(fixture,t.signal);let prepared,changed=false,opened=false,inputTouched=false,primary,result;const debts=[];
 const unchanged=async()=>{assert.ok(http.current(),'Original long catalog route retired');await normal();assert.deepEqual(await owned(()=>t.rpc('settings.get')),prepared);assert.deepEqual(await owned(()=>t.rpc('pages.list')),pages);assert.deepEqual(await owned(()=>t.rpc('runs.list')),runs);assert.deepEqual(await owned(()=>t.rpc('workspace.get')),workspace);assert.deepEqual(calls,[]);assert.equal(await inventory(),windowId);await normal()};
 const capture=async(name,state)=>{await unchanged();await owned(()=>captureHomeState(t,name,state));await unchanged()};
 try{
  changed=true;await owned(()=>t.rpc('settings.set',{compatibleEndpoint:http.endpoint}));prepared=await owned(()=>t.rpc('settings.get'));assert.equal(prepared.compatibleEndpoint,http.endpoint);assert.equal(prepared.plannerModel,settings.plannerModel);assert.equal(prepared.modelProvider,settings.modelProvider);assert.equal(prepared.modelApiKey,undefined);
  opened=true;await owned(()=>ax.key('command+,','hid'));await owned(()=>ax.press(shell('Models','AXButton')));
  await owned(()=>t.until('original long catalog response actually delivered',()=>http.receipts.length===1&&http.receipts[0].state==='delivered'));
  await owned(()=>ax.waitFor(shell('Discover models','AXButton'),'enabled'));const secure=await one(shell('Provider API key','AXTextField'));assert.equal(secure.subrole,'AXSecureTextField');assert.ok(!Object.hasOwn(secure,'value'));assert.equal((await one(shell('Save key','AXButton'))).enabled,false);
  assert.equal((await one(planner)).value,settings.plannerModel);assert.equal((await one(shell('Save model','AXButton'))).enabled,false);await capture('models-long-catalog-original-input','models-long-catalog-returned-original-input');
  await unchanged();await owned(()=>ax.focus(planner));inputTouched=true;await owned(()=>ax.key('command+a','hid'));await owned(()=>ax.type(longModelId,planner));await owned(()=>t.until('original full long ID reached mounted planner input',async()=> (await one(planner)).value===longModelId));const input=await one(planner);assert.equal(input.value,http.receipts[0].modelId);assert.equal(input.focused,true);assert.equal((await one(shell('Save model','AXButton'))).enabled,true);assert.equal((await one(shell('Save key','AXButton'))).enabled,false);
  await capture('models-returned-long-id-unsaved-focused','models-returned-long-id-input-focused-unsaved');
  result={ax:await owned(()=>ax.dump()),rpc:{settings:prepared,pages,runs,workspace},http:http.receipts,nativeSamples,processOwner,qualification:false,datalistSelection:{status:'unproven',reason:'Actual returned ID typed into original input; no native popup or catalog selection receipt'}};
 }catch(error){primary=error}
 finally{
  if(opened)try{if(inputTouched){await owned(()=>ax.focus(planner));await owned(()=>ax.key('command+a','hid'));await owned(()=>ax.type(settings.plannerModel,planner));await owned(()=>t.until('original planner draft restored',async()=> (await one(planner)).value===settings.plannerModel));assert.equal((await one(planner)).value,settings.plannerModel);assert.equal((await one(shell('Save model','AXButton'))).enabled,false)}if((await owned(()=>ax.query(shell('Search settings')))).length){await owned(()=>ax.key('escape','hid'));await owned(()=>ax.waitFor(shell('Search settings'),'absent'))}}catch(error){debts.push(error)}
  if(changed)try{await owned(()=>t.rpc('settings.set',{compatibleEndpoint:settings.compatibleEndpoint}));assert.deepEqual(await owned(()=>t.rpc('settings.get')),settings)}catch(error){debts.push(error)}
  try{http.dispose()}catch(error){debts.push(error)}
  try{assert.deepEqual(await owned(()=>t.rpc('pages.list')),pages);assert.deepEqual(await owned(()=>t.rpc('runs.list')),runs);assert.deepEqual(await owned(()=>t.rpc('workspace.get')),workspace);assert.deepEqual(calls,[]);assert.equal((await one(composer)).value,draft);await owned(()=>ax.focus(composer));assert.equal((await one(composer)).focused,true);await normal()}catch(error){debts.push(error)}
 }
 if(debts.length)throw new AggregateError([primary,...debts].filter(Boolean),'Long-model capture and original restoration debt');if(primary)throw primary;return result;
}
