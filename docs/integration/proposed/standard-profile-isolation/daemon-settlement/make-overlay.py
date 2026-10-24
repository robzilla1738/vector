from pathlib import Path
import hashlib,json,difflib
root=Path(__file__).resolve().parent
repo=root.parents[4]
inputs={
 'AuxDevelopmentWorkerHost.cc':repo/'docs/integration/proposed/standard-profile-isolation/runtime-publication/source/AuxDevelopmentWorkerHost.cc',
 'AuxDevelopmentOwnerDrain.swift':repo/'docs/integration/proposed/aux-development-worker-host/source/AuxDevelopmentOwnerDrain.swift',
 'AuxNativeNodeRunner.cc':repo/'docs/integration/proposed/aux-native-node-runner/source/AuxNativeNodeRunner.cc',
}
changes=[]; originals={n:p.read_text() for n,p in inputs.items()}; outputs=dict(originals)
def edit(n,a,b):
 assert outputs[n].count(a)==1,(n,a[:100],outputs[n].count(a))
 outputs[n]=outputs[n].replace(a,b,1);changes.append({'path':n,'find':a,'replace':b,'count':1})
n='AuxDevelopmentWorkerHost.cc'
edit(n,'extern "C" int32_t AuxCloseDevelopmentOwnerOSAdmission(void*);','extern "C" int32_t AuxCloseDevelopmentOwnerOSAdmission(void*);\nextern "C" int32_t AuxCompleteDevelopmentOwnerBrowserCleanShutdown(void*);')
edit(n,'struct Worker {','''struct HostCleanObservation {
  std::mutex mutex;
  bool admission_closed = false;
  bool factory_settled = false;
  bool images_settled = false;
  bool unknown = false;
};
struct Worker {''')
edit(n,'  bool environment_detached = false;','  bool environment_detached = false;\n  bool main_loop_returned = false;')
edit(n,'  uint64_t next_generation = 1;','  uint64_t next_generation = 1;\n  bool native_shutdown_closed = false;\n  std::vector<std::shared_ptr<HostCleanObservation>> hosts;')
edit(n,'  if (Registry().next_generation == std::numeric_limits<uint64_t>::max()) return 0;','  if (Registry().native_shutdown_closed || Registry().next_generation == std::numeric_limits<uint64_t>::max()) return 0;')
edit(n,'#include "AuxRuntimePublicationNapi.inc"','#include "AuxRuntimePublicationNapi.inc"\n#include "AuxStandardCleanSettlement.inc"')
edit(n,'// These are native producer entry points only.','''extern "C" int32_t AuxDevelopmentOwnerCleanSettlementStatus(void* owner) noexcept {
  return ObserveOwnerCleanSettlement(owner);
}
extern "C" void AuxObserveDevelopmentMainLoopReturned() noexcept {
  ObserveMainLoopReturned();
}

// These are native producer entry points only.''')
edit(n,'  State() = default;','''  std::shared_ptr<HostCleanObservation> clean = std::make_shared<HostCleanObservation>();
  State() {
    std::lock_guard<std::mutex> lock(Registry().mutex);
    closed = Registry().native_shutdown_closed;
    Registry().hosts.push_back(clean);
  }''')
edit(n,'  explicit State(uint64_t provider) {','  explicit State(uint64_t provider) : State() {')
edit(n,'    if (!provider || AuxRetainPreparedFreshRuntimeProvider(provider)) closed = true;','    if (closed || !provider || AuxRetainPreparedFreshRuntimeProvider(provider)) closed = true;')
edit(n,'      if (Registry().active.count(environment)) { delete cleanup_retain; return napi_generic_failure; }','      if (Registry().native_shutdown_closed || Registry().active.count(environment)) { delete cleanup_retain; return napi_closing; }')
edit(n,'  size_t worker_count;','''  {
    std::lock_guard<std::mutex> lock(Registry().mutex);
    Registry().native_shutdown_closed = true;
  }
  size_t worker_count;''')
edit(n,'  auto result = AuxDevelopmentWorkerDrain::drained;\n  if (state_->prepared_fresh_provider) {','''  auto result = AuxDevelopmentWorkerDrain::drained;
  {
    std::lock_guard<std::mutex> lock(state_->clean->mutex);
    state_->clean->admission_closed = true;
  }
  if (state_->prepared_fresh_provider) {''')
edit(n,'  for (size_t i = 0; i < worker_count; ++i) {','''  {
    std::lock_guard<std::mutex> lock(state_->clean->mutex);
    state_->clean->factory_settled = result == AuxDevelopmentWorkerDrain::drained;
    state_->clean->images_settled = result == AuxDevelopmentWorkerDrain::drained;
    if (result != AuxDevelopmentWorkerDrain::drained &&
        result != AuxDevelopmentWorkerDrain::pending) state_->clean->unknown = true;
  }
  for (size_t i = 0; i < worker_count; ++i) {''')
