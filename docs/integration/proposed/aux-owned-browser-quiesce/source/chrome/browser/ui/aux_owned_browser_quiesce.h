// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_OWNED_BROWSER_QUIESCE_H_
#define CHROME_BROWSER_UI_AUX_OWNED_BROWSER_QUIESCE_H_

#include <optional>

#include "base/functional/callback.h"
#include "chrome/browser/aux/owned_direct_helper_quiesce.h"
#include "chrome/browser/profiles/aux_async_profile_creation_admission.h"
#include "chrome/browser/ui/aux_session_writer_participant.h"
#include "extensions/browser/service_worker/service_worker_task_queue.h"

namespace aux {

// Raw observations of these native participants, never whole-profile custody.
struct OwnedBrowserQuiesceObservation {
  bool close_requested = false;
  bool profile_manager_unavailable = false;
  bool helper_observation_pending = false;
  bool session_observation_pending = false;
  AsyncProfileCreationAdmissionSnapshot async_profile_creation;
  extensions::ServiceWorkerTaskQueue::ProcessStartAdmissionSnapshot
      extension_worker_starts;
  std::optional<OwnedDirectHelperQuiesceObservation> helpers;
  std::optional<SessionWriterParticipantObservation> sessions;
};

// UI sequence only. Closes actual process admission before starting async work.
// A returned observation may contain unresolved, failed or still-running work.
// No timeout, reopening, migration grant or ordinary-shutdown hook is provided.
void CloseOwnedBrowserParticipantsForMigration(
    base::OnceCallback<void(OwnedBrowserQuiesceObservation)> done);
OwnedBrowserQuiesceObservation InspectOwnedBrowserParticipantQuiesce();

}  // namespace aux
#endif  // CHROME_BROWSER_UI_AUX_OWNED_BROWSER_QUIESCE_H_
