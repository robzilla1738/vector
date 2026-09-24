// Native browsing must work while the runtime is stopped and survive crash/wake recovery.
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import { launchAux } from './launch.mjs';

const root=resolve(import.meta.dirname,'../..');
const dir=mkdtempSync(join(tmpdir(),'aux-runtime-recovery-'));
const server=createServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Runtime recovery</title><h1>Runtime recovery</h1><textarea aria-label="Unsaved draft"></textarea>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/work`;
let app;

function childRuntimePid(parentPid){
  const lines=execFileSync('/bin/ps',['-axo','pid=,ppid=,command='],{encoding:'utf8'}).trim().split('\n');
  for(const line of lines){
    const match=line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if(match&&Number(match[2])===parentPid&&match[3].includes('/apps/runtime/dist/main.js'))return Number(match[1]);
  }
  return null;
}

try{
  let shell;({ app, page: shell } = await launchAux({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}}));shell.setDefaultTimeout(20000);await shell.locator('.app').waitFor();
  await shell.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),url);
  let website;for(let i=0;i<100;i++){website=app.windows().find(page=>page.url()===url);if(website)break;await new Promise(resolve=>setTimeout(resolve,50));}assert.ok(website);await website.getByRole('heading',{name:'Runtime recovery'}).waitFor();
  await website.getByLabel('Unsaved draft').fill('Keep this live document through runtime recovery');
  const mainPid=app.process().pid;
  let runtimePid;for(let i=0;i<100;i++){runtimePid=childRuntimePid(mainPid);if(runtimePid)break;await new Promise(resolve=>setTimeout(resolve,50));}assert.ok(runtimePid,'runtime child must be discoverable below the isolated Electron main process');
  const originalCatalog=await shell.evaluate(()=>window.aux.tabsSnapshot());
  const secondUrl=url.replace('/work','/second');
  process.kill(runtimePid,'SIGSTOP');
  try{
    await shell.bringToFront();
    await shell.keyboard.press('Meta+t');
    for(let i=0;i<100;i++){if((await shell.evaluate(()=>window.aux.tabsSnapshot())).tabs.length===originalCatalog.tabs.length+1)break;await new Promise(resolve=>setTimeout(resolve,50));}
    const address=shell.getByRole('combobox',{name:/Search or address/});
    await address.fill(secondUrl);
    assert.equal(await address.inputValue(),secondUrl);
    await shell.locator('.cmdbar.hero [role=option]').first().waitFor();
    await address.press('Enter');
    let second;for(let i=0;i<100;i++){second=app.windows().find(page=>page.url()===secondUrl);if(second)break;await new Promise(resolve=>setTimeout(resolve,50));}
    assert.ok(second,'human navigation must load a native page while the AI runtime is stopped');
    await second.getByRole('heading',{name:'Runtime recovery'}).waitFor();
    const offlineCatalog=await shell.evaluate(()=>window.aux.tabsSnapshot());
    assert.equal(offlineCatalog.tabs.length,originalCatalog.tabs.length+1,'native tab creation must not wait for the runtime');
    assert.ok(offlineCatalog.tabs.some(tab=>tab.url===secondUrl),'native navigation must commit while the runtime is stopped');
    await shell.keyboard.press('Control+Shift+Tab');
    assert.equal((await shell.evaluate(()=>window.aux.tabsSnapshot())).windows[0].activePageId,originalCatalog.windows[0].activePageId,'the original tab must activate while the runtime is stopped');
    await shell.keyboard.press('Control+Tab');
    assert.equal((await shell.evaluate(()=>window.aux.tabsSnapshot())).windows[0].activePageId,offlineCatalog.windows[0].activePageId,'the new tab must reactivate while the runtime is stopped');
    assert.equal(childRuntimePid(mainPid),runtimePid,'the runtime must remain stopped during the browsing proof');
    assert.equal(await website.getByLabel('Unsaved draft').inputValue(),'Keep this live document through runtime recovery');
  }finally{
    process.kill(runtimePid,'SIGCONT');
  }
  let before;for(let i=0;i<100;i++){before=await shell.evaluate(()=>window.aux.invoke('workspace.get',{}));if(before.pages.some(page=>page.url===secondUrl))break;await new Promise(resolve=>setTimeout(resolve,50));}
  assert.ok(before.pages.some(page=>page.url===secondUrl),'the resumed runtime must discover the tab opened while it was stopped');
  process.kill(runtimePid,'SIGKILL');
  await shell.getByText(/Runtime reconnecting/).waitFor();
  await shell.screenshot({path:join(root,'release/test-artifacts/aux-runtime-reconnecting.png')});
  await shell.getByText(/Runtime reconnecting/).waitFor({state:'hidden',timeout:30000});
  const after=await shell.evaluate(()=>window.aux.invoke('workspace.get',{}));
  assert.deepEqual(after.pages.map(page=>page.pageId),before.pages.map(page=>page.pageId),'runtime recovery must attach to existing tabs without duplicates');
  assert.equal(after.activePageId,before.activePageId,'runtime recovery must preserve tab selection');
  assert.equal(await website.getByLabel('Unsaved draft').inputValue(),'Keep this live document through runtime recovery','runtime recovery must preserve the live renderer and unsaved form state');
  await app.evaluate(({powerMonitor})=>powerMonitor.emit('resume'));
  await new Promise(resolve=>setTimeout(resolve,500));
  const afterWake=await shell.evaluate(()=>window.aux.invoke('workspace.get',{}));
  assert.deepEqual(afterWake.pages.map(page=>page.pageId),before.pages.map(page=>page.pageId),'wake health check must not duplicate or replace tabs');
  assert.equal(await website.getByLabel('Unsaved draft').inputValue(),'Keep this live document through runtime recovery');
  console.log('Aux opens, navigates, and switches native tabs while its AI runtime is stopped, then reconnects after runtime loss and synthetic wake without replacing live tabs, changing selection, or losing an unsaved page draft.');
}finally{
  await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});
}
