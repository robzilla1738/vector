#include "content/browser/service_worker/aux_service_worker_admission_state.h"

#include <limits>
#include <map>
#include <mutex>
#include <set>

namespace content::aux_migration {
namespace {
struct Stop {
  const void* context;
  bool unavailable;
};
struct State {
  State();
  ~State();
  std::mutex mutex;
  bool closed = false;
  uint64_t next_token = 0;
  std::set<uint64_t> starts;
  std::set<uint64_t> active_callbacks;
  std::set<const void*> contexts;
  std::map<uint64_t, Stop> stops;
  size_t unresolved_starts = 0;
  size_t late_successes = 0;
  size_t observed_stops = 0;
  size_t active_stop_cleanups = 0;
  size_t unresolved_stops = 0;
  size_t unavailable_cores = 0;
  size_t detached = 0;
  size_t stopped = 0;
};
State::State() = default;
State::~State() = default;
State& Current() {
  static State* const state = new State;
  return *state;
}
void Increment(size_t& counter) {
  if (counter != std::numeric_limits<size_t>::max())
    ++counter;
}
uint64_t Token(State& state) {
  return state.next_token == std::numeric_limits<uint64_t>::max()
             ? 0 : ++state.next_token;
}
void MarkContextUnavailable(State& state, const void* context) {
  for (auto& [token, stop] : state.stops) {
    if (stop.context == context)
      stop.unavailable = true;
  }
}
}  // namespace

void CloseServiceWorkerAdmissionState() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  state.closed = true;
}
bool ServiceWorkerStartsAllowedForMigration() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  return !state.closed;
}
ServiceWorkerMigrationSnapshot InspectServiceWorkerAdmissionState() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  return {state.closed ? uint64_t{2} : uint64_t{1}, state.closed,
          state.starts.size(), state.active_callbacks.size(),
          state.unresolved_starts, state.late_successes, state.contexts.size(),
          state.stops.size(), state.observed_stops, state.active_stop_cleanups,
          state.unresolved_stops,
          state.unavailable_cores, state.detached, state.stopped};
}
uint64_t ObserveServiceWorkerStartRequested() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  auto token = Token(state);
  if (token)
    state.starts.insert(token);
  else
    Increment(state.unresolved_starts);
  return token;
}
bool ObserveServiceWorkerStartCallbackEntered(uint64_t token, bool succeeded) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (!token || !state.starts.contains(token) ||
      !state.active_callbacks.insert(token).second) {
    Increment(state.unresolved_starts);
    return false;
  }
  if (state.closed && succeeded)
    Increment(state.late_successes);
  return !state.closed;
}
void ObserveServiceWorkerStartCallbackFinished(uint64_t token) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  const bool started = state.starts.erase(token) == 1;
  const bool active = state.active_callbacks.erase(token) == 1;
  if (!started || !active)
    Increment(state.unresolved_starts);
}
void ObserveServiceWorkerStartCallbackLost(uint64_t token) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.starts.erase(token)) {
    state.active_callbacks.erase(token);
    Increment(state.unresolved_starts);
  }
}
void ObserveServiceWorkerContextRegistered(const void* context) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  state.contexts.insert(context);
}
void ObserveServiceWorkerContextUnregistered(const void* context) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  state.contexts.erase(context);
  MarkContextUnavailable(state, context);
}
void ObserveServiceWorkerContextShutdown(const void* context) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  MarkContextUnavailable(state, context);
}
uint64_t ObserveServiceWorkerContextStopRequested(const void* context,
                                                bool core_available) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  const auto token = Token(state);
  if (!core_available)
    Increment(state.unavailable_cores);
  if (token)
    state.stops.emplace(token, Stop{context, !core_available});
  else
    Increment(state.unresolved_stops);
  return token;
}
void ObserveServiceWorkerContextStopCallback(uint64_t token) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  auto found = state.stops.find(token);
  if (found == state.stops.end()) {
    Increment(state.unresolved_stops);
    return;
  }
  Increment(state.observed_stops);
  if (found->second.unavailable)
    Increment(state.unresolved_stops);
  state.stops.erase(found);
}
void ObserveServiceWorkerContextStopCallbackLost(uint64_t token) {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.stops.erase(token))
    Increment(state.unresolved_stops);
}
ScopedServiceWorkerStopCleanup::ScopedServiceWorkerStopCleanup() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  ++state.active_stop_cleanups;
}
ScopedServiceWorkerStopCleanup::~ScopedServiceWorkerStopCleanup() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  --state.active_stop_cleanups;
}
void ObserveServiceWorkerDetached() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  Increment(state.detached);
}
void ObserveServiceWorkerStopped() {
  auto& state = Current();
  std::lock_guard<std::mutex> lock(state.mutex);
  Increment(state.stopped);
}
}  // namespace content::aux_migration
