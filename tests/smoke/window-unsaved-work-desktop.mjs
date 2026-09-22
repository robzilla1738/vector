// Whole-window unsaved-work qualification; isolated profile, synthetic text only.
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
const root=resolve(import.meta.dirname,'../..');
const mode=process.argv.includes('--quit')?'quit':'window';
const embedded=process.argv.includes('--frame');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-window-unsaved-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');if(embedded&&req.url==='/draft'){res.end(`<title>Embedded draft</title><iframe title="Editor" src="http://127.0.0.1:${server.address().port}/embedded"></iframe>`);return;}res.end(`<title>Draft ${req.url}</title><label>Draft<textarea id="draft"></textarea></label><a href="/destination">Continue</a>${req.url==='/clean'?'':`<script>addEventListener('beforeunload',e=>{if(draft.value){e.preventDefault();e.returnValue='';}});</script>`}`)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
let app;let appEnded=false;
try{
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);page.setDefaultTimeout(15000);await page.locator('.aux-home').waitFor();
 await app.evaluate(({dialog})=>{globalThis.unloadAnswers=[];globalThis.unloadPrompts=[];const respond=(...args)=>{const options=args.at(-1);if(options.title!=='Leave website?')throw new Error('Unexpected dialog');globalThis.unloadPrompts.push({message:options.message,defaultId:options.defaultId});globalThis.changeDuringUnload?.();const response=globalThis.unloadAnswers.shift();if(typeof response!=='number')throw new Error('Missing synthetic response');return response;};dialog.showMessageBoxSync=respond;dialog.showMessageBox=async(...args)=>({response:respond(...args),checkboxChecked:false});});
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/draft');
 let fixture;for(let i=0;i<100;i++){fixture=app.windows().find(p=>p.url()===base+'/draft');if(fixture)break;await new Promise(r=>setTimeout(r,50));}assert.ok(fixture);fixture.on('dialog',()=>{});
 const editor=embedded?fixture.frameLocator('iframe'):fixture;
 async function dirty(){await editor.getByLabel('Draft',{exact:true}).click();await editor.getByLabel('Draft',{exact:true}).fill('unsaved synthetic draft');}
 const answer=number=>app.evaluate((_,number)=>globalThis.unloadAnswers.push(number),number);
 // Whole-window cancellation must preserve every live document and selection.
 const clean=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:false}),base+'/clean');
 await dirty();
 if(process.argv.includes('--timeout')) {
   // Deterministically model a stalled renderer acknowledgement without freezing
   // the test driver or touching a real user document.
   await app.evaluate(({webContents},url)=>{
     const wc=webContents.getAllWebContents().find(w=>w.getURL()===url);
     const original=wc.executeJavaScriptInIsolatedWorld;
     globalThis.restoreUnloadInjection=()=>{wc.executeJavaScriptInIsolatedWorld=original;globalThis.releaseUnloadInjection?.();};
     wc.executeJavaScriptInIsolatedWorld=function(...args){return new Promise(resolve=>{globalThis.releaseUnloadInjection=()=>resolve(original.apply(wc,args));});};
   },base+'/draft');
   await app.evaluate(({app})=>app.quit());
   await new Promise(resolve=>setTimeout(resolve,16000));
   assert.equal(await app.evaluate(()=>globalThis.unloadPrompts.length),0);
   await app.evaluate(()=>globalThis.restoreUnloadInjection());
   assert.equal(await editor.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
 }
 await answer(0);
 const before=await page.evaluate(()=>window.aux.invoke('pages.list',{}));
 const selection=await page.locator('.tab-row.active').innerText();
 const closed=new Promise(resolve=>app.once('close',()=>{appEnded=true;resolve(true);}));
 await app.evaluate(({BaseWindow,app},mode)=>{setTimeout(()=>mode==='quit'?app.quit():BaseWindow.getAllWindows()[0].close(),50);},mode);
 const exited=await Promise.race([closed,new Promise(resolve=>setTimeout(()=>resolve(false),1500))]);
 assert.equal(exited,false,`${mode}: canceling unsaved work must keep the browser window alive`);
 assert.equal(await app.evaluate(()=>globalThis.unloadPrompts.length),1,'Window close must consult the native unsaved-work decision');
 assert.equal(await editor.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
 const after=await page.evaluate(()=>window.aux.invoke('pages.list',{}));
 assert.deepEqual(after.map(p=>p.pageId),before.map(p=>p.pageId),'Cancel must preserve all tabs');
 assert.equal(after.some(p=>p.pageId===clean.pageId),true);
 assert.equal(await page.locator('.tab-row.active').innerText(),selection);
 // A later veto must not destroy an earlier approved document or clean tab.
 const second=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/second');
 let other;for(let i=0;i<100;i++){other=app.windows().find(p=>p.url()===base+'/second');if(other)break;await new Promise(r=>setTimeout(r,50));}assert.ok(other);other.on('dialog',()=>{});
 await other.getByLabel('Draft',{exact:true}).click();await other.getByLabel('Draft',{exact:true}).fill('second unsaved draft');
 await answer(1);await answer(0);
 await app.evaluate(({BaseWindow,app},mode)=>{setTimeout(()=>mode==='quit'?app.quit():BaseWindow.getAllWindows()[0].close(),50);},mode);
 await poll(app,()=>globalThis.unloadPrompts.length===3);
 assert.equal(await editor.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
 assert.equal(await other.getByLabel('Draft',{exact:true}).inputValue(),'second unsaved draft');
 const remaining=await page.evaluate(()=>window.aux.invoke('pages.list',{}));
 assert.deepEqual(remaining.map(p=>p.pageId),[...before.map(p=>p.pageId),second.pageId]);
 if(process.argv.includes('--navigate')) {
   await app.evaluate(({webContents},base)=>{
     globalThis.changeDuringUnload=()=>{
       globalThis.changeDuringUnload=undefined;
       void webContents.getAllWebContents().find(w=>w.getURL()===base+'/clean').loadURL(base+'/clean?changed');
     };
   },base);
   await answer(1);await answer(1);
   await app.evaluate(({app})=>app.quit());
   await poll(app,({webContents},url)=>webContents.getAllWebContents().some(w=>w.getURL()===url),base+'/clean?changed');
   assert.equal(await Promise.race([closed,new Promise(resolve=>setTimeout(()=>resolve(false),1500))]),false,'Navigation must invalidate prior exit approval');
   assert.equal(await editor.getByLabel('Draft',{exact:true}).inputValue(),'unsaved synthetic draft');
   assert.equal(await other.getByLabel('Draft',{exact:true}).inputValue(),'second unsaved draft');
   await app.evaluate(()=>{globalThis.unloadAnswers=[];});
 }
 await answer(1);await answer(1);
 await app.evaluate(({BaseWindow,app},mode)=>{setTimeout(()=>mode==='quit'?app.quit():BaseWindow.getAllWindows()[0].close(),50);},mode);
 assert.equal(await Promise.race([closed,new Promise(resolve=>setTimeout(()=>resolve(false),15000))]),true,'Explicit leave for every dirty tab must exit');
 console.log(`${mode}${embedded?' with cross-origin editor':''}: cancellation preserves all documents, including earlier approved and clean tabs; unanimous leave exits.`);
}finally{
 if(app&&!appEnded){try{await app.evaluate(({app})=>app.exit(0));}catch{} await app.close().catch(()=>{});}
 server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});
}
