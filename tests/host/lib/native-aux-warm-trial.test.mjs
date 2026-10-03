import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
// Execute the actual factory with controlled original-owner dependencies only;
// no native process, helper, compiler, app constructor or timing trial executes.
function fixture({failure, debt=false}={}) {
 const events=[];let live=true,released=false,exitDuringIdentity=false;
 const lease={artifact:{},validate(){events.push('validate');assert.equal(released,false);},matchOriginalClient(){assert.equal(released,false);},release(){released=true;events.push('release');}};
 const app={profileRoot:'/controlled/root',pid:20,async attachStartup(owner){assert.equal(owner,startup);events.push('attach');if(failure==='attach')throw new Error('attach refused');},async identity(){if(exitDuringIdentity)live=false;return {runtime:'identity'};}};
 const startup={async presentation(){events.push('cold');return {record:{browserPid:20}};},async stop(){events.push('browser stop');live=false;return {cleanupDebt:debt,nativeSlotRetained:debt};}};
 const ax={helperPid:21,targetPid:20,helperSource:'/controlled/source',helperExecutable:'/controlled/executable',async request(op){events.push(op);assert.equal(op,'warmWindowIdentity');if(failure==='loaded')throw new Error('loaded mismatch');return {};},async close(){events.push('input close');return {reaped:true,helperPid:21};}};
 const dependencies={'node:assert/strict':{...assert,deepEqual(a,b,message){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),message);}},'node:crypto':{randomBytes:()=>Buffer.alloc(16,1)},'node:fs':{realpathSync:p=>p},
 './app.mjs':{createJourneyApp(){events.push('app');if(failure==='app')throw new Error('app refused');return app;}},
 './startup-helper-launch.mjs':{launchAuxStartupHelper:async options=>{events.push('launch');if(failure==='launch'){const error=new Error('original launch cleanup debt');error.cleanup={cleanupDebt:true};error.nativeSlotRetained=true;throw error;}assert.equal(options.fixtureRoot,app.profileRoot);assert.equal(options.trial,'01'.repeat(16));return startup;},readAuxStartupAttachment:()=>({assertLive(){assert.ok(live,'original owner exited');}})},
 './ax.mjs':{createAxClient:async(pid,options)=>{events.push('ax');assert.equal(pid,20);assert.equal(options.compilerArtifact,lease);return ax;}},
 './native-window-compiler-artifact.mjs':{retainNativeWindowCompiler(){events.push('lease');if(failure==='lease')throw new Error('lease refused');return lease;}},
 './native-warm-helper-identity.mjs':{decodeWarmWindowHelperIdentity:(_record,scope)=>{assert.equal(scope.targetPid,20);assert.equal(scope.helperPid,21);return {pid:21};}}};
 const exports={};const code=ts.transpileModule(readFileSync(new URL('./native-aux-warm-trial.mjs',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,Buffer,AbortSignal,structuredClone,Object,require(name){assert.ok(dependencies[name],name);return dependencies[name];}});
 const open=exports.createAuxWarmTrialFactory({bundle:'/controlled/Aux.app',helper:{},compilerAudit:{},metadataWriter:{},browser:{},inputAdmission:{}});
 return {open,events,debtCount:exports.auxWarmCleanupDebtCount,get released(){return released;},exitDuringIdentity(){exitDuringIdentity=true;}};
}
const signal=()=>new AbortController().signal;
test('compiler refusal precedes all app/helper effects',async()=>{const f=fixture({failure:'lease'});await assert.rejects(f.open(0,signal()),/lease refused/);assert.deepEqual(f.events,['lease']);assert.equal(f.debtCount(),0);});
test('prelaunch app failure releases original lease without native cleanup claims',async()=>{const f=fixture({failure:'app'});await assert.rejects(f.open(0,signal()),/app refused/);assert.equal(f.released,true);assert.equal(f.debtCount(),0);assert.ok(!f.events.includes('launch'));});
test('factory binds original startup before loaded helper and releases only after both reaps',async()=>{const f=fixture(),owner=await f.open(0,signal());assert.ok(f.events.indexOf('cold')<f.events.indexOf('attach'));assert.ok(f.events.indexOf('attach')<f.events.indexOf('ax'));assert.equal(f.released,false);await owner.ax.close();assert.equal(f.released,false);await owner.startup.stop();assert.equal(f.released,true);assert.equal(f.debtCount(),0);});
test('loaded image mismatch retains primary and performs original input then browser cleanup',async()=>{const f=fixture({failure:'loaded'});await assert.rejects(f.open(0,signal()),/loaded mismatch/);assert.ok(f.events.indexOf('input close')<f.events.indexOf('browser stop'));assert.equal(f.released,true);assert.equal(f.debtCount(),0);});
test('cleanup debt retains lease/owner and refuses another trial before any new effect',async()=>{const f=fixture({failure:'loaded',debt:true});let primary;try{await f.open(0,signal());}catch(error){primary=error;}assert.ok(primary.warmCleanupOwner);assert.equal(f.released,false);assert.equal(f.debtCount(),1);const count=f.events.length;await assert.rejects(f.open(1,signal()),/Unretired/);assert.equal(f.events.length,count);});
test('original owner exit during awaited identity refuses after await',async()=>{const f=fixture(),owner=await f.open(0,signal());f.exitDuringIdentity();await assert.rejects(owner.readIdentity(),/original owner exited/);await owner.ax.close();await owner.startup.stop();assert.equal(f.released,true);});

test('ownerless launch failure retains private debt without a public original-error self-cycle',async()=>{const f=fixture({failure:'launch'});let primary;try{await f.open(0,signal());}catch(error){primary=error;}assert.match(primary.message,/original launch cleanup debt/);assert.equal(f.debtCount(),1);assert.equal(f.released,false);assert.ok(primary.warmCleanupOwner);assert.equal(primary.warmCleanupOwner.stopBrowser,undefined);assert.doesNotThrow(()=>JSON.stringify(primary));});
