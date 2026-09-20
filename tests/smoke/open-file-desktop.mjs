// Local-file journey with synthetic content and an isolated profile only.
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';

const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/engine-client/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-open-file-'));
const fixture=join(dir,'Aux #1 ? café %.html');
const fixtureUrl=pathToFileURL(fixture).href;
writeFileSync(fixture,'<!doctype html><meta charset="utf-8"><title>Local review document</title><h1>Local review document</h1><textarea aria-label="Local note">Unchanged</textarea>');
const server=createServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Starting page</title><h1>Starting page</h1>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const startingUrl=`http://127.0.0.1:${server.address().port}/`;
const env={PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0',AUX_ENGINE:'0',AUX_ENGINE_MODE:'off'};
let app;
const launch=async()=>{
  const next=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env});
  let shell;for(let i=0;i<100;i++){shell=next.windows().find(p=>p.url().includes('renderer/index.html'));if(shell)break;await new Promise(r=>setTimeout(r,100));}
  assert.ok(shell);shell.setDefaultTimeout(15000);await shell.locator('.aux-home').waitFor();return {next,shell};
};
try{
 let started=await launch();app=started.next;let page=started.shell;
 await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),startingUrl);
 await poll(page,async url=>(await window.vector.invoke('pages.list',{})).some(p=>p.url===url&&!p.loading),startingUrl);
 const initial=await page.evaluate(()=>window.vector.invoke('pages.list',{}));
 await app.evaluate(({dialog})=>{dialog.showOpenDialog=async()=>({canceled:true,filePaths:[]});});
 await page.keyboard.press('Meta+O');await new Promise(r=>setTimeout(r,150));
 assert.deepEqual((await page.evaluate(()=>window.vector.invoke('pages.list',{}))).map(p=>({pageId:p.pageId,url:p.url})),initial.map(p=>({pageId:p.pageId,url:p.url})));

 await app.evaluate(({dialog},path)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[path]});},fixture);
 await page.keyboard.press('Meta+O');
 await poll(page,async url=>{const pages=await window.vector.invoke('pages.list',{});return pages.some(p=>p.url===url&&!p.loading);},fixtureUrl);
 const opened=(await page.evaluate(()=>window.vector.invoke('pages.list',{}))).find(p=>p.url===fixtureUrl);assert.ok(opened);
 assert.equal(opened.pageId,initial[0].pageId,'opening a file should navigate the selected tab');
 let document=app.windows().find(p=>p.url()===fixtureUrl);assert.ok(document);await document.getByRole('heading',{name:'Local review document',exact:true}).waitFor();
 await page.screenshot({path:join(root,'release/test-artifacts/aux-open-file.png')});
 await document.getByLabel('Local note').fill('Unsaved local edit');
 await app.close();app=undefined;

 started=await launch();app=started.next;page=started.shell;
 await poll(page,async url=>(await window.vector.invoke('pages.list',{})).some(p=>p.url===url&&!p.loading),fixtureUrl);
 const restored=(await page.evaluate(()=>window.vector.invoke('pages.list',{}))).find(p=>p.url===fixtureUrl);assert.ok(restored);assert.equal(restored.pageId,opened.pageId);
 document=app.windows().find(p=>p.url()===fixtureUrl);assert.ok(document);await document.getByRole('heading',{name:'Local review document',exact:true}).waitFor();
 assert.equal(await document.getByLabel('Local note').inputValue(),'Unchanged','unsaved form state is not claimed as persisted after restart');
 console.log('Open File cancellation is inert; special-character paths load in the selected tab and the local document restores after restart.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
