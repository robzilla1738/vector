// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_PRESENTATION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_PRESENTATION_H_

#include <array>

#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/views/view_tracker.h"

namespace views {
class View;
}
namespace aux {

// Actual original4658294..4658304 order: custom pinned entries, stock pinned
// tab container, vertical scroll view, bottom container, bare spacer.
// The owner supplies real role-bound
// Views; this adapter never infers profile or view identity from visible text.
using ProfilePreviewSurfaces = std::array<views::View*, 5>;

// Presentation state owned by the actual VerticalTabStripRegionView. This
// creates no replacement UI, snapshot, preview host, or selection destination.
// The original ProfilePagePreviewPageView and its live-content child must
// exist before BindPreview. Their fallback-image UI is a separate owner path.
class ProfilePreviewPresentation {
 public:
  ProfilePreviewPresentation(views::View& owner,
                            ProfilePreviewSurfaces source,
                            views::View* top_boundary);
  ~ProfilePreviewPresentation();
  ProfilePreviewPresentation(const ProfilePreviewPresentation&) = delete;
  ProfilePreviewPresentation& operator=(const ProfilePreviewPresentation&) = delete;

  static gfx::Rect PreviewBounds(const views::View& owner,
                                ProfilePreviewSurfaces surfaces,
                                const views::View* top_boundary);

  // target_owner has undergone its real cached-region layout at owner size.
  // page/live_host are the existing original preview wrapper/live child.
  // Restores any previously borrowed target before borrowing this real target.
  bool BindPreview(views::View& target_owner,
                   ProfilePreviewSurfaces target,
                   const views::View* target_top_boundary,
                   views::View& page,
                   views::View& live_host,
                   int direction);
  // Original actual metadata-only page while target cache/load is absent.
  // It is still a genuine region-owned page, not a fabricated live borrow.
  bool BindFallback(views::View& page, int direction);
  void Update(float progress);
  void Reset(bool invalidate_before_restore);

  // The real async preview request restores THIS transaction before loading.
  ProfilePreviewViews& borrowed_views() { return borrowed_; }

 private:
  views::ViewTracker owner_;
  std::array<views::ViewTracker, 5> source_;
  views::ViewTracker top_boundary_;
  views::ViewTracker page_;
  ProfilePreviewViews borrowed_;
  int direction_ = 0;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_PRESENTATION_H_
