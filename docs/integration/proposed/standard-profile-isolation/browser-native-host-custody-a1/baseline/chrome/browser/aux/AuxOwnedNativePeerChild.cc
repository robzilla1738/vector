#include "AuxOwnedNativePeerChild.h"
#include "AuxBrowserPrivateRoots.h"
#include "AuxOwnedChildWait.h"
#include <cerrno>
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
namespace { const pid_t kPeerOwnerProcess = getpid(); }
struct OwnedNativePeerChild::State {
  State(base::CommandLine command_value, base::LaunchOptions options_value,
        std::unique_ptr<PreparedParentEndpoint> prepared_value, NativeSendRight handoff_value);
  ~State();
  static pid_t RegistryProcess();
  static std::mutex& RetainedMutex();
  static std::vector<std::shared_ptr<State>>& Retained();
  static void CloseAndRetain(std::shared_ptr<State> state);
  static void RetainBeforeLaunch(const std::shared_ptr<State>& state);
  static void ReleaseKnownTerminal(const std::shared_ptr<State>& state);
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
  bool retained_for_exit = false;
};
OwnedNativePeerChild::State::State(base::CommandLine command_value,
    base::LaunchOptions options_value, std::unique_ptr<PreparedParentEndpoint> prepared_value,
    NativeSendRight handoff_value)
    : command(std::move(command_value)), options(std::move(options_value)),
      prepared(std::move(prepared_value)), handoff(std::move(handoff_value)) {}
OwnedNativePeerChild::State::~State() = default;
pid_t OwnedNativePeerChild::State::RegistryProcess() { return kPeerOwnerProcess; }
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
  auto roots = CaptureActualChromiumBrowserRoots();
  if (!roots) return {};
  auto prepared = PreparedParentEndpoint::PrepareBeforeSpawn(std::move(policy), std::move(roots));
  if (!prepared) return {};
  auto right = prepared->CopySendRightForNativeHandoff();
  if (!right.is_valid()) return {};
  options.mach_ports_for_rendezvous.emplace(kNativeParentPeerPort,
      base::MachRendezvousPort(right.BorrowNativeName(), MACH_MSG_TYPE_COPY_SEND));
  return std::unique_ptr<OwnedNativePeerChild>(new OwnedNativePeerChild(
      std::make_shared<State>(std::move(command), std::move(options), std::move(prepared), std::move(right))));
}
void OwnedNativePeerChild::State::RetainBeforeLaunch(const std::shared_ptr<State>& state) {
  // Caller holds the actual State admission mutex. Complete all registry
  // allocation before the first syscall can create a child. No late teardown
  // allocation is needed to retain a real child or failed peer binding.
  if (state->retained_for_exit) return;
  std::lock_guard<std::mutex> lock(RetainedMutex());
  Retained().push_back(state);
  state->retained_for_exit = true;
}
void OwnedNativePeerChild::State::ReleaseKnownTerminal(const std::shared_ptr<State>& state) {
  // Caller retains State and its mutex. Actual terminal/no-child evidence is
  // necessary; a later benign reap must never erase earlier ownership loss.
  if (!state->retained_for_exit || state->observation.exit_ownership_unknown ||
      (!state->observation.launch_failed && !state->observation.exit_observed_and_reaped)) return;
  std::lock_guard<std::mutex> lock(RetainedMutex());
  std::erase(Retained(), state);
  state->retained_for_exit = false;
}
void OwnedNativePeerChild::State::CloseAndRetain(std::shared_ptr<State> state) {
  if (getpid() != state->process || getpid() != RegistryProcess()) return;
  std::lock_guard<std::mutex> lock(state->mutex);
  state->observation.closed = true;
  state->prepared->CloseAndInspect();
  if (state->peer) state->peer->CloseAndInspect();
  state->ReapLocked();
  ReleaseKnownTerminal(state);
}
OwnedNativePeerChild::~OwnedNativePeerChild() {
  if (getpid() != state_->process) return;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    // The private selected object now owns close/quarantine of this actual
    // waitable child state. An observer or raw Boolean cannot set this field.
    if (state_->observation.selected_home_owner_transferred) return;
  }
  State::CloseAndRetain(state_);
}
bool OwnedNativePeerChild::LaunchOnce() {
  auto state = state_;
  if (getpid() != state->process) return false;
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->observation.closed || state->observation.launch_attempted) return false;
  State::RetainBeforeLaunch(state);
  state->observation.launch_attempted = true;
  // Actual spawn is serialized with this owner's terminal close, matching the
  // supplied supervisor's RunAdmittedLaunch generation-lock boundary.
  // COPY_SEND borrows the original ref, retained in state->handoff throughout
  // launch, early returns, rendezvous delivery and actual child exit.
  state->child = base::LaunchProcess(state->command, state->options);
  if (!state->child.IsValid()) {
    state->observation.launch_failed = true;
    state->prepared->CloseAndInspect();
    State::ReleaseKnownTerminal(state);
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
  if (child_created.is_null() || child.CreationTime() != child_created) {
    observation.exit_ownership_unknown = true;
    return ObserveLocked();
  }
  if (waitid(P_PID, static_cast<id_t>(pid), &exit, WEXITED | WNOHANG | WNOWAIT) != 0) {
    // WNOWAIT has not consumed the child. EINTR retains pending ownership and
    // can be retried by the next poll; other errors stay sticky unknown.
    if (errno != EINTR) observation.exit_ownership_unknown = true;
    return ObserveLocked();
  }
  if (!exit.si_pid) return ObserveLocked();
  if (exit.si_pid != pid) {
    observation.exit_ownership_unknown = true;
    return ObserveLocked();
  }
  int status = 0;
  const pid_t waited = waitpid(pid, &status, WNOHANG);
  const int error = waited == -1 ? errno : 0;
  const auto result = ClassifyOwnedChildReap(pid, waited, status, error);
  if (result != OwnedChildReap::terminal) {
    if (result == OwnedChildReap::unknown) observation.exit_ownership_unknown = true;
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
  size_t budget;
  { std::lock_guard<std::mutex> lock(State::RetainedMutex()); budget = State::Retained().size(); }
  size_t cursor = 0;
  for (size_t visited = 0; visited < budget; ++visited) {
    std::shared_ptr<State> state;
    {
      std::lock_guard<std::mutex> lock(State::RetainedMutex());
      if (cursor >= State::Retained().size()) break;
      state = State::Retained()[cursor];
    }
    // No registry lock crosses State, transport, or actual OS wait operations.
    { std::lock_guard<std::mutex> lock(state->mutex);
      state->ReapLocked(); State::ReleaseKnownTerminal(state); }
    {
      std::lock_guard<std::mutex> lock(State::RetainedMutex());
      const auto position = std::find(State::Retained().begin(), State::Retained().end(), state);
      if (position != State::Retained().end())
        cursor = static_cast<size_t>(position - State::Retained().begin()) + 1;
    }
  }
  return RetainedUnresolvedChildren();
}
}  // namespace aux::peer

