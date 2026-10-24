import {createHash} from 'node:crypto';
import {eligibleTidyTabs, validateTidyPlan, createTidyProposal, runProductivityPlan, productivitySections} from './aux-productivity-proposals.mjs';

// Bound to the supplied account resolver, actual authenticated tRPC transport,
// and native organization snapshot. No tab mutation occurs in this producer.
export async function prepareTidyProposal(deps) {
  const snapshot=await deps.snapshot(),tabs=eligibleTidyTabs(snapshot);
  if(!Number.isSafeInteger(snapshot.windowId)) throw Error('The originating browser window is unavailable.');
  if(!Number.isSafeInteger(snapshot.accountId)||snapshot.accountId<0) throw Error('Connect this profile to an AI provider before using Tidy Tabs.');
  if(tabs.length<2) throw Error('Open at least two unpinned tabs in this Space to tidy.');
  const account=await deps.account();
  if(account.accountId!==snapshot.accountId) throw Error('Profile changed; try Tidy Tabs again.');
  const requestId=deps.uuid();let expired=false,checking=false;
  const same=next=>next?.success&&next.ownerGeneration===snapshot.ownerGeneration&&next.revision===snapshot.revision&&next.spaceId===snapshot.spaceId&&next.windowId===snapshot.windowId&&next.accountId===snapshot.accountId;
  const timer=deps.interval(async()=>{
    if(checking)return;checking=true;
    try{if(!same(await deps.snapshot())){expired=true;await deps.cancel({accountId:snapshot.accountId,requestId})}}
    catch{expired=true;await deps.cancel({accountId:snapshot.accountId,requestId}).catch(()=>{})}
    finally{checking=false}
  },1000);
  try {
    const customPrompt=await deps.customPrompt();
    if(expired||!same(await deps.snapshot()))throw Error('Tabs changed; try Tidy Tabs again.');
    const plan=await deps.plan({accountId:snapshot.accountId,requestId,customPrompt,
      tabs:tabs.map(tab=>({id:tab.id,title:(tab.title??'').slice(0,512),origin:new URL(tab.url).origin}))});
    if(expired||!same(await deps.snapshot())||(await deps.account()).accountId!==snapshot.accountId)
      throw Error('Tabs or profile changed; no organization was applied.');
    const proposal=createTidyProposal(snapshot,plan,deps.uuid);
    if(!proposal.moves.length)throw Error('No organization changes were suggested.');
    const shown=await deps.show({proposal});
    if(!shown?.success)throw Error(shown?.error??'Could not open the organization review.');
    return {success:true,phase:'review',proposalId:proposal.proposalId};
  } finally {deps.clearInterval(timer)}
}

export async function commitProductivityAction(api,context,receipt,item) {
  if(item.kind==='aux-tidy-preview')return {keepOpen:true};
  if(item.kind==='aux-tidy-cancel')return {close:true};
  const proposal=context?.organizationProposal;
  if(!proposal||context.mode!=='tidy')throw Error('Organization review expired.');
  if(item.kind==='aux-tidy-apply') {
    // Never re-send renderer-owned moves. Native retains the reviewed proposal.
    const result=await api.applyOrganizationProposal({proposalId:proposal.proposalId});
    if(!result?.success)throw Error(result?.error??'Organization was not applied.');
    return {receipt:result};
  }
  if(item.kind==='aux-tidy-undo') {
    if(!receipt?.undoToken||typeof receipt.revision!=='string')throw Error('Undo is unavailable.');
    const result=await api.undoOrganization({ownerGeneration:proposal.ownerGeneration,undoToken:receipt.undoToken,
      expectedRevision:receipt.revision,operationId:crypto.randomUUID()});
    if(!result?.success)throw Error(result?.error??'Organization could not be undone.');
    return {receipt:{...result,undone:true}};
  }
  throw Error('Unknown organization action');
}

