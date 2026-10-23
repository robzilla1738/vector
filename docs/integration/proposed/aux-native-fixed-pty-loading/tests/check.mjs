import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {fixedPtyLoader,adaptEmbeddedFixedPtyLoading} from '../transform.mjs';
let loads=0,stats=0,selected;
const expected='/Applications/Aux.app/Contents/Resources/aux/native-hosts/Aux Daemon.app/Contents/Resources/native/node-pty';
const context={path,process:{platform:'darwin',arch:'arm64',execPath:'/Applications/Aux.app/Contents/Resources/aux/native-hosts/Aux Daemon.app/Contents/MacOS/aux-daemon'},Error,
 statSync(p){stats++;assert.equal(p,expected+'/prebuilds/darwin-arm64/spawn-helper');return{mode:0o755}},
 createRequire(p){assert.equal(p,expected+'/package.json');return p=>{loads++;selected=p;return{spawn:'captured'}}}};
vm.createContext(context);vm.runInContext('var loadedNodePty;'+fixedPtyLoader,context);
assert.equal(vm.runInContext('loadNodePty().spawn',context),'captured');assert.equal(selected,expected);assert.equal(loads,1);
vm.runInContext('loadNodePty()',context);assert.equal(loads,1);assert.equal(stats,1);
vm.runInContext('loadedNodePty=undefined',context);context.statSync=()=>({mode:0o644});assert.throws(()=>vm.runInContext('loadNodePty()',context),/not executable/);assert.equal(loads,1);
context.process.arch='x64';assert.throws(()=>vm.runInContext('loadNodePty()',context),/unsupported/);assert.equal(loads,1);
context.process.arch='arm64';context.statSync=()=>({mode:0o755});context.createRequire=()=>{throw Error('captured load failure')};assert.throws(()=>vm.runInContext('loadNodePty()',context),/captured load failure/);assert.equal(loads,1);
assert(!fixedPtyLoader.includes('chmod'));assert(!fixedPtyLoader.includes('Cn.resolve'));
console.log('PASS: fixed package/cache, executable refusal, unsupported target and no fallback with captured effects; no native module loaded');

if(process.argv[2]){const original=readFileSync(process.argv[2],'utf8');assert.throws(()=>adaptEmbeddedFixedPtyLoading(original,original),/Explicit/);const result=adaptEmbeddedFixedPtyLoading(original,original,'embedded-daemon-arm64-v1');assert.equal(result.split(fixedPtyLoader).length,2);assert.throws(()=>adaptEmbeddedFixedPtyLoading(original,result,'embedded-daemon-arm64-v1'),/anchor count/);assert.throws(()=>adaptEmbeddedFixedPtyLoading(original+' ',original,'embedded-daemon-arm64-v1'),/pin mismatch/);console.log('PASS: actual original source pin, exact paired anchor, explicit successor mode and repeat/mutation refusal');}
