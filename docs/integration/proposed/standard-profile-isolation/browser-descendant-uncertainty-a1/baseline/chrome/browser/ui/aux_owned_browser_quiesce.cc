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
#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"
#include "chrome/browser/browser_process.h"
#include "content/public/browser/browser_thread.h"

namespace aux {
namespace {

using QuiesceCallback = base::OnceCallback<void(OwnedBrowserQuiesceObservation)>;

struct ParticipantState {
  bool close_requested = false;
  bool process_shutdown = false;
  bool participant_submission_pending = false;
  bool profile_manager_unavailable = false;
  bool helper_pending = false;
  bool session_pending = false;
  bool feature_pending = false;
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
  if (state.participant_submission_pending || state.helper_pending ||
      state.session_pending || state.feature_pending) {
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

// Submission remains pending across reentrant helper/session/worker callbacks.
// Workers stop only after the other participant close requests are submitted;
// their raw pending/unknown observations still do not establish storage custody.
void FinishParticipantSubmission() {
  content::aux_migration::StopAlreadyOwnedServiceWorkerContextsForMigration();
  State().participant_submission_pending = false;
  ReportAvailableObservations();
}

}  // namespace

OwnedBrowserQuiesceObservation InspectOwnedBrowserParticipantQuiesce() {
  CHECK(content::BrowserThread::CurrentlyOn(content::BrowserThread::UI));
  const auto& state = State();
  OwnedBrowserQuiesceObservation result;
  result.close_requested = state.close_requested;
  result.process_shutdown = state.process_shutdown;
  result.content_children = content::aux_migration::InspectContentChildDrain();
  const auto messaging = extensions::AuxNativeMessagingLifetime::Inspect();
  result.native_messaging = {messaging.admission_closed, messaging.wrong_process,
      messaging.accounting_unknown, messaging.unresolved, messaging.unbound,
      messaging.uncertain, messaging.settled};
  result.participant_submission_pending = state.participant_submission_pending;
  result.profile_manager_unavailable = state.profile_manager_unavailable;
  result.helper_observation_pending = state.helper_pending;
  result.session_observation_pending = state.session_pending;
  result.feature_observation_pending = state.feature_pending;
  result.feature_writes = features::InspectNativeFeatureWrites();
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

namespace {
void CloseParticipants(QuiesceCallback done, bool process_shutdown) {
  CHECK(content::BrowserThread::CurrentlyOn(content::BrowserThread::UI));
  auto& state = State();
  state.waiters.push_back(std::move(done));
  if (state.close_requested) {
    // An earlier migration cannot be promoted to an ordinary shutdown receipt.
    if (state.process_shutdown != process_shutdown)
      state.profile_manager_unavailable = true;
    ReportAvailableObservations();
    return;
  }

  // Set both pending observations before any native callback can reenter.
  state.close_requested = true;
  state.process_shutdown = process_shutdown;
  content::aux_migration::CloseContentChildLaunchAdmission();
  extensions::AuxNativeMessagingLifetime::CloseAdmission();
  state.participant_submission_pending = true;
  state.helper_pending = !process_shutdown;
  state.session_pending = true;
  state.feature_pending = true;
  // Close feature admission before helpers/native authority can start closing.
  // Tickets persist past Profile/receiver destruction and settle from actual I/O.
  features::CloseNativeFeatureWritesForMigration(base::BindOnce(
      [](features::NativeFeatureWriteObservation) {
        State().feature_pending = false;
        ReportAvailableObservations();
      }));
  content::aux_migration::CloseRendererNavigationAdmissionForMigration();
  content::aux_migration::CloseServiceWorkerStartAdmissionForMigration();
  CloseAsyncProfileCreationAdmission();
  extensions::ServiceWorkerTaskQueue::CloseStartAdmissionForMigration();

  if (!process_shutdown)
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
    FinishParticipantSubmission();
    return;
  }
  auto close_sessions = process_shutdown ? &CloseLoadedSessionWritersForShutdown
                                         : &CloseLoadedSessionWritersForMigration;
  close_sessions(
      *manager, base::BindOnce([](SessionWriterParticipantObservation observation) {
        auto& state = State();
        state.sessions = std::move(observation);
        state.session_pending = false;
        ReportAvailableObservations();
      }));
  FinishParticipantSubmission();
}

}  // namespace
void CloseOwnedBrowserParticipantsForMigration(QuiesceCallback done) {
  CloseParticipants(std::move(done), false);
}
void CloseOwnedBrowserParticipantsForShutdown(QuiesceCallback done) {
  CloseParticipants(std::move(done), true);
}
BrowserParticipantDrainResult EvaluateOwnedBrowserParticipantDrain(
    const OwnedBrowserQuiesceObservation& o) {
  BrowserParticipantDrainResult result{o.close_requested, o.process_shutdown,
      !o.close_requested || o.participant_submission_pending ||
          o.helper_observation_pending || o.session_observation_pending ||
          o.feature_observation_pending,
      o.profile_manager_unavailable};
  const auto& f = o.feature_writes;
  result.pending |= !f.admission_closed || f.pending;
  result.unknown |= f.wrong_process || f.uncertain || f.abandoned;
  for (const auto& child : {o.content_children, o.native_messaging}) {
    result.pending |= !child.admission_closed || child.pending || child.unbound;
    result.unknown |= child.wrong_process || child.accounting_unknown || child.uncertain;
  }
  const auto& p = o.async_profile_creation;
  result.pending |= !p.closed || p.active_dispatches || p.unfinished_initializations;
  result.unknown |= p.unresolved_initializations != 0;
  const auto& r = o.renderer_navigation;
  result.pending |= !r.closed || r.active_renderer_init_calls ||
      r.pending_renderer_launches || r.active_navigation_dispatches ||
      r.live_navigation_requests;
  result.unknown |= r.unresolved_renderer_launches ||
      r.unresolved_navigation_cleanups || r.unsupported_navigation_cancellations;
  const auto& w = o.service_workers;
  result.pending |= !w.start_admission_closed || w.pending_start_callbacks ||
      w.active_start_callback_dispatches || w.pending_context_stop_callbacks ||
      w.active_stop_cleanup_dispatches;
  result.unknown |= w.unresolved_start_callbacks || w.unresolved_context_stops ||
      w.unavailable_context_cores || w.detached_worker_observations;
  const auto& e = o.extension_worker_starts;
  result.pending |= e.admission_open;
  const auto inspect_queue = [&](const auto& q, bool destroyed) {
    const bool callbacks = q.registration_callbacks || q.verification_callbacks ||
        q.pending_storage_registrations || q.pending_unregistrations;
    result.pending |= callbacks || q.pending_tasks;
    result.unknown |= destroyed && (callbacks || q.pending_tasks);
    for (const auto& worker : q.workers) result.pending |= worker.starting;
    for (const auto& worker : q.retired_workers) result.pending |= worker.starting;
  };
  for (const auto& q : e.queues) inspect_queue(q, false);
  for (const auto& q : e.destroyed_queues) inspect_queue(q, true);
  if (!o.process_shutdown) {
    result.pending |= !o.helpers || !o.helpers->owned_helpers_drained();
  }
  if (!o.sessions) {
    result.pending = true;
    return result;
  }
  const auto& sessions = *o.sessions;
  result.unknown |= sessions.outcome != SessionWriterParticipantOutcome::kObserved ||
      sessions.profiles.size() != sessions.loaded_profile_count;
  const auto& dispatch = sessions.final_snapshot_dispatch;
  result.pending |= !dispatch.dispatch_admission_closed ||
      !dispatch.captured_writes_complete();
  result.unknown |= dispatch.accounting_unknown || dispatch.unresolved_paths ||
      dispatch.failed_write_observations;
  const auto inspect_service = [&](const auto& service) {
    if (service.outcome == ProfileSessionWriterOutcome::kNoExistingService) return;
    if (service.outcome != ProfileSessionWriterOutcome::kServiceObserved ||
        !service.close || !service.write) {
      result.unknown = true;
      return;
    }
    const auto& close = *service.close;
    result.pending |= !close.admission_closed || close.unsubmitted_commands ||
        close.unsubmitted_reset || close.deferred_encryption_operations ||
        close.active_encryption_replay_operations;
    result.unknown |= close.manager_unavailable || close.admission_accounting_unknown ||
        close.required_encrypted_backend_missing;
    for (const auto& backend : close.backends) {
      result.pending |= !backend.admission_closed || !backend.owned_file_object_released;
      result.unknown |= !backend.owning_sequence_observed || backend.task_rejected ||
          backend.accounting_unknown || backend.failed_write_returns;
    }
    if (service.write->captured_batch_had_commands &&
        !service.write->captured_writes_completed()) result.unknown = true;
    result.pending |= service.write->deferred_encryption_work;
  };
  for (const auto& profile : sessions.profiles) {
    inspect_service(profile);
    inspect_service(profile.app_session);
  }
  return result;
}
}  // namespace aux
