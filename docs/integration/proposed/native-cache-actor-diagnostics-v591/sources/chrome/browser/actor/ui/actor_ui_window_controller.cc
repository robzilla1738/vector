// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "base/check.h"
#include "base/logging.h"
#include "base/functional/callback_helpers.h"
#include "base/functional/bind.h"
#include "chrome/browser/actor/ui/actor_ui_tab_controller.h"
#include "chrome/browser/actor/ui/actor_ui_window_controller.h"

#include <algorithm>

#include "chrome/browser/actor/actor_keyed_service.h"
#include "chrome/browser/actor/ui/actor_overlay_web_view.h"
#include "chrome/browser/actor/ui/actor_ui_metrics.h"
#include "chrome/browser/actor/ui/actor_ui_tab_controller_interface.h"
#include "chrome/browser/actor/ui/handoff_button_controller.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_command_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/common/chrome_features.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/web_contents.h"
#include "ui/views/controls/webview/webview.h"

namespace actor::ui {

ActorUiContentsContainerController::ActorUiContentsContainerController(
    views::WebView* contents_container_view,
    ActorOverlayWebView* actor_overlay_web_view,
    ActorUiWindowController* window_controller)
    : contents_container_view_(contents_container_view),
      overlay_(actor_overlay_web_view),
      window_controller_(window_controller) {
  CHECK(base::FeatureList::IsEnabled(features::kGlicActorUi));
  CHECK(contents_container_view_);
  CHECK(window_controller_);
  if (features::kGlicActorUiHandoffButton.Get()) {
    handoff_button_controller_ = std::make_unique<HandoffButtonController>(
        contents_container_view_, window_controller);
  }
  web_contents_callback_subscriptions_.push_back(
      contents_container_view_->AddWebContentsAttachedCallback(
          base::BindRepeating(
              &ActorUiContentsContainerController::OnWebContentsAttached,
              weak_ptr_factory_.GetWeakPtr())));
  web_contents_callback_subscriptions_.push_back(
      contents_container_view_->AddWebContentsDetachedCallback(
          base::BindRepeating(
              &ActorUiContentsContainerController::OnWebContentsDetached,
              weak_ptr_factory_.GetWeakPtr())));
  OnWebContentsAttached(contents_container_view_);
}

ActorUiContentsContainerController::~ActorUiContentsContainerController() =
    default;

bool ActorUiContentsContainerController::IsColdForAuxProfileSwitch() const {
  const auto aux_guard = [](bool value, const char* name, unsigned int count = 0) {
    if (value) {
      LOG(ERROR) << "Aux actor admission container." << name << " failed=1 count=" << count;
    }
    return value;
  };
  if (aux_guard(aux_profile_switch_prepared_, "prepared") || aux_guard(aux_callback_depth_, "callback-depth", aux_callback_depth_) ||
      aux_guard(aux_pending_notifications_, "pending-notifications", aux_pending_notifications_) ||
      aux_guard((overlay_ && !overlay_->CanRebindForAuxProfileSwitch()), "overlay") ||
      aux_guard((handoff_button_controller_ &&
       !handoff_button_controller_->IsColdForAuxProfileSwitch()), "handoff")) {
    return false;
  }
  auto* contents = contents_container_view_->web_contents();
  if (aux_guard(contents != web_contents(), "contents-observer-mismatch")) {
    return false;
  }
  auto* tab = contents ? tabs::TabInterface::GetFromContents(contents) : nullptr;
  if (tab && ActorUiTabControllerInterface::From(tab)) {
    auto* actual = ActorUiTabController::Get(tab->GetUnownedUserDataHost());
    if (!actual) {
      LOG(ERROR) << "Aux actor admission container.tab-owner-missing";
      return false;
    }
    return actual->IsColdForAuxProfileSwitch();
  }
  return true;
}

void ActorUiContentsContainerController::PrepareForAuxProfileSwitch() {
  CHECK(IsColdForAuxProfileSwitch());
  aux_profile_switch_prepared_ = true;
  // These are the actual unregister closures, not actor completion callbacks.
  actor_ui_tab_controller_callback_runners_.clear();
  Observe(nullptr);
  view_observation_.Reset();
}

void ActorUiContentsContainerController::RebindForAuxProfileSwitch(Profile* profile) {
  CHECK(aux_profile_switch_prepared_);
  CHECK(!aux_callback_depth_);
  CHECK(!aux_pending_notifications_);
  if (overlay_) {
    overlay_->RebindForAuxProfileSwitch(profile);
  }
}

void ActorUiContentsContainerController::FinishForAuxProfileSwitch() {
  CHECK(aux_profile_switch_prepared_);
  aux_profile_switch_prepared_ = false;
  // Real attachment path registers real current-tab callbacks and posts the
  // original notification. It does not simulate an Actor state completion.
  OnWebContentsAttached(contents_container_view_);
}

void ActorUiContentsContainerController::LeaveAuxCallback() {
  CHECK(aux_callback_depth_ > 0);
  --aux_callback_depth_;
}

void ActorUiContentsContainerController::RunPostedWebContentsAttached() {
  CHECK(aux_pending_notifications_ > 0);
  --aux_pending_notifications_;
  NotifyTabControllerOnWebContentsAttached();
}
void ActorUiContentsContainerController::RunPostedBoundsChanged() {
  CHECK(aux_pending_notifications_ > 0);
  --aux_pending_notifications_;
  NotifyTabControllerOnViewBoundsChanged();
}

void ActorUiContentsContainerController::OnViewBoundsChanged(
    views::View* observed_view) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  CHECK(observed_view == contents_container_view_);
  if (!contents_container_view_->web_contents()) {
    return;
  }

