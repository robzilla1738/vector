#include "AuxNativeEnvironmentPreload.h"

#include <map>
#include <limits>
#include <mutex>
#include <stdexcept>
#include <utility>
#include <vector>
#include <unistd.h>

namespace {
constexpr char kBinding[] = "aux_owned_native";
struct EnvironmentRecord {
  node::Environment* environment;
  std::shared_ptr<AuxDevelopmentWorkerHost> host;
  bool attempted = false;
  bool closed = false;
};
struct NativeRegistry {
  const pid_t process = getpid();
  std::mutex mutex;
  std::map<node::Environment*, std::shared_ptr<EnvironmentRecord>> environments;
  std::vector<std::shared_ptr<AuxDevelopmentWorkerHost>> undrained;
};
NativeRegistry& Registry() {
  static auto* registry = new NativeRegistry;
  return *registry;
}
void ThrowPreload(v8::Isolate* isolate) {
  isolate->ThrowException(v8::Exception::Error(
      v8::String::NewFromUtf8Literal(isolate, "Aux native preload refused")));
}
void CleanupEnvironment(void* pointer) {
  std::unique_ptr<std::shared_ptr<EnvironmentRecord>> retain(
      static_cast<std::shared_ptr<EnvironmentRecord>*>(pointer));
  auto& registry = Registry();
  if (getpid() != registry.process) return;
  std::lock_guard<std::mutex> lock(registry.mutex);
  (*retain)->closed = true;
  auto found = registry.environments.find((*retain)->environment);
  if (found != registry.environments.end() && found->second == *retain)
    registry.environments.erase(found);
  // Other environments retain the same host. Its own cleanup hooks retire
  // their actual owner; never close the process host for one environment exit.
}
napi_value InitializeCurrentEnvironment(napi_env env, napi_value exports) {
  auto* isolate = v8::Isolate::GetCurrent();
  auto* environment = isolate && !isolate->GetCurrentContext().IsEmpty()
      ? node::GetCurrentEnvironment(isolate->GetCurrentContext()) : nullptr;
  std::shared_ptr<EnvironmentRecord> record;
  auto& registry = Registry();
  if (getpid() != registry.process) {
    napi_throw_error(env, nullptr, "Aux native process identity changed");
    return nullptr;
  }
  {
    std::lock_guard<std::mutex> lock(registry.mutex);
    auto found = registry.environments.find(environment);
    if (found != registry.environments.end() && !found->second->closed &&
        !found->second->attempted) {
      record = found->second;
      record->attempted = true;
    }
  }
  // No native lock crosses NAPI publication, the producer or reentrant JS.
  if (!record || record->host->RegisterCurrentWorker(env, exports) != napi_ok) {
    napi_throw_error(env, nullptr, "Aux native environment registration refused");
    return nullptr;
  }
  return exports;
}
}  // namespace

struct AuxNativeEnvironmentPreload::State {
  explicit State(std::shared_ptr<AuxDevelopmentWorkerHost> value)
      : host(std::move(value)) {}
  const pid_t process = getpid();
  const std::shared_ptr<AuxDevelopmentWorkerHost> host;
  bool closed = false;  // Protected by the process registry mutex.
  bool quarantined = false;
};
AuxNativeEnvironmentPreload::AuxNativeEnvironmentPreload(
    std::shared_ptr<AuxDevelopmentWorkerHost> native_host) {
  if (!native_host) throw std::invalid_argument("Actual native host required");
  state_ = std::make_shared<State>(std::move(native_host));
}
AuxNativeEnvironmentPreload::~AuxNativeEnvironmentPreload() {
  const auto outcome = CloseAndDrain();
  if (outcome == AuxDevelopmentWorkerDrain::drained ||
      outcome == AuxDevelopmentWorkerDrain::wrongProcess) return;
  auto& registry = Registry();
  std::lock_guard<std::mutex> lock(registry.mutex);
  if (!state_->quarantined) {
    state_->quarantined = true;
    registry.undrained.push_back(state_->host);
  }
  // Keep exact native ownership alive. This is unresolved custody, not drain.
}
node::EmbedderPreloadCallback AuxNativeEnvironmentPreload::Callback() const {
  return [state = state_](node::Environment* supplied,
                         v8::Local<v8::Value>, v8::Local<v8::Value>) {
    auto* isolate = v8::Isolate::GetCurrent();
    if (!isolate) return;  // Node's callback contract requires a live isolate.
    auto* actual = isolate->GetCurrentContext().IsEmpty() ? nullptr :
        node::GetCurrentEnvironment(isolate->GetCurrentContext());
    if (!actual || actual != supplied || getpid() != state->process) {
      ThrowPreload(isolate);
      return;
    }
    auto record = std::make_shared<EnvironmentRecord>();
    record->environment = actual;
    record->host = state->host;
    auto retain = std::make_unique<std::shared_ptr<EnvironmentRecord>>(record);
    bool installed = false;
    {
      auto& registry = Registry();
      std::lock_guard<std::mutex> lock(registry.mutex);
      installed = !state->closed &&
          registry.environments.emplace(actual, record).second;
    }
    if (!installed) {
      ThrowPreload(isolate);
      return;
    }
    // Installed on this actual Environment before publishing its binding.
    node::AddEnvironmentCleanupHook(isolate, CleanupEnvironment, retain.release());
    node::AddLinkedBinding(actual, kBinding, InitializeCurrentEnvironment, 8);
  };
}
AuxDevelopmentWorkerDrain AuxNativeEnvironmentPreload::CloseAndDrain() {
  if (getpid() != state_->process) return AuxDevelopmentWorkerDrain::wrongProcess;
  {
    auto& registry = Registry();
    std::lock_guard<std::mutex> lock(registry.mutex);
    state_->closed = true;
    for (auto& [environment, record] : registry.environments)
      if (record->host == state_->host) record->closed = true;
  }
  return state_->host->CloseAndDrain();
}
size_t AuxNativeEnvironmentPreload::RetainedUndrainedHostCount() {
  auto& registry = Registry();
  if (getpid() != registry.process) return std::numeric_limits<size_t>::max();
  std::lock_guard<std::mutex> lock(registry.mutex);
  return registry.undrained.size();
}
