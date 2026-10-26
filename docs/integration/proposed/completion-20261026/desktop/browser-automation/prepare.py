#!/usr/bin/env python3
from pathlib import Path
import argparse,hashlib,json,subprocess
HERE=Path(__file__).resolve().parent
BASE=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps')
p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);p.add_argument('--entry',type=Path,default=BASE/'daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs');p.add_argument('--background',type=Path,default=BASE/'extension/dist/background.js');a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
plans=[]
def transform(name,path,helper,rules):
 text=path.read_text();before=text;anchors=[]
 insertion=(HERE/'source'/helper).read_text()
 if name=='entry':rules=[("/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');","/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');\n"+insertion)]+rules
 else:rules=[(text[:text.index('\n')],insertion+'\n'+text[:text.index('\n')])]+rules
 for old,new in rules:
  assert text.count(old)==1,(name,old[:140],text.count(old))
  text=text.replace(old,new);anchors.append({'before':old,'after':new,'count':1})
 target=a.out/('aux-native-entry.mjs' if name=='entry' else 'background.js');target.write_text(text)
 plans.append({'name':name,'inputPath':str(path),'inputSha256':hashlib.sha256(before.encode()).hexdigest(),'outputSha256':hashlib.sha256(text.encode()).hexdigest(),'outputPath':str(target),'anchors':anchors})
