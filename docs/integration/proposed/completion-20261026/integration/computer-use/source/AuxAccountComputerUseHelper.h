#pragma once
#include <node_api.h>
#include <cstdint>
#include <cerrno>
#include <sys/types.h>
#include <spawn.h>
#include <memory>
#include "AuxDevelopmentWorkerHost.h"

class AuxAccountComputerUseProcess;
// Concrete retained main-service owner. Neither its constructor nor dispatcher,
// root descriptors or lifecycle methods are exposed as a JS capability factory.
class AuxComputerUseNativeOwner final {
 public:
  ~AuxComputerUseNativeOwner();
  AuxComputerUseNativeOwner(const AuxComputerUseNativeOwner&) = delete;
  AuxComputerUseNativeOwner& operator=(const AuxComputerUseNativeOwner&) = delete;
 private:
  struct State;
  explicit AuxComputerUseNativeOwner(std::shared_ptr<State>);
  static std::shared_ptr<AuxComputerUseNativeOwner> Capture(napi_env, int64_t, const uint8_t*, uint32_t);
  bool Current() const;
  int DuplicateTaskAccountDirectory() const;
  bool CopyStorageRoots(int32_t*, int32_t*, uint64_t*) const;
  bool CopyBrowserRoot(uint32_t, int32_t*, uint64_t*) const;
  bool CopyPrivateParent(char*, uint32_t, uint32_t*) const;
  const void* WorkerKey() const;
  bool PrepareLaunch();
  bool PublishSuspended(pid_t);
  int SpawnStoppedAfterPrepared(pid_t*,const posix_spawn_file_actions_t*,const posix_spawnattr_t*,char* const[],char* const[]) const;
  bool ResumeStoppedAfterPublished(pid_t) const;
  bool SettlePhysical(pid_t=0,int=0,int=ECANCELED);
  std::shared_ptr<State> state_;
  friend class AuxAccountComputerUseProcess;
  friend napi_value AuxCreateAccountComputerUseProcess(napi_env, napi_callback_info);
};
// Fixed property callbacks on the existing linked binding only.
napi_value AuxCreateAccountComputerUseProcess(napi_env, napi_callback_info);
// Actual Worker teardown calls this before retiring the Swift owner. It closes
// admission/requests cancellation; only joined original child+stdio settles.
AuxDevelopmentWorkerDrain AuxCloseAccountComputerUseProcessesForWorker(const void*) noexcept;

void AuxRequestAccountComputerUseStopForWorker(const void*) noexcept;
