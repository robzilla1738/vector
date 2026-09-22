// Native browser + real beforeunload handlers; only synthetic unsaved text.
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-unsaved-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<title>Draft ${req.url}</title><label>Draft<textarea id="draft"></textarea></label><a href="/destination">Continue</a><script>addEventListener('beforeunload',e=>{if(draft.value){e.preventDefault();e.returnValue='';}});</script>`)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
let app;
try{
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);page.setDefaultTimeout(15000);await page.locator('.aux-home').waitFor();
 await app.evaluate(({dialog})=>{globalThis.unloadAnswers=[];globalThis.unloadPrompts=[];const respond=(...args)=>{const options=args.at(-1);if(options.title!=='Leave website?')throw new Error('Unexpected dialog');globalThis.unloadPrompts.push({message:options.message,defaultId:options.defaultId});const response=globalThis.unloadAnswers.shift();if(typeof response!=='number')throw new Error('Missing synthetic response');return response;};dialog.showMessageBoxSync=respond;dialog.showMessageBox=async(...args)=>({response:respond(...args),checkboxChecked:false});});
 const first=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/draft');
 let fixture;for(let i=0;i<100;i++){fixture=app.windows().find(p=>p.url()===base+'/draft');if(fixture)break;await new Promise(r=>setTimeout(r,50));}assert.ok(fixture);fixture.on('dialog',()=>{});
 async function dirty(){await fixture.getByLabel('Draft',{exact:true}).click();await fixture.getByLabel('Draft',{exact:true}).fill('unsaved synthetic draft');}
 const answer=number=>app.evaluate((_,number)=>globalThis.unloadAnswers.push(number),number);
 await dirty();await answer(0);
 assert.deepEqual(await page.evaluate(pageId=>window.aux.invoke('pages.close',{pageId}),first.pageId),{ok:false});
 assert.equal(await fixture.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
 assert.equal((await page.evaluate(()=>window.aux.invoke('pages.list',{}))).some(p=>p.pageId===first.pageId),true);
 assert.equal((await app.evaluate(()=>globalThis.unloadPrompts))[0].defaultId,0);
 assert.match((await app.evaluate(()=>globalThis.unloadPrompts))[0].message,/localhost/);
 // Cancel a renderer link navigation without losing the live document.
 await answer(0);await fixture.getByRole('link',{name:'Continue',exact:true}).click({noWaitAfter:true});
 await poll(app,()=>globalThis.unloadPrompts.length===2);
 await poll(page,async()=> (await window.aux.invoke('pages.list',{})).some(p=>p.url.endsWith('/draft')&&!p.loading));
 assert.equal(await fixture.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
 // Reload cancellation and acceptance are routed through the same human decision.
 await answer(0);await app.evaluate(({webContents},url)=>webContents.getAllWebContents().find(w=>w.getURL()===url).reload(),base+'/draft');
 for(let i=0;i<100&&(await app.evaluate(()=>globalThis.unloadPrompts.length))<3;i++)await new Promise(r=>setTimeout(r,50));
 assert.equal(await app.evaluate(()=>globalThis.unloadPrompts.length),3);
 assert.equal(await fixture.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
 await answer(1);await app.evaluate(({webContents},url)=>webContents.getAllWebContents().find(w=>w.getURL()===url).reload(),base+'/draft');
 await fixture.waitForFunction(()=>document.querySelector('textarea')?.value==='');
 await dirty();await answer(1);
 assert.deepEqual(await page.evaluate(pageId=>window.aux.invoke('pages.close',{pageId}),first.pageId),{ok:true});
 await poll(page,async id=>!(await window.aux.invoke('pages.list',{})).some(p=>p.pageId===id),first.pageId);
 const clean=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/clean');
 const count=await app.evaluate(()=>globalThis.unloadPrompts.length);
 assert.deepEqual(await page.evaluate(pageId=>window.aux.invoke('pages.close',{pageId}),clean.pageId),{ok:true});
 assert.equal(await app.evaluate(()=>globalThis.unloadPrompts.length),count);
 console.log('Unsaved draft survives canceled tab close, link navigation and reload; explicit leave reloads/closes, while clean tabs close without a prompt.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
