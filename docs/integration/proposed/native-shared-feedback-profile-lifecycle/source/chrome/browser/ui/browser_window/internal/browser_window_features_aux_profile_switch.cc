// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/browser_window/public/browser_window_features.h"

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include <array>
#include <memory>
#include <optional>
#include <utility>
#include "chrome/browser/ui/views/contextual_tasks/contextual_tasks_browser_controller.h"
#include "chrome/browser/ui/desktop_to_mobile_promos/ios_promo_controller.h"
#include "chrome/browser/ui/views/tabs/groups/recent_activity_bubble_dialog_view.h"
#include "chrome/browser/ui/tabs/saved_tab_groups/shared_tab_group_feedback_controller.h"
#include "chrome/browser/glic/browser_ui/glic_iph_controller.h"
#include "chrome/browser/glic/browser_ui/glic_split_button_controller.h"
#include "chrome/browser/actor/ui/actor_ui_window_controller.h"
#include "chrome/browser/ui/omnibox/ai_mode_page_action_controller.h"
#include "chrome/browser/ui/views/toolbar/chrome_labs/chrome_labs_coordinator.h"
#include "chrome/browser/ui/views/frame/aux_agent_tabs_bubble.h"
#include "chrome/browser/ui/tabs/tab_strip_api/controllers/tab_strip_ui_controller_impl.h"
#include "chrome/browser/ui/tabs/tab_strip_api/tab_strip_service_feature.h"
#include "chrome/browser/ui/toasts/toast_controller.h"
#include "chrome/browser/ui/context_highlight/context_highlight_window_feature.h"
#include "chrome/browser/skills/skills_ui_window_controller.h"
#include "base/check_op.h"
#include "base/logging.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/content_settings/cookie_settings_factory.h"
#include "chrome/browser/content_settings/host_content_settings_map_factory.h"
#include "chrome/browser/extensions/extension_browser_window_helper.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/bookmarks/bookmarks_service_feature.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_actions.h"
#include "chrome/browser/ui/browser_live_tab_context.h"
#include "chrome/browser/ui/browser_select_file_dialog_controller.h"
#include "chrome/browser/ui/browser_tab_menu_model_delegate.h"
#include "chrome/browser/ui/extensions/extension_installed_watcher.h"
#include "chrome/browser/ui/extensions/extension_side_panel_manager.h"
#include "chrome/browser/ui/focus/browser_focus_controller_views.h"
#include "chrome/browser/ui/lens/lens_overlay_entry_point_controller.h"
#include "chrome/browser/ui/signin/signin_view_controller.h"
#include "chrome/browser/ui/tabs/tab_group_deletion_dialog_controller.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/saved_tab_groups/saved_tab_group_model_listener.h"
#include "chrome/browser/ui/tabs/saved_tab_groups/session_service_tab_group_sync_observer.h"
#include "chrome/browser/ui/tabs/saved_tab_groups/most_recent_shared_tab_update_store.h"
#include "chrome/browser/tab_group_sync/tab_group_sync_service_factory.h"
#include "chrome/browser/enterprise/data_protection/data_protection_ui_controller.h"
#include "chrome/browser/ui/views/frame/toolbar_button_provider.h"
#include "chrome/browser/ui/toolbar/app_menu_icon_controller.h"
#include "chrome/browser/ui/views/data_sharing/data_sharing_bubble_controller.h"
#include "chrome/browser/ui/views/download/bubble/download_toolbar_ui_controller.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_transaction.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"
#include "chrome/browser/ui/views/global_media_controls/media_toolbar_button_view.h"
#include "chrome/browser/ui/views/location_bar/cookie_controls/cookie_controls_bubble_coordinator.h"
#include "chrome/browser/ui/views/location_bar/location_bar_view.h"
#include "chrome/browser/ui/views/profiles/avatar_toolbar_button.h"
#include "chrome/browser/ui/views/profiles/profile_customization_bubble_sync_controller.h"
#include "chrome/browser/ui/views/profiles/profile_menu_coordinator.h"
#include "chrome/browser/ui/views/side_panel/bookmarks/bookmarks_side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/history/history_side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/history_clusters/history_clusters_side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/reading_list/reading_list_side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/tabs_from_other_devices/tabs_from_other_devices_side_panel_coordinator.h"
#include "chrome/browser/ui/views/toolbar/reload_button.h"
#include "chrome/browser/ui/views/toolbar/toolbar_view.h"
#include "chrome/browser/ui/views/user_education/impl/browser_user_education_interface_impl.h"
#include "components/content_settings/browser/ui/cookie_controls_controller.h"

// One physical owner/window/model. No renderer or extension API is registered
// here. In particular this does not activate a partially migrated UI gesture.
struct BrowserWindowFeatures::AuxProfileSwitchProvider {
  struct Bindings {
    base::WeakPtr<Profile> target;
    raw_ptr<BrowserView> view;
    raw_ptr<ToolbarView> toolbar;
    raw_ptr<LocationBarView> location;
    raw_ptr<VerticalTabStripRegionView> vertical;
    raw_ptr<AvatarToolbarButton> avatar;
    raw_ptr<MediaToolbarButtonView> media;
    raw_ptr<BrowserUserEducationInterfaceImpl> education;
    std::unique_ptr<tab_groups::SavedTabGroupModelListener::AuxProfileModelTransfer>
        group_transfer;
    bool target_shared_owners = false;
    bool had_ai_mode_owner = false;
    bool target_ai_mode_owner = false;
    uint64_t group_session_generation = 0;
    uint64_t group_update_generation = 0;
    std::array<uint64_t, 2> cache_group_session_generations{};
    std::array<uint64_t, 2> cache_group_update_generations{};
    uint64_t view_generation = 0;
    uint64_t actions_generation = 0;
    uint64_t location_generation = 0;
    uint64_t vertical_generation = 0;
  };
  explicit AuxProfileSwitchProvider(BrowserWindowFeatures& features)
      : features_(features),
        transaction(*static_cast<Browser*>(features.browser_.get())) {}
  std::optional<aux::ProfileSwitchTransaction::PreparedBindings>
  Prepare(Browser&, Profile&);
  static std::optional<aux::ProfileSwitchTransaction::PreparedBindings>
  PrepareIfAlive(base::WeakPtr<AuxProfileSwitchProvider>, Browser&, Profile&);
  static bool RevalidateIfAlive(base::WeakPtr<AuxProfileSwitchProvider>,
                               std::shared_ptr<Bindings>,
                               Browser&, Browser&, Browser&);
  std::shared_ptr<Bindings> CollectReadyBindings(Browser&, Profile&);
  static bool HasUnportedProfileOwners(const BrowserWindowFeatures&);
  bool Revalidate(std::shared_ptr<Bindings>, Browser&, Browser&, Browser&);
  void Begin(std::shared_ptr<Bindings>, base::WeakPtr<Profile>,
             Browser&, Browser&, Browser&);
  void Commit(std::shared_ptr<Bindings>, Browser&, Browser&, Browser&);
  void Finish(std::shared_ptr<Bindings>, Browser&, Browser&, Browser&);
  void Abort(std::shared_ptr<Bindings>, Browser&, Browser&, Browser&);
  void ResumeCacheMetadata(std::shared_ptr<Bindings>, Browser&, Browser&);
  bool ResumeContextualOwners(Browser&, Browser&, Browser&);
  base::raw_ref<BrowserWindowFeatures> features_;
  aux::ProfileSwitchTransaction transaction;
  base::WeakPtrFactory<AuxProfileSwitchProvider> weak_factory_{this};
};

