// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_SESSION_WRITER_PARTICIPANT_H_
#define CHROME_BROWSER_UI_AUX_SESSION_WRITER_PARTICIPANT_H_

#include <cstddef>
#include <optional>
#include <vector>

#include "base/functional/callback_forward.h"
#include "chrome/browser/ui/aux_workspace_snapshot_dispatch.h"
#include "components/sessions/core/session_write_completion.h"
#include "components/sessions/core/session_writer_admission.h"

class ProfileManager;

namespace aux {

// A zero pending count during a reentrant submission loop is not completion:
// later inventory entries have not yet had their actual operations submitted.
// This is UI-sequence bookkeeping, not a lifetime or custody grant.
class SessionWriterSubmissionWindow {
 public:
  void Begin() { submitting_ = true; }
  void Finish() { submitting_ = false; }
  bool CanAdvance(size_t pending_operations) const {
    return !submitting_ && pending_operations == 0;
  }

 private:
  bool submitting_ = false;
};

enum class ProfileSessionWriterOutcome {
  kNotAttempted,
  kServiceObserved,
  kProfileOwnerLost,
  kServiceOwnerLost,
  kNoExistingService,
};

// The installed-web-app service is a sibling writer with its own app-restore
// backend. Never fold its absence, failure or owner loss into the browser row.
struct ProfileAppSessionWriterObservation {
  ProfileSessionWriterOutcome outcome = ProfileSessionWriterOutcome::kNotAttempted;
  std::optional<sessions::SessionWriteCompletion> write;
  std::optional<sessions::SessionManagerCloseObservation> close;
};

struct ProfileSessionWriterObservation {
  size_t inventory_index = 0;
  ProfileSessionWriterOutcome outcome = ProfileSessionWriterOutcome::kNotAttempted;
  std::optional<sessions::SessionWriteCompletion> write;
  std::optional<sessions::SessionManagerCloseObservation> close;
  ProfileAppSessionWriterObservation app_session;
};

enum class SessionWriterParticipantOutcome {
  kObserved,
  kSnapshotAccountingUnknown,
};

// Observations of this captured loaded-profile inventory and actual callbacks.
// No aggregate success, profile-creation closure, provenance or custody grant.
struct SessionWriterParticipantObservation {
  SessionWriterParticipantOutcome outcome = SessionWriterParticipantOutcome::kObserved;
  size_t loaded_profile_count = 0;
  WorkspaceSnapshotDispatchObservation initial_snapshot_dispatch;
  WorkspaceSnapshotDispatchObservation final_snapshot_dispatch;
  std::vector<ProfileSessionWriterObservation> profiles;
};

// Native UI-sequence migration participant, NOT ordinary browser Shutdown.
// Uses only an already-owned manager; captures weak profile lifetimes before
// callbacks and never retains this reference across an await. No service is
// created. Dropped asynchronous callbacks remain pending; no timeout success.
void CloseLoadedSessionWritersForMigration(
    ProfileManager& manager,
    base::OnceCallback<void(SessionWriterParticipantObservation)> done);

}  // namespace aux
#endif  // CHROME_BROWSER_UI_AUX_SESSION_WRITER_PARTICIPANT_H_
