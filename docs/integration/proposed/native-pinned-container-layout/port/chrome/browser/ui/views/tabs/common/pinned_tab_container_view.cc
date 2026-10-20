// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h"

#include <algorithm>
#include <cmath>
#include <vector>

#include "base/check.h"
#include "base/i18n/rtl.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/tabs/features.h"
#include "chrome/browser/ui/tabs/tab_style.h"
#include "chrome/browser/ui/views/tabs/common/dragged_tabs_container.h"
#include "chrome/browser/ui/views/tabs/common/split_tab_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_collection_animating_layout_manager.h"
#include "chrome/browser/ui/views/tabs/common/tab_collection_node.h"
#include "chrome/browser/ui/views/tabs/common/tab_drag_handler.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_collection_controller.h"
#include "chrome/browser/ui/views/tabs/common/tab_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_utils.h"
#include "content/public/browser/navigation_controller.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/layout/delegating_layout_manager.h"
#include "ui/views/layout/layout_types.h"
#include "ui/views/layout/proposed_layout.h"
#include "ui/views/view.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/view_utils.h"

namespace {
constexpr int kTabPadding = 4;
// Original pinned layout4111340: six-DIP gaps and at most four columns.
constexpr int kProvidedPinnedGap = 6;
constexpr int kProvidedPinnedMinWidth = 32;
constexpr int kProvidedPinnedHeight = 40;
constexpr int kProvidedPinnedHorizontalPadding = 8;
}  // namespace

PinnedTabContainerView::PinnedTabContainerView(
    TabCollectionNode* collection_node)
    : DraggedTabsContainer(
          static_cast<views::View&>(*this),
          collection_node,
          collection_node && collection_node->orientation() ==
                                 TabStripOrientation::kHorizontal
              ? DragAxes::kHorizontalOnly
              : DragAxes::kBoth,
          collection_node && collection_node->orientation() ==
                                 TabStripOrientation::kHorizontal
              ? DragLayout::kHorizontal
              : DragLayout::kSquash),
      collection_node_(collection_node),
      layout_manager_(*SetLayoutManager(std::make_unique<
                                        TabCollectionAnimatingLayoutManager>(
          std::make_unique<views::DelegatingLayoutManager>(this),
          *this,
          collection_node && collection_node->orientation() ==
                                 TabStripOrientation::kHorizontal
              ? TabCollectionAnimatingLayoutManager::AnimationAxis::kHorizontal
              : TabCollectionAnimatingLayoutManager::AnimationAxis::
                    kHorizontalWrappingVertically))) {
  collection_node->set_remove_child_from_node(base::BindRepeating(
      &TabCollectionAnimatingLayoutManager::AnimateAndDestroyChildView,
      base::Unretained(base::to_address(layout_manager_))));
  collection_node->set_attach_child_to_node(base::BindRepeating(
      &TabCollectionAnimatingLayoutManager::AnimateAndReparentView,
      base::Unretained(&layout_manager_.get())));

  node_destroyed_subscription_ = collection_node_->RegisterWillDestroyCallback(
      base::BindOnce(&PinnedTabContainerView::ResetCollectionNode,
                     base::Unretained(this)));

  if (collection_node_->orientation() == TabStripOrientation::kVertical) {
    if (auto* state_controller =
            collection_node_->GetController()->GetStateController()) {
      OnCollapseStateChanged(state_controller->GetCollapseState());
      collapsed_state_changed_subscription_ =
          state_controller->RegisterOnCollapseChanged(base::BindRepeating(
              &PinnedTabContainerView::OnCollapseStateChanged,
              base::Unretained(this)));
    }
  }
}

PinnedTabContainerView::~PinnedTabContainerView() = default;

views::ProposedLayout PinnedTabContainerView::CalculateProposedLayout(
    const views::SizeBounds& size_bounds) const {
  if (!collection_node_) return {};
  if (collection_node_ &&
      collection_node_->orientation() == TabStripOrientation::kHorizontal) {
    return CalculateHorizontalLayout(size_bounds);
  }
  return CalculateVerticalLayout(size_bounds);
}

