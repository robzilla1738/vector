import assert from 'node:assert/strict';
import {captureHomeState} from './home-capture.mjs';
import {createValidImageFixture} from './composer-image-appearance.mjs';
import {readUtilityAppearanceJson} from './utility-appearance-owner.mjs';
const shell=(name,role)=>({name,...(role?{role}:{}),match:'exact',scope:'shell'});
const composer=shell('Reply to conversation');
const filename='valid-image.png';
const remove=shell(`Remove ${filename}`,'AXButton');
const include=shell(`Use ${filename} in next reply`,'AXCheckBox');
const preview={...shell('^valid-image\\.png\\s*(?:·\\s*)?16\\s*×\\s*16$','AXButton'),match:'regex'};
const close=shell('Close image preview','AXButton');

/** UI-only preparation: no private chat/image ID is inferred from AX or pixels. */
export async function captureMountedImageAppearance(t){
 if(!t.appearanceEnabled)return {status:'not-requested'};
 const app=t.app,ax=t.ax,model=t.model,pid=app.pid;
 assert.ok(Number.isInteger(pid)&&pid>0&&ax.pid===pid);
 assert.ok(Array.isArray(model?.calls),'Original owned loopback model receipt required');
 assert.deepEqual(model.calls,[],'Use a fresh page-free fixture before any model requests');
 const live=()=>{assert.equal(t.app,app);assert.equal(t.ax,ax);assert.equal(t.model,model);assert.equal(app.pid,pid);assert.equal(ax.pid,pid);assert.ok(!t.signal?.aborted)};
 const windows=async()=>{live();const all=(await ax.windows()).filter(w=>w.layer===0&&w.width>0&&w.height>0);live();assert.equal(all.length,1);assert.ok(Number.isInteger(all[0].id)&&all[0].id>0);return all[0].id};
 const windowId=await windows(),nativeSamples=[];
 const normal=async()=>{live();const started=Date.now();const raw=await app.observeAppearance({windowId,notBefore:new Date(started).toISOString()});live();const completed=Date.now(),sample=readUtilityAppearanceJson(raw);assert.equal(sample.producer,'aux-native-appearance-snapshot');assert.equal(sample.version,1);assert.equal(sample.pid,pid);assert.equal(sample.windowId,windowId);assert.equal(sample.windowKind,'normal');assert.ok(Number.isFinite(sample.observedAtUnixMs)&&sample.observedAtUnixMs>=started&&sample.observedAtUnixMs<=completed);nativeSamples.push(raw)};
 await normal();
 const unique=async(selector,present=true)=>{live();const nodes=await ax.query(selector);live();assert.equal(nodes.length,present?1:0,`Original unique ${selector.name} required`);return nodes[0]};
 const draft=(await unique(composer)).value;assert.equal(typeof draft,'string');
 const before={};for(const method of ['pages.list','runs.list','workspace.get','settings.get']){before[method]=await t.rpc(method);live()}
 assert.deepEqual(before['pages.list'],[]);assert.deepEqual(before['runs.list'],[]);
 await unique(remove,false);await unique(include,false);
 const unchanged=async()=>{live();await normal();assert.equal(await windows(),windowId);assert.equal((await unique(composer)).value,draft);assert.deepEqual(model.calls,[]);for(const method of Object.keys(before)){const now=await t.rpc(method);live();assert.deepEqual(now,before[method],`Image UI changed ${method}`)}await normal()};
 const click=async selector=>{await unchanged();const node=await unique(selector);assert.equal(node.enabled,true);await ax.click(selector);live()};
 let fixture,attached=false,previewOpen=false,primary,result;const cleanup=[];
 const capture=async(name,state)=>{await unchanged();await fixture?.validate();await captureHomeState(t,name,state);await unchanged();await fixture?.validate()};
 try{
  await capture('home-mounted-image-before','home-mounted-image-before-visual-only');
  fixture=await createValidImageFixture();await fixture.validate();live();
  await click(shell('Add context','AXButton'));await ax.waitFor(shell('Image','AXButton'),'enabled');await click(shell('Image','AXButton'));
  await fixture.validate();await ax.openPanel(fixture.path);live();await fixture.validate();
  await ax.waitFor({role:'AXSheet',scope:'window'},'absent');await ax.waitFor(shell('Attach image','AXButton'),'enabled');
  await capture('home-mounted-image-chooser-review','home-mounted-image-local-chooser-review-visual-only');
  await click(shell('Attach image','AXButton'));attached=true;
  await ax.waitFor(remove,'enabled');await ax.waitFor(shell('Preparing image…'),'absent');
  assert.equal((await unique(include)).checked,true);
  await capture('home-mounted-image-tray','home-mounted-image-tray-included-visual-only');
  await click(preview);previewOpen=true;await ax.waitFor(close,'enabled');await ax.waitFor(shell('Loading image…'),'absent');
  await ax.waitFor(shell('Fit','AXButton'),'enabled');await unique(shell(filename,'AXImage'));
  await capture('home-mounted-image-preview','home-mounted-image-preview-visual-only');
  await click(close);previewOpen=false;await ax.waitFor(close,'absent');
  await capture('home-mounted-image-preview-closed','home-mounted-image-preview-closed-visual-only');
  await click(include);await t.until('Original mounted image checkbox is unchecked',async()=>{await unchanged();return (await unique(include)).checked===false});
  await capture('home-mounted-image-excluded','home-mounted-image-excluded-visual-only');
  await click(remove);await ax.waitFor(remove,'absent');await unique(include,false);attached=false;
  await ax.focus(composer);assert.equal((await unique(composer)).focused,true);
  await capture('home-mounted-image-removed','home-mounted-image-removed-draft-focused-visual-only');
  result={status:'observed-visual-only',qualification:'none',privateImageIdentity:'unobserved',nativeSamples,unsentChatFixture:'may persist; no deletion or identity claim',ax:await ax.dump(),rpc:before};live();
 }catch(error){primary=error;if(!fixture&&error.ownedImageFixture)fixture=error.ownedImageFixture}
 finally{
  try{
   if(previewOpen){await click(close);await ax.waitFor(close,'absent');previewOpen=false}
   if(attached){await ax.waitFor(remove,'enabled');await click(remove);await ax.waitFor(remove,'absent');await unique(include,false);attached=false}
  }catch(error){cleanup.push(error)}
  if(fixture)try{await fixture.dispose()}catch(error){cleanup.push(error)}
 }
 if(primary&&cleanup.length)throw new AggregateError([primary,...cleanup],'Mounted image appearance failed with original cleanup debt',{cause:primary});
 if(primary)throw primary;if(cleanup.length)throw new AggregateError(cleanup,'Original mounted image cleanup remains unresolved');
 return result;
}
