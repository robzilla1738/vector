// Qualify Electron display-capture permission discrimination without capturing any screen.
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
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
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/capture');
 let fixture;for(let i=0;i<100;i++){fixture=app.windows().find(p=>p.url()===base+'/capture');if(fixture)break;await new Promise(r=>setTimeout(r,50));}assert.ok(fixture);
 await app.evaluate(({session})=>{
 globalThis.capturePermissions=[];
  const ses=session.fromPartition('persist:aux-default');
  ses.setPermissionRequestHandler((wc,permission,cb,details)=>{globalThis.capturePermissions.push({kind:'request',permission,details});cb(false);});
  ses.setPermissionCheckHandler((wc,permission,origin,details)=>{globalThis.capturePermissions.push({kind:'check',permission,details});return false;});
 });
 await fixture.evaluate(()=>{document.body.innerHTML='<button id="share">Share</button>';document.querySelector('button').onclick=()=>navigator.mediaDevices.getDisplayMedia({video:true}).then(s=>{s.getTracks().forEach(t=>t.stop());globalThis.captureResult='captured';}).catch(e=>globalThis.captureResult=e.name);});
 await fixture.getByRole('button',{name:'Share',exact:true}).click();
 await poll(fixture,()=>!!globalThis.captureResult);
 const modern={result:await fixture.evaluate(()=>globalThis.captureResult),permissions:await app.evaluate(()=>globalThis.capturePermissions)};
 await app.evaluate(()=>{globalThis.capturePermissions=[];});
 await fixture.evaluate(()=>{globalThis.captureResult=undefined;document.querySelector('button').onclick=()=>navigator.mediaDevices.getUserMedia({video:{mandatory:{chromeMediaSource:'desktop',chromeMediaSourceId:'screen:0:0'}}}).then(s=>{s.getTracks().forEach(t=>t.stop());globalThis.captureResult='captured';}).catch(e=>globalThis.captureResult=e.name);});
 await fixture.getByRole('button',{name:'Share',exact:true}).click();
 await poll(fixture,()=>!!globalThis.captureResult);
 const legacy={result:await fixture.evaluate(()=>globalThis.captureResult),permissions:await app.evaluate(()=>globalThis.capturePermissions)};
 assert.equal(modern.result,'NotAllowedError');assert.equal(legacy.result,'NotAllowedError');
 assert.deepEqual(modern.permissions,legacy.permissions,'Requalify the policy if Electron begins distinguishing display capture');
 assert.equal(modern.permissions.length,1);assert.equal(modern.permissions[0].permission,'media');assert.deepEqual(modern.permissions[0].details.mediaTypes,[]);
 const versions=await app.evaluate(()=>({electron:process.versions.electron,chrome:process.versions.chrome}));
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});
 writeFileSync(join(root,'release/test-artifacts/aux-screen-sharing-boundary.json'),JSON.stringify({versions,modern,legacy,screenSharingQualified:false,note:'Both requests were denied at the permission boundary. No screen enumeration, selection, capture or OS permission change occurred.'},null,2));
 console.log('Modern display sharing and legacy desktop capture have indistinguishable media permission requests; both denied without capture.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
