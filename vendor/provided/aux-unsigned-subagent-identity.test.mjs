import test from 'node:test';import assert from 'node:assert/strict';import{createHash}from'node:crypto';import{readFileSync}from'node:fs';import vm from'node:vm';
import{prepareUnsignedSubagentIdentity}from'./aux-unsigned-subagent-identity.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const capability={id:'unsigned-fixture-scope',disposable:true,exclusive:true,assertStopped:async()=>true};
const block={type:'toolCall',id:'keep-id',name:'subagent',arguments:{action:'spawn',description:'Synthetic task',prompt:'aside provider stays in prompt',model:{provider:'aside',modelId:'unchanged-id'},run_in_background:true}};
const message={role:'assistant',provider:'aux',api:'aux-provider',model:'keep-parent',timestamp:1,content:[{type:'text',text:'aside prose',textSignature:'untouched-text-signature'},block],stopReason:'toolUse'};
const bytesOf=value=>Buffer.from(JSON.stringify(value)+'\n');
const prepare=bytes=>prepareUnsignedSubagentIdentity({bytes,expectedSha256:sha(bytes),capability});
test('only exact unsigned spawn token changes with escaped/trimmed values and fixed offsets',async()=>{
 const source=JSON.stringify(message).replace('"provider":"aside"','"provider":"  \\u0061side "');const bytes=Buffer.from(source+'\r\n'+JSON.stringify({role:'toolResult',toolCallId:'keep-id',content:[{type:'text',text:'aside'}],details:{model:{provider:'aside'}}})+'\n');
 const original=Buffer.from(bytes),result=await prepare(bytes);assert.deepEqual(bytes,original);assert.equal(result.bytes.toString(),bytes.toString().replace('"provider":"  \\u0061side "','"provider":"aux"          '));assert.equal(result.bytes.length,bytes.length);assert.equal(result.receipt.changedCalls,1);
 const parsed=JSON.parse(result.bytes.toString().split('\n')[0]);assert.deepEqual(parsed,{...message,content:[message.content[0],{...block,arguments:{...block.arguments,model:{provider:'aux',modelId:'unchanged-id'}}}]});assert.deepEqual((await prepare(result.bytes)).bytes,result.bytes);
});
test('signed, unknown, conflicting, duplicated or incomplete matching cohorts refuse rather than partially prepare',async()=>{
 for(const changed of [{...block,thoughtSignature:'YWJj'}, {...block,signature:'unknown'}, {...block,arguments:{...block.arguments,model_category:'inherit'}},{...block,arguments:{...block.arguments,action:'resume'}},{...block,arguments:{...block.arguments,prompt:''}},{...block,arguments:{...block.arguments,model:{...block.arguments.model,thinkingLevel:'high'}}},{...block,arguments:{...block.arguments,new_unknown:true}}]){
  const bytes=bytesOf({...message,content:[block,changed]}),copy=Buffer.from(bytes);await assert.rejects(prepare(bytes));assert.deepEqual(bytes,copy);
 }
 await assert.rejects(prepare(Buffer.from(JSON.stringify(message).replace('"provider":"aside"','"provider":"aside","provider":"aux"')+'\n')),/Duplicate/);
 await assert.rejects(prepare(Buffer.from(JSON.stringify(message))),/tail/);
 const bytes=bytesOf(message);let calls=0;await assert.rejects(prepareUnsignedSubagentIdentity({bytes,expectedSha256:sha(bytes),capability:{...capability,assertStopped:async()=>++calls===1}}),/capability/);
});
test('same strings in user messages, other tools and tool results remain byte-identical',async()=>{
 const records=[{role:'user',content:[block],timestamp:1},{...message,content:[{...block,name:'other_tool',thoughtSignature:'signature'}]},{role:'toolResult',content:'aside',details:{model:{provider:'aside'}},timestamp:2}];const bytes=Buffer.from(records.map(JSON.stringify).join('\n')+'\n');assert.deepEqual((await prepare(bytes)).bytes,bytes);
});
const pinned=process.env.AUX_PINNED_DAEMON_SOURCE;
test('actual pinned exact resolver consumes migrated provider/modelId without changing selection semantics',{skip:!pinned},async()=>{
 const source=readFileSync(pinned,'utf8'),audit=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-subagent-override-identity/source-audit.json',import.meta.url)));assert.equal(sha(Buffer.from(source)),audit.daemonSourceSha256);for(const anchor of audit.anchors)assert.equal(source.split(anchor.find).length-1,anchor.count,anchor.name);
 const functionText=audit.anchors.find(anchor=>anchor.name==='model-exact-resolution').find;const resolved=[];
 const resolver=vm.runInNewContext(functionText+';resolveExplicitSubagentModel',{models:()=>({resolve:async(modelId,provider)=>{resolved.push({modelId,provider});return{model:{}}}}),toModelInfo:()=>({availableThinkingLevels:['medium'],supportsFastMode:true}),clampThinkingLevel:level=>level,assertExactModelResolution:()=>{}},{timeout:1000});
 const result=await prepare(bytesOf(message)),selection=JSON.parse(result.bytes.toString()).content[1].arguments.model;
 assert.deepEqual(JSON.parse(JSON.stringify(await resolver(1,selection,true))),{provider:'aux',modelId:'unchanged-id',thinkingLevel:'medium',fastMode:true});assert.deepEqual(resolved,[{provider:'aux',modelId:'unchanged-id'}]);
});