gfx::Size PinnedTabContainerView::GetMinimumSize() const {
  if (!collection_node_ ||
      (collection_node_->GetDirectChildren().empty() && !show_empty_placeholder_)) {
    return gfx::Size();
  }

  if (collection_node_->orientation() == TabStripOrientation::kHorizontal) {
    int min_width = 0;
    size_t count = 0;
    for (const auto* child : collection_node_->GetDirectChildren()) {
      if (!layout_manager_->CanBeVisible(child)) {
        continue;
      }
      auto drag_data = GetVisualDataForDraggedView(*child);
      if (drag_data && drag_data->should_hide) {
        continue;
      }
      min_width += child->GetMinimumSize().width();
      count++;
    }
    const int tab_overlap = TabStyle::Get()->GetTabOverlap();
    if (count > 1) {
      min_width =
          std::max(0, min_width - static_cast<int>(count - 1) * tab_overlap);
    }
    return gfx::Size(min_width, TabStyle::Get()->GetStandardHeight());
  }

  const int count = std::max(
      static_cast<int>(collection_node_->GetDirectChildren().size()),
      show_empty_placeholder_ ? 1 : 0);
  const double rows = std::min(static_cast<double>(count),
      GetEffectiveCollapseState() == tabs::VerticalTabStripCollapseState::kExpanded
          ? 1.0 : 1.5);
  return gfx::Size(kProvidedPinnedMinWidth,
      static_cast<int>(std::ceil(rows * kProvidedPinnedHeight +
          std::max(rows - 1.0, 0.0) * kProvidedPinnedGap)));
}

bool PinnedTabContainerView::IsDragging() const {
  if (!collection_node_ || !collection_node_->GetController()) {
    return false;
  }
  return GetDragHandler().IsDragging();
}

bool PinnedTabContainerView::IsViewDragging(
    const views::View& child_view) const {
  if (!collection_node_ || !collection_node_->GetController()) {
    return false;
  }
  return GetDragHandler().IsViewDragging(child_view);
}

bool PinnedTabContainerView::ShouldAnimateOpacityForAddAndRemove(
    const views::View& child_view) const {
  if (collection_node_ &&
      collection_node_->orientation() == TabStripOrientation::kHorizontal) {
    return false;
  }
  // Only animate opacity for tab views.
  return views::IsViewClass<TabView>(&child_view);
}

bool PinnedTabContainerView::ShouldSnapToTarget(
    const views::View& child_view) const {
  return views::IsViewClass<SplitTabView>(&child_view);
}

std::optional<BrowserRootView::DropIndex>
PinnedTabContainerView::GetLinkDropIndex(const gfx::Point& loc_in_container) {
  if (!collection_node_ || collection_node_->children().size() == 0) {
    return std::nullopt;
  }

  if (collection_node_->orientation() == TabStripOrientation::kHorizontal) {
    if (auto index = GetLinkDropIndexForHorizontal(loc_in_container)) {
      return index;
    }
  } else {
    auto collapse_state = GetEffectiveCollapseState();
    if (collapse_state != tabs::VerticalTabStripCollapseState::kExpanded) {
      if (auto index = GetLinkDropIndexForCollapsed(loc_in_container)) {
        return index;
      }
    } else if (auto index = GetLinkDropIndexForExpanded(loc_in_container)) {
      return index;
    }
  }

  // Fallback to the end of the pinned container.
  return GetDragHandler().GetLinkDropIndexForNode(
      *collection_node_->children().back(), DragPositionHint::kAfter);
}

