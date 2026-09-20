// A deliberately unfinished response must not delay foreground tab selection.
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/engine-client/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-tab-loading-'));let pendingResponse;
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.write('<title>Loading fixture</title><h1>Visible before completion</h1>');if(req.url==='/slow')pendingResponse=res;else res.end();});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let app;
try {
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0',AUX_ENGINE:'0',AUX_ENGINE_MODE:'off'}});
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);
 await page.locator('.aux-home').waitFor();
 const first=await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),base);
 await page.evaluate(url=>{window.__opening=window.vector.invoke('pages.open',{url,activate:true});},base+'/slow');
 await poll(page,async slow=>{const ws=await window.vector.invoke('workspace.get',{});const tab=ws.pages.find(p=>p.url===slow);return tab&&ws.activePageId===tab.pageId;},base+'/slow');
 assert.ok(pendingResponse && !pendingResponse.writableEnded,'selection happens while response remains open');
 await page.keyboard.press('Meta+d');
 await poll(page,async url=>(await window.vector.invoke('bookmarks.list',{})).some(b=>b.url===url),base+'/slow');
 await page.evaluate(id=>window.vector.invoke('pages.activate',{pageId:id}),first.pageId);
 pendingResponse.end('<p>Finished after the user switched away.</p>');
 await page.evaluate(()=>window.__opening);
 const workspace=await page.evaluate(()=>window.vector.invoke('workspace.get',{}));
 assert.equal(workspace.activePageId,first.pageId);
 assert.equal((await page.evaluate(()=>window.vector.invoke('bookmarks.list',{}))).length,1);
 console.log('Slow foreground tab is selectable and bookmarkable before load finishes; completion does not steal selection.');
} finally {await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
