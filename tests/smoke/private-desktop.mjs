// Real private Aux process; isolated local site and synthetic profile only.
import {createRequire} from 'node:module';
import {mkdtempSync,existsSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';

const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-private-product-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<title>${req.url==='/second'?'Private second':'Private fixture'}</title><h1>${req.url==='/second'?'Private second':'Private fixture'}</h1><textarea id="private-draft" aria-label="Private draft"></textarea><a href="/second">Second page</a>${req.url==='/start'?`<script>addEventListener('beforeunload',event=>{if(document.getElementById('private-draft').value){event.preventDefault();event.returnValue='';}});</script>`:''}`);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const env={PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'regular-profile'),AUX_DATA_DIR:join(dir,'regular-data'),AUX_LOAD_DOTENV:'0'};
const playwrightReportPath=join(dir,'playwright-private-report.json');
let app;
const launch=async()=>{
 const next=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--aux-private'],env:{...env,AUX_PRIVATE_TEST_REPORT:playwrightReportPath,AUX_PRIVATE_TEST_UNLOAD_RESPONSES:'0,1'}});
 let shell;for(let i=0;i<100;i++){shell=next.windows().find(page=>page.url().includes('renderer/index.html'));if(shell)break;await new Promise(r=>setTimeout(r,100));}assert.ok(shell);shell.setDefaultTimeout(15000);await shell.locator('.app').waitFor();return {next,shell};
};
try{
 let started=await launch();app=started.next;let shell=started.shell;
 await shell.getByRole('region',{name:'Private browsing',exact:true}).waitFor();
 await shell.getByLabel('Collapse sidebar').evaluate(button=>button.click());await shell.waitForTimeout(400);
 assert.equal(await shell.locator('.sidebar').evaluate(element=>getComputedStyle(element).width),'0px','private sidebar must collapse completely');
 assert.equal(await shell.getByLabel('Show sidebar').count(),1,'collapsed shell must retain a reveal target');
 await shell.getByLabel('Show sidebar').evaluate(button=>button.click());await shell.waitForTimeout(400);
 assert.notEqual(await shell.locator('.sidebar').evaluate(element=>getComputedStyle(element).width),'0px','private sidebar must restore without losing its structure');
 await shell.screenshot({path:join(root,'release/test-artifacts/aux-private-home.png')});
 assert.equal(await shell.getByText('New chat',{exact:true}).count(),0);assert.equal(await shell.getByLabel('Toggle agent rail').count(),0);assert.equal(await shell.getByLabel('Settings').count(),0);
 const blank=(await shell.evaluate(()=>window.aux.invoke('pages.list',{})))[0];assert.equal(blank.url,'about:blank');
 await shell.evaluate(({pageId,url})=>window.aux.invoke('pages.navigate',{pageId,url}),{pageId:blank.pageId,url:base+'/start'});
 await poll(shell,async url=>(await window.aux.invoke('pages.list',{})).some(page=>page.url===url&&!page.loading),base+'/start');
 let site=app.windows().find(page=>page.url()===base+'/start');assert.ok(site);site.on('dialog',()=>{});await site.getByRole('heading',{name:'Private fixture',exact:true}).waitFor();
 assert.equal(await app.evaluate(({webContents},url)=>webContents.getAllWebContents().find(contents=>contents.getURL()===url)?.session.isPersistent(),base+'/start'),false);
 assert.equal(await site.evaluate(()=>globalThis.__auxTid),undefined);
 await site.evaluate(()=>{document.cookie='private_cookie=synthetic; SameSite=Lax; Path=/';localStorage.setItem('private-value','synthetic');});
 await site.getByLabel('Private draft').fill('Private unsaved work');
 await shell.getByRole('button',{name:'Site controls',exact:true}).click();
 const siteControls=shell.getByRole('dialog',{name:base});await siteControls.getByText('1 cookie currently visible to this page',{exact:true}).waitFor();
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});});
 await siteControls.getByRole('button',{name:'Clear…',exact:true}).click();await siteControls.getByText('0 cookies currently visible to this page',{exact:true}).waitFor();
 assert.equal(await site.evaluate(()=>document.cookie),'');assert.equal(await site.evaluate(()=>localStorage.getItem('private-value')),null);
 await siteControls.getByRole('button',{name:'Close site controls',exact:true}).click();
 await site.evaluate(()=>{document.cookie='private_cookie=synthetic; SameSite=Lax; Path=/';localStorage.setItem('private-value','synthetic');});
 await shell.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/second');
 await poll(shell,async url=>(await window.aux.invoke('pages.list',{})).some(page=>page.url===url&&!page.loading),base+'/second');
 assert.equal((await shell.evaluate(()=>window.aux.invoke('pages.list',{}))).length,2);
 const second=(await shell.evaluate(()=>window.aux.invoke('pages.list',{}))).find(page=>page.url===base+'/second');await shell.evaluate(pageId=>window.aux.invoke('pages.close',{pageId}),second.pageId);
 await shell.waitForFunction(()=>!Array.from(document.querySelectorAll('.tab-title')).some(element=>element.textContent==='Private second'));
 assert.deepEqual(await shell.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('aux.closed-tabs.'))),[],'private tabs must not enter recently closed recovery storage');
 await shell.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/second');
 await poll(shell,async url=>(await window.aux.invoke('pages.list',{})).some(page=>page.url===url&&!page.loading),base+'/second');
 assert.equal(await site.getByLabel('Private draft').inputValue(),'Private unsaved work');
 await shell.screenshot({path:join(root,'release/test-artifacts/aux-private.png')});
 const scratch=await app.evaluate(({app})=>app.getPath('userData'));
 assert.equal(await app.evaluate(({app})=>app.commandLine.hasSwitch('remote-debugging-port')),true,'Playwright adds its own inspection endpoint to this UI-only run');
 assert.equal(existsSync(join(dir,'regular-data')),false,'private product must not create the regular runtime data directory');
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].close());
 for(let i=0;i<150&&!JSON.parse(readFileSync(playwrightReportPath,'utf8')).controlEvents.includes('unload-prompt:0');i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(JSON.parse(readFileSync(playwrightReportPath,'utf8')).controlEvents.includes('unload-prompt:0'),true);
 assert.equal((await shell.evaluate(()=>window.aux.invoke('pages.list',{}))).length,2,'staying must preserve every private tab');
 assert.equal(await site.getByLabel('Private draft').inputValue(),'Private unsaved work','staying must preserve the private draft');
 const privateClosed=new Promise(resolve=>app.once('close',resolve));
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].close());
 await Promise.race([privateClosed,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Private window did not close after Leave')),15000))]);app=undefined;
 assert.equal(existsSync(scratch),false,'private process scratch data should be removed after a clean close');

 started=await launch();app=started.next;shell=started.shell;
 const freshBlank=(await shell.evaluate(()=>window.aux.invoke('pages.list',{})))[0];assert.equal(freshBlank.url,'about:blank');
 assert.deepEqual(await shell.evaluate(()=>window.aux.invoke('history.list',{})),[]);
 await shell.evaluate(({pageId,url})=>window.aux.invoke('pages.navigate',{pageId,url}),{pageId:freshBlank.pageId,url:base+'/start'});
 await poll(shell,async url=>(await window.aux.invoke('pages.list',{})).some(page=>page.url===url&&!page.loading),base+'/start');
 const fresh=await shell.evaluate(()=>window.aux.invoke('pages.list',{}));assert.equal(fresh.length,1);assert.equal(fresh[0].url,base+'/start');
 site=app.windows().find(page=>page.url()===base+'/start');assert.ok(site);
 assert.equal(await site.evaluate(()=>document.cookie),'');assert.equal(await site.evaluate(()=>localStorage.getItem('private-value')),null);assert.equal(await site.getByLabel('Private draft').inputValue(),'');
 const currentHistory=await shell.evaluate(()=>window.aux.invoke('history.list',{}));assert.equal(currentHistory.length,1);assert.equal(currentHistory[0].url,base+'/start');
 await app.close();app=undefined;

 const reportPath=join(dir,'direct-private-report.json');
 const direct=spawn(electron,[join(root,'apps/desktop'),'--aux-private'],{stdio:'ignore',env:{...env,AUX_PRIVATE_TEST_REPORT:reportPath,AUX_PRIVATE_TEST_EXIT:'1'}});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{direct.kill();reject(new Error('Direct private process did not exit'));},15000);direct.once('error',reject);direct.once('exit',()=>{clearTimeout(timer);resolve();});});
 const report=JSON.parse(readFileSync(reportPath,'utf8'));assert.equal(report.remoteDebugging,false);assert.equal(report.pageSessionPersistent,false);assert.equal(existsSync(join(report.userData,'DevToolsActivePort')),false);assert.equal(existsSync(report.userData),false);
 const menuReportPath=join(dir,'menu-private-report.json');
 const regular=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{...env,AUX_PRIVATE_TEST_REPORT:menuReportPath,AUX_PRIVATE_TEST_EXIT:'1'}});
 let regularEnded=false;
 try{
  let regularShell;for(let i=0;i<100;i++){regularShell=regular.windows().find(page=>page.url().includes('renderer/index.html'));if(regularShell)break;await new Promise(r=>setTimeout(r,100));}assert.ok(regularShell);await regularShell.locator('.app').waitFor();
  const launched=await regular.evaluate(({Menu})=>{const item=Menu.getApplicationMenu()?.getMenuItemById('new-private-window');if(!item)return false;item.click();return true;});assert.equal(launched,true,'regular File menu must expose New Private Window');
  for(let i=0;i<150&&!existsSync(menuReportPath);i++)await new Promise(r=>setTimeout(r,100));assert.equal(existsSync(menuReportPath),true,'regular File menu must launch the private process');
  const menuReport=JSON.parse(readFileSync(menuReportPath,'utf8'));assert.equal(menuReport.remoteDebugging,false);assert.equal(menuReport.pageSessionPersistent,false);
  for(let i=0;i<100&&existsSync(menuReport.userData);i++)await new Promise(r=>setTimeout(r,100));assert.equal(existsSync(menuReport.userData),false,'menu-launched private process must clean its scratch profile');
  const firstReportPath=join(dir,'coordinated-private-first.json');const secondReportPath=join(dir,'coordinated-private-second.json');
  const launchDirtyChild=async(reportPath,responses)=>{
   await regular.evaluate(({Menu},{reportPath,responses,url})=>{process.env.AUX_PRIVATE_TEST_REPORT=reportPath;process.env.AUX_PRIVATE_TEST_INITIAL_URL=url;process.env.AUX_PRIVATE_TEST_DIRTY='1';process.env.AUX_PRIVATE_TEST_UNLOAD_RESPONSES=responses;delete process.env.AUX_PRIVATE_TEST_EXIT;Menu.getApplicationMenu()?.getMenuItemById('new-private-window')?.click();},{reportPath,responses,url:base+'/start'});
   for(let i=0;i<150&&!existsSync(reportPath);i++)await new Promise(r=>setTimeout(r,100));assert.equal(existsSync(reportPath),true);
   return JSON.parse(readFileSync(reportPath,'utf8'));
  };
  const firstChild=await launchDirtyChild(firstReportPath,'1,1');const secondChild=await launchDirtyChild(secondReportPath,'0,1');
  await regular.evaluate(({app})=>app.quit());
  for(let i=0;i<250;i++){const firstEvents=JSON.parse(readFileSync(firstReportPath,'utf8')).controlEvents;const secondEvents=JSON.parse(readFileSync(secondReportPath,'utf8')).controlEvents;if(firstEvents.includes('abort:true')&&secondEvents.includes('prepare:false'))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(JSON.parse(readFileSync(firstReportPath,'utf8')).controlEvents.includes('abort:true'),true,'an earlier private approval must be aborted after a later veto');
  assert.equal(JSON.parse(readFileSync(secondReportPath,'utf8')).controlEvents.includes('prepare:false'),true,'a private Stay decision must cancel whole-app Quit');
  assert.equal(await regular.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0]?.isVisible()),true,'canceled whole-app Quit must restore the regular window');
  assert.equal(existsSync(firstChild.userData),true);assert.equal(existsSync(secondChild.userData),true,'canceled whole-app Quit must preserve every private process');
  const regularClosed=new Promise(resolve=>regular.once('close',()=>{regularEnded=true;resolve(true);}));
  await regular.evaluate(({app})=>app.quit());
  assert.equal(await Promise.race([regularClosed,new Promise(resolve=>setTimeout(()=>resolve(false),30000))]),true,'unanimous Leave must complete whole-app Quit');
  for(let i=0;i<100&&(existsSync(firstChild.userData)||existsSync(secondChild.userData));i++)await new Promise(r=>setTimeout(r,100));
  assert.equal(existsSync(firstChild.userData),false);assert.equal(existsSync(secondChild.userData),false,'committed whole-app Quit must clean every private scratch profile');
 }finally{if(!regularEnded){await regular.evaluate(({app})=>app.exit(0)).catch(()=>{});await regular.close().catch(()=>{});}}
 console.log('Private Aux launches from the regular File menu, protects unsaved work and isolation, and coordinates whole-app Quit without sacrificing earlier windows when a later private window stays.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
