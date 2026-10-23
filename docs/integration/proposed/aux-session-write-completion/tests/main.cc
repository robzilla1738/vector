#include "chrome/browser/ui/aux_workspace_snapshot_dispatch.h"

#include <cassert>
#include <iostream>
#include <vector>

using sessions::SessionBackendWriteOutcome;
using sessions::SessionWriteCompletion;

int main() {
  unsigned checks = 0;
  auto check = [&](bool value) { assert(value); ++checks; };
  const auto written = SessionBackendWriteOutcome::kWritten;
  SessionWriteCompletion dual;
  dual.captured_batch_had_commands = true;
  dual.backend_outcomes = {written, written};
  check(dual.captured_writes_completed());
  for (const auto failed : {
           SessionBackendWriteOutcome::kSkippedNoInitialState,
           SessionBackendWriteOutcome::kFileNotOpened,
           SessionBackendWriteOutcome::kFileWriteError,
           SessionBackendWriteOutcome::kSerializationError,
           SessionBackendWriteOutcome::kEncryptionUnavailable,
           SessionBackendWriteOutcome::kBackendUnavailable,
           SessionBackendWriteOutcome::kTaskRejected,
           SessionBackendWriteOutcome::kOwnerLost,
           SessionBackendWriteOutcome::kSavingDisabled}) {
    auto result = dual;
    result.backend_outcomes.back() = failed;
    check(!result.captured_writes_completed());
    aux::WorkspaceSnapshotDispatchState state;
    state.CloseAdmission();
    state.BeginWriteObservation();
    check(!state.Inspect().captured_writes_complete());
    state.DidObserveWrite(result);
    check(state.Inspect().pending_write_observations == 0 &&
          state.Inspect().failed_write_observations == 1 &&
          !state.Inspect().captured_writes_complete());
  }
  {
    auto deferred = dual;
    deferred.deferred_encryption_work = true;
    check(!deferred.captured_writes_completed());
    SessionWriteCompletion no_commands;
    check(!no_commands.captured_writes_completed());
    auto no_outcomes = dual;
    no_outcomes.backend_outcomes.clear();
    check(!no_outcomes.captured_writes_completed());
  }
  {
    aux::WorkspaceSnapshotDispatchState state;
    check(state.AdmitPending(1));
    state.CloseAdmission();
    state.BeginDispatch(1);
    state.BeginWriteObservation();
    state.DidDispatchPath();
    // The old dispatch result can be complete while the real async write is
    // still unobserved. Losing the scheduling owner cannot change that count.
    state.AbandonPending(0);
    check(state.Inspect().dispatch_complete());
    check(!state.Inspect().captured_writes_complete());
    check(state.Inspect().pending_write_observations == 1);
    state.DidObserveWrite(dual);
    check(state.Inspect().captured_writes_complete());
    state.DidObserveWrite(dual);  // double/unmatched result is unknown forever
    check(state.Inspect().accounting_unknown &&
          !state.Inspect().captured_writes_complete());
  }
  std::cout << "PASS " << checks << " captured write-result/lifetime checks\n";
}
