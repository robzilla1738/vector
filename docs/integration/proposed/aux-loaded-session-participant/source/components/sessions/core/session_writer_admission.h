// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_SESSIONS_CORE_SESSION_WRITER_ADMISSION_H_
#define COMPONENTS_SESSIONS_CORE_SESSION_WRITER_ADMISSION_H_

#include <cstddef>
#include <cstdint>
#include <utility>
#include <limits>
#include <vector>

namespace sessions {

// Sequence-local native writer state; no reopen, timeout or custody grant.
class SessionWriterAdmission {
 public:
  bool Admit() {
    if (!closed_) return true;
    Increment(refused_);
    return false;
  }
  void Close() { closed_ = true; }
  void ObserveFailedWrite() { Increment(failed_writes_); }
  bool closed() const { return closed_; }
  uint64_t refused() const { return refused_; }
  uint64_t failed_writes() const { return failed_writes_; }
  bool unknown() const { return unknown_; }
 private:
  void Increment(uint64_t& value) {
    if (value == std::numeric_limits<uint64_t>::max()) unknown_ = true;
    else ++value;
  }
  bool closed_ = false;
  bool unknown_ = false;
  uint64_t refused_ = 0;
  uint64_t failed_writes_ = 0;
};

// Observes this actual backend instance on its owning sequence. File release
// means its RAII File object was destroyed; no fsync/close-error claim exists.
enum class SessionBackendKind { kClear, kEncrypted };

struct SessionBackendCloseObservation {
  SessionBackendKind kind = SessionBackendKind::kClear;
  bool admission_closed = false;
  bool owning_sequence_observed = false;
  bool owned_file_object_released = false;
  bool task_rejected = false;
  bool accounting_unknown = false;
  uint64_t refused_requests = 0;
  uint64_t failed_write_returns = 0;
};

// Retain unexecuted opaque closures after a reentrant close. This is not a
// replay API: manager admission remains permanently closed.
template <typename Operation>
void RetainUnrunSessionOperations(std::vector<Operation>& pending,
                                 std::vector<Operation>& running,
                                 size_t first_unrun) {
  for (size_t i = first_unrun; i < running.size(); ++i)
    pending.push_back(std::move(running[i]));
}

struct SessionManagerCloseObservation {
  bool manager_unavailable = false;
  bool admission_closed = false;
  bool required_encrypted_backend_missing = false;
  bool admission_accounting_unknown = false;
  uint64_t unsubmitted_commands = 0;
  bool unsubmitted_reset = false;
  uint64_t deferred_encryption_operations = 0;
  uint64_t active_encryption_replay_operations = 0;
  uint64_t refused_requests_at_close = 0;
  std::vector<SessionBackendCloseObservation> backends;
};

}  // namespace sessions
#endif  // COMPONENTS_SESSIONS_CORE_SESSION_WRITER_ADMISSION_H_
