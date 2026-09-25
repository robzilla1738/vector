// Browser-owned WebUI bootstrap for the bounded native integration proof.
// No mock data or remote page receives this endpoint.
(() => {
  const params = new URLSearchParams(location.search);
  const windowId = params.get('window'), profileId = params.get('profile');
  if (!windowId || !profileId || location.origin !== 'chrome://aux') return;
  const pending = new Map(), subscriptions = new Map();
  let requestId = 0, catalog = {version:0,tabs:[],windows:[]}, last = '', refreshing = null;
  window.auxHostReply = (id, result) => {
    const request = pending.get(id); if (!request) return;
    pending.delete(id); clearTimeout(request.timer);
    if (result?.__auxError) request.reject(new Error(result.__auxError)); else request.resolve(result);
  };
  const native = (method,args=[]) => new Promise((resolve,reject) => {
    const id = `aux-${++requestId}`;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Native host timed out: ${method}`)); },10000);
    pending.set(id,{resolve,reject,timer}); chrome.send('auxRequest',[id,method,args]);
  });
  const emit = (event,...args) => subscriptions.get(event)?.forEach(fn=>fn(...args));
  let overlayOpen = false, toolbarOpen = false, toolbarTicket = 0;
  window.auxHostEvent = (event, payload) => emit(event, payload);
  const createdAt = Date.now();
  const placements = new Map();
  const refresh = () => refreshing ??= native('state').then(state => {
    const signature = JSON.stringify([state,[...placements]]);
    if (signature === last) return catalog;
    last = signature;
    const old = catalog;
    const tabs = state.tabs.map(tab => ({...tab,windowId,popup:false,runtimeOwned:false,generation:1,lifecycle:'live',createdAt,lastActiveAt:createdAt,...(placements.has(tab.pageId)?{spaceId:placements.get(tab.pageId),workspaceId:`candidate:${placements.get(tab.pageId)}`}:{})}));
    const owner = {windowId,order:tabs.map(tab=>tab.pageId),activePageId:state.activePageId||null};
    catalog = {version:old.version+1,tabs,windows:[owner]};
    emit('onTabsPatch',{baseVersion:old.version,version:catalog.version,ts:Date.now(),ops:[...old.tabs.filter(t=>!tabs.some(n=>n.pageId===t.pageId)).map(t=>({op:'remove',pageId:t.pageId})),...tabs.map(tab=>({op:'upsert',tab,origin:'human'})),{op:'window',window:owner}]});
    return catalog;
  }).finally(()=>{refreshing=null;});
  const readSpaces = () => JSON.parse(localStorage.getItem('aux.proof.spaces')||'[]');
  const invoke = async (method,params={}) => {
    if (method === 'workspace.get') {
      const state = await refresh();
      return {lastSeq:0,pages:state.tabs.map(tab=>({...tab,backend:'aux',documentEpoch:0,lastRevision:0,sessionId:profileId,viewStatus:tab.crashed?'crashed':'live'})),activePageId:state.windows[0]?.activePageId||null,runs:[],sets:[],sessions:[{sessionId:profileId,backend:'aux',name:'Chromium candidate'}],restoringTabs:false};
    }
    if (method === 'settings.get') return {...JSON.parse(localStorage.getItem('aux.proof.settings')||'{}'),modelConfigured:false};
    if (method === 'settings.set') { const settings={...JSON.parse(localStorage.getItem('aux.proof.settings')||'{}'),...params};localStorage.setItem('aux.proof.settings',JSON.stringify(settings));return settings; }
    if (method === 'spaces.import') { const existing=readSpaces();for(const space of params.spaces??[])if(!existing.some(s=>s.id===space.id))existing.push({...space,workspaceId:`candidate:${space.id}`,archived:false});localStorage.setItem('aux.proof.spaces',JSON.stringify(existing));return existing; }
    if (method === 'spaces.list') return readSpaces();
    if (method === 'pages.list') return (await invoke('workspace.get')).pages;
    throw new Error(`Aux runtime operation not integrated: ${method}`);
  };
  window.auxChromiumHost = {
    host:'chromium-fork',windowId,profileId,platform:'darwin',privateMode:false,
    subscribe(event,callback) { if(!subscriptions.has(event))subscriptions.set(event,new Set());subscriptions.get(event).add(callback);return()=>subscriptions.get(event)?.delete(callback); },
    async request(method,args) {
      if (method === 'invoke') return invoke(...args);
      if (method === 'tabsSnapshot') return refresh();
      if (method === 'tabsSince') return {kind:'snapshot',snapshot:await refresh()};
      if (method === 'tabCommand') { const outcome=await native(method,args);const state=await refresh();return {...outcome,commandId:`proof-${requestId}`,catalogVersion:state.version,windowId}; }
      if (method === 'bindTabSpace') { if(!(await refresh()).tabs.some(t=>t.pageId===args[0]))throw new Error('Unknown tab'); if(!readSpaces().some(s=>s.id===args[1]))throw new Error('Unknown Space');placements.set(args[0],args[1]);await refresh();return {spaceId:args[1],workspaceId:`candidate:${args[1]}`}; }
      if (method === 'migrateTabSpaces') { for(const item of args[0]){if(catalog.tabs.some(t=>t.pageId===item.pageId)&&readSpaces().some(s=>s.id===item.spaceId))placements.set(item.pageId,item.spaceId);}await refresh();return {migrated:placements.size}; }
      if (method === 'toolbarTone') return native(method,args);
      if (method === 'overlay') { overlayOpen = args[0]; return native('overlay',[overlayOpen || toolbarOpen]); }
      if (method === 'toolbarOverlay') { if (args[1] < toolbarTicket) return false; toolbarTicket = args[1]; toolbarOpen = args[0]; await native('overlay',[overlayOpen || toolbarOpen]); return true; }
      if (['setStage','focusShell','setAppearance','forwardPagePointer','toolbarGlass','sidebarGlass'].includes(method)) return native(method,args);
      throw new Error(`Aux native operation not integrated: ${method}`);
    }
  };
  setInterval(()=>void refresh().catch(error=>emit('onRuntimeStatus',{connected:false,detail:error.message})),500);
})();
