import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {prepareRemixContext,transformAuxRemixContext} from './source/aux-remix-context.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));const stage=process.argv[2];if(!stage)throw Error('Explicit current Agent stage required');
const sender={id:'agent',frameId:0,documentId:'native-document',url:'https://example.test/a',tab:{id:4,windowId:7,url:'https://example.test/a',title:'Example'}};
function fixture(){let generation='one';const calls=[];const originResult={success:true,ownerGeneration:'native-owner',targetId:'actual-target',url:sender.url,references:[{targetId:'actual-target',url:sender.url,documentCapability:'native-cap'}]};const deps={extensionId:'agent',generation:()=>generation,account:async()=>{calls.push('account');return{accountId:2,browserProfile:{profileId:'profile'}}},route:async()=>({accountId:2,profileId:'profile',browserMode:'default'}),api:{captureTabReferences:input=>{calls.push(['capture',input]);return Promise.resolve(originResult)},validateTabReferences:async input=>{calls.push(['validate',input]);return originResult}}};return{deps,calls,change:()=>{generation='two'}}}
let f=fixture();const promise=prepareRemixContext({prompt:'Explain'},sender,f.deps);assert.equal(f.calls[0][0],'capture');assert.equal(f.calls.length,1);
const context=await promise;assert.equal(context.attachments[0].documentCapability,'native-cap');assert.deepEqual(f.calls[0][1],{origin:{tabId:4,windowId:7,documentId:'native-document'},references:[]});
f.change();await assert.rejects(context.assertCurrent(),/account changed/);
f=fixture();const explicit={type:'tab',targetId:'chosen',url:'https://example.test/other',documentCapability:'existing-cap'};const noMint=await prepareRemixContext({attachCurrentTab:false,attachments:[explicit]},sender,f.deps);assert.deepEqual(noMint.attachments,[explicit]);assert.equal(f.calls.some(call=>call[0]==='capture'),false);assert.equal(f.calls.at(-1)[1].references[0].documentCapability,'existing-cap');
f=fixture();await assert.rejects(prepareRemixContext({attachments:[{type:'tab',targetId:'old',url:sender.url}]},sender,f.deps),/Select attached tabs/);assert.equal(f.calls.length,0);
f=fixture();f.deps.api.captureTabReferences=()=>Promise.resolve({success:false,error:'Click the Remix action again'});await assert.rejects(prepareRemixContext({},sender,f.deps),/Click the Remix action again/);assert.equal(f.calls.length,0);
f=fixture();const changed=prepareRemixContext({},sender,f.deps);f.change();await assert.rejects(changed,/profile changed/);
await assert.rejects(prepareRemixContext({}, {...sender,id:'foreign'},fixture().deps),/current top-level page/);
const input=readFileSync(join(stage,'background.js'),'utf8');const transformed=transformAuxRemixContext({relative:'background.js',text:input});assert.equal(transformed.anchors.length,3);assert.throws(()=>transformAuxRemixContext({relative:'background.js',text:transformed.text}),/missing/);
const dir=mkdtempSync(join(tmpdir(),'aux-remix-context-'));const output=join(dir,'background.mjs');writeFileSync(output,transformed.text);execFileSync(process.execPath,['--check',output]);
const sha=text=>createHash('sha256').update(text).digest('hex');const overlay=JSON.parse(readFileSync(join(root,'native-overlay.json')));
for(const file of overlay.files){let text=readFileSync(join(root,'baseline',file.path),'utf8');assert.equal(sha(text),file.inputSha256);for(const edit of file.changes){assert.equal(text.split(edit.find).length-1,edit.count);text=text.replace(edit.find,edit.replace)}assert.equal(sha(text),file.outputSha256);assert.equal(text,readFileSync(join(root,'source',file.path),'utf8'))}
console.log(JSON.stringify({checks:'native mint invoked before awaits; origin from MessageSender; retained explicit capability/no remint; stale profile refusal; real gesture refusal propagated; foreign sender refused; exact source replay and syntax',inputSha256:sha(input),outputSha256:sha(transformed.text),nativeFiles:overlay.files.map(({path,outputSha256})=>({path,outputSha256})),runtimeObserved:false,nativeCompiled:false},null,2));
