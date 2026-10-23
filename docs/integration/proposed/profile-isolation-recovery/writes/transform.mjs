import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const priorPrelude=readFileSync(new URL('../../profile-isolation-final/writes/source/broker-runtime.js',import.meta.url),'utf8');
export const recoveryWritesPrelude=readFileSync(new URL('./source/broker-runtime.js',import.meta.url),'utf8');
const sha=source=>createHash('sha256').update(source).digest('hex');
export function applyAuxRecoveryWrites(source){
 const inputSha256=sha(source);
 if(inputSha256!=='bf82847ebfcdf0aa369f9c900bcc22de0cf2bad4b24eb36ba8285ba7522bf0e0')throw Error('Unreviewed recovery writers input '+inputSha256);
 const changes=[];
 function replace(name,before,after){const count=source.split(before).length-1;if(count!==1)throw Error(name+' expected one source seam, got '+count);source=source.replace(before,after);changes.push({name,count})}
 function wrap(name,parameters,mode,opening){
  const prefix=mode==='sync'?'function ':'async function ';
  const before=prefix+name+'('+parameters+'){'+opening;
  const helper='auxOwned_'+name;
  replace(name,before,prefix+name+'('+parameters+'){return auxBrokerBoundary().'+(mode==='sync'?'sync':'awaited')+'(()=>'+helper+'('+parameters+'))}'+prefix+helper+'('+parameters+'){'+opening);
 }
 replace('passive background stream lifecycle',priorPrelude,recoveryWritesPrelude);
 wrap('appendSessionMessageJsonlRow','Cn,ei,ti','sync','let ni=');
 wrap('rewriteSessionMessageJsonlRows','Cn,ei,ti','sync','let ni=');
 wrap('prepareFileAttachment','Cn,ei','awaited','if(ei.path');
 wrap('atomicWrite','Cn,ei','awaited','await fs$1.mkdir');
 wrap('saveDreamState','Cn,ei','awaited','await fs$1.mkdir');
 wrap('ensureRoutineMemory','Cn,ei','awaited','let ti=');
 // Existing path/hook approval resolves first; native admission happens just
 // before starting each concrete Node filesystem operation. Hook settlement
 // is not treated as evidence about any detached work a hook may start.
 const methods=[
 ['writeFile','async(Cn,ei)=>fs$1.writeFile(await oi(Cn,`write`),ei)','async(Cn,ei)=>{let ti=await oi(Cn,`write`);return auxBrokerBoundary().awaited(()=>fs$1.writeFile(ti,ei))}'],
 ['mkdir','async(Cn,ei)=>fs$1.mkdir(await oi(Cn,`write`),ei)','async(Cn,ei)=>{let ti=await oi(Cn,`write`);return auxBrokerBoundary().awaited(()=>fs$1.mkdir(ti,ei))}'],
 ['unlink','async Cn=>fs$1.unlink(await oi(Cn,`write`))','async Cn=>{let ei=await oi(Cn,`write`);return auxBrokerBoundary().awaited(()=>fs$1.unlink(ei))}'],
 ['rm','async(Cn,ei)=>fs$1.rm(await oi(Cn,`write`),ei)','async(Cn,ei)=>{let ti=await oi(Cn,`write`);return auxBrokerBoundary().awaited(()=>fs$1.rm(ti,ei))}'],
 ['rename','async(Cn,ei)=>fs$1.rename(await oi(Cn,`write`),await oi(ei,`write`))','async(Cn,ei)=>{let ti=await oi(Cn,`write`),ni=await oi(ei,`write`);return auxBrokerBoundary().awaited(()=>fs$1.rename(ti,ni))}'],
 ['copyFile','async(Cn,ei)=>fs$1.copyFile(await oi(Cn,`read`),await oi(ei,`write`))','async(Cn,ei)=>{let ti=await oi(Cn,`read`),ni=await oi(ei,`write`);return auxBrokerBoundary().awaited(()=>fs$1.copyFile(ti,ni))}']
 ];
 for(const [name,before,after] of methods)replace('REPL fs '+name,name+':'+before,name+':'+after);
 replace('session directory creation','ensureSessionDir=(Cn,ei)=>{let ti=getSessionStorageDir(Cn,ei);return mkdirSync(ti,{recursive:!0}),mkdirSync(getSessionTaskDir(Cn,ei),{recursive:!0}),ti}','ensureSessionDir=(Cn,ei)=>auxBrokerBoundary().sync(()=>{let ti=getSessionStorageDir(Cn,ei);return mkdirSync(ti,{recursive:!0}),mkdirSync(getSessionTaskDir(Cn,ei),{recursive:!0}),ti})');
 replace('session temporary directory creation','ensureSessionTmpDir=Cn=>{let ei=getSessionTmpDir(Cn);return mkdirSync(ei,{recursive:!0}),ei}','ensureSessionTmpDir=Cn=>auxBrokerBoundary().sync(()=>{let ei=getSessionTmpDir(Cn);return mkdirSync(ei,{recursive:!0}),ei})');
 replace('background log directory','function sessionTmpDir(Cn,...ei){let ti=','function sessionTmpDir(Cn,...ei){return auxBrokerBoundary().sync(()=>auxOwned_sessionTmpDir(Cn,...ei))}function auxOwned_sessionTmpDir(Cn,...ei){let ti=');
 replace('background stdout stderr resource custody','ti=createWriteStream(ei,{fd:openSync(ei,`wx`)});return ti.on(`error`','ti=auxBrokerBoundary().outputStream(()=>createWriteStream(ei,{fd:openSync(ei,`wx`)}));return ti.on(`error`');
 replace('background detached delivery admission','function flush({accountId:Cn,sessionId:ei}){deliverToSelf','function flush({accountId:Cn,sessionId:ei}){try{auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked()}catch{return}deliverToSelf');
 replace('channel attachment restoration','await fs$1.mkdir(path.dirname(ei),{recursive:!0}),await fs$1.writeFile(ei,Buffer.from(ti.data,`base64`),{flag:`wx`}).catch(Cn=>{if(Cn.code!==`EEXIST`)throw Cn}),ti.data=void 0','await auxBrokerBoundary().awaited(async()=>{await fs$1.mkdir(path.dirname(ei),{recursive:!0});await fs$1.writeFile(ei,Buffer.from(ti.data,`base64`),{flag:`wx`}).catch(Cn=>{if(Cn.code!==`EEXIST`)throw Cn})}),ti.data=void 0');
 replace('generated image artifact','return await fs$1.writeFile(ni,ei),{type:`image`,data:Cn.data,mimeType:ti,path:ni}','return await auxBrokerBoundary().awaited(()=>fs$1.writeFile(ni,ei)),{type:`image`,data:Cn.data,mimeType:ti,path:ni}');
 replace('REPL display image','await fs$1.writeFile(si,Buffer.from(ii.data,`base64`));let ci=`Displayed image saved to:','await auxBrokerBoundary().awaited(()=>fs$1.writeFile(si,Buffer.from(ii.data,`base64`)));let ci=`Displayed image saved to:');
 replace('tool edit write','await fs$1.writeFile(ai,si+restoreLineEndings(di,li),{encoding:`utf-8`,signal:ii});let pi=[]','await auxBrokerBoundary().awaited(()=>fs$1.writeFile(ai,si+restoreLineEndings(di,li),{encoding:`utf-8`,signal:ii}));let pi=[]');
 replace('tool direct write and directory','await fs$1.mkdir(path.dirname(ii),{recursive:!0}),await fs$1.writeFile(ii,ri);let oi=[]','await auxBrokerBoundary().awaited(async()=>{await fs$1.mkdir(path.dirname(ii),{recursive:!0});await fs$1.writeFile(ii,ri)});let oi=[]');
 return {source,inputSha256,outputSha256:sha(source),changes};
}