void BrowserWindowFeatures::AuxProfileSwitchProviderDeleter::operator()(
    AuxProfileSwitchProvider* provider) const {
  delete provider;
}

bool BrowserWindowFeatures::RunAuxProfileSwitch(Profile* target) {
  if (!browser_ || browser_->GetType() != BrowserWindowInterface::TYPE_NORMAL) {
    return false;
  }
  if (!aux_profile_switch_provider_) {
    aux_profile_switch_provider_.reset(new AuxProfileSwitchProvider(*this));
  }
  const auto result = aux_profile_switch_provider_->transaction.Run(
      target,
      base::BindOnce(&AuxProfileSwitchProvider::PrepareIfAlive,
                     aux_profile_switch_provider_->weak_factory_.GetWeakPtr()),
      base::PassKey<BrowserWindowFeatures>());
  return result == aux::ProfileSwitchTransaction::Result::kSwitched ||
         result == aux::ProfileSwitchTransaction::Result::kNoChange;
}

std::optional<aux::ProfileSwitchTransaction::PreparedBindings>
BrowserWindowFeatures::AuxProfileSwitchProvider::PrepareIfAlive(
    base::WeakPtr<AuxProfileSwitchProvider> provider,
    Browser& browser, Profile& target) {
  return provider ? provider->Prepare(browser, target) : std::nullopt;
}

bool BrowserWindowFeatures::AuxProfileSwitchProvider::RevalidateIfAlive(
    base::WeakPtr<AuxProfileSwitchProvider> provider,
    std::shared_ptr<Bindings> plan, Browser& browser,
    Browser& previous_cache, Browser& target_cache) {
  return provider && provider->Revalidate(plan, browser, previous_cache, target_cache);
}

bool BrowserWindowFeatures::AuxProfileSwitchProvider::HasUnportedProfileOwners(
    const BrowserWindowFeatures& features) {
  if (features.breadcrumb_manager_browser_agent_) {
    LOG(ERROR) << "Aux profile transition rejected: unported.breadcrumb_manager_browser_agent";
    return true;
  }
  if (features.comments_side_panel_coordinator_) {
    LOG(ERROR) << "Aux profile transition rejected: unported.comments_side_panel_coordinator";
    return true;
  }
  if (features.contextual_tasks_browser_controller_ &&
      !features.contextual_tasks_browser_controller_->CanPauseForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: contextual-task-owner-active";
    return true;
  }
  if (features.organizer_panel_controller_) {
    LOG(ERROR) << "Aux profile transition rejected: unported.organizer_panel_controller";
    return true;
  }
  if (features.ai_overlay_dialog_controller_) {
    LOG(ERROR) << "Aux profile transition rejected: unported.ai_overlay_dialog_controller";
    return true;
  }
  if (features.new_tab_footer_controller_) {
    LOG(ERROR) << "Aux profile transition rejected: unported.new_tab_footer_controller";
    return true;
  }
  if (features.ios_promo_controller_ &&
      !features.ios_promo_controller_->CanPauseForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: ios-promo-owner-active";
    return true;
  }
  if (features.recent_activity_bubble_coordinator_ &&
      !features.recent_activity_bubble_coordinator_->CanPauseForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: recent-activity-owner-active";
    return true;
  }
  if (features.shared_tab_group_feedback_controller_ &&
      !features.shared_tab_group_feedback_controller_->CanPauseForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: shared-feedback-owner-active";
    return true;
  }
  return false;
  // FindBarController retains the same window command controller and observes
  // actual tab helpers. Genuine Browser::TabDetachedAtImpl already detaches it,
  // and target/source insertion reattaches real state; no Profile is cached.
}

