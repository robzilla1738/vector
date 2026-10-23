// Copyright 2026 The Aux Authors
// Local platform adaptation of the supplied profile-switch lifecycle.

#include "chrome/browser/ui/aux_profile_switch_session_rebuild.h"
#include "chrome/browser/ui/aux_session_writer_participant.h"

#include <utility>
#include <vector>

#include "base/no_destructor.h"
#include "base/callback_list.h"
#include "base/memory/ref_counted.h"
#include "base/task/bind_post_task.h"

#include "base/functional/bind.h"
#include "base/location.h"
#include "base/logging.h"
#include "base/task/sequenced_task_runner.h"
#include "base/time/time.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/sessions/session_service.h"
#include "chrome/browser/sessions/exit_type_service.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "content/public/browser/browser_thread.h"

namespace aux {

namespace {
WorkspaceSnapshotDispatchState& SnapshotDispatchState() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  static WorkspaceSnapshotDispatchState state;
  return state;
}

base::RepeatingClosureList& SnapshotDispatchObservers() {
  static base::NoDestructor<base::RepeatingClosureList> observers;
  return *observers;
}

void NotifySnapshotDispatchChanged() {
  SnapshotDispatchObservers().Notify();
}

auto& LiveRebuildOwners() {
  static base::NoDestructor<std::set<ProfileSwitchSessionRebuild*>> owners;
  return *owners;
}
}  // namespace

ProfileSwitchSessionRebuild::ProfileSwitchSessionRebuild() {
  LiveRebuildOwners().insert(this);
}
ProfileSwitchSessionRebuild::~ProfileSwitchSessionRebuild() {
  // Destruction cancels weak tasks; it does not observe their intended write.
  SnapshotDispatchState().AbandonPending(pending_paths_.size());
  LiveRebuildOwners().erase(this);
  NotifySnapshotDispatchChanged();
}

void ProfileSwitchSessionRebuild::FlushPendingBeforeClose() {
  std::vector<base::WeakPtr<ProfileSwitchSessionRebuild>> owners;
  for (auto* owner : LiveRebuildOwners()) {
    DCHECK_CALLED_ON_VALID_SEQUENCE(owner->sequence_checker_);
    owners.push_back(owner->weak_ptr_factory_.GetWeakPtr());
  }
  for (auto& owner : owners) {
    if (owner && !owner->pending_paths_.empty()) {
      // Invalidate every older delayed generation, then snapshot actual
      // settled collections before close callbacks detach them.
      owner->Rebuild(++owner->generation_);
    }
  }
}

WorkspaceSnapshotDispatchObservation
ProfileSwitchSessionRebuild::CloseAdmissionAndDispatchPendingSnapshots() {
  auto& state = SnapshotDispatchState();
  // Close first: ResetFromCurrentBrowsers may reenter window/profile callbacks.
  state.CloseAdmission();
  std::vector<base::WeakPtr<ProfileSwitchSessionRebuild>> owners;
  for (auto* owner : LiveRebuildOwners()) {
    DCHECK_CALLED_ON_VALID_SEQUENCE(owner->sequence_checker_);
    // No delayed generation can later dispatch a second snapshot.
    ++owner->generation_;
    owners.push_back(owner->weak_ptr_factory_.GetWeakPtr());
  }
  for (auto& owner : owners) {
    if (owner && !owner->pending_paths_.empty()) {
      owner->Rebuild(owner->generation_);
    }
  }
  return state.Inspect();
}

WorkspaceSnapshotDispatchObservation
ProfileSwitchSessionRebuild::InspectSnapshotDispatch() {
  return SnapshotDispatchState().Inspect();
}

