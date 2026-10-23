// Copyright 2026 The Aux Authors
// Local platform adaptation of the supplied profile-switch lifecycle.

#include "chrome/browser/ui/aux_profile_switch_session_rebuild.h"

#include <utility>
#include <vector>

#include "base/no_destructor.h"

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
  static base::NoDestructor<WorkspaceSnapshotDispatchState> state;
  return *state;
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
  if (generation != generation_ || !g_browser_process ||
      !g_browser_process->profile_manager()) {
    return;
  }
  auto paths = std::exchange(pending_paths_, {});
  auto& dispatch = SnapshotDispatchState();
  dispatch.BeginDispatch(paths.size());
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
      service->ResetFromCurrentBrowsers();
      dispatch.DidDispatchPath();
    } else {
      dispatch.DidNotDispatchPath();
    }
  }
}

}  // namespace aux
