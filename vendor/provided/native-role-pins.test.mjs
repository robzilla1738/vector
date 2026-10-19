import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const {bindings,verifyNativeRole}=createRequire(import.meta.url)('./native-role-pins.cjs');
test('each immutable original addon is confined to its fixed canonical role; swaps/unknown paths do not widen pins',()=>{
 for(const [role,pin] of Object.entries(bindings)){
  const directory='/private/disposable/Resources/aux'+pin.suffix;
  assert.equal(verifyNativeRole(directory,pin.sha256),role);
  const other=bindings[role==='cli'?'daemon':'cli'];
  assert.throws(()=>verifyNativeRole(directory,other.sha256),/role\/hash/);
  assert.throws(()=>verifyNativeRole('/private/elsewhere/native',pin.sha256),/role\/hash/);
  assert.throws(()=>verifyNativeRole('/private/../disposable/Resources/aux'+pin.suffix,pin.sha256),/Canonical/);
 }
 assert.ok(Object.isFrozen(bindings)&&Object.isFrozen(bindings.cli));
});
test('available actual static original role files match distinct pins without loading either addon',()=>{
 const root='/Users/rcourson/Documents/Vibe/web/out/provided-resources';
 if(!fs.existsSync(root))return;
 for(const pin of Object.values(bindings))assert.equal(createHash('sha256').update(fs.readFileSync(root+pin.suffix+'/provided-native.node')).digest('hex'),pin.sha256);
 assert.notEqual(bindings.cli.sha256,bindings.daemon.sha256);
});
