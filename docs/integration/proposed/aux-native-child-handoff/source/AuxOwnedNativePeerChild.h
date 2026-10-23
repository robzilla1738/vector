#pragma once
#include "AuxNativePeerTransport.h"
#include "base/command_line.h"
#include "base/process/launch.h"
#include <memory>

namespace aux::peer {
inline constexpr uint32_t kNativeParentPeerPort = 0x41555850;  // AUXP
struct NativeChildObservation {
  bool launch_attempted = false;
  bool launch_failed = false;
  bool closed = false;
  bool child_binding_failed = false;
  bool exit_observed_and_reaped = false;
  bool exit_ownership_unknown = false;
  bool wrong_process = false;
  int child_pid = -1;
  int wait_status = 0;  // Meaningful only after actual observed+reaped exit.
  TransportSnapshot peer;
};
// Actual cold native launch primitive. It does not authenticate its caller or
// own all profile writers. Unlike the compatibility supervisor, it never
// publishes a mutable Process handle to a second reaper.
class OwnedNativePeerChild final {
 public:
  static std::unique_ptr<OwnedNativePeerChild> PrepareBeforeSpawn(
      base::CommandLine command, base::LaunchOptions options,
      std::shared_ptr<const ExactCodePolicy> child_policy);
  ~OwnedNativePeerChild();
  bool LaunchOnce();
  ExchangeStatus ServicePeerOnce(uint32_t timeout_ms);
  NativeChildObservation CloseAndInspect();
  NativeChildObservation ObserveAndReapExitedChild();
  static size_t RetainedUnresolvedChildren();
  static size_t PollRetainedOwnedChildren();
 private:
  struct State;
  explicit OwnedNativePeerChild(std::shared_ptr<State> state);
  std::shared_ptr<State> state_;
};
// Called from actual child native bootstrap, not a JS/env selector. Stock
// rendezvous is only right delivery; live authentication is the separate
// AuthenticatedNativeParentConnection::Connect producer.
NativeSendRight TakeLaunchedNativeParentEndpoint();
}  // namespace aux::peer