void ProfileSwitchSessionRebuild::Schedule(Profile& previous_profile,
                                         Profile& target_profile) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (!SnapshotDispatchState().AdmitPending(0)) {
    return;
  }
  // Supplied04559f80 accumulates BOTH paths and advances its generation before
  // the 500ms task. Do not discard paths from a rapid intervening switch.
  auto next_paths = pending_paths_;
  next_paths.insert(previous_profile.GetOriginalProfile()->GetPath());
  next_paths.insert(target_profile.GetOriginalProfile()->GetPath());
  if (!SnapshotDispatchState().AdmitPending(next_paths.size() -
                                          pending_paths_.size())) {
    return;
  }
  pending_paths_ = std::move(next_paths);
  const uint64_t generation = ++generation_;
  base::SequencedTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE,
      base::BindOnce(&ProfileSwitchSessionRebuild::Rebuild,
                     weak_ptr_factory_.GetWeakPtr(), generation),
      base::Milliseconds(500));
}

void ProfileSwitchSessionRebuild::Rebuild(uint64_t generation) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (SnapshotDispatchState().Inspect().dispatch_admission_closed ||
      generation != generation_ || !g_browser_process ||
      !g_browser_process->profile_manager()) {
    return;
  }
  auto paths = std::exchange(pending_paths_, {});
  auto& dispatch = SnapshotDispatchState();
  if (!dispatch.BeginDispatch(paths.size())) {
    pending_paths_ = std::move(paths);
    NotifySnapshotDispatchChanged();
    return;
  }
  // Everything below uses only local state. A reset callback can destroy this
  // owner; process accounting survives and no member is touched after it.
  ProfileManager* manager = g_browser_process->profile_manager();
  for (const base::FilePath& path : paths) {
    // Original027a56a4 looks up an already loaded profile. Never create/load a
    // profile or service as a side effect of delayed workspace persistence.
    Profile* profile = manager->GetProfileByPath(path);
    if (!profile) {
      LOG(WARNING) << "Aux workspace persistence: loaded=0";
      dispatch.DidNotDispatchPath();
      NotifySnapshotDispatchChanged();
      continue;
    }
    SessionService* service = SessionServiceFactory::GetForProfileIfExisting(
        profile->GetOriginalProfile());
    int windows = 0;
    int cache_windows = 0;
    int tabs = 0;
    ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
        [&](BrowserWindowInterface* browser) {
          if (browser->GetProfile() == profile->GetOriginalProfile()) {
            ++windows;
            tabs += browser->GetTabStripModel()->count();
            if (BrowserInitState::From(browser)->is_aux_profile_switch_cache()) {
              ++cache_windows;
            }
          }
          return true;
        });
    auto* exit_type = ExitTypeService::GetInstanceForProfile(profile);
    // Bounded explicit-switch diagnostics only: never profile paths, IDs,
    // titles, URLs, tab contents, or credential material.
    LOG(WARNING) << "Aux workspace persistence: loaded=1 service="
                 << (service != nullptr)
                 << " saving=" << (service && service->is_saving_enabled())
                 << " crash_ack_pending="
                 << (exit_type && exit_type->waiting_for_user_to_ack_crash())
                 << " windows=" << windows << " caches=" << cache_windows
                 << " tabs=" << tabs;
    if (service && service->is_saving_enabled()) {
      if (dispatch.Inspect().admission_closed) {
        dispatch.BeginWriteObservation();
        service->ResetFromCurrentBrowsersWithWriteCompletion(base::BindOnce(
            [](sessions::SessionWriteCompletion result) {
              SnapshotDispatchState().DidObserveWrite(result);
              NotifySnapshotDispatchChanged();
            }));
      } else {
        service->ResetFromCurrentBrowsers();
      }
      dispatch.DidDispatchPath();
    } else {
      dispatch.DidNotDispatchPath();
    }
    NotifySnapshotDispatchChanged();
  }
}

