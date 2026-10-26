function auxCaptureInitialPrompt(accountId,owner,message){
 const current=AccountRegistry.getAccount(accountId);
 if(!owner||!current||current.id!==accountId||['createdAt','incarnationId','mode','provider','userId','authStatus'].some(key=>current[key]!==owner[key]))throw Error('The original task account changed.');
 // Persist submitted bytes in the supplied pending-message field atomically
 // with session creation, before any browser, provider or attachment work.
 return structuredClone(Array.isArray(message)?message:[message]);
}
function auxInitialQueuedPromptOwner(agent,input,isCurrent){
 const pending=Array.isArray(input)?input:[input],stored=SessionStore.get(agent.accountId,agent.session.id);
 if(!stored||!stored.queuedMessages?.length||JSON.stringify(stored.queuedMessages)!==JSON.stringify(pending)||agent.agent.state.messages.some(message=>['user','assistant','toolResult','user-message-metadata','compaction'].includes(message.role)))return null;
 const snapshot=()=>{
  const account=AccountRegistry.getAccount(agent.accountId),session=SessionStore.get(agent.accountId,agent.session.id);
  if(!account||!session||!isCurrent()||agent.agent.state.isStreaming||session.archivedAt||!['idle','errored'].includes(session.status)||String(session.createdAt)!==String(agent.session.createdAt))throw Error('The original pending task changed.');
  const overview=SessionStore.listTurnOverviews(agent.accountId,agent.session.id,undefined,1);
  return JSON.stringify({account:['id','createdAt','incarnationId','mode','provider','userId','authStatus'].map(key=>account[key]),session:['id','createdAt','status','queuedMessages','steeringMessages','browserBinding','model','projectId','permission','permissionMode','runtimeConfig','cwd'].map(key=>session[key]),revision:overview.transcriptRevision,turns:overview.turns});
 };
 const original=snapshot();
 return ()=>{if(snapshot()!==original)throw Error('The pending message changed during preparation.');};
}