namespace aux::peer {
struct SelectedNativeHome::State {
  State(std::shared_ptr<OwnedNativePeerChild::State> child_value,
        std::shared_ptr<AuthenticatedSelectedHomeTransfer> transfer_value)
      : child(std::move(child_value)), transfer(std::move(transfer_value)) {}
  const pid_t process = getpid();
  const std::shared_ptr<OwnedNativePeerChild::State> child;
  const std::shared_ptr<AuthenticatedSelectedHomeTransfer> transfer;
};
SelectedNativeHome::SelectedNativeHome(std::shared_ptr<State> state) : state_(std::move(state)) {}
SelectedNativeHome::~SelectedNativeHome() {
  if (getpid() == state_->process) OwnedNativePeerChild::State::CloseAndRetain(state_->child);
}
int SelectedNativeHome::DuplicateRevalidatedDirectory() {
  auto selected = state_;
  auto owner = selected->child;
  if (getpid() != selected->process || getpid() != owner->process) return -1;
  std::shared_ptr<ParentTransport> peer;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    auto observation = owner->ReapLocked();
    if (observation.closed || observation.child_binding_failed || observation.exit_observed_and_reaped ||
        observation.exit_ownership_unknown || !owner->child.IsValid()) return -1;
    peer = owner->peer;
  }
  if (!peer) return -1;
  int descriptor = selected->transfer->DuplicateRevalidatedDirectory();
  if (descriptor < 0) return -1;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    auto observation = owner->ReapLocked();
    if (observation.closed || observation.exit_observed_and_reaped || observation.exit_ownership_unknown ||
        owner->peer != peer) { close(descriptor); return -1; }
  }
  return descriptor;
}
std::optional<ReadyHomePulse> SelectedNativeHome::InspectReadyPulse() {
  auto selected = state_;
  auto owner = selected->child;
  if (getpid() != selected->process || getpid() != owner->process) return std::nullopt;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    auto observation = owner->ReapLocked();
    if (observation.closed || observation.exit_observed_and_reaped ||
        observation.exit_ownership_unknown || !owner->child.IsValid()) return std::nullopt;
  }
  return selected->transfer->InspectReadyPulse();
}
ExchangeStatus SelectedNativeHome::ServicePeerOnce(uint32_t timeout_ms) {
  auto owner = state_->child;
  if (getpid() != owner->process) return ExchangeStatus::wrongProcess;
  std::shared_ptr<ParentTransport> peer;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    auto observation = owner->ReapLocked();
    if (observation.closed || observation.exit_observed_and_reaped ||
        observation.exit_ownership_unknown) return ExchangeStatus::closed;
    peer = owner->peer;
  }
  return peer ? peer->ServiceOne(timeout_ms) : ExchangeStatus::refused;
}
NativeChildObservation SelectedNativeHome::InspectOwnedChild() {
  if (getpid() != state_->process) return NativeChildObservation{.closed = true, .wrong_process = true};
  auto child = state_->child;
  std::lock_guard<std::mutex> lock(child->mutex);
  auto observation = child->ReapLocked();
  OwnedNativePeerChild::State::ReleaseKnownTerminal(child);
  return observation;
}
DaemonAuthorityReply SelectedNativeHome::SignDaemonChallenge(std::span<const uint8_t> message, uint32_t timeout_ms) {
  auto before = InspectOwnedChild();
  if (before.closed || before.wrong_process || before.exit_observed_and_reaped || before.exit_ownership_unknown)
    return {DaemonAuthorityStatus::closed, {}};
  auto reply = state_->transfer->SignDaemonChallenge(message, timeout_ms);
  auto after = InspectOwnedChild();
  if (after.closed || after.exit_observed_and_reaped || after.exit_ownership_unknown || after.child_pid != before.child_pid)
    return {DaemonAuthorityStatus::closed, {}};
  return reply;
}
DaemonAuthorityReply SelectedNativeHome::GetInstallationPublicKeys(uint32_t timeout_ms) {
  auto before = InspectOwnedChild();
  if (before.closed || before.wrong_process || before.exit_observed_and_reaped || before.exit_ownership_unknown)
    return {DaemonAuthorityStatus::closed, {}};
  auto reply = state_->transfer->GetInstallationPublicKeys(timeout_ms);
  auto after = InspectOwnedChild();
  if (after.closed || after.exit_observed_and_reaped || after.exit_ownership_unknown || after.child_pid != before.child_pid)
    return {DaemonAuthorityStatus::closed, {}};
  return reply;
}
DaemonAuthorityReply SelectedNativeHome::GetBrowserStartupLease(uint32_t timeout_ms) {
  auto before = InspectOwnedChild();
  if (before.closed || before.wrong_process || before.exit_observed_and_reaped || before.exit_ownership_unknown)
    return {DaemonAuthorityStatus::closed, {}};
  auto reply = state_->transfer->GetBrowserStartupLease(timeout_ms);
  auto after = InspectOwnedChild();
  if (after.closed || after.exit_observed_and_reaped || after.exit_ownership_unknown || after.child_pid != before.child_pid)
    return {DaemonAuthorityStatus::closed, {}};
  return reply;
}
DaemonAuthorityReply SelectedNativeHome::GetAgentInboxV2MasterKey(uint32_t timeout_ms) {
  auto before = InspectOwnedChild();
  if (before.closed || before.wrong_process || before.exit_observed_and_reaped || before.exit_ownership_unknown)
    return {DaemonAuthorityStatus::closed, {}};
  auto reply = state_->transfer->GetAgentInboxV2MasterKey(timeout_ms);
  auto after = InspectOwnedChild();
  if (after.closed || after.exit_observed_and_reaped || after.exit_ownership_unknown || after.child_pid != before.child_pid) {
    for (auto& byte : reply.payload) {
      volatile uint8_t& owned_byte = byte;
      owned_byte = 0;
    }
    return {DaemonAuthorityStatus::closed, {}};
  }
  return reply;
}
DaemonAuthorityStatus SelectedNativeHome::AcceptAuthorityReply(
    const DaemonAuthorityReply& reply, uint32_t timeout_ms) {
  auto child = InspectOwnedChild();
  if (child.closed || child.wrong_process || child.exit_observed_and_reaped || child.exit_ownership_unknown)
    return DaemonAuthorityStatus::closed;
  return state_->transfer->AcceptAuthorityReply(reply, timeout_ms);
}
NativeChildObservation SelectedNativeHome::CloseNativeAdmission() {
  if (getpid() != state_->process) return NativeChildObservation{.closed = true, .wrong_process = true};
  OwnedNativePeerChild::State::CloseAndRetain(state_->child);
  std::lock_guard<std::mutex> lock(state_->child->mutex);
  return state_->child->ObserveLocked();
}
std::unique_ptr<SelectedNativeHome> OwnedNativePeerChild::TakeSelectedHome() {
  auto state = state_;
  if (getpid() != state->process) return {};
  std::shared_ptr<ParentTransport> peer;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    auto observation = state->ReapLocked();
    if (observation.closed || observation.selected_home_owner_transferred || !state->observation.launch_attempted || observation.launch_failed ||
        observation.child_binding_failed || observation.exit_observed_and_reaped ||
        observation.exit_ownership_unknown || !state->child.IsValid()) return {};
    peer = state->peer;
  }
  if (!peer) return {};
  auto transfer = peer->TakeSelectedHomeTransfer();
  if (!transfer) return {};
  // The FD is revalidated before constructing the private selected object; no
  // public status/snapshot/JSON descriptor can manufacture this ownership.
  int descriptor = transfer->DuplicateRevalidatedDirectory();
  if (descriptor < 0) return {};
  close(descriptor);
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    auto observation = state->ReapLocked();
    if (observation.closed || observation.exit_observed_and_reaped || observation.exit_ownership_unknown ||
        state->peer != peer) return {};
  }
  auto selected = std::unique_ptr<SelectedNativeHome>(new SelectedNativeHome(
      std::make_shared<SelectedNativeHome::State>(state, std::move(transfer))));
  bool transferred = false;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (!state->observation.closed && !state->observation.selected_home_owner_transferred) {
      state->observation.selected_home_owner_transferred = true;
      transferred = true;
    }
  }
  if (!transferred) return {};
  return selected;
}
}  // namespace aux::peer
