"""Exact terminal-auth source boundary check; no native or HTTP execution."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'source-plan.json').read_text());row=plan['files'][0]
before=(HERE/'preimages'/row['path']).read_text();after=Path(row['source']).read_text();anchor=row['anchors'][0]
assert hashlib.sha256(before.encode()).hexdigest()==row['inputSha256'] and hashlib.sha256(after.encode()).hexdigest()==row['outputSha256']
assert before.count(anchor['find'])==anchor['count'] and before.replace(anchor['find'],anchor['replace'],1)==after
assert after.count(anchor['replace'])==1 and after.replace(anchor['replace'],anchor['find'],1)==before
methods=['Authenticate','DidReadChallenge','ObserveNativeSignature','DidObserveNativeSignature','DidSignChallenge','RequestAuthorization']
def method(source,name):
 start=source.index('void DaemonSupervisor::'+name+'(');end=source.find('\nvoid DaemonSupervisor::',start+1)
 return source[start:end if end>=0 else len(source)]
for name in methods:assert method(before,name)==method(after,name),name
failure=anchor['replace'];assert 'adopted_native_child_ && !native_sign_inflight_' in failure and 'native_completed_signature_)' in failure
assert 'native_sign_inflight_ =' not in failure and failure.count('.reset();')==3
assert 'authorization_.clear();' in failure and 'State::kFailed' in failure and 'State::kReady' not in failure
marker='    SetState(State::kFailed, "Daemon installation authorization failed");\n    return;\n  }\n'
assert method(before,'DidReadSession').split(marker,1)[1]==method(after,'DidReadSession').split(marker,1)[1]
result={'format':'aux.native-auth-terminal-session-source-check.v1','passed':True,'singleCountForwardReverseExact':True,'unchangedMethods':methods,'successfulSessionParsingAndAuthorizationUnchanged':True,'noPendingNativeOperationReplacement':True,'terminalCompletedSessionFailureOnly':True,'productExecuted':False,'nativeTreeMutated':False}
(HERE/'actual-source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
