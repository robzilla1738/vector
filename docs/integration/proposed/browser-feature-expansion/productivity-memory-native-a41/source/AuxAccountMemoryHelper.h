#pragma once
#include <node_api.h>
#include <cstdint>
#include <cerrno>
#include <sys/types.h>
#include <memory>
#include "AuxDevelopmentWorkerHost.h"

class AuxAccountMemoryProcess;
// Concrete retained main-service owner. Neither its constructor nor dispatcher,
// root descriptors or lifecycle methods are exposed as a JS capability factory.
class AuxMemoryNativeOwner final {
 public:
  ~AuxMemoryNativeOwner();
  AuxMemoryNativeOwner(const AuxMemoryNativeOwner&) = delete;
  AuxMemoryNativeOwner& operator=(const AuxMemoryNativeOwner&) = delete;
 private:
  struct State;
  explicit AuxMemoryNativeOwner(std::shared_ptr<State>);
  static std::shared_ptr<AuxMemoryNativeOwner> Capture(napi_env, int64_t);
  bool Current() const;
  int DuplicateMemoryDirectory() const;
  bool CopyStorageRoots(int32_t*, int32_t*, uint64_t*) const;
  bool CopyBrowserRoot(uint32_t, int32_t*, uint64_t*) const;
  bool CopyPrivateParent(char*, uint32_t, uint32_t*) const;
  const void* WorkerKey() const;
  bool PrepareLaunch();
  bool PublishSuspended(pid_t);
  bool SettlePhysical(pid_t=0,int=0,int=ECANCELED);
  std::shared_ptr<State> state_;
  friend class AuxAccountMemoryProcess;
  friend napi_value AuxCreateAccountMemoryProcess(napi_env, napi_callback_info);
};
// Fixed property callbacks on the existing linked binding only.
napi_value AuxCreateAccountMemoryProcess(napi_env, napi_callback_info);
napi_value AuxValidateMemoryRegistryTarget(napi_env, napi_callback_info);
// Actual Worker teardown calls this before retiring the Swift owner. It closes
// admission/requests cancellation; only joined original child+stdio settles.
AuxDevelopmentWorkerDrain AuxCloseAccountMemoryProcessesForWorker(const void*) noexcept;

napi_value AuxFinishMemoryRegistryTarget(napi_env,napi_callback_info);
void AuxRequestAccountMemoryStopForWorker(const void*) noexcept;
