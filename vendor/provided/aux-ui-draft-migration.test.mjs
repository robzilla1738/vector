import test from 'node:test';
import assert from 'node:assert/strict';
import {AUX_UI_DRAFT_MIGRATIONS,migrateAuxUiPreferenceSnapshot,migrateAuxUiPreferenceBatch} from './aux-ui-storage-migration.mjs';
const capture=(storage,entries,pageId)=>({format:'aux.ui-storage-snapshot.v1',identityProfile:'aux-v1',
  origin:'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm',profileId:'fixture-profile',storage,entries,
  ...(pageId?{pageId}:{})});
const draft='{ "version": 2, "plainText": "Keep @the tab", "attachments": [{"name":"fixture.txt","path":"/synthetic/retained"}], "future": {"flag":false} }';
test('preserves raw drafts, attachments, old text and distinct page-local copies without touching unknown state',()=>{
  const inputs=[capture('local-storage',{'aside.chat-draft.v2:session-one':draft,'aside.chat-draft.v1:new':'legacy text',theme:'dark'}),
    capture('chrome-local',{'aside.daemonAuth':'synthetic opaque value'}),
    capture('session-storage',{'aside.chat-draft.v2:session-one':draft.replace('Keep @the tab','Different page text')},'page-one'),
    capture('session-storage',{'aside.chat-draft.v1:new':'second page text'},'page-two')];
  const before=structuredClone(inputs),result=migrateAuxUiPreferenceBatch(inputs);
  assert.deepEqual(inputs,before);assert.equal(AUX_UI_DRAFT_MIGRATIONS.length,4);
  assert.equal(result.snapshots[0].entries['aux.chat-draft.v3:session-one'],draft);
  assert.equal(result.snapshots[0].entries['aux.chat-draft-text.v1:new'],'legacy text');
  assert.equal(result.snapshots[2].entries['aux.chat-draft.v3:session-one'],inputs[2].entries['aside.chat-draft.v2:session-one']);
  assert.equal(result.snapshots[3].entries['aux.chat-draft-text.v1:new'],'second page text');
  assert.equal(result.snapshots[1].entries['aside.daemonAuth'],'synthetic opaque value');
  assert.equal(result.receipt.remainingLegacyEntries,1);
  assert(!JSON.stringify(result.receipt).includes('fixture-profile'));
  assert(!JSON.stringify(result.receipt).includes('session-one'));
  assert(!JSON.stringify(result.receipt).includes('/synthetic/retained'));
  assert.deepEqual(migrateAuxUiPreferenceBatch(result.snapshots).snapshots,result.snapshots);
});
test('session settings and pending claims keep raw fields and claim state unchanged',()=>{
  const settings=JSON.stringify({version:1,draftPermissionMode:'read-only',draftRuntimeConfig:{finalConfirm:false,workingDirs:[]},draftProjectId:null});
  const pending=JSON.stringify({sessionId:'session-one',message:{content:'synthetic message'},mode:'display-only',claimId:'existing-claim',claimedAt:123});
  const input=capture('session-storage',{'aside.sidepanel-new-session-settings.v1:page-one':settings,'aside.chat-pending-new-session-message.v1':pending},'page-one');
  const result=migrateAuxUiPreferenceSnapshot(input);
  assert.equal(result.snapshot.entries['aux.sidepanel-new-session-settings.v2:page-one'],settings);
  assert.equal(result.snapshot.entries['aux.chat-pending-new-session-message.v2'],pending);
  assert.equal(result.receipt.drafts.moved,2);assert.equal(result.receipt.rawDraftValuesPreserved,true);
  assert.equal(result.receipt.runtimeAcceptance,false);
});
test('conflicting targets, malformed records and storage misplacement refuse without a partial migration',()=>{
  for(const entries of [
    {'aside.chat-draft.v2:session-one':draft,'aux.chat-draft.v3:session-one':draft+' '},
    {'aside.chat-draft.v2:session-one':'not JSON'},
    {'aside.chat-draft.v2:':'{"version":2,"plainText":"invalid scope"}'},
  ]){
    const input=capture('local-storage',entries),before=structuredClone(input);
    assert.throws(()=>migrateAuxUiPreferenceSnapshot(input),/Conflicting|Invalid|scope/);assert.deepEqual(input,before);
  }
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(capture('chrome-local',{'aside.chat-draft.v2:session-one':draft})),/wrong storage/);
  const equal=migrateAuxUiPreferenceSnapshot(capture('local-storage',{'aside.chat-draft.v2:session-one':draft,'aux.chat-draft.v3:session-one':draft}));
  assert.equal(equal.receipt.drafts.alreadyEqual,1);assert.equal(equal.receipt.drafts.moved,0);
});
test('per-page scope cannot be omitted, duplicated or borrowed from another profile',()=>{
  assert.throws(()=>migrateAuxUiPreferenceSnapshot(capture('session-storage',{})),/page identity/);
  assert.throws(()=>migrateAuxUiPreferenceSnapshot({...capture('local-storage',{}),pageId:'page-one'}),/page identity/);
  const inputs=[capture('local-storage',{}),capture('chrome-local',{}),capture('session-storage',{},'page-one')];
  assert.throws(()=>migrateAuxUiPreferenceBatch([...inputs,inputs[2]]),/unique pages/);
  assert.throws(()=>migrateAuxUiPreferenceBatch([...inputs,{...capture('session-storage',{},'page-two'),profileId:'different'}]),/one captured/);
});
