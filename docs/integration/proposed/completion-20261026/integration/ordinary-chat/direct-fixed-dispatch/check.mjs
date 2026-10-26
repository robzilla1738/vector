import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(process.argv[2],'utf8');
const take=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const realm=vm.createContext({assert,AbortController,AbortSignal});
vm.runInContext(`
let account={id:0,createdAt:1,incarnationId:'a',mode:'local'},session={id:'s',createdAt:2},epoch=0,suspended=false,bound=true,closed=0,executed=0;
const listeners=new Set,AccountRegistry={getAccount:()=>account},SessionStore={get:()=>session};
function externalOwnerEpoch(){return epoch}function isExternalOwnerSuspended(){return suspended}
function onAccountAuthChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function auxCaptureReadFileScope(){let close;return{guard:{assertCurrent(){}},scope:{awaited:operation=>operation()},close:()=>close??=Promise.resolve().then(()=>{closed++})}}
function auxUsesBoundBrowserActions(){return bound}function auxRequireSupervisedTasks(){throw Error('supervised-disabled')}
const auxBrowserTools=new WeakMap;
const context={accountId:0,session:{id:'s',createdAt:2}};
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}}
`,realm);
vm.runInContext(take('var auxDirectFixedTools;','var auxLazyDesktopReplResolvers;')+take('function auxExecuteRegisteredBrowserTool','function auxCreateBrowserOnlyRepl'),realm);
await vm.runInContext(`(async()=>{
const direct=auxRegisterDirectFixedTool(context,{name:'memory_search',execute:async(id,args,signal)=>{signal.throwIfAborted();executed++;return 'found'}});
assert.equal(executed,0);assert.equal(await auxExecuteRegisteredBrowserTool({tool:direct},()=>direct.execute('id',{})),'found');assert.equal(executed,1);assert.equal(closed,1);
assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:{name:'memory_search',execute(){}}},()=>{}),/supervised-disabled/);
assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:{}},()=>{}),/supervised-disabled/);
const original=direct.execute;direct.execute=async()=>{};assert.equal(auxIsDirectFixedTool(direct),false);direct.execute=original;
const stale=auxRegisterDirectFixedTool(context,{execute:async()=>{executed++}});account={...account,incarnationId:'b'};await assert.rejects(stale.execute('id',{}),/account or session changed/);assert.equal(executed,1);account={...account,incarnationId:'a'};
const wait=deferred(),parent=new AbortController();let forwarded,settled=false;
const slow=auxRegisterDirectFixedTool(context,{execute:async(id,args,signal)=>{forwarded=signal;return wait.promise}});const running=slow.execute('id',{},parent.signal);running.then(()=>{settled=true},()=>{settled=true});parent.abort();await Promise.resolve();assert.equal(forwarded.aborted,true);assert.equal(settled,false);wait.resolve('late');await assert.rejects(running,/abort/i);assert.equal(settled,true);
const change=deferred();let changedSignal;const active=auxRegisterDirectFixedTool(context,{execute:async(id,args,signal)=>{changedSignal=signal;return change.promise}});const activeResult=active.execute('id',{});epoch++;for(const listener of listeners)listener(0);assert.equal(changedSignal.aborted,true);change.resolve('stale');await assert.rejects(activeResult,/account or session changed/);epoch--;
const drain=deferred();const disposable=auxRegisterDirectFixedTool(context,{execute:()=>drain.promise});const work=disposable.execute('id',{});const rejected=assert.rejects(work);let disposed=false;const disposal=disposable.dispose();assert.equal(disposal,disposable.dispose());disposal.then(()=>disposed=true);await Promise.resolve();assert.equal(disposed,false);drain.resolve('late');await rejected;await disposal;assert.equal(disposed,true);
bound=false;assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:direct},()=>{}),/supervised-disabled/);assert.equal(listeners.size,0);
})()`,realm);
console.log('PASS: descriptor identity, no name bypass, original direct API, native scope, owner replacement, auth cancellation, awaited real drain, stale-result discard, idempotent disposal, generic guard');
