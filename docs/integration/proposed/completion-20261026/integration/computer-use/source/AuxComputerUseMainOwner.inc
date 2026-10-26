// Include at global scope after the real host's private Worker definitions.
#include "AuxSelectedAccountScope.h"
// Native-only sealed control-root metadata; this is not a launch admission API.
extern "C" int32_t AuxCopyAuthenticatedMemoryControlParent(
    char* output, uint32_t capacity, uint32_t* count_including_nul);
struct AuxComputerUseNativeOwner::State {
  const pid_t process = getpid();
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
  uint64_t account_owner = 0;
  bool released = false;
  std::mutex mutex;
};
AuxComputerUseNativeOwner::AuxComputerUseNativeOwner(std::shared_ptr<State> state)
    : state_(std::move(state)) {}
AuxComputerUseNativeOwner::~AuxComputerUseNativeOwner() = default;
std::shared_ptr<AuxComputerUseNativeOwner> AuxComputerUseNativeOwner::Capture(napi_env env, int64_t account, const uint8_t* expected, uint32_t count) {
  if (!kBrowserOnlyNativeStartup || getpid() != kHostProcess || account < 0 ||
      account > 9'007'199'254'740'991LL) return {};
  auto* isolate = v8::Isolate::GetCurrent();
  if (!isolate || isolate->GetCurrentContext().IsEmpty()) return {};
  auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
  if (!environment || !SameRuntimeEnvironment(env, environment, isolate)) return {};
  std::shared_ptr<Worker> worker;
  {
    std::lock_guard<std::mutex> lock(Registry().mutex);
    const auto found = Registry().active.find(environment);
    if (found == Registry().active.end()) return {};
    worker = found->second;
  }
  auto state = std::make_shared<State>();
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    if (!worker->ordinary_main_service || !CurrentWorker(*worker) ||
        worker->terminal || worker->initializing || worker->environment_detached ||
        !worker->owner) return {};
    state->worker = worker;
    state->owner = worker->owner;
  }
  if (AuxCaptureSelectedAccount(state->owner->handle, account, expected, count,
                                  &state->account_owner) != 0 || !state->account_owner)
    return {};
  auto result = std::shared_ptr<AuxComputerUseNativeOwner>(new AuxComputerUseNativeOwner(state));
  if (!result->Current()) { result->SettlePhysical(); return {}; } // No child can exist yet.
  return result;
}
bool AuxComputerUseNativeOwner::Current() const {
  if (getpid() != state_->process) return false;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    if (state_->released || !state_->account_owner) return false;
  }
  {
    std::lock_guard<std::mutex> lock(state_->worker->mutex);
    const auto& worker = *state_->worker;
    if (!worker.ordinary_main_service || worker.terminal || worker.initializing ||
        worker.environment_detached || worker.owner != state_->owner) return false;
  }
  return AuxSelectedAccountStopRequested(state_->owner->handle, state_->account_owner) == 0 &&
      AuxValidateSelectedAccount(state_->owner->handle, state_->account_owner) == 0;
}
int AuxComputerUseNativeOwner::DuplicateTaskAccountDirectory() const {
  if (!Current()) return -1;
  int32_t descriptor = -1;
  if (AuxCopySelectedAccountDirectory(state_->owner->handle, state_->account_owner, 2,
                                      &descriptor) != 0) {
    if (descriptor >= 0) close(descriptor);
    return -1;
  }
  if (!Current()) { close(descriptor); return -1; }
  return descriptor;
}
bool AuxComputerUseNativeOwner::CopyStorageRoots(int32_t* control, int32_t* task, uint64_t* generation) const {
  if (!control || !task || !generation) return false;
  *control = -1; *task = -1; *generation = 0;
  if (!Current() || AuxNativeContextCopyStorageRoots(state_->owner->handle, generation,
                                                   control, task) != 0) return false;
  return *control >= 0 && *task >= 0 && *control != *task && *generation && Current();
}
bool AuxComputerUseNativeOwner::CopyBrowserRoot(uint32_t role, int32_t* descriptor, uint64_t* generation) const {
  if (!descriptor || !generation) return false;
  *descriptor = -1; *generation = 0;
  return Current() && AuxNativeContextCopyBrowserRoot(state_->owner->handle, role,
                                                    generation, descriptor) == 0 &&
      *descriptor >= 0 && *generation && Current();
}
bool AuxComputerUseNativeOwner::CopyPrivateParent(char* output, uint32_t capacity, uint32_t* count) const {
  return Current() && AuxCopyAuthenticatedMemoryControlParent(output, capacity, count) == 0 && Current();
}
const void* AuxComputerUseNativeOwner::WorkerKey() const { return state_->worker.get(); }
bool AuxComputerUseNativeOwner::PrepareLaunch() {
  return Current() && AuxPrepareComputerUseAccountLaunch(state_->owner->handle,state_->account_owner)==0;
}
bool AuxComputerUseNativeOwner::PublishSuspended(pid_t pid) {
  return Current() && AuxPublishSuspendedComputerUseAccountLaunch(state_->owner->handle,state_->account_owner,pid)==0 && Current();
}
// Caller already holds this exact helper's durable prepared/spawned lease.
// No Swift/JS/provider callback crosses the native Worker admission lock.
int AuxComputerUseNativeOwner::SpawnStoppedAfterPrepared(pid_t* pid,
    const posix_spawn_file_actions_t* actions,const posix_spawnattr_t* attributes,
    char* const argv[],char* const environment[]) const {
  if(getpid()!=state_->process)return ECANCELED;
  std::lock_guard<std::mutex> lock(state_->worker->mutex);
  const auto& worker=*state_->worker;
  if(!worker.ordinary_main_service||worker.terminal||worker.initializing||
      worker.environment_detached||worker.owner!=state_->owner)return ECANCELED;
  return posix_spawn(pid,"/usr/bin/sandbox-exec",actions,attributes,argv,environment);
}
bool AuxComputerUseNativeOwner::ResumeStoppedAfterPublished(pid_t pid) const {
  if(getpid()!=state_->process||pid<=1)return false;
  std::lock_guard<std::mutex> lock(state_->worker->mutex);
  const auto& worker=*state_->worker;
  return worker.ordinary_main_service&&!worker.terminal&&!worker.initializing&&
      !worker.environment_detached&&worker.owner==state_->owner&&kill(pid,SIGCONT)==0;
}
bool AuxComputerUseNativeOwner::SettlePhysical(pid_t pid,int wait_status,int spawn_error) {
  if (getpid() != state_->process) return false;
  uint64_t lease = 0;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    if (state_->released) return true;
    lease = state_->account_owner;
  }
  // Only fixed process owner invokes this after native no-child proof or the
  // original reaper+stdio closure+thread join. A JS ACK never reaches it.
  if (AuxObserveComputerUseAccountTerminal(state_->owner->handle,lease,pid,wait_status,spawn_error)!=0 ||
      AuxReleaseRegisteredComputerUseAccount(state_->owner->handle, lease) != 0) return false;
  std::lock_guard<std::mutex> lock(state_->mutex);
  state_->released = true;
  return true;
}
