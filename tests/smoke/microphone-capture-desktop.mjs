// Fake Chromium capture devices only; no system camera, microphone or clipboard access.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/engine-client/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-media-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Meeting fixture</title><h1>Synthetic meeting</h1>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://localhost:${server.address().port}`;
const file=join(dir,'data/site-permissions.json');mkdirSync(join(dir,'data'));
writeFileSync(file,JSON.stringify({[base]:{media:'allow'}}));
let app,page,fixture;
async function launch(){
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain','--use-fake-device-for-media-stream'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0',AUX_ENGINE:'0',AUX_ENGINE_MODE:'off'}});
 for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);page.setDefaultTimeout(15000);await page.locator('.app-body').waitFor();
 await app.evaluate(({dialog,BaseWindow})=>{
  BaseWindow.getAllWindows()[0].setSize(1200,944);
  globalThis.authPrompts=[];globalThis.authResponses=[];
  dialog.showMessageBox=async(...args)=>{
   const options=args.at(-1);if(options.title!=='Site permission')throw new Error('Unexpected dialog');
   globalThis.authPrompts.push({message:options.message,defaultId:options.defaultId});
   const response=globalThis.authResponses.shift();
   if(response==='hold')return new Promise(resolve=>{globalThis.resolvePermission=resolve});
   if(typeof response!=='number')throw new Error('Unplanned permission request');
   return {response,checkboxChecked:false};
  };
 });
}
async function open(url){
 await page.evaluate(url=>window.vector.invoke('pages.open',{url,activate:true}),url);
 for(let i=0;i<100;i++){fixture=app.windows().find(p=>p.url()===url);if(fixture)return;await new Promise(r=>setTimeout(r,50));}throw new Error('Fixture missing');
}
const capture=(target,constraints)=>target.evaluate(async constraints=>{
 try{return await Promise.race([navigator.mediaDevices.getUserMedia(constraints).then(stream=>{const kinds=stream.getTracks().map(t=>t.kind);stream.getTracks().forEach(t=>t.stop());return kinds;}),new Promise(resolve=>setTimeout(()=>resolve('CaptureTimeout'),12000))]);}
 catch(error){return error.name;}
},constraints);
async function answer(value){await app.evaluate((_,value)=>globalThis.authResponses.push(value),value)}
async function prompts(){return app.evaluate(()=>globalThis.authPrompts)}
try{
 await launch();await open(base+'/microphone');await answer(1);
 const result=await capture(fixture,{audio:true});
 const evidence={runtime:await app.evaluate(()=>process.versions),syntheticDevices:true,result,permissionPrompts:await prompts(),microphoneCaptureQualified:Array.isArray(result)&&result.includes('audio')};
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});writeFileSync(join(root,'release/test-artifacts/aux-microphone-capture.json'),JSON.stringify(evidence,null,2));
 assert.deepEqual(result,['audio'],'Synthetic microphone must actually start; saved permission alone does not qualify capture');
 console.log('Synthetic microphone capture starts after explicit Aux permission.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
