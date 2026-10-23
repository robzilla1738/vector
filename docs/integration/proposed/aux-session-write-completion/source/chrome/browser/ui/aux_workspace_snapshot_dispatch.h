// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_WORKSPACE_SNAPSHOT_DISPATCH_H_
#define CHROME_BROWSER_UI_AUX_WORKSPACE_SNAPSHOT_DISPATCH_H_

#include <cstdint>
#include <limits>

#include "components/sessions/core/session_write_completion.h"

namespace aux {

// UI-sequence observation of this process's profile-switch snapshot scheduler.
// A returned ResetFromCurrentBrowsers is dispatch, NOT durable storage closure.
struct WorkspaceSnapshotDispatchObservation {
  bool admission_closed = false;
  uint64_t pending_paths = 0;
  uint64_t in_flight_paths = 0;
  uint64_t unresolved_paths = 0;
  bool accounting_unknown = false;
  uint64_t pending_write_observations = 0;
  uint64_t failed_write_observations = 0;

  bool captured_writes_complete() const {
    return dispatch_complete() && !pending_write_observations &&
           !failed_write_observations;
  }

  bool dispatch_complete() const {
    return admission_closed && !pending_paths && !in_flight_paths &&
           !unresolved_paths && !accounting_unknown;
  }
};

// Production accounting, independent of Profile/SessionService lifetime. There
// is deliberately no reset/reopen, timeout-to-success or destructor completion.
class WorkspaceSnapshotDispatchState {
 public:
  bool AdmitPending(uint64_t added_paths) {
    if (state_.admission_closed || state_.accounting_unknown) {
      return false;
    }
    return Add(state_.pending_paths, added_paths);
  }

  void CloseAdmission() { state_.admission_closed = true; }

  void BeginDispatch(uint64_t paths) {
    if (!Take(state_.pending_paths, paths)) {
      return;
    }
    Add(state_.in_flight_paths, paths);
  }

  // Only called after the actual SessionService reset invocation returns.
  void DidDispatchPath() { Take(state_.in_flight_paths, 1); }

  // Missing profile/service, disabled saving, or other unobserved completion.
  void DidNotDispatchPath() {
    if (Take(state_.in_flight_paths, 1)) {
      Add(state_.unresolved_paths, 1);
    }
  }

  void AbandonPending(uint64_t paths) {
    if (Take(state_.pending_paths, paths)) {
      Add(state_.unresolved_paths, paths);
    }
  }

  void BeginWriteObservation() { Add(state_.pending_write_observations, 1); }

  void DidObserveWrite(const sessions::SessionWriteCompletion& result) {
    if (Take(state_.pending_write_observations, 1) &&
        !result.captured_writes_completed()) {
      Add(state_.failed_write_observations, 1);
    }
  }

  WorkspaceSnapshotDispatchObservation Inspect() const { return state_; }

 private:
  bool Add(uint64_t& destination, uint64_t count) {
    if (count > std::numeric_limits<uint64_t>::max() - destination) {
      state_.accounting_unknown = true;
      return false;
    }
    destination += count;
    return true;
  }

  bool Take(uint64_t& source, uint64_t count) {
    if (count > source) {
      state_.accounting_unknown = true;
      return false;
    }
    source -= count;
    return true;
  }

  WorkspaceSnapshotDispatchObservation state_;
};

}  // namespace aux
#endif  // CHROME_BROWSER_UI_AUX_WORKSPACE_SNAPSHOT_DISPATCH_H_