std::optional<BrowserRootView::DropIndex>
PinnedTabContainerView::GetLinkDropIndexForHorizontal(
    const gfx::Point& loc_in_container) {
  const bool is_vertical =
      collection_node_->orientation() == TabStripOrientation::kVertical;
  const int padding = is_vertical ? kTabPadding : 0;
  const int logical_x = GetMirroredXInView(loc_in_container.x());

  for (auto& child_node : collection_node_->children()) {
    auto* view = child_node->view();
    CHECK(view);

    // In vertical orientation, check if the current point is within the
    // vertical bounds of the row this child belongs to.
    if (is_vertical &&
        loc_in_container.y() >= view->bounds().bottom() + padding / 2) {
      continue;
    }

    // If the point is to the right of the child, then let the next child
    // be the candidate.
    // For vertical multi-row grids, the full padding amount is used here,
    // rather than half as done above for row bottom bounds, so that this
    // correctly accounts for the last tab in the row.
    // The x-based calculation uses a margin to determine if the link should
    // be inserted before/after, so the cutoff point between tabs in a row
    // doesn't have to be exact.
    if (logical_x >= view->bounds().right() + padding) {
      continue;
    }

    gfx::Point loc_in_child =
        views::View::ConvertPointToTarget(this, view, loc_in_container);

    constexpr double kDragOverMargins = 0.2;
    std::optional<DragPositionHint> hint;

    const int logical_x_in_child = view->GetMirroredXInView(loc_in_child.x());

    // Determine whether the drag is to the right, left, or over the tab/tab
    // split.
    if (logical_x_in_child < view->width() * kDragOverMargins) {
      hint = DragPositionHint::kBefore;
    } else if (logical_x_in_child > view->width() * (1 - kDragOverMargins)) {
      hint = DragPositionHint::kAfter;
    } else if (child_node->type() == TabCollectionNode::Type::SPLIT) {
      // If landing in the middle of the split, let the split view decide
      // which tab to replace.
      auto* split_view = views::AsViewClass<SplitTabView>(view);
      gfx::Point loc_in_split =
          views::View::ConvertPointToTarget(this, split_view, loc_in_container);
      return split_view->GetLinkDropIndex(loc_in_split);
    } else {
      hint = std::nullopt;
    }
    return GetDragHandler().GetLinkDropIndexForNode(*child_node, hint);
  }

  return std::nullopt;
}

std::optional<BrowserRootView::DropIndex>
PinnedTabContainerView::GetLinkDropIndexForCollapsed(
    const gfx::Point& loc_in_container) {
  // While collapsed, simply use the y-coordinate, similar to the unpinned
  // container.
  for (auto& child_node : collection_node_->children()) {
    auto* view = child_node->view();
    CHECK(view);
    if (loc_in_container.y() >= view->bounds().bottom()) {
      continue;
    }

    gfx::Point loc_in_child =
        views::View::ConvertPointToTarget(this, view, loc_in_container);
    constexpr double kDragOverMargins = 0.2;
    std::optional<DragPositionHint> hint;

    // Determine whether the drag is above, below, or above the tab/tab split.
    if (loc_in_child.y() < view->height() * kDragOverMargins) {
      hint = DragPositionHint::kBefore;
    } else if (loc_in_child.y() > view->height() * (1 - kDragOverMargins)) {
      hint = DragPositionHint::kAfter;
    } else if (child_node->type() == TabCollectionNode::Type::SPLIT) {
      // If landing in the middle of the split, let the split view decide
      // which tab to replace.
      auto* split_view = views::AsViewClass<SplitTabView>(view);
      gfx::Point loc_in_split =
          views::View::ConvertPointToTarget(this, split_view, loc_in_container);
      return split_view->GetLinkDropIndex(loc_in_split);
    } else {
      hint = std::nullopt;
    }
    return GetDragHandler().GetLinkDropIndexForNode(*child_node, hint);
  }

  return std::nullopt;
}

std::optional<BrowserRootView::DropIndex>
PinnedTabContainerView::GetLinkDropIndexForExpanded(
    const gfx::Point& loc_in_container) {
  return GetLinkDropIndexForHorizontal(loc_in_container);
}

void PinnedTabContainerView::ResetCollectionNode() {
  collapsed_state_changed_subscription_ = {};
  collection_node_ = nullptr;
}

void PinnedTabContainerView::OnCollapseStateChanged(
    tabs::VerticalTabStripCollapseState state) {
  // Collapsed state only exists for the vertical orientation.
  CHECK(!collection_node_ ||
        collection_node_->orientation() == TabStripOrientation::kVertical);
  set_drag_axes(state == tabs::VerticalTabStripCollapseState::kCollapsed
                    ? DragAxes::kVerticalOnly
                    : DragAxes::kBoth);
}

