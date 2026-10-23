#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,difflib
P=Path(__file__).resolve().parent;sha=lambda x:hashlib.sha256(x).hexdigest();m=json.loads((P/'manifest.json').read_text());patch=''
for f in m['files']:
 p=f['path'];a=P/'baseline'/p;b=P/'source'/p;old=a.read_bytes() if a.exists() else None;new=b.read_bytes()
 assert (sha(old) if old is not None else None)==f['baselineSha256'];assert sha(new)==f['sourceSha256']
 if old is None:patch+=f'diff --git a/{p} b/{p}\nnew file mode 100644\n'
 patch+=''.join(difflib.unified_diff(old.decode().splitlines(True) if old is not None else [],new.decode().splitlines(True),fromfile='a/'+p if old is not None else '/dev/null',tofile='b/'+p))
assert patch==(P/'native.patch').read_text() and sha(patch.encode())==m['patchSha256']
s=(P/'source/extensions/browser/service_worker/service_worker_task_queue.cc').read_text()
def body(marker):
 start=s.index(marker);brace=s.index('{',start);depth=1;i=brace+1
 while depth:depth+=(s[i]=='{')-(s[i]=='}');i+=1
 return s[brace:i]
markers=['bool ServiceWorkerTaskQueue::IsReadyToRunTasks(', 'void ServiceWorkerTaskQueue::AddPendingTask(', 'void ServiceWorkerTaskQueue::ActivateExtension(', 'void ServiceWorkerTaskQueue::VerifyRegistration(', 'void ServiceWorkerTaskQueue::OnWorkerStart(', 'void ServiceWorkerTaskQueue::OnWorkerStartFail(', 'void ServiceWorkerTaskQueue::RegisterServiceWorker(', 'void ServiceWorkerTaskQueue::AddPendingTaskForContext(', 'void ServiceWorkerTaskQueue::MaybeStartWorker(', 'void ServiceWorkerTaskQueue::RetryRegisterServiceWorker(', 'void ServiceWorkerTaskQueue::RetryStartWorker(', 'bool ServiceWorkerTaskQueue::ScheduleRetry(', 'void ServiceWorkerTaskQueue::DidVerifyRegistration(', 'void ServiceWorkerTaskQueue::DidRegisterServiceWorker(', 'bool ServiceWorkerTaskQueue::RendererDidCompleteListenerRegistrationPhase(']
for marker in markers:assert '!CanAdmitStart()' in body(marker)[:300],marker
close=body('ServiceWorkerTaskQueue::CloseStartAdmissionForMigration()');assert close.index('owner.gate.Close()')<close.index('for (auto* queue')
assert 'start_admission_generation_(WorkerStartAdmissionOwner().gate.generation())' in s
assert 'WorkerStartAdmissionOwner().queues.insert(this)' in s
assert 'owner.destroyed.push_back(InspectQueueStartAdmission())' in s
assert 'owner.queues.erase(this)' in s
qclose=body('void ServiceWorkerTaskQueue::CloseQueueStartAdmission()')
for forbidden in ['worker_state_map_.clear','pending_tasks_map_.clear','activation_tokens_.clear','StopWorker','Terminate','kill','InvalidateWeakPtrs']:assert forbidden not in qclose
for kind in ['registration','verification']:
 callback=body('void ServiceWorkerTaskQueue::Did'+('RegisterServiceWorker(' if kind=='registration' else 'VerifyRegistration('))
 assert callback.index('--'+kind+'_callbacks_')<callback.index('if (!CanAdmitStart())')<callback.index('closed_'+kind+'_results_.push_back')
dispatch=body('void ServiceWorkerTaskQueue::DispatchTasksImmediately(');assert 'if (!self || !self->CanAdmitStart())' in dispatch and 'std::move(task).Run(nullptr)' in dispatch
original=(P/'baseline/extensions/browser/service_worker/service_worker_task_queue.cc').read_text()
for marker in ['void ServiceWorkerTaskQueue::RendererDidStartServiceWorkerContext(', 'void ServiceWorkerTaskQueue::RendererDidStopServiceWorkerContext(', 'void ServiceWorkerTaskQueue::RenderProcessForWorkerExited(', 'void ServiceWorkerTaskQueue::OnWorkerStop(']:
 old=s;s=original;before=body(marker);s=old;assert body(marker)==before,marker
assert '->StartTrackingServiceWorkerRunningInstance(worker_id);\n    return;' in body('void ServiceWorkerTaskQueue::RendererDidInitializeServiceWorkerContext(')
print(f'PASS:3 source/patch pins; {len(markers)} admission routes; process owner/new queue generation; retained observations, unchanged stop/start tracking and per-task dispatch recheck')
