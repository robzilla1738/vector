import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const sha=value=>createHash('sha256').update(value).digest('hex');
const oldPrelude=readFileSync(new URL('../../profile-isolation-continuation/broker-writes/source/broker-runtime.js',import.meta.url),'utf8');
export const writesPrelude=readFileSync(new URL('./source/broker-runtime.js',import.meta.url),'utf8');
export function applyAuxAwaitedWrites(source){
 const inputSha256=sha(source);
 if(inputSha256!=='6a2b15fe81ed3eb0cd8f13bbc0af0dee2d714accf3d9b4f73292fde0f3d17ed0')throw Error('Unreviewed awaited writer input '+inputSha256);
 const changes=[];
 function replace(name,before,after){const count=source.split(before).length-1;if(count!==1)throw Error(name+' expected one source seam; got '+count);source=source.replace(before,after);changes.push({name,count})}
 replace('native finite writer runtime',oldPrelude,writesPrelude);
 replace('finite async tool atomic write','async function atomicWriteFile(Cn,ei){let ti=','async function atomicWriteFile(Cn,ei){return auxBrokerBoundary().awaited(()=>auxAwaitedAtomicWriteFile(Cn,ei))}async function auxAwaitedAtomicWriteFile(Cn,ei){let ti=');
 replace('finite async credential file write','async function writeCredentialsFileAtomic(Cn,ei){let{fs:','async function writeCredentialsFileAtomic(Cn,ei){return auxBrokerBoundary().awaited(()=>auxAwaitedCredentialFile(Cn,ei))}async function auxAwaitedCredentialFile(Cn,ei){let{fs:');
 replace('credential optional directory cleanup uncertainty','}catch{}}async function readLimitedText(Cn){','}catch{auxBrokerBoundary().noteUntracked()}}async function readLimitedText(Cn){');
 replace('finite memory history append','async function appendMemoryHistoryEntry(Cn,ei){await ensureMemoryDir(Cn);','async function appendMemoryHistoryEntry(Cn,ei){return auxBrokerBoundary().awaited(()=>auxAwaitedMemoryHistory(Cn,ei))}async function auxAwaitedMemoryHistory(Cn,ei){await ensureMemoryDir(Cn);');
 replace('file logger refuses late entry','function appendFileLog(Cn,ei,ti){try{let ni=','function appendFileLog(Cn,ei,ti){try{auxBrokerBoundary().assertOwner();let ni=');
 replace('logger directory guarded sync','let Cn=getLogFilePath(ni);mkdirSync(path.dirname(Cn),{recursive:!0});','let Cn=getLogFilePath(ni);auxBrokerBoundary().sync(()=>mkdirSync(path.dirname(Cn),{recursive:!0}));');
 replace('actual logger stream close custody','let ei=createWriteStream(Cn,{flags:`a`,encoding:`utf8`,mode:384});','let ei=auxBrokerBoundary().logStream(()=>createWriteStream(Cn,{flags:`a`,encoding:`utf8`,mode:384}));');
 replace('shutdown resource lifecycle','ii=()=>{if(ni)return;auxBrokerBoundary().close();ni=!0;','ii=()=>{if(ni)return;const auxWritesShutdown=auxBrokerBoundary().beginShutdown();ni=!0;');
 replace('join actual resource shutdown','Promise.all([globalChannelManager.shutdownAll(),shutdownComputerUseHelper(),stopCoderWork()])','Promise.all([auxWritesShutdown,globalChannelManager.shutdownAll(),shutdownComputerUseHelper(),stopCoderWork()])');
 return {source,changes,inputSha256,outputSha256:sha(source)};
}
