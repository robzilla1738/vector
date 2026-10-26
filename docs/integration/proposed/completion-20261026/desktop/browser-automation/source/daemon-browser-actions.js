const auxOwnedBrowserRequests=new Set,auxBrowserEventHandlers=new Set,auxOwnedBrowserClients=new Set;
function auxStopOwnedBrowserClients(){return Promise.allSettled([...auxOwnedBrowserClients].map(client=>client()))}
const auxOwnedBrowserMethods=new Set(['Aux.resolveBindingWindow','Aux.listTabs','Aux.ownsTarget','Aux.openProfileUrl','Aux.createAgentTab','Aux.controlTab','Aux.ensureTabInAiTabsGroup','Aux.validateTabReferences','Aux.debuggerAttach','Aux.debuggerDispatch','Aux.debuggerDetach','Aux.debuggerCloseTask']);
function auxUsesBoundBrowserActions(){
 const binding=process._linkedBinding('aux_owned_native'),d=Object.getOwnPropertyDescriptor(binding,'supervisedTasksEnabled');
 if(d&&!d.get&&!d.set&&!d.writable&&!d.configurable&&d.value===false)return true;
 auxRequireSupervisedTasks();return false;
}
function auxStopOwnedBrowserRequests(){for(const request of auxOwnedBrowserRequests)request.abort(Error('Aux is shutting down.'))}
function auxBrowserContextIdentity(context){return JSON.stringify([context.accountId,context.profileId,context.browserContextId,context.cookieBindingEpoch,context.cookieRestoreEpoch,context.hasAccountSession,context.windowId])}
function auxBrowserActionFailure(message){return Object.assign(Error(message),{code:'AUX_BROWSER_ACTION_UNAVAILABLE'})}
async function auxRunOwnedBrowserAction(bridge,command,options,sendOriginal){
 if(!auxOwnedBrowserMethods.has(command.method))throw auxBrowserActionFailure(`Browser action is unavailable: ${command.method}`);
 const route={accountId:options.accountId,profileId:options.profileId,browserMode:options.browserMode,...options.windowId===undefined?{}:{windowId:options.windowId}};
 if(!Number.isSafeInteger(route.accountId)||route.accountId<0||typeof route.profileId!=='string'||!route.profileId||route.browserMode!=='default'||command.method!=='Aux.resolveBindingWindow'&&(!Number.isInteger(route.windowId)||route.windowId<0))throw auxBrowserActionFailure('An explicit regular profile, account and task window are required.');
 const connected=bridge.listConnectedProfiles(route.accountId).filter(value=>value.profileId===route.profileId);
 if(connected.length!==1)throw auxBrowserActionFailure('The original browser profile connection is unavailable.');
 const connectionId=connected[0].connectionId;
 const boundary=auxBrokerBoundary();boundary.assertOwner();boundary.registerProducerStop(auxStopOwnedBrowserRequests);
 init_accounts();
 const controller=new AbortController(),account=AccountRegistry.getAccount(route.accountId);
 const guard=auxCreateProductivityAccountGuard(route.accountId,account,route.profileId,controller,boundary);
 const cancel=()=>controller.abort(options.signal?.reason??Error('Browser task cancelled.'));
 options.signal?.addEventListener('abort',cancel,{once:true});if(options.signal?.aborted)cancel();
 auxOwnedBrowserRequests.add(controller);
 const assertCurrent=()=>{
  guard.assertCurrent();
  const current=bridge.listConnectedProfiles(route.accountId).filter(value=>value.profileId===route.profileId);
  if(current.length!==1||current[0].connectionId!==connectionId)throw auxBrowserActionFailure('The original browser profile connection changed.');
  options.auxBrowserAssertCurrent?.();
 };
 const snapshot=structuredClone(command);let dispatched=false,settled=false;
 const taskId=options.auxBrowserTaskId??globalThis.crypto.randomUUID();
 try{return await boundary.awaited(async()=>{
  assertCurrent();
  const context=options.auxBrowserContext??await sendOriginal({method:'Aux.getBrowserActionContext',params:{}},{...route,signal:controller.signal,timeoutMs:options.timeoutMs,auxBoundBrowserAction:true,auxCancelBoundBrowserAction:error=>controller.abort(error)});
  assertCurrent();
  if(context.accountId!==route.accountId||context.profileId!==route.profileId||context.windowId!==(route.windowId??null)||![context.browserContextId,context.cookieBindingEpoch,context.cookieRestoreEpoch].every(value=>typeof value==='string'&&value))throw auxBrowserActionFailure('The native browser profile context changed.');
  options.auxBrowserCaptureContext?.(context,connectionId);
  try{
   const result=await sendOriginal({method:'Aux.runBoundBrowserAction',params:{taskId,context,command:snapshot,persistent:!!options.auxBrowserTaskId}},{...route,signal:controller.signal,timeoutMs:options.timeoutMs,auxBoundBrowserAction:true,auxCancelBoundBrowserAction:error=>controller.abort(error),auxManagedWrite:()=>{assertCurrent();options.auxManagedWrite?.();dispatched=true}});
   settled=true;assertCurrent();return result;
  }catch(error){if(error?.auxBrowserActionSettled)settled=true;throw error}
 })}catch(error){if(dispatched&&!settled)boundary.noteUntracked();throw error}
 finally{auxOwnedBrowserRequests.delete(controller);guard.dispose();options.signal?.removeEventListener('abort',cancel)}
}
function auxScopedBrowserCdpClient(original,accountId,session,getRoute){
 if(!auxUsesBoundBrowserActions())return original;
 const taskId=globalThis.crypto.randomUUID(),listeners=new Map,transport=new Emittery,dialogs=new Set,rootSessions=new Set;
 let context,connectionId,closed=false,closing=false,closePromise;
 const account=AccountRegistry.getAccount(accountId),createdAt=account?.createdAt,incarnation=account?.incarnationId;
 const originalBinding=JSON.stringify([session.browserBinding?.profileId,session.browserBinding?.windowId,session.browserBinding?.browserMode]);
 const originalProfileBinding=JSON.stringify(AccountRegistry.getAll().profileAccountBindings[session.browserBinding?.profileId]);
 const binding=()=>{
  if(closed||closing)throw auxBrowserActionFailure('The browser task is closed.');
  const current=AccountRegistry.getAccount(accountId),route=getRoute();
  if(current?.createdAt!==createdAt||current?.incarnationId!==incarnation||route?.accountId!==accountId)throw auxBrowserActionFailure('The original browser task account changed.');
  const stored=SessionStore.get(accountId,session.id);
  if(!stored||String(stored.createdAt)!==String(session.createdAt)||JSON.stringify([stored.browserBinding?.profileId,stored.browserBinding?.windowId,stored.browserBinding?.browserMode])!==originalBinding||JSON.stringify(AccountRegistry.getAll().profileAccountBindings[route.profileId])!==originalProfileBinding||stored.browserBinding?.profileId!==route.profileId||stored.browserBinding?.windowId!==route.windowId||stored.browserBinding?.browserMode!=='default')throw auxBrowserActionFailure('The original browser task session or window changed.');
  return {...route,auxBrowserTaskId:taskId,auxBrowserContext:context,auxBrowserAssertCurrent:()=>{const now=getRoute();if(now?.accountId!==route.accountId||now?.profileId!==route.profileId||now?.windowId!==route.windowId||now?.browserMode!==route.browserMode)throw auxBrowserActionFailure('The original browser task route changed.')},auxBrowserCaptureContext:(native,connection)=>{if(context&&auxBrowserContextIdentity(native)!==auxBrowserContextIdentity(context)||connectionId&&connectionId!==connection)throw auxBrowserActionFailure('The original browser task native context changed.');context??=native;connectionId??=connection}};
 };
 const call=(method,params={},options={})=>{
  const route=binding(),supplied=options.extensionBridge;
  if(supplied&&['accountId','profileId','browserMode','windowId'].some(key=>supplied[key]!==undefined&&supplied[key]!==route[key]))throw auxBrowserActionFailure('A page command cannot change its task route.');
  return sendCommandToExtension({method,params},{...route,timeoutMs:options.timeoutMs,auxManagedWrite:options.auxManagedWrite,signal:options.signal??getCurrentReplAbortSignal()});
 };
 const emit=(method,params,sessionId)=>{for(const callback of listeners.get(method)??[])callback(params,{sessionId})};
 const event=({message,connection})=>{
  if(closed||!context||!message.context||message.taskId!==taskId||connection.connectionId!==connectionId||auxBrowserContextIdentity(message.context)!==auxBrowserContextIdentity(context))return;
  try{binding()}catch{closeScoped().catch(()=>{});return}
  const value=message.event;if(!value||typeof value.method!=='string')return;
  if(value.method==='Target.detachedFromTarget')rootSessions.delete(value.params?.sessionId);
  if(value.method==='Page.javascriptDialogOpening'&&dialogs.has(value.sessionId))send('Page.handleJavaScriptDialog',{accept:true},value.sessionId).catch(()=>{});
  emit(value.method,value.params,value.sessionId);
 };
 auxBrowserEventHandlers.add(event);
 const closeScoped=()=>{
  if(closePromise)return closePromise;
  auxBrowserEventHandlers.delete(event);closing=true;
  closePromise=(async()=>{
   if(context){
    // Revocation is sent through the original exact connection. It cannot
    // reacquire a replacement profile or dispatch a new page command.
    const route=getRoute(),matches=globalExtensionBridge.listConnectedProfiles(accountId).find(value=>value.profileId===route?.profileId&&value.connectionId===connectionId);
    if(!matches){if(rootSessions.size){auxBrokerBoundary().noteUntracked();throw auxBrowserActionFailure('Browser task closure lost its original connection.')}return}
    await globalExtensionBridge.auxCloseBoundBrowserTask(taskId,context,{accountId,profileId:route.profileId,browserMode:'default',windowId:route.windowId,connectionId});
   }
  })().finally(()=>{closed=true;listeners.clear();auxOwnedBrowserClients.delete(closeScoped)});
  return closePromise;
 };
 auxOwnedBrowserClients.add(closeScoped);auxBrokerBoundary().registerProducerStop(auxStopOwnedBrowserClients);
 const targets=async()=>{const result=await call('Aux.listTabs',{accountId});return (result.items??[]).map(tab=>({id:tab.targetId,targetId:tab.targetId,type:'page',title:tab.title,url:tab.url}))};
 const send=async(method,params={},sessionId,options={})=>{
  if(options.auxDocumentCapability)throw auxBrowserActionFailure('Selected existing-page document commands require the original native document transport.');
  if(method.startsWith('Aux.'))return call(method,params,options);
  if(method==='Target.getTargets')return {targetInfos:await targets()};
  if(method==='Target.getTargetInfo'){const value=(await targets()).find(value=>value.id===params.targetId);if(!value)throw auxBrowserActionFailure('The task tab is unavailable.');return {targetInfo:value}}
  if(method==='Target.setDiscoverTargets')return {};
  if(method==='Target.attachToTarget'){const result=await call('Aux.debuggerAttach',{targetId:params.targetId},options);rootSessions.add(result.sessionId);return result}
  if(method==='Target.detachFromTarget'){const result=await call('Aux.debuggerDetach',{sessionId:params.sessionId},options);rootSessions.delete(params.sessionId);return result}
  if(method==='Browser.getVersion'){await targets();return {userAgent:context.userAgent}}
  if(!sessionId)throw auxBrowserActionFailure(`A task-owned page session is required: ${method}`);
  return call('Aux.debuggerDispatch',{method,params,sessionId},options);
 };
 return {scopedTaskId:taskId,scopedBrowserRoute:binding,send,transportEvents:transport,on(method,callback){let callbacks=listeners.get(method);if(!callbacks)listeners.set(method,callbacks=new Set);callbacks.add(callback);return()=>callbacks.delete(callback)},discoverTargets:targets,discoverVersion:async()=>{await targets();return {'User-Agent':context.userAgent}},setDialogAutoAccept(id,enabled){if(enabled)dialogs.add(id);else dialogs.delete(id)},closeScoped};
}
