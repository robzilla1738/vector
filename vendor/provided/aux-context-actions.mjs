export function contextActionSections(context,query,sections) {
  if(!context?.success||!['commands','new-tab','navigate'].includes(context.mode)||
      !context.commands?.some(item=>item.id==='ask-aux'&&item.enabled))return sections;
  const state=context.contextActions,items=[],text=typeof query==='string'?query.trim():'';
  if(text.length>32768)return sections;
  const add=(action,title,subtitle)=>items.push({id:`aux-context-${action}`,kind:'aux-context-action',action,title,subtitle,text,actionLabel:action==='summarize-page'?'Summarize':'Ask'});
  if(text&&state?.pageAvailable)add('ask-page','Ask current page',text);
  if(text&&state?.selectedAvailable&&state.selectedCount>0)add('ask-selected-tabs',`Ask selected tabs (${state.selectedCount})`,text);
  if(state?.pageAvailable&&(!text||/summari[sz]|page/i.test(text)))add('summarize-page','Summarize current page','Start a chat with this page attached');
  return items.length?[...sections,{id:'aux-context-actions',title:'Page context',items}]:sections;
}
export async function commitContextAction(api,client,account,context,item) {
  if(!context?.success||typeof context.generation!=='string'||item?.kind!=='aux-context-action'||
      !['ask-page','ask-selected-tabs','summarize-page'].includes(item.action))throw Error('Page action expired; reopen the command bar.');
  const prepared=await api.commitCommand({kind:'context-ask',generation:context.generation,action:item.action,text:item.text});
  const requireReceipt=value=>{
    if(!value?.success||typeof value.token!=='string'||!Number.isSafeInteger(value.accountId)||value.accountId<0||
        !value.profileId||!value.ownerGeneration||!Number.isInteger(value.windowId)||!value.originTargetId||
        typeof value.query!=='string'||!value.query.trim()||!Array.isArray(value.references)||
        !value.references.length||value.references.length>64||value.references.some(ref=>!ref.targetId||!ref.url||!ref.documentCapability))
      throw Error(value?.error??'The original page context could not be retained. Reopen the command bar.');
    return value;
  };
  requireReceipt(prepared);
  const binding=await account();
  if(binding?.accountId!==prepared.accountId||binding.browserProfile?.profileId!==prepared.profileId||
      (binding.browserProfile.chromiumProfileId&&binding.browserProfile.chromiumProfileId!==prepared.profileId))
    throw Error('The original profile changed. Reopen the command bar.');
  // Native rechecks the retained documents, native selection, profile epoch and
  // original window immediately before the original session mutation. No await
  // occurs between this authorization and dispatch to the supplied client.
  const receipt=requireReceipt(await api.commitCommand({kind:'context-ask-authorize',generation:context.generation,token:prepared.token}));
  if(JSON.stringify(receipt)!==JSON.stringify(prepared))throw Error('Page context changed before submission.');
  const now=Date.now();
  const session=await client.sessions.createAndPrompt.mutate({accountId:receipt.accountId,
    trigger:{type:'user',source:'remix'},activeTabTargetId:receipt.originTargetId,
    browserBinding:{profileId:receipt.profileId,browserMode:'default',windowId:receipt.windowId,anchorTargetId:receipt.originTargetId},
    message:[{role:'user-message-metadata',timestamp:now-1,attachments:receipt.references.map(ref=>({
      id:`tab:${ref.targetId}`,type:'tab',targetId:ref.targetId,url:ref.url,name:ref.name||ref.url,documentCapability:ref.documentCapability
    }))},{role:'user',content:receipt.query,timestamp:now}]});
  if(typeof session?.id!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(session.id))throw Error('The session response was unavailable. Check chat history before retrying.');
  const opened=await api.commitCommand({kind:'context-ask-open',generation:context.generation,token:receipt.token,sessionId:session.id});
  if(!opened?.success)throw Error(`Chat created, but its original page or window changed. Open it from chat history. ${opened?.error??''}`.trim());
  return opened;
}
export function transformAuxContextActions({relative,text}) {
  const anchors=[];if(relative!=='assets/tabsearch-3k_2hgil.js')return{text,anchors};
  const change=(find,replace,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({kind,find,replace,count:1});text=text.replace(find,replace)};
  change('return askPaletteSections(context,query,[...result,...sections]);','return contextActionSections(context,query,askPaletteSections(context,query,[...result,...sections]));','aux-context-action-rows');
  change('let auxNavSuccess=false;try{','let auxNavSuccess=false;try{if(n.kind==="aux-context-action"){await commitContextAction(chrome.auxBrowserPreferences,auxFilesClient,auxFilesAccount,auxNavContext,n);auxNavSuccess=true;return}','aux-context-action-dispatch');
  const append='\n'+[contextActionSections,commitContextAction].map(fn=>fn.toString()).join('\n')+'\n';text+=append;anchors.push({kind:'aux-context-action-helpers',append,count:1});return{text,anchors};
}
