// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_switch_workspaces.h"

#include <optional>
#include <utility>

#include "base/functional/bind.h"
#include "base/command_line.h"
#include "base/logging.h"
#include "chrome/browser/ui/startup/startup_browser_creator.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/prefs/session_startup_pref.h"
#include "chrome/browser/sessions/session_restore.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/lifetime/browser_shutdown.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profiles_state.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_manager_service.h"
#include "chrome/browser/ui/browser_manager_service_factory.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/create_browser_window.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/unload_controller.h"
#include "url/gurl.h"

namespace aux {
namespace {
bool IsClosing(BrowserWindowInterface* browser) {
  const auto* unload = UnloadController::From(browser);
  return !unload || unload->is_attempting_to_close_browser() ||
         unload->is_delete_scheduled();
}
void KeepTargetAlive(BrowserWindowInterface* owner,
                     BrowserWindowInterface* cache,
                     Profile* target) {
  BrowserInitState::From(owner)->KeepAuxProfileSwitchProfileAlive(target);
  BrowserInitState::From(cache)->KeepAuxProfileSwitchProfileAlive(target);
}
}  // namespace

BrowserWindowInterface* FindProfileSwitchWorkspace(
    BrowserWindowInterface* owner,
    const base::FilePath& profile_path) {
  if (!owner || profile_path.empty() || !g_browser_process ||
      !g_browser_process->profile_manager()) {
    return nullptr;
  }
  auto* loaded =
      g_browser_process->profile_manager()->GetProfileByPath(profile_path);
  if (!loaded || loaded->IsOffTheRecord()) {
    return nullptr;
  }
  auto* manager = BrowserManagerServiceFactory::GetForProfile(
      loaded->GetOriginalProfile());
  const auto* owner_state = BrowserInitState::From(owner);
  if (!manager || !owner_state) {
    return nullptr;
  }
  BrowserWindowInterface* found = nullptr;
  manager->ForEach([&](BrowserWindowInterface* candidate) {
    if (candidate == owner || IsClosing(candidate) ||
        candidate->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        !candidate->GetProfile() ||
        candidate->GetProfile()->GetOriginalProfile()->GetPath() != profile_path) {
      return true;
    }
    const auto* state = BrowserInitState::From(candidate);
    if (!state || !state->is_aux_profile_switch_cache() ||
        state->aux_profile_switch_workspace_id() !=
            owner_state->aux_profile_switch_workspace_id()) {
      return true;
    }
    found = candidate;
    return false;
  });
  return found;
}

BrowserWindowInterface* GetOrCreateProfileSwitchWorkspace(
    BrowserWindowInterface* owner,
    Profile* target,
    bool ensure_tab) {
  if (!owner || !target || !g_browser_process ||
      !g_browser_process->profile_manager() ||
      owner->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      owner->GetProfile()->IsOffTheRecord() || IsClosing(owner) ||
      browser_shutdown::HasShutdownStarted() ||
      browser_shutdown::IsTryingToQuit() || g_browser_process->IsShuttingDown()) {
    return nullptr;
  }
  const auto* source = BrowserInitState::From(owner);
  if (!source || source->is_aux_profile_switch_cache()) {
    return nullptr;
  }
  target = target->GetOriginalProfile();
  if (!target || target->IsOffTheRecord() || target->GetPath().empty() ||
      profiles::IsProfileLocked(target->GetPath()) ||
      g_browser_process->profile_manager()->GetProfileByPath(target->GetPath()) !=
          target) {
    return nullptr;
  }
  if (auto* cache = FindProfileSwitchWorkspace(owner, target->GetPath())) {
    KeepTargetAlive(owner, cache, target);
    return cache;
  }
  BrowserWindowCreateParams params(BrowserWindowInterface::TYPE_NORMAL, target,
                                   /*from_user_gesture=*/false);
  params.omit_from_session_restore = true;
  params.should_trigger_session_restore = false;
  params.aux_profile_switch_cache = true;
  params.aux_profile_switch_workspace_id =
      source->aux_profile_switch_workspace_id();
  params.vertical_tab_strip_collapsed = false;
  if (const auto* strip =
          tabs::VerticalTabStripStateController::From(owner)) {
    params.vertical_tab_strip_uncollapsed_width = strip->GetUncollapsedWidth();
  } else {
    params.vertical_tab_strip_uncollapsed_width =
        source->get_vertical_tabs_initial_uncollapsed_width();
  }
  auto* cache = CreateBrowserWindow(std::move(params));
  if (!cache) {
    return nullptr;
  }
  if (ensure_tab && cache->GetTabStripModel() &&
      cache->GetTabStripModel()->empty()) {
    chrome::AddAndReturnTabAt(
        cache, GURL(), -1, /*foreground=*/true, std::nullopt,
        /*pinned=*/false);
  }
  KeepTargetAlive(owner, cache, target);
  return cache;
}
void PrepareProfileSwitchWorkspace(BrowserWindowInterface* owner,
                                   Profile* target,
                                   uint64_t request_generation,
                                   base::OnceCallback<void(bool)> completion) {
  auto* cache = GetOrCreateProfileSwitchWorkspace(owner, target, false);
  auto* state = cache ? BrowserInitState::From(cache) : nullptr;
  if (!state) {
    std::move(completion).Run(false);
    return;
  }
  using State = BrowserInitState::AuxWorkspaceRestoreState;
  if (state->aux_workspace_restore_state() == State::kNotStarted)
    state->MarkAuxWorkspaceSetupPending();
  if (state->aux_workspace_restore_state() == State::kPending ||
      state->aux_workspace_restore_state() == State::kBlocked ||
      state->aux_workspace_restore_state() == State::kAmbiguous) {
    std::move(completion).Run(false);
    return;
  }
  bool has_live_workspace = false;
  bool has_live_user_workspace = false;
  if (auto* manager = BrowserManagerServiceFactory::GetForProfile(target)) {
    manager->ForEach([&](BrowserWindowInterface* candidate) {
      if (candidate != cache && !IsClosing(candidate) &&
          !candidate->GetTabStripModel()->empty()) {
        has_live_workspace = true;
        if ((candidate->GetType() == BrowserWindowInterface::TYPE_NORMAL ||
             candidate->GetType() == BrowserWindowInterface::TYPE_POPUP ||
             candidate->GetType() == BrowserWindowInterface::TYPE_APP ||
             candidate->GetType() == BrowserWindowInterface::TYPE_APP_POPUP) &&
            !BrowserInitState::From(candidate)->is_aux_profile_switch_cache()) {
          has_live_user_workspace = true;
        }
      }
      return true;
    });
  }
  if (state->aux_workspace_restore_state() == State::kRestoredSeparately) {
    if (has_live_user_workspace) {
      // Repeated selection focuses an already recovered window, never creates
      // a duplicate recovery or an unrelated empty target workspace.
      std::move(completion).Run(false);
      return;
    }
    // The user has since closed those actual recovered windows. The ordinary
    // new-workspace path may now proceed without replaying the old session.
    state->set_aux_workspace_restore_state(State::kReady);
  }
  // Match ordinary SessionService::RestoreIfNecessary, including genuine
  // restart/unlock policy. A raw stored preference omits those overrides.
  const auto startup_pref = StartupBrowserCreator::GetSessionStartupPref(
      *base::CommandLine::ForCurrentProcess(), target);
  if (state->aux_workspace_restore_state() == State::kNotStarted) {
    LOG(ERROR) << "Aux profile workspace admission: existing_workspace="
               << has_live_workspace << " cache_tabs="
               << cache->GetTabStripModel()->count() << " already_restored="
               << target->restored_last_session() << " startup_type="
               << static_cast<int>(startup_pref.type);
  }
  if (state->aux_workspace_restore_state() == State::kReady ||
      has_live_workspace ||
      !cache->GetTabStripModel()->empty() || target->restored_last_session() ||
      !startup_pref.ShouldRestoreLastSession()) {
    state->set_aux_workspace_restore_state(State::kReady);
    std::move(completion).Run(true);
    return;
  }
  state->set_aux_workspace_restore_state(State::kPending);
  auto admission = base::BindOnce(
      [](base::WeakPtr<BrowserWindowInterface> owner,
         base::WeakPtr<Profile> source, base::WeakPtr<Profile> target,
         base::WeakPtr<BrowserWindowInterface> cache, uint64_t generation) {
        const auto* state = owner ? BrowserInitState::From(owner.get()) : nullptr;
        if (!owner || !source || !target || !cache || !state ||
            owner->GetProfile() != source.get() ||
            !state->IsCurrentAuxProfileSwitchRequest(generation) ||
            IsClosing(owner.get()) || browser_shutdown::HasShutdownStarted() ||
            browser_shutdown::IsTryingToQuit() ||
            profiles::IsProfileLocked(target->GetPath())) {
          return false;
        }
        // Another user window may have opened while the disk read was pending.
        // It owns that profile's current state; never duplicate recovery over it.
        auto* manager = BrowserManagerServiceFactory::GetForProfile(target.get());
        bool unchanged = manager != nullptr;
        if (manager) manager->ForEach([&](BrowserWindowInterface* candidate) {
          if (candidate != cache.get() && !IsClosing(candidate) &&
              !candidate->GetTabStripModel()->empty()) {
            unchanged = false;
            return false;
          }
          return true;
        });
        return unchanged;
      }, owner->GetWeakPtr(), owner->GetProfile()->GetWeakPtr(),
      target->GetWeakPtr(), cache->GetWeakPtr(), request_generation);
  SessionRestore::RestoreAuxProfileWorkspace(cache, std::move(admission), base::BindOnce(
      [](base::WeakPtr<BrowserWindowInterface> cache,
         base::OnceCallback<void(bool)> completion,
         SessionRestore::AuxWorkspaceResult result) {
        auto* state = cache ? BrowserInitState::From(cache.get()) : nullptr;
        LOG(ERROR) << "Aux profile workspace restore result="
                   << static_cast<int>(result);
        const bool ready = state &&
            (result == SessionRestore::AuxWorkspaceResult::kRestored ||
             result == SessionRestore::AuxWorkspaceResult::kEmpty);
        if (state) state->set_aux_workspace_restore_state(
            ready ? State::kReady
                  : result == SessionRestore::AuxWorkspaceResult::kRestoredSeparately
                        ? State::kRestoredSeparately
                  : result == SessionRestore::AuxWorkspaceResult::kCancelled
                        ? State::kNotStarted
                  : result == SessionRestore::AuxWorkspaceResult::kAmbiguous
                        ? State::kAmbiguous : State::kBlocked);
        // Feedback belongs to the current request, which rechecks generation
        // and source identity. A superseded async restore must stay silent.
        std::move(completion).Run(ready);
      }, cache->GetWeakPtr(), std::move(completion)));
}
}  // namespace aux
