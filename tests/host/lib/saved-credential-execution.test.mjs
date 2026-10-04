import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retainSavedCredentialExecution} from './saved-credential-execution.mjs';
const source=readFileSync(new URL('../run-journey.mjs',import.meta.url),'utf8');
const before=readFileSync(new URL('../../../docs/lane-requests/l10/saved-credential-execution-retention/runner.before.mjs',import.meta.url),'utf8');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function fixturePreparation(source,gate,signal){
 const from=source.indexOf('  fixture = await createFixture('),to=source.indexOf('  const launch =',from);
 return new Function('createFixture','signal','journey','MODEL_SAVED_KEY_APPEARANCE_ID',`let fixture,credentialEndpoint,savedCredentialSlotRetained=false;return async()=>{${source.slice(from,to)}return fixture;};`)
 (()=>gate.promise,signal,{id:'model-saved-key-appearance'},'model-saved-key-appearance');
}
test('actual original late fixture creation could claim after abort; successor refuses before endpoint/App preparation',async()=>{
 for(const [body,expected] of [[before,1],[source,0]]){
  const gate=deferred(),controller=new AbortController(),original=new Error('original timeout');let claimed=0;
  const execute=fixturePreparation(body,gate,controller.signal),pending=execute();controller.abort(original);gate.resolve({claimDisposableModelCredentialEndpoint(){claimed++;return {};}});
  if(expected)await pending;else await assert.rejects(pending,e=>e===original);assert.equal(claimed,expected);
 }
});
test('original pending execution is retained with no fresh deadline; late helper cleanup failure remains exact debt',async()=>{
 const gate=deferred(),retained=retainSavedCredentialExecution(gate.promise),primary=new Error('timeout'),late=new Error('helper cleanup failed');
 assert.throws(()=>retained.assertDrained(primary),e=>{assert.equal(e.retainedOriginalExecution,gate.promise);return true;});assert.equal(retained.receipt.pending,true);
 gate.reject(late);await Promise.resolve();assert.throws(()=>retained.assertDrained(primary),e=>{assert.equal(e.cause,late);assert.equal(e.errors[0],late);return true;});assert.equal(retained.receipt.failed,true);
});
test('original settled primary rejection or successful execution can proceed to existing cleanup',async()=>{
 for(const reason of [undefined,new Error('actual primary')]){const gate=deferred(),owner=retainSavedCredentialExecution(gate.promise);gate.reject(reason);await Promise.resolve();owner.assertDrained(reason);assert.equal(owner.receipt.pending,false);assert.equal(owner.receipt.failed,true);}
 const owner=retainSavedCredentialExecution(Promise.resolve({actualAck:true}));await Promise.resolve();owner.assertDrained();assert.equal(owner.receipt.failed,false);
});
function cleanup(owner,primary){
 const a=source.indexOf("['app', async () =>"),b=source.indexOf(']]) {',a);let closed=0;
 const result=new Function('savedCredentialExecution','journeyFailure','fixture',`let credentialEndpoint,credentialRetirement,app,appearancePair;let savedCredentialSlotRetained=true;const rows=[${source.slice(a,b+1)}];return {fixture:rows[1][1],get retained(){return savedCredentialSlotRetained;}};`)(owner,primary,{close(){closed++;}});
 return {result,closed:()=>closed};
}
test('actual cleanup callback cannot close late original fixture or release outer slot while execution is pending',async()=>{
 const gate=deferred(),owner=retainSavedCredentialExecution(gate.promise),f=cleanup(owner,new Error('timeout'));
 await assert.rejects(f.result.fixture());assert.equal(f.closed(),0);assert.equal(f.result.retained,true);
 gate.resolve();await Promise.resolve();await f.result.fixture();assert.equal(f.closed(),1);assert.equal(f.result.retained,false);
});
