// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/tabs/common/tab_strip_utils.h"

#include "chrome/browser/ui/views/tabs/common/tab_collection_animating_layout_manager.h"
#include "chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_view.h"
#include "ui/views/view.h"
#include "ui/views/view_utils.h"

gfx::Rect GetTabStripViewTargetBounds(const views::View* view) {
  CHECK(view);

  const views::View* const parent = view->parent();
  if (!parent || !parent->GetProperty(kHasAnimatingLayoutManagerKey)) {
    return view->bounds();
  }

  const auto* const layout_manager =
      static_cast<const TabCollectionAnimatingLayoutManager*>(
          parent->GetLayoutManager());
  CHECK(layout_manager);

  const views::ChildLayout* const view_layout =
      layout_manager->target_layout().GetLayoutFor(view);
  return view_layout ? view_layout->bounds : view->bounds();
}

TabStripView* GetTabStripView(views::View* view) {
  for (views::View* v = view->parent(); v; v = v->parent()) {
    if (auto* tab_strip = views::AsViewClass<TabStripView>(v)) {
      return tab_strip;
    }
    // Original41253d8..420 checks the real pinned container's owner when the
    // source region has moved it outside the scrolling TabStripView subtree.
    if (auto* pins = views::AsViewClass<PinnedTabContainerView>(v);
        pins && pins->tab_strip_view_owner()) {
      return pins->tab_strip_view_owner();
    }
  }
  return nullptr;
}