std::shared_ptr<BrowserWindowFeatures::AuxProfileSwitchProvider::Bindings>
BrowserWindowFeatures::AuxProfileSwitchProvider::CollectReadyBindings(
    Browser& browser, Profile& target) {
  CHECK_EQ(features_->browser_, &browser);
  // Explicit remaining source owners. Their presence is a real unsupported
  // graph, never permission to retain old-profile services or return success.
  // Remove a guard only with its actual cold/commit/abort lifecycle port.
  if (HasUnportedProfileOwners(features_.get())) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-unported-owners";
    return nullptr;
  }
  if (features_->shared_tab_group_feedback_controller_ &&
      !features_->shared_tab_group_feedback_controller_->CanRebindForAuxProfileSwitch(&target)) {
    LOG(ERROR) << "Aux profile transition rejected: shared-feedback-target-service";
    return nullptr;
  }
  if ((features_->chrome_labs_coordinator_ &&
       !features_->chrome_labs_coordinator_->CanRebindForAuxProfileSwitch()) ||
      !CanSwitchAuxAgentTabsProfile(&browser) ||
      (features_->tab_strip_service_feature_ &&
       features_->tab_strip_service_feature_->HasExternalBindingsOrActiveInvocation()) ||
      (features_->tab_strip_ui_controller_ &&
       features_->tab_strip_ui_controller_->HasClientsOrActiveCommand()) ||
      (features_->context_highlight_window_feature_ &&
       !features_->context_highlight_window_feature_->CanPauseForAuxProfileSwitch()) ||
      (features_->skills_ui_window_controller_ &&
       !features_->skills_ui_window_controller_->CanRebindForAuxProfileSwitch())) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-interaction-owners";
    return nullptr;
  }
  if (auto* toast = ToastController::From(&browser);
      toast && toast->HasPendingToastWork()) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-toast";
    return nullptr;
  }
  if (bool(features_->glic_iph_controller_) != bool(features_->glic_split_button_controller_) ||
      (features_->glic_split_button_controller_ &&
       !features_->glic_split_button_controller_->CanPrepareForAuxProfileSwitch())) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-glic-pair";
    return nullptr;
  }
  if (features_->glic_iph_controller_ &&
      !features_->glic_iph_controller_->CanPrepareForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-glic-iph";
    return nullptr;
  }
  if ((features_->actor_ui_window_controller_ &&
       !features_->actor_ui_window_controller_->CanRebindForAuxProfileSwitch()) ||
      (features_->ai_mode_page_action_controller_ &&
       !features_->ai_mode_page_action_controller_->CanRetireForAuxProfileSwitch())) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-ai-owners";
    return nullptr;
  }
  const std::array<BrowserWindowInterface*, 1> source_windows{&browser};
  if (!tab_groups::SavedTabGroupModelListener::CanPrepareAuxProfileModelTransfer(
          source_windows) ||
      bool(features_->most_recent_shared_tab_update_store_) !=
          bool(features_->session_service_tab_group_sync_observer_) ||
      (features_->most_recent_shared_tab_update_store_ &&
       (!features_->most_recent_shared_tab_update_store_->CanBeginAuxProfileSwitch() ||
        !features_->session_service_tab_group_sync_observer_->CanBeginAuxProfileSwitch())) ||
      (features_->data_protection_ui_controller_ &&
       !features_->data_protection_ui_controller_->CanPrepareForAuxProfileSwitch(&target))) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-tabgroup-and-data-protection";
    return nullptr;
  }
  auto* view = BrowserView::GetBrowserViewForBrowser(&browser);
  auto* toolbar = view ? view->toolbar() : nullptr;
  auto* location = toolbar ? static_cast<LocationBarView*>(toolbar->location_bar())
                           : nullptr;
  if (!view || !toolbar || !location || !features_->browser_actions_ ||
      !features_->browser_focus_controller_ || !features_->user_education_ || !features_->live_tab_context_ ||
      !view->CanRebindForAuxProfileSwitch(&target) ||
      !features_->browser_actions_->CanRebindForAuxProfileSwitch(&target) ||
      !location->CanPrepareForAuxProfileSwitch(&target) ||
      !toolbar->CanRebindOwnedActionsForAuxProfileSwitch() ||
      !features_->CanPrepareAuxPrivateProfileServices(&target)) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-view-toolbar-location-private-services";
    return nullptr;
  }
  auto plan = std::make_shared<Bindings>();
  plan->target = target.GetWeakPtr();
  plan->had_ai_mode_owner = bool(features_->ai_mode_page_action_controller_);
  plan->view = view;
  plan->toolbar = toolbar;
  plan->location = location;
  plan->vertical = view->vertical_tab_strip_region_view();
  plan->avatar = toolbar->avatar_toolbar_button();
  plan->media = static_cast<MediaToolbarButtonView*>(toolbar->media_button());
  plan->education =
      static_cast<BrowserUserEducationInterfaceImpl*>(features_->user_education_.get());
  if ((plan->vertical && !plan->vertical->CanRebindForAuxProfileSwitch(&target)) ||
      (plan->avatar && !plan->avatar->CanRebindForAuxProfileSwitch()) ||
      (plan->media && !plan->media->CanPrepareForAuxProfileSwitch(&target)) ||
      !plan->education->CanPrepareForAuxProfileSwitch() ||
      (toolbar->reload_button() &&
       !toolbar->reload_button()->CanRebindForAuxProfileSwitch()) ||
      (features_->profile_menu_coordinator_ &&
       !features_->profile_menu_coordinator_->CanPrepareForAuxProfileSwitch()) ||
      (features_->signin_view_controller_ &&
       !features_->signin_view_controller_->CanPrepareForAuxProfileSwitch()) ||
      (features_->profile_customization_bubble_sync_controller_ &&
       !features_->profile_customization_bubble_sync_controller_->CanPrepareForAuxProfileSwitch()) ||
      (features_->extension_installed_watcher_ &&
       !features_->extension_installed_watcher_->CanPrepareForAuxProfileSwitch()) ||
      (features_->extension_browser_window_helper_ &&
       !features_->extension_browser_window_helper_->CanPrepareForAuxProfileSwitch()) ||
      (features_->browser_select_file_dialog_controller_ &&
       !features_->browser_select_file_dialog_controller_->CanRebindForAuxProfileSwitch()) ||
      (features_->data_sharing_bubble_controller_ &&
       !features_->data_sharing_bubble_controller_->CanRebindForAuxProfileSwitch()) ||
      (features_->tab_group_deletion_dialog_controller_ &&
       !features_->tab_group_deletion_dialog_controller_->CanRebindForAuxProfileSwitch()) ||
      (features_->tab_menu_model_delegate_ &&
       !static_cast<chrome::BrowserTabMenuModelDelegate*>(
            features_->tab_menu_model_delegate_.get())->CanRebindForAuxProfileSwitch(&browser)) ||
      (features_->lens_overlay_entry_point_controller_ &&
       !features_->lens_overlay_entry_point_controller_->CanRebindForAuxProfileSwitch()) ||
      (features_->download_toolbar_ui_controller_ &&
       !features_->download_toolbar_ui_controller_->CanRebindForAuxProfileSwitch())) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-bound-ui-owners";
    return nullptr;
  }
  if (features_->cookie_controls_bubble_coordinator_ &&
      !features_->cookie_controls_bubble_coordinator_->CanRebindForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.source-cookie-controls";
    return nullptr;
  }
  return plan;
}