# Insert at the exact last method tail, preserving all original census outcomes.
edit(n,'''    result = AuxMergeWorkerDrain(result, worker->Close(true));
    DetachCompletedEnvironment(worker);
  }
  return result;
}''','''    result = AuxMergeWorkerDrain(result, worker->Close(true));
    DetachCompletedEnvironment(worker);
  }
  // Browser grant retirement intentionally remains pending until the real
  // browser peer proves teardown. Retain each exact Owner across Swift/FS work;
  // never hold a native host/Worker mutex across this callback.
  for (size_t i = 0; i < worker_count; ++i) {
    std::shared_ptr<Worker> worker;
    { std::lock_guard<std::mutex> lock(state_->mutex); worker = state_->workers[i]; }
    std::shared_ptr<Owner> owner;
    { std::lock_guard<std::mutex> lock(worker->mutex); owner = worker->owner; }
    if (owner && ObserveOwnerCleanSettlement(owner->retained) == 0) {
      const int32_t clean = AuxCompleteDevelopmentOwnerBrowserCleanShutdown(owner->retained);
      if (clean == 2 || clean < 0) {
        std::lock_guard<std::mutex> lock(worker->mutex);
        worker->retirement_failure = AuxDevelopmentWorkerDrain::untracked;
      }
    }
  }
  // Recompute instead of permanently merging a pre-ACK pending observation.
  result = AuxDevelopmentWorkerDrain::drained;
  {
    std::lock_guard<std::mutex> lock(state_->clean->mutex);
    if (state_->clean->unknown) result = AuxDevelopmentWorkerDrain::untracked;
    else if (!state_->clean->factory_settled || !state_->clean->images_settled)
      result = AuxDevelopmentWorkerDrain::pending;
  }
  for (size_t i = 0; i < worker_count; ++i) {
    std::shared_ptr<Worker> worker;
    { std::lock_guard<std::mutex> lock(state_->mutex); worker = state_->workers[i]; }
    result = AuxMergeWorkerDrain(result, worker->Close(true));
    DetachCompletedEnvironment(worker);
  }
  return result;
}''')
n='AuxDevelopmentOwnerDrain.swift'
edit(n,'import Foundation','''import Foundation
@_silgen_name("AuxDevelopmentOwnerCleanSettlementStatus")
private func observeNativeCleanSettlement(_ pointer:UnsafeMutableRawPointer)->Int32

@_cdecl("AuxCompleteDevelopmentOwnerBrowserCleanShutdown")
func auxCompleteDevelopmentOwnerBrowserCleanShutdown(_ pointer:UnsafeMutableRawPointer?)->Int32 {
    guard let pointer else{return -1}
    // Validate native registry membership before interpreting the pointer.
    let status=observeNativeCleanSettlement(pointer)
    guard status==0 else{return status}
    let owner=Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).takeUnretainedValue()
    do { try owner.completeBrowserCleanShutdown(); return 0 }
    catch AuxDispatcherLifetimeError.retiring { return 1 }
    catch AuxDispatcherLifetimeError.reentrantRetirement { return 1 }
    catch { return 2 }
}''')
n='AuxNativeNodeRunner.cc'
edit(n,'#include <optional>','#include <optional>\nextern "C" void AuxObserveDevelopmentMainLoopReturned() noexcept;')
edit(n,'  if (requested_exit->has_value()) exit_code = **requested_exit;','''  // This native stack never executes JS again after the actual event loop
  // returned. Setup remains retained through physical cleanup and clean ACK.
  if (loaded) AuxObserveDevelopmentMainLoopReturned();
  if (requested_exit->has_value()) exit_code = **requested_exit;''')
rows=[]
for n,p in inputs.items():
 out=root/'source'/n;out.write_text(outputs[n])
 (root/(n+'.patch')).write_text(''.join(difflib.unified_diff(originals[n].splitlines(True),outputs[n].splitlines(True),fromfile='baseline/'+n,tofile='source/'+n)))
 rows.append({'name':n,'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'outputSha256':hashlib.sha256(out.read_bytes()).hexdigest()})
(root/'inputs.json').write_text(json.dumps({'format':'aux.standard-daemon-settlement.inputs.v1','sources':rows},indent=2)+'\n')
(root/'overlay.json').write_text(json.dumps({'format':'aux.standard-daemon-settlement.overlay.v1','changes':changes},indent=2)+'\n')
print(json.dumps({'changedFiles':len(rows),'countedChanges':len(changes),'sourceReplay':True,'compiled':False,'productExecuted':False}))
