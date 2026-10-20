// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_header.h"

#include <algorithm>
#include <utility>

#include "base/functional/bind.h"
#include "chrome/browser/ui/views/frame/aux_profile_search_button.h"
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button.h"
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button_controller.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/compositor/layer.h"
#include "ui/gfx/geometry/insets.h"
#include "ui/views/border.h"

namespace aux {
VerticalTabSidebarProfileHeader::VerticalTabSidebarProfileHeader(
    BrowserView& browser_view,
    views::Button::PressedCallback profile_pressed,
    views::Button::PressedCallback search_pressed,
    ProfilePageIndicator::SelectProfile select,
    ProfilePageIndicator::ShowProfileContext context,
    base::RepeatingCallback<bool()> preview_idle) {
  SetBorder(views::CreateEmptyBorder(gfx::Insets::TLBR(5, 4, 5, 8)));
  SetPreferredSize(gfx::Size(0, 42));
  SetPaintToLayer();
  layer()->SetFillsBoundsOpaquely(false);
  layer()->SetMasksToBounds(true);
  profile_ = AddChildView(std::make_unique<VerticalTabSidebarProfileButton>(
      std::move(profile_pressed)));
  profile_->SetLabelSuppressed(true);
  pager_ = AddChildView(std::make_unique<ProfilePageIndicator>(
      browser_view, std::move(select), std::move(context),
      std::move(preview_idle)));
  search_ = AddChildView(
      std::make_unique<ProfileSearchButton>(std::move(search_pressed)));
  controller_ = std::make_unique<VerticalTabSidebarProfileButtonController>(
      &browser_view, profile_,
      base::BindRepeating(
          [](VerticalTabSidebarProfileButton* button,
             const SidebarProfileButtonState& state) {
            button->SetDisplayName(state.display_name, state.auth_paused);
            button->SetAvatarImage(state.avatar_image, state.avatar_diameter,
                                   state.show_monogram, state.profile_image);
          },
          base::Unretained(profile_.get())));
}

VerticalTabSidebarProfileHeader::~VerticalTabSidebarProfileHeader() {
  controller_.reset();
  pager_->Retire();
}

void VerticalTabSidebarProfileHeader::SetPresentation(
    bool compact,
    bool label_suppressed,
    std::optional<int> profile_width_limit,
    bool pager_collapsed,
    std::optional<bool> held_pager_visibility) {
  profile_->SetCompact(compact);
  profile_->SetLabelSuppressed(label_suppressed);
  profile_->SetWidthLimit(profile_width_limit);
  search_->SetVisible(!compact);
  pager_->SetPresentation(pager_collapsed, held_pager_visibility);
}

void VerticalTabSidebarProfileHeader::SetHeldChildBounds(
    std::optional<HeldChildBounds> bounds) {
  held_bounds_ = std::move(bounds);
  InvalidateLayout();
}

void VerticalTabSidebarProfileHeader::RefreshNow() {
  controller_->RefreshNow();
  pager_->Refresh();
  pager_->RefreshAccountMetadata();
}

void VerticalTabSidebarProfileHeader::AddedToWidget() {
  views::View::AddedToWidget();
  RefreshNow();
}

void VerticalTabSidebarProfileHeader::Layout(PassKey) {
  if (held_bounds_) {
    if (profile_->parent() == this)
      profile_->SetBoundsRect(held_bounds_->profile);
    if (pager_->parent() == this)
      pager_->SetBoundsRect(held_bounds_->pager);
    if (search_->parent() == this)
      search_->SetBoundsRect(held_bounds_->search);
    return;
  }
  const gfx::Rect contents = GetContentsBounds();
  const bool has_profile = profile_->parent() == this && profile_->GetVisible();
  const bool owns_search = search_->parent() == this && search_->GetVisible();
  const gfx::Size profile_size =
      has_profile ? profile_->GetPreferredSize() : gfx::Size();
  const gfx::Size search_size =
      owns_search ? search_->GetPreferredSize() : gfx::Size();
  const int center_y = contents.y() + contents.height() / 2;
  const bool has_search = search_size.width() > 0 && search_size.height() > 0;
  const int profile_x =
      pager_->GetVisible() || has_search
          ? contents.x()
          : contents.x() + contents.width() / 2 - profile_size.width() / 2;
  if (has_profile)
    profile_->SetBounds(profile_x, center_y - profile_size.height() / 2,
                        profile_size.width(), profile_size.height());
  if (owns_search)
    search_->SetBounds(contents.right() - search_size.width(),
                       center_y - search_size.height() / 2, search_size.width(),
                       search_size.height());
  const int edge = std::max(profile_size.width(), search_size.width());
  if (pager_->parent() == this && pager_->GetVisible())
    pager_->SetBounds(contents.x() + edge,
                      std::max(contents.y(), height() - 32),
                      std::max(0, contents.width() - 2 * edge), 24);
}

BEGIN_METADATA(VerticalTabSidebarProfileHeader)
END_METADATA
}  // namespace aux
