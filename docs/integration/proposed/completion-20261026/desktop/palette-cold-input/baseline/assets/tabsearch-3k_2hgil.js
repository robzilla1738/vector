!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a14421-bd0a-0000-3c62-ba3fbe2b6700";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="4ec9f952-5790-5976-9a6b-e41ea5323bb5")}catch(e){}}();import{A as Y,C as X,E as ee,a as te,c as ne,w as re}from"./browser-color-scheme-Df5VSuPV.js";import"./modulepreload-polyfill-CWIbYaaI.js";import{t as se}from"./client-CkJ8L9YQ.js";import{g as auxFilesClient,i as auxFilesAccount,b as oe,l as H}from"./queries-ldd77hNk.js";import{t as K}from"./arrow-up-right-yUWKOHmm.js";import{t as ae}from"./bubbles-rnmJvEMi.js";import{t as ie}from"./history-DY48-T8b.js";import{t as ce}from"./magnifying-glass-CUkQl5u_.js";import{t as V}from"./puzzle-DHXhu4G_.js";import{t as le}from"./window-cursor-ClCFre_a.js";import{n as ue,t as de}from"./scroll-area-DxAxP4Y6.js";import{t as _}from"./extension-page-url-BH3pfT7h.js";import{n as me}from"./date-CxUVm-Dr.js";import{n as he,r as fe,t as pe}from"./avatar-iEt_J7Lk.js";import{n as xe}from"./platform-CX_yPATJ.js";/* empty css                */import{t as R}from"./favicon-Dpszfa2o.js";import{r as be,t as we}from"./empty-D6YJzOw0.js";import{t as ye}from"./kbd-BDAwTCNn.js";var s=re(),ge=({size:e=24,ariaHidden:t=!0,...r})=>(0,s.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",width:e,height:e,"aria-hidden":t,focusable:"false",...r,children:(0,s.jsx)("path",{d:"M9.7002 17.3945C11.0801 16.4247 12.9199 16.4247 14.2998 17.3945L18 19.9951V6C18 4.89542 17.1046 4 16 4H8C6.89543 4 6 4.89543 6 6V19.9951L9.7002 17.3945ZM20 19.9951C19.9998 21.6146 18.1748 22.5623 16.8496 21.6309L13.1504 19.0303C12.4604 18.5453 11.5396 18.5453 10.8496 19.0303L7.15039 21.6309C5.8252 22.5623 4.00024 21.6146 4 19.9951V6C4 3.79087 5.79087 2 8 2H16C18.2092 2 20 3.79088 20 6V19.9951Z",fill:"currentColor"})}),ve=se(),i=Y(ee(),1),ke=2,z=50,Ie=25,Ce=_("");function w(e,t){return e?.trim()||t||"Untitled"}function j(e){const t=(0,me.default)(e);return t.isValid()?t.fromNow():void 0}function S(e){return!!(e&&!e.startsWith("chrome://")&&!e.startsWith("chrome-extension://"))}function W(e){return e.replace(/^https?:\/\//,"").replace(/\/$/,"")}function U(e,t){const r=t.toLowerCase();return[e.title,e.subtitle,e.url,e.searchText].some(a=>a?.toLowerCase().includes(r))}function Se(e){const t=e.url??e.pendingUrl??"";return typeof e.id!="number"||!(S(t)||t.startsWith(Ce))?null:{actionLabel:"Switch to Tab",faviconUrl:e.favIconUrl||R(t),id:`tab:${e.id}`,kind:"open-tab",tabId:e.id,title:w(e.title,t),url:t}}function je(e,t){const r=e.tab??e.window?.tabs?.find(d=>S(d.url??d.pendingUrl)),a=r?.url??r?.pendingUrl??"",l=r?.sessionId??e.window?.sessionId;return S(a)?{actionLabel:"Reopen",faviconUrl:r?.favIconUrl||R(a),id:`closed:${l??a}:${t}`,kind:"recently-closed",restoreSessionId:l,timeLabel:j(e.lastModified*1e3),title:w(r?.title,a),url:a}:null}function Ee(e,t){return{faviconUrl:void 0,id:`recent-chat:${e.id}`,kind:"chat",timeLabel:j(e.updatedAt),title:w(e.title),url:_(`/u/${t}/tasks/${encodeURIComponent(e.id)}`)}}function Re(e,t){return{id:`chat:${e.id}`,kind:"chat",timeLabel:j(e.updatedAt),title:w(e.title),url:_(`/u/${t}/tasks/${encodeURIComponent(e.id)}`)}}function Le(e){if(!e.url||!S(e.url))return null;const t=e.url;return{faviconUrl:R(t),id:`history:${e.id}`,kind:"history",subtitle:W(t),timeLabel:e.lastVisitTime?j(e.lastVisitTime):void 0,title:w(e.title,t),url:t}}function Te(e){if(!e.url||!S(e.url))return null;const t=e.url;return{faviconUrl:R(t),id:`bookmark:${e.id}`,kind:"bookmark",subtitle:W(t),timeLabel:e.dateAdded?j(e.dateAdded):void 0,title:w(e.title,t),url:t}}function Ae(e){return e.enabled&&e.mayDisable&&e.type!=="theme"&&e.type!=="login_screen_extension"&&e.id!==chrome.runtime.id}function Ne(e){if(e?.length)return[...e].sort((t,r)=>t.size-r.size).at(-1)?.url}function Ue(e){return{actionLabel:"Open",extensionId:e.id,faviconUrl:Ne(e.icons),id:`extension:${e.id}`,isApp:e.isApp,kind:"extension",searchText:[e.shortName,e.description].filter(Boolean).join(" "),title:w(e.name)}}async function F(e,t,r={},a){const l=ue(e,t);for(const[c,y]of Object.entries(r))l.searchParams.set(c,String(y));const d=await oe(l,{signal:a});if(!d.ok)throw new Error(`Request failed: ${e}`);return await d.json()}async function _e(){return chrome.tabs?.query?(await chrome.tabs.query({})).map(Se).filter(e=>e!==null):[]}async function ze(){return chrome.sessions?.getRecentlyClosed?(await chrome.sessions.getRecentlyClosed({maxResults:Ie})).map(je).filter(e=>e!==null):[]}async function $e(e){const t=await H();return(await F("/session/for-chrome/recents",t,{},e)).map(r=>Ee(r,t))}async function qe(e,t){const r=await H();return(await F("/session/for-chrome/search",r,{q:e,limit:z},t)).map(a=>Re(a,r))}async function De(e){return chrome.history?.search?(await chrome.history.search({text:e,maxResults:z,startTime:0})).map(Le).filter(t=>t!==null):[]}async function Me(e){return chrome.bookmarks?.search?(await chrome.bookmarks.search(e)).map(Te).filter(t=>t!==null):[]}async function Be(){return chrome.management?.getAll?(await chrome.management.getAll()).filter(Ae).sort((e,t)=>e.name.localeCompare(t.name)).map(Ue):[]}function Pe(e,t){const r=t.trim().length>0,a=r?z:ke,l=r?e.openTabs.filter(c=>U(c,t)):e.openTabs,d=r?e.recentlyClosed.filter(c=>U(c,t)):e.recentlyClosed;return[{id:"extensions",title:"Extensions",items:r?e.extensions.filter(c=>U(c,t)).slice(0,a):[]},{id:"open-tabs",title:"Open Tabs",items:l.slice(0,a)},{id:"recently-closed",title:"Recently Closed",items:d.slice(0,a)},{id:"chat",title:r?"Chat":"Recent Chat",items:(r?e.chatSearch:e.recentChats).slice(0,a)},{id:"bookmarks",title:"Bookmarks",items:r?e.bookmarks.slice(0,a):[]},{id:"history",title:"History",items:r?e.history.slice(0,a):[]}].filter(c=>c.items.length>0)}function Ve(e){return e.flatMap(t=>t.items)}function O(){try{window.close()}catch{return}}function Oe(e){return e.key.toLowerCase()==="a"&&e.shiftKey&&(e.metaKey||e.ctrlKey)}function navigationSections(context, query, sections) {
  if (!context?.success || typeof context.generation !== 'string') return sections;
  const text = query.trim();
  const result = [];
  if (text && context.mode !== 'tabs') {
    result.push({id:'aux-navigation',title:'Navigate',items:[{
      id:'aux-navigate',kind:'aux-navigate',title:text,
      subtitle:context.mode === 'navigate' ? 'Open in current tab' : 'Open in new tab',
      actionLabel:'Open',text,
    }]});
  }
  if ((context.mode === 'new-tab' || context.mode === 'commands') &&
      (!text || 'new blank tab'.includes(text.toLowerCase()))) {
    result.push({id:'aux-new-blank-tab',title:'New tab',items:[{
      id:'aux-new-blank-tab',kind:'aux-new-blank-tab',title:'New blank tab',
      subtitle:'Open a new tab immediately',actionLabel:'Open',
    }]});
  }
  if (context.mode === 'commands') {
    const commands = (context.commands ?? []).filter(command => command.enabled &&
      (!text || `${command.title} ${command.id}`.toLowerCase().includes(text.toLowerCase())))
      .map(command=>({id:`aux-command:${command.id}`,kind:'aux-command',
        title:command.title,subtitle:command.shortcut,commandId:command.commandId,actionLabel:'Run'}));
    if (commands.length) result.unshift({id:'aux-commands',title:'Commands',items:commands});
  }
  const organization=context.organization;
  if(organization?.ownerGeneration&&organization.revision){
    const query=text.toLowerCase(),matches=value=>!query||value.toLowerCase().includes(query);
    const logical=(organization.tabs??[]).filter(tab=>matches(`${tab.title} ${tab.url}`)).slice(0,100)
      .map(tab=>({id:`aux-logical:${tab.id}`,kind:'aux-logical-tab',logicalId:tab.id,
        title:tab.title||tab.url,subtitle:tab.url,
        actionLabel:Number.isInteger(tab.nativeTabId)?'Switch':'Open here'}));
    const spaces=(organization.spaces??[]).filter(space=>matches(space.title))
      .sort((a,b)=>Number(BigInt(a.order??0)-BigInt(b.order??0))).slice(0,100)
      .map(space=>({id:`aux-space:${space.id}`,kind:'aux-space',spaceId:space.id,title:space.title,
        subtitle:space.id===organization.activeSpaceId?'Current Space':'Switch Space',actionLabel:'Switch'}));
    if(logical.length)result.push({id:'aux-logical-tabs',title:'Tabs in this profile',items:logical});
    if(spaces.length&&context.mode!=='navigate')result.push({id:'aux-spaces',title:'Spaces',items:spaces});
    const represented=new Set((organization.tabs??[]).map(tab=>tab.nativeTabId).filter(Number.isInteger));
    const local=new Set(context.windowTabIds??[]);
    sections=sections.map(section=>({...section,items:section.items.filter(item=>item.kind!=='open-tab'||
      local.has(item.tabId)&&!represented.has(item.tabId))})).filter(section=>section.items.length);
  }else if(Array.isArray(context.windowTabIds)){
    const local=new Set(context.windowTabIds);
    sections=sections.map(section=>({...section,items:section.items.filter(item=>item.kind!=='open-tab'||local.has(item.tabId))})).filter(section=>section.items.length);
  }
  return contextActionSections(context,query,askPaletteSections(context,query,[...result,...sections]));
}
async function commitNavigation(api, context, item) {
  if (!context?.success || typeof context.generation !== 'string' ||
      typeof api?.commitCommand !== 'function') throw Error('Command context is unavailable');
  const request = {generation:context.generation};
  if(item.kind==='aux-logical-tab'||item.kind==='aux-space'){
    const org=context.organization;
    if(!org?.ownerGeneration||!org.revision)throw Error('Organization context expired');
    Object.assign(request,{kind:item.kind==='aux-space'?'select-space':'activate-logical-tab',
      id:item.kind==='aux-space'?item.spaceId:item.logicalId,
      organizationOwner:org.ownerGeneration,organizationRevision:org.revision});
  }
  else if (item.kind === 'aux-command') Object.assign(request,{kind:'command',commandId:item.commandId});
  else if (item.kind === 'aux-new-blank-tab') Object.assign(request,{kind:'new-blank-tab'});
  else if (item.kind === 'open-tab') Object.assign(request,{kind:'activate-tab',tabId:item.tabId});
  else Object.assign(request,{kind:'navigate',text:item.text ?? item.url});
  const result = await api.commitCommand(request);
  if (!result?.success) throw Error(result?.error ?? 'Command was not completed');
  return result;
}
function productivitySections(context,receipt) {
  const proposal=context?.organizationProposal;
  if(context?.mode!=='tidy'||!proposal) return null;
  if(receipt) return [{id:'aux-tidy-result',title:receipt.undone?'Changes undone':'Tabs organized',items:receipt.undone?
    [{id:'aux-tidy-close',kind:'aux-tidy-cancel',title:'Done',actionLabel:'Close'}]:
    [{id:'aux-tidy-undo',kind:'aux-tidy-undo',title:'Undo organization',actionLabel:'Undo'},
     {id:'aux-tidy-close',kind:'aux-tidy-cancel',title:'Done',actionLabel:'Close'}]}];
  return [{id:'aux-tidy-actions',title:proposal.scope==='selected-tabs'?'Review selected tab organization':'Review Space organization',items:[
    {id:'aux-tidy-apply',kind:'aux-tidy-apply',title:`Organize ${proposal.moves.length} tabs into ${proposal.createFolders.length} folders`,actionLabel:'Apply'},
    {id:'aux-tidy-cancel',kind:'aux-tidy-cancel',title:'Keep tabs as they are',actionLabel:'Cancel'}]},
    {id:'aux-tidy-preview',title:'Proposed moves',items:proposal.summaryRows.map(row=>({id:`aux-tidy:${row.id}`,kind:'aux-tidy-preview',title:row.title,subtitle:row.folderTitle}))}];
}
async function commitProductivityAction(api,context,receipt,item) {
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
function validDownloadStem(value) {
  if(typeof value!=='string'||!value||value.length>100||value!==value.trim()||value.startsWith('.')||/[\\/:\p{Cc}\p{Cf}]/u.test(value))
    throw Error('Choose a filename without path separators or hidden control characters.');
  return value;
}
function createFileReviewGuard(cancel) {
  let epoch=0,request=null;
  const stop=()=>{
    const previous=request;request=null;
    if(previous)Promise.resolve().then(()=>cancel(previous)).catch(()=>{});
  };
  return {
    begin(){
      stop();const current=++epoch;
      const isCurrent=()=>current===epoch;
      return {isCurrent,setRequest(value){
        if(!isCurrent()){
          if(value)throw Error('This file review changed.');
          return;
        }
        request=value;
      }};
    },
    invalidate(){++epoch;stop()}
  };
}
function filesSections(context,state,query,sections) {
  if(!context?.success)return sections;
  const row=(kind,title,extra={})=>({id:kind,kind,title,...extra});
  if(!state)return context.mode==='commands'?[{id:'aux-file-entry',title:'Files',items:[row('aux-files-open','Recent files',{subtitle:'Downloads and files selected in this profile',actionLabel:'Open'})]},...sections]:sections;
  if(state.view==='list')return [{id:'aux-file-actions',title:'Recent files',items:[row('aux-files-back','Back to commands')]},{id:'aux-files',title:'Recent files',items:(state.files??[]).filter(file=>file.name.toLowerCase().includes(query.toLowerCase())).map(file=>({...row('aux-file-select',file.name,{subtitle:file.available?file.sourceHost:'Moved or unavailable',actionLabel:file.source==='chosen'?'Show':'Rename',file,generation:context.generation}),id:`aux-file:${file.id}`}))},...(state.receipts??[]).map(receipt=>({id:`receipt:${receipt.id}`,title:receipt.phase==='complete'?'Recent rename':'Rename recovery',items:[receipt.phase==='complete'?row('aux-file-undo',`Undo ${receipt.filename}`,{receiptId:receipt.id,actionLabel:'Undo'}):row('aux-file-note',receipt.filename,{subtitle:receipt.phase==='needs-review'?'The file changed; review this download before renaming.':'A previous rename needs recovery.'})]}))];
  if(state.view==='renamed')return [{id:'aux-file-done',title:state.undone?'Name restored':`Renamed to ${state.filename}`,items:[...state.undone?[]:[row('aux-file-undo','Undo rename',{receiptId:state.receiptId,actionLabel:'Undo'})],row('aux-files-open','Back to recent files')]}];
  const prepared=state.prepared;
  return [{id:'aux-file-review',title:`Rename ${prepared.filename}`,items:[row('aux-file-apply',`Use ${query}${prepared.extension??''}`,{actionLabel:'Apply'}),...Number.isInteger(prepared.accountId)?[row('aux-file-suggest','Suggest a name with AI',{subtitle:'Sends filename, file type and source domain to your selected provider',actionLabel:'Suggest'})]:[],row('aux-files-open','Cancel rename'),row('aux-file-drag','Drag original file',{subtitle:'Use the file row to drag to another app',downloadId:prepared.downloadId,actionLabel:'Drag'})]}];
}
async function runFileAction(api,client,account,context,state,query,item,onRequest) {
  const base={generation:context.generation};
  const checked=result=>{if(!result?.success)throw Error(result?.error??'File action is unavailable.');return result};
  if(item.kind==='aux-file-note')return{state};
  if(item.kind==='aux-files-back')return{state:null,text:''};
  if(item.kind==='aux-files-open')return{state:{...checked(await api.listRecentFiles(base)),view:'list'},text:''};
  if(item.kind==='aux-file-select'){
    if(item.file.source==='chosen'){checked(await api.revealRecentFile({...base,downloadId:item.file.id}));return{state};}
    const prepared=checked(await api.prepareDownloadRename({...base,downloadId:item.file.id}));
    return{state:{view:'rename',prepared},text:prepared.filename.slice(0,prepared.extension?-prepared.extension.length:undefined)};
  }
  if(item.kind==='aux-file-undo')return{state:{...checked(await api.undoDownloadRename({...base,receiptId:item.receiptId})),view:'renamed'},text:''};
  if(item.kind==='aux-file-drag'){checked(await api.dragRecentFile({...base,downloadId:item.downloadId}));return{state};}
  if(item.kind==='aux-file-apply')return{state:{...checked(await api.applyDownloadRename({...base,capability:state.prepared.capability,stem:validDownloadStem(query)})),view:'renamed'},text:''};
  if(item.kind==='aux-file-suggest'){
    const prepared=state.prepared,binding=await account();
    if(binding.accountId!==prepared.accountId||!binding.browserProfile?.profileId)throw Error('The active profile changed.');
    const request={accountId:prepared.accountId,profileId:binding.browserProfile.profileId,requestId:crypto.randomUUID()};onRequest(request);
    try{
      const proposal=await client.models.downloadNameProposal.mutate({...request,filename:prepared.filename,mime:prepared.mime,sourceHost:prepared.sourceHost});
      const current=await api.getCommandContext();
      const currentAccount=await account();
      if(!current.success||current.generation!==context.generation||currentAccount.accountId!==prepared.accountId||currentAccount.browserProfile?.profileId!==request.profileId)throw Error('The file review expired.');
      return{state,text:validDownloadStem(proposal.stem)};
    }finally{onRequest(null)}
  }
  throw Error('Unsupported file action.');
}
function mediaSections(context,query,sections) {
 if(context?.mode!=='commands'||!context.pictureInPicture?.available||
    (query.trim()&&!/picture|video|pip/i.test(query)))return sections;
 return [{id:'aux-media',title:'Media',items:[{id:'aux-pip',kind:'aux-pip',title:context.pictureInPicture.active?'Return video to tab':'Picture in picture',actionLabel:'Run'}]},...sections];
}
function developerSections(context,query,sections){
 if(context?.mode!=='commands'||!context.developer?.success)return sections;
 const items=[...(context.developer.captureAvailable?[{id:'aux-developer-capture',kind:'aux-developer-capture',title:'Screenshot',subtitle:'Capture this page or select an area'}]:[]),...(context.developer.devToolsAvailable?[{id:'aux-developer-tools',kind:'aux-developer-tools',title:'Developer tools',subtitle:'Inspect the active page'}]:[]),{id:'aux-developer-extensions',kind:'aux-developer-extensions',title:'Manage extensions',subtitle:context.developer.developerMode?'Developer mode is on — load only extensions you trust':'Chrome-compatible extensions for this profile'}].filter(item=>!query.trim()||`${item.title} ${item.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()));
 return items.length?[{id:'aux-developer',title:'Page tools',items},...sections]:sections;
}
async function runDeveloperCommand(api,tabs,context,item){
 const checked=result=>{if(!result?.success)throw Error(result?.error??'This page action is unavailable.');return result};
 const request={generation:context.generation};
 if(item.kind==='aux-developer-tools'){checked(await api.openDeveloperTools(request));return;}
 if(item.kind==='aux-developer-extensions'){checked(await api.openExtensionManager(request));return;}
 if(item.kind==='aux-developer-capture'){
  const target=checked(await api.getPageCaptureTarget(request));
  if(!Number.isInteger(target.tabId)||!target.documentId)throw Error('The selected page changed.');
  await tabs.sendMessage(target.tabId,{type:'capture:open'},{documentId:target.documentId});return;
 }
 throw Error('Unsupported page action.');
}
function createAuxPaletteInvocation(){let epoch=0,edits=0,generation=null;return{begin(){generation=null;const token=++epoch,start=edits;return{current:()=>epoch===token,unedited:()=>epoch===token&&edits===start,accept(value){if(epoch===token)generation=value}}},invalidate(){++epoch;generation=null},edit(){++edits},allows(value){return generation!==null&&generation===value},capture(unedited=false){const token=epoch,start=edits;return()=>epoch===token&&(!unedited||edits===start)}}}
function Qe(){const auxInvocation=(0,i.useRef)(null);if(!auxInvocation.current)auxInvocation.current=createAuxPaletteInvocation();const[auxFileState,auxSetFileState]=(0,i.useState)(null),auxFileGuard=(0,i.useRef)(null);if(!auxFileGuard.current)auxFileGuard.current=createFileReviewGuard(request=>auxFilesClient.models.downloadNameCancel.mutate(request));(0,i.useEffect)(()=>()=>auxFileGuard.current?.invalidate(),[]);const[auxProductivityReceipt,auxSetProductivityReceipt]=(0,i.useState)(null);const[auxNavContext,auxNavSetContext]=(0,i.useState)(null),[auxNavError,auxNavSetError]=(0,i.useState)(""),auxNavBusy=(0,i.useRef)(false);(0,i.useLayoutEffect)(()=>{let documentId=null,pending=null;const invalidate=()=>{auxInvocation.current.invalidate();auxFileGuard.current.invalidate();auxNavBusy.current=false;auxNavSetContext(null)};const refresh=(reset=true)=>{const attempt=auxInvocation.current.begin();auxFileGuard.current.invalidate();auxNavBusy.current=false;auxNavSetContext(null);auxSetFileState(null);auxSetProductivityReceipt(null);auxNavSetError("");if(reset){t("");a("");E(0)}chrome.auxBrowserPreferences.getCommandContext().then(value=>{if(!attempt.current())return;documentId=value.paletteDocumentId??null;const queued=pending;pending=null;if(queued&&queued.documentId===documentId){if(queued.shown)refresh(false);else invalidate();return}if(!value.success)throw Error(value.error);attempt.accept(value.generation);auxNavSetContext(value);if(value.mode==="navigate"&&(reset||!T.current?.value)&&attempt.unedited()){t(value.activeUrl??"");a(value.activeUrl??"");requestAnimationFrame(()=>{if(attempt.unedited()){T.current?.focus();T.current?.select()}})}}).catch(error=>{if(attempt.current())auxNavSetError(error.message)})};const notify=event=>{if(documentId===null){pending=event;return}if(event.documentId!==documentId)return;if(event.shown)refresh();else invalidate()};chrome.auxBrowserPreferences.onCommandInvocation.addListener(notify);refresh();return()=>{chrome.auxBrowserPreferences.onCommandInvocation.removeListener(notify);invalidate()}},[]);const[e,t]=(0,i.useState)(""),[r,a]=(0,i.useState)(""),[l,d]=(0,i.useState)(0),[c,y]=(0,i.useState)(null),[x,E]=(0,i.useState)(0),[$,b]=(0,i.useState)({bookmarks:[],chatSearch:[],extensions:[],history:[],openTabs:[],recentChats:[],recentlyClosed:[]}),L=(0,i.useRef)(null),g=(0,i.useRef)(0),q=(0,i.useRef)(Promise.resolve()),k=(0,i.useRef)(0),T=(0,i.useRef)(null),D=(0,i.useRef)(null),I=(0,i.useMemo)(()=>productivitySections(auxNavContext,auxProductivityReceipt)??filesSections(auxNavContext,auxFileState,r,developerSections(auxNavContext,r,mediaSections(auxNavContext,r,navigationSections(auxNavContext,r,Pe($,r))))),[r,$,auxNavContext,auxProductivityReceipt,auxFileState]),h=(0,i.useMemo)(()=>Ve(I),[I]),M=(0,i.useCallback)(()=>{const current=auxInvocation.current.capture(true);requestAnimationFrame(()=>{if(current()){T.current?.focus();T.current?.select()}})},[]),B=(0,i.useCallback)(()=>{const n=++g.current;L.current?.abort();const o=new AbortController;L.current=o;const m=_e().then(p=>{g.current===n&&b(u=>({...u,openTabs:p}))}).catch(()=>{}),f=ze().then(p=>{g.current===n&&b(u=>({...u,recentlyClosed:p}))}).catch(()=>{}),v=$e(o.signal).then(p=>{g.current===n&&b(u=>({...u,recentChats:p}))}).catch(()=>{}),N=Be().then(p=>{g.current===n&&b(u=>({...u,extensions:p}))}).catch(()=>{});q.current=Promise.all([m,f,v,N])},[]),A=(0,i.useCallback)(async n=>{if(auxNavBusy.current||!auxInvocation.current.allows(auxNavContext?.generation))return;const auxActionCurrent=auxInvocation.current.capture();auxNavBusy.current=true;auxNavSetError("");let auxNavSuccess=false;try{if(n.kind==="aux-context-action"){await commitContextAction(chrome.auxBrowserPreferences,auxFilesClient,auxFilesAccount,auxNavContext,n);auxNavSuccess=true;return}if(n.kind==="aux-ask-query"){await commitPaletteAsk(chrome.auxBrowserPreferences,auxNavContext,n);auxNavSuccess=true;return}if(n.kind?.startsWith("aux-developer-")){await runDeveloperCommand(chrome.auxBrowserPreferences,chrome.tabs,auxNavContext,n);auxNavSuccess=true;return}if(n.kind==="aux-pip"){const result=await chrome.auxBrowserPreferences.togglePictureInPicture({generation:auxNavContext.generation});if(!result.success)throw Error(result.error);auxNavSuccess=true;return}if(n.kind?.startsWith("aux-file")){const action=auxFileGuard.current.begin();try{const result=await runFileAction(chrome.auxBrowserPreferences,auxFilesClient,auxFilesAccount,auxNavContext,auxFileState,r,n,action.setRequest);if(!action.isCurrent())return;auxSetFileState(result.state);if(result.text!==undefined){t(result.text);a(result.text);requestAnimationFrame(()=>{if(action.isCurrent()){T.current?.focus();T.current?.select()}})}}catch(error){if(action.isCurrent())throw error}return}if(n.kind?.startsWith("aux-tidy-")){const result=await commitProductivityAction(chrome.auxBrowserPreferences,auxNavContext,auxProductivityReceipt,n);if(!auxActionCurrent())return;if(result.receipt)auxSetProductivityReceipt(result.receipt);auxNavSuccess=!!result.close;return}if(n.kind==="aux-logical-tab"||n.kind==="aux-space"||n.kind==="aux-navigate"||n.kind==="aux-command"||n.kind==="aux-new-blank-tab"||n.kind==="open-tab"||n.url&&n.kind!=="extension"&&n.kind!=="recently-closed"){await commitNavigation(chrome.auxBrowserPreferences,auxNavContext,n);auxNavSuccess=true;return}const auxLive=await chrome.auxBrowserPreferences.getCommandContext();if(!auxActionCurrent())return;if(!auxLive.success||auxLive.generation!==auxNavContext?.generation)throw Error("Command context expired; reopen the command bar");const o=n.kind==="chat"?n.url:void 0,m=o?(await chrome.tabs.query({})).find(f=>[f.url,f.pendingUrl].some(v=>v?.startsWith(o)&&/^([/?]|$)/.test(v.slice(o.length))))?.id:n.tabId;if(!auxActionCurrent())return;if(m!==void 0){const f=await chrome.tabs.get(m);if(!auxActionCurrent())return;typeof f.windowId=="number"&&await Promise.all([chrome.tabs.update(m,{active:!0}),chrome.windows.update(f.windowId,{focused:!0})]);return}if(n.kind==="recently-closed"){n.restoreSessionId&&chrome.sessions?.restore&&await chrome.sessions.restore(n.restoreSessionId);auxNavSuccess=true;return}if(n.kind==="extension"&&n.extensionId){if(n.isApp&&chrome.management?.launchApp){await chrome.management.launchApp(n.extensionId);auxNavSuccess=true;return}if(chrome.management?.launchExtension){await chrome.management.launchExtension(n.extensionId);auxNavSuccess=true;return}await chrome.tabs.create({url:`chrome-extension://${n.extensionId}/popup.html`});auxNavSuccess=true;return}n.url&&await chrome.tabs.create({url:n.url});auxNavSuccess=true}catch(error){if(auxActionCurrent())auxNavSetError(error instanceof Error?error.message:String(error))}finally{if(auxActionCurrent()){auxNavBusy.current=false;if(auxNavSuccess)O()}}},[auxNavContext,auxProductivityReceipt,auxFileState,r]);(0,i.useEffect)(()=>{const n=()=>{document.visibilityState!=="hidden"&&(M(),B(),ne({disableTransitionOnChange:!0}).catch(()=>{}),d(m=>m+1))},o=()=>{document.visibilityState==="visible"&&n()};return n(),window.addEventListener("focus",n),window.addEventListener("pageshow",n),document.addEventListener("visibilitychange",o),()=>{window.removeEventListener("focus",n),window.removeEventListener("pageshow",n),document.removeEventListener("visibilitychange",o),g.current+=1,L.current?.abort()}},[M,B]),(0,i.useEffect)(()=>{const n=o=>{Oe(o)&&(o.preventDefault(),o.stopPropagation(),O())};return window.addEventListener("keydown",n,{capture:!0}),()=>{window.removeEventListener("keydown",n,{capture:!0})}},[]),(0,i.useEffect)(()=>{const n=r.trim(),o=++k.current,m=new AbortController;if(y(null),!n)return()=>m.abort();const f=setTimeout(()=>{const v=qe(n,m.signal).then(u=>{k.current===o&&b(C=>({...C,chatSearch:u}))}).catch(()=>{}),N=De(n).then(u=>{k.current===o&&b(C=>({...C,history:u}))}).catch(()=>{}),p=Me(n).then(u=>{k.current===o&&b(C=>({...C,bookmarks:u}))}).catch(()=>{});Promise.all([v,N,p,q.current]).then(()=>{k.current===o&&y({query:r,revision:l})})},80);return()=>{clearTimeout(f),m.abort()}},[l,r]),(0,i.useEffect)(()=>{E(n=>h.length===0?-1:n<0?0:Math.min(n,h.length-1))},[h.length]),(0,i.useEffect)(()=>{x<0||D.current?.querySelector('[data-selected="true"]')?.scrollIntoView({block:"nearest"})},[x]);const Z=(0,i.useCallback)(n=>{if(!n.nativeEvent.isComposing){if(n.key==="ArrowDown"||n.key==="ArrowUp"){if(n.preventDefault(),h.length===0)return;E(o=>(o+(n.key==="ArrowDown"?1:-1)+h.length)%h.length);return}if(n.key==="Enter"){n.preventDefault();const o=h[x];o&&A(o)}}},[A,h,x]),P=n=>{a(n),E(0)},G=n=>{auxInvocation.current.edit();const o=n.currentTarget.value;t(o),(!(n.nativeEvent instanceof InputEvent)||!n.nativeEvent.isComposing)&&P(o)},J=c?.query===r&&c.revision===l;return(0,s.jsxs)("main",{className:"text-surface-primary-foreground flex h-85 w-full flex-col overflow-hidden",children:[(0,s.jsxs)("div",{className:"flex h-11 min-h-11 items-center gap-2.5 px-3",children:[(0,s.jsx)(ce,{className:"text-muted-foreground size-4.5 shrink-0"}),(0,s.jsx)("input",{ref:T,value:e,className:"placeholder:text-muted-foreground h-full min-w-0 grow bg-transparent text-base tracking-tight outline-none",readOnly:auxNavContext?.mode==="tidy",placeholder:auxFileState?.view==="rename"?"Filename without extension":auxFileState?.view==="list"?"Search recent files":auxNavContext?.mode==="tidy"?"Review tab organization":auxNavContext?.mode==="commands"?"Search commands, tabs or enter a URL":auxNavContext?.mode==="new-tab"||auxNavContext?.mode==="navigate"?"Search or type a URL":"Search tabs, chats, history, bookmarks or extensions",onChange:G,onCompositionEnd:n=>P(n.currentTarget.value),onKeyDown:Z}),(0,s.jsx)(ye,{children:xe(auxNavContext?.mode==="new-tab"?"Meta+T":auxNavContext?.mode==="navigate"?"Meta+L":auxNavContext?.mode==="commands"?"Meta+K":"Meta+Shift+A")})]}),(0,s.jsxs)(de,{ref:D,className:"min-h-0 grow overflow-hidden px-2 py-1",children:[I.length>0?I.map(n=>(0,s.jsx)(He,{items:n.items,selectedIndex:x,section:n,onActivate:A,onSelect:E,startIndex:h.findIndex(o=>o.id===n.items[0]?.id)},n.id)):null,auxNavError?(0,s.jsx)(we,{children:(0,s.jsx)(be,{role:"alert",children:auxNavError})}):I.length===0&&J?(0,s.jsx)(we,{children:(0,s.jsx)(be,{children:"No results"})}):null]})]})}var He=({items:e,onActivate:t,onSelect:r,section:a,selectedIndex:l,startIndex:d})=>(0,s.jsxs)("section",{className:"pt-2 first:pt-1",children:[(0,s.jsx)("h2",{className:"text-muted-foreground px-2 py-1.5 text-xs font-semibold",children:a.title}),(0,s.jsx)("ul",{className:"space-y-0.5",children:e.map((c,y)=>{const x=d+y;return(0,s.jsx)(Ke,{item:c,selected:l===x,onClick:()=>{t(c)},onPointerEnter:()=>r(x),onDragStart:()=>t({...c,kind:"aux-file-drag",downloadId:c.file.id})},c.id)})})]}),Ke=({item:e,onClick:t,onPointerEnter:r,selected:a,onDragStart:d})=>(0,s.jsxs)("li",{className:X("flex h-8 cursor-default items-center gap-2 rounded-lg px-2 text-sm leading-5 font-medium select-none",a&&"bg-secondary"),"data-selected":a,onClick:t,onPointerEnter:r,draggable:e.kind==="aux-file-select"&&e.file.available,onDragStart:event=>{event.preventDefault();d?.()},children:[(0,s.jsx)(We,{item:e}),(0,s.jsxs)("div",{className:"flex min-w-0 flex-1 items-baseline gap-2",children:[(0,s.jsx)("span",{className:"truncate",children:e.title}),e.subtitle?(0,s.jsx)("span",{className:"text-muted-foreground min-w-0 truncate text-xs",children:e.subtitle}):null]}),e.actionLabel?(0,s.jsxs)("div",{className:"text-muted-foreground flex shrink-0 items-center gap-2 text-xs font-medium",children:[(0,s.jsx)("span",{children:e.actionLabel}),(0,s.jsx)(K,{className:"size-3.5"})]}):e.timeLabel?(0,s.jsx)("span",{className:"text-muted-foreground shrink-0 text-xs",children:e.timeLabel}):null]});function We({item:e}){return e.kind==="chat"?(0,s.jsx)("div",{className:"pointer-events-none flex size-4.5 shrink-0 items-center justify-center select-none",draggable:!1,children:(0,s.jsx)(ae,{className:"text-muted-foreground size-4"})}):e.kind==="extension"&&!e.faviconUrl?(0,s.jsx)("div",{className:"pointer-events-none flex size-4.5 shrink-0 items-center justify-center select-none",draggable:!1,children:(0,s.jsx)(V,{className:"text-muted-foreground size-4"})}):(0,s.jsxs)(pe,{className:"text-muted-foreground pointer-events-none size-4.5 shrink-0 rounded-sm bg-transparent select-none",draggable:!1,children:[e.faviconUrl?(0,s.jsx)(fe,{draggable:!1,src:e.faviconUrl}):null,(0,s.jsx)(he,{className:"bg-transparent",children:e.kind==="open-tab"?(0,s.jsx)(le,{className:"size-4"}):e.kind==="history"?(0,s.jsx)(ie,{className:"size-4"}):e.kind==="bookmark"?(0,s.jsx)(ge,{className:"size-4"}):e.kind==="extension"?(0,s.jsx)(V,{className:"size-4"}):(0,s.jsx)(K,{className:"size-4"})})]})}te();var Q=document.getElementById("root");if(Q){const e=window;e.tabSearchRoot??=(0,ve.createRoot)(Q),e.tabSearchRoot.render((0,s.jsx)(Qe,{}))}

//# chunkId=4ec9f952-5790-5976-9a6b-e41ea5323bb5
function askPaletteSections(context,query,sections) {
  if(!context?.success||!['commands','new-tab','navigate'].includes(context.mode)||
      typeof query!=='string'||!query.trim()||query.length>32768||
      !context.commands?.some(command=>command.id==='ask-aux'&&command.enabled))return sections;
  return [...sections,{id:'aux-ask-query',title:'Ask',items:[{
    id:'aux-ask-query',kind:'aux-ask-query',title:'Open Ask composer',
    subtitle:query,text:query,actionLabel:'Review'}]}];
}
async function commitPaletteAsk(api,context,item) {
  if(!context?.success||typeof context.generation!=='string'||
      item?.kind!=='aux-ask-query'||typeof item.text!=='string'||!item.text.trim()||
      item.text.length>32768)throw Error('Ask context expired; reopen the command bar.');
  const result=await api.commitCommand({kind:'ask',generation:context.generation,text:item.text});
  if(!result?.success)throw Error(result?.error??'Could not open the Ask composer.');
  return result;
}

function contextActionSections(context,query,sections) {
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
async function commitContextAction(api,client,account,context,item) {
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