  ++aux_pending_notifications_;
  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(&ActorUiContentsContainerController::
                                    RunPostedBoundsChanged,
                                weak_ptr_factory_.GetWeakPtr()));
}

void ActorUiContentsContainerController::OnWebContentsAttached(
    views::WebView* web_view) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (aux_profile_switch_prepared_) {
    return;
  }
  if (!web_view->web_contents()) {
    return;
  }

  // Start observing on the new web contents.
  Observe(web_view->web_contents());
  view_observation_.Observe(web_view);

  // Start observing on tab scoped actor ui state changes.
  if (auto* tab =
          tabs::TabInterface::GetFromContents(web_view->web_contents())) {
    if (auto* tab_controller = ActorUiTabControllerInterface::From(tab)) {
      if (features::kGlicActorUiOverlay.Get()) {
        actor_ui_tab_controller_callback_runners_.push_back(
            tab_controller->RegisterActorOverlayStateChange(base::BindRepeating(
                &ActorUiContentsContainerController::OnOverlayStateChanged,
                weak_ptr_factory_.GetWeakPtr())));
        actor_ui_tab_controller_callback_runners_.push_back(
            tab_controller->RegisterActorOverlayBackgroundChange(
                base::BindRepeating(&ActorUiContentsContainerController::
                                        OnActorOverlayBackgroundChange,
                                    weak_ptr_factory_.GetWeakPtr())));
      }

      if (handoff_button_controller_) {
        actor_ui_tab_controller_callback_runners_.push_back(
            tab_controller->RegisterHandoffButtonController(
                handoff_button_controller_.get()));
        actor_ui_tab_controller_callback_runners_.push_back(
            handoff_button_controller_->RegisterTabInterface(tab));
      }

      // Record user action if associated task isn't paused or stopped
      actor::ActorKeyedService* actor_service =
          actor::ActorKeyedService::Get(web_contents()->GetBrowserContext());
      if (!actor_service) {
        return;
      }

      // Log user action if associated task isn't paused or stopped
      if (actor_service->IsActiveOnTab(*tab)) {
        actor::ui::RecordActuatingTabWebContentsAttached();
      }

      // Asynchronous post needed for the window to completely open and
      // activate before trying to show the UI components.
      ++aux_pending_notifications_;
      content::GetUIThreadTaskRunner({})->PostTask(
          FROM_HERE,
          base::BindOnce(&ActorUiContentsContainerController::
                             RunPostedWebContentsAttached,
                         weak_ptr_factory_.GetWeakPtr()));
    }
  }
}

