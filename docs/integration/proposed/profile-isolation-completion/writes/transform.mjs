import {createHash} from 'node:crypto';
const sha=source=>createHash('sha256').update(source).digest('hex');
export function applyAuxCompletionWrites(source){
 const inputSha256=sha(source);
 if(inputSha256!=='18edabeb2303d834f51f3d99effcdf1c49286fc495d76dd16cfe2e6de56a5596')throw Error('Unreviewed completion writer input '+inputSha256);
 const changes=[];
 function replace(name,before,after){const count=source.split(before).length-1;if(count!==1)throw Error(name+' expected one seam, got '+count);source=source.replace(before,after);changes.push({name,count})}
 function wrap(name,parameters,mode,opening){const prefix=mode==='sync'?'function ':'async function ',helper='auxCompleted_'+name;replace(name,prefix+name+'('+parameters+'){'+opening,prefix+name+'('+parameters+'){return auxBrokerBoundary().'+mode+'(()=>'+helper+'('+parameters+'))}'+prefix+helper+'('+parameters+'){'+opening)}
 // Concrete original stream ownership is retained until close independently
 // from fetch/pipeline/iterator completion. It is never ended by shutdown.
 for(const [name,before] of [
  ['model decompression output','createWriteStream(ri,{flags:`wx`,mode:384})'],
  ['skill archive output','fs$12.createWriteStream(ti)'],
  ['runtime archive output','createWriteStream(ei,{flags:oi>0&&ui?`a`:`w`})'],
  ['runtime zip entry output','createWriteStream(ai,{flags:`wx`})'],
  ['webfetch artifact output','createWriteStream(ri)']
 ])replace(name,before,'auxBrokerBoundary().outputStream(()=>'+before+')');
 replace('sync metadata SQLite custody','mkdirSync(getAgentFileSyncDir(Cn),{recursive:!0});let ti=new DatabaseSync(getAgentFileSyncDbPath(Cn));','auxBrokerBoundary().sync(()=>mkdirSync(getAgentFileSyncDir(Cn),{recursive:!0}));let ti=auxBrokerBoundary().database(()=>new DatabaseSync(getAgentFileSyncDbPath(Cn)));');
 wrap('preserveWritableDirectories','Cn,ei','awaited','for(let ti of WRITABLE_DIRECTORIES)');
 wrap('applyFiles','Cn,ei,ti','sync','let ni=');
 wrap('mergeMigrationEntry','Cn,ei','sync','try{');
 wrap('ensureOwnedDirectory','Cn,ei','sync','if(isOwnedDirectory');
 wrap('hasExternalStorageMarker','Cn','sync','let ei=');
 wrap('markExternalStorageComplete','Cn','sync','if(!hasExternalStorageMarker');
 wrap('ensureProjectV6SessionAlias','Cn','sync','try{');
 // Preserve existing catch/continue semantics but retain one-way uncertainty
 // before migration code whose internal fallbacks can hide partial outcomes.
 for(const [name,before] of [
  ['migration merge uncertainty','function auxCompleted_mergeMigrationEntry(Cn,ei){try{'],
  ['migration alias uncertainty','function auxCompleted_ensureProjectV6SessionAlias(Cn){try{'],
  ['migration marker uncertainty','function auxCompleted_markExternalStorageComplete(Cn){if(']
 ])replace(name,before,before.replace('{try{','{auxBrokerBoundary().noteUntracked();try{').replace('{if(','{auxBrokerBoundary().noteUntracked();if('));
 // Event-driven ZIP extraction and subprocess skill extraction can reject
 // before other producers drain. Admit+retain unknown, never call these finite.
 for(const [name,before] of [
  ['skill extraction admission','async function extractSkillArchive(Cn,ei){'],
  ['zip extraction admission','async function extractArchive(Cn,ei,ti){'],
  ['runtime installation admission','async function performInstall(Cn){'],
  ['runtime replacement callback admission','async function replaceRuntime(Cn,ei,ti){'],
  ['runtime download admission','async function downloadArchive(Cn,ei,ti,ni,ri,ii){']
 ])replace(name,before,before+'auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();');
 // Actual callback dispatch rechecks admission when queued work starts, not
 // merely when queued. Unknown producer lifetime cannot be released by queue.
 replace('sync queue dispatch','function enqueue(Cn,ei){let ti=runtimes.get(Cn);if(!ti)return ei();let ni=ti.generation,ri=()=>runtimes.get(Cn)===ti&&ti.generation===ni?ei():Promise.resolve(),','function enqueue(Cn,ei){const auxDispatch=()=>{auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();return ei()};let ti=runtimes.get(Cn);if(!ti)return Promise.resolve().then(auxDispatch);let ni=ti.generation,ri=()=>runtimes.get(Cn)===ti&&ti.generation===ni?auxDispatch():Promise.resolve(),');
 replace('watch callback admission','ii=ni=>{runtimes.get(Cn)===ei&&(ei.fileCache.delete','ii=ni=>{try{auxBrokerBoundary().assertOwner()}catch{return}runtimes.get(Cn)===ei&&(ei.fileCache.delete');
 replace('watch creation admission','function startWatchers(Cn){let ei=','function startWatchers(Cn){auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();let ei=');
 // Routine/provider callbacks may start nested work: preserve explicit unknown.
 replace('dream scheduled producer','function runDreaming(Cn){let ei=','function runDreaming(Cn){auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();let ei=');
 return {source,inputSha256,outputSha256:sha(source),changes};
}
