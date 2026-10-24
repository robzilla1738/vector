// Inactive follow-on to transformAuxProductivityUi; native chooses scope IDs.
export function assertNativeTidyScope(snapshot) {
  if(!snapshot?.success||typeof snapshot.scopeToken!=='string'||!snapshot.scopeToken||
     !['current-space','selected-tabs'].includes(snapshot.scope))
    throw Error(snapshot?.error??'Choose Current Space or Selected tabs from Tidy first.');
}
export function transformAuxTidySelection({relative,text}) {
  const anchors=[];
  const change=(find,replace,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one pinned anchor, got ${count}`);anchors.push({kind,find,replace,count:1});text=text.replace(find,replace)};
  if(relative==='background.js') {
    change('async function Yw(){if(auxTidyInFlight)return auxTidyInFlight;',
      'async function Yw(e={}){if(typeof e.scopeToken!=="string"||!e.scopeToken)throw Error("Choose a Tidy scope first.");if(auxTidyInFlight)throw Error("Another Tidy request is still finishing; try again shortly.");','aux-tidy-native-scope-request');
    change('snapshot:()=>chrome.auxBrowserPreferences.getOrganizationSnapshot(),',
      'snapshot:()=>chrome.auxBrowserPreferences.getOrganizationSnapshot({scopeToken:e.scopeToken}),','aux-tidy-native-scope-snapshot');
    change('return Yw().then((n) => {','return Yw({scopeToken:e.scopeToken}).then((n) => {','aux-tidy-native-message-scope');
    change('const snapshot=await deps.snapshot(),tabs=eligibleTidyTabs(snapshot);',
      'const snapshot=await deps.snapshot();assertNativeTidyScope(snapshot);const tabs=eligibleTidyTabs(snapshot);','aux-tidy-scope-producer');
    change('next.windowId===snapshot.windowId&&next.accountId===snapshot.accountId;',
      'next.windowId===snapshot.windowId&&next.accountId===snapshot.accountId&&next.scopeToken===snapshot.scopeToken&&next.scope===snapshot.scope;','aux-tidy-scope-cancellation-fence');
    change("if(tabs.length<2) throw Error('Open at least two unpinned tabs in this Space to tidy.');",
      "if(tabs.length<2) throw Error(snapshot.scope==='selected-tabs'?'Select at least two eligible unpinned tabs in this Space to tidy.':'Open at least two unpinned tabs in this Space to tidy.');",'aux-tidy-selection-empty-error');
    change('expectedRevision:snapshot.revision,spaceId:snapshot.spaceId,windowId:snapshot.windowId,accountId:snapshot.accountId,',
      'scopeToken:snapshot.scopeToken,scope:snapshot.scope,expectedRevision:snapshot.revision,spaceId:snapshot.spaceId,windowId:snapshot.windowId,accountId:snapshot.accountId,','aux-tidy-retained-scope-proof');
    const append='\n'+assertNativeTidyScope.toString()+'\n';text+=append;anchors.push({kind:'aux-tidy-scope-helper',append,count:1});
  }
  if(relative==='assets/tabsearch-3k_2hgil.js') {
    change("title:'Review tab organization'","title:proposal.scope==='selected-tabs'?'Review selected tab organization':'Review Space organization'",'aux-tidy-review-scope-label');
  }
  return{text,anchors};
}
