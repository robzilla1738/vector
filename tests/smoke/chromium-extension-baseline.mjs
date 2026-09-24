// Chrome for Testing reference evidence, NOT proof that Aux/CEF implements these capabilities.
// Uses the existing Playwright browser and a disposable profile; no native hosts.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,existsSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..');
const {chromium}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const candidateBinary=process.env.AUX_CANDIDATE_BIN;
if(candidateBinary) {
 assert.ok(existsSync(candidateBinary),`Aux candidate executable missing: ${candidateBinary}`);
 assert.match(realpathSync(candidateBinary),/\/out\/AuxProof\//,'Use the isolated AuxProof build, not a reference browser');
}
const dir=mkdtempSync(join(tmpdir(),'aux-chromium-baseline-'));const extension=join(dir,'extension');mkdirSync(extension);
writeFileSync(join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Aux synthetic capability baseline',version:'1.0',permissions:['storage','tabs','nativeMessaging','scripting','contextMenus','downloads','cookies'],host_permissions:['http://localhost/*'],background:{service_worker:'worker.js'}}));
writeFileSync(join(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
writeFileSync(join(extension,'probe.html'),'<title>Synthetic extension baseline</title>');
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Aux synthetic page</title><h1>Extension baseline</h1>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
let context;
try{
 context=await chromium.launchPersistentContext(join(dir,'profile'),{headless:false,...(candidateBinary?{executablePath:realpathSync(candidateBinary)}:{}),env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--use-mock-keychain','--password-store=basic'],downloadsPath:join(dir,'downloads'),acceptDownloads:true});
 const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker');const id=new URL(worker.url()).host;
 const page=await context.newPage();await page.goto(`chrome-extension://${id}/probe.html`);
 const result=await page.evaluate(async base=>{
  const extensionApis=Object.fromEntries(['runtime.connectNative','runtime.sendNativeMessage','tabs.create','tabs.query','storage.local.get','storage.sync.get','scripting.executeScript','contextMenus.create','downloads.download','cookies.get'].map(path=>[path,typeof path.split('.').reduce((o,k)=>o?.[k],chrome)]));
  await chrome.storage.local.set({auxFixture:'synthetic'});const storage=(await chrome.storage.local.get('auxFixture')).auxFixture;await chrome.storage.local.remove('auxFixture');
  const tab=await chrome.tabs.create({url:base,active:false});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{chrome.tabs.onUpdated.removeListener(listener);reject(new Error('tab load timed out'))},5000);const listener=(id,change)=>{if(id===tab.id&&change.status==='complete'){clearTimeout(timer);chrome.tabs.onUpdated.removeListener(listener);resolve()}};chrome.tabs.onUpdated.addListener(listener);chrome.tabs.get(tab.id).then(t=>{if(t.status==='complete')listener(t.id,{status:'complete'})})});
  const injection=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>document.querySelector('h1').textContent});
  await chrome.cookies.set({url:base,name:'auxSynthetic',value:'fixture'});const cookie=await chrome.cookies.get({url:base,name:'auxSynthetic'});await chrome.cookies.remove({url:base,name:'auxSynthetic'});
  await new Promise((resolve,reject)=>chrome.contextMenus.create({id:'aux-fixture',title:'Synthetic action',contexts:['page']},()=>chrome.runtime.lastError?reject(new Error(chrome.runtime.lastError.message)):resolve()));await chrome.contextMenus.remove('aux-fixture');
  await chrome.tabs.remove(tab.id);
  return {extensionApis,storage,injected:injection[0].result,cookie:cookie.value,tabClosed:!(await chrome.tabs.query({})).some(t=>t.id===tab.id),contextMenuLifecycle:true};
 },base);
 assert.equal(result.storage,'synthetic');assert.equal(result.injected,'Extension baseline');assert.equal(result.cookie,'fixture');assert.equal(result.tabClosed,true);
 const evidence={at:new Date().toISOString(),browser:context.browser().version(),scope:candidateBinary?'Isolated Aux //chrome candidate executable; synthetic unpacked extension APIs only, not Store, native hosts, accounts, passkeys or Aux-shell integration.':'Google Chrome for Testing reference only, not Aux/CEF qualification; no native hosts, accounts, passkeys or Web Store invoked.',...(candidateBinary?{candidateBinary:realpathSync(candidateBinary)}:{}),...result};
 const output=join(root,'release/test-artifacts',candidateBinary?'aux-candidate-extension-apis.json':'aux-chromium-extension-baseline.json');mkdirSync(join(root,'release/test-artifacts'),{recursive:true});writeFileSync(output,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}finally{await context?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
