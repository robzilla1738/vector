// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_HEADER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_HEADER_H_

#include <memory>
#include <optional>

#include "base/memory/raw_ptr.h"
#include "chrome/browser/ui/views/frame/aux_profile_page_indicator.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/view.h"

class BrowserView;
namespace aux {
class ProfileSearchButton;
class VerticalTabSidebarProfileButton;
class VerticalTabSidebarProfileButtonController;

// The original plain region+5a8 parent, in child order598,5e0,5a0.
class VerticalTabSidebarProfileHeader : public views::View {
  METADATA_HEADER(VerticalTabSidebarProfileHeader, views::View)
 public:
  struct HeldChildBounds {
    gfx::Rect profile;
    gfx::Rect pager;
    gfx::Rect search;
  };
  VerticalTabSidebarProfileHeader(
      BrowserView& browser_view,
      views::Button::PressedCallback profile_pressed,
      views::Button::PressedCallback search_pressed,
      ProfilePageIndicator::SelectProfile select,
      ProfilePageIndicator::ShowProfileContext context,
      base::RepeatingCallback<bool()> preview_idle);
  ~VerticalTabSidebarProfileHeader() override;

  VerticalTabSidebarProfileButton* profile_button() const { return profile_; }
  ProfileSearchButton* search_button() const { return search_; }
  ProfilePageIndicator* pager() const { return pager_; }
  // The region owns the distinct source presentation, eligibility and held
  // geometry decisions. No width-derived collapse policy lives in this leaf.
  void SetPresentation(bool compact,
                       bool label_suppressed,
                       std::optional<int> profile_width_limit,
                       bool pager_collapsed,
                       std::optional<bool> held_pager_visibility);
  void SetHeldChildBounds(std::optional<HeldChildBounds> bounds);
  // Actual toolbar attachment/completed profile rebind and roster changes.
  void RefreshNow();
  void Layout(PassKey) override;
  void AddedToWidget() override;

 private:
  raw_ptr<VerticalTabSidebarProfileButton> profile_;
  raw_ptr<ProfilePageIndicator> pager_;
  raw_ptr<ProfileSearchButton> search_;
  std::optional<HeldChildBounds> held_bounds_;
  std::unique_ptr<VerticalTabSidebarProfileButtonController> controller_;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_HEADER_H_
