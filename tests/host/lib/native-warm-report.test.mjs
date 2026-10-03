import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeWarmCohortReport,serializeWarmCohortReport } from './native-warm-report.mjs';
const property=(node,key)=>node.properties.find(p=>p.key===key)?.value;
test('cyclic original primary/cause/cleanup references preserve full original stack and failed receipts',()=>{
 const original=new Error('original native failure'),cleanup=new Error('original reap failure',{cause:original});
 original.cleanup={primary:original,cleanup,cleanupDebt:true,nativeSlotRetained:true,reaped:undefined};
 const report={status:'failed',primary:original,attempts:[{primary:original,browserCleanup:original.cleanup}],rawNative:'AUX_ORIGINAL_NATIVE {"status":"refused"}\n'};
 const result=JSON.parse(serializeWarmCohortReport(report)),root=result.nodes[0],primary=result.nodes[property(root,'primary').reference-1];
 assert.equal(primary.message,original.message);assert.equal(property(primary,'stack'),original.stack);
 const receipt=result.nodes[property(primary,'cleanup').reference-1];assert.deepEqual(property(receipt,'primary'),{reference:primary.id});
 assert.equal(property(receipt,'cleanupDebt'),true);assert.equal(property(receipt,'nativeSlotRetained'),true);assert.deepEqual(property(receipt,'reaped'),{kind:'undefined'});
 assert.equal(property(root,'rawNative'),report.rawNative);assert.equal(result.inferredCleanup,false);assert.equal(result.performanceQualified,false);
});
test('cleanup capabilities never execute or turn unknown cleanup into success',()=>{let invoked=0;const result=encodeWarmCohortReport({status:'failed',cleanup:{close(){invoked++;},stop(){invoked++;},cleanupDebt:undefined}});assert.equal(invoked,0);const cleanup=result.nodes[1];assert.deepEqual(property(cleanup,'close'),{kind:'unserialized-capability'});assert.deepEqual(property(cleanup,'cleanupDebt'),{kind:'undefined'});});
test('original bigint, nonenumerable and repeated error evidence remain exact',()=>{const error=new Error('failure');Object.defineProperty(error,'originalWaitStatus',{value:15,enumerable:false});const result=encodeWarmCohortReport({error,again:error,elapsedUs:12345678901234567890n});assert.deepEqual(property(result.nodes[0],'error'),property(result.nodes[0],'again'));assert.equal(property(result.nodes[1],'originalWaitStatus'),15);assert.deepEqual(property(result.nodes[0],'elapsedUs'),{kind:'bigint',value:'12345678901234567890'});});
test('accessor/symbol/nonfinite data refuses instead of losing original evidence or invoking getters',()=>{let invoked=0;const accessor={get cleanup(){invoked++;return true;}};assert.throws(()=>encodeWarmCohortReport(accessor),/Accessor/);assert.equal(invoked,0);assert.throws(()=>encodeWarmCohortReport({[Symbol('original')]:1}),/Symbol/);assert.throws(()=>encodeWarmCohortReport({elapsedUs:Infinity}),/Nonfinite/);});

test('actual native Error subtype name and unmodified stack remain preserved',()=>{const original=new TypeError('original type mismatch'),result=encodeWarmCohortReport({original});assert.equal(result.nodes[1].name,'TypeError');assert.equal(property(result.nodes[1],'stack'),original.stack);});

test('Map/Date/typed byte containers refuse instead of silently losing internal-slot evidence',()=>{for(const value of [new Map([['original','receipt']]),new Date(123),Buffer.from('original bytes'),new Uint8Array([1,2,3])])assert.throws(()=>encodeWarmCohortReport({value}),/internal-slot/);});
test('null-prototype original receipt remains supported with exact unknown cleanup fields',()=>{const receipt=Object.assign(Object.create(null),{cleanupDebt:undefined,rawIntervalUs:'12345678901234567890'});const result=encodeWarmCohortReport({receipt});assert.deepEqual(property(result.nodes[1],'cleanupDebt'),{kind:'undefined'});assert.equal(property(result.nodes[1],'rawIntervalUs'),receipt.rawIntervalUs);});
