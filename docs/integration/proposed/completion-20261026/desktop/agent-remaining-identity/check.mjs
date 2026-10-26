import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transformAuxAgentRemainingIdentity} from '../../../../../../vendor/provided/aux-agent-remaining-identity.mjs';
const home=new URL('.',import.meta.url),pins=JSON.parse(readFileSync(new URL('./source-pins.json',home),'utf8'));
const app='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-completion-20261026-a1/Aux.app',out=mkdtempSync(join(tmpdir(),'aux-agent-remaining-identity-')),files=[];let background;
for(const pin of pins.files){
 const source=readFileSync(pin.inputPath,'utf8'),before=readFileSync(join(app,pin.path),'utf8');assert.equal(createHash('sha256').update(before).digest('hex'),pin.observedArtifactSha256);
 const result=transformAuxAgentRemainingIdentity({path:pin.path,text:before,source});let reverse=result.text;
 for(const anchor of [...result.anchors].reverse())reverse=reverse.replaceAll(anchor.replace,()=>anchor.find);
 assert.equal(reverse,before,'Only declared identity/compatibility changes');
 if(pin.path.endsWith('.js')){const target=join(out,pin.path.split('/').at(-1)+'.mjs');writeFileSync(target,result.text);const checked=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});assert.equal(checked.status,0,checked.stderr)}
 if(pin.path.endsWith('background.js'))background=result.text;
 files.push({path:pin.path,inputSha256:pin.observedArtifactSha256,outputSha256:createHash('sha256').update(result.text).digest('hex'),anchors:result.anchors.length,reverseExact:true});
}
const start=background.indexOf('async function nw(e, t) {'),end=background.indexOf('async function ow(e)',start),fn=background.slice(start,end);
assert.ok(start>0&&end>start);
const prefix=background.slice(background.indexOf('Bi = Object.freeze('),background.indexOf(';',background.indexOf('Bi = Object.freeze(')));
let parserCases=0;
for(const marker of ['__AUX_LASSO_ERROR__:','__ASIDE_LASSO_ERROR__:'])for(const split of [1,marker.length-1,marker.length,marker.length+2]){
 const encoded=new TextEncoder().encode(marker+'exact failure'),parts=[encoded.slice(0,split),encoded.slice(split)];let emitted='';
 const ctx=vm.createContext({TextDecoder,Error,JSON,G:async()=>({}),ew:{lasso:{transform:()=>'/fixture'}},ve:async()=>({ok:true,body:{getReader:()=>({read:async()=>parts.length?{done:false,value:parts.shift()}:{done:true}})}})});
 vm.runInContext('var '+prefix+';\n'+fn,ctx);await assert.rejects(ctx.nw({}, {onChunk:value=>{emitted+=value}}),error=>error.message==='exact failure');assert.equal(emitted,'');parserCases++;
}
const receipt={format:'aux.agent.remaining-identity.static-check.v2',files,compiledJavaScriptFiles:files.filter(x=>x.path.endsWith('.js')).length,htmlAndCssExactReplay:true,lassoActualOriginalFunctionCases:parserCases,lassoBothGenerationsPreserveExactErrorMessage:true,productExecuted:false,profileRead:false,appEdited:false};
writeFileSync(new URL('./static-check.json',home),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({leaves:files.length,anchors:files.reduce((n,x)=>n+x.anchors,0),actualParserCases:parserCases,passed:true}));
