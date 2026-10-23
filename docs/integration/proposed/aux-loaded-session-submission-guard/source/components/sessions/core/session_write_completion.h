// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_SESSIONS_CORE_SESSION_WRITE_COMPLETION_H_
#define COMPONENTS_SESSIONS_CORE_SESSION_WRITE_COMPLETION_H_

#include <algorithm>
#include <vector>

namespace sessions {

// Actual AppendCommands return outcomes, not file flush/fsync or admission.
enum class SessionBackendWriteOutcome {
  kWritten,
  kSkippedNoInitialState,
  kFileNotOpened,
  kFileWriteError,
  kSerializationError,
  kEncryptionUnavailable,
  kBackendUnavailable,
  kTaskRejected,
  kOwnerLost,
  kSavingDisabled,
  kAdmissionClosed,
};

struct SessionWriteCompletion {
  bool captured_batch_had_commands = false;
  bool deferred_encryption_work = false;
  std::vector<SessionBackendWriteOutcome> backend_outcomes;

  // Every selected copy must have a genuine successful write-method return.
  // No assertion about older/later requests, durability or other writers.
  bool captured_writes_completed() const {
    return captured_batch_had_commands && !deferred_encryption_work &&
           !backend_outcomes.empty() &&
           std::all_of(backend_outcomes.begin(), backend_outcomes.end(),
                       [](SessionBackendWriteOutcome value) {
                         return value == SessionBackendWriteOutcome::kWritten;
                       });
  }
};

}  // namespace sessions
#endif  // COMPONENTS_SESSIONS_CORE_SESSION_WRITE_COMPLETION_H_
