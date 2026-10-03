import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../../.native/chrome/browser/resources/aux_host/aux_host_bootstrap.ts', import.meta.url), 'utf8');
const receipt = '0123456789ABCDEF0123456789ABCDEF';
async function harness() {
  const requests = [];
  let receiver;
  let duringRequest;
  class Remote {
    $ = {bindNewPipeAndPassReceiver() { return {}; }};
    async getIdentity() { return {windowId:'1',profileId:'fixture',privateMode:false,windowKind:0}; }
    async request(method, raw) {
      if (method === 'capabilities') return {ok:true,resultJson:JSON.stringify({buildId:'fixture',sourceCommit:'a'.repeat(40),methods:[],qualifiedFeatures:[]})};
      requests.push({method,args:JSON.parse(raw)});
      duringRequest?.();
      return {ok:true,resultJson:'true'};
    }
  }
  class Receiver {
    $ = {bindNewPipeAndPassRemote() { return {}; }};
    constructor(value) { receiver = value; }
  }
  const context = vm.createContext({window:{}, ShellHostRemote:Remote,
    ShellHostClientReceiver:Receiver, ShellHostFactory:{getRemote(){return {createShellHost(){}};}},
    featureStagesFor(){return {};}, WindowKind:{kNormal:0,kPrivate:1,kLittle:2,kQuickAsk:3},
    crypto:{randomUUID(){return 'ordinary-tab-operation';}}, URL,
  });
  // Execute the actual adapted bootstrap module with only its native imports
  // replaced by controlled protocol doubles. This never loads Mojo or an app.
  const executable = ts.transpileModule(source.replace(/^import .*\n/gm,''),
    {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
  vm.runInContext(executable, context);
  await context.window.auxChromiumHostReady;
  return {port:context.window.auxChromiumHost,requests,
    emit(payload={commandId:'new-window',warmInputReceipt:receipt}) { receiver.onEvent('onShortcut',JSON.stringify(payload)); },
    emitRaw(name, raw) { receiver.onEvent(name,raw); },
    reenter(fn) { duringRequest=fn; },
  };
}
test('actual synchronous native dispatch carries one stripped private receipt', async()=>{
  const h=await harness(); let payload;
  h.port.subscribe('onShortcut',value=>{payload=value;void h.port.request('dispatchCommand',['new-window']);void h.port.request('dispatchCommand',['new-window']);});
  h.emit();
  assert.equal(payload.warmInputReceipt,undefined);
  assert.deepEqual(h.requests.map(x=>x.args),[{args:['new-window'],warmInputReceipt:receipt},['new-window']]);
});
test('promise boundary cannot retain an invocation receipt',async()=>{
  const h=await harness();h.port.subscribe('onShortcut',()=>{void Promise.resolve().then(()=>h.port.request('dispatchCommand',['new-window']));});h.emit();await Promise.resolve();
  assert.deepEqual(h.requests[0].args,['new-window']);
});
test('reentrant remote request cannot reuse the consumed receipt',async()=>{
  const h=await harness();let reentered=false;
  h.reenter(()=>{if(!reentered){reentered=true;void h.port.request('dispatchCommand',['new-window']);}});
  h.port.subscribe('onShortcut',()=>{void h.port.request('dispatchCommand',['new-window']);});h.emit();
  assert.deepEqual(h.requests.map(x=>x.args),[{args:['new-window'],warmInputReceipt:receipt},['new-window']]);
});
test('nested event retires outer context and does not restore it',async()=>{
  const h=await harness();let nested=false;
  h.port.subscribe('onShortcut',()=>{if(!nested){nested=true;h.emit({commandId:'sidebar'});void h.port.request('dispatchCommand',['new-window']);}});h.emit();
  assert.deepEqual(h.requests[0].args,['new-window']);
});
test('only first synchronous listener can carry private receipt',async()=>{
  const h=await harness();h.port.subscribe('onShortcut',()=>{});h.port.subscribe('onShortcut',()=>{void h.port.request('dispatchCommand',['new-window']);});h.emit();
  assert.deepEqual(h.requests[0].args,['new-window']);
});
test('foreign command and malformed empty lowercase receipts stay ordinary',async()=>{
  for(const payload of [{commandId:'sidebar',warmInputReceipt:receipt},{commandId:'new-window',warmInputReceipt:'0'.repeat(32)},{commandId:'new-window',warmInputReceipt:receipt.toLowerCase()},{commandId:'new-window',warmInputReceipt:receipt+'0'}]){
    const h=await harness();h.port.subscribe('onShortcut',()=>{void h.port.request('dispatchCommand',['new-window']);});h.emit(payload);assert.deepEqual(h.requests[0].args,['new-window']);
  }
});
test('other command and later ordinary bridge calls cannot borrow metadata',async()=>{
  const h=await harness();h.port.subscribe('onShortcut',()=>{void h.port.request('dispatchCommand',['new-tab']);});h.emit();await h.port.request('dispatchCommand',['new-window']);
  assert.deepEqual(h.requests.map(x=>x.args),[['new-tab'],['new-window']]);
});
test('throwing callback clears context in finally',async()=>{
  const h=await harness();h.port.subscribe('onShortcut',()=>{throw new Error('callback failure');});assert.throws(()=>h.emit(),/callback failure/);await h.port.request('dispatchCommand',['new-window']);assert.deepEqual(h.requests[0].args,['new-window']);
});

test('unknown or malformed nested delivery retires outer metadata',async()=>{
  for (const [name,raw] of [['foreignEvent','{}'],['onShortcut','{bad-json']]) {
    const h=await harness();h.port.subscribe('onShortcut',()=>{h.emitRaw(name,raw);void h.port.request('dispatchCommand',['new-window']);});h.emit();assert.deepEqual(h.requests[0].args,['new-window']);
  }
});
