// Count-checked adaptations of the supplied command/search and Settings owners.
// No generated bundle is an authoring input; callers supply the pinned source.
export const NAVIGATION_ASSETS = Object.freeze({
  search: 'assets/tabsearch-3k_2hgil.js',
  shortcuts: 'assets/use-shortcut-capture-DGr8Ws5Z.js',
  appearance: 'assets/appearance-Ceuw3-j6.js',
});

export function navigationSections(context, query, sections) {
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
  return [...result,...sections];
}

export async function commitNavigation(api, context, item) {
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
  else if (item.kind === 'open-tab') Object.assign(request,{kind:'activate-tab',tabId:item.tabId});
  else Object.assign(request,{kind:'navigate',text:item.text ?? item.url});
  const result = await api.commitCommand(request);
  if (!result?.success) throw Error(result?.error ?? 'Command was not completed');
  return result;
}

function replace(text, find, replacement, anchors, kind) {
  const count = text.split(find).length - 1;
  if (count !== 1) throw Error(`${kind}: expected one pinned anchor, got ${count}`);
  anchors.push({kind,find,replace:replacement,count:1});
  return text.replace(find,replacement);
}
const shortcuts = [
  ['newTab',34014,'New tab','Open the centered URL and search bar.','T'],
  ['navigate',39001,'Open URL','Edit the current tab URL.','L'],
  ['commands',39002,'Commands','Find and run browser commands.','K'],
  ['closeTab',34015,'Close tab','Close the current tab.','W'],
  ['restoreTab',34028,'Reopen closed tab','Restore the last closed tab.','Shift+T'],
  ['reload',33002,'Reload','Reload the current page.','R'],
  ['reloadWithoutCache',33007,'Reload without cache','Reload without cached resources.','Shift+R'],
  ['back',33000,'Back','Go back in this tab.','Left'],
  ['forward',33001,'Forward','Go forward in this tab.','Right'],
  ['downloads',40012,'Downloads','Open downloads.','Shift+J'],
  ['developerTools',40004,'Developer tools','Inspect the current page.','Alt+I'],
  ['viewSource',35002,'View source','View the current page source.','Alt+U'],
];
export function transformAuxNavigation({relative,text}) {
  const anchors=[];
  const change=(find,replacement,kind)=>{text=replace(text,find,replacement,anchors,kind);};
  if (relative === NAVIGATION_ASSETS.search) {
    change('function Qe(){const[e,t]=',
      `${navigationSections.toString()}\n${commitNavigation.toString()}\nfunction Qe(){const[auxNavContext,auxNavSetContext]=(0,i.useState)(null),[auxNavError,auxNavSetError]=(0,i.useState)(""),auxNavBusy=(0,i.useRef)(false);(0,i.useEffect)(()=>{let live=true;chrome.auxBrowserPreferences.getCommandContext().then(value=>{if(!live)return;if(!value.success)throw Error(value.error);auxNavSetContext(value);if(value.mode==="navigate"){t(value.activeUrl??"");a(value.activeUrl??"");requestAnimationFrame(()=>{T.current?.focus();T.current?.select()})}}).catch(error=>{if(live)auxNavSetError(error.message)});return()=>{live=false}},[]);const[e,t]=`,
      'aux-navigation-state');
    change('I=(0,i.useMemo)(()=>Pe($,r),[r,$])',
      'I=(0,i.useMemo)(()=>navigationSections(auxNavContext,r,Pe($,r)),[r,$,auxNavContext])','aux-navigation-results');
    const begin='A=(0,i.useCallback)(async n=>{try{';
    change(begin,'A=(0,i.useCallback)(async n=>{if(auxNavBusy.current)return;auxNavBusy.current=true;auxNavSetError("");let auxNavSuccess=false;try{if(n.kind==="aux-logical-tab"||n.kind==="aux-space"||n.kind==="aux-navigate"||n.kind==="aux-command"||n.kind==="open-tab"||n.url&&n.kind!=="extension"&&n.kind!=="recently-closed"){await commitNavigation(chrome.auxBrowserPreferences,auxNavContext,n);auxNavSuccess=true;return}const auxLive=await chrome.auxBrowserPreferences.getCommandContext();if(!auxLive.success||auxLive.generation!==auxNavContext?.generation)throw Error("Command context expired; reopen the command bar");','aux-navigation-activation');
    change('}finally{O()}},[]);(0,i.useEffect)',
      ';auxNavSuccess=true}catch(error){auxNavSetError(error instanceof Error?error.message:String(error))}finally{auxNavBusy.current=false;if(auxNavSuccess)O()}},[auxNavContext]);(0,i.useEffect)', 'aux-navigation-errors');
    change('await chrome.sessions.restore(n.restoreSessionId);return}', 'await chrome.sessions.restore(n.restoreSessionId);auxNavSuccess=true;return}', 'aux-navigation-restored-close');
    change('await chrome.management.launchApp(n.extensionId);return}', 'await chrome.management.launchApp(n.extensionId);auxNavSuccess=true;return}', 'aux-navigation-app-close');
    change('await chrome.management.launchExtension(n.extensionId);return}', 'await chrome.management.launchExtension(n.extensionId);auxNavSuccess=true;return}', 'aux-navigation-extension-close');
    change('await chrome.tabs.create({url:`chrome-extension://${n.extensionId}/popup.html`});return}', 'await chrome.tabs.create({url:`chrome-extension://${n.extensionId}/popup.html`});auxNavSuccess=true;return}', 'aux-navigation-extension-fallback-close');
    change('placeholder:"Search tabs, chats, history, bookmarks or extensions"',
      'placeholder:auxNavContext?.mode==="commands"?"Search commands, tabs or enter a URL":auxNavContext?.mode==="new-tab"||auxNavContext?.mode==="navigate"?"Search or type a URL":"Search tabs, chats, history, bookmarks or extensions"','aux-navigation-placeholder');
    change('children:xe("Meta+Shift+A")','children:xe(auxNavContext?.mode==="new-tab"?"Meta+T":auxNavContext?.mode==="navigate"?"Meta+L":auxNavContext?.mode==="commands"?"Meta+K":"Meta+Shift+A")','aux-navigation-hint');
    change('I.length===0&&J?(0,s.jsx)(we,{children:(0,s.jsx)(be,{children:"No results"})}):null',
      'auxNavError?(0,s.jsx)(we,{children:(0,s.jsx)(be,{role:"alert",children:auxNavError})}):I.length===0&&J?(0,s.jsx)(we,{children:(0,s.jsx)(be,{children:"No results"})}):null','aux-navigation-error-row');
  }
  if (relative === NAVIGATION_ASSETS.shortcuts) {
    const rows=shortcuts.map(([key,commandId,title,description,keybinding])=>`${key}:${JSON.stringify({commandId,title,description,key:keybinding})},`).join('');
    change('p={toggleSidebar:',`p={${rows}toggleSidebar:`,'aux-navigation-shortcut-catalog');
  }
  if (relative === NAVIGATION_ASSETS.appearance) {
    const component=`const AuxFullUrlSetting=()=>{const client=f(),key=["browserPreferences","alwaysShowFullUrl"],available=typeof u()?.getAlwaysShowFullUrl==="function";const value=m({queryKey:key,queryFn:()=>u().getAlwaysShowFullUrl(),enabled:available});const mutation=x({mutationFn:async next=>{await u().setAlwaysShowFullUrl(next);return next},onSuccess:next=>client.setQueryData(key,next),onError:error=>w.error(error instanceof Error?error.message:"Could not update URL display.")});return(0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:"Always show full URL",description:"Show the complete address in the URL bar."}),(0,e.jsx)(p,{children:(0,e.jsx)(ze,{checked:value.data??false,disabled:!available||value.data===undefined||mutation.isPending,onCheckedChange:next=>mutation.mutate(next)})})]})};`;
    change('Za=()=>(0,e.jsxs)',`Za=()=>(0,e.jsxs)`,'aux-navigation-appearance-anchor');
    // A separate declaration avoids altering minified declaration-chain binding.
    change('export{la as a,',`${component}export{la as a,`,'aux-navigation-full-url-component');
    change('(0,e.jsx)(xa,{}),(0,e.jsx)(ha,{})','(0,e.jsx)(xa,{}),(0,e.jsx)(AuxFullUrlSetting,{}),(0,e.jsx)(ha,{})','aux-navigation-full-url-setting');
  }
  return {text,anchors};
}
