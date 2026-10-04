import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
// Execute actual source caller with controlled original-owner dependencies.
// No native helper, child, filesystem admission or performance trial executes.
function fixture({failure, debt=false}={}) {
  const events=[],signal=new AbortController(),originalFailure=new Error('original attach refused');let trial=0,releases=0,admitted;
  const identity={runtime:{commit:'a'.repeat(40)},native:{sourceCommit:'a'.repeat(40),buildId:'build',manifestHash:'b'.repeat(64)}};
  const pair={bundle:'/controlled/Aux.app',productIdentity:identity.runtime,native:identity.native,image:{imageUuid:'c'.repeat(32)},shellDigest:'d'.repeat(64),artifact:{manifest:{sha256:'e'.repeat(64)}},
    validate(){events.push('pair validate');assert.equal(releases,0);},release(){events.push('pair release');releases++;}};
  const lease=(name,extra)=>({...extra,validate(){events.push(name+' validate');assert.equal(releases,0);},release(){events.push(name+' release');}});
  const browser=lease('browser',{identity:{sha256:'f'.repeat(64),imageUuid:'c'.repeat(32),device:'1',inode:'2'}});
  const helper=lease('helper',{identity:{},compile:{originalManifestSha256:'1'.repeat(64)}});
  const app={profileRoot:'/controlled/root',get pid(){return 200+trial;},async attachStartup(owner){events.push('attach');assert.equal(owner,current);if(failure==='attach')throw originalFailure;},async identity(){events.push('live identity');return {...structuredClone(identity),native:{...identity.native,extraNativeField:'kept'}};}};
  let current;
  const dependencies={
    'node:assert/strict':{...assert,deepEqual(a,b,message){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),message);}},
    'node:crypto':{randomBytes:()=>Buffer.alloc(16,trial)},'node:child_process':{execFileSync(){throw new Error('unexpected real power call');}},'node:fs':{realpathSync:p=>p},
    './app.mjs':{createJourneyApp(options){events.push('app');assert.equal(options.appPath,pair.bundle);return app;}},
    './packaged-runtime-pair-artifact.mjs':{retainPackagedRuntimePair(){events.push('pair admission');return pair;},readPackagedRuntimePairBytes(p){assert.equal(p,pair);return pair;}},
    './startup-helper-artifact.mjs':{retainStartupHelperArtifact(){events.push('helper admission');return helper;}},
    './startup-browser-artifact.mjs':{retainStartupBrowserArtifact(bundle){events.push('browser admission');assert.equal(bundle,pair.bundle);return browser;}},
    './startup-helper-launch.mjs':{async launchAuxStartupHelper(options){events.push('launch');trial++;
      assert.equal(options.bundle,pair.bundle);assert.equal(options.fixtureRoot,app.profileRoot);assert.equal(options.signal,signal.signal);
      if(failure==='launch'){const error=new Error('original launch failed');error.cleanup={cleanupDebt:true,nativeSlotRetained:true};throw error;}
      current={async presentation(){events.push('hardware');if(failure==='abort')signal.abort(new Error('original abort'));
        return {raw:'original hardware '+trial,cold:{raw:'original kernel '+trial},originalLaunch:{raw:'original launch '+trial,record:{trial:String(trial),launcherPid:100,browserPid:200+trial}}};},
        async stop(){events.push('stop');return {cleanupDebt:debt,nativeSlotRetained:debt};}};return current;},
      readAuxStartupAttachment(owner){assert.equal(owner,current);return {assertLive(){events.push('owner live');}};}},
    './native-cold-startup-admission.mjs':{verifyColdStartupCohort(attempts,pins){events.push('cohort admit');admitted=attempts;
      assert.equal(attempts.length,20);assert.equal(pins.browser,browser.identity);return {count:attempts.length,nativeQualificationProven:false};}},
  };
  const exports={},code=ts.transpileModule(readFileSync(new URL('./native-aux-cold-caller.mjs',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{exports,Buffer,AbortSignal,structuredClone,Object,require(name){assert.ok(dependencies[name],name);return dependencies[name];}});
  let reads=0;
  const configuration={pairAdmission:{},helper:{sha256:'2'.repeat(64),sourceSha256:'3'.repeat(64),imageUuid:'4'.repeat(32)},compilerAudit:{},metadataWriter:{},browser:{sha256:'f'.repeat(64),imageUuid:'c'.repeat(32)},signal:signal.signal,
    async readPower(){reads++;events.push('AC '+reads);return failure==='prepower'||(failure==='postpower'&&reads===2)?"Now drawing from 'Battery Power'":"Now drawing from 'AC Power'";}};
  return {collect:()=>exports.collectAuxColdStartup(configuration),events,signal,originalFailure,debtCount:exports.auxColdCleanupDebtCount,
    setDebt(value){debt=value;},get admitted(){return admitted;},get releases(){return releases;}};
}
test('original artifact+AC admission precedes all twenty launches and actual runtime identity follows hardware',async()=>{
  const f=fixture(),report=await f.collect();assert.equal(report.attempts.length,20);assert.equal(report.status,'observed');
  assert.ok(f.events.indexOf('pair admission')<f.events.indexOf('AC 1'));assert.ok(f.events.indexOf('AC 1')<f.events.indexOf('launch'));
  assert.ok(f.events.indexOf('hardware')<f.events.indexOf('live identity'));assert.ok(f.events.indexOf('AC 2')<f.events.indexOf('stop'));
  assert.equal(f.events.filter(e=>e==='launch').length,20);assert.equal(f.events.filter(e=>e==='stop').length,20);
  assert.equal(report.attempts[0].identityBeforeKind,'retained-packaged-artifacts');assert.equal(report.attempts[0].identityAfterKind,'original-live-runtime');
  assert.equal(report.attempts[0].identityAfter.native.extraNativeField,'kept');assert.equal(report.attempts[0].originalCold.presentationRaw,'original hardware 1');
  assert.equal(report.attempts,f.admitted);assert.equal(report.nativeQualificationProven,false);assert.equal(f.releases,1);assert.equal(f.debtCount(),0);
});
test('battery before original launch refuses with retained attempt and no child effects',async()=>{
  const f=fixture({failure:'prepower'});await assert.rejects(f.collect(),error=>{assert.equal(error.report.attempts[0].status,'failed');return true;});
  assert.ok(!f.events.includes('launch'));assert.equal(f.releases,1);assert.equal(f.debtCount(),0);
});
test('post-presentation AC refusal stops exact original owner and preserves original failure',async()=>{
  const f=fixture({failure:'postpower'});await assert.rejects(f.collect(),error=>{assert.match(error.cause.message,/AC/);assert.equal(error.report.attempts[0].browserCleanup.cleanupDebt,false);return true;});
  assert.equal(f.events.filter(e=>e==='stop').length,1);assert.equal(f.releases,1);
});
test('abort after original hardware still stops owned child and never attaches a replacement',async()=>{
  const f=fixture({failure:'abort'});await assert.rejects(f.collect(),error=>{assert.equal(error.cause,f.signal.signal.reason);return true;});
  assert.ok(!f.events.includes('attach'));assert.equal(f.events.filter(e=>e==='stop').length,1);assert.equal(f.releases,1);
});
test('original cleanup debt retains pair/helper/browser leases and refuses new effects until exact retry reaps',async()=>{
  const f=fixture({failure:'attach',debt:true});let original;
  await assert.rejects(f.collect(),error=>{original=error;assert.equal(error.cause.errors[0],f.originalFailure);assert.equal(error.report.attempts[0].primary,f.originalFailure);return true;});
  assert.equal(f.releases,0);assert.equal(f.debtCount(),1);const count=f.events.length;
  await assert.rejects(f.collect(),/cleanup debt/);assert.equal(f.events.length,count);
  f.setDebt(false);assert.equal((await original.coldCleanupOwner.retryCleanup()).cleanupDebt,false);
  assert.equal(f.releases,1);assert.equal(f.debtCount(),0);assert.equal(original.report.status,'failed');
});
test('launch failure without a returned owner retains unknown original debt, never rediscovers a PID',async()=>{
  const f=fixture({failure:'launch'});let original;await assert.rejects(f.collect(),error=>{original=error;return true;});
  assert.equal(f.releases,0);assert.equal(f.debtCount(),1);
  await assert.rejects(original.coldCleanupOwner.retryCleanup(),/No original startup owner/);
  assert.equal(f.debtCount(),1);assert.ok(!f.events.includes('stop'));
});
