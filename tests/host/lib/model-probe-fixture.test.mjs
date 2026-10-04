import {test} from 'node:test';
import {request as httpRequest} from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {setTimeout as wait} from 'node:timers/promises';
import {createFixture} from './fixture.mjs';
import {createSuccessfulModelProbeFixture,createRejectedModelProbeFixture} from './model-probe-fixture.mjs';
import {directModelClient} from '../../../apps/runtime/dist/agent/direct-providers.js';
const require=createRequire(realpathSync(new URL('../../../apps/runtime/dist/agent/direct-providers.js',import.meta.url)));
const {z}=require('zod');
const ready=async fixture=>{const deadline=Date.now()+4000;while(!fixture.receipts.length){assert.ok(Date.now()<deadline,'Original HTTP request did not arrive');await wait(5);}fixture.requirePending();};
test('installed original model client remains pending until actual HTTP release and parses genuine structured/vision responses', {timeout:10000}, async()=>{
  const server=await createFixture(),controller=new AbortController(),fixture=createSuccessfulModelProbeFixture(server,controller.signal);
  try{
    const client=directModelClient('openai-compatible','aux-local',undefined,fixture.endpoint);
    let settled=false;const pending=client.generateStructured({modelId:fixture.model,system:'You answer probes with strict JSON.',prompt:'Return {"ok":true}',schema:z.object({ok:z.boolean()}),maxOutputTokens:1024}).finally(()=>{settled=true;});
    await ready(fixture);assert.equal(settled,false);assert.equal(fixture.receipts.length,1);fixture.release();
    assert.deepEqual((await pending).object,{ok:true});
    const text=await client.generateText({modelId:fixture.model,prompt:'What color dominates this image? One word.',imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',maxOutputTokens:512});
    assert.equal(text.text,'blue');assert.equal(fixture.receipts.length,2);assert.deepEqual(fixture.receipts.map(row=>row.kind),['structured','vision']);assert.ok(fixture.receipts.every(row=>row.bodyBytes<=65536&&row.rawBody.length>0&&row.bodySha256.length===64));assert.ok(fixture.receipts.every(row=>row.state==='delivered'&&row.status===200));assert.equal(fixture.unresolved,0);
  }finally{fixture.dispose();await server.close();}
});
test('fixed rejected probe is a real original HTTP503 with no corrective or vision request', {timeout:10000},async()=>{
  const server=await createFixture(),controller=new AbortController(),fixture=createRejectedModelProbeFixture(server,controller.signal);
  try{
    const client=directModelClient('openai-compatible','aux-local',undefined,fixture.endpoint);
    const pending=client.generateStructured({modelId:fixture.model,system:'You answer probes with strict JSON.',prompt:'Return {"ok":true}',schema:z.object({ok:z.boolean()}),maxOutputTokens:1024});pending.catch(()=>{});
    await ready(fixture);fixture.release();await assert.rejects(pending,/Owned synthetic probe unavailable/);
    assert.equal(fixture.receipts.length,1);assert.equal(fixture.receipts[0].status,503);assert.equal(fixture.receipts[0].state,'delivered');assert.equal(fixture.unresolved,0);
  }finally{fixture.dispose();await server.close();}
});
test('original signal abort retires held HTTP and clears pending responses', {timeout:10000},async()=>{
  const server=await createFixture(),controller=new AbortController(),fixture=createSuccessfulModelProbeFixture(server,controller.signal);
  try{
    const client=directModelClient('openai-compatible','aux-local',undefined,fixture.endpoint);
    const pending=client.generateStructured({modelId:fixture.model,system:'You answer probes with strict JSON.',prompt:'Return {"ok":true}',schema:z.object({ok:z.boolean()}),signal:controller.signal,maxOutputTokens:1024});pending.catch(()=>{});
    await ready(fixture);controller.abort(new Error('Original source control cancellation'));await assert.rejects(pending);await wait(5);
    assert.equal(fixture.unresolved,0);assert.ok(['cancelled','disconnected'].includes(fixture.receipts[0].state));assert.throws(()=>fixture.release());
  }finally{fixture.dispose();await server.close();}
});

test('a second generic text request cannot pass the original PNG vision gate',{timeout:10000},async()=>{
 const server=await createFixture(),controller=new AbortController(),fixture=createSuccessfulModelProbeFixture(server,controller.signal);
 try{const client=directModelClient('openai-compatible','aux-local',undefined,fixture.endpoint);const first=client.generateStructured({modelId:fixture.model,system:'You answer probes with strict JSON.',prompt:'Return {"ok":true}',schema:z.object({ok:z.boolean()}),maxOutputTokens:1024});await ready(fixture);fixture.release();await first;await assert.rejects(client.generateText({modelId:fixture.model,prompt:'What color dominates this image? One word.',maxOutputTokens:512}));assert.equal(fixture.receipts.length,1);assert.equal(fixture.receipts[0].kind,'structured');}finally{fixture.dispose();await server.close();}
});
test('partial probe acquisition retires only its original first route',async()=>{
 const fixture=await createFixture(),controller=new AbortController();try{fixture.route('/appearance-model-probe-success/v1/chat/completions',{owner:'preexisting'},{method:'POST'});assert.throws(()=>createSuccessfulModelProbeFixture(fixture,controller.signal),/already has an owner/);assert.equal((await fetch(`${fixture.url}/appearance-model-probe-success/v1/models`)).status,404);assert.deepEqual(await(await fetch(`${fixture.url}/appearance-model-probe-success/v1/chat/completions`,{method:'POST'})).json(),{owner:'preexisting'});}finally{await fixture.close();}
});
test('probe cleanup keeps foreign replacement and removes its still-owned list route',async()=>{
 const fixture=await createFixture(),controller=new AbortController();try{const probe=createSuccessfulModelProbeFixture(fixture,controller.signal);fixture.route('/appearance-model-probe-success/v1/chat/completions',{owner:'replacement'},{method:'POST'});assert.throws(()=>probe.dispose(),AggregateError);assert.equal((await fetch(`${fixture.url}/appearance-model-probe-success/v1/models`)).status,404);assert.deepEqual(await(await fetch(`${fixture.url}/appearance-model-probe-success/v1/chat/completions`,{method:'POST'})).json(),{owner:'replacement'});}finally{await fixture.close();}
});

test('replaced route after held gate refuses original response and retains cleanup debt',{timeout:10000},async()=>{
 const server=await createFixture(),controller=new AbortController(),fixture=createSuccessfulModelProbeFixture(server,controller.signal);
 try{const client=directModelClient('openai-compatible','aux-local',undefined,fixture.endpoint);const pending=client.generateStructured({modelId:fixture.model,system:'You answer probes with strict JSON.',prompt:'Return {"ok":true}',schema:z.object({ok:z.boolean()}),maxOutputTokens:1024});pending.catch(()=>{});await ready(fixture);fixture.release();server.route('/appearance-model-probe-success/v1/chat/completions',{owner:'replacement'},{method:'POST'});await assert.rejects(pending);assert.equal(fixture.receipts[0].state,'refused');assert.equal(fixture.receipts[0].status,500);assert.equal(fixture.unresolved,0);assert.throws(()=>fixture.dispose(),AggregateError);assert.deepEqual(await(await fetch(`${fixture.endpoint}/chat/completions`,{method:'POST'})).json(),{owner:'replacement'});}finally{try{fixture.dispose();}catch{}await server.close();}
});

test('route replacement while original HTTP body is held refuses before receipt',{timeout:10000},async()=>{
 const server=await createFixture(),controller=new AbortController(),fixture=createSuccessfulModelProbeFixture(server,controller.signal);let request;
 try{
  const body=JSON.stringify({model:fixture.model,messages:[{role:'system',content:'You answer probes with strict JSON.'},{role:'user',content:'Return {"ok":true}'}]});
  const response=new Promise((resolve,reject)=>{request=httpRequest(`${fixture.endpoint}/chat/completions`,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer aux-local'}},reply=>{reply.resume();reply.once('end',()=>resolve(reply.statusCode));});request.once('error',reject);});
  request.write(body.slice(0,20));const deadline=Date.now()+4000;while(!server.requests.length){assert.ok(Date.now()<deadline);await wait(5);}
  server.route('/appearance-model-probe-success/v1/chat/completions',{owner:'replacement'},{method:'POST'});request.end(body.slice(20));assert.equal(await response,500);assert.equal(fixture.receipts.length,0);assert.equal(fixture.unresolved,0);assert.throws(()=>fixture.dispose(),AggregateError);assert.deepEqual(await(await fetch(`${fixture.endpoint}/chat/completions`,{method:'POST'})).json(),{owner:'replacement'});
 }finally{request?.destroy();try{fixture.dispose();}catch{}await server.close();}
});
