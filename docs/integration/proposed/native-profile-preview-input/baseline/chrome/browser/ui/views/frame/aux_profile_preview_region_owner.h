// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_REGION_OWNER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_REGION_OWNER_H_

#include <map>
#include <set>

#include "base/files/file_path.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_presentation.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_request.h"
#include "ui/views/view_tracker.h"

class Browser;
class Profile;
class ProfileManager;
class VerticalTabStripRegionView;
namespace aux {
class ProfilePagePreviewPageView;

// Real same-region page/cache/presentation/request owner. The original input
// controller supplies direction/progress and actual frame settlement; this
// class does not synthesize gestures, screenshots, windows or success.
class ProfilePreviewRegionOwner {
 public:
  ProfilePreviewRegionOwner(BrowserWindowInterface& browser, VerticalTabStripRegionView& region);
  ~ProfilePreviewRegionOwner();
  ProfilePreviewRegionOwner(const ProfilePreviewRegionOwner&) = delete;
  ProfilePreviewRegionOwner& operator=(const ProfilePreviewRegionOwner&) = delete;

  bool Begin(const base::FilePath& target, int direction);
  void Update(float progress);
  void OnPreviewFrame();
  bool Commit(ProfileSwitchRequest::Completion completion);
  void Cancel();

 private:
  ProfilePagePreviewPageView* GetPage(const base::FilePath& target);
  bool PopulatePage(ProfilePagePreviewPageView& page,
                    const base::FilePath& target);
  void RequestPrewarm(const base::FilePath& target);
  void OnPrewarmed(base::WeakPtr<ProfileManager> manager,
                   base::FilePath target, Profile* loaded);
  void Complete(ProfileSwitchRequest::Completion completion, Browser* result);

  base::WeakPtr<BrowserWindowInterface> browser_;
  views::ViewTracker region_;
  ProfilePreviewPresentation presentation_;
  ProfileSwitchRequest request_;
  std::map<base::FilePath, views::ViewTracker> pages_;
  base::FilePath target_;
  int direction_ = 0;
  float progress_ = 0;
  std::set<base::FilePath> pending_prewarm_;
  bool committing_ = false;
  base::WeakPtrFactory<ProfilePreviewRegionOwner> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_REGION_OWNER_H_