ActorUiTabControllerInterface*
ActorUiContentsContainerController::GetActorUiTabController() {
  if (!web_contents()) {
    return nullptr;
  }
  auto* tab = tabs::TabInterface::GetFromContents(web_contents());
  if (!tab) {
    return nullptr;
  }
  return ActorUiTabControllerInterface::From(tab);
}

void ActorUiContentsContainerController::
    NotifyTabControllerOnWebContentsAttached() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (auto* tab_controller = GetActorUiTabController()) {
    tab_controller->OnWebContentsAttached();
  }
}

void ActorUiContentsContainerController::
    NotifyTabControllerOnViewBoundsChanged() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (auto* tab_controller = GetActorUiTabController()) {
    tab_controller->OnViewBoundsChanged();
  }
}

void ActorUiContentsContainerController::
    NotifyTabControllerOnImmersiveModeChanged() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (auto* tab_controller = GetActorUiTabController()) {
    tab_controller->OnImmersiveModeChanged();
  }
}

void ActorUiContentsContainerController::OnWebContentsDetached(
    views::WebView* web_view) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (aux_profile_switch_prepared_) {
    return;
  }
  if (!web_view->web_contents()) {
    return;
  }

  // Stop observing on web contents and clear all subscriptions related to a
  // tab.
  Observe(nullptr);
  view_observation_.Reset();
  actor_ui_tab_controller_callback_runners_.clear();

  if (overlay_) {
    overlay_->CloseUI();
    UpdateFindInPageCommandState();
  }
}

void ActorUiContentsContainerController::OnActorOverlayBackgroundChange(
    bool is_visible) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (!overlay_) {
    return;
  }
  overlay_->SetOverlayBackground(is_visible);
}

void ActorUiContentsContainerController::
    NotifyWindowOmniboxPopupVisibilityChanged() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (auto* tab_controller = GetActorUiTabController()) {
    tab_controller->OnWindowOmniboxPopupVisibilityChanged();
  }
}

void ActorUiContentsContainerController::OnOverlayStateChanged(
    bool is_visible,
    ActorOverlayState state,
    base::OnceClosure callback) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  base::OnceClosure on_overlay_ready =
      base::BindOnce(&ActorUiContentsContainerController::ApplyOverlayState,
                     weak_ptr_factory_.GetWeakPtr(), is_visible,
                     std::move(state), std::move(callback));
  // Only after the ActorOverlay is ready, we apply the state updates to it.
  EnsureOverlayReady(is_visible, std::move(on_overlay_ready));
}

void ActorUiContentsContainerController::EnsureOverlayReady(
    bool is_visible,
    base::OnceClosure callback) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  // Ensure the callback runs on any early return. We Release() ownership only
  // when passing the callback to an asynchronous operation.
  base::ScopedClosureRunner runner(std::move(callback));
  if (!overlay_) {
    return;
  }
  if (!is_visible) {
    overlay_->CloseUI();
    UpdateFindInPageCommandState();
    return;
  }
  overlay_->ShowUI(tabs::TabInterface::GetFromContents(
                       contents_container_view_->web_contents()),
                   runner.Release());
  UpdateFindInPageCommandState();
}

void ActorUiContentsContainerController::ApplyOverlayState(
    bool is_visible,
    ActorOverlayState state,
    base::OnceClosure callback) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  // Ensure the callback runs on any early return. We Release() ownership only
  // when passing the callback to an asynchronous operation.
  base::ScopedClosureRunner runner(std::move(callback));
  if (!overlay_ || !is_visible) {
    return;
  }
  overlay_->SetBorderGlowVisibility(state.border_glow_visible);
  if (state.mouse_target.has_value()) {
    // If we have a mouse target, we should not ALSO have a mouse_down state.
    // This DCHECK ensures that the ActorOverlayState will only request a mouse
    // movement OR a click, never both.
    DCHECK(!state.mouse_down);
    overlay_->MoveCursorTo(state.mouse_target.value(), runner.Release());
    return;
  } else if (state.mouse_down) {
    overlay_->TriggerClickAnimation(runner.Release());
  }
}

