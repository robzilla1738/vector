// Capability evidence only: synthetic extension + CDP virtual authenticator.
// Never contacts native messaging hosts, OS authenticators or credential stores.
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import {createHash,createPublicKey,verify} from 'node:crypto';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
import { launchAux } from './launch.mjs';
const root=resolve(import.meta.dirname,'../..');
const dir=mkdtempSync(join(tmpdir(),'aux-compatibility-'));const extension=join(dir,'extension');mkdirSync(extension);
writeFileSync(join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Aux synthetic capability probe',version:'1.0',permissions:['storage','tabs','nativeMessaging','scripting','contextMenus','downloads','cookies']}));
writeFileSync(join(extension,'probe.html'),'<title>Synthetic extension probe</title>');
const server=createServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Virtual WebAuthn fixture</title><h1>Synthetic credentials only</h1>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
let app;
try{
 let page;({ app, page } = await launchAux({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}}));
 await page.locator('.aux-home').waitFor();
 const capabilities=await app.evaluate(async({session,WebContentsView},path)=>{
  const profile=session.fromPartition('persist:aux-default');
  const ext=await profile.extensions.loadExtension(path,{allowFileAccess:false});
  const view=new WebContentsView({webPreferences:{session:profile,sandbox:true,contextIsolation:true,nodeIntegration:false}});
  try{
   await view.webContents.loadURL(`chrome-extension://${ext.id}/probe.html`);
   return await view.webContents.executeJavaScript(`Object.fromEntries(['runtime.connectNative','runtime.sendNativeMessage','tabs.create','tabs.query','storage.local.get','storage.sync.get','scripting.executeScript','contextMenus.create','downloads.download','cookies.get'].map(path=>[path,typeof path.split('.').reduce((o,k)=>o?.[k],chrome)]))`);
  }finally{view.webContents.close();profile.extensions.removeExtension(ext.id);}
 },extension);
 const tab=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base);
 await poll(page,async id=>(await window.aux.invoke('pages.list',{})).some(t=>t.pageId===id&&!t.loading),tab.pageId);
 const result=await app.evaluate(async({webContents},base)=>{
  const wc=webContents.getAllWebContents().find(w=>w.getURL()===base+'/');
  const command=(name,params={})=>wc.debugger.sendCommand(name,params);
  await command('WebAuthn.enable');
  const {authenticatorId}=await command('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}});
  try{return await wc.executeJavaScript(`(async()=>{
   const bytes=x=>Array.from(new Uint8Array(x));
   const credential=await navigator.credentials.create({publicKey:{challenge:new Uint8Array(32).fill(7),rp:{name:'Aux fixture',id:'localhost'},user:{id:new Uint8Array([1,2,3]),name:'synthetic',displayName:'Synthetic user'},pubKeyCredParams:[{type:'public-key',alg:-7}],authenticatorSelection:{residentKey:'required',userVerification:'required'},attestation:'none',timeout:5000}});
   const signed=await navigator.credentials.get({publicKey:{challenge:new Uint8Array(32).fill(9),rpId:'localhost',allowCredentials:[{type:'public-key',id:credential.rawId}],userVerification:'required',timeout:5000}});
   let wrongRp='accepted';try{await navigator.credentials.get({publicKey:{challenge:new Uint8Array(32),rpId:'unrelated.invalid',timeout:1000}})}catch(e){wrongRp=e.name}
   return {sameCredential:credential.id===signed.id,publicKey:bytes(credential.response.getPublicKey()),clientData:bytes(signed.response.clientDataJSON),authenticatorData:bytes(signed.response.authenticatorData),signature:bytes(signed.response.signature),wrongRp};
  })().catch(e=>{throw new Error(e.name+": "+e.message)})`);}finally{await command('WebAuthn.removeVirtualAuthenticator',{authenticatorId});await command('WebAuthn.disable');}
 },base);
 assert.equal(result.sameCredential,true);assert.equal(result.wrongRp,'SecurityError');
 const client=JSON.parse(Buffer.from(result.clientData).toString());assert.equal(client.type,'webauthn.get');assert.equal(client.origin,base);assert.equal(client.challenge,Buffer.alloc(32,9).toString('base64url'));
 const data=Buffer.from(result.authenticatorData);assert.deepEqual(data.subarray(0,32),createHash('sha256').update('localhost').digest());assert.equal(data[32]&5,5);
 assert.ok(verify('sha256',Buffer.concat([data,createHash('sha256').update(Buffer.from(result.clientData)).digest()]),createPublicKey({key:Buffer.from(result.publicKey),format:'der',type:'spki'}),Buffer.from(result.signature)));
 const evidence={at:new Date().toISOString(),electron:await app.evaluate(()=>process.versions.electron),scope:'Isolated synthetic extension API presence and CDP virtual authenticator only; no native credential-provider or password-manager qualification.',extensionApis:capabilities,webauthn:{registrationAndAssertion:true,signatureVerified:true,rpAndChallengeVerified:true,wrongRpRejected:true},nativePasskeys:'Unqualified: native authenticator was never invoked'};
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});writeFileSync(join(root,'release/test-artifacts/aux-browser-compatibility.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
