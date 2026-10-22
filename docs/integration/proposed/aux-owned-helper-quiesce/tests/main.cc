// Actual production pure state + carrier custody, no browser/child/OS calls.
#include <cassert>
#include <iostream>
#include "chrome/browser/aux/owned_direct_helper_quiesce.h"
using namespace aux;
int main() {
  using R=OwnedDirectHelperQuiesceObservation::Readiness;
  int checks=0;
  auto check=[&](bool value){assert(value);++checks;};
  InstallationCarrierCustody empty;
  OwnedDirectHelperQuiesceState pending;
  check(pending.Inspect(empty.Inspect()).readiness()==R::kCloseNotRequested);
  pending.CloseRequested();empty.CloseAdmission();
  check(pending.Inspect(empty.Inspect()).readiness()==R::kDirectDaemonPending);
  for(int i=0;i<3;++i)check(!pending.Inspect(empty.Inspect()).owned_helpers_drained());
  DirectDaemonQuiesceResult no_owned;no_owned.outcome=DirectDaemonQuiesceResult::Outcome::kNoOwnedProcess;
  pending.ObserveDirectResult(no_owned);
  check(pending.Inspect(empty.Inspect()).owned_helpers_drained());
  pending.CloseRequested();pending.ObserveDirectResult(no_owned);
  check(pending.Inspect(empty.Inspect()).owned_helpers_drained());
  InstallationCarrierCustody active;auto queued=active.BeginCall();
  OwnedDirectHelperQuiesceState queued_state;queued_state.CloseRequested();active.CloseAdmission();queued_state.ObserveDirectResult(no_owned);
  check(queued_state.Inspect(active.Inspect()).readiness()==R::kCarrierCallsPending);
  bool invoked=false;check(!queued->LaunchIfAdmitted([&]{invoked=true;return true;}));check(!invoked);
  queued.reset();check(queued_state.Inspect(active.Inspect()).owned_helpers_drained());check(!active.BeginCall());
  InstallationCarrierCustody unresolved;auto launched=unresolved.BeginCall();
  // Synthetic launch acknowledgement: no process is actually created here.
  check(launched->LaunchIfAdmitted([]{return true;}));unresolved.CloseAdmission();
  OwnedDirectHelperQuiesceState unknown;unknown.CloseRequested();
  DirectDaemonQuiesceResult exited;exited.outcome=DirectDaemonQuiesceResult::Outcome::kExited; // zero exit is represented by nullopt in production.
  unknown.ObserveDirectResult(exited);
  check(unknown.Inspect(unresolved.Inspect()).readiness()==R::kCarrierCallsPending);
  launched.reset();auto lost=unknown.Inspect(unresolved.Inspect());
  check(lost.readiness()==R::kCarrierChildrenUnresolved);check(lost.installation_carriers.unresolved_children==1);check(!lost.owned_helpers_drained());
  check(unknown.Inspect(unresolved.Inspect()).readiness()==R::kCarrierChildrenUnresolved);
  InstallationCarrierCustody observed;auto call=observed.BeginCall();check(call->LaunchIfAdmitted([]{return true;}));observed.CloseAdmission();call->ObservedChildExit();
  OwnedDirectHelperQuiesceState observed_state;observed_state.CloseRequested();observed_state.ObserveDirectResult(exited);
  check(!observed_state.Inspect(observed.Inspect()).owned_helpers_drained());call.reset();check(observed_state.Inspect(observed.Inspect()).owned_helpers_drained());
  OwnedDirectHelperQuiesceState failed;failed.CloseRequested();DirectDaemonQuiesceResult failure;failed.ObserveDirectResult(failure);
  check(failed.Inspect(empty.Inspect()).readiness()==R::kDirectDaemonFailed);
  failed.ObserveDirectResult(exited);auto conflict=failed.Inspect(empty.Inspect());check(conflict.readiness()==R::kConflictingDirectObservation);check(conflict.direct_daemon->outcome==DirectDaemonQuiesceResult::Outcome::kDrainFailed);check(!conflict.owned_helpers_drained());
  OwnedDirectHelperQuiesceState open;open.CloseRequested();open.ObserveDirectResult(no_owned);InstallationCarrierCustody still_open;
  check(open.Inspect(still_open.Inspect()).readiness()==R::kCarrierAdmissionOpen);
  DirectDaemonQuiesceResult invalid;invalid.outcome=static_cast<DirectDaemonQuiesceResult::Outcome>(99);OwnedDirectHelperQuiesceState invalid_state;invalid_state.CloseRequested();invalid_state.ObserveDirectResult(invalid);check(invalid_state.Inspect(empty.Inspect()).readiness()==R::kUnexpectedDirectObservation);
  std::cout<<checks<<" production owned-helper aggregate/carrier checks; no child launch, timeout, browser or OS action\n";
}