void ActorUiContentsContainerController::UpdateFindInPageCommandState() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiContentsContainerController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (auto* command_controller = window_controller_->GetCommandController()) {
    command_controller->TabStateChanged();
  }
}

}  // namespace actor::ui

// ActorUiWindowController Definitions:
DEFINE_USER_DATA(ActorUiWindowController);

ActorUiWindowController::ActorUiWindowController(
    BrowserWindowInterface* browser_window_interface,
    std::vector<std::pair<views::WebView*, ActorOverlayWebView*>>
        container_overlay_view_pairs)
    : browser_window_interface_(browser_window_interface),
      scoped_data_holder_(browser_window_interface->GetUnownedUserDataHost(),
                          *this) {
  CHECK(browser_window_interface_);
  for (const auto& pair : container_overlay_view_pairs) {
    contents_container_controllers_.push_back(
        std::make_unique<actor::ui::ActorUiContentsContainerController>(
            pair.first, pair.second, this));
  }
  InitializeImmersiveModeObserver();
}

ActorUiWindowController::~ActorUiWindowController() = default;

bool ActorUiWindowController::CanRebindForAuxProfileSwitch() const {
  const auto aux_guard = [](bool value, const char* name, unsigned int count = 0) {
    if (value) {
      LOG(ERROR) << "Aux actor admission window." << name << " failed=1 count=" << count;
    }
    return value;
  };
  if (aux_guard(aux_profile_switch_prepared_, "prepared") || aux_guard(aux_callback_depth_, "callback-depth", aux_callback_depth_) ||
      aux_guard(aux_pending_notifications_, "pending-notifications", aux_pending_notifications_) || aux_guard(is_omnibox_popup_open_, "omnibox-open") ||
      aux_guard(From(browser_window_interface_) != this, "owner-mismatch") ||
      aux_guard(browser_window_interface_->GetType() != BrowserWindowInterface::TYPE_NORMAL, "window-type") ||
      aux_guard(!browser_window_interface_->GetProfile()->IsRegularProfile(), "nonregular-profile")) {
    return false;
  }
  auto* model = browser_window_interface_->GetTabStripModel();
  if (aux_guard(!model, "model-missing") || aux_guard(model->profile() != browser_window_interface_->GetProfile(), "model-profile-mismatch")) {
    return false;
  }
  for (int i = 0; i < model->count(); ++i) {
    auto* tab = model->GetTabAtIndex(i);
    auto* service = actor::ActorKeyedService::Get(tab->GetContents()->GetBrowserContext());
    if (aux_guard(service && service->GetTaskFromTab(*tab), "tab-task")) {
      return false;
    }
    if (actor::ui::ActorUiTabControllerInterface::From(tab)) {
      auto* actual = actor::ui::ActorUiTabController::Get(tab->GetUnownedUserDataHost());
      if (aux_guard(!actual || !actual->IsColdForAuxProfileSwitch(), "tab-owner-or-state")) {
        return false;
      }
    }
  }
  return std::ranges::all_of(contents_container_controllers_,
      [](const auto& controller) { return controller->IsColdForAuxProfileSwitch(); });
}

void ActorUiWindowController::PrepareForAuxProfileSwitch() {
  CHECK(CanRebindForAuxProfileSwitch());
  aux_switch_source_profile_ = browser_window_interface_->GetProfile();
  aux_profile_switch_prepared_ = true;
  pref_change_registrar_.Reset();
  immersive_mode_observer_.Reset();
  for (const auto& controller : contents_container_controllers_) {
    controller->PrepareForAuxProfileSwitch();
  }
}

