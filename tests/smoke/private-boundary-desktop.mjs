// Prospective private-window boundary probe; synthetic accounts and isolated profile only.
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-private-boundary-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<title>Draft ${req.url}</title><label>Draft<textarea id="draft"></textarea></label><a href="/destination">Continue</a><script>addEventListener('beforeunload',e=>{if(draft.value){e.preventDefault();e.returnValue='';}});</script>`)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
let app;
try{
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);page.setDefaultTimeout(15000);await page.locator('.aux-home').waitFor();
 const isolation=await app.evaluate(async({BrowserWindow,session},url)=>{
   const regular=session.fromPartition('persist:aux-default');
   const temporary=session.fromPartition('aux-private-boundary-test',{cache:false});
   await regular.cookies.set({url,name:'regular-only',value:'synthetic'});
   await temporary.cookies.set({url,name:'private-only',value:'synthetic'});
   globalThis.privateBoundaryWindow=new BrowserWindow({show:false,webPreferences:{session:temporary,contextIsolation:true,sandbox:true,nodeIntegration:false}});
   await globalThis.privateBoundaryWindow.loadURL(url+'/private-candidate');
   return {persistent:temporary.isPersistent(),regular:(await regular.cookies.get({url})).map(c=>c.name),temporary:(await temporary.cookies.get({url})).map(c=>c.name)};
 },base);
 assert.equal(isolation.persistent,false);
 assert.deepEqual(isolation.regular,['regular-only']);assert.deepEqual(isolation.temporary,['private-only']);
 const port=Number(readFileSync(join(dir,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);
 const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 const exposed=targets.some(t=>t.url===base+'/private-candidate');
 assert.equal(exposed,true,'Reassess separate-process requirement if off-record CDP discovery changes');
 const versions=await app.evaluate(()=>({electron:process.versions.electron,chrome:process.versions.chrome}));
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});
 writeFileSync(join(root,'release/test-artifacts/aux-private-boundary.json'),JSON.stringify({versions,isolation,privateCandidateExposedToSharedDebugger:exposed,privateBrowsingQualified:false},null,2));
 await app.evaluate(()=>globalThis.privateBoundaryWindow.destroy());
 console.log('In-memory candidate isolates cookies but remains discoverable through the shared debugger. Private browsing requires a separate debugging boundary.');
}finally{
 if(app){try{await app.evaluate(({app})=>app.exit(0));}catch{} await app.close().catch(()=>{});}
 server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});
}
