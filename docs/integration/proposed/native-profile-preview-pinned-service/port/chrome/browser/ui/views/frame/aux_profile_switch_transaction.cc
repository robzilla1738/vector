// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_switch_transaction.h"

#include <array>
#include <utility>

#include "base/check.h"
#include "base/check_op.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/memory/raw_ptr.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/aux/profile_gate.h"
#include "chrome/browser/profiles/keep_alive/profile_keep_alive_types.h"
#include "chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/ui/bookmarks/bookmark_bar_controller.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_command_controller.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_manager_service.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/ui/browser_window_theme_observer.h"
#include "chrome/browser/ui/sessions/session_service_browser_helper.h"
#include "chrome/browser/ui/tabs/pinned_tab_service.h"
#include "chrome/browser/ui/tabs/pinned_tab_service_factory.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/unload_controller.h"
#include "chrome/browser/ui/views/bookmarks/bookmark_bar_view.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_tabs.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_workspaces.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/extensions/chrome_extension_web_contents_observer.h"
#include "ui/views/view_tracker.h"
#include "url/gurl.h"

namespace aux {
struct ProfileSwitchTransaction::Scope {
  raw_ptr<PreparedBindings> bindings = nullptr;
  std::array<raw_ptr<Browser>, 3> browsers{};
  std::array<raw_ptr<SessionServiceBrowserHelper>, 3> helpers{};
  std::array<uint64_t, 3> session_generations{};
  std::array<uint32_t, 3> empty_generations{};
  std::array<base::WeakPtr<PinnedTabService>, 3> pinned_services{};
  std::array<uint64_t, 3> pinned_service_tokens{};
  raw_ptr<tabs::VerticalTabStripStateController> vertical = nullptr;
  uint64_t vertical_generation = 0;
  views::ViewTracker bookmark_bar;
  bool custom_started = false;
  bool committed = false;
};

ProfileSwitchTransaction::PreparedBindings::PreparedBindings(
    Revalidate revalidate, Phase begin, Phase commit, Phase finish, Phase abort)
    : revalidate_(std::move(revalidate)),
      begin_(std::move(begin)), commit_(std::move(commit)),
      finish_(std::move(finish)), abort_(std::move(abort)) {
  CHECK(revalidate_);
  CHECK(begin_);
  CHECK(commit_);
  CHECK(finish_);
  CHECK(abort_);
}
ProfileSwitchTransaction::PreparedBindings::PreparedBindings(
    PreparedBindings&&) = default;
ProfileSwitchTransaction::PreparedBindings&
ProfileSwitchTransaction::PreparedBindings::operator=(PreparedBindings&&) = default;
ProfileSwitchTransaction::PreparedBindings::~PreparedBindings() = default;

ProfileSwitchTransaction::ProfileSwitchTransaction(Browser& owner)
    : owner_(owner) {}
ProfileSwitchTransaction::~ProfileSwitchTransaction() = default;

void ProfileSwitchTransaction::ReleaseMutation(
    base::WeakPtr<BrowserWindowInterface> window) {
  if (!window) {
    return;
  }
  auto* browser = static_cast<Browser*>(window.get());
  browser->aux_profile_switch_in_progress_ = false;
  if (std::exchange(browser->aux_profile_switch_deferred_close_, false)) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(
            [](base::WeakPtr<BrowserWindowInterface> actual_window) {
              if (actual_window) {
                if (auto* native_window =
                        BrowserWindow::FromBrowser(actual_window.get())) {
                  native_window->Close();
                }
              }
            },
            window));
  }
}

void ProfileSwitchTransaction::Complete(Scope* scope) {
  auto& browser = *scope->browsers[0];
  auto& previous_cache = *scope->browsers[1];
  auto& target_cache = *scope->browsers[2];
  if (scope->committed) {
    std::move(scope->bindings->finish_).Run(browser, previous_cache, target_cache);
    BrowserWindowThemeObserver::From(&browser)->RebindForAuxProfileSwitch(&browser);
  } else if (scope->custom_started) {
    std::move(scope->bindings->abort_).Run(browser, previous_cache, target_cache);
    // Source identity and real source collections have already rolled back.
    if (auto* bar = static_cast<BookmarkBarView*>(scope->bookmark_bar.view())) {
      bar->RebindForAuxProfileSwitch();
    }
  }
  for (size_t i = 0; i < scope->helpers.size(); ++i) {
    scope->helpers[i]->EndAuxProfileSwitch(scope->session_generations[i]);
  }
  if (scope->vertical) {
    scope->vertical->EndAuxProfileSwitch(scope->vertical_generation);
  }
  // Persistent saved-pin observers resume only after genuine target/source
  // collections and all view/session finish-or-abort phases have settled.
  for (size_t i = 0; i < scope->pinned_services.size(); ++i) {
    if (auto* service = scope->pinned_services[i].get()) {
      service->ResumeAfterAuxProfileSwitch(scope->pinned_service_tokens[i]);
    }
  }
  // Posted weak/generation-checked clears cannot release a newer mutation.
  for (size_t i = 0; i < scope->browsers.size(); ++i) {
    scope->browsers[i]->PostClearAuxProfileSwitchEmptySuppression(
        scope->empty_generations[i]);
  }
}

