import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../run-journey.mjs',import.meta.url),'utf8');
const start=source.indexOf("['app', async () =>");
const end=source.indexOf(']]) {',start);
const callbacks=source.slice(start,end+1);
function cleanupFixture(failure,closeFailure){
 let quit=0,close=0,dispose=0;
 const app={},pair={},lease={dispose(){dispose++;}},manifest={},journey={id:'model-saved-key-appearance'};
 const build=new Function('journey','MODEL_SAVED_KEY_APPEARANCE_ID','app','appearancePair','credentialEndpoint','manifest','fixture','retireModelSavedKeyAppearance',`
 let credentialRetirement,savedCredentialSlotRetained=true,importSourcePrepared=false;
 const cleanups=[${callbacks}];return {cleanups,get retained(){return savedCredentialSlotRetained;}};`);
 const result=build(journey,journey.id,app,pair,lease,manifest,{close(){close++;if(closeFailure)throw closeFailure;}},async owner=>{quit++;assert.equal(owner.app,app);assert.equal(owner.pair,pair);assert.equal(owner.endpointLease,lease);if(failure)throw failure;return {browser:{originalPid:123},guardian:{record:{status:'FINAL'},completed:true}};});
 return {result,manifest,counts:()=>({quit,close,dispose})};
}
test('actual runner cleanup callbacks retain endpoint/server/slot when original App retirement rejects',async()=>{
 const original=new Error('original guardian debt'),f=cleanupFixture(original);
 await assert.rejects(f.result.cleanups[0][1](),e=>e===original);
 await assert.rejects(f.result.cleanups[1][1](),/original fixture route\/server retained/);
 assert.equal(f.result.retained,true);assert.deepEqual(f.counts(),{quit:1,close:0,dispose:0});assert.equal(f.manifest.disposableCredentialRetirement,undefined);
});
test('actual runner closes server and releases outer slot eligibility only after retained App retirement proof',async()=>{
 const f=cleanupFixture();await f.result.cleanups[0][1]();await f.result.cleanups[1][1]();
 assert.equal(f.result.retained,false);assert.equal(f.manifest.disposableCredentialRetirement.guardian.record.status,'FINAL');assert.deepEqual(f.counts(),{quit:1,close:1,dispose:0});
});
test('fixture-close failure after genuine guardian completion retains outer cleanup debt',async()=>{
 const original=new Error('original server debt'),f=cleanupFixture(undefined,original);await f.result.cleanups[0][1]();await assert.rejects(f.result.cleanups[1][1](),e=>e===original);assert.equal(f.result.retained,true);
});
