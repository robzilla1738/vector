import test from 'node:test';
import assert from 'node:assert/strict';
import {AUX_UI_PREFERENCE_MIGRATIONS,migrateAuxUiPreferenceSnapshot,migrateAuxUiPreferenceBatch} from './aux-ui-storage-migration.mjs';

const snapshot=(storage,entries)=>({format:'aux.ui-storage-snapshot.v1',identityProfile:'aux-v1',
  origin:'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm',profileId:'synthetic-profile-one',storage,entries});
test('preserves explicit search/layout/confirmation choices and unrelated raw Local Storage',()=>{
  const input=snapshot('local-storage',{
    'aside.new-tab.omnibox-mode.v1':'ask','aside.browserTabStyle':'horizontal',
    'aside.last-final-confirm.v1':'false','aside.last-permission-mode.v1':'read-only',
    'aside.new-tab.onboarding-helper-state.v1':'folded','theme':'dark',
    'aside.chat-draft.v2:fixture':'unmodified synthetic draft',
  }),before=structuredClone(input);
  const {snapshot:next,receipt}=migrateAuxUiPreferenceSnapshot(input);
  assert.deepEqual(input,before);
  assert.equal(next.entries['aux.new-tab.omnibox-mode.v2'],'ask');
  assert.equal(next.entries['aux.browserTabStyle.v2'],'horizontal');
  assert.equal(next.entries['aux.last-final-confirm.v2'],'false');
  assert.equal(next.entries['aux.last-permission-mode.v2'],'read-only');
  assert.equal(next.entries['aux.new-tab.onboarding-helper-state.v2'],'folded');
  assert.equal(next.entries.theme,'dark');
  assert.equal(next.entries['aside.chat-draft.v2:fixture'],input.entries['aside.chat-draft.v2:fixture']);
  assert.equal(receipt.moved.length,5);assert.equal(receipt.remainingLegacyEntries,1);
  assert(!JSON.stringify(receipt).includes('synthetic-profile-one'));
  assert(!JSON.stringify(receipt).includes('unmodified synthetic draft'));
  assert.deepEqual(migrateAuxUiPreferenceSnapshot(next).snapshot,next);
  assert.equal(migrateAuxUiPreferenceSnapshot(next).receipt.changedEntries,false);
});
test('disabled capture, system color and exact prompt whitespace survive without changing unknown objects',()=>{
  const input=snapshot('chrome-local',{'aside.capture.enabled':false,'aside.browserColorScheme':'system',
    'aside.tabsTidy.customPrompt':'  Keep research together.  ',unrelated:{array:[false,0,'']}});
  const before=structuredClone(input),{snapshot:next,receipt}=migrateAuxUiPreferenceSnapshot(input);
  assert.deepEqual(input,before);assert.equal(next.entries['aux.capture.enabled.v2'],false);
  assert.equal(next.entries['aux.browserColorScheme.v2'],'system');
  assert.equal(next.entries['aux.tabsTidy.customPrompt.v2'],'  Keep research together.  ');
  assert.deepEqual(next.entries.unrelated,input.entries.unrelated);assert.equal(receipt.moved.length,3);
  assert.equal(receipt.remainingLegacyEntries,0);
});
test('conflicts and malformed values refuse without mutating the captured source; equal values deduplicate',()=>{
  for(const entries of [
    {'aside.new-tab.omnibox-mode.v1':'ask','aux.new-tab.omnibox-mode.v2':'search'},
    {'aside.last-final-confirm.v1':'yes'},
    {'aux.last-permission-mode.v2':'anything'},
  ]){
    const input=snapshot('local-storage',entries),before=structuredClone(input);
    assert.throws(()=>migrateAuxUiPreferenceSnapshot(input),/Conflicting|Invalid/);assert.deepEqual(input,before);
  }
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(snapshot('chrome-local',{'aside.capture.enabled':'false'})),/Invalid/);
  const input=snapshot('chrome-local',{'aside.capture.enabled':false,'aux.capture.enabled.v2':false});
  const result=migrateAuxUiPreferenceSnapshot(input);
  assert.deepEqual(result.receipt.alreadyEqual,['aux.capture.enabled.v2']);
  assert.equal(Object.hasOwn(result.snapshot.entries,'aside.capture.enabled'),false);
  assert.equal(input.entries['aside.capture.enabled'],false);
});
test('source extension, storage type and JSON boundaries refuse instead of widening migration',()=>{
  assert.throws(()=>migrateAuxUiPreferenceSnapshot({...snapshot('local-storage',{}),origin:'chrome-extension://other'}),/snapshot required/);
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(snapshot('local-storage',{'aside.capture.enabled':'false'})),/wrong storage/);
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(snapshot('local-storage',{wrong:false})),/raw string/);
  const input=snapshot('chrome-local',{});Object.defineProperty(input.entries,'read',{enumerable:true,get(){throw Error('getter must not run')}});
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(input),/accessors/);
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(snapshot('chrome-local',{unknown:[,]})),/holes/);
  const cycle={};cycle.self=cycle;assert.throws(()=>migrateAuxUiPreferenceSnapshot(snapshot('chrome-local',{cycle})),/acyclic/);
});
test('fresh snapshots acquire no defaults, profile IDs, permissions or account state',()=>{
  assert.equal(AUX_UI_PREFERENCE_MIGRATIONS.length,8);
  for(const storage of ['local-storage','chrome-local']){
    const input=snapshot(storage,{}),{snapshot:next,receipt}=migrateAuxUiPreferenceSnapshot(input);
    assert.deepEqual(next.entries,{});assert.equal(next.profileId,input.profileId);
    assert.equal(receipt.changedEntries,false);assert.equal(receipt.runtimeAcceptance,false);
  }
});
test('a two-store batch never returns a partial result or combines different profiles',()=>{
  const inputs=[snapshot('local-storage',{'aside.new-tab.omnibox-mode.v1':'ask'}),
    snapshot('chrome-local',{'aside.capture.enabled':false,'aux.capture.enabled.v2':true})];
  const before=structuredClone(inputs);
  assert.throws(()=>migrateAuxUiPreferenceBatch(inputs),/Conflicting/);assert.deepEqual(inputs,before);
  delete inputs[1].entries['aux.capture.enabled.v2'];
  const prepared=migrateAuxUiPreferenceBatch(inputs);
  assert.equal(prepared.snapshots[0].entries['aux.new-tab.omnibox-mode.v2'],'ask');
  assert.equal(prepared.snapshots[1].entries['aux.capture.enabled.v2'],false);
  assert.equal(prepared.receipt.filesystemCommitted,false);
  assert.throws(()=>migrateAuxUiPreferenceBatch([inputs[0],{...inputs[1],profileId:'different-profile'}]),/one captured/);
  assert.throws(()=>migrateAuxUiPreferenceBatch([inputs[0],inputs[0]]),/distinct/);
});
