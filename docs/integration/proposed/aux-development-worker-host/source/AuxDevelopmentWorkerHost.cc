#include "AuxDevelopmentWorkerHost.h"
#include "aux-owned-napi-adapter.h"
#include "../../aux-owned-dispatch-lifetime/source/aux-owned-command-dispatcher.h"
#include <node.h>
#include <uv.h>
#include <unistd.h>
#include <pthread.h>
#include <mutex>
#include <unordered_map>
#include <vector>
#include <new>
#include <limits>

extern "C" int32_t AuxCreateSignedDevelopmentOwner(uint64_t*, void**);
extern "C" void AuxReleaseSignedDevelopmentOwner(void*);
extern "C" int32_t AuxCloseDevelopmentOwnerOSAdmission(void*);

namespace {
struct Owner {
  const uint64_t handle;
  void* const retained;
  Owner(uint64_t h, void* r) : handle(h), retained(r) {}
  ~Owner() { AuxReleaseSignedDevelopmentOwner(retained); }
};
struct Worker {
  const uint64_t generation;
  const pid_t process;
  node::Environment* const environment;
  v8::Isolate* const isolate;
  uv_loop_t* const loop;
  const pthread_t thread;
  std::mutex mutex;
  std::shared_ptr<Owner> owner;
  bool terminal = false;
  bool initializing = true;
  bool retiring = false;
  bool cleanup_completed = false;
  bool environment_detached = false;
  Worker(uint64_t g, node::Environment* e, v8::Isolate* i, uv_loop_t* l)
      : generation(g), process(getpid()), environment(e), isolate(i), loop(l), thread(pthread_self()) {}
  AuxDevelopmentWorkerDrain Close() {
    std::shared_ptr<Owner> captured;
    {
      std::lock_guard<std::mutex> lock(mutex);
      terminal = true;
      if (retiring) return AuxDevelopmentWorkerDrain::pending;
      if (!owner) return initializing ? AuxDevelopmentWorkerDrain::pending : AuxDevelopmentWorkerDrain::drained;
      captured = owner;
      retiring = true;
    }
    // No host/worker lock crosses native retirement, OS drain or owner release.
    // A concurrent/reentrant close observes pending instead of deadlocking.
    int32_t status = AuxNativeContextRetire(captured->handle);
    auto result = AuxDevelopmentWorkerDrain::drained;
    if (status == -2) result = AuxDevelopmentWorkerDrain::reentrant;
    else if (status != 0 && status != -1) result = AuxDevelopmentWorkerDrain::pending;
    else {
      const int32_t os = AuxCloseDevelopmentOwnerOSAdmission(captured->retained);
      if (os == 2) result = AuxDevelopmentWorkerDrain::untracked;
      else if (os != 0) result = AuxDevelopmentWorkerDrain::pending;
    }
    {
      std::lock_guard<std::mutex> lock(mutex);
      retiring = false;
      if (result == AuxDevelopmentWorkerDrain::drained) {
        // In-flight factory/attachment is not drained, even if the current
        // handle is already retired. Keep ownership until it unwinds.
        if (initializing) result = AuxDevelopmentWorkerDrain::pending;
        else owner.reset(); // captured retains it until after this lock exits.
      }
    }
    return result;
  }
  bool CanContinue() {
    std::lock_guard<std::mutex> lock(mutex);
    return !terminal;
  }

};
// Process-local real Environment identities, not serializable credentials.
// Active identities are removed at actual cleanup. Dead Environment addresses
// never identify quarantined ownership, even when Node reuses those addresses.
struct ProcessRegistry {
  std::mutex mutex;
  std::unordered_map<node::Environment*, std::shared_ptr<Worker>> active;
  // Reserved before protected initialization, including active generations.
  std::unordered_map<uint64_t, std::shared_ptr<Worker>> retained;
  uint64_t next_generation = 1;
};
ProcessRegistry& Registry() {
  // Intentional process lifetime: native host objects may outlive a module's
  // C++ static-destructor ordering. Pending custody must not be auto-released
  // by global destruction, and a dead global mutex cannot certify teardown.
  static auto* value = new ProcessRegistry;
  return *value;
}
uint64_t NextGeneration() {
  std::lock_guard<std::mutex> lock(Registry().mutex);
  if (Registry().next_generation == std::numeric_limits<uint64_t>::max()) return 0;
  return Registry().next_generation++;
}
void DetachCompletedEnvironment(const std::shared_ptr<Worker>& worker) {
  std::lock_guard<std::mutex> worker_lock(worker->mutex);
  if (!worker->cleanup_completed) return;
  std::lock_guard<std::mutex> lock(Registry().mutex);
  if (!worker->environment_detached) {
    auto entry = Registry().active.find(worker->environment);
    if (entry != Registry().active.end() && entry->second == worker &&
        entry->second->generation == worker->generation) Registry().active.erase(entry);
    worker->environment_detached = true;
  }
  if (!worker->owner && !worker->initializing) Registry().retained.erase(worker->generation);
}
struct Observation {
  napi_env expected;
  node::Environment* environment;
  v8::Isolate* isolate;
  pthread_t thread;
  bool matched = false;
};
napi_value ObserveCurrent(napi_env env, napi_callback_info info) {
  size_t argc = 0;
  void* data = nullptr;
  if (napi_get_cb_info(env, info, &argc, nullptr, nullptr, &data) != napi_ok || !data)
    return nullptr;
  auto* observation = static_cast<Observation*>(data);
  auto* isolate = v8::Isolate::GetCurrent();
  observation->matched = env == observation->expected && isolate == observation->isolate &&
      pthread_equal(pthread_self(), observation->thread) &&
      !isolate->GetCurrentContext().IsEmpty() &&
      node::GetCurrentEnvironment(isolate->GetCurrentContext()) == observation->environment;
  napi_value output = nullptr;
  napi_get_undefined(env, &output);
  return output;
}
bool SameRuntimeEnvironment(napi_env env, node::Environment* environment, v8::Isolate* isolate) {
  // A loop can be shared. Also enter a fresh native-only NAPI function owned by
  // this env, and compare the Environment observed by Node INSIDE that callback
  // with the actual native bootstrap context. No JS-visible function or handle
  // is published, and its stack callback data is used only synchronously.
  Observation observation{env, environment, isolate, pthread_self()};
  napi_value function, receiver, result;
  return napi_create_function(env, "auxObserveWorker", NAPI_AUTO_LENGTH,
      ObserveCurrent, &observation, &function) == napi_ok &&
      napi_get_undefined(env, &receiver) == napi_ok &&
      napi_call_function(env, receiver, function, 0, nullptr, &result) == napi_ok &&
      observation.matched && v8::Isolate::GetCurrent() == isolate &&
      node::GetCurrentEnvironment(isolate->GetCurrentContext()) == environment;
}
void ReleaseAdapterOwner(void* value) {
  delete static_cast<std::shared_ptr<Owner>*>(value);
}
void Cleanup(void* value) {
  auto* retained = static_cast<std::shared_ptr<Worker>*>(value);
  auto worker = *retained;
  worker->Close();
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    worker->cleanup_completed = true;
  }
  // If async custody is still pending/unknown, the process registry deliberately
  // retains this exact owner after env teardown. Never release it as "drained".
  DetachCompletedEnvironment(worker);
  delete retained;
}
class Initialization {
 public:
  explicit Initialization(std::shared_ptr<Worker> value) : worker(std::move(value)) {}
  ~Initialization() { if (!completed) Complete(false); }
  bool Complete(bool success) {
    bool closed;
    {
      std::lock_guard<std::mutex> lock(worker->mutex);
      worker->initializing = false;
      if (!success) worker->terminal = true;
      closed = worker->terminal;
      completed = true;
    }
    if (closed) worker->Close();
    DetachCompletedEnvironment(worker);
    return closed;
  }
 private:
  std::shared_ptr<Worker> worker;
  bool completed = false;
};

}

