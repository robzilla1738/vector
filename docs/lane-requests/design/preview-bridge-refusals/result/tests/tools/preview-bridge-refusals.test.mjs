import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { transform } = createRequire(require.resolve('vite'))('esbuild');
const root = new URL('../../', import.meta.url);
const records = JSON.parse(readFileSync(new URL('docs/lane-requests/design/preview-bridge-refusals/original-refusals.json', root)));
async function load(window = {}, location = {protocol:'http:',hostname:'localhost'}) {
  const source = readFileSync(new URL('apps/shell/src/bridge.ts', root),'utf8');
  const { code } = await transform(source, { loader:'ts',format:'cjs',target:'chrome154' });
  const module = {exports:{}};
  runInNewContext(code,{module,exports:module.exports,window,location,console});
  return module.exports;
}
test('all original preview refusals stay asynchronous, distinct, exact and fresh per invocation',async()=>{
  const {bridge,inNativeHost,inMock}=await load();
  assert.equal(inNativeHost,false);assert.equal(inMock,false);
  assert.equal(records.length,45);
  assert.equal(new Set(records.map(row=>bridge[row.method])).size,45);
  for (const row of records) {
    let result; assert.doesNotThrow(()=>{result=bridge[row.method]({foreign:'ignored'});});
    const first=await result.then(()=>assert.fail('refusal fulfilled'),error=>error);
    const second=await bridge[row.method]().then(()=>assert.fail('refusal fulfilled'),error=>error);
    assert.equal(first.message,row.message);assert.equal(first.name,'Error');assert.equal(second.message,row.message);
    assert.notEqual(first,second);
  }
});
test('native bridge identity, ACK, original rejection and mode policy remain untouched',async()=>{
  const rejection=new Error('original native refusal');const ack={registered:true};
  const native={quickAskShortcut:async()=>ack,invoke:async()=>{throw rejection;}};
  const exports=await load({aux:native,auxHostProof:{host:'chromium-fork'}},{protocol:'chrome:',hostname:'aux'});
  assert.equal(exports.bridge,native);assert.equal(exports.inNativeHost,true);
  assert.equal(await exports.bridge.quickAskShortcut(),ack);
  await assert.rejects(exports.bridge.invoke(),error=>error===rejection);
  assert.equal((await load({aux:native,auxHostProof:{host:'chromium-fork'}})).inNativeHost,false);
  assert.equal((await load({__auxMock:true})).inMock,true);
});
test('preview successes and mutable return values retain their original behavior',async()=>{
  const {bridge}=await load();assert.equal(await bridge.defaultPageZoom().catch(e=>e.message),'Default page zoom requires Aux desktop');
  assert.equal(await bridge.overlay(),true);assert.equal(await bridge.privatePageZoom().catch(e=>e.message),'Private page zoom requires Aux desktop');
  const a=await bridge.downloadsSnapshot();const b=await bridge.downloadsSnapshot();assert.notEqual(a,b);assert.deepEqual(Array.from(a),[]);
  assert.equal(await bridge.createBrowserProfile().catch(e=>e.message),'Profiles require the native browser.');
});
