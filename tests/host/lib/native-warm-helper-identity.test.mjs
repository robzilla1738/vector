import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeWarmWindowHelperIdentity } from './native-warm-helper-identity.mjs';
// Synthetic fixed schema/refusal controls, never actual helper/compiler evidence.
function fixture() { return { record: { producer:'aux-native-warm-window-identity',version:1,targetPid:100,helperPid:101,
 targetProcessUuid:'a'.repeat(32),targetProcessStartMachTicks:'300',helperProcessUuid:'b'.repeat(32),helperProcessStartMachTicks:'200'},
 expected:{targetPid:100,helperPid:101,artifact:{imageUuid:'b'.repeat(32),binarySha256:'c'.repeat(64),sourceSha256:'d'.repeat(64)}} }; }
test('normalizes exact fixed read-only identities while keeping artifact admission separate',()=>{
 const f=fixture(),v=decodeWarmWindowHelperIdentity(f.record,f.expected);assert.equal(v.processStartMachTicks,'200');assert.ok(Object.isFrozen(v));
 assert.equal(v.compiledHelperProven,undefined);
});
for(const [name,mutate] of [
 ['different spawned helper',f=>{f.record.helperPid=102;}],['foreign bound target',f=>{f.record.targetPid=999;}],
 ['different loaded image',f=>{f.record.helperProcessUuid='e'.repeat(32);}],['kernel start missing',f=>{f.record.helperProcessStartMachTicks='0';}],
 ['caller-selected window',f=>{f.record.windowId=9;}],['self-attested compiler',f=>{f.expected.artifact.compiled=true;}],
 ['zero kernel UUID',f=>{f.record.targetProcessUuid='0'.repeat(32);}],['overflow kernel start',f=>{f.record.targetProcessStartMachTicks='18446744073709551616';}],
])test(`refuses ${name}`,()=>{const f=fixture();mutate(f);assert.throws(()=>decodeWarmWindowHelperIdentity(f.record,f.expected));});
