import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const previous=readFileSync(new URL('../../profile-isolation-recovery/writes/source/broker-runtime.js',import.meta.url),'utf8');
export const deliveryPrelude=readFileSync(new URL('./source/broker-runtime.js',import.meta.url),'utf8');
export const stopPrelude=readFileSync(new URL('./source/stop-producers.js',import.meta.url),'utf8');
const sha=source=>createHash('sha256').update(source).digest('hex');
export function applyAuxDeliveryWrites(source){
 const inputSha256=sha(source);if(inputSha256!=='cd56bbb6245d56f1714dc498907653deb06f7a704946f55ee87652a9d0f053c1')throw Error('Unreviewed producer input '+inputSha256);
 const changes=[];
 function replace(name,before,after){const count=source.split(before).length-1;if(count!==1)throw Error(name+' expected one seam, got '+count);source=source.replace(before,after);changes.push({name,count})}
 replace('producer close runtime',previous,deliveryPrelude+stopPrelude);
 replace('sync startup registered stop','function startAccount(Cn){if(runtimes.has(Cn))','function startAccount(Cn){auxBrokerBoundary().registerProducerStop(auxStopSyncProducers);if(runtimes.has(Cn))');
 replace('history startup registered stop','function startHistorySync(Cn){if(!isSyncEnabled(Cn))','function startHistorySync(Cn){auxBrokerBoundary().registerProducerStop(auxStopSyncProducers);if(!isSyncEnabled(Cn))');
 replace('history tick admission','oi=()=>{!ii&&ai()&&(ii=(async()=>{for(let ei of historyProfilePaths','oi=()=>{try{auxBrokerBoundary().assertOwner()}catch{return}!ii&&ai()&&(ii=(async()=>{for(let ei of historyProfilePaths');
 replace('watch resource construction','let ri=chokidar_default.watch(ni,{awaitWriteFinish:','let ri=auxBrokerBoundary().watcher(()=>chokidar_default.watch(ni,{awaitWriteFinish:');
 replace('watch resource construction end','context-awareness-[^/\\\\]+$/]}),ii=ni=>{try{auxBrokerBoundary().assertOwner()}','context-awareness-[^/\\\\]+$/]})),ii=ni=>{try{auxBrokerBoundary().assertOwner()}');
 replace('poll stop registration','function startPoll(Cn){let ei=','function startPoll(Cn){auxBrokerBoundary().registerProducerStop(auxStopSyncProducers);let ei=');
 replace('cookie trigger stop registration','function startCookieSync(Cn){let ei=','function startCookieSync(Cn){auxBrokerBoundary().registerProducerStop(auxStopSyncProducers);let ei=');
 replace('debounce stop registration','function schedule(Cn){let ei=','function schedule(Cn){try{auxBrokerBoundary().registerProducerStop(auxStopSyncProducers)}catch{return}let ei=');
 // Provider callbacks remain generic/unknown. Link their real abort signal to
 // shutdown, retain native pending until their actual callback promise settles.
 replace('OAuth refresh cancellable producer','async function refreshOAuthCredential(Cn,...[ei,ti]){try{return await Cn.refresh(ei,ti)}catch(Cn){throw toOAuthRefreshError(Cn)}}','async function refreshOAuthCredential(Cn,...[ei,ti]){return auxRefreshProducer(Cn,ei,ti)}');
 return{source,inputSha256,outputSha256:sha(source),changes};
}
