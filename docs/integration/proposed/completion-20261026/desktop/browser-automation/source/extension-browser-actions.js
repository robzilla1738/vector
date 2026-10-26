// Browser actions stay in the installed Agent's actual Profile and worker.
// No Target/browser websocket, new permission, caller-chosen debugger session,
// native image, process, cookie store or filesystem capability is introduced.
const auxBoundBrowserMethods=new Set(['Aux.resolveBindingWindow','Aux.listTabs','Aux.ownsTarget','Aux.openProfileUrl','Aux.createAgentTab','Aux.controlTab','Aux.ensureTabInAiTabsGroup','Aux.validateTabReferences']);
const auxBoundPageMethods=new Set(['Accessibility.enable','Accessibility.disable','Accessibility.getFullAXTree','Accessibility.getPartialAXTree','DOM.describeNode','DOM.disable','DOM.enable','DOM.getBoxModel','DOM.getContentQuads','DOM.getDocument','DOM.querySelector','DOM.querySelectorAll','DOM.resolveNode','DOM.scrollIntoViewIfNeeded','Emulation.setFocusEmulationEnabled','Input.dispatchKeyEvent','Input.dispatchMouseEvent','Input.insertText','Inspector.enable','Network.enable','Network.getCookies','Page.close','Page.captureScreenshot','Page.createIsolatedWorld','Page.enable','Page.getFrameTree','Page.getLayoutMetrics','Page.getNavigationHistory','Page.navigate','Page.navigateToHistoryEntry','Page.printToPDF','Page.reload','Page.removeScriptToEvaluateOnNewDocument','Page.addScriptToEvaluateOnNewDocument','Page.screencastFrameAck','Page.setInterceptFileChooserDialog','Page.setWebLifecycleState','Page.startScreencast','Page.stopScreencast','Page.handleJavaScriptDialog','Runtime.enable','Runtime.disable','Runtime.callFunctionOn','Runtime.evaluate','Runtime.releaseObject','Target.setAutoAttach']);
const auxBoundBrowserTasks=new Map,auxBoundTabOwners=new Map;
const auxBoundTaskId=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function auxBrowserContextKey(context){return JSON.stringify([context.accountId,context.profileId,context.browserContextId,context.cookieBindingEpoch,context.cookieRestoreEpoch,context.hasAccountSession,context.windowId])}
async function auxBrowserNativeContext(route,signal){
 signal?.throwIfAborted();
 if(!Number.isSafeInteger(route?.accountId)||route.accountId<0||!route.profileId||route.browserMode!=='default'||!chrome.auxAccount?.getProfileContext)throw Error('An exact regular browser profile is required.');
 const native=await chrome.auxAccount.getProfileContext();signal?.throwIfAborted();
 if(native.profileId!==route.profileId||native.boundAccountId!==route.accountId||native.isRegularProfile!==true||native.isOffTheRecord!==false||native.accountAuthPaused===true||native.cookieRestorePending!==false||![native.browserContextId,native.cookieBindingEpoch,native.cookieRestoreEpoch].every(value=>typeof value==='string'&&value))throw Error('The native browser profile binding changed.');
 let windowId=null;
 if(route.windowId!==undefined){
  if(!Number.isInteger(route.windowId)||route.windowId<0)throw Error('An exact task window is required.');
  const window=await chrome.windows.get(route.windowId);signal?.throwIfAborted();
  if(window.id!==route.windowId||window.incognito||window.type!=='normal')throw Error('The original task window is unavailable.');
  windowId=window.id;
 }
 return {accountId:route.accountId,profileId:route.profileId,browserContextId:native.browserContextId,cookieBindingEpoch:native.cookieBindingEpoch,cookieRestoreEpoch:native.cookieRestoreEpoch,hasAccountSession:native.hasAccountSession===true,windowId,userAgent:navigator.userAgent};
}
async function auxCloseBrowserTask(task){
 if(task.close)return task.close;
 task.closed=true;
 task.close=(async()=>{
  while(task.pending.size)await Promise.allSettled([...task.pending]);
  for(const root of [...task.roots.values()]){
   try{await auxWorkerPhysical('browser-debugger-detach',()=>chrome.debugger.detach({tabId:root.tabId}));task.roots.delete(root.id);auxBoundTabOwners.delete(root.tabId)}
   catch(error){if(task.roots.has(root.id)){auxWorkerNoteUnknown('browser-debugger-detach');throw error}}
  }
  auxBoundBrowserTasks.delete(task.id);
 })();
 return task.close;
}
function auxCloseBrowserTasks(){return Promise.allSettled([...auxBoundBrowserTasks.values()].map(auxCloseBrowserTask))}
async function auxBrowserTaskCurrent(task,signal){
 signal?.throwIfAborted();
 if(task.closed||auxBrowserContextKey(await auxBrowserNativeContext(task.route,signal))!==task.key){
  // Do not await closure from inside its own pending operation.
  auxCloseBrowserTask(task).catch(()=>{});throw Error('The original browser task profile or window changed.');
 }
 signal?.throwIfAborted();
}
function auxBrowserTaskWork(task,operation){
 if(task.closed)throw Error('The original browser task is closed.');
 const promise=Promise.resolve().then(operation);task.pending.add(promise);
 promise.then(()=>task.pending.delete(promise),()=>task.pending.delete(promise));return promise;
}
async function auxBrowserTaskTarget(task,targetId,signal,owned=false){
 await auxBrowserTaskCurrent(task,signal);
 const tabId=await Be(targetId,true),tab=await chrome.tabs.get(tabId);
 await auxBrowserTaskCurrent(task,signal);
 if(tab.windowId!==task.route.windowId||tab.incognito||owned&&task.created.get(targetId)!==tabId)throw Error('The target is outside its original task window or is not owned by this task.');
 return {tabId,tab};
}
function auxBrowserTaskEmit(task,method,params,sessionId){
 if(task.closed)return;
 task.events({method:'aux.browserActionEvent',taskId:task.id,context:task.context,event:{method,params,sessionId}});
}
async function auxBrowserTaskCommand(task,command,signal){
 if(command.method==='Aux.debuggerAttach'){
  const {tabId}=await auxBrowserTaskTarget(task,command.params.targetId,signal,true);
  if(auxBoundTabOwners.has(tabId))throw Error('The task tab already has a debugger owner.');
  const root={id:crypto.randomUUID(),targetId:command.params.targetId,tabId,children:new Set};
  // Reserve before the original attach promise; cancellation cannot drop it.
  auxBoundTabOwners.set(tabId,task);
  try{await auxWorkerPhysical('browser-debugger-attach',()=>chrome.debugger.attach({tabId},'1.3'));task.roots.set(root.id,root)}
  catch(error){auxBoundTabOwners.delete(tabId);throw error}
  await auxBrowserTaskCurrent(task,signal);return {sessionId:root.id};
 }
 if(command.method==='Aux.debuggerDispatch'){
  const {method,params,sessionId}=command.params;
  if(!auxBoundPageMethods.has(method))throw Error(`Browser task method is unavailable: ${method}`);
  const root=[...task.roots.values()].find(root=>root.id===sessionId||root.children.has(sessionId));
  if(!root)throw Error('The original task debugger session is unavailable.');
  await auxBrowserTaskTarget(task,root.targetId,signal,true);
  const source={tabId:root.tabId,...sessionId!==root.id?{sessionId}:{}};
  const result=await auxWorkerPhysical('browser-debugger-command',()=>chrome.debugger.sendCommand(source,method,params??{}),false);
  await auxBrowserTaskCurrent(task,signal);return result??{};
 }
 if(command.method==='Aux.debuggerDetach'){
  const sessionId=command.params.sessionId,root=[...task.roots.values()].find(root=>root.id===sessionId||root.children.has(sessionId));
  if(!root)return {};
  if(root.id===sessionId){await auxWorkerPhysical('browser-debugger-detach',()=>chrome.debugger.detach({tabId:root.tabId}));task.roots.delete(root.id);auxBoundTabOwners.delete(root.tabId)}
  else{await auxWorkerPhysical('browser-debugger-detach-child',()=>chrome.debugger.sendCommand({tabId:root.tabId},'Target.detachFromTarget',{sessionId}));root.children.delete(sessionId)}
  return {};
 }
 if(!auxBoundBrowserMethods.has(command.method))throw Error(`Browser action is unavailable: ${command.method}`);
 await auxBrowserTaskCurrent(task,signal);
 if(command.method==='Aux.resolveBindingWindow'){
  const result=await Xv(Mi);await auxBrowserTaskCurrent(task,signal);
  if(task.route.windowId!==undefined&&result.status==='ok'&&result.windowId!==task.route.windowId)throw Error('The original task window changed.');
  return result;
 }
 if(task.route.windowId===undefined)throw Error('Choose the task browser window first.');
 const target=command.params?.targetId??command.params?.anchorTargetId;
 if(target)await auxBrowserTaskTarget(task,target,signal,['Aux.controlTab','Aux.ensureTabInAiTabsGroup'].includes(command.method));
 if(command.method==='Aux.openProfileUrl'||command.method==='Aux.createAgentTab'){
  const url=new URL(command.params.url);if(!['http:','https:'].includes(url.protocol)&&url.href!=='about:blank')throw Error('The task can open only web pages or about:blank.');
  await auxBrowserTaskCurrent(task,signal);
  const tab=await auxWorkerPhysical('browser-task-create-tab',()=>chrome.tabs.create({active:command.method==='Aux.openProfileUrl',url:url.href,windowId:task.route.windowId}));
  if(!Number.isInteger(tab.id))throw Error('The browser did not create a task tab.');
  let targetId;
  try{targetId=await Mi([tab.id]);task.created.set(targetId,tab.id);await auxBrowserTaskCurrent(task,signal)}
  catch(error){await auxWorkerPhysical('browser-task-cancel-created-tab',()=>chrome.tabs.remove(tab.id));throw error}
  if(command.method==='Aux.createAgentTab')await auxWorkerPhysical('browser-task-group-tab',()=>Ci(()=>$i(tab.id)));
  await auxBrowserTaskCurrent(task,signal);
  auxBrowserTaskEmit(task,'Target.targetCreated',{targetInfo:{targetId,type:'page',url:url.href,title:tab.title??''}});
  return command.method==='Aux.openProfileUrl'?{success:true}:{tabId:tab.id,targetId,windowId:task.route.windowId};
 }
 if(command.method==='Aux.ownsTarget')return {owned:task.created.get(command.params.targetId)===(await auxBrowserTaskTarget(task,command.params.targetId,signal)).tabId};
 if(command.method==='Aux.listTabs'&&command.params.accountId!==undefined&&command.params.accountId!==task.route.accountId)throw Error('The requested account changed.');
 const result=await vy(command,signal,task.route);
 await auxBrowserTaskCurrent(task,signal);
 if(command.method==='Aux.listTabs')return {items:(result.items??[]).filter(tab=>tab.windowId===task.route.windowId)};
 return result;
}
async function auxRunBoundBrowserAction(input,route,signal,events){
 if(!auxBoundTaskId.test(input.taskId)||!input.context||typeof events!=='function')throw Error('The exact browser task owner is required.');
 const command=input.command;
 if(!command||(!auxBoundBrowserMethods.has(command.method)&&!['Aux.debuggerAttach','Aux.debuggerDispatch','Aux.debuggerDetach','Aux.debuggerCloseTask'].includes(command.method)))throw Error('This browser action is unavailable.');
 let task=auxBoundBrowserTasks.get(input.taskId);
 if(command.method==='Aux.debuggerCloseTask'){if(task)await auxCloseBrowserTask(task);return {closed:true}}
 const current=await auxBrowserNativeContext(route,signal),key=auxBrowserContextKey(current);
 if(key!==auxBrowserContextKey(input.context))throw Error('The original native browser task context changed.');
 if(!task){
  if(auxBoundBrowserTasks.size>=256)throw Error('The browser task owner bound was reached.');
  task={id:input.taskId,route:{accountId:route.accountId,profileId:route.profileId,browserMode:'default',...route.windowId===undefined?{}:{windowId:route.windowId}},context:current,key,events,pending:new Set,roots:new Map,created:new Map,closed:false};
  auxBoundBrowserTasks.set(task.id,task);
 }
 if(task.key!==key)throw Error('A browser task cannot change its profile or window.');
 try{return await auxBrowserTaskWork(task,()=>auxBrowserTaskCommand(task,command,signal))}
 finally{if(input.persistent!==true)await auxCloseBrowserTask(task)}
}
chrome.auxAccount?.onProfileContextChanged?.addListener(()=>{auxCloseBrowserTasks().catch(()=>{})});
chrome.debugger.onEvent.addListener((source,method,params)=>{
 const task=auxBoundTabOwners.get(source.tabId);if(!task||task.closed)return;
 const root=[...task.roots.values()].find(root=>root.tabId===source.tabId);if(!root)return;
 if(source.sessionId&&!root.children.has(source.sessionId))return;
 if(method==='Target.attachedToTarget'&&typeof params?.sessionId==='string'){if(params.targetInfo?.type!=='iframe'){auxWorkerPhysical('browser-debugger-unrelated-child-detach',()=>chrome.debugger.sendCommand({tabId:root.tabId},'Target.detachFromTarget',{sessionId:params.sessionId})).catch(()=>{});return}root.children.add(params.sessionId)}
 if(method==='Target.detachedFromTarget')root.children.delete(params?.sessionId);
 if(!/^(Accessibility|DOM|Emulation|Input|Inspector|Network|Page|Runtime|Target)\./.test(method))return;
 auxBrowserTaskEmit(task,method,params,source.sessionId??root.id);
});
chrome.debugger.onDetach.addListener(source=>{
 const task=auxBoundTabOwners.get(source.tabId);if(!task)return;
 for(const [id,root]of task.roots)if(root.tabId===source.tabId){task.roots.delete(id);auxBrowserTaskEmit(task,'Target.detachedFromTarget',{sessionId:id,targetId:root.targetId})}
 auxBoundTabOwners.delete(source.tabId);
});
