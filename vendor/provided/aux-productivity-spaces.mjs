// Additive, inactive adapter. Compose after transformAuxTabContext.
export async function loadMentionSpaces(api,accountId,currentAccount) {
  if(typeof api?.getTabMentionSpaces!=='function')throw Error('Space context is unavailable.');
  const snapshot=await api.getTabMentionSpaces();
  if(!snapshot?.success)throw Error(snapshot?.error??'Space context is unavailable.');
  if(!Number.isSafeInteger(accountId)||snapshot.accountId!==accountId||currentAccount()!==accountId)
    throw Error('Profile changed; open the mention menu again.');
  if(typeof snapshot.ownerGeneration!=='string'||typeof snapshot.revision!=='string'||!Array.isArray(snapshot.spaces)||!Array.isArray(snapshot.tabs))
    throw Error('Invalid Space context.');
  return snapshot;
}
export function addMentionSpaces(items,snapshot) {
  if(!snapshot)return items;
  const views=new Map(snapshot.tabs.map(tab=>[tab.targetId,tab]));
  const result=items.map(item=>{
    const view=item.type==='tab'?views.get(item.targetId):null;
    if(!view||view.url!==item.url)return item;
    return {...item,logicalId:view.id,spaceId:view.spaceId,spaceLabel:view.spaceLabel,
      description:[view.spaceLabel,item.description].filter(Boolean).join(' · '),
      keywords:[...(item.keywords??[]),view.spaceLabel]};
  });
  for(const space of [...snapshot.spaces].sort((a,b)=>Number(a.order)-Number(b.order))) {
    const tabs=snapshot.tabs.filter(tab=>tab.spaceId===space.id).map(tab=>({
      id:`tab:${tab.targetId}`,logicalId:tab.id,spaceId:space.id,spaceLabel:space.title,
      name:tab.title||tab.url,targetId:tab.targetId,url:tab.url,source:'open-tabs',type:'tab'}));
    result.push({id:`aux-space:${space.id}`,type:'tab-group',name:space.title,
      groupLabel:'Spaces',source:'aux-spaces',keywords:[space.title,...tabs.map(tab=>tab.name)],
      description:`Attach ${tabs.length} open ${tabs.length===1?'tab':'tabs'}${space.unloaded?` · ${space.unloaded} unloaded`:''}`,
      tabs,auxSpace:{spaceId:space.id,ownerGeneration:snapshot.ownerGeneration,revision:snapshot.revision}});
  }
  return result;
}
export async function captureMentionSpace(api,item,candidates,capture) {
  if(!item.auxSpace)return capture(api,candidates);
  if(!candidates.length)throw Error('This Space has no open pages. Open the tabs you want, then attach the Space again.');
  if(candidates.length>64)throw Error('Choose individual tabs; a Space attachment can contain at most 64 open pages.');
  if(typeof api?.captureTabMentionSpace!=='function')throw Error('Space context is unavailable.');
  const references=candidates.map(({targetId,url})=>({targetId,url}));
  const response=await api.captureTabMentionSpace({...item.auxSpace,references});
  if(!response?.success||!Array.isArray(response.references)||response.references.length!==candidates.length)
    throw Error(response?.error??'Space context changed; select it again.');
  return candidates.map((candidate,index)=>{
    const reference=response.references[index];
    if(reference.targetId!==candidate.targetId||reference.url!==candidate.url||typeof reference.documentCapability!=='string'||!reference.documentCapability)
      throw Error('Space context changed; select it again.');
    return {...candidate,documentCapability:reference.documentCapability};
  });
}
export function transformAuxMentionSpaces({relative,text}) {
  const anchors=[];
  if(relative!=='assets/provider-Cw0zhujt.js')return{text,anchors};
  const change=(find,replace,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one pinned anchor, got ${count}`);anchors.push({kind,find,replace,count:1});text=text.replace(find,replace)};
  change('const s=await co(n.mention.openTabsCache,n.mention.tabMentionState.accountId);return jt(t,s,',
    'const auxMentionAccount=n.mention.tabMentionState.accountId,s=await co(n.mention.openTabsCache,auxMentionAccount);try{s.auxSpaceSnapshot=await loadMentionSpaces(chrome.auxBrowserPreferences,auxMentionAccount,()=>n.mention.tabMentionState.accountId)}catch(error){return{items:[],error:error instanceof Error?error.message:"Space context is unavailable."}}return jt(t,s,','aux-mention-space-loader');
  change('i.push(...n.items);const m=new Set,u=i.map(',
    'i.push(...n.items);const m=new Set,u=addMentionSpaces(i,t.auxSpaceSnapshot).map(','aux-mention-space-supplied-ranking');
  change('C=await captureTabCandidates(chrome.auxBrowserPreferences,auxCandidates);',
    'C=await captureMentionSpace(chrome.auxBrowserPreferences,h,auxCandidates,captureTabCandidates);','aux-mention-space-native-selection');
  const append='\n'+[loadMentionSpaces,addMentionSpaces,captureMentionSpace].map(fn=>fn.toString()).join('\n')+'\n';
  text+=append;anchors.push({kind:'aux-mention-space-helpers',append,count:1});
  return{text,anchors};
}
