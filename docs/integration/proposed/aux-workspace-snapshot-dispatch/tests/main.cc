#include "chrome/browser/ui/aux_workspace_snapshot_dispatch.h"

#include <cassert>
#include <cstdint>
#include <iostream>
#include <limits>

using aux::WorkspaceSnapshotDispatchState;

int main() {
  unsigned checks = 0;
  auto check = [&](bool condition) { assert(condition); ++checks; };
  {
    WorkspaceSnapshotDispatchState state;
    check(!state.Inspect().dispatch_complete());
    check(state.AdmitPending(2));
    check(state.AdmitPending(0));  // duplicate paths do not inflate accounting
    check(state.Inspect().pending_paths == 2);
    state.CloseAdmission();
    check(!state.AdmitPending(0));  // even duplicate/reentrant schedule refused
    state.BeginDispatch(2);
    check(state.Inspect().pending_paths == 0 &&
          state.Inspect().in_flight_paths == 2);
    state.DidDispatchPath();
    check(!state.Inspect().dispatch_complete());
    // Close reentered from the actual reset callback cannot declare this
    // active path returned, nor reopen scheduling while the callback runs.
    state.CloseAdmission();
    check(!state.Inspect().dispatch_complete() && !state.AdmitPending(1));
    state.DidDispatchPath();
    check(state.Inspect().dispatch_complete());
    state.CloseAdmission();
    check(state.Inspect().dispatch_complete() && !state.AdmitPending(1));
  }
  {
    WorkspaceSnapshotDispatchState state;
    check(state.AdmitPending(2));
    state.BeginDispatch(2);
    // A normal callback may schedule more work before admission is closed.
    check(state.AdmitPending(1));
    state.CloseAdmission();
    state.BeginDispatch(1);
    state.DidDispatchPath();
    state.DidDispatchPath();
    check(!state.Inspect().dispatch_complete());
    state.DidDispatchPath();
    check(state.Inspect().dispatch_complete());
  }
  {
    WorkspaceSnapshotDispatchState state;
    check(state.AdmitPending(2));
    state.CloseAdmission();
    state.BeginDispatch(2);
    state.DidDispatchPath();
    state.DidNotDispatchPath();  // missing/non-saving service is not success
    check(!state.Inspect().dispatch_complete() &&
          state.Inspect().unresolved_paths == 1 &&
          state.Inspect().in_flight_paths == 0);
    state.CloseAdmission();
    check(state.Inspect().unresolved_paths == 1);
  }
  {
    WorkspaceSnapshotDispatchState state;
    check(state.AdmitPending(2));
    state.AbandonPending(2);  // owner destruction cancels, does not complete
    state.CloseAdmission();
    check(!state.Inspect().dispatch_complete() &&
          state.Inspect().pending_paths == 0 &&
          state.Inspect().unresolved_paths == 2);
  }
  {
    WorkspaceSnapshotDispatchState state;
    check(state.AdmitPending(1));
    state.CloseAdmission();
    // An unavailable browser process leaves queued paths explicitly pending.
    check(state.Inspect().pending_paths == 1 &&
          !state.Inspect().dispatch_complete());
  }
  {
    WorkspaceSnapshotDispatchState state;
    state.CloseAdmission();
    check(state.Inspect().dispatch_complete());
    state.DidDispatchPath();  // duplicate/unmatched completion poisons result
    check(state.Inspect().accounting_unknown &&
          !state.Inspect().dispatch_complete());
  }
  {
    WorkspaceSnapshotDispatchState state;
    check(state.AdmitPending(std::numeric_limits<uint64_t>::max()));
    check(!state.AdmitPending(1));
    state.CloseAdmission();
    check(state.Inspect().accounting_unknown &&
          !state.Inspect().dispatch_complete());
  }
  std::cout << "PASS " << checks << " production dispatch-accounting checks\n";
}
