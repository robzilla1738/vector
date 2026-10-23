// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux_owned_browser_quiesce.h"

#include <utility>
#include <vector>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/location.h"
#include "base/no_destructor.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/browser_process.h"
#include "content/public/browser/browser_thread.h"

namespace aux {
namespace {

using QuiesceCallback = base::OnceCallback<void(OwnedBrowserQuiesceObservation)>;

struct ParticipantState {
  bool close_requested = false;
  bool profile_manager_unavailable = false;
  bool helper_pending = false;
  bool session_pending = false;
  bool helper_observed = false;
  std::optional<SessionWriterParticipantObservation> sessions;
  std::vector<QuiesceCallback> waiters;
};

ParticipantState& State() {
  static base::NoDestructor<ParticipantState> state;
  return *state;
}

void ReportAvailableObservations() {
  auto& state = State();
  if (state.helper_pending || state.session_pending) {
    return;
  }
  auto waiters = std::exchange(state.waiters, {});
  for (auto& waiter : waiters) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(std::move(waiter),
                       InspectOwnedBrowserParticipantQuiesce()));
  }
}

}  // namespace

OwnedBrowserQuiesceObservation InspectOwnedBrowserParticipantQuiesce() {
  CHECK(content::BrowserThread::CurrentlyOn(content::BrowserThread::UI));
  const auto& state = State();
  OwnedBrowserQuiesceObservation result;
  result.close_requested = state.close_requested;
  result.profile_manager_unavailable = state.profile_manager_unavailable;
  result.helper_observation_pending = state.helper_pending;
  result.session_observation_pending = state.session_pending;
  result.async_profile_creation = InspectAsyncProfileCreationAdmission();
  result.extension_worker_starts = extensions::ServiceWorkerTaskQueue::
      InspectStartAdmissionForMigration();
  result.renderer_navigation = content::aux_migration::
      InspectRendererNavigationAdmissionForMigration();
  result.service_workers = content::aux_migration::
      InspectServiceWorkerMigrationAdmission();
  if (state.helper_observed) {
    // Carrier operations may outlive the daemon callback. Keep their actual
    // current custody snapshot rather than treating that callback as a drain.
    result.helpers = BrowserPlatform::Get().InspectOwnedDirectHelperQuiesce();
  }
  result.sessions = state.sessions;
  return result;
}

void CloseOwnedBrowserParticipantsForMigration(QuiesceCallback done) {
  CHECK(content::BrowserThread::CurrentlyOn(content::BrowserThread::UI));
  auto& state = State();
  state.waiters.push_back(std::move(done));
  if (state.close_requested) {
    ReportAvailableObservations();
    return;
  }

  // Set both pending observations before any native callback can reenter.
  state.close_requested = true;
  state.helper_pending = true;
  state.session_pending = true;
  content::aux_migration::CloseRendererNavigationAdmissionForMigration();
  content::aux_migration::CloseServiceWorkerStartAdmissionForMigration();
  CloseAsyncProfileCreationAdmission();
  extensions::ServiceWorkerTaskQueue::CloseStartAdmissionForMigration();

  // All admission gates are closed before StopWorker can reenter. Its callback
  // is an observation, never proof of worker exit or storage custody. Pending,
  // detached and unresolved work remain explicit in each returned snapshot.
  content::aux_migration::StopAlreadyOwnedServiceWorkerContextsForMigration();

  BrowserPlatform::Get().QuiesceOwnedDirectHelpersForMigration(base::BindOnce(
      [](OwnedDirectHelperQuiesceObservation) {
        auto& state = State();
        state.helper_observed = true;
        state.helper_pending = false;
        ReportAvailableObservations();
      }));

  ProfileManager* manager = g_browser_process
                                ? g_browser_process->profile_manager_if_initialized()
                                : nullptr;
  if (!manager) {
    state.profile_manager_unavailable = true;
    state.session_pending = false;
    ReportAvailableObservations();
    return;
  }
  CloseLoadedSessionWritersForMigration(
      *manager, base::BindOnce([](SessionWriterParticipantObservation observation) {
        auto& state = State();
        state.sessions = std::move(observation);
        state.session_pending = false;
        ReportAvailableObservations();
      }));
}

}  // namespace aux
