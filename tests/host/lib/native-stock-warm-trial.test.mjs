import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
// Execute the real factory with controlled dependencies. No native child,
// fixture-directory effect, compiler or physical input runs in these controls.
function fixture({failure, debt=false}={}) {
 const events=[]; let live=true,released=false,changed=false,exitDuringIdentity=false;
 const lease={artifact:{},validate(){assert.equal(released,false);events.push('validate');},matchOriginalClient(ax){assert.equal(ax.helperPid,21);},release(){released=true;events.push('release');}};
 const kernel={record:{browserPid:20,browserImageUuid:'a'.repeat(32),browserStartMachTicks:'100'}};
 const cold={record:{browserPid:20},cold:kernel};
 const startup={async presentation(){events.push('cold');return cold;},async stop(){events.push('browser stop');live=false;return {cleanupDebt:debt,nativeSlotRetained:debt};}};
 const scope={browserPid:20,coldKernel:kernel,assertLive(){assert.ok(live,'original Stock owner exited');},async readIdentity(){events.push('identity');if(exitDuringIdentity)live=false;return {source:'stock'};}};
 const ax={helperPid:21,targetPid:20,async request(op){events.push(op);assert.equal(op,'warmWindowIdentity');if(failure==='loaded')throw new Error('loaded mismatch');return {targetProcessUuid:failure==='kernel'?'b'.repeat(32):'a'.repeat(32),targetProcessStartMachTicks:'100'};},async close(){events.push('input close');return {reaped:true,helperPid:21};}};
 const dependencies={'node:assert/strict':{...assert,deepEqual(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}},'node:crypto':{randomBytes:()=>Buffer.alloc(16,1)},'node:path':{join:(...p)=>p.join('/')},'node:fs':{realpathSync:p=>p,mkdtempSync(){events.push('fixture');if(failure==='fixture')throw new Error('fixture refused');return '/tmp/aux-native-journey-test';},mkdirSync(){},lstatSync(p){return {dev:1,ino:changed?7:p.endsWith('profile')?3:2,mode:0o700,uid:123,isDirectory:()=>true,isSymbolicLink:()=>false};}},
 './dev-acceptance.mjs':{validateDisposableProfile(){}},'./startup-stock-helper-launch.mjs':{launchStockStartupHelper:async options=>{events.push('launch');assert.equal(options.manifestPath,'/controlled/manifest');assert.equal(options.trial,'01'.repeat(16));return startup;},readStockStartupOwner:()=>scope},
 './ax.mjs':{createAxClient:async(pid,options)=>{events.push('ax');assert.equal(pid,20);assert.equal(options.compilerArtifact,lease);return ax;}},'./native-window-compiler-artifact.mjs':{retainNativeWindowCompiler(){events.push('lease');if(failure==='lease')throw new Error('lease refused');return lease;}},'./native-warm-helper-identity.mjs':{decodeWarmWindowHelperIdentity:(_r,scope)=>{assert.equal(scope.targetPid,20);return {pid:21};}}};
 const exports={};const code=ts.transpileModule(readFileSync(new URL('./native-stock-warm-trial.mjs',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,process:{getuid:()=>123},Buffer,AbortSignal,structuredClone,Object,require:n=>{assert.ok(dependencies[n],n);return dependencies[n];}});
 return {open:exports.createStockWarmTrialFactory({manifestPath:'/controlled/manifest',manifestSha256:'d'.repeat(64),helper:{},compilerAudit:{},metadataWriter:{},browser:{},inputAdmission:{}}),events,debtCount:exports.stockWarmCleanupDebtCount,get released(){return released;},changeFixture(){changed=true;},exitDuringIdentity(){exitDuringIdentity=true;}};
}
const signal=()=>new AbortController().signal;
test('compiler refusal precedes every fixture or native effect',async()=>{const f=fixture({failure:'lease'});await assert.rejects(f.open(0,signal()),/lease refused/);assert.deepEqual(f.events,['lease']);assert.equal(f.debtCount(),0);});
test('fixture refusal releases original admitted lease without claiming a native reap',async()=>{const f=fixture({failure:'fixture'});await assert.rejects(f.open(0,signal()),/fixture refused/);assert.equal(f.released,true);assert.equal(f.debtCount(),0);assert.ok(!f.events.includes('launch'));});
test('Stock factory binds cold kernel before HID helper; no Aux RPC attachment is used',async()=>{const f=fixture(),owner=await f.open(0,signal());assert.ok(f.events.indexOf('cold')<f.events.indexOf('ax'));assert.equal(f.released,false);assert.equal(owner.app,undefined);await owner.ax.close();assert.equal(f.released,false);await owner.startup.stop();assert.equal(f.released,true);assert.equal(f.debtCount(),0);});
for(const failure of ['loaded','kernel'])test(`${failure} refusal retains primary and cleans original input before browser`,async()=>{const f=fixture({failure});await assert.rejects(f.open(0,signal()));assert.ok(f.events.indexOf('input close')<f.events.indexOf('browser stop'));assert.equal(f.released,true);assert.equal(f.debtCount(),0);});
test('unproved cleanup retains original lease and refuses next trial before any effect',async()=>{const f=fixture({failure:'loaded',debt:true});let primary;try{await f.open(0,signal());}catch(e){primary=e;}assert.ok(primary.warmCleanupOwner);assert.equal(primary.warmCleanupOwner.originalStartupFailure,undefined);assert.equal(f.released,false);assert.equal(f.debtCount(),1);const count=f.events.length;await assert.rejects(f.open(1,signal()),/Unretired/);assert.equal(f.events.length,count);});
test('owner exit during awaited original Stock identity refuses after await',async()=>{const f=fixture(),o=await f.open(0,signal());f.exitDuringIdentity();await assert.rejects(o.readIdentity(),/original Stock owner exited/);await o.ax.close();await o.startup.stop();});
test('replaced fixture inode refuses current identity before accepting another scope',async()=>{const f=fixture(),o=await f.open(0,signal());f.changeFixture();await assert.rejects(o.readIdentity());await o.ax.close();await o.startup.stop();});
