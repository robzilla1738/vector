"""Exact source and ordinary/full-mode boundary checks, no product execution."""
from pathlib import Path
import json,hashlib
HERE=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
plan=json.loads((HERE/'source-plan.json').read_text())
rows=[]
for row in plan['files']:
 before=(HERE/'preimages'/row['path']).read_bytes();after=Path(row['source']).read_bytes()
 assert sha(before)==row['inputSha256'] and sha(after)==row['outputSha256']
 text=before.decode()
 for anchor in row['anchors']:
  assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
 assert text.encode()==after
 reverse=text
 for anchor in reversed(row['anchors']):
  assert reverse.count(anchor['replace'])==1;reverse=reverse.replace(anchor['replace'],anchor['find'],1)
 assert reverse.encode()==before
 rows.append({'path':row['path'],'inputSha256':sha(before),'outputSha256':sha(after),'anchorCount':len(row['anchors']),'forwardReverseExact':True})
supervisor=Path(plan['files'][2]['source']).read_text();before=(HERE/'preimages'/plan['files'][2]['path']).read_text()
start=supervisor.index('#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP',supervisor.index('void DaemonSupervisor::FinishNativeShutdown()'))
end=supervisor.index('#endif\n',start)+len('#endif\n')
assert supervisor[:start]+supervisor[end:]==before
body=supervisor[start:end]
assert 'exit_observed_and_reaped' in body and '!child->wrong_process' in body and '!child->exit_ownership_unknown' in body
assert 'CloseNativeSelectedStateHome' not in body and 'launch_failed' not in body
assert 'DidFinishShutdown({false, std::nullopt})' in body and 'base::Seconds(5)' in body
inspect=Path(plan['files'][1]['source']).read_text();start=inspect.index('SelectedStateHomeObservation InspectNativeSelectedOwnedChildForShutdown()');end=inspect.index('SelectedStateHomeObservation CloseNativeSelectedStateHome()',start);body=inspect[start:end]
assert 'owner->InspectOwnedChild()' in body and 'CloseNativeAdmission' not in body and 'state.closed =' not in body
result={'format':'aux.native-prequit-source-check.v1','passed':True,'files':rows,'fullModeSupervisorBytesExact':True,'authenticatedHttpTriggerUnchanged':True,'inspectionDoesNotClosePeer':True,'originalReapRequiredBeforeNativeClose':True,'deadlineFailureNotDrain':True,'productExecuted':False,'nativeTreeMutated':False}
(HERE/'actual-source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
