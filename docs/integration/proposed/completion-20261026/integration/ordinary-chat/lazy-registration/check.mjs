import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(process.argv[2],'utf8');
const take=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const context=vm.createContext({assert,AbortController});
vm.runInContext(`
let account={createdAt:1,incarnationId:'original'},session={createdAt:2},bound=true,supervised=false,created=0,executed=0,closed=0,settled=false,ownerValid=true;
const AccountRegistry={getAccount(){return account}},SessionStore={get(){return session}};
const auxBrowserRepls=new WeakMap,auxBrowserTools=new WeakMap;
function auxUsesBoundBrowserActions(){return bound}
function auxRequireSupervisedTasks(){if(!supervised)throw Error('supervised-disabled')}
function factory(){created++;const repl={run(){executed++;return 'ok'},dispose(){closed++;return Promise.resolve().then(()=>{settled=true})}};auxBrowserRepls.set(repl,{awaited(operation){if(!ownerValid)throw Error('native-owner-changed');return operation()}});return repl}
`,context);
vm.runInContext(take('var auxLazyDesktopReplResolvers;','function auxCaptureAgentStartAttempt')+take('function auxRegisterBrowserReplTool','function auxCreateBrowserOnlyRepl'),context);
await vm.runInContext(`(async()=>{
const lazy=auxCreateLazyDesktopRepl(factory,0,'session',2),tool=auxRegisterBrowserReplTool({execute(){return lazy.run()}},lazy);
assert.equal(created,0);assert.equal(auxExecuteRegisteredBrowserTool({tool},()=>tool.execute()),'ok');assert.equal(created,1);assert.equal(executed,1);
ownerValid=false;assert.throws(()=>auxExecuteRegisteredBrowserTool({tool},()=>tool.execute()),/native-owner-changed/);assert.equal(executed,1);ownerValid=true;
const disposal=lazy.dispose();assert.equal(lazy.dispose(),disposal);await disposal;assert.equal(closed,1);assert.equal(settled,true);assert.throws(()=>tool.execute(),/closed/);
const unused=auxCreateLazyDesktopRepl(factory,0,'session',2);unused.dispose();assert.equal(created,1);
const stale=auxCreateLazyDesktopRepl(factory,0,'session',2),staleTool=auxRegisterBrowserReplTool({},stale);account={createdAt:1,incarnationId:'replacement'};assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:staleTool},()=>{}),/account or session changed/);assert.equal(created,1);
account={createdAt:1,incarnationId:'original'};const replaced=auxCreateLazyDesktopRepl(factory,0,'session',2);session={createdAt:3};assert.throws(()=>replaced.run(),/account or session changed/);assert.equal(created,1);session={createdAt:2};
bound=false;const generic=auxCreateLazyDesktopRepl(factory,0,'session',2),genericTool=auxRegisterBrowserReplTool({},generic);assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:genericTool},()=>{}),/supervised-disabled/);assert.equal(created,1);
bound=true;assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:{}},()=>{}),/supervised-disabled/);
const missing=auxCreateLazyDesktopRepl(()=>({run(){throw Error('must not run')}}),0,'session',2),missingTool=auxRegisterBrowserReplTool({},missing);assert.throws(()=>auxExecuteRegisteredBrowserTool({tool:missingTool},()=>{}),/supervised-disabled/);
})()`,context);
console.log('PASS: lazy creation, scoped execution, native owner rejection, account/session replacement, awaited idempotent disposal, unchanged generic/unregistered guard');
