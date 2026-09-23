// Startup and macOS external-link routing; isolated local fixture/profile only.
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
import { launchAux } from './launch.mjs';

const root=resolve(import.meta.dirname,'../..');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-external-links-'));
const server=createServer((req,res)=>{const name=(req.url??'/').slice(1)||'home';res.setHeader('Content-Type','text/html');res.end(`<title>${name}</title><h1>${name}</h1>${name==='startup'?'<textarea aria-label="Live draft"></textarea>':''}`);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let app;
try{
 const env={PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'};
 let page;({ app, page } = await launchAux({args:['--use-mock-keychain',base+'/startup'],env}));page.setDefaultTimeout(15000);await page.locator('.aux-home').waitFor();
 await poll(page,async url=>(await window.aux.invoke('pages.list',{})).some(p=>p.url===url&&!p.loading),base+'/startup');
 let startup=app.windows().find(p=>p.url()===base+'/startup');assert.ok(startup);await startup.getByRole('heading',{name:'startup',exact:true}).waitFor();await startup.getByLabel('Live draft').fill('Keep external-link work');

 const second=spawn(electron,[join(root,'apps/desktop'),'--use-mock-keychain',base+'/second'],{env,stdio:'ignore'});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{second.kill();reject(new Error('Second Aux launch did not hand off in time'));},10000);second.once('error',reject);second.once('exit',()=>{clearTimeout(timer);resolve();});});
 await poll(page,async url=>(await window.aux.invoke('pages.list',{})).some(p=>p.url===url&&!p.loading),base+'/second');
 assert.equal(await startup.getByLabel('Live draft').inputValue(),'Keep external-link work');

 const prevented=await app.evaluate(({app},url)=>{let prevented=false;app.emit('open-url',{preventDefault(){prevented=true;}},url);return prevented;},base+'/mac-open');
 assert.equal(prevented,true);
 await poll(page,async url=>(await window.aux.invoke('pages.list',{})).some(p=>p.url===url&&!p.loading),base+'/mac-open');
 const beforeUnsafe=await page.evaluate(()=>window.aux.invoke('pages.list',{}));
 await app.evaluate(({app})=>app.emit('open-url',{preventDefault(){}},'file:///tmp/should-not-open'));
 await new Promise(r=>setTimeout(r,150));
 const final=await page.evaluate(()=>window.aux.invoke('pages.list',{}));
 assert.deepEqual(final.map(p=>p.pageId),beforeUnsafe.map(p=>p.pageId));
 assert.deepEqual(final.map(p=>p.url),[base+'/startup',base+'/second',base+'/mac-open']);
 assert.equal(final.find(p=>p.url===base+'/mac-open').viewStatus,'visible');
 assert.equal(await startup.getByLabel('Live draft').inputValue(),'Keep external-link work');
 console.log('Startup, second-instance, and macOS open-URL links become Aux tabs without replacing a live draft; non-web external URLs stay blocked.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