transform('entry',a.entry,'daemon-browser-actions.js',[
 ('async sendCommandToExtension(Cn,ei={}){auxRequireSupervisedTasks();',"""async sendCommandToExtension(Cn,ei={}){if(auxUsesBoundBrowserActions())return await auxRunOwnedBrowserAction(this,Cn,ei,(command,options)=>this.#auxSendOriginalBrowserCommand(command,options));auxRequireSupervisedTasks();return await this.#auxSendOriginalBrowserCommand(Cn,ei)}async auxCloseBoundBrowserTask(taskId,context,options){if(typeof taskId!=='string'||!context||!options?.profileId||!Number.isSafeInteger(options.accountId)||options.browserMode!=='default'||!this.listConnectedProfiles(options.accountId).some(value=>value.profileId===options.profileId&&value.connectionId===options.connectionId))throw Error('Original browser task connection is required for closure');return await this.#auxSendOriginalBrowserCommand({method:'Aux.runBoundBrowserAction',params:{taskId,context,command:{method:'Aux.debuggerCloseTask',params:{}}}},{accountId:options.accountId,profileId:options.profileId,browserMode:'default',windowId:options.windowId,auxBoundBrowserAction:true})}async #auxSendOriginalBrowserCommand(Cn,ei={}){"""),
 ('async function sendCommandToExtension(Cn,ei={}){auxRequireSupervisedTasks();',"async function sendCommandToExtension(Cn,ei={}){if(auxUsesBoundBrowserActions()){if(!globalExtensionBridge.isExtensionConnected)throw Error('The original browser profile extension is not connected');return await globalExtensionBridge.sendCommandToExtension(Cn,ei)}auxRequireSupervisedTasks();"),
 ('si=setTimeout(()=>{this.pendingCommandRequests.delete(ri.id),ei.logTimeout',"si=setTimeout(()=>{if(ei.auxBoundBrowserAction){const error=Error(`Browser action settlement timed out: ${ri.command.method}`);safeWebsocketSend(ni,{id:ri.id,method:'cancelCommand'});ei.auxCancelBoundBrowserAction?.(error);return}this.pendingCommandRequests.delete(ri.id),ei.logTimeout"),
 ('this.pendingCommandRequests.set(ri.id,{connectionId:ti.connectionId,resolve:ii,reject:ai,timeout:si});let ci=ei.signal?()=>{clearTimeout(si),this.pendingCommandRequests.delete(ri.id),safeWebsocketSend(ni,{id:ri.id,method:`cancelCommand`}),ai(createAbortError$1(ei.signal))}:void 0;',"this.pendingCommandRequests.set(ri.id,{connectionId:ti.connectionId,resolve:ii,reject:ai,timeout:si,boundBrowserAction:!!ei.auxBoundBrowserAction});let auxCommandSent=false;let ci=ei.signal?()=>{clearTimeout(si);if(!auxCommandSent){this.pendingCommandRequests.delete(ri.id);ai(createAbortError$1(ei.signal));return}safeWebsocketSend(ni,{id:ri.id,method:`cancelCommand`});if(ei.auxBoundBrowserAction)return;this.pendingCommandRequests.delete(ri.id);ai(createAbortError$1(ei.signal))}:void 0;"),
 ('try{ei.auxManagedWrite?.();ni.send(JSON.stringify(ri))}', 'try{ei.auxManagedWrite?.();ni.send(JSON.stringify(ri));auxCommandSent=true}'),
 ('si.error?ci.reject(Error(si.error)):ci.resolve(si.result)', 'si.error?ci.reject(Object.assign(Error(si.error),ci.boundBrowserAction?{auxBrowserActionSettled:true}:{})):ci.resolve(si.result)'),
 ('let{data:oi}=ExtensionBridgeProtocol.pingMessageResponseSchema.safeParse(ri);',"if(ri?.method==='aux.browserActionEvent'&&typeof ri.taskId==='string'&&ri.context&&ri.event&&typeof ri.event.method==='string'){for(const handler of auxBrowserEventHandlers)try{handler({message:ri,connection:ai})}catch{}return}let{data:oi}=ExtensionBridgeProtocol.pingMessageResponseSchema.safeParse(ri);"),
 ('this.#e=auxReferenceCdpClient(Cn,()=>this.state.tabs,()=>this.#L())', 'this.#e=auxReferenceCdpClient(auxScopedBrowserCdpClient(Cn,ei,ti,()=>this.#L()),()=>this.state.tabs,()=>this.#L())'),
 ('this.#S=ri.tabs??createExtensionTabController(()=>this.#L())', 'this.#S=ri.tabs??createExtensionTabController(()=>this.#e.scopedBrowserRoute?.()??this.#L())'),
 ('await this.#t.dispose(),this.#g=[],this.#h=null', 'await this.#t.dispose();await this.#e.closeScoped?.();this.#g=[],this.#h=null'),
 ('const attached=await object.send(method,params,sessionId,options);', 'const attached=await object.send(method,params,sessionId,binding.referenced?{...options,auxDocumentCapability:binding.capability,auxDocumentUrl:binding.url}:options);')
])
transform('background',a.background,'extension-browser-actions.js',[
 ('  const oo = [\n    auxCookieSyncContext,', '''  const auxBrowserContextRequest=m({method:E("Aux.getBrowserActionContext"),params:m({})});
  const auxBrowserActionRequest=m({method:E("Aux.runBoundBrowserAction"),params:m({taskId:p(),context:Qe(),persistent:Qe().optional(),command:m({method:p(),params:Qe()})})});
  const oo = [
    auxBrowserContextRequest,
    auxBrowserActionRequest,
    auxCookieSyncContext,'''),
 ('async function vy(e, t, r) {', 'async function vy(e, t, r, auxBrowserEvents) {'),
 ('  switch (e.method) {\n    case "Aux.getCookieSyncContext":', '''  switch (e.method) {
    case "Aux.getBrowserActionContext": return await auxBrowserNativeContext(r,t);
    case "Aux.runBoundBrowserAction": return await auxRunBoundBrowserAction(e.params,r,t,auxBrowserEvents);
    case "Aux.getCookieSyncContext":'''),
 ('const d = await vy(u.data.command, f.signal, u.data.route);', 'const d = await vy(u.data.command, f.signal, u.data.route, event=>o(event));'),
 ('  #n(e) {\n    for (const t of this.runningCommands.values())', '''  #n(e) {
    auxWorkerPhysical("browser-task-connection-close",auxCloseBrowserTasks).catch(()=>auxWorkerNoteUnknown("browser-task-connection-close"));
    for (const t of this.runningCommands.values())''')
])
result={'format':'aux.browser-actions.counted-resources.v1','files':plans,'nativeProjected':False,'appExecuted':False};(a.out/'source-plan.json').write_text(json.dumps(result,indent=2)+'\n')
(HERE/'resource-anchors.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'output':str(a.out),'files':len(plans),'anchors':sum(len(p['anchors'])for p in plans)}))