bool BrowserWindowFeatures::AuxProfileSwitchProvider::Revalidate(
    std::shared_ptr<Bindings> original, Browser& browser,
    Browser& previous_cache, Browser& target_cache) {
  // A missing source optional owner does not prove the target is ineligible.
  // The genuine fixed target cache has already run the original constructors
  // and factory predicates. Reject its real unported graph before source edits.
  if (!original->target ||
      target_cache.GetProfile() != original->target.get() ||
      previous_cache.GetProfile() != browser.GetProfile() ||
      HasUnportedProfileOwners(target_cache.GetFeatures())) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.cache-identity-and-unported-owners";
    return false;
  }
  auto& target_features = target_cache.GetFeatures();
  if (bool(target_features.most_recent_shared_tab_update_store_) !=
          bool(target_features.session_service_tab_group_sync_observer_) ||
      browser.GetTabStripModel()->SupportsTabGroups() !=
          target_cache.GetTabStripModel()->SupportsTabGroups()) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.cache-tabgroup-support";
    return false;
  }
  for (auto* cache : {&previous_cache, &target_cache}) {
    auto& features = cache->GetFeatures();
    if (features.contextual_tasks_browser_controller_ &&
        !features.contextual_tasks_browser_controller_->CanPauseForAuxProfileSwitch()) {
      LOG(ERROR) << "Aux profile transition rejected: contextual-task-cache-owner-active";
      return false;
    }
    if (features.ios_promo_controller_ &&
        !features.ios_promo_controller_->CanPauseForAuxProfileSwitch()) {
      LOG(ERROR) << "Aux profile transition rejected: ios-promo-cache-owner-active";
      return false;
    }
    if (features.recent_activity_bubble_coordinator_ &&
        !features.recent_activity_bubble_coordinator_->CanPauseForAuxProfileSwitch()) {
      LOG(ERROR) << "Aux profile transition rejected: recent-activity-cache-owner-active";
      return false;
    }
    if (features.shared_tab_group_feedback_controller_ &&
        !features.shared_tab_group_feedback_controller_->CanPauseForAuxProfileSwitch()) {
      LOG(ERROR) << "Aux profile transition rejected: shared-feedback-cache-owner-active";
      return false;
    }
    if (bool(features.glic_iph_controller_) != bool(features.glic_split_button_controller_) ||
        bool(features.glic_split_button_controller_) != bool(features_->glic_split_button_controller_) ||
        (features.glic_split_button_controller_ &&
         !features.glic_split_button_controller_->CanPrepareForAuxProfileSwitch())) {
      LOG(ERROR) << "Aux profile transition rejected: bindings.cache-glic-pair";
      return false;
    }
    if (bool(features.glic_iph_controller_) != bool(features_->glic_iph_controller_) ||
        (features.glic_iph_controller_ &&
         !features.glic_iph_controller_->CanPrepareForAuxProfileSwitch())) {
      LOG(ERROR) << "Aux profile transition rejected: bindings.cache-glic-iph";
      return false;
    }
    if (bool(features.actor_ui_window_controller_) !=
            bool(features_->actor_ui_window_controller_) ||
        (features.actor_ui_window_controller_ &&
         !features.actor_ui_window_controller_->CanRebindForAuxProfileSwitch())) {
      LOG(ERROR) << "Aux profile transition rejected: bindings.cache-actor";
      return false;
    }
    if (bool(features.most_recent_shared_tab_update_store_) !=
            bool(features.session_service_tab_group_sync_observer_) ||
        (features.most_recent_shared_tab_update_store_ &&
         (!features.most_recent_shared_tab_update_store_->CanBeginAuxProfileSwitch() ||
          !features.session_service_tab_group_sync_observer_->CanBeginAuxProfileSwitch()))) {
      LOG(ERROR) << "Aux profile transition rejected: bindings.cache-shared-tabgroup";
      return false;
    }
  }
  const std::array<BrowserWindowInterface*, 3> windows{
      &browser, &previous_cache, &target_cache};
  if (!tab_groups::SavedTabGroupModelListener::CanPrepareAuxProfileModelTransfer(windows)) {
    LOG(ERROR) << "Aux profile transition rejected: bindings.cache-model-transfer";
    return false;
  }
  original->target_ai_mode_owner =
      bool(target_features.ai_mode_page_action_controller_);
  original->target_shared_owners =
      bool(target_features.most_recent_shared_tab_update_store_);
  auto current = CollectReadyBindings(browser, *original->target);
  return current && current->view == original->view &&
         current->toolbar == original->toolbar &&
         current->location == original->location &&
         current->vertical == original->vertical &&
         current->avatar == original->avatar && current->media == original->media &&
         current->education == original->education;
}

std::optional<aux::ProfileSwitchTransaction::PreparedBindings>
BrowserWindowFeatures::AuxProfileSwitchProvider::Prepare(Browser& browser,
                                                       Profile& target) {
  auto plan = CollectReadyBindings(browser, target);
  if (!plan) {
    return std::nullopt;
  }
  return aux::ProfileSwitchTransaction::PreparedBindings(
      base::BindRepeating(&AuxProfileSwitchProvider::RevalidateIfAlive,
                          weak_factory_.GetWeakPtr(), plan),
      base::BindOnce(&AuxProfileSwitchProvider::Begin,
                     weak_factory_.GetWeakPtr(), plan, target.GetWeakPtr()),
      base::BindOnce(&AuxProfileSwitchProvider::Commit,
                     weak_factory_.GetWeakPtr(), plan),
      base::BindOnce(&AuxProfileSwitchProvider::Finish,
                     weak_factory_.GetWeakPtr(), plan),
      base::BindOnce(&AuxProfileSwitchProvider::Abort,
                     weak_factory_.GetWeakPtr(), plan));
}

