// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_BUTTON_CONTROLLER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_BUTTON_CONTROLLER_H_

#include <string>

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "chrome/browser/profiles/profile_attributes_storage_observer.h"
#include "chrome/browser/ui/views/toolbar/avatar_toolbar_button_interface.h"
#include "components/prefs/pref_change_registrar.h"
#include "ui/base/models/image_model.h"
#include "ui/views/view_observer.h"

class AvatarToolbarButton;
class BrowserView;
class ProfileAttributesStorage;
namespace aux {
struct SidebarProfileButtonState {
  std::u16string display_name;
  bool auth_paused = false;
  ui::ImageModel avatar_image;
  int avatar_diameter = 22;
  bool show_monogram = false;
  bool profile_image = false;
};

// Owns the supplied profile button's real toolbar/profile observations.
class VerticalTabSidebarProfileButtonController
    : public AvatarToolbarButtonInterface::Observer,
      public views::ViewObserver,
      public ProfileAttributesStorageObserver {
 public:
  using StateChanged =
      base::RepeatingCallback<void(const SidebarProfileButtonState&)>;
  VerticalTabSidebarProfileButtonController(BrowserView* browser_view,
                                            views::View* view,
                                            StateChanged changed);
  ~VerticalTabSidebarProfileButtonController() override;
  // Call after actual toolbar/header attachment and completed profile rebind.
  void RefreshNow();
  void ScheduleSync();

 private:
  void BindSource();
  void DetachSource();
  void BindPreferences();
  void OnProfileChanged(const base::FilePath& path);
  void RunScheduledSync();
  void Retire();
  void OnAvatarToolbarButtonSourceInvalidated() override;
  void OnIconUpdated() override;
  void OnTextUpdated() override;
  void OnViewAddedToWidget(views::View* observed_view) override;
  void OnViewRemovedFromWidget(views::View* observed_view) override;
  void OnViewThemeChanged(views::View* observed_view) override;
  void OnViewIsDeleting(views::View* observed_view) override;
  void OnProfileNameChanged(const base::FilePath& path,
                            const std::u16string& old_name) override;
  void OnProfileAuthInfoChanged(const base::FilePath& path) override;
  void OnProfileAvatarChanged(const base::FilePath& path) override;
  void OnProfileHighResAvatarLoaded(const base::FilePath& path) override;

  const raw_ptr<BrowserView> browser_view_;
  raw_ptr<views::View> view_;
  raw_ptr<AvatarToolbarButton> source_ = nullptr;
  StateChanged changed_;
  bool sync_pending_ = false;
  bool retired_ = false;
  base::ScopedObservation<AvatarToolbarButtonInterface,
                          AvatarToolbarButtonInterface::Observer>
      avatar_observation_{this};
  base::ScopedObservation<views::View, views::ViewObserver>
      source_view_observation_{this};
  base::ScopedObservation<views::View, views::ViewObserver> view_observation_{
      this};
  base::ScopedObservation<ProfileAttributesStorage,
                          ProfileAttributesStorageObserver>
      attributes_observation_{this};
  PrefChangeRegistrar prefs_;
  base::WeakPtrFactory<VerticalTabSidebarProfileButtonController> weak_factory_{
      this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_BUTTON_CONTROLLER_H_
