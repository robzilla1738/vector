// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_OWNED_DIRECT_HELPER_QUIESCE_H_
#define CHROME_BROWSER_AUX_OWNED_DIRECT_HELPER_QUIESCE_H_
#include <optional>
#include "chrome/browser/aux/direct_daemon_quiesce_result.h"
#include "chrome/browser/aux/installation_carrier_custody.h"
namespace aux {
// UI-sequence snapshot, not a global/cross-process writer barrier or grant.
struct OwnedDirectHelperQuiesceObservation {
  enum class Scope { kThisBrowserDirectDaemonAndInstallationCarrierOnly };
  enum class Readiness {
    kCloseNotRequested, kDirectDaemonPending, kDirectDaemonFailed,
    kCarrierAdmissionOpen, kCarrierCallsPending, kCarrierChildrenUnresolved,
    kConflictingDirectObservation, kUnexpectedDirectObservation, kDrained
  };
  Scope scope = Scope::kThisBrowserDirectDaemonAndInstallationCarrierOnly;
  bool close_requested;
  std::optional<DirectDaemonQuiesceResult> direct_daemon;
  InstallationCarrierCustody::Snapshot installation_carriers;
  bool conflicting_direct_observation;
  Readiness readiness() const {
    if (!close_requested) return Readiness::kCloseNotRequested;
    if (conflicting_direct_observation)
      return Readiness::kConflictingDirectObservation;
    if (!direct_daemon) return Readiness::kDirectDaemonPending;
    if (direct_daemon->scope !=
        DirectDaemonQuiesceResult::Scope::kOwnedDirectDaemonOnly)
      return Readiness::kUnexpectedDirectObservation;
    switch (direct_daemon->outcome) {
      case DirectDaemonQuiesceResult::Outcome::kDrainFailed:
        return Readiness::kDirectDaemonFailed;
      case DirectDaemonQuiesceResult::Outcome::kNoOwnedProcess:
      case DirectDaemonQuiesceResult::Outcome::kExited:
        break;
      default:return Readiness::kUnexpectedDirectObservation;
    }
    if (!installation_carriers.admission_closed)
      return Readiness::kCarrierAdmissionOpen;
    if (installation_carriers.unresolved_children)
      return Readiness::kCarrierChildrenUnresolved;
    if (installation_carriers.active_calls)
      return Readiness::kCarrierCallsPending;
    return Readiness::kDrained;
  }
  bool owned_helpers_drained() const {return readiness()==Readiness::kDrained;}
};
// No reopen/reset/timeout rule. Missing callbacks and child exits stay pending.
class OwnedDirectHelperQuiesceState {
 public:
  void CloseRequested() {close_requested_=true;}
  void ObserveDirectResult(const DirectDaemonQuiesceResult& result) {
    if (direct_) {
      if (direct_->scope!=result.scope || direct_->outcome!=result.outcome ||
          direct_->exit_code!=result.exit_code) conflict_=true;
      return;  // Never overwrite an earlier failure/unknown observation.
    }
    direct_=result;
  }
  OwnedDirectHelperQuiesceObservation Inspect(
      InstallationCarrierCustody::Snapshot carriers) const {
    return {OwnedDirectHelperQuiesceObservation::Scope::
                kThisBrowserDirectDaemonAndInstallationCarrierOnly,
            close_requested_,direct_,carriers,conflict_};
  }
 private:
  bool close_requested_=false;
  bool conflict_=false;
  std::optional<DirectDaemonQuiesceResult> direct_;
};
}  // namespace aux
#endif
