#!/usr/bin/env python3
from pathlib import Path

import json, hashlib, difflib

PROPOSAL_ROOT = Path(__file__).resolve().parent
sha256 = lambda x: hashlib.sha256(x).hexdigest()
manifest = json.loads((PROPOSAL_ROOT / 'manifest.json').read_text())
patch = ''
for record in manifest['files']:
    relative_path = record['path']
    baseline_path = PROPOSAL_ROOT / 'baseline' / relative_path
    source_path = PROPOSAL_ROOT / 'source' / relative_path
    current_source = baseline_path.read_bytes() if baseline_path.exists() else None
    new = source_path.read_bytes()
    assert (sha256(current_source) if current_source is not None else None) == record['baselineSha256']
    assert sha256(new) == record['sourceSha256']
    if current_source is None:
        patch += f'diff --git a/{relative_path} b/{relative_path}\nnew file mode 100644\n'
    patch += ''.join(difflib.unified_diff(
        current_source.decode().splitlines(True) if current_source is not None else [],
        new.decode().splitlines(True),
        fromfile='a/' + relative_path if current_source is not None else '/dev/null',
        tofile='b/' + relative_path,
    ))
assert patch == (PROPOSAL_ROOT / 'native.patch').read_text() and sha256(patch.encode()) == manifest['patchSha256']
source = (PROPOSAL_ROOT / 'source/extensions/browser/service_worker/service_worker_task_queue.cc').read_text()


def function_body(marker):
    start = source.index(marker)
    brace = source.index('{', start)
    depth = 1
    cursor = brace + 1
    while depth:
        depth += (source[cursor] == '{') - (source[cursor] == '}')
        cursor += 1
    return source[brace:cursor]


markers = [
    'bool ServiceWorkerTaskQueue::IsReadyToRunTasks(',
    'void ServiceWorkerTaskQueue::AddPendingTask(',
    'void ServiceWorkerTaskQueue::ActivateExtension(',
    'void ServiceWorkerTaskQueue::VerifyRegistration(',
    'void ServiceWorkerTaskQueue::OnWorkerStart(',
    'void ServiceWorkerTaskQueue::OnWorkerStartFail(',
    'void ServiceWorkerTaskQueue::RegisterServiceWorker(',
    'void ServiceWorkerTaskQueue::AddPendingTaskForContext(',
    'void ServiceWorkerTaskQueue::MaybeStartWorker(',
    'void ServiceWorkerTaskQueue::RetryRegisterServiceWorker(',
    'void ServiceWorkerTaskQueue::RetryStartWorker(',
    'bool ServiceWorkerTaskQueue::ScheduleRetry(',
    'void ServiceWorkerTaskQueue::DidVerifyRegistration(',
    'void ServiceWorkerTaskQueue::DidRegisterServiceWorker(',
    'bool ServiceWorkerTaskQueue::RendererDidCompleteListenerRegistrationPhase(',
]
for marker in markers:
    assert '!CanAdmitStart()' in function_body(marker)[:300], marker
close = function_body('ServiceWorkerTaskQueue::CloseStartAdmissionForMigration()')
assert close.index('owner.gate.Close()') < close.index('for (auto* queue')
assert 'start_admission_generation_(WorkerStartAdmissionOwner().gate.generation())' in source
assert 'WorkerStartAdmissionOwner().queues.insert(this)' in source
assert 'owner.destroyed.push_back(InspectQueueStartAdmission())' in source
assert 'owner.queues.erase(this)' in source
qclose = function_body('void ServiceWorkerTaskQueue::CloseQueueStartAdmission()')
for forbidden in [
    'worker_state_map_.clear',
    'pending_tasks_map_.clear',
    'activation_tokens_.clear',
    'StopWorker',
    'Terminate',
    'kill',
    'InvalidateWeakPtrs',
]:
    assert forbidden not in qclose
for kind in ['registration', 'verification']:
    callback = function_body(
        'void ServiceWorkerTaskQueue::Did'
        + ('RegisterServiceWorker(' if kind == 'registration' else 'VerifyRegistration(')
    )
    assert (
        callback.index('--' + kind + '_callbacks_')
        < callback.index('if (!CanAdmitStart())')
        < callback.index('closed_' + kind + '_results_.push_back')
    )
dispatch = function_body('void ServiceWorkerTaskQueue::DispatchTasksImmediately(')
assert 'if (!self || !self->CanAdmitStart())' in dispatch and 'std::move(task).Run(nullptr)' in dispatch
original = (PROPOSAL_ROOT / 'baseline/extensions/browser/service_worker/service_worker_task_queue.cc').read_text()
for marker in [
    'void ServiceWorkerTaskQueue::RendererDidStartServiceWorkerContext(',
    'void ServiceWorkerTaskQueue::RendererDidStopServiceWorkerContext(',
    'void ServiceWorkerTaskQueue::RenderProcessForWorkerExited(',
    'void ServiceWorkerTaskQueue::OnWorkerStop(',
]:
    current_source = source
    source = original
    before = function_body(marker)
    source = current_source
    assert function_body(marker) == before, marker
assert (
    '->StartTrackingServiceWorkerRunningInstance(worker_id);\n    return;'
    in function_body('void ServiceWorkerTaskQueue::RendererDidInitializeServiceWorkerContext(')
)
print(f'PASS:3 source/patch pins; {len(markers)} admission routes; process owner/new queue generation; retained observations, unchanged stop/start tracking and per-task dispatch recheck')
