#include "AuxOwnedNativePeerChild.h"
#include "base/apple/mach_port_rendezvous.h"
#include "base/apple/scoped_mach_port.h"
#include "base/process/process.h"
#include "base/time/time.h"
#include <sys/wait.h>
#include <unistd.h>
#include <mutex>
#include <optional>
#include <limits>
#include <algorithm>
#include <utility>
#include <vector>

namespace aux::peer {
struct OwnedNativePeerChild::State {
  State(base::CommandLine command_value, base::LaunchOptions options_value,
        std::unique_ptr<PreparedParentEndpoint> prepared_value, NativeSendRight handoff_value);
  ~State();
  static pid_t RegistryProcess();
  static std::mutex& RetainedMutex();
  static std::vector<std::shared_ptr<State>>& Retained();
  NativeChildObservation ObserveLocked();
  NativeChildObservation ReapLocked();
  const pid_t process = getpid();
  std::mutex mutex;
  base::CommandLine command;
  base::LaunchOptions options;
  std::unique_ptr<PreparedParentEndpoint> prepared;
  NativeSendRight handoff;
  std::shared_ptr<ParentTransport> peer;
  base::Process child;
  base::Time child_created;
  NativeChildObservation observation;
};
OwnedNativePeerChild::State::State(base::CommandLine command_value,
    base::LaunchOptions options_value, std::unique_ptr<PreparedParentEndpoint> prepared_value,
    NativeSendRight handoff_value)
    : command(std::move(command_value)), options(std::move(options_value)),
      prepared(std::move(prepared_value)), handoff(std::move(handoff_value)) {}
OwnedNativePeerChild::State::~State() = default;
pid_t OwnedNativePeerChild::State::RegistryProcess() { static const pid_t owner = getpid(); return owner; }
std::mutex& OwnedNativePeerChild::State::RetainedMutex() {
  static auto* mutex = new std::mutex;
  return *mutex;
}
std::vector<std::shared_ptr<OwnedNativePeerChild::State>>& OwnedNativePeerChild::State::Retained() {
  static auto* children = new std::vector<std::shared_ptr<State>>;
  return *children;
}
NativeChildObservation OwnedNativePeerChild::State::ObserveLocked() {
  observation.peer = peer ? peer->Inspect() : prepared->Inspect();
  return observation;
}
OwnedNativePeerChild::OwnedNativePeerChild(std::shared_ptr<State> state) : state_(std::move(state)) {}
std::unique_ptr<OwnedNativePeerChild> OwnedNativePeerChild::PrepareBeforeSpawn(
    base::CommandLine command, base::LaunchOptions options,
    std::shared_ptr<const ExactCodePolicy> policy) {
  // This fresh cold path cannot carry the historical Keychain interposer. Its
  // absence is a required real launch property, never an admission grant.
  if (!policy || !options.clear_environment ||
      options.environment.contains("DYLD_INSERT_LIBRARIES") ||
      options.environment.contains("NODE_OPTIONS") ||
      options.environment.contains("NODE_PATH") ||
      options.environment.contains("AUX_ENABLE_PROVIDED_NATIVE_CARRIER") ||
      options.environment.contains("AUX_PROVIDED_NATIVE_LOAD_ONLY") ||
      options.mach_ports_for_rendezvous.contains(kNativeParentPeerPort)) return {};
  auto prepared = PreparedParentEndpoint::PrepareBeforeSpawn(std::move(policy));
  if (!prepared) return {};
  auto right = prepared->CopySendRightForNativeHandoff();
  if (!right.is_valid()) return {};
  options.mach_ports_for_rendezvous.emplace(kNativeParentPeerPort,
      base::MachRendezvousPort(right.BorrowNativeName(), MACH_MSG_TYPE_COPY_SEND));
  return std::unique_ptr<OwnedNativePeerChild>(new OwnedNativePeerChild(
      std::make_shared<State>(std::move(command), std::move(options), std::move(prepared), std::move(right))));
}
OwnedNativePeerChild::~OwnedNativePeerChild() {
  auto observation = CloseAndInspect();
  if (observation.wrong_process || !observation.launch_attempted || observation.launch_failed ||
      observation.exit_observed_and_reaped) return;
  // No kill, implicit clean exit or discarded live child. The exact Process,
  // endpoint and peer survive destruction until a genuine native owner handles
  // unresolved custody. This registry is not a successful shutdown receipt.
  if (getpid() != State::RegistryProcess()) return;
  std::lock_guard<std::mutex> lock(State::RetainedMutex());
  State::Retained().push_back(state_);
}
bool OwnedNativePeerChild::LaunchOnce() {
  auto state = state_;
  if (getpid() != state->process) return false;
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->observation.closed || state->observation.launch_attempted) return false;
  state->observation.launch_attempted = true;
  // Actual spawn is serialized with this owner's terminal close, matching the
  // supplied supervisor's RunAdmittedLaunch generation-lock boundary.
  // COPY_SEND borrows the original ref, retained in state->handoff throughout
  // launch, early returns, rendezvous delivery and actual child exit.
  state->child = base::LaunchProcess(state->command, state->options);
  if (!state->child.IsValid()) {
    state->observation.launch_failed = true;
    state->prepared->CloseAndInspect();
    return false;
  }
  state->observation.child_pid = state->child.Pid();
  state->child_created = state->child.CreationTime();
  state->peer = state->prepared->BindActualDirectChild(state->child.Pid());
  state->observation.child_binding_failed = !state->peer;
  if (!state->peer) state->prepared->CloseAndInspect();
  // A failed binding does not discard/kill the child already spawned.
  return static_cast<bool>(state->peer);
}
ExchangeStatus OwnedNativePeerChild::ServicePeerOnce(uint32_t timeout_ms) {
  auto state = state_;
  if (getpid() != state->process) return ExchangeStatus::wrongProcess;
  std::shared_ptr<ParentTransport> peer;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->observation.closed) return ExchangeStatus::closed;
    peer = state->peer;
  }
  return peer ? peer->ServiceOne(timeout_ms) : ExchangeStatus::refused;
}
NativeChildObservation OwnedNativePeerChild::CloseAndInspect() {
  auto state = state_;
  if (getpid() != state->process) return NativeChildObservation{.closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state->mutex);
  state->observation.closed = true;
  state->prepared->CloseAndInspect();
  if (state->peer) state->peer->CloseAndInspect();
  return state->ObserveLocked();
}
NativeChildObservation OwnedNativePeerChild::ObserveAndReapExitedChild() {
  auto state = state_;
  if (getpid() != state->process) return NativeChildObservation{.closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state->mutex);
  return state->ReapLocked();
}
NativeChildObservation OwnedNativePeerChild::State::ReapLocked() {
  if (!child.IsValid() || observation.exit_observed_and_reaped)
    return ObserveLocked();
  siginfo_t exit{};
  const pid_t pid = child.Pid();
  if (child_created.is_null() || child.CreationTime() != child_created ||
      waitid(P_PID, static_cast<id_t>(pid), &exit, WEXITED | WNOHANG | WNOWAIT) != 0) {
    observation.exit_ownership_unknown = true;
    return ObserveLocked();
  }
  if (!exit.si_pid) return ObserveLocked();
  int status = 0;
  if (exit.si_pid != pid || waitpid(pid, &status, WNOHANG) != pid) {
    observation.exit_ownership_unknown = true;
    return ObserveLocked();
  }
  observation.wait_status = status;
  observation.exit_observed_and_reaped = true;
  observation.closed = true;
  prepared->CloseAndInspect();
  if (peer) peer->CloseAndInspect();
  child.Close();
  return ObserveLocked();
}
size_t OwnedNativePeerChild::RetainedUnresolvedChildren() {
  if (getpid() != State::RegistryProcess()) return std::numeric_limits<size_t>::max();
  std::lock_guard<std::mutex> lock(State::RetainedMutex());
  return State::Retained().size();
}
size_t OwnedNativePeerChild::PollRetainedOwnedChildren() {
  if (getpid() != State::RegistryProcess()) return std::numeric_limits<size_t>::max();
  std::vector<std::shared_ptr<State>> retained;
  {
    std::lock_guard<std::mutex> lock(State::RetainedMutex());
    retained = State::Retained();
  }
  for (auto& state : retained) {
    bool terminal = false;
    {
      std::lock_guard<std::mutex> lock(state->mutex);
      terminal = state->ReapLocked().exit_observed_and_reaped;
    }
    if (terminal) {
      std::lock_guard<std::mutex> lock(State::RetainedMutex());
      std::erase(State::Retained(), state);
    }
  }
  return RetainedUnresolvedChildren();
}
}  // namespace aux::peer