void ActorUiWindowController::RebindForAuxProfileSwitch(Profile* profile) {
  CHECK(aux_profile_switch_prepared_);
  CHECK(!aux_callback_depth_);
  CHECK(profile);
  CHECK(profile->IsRegularProfile());
  CHECK(browser_window_interface_->GetProfile() == profile);
  CHECK(browser_window_interface_->GetTabStripModel()->profile() == profile);
  CHECK(browser_window_interface_->GetTabStripModel()->empty());
  for (const auto& controller : contents_container_controllers_) {
    controller->RebindForAuxProfileSwitch(profile);
  }
  InitializeImmersiveModeObserver();
}

void ActorUiWindowController::FinishForAuxProfileSwitch() {
  CHECK(aux_profile_switch_prepared_);
  CHECK(!aux_callback_depth_);
  aux_switch_source_profile_ = nullptr;
  aux_profile_switch_prepared_ = false;
  auto alive = aux_lifetime_factory_.GetWeakPtr();
  for (const auto& controller : contents_container_controllers_) {
    controller->FinishForAuxProfileSwitch();
    if (!alive) {
      return;
    }
  }
}

void ActorUiWindowController::AbortForAuxProfileSwitch(Profile* source_profile) {
  CHECK(aux_profile_switch_prepared_);
  CHECK(aux_switch_source_profile_ == source_profile);
  CHECK(browser_window_interface_->GetProfile() == source_profile);
  auto* model = browser_window_interface_->GetTabStripModel();
  CHECK(model->profile() == source_profile);
  for (int i = 0; i < model->count(); ++i) {
    CHECK(model->GetWebContentsAt(i)->GetBrowserContext() == source_profile);
  }
  for (const auto& controller : contents_container_controllers_) {
    controller->RebindForAuxProfileSwitch(source_profile);
  }
  InitializeImmersiveModeObserver();
  FinishForAuxProfileSwitch();
}

void ActorUiWindowController::LeaveAuxCallback() {
  CHECK(aux_callback_depth_ > 0);
  --aux_callback_depth_;
}
void ActorUiWindowController::RunPostedImmersiveChange() {
  CHECK(aux_pending_notifications_ > 0);
  --aux_pending_notifications_;
  NotifyControllersOfImmersiveChangeInternal();
}
void ActorUiWindowController::RunPostedOmniboxChange(bool is_open) {
  CHECK(aux_pending_notifications_ > 0);
  --aux_pending_notifications_;
  OnOmniboxPopupStateChangedInternal(is_open);
}

// static
ActorUiWindowController* ActorUiWindowController::From(
    BrowserWindowInterface* browser_window_interface) {
  if (!browser_window_interface) {
    return nullptr;
  }
  return Get(browser_window_interface->GetUnownedUserDataHost());
}

actor::ui::ActorUiContentsContainerController*
ActorUiWindowController::GetControllerForWebContents(
    content::WebContents* web_contents) {
  for (const auto& controller : contents_container_controllers_) {
    if (web_contents == controller->web_contents()) {
      return controller.get();
    }
  }
  return nullptr;
}

bool ActorUiWindowController::IsAnyOmniboxPopupOpened() const {
  return is_omnibox_popup_open_;
}

void ActorUiWindowController::OnOmniboxPopupStateChanged(bool is_open) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  is_omnibox_popup_open_ = is_open;
  if (base::FeatureList::IsEnabled(
          features::kGlicActorPostTaskUiUpdateEnabled)) {
    // Use PostTask to avoid re-entrancy issues and race conditions during
    // Tab Discard where the WebContents <-> TabModel mapping is temporarily
    // unstable. This prevents the crash in GetFromContents().
    ++aux_pending_notifications_;
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(
            &ActorUiWindowController::RunPostedOmniboxChange,
            weak_ptr_factory_.GetWeakPtr(), is_open));
  } else {
    OnOmniboxPopupStateChangedInternal(is_open);
  }
}

