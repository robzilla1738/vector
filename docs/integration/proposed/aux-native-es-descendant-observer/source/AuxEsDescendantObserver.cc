#include "AuxEsDescendantObserver.h"
#include <bsm/libbsm.h>
#include <unistd.h>
#include <algorithm>
#include <array>
#include <atomic>
#include <limits>
#include <map>
#include <mutex>
#include <tuple>
#include <utility>

namespace aux {
namespace {
const pid_t kLoadedProcess = getpid();
constexpr size_t kMaximumActiveObservations = 4096;
thread_local const void* handling_observer = nullptr;
void Increment(uint64_t& value) {
  if (value != std::numeric_limits<uint64_t>::max()) ++value;
}
}  // namespace
bool EsDescendantObserver::ProcessIdentity::operator<(
    const ProcessIdentity& other) const {
  return std::tie(pid, birth_seconds, birth_microseconds) <
         std::tie(other.pid, other.birth_seconds, other.birth_microseconds);
}
struct EsDescendantObserver::State {
  const pid_t owner = getpid();
  mutable std::mutex mutex;
  std::mutex api_mutex;
  es_client_t* client = nullptr;
  Snapshot snapshot;
  std::atomic<bool> handler_failed{false};
  std::map<ProcessIdentity, ObservedProcess> active;
  std::array<std::optional<uint64_t>, 3> last_type_sequence;

