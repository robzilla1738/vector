#pragma once
#include <memory>
#include <node.h>
#include "AuxDevelopmentWorkerHost.h"

// An actual LoadEnvironment preload component, not parent/cohort admission.
// The trusted embedding must own admission before allowing its WorkerHost to
// invoke the protected producer. This component is not a module initializer.
class AuxNativeEnvironmentPreload final {
 public:
  explicit AuxNativeEnvironmentPreload(
      std::shared_ptr<AuxDevelopmentWorkerHost> native_host);
  ~AuxNativeEnvironmentPreload();
  AuxNativeEnvironmentPreload(const AuxNativeEnvironmentPreload&) = delete;
  AuxNativeEnvironmentPreload& operator=(const AuxNativeEnvironmentPreload&) = delete;

  // Pass directly to the actual node::LoadEnvironment call. Node propagates
  // this same callback into its child Worker environments before user code.
  node::EmbedderPreloadCallback Callback() const;
  AuxDevelopmentWorkerDrain CloseAndDrain();
  // SIZE_MAX means inherited wrong-process registry, never an empty census.
  static size_t RetainedUndrainedHostCount();
 private:
  struct State;
  std::shared_ptr<State> state_;
};