views::ScrollView* PinnedTabContainerView::GetScrollViewForContainer() const {
  return views::ScrollView::GetScrollViewForContents(
      const_cast<PinnedTabContainerView*>(this));
}

void PinnedTabContainerView::UpdateTargetLayoutForDrag(
    const std::vector<const views::View*>& views_to_snap) {
  layout_manager_->ResetViewsToTargetLayout(views_to_snap);
}

const views::ProposedLayout& PinnedTabContainerView::GetLayoutForDrag() const {
  return layout_manager_->target_layout();
}

const TabCollectionNode* PinnedTabContainerView::GetCollectionNodeFromView(
    const views::View& view) const {
  if (auto* tab_view = views::AsViewClass<TabView>(&view)) {
    return tab_view->collection_node();
  } else if (auto* split_tab_view = views::AsViewClass<SplitTabView>(&view)) {
    return split_tab_view->collection_node();
  }
  return nullptr;
}

views::ProposedLayout PinnedTabContainerView::CalculateHorizontalLayout(
    const views::SizeBounds& size_bounds) const {
  views::ProposedLayout layouts;
  const auto children = collection_node_ ? collection_node_->GetDirectChildren()
                                         : TabCollectionNode::ChildViews();

  const int tab_overlap = TabStyle::Get()->GetTabOverlap();
  int x = 0;
  const int container_height = TabStyle::Get()->GetStandardHeight();
  size_t visible_count = 0;

  for (auto* child : children) {
    views::SizeBounds child_size_bounds =
        views::SizeBounds({}, size_bounds.height());
    gfx::Rect bounds = gfx::Rect(child->GetPreferredSize(child_size_bounds));
    bounds.set_y(0);
    bounds.set_height(container_height);

    auto drag_data = GetVisualDataForDraggedView(*child);
    const bool should_show_child = layout_manager_->CanBeVisible(child) &&
                                   !(drag_data && drag_data->should_hide);
    if (!should_show_child) {
      layouts.child_layouts.emplace_back(child, false, gfx::Rect());
      continue;
    }

    bounds.set_x(drag_data ? drag_data->offset.x() : x);

    if (!drag_data || !drag_data->should_float) {
      // Advance x position by child width minus tab overlap.
      x += bounds.width() - tab_overlap;
      visible_count++;
    }

    layouts.child_layouts.emplace_back(child, true, bounds);
  }

  const int host_width = visible_count > 0 ? (x + tab_overlap) : 0;
  layouts.host_size = gfx::Size(host_width, container_height);
  return layouts;
}

void PinnedTabContainerView::SetShowEmptyPlaceholder(bool show) {
  if (show_empty_placeholder_ == show) return;
  show_empty_placeholder_ = show;
  InvalidateLayout();
  PreferredSizeChanged();
}

tabs::VerticalTabStripCollapseState
PinnedTabContainerView::GetEffectiveCollapseState() const {
  const auto* strip = tab_strip_view_owner_
      ? tab_strip_view_owner_.get()
      : GetTabStripView(const_cast<PinnedTabContainerView*>(this));
  if (strip && !strip->is_collapsed())
    return tabs::VerticalTabStripCollapseState::kExpanded;
  return GetTabStripCollapseState();
}

