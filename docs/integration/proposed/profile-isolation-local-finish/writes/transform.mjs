import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
export const producerPrelude=readFileSync(new URL('./source/producer-runtime.js',import.meta.url),'utf8');
const sha=source=>createHash('sha256').update(source).digest('hex');
export function applyAuxLocalFinishWrites(source){
 const inputSha256=sha(source);if(inputSha256!=='2c2f8f35308afeb8ba979543410f09fd2462f76c9c00351ba5a8768cbcef3431')throw Error('Unreviewed local-finish source '+inputSha256);
 const changes=[];
 function replace(name,before,after){const count=source.split(before).length-1;if(count!==1)throw Error(name+' expected one seam, got '+count);source=source.replace(before,after);changes.push({name,count})}
 replace('producer helpers after refusal','// Inactive pinned daemon-only broker.',producerPrelude+'\n// Inactive pinned daemon-only broker.');
 replace('download cancellation scope','async function downloadArchive(Cn,ei,ti,ni,ri,ii){','async function downloadArchive(Cn,ei,ti,ni,ri,ii){return auxWithDownload(signal=>auxLocalDownloadArchive(Cn,ei,ti,ni,ri,ii,signal))}async function auxLocalDownloadArchive(Cn,ei,ti,ni,ri,ii,auxSignal){');
 replace('download loop cancellation','let ai=0,oi=0;for(;ai<Cn.size;){let si=','let ai=0,oi=0;for(;ai<Cn.size;){auxSignal.throwIfAborted();let si=');
 replace('download actual request signal','headers:ai>0?{Range:`bytes=${ai}-`}:void 0,signal:si.signal','headers:ai>0?{Range:`bytes=${ai}-`}:void 0,signal:AbortSignal.any([si.signal,auxSignal])');
 replace('download retry cancellation','if(Cn instanceof NonRetryableDownloadError||oi>=ri)throw Cn;','if(auxSignal.aborted||Cn instanceof NonRetryableDownloadError||oi>=ri)throw Cn;');
 replace('download backpressure cancellation','fi.write(ti)||await new Promise(Cn=>fi.once(`drain`,Cn))','fi.write(ti)||await auxWaitWritable(fi,auxSignal)');
 replace('download terminal output cleanup','await new Promise((Cn,ei)=>fi.end(ti=>ti?ei(ti):Cn()))','await new Promise((Cn,ei)=>{if(fi.closed)return Cn();const done=()=>{fi.off(`error`,fail);Cn()},fail=ti=>{fi.off(`close`,done);ei(ti)};fi.once(`close`,done);fi.once(`error`,fail);fi.destroyed||fi.end()})');
 replace('ZIP reader retained resource','ri=await openZip(Cn);await mkdir(ei,{recursive:!0});','ri=await auxOpenZipResource(Cn);await mkdir(ei,{recursive:!0});');
 replace('ZIP cancellation rejects entry loop','ri.on(`error`,oi),ri.on(`end`,()=>ii.then','ri.on(`error`,oi),ri.on(`close`,()=>auxStoppedZipReaders.has(ri)&&oi(Error(`Runtime ZIP extraction cancelled`))),ri.on(`end`,()=>ii.then');
 replace('routine interval registered shutdown','setInterval(()=>{checking||(checking=!0,(async()=>','auxManagedInterval(()=>{return checking||(checking=!0,(async()=>');
 replace('session lifecycle interval shutdown','setInterval(async()=>{await purgeEphemeralSessions()','auxManagedInterval(async()=>{await purgeEphemeralSessions()');
 replace('memory actual close shutdown','#b(){this.#p=!0,mkdirSync(path.join(this.#h,EPISODIC_DIR),{recursive:!0}),this.#i=chokidar_default.watch([this.#h],','#b(){auxBrokerBoundary().registerProducerStop(()=>this.close());this.#p=!0,auxBrokerBoundary().sync(()=>mkdirSync(path.join(this.#h,EPISODIC_DIR),{recursive:!0})),this.#i=auxBrokerBoundary().watcher(()=>chokidar_default.watch([this.#h],');
 replace('memory watcher factory closing','atomic:!0,ignorePermissionErrors:!0}),this.#i.on(`add`','atomic:!0,ignorePermissionErrors:!0})),this.#i.on(`add`');
 replace('memory sync admission','async#x(Cn,ei){if(!this.#p)return;','async#x(Cn,ei){try{auxBrokerBoundary().assertOwner()}catch{return}if(!this.#p)return;');
 replace('memory deferred sync admission','if(this.#s=void 0,this.#p){if(this.#c||this.#a)','if(this.#s=void 0,this.#p){try{auxBrokerBoundary().assertOwner()}catch{return}if(this.#c||this.#a)');
 replace('artifact watcher retained resource','this.#i=watch(Cn,(Cn,ei)=>{if(!ei)return;','this.#i=auxWatchFileResource(()=>watch(Cn,(Cn,ei)=>{if(!ei)return;');
 replace('artifact watcher retained close','this.#e.add(`${SESSION_ARTIFACTS_DIR}/${ti}`)})}async collectAndStop','this.#e.add(`${SESSION_ARTIFACTS_DIR}/${ti}`)}))}async collectAndStop');
 return {source,inputSha256,outputSha256:sha(source),changes};
}