void ActorUiWindowController::OnOmniboxPopupStateChangedInternal(bool is_open) {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (aux_profile_switch_prepared_) {
    return;
  }
  for (const auto& container : contents_container_controllers_) {
    container->NotifyWindowOmniboxPopupVisibilityChanged();
  }
}

void ActorUiWindowController::InitializeImmersiveModeObserver() {
  if (immersive_mode_observer_.IsObserving()) {
    return;
  }
  if (auto* controller =
          ImmersiveModeController::From(browser_window_interface_)) {
    immersive_mode_observer_.Observe(controller);
  } else {
    return;
  }
  if (auto* profile = browser_window_interface_->GetProfile()) {
    pref_change_registrar_.Init(profile->GetPrefs());

#if BUILDFLAG(IS_MAC)
    // Only Mac has the "Always Show Toolbar" setting.
    pref_change_registrar_.Add(
        prefs::kShowFullscreenToolbar,
        base::BindRepeating(
            &ActorUiWindowController::OnImmersiveFullscreenToolbarPrefChanged,
            weak_ptr_factory_.GetWeakPtr()));
#endif
  }
}

void ActorUiWindowController::NotifyControllersOfImmersiveChange() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (base::FeatureList::IsEnabled(
          features::kGlicActorPostTaskUiUpdateEnabled)) {
    // Use PostTask to avoid re-entrancy issues and race conditions during
    // Tab Discard where the WebContents <-> TabModel mapping is temporarily
    // unstable. This prevents the crash in GetFromContents().
    ++aux_pending_notifications_;
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(&ActorUiWindowController::RunPostedImmersiveChange,
                       weak_ptr_factory_.GetWeakPtr()));
  } else {
    NotifyControllersOfImmersiveChangeInternal();
  }
}

void ActorUiWindowController::NotifyControllersOfImmersiveChangeInternal() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (aux_profile_switch_prepared_) {
    return;
  }
  for (const auto& controller : contents_container_controllers_) {
    controller->NotifyTabControllerOnImmersiveModeChanged();
  }
}

void ActorUiWindowController::OnImmersiveFullscreenEntered() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  NotifyControllersOfImmersiveChange();
}

void ActorUiWindowController::OnImmersiveFullscreenExited() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  NotifyControllersOfImmersiveChange();
}

void ActorUiWindowController::OnImmersiveRevealStarted() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  NotifyControllersOfImmersiveChange();
}

void ActorUiWindowController::OnImmersiveRevealEnded() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  NotifyControllersOfImmersiveChange();
}

void ActorUiWindowController::OnImmersiveFullscreenToolbarPrefChanged() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  if (IsImmersiveModeEnabled()) {
    NotifyControllersOfImmersiveChange();
  }
}

void ActorUiWindowController::OnImmersiveModeControllerDestroyed() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  immersive_mode_observer_.Reset();
  pref_change_registrar_.RemoveAll();
}

bool ActorUiWindowController::IsImmersiveModeEnabled() const {
  auto* controller = ImmersiveModeController::From(browser_window_interface_);
  return controller && controller->IsEnabled();
}

bool ActorUiWindowController::IsToolbarRevealed() const {
  auto* controller = ImmersiveModeController::From(browser_window_interface_);
  return controller && controller->IsRevealed();
}

bool ActorUiWindowController::IsToolbarPinned() const {
#if BUILDFLAG(IS_MAC)
  if (auto* profile = browser_window_interface_->GetProfile()) {
    return profile->GetPrefs()->GetBoolean(prefs::kShowFullscreenToolbar);
  }
#endif
  return false;
}

void ActorUiWindowController::TearDown() {
  ++aux_callback_depth_;
  base::ScopedClosureRunner callback_scope(base::BindOnce(
      &ActorUiWindowController::LeaveAuxCallback, aux_lifetime_factory_.GetWeakPtr()));
  contents_container_controllers_.clear();
}

chrome::BrowserCommandController*
ActorUiWindowController::GetCommandController() {
  return chrome::BrowserCommandController::From(browser_window_interface_);
}