struct AuxDevelopmentWorkerHost::State {
  const pid_t process = getpid();
  std::mutex mutex;
  bool closed = false;
  std::vector<std::shared_ptr<Worker>> workers;
};
AuxDevelopmentWorkerHost::AuxDevelopmentWorkerHost() : state_(std::make_shared<State>()) {}
AuxDevelopmentWorkerHost::~AuxDevelopmentWorkerHost() { CloseAndDrain(); }

napi_status AuxDevelopmentWorkerHost::RegisterCurrentWorker(napi_env env, napi_value target) {
  if (!env || !target || getpid() != state_->process) return napi_invalid_arg;
  auto* isolate = v8::Isolate::GetCurrent();
  if (!isolate || isolate->GetCurrentContext().IsEmpty()) return napi_generic_failure;
  auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
  auto* loop = node::GetCurrentEventLoop(isolate);
  uv_loop_t* napi_loop = nullptr;
  // Both observations come from runtime APIs on this actual native callback.
  if (!environment || !loop || napi_get_uv_event_loop(env, &napi_loop) != napi_ok ||
      napi_loop != loop || !SameRuntimeEnvironment(env, environment, isolate))
    return napi_generic_failure;
  std::unique_lock<std::mutex> host_lock(state_->mutex);
  if (state_->closed) return napi_closing;
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Worker>* cleanup_retain = nullptr;
  try {
    uint64_t generation = NextGeneration();
    if (!generation) return napi_generic_failure;
    worker = std::make_shared<Worker>(generation, environment, isolate, loop);
    cleanup_retain = new std::shared_ptr<Worker>(worker);
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      if (Registry().active.count(environment)) { delete cleanup_retain; return napi_generic_failure; }
      Registry().active.emplace(environment, worker);
      Registry().retained.emplace(worker->generation, worker);
    }
    state_->workers.push_back(worker);
  } catch (...) {
    delete cleanup_retain;
    if (worker) {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      auto entry = Registry().active.find(environment);
      if (entry != Registry().active.end() && entry->second == worker) Registry().active.erase(entry);
      Registry().retained.erase(worker->generation);
    }
    return napi_generic_failure;
  }
  host_lock.unlock();
  Initialization initialization(worker);
  // Install lifetime ownership before any protected factory. Failure stays
  // reserved/closed for this environment rather than permitting a new attempt.
  napi_status status = napi_add_env_cleanup_hook(env, Cleanup, cleanup_retain);
  if (status != napi_ok) {
    // NAPI failure did not register ownership. The current actual Node
    // Environment still supports its native cleanup hook; preserve the failed
    // reservation until teardown without leaking the record or retrying it.
    node::AddEnvironmentCleanupHook(isolate, Cleanup, cleanup_retain);
    return status;
  }
  if (!worker->CanContinue()) return napi_closing;
  uint64_t handle = 0;
  void* retained_owner = nullptr;
  int32_t prepared = AuxCreateSignedDevelopmentOwner(&handle, &retained_owner);
  if (prepared || !handle || !retained_owner) {
    if (handle) AuxNativeContextRetire(handle);
    if (retained_owner) AuxReleaseSignedDevelopmentOwner(retained_owner);
    return napi_generic_failure;
  }
  std::shared_ptr<Owner> captured;
  try { captured = std::make_shared<Owner>(handle, retained_owner); }
  catch (...) {
    AuxNativeContextRetire(handle);
    AuxReleaseSignedDevelopmentOwner(retained_owner);
    return napi_generic_failure;
  }
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    worker->owner = captured;
  }
  // A factory finishing after host close is retained only for retirement;
  // it must never reach the NAPI attachment/publication path.
  if (!worker->CanContinue()) return napi_closing;
  auto* adapter_retain = new (std::nothrow) std::shared_ptr<Owner>(captured);
  if (!adapter_retain) return napi_generic_failure;
  // DefineProperty may synchronously execute a Proxy trap. There is NO host
  // or worker mutex held here. Close retires captured's handle immediately,
  // reports pending while initialization is active, and cannot be bypassed by
  // a trap retaining the function object. Completion refuses success if closed.
  status = AuxAttachOwnedDispatcher(env, target, handle, adapter_retain, ReleaseAdapterOwner);
  const bool closed = initialization.Complete(status == napi_ok);
  return status == napi_ok && closed ? napi_closing : status;

}

AuxDevelopmentWorkerDrain AuxDevelopmentWorkerHost::CloseAndDrain() {
  if (getpid() != state_->process) return AuxDevelopmentWorkerDrain::wrongProcess;
  std::vector<std::shared_ptr<Worker>> workers;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    state_->closed = true;
    workers = state_->workers;
  }
  auto result = AuxDevelopmentWorkerDrain::drained;
  for (auto& worker : workers) {
    auto status = worker->Close();
    DetachCompletedEnvironment(worker);
    if (status == AuxDevelopmentWorkerDrain::untracked ||
        (status == AuxDevelopmentWorkerDrain::reentrant && result != AuxDevelopmentWorkerDrain::untracked) ||
        (status == AuxDevelopmentWorkerDrain::pending && result == AuxDevelopmentWorkerDrain::drained)) result = status;
  }
  return result;
}
