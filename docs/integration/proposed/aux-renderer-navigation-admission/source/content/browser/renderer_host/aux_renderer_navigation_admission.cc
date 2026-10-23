#include "content/browser/renderer_host/aux_renderer_navigation_admission.h"

#include <limits>
#include <map>
#include <mutex>
#include <set>

namespace content::aux_migration {
namespace {
struct Launch {
  uint64_t token;
  bool in_process;
};
struct State {
  State();
  ~State();
  std::mutex mutex;
  bool closed = false;
  size_t active_init = 0;
  size_t unresolved_launches = 0;
  size_t late_callbacks = 0;
  size_t active_navigation = 0;
  size_t unresolved_navigation = 0;
  size_t unsupported_navigation = 0;
  uint64_t next_token = 0;
  std::map<const void*, Launch> launches;
  std::set<const void*> navigations;
};
State::State() = default;
State::~State() = default;
State& Current() {
  static State* const state = new State;
  return *state;
}
void Increment(size_t& count) {
  if (count != std::numeric_limits<size_t>::max())
    ++count;
}
bool AcquireInit() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.closed || state.active_init == std::numeric_limits<size_t>::max())
    return false;
  ++state.active_init;
  return true;
}
bool AcquireNavigation(const void* request, bool first_entry) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.closed || !request ||
      state.active_navigation == std::numeric_limits<size_t>::max())
    return false;
  if (!state.navigations.contains(request)) {
    if (!first_entry)
      Increment(state.unsupported_navigation);
    state.navigations.insert(request);
  }
  ++state.active_navigation;
  return true;
}
uint64_t BeginLaunchCallback(const void* host) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.closed)
    Increment(state.late_callbacks);
  auto found = state.launches.find(host);
  if (found == state.launches.end()) {
    Increment(state.unresolved_launches);
    return 0;
  }
  return found->second.token;
}
}  // namespace

void CloseRendererNavigationAdmissionForMigration() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  state.closed = true;
}
RendererNavigationAdmissionSnapshot
InspectRendererNavigationAdmissionForMigration() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  return {state.closed ? uint64_t{2} : uint64_t{1}, state.closed,
          state.active_init, state.launches.size(), state.unresolved_launches,
          state.late_callbacks, state.active_navigation, state.navigations.size(),
          state.unresolved_navigation, state.unsupported_navigation};
}
ScopedRendererInitAdmission::ScopedRendererInitAdmission()
    : admitted_(AcquireInit()) {}
ScopedRendererInitAdmission::~ScopedRendererInitAdmission() {
  if (admitted_) {
    auto& state = Current();
    std::lock_guard<std::mutex> lock(state.mutex);
    --state.active_init;
  }
}
void ObserveRendererLaunchStarted(const void* host, bool in_process) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (!host || state.next_token == std::numeric_limits<uint64_t>::max() ||
      state.launches.contains(host)) {
    Increment(state.unresolved_launches);
    return;
  }
  state.launches.emplace(host, Launch{++state.next_token, in_process});
}
void ObserveRendererHostDestruction(const void* host) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.launches.erase(host))
    Increment(state.unresolved_launches);
}
ScopedRendererLaunchCallback::ScopedRendererLaunchCallback(const void* host)
    : host_identity_(reinterpret_cast<uintptr_t>(host)),
      token_(BeginLaunchCallback(host)) {}
ScopedRendererLaunchCallback::~ScopedRendererLaunchCallback() {
  if (!token_)
    return;
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  auto found = state.launches.find(reinterpret_cast<const void*>(host_identity_));
  if (found == state.launches.end() || found->second.token != token_) {
    Increment(state.unresolved_launches);
    return;
  }
  // The in-process route calls OnProcessLaunched before starting its thread;
  // that synthetic callback cannot prove launch completion or thread custody.
  if (found->second.in_process)
    Increment(state.unresolved_launches);
  state.launches.erase(found);
}
ScopedNavigationAdmission::ScopedNavigationAdmission(const void* request,
                                                     bool first_entry)
    : admitted_(AcquireNavigation(request, first_entry)) {}
ScopedNavigationAdmission::~ScopedNavigationAdmission() {
  if (admitted_) {
    auto& state = Current();
    std::lock_guard<std::mutex> lock(state.mutex);
    --state.active_navigation;
  }
}
void ObserveNavigationDestruction(const void* request) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.navigations.erase(request)) {
    // Destructor entry is not member/backend teardown completion. Retain that
    // gap explicitly rather than treating request deletion as writer drain.
    Increment(state.unresolved_navigation);
  }
}
void ObserveUnsupportedNavigationCancellation() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  Increment(state.unsupported_navigation);
}
}  // namespace content::aux_migration
