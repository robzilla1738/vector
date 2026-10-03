import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { originalInputHelperClose } from './native-input-helper-close.mjs';
// Actual adapter with controlled original child; compilation/spawn are never
// real. Admission failures must be before spawn and retire any acquired slot.
async function fixture(failAt=0, {spawnThrows=false,noPid=false}={}) {
 let validations=0,slots=0,releases=0,spawned=0;
 const compilerArtifact={},child=new EventEmitter(),lines=new EventEmitter();
 child.pid=noPid?undefined:123;child.stdout={};child.stderr=new EventEmitter();child.stdin={write(){},end(){}};child.kill=()=>{};lines.close=()=>{};
 const imports={
 './native-input-helper-close.mjs':{originalInputHelperClose},
 './native-window-compiler-artifact.mjs':{readNativeWindowCompilerExecutable(lease,source){assert.equal(lease,compilerArtifact);assert.equal(source,'/controlled/../native-window.swift');if(++validations===failAt)throw new Error('original lease changed');return '/controlled/original-executable';}},
 'node:child_process':{spawn(executable,args){if(spawnThrows)throw new Error('original synchronous spawn failure');assert.equal(executable,'/controlled/original-executable');assert.deepEqual(Array.from(args),['serve','456']);spawned++;return child;},execFileSync(){throw new Error('Compilation forbidden');}},
 'node:crypto':{createHash(){throw new Error('Cache fallback forbidden');}},
 'node:fs':{existsSync(){throw new Error('Cache fallback forbidden');}},
 'node:os':{homedir:()=>'/controlled'},'node:path':{join:(...p)=>p.join('/'),resolve:(...p)=>p.join('/')},
 'node:readline':{createInterface:()=>lines},'../../../scripts/native-slot.mjs':{async acquireNativeSlot(){slots++;return {token:'owned',release(){releases++;}};}}};
 const exports={};const code=ts.transpileModule(readFileSync(new URL('./ax.mjs',import.meta.url),'utf8').replaceAll('import.meta.dirname',"'/controlled'"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,process:{env:{}},Buffer,setTimeout,clearTimeout,require(name){assert.ok(imports[name],name);return imports[name];}});
 return {open:()=>exports.createAxClient(456,{compilerArtifact}),child,counts:()=>({validations,slots,releases,spawned})};
}
test('branded original executable is checked before slot and immediately before spawn without cache compile',async()=>{const f=await fixture(),ax=await f.open();assert.deepEqual(f.counts(),{validations:2,slots:1,releases:0,spawned:1});const closing=ax.close();f.child.emit('close',0,null);await closing;assert.equal(f.counts().releases,1);});
test('invalid original admission refuses before slot or spawn',async()=>{const f=await fixture(1);await assert.rejects(f.open(),/lease changed/);assert.deepEqual(f.counts(),{validations:1,slots:0,releases:0,spawned:0});});
test('lease replacement while acquiring slot refuses and releases that original slot before spawn',async()=>{const f=await fixture(2);await assert.rejects(f.open(),/lease changed/);assert.deepEqual(f.counts(),{validations:2,slots:1,releases:1,spawned:0});});

test('synchronous original spawn failure releases acquired slot once without compile fallback',async()=>{const f=await fixture(0,{spawnThrows:true});await assert.rejects(f.open(),/original synchronous spawn failure/);assert.deepEqual(f.counts(),{validations:2,slots:1,releases:1,spawned:0});});
test('asynchronous failed spawn without original PID resolves honest close debt and preserves original error',async()=>{const f=await fixture(0,{noPid:true}),ax=await f.open(),original=new Error('original async ENOENT');f.child.emit('error',original);const closing=ax.close();f.child.emit('close',-2,null);const receipt=await closing;assert.equal(receipt.helperPid,null);assert.equal(receipt.reaped,false);assert.equal(receipt.clean,false);assert.equal(receipt.primary,original);assert.equal(receipt.code,-2);assert.equal(f.counts().releases,1);});