ProfileSwitchTransaction::Result ProfileSwitchTransaction::Run(
    Profile* target, PrepareBindings prepare,
    base::PassKey<BrowserWindowFeatures>) {
  Browser& browser = *owner_;
  Profile* const previous = browser.GetProfile();
  const auto* init = BrowserInitState::From(&browser);
  const auto* unload = UnloadController::From(&browser);
  if (!target || !prepare || !previous->IsRegularProfile() ||
      !target->IsRegularProfile() || !browser.is_initialized_ ||
      browser.GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      !init || init->is_aux_profile_switch_cache() ||
      browser.aux_profile_switch_in_progress_ || !unload ||
      unload->is_attempting_to_close_browser() || browser.IsDeleteScheduled()) {
    return Result::kRejected;
  }
  if (target == previous) {
    return Result::kNoChange;
  }
  // Protect the actual owner against reentrant switches/close while real cache
  // constructors and their observers run, not only after construction ends.
  browser.aux_profile_switch_in_progress_ = true;
  base::ScopedClosureRunner active(base::BindOnce(
      &ProfileSwitchTransaction::ReleaseMutation, browser.GetWeakPtr()));
  // All unported/native profile-bound surfaces must refuse HERE, before cache
  // creation, menus, tabs, identity or auth/bootstrap side effects.
  auto bindings = std::move(prepare).Run(browser, *target);
  if (!bindings) {
    return Result::kRejected;
  }
  if (!CanShowBrowser(target, base::BindRepeating(
          &extensions::ChromeExtensionWebContentsObserver::CreateForWebContents))) {
    return Result::kAwaitingSecurity;
  }
  auto active_keep_alive = ScopedProfileKeepAlive::TryAcquire(
      target, ProfileKeepAliveOrigin::kBrowserWindow);
  if (!active_keep_alive) {
    return Result::kRejected;
  }
  // These fixed-identity caches are real Browsers, never arbitrary user windows.
  auto* old_window = GetOrCreateProfileSwitchWorkspace(&browser, previous, false);
  auto* next_window = GetOrCreateProfileSwitchWorkspace(&browser, target, true);
  if (!old_window || !next_window || old_window == next_window ||
      old_window == &browser || next_window == &browser ||
      old_window->GetProfile() != previous || next_window->GetProfile() != target ||
      !old_window->GetTabStripModel()->empty()) {
    return Result::kRejected;
  }
  // CreateBrowserWindow on this desktop path constructs the actual Browser;
  // the positive InitState cache role was fixed before manager registration.
  auto& old_cache = *static_cast<Browser*>(old_window);
  auto& next_cache = *static_cast<Browser*>(next_window);
  if (!old_cache.is_initialized_ || !next_cache.is_initialized_ ||
      old_cache.aux_profile_switch_in_progress_ ||
      next_cache.aux_profile_switch_in_progress_) {
    return Result::kRejected;
  }
  if (next_cache.GetTabStripModel()->empty()) {
    chrome::AddAndReturnTabAt(&next_cache, GURL(), -1, true);
    if (next_cache.GetTabStripModel()->empty()) {
      return Result::kRejected;
    }
  }
  // Cache creation can synchronously invoke real observers. New clients or
  // changed source widgets must reject recoverably before any source mutation.
  if (browser.GetProfile() != previous ||
      !bindings->revalidate_.Run(browser, old_cache, next_cache)) {
    return Result::kRejected;
  }
  old_cache.aux_profile_switch_in_progress_ = true;
  base::ScopedClosureRunner old_active(base::BindOnce(
      &ProfileSwitchTransaction::ReleaseMutation, old_cache.GetWeakPtr()));
  next_cache.aux_profile_switch_in_progress_ = true;
  base::ScopedClosureRunner next_active(base::BindOnce(
      &ProfileSwitchTransaction::ReleaseMutation, next_cache.GetWeakPtr()));
  Scope scope;
  scope.bindings = &*bindings;
  scope.browsers = {&browser, &old_cache, &next_cache};
  for (size_t i = 0; i < scope.browsers.size(); ++i) {
    scope.helpers[i] = SessionServiceBrowserHelper::From(scope.browsers[i]);
    CHECK(scope.helpers[i]);
    scope.empty_generations[i] =
        scope.browsers[i]->SuppressEmptyForAuxProfileSwitch();
    scope.session_generations[i] = scope.helpers[i]->BeginAuxProfileSwitch();
  }
  scope.vertical = tabs::VerticalTabStripStateController::From(&browser);
  if (scope.vertical) {
    scope.vertical_generation = scope.vertical->BeginAuxProfileSwitch();
  }
  if (auto* view = BrowserView::GetBrowserViewForBrowser(&browser)) {
    if (auto* bar = view->bookmark_bar()) {
      scope.bookmark_bar.SetView(bar);
      bar->PrepareForAuxProfileSwitch();
    }
  }
  base::ScopedClosureRunner complete(
      base::BindOnce(&ProfileSwitchTransaction::Complete, &scope));
  // These actual windows can share one profile service. Capture existing-only
  // services once each; never create a new persistent observer for a transfer.
  for (size_t i = 0; i < scope.browsers.size(); ++i) {
    auto* service = PinnedTabServiceFactory::GetForProfileIfExists(
        scope.browsers[i]->GetProfile());
    if (!service) {
      continue;
    }
    bool already_paused = false;
    for (const auto& paused : scope.pinned_services) {
      if (paused.get() == service) {
        already_paused = true;
        break;
      }
    }
    if (already_paused) {
      continue;
    }
    scope.pinned_services[i] = service->GetWeakPtrForAuxProfileSwitch();
    scope.pinned_service_tokens[i] = service->PauseForAuxProfileSwitch();
  }
  scope.custom_started = true;
  std::move(bindings->begin_).Run(browser, old_cache, next_cache);

  // Supplied455b3d4/455b61c snapshot the actual two live models before
  // ownership moves, preserving same-window per-profile fallback metadata.
  auto* preview_state = BrowserInitState::From(&browser);
  CHECK(preview_state);
  preview_state->RememberAuxProfilePreviewData(
      previous->GetPath(),
      CaptureProfilePreviewData(*browser.GetTabStripModel()));
  auto* target_preview_state = BrowserInitState::From(&next_cache);
  CHECK(target_preview_state);
  target_preview_state->RememberAuxProfilePreviewData(
      target->GetPath(),
      CaptureProfilePreviewData(*next_cache.GetTabStripModel()));

  auto source_tabs = ProfileSwitchTabCollection::Take(
      browser, base::PassKey<ProfileSwitchTransaction>());
  if (!source_tabs) {
    return Result::kRejected;
  }
  auto target_tabs = ProfileSwitchTabCollection::Take(
      next_cache, base::PassKey<ProfileSwitchTransaction>());
  if (!target_tabs || !source_tabs->InsertInto(
          old_cache, base::PassKey<ProfileSwitchTransaction>())) {
    return Result::kRejected;
  }
  const bool moved = BrowserManagerService::TransferForAuxProfileSwitch(
      &browser, target,
      base::BindOnce(&Browser::CommitAuxProfileSwitchIdentity,
                     base::Unretained(&browser), target,
                     std::move(active_keep_alive)));
  if (!moved) {
    // Ownership validation failed before identity. Put genuine source tabs
    // back; target_tabs' destructor restores its own same-profile cache.
    auto rollback = ProfileSwitchTabCollection::Take(
        old_cache, base::PassKey<ProfileSwitchTransaction>());
    CHECK(rollback);
    CHECK(rollback->InsertInto(browser, base::PassKey<ProfileSwitchTransaction>()));
    return Result::kRejected;
  }
  // All following operations are prevalidated, synchronous and cannot fail.
  // Persistent sinks remain paused while the stable empty model is rebound.
  scope.helpers[0]->RebindAuxProfileSwitch(target);
  if (scope.vertical) {
    scope.vertical->RebindAuxProfileSwitch(
        SessionServiceFactory::GetForProfileIfExisting(target));
  }
  if (auto* bar = static_cast<BookmarkBarView*>(scope.bookmark_bar.view())) {
    bar->RebindForAuxProfileSwitch();
  }
  BookmarkBarController::From(&browser)->RebindForAuxProfileSwitch();
  chrome::BrowserCommandController::From(&browser)->RebindForAuxProfileSwitch(previous);
  std::move(bindings->commit_).Run(browser, old_cache, next_cache);
  CHECK(browser.GetTabStripModel()->empty());
  CHECK(target_tabs->InsertInto(browser, base::PassKey<ProfileSwitchTransaction>()));
  scope.committed = true;
  rebuild_.Schedule(*previous, *target);
  return Result::kSwitched;
}
}  // namespace aux
