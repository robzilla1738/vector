import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
const source=new URL('./lib/startup-helper-channel.mjs',import.meta.url);
// Actual channel adapter with controlled original child streams. Not a browser
// launch, process audit, receipt admission or kernel-generation measurement.
function fixture(){
 const child=new EventEmitter();child.pid=20;child.exitCode=null;child.signalCode=null;
 child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>true;
 const expected={launcherPid:20,trial:'controlled',browser:{device:'1',inode:'1',imageUuid:'a'.repeat(32),sha256:'b'.repeat(64)}};
 const imports={'node:crypto':crypto,'./startup-launch-receipt.mjs':{parseStartupLaunchReceipt:()=>({record:{trial:'controlled',launcherPid:20,browserPid:21}})},
  './startup-cold-receipt.mjs':{startupColdPrefix:'AUX_STARTUP_COLD_V1 ',startupRefusalPrefix:'AUX_STARTUP_REFUSAL_V1 ',parseStartupColdReceipt:()=>({record:{}})}};
 const exports={},script=ts.transpileModule(readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(script,{exports,Buffer,Promise,setTimeout,clearTimeout,require(name){assert.ok(imports[name],name);return imports[name];}});
 const channel=exports.ownStartupHelperChannel(child,expected);
 return{child,channel};
}
test('original child exitCode gap refuses before close promise delivery',()=>{
 const f=fixture();assert.equal(f.channel.active,true);f.child.exitCode=0;assert.equal(f.channel.active,false);
 f.child.emit('close',0,null);
});
test('original child signal gap refuses before close promise delivery',()=>{
 const f=fixture();f.child.signalCode='SIGTERM';assert.equal(f.channel.active,false);f.child.emit('close',null,'SIGTERM');
});
test('original parser failure retires observation while actual child still exists',()=>{
 const f=fixture();f.child.stdout.emit('data',Buffer.from('wrong-prefix\n'));
 // The controlled parser accepts this first line; the next malformed exit
 // causes the actual channel parser to fail and retire the original scope.
 f.child.stdout.emit('data',Buffer.from('malformed-exit\n'));
 assert.equal(f.channel.active,false);f.child.emit('close',0,null);
});
test('original browser exit receipt retires attachment before parent helper close',()=>{
 const f=fixture();f.child.stdout.emit('data',Buffer.from('controlled-launch\nAUX_STARTUP_COLD_V1 controlled\n'));
 const record={browserPid:21,cleanupRequested:false,launcherPid:20,producer:'aux-native-startup-exit',trial:'controlled',version:1,waitStatus:0};
 f.child.stdout.emit('data',Buffer.from('AUX_STARTUP_LAUNCH_V1 '+JSON.stringify(record)+'\n'));
 assert.equal(f.channel.active,false);f.child.emit('close',0,null);
});
test('stop retires original attachment immediately and retains cleanup debt without launch',async()=>{
 const f=fixture(),stopped=f.channel.stop();assert.equal(f.channel.active,false);
 f.child.emit('close',0,null);const result=await stopped;assert.equal(result.cleanupDebt,true);
});