namespace {

// Real callback owner for one captured inventory. It never retains a manager
// reference or converts an absent/dropped callback into an observation.
class LoadedSessionWriterParticipant
    : public base::RefCounted<LoadedSessionWriterParticipant> {
 public:
  LoadedSessionWriterParticipant(
      std::vector<base::WeakPtr<Profile>> profiles,
      base::OnceCallback<void(SessionWriterParticipantObservation)> done);
  void Start();

 private:
  friend class base::RefCounted<LoadedSessionWriterParticipant>;
  ~LoadedSessionWriterParticipant();
  enum class Phase { kWaitingSnapshotCallbacks, kWriting, kClosing, kFinished };
  void ScheduleAdvance();
  void Advance();
  void BeginFinalWrites();
  void DidWrite(size_t index, sessions::SessionWriteCompletion result);
  void BeginManagerCloses();
  void DidClose(size_t index, sessions::SessionManagerCloseObservation result);
  void Finish();

  std::vector<base::WeakPtr<Profile>> profiles_;
  std::vector<base::WeakPtr<SessionServiceBase>> services_;
  base::OnceCallback<void(SessionWriterParticipantObservation)> done_;
  SessionWriterParticipantObservation result_;
  base::CallbackListSubscription snapshot_subscription_;
  scoped_refptr<base::SequencedTaskRunner> runner_;
  // Keep actual pending accounting even if a queued result callback is dropped.
  scoped_refptr<LoadedSessionWriterParticipant> retained_until_observed_;
  Phase phase_ = Phase::kWaitingSnapshotCallbacks;
  SessionWriterSubmissionWindow write_submission_;
  SessionWriterSubmissionWindow close_submission_;
  size_t pending_writes_ = 0;
  size_t pending_closes_ = 0;
  bool advance_posted_ = false;
};

LoadedSessionWriterParticipant::LoadedSessionWriterParticipant(
    std::vector<base::WeakPtr<Profile>> profiles,
    base::OnceCallback<void(SessionWriterParticipantObservation)> done)
    : profiles_(std::move(profiles)),
      services_(profiles_.size()),
      done_(base::BindPostTaskToCurrentDefault(std::move(done))),
      runner_(base::SequencedTaskRunner::GetCurrentDefault()) {
  result_.loaded_profile_count = profiles_.size();
  result_.profiles.resize(profiles_.size());
  for (size_t i = 0; i < profiles_.size(); ++i)
    result_.profiles[i].inventory_index = i;
}

LoadedSessionWriterParticipant::~LoadedSessionWriterParticipant() = default;

void LoadedSessionWriterParticipant::Start() {
  retained_until_observed_ = base::WrapRefCounted(this);
  snapshot_subscription_ = SnapshotDispatchObservers().Add(base::BindRepeating(
      &LoadedSessionWriterParticipant::ScheduleAdvance,
      base::WrapRefCounted(this)));
  result_.initial_snapshot_dispatch =
      ProfileSwitchSessionRebuild::CloseAdmissionAndDispatchPendingSnapshots();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::ScheduleAdvance() {
  if (phase_ == Phase::kFinished || advance_posted_) return;
  advance_posted_ = true;
  // A rejected/dropped task leaves the owner retained and unresolved. Never
  // run a fallback success callback during sequence shutdown.
  runner_->PostTask(FROM_HERE,
                    base::BindOnce(&LoadedSessionWriterParticipant::Advance,
                                   base::WrapRefCounted(this)));
}

void LoadedSessionWriterParticipant::Advance() {
  advance_posted_ = false;
  if (phase_ == Phase::kWaitingSnapshotCallbacks) {
    const auto snapshot = SnapshotDispatchState().Inspect();
    if (snapshot.in_flight_paths || snapshot.pending_write_observations) return;
    if (!SnapshotDispatchState().SealDispatchAfterObservedCallbacks()) {
      result_.outcome = SessionWriterParticipantOutcome::kSnapshotAccountingUnknown;
      Finish();
      return;
    }
    // Actual old callbacks are settled and future Flush/Rebuild is now sealed.
    // Pending unavailable paths remain in the observation, not discarded.
    snapshot_subscription_ = {};
    BeginFinalWrites();
    return;
  }
  if (phase_ == Phase::kWriting) {
    if (write_submission_.CanAdvance(pending_writes_)) BeginManagerCloses();
    return;
  }
  if (phase_ == Phase::kClosing &&
      close_submission_.CanAdvance(pending_closes_)) Finish();
}

void LoadedSessionWriterParticipant::BeginFinalWrites() {
  phase_ = Phase::kWriting;
  write_submission_.Begin();
  for (size_t i = 0; i < profiles_.size(); ++i) {
    auto& observation = result_.profiles[i];
    if (!profiles_[i]) {
      observation.outcome = ProfileSessionWriterOutcome::kProfileOwnerLost;
      continue;
    }
    SessionService* service =
        SessionServiceFactory::GetForProfileIfExisting(profiles_[i].get());
    if (!service) {
      observation.outcome = ProfileSessionWriterOutcome::kNoExistingService;
      continue;
    }
    services_[i] = service->GetWeakPtrForNativeSessionWriterParticipant();
    observation.outcome = ProfileSessionWriterOutcome::kServiceObserved;
    ++pending_writes_;
    service->ResetFromCurrentBrowsersWithWriteCompletion(base::BindOnce(
        &LoadedSessionWriterParticipant::DidWrite, base::WrapRefCounted(this), i));
    // No raw profile/service access after the reset can reenter destruction.
  }
  write_submission_.Finish();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::DidWrite(
    size_t index, sessions::SessionWriteCompletion result) {
  CHECK(phase_ == Phase::kWriting);
  CHECK(pending_writes_ && !result_.profiles[index].write.has_value());
  result_.profiles[index].write = std::move(result);
  --pending_writes_;
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::BeginManagerCloses() {
  phase_ = Phase::kClosing;
  close_submission_.Begin();
  for (size_t i = 0; i < services_.size(); ++i) {
    auto& observation = result_.profiles[i];
    if (!observation.write.has_value()) continue;
    if (!profiles_[i]) {
      observation.outcome = ProfileSessionWriterOutcome::kProfileOwnerLost;
      continue;
    }
    if (!services_[i]) {
      observation.outcome = ProfileSessionWriterOutcome::kServiceOwnerLost;
      continue;
    }
    ++pending_closes_;
    services_[i]->CloseCommandWriterAdmissionAndObserve(base::BindOnce(
        &LoadedSessionWriterParticipant::DidClose, base::WrapRefCounted(this), i));
  }
  close_submission_.Finish();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::DidClose(
    size_t index, sessions::SessionManagerCloseObservation result) {
  CHECK(phase_ == Phase::kClosing);
  CHECK(pending_closes_ && !result_.profiles[index].close.has_value());
  auto& observation = result_.profiles[index];
  observation.close = std::move(result);
  if (!profiles_[index])
    observation.outcome = ProfileSessionWriterOutcome::kProfileOwnerLost;
  else if (!services_[index])
    observation.outcome = ProfileSessionWriterOutcome::kServiceOwnerLost;
  --pending_closes_;
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::Finish() {
  auto keep_alive = base::WrapRefCounted(this);
  phase_ = Phase::kFinished;
  snapshot_subscription_ = {};
  result_.final_snapshot_dispatch = SnapshotDispatchState().Inspect();
  retained_until_observed_.reset();
  std::move(done_).Run(std::move(result_));
}

}  // namespace

void CloseLoadedSessionWritersForMigration(
    ProfileManager& manager,
    base::OnceCallback<void(SessionWriterParticipantObservation)> done) {
  CHECK(content::BrowserThread::CurrentlyOn(content::BrowserThread::UI));
  std::vector<base::WeakPtr<Profile>> profiles;
  for (Profile* profile : manager.GetLoadedProfiles())
    profiles.push_back(profile->GetWeakPtr());
  // Do not retain or access manager after Start can invoke real reset callbacks.
  base::MakeRefCounted<LoadedSessionWriterParticipant>(std::move(profiles),
                                                     std::move(done))->Start();
}

}  // namespace aux
