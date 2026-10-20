// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/enterprise/data_protection/data_protection_ui_controller.h"

#include <algorithm>

#include "base/check.h"
#include "base/check_op.h"
#include "base/feature_list.h"
#include "base/functional/bind.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/enterprise/data_protection/data_protection_features.h"
#include "chrome/browser/enterprise/data_protection/data_protection_navigation_controller.h"
#include "chrome/browser/enterprise/data_protection/data_protection_navigation_observer.h"
#include "chrome/browser/enterprise/watermark/settings.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/public/tab_features.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "components/enterprise/watermarking/content/watermark_text_container.h"
#include "components/enterprise/watermarking/watermark.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"

namespace enterprise_data_protection {

DataProtectionUIController::ContentsViewDataProtectionController::
    ContentsViewDataProtectionController(
        DataProtectionUIController* owner,
        ContentsContainerView* contents_container_view,
        PrefService* prefs)
    : owner_(owner),
      contents_container_view_(contents_container_view),
      prefs_(prefs) {
  ContentsWebView* contents_web_view = contents_container_view->contents_view();
  web_contents_attached_subscription_ =
      contents_web_view->AddWebContentsAttachedCallback(base::BindRepeating(
          &ContentsViewDataProtectionController::OnWebContentsAttached,
          base::Unretained(this)));
  web_contents_detached_subscription_ =
      contents_web_view->AddWebContentsDetachedCallback(base::BindRepeating(
          &ContentsViewDataProtectionController::OnWebContentsDetached,
          base::Unretained(this)));
  OnWebContentsAttached(contents_web_view);
}

DataProtectionUIController::ContentsViewDataProtectionController::
    ~ContentsViewDataProtectionController() = default;

void DataProtectionUIController::ContentsViewDataProtectionController::
    OnWebContentsAttached(views::WebView* web_view) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (owner_->aux_profile_switch_prepared_) {
    return;
  }
  auto mutation = owner_->EnterAuxMutation();
#endif
  if (!web_view->web_contents()) {
    return;
  }

  // TODO(alshawwa): GetFromContents() crashes in PWAs in the ChromeOS case. We
  // therefore use MaybeGetFromContents() and perform a nullptr check. Resolve
  // the ChromeOS PWA case.
  tabs::TabInterface* tab =
      tabs::TabInterface::MaybeGetFromContents(web_view->web_contents());
  if (!tab) {
    return;
  }

  enterprise_data_protection::DataProtectionNavigationController* controller =
      tab->GetTabFeatures()->data_protection_controller();

  contents_container_view_->ApplyWatermarkSettings(
      controller->watermark_text(), enterprise_watermark::GetFillColor(prefs_),
      enterprise_watermark::GetOutlineColor(prefs_),
      enterprise_watermark::GetFontSize(prefs_));

  watermark_subscription_ =
      controller->RegisterWatermarkStringUpdatedCallback(base::BindRepeating(
          &ContentsViewDataProtectionController::OnWatermarkStringUpdated,
          base::Unretained(this)));
#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
  owner_->MaybeUpdateScreenshotSettings();

  screenshot_subscription_ =
      controller->RegisterScreenshotAllowedUpdatedCallback(base::BindRepeating(
          &ContentsViewDataProtectionController::OnScreenshotAllowedUpdated,
          base::Unretained(this)));
#endif
}

void DataProtectionUIController::ContentsViewDataProtectionController::
    OnWebContentsDetached(views::WebView* web_view) {
  watermark_subscription_ = base::CallbackListSubscription();
#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
  screenshot_subscription_ = base::CallbackListSubscription();
#endif
}

void DataProtectionUIController::ContentsViewDataProtectionController::
    OnWatermarkStringUpdated(const std::string& watermark_string) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (owner_->aux_profile_switch_prepared_) {
    return;
  }
  auto mutation = owner_->EnterAuxMutation();
#endif
  contents_container_view_->ApplyWatermarkSettings(
      watermark_string, enterprise_watermark::GetFillColor(prefs_),
      enterprise_watermark::GetOutlineColor(prefs_),
      enterprise_watermark::GetFontSize(prefs_));
}

