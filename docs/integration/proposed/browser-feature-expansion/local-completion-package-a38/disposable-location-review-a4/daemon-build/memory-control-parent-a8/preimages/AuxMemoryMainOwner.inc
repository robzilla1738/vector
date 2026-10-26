// Include at global scope after the real host's private Worker definitions.
#include "AuxRegisteredMemoryAccountOwner.h"
struct AuxMemoryNativeOwner::State {
  const pid_t process = getpid();
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
  uint64_t account_owner = 0;
  bool released = false;
  std::mutex mutex;
};
AuxMemoryNativeOwner::AuxMemoryNativeOwner(std::shared_ptr<State> state)
    : state_(std::move(state)) {}
AuxMemoryNativeOwner::~AuxMemoryNativeOwner() = default;
std::shared_ptr<AuxMemoryNativeOwner> AuxMemoryNativeOwner::Capture(napi_env env, int64_t account) {
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
  if (AuxCaptureRegisteredMemoryAccount(state->owner->handle, account,
                                       &state->account_owner) != 0 || !state->account_owner)
    return {};
  auto result = std::shared_ptr<AuxMemoryNativeOwner>(new AuxMemoryNativeOwner(state));
  if (!result->Current()) { result->SettlePhysical(); return {}; } // No child can exist yet.
  return result;
}
bool AuxMemoryNativeOwner::Current() const {
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
  return AuxValidateRegisteredMemoryAccount(state_->owner->handle, state_->account_owner) == 0;
}
int AuxMemoryNativeOwner::DuplicateMemoryDirectory() const {
  if (!Current()) return -1;
  int32_t descriptor = -1;
  if (AuxCopyRegisteredMemoryDirectory(state_->owner->handle, state_->account_owner,
                                     &descriptor) != 0) {
    if (descriptor >= 0) close(descriptor);
    return -1;
  }
  if (!Current()) { close(descriptor); return -1; }
  return descriptor;
}
bool AuxMemoryNativeOwner::CopyStorageRoots(int32_t* control, int32_t* task, uint64_t* generation) const {
  if (!control || !task || !generation) return false;
  *control = -1; *task = -1; *generation = 0;
  if (!Current() || AuxNativeContextCopyStorageRoots(state_->owner->handle, generation,
                                                   control, task) != 0) return false;
  return *control >= 0 && *task >= 0 && *control != *task && *generation && Current();
}
bool AuxMemoryNativeOwner::CopyBrowserRoot(uint32_t role, int32_t* descriptor, uint64_t* generation) const {
  if (!descriptor || !generation) return false;
  *descriptor = -1; *generation = 0;
  return Current() && AuxNativeContextCopyBrowserRoot(state_->owner->handle, role,
                                                    generation, descriptor) == 0 &&
      *descriptor >= 0 && *generation && Current();
}
bool AuxMemoryNativeOwner::CopyPrivateParent(char* output, uint32_t capacity, uint32_t* count) const {
  return Current() && AuxCopyAuthenticatedExecPrivateParent(output, capacity, count) == 0 && Current();
}
const void* AuxMemoryNativeOwner::WorkerKey() const { return state_->worker.get(); }
bool AuxMemoryNativeOwner::PrepareLaunch() {
  return Current() && AuxPrepareMemoryAccountLaunch(state_->owner->handle,state_->account_owner)==0;
}
bool AuxMemoryNativeOwner::PublishSuspended(pid_t pid) {
  return Current() && AuxPublishSuspendedMemoryAccountLaunch(state_->owner->handle,state_->account_owner,pid)==0 && Current();
}
// Caller already holds this exact helper's durable prepared/spawned lease.
// No Swift/JS/provider callback crosses the native Worker admission lock.
int AuxMemoryNativeOwner::SpawnStoppedAfterPrepared(pid_t* pid,
    const posix_spawn_file_actions_t* actions,const posix_spawnattr_t* attributes,
    char* const argv[],char* const environment[]) const {
  if(getpid()!=state_->process)return ECANCELED;
  std::lock_guard<std::mutex> lock(state_->worker->mutex);
  const auto& worker=*state_->worker;
  if(!worker.ordinary_main_service||worker.terminal||worker.initializing||
      worker.environment_detached||worker.owner!=state_->owner)return ECANCELED;
  return posix_spawn(pid,"/usr/bin/sandbox-exec",actions,attributes,argv,environment);
}
bool AuxMemoryNativeOwner::ResumeStoppedAfterPublished(pid_t pid) const {
  if(getpid()!=state_->process||pid<=1)return false;
  std::lock_guard<std::mutex> lock(state_->worker->mutex);
  const auto& worker=*state_->worker;
  return worker.ordinary_main_service&&!worker.terminal&&!worker.initializing&&
      !worker.environment_detached&&worker.owner==state_->owner&&kill(pid,SIGCONT)==0;
}
bool AuxMemoryNativeOwner::SettlePhysical(pid_t pid,int wait_status,int spawn_error) {
  if (getpid() != state_->process) return false;
  uint64_t lease = 0;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    if (state_->released) return true;
    lease = state_->account_owner;
  }
  // Only fixed process owner invokes this after native no-child proof or the
  // original reaper+stdio closure+thread join. A JS ACK never reaches it.
  if (AuxObserveMemoryAccountTerminal(state_->owner->handle,lease,pid,wait_status,spawn_error)!=0 ||
      AuxReleaseRegisteredMemoryAccount(state_->owner->handle, lease) != 0) return false;
  std::lock_guard<std::mutex> lock(state_->mutex);
  state_->released = true;
  return true;
}
static napi_value MemoryRegistryTarget(napi_env env,napi_callback_info info,bool finish) {
  auto refuse = [env]() -> napi_value {
    napi_throw_error(env, "AUX_MEMORY_ACCOUNT_PUBLICATION_BUSY",
        "Account memory is still closing or its native registry owner is unavailable");
    return nullptr;
  };
  if (!kBrowserOnlyNativeStartup || getpid() != kHostProcess) return refuse();
  size_t argc = 1; napi_value value;
  if (napi_get_cb_info(env, info, &argc, &value, nullptr, nullptr) != napi_ok || argc != 1)
    return refuse();
  bool buffer = false; void* data = nullptr; size_t count = 0;
  if (napi_is_buffer(env, value, &buffer) != napi_ok || !buffer ||
      napi_get_buffer_info(env, value, &data, &count) != napi_ok || !data ||
      !count || count > 4 * 1024 * 1024) return refuse();
  auto* isolate = v8::Isolate::GetCurrent();
  if (!isolate || isolate->GetCurrentContext().IsEmpty()) return refuse();
  auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
  if (!environment || !SameRuntimeEnvironment(env, environment, isolate)) return refuse();
  std::shared_ptr<Worker> worker;
  {
    std::lock_guard<std::mutex> lock(Registry().mutex);
    const auto found = Registry().active.find(environment);
    if (found == Registry().active.end()) return refuse();
    worker = found->second;
  }
  std::shared_ptr<Owner> owner;
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    if (!worker->ordinary_main_service || !CurrentWorker(*worker) || worker->terminal ||
        worker->initializing || worker->environment_detached || !worker->owner) return refuse();
    owner = worker->owner;
  }
  const int32_t status=finish
      ? AuxFinishRegisteredMemoryRegistryTarget(owner->handle,static_cast<const uint8_t*>(data),static_cast<uint32_t>(count))
      : AuxValidateRegisteredMemoryRegistryTarget(owner->handle,static_cast<const uint8_t*>(data),static_cast<uint32_t>(count));
  if(status!=0){if(!finish&&status==1)AuxRequestAccountMemoryStopForWorker(worker.get());return refuse();}
  napi_value result;
  return napi_get_undefined(env, &result) == napi_ok ? result : nullptr;
}

napi_value AuxValidateMemoryRegistryTarget(napi_env env,napi_callback_info info){return MemoryRegistryTarget(env,info,false);}
napi_value AuxFinishMemoryRegistryTarget(napi_env env,napi_callback_info info){return MemoryRegistryTarget(env,info,true);}
