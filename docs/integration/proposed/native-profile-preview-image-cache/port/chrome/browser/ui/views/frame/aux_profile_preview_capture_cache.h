// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_CAPTURE_CACHE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_CAPTURE_CACHE_H_

#include <array>
#include <map>
#include <optional>
#include <set>

#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/gfx/image/image_skia.h"
#include "ui/views/view_tracker.h"

class BrowserWindowInterface;
namespace gfx { class Image; }
namespace aux {

// Genuine region layout, after its own layout pass. The original controller
// supplies this only while gesture/commit/settlement are idle and its actual
// collapsed/hover/expansion geometry satisfies the recovered151px guard.
// header is the original+5a8 container (header+598 and search+5a0), NOT an
// arbitrary top bar or the entire Sidebar. Missing roles are not substituted.
struct ProfilePreviewCaptureGeometry {
  gfx::Rect bounds;
  raw_ptr<views::View> header = nullptr;
  raw_ptr<views::View> scroll = nullptr;
  std::array<raw_ptr<views::View>, 3> optional_content = {};
};

// Ports original4659080 /4680e80 /46814f0. Capture is real own-window native
// GrabViewSnapshot. No background service, target execution or model image.
// Deliberately unconnected until the original region header/layout owner is
// restored: a null geometry callback result retries, never captures another UI.
class ProfilePreviewCaptureCache {
 public:
  using Geometry = base::RepeatingCallback<
      std::optional<ProfilePreviewCaptureGeometry>()>;
  ProfilePreviewCaptureCache(BrowserWindowInterface& browser,
                            views::View& region, Geometry geometry);
  ~ProfilePreviewCaptureCache();
  ProfilePreviewCaptureCache(const ProfilePreviewCaptureCache&) = delete;
  ProfilePreviewCaptureCache& operator=(const ProfilePreviewCaptureCache&) = delete;

  void Request(base::TimeDelta delay);
  gfx::ImageSkia Find(const base::FilePath& path) const;

 private:
  bool IsCurrent(const base::FilePath& path) const;
  void Schedule(base::FilePath path, base::TimeDelta delay, int attempt);
  void Capture(base::FilePath path, int attempt);
  void OnCaptured(base::FilePath path, int attempt, gfx::Image image);

  base::WeakPtr<BrowserWindowInterface> browser_;
  views::ViewTracker region_;
  Geometry geometry_;
  std::set<base::FilePath> pending_;
  std::map<base::FilePath, gfx::ImageSkia> images_;
  base::WeakPtrFactory<ProfilePreviewCaptureCache> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_CAPTURE_CACHE_H_