#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
void DataProtectionUIController::ContentsViewDataProtectionController::
    OnScreenshotAllowedUpdated(bool allowed) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (owner_->aux_profile_switch_prepared_) {
    return;
  }
  auto mutation = owner_->EnterAuxMutation();
#endif
  owner_->MaybeUpdateScreenshotSettings();
}
#endif

#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
bool DataProtectionUIController::ContentsViewDataProtectionController::
    GetScreenshotAllowed() {
  // It is possible with splits in an intermediate state that there is no
  // attached webcontents to the `contents_container_view_` This can happen
  // during reversing of splits since the webcontents could be detached from one
  // of the views.
  if (!contents_container_view_->GetVisible() ||
      !contents_container_view_->contents_view()->web_contents()) {
    return true;
  }

  tabs::TabInterface* tab = tabs::TabInterface::GetFromContents(
      contents_container_view_->contents_view()->web_contents());

  enterprise_data_protection::DataProtectionNavigationController* controller =
      tab->GetTabFeatures()->data_protection_controller();

  return controller->screenshot_allowed();
}
#endif

DEFINE_USER_DATA(DataProtectionUIController);

DataProtectionUIController::DataProtectionUIController(
    BrowserView* browser_view)
    : browser_view_(browser_view),
      scoped_data_holder_(browser_view->browser()->GetUnownedUserDataHost(),
                          *this) {
  for (ContentsContainerView* contents_container_view :
       browser_view->GetContentsContainerViews()) {
    contents_view_data_protection_controllers_.push_back(
        std::make_unique<ContentsViewDataProtectionController>(
            this, contents_container_view,
            browser_view->GetProfile()->GetPrefs()));
  }
}

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
base::ScopedClosureRunner DataProtectionUIController::EnterAuxMutation() {
  ++aux_mutation_depth_;
  return base::ScopedClosureRunner(
      base::BindOnce(&DataProtectionUIController::LeaveAuxMutation,
                     aux_weak_factory_.GetWeakPtr()));
}

void DataProtectionUIController::LeaveAuxMutation() {
  CHECK_GT(aux_mutation_depth_, 0);
  --aux_mutation_depth_;
}

bool DataProtectionUIController::CanPrepareForAuxProfileSwitch(
    Profile* target) const {
  auto* window = browser_view_->browser();
  Profile* source = browser_view_->GetProfile();
  if (!target || !target->IsRegularProfile() || !source->IsRegularProfile() ||
      aux_profile_switch_prepared_ || aux_mutation_depth_ ||
      window->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      From(window) != this) {
    return false;
  }
  const auto containers = browser_view_->GetContentsContainerViews();
  if (containers.size() != contents_view_data_protection_controllers_.size()) {
    return false;
  }
  for (size_t index = 0; index < containers.size(); ++index) {
    const auto& controller = contents_view_data_protection_controllers_[index];
    if (controller->contents_container_view_ != containers[index] ||
        controller->prefs_ != source->GetPrefs()) {
      return false;
    }
    auto* contents = containers[index]->contents_view()->web_contents();
    if (contents &&
        (contents->GetBrowserContext() != source ||
         window->tab_strip_model()->GetIndexOfWebContents(contents) < 0)) {
      return false;
    }
  }
  return true;
}

void DataProtectionUIController::PrepareForAuxProfileSwitch(Profile* target) {
  CHECK(CanPrepareForAuxProfileSwitch(target));
  aux_source_profile_ = browser_view_->GetProfile()->GetWeakPtr();
  aux_target_profile_ = target->GetWeakPtr();
  aux_profile_switch_prepared_ = true;
  aux_profile_switch_rebound_ = false;
  for (const auto& controller : contents_view_data_protection_controllers_) {
    // Retire the actual source renderer callbacks, preserving per-tab policy,
    // the stable WebView attachment subscriptions and the current window mask.
    controller->OnWebContentsDetached(
        controller->contents_container_view_->contents_view());
  }
#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
  // Keep the real window protected until its genuine inserted tabs determine
  // the final policy. This does not alter any per-tab policy or OS grant.
  auto mutation = EnterAuxMutation();
  browser_view_->ApplyScreenshotSettings(false);
#endif
}

