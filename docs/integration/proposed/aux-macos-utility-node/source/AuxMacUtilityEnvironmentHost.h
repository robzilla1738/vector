#pragma once
#include <node_api.h>
#include <memory>
// Fixed utility lifecycle only; no protected installation/cohort authority.
// Construction performs no OS effect or permission grant. Actual AppKit methods
// retain their caller-context and OS-access requirements.
enum class AuxMacUtilityDrain {drained,pending,untracked,wrongProcess};
class AuxMacUtilityEnvironmentHost final {
 public:
  AuxMacUtilityEnvironmentHost();
  ~AuxMacUtilityEnvironmentHost();
  AuxMacUtilityEnvironmentHost(const AuxMacUtilityEnvironmentHost&)=delete;
  AuxMacUtilityEnvironmentHost& operator=(const AuxMacUtilityEnvironmentHost&)=delete;
  // Actual current Environment native callback only. No caller-selected core,
  // JS/env switch, arbitrary core callback, scope or protected owner accepted.
  napi_status AttachCurrentEnvironment(napi_env,napi_value exports);
  AuxMacUtilityDrain CloseAndDrain();
 private:
  struct State;
  std::shared_ptr<State> state_;
};

