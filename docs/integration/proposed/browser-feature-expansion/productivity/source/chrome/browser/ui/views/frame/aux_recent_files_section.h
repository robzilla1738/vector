// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_RECENT_FILES_SECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_RECENT_FILES_SECTION_H_
#include <set>
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_section_view.h"
#include "components/download/public/common/download_item.h"
#include "components/prefs/pref_change_registrar.h"
#include "content/public/browser/download_manager.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
class BrowserWindowInterface;
class Profile;
namespace user_prefs { class PrefRegistrySyncable; }
namespace aux {
class AuxSectionClipView;
// Actual profile downloads, using the supplied sidebar section/row vocabulary.
// No directory scan, owner-global file history, or renderer-provided paths.
class AuxRecentFilesSection final : public AuxSectionView,
                                   public gfx::AnimationDelegate,
                                   public content::DownloadManager::Observer,
                                   public download::DownloadItem::Observer {
  METADATA_HEADER(AuxRecentFilesSection, AuxSectionView)
 public:
  static void RegisterPrefs(user_prefs::PrefRegistrySyncable*);
  explicit AuxRecentFilesSection(BrowserWindowInterface&);
  ~AuxRecentFilesSection() override;
  void PauseProfileObservation();
  void BindBrowser(BrowserWindowInterface&);
 private:
  void Toggle();
  void PreferenceChanged();
  void ScheduleRefresh();
  void Refresh();
  void ApplyHeight();
  void Reveal(const std::string& guid);
  void Drag(const std::string& guid);
  void OnDownloadCreated(content::DownloadManager*, download::DownloadItem*) override;
  void OnManagerInitialized() override;
  void ManagerGoingDown(content::DownloadManager*) override;
  void OnDownloadUpdated(download::DownloadItem*) override;
  void OnDownloadRemoved(download::DownloadItem*) override;
  void OnDownloadDestroyed(download::DownloadItem*) override;
  void AnimationProgressed(const gfx::Animation*) override;
  void AnimationEnded(const gfx::Animation*) override;
  void AnimationCanceled(const gfx::Animation*) override;
  base::WeakPtr<Profile> profile_;
  raw_ptr<content::DownloadManager> manager_ = nullptr;
  std::set<download::DownloadItem*> observed_;
  PrefChangeRegistrar prefs_;
  raw_ptr<views::View> rows_ = nullptr;
  raw_ptr<AuxSectionClipView> clip_ = nullptr;
  int row_count_ = 0;
  bool expanded_ = true;
  bool refresh_pending_ = false;
  gfx::SlideAnimation animation_{this};
  base::WeakPtrFactory<AuxRecentFilesSection> weak_factory_{this};
};
}  // namespace aux
#endif
