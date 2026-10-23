#pragma once
#include <EndpointSecurity/EndpointSecurity.h>
#include <cstdint>
#include <memory>
#include <optional>
#include <vector>

namespace aux {
// Event-only observation, not native spawn provenance, initial population,
// installation authority or an atomic subtree-empty/closure proof.
class EsDescendantObserver final {
 public:
  struct ProcessIdentity {
    int32_t pid;
    int64_t birth_seconds;
    int32_t birth_microseconds;
    bool operator<(const ProcessIdentity& other) const;
  };
  struct ObservedProcess {
    ProcessIdentity identity;
    uint32_t execution_version;
    std::optional<ProcessIdentity> observed_parent;
    bool observed_fork;
  };
  struct Snapshot {
    bool process_matches = false;
    bool subscribed = false;
    bool stop_requested = false;
    bool observation_stopped = false;
    bool cleanup_unknown = false;
    bool unsupported_message = false;
    bool malformed_identity = false;
    bool execution_discontinuity = false;
    bool sequence_discontinuity = false;
    bool capacity_lost = false;
    bool handler_failed = false;
    bool observed_without_fork = false;
    uint64_t events = 0;
    uint64_t forks = 0;
    uint64_t execs = 0;
    uint64_t exits = 0;
    uint64_t detected_missing_events = 0;
    std::optional<uint64_t> first_global_sequence;
    std::optional<uint64_t> last_global_sequence;
    std::optional<es_new_client_result_t> creation_status;
    std::optional<es_return_t> subscription_status;
    std::optional<es_return_t> unsubscribe_status;
    std::optional<es_return_t> deletion_status;
    std::vector<ObservedProcess> observed_processes;
    // Always event-only: neither initial census nor delivery barrier exists in
    // this component. There deliberately is no drained/empty⇒success API.
  };
  enum class CreateError {
    none, wrongProcess, unavailable, clientCreation, nullClient, subscription
  };
  struct CreateResult;
  enum class StopResult { stopped, busy, cleanupUnknown, wrongProcess };

  // Actual embedding must call before its first real native spawn/Node entry.
  // The name is an integration contract, never a claim that this method can
  // prove the caller had no earlier children. No policy/env/JSON argument.
  static CreateResult CreateBeforeFirstNativeSpawn();
  static std::optional<size_t> RetainedCleanupUnknownCount();
  ~EsDescendantObserver();
  EsDescendantObserver(const EsDescendantObserver&) = delete;
  EsDescendantObserver& operator=(const EsDescendantObserver&) = delete;
  Snapshot Observe() const;
  // Stops observation only. It does not stop any process or close PTY spawning.
  // ES deletion error is terminal unknown; deleted pointer is never retried.
  StopResult StopObservation();

 private:
  struct State;
  explicit EsDescendantObserver(std::shared_ptr<State> state);
  std::shared_ptr<State> state_;
};
struct EsDescendantObserver::CreateResult {
  CreateError error = CreateError::none;
  // Retain even when subscription failed so actual cleanup is observable.
  std::unique_ptr<EsDescendantObserver> observer;
};
}  // namespace aux
