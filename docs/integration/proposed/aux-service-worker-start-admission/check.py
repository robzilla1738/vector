#!/usr/bin/env python3
"""Execute production gate/owner/start/retry bodies with captured worker boundaries."""
from pathlib import Path

import subprocess, tempfile, json

PROPOSAL_ROOT = Path(__file__).resolve().parent
source = (PROPOSAL_ROOT / 'source/extensions/browser/service_worker/service_worker_task_queue.cc').read_text()


def function_body(marker):
    start = source.index(marker)
    brace = source.index('{', start)
    depth = 1
    cursor = brace + 1
    while depth:
        depth += (source[cursor] == '{') - (source[cursor] == '}')
        cursor += 1
    return source[start:cursor]


owner = source[source.index('struct ProcessWorkerStartAdmission {'):source.index('\n}  // namespace',
    source.index('struct ProcessWorkerStartAdmission {'))]
methods = [function_body(marker) for marker in [
    'bool ServiceWorkerTaskQueue::CanAdmitStart()',
    'ServiceWorkerTaskQueue::QueueStartAdmissionSnapshot\nServiceWorkerTaskQueue::InspectQueueStartAdmission()',
    'void ServiceWorkerTaskQueue::CloseQueueStartAdmission()',
    'ServiceWorkerTaskQueue::ProcessStartAdmissionSnapshot\nServiceWorkerTaskQueue::InspectStartAdmissionForMigration()',
    'ServiceWorkerTaskQueue::ProcessStartAdmissionSnapshot\nServiceWorkerTaskQueue::CloseStartAdmissionForMigration()',
    'void ServiceWorkerTaskQueue::MaybeStartWorker(',
    'void ServiceWorkerTaskQueue::RetryStartWorker(',
]]
preamble = r'''
#include <cassert>
#include <cstdint>
#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <optional>
#include <set>
#include <vector>
#include "extensions/browser/service_worker/service_worker_start_admission.h"
#define DCHECK_CURRENTLY_ON(...) ((void)0)
#define DCHECK(x) assert(x)
#define CHECK(x) assert(x)
namespace base {template<class T> class NoDestructor {T value;public:T& operator*(){return value;}};}
namespace extensions {
struct SequencedContextId {int extension_id;int token;bool operator<(const SequencedContextId& b)const{return token<b.token;}};
struct BrowserContext {int token;int UniqueToken()const{return token;}};
struct Worker {bool starting=false,ready=false;std::optional<int> id;int starts=0;bool IsStarting()const{return starting;}bool IsReady()const{return ready;}std::optional<int> worker_id()const{return id;}void StartWorker(const SequencedContextId&){++starts;starting=true;}};
using ServiceWorkerState=Worker;
struct TestObserver {void RequestedWorkerStart(int){}};
TestObserver* g_test_observer=nullptr;
class ServiceWorkerTaskQueue {
public:
 struct WorkerAdmissionObservation {SequencedContextId context_id;std::optional<int> worker_id;bool starting;bool ready;};
 struct QueueStartAdmissionSnapshot {int browser_context_token;uint64_t captured_generation;std::vector<WorkerAdmissionObservation> workers,retired_workers;size_t pending_tasks=0,registration_callbacks=0,verification_callbacks=0,pending_storage_registrations=0,pending_unregistrations=0;std::vector<int> closed_registration_results,closed_verification_results;};
 struct ProcessStartAdmissionSnapshot {bool admission_open;uint64_t generation;std::vector<QueueStartAdmissionSnapshot> queues,destroyed_queues;};
 static ProcessStartAdmissionSnapshot CloseStartAdmissionForMigration();
 static ProcessStartAdmissionSnapshot InspectStartAdmissionForMigration();
 bool CanAdmitStart()const;
 QueueStartAdmissionSnapshot InspectQueueStartAdmission()const;
 void CloseQueueStartAdmission();
 void MaybeStartWorker(Worker*,const SequencedContextId&);
 void RetryStartWorker(const SequencedContextId&);
 ServiceWorkerTaskQueue(BrowserContext*);
 ~ServiceWorkerTaskQueue();
 bool IsCurrentActivation(int,int)const{return current;}
 Worker* GetWorkerState(const SequencedContextId& id){return worker_state_map_.at(id).get();}
 bool HasPendingTasks(const SequencedContextId& id){return !pending_tasks_map_[id].empty();}
 void EmitWorkerWillBeStartedHistograms(int){++metrics;}
 uint64_t start_admission_generation_;BrowserContext* browser_context_;
 bool current=true;int metrics=0;
 size_t registration_callbacks_=0,verification_callbacks_=0;std::vector<int> closed_registration_results_,closed_verification_results_;
 std::map<SequencedContextId,std::unique_ptr<Worker>> worker_state_map_;
 std::vector<WorkerAdmissionObservation> retired_worker_observations_;
 std::map<SequencedContextId,std::vector<int>> pending_tasks_map_;
 std::map<int,int> worker_start_retries_,worker_registration_retries_,worker_unregistration_wait_retries_,pending_storage_registrations_,pending_unregistrations_;
};
'''
# Keep the real constructor registration and generation capture.
constructor = function_body('ServiceWorkerTaskQueue::ServiceWorkerTaskQueue(BrowserContext* browser_context)')
# The destructor below captures observer teardown; its production body is
# source-checked and compiled by the separate real-TU check.
fixture = preamble + owner + '\n' + constructor + '\n' + '\n'.join(methods) + r'''
ServiceWorkerTaskQueue::~ServiceWorkerTaskQueue(){auto& o=WorkerStartAdmissionOwner();o.destroyed.push_back(InspectQueueStartAdmission());o.queues.erase(this);}
}
int main(){using namespace extensions;int checks=0;auto check=[&](bool v){assert(v);++checks;};
 ServiceWorkerStartAdmission local;check(local.Accepts(1));check(!local.Accepts(2));local.Close();check(!local.Accepts(1));check(!local.Accepts(2));local.Close();check(local.generation()==2);
 BrowserContext a{101},b{202};SequencedContextId id{3,4};
 auto q=std::make_unique<ServiceWorkerTaskQueue>(&a);check(q->CanAdmitStart());q->worker_state_map_[id]=std::make_unique<Worker>();auto* w=q->GetWorkerState(id);
 q->pending_tasks_map_[id]={1,2};q->MaybeStartWorker(w,id);check(w->starts==1);q->MaybeStartWorker(w,id);check(w->starts==1);
 w->starting=false;q->worker_start_retries_[4]=1;q->RetryStartWorker(id);check(w->starts==2);
 q->registration_callbacks_=1;q->verification_callbacks_=1;q->worker_registration_retries_[4]=1;
 auto snap=ServiceWorkerTaskQueue::CloseStartAdmissionForMigration();check(!snap.admission_open&&snap.generation==2);check(snap.queues.size()==1);check(snap.queues[0].workers[0].starting);check(snap.queues[0].pending_tasks==2);check(snap.queues[0].registration_callbacks==1&&snap.queues[0].verification_callbacks==1);check(q->worker_start_retries_.empty()&&q->worker_registration_retries_.empty());
 w->starting=false;q->MaybeStartWorker(w,id);q->RetryStartWorker(id);check(w->starts==2);check(!q->CanAdmitStart());
 auto future=std::make_unique<ServiceWorkerTaskQueue>(&b);check(!future->CanAdmitStart());future->MaybeStartWorker(w,id);future->RetryStartWorker(id);check(w->starts==2);check(future->start_admission_generation_==2);
 w->id=77;w->ready=true;snap=ServiceWorkerTaskQueue::InspectStartAdmissionForMigration();bool seen=false;for(const auto& x:snap.queues)for(const auto& y:x.workers)seen|=y.worker_id==77&&y.ready;check(seen);
 q.reset();snap=ServiceWorkerTaskQueue::CloseStartAdmissionForMigration();check(snap.generation==2);check(snap.destroyed_queues.size()==1&&snap.destroyed_queues[0].workers[0].worker_id==77);check(snap.queues.size()==1);
 std::cout<<"PASS:"<<checks<<" production gate/owner/start/retry checks; captured workers, no actual worker launch\n";
}
'''
with tempfile.TemporaryDirectory(prefix='aux-sw-admission-check-') as temporary_directory:
    fixture_path = Path(temporary_directory) / 'check.cc'
    fixture_path.write_text(fixture)
    executable = Path(temporary_directory) / 'check'
    subprocess.run(
        [
            'clang++',
            '-std=c++20',
            '-Wall',
            '-Wextra',
            '-Werror',
            '-I' + str(PROPOSAL_ROOT / 'source'),
            str(fixture_path),
            '-o',
            str(executable),
        ],
        check=True,
    )
    subprocess.run([str(executable)], check=True)
