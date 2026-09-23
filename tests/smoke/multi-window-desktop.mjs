// Two independent regular windows sharing one profile and durable runtime.
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import { launchApp } from './launch.mjs';
import { poll } from './poll.mjs';

const dir=mkdtempSync(join(tmpdir(),'aux-multi-window-'));
const server=createServer((req,res)=>{
  res.setHeader('Content-Type','text/html');
  res.end(`<title>${req.url.slice(1)||'Aux fixture'}</title><h1>${req.url}</h1><label>Draft<textarea id="draft"></textarea></label><script>addEventListener('beforeunload',event=>{if(draft.value){event.preventDefault();event.returnValue='';}})</script>`);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
let app;
const launch=()=>launchApp({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function shells(expected=1){
  for(let attempt=0;attempt<150;attempt++){
    const found=[];
    for(const page of app.windows().filter(page=>page.url().includes('renderer/index.html'))){
      const id=await page.evaluate(()=>window.aux?.windowId).catch(()=>null);
      if(id)found.push({id,page});
    }
    if(found.length>=expected)return found;
    await delay(100);
  }
  throw new Error(`Expected ${expected} Aux windows`);
}
async function nativePage(url){
  for(let attempt=0;attempt<150;attempt++){
    const page=app.windows().find(page=>page.url()===url);
    if(page)return page;
    await delay(50);
  }
  throw new Error(`Missing native page ${url}`);
}
async function snapshot(shell){
  return shell.evaluate(async()=>({id:window.aux.windowId,workspace:await window.aux.invoke('workspace.get',{}),layout:JSON.parse(localStorage.getItem(`aux.layout.v1:${window.aux.windowId}`)||'null')}));
}

try{
  app=await launch();
  console.log('multi-window: launched first process');
  let [{page:primary}]=await shells();
  await primary.locator('.aux-home').waitFor();
  const primaryTabs=await primary.evaluate(async base=>[
    await window.aux.invoke('pages.open',{url:base+'/primary-one',activate:true}),
    await window.aux.invoke('pages.open',{url:base+'/primary-selected',activate:true}),
  ],base);
  console.log('multi-window: primary tabs ready');
  const primaryFixture=await nativePage(base+'/primary-selected');
  await primaryFixture.evaluate(()=>{document.cookie='aux_shared=visible; SameSite=Lax';localStorage.setItem('aux-shared-profile','yes');});

  await app.evaluate(({Menu})=>{
    const item=Menu.getApplicationMenu().items.flatMap(item=>item.submenu?.items??[]).find(item=>item.id==='new-window');
    if(!item)throw new Error('New Window menu item missing');
    item.click();
  });
  const opened=await shells(2);
  console.log('multi-window: second shell ready');
  primary=opened.find(item=>item.id==='main').page;
  const secondaryRecord=opened.find(item=>item.id!=='main');
  assert.ok(secondaryRecord,'New Window must create a distinct regular Aux window');
  const secondary=secondaryRecord.page;
  await secondary.locator('.aux-home').waitFor();
  const secondaryTabs=await secondary.evaluate(async base=>[
    await window.aux.invoke('pages.open',{url:base+'/secondary-one',activate:true}),
    await window.aux.invoke('pages.open',{url:base+'/secondary-selected',activate:true}),
  ],base);
  console.log('multi-window: secondary tabs ready');
  const secondaryFixture=await nativePage(base+'/secondary-selected');
  secondaryFixture.on('dialog',()=>{});
  assert.equal(await secondaryFixture.evaluate(()=>document.cookie.includes('aux_shared=visible')),true,'Regular windows must share profile cookies');
  assert.equal(await secondaryFixture.evaluate(()=>localStorage.getItem('aux-shared-profile')),'yes','Regular windows must share site storage');

  const primaryList=await primary.evaluate(()=>window.aux.invoke('pages.list',{}));
  const secondaryList=await secondary.evaluate(()=>window.aux.invoke('pages.list',{}));
  assert.deepEqual(primaryList.map(page=>page.pageId).sort(),primaryTabs.map(page=>page.pageId).sort());
  assert.deepEqual(secondaryList.map(page=>page.pageId).sort(),secondaryTabs.map(page=>page.pageId).sort());
  await assert.rejects(primary.evaluate(pageId=>window.aux.invoke('pages.activate',{pageId}),secondaryTabs[1].pageId),/another Aux window/);

  // Browser spaces are synced profile-wide — distinct ids keep each window's
  // own space instead of collapsing two same-id fixtures into one.
  for(const record of [{shell:primary,name:'Primary space',spaceId:'primary-space',tabs:primaryTabs},{shell:secondary,name:'Secondary space',spaceId:'secondary-space',tabs:secondaryTabs}]){
    await record.shell.evaluate(({name,spaceId,tabs})=>{
      const id=window.aux.windowId;
      localStorage.setItem(`aux.layout.v1:${id}`,JSON.stringify({spaces:[{id:spaceId,name,color:'slate'}],activeSpaceId:spaceId,order:tabs.map(tab=>tab.pageId),tabSpace:Object.fromEntries(tabs.map(tab=>[tab.pageId,spaceId])),pins:{},folders:[],tabFolder:{}}));
    },{name:record.name,spaceId:record.spaceId,tabs:record.tabs});
    await record.shell.reload();
    await record.shell.locator('.app-body').waitFor();
    // The import broadcasts spaces.updated to every window, which schedules a
    // debounced layout write there; let it land before the next injection or
    // that window's pagehide flush overwrites the injected layout.
    await poll(record.shell,name=>window.aux.invoke('spaces.list',{}).then(spaces=>spaces.some(space=>space.name===name)),record.name);
    await delay(400);
  }
  console.log('multi-window: independent layouts ready');

  await secondaryFixture.getByLabel('Draft').fill('unsaved secondary window draft');
  await app.evaluate(({dialog})=>{globalThis.multiWindowAnswers=[0];const answer=(...args)=>{const options=args.at(-1);if(options.title!=='Leave website?')throw new Error(`Unexpected dialog ${options.title}`);return globalThis.multiWindowAnswers.shift()??0;};dialog.showMessageBoxSync=answer;dialog.showMessageBox=async(...args)=>({response:answer(...args),checkboxChecked:false});});
  await secondary.evaluate(()=>window.aux.closeWindow());
  await delay(500);
  assert.equal((await shells(2)).length,2,'Canceling unsaved work must preserve only the requested window and its draft');
  assert.equal(await secondaryFixture.getByLabel('Draft').inputValue(),'unsaved secondary window draft');
  await secondaryFixture.getByLabel('Draft').fill('');
  console.log('multi-window: window-close cancellation passed');

  const beforePrimary=await snapshot(primary);
  const beforeSecondary=await snapshot(secondary);
  assert.equal(beforePrimary.workspace.activePageId,primaryTabs[1].pageId);
  assert.equal(beforeSecondary.workspace.activePageId,secondaryTabs[1].pageId);
  console.log('multi-window: restarting');
  await app.close();
  app=await launch();
  const restored=await shells(2);
  console.log('multi-window: restored shells ready');
  const restoredPrimary=restored.find(item=>item.id==='main');
  const restoredSecondary=restored.find(item=>item.id===secondaryRecord.id);
  assert.ok(restoredPrimary&&restoredSecondary,'Restart must recreate both durable regular windows');
  await restoredPrimary.page.locator('.app-body').waitFor();
  await restoredSecondary.page.locator('.app-body').waitFor();
  let afterPrimary,afterSecondary;
  for(let attempt=0;attempt<150;attempt++){
    afterPrimary=await snapshot(restoredPrimary.page);afterSecondary=await snapshot(restoredSecondary.page);
    // Space sync converges asynchronously from the runtime — wait for it with
    // the tab restore instead of snapshotting mid-import.
    const spacesReady=afterPrimary.layout?.spaces?.some(space=>space.name==='Primary space')&&afterSecondary.layout?.spaces?.some(space=>space.name==='Secondary space');
    if(afterPrimary.workspace.pages.length===2&&afterSecondary.workspace.pages.length===2&&!afterPrimary.workspace.restoringTabs&&!afterSecondary.workspace.restoringTabs&&spacesReady)break;
    await delay(100);
  }
  assert.deepEqual(afterPrimary.workspace.pages.map(page=>page.pageId).sort(),primaryTabs.map(page=>page.pageId).sort());
  assert.deepEqual(afterSecondary.workspace.pages.map(page=>page.pageId).sort(),secondaryTabs.map(page=>page.pageId).sort());
  assert.equal(afterPrimary.workspace.activePageId,primaryTabs[1].pageId);
  assert.equal(afterSecondary.workspace.activePageId,secondaryTabs[1].pageId);
  assert.ok(afterPrimary.layout.spaces.some(space=>space.name==='Primary space'),'restored primary window keeps its space');
  assert.ok(afterSecondary.layout.spaces.some(space=>space.name==='Secondary space'),'restored secondary window keeps its space');
  const ids=[...afterPrimary.workspace.pages,...afterSecondary.workspace.pages].map(page=>page.pageId);
  assert.equal(new Set(ids).size,ids.length,'Restored windows must not duplicate tabs');
  console.log('Two regular Aux windows browse independently, share one signed-in profile, protect drafts, and restore their own tabs, selection, and sidebar layout.');
}finally{
  await app?.close().catch(()=>{});
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  rmSync(dir,{recursive:true,force:true});
}
