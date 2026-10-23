#include "chrome/browser/ui/aux_session_writer_participant.h"
#include <cassert>
#include <iostream>

int main() {
  unsigned checks = 0;
  auto check = [&](bool value) { assert(value); ++checks; };
  aux::WorkspaceSnapshotDispatchState state;
  check(!state.SealDispatchAfterObservedCallbacks());
  check(state.AdmitPending(2));
  state.CloseAdmission();
  check(state.BeginDispatch(2));
  state.BeginWriteObservation();
  state.BeginWriteObservation();
  state.DidDispatchPath();
  check(!state.SealDispatchAfterObservedCallbacks());
  state.DidDispatchPath();
  check(!state.SealDispatchAfterObservedCallbacks());
  sessions::SessionWriteCompletion success;
  success.captured_batch_had_commands = true;
  success.backend_outcomes = {sessions::SessionBackendWriteOutcome::kWritten};
  state.DidObserveWrite(success);
  check(!state.SealDispatchAfterObservedCallbacks());
  auto failure = success;
  failure.backend_outcomes = {sessions::SessionBackendWriteOutcome::kFileWriteError};
  state.DidObserveWrite(failure);
  check(state.SealDispatchAfterObservedCallbacks());
  check(state.Inspect().dispatch_admission_closed);
  check(!state.BeginDispatch(0));
  check(state.Inspect().failed_write_observations == 1);
  check(!state.Inspect().captured_writes_complete());
  {
    aux::WorkspaceSnapshotDispatchState unavailable;
    check(unavailable.AdmitPending(1));
    unavailable.CloseAdmission();
    check(unavailable.SealDispatchAfterObservedCallbacks());
    check(!unavailable.BeginDispatch(1));
    check(unavailable.Inspect().pending_paths == 1);
    check(!unavailable.Inspect().dispatch_complete());
  }
  {
    aux::WorkspaceSnapshotDispatchState lost;
    lost.CloseAdmission();
    lost.DidObserveWrite(success);  // unmatched callback accounting is unknown
    check(!lost.SealDispatchAfterObservedCallbacks());
    check(lost.Inspect().accounting_unknown);
  }
  aux::SessionWriterParticipantObservation result;
  result.loaded_profile_count = 1;
  result.initial_snapshot_dispatch = state.Inspect();
  result.profiles.resize(1);
  check(result.profiles[0].outcome == aux::ProfileSessionWriterOutcome::kNotAttempted);
  check(!result.profiles[0].write && !result.profiles[0].close);
  result.profiles[0].write = failure;
  result.profiles[0].close.emplace();
  result.profiles[0].close->unsubmitted_commands = 3;
  check(!result.profiles[0].write->captured_writes_completed());
  check(result.profiles[0].close->unsubmitted_commands == 3);
  std::cout << "PASS " << checks << " production dispatch-seal/typed-outcome checks\n";
}
