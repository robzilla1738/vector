import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as settings from './model-settings-appearance.mjs';
import * as success from './model-probe-success-appearance.mjs';
import * as failure from './model-probe-failure-appearance.mjs';
import {requireModelSettingsAppearance} from '../lib/model-settings-appearance.mjs';
import {requireModelProbeAppearance} from '../lib/model-probe-appearance.mjs';
const entries=[settings,success,failure];
for(const entry of entries){
 test(`${entry.journey.id} preserves fixed isolated metadata`,()=>{
  assert.equal(entry.journey.timeoutMs,150000);assert.deepEqual(entry.journey.launch,{});
  assert.deepEqual(entry.journey.needs,['accessibility','screen-recording']);
  assert.equal(entry.journey.model,entry===settings?'loopback':'none');
  assert.deepEqual(entry.journey.features,['electronMigration']);
 });
 test(`${entry.journey.id} refuses ordinary or aborted execution before producers`,async()=>{
  let calls=0;const controller=new AbortController();const t={appearanceEnabled:false,signal:controller.signal,step(){calls++;},rpc(){calls++;}};
  await assert.rejects(entry.run(t));assert.equal(calls,0);
  t.appearanceEnabled=true;controller.abort(new Error('original abort'));
  await assert.rejects(entry.run(t),/original abort/);assert.equal(calls,0);
 });
 test(`${entry.journey.id} carries original bounded UI phase completion`,async()=>{
  const result={original:true};let callback,phases=0;
  const t={appearanceEnabled:true,signal:new AbortController().signal,step(name,options,work){phases++;assert.equal(options.kind,'ui');assert.deepEqual(options.features,['electronMigration']);assert.equal(typeof name,'string');callback=work;return Promise.resolve(result);}};
  assert.equal(await entry.run(t),result);assert.equal(phases,1);assert.equal(typeof callback,'function');
 });
}
test('only exact appearance IDs and original pair are admitted',()=>{
 for(const entry of entries){const guard=entry===settings?requireModelSettingsAppearance:requireModelProbeAppearance;
  guard({journeyId:entry.journey.id,appearance:true,pair:'original admission path'});
  assert.throws(()=>guard({journeyId:'home-composer',appearance:true,pair:'original admission path'}));
  assert.throws(()=>guard({journeyId:entry.journey.id,appearance:false,pair:'original admission path'}));
  assert.throws(()=>guard({journeyId:entry.journey.id,appearance:true}));
 }
});