void BrowserWindowFeatures::AuxProfileSwitchProvider::Begin(
    std::shared_ptr<Bindings> plan,
    base::WeakPtr<Profile> target, Browser& browser,
    Browser& previous_cache, Browser& target_cache) {
  const auto provider = weak_factory_.GetWeakPtr();
  const auto visible_window = browser.GetWeakPtr();
  const auto previous_window = previous_cache.GetWeakPtr();
  const auto target_window = target_cache.GetWeakPtr();
  const auto alive = [&] {
    return provider && visible_window && previous_window && target_window;
  };
  CHECK(target);
  for (Browser* window : {&browser, &previous_cache, &target_cache}) {
    auto& owner = window->GetFeatures().contextual_tasks_browser_controller_;
    if (owner) {
      owner->PauseForAuxProfileSwitch();
      if (!alive()) return;
    }
    auto& promo = window->GetFeatures().ios_promo_controller_;
    if (promo) {
      promo->PauseForAuxProfileSwitch();
      if (!alive()) return;
    }
    auto& activity = window->GetFeatures().recent_activity_bubble_coordinator_;
    if (activity) {
      activity->PauseForAuxProfileSwitch();
      if (!alive()) return;
    }
    auto& feedback = window->GetFeatures().shared_tab_group_feedback_controller_;
    if (feedback) {
      feedback->PauseForAuxProfileSwitch();
      if (!alive()) return;
    }
  }
  const std::array<BrowserWindowInterface*, 3> windows{
      &browser, &previous_cache, &target_cache};
  plan->group_transfer =
      tab_groups::SavedTabGroupModelListener::PrepareAuxProfileModelTransfer(windows);
  if (!alive()) {
    return;
  }
  CHECK(plan->group_transfer);
  if (features_->most_recent_shared_tab_update_store_) {
    plan->group_update_generation =
        features_->most_recent_shared_tab_update_store_->BeginAuxProfileSwitch();
    if (!alive()) {
      return;
    }
    plan->group_session_generation =
        features_->session_service_tab_group_sync_observer_->BeginAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  const std::array<Browser*, 2> caches{&previous_cache, &target_cache};
  for (size_t index = 0; index < caches.size(); ++index) {
    auto& features = caches[index]->GetFeatures();
    if (features.most_recent_shared_tab_update_store_) {
      plan->cache_group_update_generations[index] =
          features.most_recent_shared_tab_update_store_->BeginAuxProfileSwitch();
      if (!alive()) {
        return;
      }
      plan->cache_group_session_generations[index] =
          features.session_service_tab_group_sync_observer_->BeginAuxProfileSwitch();
      if (!alive()) {
        return;
      }
    }
  }
  if (features_->glic_split_button_controller_) {
    features_->glic_split_button_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_iph_controller_) {
    features_->glic_iph_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->ai_mode_page_action_controller_) {
    features_->ai_mode_page_action_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
    features_->ai_mode_page_action_controller_.reset();
    if (!alive()) {
      return;
    }
  }
  if (features_->actor_ui_window_controller_) {
    features_->actor_ui_window_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->data_protection_ui_controller_) {
    features_->data_protection_ui_controller_->PrepareForAuxProfileSwitch(target.get());
    if (!alive()) {
      return;
    }
  }
  // All old-source observation/IPC is retired before identity. Source-tab
  // services that need real detach notifications remain until empty commit.
  // Core has just recoverably revalidated real clients/commands/widgets after
  // cache construction, before these source observer/IPC effects begin.
  if (features_->context_highlight_window_feature_) {
    features_->context_highlight_window_feature_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->skills_ui_window_controller_) {
    features_->skills_ui_window_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->chrome_labs_coordinator_) {
    features_->chrome_labs_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  plan->view_generation = plan->view->BeginAuxProfileSwitch(target.get());
  if (!alive()) {
    return;
  }
  // Retire Cast before real old pinned/view teardown can call its icon path.
  features_->BeginAuxPrivateProfileServices(target.get());
  if (!alive()) {
    return;
  }
  plan->actions_generation = features_->browser_actions_->BeginAuxProfileSwitch(target.get());
  if (!alive()) {
    return;
  }
  plan->location_generation = plan->location->BeginAuxProfileSwitch(target.get());
  if (!alive()) {
    return;
  }
  if (plan->vertical) {
    plan->vertical_generation = plan->vertical->BeginAuxProfileSwitch(target.get());
    if (!alive()) {
      return;
    }
  }
  if (features_->download_toolbar_ui_controller_) {
    features_->download_toolbar_ui_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->cookie_controls_bubble_coordinator_) {
    features_->cookie_controls_bubble_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->side_panel_coordinator_) {
    features_->side_panel_coordinator_->PreparePinningForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_side_panel_manager_) {
    features_->extension_side_panel_manager_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->reading_list_side_panel_coordinator_) {
    features_->reading_list_side_panel_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->bookmarks_side_panel_coordinator_) {
    features_->bookmarks_side_panel_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->history_side_panel_coordinator_) {
    features_->history_side_panel_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->history_clusters_side_panel_coordinator_) {
    features_->history_clusters_side_panel_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->tabs_from_other_devices_side_panel_coordinator_) {
    features_->tabs_from_other_devices_side_panel_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->bookmarks_service_feature_) {
    features_->bookmarks_service_feature_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_browser_window_helper_) {
    features_->extension_browser_window_helper_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_installed_watcher_) {
    features_->extension_installed_watcher_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->profile_menu_coordinator_) {
    features_->profile_menu_coordinator_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->signin_view_controller_) {
    features_->signin_view_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->profile_customization_bubble_sync_controller_) {
    features_->profile_customization_bubble_sync_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->lens_overlay_entry_point_controller_) {
    features_->lens_overlay_entry_point_controller_->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  plan->education->PrepareForAuxProfileSwitch();
  if (!alive()) {
    return;
  }
  if (plan->avatar) {
    plan->avatar->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (plan->media) {
    plan->media->PrepareForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  plan->toolbar->app_menu_icon_controller()->PrepareForAuxProfileSwitch();
  if (!alive()) {
    return;
  }
  plan->toolbar->PrepareOwnedActionsForAuxProfileSwitch();
  if (!alive()) {
    return;
  }
  // Do not leave Features' alias pointing into the retired pinned subtree.
  features_->pinned_toolbar_actions_ = nullptr;
}

void BrowserWindowFeatures::AuxProfileSwitchProvider::Commit(
    std::shared_ptr<Bindings> plan,
    Browser& browser, Browser& previous_cache, Browser& target_cache) {
  const auto provider = weak_factory_.GetWeakPtr();
  const auto visible_window = browser.GetWeakPtr();
  const auto previous_window = previous_cache.GetWeakPtr();
  const auto target_window = target_cache.GetWeakPtr();
  const auto alive = [&] {
    return provider && visible_window && previous_window && target_window;
  };
  Profile* target = browser.GetProfile();
  CHECK(browser.GetTabStripModel()->empty());
  plan->view->RebindAuxProfileSwitch(plan->view_generation);
  if (!alive()) {
    return;
  }
  if (features_->actor_ui_window_controller_) {
    features_->actor_ui_window_controller_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_iph_controller_) {
    auto* service = glic::GlicKeyedService::Get(target);
    if (!alive()) {
      return;
    }
    CHECK(service);
    features_->glic_iph_controller_->RebindForAuxProfileSwitch(*service);
    if (!alive()) {
      return;
    }
  }
  // Real action definitions/policies must exist before target toolbar/entries.
  features_->browser_actions_->RebindAuxProfileSwitch(plan->actions_generation);
  if (!alive()) {
    return;
  }
  plan->location->RebindAuxProfileSwitch(plan->location_generation);
  if (!alive()) {
    return;
  }
  plan->toolbar->RebindOwnedActionsForAuxProfileSwitch(target);
  if (!alive()) {
    return;
  }
  features_->pinned_toolbar_actions_ = static_cast<ToolbarButtonProvider*>(plan->toolbar.get())
          ->GetPinnedToolbarActions();
  if (features_->chrome_labs_coordinator_) {
    features_->chrome_labs_coordinator_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  features_->RebindAuxPrivateProfileServices();
  if (!alive()) {
    return;
  }
  if (features_->skills_ui_window_controller_) {
    features_->skills_ui_window_controller_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->cookie_controls_controller_) {
    // Real source-tab deactivation/detach removed page-action observers. No
    // OnUiClosing/reload is run; replace only its private settings sources.
    CHECK(features_->cookie_controls_controller_->CanRetireWithoutUi());
    features_->cookie_controls_controller_.reset();
    if (!alive()) {
      return;
    }
    features_->cookie_controls_controller_ =
        std::make_unique<content_settings::CookieControlsController>(
            browser.GetUnownedUserDataHost(),
            CookieSettingsFactory::GetForProfile(target), nullptr,
            HostContentSettingsMapFactory::GetForProfile(target), false);
    if (!alive()) {
      return;
    }
  }
  if (features_->cookie_controls_bubble_coordinator_) {
    features_->cookie_controls_bubble_coordinator_->RebindForAuxProfileSwitch(
        features_->browser_actions_->root_action_item());
    if (!alive()) {
      return;
    }
  }
  static_cast<BrowserFocusControllerViews*>(features_->browser_focus_controller_.get())
      ->RebindForAuxProfileSwitch(browser);
  if (!alive()) {
    return;
  }
  features_->live_tab_context_->RebindForAuxProfileSwitch();
  if (!alive()) {
    return;
  }
  if (features_->browser_select_file_dialog_controller_) {
    features_->browser_select_file_dialog_controller_->RebindForAuxProfileSwitch(browser);
    if (!alive()) {
      return;
    }
  }
  if (features_->data_sharing_bubble_controller_) {
    features_->data_sharing_bubble_controller_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->tab_group_deletion_dialog_controller_) {
    features_->tab_group_deletion_dialog_controller_->RebindForAuxProfileSwitch(&browser, target);
    if (!alive()) {
      return;
    }
  }
  if (features_->tab_menu_model_delegate_) {
    static_cast<chrome::BrowserTabMenuModelDelegate*>(features_->tab_menu_model_delegate_.get())->RebindForAuxProfileSwitch(&browser, target);
    if (!alive()) {
      return;
    }
  }
  if (features_->profile_menu_coordinator_) {
    features_->profile_menu_coordinator_->RebindForAuxProfileSwitch(*target);
    if (!alive()) {
      return;
    }
  }
  if (features_->signin_view_controller_) {
    features_->signin_view_controller_->RebindForAuxProfileSwitch(*target);
    if (!alive()) {
      return;
    }
  }
  if (features_->profile_customization_bubble_sync_controller_) {
    features_->profile_customization_bubble_sync_controller_->RebindForAuxProfileSwitch(*target);
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_installed_watcher_) {
    features_->extension_installed_watcher_->RebindForAuxProfileSwitch(browser);
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_browser_window_helper_) {
    features_->extension_browser_window_helper_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->bookmarks_service_feature_) {
    features_->bookmarks_service_feature_->RebindForAuxProfileSwitch(browser);
    if (!alive()) {
      return;
    }
  }
  if (plan->avatar) {
    plan->avatar->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (plan->media) {
    plan->media->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  plan->toolbar->app_menu_icon_controller()->RebindForAuxProfileSwitch(*target);
  if (!alive()) {
    return;
  }
  if (plan->toolbar->reload_button()) {
    plan->toolbar->reload_button()->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  plan->education->RebindForAuxProfileSwitch(*plan->view);
  if (!alive()) {
    return;
  }
  // Use the target cache's genuinely constructed owner pair as eligibility
  // evidence; preserve the same source owners whenever the target supports it.
  if (!plan->target_shared_owners) {
    features_->session_service_tab_group_sync_observer_.reset();
    if (!alive()) {
      return;
    }
    features_->most_recent_shared_tab_update_store_.reset();
    if (!alive()) {
      return;
    }
    plan->group_session_generation = 0;
    plan->group_update_generation = 0;
  } else {
    CHECK(target->IsRegularProfile());
    CHECK(browser.GetTabStripModel()->SupportsTabGroups());
    CHECK(tab_groups::TabGroupSyncServiceFactory::GetForProfile(target));
    if (!features_->most_recent_shared_tab_update_store_) {
      features_->most_recent_shared_tab_update_store_ =
          BrowserWindowFeatures::GetUserDataFactory()
              .CreateInstance<tab_groups::MostRecentSharedTabUpdateStore>(
                  browser, &browser);
      if (!alive()) {
        return;
      }
      features_->session_service_tab_group_sync_observer_ =
          std::make_unique<tab_groups::SessionServiceTabGroupSyncObserver>(
              target, browser.GetTabStripModel(), browser.GetSessionID());
      if (!alive()) {
        return;
      }
      plan->group_update_generation =
          features_->most_recent_shared_tab_update_store_->BeginAuxProfileSwitch();
      if (!alive()) {
        return;
      }
      plan->group_session_generation =
          features_->session_service_tab_group_sync_observer_->BeginAuxProfileSwitch();
      if (!alive()) {
        return;
      }
    }
    features_->most_recent_shared_tab_update_store_->RebindAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
    features_->session_service_tab_group_sync_observer_->RebindAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->data_protection_ui_controller_) {
    features_->data_protection_ui_controller_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->lens_overlay_entry_point_controller_) {
    features_->lens_overlay_entry_point_controller_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->reading_list_side_panel_coordinator_) {
    features_->reading_list_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->bookmarks_side_panel_coordinator_) {
    features_->bookmarks_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->history_side_panel_coordinator_) {
    features_->history_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->history_clusters_side_panel_coordinator_) {
    features_->history_clusters_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->tabs_from_other_devices_side_panel_coordinator_) {
    features_->tabs_from_other_devices_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_side_panel_manager_) {
    features_->extension_side_panel_manager_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->side_panel_coordinator_) {
    features_->side_panel_coordinator_->RebindPinningForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (features_->download_toolbar_ui_controller_) {
    features_->download_toolbar_ui_controller_->RebindForAuxProfileSwitch(target);
    if (!alive()) {
      return;
    }
  }
  if (plan->vertical) {
    plan->vertical->RebindAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_split_button_controller_) {
    // Rebind the actual service only after target toolbar/vertical delegates
    // and dormant real bubble view owners have their target profile identity.
    auto* service = glic::GlicKeyedService::Get(target);
    if (!alive()) {
      return;
    }
    CHECK(service);
    features_->glic_split_button_controller_->RebindForAuxProfileSwitch(*service);
    if (!alive()) {
      return;
    }
  }
  if (plan->target_ai_mode_owner) {
    auto owner = omnibox::AiModePageActionController::CreatePreparedForAuxProfileSwitch(
        browser, *target, *plan->location);
    if (!alive()) {
      return;
    }
    features_->ai_mode_page_action_controller_ = std::move(owner);
  }
}

void BrowserWindowFeatures::AuxProfileSwitchProvider::Finish(
    std::shared_ptr<Bindings> plan,
    Browser& browser, Browser& previous_cache, Browser& target_cache) {
  const auto provider = weak_factory_.GetWeakPtr();
  const auto visible_window = browser.GetWeakPtr();
  const auto previous_window = previous_cache.GetWeakPtr();
  const auto target_window = target_cache.GetWeakPtr();
  const auto alive = [&] {
    return provider && visible_window && previous_window && target_window;
  };
  CHECK(plan->group_transfer->CanFinish(false));
  plan->group_transfer->Commit();
  if (!alive()) {
    return;
  }
  plan->group_transfer.reset();
  if (!alive()) {
    return;
  }
  ResumeCacheMetadata(plan, previous_cache, target_cache);
  if (features_->most_recent_shared_tab_update_store_) {
    features_->session_service_tab_group_sync_observer_->EndAuxProfileSwitch(
        plan->group_session_generation);
    if (!alive()) {
      return;
    }
    features_->most_recent_shared_tab_update_store_->EndAuxProfileSwitch(
        plan->group_update_generation);
    if (!alive()) {
      return;
    }
  }
  if (features_->data_protection_ui_controller_) {
    features_->data_protection_ui_controller_->FinishForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  features_->FinishAuxPrivateProfileServices();
  if (!alive()) {
    return;
  }
  if (features_->context_highlight_window_feature_) {
    features_->context_highlight_window_feature_->FinishForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  features_->browser_actions_->EndAuxProfileSwitch(plan->actions_generation);
  if (!alive()) {
    return;
  }
  plan->location->EndAuxProfileSwitch(plan->location_generation);
  if (!alive()) {
    return;
  }
  if (plan->vertical) {
    plan->vertical->EndAuxProfileSwitch(plan->vertical_generation);
    if (!alive()) {
      return;
    }
  }
  plan->view->EndAuxProfileSwitch(plan->view_generation);
  if (!alive()) {
    return;
  }
  if (features_->lens_overlay_entry_point_controller_) {
    features_->lens_overlay_entry_point_controller_->UpdateEntryPointsState(true);
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_split_button_controller_) {
    features_->glic_split_button_controller_->FinishForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_iph_controller_) {
    features_->glic_iph_controller_->FinishAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->actor_ui_window_controller_) {
    features_->actor_ui_window_controller_->FinishForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (!ResumeContextualOwners(browser, previous_cache, target_cache)) return;
  if (features_->ai_mode_page_action_controller_) {
    // Its genuine config update may notify UI observers. Keep this the final
    // private-owner effect after real tabs/edit model/profile services settle.
    features_->ai_mode_page_action_controller_->FinishForAuxProfileSwitch();
  }
}

void BrowserWindowFeatures::AuxProfileSwitchProvider::Abort(
    std::shared_ptr<Bindings> plan,
    Browser& browser, Browser& previous_cache, Browser& target_cache) {
  const auto provider = weak_factory_.GetWeakPtr();
  const auto visible_window = browser.GetWeakPtr();
  const auto previous_window = previous_cache.GetWeakPtr();
  const auto target_window = target_cache.GetWeakPtr();
  const auto alive = [&] {
    return provider && visible_window && previous_window && target_window;
  };
  CHECK(plan->group_transfer->CanFinish(true));
  plan->group_transfer->Abort();
  if (!alive()) {
    return;
  }
  plan->group_transfer.reset();
  if (!alive()) {
    return;
  }
  ResumeCacheMetadata(plan, previous_cache, target_cache);
  if (features_->most_recent_shared_tab_update_store_) {
    features_->session_service_tab_group_sync_observer_->AbortAuxProfileSwitch(
        plan->group_session_generation, browser.GetProfile());
    if (!alive()) {
      return;
    }
    features_->most_recent_shared_tab_update_store_->AbortAuxProfileSwitch(
        plan->group_update_generation, browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (features_->data_protection_ui_controller_) {
    features_->data_protection_ui_controller_->AbortAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  // Core has not committed identity. Genuine source tabs are already back.
  // No target profile service was constructed; restore actual source only.
  features_->browser_actions_->EndAuxProfileSwitch(plan->actions_generation);
  if (!alive()) {
    return;
  }
  plan->toolbar->AbortOwnedActionsForAuxProfileSwitch(browser.GetProfile());
  if (!alive()) {
    return;
  }
  features_->pinned_toolbar_actions_ = static_cast<ToolbarButtonProvider*>(plan->toolbar.get())
          ->GetPinnedToolbarActions();
  if (features_->chrome_labs_coordinator_) {
    features_->chrome_labs_coordinator_->AbortForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  features_->AbortAuxPrivateProfileServices();
  if (!alive()) {
    return;
  }
  if (features_->skills_ui_window_controller_) {
    features_->skills_ui_window_controller_->AbortForAuxProfileSwitch(
        browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (features_->context_highlight_window_feature_) {
    features_->context_highlight_window_feature_->FinishForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->download_toolbar_ui_controller_) {
    features_->download_toolbar_ui_controller_->AbortForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (features_->cookie_controls_bubble_coordinator_) {
    features_->cookie_controls_bubble_coordinator_->RebindForAuxProfileSwitch(
        features_->browser_actions_->root_action_item());
    if (!alive()) {
      return;
    }
  }
  plan->location->AbortAuxProfileSwitch(plan->location_generation);
  if (!alive()) {
    return;
  }
  if (features_->extension_browser_window_helper_) {
    features_->extension_browser_window_helper_->AbortAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_installed_watcher_) {
    features_->extension_installed_watcher_->RebindForAuxProfileSwitch(browser);
    if (!alive()) {
      return;
    }
  }
  if (features_->bookmarks_service_feature_) {
    features_->bookmarks_service_feature_->RebindForAuxProfileSwitch(browser);
    if (!alive()) {
      return;
    }
  }
  if (plan->avatar) {
    plan->avatar->RebindForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (plan->media) {
    plan->media->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  plan->toolbar->app_menu_icon_controller()->RebindForAuxProfileSwitch(*browser.GetProfile());
  if (!alive()) {
    return;
  }
  plan->education->RebindForAuxProfileSwitch(*plan->view);
  if (!alive()) {
    return;
  }
  if (features_->lens_overlay_entry_point_controller_) {
    features_->lens_overlay_entry_point_controller_->AbortAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->reading_list_side_panel_coordinator_) {
    features_->reading_list_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->bookmarks_side_panel_coordinator_) {
    features_->bookmarks_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->history_side_panel_coordinator_) {
    features_->history_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->history_clusters_side_panel_coordinator_) {
    features_->history_clusters_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->tabs_from_other_devices_side_panel_coordinator_) {
    features_->tabs_from_other_devices_side_panel_coordinator_->RebindForAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->extension_side_panel_manager_) {
    features_->extension_side_panel_manager_->AbortForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (features_->side_panel_coordinator_) {
    features_->side_panel_coordinator_->RebindPinningForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (plan->vertical) {
    plan->vertical->RebindAuxProfileSwitch();
    if (!alive()) {
      return;
    }
    plan->vertical->EndAuxProfileSwitch(plan->vertical_generation);
    if (!alive()) {
      return;
    }
  }
  plan->view->EndAuxProfileSwitch(plan->view_generation);
  if (!alive()) {
    return;
  }
  if (features_->lens_overlay_entry_point_controller_) {
    features_->lens_overlay_entry_point_controller_->UpdateEntryPointsState(true);
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_split_button_controller_) {
    features_->glic_split_button_controller_->AbortForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (features_->glic_iph_controller_) {
    features_->glic_iph_controller_->AbortAuxProfileSwitch();
    if (!alive()) {
      return;
    }
  }
  if (features_->actor_ui_window_controller_) {
    features_->actor_ui_window_controller_->AbortForAuxProfileSwitch(browser.GetProfile());
    if (!alive()) {
      return;
    }
  }
  if (!ResumeContextualOwners(browser, previous_cache, target_cache)) return;
  if (plan->had_ai_mode_owner) {
    auto owner = omnibox::AiModePageActionController::CreatePreparedForAuxProfileSwitch(
        browser, *browser.GetProfile(), *plan->location);
    if (!alive()) {
      return;
    }
    features_->ai_mode_page_action_controller_ = std::move(owner);
    features_->ai_mode_page_action_controller_->FinishForAuxProfileSwitch();
  }
}
bool BrowserWindowFeatures::AuxProfileSwitchProvider::ResumeContextualOwners(
    Browser& browser, Browser& previous_cache, Browser& target_cache) {
  const auto provider = weak_factory_.GetWeakPtr();
  const auto visible = browser.GetWeakPtr();
  const auto previous = previous_cache.GetWeakPtr();
  const auto target = target_cache.GetWeakPtr();
  for (Browser* window : {&browser, &previous_cache, &target_cache}) {
    auto& owner = window->GetFeatures().contextual_tasks_browser_controller_;
    if (owner) {
      // The window identity and real tabs now belong to the committed target
      // or restored source. Factory lookups must happen only at this point.
      owner->ResumeForAuxProfileSwitch();
      if (!provider || !visible || !previous || !target) return false;
    }
    auto& promo = window->GetFeatures().ios_promo_controller_;
    if (promo) {
      promo->ResumeForAuxProfileSwitch();
      if (!provider || !visible || !previous || !target) return false;
    }
    auto& activity = window->GetFeatures().recent_activity_bubble_coordinator_;
    if (activity) {
      activity->ResumeForAuxProfileSwitch();
      if (!provider || !visible || !previous || !target) return false;
    }
    auto& feedback = window->GetFeatures().shared_tab_group_feedback_controller_;
    if (feedback) {
      feedback->ResumeForAuxProfileSwitch();
      if (!provider || !visible || !previous || !target) return false;
    }
  }
  return true;
}

void BrowserWindowFeatures::AuxProfileSwitchProvider::ResumeCacheMetadata(
    std::shared_ptr<Bindings> plan,
    Browser& previous_cache, Browser& target_cache) {
  const auto provider = weak_factory_.GetWeakPtr();
  const auto previous_window = previous_cache.GetWeakPtr();
  const auto target_window = target_cache.GetWeakPtr();
  const auto alive = [&] { return provider && previous_window && target_window; };
  const std::array<Browser*, 2> caches{&previous_cache, &target_cache};
  for (size_t index = 0; index < caches.size(); ++index) {
    auto& features = caches[index]->GetFeatures();
    if (features.most_recent_shared_tab_update_store_) {
      // Cache profile identities never changed. Restore their real same-profile
      // service observations without the target-empty rebind or clearing IDs.
      features.session_service_tab_group_sync_observer_->AbortAuxProfileSwitch(
          plan->cache_group_session_generations[index], caches[index]->GetProfile());
      if (!alive()) {
        return;
      }
      features.most_recent_shared_tab_update_store_->AbortAuxProfileSwitch(
          plan->cache_group_update_generations[index], caches[index]->GetProfile());
      if (!alive()) {
        return;
      }
    }
  }
}
#endif
