#include "AuxSelectedStateHome.h"
#include "base/files/scoped_file.h"
#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/threading/thread.h"
#include <unistd.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <limits.h>
#include <chrono>
#include <algorithm>
#include <cstdlib>
#include <cstring>
#include <mutex>
#include <optional>

namespace aux::peer {
namespace {
constexpr auto kMaximumReadyPulseAge = std::chrono::seconds(10);
constexpr uint32_t kServiceReceiveTimeoutMs = 250;
struct State {
  const pid_t process = getpid();
  std::mutex mutex;
  bool selected_route = false;
  bool closed = false;
  bool initializing = false;
  bool monitor_running = false;
  uint64_t active_reads = 0;
  std::shared_ptr<SelectedNativeHome> selected;
  std::optional<NativeChildObservation> child_close;
  std::unique_ptr<base::Thread> monitor;
  std::optional<base::PlatformThreadRef> monitor_creator;
};
State& CurrentState() {
  static auto* state = new State;
  return *state;
}
bool Fresh(const ReadyHomePulse& pulse) {
  auto now = std::chrono::steady_clock::now();
  return pulse.exports && pulse.observed <= now && now - pulse.observed <= kMaximumReadyPulseAge;
}
std::optional<base::FilePath> PhysicalPath(int descriptor) {
  char path[PATH_MAX]{}, resolved[PATH_MAX]{};
  if (fcntl(descriptor, F_GETPATH, path) != 0 || !realpath(path, resolved) ||
      std::strcmp(path, resolved) != 0) return std::nullopt;
  base::ScopedFD reopened(open(path, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC));
  struct stat retained{}, current{};
  if (!reopened.is_valid() || fstat(descriptor, &retained) != 0 || fstat(reopened.get(), &current) != 0 ||
      retained.st_dev != current.st_dev || retained.st_ino != current.st_ino) return std::nullopt;
  return base::FilePath(path);
}
void Monitor(std::shared_ptr<SelectedNativeHome> selected) {
  auto& state = CurrentState();
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed || state.selected != selected) return;
    state.monitor_running = true;
  }
  for (;;) {
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      if (state.closed || state.selected != selected) break;
    }
    auto status = selected->ServicePeerOnce(kServiceReceiveTimeoutMs);
    if (status == ExchangeStatus::authenticated || status == ExchangeStatus::timedOut) continue;
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      state.closed = true;
    }
    auto closed = selected->CloseNativeAdmission();
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      state.child_close = closed;
    }
    break;
  }
  std::lock_guard<std::mutex> lock(state.mutex);
  state.monitor_running = false;
}
SelectedStateHomeObservation ObserveLocked(const State& state) {
  auto route = SelectedStateHomeRoute::unselected;
  if (state.closed) route = SelectedStateHomeRoute::closed;
  else if (state.selected_route) route = SelectedStateHomeRoute::unavailable;
  return {route, state.monitor_running, state.active_reads, state.initializing,
          state.monitor != nullptr, state.child_close};
}
enum class AuthorityOperation { daemonSignature, publicKeys, inboxKeyV2 };
void ClearPayload(DaemonAuthorityReply& reply) {
  volatile uint8_t* owned_bytes = reply.payload.data();
  for (size_t index = 0; index < reply.payload.size(); ++index) owned_bytes[index] = 0;
  reply.payload.clear();
}
DaemonAuthorityReply CallAuthority(AuthorityOperation operation, std::span<const uint8_t> message) {
  auto& state = CurrentState();
  if (getpid() != state.process) return {DaemonAuthorityStatus::wrongProcess, {}};
  std::shared_ptr<SelectedNativeHome> owner;
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed) return {DaemonAuthorityStatus::closed, {}};
    if (!state.selected_route || state.initializing || !state.selected)
      return {DaemonAuthorityStatus::refused, {}};
    owner = state.selected;
    ++state.active_reads;
  }
  auto finish = +[](State* retained) {
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->active_reads;
  };
  std::unique_ptr<State, decltype(finish)> active(&state, finish);
  auto before = owner->InspectReadyPulse();
  if (!before || !Fresh(*before)) return {DaemonAuthorityStatus::pending, {}};
  DaemonAuthorityReply reply;
  switch (operation) {
    case AuthorityOperation::daemonSignature: reply = owner->SignDaemonChallenge(message, 2'000); break;
    case AuthorityOperation::publicKeys: reply = owner->GetInstallationPublicKeys(2'000); break;
    case AuthorityOperation::inboxKeyV2: reply = owner->GetAgentInboxV2MasterKey(2'000); break;
  }
  if (reply.status == DaemonAuthorityStatus::closed || reply.status == DaemonAuthorityStatus::wrongProcess ||
      reply.status == DaemonAuthorityStatus::cleanupUnresolved) {
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      state.closed = true;
    }
    auto closed = owner->CloseNativeAdmission();
    std::lock_guard<std::mutex> lock(state.mutex);
    state.child_close = closed;
    ClearPayload(reply);
    return reply;
  }
  if (reply.status != DaemonAuthorityStatus::ready) {
    ClearPayload(reply);
    return reply;
  }
  auto after = owner->InspectReadyPulse();
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed || state.selected != owner) {
      ClearPayload(reply);
      return {DaemonAuthorityStatus::closed, {}};
    }
    if (!after || !Fresh(*after) || after->generation != before->generation || after->exports < before->exports) {
      ClearPayload(reply);
      return {DaemonAuthorityStatus::pending, {}};
    }
  }
  if (reply.payload.empty() || reply.payload.size() > 8192 ||
      (operation == AuthorityOperation::inboxKeyV2 && reply.payload.size() != 32)) {
    ClearPayload(reply);
    return {DaemonAuthorityStatus::refused, {}};
  }
  // The private response ticket remains unacknowledged until this actual
  // publication fence. The transport revalidates owner/generation at ACK.
  // No mutex crosses that authenticated peer callback.
  const auto accepted = owner->AcceptAuthorityReply(reply, 2'000);
  if (accepted != DaemonAuthorityStatus::ready) {
    ClearPayload(reply);
    return {accepted, {}};
  }
  // Do not discard an acknowledged signature in a second post-ACK fence:
  // the supervisor retains it before its own later publication validation.
  return reply;
}
}  // namespace
bool InstallNativeSelectedStateHome(std::unique_ptr<SelectedNativeHome> selected) {
  auto& state = CurrentState();
  if (getpid() != state.process || !selected) return false;
  auto owner = std::shared_ptr<SelectedNativeHome>(std::move(selected));
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed || state.selected_route) return false;
    state.selected_route = true;
    state.initializing = true;
    state.selected = owner;
  }
  // No mutex crosses Security/resource callbacks or thread initialization.
  auto pulse = owner->InspectReadyPulse();
  base::ScopedFD directory(owner->DuplicateRevalidatedDirectory());
  auto monitor = std::make_unique<base::Thread>("AuxSelectedHomePeer");
  const bool thread_started = pulse && Fresh(*pulse) && directory.is_valid() && monitor->Start();
  const bool queued = thread_started && monitor->task_runner()->PostTask(FROM_HERE, base::BindOnce(&Monitor, owner));
  bool installed = false;
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    state.initializing = false;
    if (thread_started) {
      // Even failed/closed initialization retains its actual thread until a
      // later creator-thread close observes the monitor has left callbacks.
      state.monitor_creator = base::PlatformThread::CurrentRef();
      state.monitor = std::move(monitor);
    }
    installed = queued && !state.closed;
    if (!installed) state.closed = true;
  }
  if (!installed) {
    auto closed = owner->CloseNativeAdmission();
    std::lock_guard<std::mutex> lock(state.mutex);
    state.child_close = closed;
  }
  return installed;
}
SelectedStateHomeResolution ReadNativeSelectedStateHome() {
  auto& state = CurrentState();
  if (getpid() != state.process) return {SelectedStateHomeRoute::wrongProcess, {}};
  std::shared_ptr<SelectedNativeHome> owner;
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed) return {SelectedStateHomeRoute::closed, {}};
    if (!state.selected_route) return {SelectedStateHomeRoute::unselected, {}};
    if (state.initializing || !state.selected) return {SelectedStateHomeRoute::unavailable, {}};
    owner = state.selected;
    ++state.active_reads;
  }
  auto finish = +[](State* retained) {
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->active_reads;
  };
  std::unique_ptr<State, decltype(finish)> active(&state, finish);
  auto pulse = owner->InspectReadyPulse();
  if (!pulse || !Fresh(*pulse)) return {SelectedStateHomeRoute::unavailable, {}};
  base::ScopedFD directory(owner->DuplicateRevalidatedDirectory());
  auto path = directory.is_valid() ? PhysicalPath(directory.get()) : std::nullopt;
  if (!path) return {SelectedStateHomeRoute::unavailable, {}};
  auto current = owner->InspectReadyPulse();
  auto child = owner->InspectOwnedChild();
  if (child.closed || child.wrong_process || child.exit_observed_and_reaped ||
      child.exit_ownership_unknown || child.child_pid <= 1) return {SelectedStateHomeRoute::unavailable, {}};
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.closed) return {SelectedStateHomeRoute::closed, {}};
  if (state.selected != owner || !current || current->generation != pulse->generation ||
      current->exports < pulse->exports || !Fresh(*current)) return {SelectedStateHomeRoute::unavailable, {}};
  return {SelectedStateHomeRoute::current, *path, current->exports, child.child_pid};
}
SelectedStateHomeObservation CloseNativeSelectedStateHome() {
  auto& state = CurrentState();
  if (getpid() != state.process) return {SelectedStateHomeRoute::wrongProcess};
  std::shared_ptr<SelectedNativeHome> owner;
  std::unique_ptr<base::Thread> monitor;
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    state.closed = true;
    owner = state.selected;
    // Never wait for a protected/resource callback on this close path. Join
    // only after the monitor has left callbacks, from its actual creator.
    // Other calls retain explicit pending thread/initialization observations.
    if (state.monitor && !state.monitor_running && !state.initializing &&
        state.monitor_creator == base::PlatformThread::CurrentRef() &&
        !state.monitor->task_runner()->RunsTasksInCurrentSequence())
      monitor = std::move(state.monitor);
  }
  if (owner) {
    auto closed = owner->CloseNativeAdmission();
    std::lock_guard<std::mutex> lock(state.mutex);
    state.child_close = closed;
  }
  if (monitor) monitor->Stop();
  std::lock_guard<std::mutex> lock(state.mutex);
  return ObserveLocked(state);
}
NativeDaemonSignatureReply ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message) {
  auto message = base::Base64Decode(encoded_message);
  constexpr char prefix[] = "Aux Daemon Auth v1\0";
  constexpr size_t prefix_size = sizeof(prefix) - 1;
  if (!message || message->size() != prefix_size + 32 ||
      std::memcmp(message->data(), prefix, prefix_size) != 0)
    return {DaemonAuthorityStatus::refused, std::nullopt};
  auto reply = CallAuthority(AuthorityOperation::daemonSignature,
      std::span(reinterpret_cast<const uint8_t*>(message->data()), message->size()));
  if (reply.status != DaemonAuthorityStatus::ready) return {reply.status, std::nullopt};
  auto signature = base::Base64Encode(reply.payload);
  ClearPayload(reply);
  if (signature.empty() || signature.size() > 8192) return {DaemonAuthorityStatus::refused, std::nullopt};
  return {DaemonAuthorityStatus::ready, std::move(signature)};
}
std::optional<std::string> SignNativeSelectedDaemonChallenge(std::string_view encoded_message) {
  auto reply = ObserveNativeSelectedDaemonChallenge(encoded_message);
  return reply.status == DaemonAuthorityStatus::ready ? std::move(reply.signature) : std::nullopt;
}
std::optional<std::string> GetNativeSelectedInstallationPublicKeys() {
  auto reply = CallAuthority(AuthorityOperation::publicKeys, {});
  if (reply.status != DaemonAuthorityStatus::ready) return std::nullopt;
  std::string json(reply.payload.begin(), reply.payload.end());
  ClearPayload(reply);
  return json;
}
std::optional<std::array<uint8_t, 32>> GetNativeSelectedAgentInboxV2MasterKey() {
  auto reply = CallAuthority(AuthorityOperation::inboxKeyV2, {});
  if (reply.status != DaemonAuthorityStatus::ready || reply.payload.size() != 32) {
    ClearPayload(reply);
    return std::nullopt;
  }
  std::array<uint8_t, 32> key;
  std::copy(reply.payload.begin(), reply.payload.end(), key.begin());
  ClearPayload(reply);
  return key;
}
}  // namespace aux::peer
