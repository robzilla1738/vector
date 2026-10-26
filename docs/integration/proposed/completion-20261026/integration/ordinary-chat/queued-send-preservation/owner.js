function auxQueuedSendOwner(agent,isCurrent){
 const accountId=agent.accountId,sessionId=agent.session.id,initialStatus=SessionStore.get(agent.accountId,agent.session.id)?.status;
 const snapshot=()=>{
  const account=AccountRegistry.getAccount(accountId),session=SessionStore.get(accountId,sessionId);
  if(!account||!session||![initialStatus,'errored'].includes(session.status)||!isCurrent()||session.archivedAt||isExternalOwnerSuspended(accountId)||String(session.createdAt)!==String(agent.session.createdAt))return null;
  const overview=SessionStore.listTurnOverviews(accountId,sessionId,undefined,1);
  if(!Number.isSafeInteger(overview.transcriptRevision))return null;
  return JSON.stringify({account:['id','createdAt','incarnationId','mode','provider','userId','authStatus'].map(key=>account[key]),epoch:externalOwnerEpoch(accountId),session:['id','createdAt','steeringMessages','browserBinding','model','projectId','permission','permissionMode','runtimeConfig','cwd'].map(key=>session[key]),revision:overview.transcriptRevision,turns:overview.turns});
 };
 const before=snapshot();
 return ()=>before!==null&&snapshot()===before;
}
