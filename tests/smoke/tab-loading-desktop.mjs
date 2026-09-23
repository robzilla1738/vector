// A deliberately unfinished response must not delay foreground tab selection.
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
import { launchAux } from './launch.mjs';
const dir=mkdtempSync(join(tmpdir(),'aux-tab-loading-'));let pendingResponse;
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.write('<title>Loading fixture</title><h1>Visible before completion</h1>');if(req.url==='/slow')pendingResponse=res;else res.end();});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let app;
try {
 let page;({ app, page } = await launchAux({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}}));
 await page.locator('.aux-home').waitFor();
 const first=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base);
 await page.evaluate(url=>{window.__opening=window.aux.invoke('pages.open',{url,activate:true});},base+'/slow');
 await poll(page,async slow=>{const ws=await window.aux.invoke('workspace.get',{});const tab=ws.pages.find(p=>p.url===slow);return tab&&ws.activePageId===tab.pageId;},base+'/slow');
 // selection may land before the request does; it must never wait for the response to finish
 for(let i=0;i<100&&!pendingResponse;i++)await new Promise(r=>setTimeout(r,50));
 assert.ok(pendingResponse && !pendingResponse.writableEnded,'selection happens while response remains open');
 await page.keyboard.press('Meta+d');
 await poll(page,async url=>(await window.aux.invoke('bookmarks.list',{})).some(b=>b.url===url),base+'/slow');
 await page.evaluate(id=>window.aux.invoke('pages.activate',{pageId:id}),first.pageId);
 pendingResponse.end('<p>Finished after the user switched away.</p>');
 await page.evaluate(()=>window.__opening);
 const workspace=await page.evaluate(()=>window.aux.invoke('workspace.get',{}));
 assert.equal(workspace.activePageId,first.pageId);
 assert.equal((await page.evaluate(()=>window.aux.invoke('bookmarks.list',{}))).length,1);
 console.log('Slow foreground tab is selectable and bookmarkable before load finishes; completion does not steal selection.');
} finally {await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
