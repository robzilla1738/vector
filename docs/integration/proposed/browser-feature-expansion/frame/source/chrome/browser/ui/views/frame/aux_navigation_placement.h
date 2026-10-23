// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NAVIGATION_PLACEMENT_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NAVIGATION_PLACEMENT_H_

#include <cstddef>

#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_frame_presentation_state.h"
#include "ui/views/view_tracker.h"

namespace aux {

// BrowserView owns this controller and supplies the genuine ToolbarView as
// navigation. No duplicate editor, URL model, history or security UI is made.
// Hosts and navigation remain view-hierarchy-owned. The controller observes
// destruction and never resurrects a detached view during teardown.
class AuxNavigationPlacement {
 public:
  enum class Result {
    kUnchanged,
    kMoved,
    kDeferred,
    kInsufficientWidth,
    kUnavailable,
  };

  AuxNavigationPlacement(views::View& navigation, views::View& top_host,
                         views::View& sidebar_host);
  AuxNavigationPlacement(const AuxNavigationPlacement&) = delete;
  AuxNavigationPlacement& operator=(const AuxNavigationPlacement&) = delete;
  ~AuxNavigationPlacement();

  // Invoke outside a layout traversal, after actual focus/menu/drag/collapse
  // state changes. available_sidebar_width is the post-inset host allocation,
  // not a preference/desired width. Zero means it is not ready for docking.
  // Actual focus is rechecked here, even if a caller omitted the input bit.
  Result Update(FramePresentationInputs inputs, int available_sidebar_width);
  const FramePresentationState& state() const { return state_; }

  // The root must restore before removing/replacing the sidebar host. This is
  // a normal guarded update: active editing/menu/drag may defer it. Teardown
  // must not destroy a host holding the genuine toolbar while this is pending.
  Result RestoreToTop(FramePresentationInputs inputs);

 private:
  views::ViewTracker navigation_;
  views::ViewTracker top_host_;
  views::ViewTracker sidebar_host_;
  const size_t top_index_;
  FramePresentationState state_;
  bool updating_ = false;
  base::WeakPtrFactory<AuxNavigationPlacement> weak_factory_{this};
};

}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NAVIGATION_PLACEMENT_H_
