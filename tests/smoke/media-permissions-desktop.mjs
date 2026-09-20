// Fake Chromium capture devices only; no system camera, microphone or clipboard access.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {sidebarAction} from './sidebar-action.mjs';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/engine-client/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-media-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Meeting fixture</title><h1>Synthetic meeting</h1>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://localhost:${server.address().port}`,other=`http://127.0.0.1:${server.address().port}`;
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
 await launch();await open(base+'/meeting');
 await answer(1);assert.deepEqual(await capture(fixture,{video:true}),['video']);
 assert.match((await prompts())[0].message,/camera/);assert.doesNotMatch((await prompts())[0].message,/microphone/);
 assert.equal((await prompts())[0].defaultId,0);
 await answer(0);assert.equal(await capture(fixture,{audio:true}),'NotAllowedError');
 assert.match((await prompts())[1].message,/microphone/);
 assert.deepEqual(await capture(fixture,{video:true}),['video']);assert.equal((await prompts()).length,2);
 assert.equal(await capture(fixture,{audio:true,video:true}),'NotAllowedError');assert.equal((await prompts()).length,2);
 assert.equal(JSON.parse(readFileSync(file,'utf8'))[base]['media:audio'],'deny');
 assert.equal(JSON.parse(readFileSync(file,'utf8'))[base]['media:video'],'allow');
 // Reset through actual settings UI; the microphone denial remains in effect.
 await sidebarAction(page,'Settings');await page.getByRole('button',{name:'Site permissions',exact:true}).click();
 await page.getByRole('button',{name:`Reset Camera for ${base}`,exact:true}).click();
 await page.getByText('Decision reset.',{exact:false}).waitFor();
 assert.equal(JSON.parse(readFileSync(file,'utf8'))[base]['media:audio'],'deny');
 await answer(1);assert.deepEqual(await capture(fixture,{video:true}),['video']);
 assert.match((await prompts()).at(-1).message,/camera/);assert.doesNotMatch((await prompts()).at(-1).message,/microphone/);
 const call=await fixture.evaluate(async()=>{
  const stream=await navigator.mediaDevices.getUserMedia({video:true});
  const audio=new AudioContext();const destination=audio.createMediaStreamDestination();const tone=audio.createOscillator();tone.connect(destination);tone.start();await audio.resume();stream.addTrack(destination.stream.getAudioTracks()[0]);
  const sender=new RTCPeerConnection({iceServers:[]}),receiver=new RTCPeerConnection({iceServers:[]});
  const video=document.createElement('video');video.muted=true;video.autoplay=true;document.body.append(video);
  const remote=new MediaStream();receiver.ontrack=event=>{remote.addTrack(event.track);video.srcObject=remote;void video.play()};
  const received=new Promise(resolve=>{receiver.ondatachannel=event=>{event.channel.onmessage=message=>resolve(message.data)}});
  const channel=sender.createDataChannel('meeting');channel.onopen=()=>channel.send('synthetic meeting connected');
  const gather=async peer=>{for(let i=0;i<100&&peer.iceGatheringState!=='complete';i++)await new Promise(r=>setTimeout(r,50));};
  try{
   stream.getTracks().forEach(track=>sender.addTrack(track,stream));
   await sender.setLocalDescription(await sender.createOffer());await gather(sender);
   await receiver.setRemoteDescription(sender.localDescription);await receiver.setLocalDescription(await receiver.createAnswer());await gather(receiver);
   await sender.setRemoteDescription(receiver.localDescription);
   const message=await Promise.race([received,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Call data channel timed out')),10000))]);
   for(let i=0;i<100;i++){
    const stats=[...(await receiver.getStats()).values()].filter(stat=>stat.type==='inbound-rtp');
    if(stats.some(stat=>stat.kind==='video'&&stat.framesDecoded>0)&&stats.some(stat=>stat.kind==='audio'&&stat.packetsReceived>0))return {message,video:true,audio:true};
    await new Promise(r=>setTimeout(r,100));
   }
   throw new Error('No received camera/generated-audio packets');
  }finally{sender.close();receiver.close();stream.getTracks().forEach(track=>track.stop());remote.getTracks().forEach(track=>track.stop());video.remove();await audio.close()}
 });
 assert.deepEqual(call,{message:'synthetic meeting connected',video:true,audio:true});
 // A different origin must get its own decision, even with a camera grant above.
 await open(other+'/meeting');await answer(0);assert.equal(await capture(fixture,{audio:true}),'NotAllowedError');
 assert.match((await prompts()).at(-1).message,new RegExp(other.replaceAll('.','\\.')));
 await page.evaluate(origin=>window.vector.clearSitePermission(origin),other);
 // Navigation cancels a pending decision without saving a late approval.
 await answer('hold');const pending=capture(fixture,{video:true}).catch(()=>null);
 for(let i=0;i<100&&!await app.evaluate(()=>!!globalThis.resolvePermission);i++)await new Promise(r=>setTimeout(r,50));
 assert.equal(await app.evaluate(()=>!!globalThis.resolvePermission),true);
 await fixture.goto(other+'/after-navigation');
 await app.evaluate(()=>{globalThis.resolvePermission({response:1,checkboxChecked:false});delete globalThis.resolvePermission});await pending;
 assert.equal(JSON.parse(readFileSync(file,'utf8'))[other],undefined);
 // Fail closed on a failed atomic write: don't grant or corrupt prior decisions.
 mkdirSync(file+'.tmp');await answer(1);assert.equal(await capture(fixture,{video:true}),'NotAllowedError');
 assert.equal(JSON.parse(readFileSync(file,'utf8'))[other],undefined);rmSync(file+'.tmp',{recursive:true});
 await app.close();app=null;await launch();await open(base+'/restart');
 assert.deepEqual(await capture(fixture,{video:true}),['video']);assert.equal(await capture(fixture,{audio:true}),'NotAllowedError');assert.equal((await prompts()).length,0);
 await sidebarAction(page,'Settings');await page.getByRole('button',{name:'Site permissions',exact:true}).click();
 await page.getByRole('button',{name:`Reset Camera for ${base}`,exact:true}).waitFor();
 await page.getByRole('button',{name:`Reset Microphone for ${base}`,exact:true}).waitFor();
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});await page.screenshot({path:join(root,'release/test-artifacts/aux-media-permissions.png')});
 console.log('Camera capture, microphone denial, grant isolation, legacy reapproval, settings reset, origin isolation, navigation cancellation, failed persistence and restart pass. Local WebRTC carries fake camera, generated audio and data. Microphone capture remains separately unqualified.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
