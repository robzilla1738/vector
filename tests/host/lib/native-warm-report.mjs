import assert from 'node:assert/strict';
function errorName(value) {
  for(let depth=0,current=value;current && depth<16;depth++,current=Object.getPrototypeOf(current)) {
    const name=Object.getOwnPropertyDescriptor(current,'name');
    if(name){assert.ok('value' in name && typeof name.value==='string','Error name accessor refused');return name.value;}
  }
  throw new Error('Error name prototype bound exceeded');
}
const originalStackGetter = Object.getOwnPropertyDescriptor(new Error(), 'stack')?.get;
/** Encode a report as a bounded object graph, preserving every original Error
 * and receipt reference. Never invoke cleanup functions, infer reap, truncate
 * stack/native bytes, or replace missing evidence with successful cleanup. */
export function encodeWarmCohortReport(report) {
  const seen=new Map(),nodes=[];let totalBytes=0;
  const string=value=>{totalBytes+=Buffer.byteLength(value);assert.ok(totalBytes<=32*1024*1024,'Warm report byte bound exceeded');return value;};
  const visit=value=>{
    if(value===null || typeof value==='boolean')return value;
    if(typeof value==='string')return string(value);
    if(typeof value==='number'){assert.ok(Number.isFinite(value),'Nonfinite report number');return value;}
    if(typeof value==='bigint')return {kind:'bigint',value:string(value.toString())};
    if(value===undefined)return {kind:'undefined'};
    if(typeof value==='function')return {kind:'unserialized-capability'};
    assert.equal(typeof value,'object','Unsupported report value');
    const prototype=Object.getPrototypeOf(value);
    assert.ok(value instanceof Error || Array.isArray(value) || prototype===Object.prototype || prototype===null,
      'Unsupported internal-slot report object');
    if(seen.has(value))return {reference:seen.get(value)};
    assert.ok(nodes.length<10000,'Warm report object bound exceeded');
    const id=nodes.length+1;seen.set(value,id);
    const node={id,kind:value instanceof Error?'error':Array.isArray(value)?'array':'object',properties:[]};nodes.push(node);
    if(value instanceof Error){
      const message=Object.getOwnPropertyDescriptor(value,'message');
      assert.ok(!message || ('value' in message && typeof message.value==='string'),'Error message accessor refused');
      node.name=string(errorName(value));node.message=string(message?.value ?? '');
    }
    for(const key of Reflect.ownKeys(value)) {
      assert.equal(typeof key,'string','Symbol report property cannot be silently dropped');
      const descriptor=Object.getOwnPropertyDescriptor(value,key);
      let original;
      if('value' in descriptor)original=descriptor.value;
      else if(value instanceof Error && key==='stack' && descriptor.get===originalStackGetter)original=value.stack;
      else throw new Error(`Accessor report property refused: ${key}`);
      node.properties.push({key:string(key),enumerable:descriptor.enumerable,value:visit(original)});
    }
    return {reference:id};
  };
  assert.ok(report && typeof report==='object');
  const root=visit(report);
  return {schema:1,producer:'aux-warm-counted-report',root,nodes,
    originalReferencesPreserved:true,cleanupCapabilitiesSerialized:false,
    inferredCleanup:false,performanceQualified:false};
}
export function serializeWarmCohortReport(report) {
  return JSON.stringify(encodeWarmCohortReport(report))+'\n';
}