function replace(text,find,replacement,anchors,kind) {
  const count=text.split(find).length-1;
  if(count!==1)throw Error(`${kind}: expected one pinned anchor, got ${count}`);
  anchors.push({kind,find,replace:replacement,count:1});return text.replace(find,replacement);
}
export function transformAuxProductivityUi({relative,text}) {
  const anchors=[];const change=(find,next,kind)=>{text=replace(text,find,next,anchors,kind)};
  if(relative==='background.js') {
    const start=text.indexOf('async function Yw(e = {}) {'),end=text.indexOf('\nvar Xw =',start);
    if(start<0||end<0)throw Error('Missing supplied Tidy handler');
    const old=text.slice(start,end);
    if(createHash('sha256').update(old).digest('hex')!=='2f98717a7d413b9fd7365a9b6f64f17a36c32813e5b8187e780e6df1ee88a19a')throw Error('Supplied Tidy handler changed');
    const helper=[eligibleTidyTabs,validateTidyPlan,createTidyProposal,prepareTidyProposal].map(fn=>fn.toString()).join('\n');
    change(old,`${helper}\nlet auxTidyInFlight=null;async function Yw(){if(auxTidyInFlight)return auxTidyInFlight;auxTidyInFlight=prepareTidyProposal({snapshot:()=>chrome.auxBrowserPreferences.getOrganizationSnapshot(),account:()=>Xa(),uuid:()=>crypto.randomUUID(),customPrompt:()=>Ew(),plan:input=>D.models.productivityPlan.mutate(input),cancel:input=>D.models.productivityCancel.mutate(input),show:input=>chrome.auxBrowserPreferences.showOrganizationProposal(input),interval:setInterval,clearInterval}).finally(()=>{auxTidyInFlight=null});return auxTidyInFlight}`,'aux-tidy-proposal-dispatch');
    change('r(n), ts(n);','r(n);','aux-tidy-review-not-applied-telemetry');
    // Retire the old hosted planner as well as its destructive application path.
    const plannerStart=text.indexOf('async function Ow(e) {'),plannerEnd=text.indexOf('\nvar He =',plannerStart);
    if(plannerStart<0||plannerEnd<0)throw Error('Missing supplied hosted planner');
    const oldPlanner=text.slice(plannerStart,plannerEnd);
    change(oldPlanner,'async function Ow(){throw Error("Use the reviewed profile-scoped Tidy Tabs action.")}','aux-tidy-retire-hosted-planner');
  }
  if(relative==='assets/tabsearch-3k_2hgil.js') {
    change('function Qe(){const[auxNavContext,',`${productivitySections.toString()}\n${commitProductivityAction.toString()}\nfunction Qe(){const[auxProductivityReceipt,auxSetProductivityReceipt]=(0,i.useState)(null);const[auxNavContext,`,'aux-tidy-review-state');
    change('()=>navigationSections(auxNavContext,r,Pe($,r)),[r,$,auxNavContext]',
      '()=>productivitySections(auxNavContext,auxProductivityReceipt)??navigationSections(auxNavContext,r,Pe($,r)),[r,$,auxNavContext,auxProductivityReceipt]','aux-tidy-review-rows');
    change('let auxNavSuccess=false;try{if(n.kind===',
      'let auxNavSuccess=false;try{if(n.kind?.startsWith("aux-tidy-")){const result=await commitProductivityAction(chrome.auxBrowserPreferences,auxNavContext,auxProductivityReceipt,n);if(result.receipt)auxSetProductivityReceipt(result.receipt);auxNavSuccess=!!result.close;return}if(n.kind===','aux-tidy-review-actions');
    change('if(auxNavSuccess)O()}},[auxNavContext]);','if(auxNavSuccess)O()}},[auxNavContext,auxProductivityReceipt]);','aux-tidy-review-action-context');
    change('placeholder:auxNavContext?.mode==="commands"?',
      'readOnly:auxNavContext?.mode==="tidy",placeholder:auxNavContext?.mode==="tidy"?"Review tab organization":auxNavContext?.mode==="commands"?','aux-tidy-review-input');
  }
  return {text,anchors};
}

// Authenticated accountProcedure calls this inside the existing daemon. The
// account's ModelsManager resolves its own credential or eligible plan session.
export async function auxRunProductivityRequest(accountId,input) {
  init_runtime$1();init_models();init_settings$1();
  const boundary=auxBrokerBoundary();boundary.assertOwner();
  boundary.registerProducerStop(auxStopProductivityRequests);
  if(auxProductivityRequests.has(accountId))throw Error('A tab organization request is already running for this profile.');
  const controller=new AbortController(),entry={requestId:input.requestId,controller};
  auxProductivityRequests.set(accountId,entry);
  const timeout=setTimeout(()=>controller.abort(Error('Tab organization timed out.')),60000);
  try{return await boundary.awaited(()=>runProductivityPlan(input,{
    signal:controller.signal,assertCurrent:()=>boundary.assertOwner(),
    selection:async()=>{const store=settings(accountId);return store.get('modelCategories')?.fast??store.get('defaultModel')},
    resolve:selection=>models(accountId).resolve(selection.modelId,selection.provider),
    complete:(resolved,context,selection)=>modelRuntime.completeSimple(resolved.model,context,{apiKey:resolved.apiKey,
      maxTokens:2048,signal:controller.signal,cacheRetention:'none',reasoning:selection.thinkingLevel})
  }))}finally{clearTimeout(timeout);if(auxProductivityRequests.get(accountId)===entry)auxProductivityRequests.delete(accountId)}
}
export function auxStopProductivityRequests(){for(const entry of auxProductivityRequests.values())entry.controller.abort(Error('Aux is shutting down.'))}
export function auxCancelProductivityRequest(accountId,requestId) {
  const entry=auxProductivityRequests.get(accountId);
  if(entry?.requestId===requestId)entry.controller.abort(Error('The organization context changed.'));
  return {success:true};
}
export function transformAuxProductivityDaemon({text}) {
  const anchors=[];
  const helpers=`\nconst auxProductivityRequests=new Map();\n${[validateTidyPlan,runProductivityPlan,auxStopProductivityRequests,auxCancelProductivityRequest,auxRunProductivityRequest].map(fn=>fn.toString()).join('\n')}\n`;
  // Insert declarations before the generated bundle, but after any current
  // admission guard: declarations have no account/model/runtime side effects.
  text+=helpers;
  const routes='modelsRouter=router({productivityPlan:accountProcedure.input(object({requestId:string$3().uuid(),tabs:array(object({id:string$3().min(1).max(64),title:string$3().max(512),origin:string$3().max(2048)})).min(2).max(128),customPrompt:string$3().max(2000).optional()})).mutation(({ctx,input})=>auxRunProductivityRequest(ctx.accountId,input)),productivityCancel:accountProcedure.input(object({requestId:string$3().uuid()})).mutation(({ctx,input})=>auxCancelProductivityRequest(ctx.accountId,input.requestId)),listSupported:';
  text=replace(text,'modelsRouter=router({listSupported:',routes,anchors,'aux-tidy-account-provider-router');
  anchors.push({kind:'aux-tidy-provider-helpers',append:helpers,count:1});
  return {text,anchors};
}
