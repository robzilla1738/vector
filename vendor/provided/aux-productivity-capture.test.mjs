import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';
import {installNativeCaptureListener,captureBoundPage,transformAuxCaptureUi,transformAuxCaptureDaemon,transformAuxCaptureNative} from './aux-productivity-capture.mjs';
import {developerSections,runDeveloperCommand,transformAuxDeveloperUi} from './aux-productivity-developer.mjs';
import {transformAuxNavigation} from './aux-navigation-command-bar.mjs';import {transformAuxProductivityUi} from './aux-productivity-integration.mjs';import {transformAuxFilesUi} from './aux-productivity-files.mjs';import {transformAuxMediaUi} from './aux-productivity-media.mjs';
const sender={tab:{id:7},frameId:0,documentId:'native-document'},png='data:image/png;base64,aGVsbG8=';
test('surface capture uses native capability, never guesses focused tabs, and cancels on profile drift',async()=>{
 let begin,cancelled=0,captured=0;
 const api={beginPageSurfaceCapture:async value=>(begin=value,{success:true,capability:'lease',targetId:'target'}),capturePageSurface:async value=>{assert.deepEqual(value,{capability:'lease'});captured++;return{success:true,dataUrl:png}},validatePageSurfaceCapture:async()=>({success:true}),cancelPageSurfaceCapture:async()=>{cancelled++}};
 assert.deepEqual(await captureBoundPage({mode:'viewport'},sender,api,null,null,async()=>true),{ok:true,dataUrl:png});assert.deepEqual(begin,{tabId:7,documentId:'native-document'});assert.equal(cancelled,1);
 const stale=await captureBoundPage({mode:'viewport'},sender,{...api,validatePageSurfaceCapture:async()=>({success:false,error:'Profile changed'})},null,null,async()=>true);assert.equal(stale.ok,false);assert.equal(stale.dataUrl,undefined);assert.equal(cancelled,2);
 assert.equal((await captureBoundPage({mode:'viewport'},{},api,null,null,async()=>true)).ok,false);assert.equal(captured,2);
 assert.equal((await captureBoundPage({mode:'viewport'},sender,api,null,null,async()=>false)).ok,false);assert.equal(captured,2);
});
test('full-page route carries the native document guard and validates before returning pixels',async()=>{
 let request;
 const api={beginPageSurfaceCapture:async()=>({success:true,capability:'lease',targetId:'same-target'}),validatePageSurfaceCapture:async()=>({success:true}),cancelPageSurfaceCapture:async()=>{}};
 assert.equal((await captureBoundPage({mode:'full'},sender,api,async value=>(request=value,{dataUrl:png}),null,async()=>true)).ok,true);assert.deepEqual(request,{targetId:'same-target',documentCapability:'lease'});
 const result=await captureBoundPage({mode:'full'},sender,api,async()=>({dataUrl:'wrong-format'}),null,async()=>true);assert.equal(result.ok,false);
});
test('commands target the native document and developer policy controls visibility',async()=>{
 const context={mode:'commands',generation:'gen',developer:{success:true,captureAvailable:true,devToolsAvailable:false,developerMode:true}};
 assert.ok(!developerSections(context,'',[])[0].items.some(item=>item.kind==='aux-developer-tools'));
 let sent;await runDeveloperCommand({getPageCaptureTarget:async input=>{assert.deepEqual(input,{generation:'gen'});return{success:true,tabId:9,documentId:'native-doc'}}},{sendMessage:async(...args)=>{sent=args}},context,{kind:'aux-developer-capture'});
 assert.deepEqual(sent,[9,{type:'capture:open'},{documentId:'native-doc'}]);
});
test('supplied capture/full-page/command/settings adapters compose and parse',()=>{
 const root='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux',out=mkdtempSync(join(tmpdir(),'aux-capture-'));
 try{
 const files=[];
 for(const relative of ['background.js','assets/capture-result-nUfmrYC9.js'])files.push([relative.replaceAll('/','-'),transformAuxCaptureUi({relative,text:readFileSync(join(root,'apps/extension/dist',relative),'utf8')}).text]);
 for(const name of ['index.mjs','aux-native-entry.mjs'])files.push([name,transformAuxCaptureDaemon({text:readFileSync(join(root,'apps/daemon/Aux Daemon.app/Contents/Resources/node-development',name),'utf8')}).text]);
 let relative='assets/tabsearch-3k_2hgil.js',text=readFileSync(join(root,'apps/extension/dist',relative),'utf8'),original=text;
 for(const transform of [transformAuxNavigation,transformAuxProductivityUi,transformAuxFilesUi,transformAuxMediaUi,transformAuxDeveloperUi])text=transform({relative,text}).text;
 assert.deepEqual([...text.matchAll(/className:"([^"]+)"/g)].map(m=>m[1]),[...original.matchAll(/className:"([^"]+)"/g)].map(m=>m[1]));files.push(['commands.mjs',text]);
 relative='assets/general-3dgRbrRk.js';files.push(['settings.mjs',transformAuxDeveloperUi({relative,text:readFileSync(join(root,'apps/extension/dist',relative),'utf8')}).text]);
 for(const [name,text] of files){const path=join(out,name.endsWith('.mjs')?name:name+'.mjs');writeFileSync(path,text);const parsed=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr)}
 const native='chrome/browser/devtools/chrome_devtools_manager_delegate.cc',nativeText=readFileSync('docs/integration/proposed/browser-feature-expansion/productivity/source/'+native,'utf8');assert.equal(transformAuxCaptureNative({relative:native,text:nativeText}).anchors.length,2);
 }finally{rmSync(out,{recursive:true,force:true})}
});

test('native screenshot ingress reports disabled state to its exact native intent owner',async()=>{
 let listener,sent,reports=[],errors=[];
 const api={onPageCaptureRequested:{addListener:fn=>listener=fn},reportPageCaptureError:async request=>{reports.push(request);return {success:true}}},tabs={sendMessage:async(...args)=>{sent=args}};
 installNativeCaptureListener(api,tabs,async()=>true,error=>errors.push(error));
 await listener({tabId:5,documentId:'original-document'});
 assert.deepEqual(sent,[5,{type:'capture:open'},{documentId:'original-document'}]);
 sent=undefined;
 installNativeCaptureListener(api,tabs,async()=>false,error=>errors.push(error));
 await listener({tabId:5,documentId:'original-document'});
 assert.equal(sent,undefined);assert.deepEqual(reports,[{tabId:5,documentId:'original-document',error:'Enable Screenshot in Settings to capture this page.'}]);assert.equal(errors.length,0);
 api.reportPageCaptureError=async request=>{reports.push(request);return{success:false,error:'The screenshot document changed.'}};
 await listener({tabId:5,documentId:'original-document'});
 assert.equal(sent,undefined);assert.equal(errors[0],'The screenshot document changed.');
});
