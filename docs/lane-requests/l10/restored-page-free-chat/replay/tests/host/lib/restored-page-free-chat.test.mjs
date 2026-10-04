import assert from 'node:assert/strict';
import test from 'node:test';
import { retainRestoredPageFreeProof, requireRestoredPageFreeBeforeSend, requireRestoredPageFreeFollowup, RESTORED_CHAT_TITLE, RESTORED_CHAT_GOAL } from './restored-page-free-chat.mjs';
const closed = { source: { pageId: 'original-reader-page', sessionId: 'original-reader-session', documentEpoch: 8, ownedByRuntime: false }, runs: [{ runId: 'earlier-explicit-turn' }], modelCalls: [] };
const recovered = { runId: 'original-recovered-turn', status: 'completed', goal: 'Kept original draft', pageIds: [], config: { chatId: 'original-chat', mentions: [], contextPageRefs: [], isolatedPageSources: [] } };
const foreign = { pageId: 'unrelated-runtime-tab', ownedByRuntime: true };
const calls = [{ requestId: 'original-fixture-request', messages: [{ content: 'Kept original draft' }] }];
const conversation = { chatId: 'original-chat', title: RESTORED_CHAT_TITLE };
const proof = () => retainRestoredPageFreeProof(closed, recovered, [foreign], [recovered], calls, conversation);
const followup = () => ({ runId: 'explicit-next-send', goal: RESTORED_CHAT_GOAL, pageIds: [], config: { chatId: 'original-chat', mentions: [], contextPageRefs: [], isolatedPageSources: [] } });
const decisions = [{ phase: 'restored-page-free', observations: [] }];
test('retains the actual original completed conversation and removed source independently', () => {
 const turn=structuredClone(recovered), inventory=[turn], requests=structuredClone(calls), metadata=structuredClone(conversation);
 const retained=retainRestoredPageFreeProof(closed,turn,[foreign],inventory,requests,metadata);
 turn.config.chatId='foreign-chat';requests.push({requestId:'later'});metadata.title='changed';
 assert.equal(retained.recovered.config.chatId,'original-chat');assert.equal(retained.calls.length,1);assert.equal(retained.conversation.title,RESTORED_CHAT_TITLE);
});
test('restoring an existing page-free conversation makes no run or model request and keeps source removed', () => {
 requireRestoredPageFreeBeforeSend(proof(),[foreign],structuredClone([recovered]),structuredClone(calls),structuredClone(recovered));
 requireRestoredPageFreeFollowup(proof(),followup(),decisions);
});
test('old source resurrection, hidden new work and changed original turn falsify restoration', () => {
 for(const [pages,runs,requests,turn] of [
  [[foreign,closed.source],[recovered],calls,recovered],
  [[foreign],[recovered,{...followup(),status:'running'}],calls,recovered],
  [[foreign],[recovered],[...calls,{requestId:'early-dispatch'}],recovered],
  [[foreign],[{...recovered,status:'running'}],calls,recovered],
  [[foreign],[recovered],calls,{...recovered,config:{...recovered.config,chatId:'replacement'}}],
 ]) assert.throws(()=>requireRestoredPageFreeBeforeSend(proof(),pages,runs,requests,turn));
});
test('a fresh unrelated chat cannot stand in for the restored original conversation', () => {
 assert.throws(()=>requireRestoredPageFreeFollowup(proof(),{...followup(),config:{...followup().config,chatId:'new-unrelated-chat'}},decisions));
 assert.throws(()=>retainRestoredPageFreeProof(closed,recovered,[foreign],[recovered],calls,{...conversation,chatId:'foreign-chat'}));
});
test('empty pageIds alone cannot hide reintroduced closed browser authority', () => {
 for(const key of ['mentions','contextPageRefs','isolatedPageSources']) {
  const value=followup();value.config[key]=[{...closed.source,access:'act'}];
  assert.deepEqual(value.pageIds,[]);assert.throws(()=>requireRestoredPageFreeFollowup(proof(),value,decisions));
 }
 for(const pageId of [closed.source.pageId,foreign.pageId]) assert.throws(()=>requireRestoredPageFreeFollowup(proof(),{...followup(),pageIds:[pageId]},decisions));
});
test('missing actual next request or any old/foreign page observation refuses the proof', () => {
 for(const rows of [[],[{phase:'different-request',observations:[]}],[{phase:'restored-page-free',observations:[{pageId:closed.source.pageId}]}],[{phase:'restored-page-free',observations:[{pageId:foreign.pageId}]}],[{phase:'restored-page-free'}]]) assert.throws(()=>requireRestoredPageFreeFollowup(proof(),followup(),rows));
});
test('old turn or rewritten draft is not the explicit next Send', () => {
 for(const update of [{runId:recovered.runId},{goal:'rewritten goal'}]) assert.throws(()=>requireRestoredPageFreeFollowup(proof(),{...followup(),...update},decisions));
});
function caller(earlyDispatch = false) {
 const inventory=structuredClone([recovered]), requests=structuredClone(calls), actions=[], seen=[];
 let activeChat=null, selectedPhase;
 const t={ model:{calls:requests,errors:[]},
  restart:async()=>{actions.push('restart');if(earlyDispatch)requests.push({requestId:'hidden-restart-model-call'});},
  until:async(_name,read)=>{const value=await read();assert.ok(value,'source control must expose original producer result');return value;},
  rpc:async(name,args)=>{
   if(name==='conversations.get')return structuredClone(conversation);
   if(name==='conversations.list')return [structuredClone(conversation)];
   if(name==='pages.list')return [foreign];
   if(name==='runs.list')return structuredClone(inventory);
   if(name==='runs.get')return {run:structuredClone(inventory.find(run=>run.runId===args.runId))};
   assert.fail(`Unexpected operation ${name}`);
  },
  ax:{query:async()=>[{}],waitFor:async()=>{},type:async(text)=>{assert.equal(text,RESTORED_CHAT_GOAL);actions.push('type');},dump:async()=>[],
   press:async selector=>{
    if(selector.name===RESTORED_CHAT_TITLE){activeChat=conversation.chatId;actions.push('open-original');return;}
    assert.equal(selector.name,'Send message');assert.equal(activeChat,conversation.chatId);assert.equal(selectedPhase,'restored-page-free');
    actions.push('send');inventory.push({...followup(),status:"completed"});requests.push({requestId:'explicit-send'});seen.push(...structuredClone(decisions));
   }},
 };
 return {t,actions,seen,selectPhase:value=>{selectedPhase=value;}};
}
test('actual caller seam restarts, opens original native caption, then explicitly sends in the same chat',async()=>{
 const {restoredPageFreeChat}=await import('./restored-page-free-chat.mjs');
 const f=caller();const receipt=await restoredPageFreeChat(f.t,closed,recovered,f.seen,f.selectPhase);
 assert.deepEqual(f.actions,['restart','open-original','type','send']);assert.equal(receipt.rpc.details.run.config.chatId,'original-chat');
});
test('a hidden model request during restart rejects before any original conversation or Send action',async()=>{
 const {restoredPageFreeChat}=await import('./restored-page-free-chat.mjs');
 const f=caller(true);await assert.rejects(()=>restoredPageFreeChat(f.t,closed,recovered,f.seen,f.selectPhase),/cannot dispatch a model request/);
 assert.deepEqual(f.actions,['restart']);
});
