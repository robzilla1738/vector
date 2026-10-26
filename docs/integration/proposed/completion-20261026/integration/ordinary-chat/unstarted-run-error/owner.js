function auxMarkUnstartedRunError(entry,owner,attempt){
 if(!attempt||!owner)return false;
 const current=AccountRegistry.getAccount(entry.accountId);
 if(!current||['createdAt','incarnationId','mode','provider','userId','authStatus'].some(key=>current[key]!==owner[key])||
    auxCaptureAgentStartAttempt(entry.accountId,entry.sessionId)!==attempt)return false;
 // Snapshot includes original queued input, transcript revision, selected
 // model/binding/permissions and idle status. Check and write are synchronous.
 entry.agent.changeStatus('errored');return true;
}
