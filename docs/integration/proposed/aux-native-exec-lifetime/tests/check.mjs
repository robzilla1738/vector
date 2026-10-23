import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {EventEmitter} from 'node:events';
import vm from 'node:vm';
import {projectOwnedNativeEntryWithFixedPty} from '../../aux-native-owned-entry-pty/source/project.mjs';
import {projectOwnedExecLifetime} from '../source/project.mjs';
const edits=JSON.parse(readFileSync(new URL('../edits.json',import.meta.url),'utf8')).edits;
const [originalPath,inputPath]=process.argv.slice(2);
const prior=projectOwnedNativeEntryWithFixedPty(readFileSync(originalPath,'utf8'),readFileSync(inputPath,'utf8'));
const projected=projectOwnedExecLifetime(prior);
assert.throws(()=>projectOwnedExecLifetime(prior+' '),/Exact owned/);
const syntax=spawnSync(process.execPath,['--check','--input-type=module'],{input:projected,encoding:'utf8',maxBuffer:1024*1024});assert.equal(syntax.status,0,syntax.stderr);
const storeSource=edits.find(x=>x.name.startsWith('store generation')).replace.replace(/,$/,'');
const context={Map,Set,Promise,Error,AbortController,Symbol,Date,setInterval(){return{unref(){}}},clearInterval(){},MAX_SESSIONS:16,sortByLastTouched:(a,b)=>a.lastTouchedAt-b.lastTouchedAt};
vm.createContext(context);vm.runInContext('var retainedExecSessionStores,ExecSessionStore;'+storeSource+';globalThis.Store=ExecSessionStore;',context);
const tick=async()=>{await Promise.resolve();await Promise.resolve()};
function processHandle(){let resolve,reject;const exited=new Promise((a,b)=>{resolve=a;reject=b});return{tty:true,exited,resolve,reject,signals:[],signal(s){this.signals.push(s)}}}
function session(id){return{id,disposed:0,status:'running',lastTouchedAt:0,dispose(){this.disposed++},isExpired(){return false}}}
{
 const store=new context.Store, ticket=store.beginSpawn();ticket.starting();
 assert.equal(store.terminateAll().pendingSpawns,1);
 const handle=processHandle();ticket.attach(handle);const child=session(1);ticket.bindSession(child);
 assert.equal(handle.signals[0],'SIGTERM');assert.equal(store.observeTermination().liveProcesses,1);assert.equal(store.observeTermination().retiringProcesses,1);
 assert.equal(context.retainedExecSessionStores.has(store),true);handle.resolve(0);await tick();
 assert.equal(store.observeTermination().liveProcesses,0);assert.equal(context.retainedExecSessionStores.has(store),false);
 const before=store.beginSpawn();assert.equal(before.cancelBeforeLaunch(),true);assert.equal(store.observeTermination().pendingSpawns,0);
 const unknown=store.beginSpawn();unknown.starting();assert.equal(unknown.cancelBeforeLaunch(),false);unknown.unknown();
 assert.equal(store.observeTermination().unknownSpawns,1);store.dispose();assert.equal(context.retainedExecSessionStores.has(store),true);
 assert.throws(()=>store.beginSpawn(),/SESSION_CLOSED/);
}
{
 const store=new context.Store, old=processHandle(), next=processHandle(), oldSession=session(2), nextSession=session(3);
 const ticket=store.beginSpawn();ticket.starting();ticket.attach(old);ticket.bindSession(oldSession);store.register(oldSession);
 store.signal.addEventListener('abort',()=>{const t=store.beginSpawn();t.starting();t.attach(next);t.bindSession(nextSession);store.register(nextSession)},{once:true});
 store.terminateAll();assert.equal(oldSession.disposed,1);assert.equal(nextSession.disposed,0);assert.equal(store.get(3),nextSession);assert.throws(()=>store.get(2),/SESSION_NOT_FOUND/);
 assert.equal(store.observeTermination().retiringProcesses,1);old.resolve(0);next.resolve(0);await tick();
 assert.equal(store.observeTermination().liveProcesses,0);
}
{
 const store=new context.Store, handle=processHandle(), ticket=store.beginSpawn();ticket.starting();ticket.attach(handle);store.terminateAll();
 handle.reject(Error('captured close observation unavailable'));await tick();
 assert.equal(store.observeTermination().unknownProcesses,1);assert.equal(store.observeTermination().liveProcesses,1);assert.equal(context.retainedExecSessionStores.has(store),true);
}
// Actual producer defers runtime installation release past background return,
// and retains the release closure when actual spawn invocation threw unknown.
const producer=edits.find(x=>x.name.startsWith('blocking runtime')).replace;
let releases=0,phase='ok',child;
const producerContext={process:{kill(){throw Error('No OS effect allowed')}},Error,retainedUnknownRuntimeUses:new Set,
 async prepareSessionSpawn(){let done=false;return{spawnOptions:{cwd:'/captured'},release(){if(!done){done=true;releases++}}}},
 async spawnSandboxed(options,onStart){if(phase==='before')throw Error('before');onStart();if(phase==='after')throw Error('after');return{process:child}}};
