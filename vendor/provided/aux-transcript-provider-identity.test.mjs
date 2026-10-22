import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {prepareAuxTranscriptProviderIdentity,AUX_TRANSCRIPT_SOURCE_SHA256} from './aux-transcript-provider-identity.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const capability={id:'synthetic-transcript-only',disposable:true,exclusive:true,assertStopped:async()=>true};
const prepare=bytes=>prepareAuxTranscriptProviderIdentity({bytes,expectedSha256:sha(bytes),capability});
const assistant={role:'assistant',provider:'aside',api:'aside-provider',model:'same-model',timestamp:1,content:[{type:'thinking',thinking:'signed',thinkingSignature:'signature'},{type:'text',text:'é — aside',textSignature:'text-signature'},{type:'toolCall',id:'call|fc_id',name:'example',arguments:{model:{provider:'aside',modelId:'keep'}},thoughtSignature:'tool-signature'}],stopReason:'toolUse'};
test('only direct assistant tokens change; byte IDs, line sizes and all other byte ranges remain exact',async()=>{
 const user=JSON.stringify({role:'user',timestamp:2,content:'aside provider aside-images <aside> Aux'});
 const bytes=Buffer.from(`${user}\r\n${JSON.stringify(assistant)}\n${JSON.stringify({role:'steering',content:{provider:'aside'},timestamp:3})}\n`);
 const original=Buffer.from(bytes),result=await prepare(bytes),before=bytes.toString(),after=result.bytes.toString();
 assert.deepEqual(bytes,original);assert.equal(result.bytes.length,bytes.length);assert.equal(after.split('\n')[0],before.split('\n')[0]);assert.equal(after.split('\n')[2],before.split('\n')[2]);
 const expected=before.replace('"provider":"aside"','"provider":"aux"  ').replace('"api":"aside-provider"','"api":"aux-provider"  ');
 assert.equal(after,expected);assert.deepEqual(JSON.parse(after.split('\n')[1]),{...assistant,provider:'aux',api:'aux-provider'});
 assert.equal(result.receipt.changedMessages,1);assert.equal(result.receipt.byteOffsetsPreserved,true);
});
test('escaped metadata values use outside-token padding; idempotent and custom provider bytes untouched',async()=>{
 const escaped=JSON.stringify(assistant).replace('"aside"','"\\u0061side"').replace('"aside-provider"','"\\u0061side-provider"');
 const result=await prepare(Buffer.from(escaped+'\n'));assert.equal(result.bytes.length,Buffer.byteLength(escaped+'\n'));
 assert.equal(JSON.parse(result.bytes.toString()).provider,'aux');assert.match(result.bytes.toString(),/"provider":"aux" {7},/);
 assert.deepEqual((await prepare(result.bytes)).bytes,result.bytes);
 const custom=Buffer.from(JSON.stringify({...assistant,provider:'custom',api:'openai-responses'})+'\n');assert.deepEqual((await prepare(custom)).bytes,custom);
 const images=await prepare(Buffer.from(JSON.stringify({...assistant,api:'aside-images'})+'\n'));assert.equal(JSON.parse(images.bytes.toString()).api,'aux-images');
});
test('refuses ambiguous, corrupt, incomplete, unsupported and no-longer-stopped input',async()=>{
 for(const bytes of [Buffer.from('{"role":"assistant","role":"user"}\n'),Buffer.from(JSON.stringify({...assistant,content:[{provider:'x',provider2:'y'}]}).replace('"provider2"','"provider"')+'\n'),Buffer.from(JSON.stringify(assistant)),Buffer.from('{"role":"assistant"}\n'),Buffer.from([0xff,10]),Buffer.from('\uFEFF{}\n')])await assert.rejects(prepare(bytes));
 const bytes=Buffer.from(JSON.stringify(assistant)+'\n');let calls=0;await assert.rejects(prepareAuxTranscriptProviderIdentity({bytes,expectedSha256:sha(bytes),capability:{...capability,assertStopped:async()=>++calls===1}}),/capability/);
 await assert.rejects(prepareAuxTranscriptProviderIdentity({bytes,expectedSha256:'0'.repeat(64),capability}),/hash mismatch/);
});
const pinned=process.env.AUX_PINNED_DAEMON_SOURCE;
test('pinned actual JSONL parse and context transformer retain signatures after fixed-offset migration',{skip:!pinned},async()=>{
 const source=readFileSync(pinned,'utf8');assert.equal(sha(Buffer.from(source)),AUX_TRANSCRIPT_SOURCE_SHA256);
 const audit=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-transcript-provider-identity/source-audit.json',import.meta.url)));
 for(const anchor of audit.anchors){assert.equal(source.split(anchor.find).length-1,anchor.count,anchor.name);assert.equal(source.indexOf(anchor.find),anchor.characterOffset,anchor.name)}
 const start=source.indexOf('function transformMessages('),end=source.indexOf('var NON_VISION_USER_IMAGE_PLACEHOLDER',start);assert.ok(start>=0&&end>start);
 // Execute only the inspected pure transformer, with image downgrading isolated to identity.
 // The fixture has no image blocks, model lookup, filesystem or provider calls.
 const transform=vm.runInNewContext(source.slice(start,end)+';transformMessages',{downgradeUnsupportedImages:messages=>messages},{timeout:1000});
 const target={provider:'aux',api:'aux-provider',id:'same-model'};
 const before=transform([assistant],target);assert.equal(before[0].content[0].type,'text');assert.equal(before[0].content[1].textSignature,undefined);assert.equal(before[0].content[2].thoughtSignature,undefined);
 const result=await prepare(Buffer.from(JSON.stringify(assistant)+'\n'));
 const parsed=JSON.parse(result.bytes.subarray(0,result.bytes.indexOf(10)).toString('utf8'));
 const after=transform([parsed],target);assert.deepEqual(JSON.parse(JSON.stringify(after[0].content)),assistant.content);
});
