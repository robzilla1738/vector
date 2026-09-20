// Synthetic login-window lifecycle; no real accounts or credential stores.
import {poll} from './poll.mjs';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/engine-client/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-sign-in-popup-'));
const server=createServer((req,res)=>{
 res.setHeader('Content-Type','text/html');
 if(req.url==='/post'){let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>res.end(`<title>Posted login</title><body data-method="${req.method}">${body}</body>`));return;}
 if(req.url==='/quick'){res.end('<script>window.close()</script>');return;}
 if(req.url.startsWith('/auth'))res.end(`<title>Sign-in fixture</title><button onclick="opener.postMessage('signed-in',location.origin);window.close()">Finish sign in</button><textarea aria-label="Unsaved sign-in note"></textarea><script>document.body.dataset.session=document.cookie;document.body.dataset.loads=String(Number(sessionStorage.loads||0)+1);sessionStorage.loads=document.body.dataset.loads;addEventListener('beforeunload',e=>{if(document.querySelector('textarea').value){e.preventDefault();e.returnValue='';}});</script>`);
 else {res.setHeader('Set-Cookie','aux_fixture=session; SameSite=Lax; Path=/');res.end(`<title>Account fixture</title><button onclick="window.open('/auth','login','popup,width=480,height=600')">Sign in</button><output id="result"></output><script>onmessage=e=>{if(e.origin===location.origin)document.querySelector('output').textContent=e.data}</script>`);}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let app;
try{
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0',AUX_ENGINE:'0',AUX_ENGINE_MODE:'off'}});
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);
 await page.locator('.aux-home').waitFor();
 const tab=await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),base);
 const run=async(url,code)=>app.evaluate(({webContents},{url,code})=>webContents.getAllWebContents().find(w=>w.getURL()===url).executeJavaScript(code),{url,code});
 await poll(page,async id=>(await window.vector.invoke('pages.list',{})).some(t=>t.pageId===id&&!t.loading),tab.pageId);
 await run(base+'/','document.querySelector("button").click()');
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 let popup=(await page.evaluate(()=>window.vector.invoke('pages.list',{}))).find(t=>t.pageId.startsWith('pop_'));
 assert.ok(popup);
 await page.evaluate(id=>window.vector.invoke('pages.activate',{pageId:id}),popup.pageId);
 assert.equal(await run(base+'/auth','document.body.dataset.session'),'aux_fixture=session');
 // Resizing the main stage must not resize or hide its independent sign-in window.
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows().find(w=>!('webContents' in w)).setSize(1220,900));
 await page.evaluate(id=>window.vector.invoke('pages.activate',{pageId:id}),tab.pageId);
 const geometry=await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/auth'));return {visible:w.isVisible(),width:w.getBounds().width};});
 assert.equal(geometry.visible,true);assert.equal(geometry.width,480);
 await run(base+'/auth','document.querySelector("button").click()');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 assert.equal(await run(base+'/','document.querySelector("output").textContent'),'signed-in');
 // Independent windows own their browser menu commands, even when the main
 // tab remains selected. Canceling popup close must not close that main tab.
 await run(base+'/','document.querySelector("button").click()');
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/auth')).focus());
 await poll(app,({BaseWindow,BrowserWindow})=>BaseWindow.getFocusedWindow()===BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/auth')));
 const mainBefore=await run(base+'/','document.querySelector("output").textContent');
 const loads=Number(await run(base+'/auth','document.body.dataset.loads'));
 const menu=label=>app.evaluate(({Menu},label)=>Menu.getApplicationMenu().items.flatMap(item=>item.submenu?.items??[]).find(item=>item.label===label).click(),label);
 await menu('Reload');
 await poll(app,({webContents},loads)=>webContents.getAllWebContents().find(w=>w.getURL().endsWith('/auth')).executeJavaScript('Number(document.body.dataset.loads)').then(n=>n>loads),loads);
 assert.equal(await run(base+'/','document.querySelector("output").textContent'),mainBefore,'Reload must not reload the opener');
 await menu('Zoom In');
 assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/auth')).webContents.getZoomLevel()),0.5);
 await menu('Actual Size');
 const authPage=app.windows().find(p=>p.url()===base+'/auth');assert.ok(authPage);authPage.on('dialog',()=>{});
 await authPage.evaluate(()=>{location.href='/auth?next';});
 await authPage.waitForURL(base+'/auth?next');
 await menu('Back');
 await authPage.waitForURL(base+'/auth');
 await menu('Forward');
 await authPage.waitForURL(base+'/auth?next');
 await menu('Back');
 await authPage.waitForURL(base+'/auth');
 await authPage.getByLabel('Unsaved sign-in note').click();await authPage.getByLabel('Unsaved sign-in note').fill('synthetic note');
 await app.evaluate(({dialog})=>{globalThis.popupCloseAnswer=0;globalThis.popupClosePrompts=0;dialog.showMessageBoxSync=()=>{globalThis.popupClosePrompts++;return globalThis.popupCloseAnswer;};});
 await app.evaluate(({BrowserWindow})=>{const wc=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/auth')).webContents;wc.sendInputEvent({type:'keyDown',keyCode:'W',modifiers:['meta']});wc.sendInputEvent({type:'keyUp',keyCode:'W',modifiers:['meta']});});
 await poll(app,()=>globalThis.popupClosePrompts===1);
 assert.equal(await authPage.getByLabel('Unsaved sign-in note').inputValue(),'synthetic note');
 assert.ok((await page.evaluate(()=>window.vector.invoke('pages.list',{}))).some(t=>t.pageId===tab.pageId));
 await app.evaluate(()=>{globalThis.popupCloseAnswer=1;});
 await menu('Close Window');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 assert.equal(await run(base+'/','document.querySelector("output").textContent'),mainBefore,'Closing popup must leave opener alive');
 // A subsequent login can be independently opened and closed, with no stale target.
 await run(base+'/','document.querySelector("button").click()');
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 const second=(await page.evaluate(()=>window.vector.invoke('pages.list',{}))).find(t=>t.pageId.startsWith('pop_'));
 await page.evaluate(id=>window.vector.invoke('pages.close',{pageId:id}),second.pageId);
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 assert.ok((await page.evaluate(()=>window.vector.invoke('pages.list',{}))).some(t=>t.pageId===tab.pageId));
 // Featureless window.open must keep its returned WindowProxy and opener.
 const opened=await run(base+'/', "!!(window.login=window.open('/auth','featureless'))");
 assert.equal(opened,true);
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 assert.equal(await run(base+'/auth','!!window.opener'),true);
 assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().length),0,'featureless opens as an Aux tab');
 await run(base+'/auth','document.querySelector("button").click()');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 // Preopened blank windows are commonly navigated after an async login setup.
 assert.equal(await run(base+'/',"!!(window.login=window.open('about:blank','preopened'))"),true);
 await run(base+'/',"window.login.location.href='/auth'");
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.url.endsWith('/auth')));
 await run(base+'/auth','window.close()');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 // A form target must retain its POST instead of replaying a GET of its URL.
 await run(base+'/',`(()=>{const f=document.createElement('form');f.method='POST';f.action='/post';f.target='_blank';const i=document.createElement('input');i.name='state';i.value='synthetic-state';f.append(i);document.body.append(f);f.submit()})()`);
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.url.endsWith('/post')));
 assert.equal(await run(base+'/post','document.body.dataset.method'),'POST');
 assert.equal(await run(base+'/post','document.body.textContent'),'state=synthetic-state');
 await run(base+'/post','window.close()');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 // Explicit noopener must remain isolated despite Aux adopting the tab.
 await run(base+'/',"window.open('/auth','isolated','noopener');void 0");
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.url.endsWith('/auth')));
 assert.equal(await run(base+'/auth','window.opener===null'),true);
 await run(base+'/auth','window.close()');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 // Nested auth windows retain separate lifecycle and parent relationships.
 await run(base+'/',"window.open('/auth','parent','popup,width=480,height=600');void 0");
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).some(t=>t.url.endsWith('/auth')));
 await run(base+'/auth',"window.open('/auth?child','child','popup,width=400,height=500');void 0");
 await poll(page,async()=> (await window.vector.invoke('pages.list',{})).filter(t=>t.pageId.startsWith('pop_')).length===2);
 assert.equal(await run(base+'/auth?child','opener.location.pathname'),'/auth');
 await run(base+'/auth?child','window.close()');
 await run(base+'/auth','window.close()');
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 await run(base+'/',"window.open('/quick','quick','popup,width=400,height=500');void 0");
 // Allow the attachment attempt to settle; absence immediately after opening proves nothing.
 await new Promise(r=>setTimeout(r,1500));
 await poll(page,async()=> !(await window.vector.invoke('pages.list',{})).some(t=>t.pageId.startsWith('pop_')));
 console.log('Login windows and tabs preserve sessions, opener, blank-window navigation and form POST; nested and fast-close flows leave no stale targets.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
