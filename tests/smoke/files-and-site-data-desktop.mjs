import {sidebarAction} from './sidebar-action.mjs';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/engine-client/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-files-site-data-'));
const files=[join(dir,'first.txt'),join(dir,'second.txt')];files.forEach((file,index)=>writeFileSync(file,`Synthetic upload ${index}\n`));
let uploaded=[],failUpload=true;
const server=createServer(async(req,res)=>{
 if(req.url==='/upload'){
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  if(failUpload){res.writeHead(503);res.end('Upload unavailable. Try again.');return;}
  const data=await new Response(Buffer.concat(chunks),{headers:{'content-type':req.headers['content-type']}}).formData();
  uploaded=await Promise.all(data.getAll('files').map(async file=>({name:file.name,text:await file.text()})));res.end('Upload complete');return;
 }
 res.setHeader('Content-Type','text/html');res.end(`<title>Files and data</title><h1>Fixture</h1><form><input aria-label="Upload files" type="file" name="files" multiple><button>Upload</button></form><output></output><script>document.querySelector('form').onsubmit=async e=>{e.preventDefault();document.querySelector('output').textContent=await(await fetch('/upload',{method:'POST',body:new FormData(e.target)})).text()}</script>`);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`,other=`http://127.0.0.1:${server.address().port}`;
let app;
const launch=()=>_electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0',AUX_ENGINE:'0',AUX_ENGINE_MODE:'off'}});
try{
 app=await launch();
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);page.setDefaultTimeout(15000);await page.locator('.aux-home').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
 const target=await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),base);
 await poll(page,async id=>(await window.vector.invoke('pages.list',{})).some(p=>p.pageId===id&&!p.loading),target.pageId);
 let web;for(let i=0;i<100;i++){web=app.windows().find(p=>p.url()===base+'/');if(web)break;await new Promise(r=>setTimeout(r,50));}assert.ok(web);
 const choosing=web.waitForEvent('filechooser');await web.getByLabel('Upload files').click();const chooser=await choosing;assert.equal(chooser.isMultiple(),true);await chooser.setFiles(files);
 await web.getByRole('button',{name:'Upload',exact:true}).click();await web.getByText('Upload unavailable. Try again.').waitFor();assert.equal(await web.getByLabel('Upload files').evaluate(el=>el.files.length),2);
 failUpload=false;await web.getByRole('button',{name:'Upload',exact:true}).click();await web.getByText('Upload complete').waitFor();assert.deepEqual(uploaded,[{name:'first.txt',text:'Synthetic upload 0\n'},{name:'second.txt',text:'Synthetic upload 1\n'}]);
 const sibling=await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),other);
 await poll(page,async id=>(await window.vector.invoke('pages.list',{})).some(p=>p.pageId===id&&!p.loading),sibling.pageId);
 const seed=async origin=>app.evaluate(async({webContents},origin)=>webContents.getAllWebContents().find(w=>w.getURL()===origin+'/').executeJavaScript(`(async()=>{localStorage.setItem('auxFixture','saved');document.cookie='auxFixture=cookie; SameSite=Lax; Path=/';await new Promise((resolve,reject)=>{const r=indexedDB.open('auxFixture',1);r.onupgradeneeded=()=>r.result.createObjectStore('items');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('items','readwrite');tx.objectStore('items').put('data','key');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}})})()`),origin);
 const read=async origin=>app.evaluate(async({webContents},origin)=>webContents.getAllWebContents().find(w=>w.getURL()===origin+'/').executeJavaScript(`(async()=>({local:localStorage.getItem('auxFixture'),cookie:document.cookie,dbs:(await indexedDB.databases()).map(x=>x.name)}))()`),origin);
 await seed(base);await seed(other);
 await sidebarAction(page,'Settings');await page.getByRole('button',{name:'Site permissions',exact:true}).click();await page.getByLabel('Website to clear').selectOption(target.pageId);
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async options=>{globalThis.auxPrompt=options;return {response:0,checkboxChecked:false}}});
 await page.getByRole('button',{name:'Clear website data…',exact:true}).click();await page.waitForTimeout(100);assert.equal((await read(base)).local,'saved');
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async options=>{globalThis.auxPrompt=options;return {response:1,checkboxChecked:false}}});
 await page.getByRole('button',{name:'Clear website data…',exact:true}).click();await page.getByRole('status').filter({hasText:'Cookies and stored website data cleared.'}).waitFor();
 assert.deepEqual(await read(base),{local:null,cookie:'',dbs:[]});assert.deepEqual(await read(other),{local:'saved',cookie:'auxFixture=cookie',dbs:['auxFixture']});
 const prompt=await app.evaluate(()=>globalThis.auxPrompt);assert.match(prompt.detail,/related subdomains/);assert.equal(prompt.defaultId,0);
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});await page.screenshot({path:join(root,'release/test-artifacts/aux-site-data.png')});
 await seed(base);
 await app.evaluate(({dialog})=>{globalThis.auxResolve=null;dialog.showMessageBox=()=>new Promise(resolve=>{globalThis.auxResolve=resolve})});
 await page.getByRole('button',{name:'Clear website data…',exact:true}).click();
 for(let i=0;i<100&&!await app.evaluate(()=>!!globalThis.auxResolve);i++)await new Promise(r=>setTimeout(r,20));
 await app.evaluate(async({webContents},{base,other})=>{await webContents.getAllWebContents().find(w=>w.getURL()===base+'/').loadURL(other+'/changed');globalThis.auxResolve({response:1,checkboxChecked:false})},{base,other});
 await page.getByRole('alert').filter({hasText:'The tab changed'}).waitFor();assert.equal((await read(other)).local,'saved');
 const restored=await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),base);
 await poll(page,async id=>(await window.vector.invoke('pages.list',{})).some(p=>p.pageId===id&&!p.loading),restored.pageId);
 assert.equal((await read(base)).local,'saved','stale approval preserved original origin data');
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:1,checkboxChecked:false})});
 assert.equal(await page.evaluate(id=>window.vector.clearSiteData(id),restored.pageId),true);
 await app.close();app=await launch();
 for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);
 await poll(page,async base=>(await window.vector.invoke('pages.list',{})).some(p=>p.url===base+'/'&&!p.loading),base);
 assert.deepEqual(await read(base),{local:null,cookie:'',dbs:[]});
 assert.equal((await read(other)).local,'saved');
 console.log('Multiple-file upload verifies exact server bytes; retry preserves selection. Site-data cancel, scoped clearing, unrelated-origin preservation, changed-tab rejection and restart persistence pass.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
