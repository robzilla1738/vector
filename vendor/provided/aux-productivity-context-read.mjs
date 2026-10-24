// Selected tab context stays bound to the originally selected native document.
// This wraps the supplied client; all renderer sessions and context/node IDs remain
// owned by that client, not a parallel automation connection.
export function auxReferencesFromMessages(messages) {
  return (Array.isArray(messages)?messages:[messages]).flatMap(message=>
    message?.role==='user-message-metadata'?(message.attachments??[]).filter(item=>item.type==='tab').map(item=>({targetId:item.targetId,url:item.url,documentCapability:item.documentCapability})):[]);
}
export async function auxValidateReferenceMessages(browser,messages,send=sendCommandToExtension) {
  const references=auxReferencesFromMessages(messages);
  if(!references.length)return;
  if(references.length>64||references.some(ref=>!ref.documentCapability||!ref.targetId||!ref.url))
    throw Error('A referenced tab must be selected again; your pending message is preserved.');
  const source=browser?.extensionBridgeRoute,route=source?{...source}:undefined;
  if(!Number.isInteger(route?.accountId)||!route.profileId)throw Error('The original browser profile is unavailable.');
  const result=await send({method:'Aux.validateTabReferences',params:{references}},route);
  if(!result?.success)throw Error(result?.error??'A referenced tab changed; select it again.');
  const current=browser?.extensionBridgeRoute;
  if(current?.accountId!==route.accountId||current?.profileId!==route.profileId||current?.browserMode!==route.browserMode)
    throw Error('The browser profile changed; your pending message is preserved.');
}
export async function auxDrainValidatedQueue(queue,validate,signal) {
  if(!validate)return queue.drain();
  const pending=queue.peek();
  if(!pending.length)return [];
  if(signal?.aborted)throw Error('Message dispatch cancelled.');
  // The supplied follow-up queue can drain a user row before its separate
  // metadata row. Validate the queued batch without changing its drain mode.
  const batch=Array.isArray(queue.messages)?queue.messages.slice():pending;
  const capturedReferences=JSON.stringify(auxReferencesFromMessages(batch));
  await validate(batch);
  if(signal?.aborted)throw Error('Message dispatch cancelled.');
  const current=queue.peek();
  if(current.length!==pending.length||current.some((message,index)=>message!==pending[index])||
      (Array.isArray(queue.messages)&&(queue.messages.length!==batch.length||queue.messages.some((message,index)=>message!==batch[index])))||
      JSON.stringify(auxReferencesFromMessages(Array.isArray(queue.messages)?queue.messages:current))!==capturedReferences)
    throw Error('The queued message changed during validation.');
  return queue.drain();
}
export function auxReferenceCdpClient(client,getTabs,getRoute,send=sendCommandToExtension) {
  const sessions=new Map(),pending=new Map();
  const recordFor=target=>getTabs().find(tab=>tab.targetId===target);
  const bindingFor=target=>{
    const record=recordFor(target);
    if(record?.source!=='attachment'&&!record?.documentCapability)return {target,referenced:false};
    if(!record.documentCapability||!record.documentUrl)throw Error('Referenced tab context expired; select it again.');
    const source=getRoute(),route=source?{...source}:undefined;
    if(!Number.isInteger(route?.accountId)||!route.profileId)throw Error('The original browser profile is unavailable.');
    return {target,referenced:true,capability:record.documentCapability,url:record.documentUrl,route};
  };
  const assertBinding=binding=>{
    if(!binding.referenced)return;
    if(binding.retirement)throw Error('Referenced tab context expired; select it again.');
    const record=recordFor(binding.target),current=getRoute();
    if(!binding.capability||!record||!record.documentCapability||!record.documentUrl)
      throw Error('Referenced tab context expired; select it again.');
    if(record.documentCapability!==binding.capability||record.documentUrl!==binding.url)
      throw Error('Referenced tab context changed; select it again.');
    if(current?.profileId!==binding.route.profileId||current?.accountId!==binding.route.accountId||current?.browserMode!==binding.route.browserMode)
      throw Error('The browser profile changed.');
  };
  const retireBinding=async(binding,sessionId)=>{
    const actual=binding.rootSession??sessionId;
    if(!actual)return;
    if(!binding.retirement)binding.retirement=Promise.resolve().then(()=>
      client.send('Target.detachFromTarget',{sessionId:actual})).catch(()=>{});
    // The supplied SessionManager observes the actual detach event and evicts
    // its cached page session. Keep guarded bindings until that event; a lost
    // cleanup reply must not permit an ordinary read or a silent rebind.
    await binding.retirement;
  };
  return new Proxy(client,{get(object,key){
    if(key==='send')return async(method,params,sessionId,options={})=>{
      if(method==='Target.attachToTarget'){
        const target=params?.targetId,binding=bindingFor(target);
        if(pending.has(target))throw Error('A tab attachment is already pending.');
        pending.set(target,binding);
        try{
          if(binding.referenced){
            const result=await send({method:'Aux.validateTabReferences',params:{references:[{targetId:target,url:binding.url,documentCapability:binding.capability}]}},binding.route);
            if(!result?.success)throw Error(result?.error??'Referenced tab context changed.');
            assertBinding(binding);
          }
          const attached=await object.send(method,params,sessionId,options);
          if(attached?.sessionId){binding.rootSession=attached.sessionId;sessions.set(attached.sessionId,binding)}
          try{assertBinding(binding)}catch(error){
            // Detach only the session this exact call created. A lost cleanup
            // reply retains its guarded binding; it never becomes ordinary.
            await retireBinding(binding,attached?.sessionId);
            throw error;
          }
          return attached;
        }finally{
          if(pending.get(target)===binding)pending.delete(target);
        }
      }
      const binding=sessions.get(sessionId);
      if(binding&&!binding.referenced){
        const selected=bindingFor(binding.target);
        // A session opened for ordinary browsing may later become selected
        // context. Upgrade its shared frame binding once; never downgrade it.
        if(selected.referenced)Object.assign(binding,selected);
      }
      if(binding?.referenced)try{assertBinding(binding)}catch(error){
        await retireBinding(binding,sessionId);throw error;
      }
      return object.send(method,params,sessionId,binding?.referenced?{...options,auxDocumentCapability:binding.capability}:options);
    };
    if(key==='on')return (event,callback)=>object.on(event,(data,meta)=>{
      if(event==='Target.attachedToTarget'){
        const target=data.targetInfo?.targetId,inherited=sessions.get(meta?.sessionId)??pending.get(target);
        if(data.sessionId){
          if(inherited){
            if(!inherited.rootSession)inherited.rootSession=data.sessionId;
            sessions.set(data.sessionId,inherited);
          }
          else if(target)try{sessions.set(data.sessionId,{...bindingFor(target),rootSession:data.sessionId})}
          catch{sessions.set(data.sessionId,{target,referenced:true})}
        }
      }
      if(event==='Target.detachedFromTarget')sessions.delete(data.sessionId);
      return callback(data,meta);
    });
    const value=Reflect.get(object,key,object);
    return typeof value==='function'?value.bind(object):value;
  }});
}
function patch(text,find,replacement,anchors,kind){
  const count=text.split(find).length-1;
  if(count!==1)throw Error(`${kind}: expected one pinned anchor, got ${count}`);
  anchors.push({kind,find,replace:replacement,count:1});return text.replace(find,replacement);
}
export function transformAuxContextReadDaemon({text}){
  const anchors=[],change=(find,next,kind)=>{text=patch(text,find,next,anchors,kind)};
  change('Cn.extensionRequestSchema=discriminatedUnion(`method`,Ri)',
    'Ri.push(object({method:literal(`Aux.validateTabReferences`),params:object({references:array(object({targetId:string$3().min(1),url:string$3().min(1),documentCapability:string$3().uuid()})).min(1).max(64)})})),Cn.extensionRequestSchema=discriminatedUnion(`method`,Ri)','aux-context-bridge-request-schema');
  change('ei=this.harness.prepareMessages?.(this.ctx,ei)??ei;let ti=await prepareAttachments(',
    'ei=this.harness.prepareMessages?.(this.ctx,ei)??ei;await auxValidateReferenceMessages(this.browser,ei);let ti=await prepareAttachments(','aux-context-message-admission');
  change('return this.#Te(ti),await this.hooks.trigger(`chat.message`,ti,ti)',
    'return await auxValidateReferenceMessages(this.browser,ti),this.#Te(ti),await this.hooks.trigger(`chat.message`,ti,ti)','aux-context-after-file-preparation');
  change('let Cn=this.steeringQueue.drain();if(Cn.length>0)',
    'let Cn=await auxDrainValidatedQueue(this.steeringQueue,this.auxValidateQueuedMessages);if(Cn.length>0)','aux-context-continue-steering');
  change('let ei=this.followUpQueue.drain();if(ei.length>0)',
    'let ei=await auxDrainValidatedQueue(this.followUpQueue,this.auxValidateQueuedMessages);if(ei.length>0)','aux-context-continue-follow-up');
  change('getSteeringMessages:async()=>ei?(ei=!1,[]):this.steeringQueue.drain(),getFollowUpMessages:async()=>this.followUpQueue.drain()',
    'getSteeringMessages:async()=>ei?(ei=!1,[]):auxDrainValidatedQueue(this.steeringQueue,this.auxValidateQueuedMessages,this.activeRun?.abortController.signal),getFollowUpMessages:async()=>auxDrainValidatedQueue(this.followUpQueue,this.auxValidateQueuedMessages,this.activeRun?.abortController.signal)','aux-context-actual-queue-dequeue');
  change('ei.prepareRequest=async({context:Cn})=>{',
    'ei.auxValidateQueuedMessages=messages=>auxValidateReferenceMessages(this.browser,messages),ei.prepareRequest=async({context:Cn})=>{','aux-context-queue-validator-binding');
  change('this.#e=Cn,this.#S=ri.tabs??createExtensionTabController(()=>this.#L()),this.#t=new SessionManager(Cn)',
    'this.#e=auxReferenceCdpClient(Cn,()=>this.state.tabs,()=>this.#L()),this.#S=ri.tabs??createExtensionTabController(()=>this.#L()),this.#t=new SessionManager(this.#e)','aux-context-existing-cdp-client-guard');
  change('ei!==void 0&&(oi.params=ei),ti&&(oi.sessionId=ti);let{promise:si,reject:ci,resolve:li}',
    'ei!==void 0&&(oi.params=ei),ti&&(oi.sessionId=ti),ni.auxDocumentCapability&&(oi.auxDocumentCapability=ni.auxDocumentCapability);let{promise:si,reject:ci,resolve:li}','aux-context-authenticated-cdp-metadata');
  change('setActiveTab(Cn){SessionStore.update(this.#n,this.#r.id,{activeTabTargetId:Cn}),this.#_=null}',
    'bindTabReferences(refs){for(const ref of refs){const tab=getSessionTabByTargetId(this.#n,this.#r.id,ref.targetId);if(tab)updateSessionTab(this.#n,tab.id,{data:{...tab.data,documentCapability:ref.documentCapability,documentUrl:ref.url}})}this.#_=null}setActiveTab(Cn){SessionStore.update(this.#n,this.#r.id,{activeTabTargetId:Cn}),this.#_=null}','aux-context-persist-captured-document');
  change('map(Cn=>({targetId:Cn.targetId,title:Cn.name,url:Cn.url})):[]);if(!ei.length)return;',
    'map(Cn=>({targetId:Cn.targetId,title:Cn.name,url:Cn.url,documentCapability:Cn.documentCapability})):[]);if(!ei.length)return;','aux-context-message-document-carrier');
  change('this.session.activeTabTargetId||SessionStore.update(this.accountId,this.session.id,{activeTabTargetId:Cn.targetId}))}#Ee(Cn)',
    'this.session.activeTabTargetId||SessionStore.update(this.accountId,this.session.id,{activeTabTargetId:Cn.targetId}));this.browser?.bindTabReferences(ei)}#Ee(Cn)','aux-context-bind-selected-session-tabs');
  for(const fn of [auxReferencesFromMessages,auxValidateReferenceMessages,auxDrainValidatedQueue,auxReferenceCdpClient]){
    const append=fn.toString();text+=`\n${append}\n`;anchors.push({kind:`aux-context-helper-${fn.name}`,append,count:1});
  }
  return {text,anchors};
}
export function transformAuxContextReadUi({relative,text}){
  const anchors=[];if(relative!=='background.js')return {text,anchors};
  const change=(find,next,kind)=>{text=patch(text,find,next,anchors,kind)};
  change('e.extensionRequestSchema = Me("method", oo)',
    'oo.push(m({method:E("Aux.validateTabReferences"),params:m({references:N(m({targetId:p().min(1),url:p().min(1),documentCapability:p().uuid()})).min(1).max(64)})})); e.extensionRequestSchema = Me("method", oo)','aux-context-extension-request-schema');
  change('case "Aux.ownsTarget":',
    'case "Aux.validateTabReferences": { const binding=await Xa(); if(!r||binding.accountId!==r.accountId||binding.browserProfile?.profileId!==r.profileId)throw Error("Tab references belong to another browser profile."); const result=await chrome.auxBrowserPreferences.validateTabReferences(e.params); const current=await Xa(); if(current.accountId!==binding.accountId||current.browserProfile?.profileId!==binding.browserProfile?.profileId)throw Error("The browser profile changed."); return result; }\n    case "Aux.ownsTarget":','aux-context-authenticated-extension-dispatch');
  return {text,anchors};
}