  struct Registry {
    std::mutex mutex;
    std::vector<std::shared_ptr<State>> retained;
  };
  static Registry& Retention() {
    // Never destruct a possibly still-owned ES client at C++ static teardown.
    static Registry* registry = new Registry;
    return *registry;
  }
  static void Retain(const std::shared_ptr<State>& state) {
    auto& registry = Retention();
    std::lock_guard lock(registry.mutex);
    registry.retained.push_back(state);
  }
  static void ReleaseRetention(const std::shared_ptr<State>& state) {
    auto& registry = Retention();
    std::lock_guard lock(registry.mutex);
    std::erase_if(registry.retained, [&](const auto& item) {
      return item.get() == state.get();
    });
  }
  static std::optional<ObservedProcess> Identity(const es_process_t* process) {
    if (!process) return std::nullopt;
    const pid_t pid = audit_token_to_pid(process->audit_token);
    const auto birth = process->start_time;
    if (pid <= 0 || birth.tv_sec < 0 || birth.tv_usec < 0 ||
        birth.tv_usec >= 1000000) return std::nullopt;
    return ObservedProcess{
        {pid, birth.tv_sec, static_cast<int32_t>(birth.tv_usec)},
        static_cast<uint32_t>(audit_token_to_pidversion(process->audit_token)),
        std::nullopt, false};
  }
  void Sequence(std::optional<uint64_t>& previous, uint64_t sequence) {
    if (previous) {
      if (*previous == std::numeric_limits<uint64_t>::max() ||
          sequence != *previous + 1) {
        snapshot.sequence_discontinuity = true;
        if (sequence > *previous && sequence - *previous > 1) {
          const uint64_t missing = sequence - *previous - 1;
          snapshot.detected_missing_events =
              std::numeric_limits<uint64_t>::max() -
                          snapshot.detected_missing_events < missing
                  ? std::numeric_limits<uint64_t>::max()
                  : snapshot.detected_missing_events + missing;
        }
      }
    }
    previous = sequence;
  }
  ObservedProcess* Upsert(const ObservedProcess& process, bool fork_observed) {
    auto found = active.find(process.identity);
    if (found != active.end()) {
      if (found->second.execution_version != process.execution_version)
        snapshot.execution_discontinuity = true;
      found->second.execution_version = process.execution_version;
      return &found->second;
    }
    if (active.size() >= kMaximumActiveObservations) {
      snapshot.capacity_lost = true;
      return nullptr;
    }
    auto copy = process;
    copy.observed_fork = fork_observed;
    if (!fork_observed && process.identity.pid != owner)
      snapshot.observed_without_fork = true;
    return &active.emplace(copy.identity, copy).first->second;
  }
  void Record(es_client_t* delivered_client, const es_message_t* message) {
    if (getpid() != owner) { handler_failed.store(true); return; }
    std::lock_guard lock(mutex);
    if (!message || message->version < 4) {
      snapshot.unsupported_message = true;
      return;
    }
    if (client != delivered_client ||
        message->action_type != ES_ACTION_TYPE_NOTIFY) {
      snapshot.malformed_identity = true;
      return;
    }
    size_t index;
    switch (message->event_type) {
      case ES_EVENT_TYPE_NOTIFY_FORK: index = 0; break;
      case ES_EVENT_TYPE_NOTIFY_EXEC: index = 1; break;
      case ES_EVENT_TYPE_NOTIFY_EXIT: index = 2; break;
      default: snapshot.unsupported_message = true; return;
    }
    Increment(snapshot.events);
    if (!snapshot.first_global_sequence)
      snapshot.first_global_sequence = message->global_seq_num;
    Sequence(snapshot.last_global_sequence, message->global_seq_num);
    // Type gaps and global gaps can describe the same drop. Only global gaps
    // contribute to the numeric count; all discontinuities remain sticky.
    const auto missing = snapshot.detected_missing_events;
    Sequence(last_type_sequence[index], message->seq_num);
    snapshot.detected_missing_events = missing;
    auto actor = Identity(message->process);
    if (!actor) { snapshot.malformed_identity = true; return; }
    if (message->event_type == ES_EVENT_TYPE_NOTIFY_FORK) {
      Increment(snapshot.forks);
      auto child = Identity(message->event.fork.child);
      if (!child) { snapshot.malformed_identity = true; return; }
      Upsert(*actor, false);
      if (auto* record = Upsert(*child, true)) {
        record->observed_parent = actor->identity;
        record->observed_fork = true;
      }
    } else if (message->event_type == ES_EVENT_TYPE_NOTIFY_EXEC) {
      Increment(snapshot.execs);
      auto target = Identity(message->event.exec.target);
      if (!target || actor->identity < target->identity ||
          target->identity < actor->identity) {
        snapshot.malformed_identity = true;
        return;
      }
      // pidversion changes at exec; do not mistake one process's new execution
      // for a new descendant, or leave its prior execution permanently live.
      if (auto* record = Upsert(*actor, false))
        record->execution_version = target->execution_version;
    } else {
      Increment(snapshot.exits);
      Upsert(*actor, false);
      active.erase(actor->identity); // Kernel EXIT observation, not waitpid.
    }
  }
};
EsDescendantObserver::EsDescendantObserver(std::shared_ptr<State> state)
    : state_(std::move(state)) {}
EsDescendantObserver::~EsDescendantObserver() { StopObservation(); }
EsDescendantObserver::CreateResult
EsDescendantObserver::CreateBeforeFirstNativeSpawn() {
  CreateResult result;
  if (getpid() != kLoadedProcess) {
    result.error = CreateError::wrongProcess; return result;
  }
  if (__builtin_available(macOS 27.0, *)) {
    auto state = std::make_shared<State>();
    // Reserve all C++ owners/retention before creating an actual native client.
    result.observer.reset(new EsDescendantObserver(state));
    State::Retain(state);
    es_client_t* client = nullptr;
    auto created = es_new_descendants_client(
        &client, ^(es_client_t* delivered, const es_message_t* message) {
          const void* previous = handling_observer;
          handling_observer = state.get();
          try { state->Record(delivered, message); }
          catch (...) { state->handler_failed.store(true); }
          handling_observer = previous;
        });
    {
      std::lock_guard lock(state->mutex);
      state->client = client;
      state->snapshot.creation_status = created;
    }
    if (created != ES_NEW_CLIENT_RESULT_SUCCESS || !client) {
      result.error = created == ES_NEW_CLIENT_RESULT_SUCCESS
                         ? CreateError::nullClient : CreateError::clientCreation;
      return result;
    }
    const es_event_type_t events[] = {ES_EVENT_TYPE_NOTIFY_FORK,
        ES_EVENT_TYPE_NOTIFY_EXEC, ES_EVENT_TYPE_NOTIFY_EXIT};
    const auto subscribed = es_subscribe(client, events, 3);
    {
      std::lock_guard lock(state->mutex);
      state->snapshot.subscription_status = subscribed;
      state->snapshot.subscribed = subscribed == ES_RETURN_SUCCESS;
    }
    if (subscribed != ES_RETURN_SUCCESS) result.error = CreateError::subscription;
    return result; // No systemwide-client or older-macOS fallback.
  }
  result.error = CreateError::unavailable;
  return result;
}
EsDescendantObserver::Snapshot EsDescendantObserver::Observe() const {
  if (getpid() != state_->owner) return Snapshot{};
  std::lock_guard lock(state_->mutex);
  Snapshot copy = state_->snapshot;
  copy.process_matches = true;
  copy.handler_failed = state_->handler_failed.load();
  copy.observed_processes.reserve(state_->active.size());
  for (const auto& [identity, record] : state_->active)
    copy.observed_processes.push_back(record);
  return copy;
}
EsDescendantObserver::StopResult EsDescendantObserver::StopObservation() {
  auto state = state_;
  if (getpid() != state->owner) return StopResult::wrongProcess;
  if (handling_observer == state.get()) return StopResult::busy;
  // es_delete_client must have exclusive access. Callback only takes mutex,
  // never api_mutex or an ES API, so no mutex spans native callback completion.
  std::unique_lock api(state->api_mutex, std::try_to_lock);
  if (!api.owns_lock()) return StopResult::busy;
  es_client_t* client;
  {
    std::lock_guard lock(state->mutex);
    state->snapshot.stop_requested = true;
    if (state->snapshot.cleanup_unknown) return StopResult::cleanupUnknown;
    client = state->client;
  }
  if (!client) {
    State::ReleaseRetention(state);
    return StopResult::stopped;
  }
  const auto unsubscribed = es_unsubscribe_all(client);
  const auto deleted = es_delete_client(client);
  {
    std::lock_guard lock(state->mutex);
    state->snapshot.unsubscribe_status = unsubscribed;
    state->snapshot.deletion_status = deleted;
    state->snapshot.subscribed = false;
    state->client = nullptr; // Deleted pointer is never passed to ES again.
    state->snapshot.observation_stopped = deleted == ES_RETURN_SUCCESS;
    state->snapshot.cleanup_unknown = deleted != ES_RETURN_SUCCESS;
  }
  if (deleted == ES_RETURN_SUCCESS) {
    State::ReleaseRetention(state);
    return StopResult::stopped; // Observer resources only, NOT subtree drain.
  }
  return StopResult::cleanupUnknown; // Real retained state; no retry of pointer.
}
std::optional<size_t> EsDescendantObserver::RetainedCleanupUnknownCount() {
  if (getpid() != kLoadedProcess) return std::nullopt;
  auto& registry = State::Retention();
  std::lock_guard registry_lock(registry.mutex);
  size_t count = 0;
  for (const auto& state : registry.retained) {
    std::lock_guard lock(state->mutex);
    if (state->snapshot.cleanup_unknown) ++count;
  }
  return count;
}
}  // namespace aux