vm.createContext(producerContext);vm.runInContext(producer,producerContext);
child=new EventEmitter;child.pid=123;child.kill=()=>{throw Error('No effect')};
const result=await producerContext.spawnSessionProcess({},['captured']);result.release();assert.equal(releases,0);child.emit('close',0);assert.equal(releases,1);result.release();assert.equal(releases,1);
phase='before';await assert.rejects(producerContext.spawnSessionProcess({},['captured']),/before/);assert.equal(releases,2);
phase='after';await assert.rejects(producerContext.spawnSessionProcess({},['captured']),/after/);assert.equal(releases,2);assert.equal(producerContext.retainedUnknownRuntimeUses.size,1);
// Actual yielded tool path still returns promptly; lease releases only on the
// actual handle close promise, not that background response or termination.
let release=0;const handle=processHandle(),store=new context.Store;
context.spawnExecProcess=async(_opts,_tty,start)=>{start();return handle};
context.ExecSession=class{constructor(p){this.process=p;this.id=50;this.status='running'}async waitForExit(){return false}readOutput(){return{text:'captured output',status:'running'}}dispose(){this.process.signal('SIGTERM')}isExpired(){return false}};
vm.runInContext(edits.find(x=>x.name.startsWith('actual yielded')).replace,context);
const response=await context.executeYieldedCommand({execSessions:store,spawnOptions:{},command:['captured'],runtime:'local-bash',tty:true,onExit(){release++}});
assert.equal(response.details.execSessionId,50);assert.equal(response.details.status,'running');assert.equal(release,0);
store.terminateAll();assert.equal(release,0);assert.equal(store.observeTermination().liveProcesses,1);handle.resolve(0);await tick();assert.equal(release,1);assert.equal(store.observeTermination().liveProcesses,0);
// Actual catch branch distinguishes the source-known pre-launch phase from
// ambiguity after the real launch invocation; strings do not decide release.
{
 let released=0;const beforeStore=new context.Store;
 context.spawnExecProcess=async()=>{throw Error('same error text')};
 await assert.rejects(context.executeYieldedCommand({execSessions:beforeStore,spawnOptions:{},command:['captured'],tty:true,onExit(){released++}}),/same error/);
 assert.equal(released,1);assert.equal(beforeStore.observeTermination().pendingSpawns,0);
 const afterStore=new context.Store;
 context.spawnExecProcess=async(_o,_t,start)=>{start();throw Error('same error text')};
 await assert.rejects(context.executeYieldedCommand({execSessions:afterStore,spawnOptions:{},command:['captured'],tty:true,onExit(){released++}}),/same error/);
 assert.equal(released,1);assert.equal(afterStore.observeTermination().pendingSpawns,1);assert.equal(afterStore.observeTermination().unknownSpawns,1);
 assert.equal(context.retainedExecSessionStores.has(afterStore),true);
}
console.log(JSON.stringify({status:'passed',projectedSha256:createHash('sha256').update(projected).digest('hex'),syntaxExitCode:syntax.status,backgroundResponsePreserved:true,actualCloseOnlyRelease:true,reentrantNewGenerationPreserved:true,unknownRetained:true,entryExecuted:false,nativeModuleLoaded:false,OSCalls:0}));
