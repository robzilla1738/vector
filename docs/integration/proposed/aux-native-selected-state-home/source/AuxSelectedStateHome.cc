#include "AuxSelectedStateHome.h"
#include "base/files/scoped_file.h"
#include "base/functional/bind.h"
#include "base/threading/thread.h"
#include <unistd.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <limits.h>
#include <chrono>
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
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.closed) return {SelectedStateHomeRoute::closed, {}};
  if (state.selected != owner || !current || current->generation != pulse->generation ||
      current->exports < pulse->exports || !Fresh(*current)) return {SelectedStateHomeRoute::unavailable, {}};
  return {SelectedStateHomeRoute::current, *path, current->exports};
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
}  // namespace aux::peer
