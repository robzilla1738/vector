// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button_controller.h"

#include <optional>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profiles_state.h"
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/profiles/avatar_toolbar_button.h"
#include "chrome/browser/ui/views/toolbar/toolbar_view.h"
#include "components/prefs/pref_service.h"
#include "skia/ext/image_operations.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/image/image_skia_operations.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
// Original profile-local key, isolated by Aux's actual profile directory.
constexpr char kAuthPaused[] = "aux.account_auth_paused";
ProfileAttributesEntry* GetEntry(Profile* profile,
                                 ProfileAttributesStorage* storage) {
  return storage ? storage->GetProfileAttributesWithPath(
                       profile->GetOriginalProfile()->GetPath())
                 : nullptr;
}
std::u16string GetDisplayName(Profile* profile,
                              AvatarToolbarButton* source,
                              ProfileAttributesStorage* storage) {
  if (profile->IsOffTheRecord() || profile->IsGuestSession()) {
    if (source && !source->GetText().empty()) {
      return std::u16string(source->GetText());
    }
    return profiles::GetAvatarNameForProfile(
        profile->GetOriginalProfile()->GetPath());
  }
  auto* entry = GetEntry(profile, storage);
  return entry ? entry->GetName() : std::u16string();
}
}  // namespace

VerticalTabSidebarProfileButtonController::
    VerticalTabSidebarProfileButtonController(BrowserView* browser_view,
                                              views::View* view,
                                              StateChanged changed)
    : browser_view_(browser_view), view_(view), changed_(std::move(changed)) {
  CHECK(browser_view_);
  CHECK(view_);
  CHECK(changed_);
  view_observation_.Observe(view_);
  if (auto* manager = g_browser_process->profile_manager()) {
    attributes_observation_.Observe(&manager->GetProfileAttributesStorage());
  }
  BindPreferences();
}
VerticalTabSidebarProfileButtonController::
    ~VerticalTabSidebarProfileButtonController() {
  Retire();
}
void VerticalTabSidebarProfileButtonController::Retire() {
  if (retired_)
    return;
  retired_ = true;
  weak_factory_.InvalidateWeakPtrs();
  sync_pending_ = false;
  DetachSource();
  view_observation_.Reset();
  attributes_observation_.Reset();
  prefs_.Reset();
  view_ = nullptr;
  changed_.Reset();
}
void VerticalTabSidebarProfileButtonController::DetachSource() {
  avatar_observation_.Reset();
  source_view_observation_.Reset();
  source_ = nullptr;
}
void VerticalTabSidebarProfileButtonController::BindSource() {
  auto* toolbar = browser_view_->toolbar();
  auto* source = toolbar ? toolbar->avatar_toolbar_button() : nullptr;
  if (source && !source->GetWidget())
    source = nullptr;
  if (source_ == source)
    return;
  DetachSource();
  source_ = source;
  if (source_) {
    avatar_observation_.Observe(source_);
    source_view_observation_.Observe(source_);
  }
}
void VerticalTabSidebarProfileButtonController::BindPreferences() {
  Profile* profile = browser_view_->GetProfile();
  PrefService* prefs =
      profile->IsOffTheRecord() ? nullptr : profile->GetPrefs();
  if (prefs_.prefs() == prefs)
    return;
  prefs_.Reset();
  if (prefs) {
    prefs_.Init(prefs);
    // A partially integrated profile may not have the actual producer yet.
    if (prefs->FindPreference(kAuthPaused)) {
      prefs_.Add(kAuthPaused,
                 base::BindRepeating(
                     &VerticalTabSidebarProfileButtonController::ScheduleSync,
                     weak_factory_.GetWeakPtr()));
    }
  }
}
void VerticalTabSidebarProfileButtonController::ScheduleSync() {
  if (retired_ || sync_pending_)
    return;
  sync_pending_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE,
      base::BindOnce(
          &VerticalTabSidebarProfileButtonController::RunScheduledSync,
          weak_factory_.GetWeakPtr()));
}
void VerticalTabSidebarProfileButtonController::RunScheduledSync() {
  sync_pending_ = false;
  if (!retired_ && view_->GetWidget())
    RefreshNow();
}
void VerticalTabSidebarProfileButtonController::RefreshNow() {
  if (retired_)
    return;
  BindSource();
  BindPreferences();
  auto* profile = browser_view_->GetProfile();
  auto* storage = attributes_observation_.GetSource();
  auto* entry = GetEntry(profile, storage);
  SidebarProfileButtonState state;
  state.display_name = GetDisplayName(profile, source_, storage);
  auto* prefs = profile->GetPrefs();
  state.auth_paused = prefs && prefs->FindPreference(kAuthPaused) &&
                      prefs->GetBoolean(kAuthPaused);
  const auto* widget = view_->GetWidget();
  const bool dark = widget && widget->GetColorMode() ==
                                  ui::ColorProviderKey::ColorMode::kDark;
  const SkColor foreground = dark ? 0xd9fafafa : 0xd90a0a0a;
  const auto model = source_
                         ? source_->GetImageModel(views::Button::STATE_NORMAL)
                         : std::nullopt;
  if (model && model->IsImage() && !model->GetImage().IsEmpty()) {
    state.profile_image = true;
    state.avatar_diameter = 20;
    const bool gaia_image =
        entry && entry->IsUsingGAIAPicture() && entry->GetGAIAPicture();
    state.show_monogram =
        !gaia_image && entry && entry->GetAvatarIconIndex() == 26;
    if (!state.show_monogram) {
      state.avatar_image = *model;
      const gfx::Size size(20, 20);
      if (model->Size() != size) {
        state.avatar_image = ui::ImageModel::FromImageSkia(
            gfx::ImageSkiaOperations::CreateResizedImage(
                *model->GetImage().ToImageSkia(),
                skia::ImageOperations::RESIZE_BEST, size));
      }
    }
  } else if (model && model->IsVectorIcon() &&
             !model->GetVectorIcon().is_empty()) {
    state.avatar_image = ui::ImageModel::FromVectorIcon(
        *model->GetVectorIcon().vector_icon(), foreground, 22);
  } else {
    const auto glyph =
        profile->IsGuestSession()
            ? SidebarProfileGlyph::kGuest
            : (profile->IsOffTheRecord() ? SidebarProfileGlyph::kIncognito
                                         : SidebarProfileGlyph::kAccount);
    state.avatar_image = ui::ImageModel::FromVectorIcon(
        SidebarProfileVectorIcon(glyph), foreground, 22);
  }
  changed_.Run(state);
}
void VerticalTabSidebarProfileButtonController::
    OnAvatarToolbarButtonSourceInvalidated() {
  DetachSource();
}
void VerticalTabSidebarProfileButtonController::OnIconUpdated() {
  RefreshNow();
}
void VerticalTabSidebarProfileButtonController::OnTextUpdated() {
  RefreshNow();
}
void VerticalTabSidebarProfileButtonController::OnViewAddedToWidget(
    views::View* view) {
  if (view == view_)
    ScheduleSync();
}
void VerticalTabSidebarProfileButtonController::OnViewRemovedFromWidget(
    views::View* view) {
  if (view == source_) {
    DetachSource();
    if (view_->GetWidget())
      ScheduleSync();
  }
}
void VerticalTabSidebarProfileButtonController::OnViewThemeChanged(
    views::View* view) {
  if (view == view_)
    ScheduleSync();
}
void VerticalTabSidebarProfileButtonController::OnViewIsDeleting(
    views::View* view) {
  if (view == view_) {
    Retire();
  } else if (view == source_) {
    DetachSource();
    if (view_->GetWidget())
      ScheduleSync();
  }
}
void VerticalTabSidebarProfileButtonController::OnProfileChanged(
    const base::FilePath& path) {
  if (!retired_ &&
      path == browser_view_->GetProfile()->GetOriginalProfile()->GetPath()) {
    ScheduleSync();
  }
}
void VerticalTabSidebarProfileButtonController::OnProfileNameChanged(
    const base::FilePath& path,
    const std::u16string& old_name) {
  OnProfileChanged(path);
}
void VerticalTabSidebarProfileButtonController::OnProfileAuthInfoChanged(
    const base::FilePath& path) {
  OnProfileChanged(path);
}
void VerticalTabSidebarProfileButtonController::OnProfileAvatarChanged(
    const base::FilePath& path) {
  OnProfileChanged(path);
}
void VerticalTabSidebarProfileButtonController::OnProfileHighResAvatarLoaded(
    const base::FilePath& path) {
  OnProfileChanged(path);
}
}  // namespace aux