views::ProposedLayout PinnedTabContainerView::CalculateVerticalLayout(
    const views::SizeBounds& size_bounds) const {
  views::ProposedLayout layout;
  const auto children = collection_node_ ? collection_node_->GetDirectChildren()
                                         : TabCollectionNode::ChildViews();
  if (children.empty()) {
    if (show_empty_placeholder_) {
      layout.host_size = gfx::Size(
          std::max(size_bounds.width().value_or(kProvidedPinnedMinWidth), 0),
          kProvidedPinnedHeight);
    }
    return layout;
  }
  const int count = static_cast<int>(children.size());
  const bool has_split = std::ranges::any_of(collection_node_->children(),
      [](const auto& node) { return node->type() == TabCollectionNode::Type::SPLIT; });
  const int min_width = kProvidedPinnedMinWidth * (has_split ? 2 : 1);
  int columns = std::min(count, 4);
  int available_width = columns * (min_width + kProvidedPinnedGap) - kProvidedPinnedGap;
  if (size_bounds.width().is_bounded()) {
    available_width = std::max(
        size_bounds.width().value() - kProvidedPinnedHorizontalPadding, 0);
    // Original41115fc..1638 limits the grid to its actual scroll viewport.
    for (auto* ancestor = parent(); ancestor; ancestor = ancestor->parent()) {
      auto* scroll = views::AsViewClass<views::ScrollView>(ancestor);
      if (!scroll) continue;
      const auto visible = scroll->GetVisibleRect();
      if (!visible.IsEmpty()) {
        gfx::Point origin = bounds().origin();
        views::View::ConvertPointToTarget(parent(), scroll, &origin);
        available_width = std::min(available_width,
            std::max(visible.right() - origin.x(), 0));
      }
      break;
    }
    if (tabs::IsVerticalTabsExpandOnHoverFeatureEnabled() &&
        GetEffectiveCollapseState() == tabs::VerticalTabStripCollapseState::kCollapsed) {
      columns = 1;
    } else {
      columns = std::min({count, 4, std::max(1,
          (available_width + kProvidedPinnedGap) /
              (std::max(min_width, kProvidedPinnedHeight) + kProvidedPinnedGap))});
      if (size_bounds.width().value() < 151) columns = std::min(columns, 2);
    }
  }
  columns = std::clamp(columns, 1, count);
  // Original4111694..1724 removes a trailing singleton, or chooses an exactly
  // divisible narrower row when it does not add another row.
  const auto rows_for = [count](int width) { return (count + width - 1) / width; };
  if (columns < count && columns >= 3 &&
      (count % columns == 1 ||
       (rows_for(columns - 1) == rows_for(columns) && count % (columns - 1) == 0))) {
    --columns;
  }
  std::vector<int> row_counts;
  for (int remaining = count; remaining > 0; remaining -= columns)
    row_counts.push_back(std::min(remaining, columns));
  const int child_width = size_bounds.width().is_bounded()
      ? std::max((available_width - kProvidedPinnedGap * (row_counts.front() - 1)) /
                     row_counts.front(), 0)
      : min_width;
  int x = 0, y = 0, row_height = 0, row_index = 0, column = 0;
  int total_width = 0, total_height = 0;
  for (auto* child : children) {
    gfx::Rect bounds(child->GetPreferredSize(views::SizeBounds(child_width, {})));
    bounds.set_width(child_width);
    const auto drag = GetVisualDataForDraggedView(*child);
    if (drag && drag->should_hide) {
      layout.child_layouts.emplace_back(child, false, gfx::Rect());
      continue;
    }
    bounds.set_y(drag ? drag->offset.y() : y);
    int child_x = drag ? drag->offset.x() : x;
    if (drag && base::i18n::IsRTL()) {
      CHECK(size_bounds.width().is_bounded());
      child_x = size_bounds.width().value() - child_x - child_width;
    }
    bounds.set_x(child_x);
    if (!drag || !drag->should_float) {
      row_height = std::max(row_height, bounds.height());
      total_width = std::max(total_width, x + bounds.width());
      total_height = std::max(total_height, y + row_height);
      if (++column >= row_counts[row_index]) {
        y += row_height + kProvidedPinnedGap;
        x = 0; column = 0; row_height = 0;
        if (row_index + 1 < static_cast<int>(row_counts.size())) ++row_index;
      } else {
        x += bounds.width() + kProvidedPinnedGap;
      }
    }
    layout.child_layouts.emplace_back(child, true, bounds);
  }
  layout.host_size = gfx::Size(
      size_bounds.width().value_or(total_width), total_height);
  return layout;
}

BEGIN_METADATA(PinnedTabContainerView)
END_METADATA