void DataProtectionUIController::RebindForAuxProfileSwitch() {
  CHECK(aux_profile_switch_prepared_);
  CHECK(!aux_profile_switch_rebound_);
  CHECK(!aux_mutation_depth_);
  CHECK(aux_target_profile_);
  CHECK_EQ(browser_view_->GetProfile(), aux_target_profile_.get());
  CHECK(browser_view_->browser()->tab_strip_model()->empty());
  for (const auto& controller : contents_view_data_protection_controllers_) {
    CHECK(
        !controller->contents_container_view_->contents_view()->web_contents());
    controller->prefs_ = aux_target_profile_->GetPrefs();
  }
  aux_profile_switch_rebound_ = true;
}

void DataProtectionUIController::FinishForAuxProfileSwitch() {
  CHECK(aux_profile_switch_prepared_);
  CHECK(aux_profile_switch_rebound_);
  CHECK(aux_target_profile_);
  CHECK_EQ(browser_view_->GetProfile(), aux_target_profile_.get());
  ResumeAuxProfileSources();
}

void DataProtectionUIController::AbortAuxProfileSwitch() {
  CHECK(aux_profile_switch_prepared_);
  CHECK(!aux_profile_switch_rebound_);
  CHECK(aux_source_profile_);
  CHECK_EQ(browser_view_->GetProfile(), aux_source_profile_.get());
  ResumeAuxProfileSources();
}

void DataProtectionUIController::ResumeAuxProfileSources() {
  CHECK(!aux_mutation_depth_);
  auto mutation = EnterAuxMutation();
  aux_profile_switch_prepared_ = false;
  // The core has inserted genuine target tabs or restored genuine source tabs.
  // Reattach to those exact per-tab navigation controllers and profile prefs.
  const auto weak_this = aux_weak_factory_.GetWeakPtr();
  for (const auto& controller : contents_view_data_protection_controllers_) {
    CHECK_EQ(controller->prefs_, browser_view_->GetProfile()->GetPrefs());
    auto* web_view = controller->contents_container_view_->contents_view();
    if (web_view->web_contents()) {
      controller->OnWebContentsAttached(web_view);
    } else {
      controller->contents_container_view_->ApplyWatermarkSettings(
          std::string(), enterprise_watermark::GetFillColor(controller->prefs_),
          enterprise_watermark::GetOutlineColor(controller->prefs_),
          enterprise_watermark::GetFontSize(controller->prefs_));
    }
    if (!weak_this) {
      return;
    }
  }
#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
  MaybeUpdateScreenshotSettings();
  if (!weak_this) {
    return;
  }
#endif
  aux_source_profile_.reset();
  aux_target_profile_.reset();
  aux_profile_switch_rebound_ = false;
}
#endif

// static
DataProtectionUIController* DataProtectionUIController::From(
    BrowserWindowInterface* browser_window_interface) {
  return ui::ScopedUnownedUserData<DataProtectionUIController>::Get(
      browser_window_interface->GetUnownedUserDataHost());
}

void DataProtectionUIController::ApplyWatermarkSettings(
    const std::string& watermark_text,
    SkColor fill_color,
    SkColor outline_color,
    int font_size) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (aux_profile_switch_prepared_) {
    return;
  }
  auto mutation = EnterAuxMutation();
#endif
  for (ContentsContainerView* contents_container_view :
       browser_view_->GetContentsContainerViews()) {
    contents_container_view->ApplyWatermarkSettings(watermark_text, fill_color,
                                                    outline_color, font_size);
  }
}

#if BUILDFLAG(ENTERPRISE_SCREENSHOT_PROTECTION)
void DataProtectionUIController::MaybeUpdateScreenshotSettings() {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (aux_profile_switch_prepared_) {
    return;
  }
  auto mutation = EnterAuxMutation();
#endif
  bool disallow_screenshot =
      std::any_of(contents_view_data_protection_controllers_.begin(),
                  contents_view_data_protection_controllers_.end(),
                  [](const std::unique_ptr<
                      enterprise_data_protection::DataProtectionUIController::
                          ContentsViewDataProtectionController>& controller) {
                    return !controller->GetScreenshotAllowed();
                  });

  browser_view_->ApplyScreenshotSettings(!disallow_screenshot);
}
#endif

DataProtectionUIController::~DataProtectionUIController() = default;

}  // namespace enterprise_data_protection
