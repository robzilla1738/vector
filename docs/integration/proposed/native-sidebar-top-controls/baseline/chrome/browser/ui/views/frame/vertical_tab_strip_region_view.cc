// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"

#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_retention.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_input.h"
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_header.h"
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button.h"
#include "chrome/browser/ui/views/frame/aux_profile_search_button.h"
#include "chrome/browser/ui/views/frame/aux_profile_page_indicator.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_view.h"
#include "ui/views/view_utils.h"

#include "chrome/browser/ui/views/frame/aux_profile_preview_region_owner.h"

#include "chrome/browser/ui/views/frame/aux_sidebar_view.h"
#include "chrome/browser/ui/views/frame/aux_sidebar_body.h"
#include "chrome/browser/ui/views/frame/aux_sidebar_presentation.h"
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"

#include <algorithm>
#include <cmath>
#include <optional>

#include "base/callback_list.h"
#include "base/functional/bind.h"
#include "base/numerics/clamped_math.h"
#include "base/i18n/number_formatting.h"
#include "base/i18n/rtl.h"
#include "base/metrics/histogram_functions.h"
#include "base/metrics/user_metrics.h"
#include "base/metrics/user_metrics_action.h"
#include "base/time/time.h"
#include "chrome/browser/ui/actions/chrome_action_id.h"
#include "chrome/browser/ui/animation/browser_animation_controller.h"
#include "chrome/browser/ui/animation/browser_animation_types.h"
#include "chrome/browser/ui/browser_actions.h"
#include "chrome/browser/ui/browser_element_identifiers.h"
#include "chrome/browser/ui/browser_window/public/browser_window_features.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/color/chrome_color_id.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/omnibox/omnibox_tab_helper.h"
#include "chrome/browser/ui/tabs/features.h"
#include "chrome/browser/ui/tabs/hover_tab_selector.h"
#include "chrome/browser/ui/tabs/tab_group_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/ui_features.h"
#include "chrome/browser/ui/views/animations/tab_strip_animations.h"
#include "chrome/browser/ui/views/frame/base_tab_strip_region_view.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/custom_corners_background.h"
#include "chrome/browser/ui/views/frame/safe_invoke/safe_invoke.h"
#include "chrome/browser/ui/views/frame/shadow_frame_view.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/common/root_tab_collection_node.h"
#include "chrome/browser/ui/views/tabs/common/tab_collection_node.h"
#include "chrome/browser/ui/views/tabs/common/tab_drag_handler.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_collection_controller.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_view.h"
#include "chrome/browser/ui/views/tabs/common/unpinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/shared/drop_arrow.h"
#include "chrome/browser/ui/views/tabs/vertical/top_container_button.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_bottom_container.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_focus_swipe_controller.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_top_container.h"
#include "chrome/browser/ui/web_applications/app_browser_controller.h"
#include "chrome/grit/generated_resources.h"
#include "components/tabs/public/tab_group.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/base/dragdrop/os_exchange_data.h"
#include "ui/base/interaction/element_tracker.h"
#include "ui/base/l10n/l10n_util.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_id.h"
#include "ui/compositor/layer.h"
#include "ui/display/screen.h"
#include "ui/events/event.h"
#include "ui/gfx/geometry/point.h"
#include "ui/views/background.h"
#include "ui/views/controls/button/label_button.h"
#include "ui/views/controls/focus_ring.h"
#include "ui/views/controls/resize_area.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/controls/separator.h"
#include "ui/views/focus/focus_manager.h"
#include "ui/views/interaction/element_tracker_views.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/layout/flex_layout_types.h"
#include "ui/views/layout/layout_types.h"
#include "ui/views/view.h"
#include "ui/views/view_tracker.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/view_utils.h"

namespace {
constexpr int kResizeAreaWidth = 5;
constexpr int kCollapsedResizeAreaWidth = 2;
constexpr int kKeyboardResizeWidth = 50;
constexpr int kSnapDistance = 15;

// Shadow is used in expand-on-hover mode. Shadow radius and opacity are dynamic
// and set by the layout.
constexpr int kExpandOnHoverShadowElevation = 4;
constexpr ShadowFrameView::ShadowAlpha kExpandOnHoverShadowAlpha(
    {.light_key = 0.3,
     .light_ambient = 0.0,
     .dark_key = 0.6,
     .dark_ambient = 0.0});
}  // namespace

DEFINE_CLASS_CUSTOM_ELEMENT_EVENT_TYPE(VerticalTabStripRegionView,
                                       kAnimationCompletedEvent);

VerticalTabStripRegionView::VerticalTabStripRegionView(
    tabs::VerticalTabStripStateController* state_controller,
    actions::ActionItem* root_action_item,
    BrowserView* browser_view)
    : BaseTabStripRegionView(browser_view,
                             root_action_item,
                             TabStripOrientation::kVertical),
      resize_area_width_(kResizeAreaWidth),
      state_controller_(state_controller) {
  // For z-ordering purposes this needs to be on a layer.
  SetPaintToLayer();
  // Because corners may be transparent, this must be set to false.
  layer()->SetFillsBoundsOpaquely(false);

  const int region_horizontal_padding =
      GetLayoutConstant(LayoutConstant::kVerticalTabStripHorizontalPadding);

  flex_layout_ = SetLayoutManager(std::make_unique<views::FlexLayout>());
  flex_layout_->SetOrientation(views::LayoutOrientation::kVertical)
      .SetCollapseMargins(true)
      .SetDefault(
          views::kFlexBehaviorKey,
          views::FlexSpecification(views::LayoutOrientation::kVertical,
                                   views::MinimumFlexSizeRule::kPreferred,
                                   views::MaximumFlexSizeRule::kPreferred));
  flex_layout_->SetInteriorMargin(gfx::Insets::TLBR(
      0, 0,
      GetLayoutConstant(
          LayoutConstant::kVerticalTabStripUncollapsedVerticalPadding),
      0));

  // Create child views.
  top_button_container_ =
      AddChildView(std::make_unique<VerticalTabStripTopContainer>(
          state_controller_, root_action_item, browser_view->browser()));
  top_button_container_->SetProperty(
      views::kMarginsKey, gfx::Insets::VH(0, region_horizontal_padding));

  top_button_separator_ = AddChildView(std::make_unique<views::Separator>());
  // The TopContainer handles the padding distance to the separator so that we
  // can control how far it is in the various states.
  top_button_separator_->SetProperty(
      views::kMarginsKey, gfx::Insets::VH(0, region_horizontal_padding));

  pinned_tab_entries_ = AddChildView(
      std::make_unique<VerticalPinnedTabEntriesView>(
          browser_view->browser(), hover_card_controller()));
  pinned_tab_entries_->SetProperty(
      views::kMarginsKey, gfx::Insets::VH(0, region_horizontal_padding));

  aux_sidebar_ = AddChildView(
      std::make_unique<aux::AuxSidebarBody>(*browser_view->browser(), *this,
          *state_controller_, *hover_card_controller(), *pinned_tab_entries_,
          base::BindRepeating(&VerticalTabStripRegionView::RecordNewTabButtonPressed,
                              base::Unretained(this))));
  aux_sidebar_->SetProperty(views::kMarginsKey, gfx::Insets());

  aux_sidebar_->SetRunningChangedCallback(base::BindRepeating(
      &VerticalTabStripRegionView::OnAuxAgentActiveChanged,
      base::Unretained(this)));

  // Original +5a8 parent follows the expanding scroll/body (+5b0).
  // Keep the genuine profile/pager/search owner below the live tab body.
  aux_profile_header_ = AddChildView(
      std::make_unique<aux::VerticalTabSidebarProfileHeader>(
          *browser_view,
          base::BindRepeating(
              [](base::WeakPtr<VerticalTabStripRegionView> region) {
                if (region && region->aux_profile_header_)
                  ShowAuxProfileMenu(region->browser_view()->browser(),
                      region->aux_profile_header_->profile_button());
              }, aux_preview_weak_factory_.GetWeakPtr()),
          base::BindRepeating(
              [](base::WeakPtr<VerticalTabStripRegionView> region) {
                if (region && region->aux_profile_header_)
                  ToggleAuxProfileSearch(region->browser_view()->browser(),
                      region->aux_profile_header_->search_button());
              }, aux_preview_weak_factory_.GetWeakPtr()),
          base::BindRepeating(
              [](base::WeakPtr<VerticalTabStripRegionView> region,
                 const base::FilePath& target) {
                return region && region->SelectAuxProfilePreview(target);
              }, aux_preview_weak_factory_.GetWeakPtr()),
          base::BindRepeating(
              [](base::WeakPtr<VerticalTabStripRegionView> region,
                 views::View* anchor, const base::FilePath& path) {
                if (region)
                  ShowAuxProfileActions(region->browser_view()->browser(),
                                        anchor, path);
              }, aux_preview_weak_factory_.GetWeakPtr()),
          base::BindRepeating(
              [](base::WeakPtr<VerticalTabStripRegionView> region) {
                return region && region->AuxProfilePreviewIdle();
              }, aux_preview_weak_factory_.GetWeakPtr())));

  bottom_button_container_ =
      AddChildView(std::make_unique<VerticalTabStripBottomContainer>(
          state_controller_, root_action_item, browser_view->browser(),
          base::BindRepeating(
              &VerticalTabStripRegionView::RecordNewTabButtonPressed,
              base::Unretained(this))));
  bottom_button_container_->SetProperty(
      views::kFlexBehaviorKey,
      views::FlexSpecification(views::MinimumFlexSizeRule::kPreferred,
                               views::MaximumFlexSizeRule::kUnbounded));
  bottom_button_container_->SetProperty(
      views::kMarginsKey,
      gfx::Insets::TLBR(
          GetLayoutConstant(
              LayoutConstant::kVerticalTabStripCollapsedVerticalPadding),
          region_horizontal_padding, 0, region_horizontal_padding));

  gemini_button_ = AddChildView(std::make_unique<views::View>());

  resize_area_ = AddChildView(std::make_unique<views::ResizeArea>(this));
  resize_area_->SetProperty(views::kViewIgnoredByLayoutKey, true);
  resize_area_->SetFocusBehavior(views::View::FocusBehavior::ACCESSIBLE_ONLY);
  views::FocusRing::Install(resize_area_);
  resize_area_->GetViewAccessibility().SetName(
      l10n_util::GetStringUTF16(IDS_VERTICAL_RESIZE_AREA));
  resize_area_->GetViewAccessibility().SetRole(ax::mojom::Role::kSlider);

  state_controller_->SetDelegate(this);
  target_collapse_state_ = state_controller_->GetState();
  OnCollapseStateChanged(state_controller_->GetCollapseState());
  collapsed_state_changed_subscription_ =
      state_controller_->RegisterOnCollapseChanged(base::BindRepeating(
          &VerticalTabStripRegionView::OnCollapseStateChanged,
          base::Unretained(this)));

  SetProperty(views::kElementIdentifierKey, kTabStripRegionElementId);

  GetViewAccessibility().SetRole(ax::mojom::Role::kTabList);

  SetBackground(std::make_unique<CustomCornersBackground>(
      *this, *browser_view,
      /*primary_color=*/ui::kColorSysHeader,
      /*corner_color=*/CustomCornersBackground::ToolbarTheme()));

  shadow_frame_ = AddChildView(std::make_unique<ShadowFrameView>(
      kExpandOnHoverShadowElevation, kExpandOnHoverShadowAlpha));
  shadow_frame_->SetProperty(views::kViewIgnoredByLayoutKey, true);

  if (base::FeatureList::IsEnabled(features::kTabGroupsFocusing)) {
    focus_swipe_controller_ =
        std::make_unique<VerticalTabStripFocusSwipeController>(this);
  }

  InstallAuxProfilePreviewAdmission(
      std::make_unique<aux::ProfilePreviewAdmission>(
          *this, target_collapse_state_.collapsed,
          target_collapse_state_.uncollapsed_width));
  SetNotifyEnterExitOnChild(true);
  UpdateColors();
}

VerticalTabStripRegionView::~VerticalTabStripRegionView() {
  // Real profile/model-bound actors retire before admission/child ownership.
  aux_sidebar_->Unmount();
  aux_preview_weak_factory_.InvalidateWeakPtrs();
  RetireAuxProfilePreviewInput();
  aux_profile_preview_capture_.reset();
  aux_profile_preview_owner_.reset();
  aux_profile_preview_retention_.reset();
  aux_profile_preview_admission_.reset();
  if (aux_profile_preview_retention_)
    aux_profile_preview_retention_->Retire();
  // The genuine saved rows retain the actual hover owner. Destroy those rows
  // before the base region destroys that owner, and release their menu locks
  // before iterating the remaining region locks.
  auto* saved_entries = pinned_tab_entries_.get();
  pinned_tab_entries_ = nullptr;
  RemoveChildViewT(saved_entries);
  for (const auto& lock : hover_locks_) {
    lock->ClearRegionViewOnDestruction();
  }
  hover_locks_.clear();

  // Prevent dangling pointer.
  state_controller_->SetDelegate(nullptr);
}

void VerticalTabStripRegionView::ResetTabStrip() {
  // RootTabCollectionNode::Reset deinitializes collection children before the
  // later OnTabStripViewWillClear hook. Unmount while those real views and
  // controllers still exist; the later clear hook remains idempotent.
  aux_sidebar_->Unmount();
  BaseTabStripRegionView::ResetTabStrip();
}

bool VerticalTabStripRegionView::IsAnimatingSize() const {
  if (aux_profile_preview_admission_)
    return aux_profile_preview_admission_->collapse_animating();
  return BrowserAnimationController::From(browser_view()->browser())
      ->IsAnimating(TabStripAnimations::kVerticalTabStrip);
}

void VerticalTabStripRegionView::OnAnimationProgressed(
    const BrowserAnimationController* controller,
    BrowserAnimationUpdate status) {
  switch (status) {
    case BrowserAnimationUpdate::kStarted: {
      const auto motion =
          controller->GetCurrentMotion(TabStripAnimations::kVerticalTabStrip);
      if (motion == TabStripAnimations::kExpand) {
        update_state_controller_collapsed_callback_.Run(false);
      }
      hover_card_animation_lock_ =
          hover_card_controller()->GetHoverCardHideLock();
      if (tab_strip_view()) {
        tab_strip_view()->SetIsAnimatingSize(true);
      }
      break;
    }
    case BrowserAnimationUpdate::kProgressed:
      InvalidateLayout();
      break;
    case BrowserAnimationUpdate::kEnded: {
      hover_card_animation_lock_.reset();
      if (tab_strip_view()) {
        tab_strip_view()->SetIsAnimatingSize(false);
      }
      const auto motion =
          controller->GetCurrentMotion(TabStripAnimations::kVerticalTabStrip);
      if (motion == TabStripAnimations::kCollapse ||
          motion == TabStripAnimations::kExpand) {
        views::ElementTrackerViews::GetInstance()->NotifyCustomEvent(
            kAnimationCompletedEvent, this);
      }
      if (motion == TabStripAnimations::kCollapse) {
        update_state_controller_collapsed_callback_.Run(true);
      }
      InvalidateLayout();
      break;
    }
    case BrowserAnimationUpdate::kCanceled:
      hover_card_animation_lock_.reset();
      if (tab_strip_view()) {
        tab_strip_view()->SetIsAnimatingSize(false);
      }

      // If the collapse animation is cancelled by requesting the tabstrip to
      // expand, then we will not receive a BrowserAnimationUpdate::kEnded event
      // which is usually where we update collapsed state of the controller to
      // true.
      // The current motion in the animation controller has already been cleared
      // at this point, so instead check that the target collapse state is
      // expanded. As a result, this also gets executed when cancelling expand
      // on hover animations, but since the collapse state must have already
      // been true in that case, this would be a no-op.
      if (!target_collapse_state_.collapsed) {
        update_state_controller_collapsed_callback_.Run(true);
      }
      break;
  }
}

bool VerticalTabStripRegionView::IsPositionInWindowCaption(
    const gfx::Point& point) {
  // Check the resize area first, it should always take precedence over other
  // children regardless of order.
  if (IsHitInView(resize_area_, point)) {
    return false;
  }

  if (IsHitInView(top_button_container_, point)) {
    gfx::Point point_in_child = point;
    views::View::ConvertPointToTarget(this, top_button_container_,
                                      &point_in_child);
    return top_button_container_->IsPositionInWindowCaption(point_in_child);
  }

  if (IsHitInView(bottom_button_container_, point)) {
    gfx::Point point_in_child = point;
    views::View::ConvertPointToTarget(this, bottom_button_container_,
                                      &point_in_child);
    return bottom_button_container_->IsPositionInWindowCaption(point_in_child);
  }

  // For any of the other children, absorb the click as non window caption.
  for (views::View* child : children()) {
    if (!child->GetVisible()) {
      continue;
    }

    gfx::Point point_in_child = point;
    views::View::ConvertPointToTarget(this, child, &point_in_child);
    if (child->HitTestPoint(point_in_child)) {
      return false;
    }
  }

  // If the click doesnt fall under any view,then it counts as window caption.
  return true;
}

void VerticalTabStripRegionView::SetToolbarHeightForLayout(int toolbar_height) {
  top_button_container_->SetToolbarHeightForLayout(toolbar_height);
}

void VerticalTabStripRegionView::SetCaptionButtonWidthForLayout(
    int caption_button_width) {
  top_button_container_->SetCaptionButtonWidthForLayout(caption_button_width);
}

void VerticalTabStripRegionView::SetIsExitingExpandOnHoverForLayout(
    bool is_exiting_expand_on_hover) {
  top_button_container_->SetIsExitingExpandOnHoverForLayout(
      is_exiting_expand_on_hover);
}

void VerticalTabStripRegionView::SetTransitionButtonOpacity(float opacity) {
  for (views::LabelButton* label_button :
       {top_button_container_->GetCollapseButton(),
        top_button_container_->GetUnfocusButton()}) {
    if (label_button) {
      auto* button = static_cast<TopContainerButton*>(label_button);
      button->layer()->SetOpacity(opacity);

      if (opacity == 0.0f) {
        button->ApplyPendingIcon();
      }
      if (opacity == 1.0f) {
        button->SetDelayIconUpdates(false);
        button->ApplyPendingIcon();
      }
    }
  }
}

bool VerticalTabStripRegionView::WillWrapDueToOverflow(
    int available_width) const {
  return top_button_container_->WillWrapDueToOverflow(available_width);
}

void VerticalTabStripRegionView::AddedToWidget() {
  BaseTabStripRegionView::AddedToWidget();
  InitializeAuxProfilePreview();
  if (aux_profile_preview_input_)
    aux_profile_preview_input_->AttachToWidget();
  if (aux_profile_preview_retention_)
    aux_profile_preview_retention_->AttachToWidget();
  paint_as_active_subscription_ =
      GetWidget()->RegisterPaintAsActiveChangedCallback(base::BindRepeating(
          [](VerticalTabStripRegionView* view) {
            view->UpdateColors();
            view->UpdateExpandOnHoverState();
          },
          base::Unretained(this)));
  if (GetFocusManager()) {
    GetFocusManager()->AddFocusChangeListener(&focus_listener_);
  }
}

void VerticalTabStripRegionView::RemovedFromWidget() {
  if (aux_profile_preview_input_)
    aux_profile_preview_input_->DetachFromWidget();
  if (aux_profile_preview_retention_)
    aux_profile_preview_retention_->DetachFromWidget();
  if (GetFocusManager()) {
    GetFocusManager()->RemoveFocusChangeListener(&focus_listener_);
  }
  BaseTabStripRegionView::RemovedFromWidget();
}

void VerticalTabStripRegionView::Layout(PassKey) {
  aux_sidebar_->ApplyPresentation();
  RefreshAuxPinnedPresentation();
  LayoutSuperclass<views::AccessiblePaneView>(this);

  // Manually position the resize area as it overlaps views handled by the flex
  // layout.
  resize_area_->SetBoundsRect(gfx::Rect(bounds().right() - resize_area_width_,
                                        0, resize_area_width_,
                                        bounds().height()));
  shadow_frame_->SetBoundsRect(GetLocalBounds());
  if (aux_profile_header_ && aux_profile_header_held_bounds_ &&
      aux_profile_header_->parent() == this) {
    aux_profile_header_->SetBoundsRect(*aux_profile_header_held_bounds_);
  }

  // Ensure that we update the drop arrow position so that it does not render in
  // the collapsed state when expand on hover is active.
  if (drop_arrow()) {
    drop_arrow()->SetIndex(drop_arrow()->index());
  }
}

views::View* VerticalTabStripRegionView::GetDefaultFocusableChild() {
  tabs::TabInterface* active_tab = tab_strip_model()->GetActiveTab();
  if (active_tab) {
    return GetTabAnchorView(active_tab->GetHandle());
  }

  return top_button_container_;
}

gfx::Size VerticalTabStripRegionView::GetMinimumSize() const {
  auto min_size = BaseTabStripRegionView::GetMinimumSize();
  min_size.set_width((state_controller_->IsCollapsed() || IsAnimatingSize())
                         ? kCollapsedWidth
                         : kUncollapsedMinWidth);
  return min_size;
}

gfx::Size VerticalTabStripRegionView::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
  auto size = BaseTabStripRegionView::CalculatePreferredSize(available_size);
  if (aux_profile_preview_admission_) {
    const auto& admission = *aux_profile_preview_admission_;
    const double value = target_collapse_state_.collapsed &&
                                 (admission.hover_expanded() || admission.retained())
                             ? 1.0 : admission.collapse_value();
    const int target = admission.retained()
                           ? std::max(280, uncollapsed_width())
                           : uncollapsed_width();
    const int amount = std::max(0, target - kCollapsedWidth);
    size.set_width(kCollapsedWidth + static_cast<int>(
        target_collapse_state_.collapsed ? std::ceil(amount * value)
                                        : std::floor(amount * value)));
    return size;
  }
  const auto* controller =
      BrowserAnimationController::From(browser_view()->browser());
  const auto motion =
      controller->GetCurrentMotion(TabStripAnimations::kVerticalTabStrip);
  const int expand_amount =
      std::max(0, target_collapse_state_.uncollapsed_width - kCollapsedWidth);
  const double expand_percent =
      *controller->GetCurrentValue(TabStripAnimations::kVerticalTabStrip,
                                   TabStripAnimations::kTabStripWidth);
  size.set_width(kCollapsedWidth +
                 (motion == TabStripAnimations::kExpand
                      ? std::floor<double>
                      : std::ceil<double>)(expand_amount * expand_percent));
  return size;
}

bool VerticalTabStripRegionView::OnKeyPressed(const ui::KeyEvent& event) {
  if (resize_area_->HasFocus()) {
    int resize_amount = 0;

    if (event.key_code() == ui::VKEY_LEFT) {
      resize_amount =
          base::i18n::IsRTL() ? kKeyboardResizeWidth : -kKeyboardResizeWidth;
    } else if (event.key_code() == ui::VKEY_RIGHT) {
      resize_amount =
          base::i18n::IsRTL() ? -kKeyboardResizeWidth : kKeyboardResizeWidth;
    }

    if (resize_amount != 0) {
      OnResize(resize_amount, /*done_resizing=*/true);

      float tab_strip_width = width();
      float total_width = GetWidget()->GetRootView()->width();

      int tab_strip_percentage = (tab_strip_width / total_width) * 100;
      int content_percentage = 100 - tab_strip_percentage;

      resize_area_->GetViewAccessibility().AnnounceText(
          l10n_util::GetStringFUTF16(IDS_VERTICAL_TAB_RESIZE_ACCESSIBLE_ALERT,
                                     base::FormatPercent(tab_strip_percentage),
                                     base::FormatPercent(content_percentage)));

      return true;
    }
  }

  return BaseTabStripRegionView::OnKeyPressed(event);
}

void VerticalTabStripRegionView::OnMouseEntered(const ui::MouseEvent& event) {
  if (mouse_exit_timer_.IsRunning()) {
    mouse_exit_timer_.Stop();
    return;
  }
  UpdateExpandOnHoverState(true);
}

void VerticalTabStripRegionView::OnMouseMoved(const ui::MouseEvent& event) {
  if (mouse_exit_timer_.IsRunning()) {
    mouse_exit_timer_.Stop();
  }
  UpdateExpandOnHoverState(true);
}

void VerticalTabStripRegionView::OnMouseExited(const ui::MouseEvent& event) {
  HandleMouseExited();
}

void VerticalTabStripRegionView::HandleMouseExited() {
  // On Windows, we get mouse exit events when moving between the caption area
  // and client as well as when we transition between web contents area
  // underneath the expanded on hover overlay to outside it.
#if BUILDFLAG(IS_WIN)
  constexpr base::TimeDelta kMouseExitDebounceTimer = base::Milliseconds(100);
  if (IsMouseHovered()) {
    mouse_exit_timer_.Start(
        FROM_HERE, kMouseExitDebounceTimer,
        base::BindOnce(&VerticalTabStripRegionView::HandleMouseExited,
                       base::Unretained(this)));
    return;
  }
#endif
  UpdateExpandOnHoverState(false);
}

std::unique_ptr<ExpandOnHoverLock>
VerticalTabStripRegionView::GetExpandOnHoverLock(
    ExpandOnHoverLockType lock_type) {
  return std::make_unique<VerticalTabStripExpandOnHoverLock>(this, lock_type);
}

void VerticalTabStripRegionView::HandleDragUpdate(
    const std::optional<BrowserRootView::DropIndex>& index) {
  SetLinkDropArrow(index);
  UpdateExpandOnHoverState(true);
  if (is_expanded_on_hover_ && !link_drag_lock_) {
    link_drag_lock_ =
        GetExpandOnHoverLock(ExpandOnHoverLockType::kKeepCurrentState);
  }
}

void VerticalTabStripRegionView::ClearAuxEmptyPinnedDrop() {
  if (aux_empty_pinned_drop_active_) {
    aux_empty_pinned_drop_active_ = false;
    RefreshAuxPinnedPresentation();
    aux_sidebar_->InvalidateLayout();
    aux_sidebar_->SchedulePaint();
    InvalidateLayout();
    SchedulePaint();
  }
}
void VerticalTabStripRegionView::HandleDragExited() {
  ClearAuxEmptyPinnedDrop();
  SetLinkDropArrow(std::nullopt);
  link_drag_lock_.reset();
  UpdateExpandOnHoverState(false);
}

gfx::Point VerticalTabStripRegionView::GetLinkDropArrowPosition(
    const BrowserRootView::DropIndex& drop_index,
    DropArrow::Direction* direction) {
  int target_x = GetBoundsInScreen().x();
  int target_y = 0;

  // By default have the arrow outside of the browser window pointing towards
  // the tab strip.
  *direction = base::i18n::IsRTL() ? DropArrow::Direction::kLeft
                                   : DropArrow::Direction::kRight;

  const bool replace_index =
      drop_index.relative_to_index ==
      BrowserRootView::DropIndex::RelativeToIndex::kReplaceIndex;

  if (drop_index.index < tab_strip_model()->count()) {
    tabs::TabInterface* tab =
        tab_strip_model()->GetTabAtIndex(drop_index.index);
    views::View* target_view = GetTabViewAt(drop_index.index);
    if (!target_view) {
      return GetBoundsInScreen().origin();
    }

    // In the expanded view, pinned and split tabs will have an arrow pointing
    // down at the tab. We don't support dropping a tab in the middle of a
    // split view.
    if ((tab->IsPinned() || (tab->IsSplit() && replace_index)) &&
        !state_controller_->IsCollapsed()) {
      if (replace_index) {
        target_x = target_view->GetBoundsInScreen().CenterPoint().x();
      } else {
        target_x = base::i18n::IsRTL()
                       ? target_view->GetBoundsInScreen().right()
                       : target_view->GetBoundsInScreen().x();
      }
      target_y = target_view->GetBoundsInScreen().y();
      *direction = DropArrow::Direction::kDown;
    } else if (replace_index) {
      // When a tab is being replaced, point at the middle of the tab.
      target_y = target_view->GetBoundsInScreen().CenterPoint().y();
    } else {
      // Otherwise, we are pointing at the slot before the tab.
      if (IsDropBeforeGroupHeader(drop_index, tab)) {
        // Drop before the group header.
        views::View* header_view = GetGroupHeaderView(tab->GetGroup().value());
        target_y =
            (header_view ? header_view : target_view)->GetBoundsInScreen().y();
      } else {
        target_y = target_view->GetBoundsInScreen().y();
      }
    }
  } else {
    // Drop at the end of the unpinned container.
    if (auto* unpinned_container = GetUnpinnedTabsContainer()) {
      target_y = unpinned_container->GetBoundsInScreen().bottom();
    } else {
      target_y = tab_strip_view()->GetBoundsInScreen().bottom();
    }
  }

  // In RTL, shift `target_x` to the other side of the tab strip.
  if (*direction == DropArrow::Direction::kLeft) {
    target_x += GetBoundsInScreen().width();
  }

  return gfx::Point(target_x, target_y);
}

void VerticalTabStripRegionView::OnResize(int resize_amount,
                                          bool done_resizing) {
  CHECK(tab_strip_view());
  tab_strip_view()->SetIsAnimatingSize(!done_resizing);
  if (!starting_width_on_resize_.has_value()) {
    starting_width_on_resize_ = width();
    state_controller_->SetIsResizing(true);
  }
  bool previously_collapsed = target_collapse_state_.collapsed;
  const int proposed_width = starting_width_on_resize_.value() + resize_amount;
  if (done_resizing) {
    starting_width_on_resize_ = std::nullopt;
    state_controller_->SetIsResizing(false);
  }

  tabs::VerticalTabStripState new_state;
  new_state.collapsed = proposed_width <= kCollapseSnapWidth;
  new_state.uncollapsed_width = target_collapse_state_.uncollapsed_width;
  if (!new_state.collapsed) {
    new_state.uncollapsed_width =
        std::clamp(proposed_width, kUncollapsedMinWidth, kUncollapsedMaxWidth);
    if (std::abs(new_state.uncollapsed_width -
                 tabs::kVerticalTabStripDefaultUncollapsedWidth) <
        kSnapDistance) {
      new_state.uncollapsed_width =
          tabs::kVerticalTabStripDefaultUncollapsedWidth;
    }
    if (done_resizing) {
      // We only want to save the uncollapsed width to the state controller if
      // the user has lifted their mouse, otherwise dragging the resize area to
      // collapse will cause a subsequent collapse button click to only expand
      // to the minimum expanded width, and not to the starting width of the
      // drag-to-collapse operation.
      state_controller_->SetUncollapsedWidth(new_state.uncollapsed_width);
    }
  } else if (done_resizing) {
    // If we are done resizing while in collapsed state, update the target state
    // to use the uncollapsed width from the state controller.
    new_state.uncollapsed_width = state_controller_->GetUncollapsedWidth();
  }

  if (done_resizing) {
    resize_area_->SetVisible(!state_controller_->IsCollapsed() ||
                             !state_controller_->IsExpandOnHoverEnabled());
    base::RecordAction(base::UserMetricsAction(
        new_state.collapsed ? "VerticalTabs_TabStrip_ResizeToCollapsed"
                            : "VerticalTabs_TabStrip_ResizeToUncollapsed"));
    base::UmaHistogramCounts1000(
        "Tabs.VerticalTabs.TabStripSize",
        new_state.collapsed ? kCollapsedWidth : new_state.uncollapsed_width);
  }

  target_collapse_state_ = new_state;
  if (aux_profile_preview_admission_ && previously_collapsed == new_state.collapsed)
    aux_profile_preview_admission_->SetCollapseState(
        new_state.collapsed, new_state.uncollapsed_width);

  if (previously_collapsed != target_collapse_state_.collapsed) {
    state_controller_->RequestCollapse(target_collapse_state_.collapsed);
  } else if (!target_collapse_state_.collapsed && !IsAnimatingSize()) {
    // If we are still in the expanding animation, invalidating the layout will
    // happen in AnimationProgressed, instead of here.
    InvalidateLayout();
  }
}

void VerticalTabStripRegionView::SetCollapsedStateUpdatedCallback(
    base::RepeatingCallback<void(bool)> callback) {
  update_state_controller_collapsed_callback_ = std::move(callback);
}

bool VerticalTabStripRegionView::IsCollapsing() {
  if (aux_profile_preview_admission_)
    return target_collapse_state_.collapsed && IsAnimatingSize();
  return BrowserAnimationController::From(browser_view()->browser())
             ->GetCurrentMotion(TabStripAnimations::kVerticalTabStrip) ==
         TabStripAnimations::kCollapse;
}

void VerticalTabStripRegionView::RequestCollapse(bool collapse) {
  target_collapse_state_.collapsed = collapse;
  if (collapse) {
    suppress_expand_on_hover_ = IsCollapseButtonHovered();
    ResetExpandOnHoverTimers();
  } else {
    suppress_expand_on_hover_ = false;
  }
  // Do not trigger the animation before tab_strip_view() is set, as the region
  // view only subscribes to animation updates once tab_strip_view() has been
  // attached. target_collapse_state_ is still set so that when
  // SetTabStripView() is eventually called, the region view and all child
  // views initialize directly in the target collapse state.
  if (!tab_strip_view()) {
    return;
  }
  if (aux_profile_preview_admission_) {
    aux_profile_preview_admission_->SetCollapseState(
        collapse, target_collapse_state_.uncollapsed_width);
    return;
  }
  const auto motion =
      collapse ? TabStripAnimations::kCollapse : TabStripAnimations::kExpand;
  BrowserAnimationController::From(browser_view()->browser())
      ->Start(TabStripAnimations::kVerticalTabStrip, motion);
}



VerticalTabStripRegionView::RegionViewFocusListener::RegionViewFocusListener(
    VerticalTabStripRegionView* region_view)
    : region_view_(region_view) {}

void VerticalTabStripRegionView::RegionViewFocusListener::OnDidChangeFocus(
    views::View* focused_before,
    views::View* focused_now) {
  if ((focused_before && region_view_->Contains(focused_before)) ||
      (focused_now && region_view_->Contains(focused_now))) {
    region_view_->UpdateExpandOnHoverState();
  }
}

VerticalTabStripRegionView::ClickEventHandler::ClickEventHandler(
    VerticalTabStripRegionView* region_view)
    : region_view_(region_view) {}

void VerticalTabStripRegionView::ClickEventHandler::OnMouseEvent(
    ui::MouseEvent* event) {
  if (event->type() == ui::EventType::kMousePressed &&
      region_view_->state_controller_->IsExpandOnHoverEnabled() &&
      !region_view_->is_expanded_on_hover()) {
    region_view_->RestartExpandOnHoverTimer(
        tabs::kVerticalTabsExpandOnHoverClickDelay.Get());
  }
}

bool VerticalTabStripRegionView::CanRebindForAuxProfileSwitch(
    Profile* target) const {
  return pinned_tab_entries_ && bottom_button_container_ && target &&
         target->GetPrefs()->FindPreference(aux::kPinnedTabEntriesPref) &&
         aux_sidebar_ && resize_area_ &&
         !resize_area_->is_resizing() &&
         aux_sidebar_->CanRebindForAuxProfileSwitch(target);
}

uint64_t VerticalTabStripRegionView::BeginAuxProfileSwitch(Profile* target) {
  CHECK(CanRebindForAuxProfileSwitch(target));
  aux_empty_pinned_drop_active_ = false;
  RefreshAuxPinnedPresentation();
  pinned_tab_entries_->PauseForProfileSwitch();
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  bottom_button_container_->PauseForAuxProfileSwitch();
#endif
  const auto generation = aux_sidebar_->BeginAuxProfileSwitch(target);
  pinned_profile_switch_generation_ = generation;
  return generation;
}

void VerticalTabStripRegionView::RebindAuxProfileSwitch() {
  // Both commit and rollback derive the actual currently authoritative
  // Browser profile. Do not copy another window's rendered rows or sources.
  aux_sidebar_->RebindAuxProfileSwitch();
}

void VerticalTabStripRegionView::EndAuxProfileSwitch(uint64_t generation) {
  CHECK(pinned_profile_switch_generation_ == generation);
  if (pinned_profile_switch_generation_ == generation) {
    pinned_profile_switch_generation_.reset();
    pinned_tab_entries_->RebindAfterProfileSwitch();
    aux_sidebar_->EndAuxProfileSwitch(generation);
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
    bottom_button_container_->RebindAfterAuxProfileSwitch();
#endif
    if (aux_profile_header_)
      aux_profile_header_->RefreshNow();
    if (aux_profile_preview_capture_)
      aux_profile_preview_capture_->Request(base::Milliseconds(120));
  }
}

views::View* VerticalTabStripRegionView::GetPinnedTabEntriesViewForAuxProfilePreview() {
  return pinned_tab_entries_;
}

std::array<views::View*, 5>
VerticalTabStripRegionView::GetAuxProfilePreviewSurfaces() const {
  auto* strip = tab_strip_view();
  // Original4658294: custom saved entries, actual pinned live container,
  // genuine vertical scrolling surface, bottom container, bare spacer.
  return {pinned_tab_entries_.get(),
          strip ? strip->GetPinnedTabsContainer() : nullptr,
          aux_sidebar_.get(),
          bottom_button_container_.get(), gemini_button_.get()};
}

views::View* VerticalTabStripRegionView::GetAuxProfilePreviewTopBoundary() const {
  // Original4640768 uses region+0x590 (the real top container) bottom.
  return top_button_container_;
}

bool VerticalTabStripRegionView::BeginAuxProfilePreview(
    const base::FilePath& target, int direction) {
  if (!tab_strip_view() || !browser_view() || !browser_view()->browser()) {
    return false;
  }
  if (!aux_profile_preview_owner_) {
    aux_profile_preview_owner_ = std::make_unique<aux::ProfilePreviewRegionOwner>(
        *browser_view()->browser(), *this);
  }
  return aux_profile_preview_owner_->Begin(target, direction);
}

void VerticalTabStripRegionView::UpdateAuxProfilePreview(float progress) {
  if (aux_profile_preview_owner_) {
    aux_profile_preview_owner_->Update(progress);
  }
}
void VerticalTabStripRegionView::OnAuxProfilePreviewFrame() {
  if (aux_profile_preview_owner_) {
    aux_profile_preview_owner_->OnPreviewFrame();
  }
}
bool VerticalTabStripRegionView::CommitAuxProfilePreview(
    base::OnceCallback<void(Browser*)> completion) {
  return aux_profile_preview_owner_ &&
      aux_profile_preview_owner_->Commit(std::move(completion));
}
void VerticalTabStripRegionView::CancelAuxProfilePreview() {
  if (aux_profile_preview_owner_) {
    aux_profile_preview_owner_->Cancel();
  }
}

void VerticalTabStripRegionView::RefreshAuxPinnedPresentation() {
  auto* strip = tab_strip_view();
  if (!strip || !strip->GetPinnedTabsContainer() || !aux_profile_preview_admission_)
    return;
  auto& pinned = *strip->GetPinnedTabsContainer();
  aux::ApplyAuxPinnedPresentation(pinned, aux::CalculateAuxPinnedPresentation(
      *tab_strip_model(), pinned, pinned_tab_entries_,
      *aux_profile_preview_admission_, width(), aux_empty_pinned_drop_active_));
}
std::unique_ptr<ExpandOnHoverLock>
VerticalTabStripRegionView::AcquireDragExpansionLock() {
  return GetExpandOnHoverLock(ExpandOnHoverLockType::kKeepExpanded);
}
void VerticalTabStripRegionView::SavedPinConversionCompleted() {
  aux_sidebar_->QueueProjectionRefresh();
  RefreshAuxPinnedPresentation();
  InvalidateLayout();
}
void VerticalTabStripRegionView::BookmarkConversionCompleted() {
  RefreshAuxPinnedPresentation();
  InvalidateLayout();
}
void VerticalTabStripRegionView::OnAuxAgentActiveChanged(bool active) {
  top_button_container_->SetAgentActive(active);
}

void VerticalTabStripRegionView::OnTabStripViewSet() {
  tab_strip_view()->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(4, 0, 5, 0));

  // Pre-set the animation values to the appropriate state.
  auto* const animation_controller =
      BrowserAnimationController::From(browser_view()->browser());
  if (!aux_profile_preview_admission_)
    animation_controller->Reset(TabStripAnimations::kVerticalTabStrip,
                                target_collapse_state_.collapsed
                                    ? TabStripAnimations::kCollapse
                                    : TabStripAnimations::kExpand);

  if (!aux_profile_preview_admission_)
    on_animation_update_subscription_ = animation_controller->Subscribe(
      TabStripAnimations::kVerticalTabStrip,
      base::BindRepeating(&VerticalTabStripRegionView::OnAnimationProgressed,
                          base::Unretained(this)));

  expand_on_hover_enabled_changed_subscription_ =
      state_controller_->RegisterOnExpandOnHoverEnabledChanged(
          base::BindRepeating(
              &VerticalTabStripRegionView::OnExpandOnHoverEnabledChanged,
              base::Unretained(this)));

  aux_sidebar_->Mount(*tab_strip_view());

  OnCollapseStateChanged(state_controller_->GetCollapseState());
  InitializeAuxProfilePreview();
}

void VerticalTabStripRegionView::OnTabStripViewWillClear() {
  aux_empty_pinned_drop_active_ = false;
  aux_sidebar_->Unmount();
  RetireAuxProfilePreviewInput();
  aux_profile_preview_owner_.reset();
  aux_profile_preview_capture_.reset();
  ReleaseAuxProfileHeaderGeometry();
  on_animation_update_subscription_.reset();
  expand_on_hover_enabled_changed_subscription_.reset();
  omnibox_tab_helper_observation_.Reset();

  ResetExpandOnHoverTimers();
  is_expanded_on_hover_ = false;
}

void VerticalTabStripRegionView::OnCollapseStateChanged(
    tabs::VerticalTabStripCollapseState state) {
  if (aux_profile_preview_admission_) {
    ApplyRetainedLayout();
    return;
  }
  // Apply padding immediately at the start of the animation by including
  // the collapsing state.
  bool collapsed = state != tabs::VerticalTabStripCollapseState::kExpanded;

  resize_area_->SetVisible(!collapsed ||
                           !state_controller_->IsExpandOnHoverEnabled() ||
                           resize_area_->is_resizing());

  resize_area_width_ = collapsed ? kCollapsedResizeAreaWidth : kResizeAreaWidth;
  aux_sidebar_->ApplyPresentation();
  top_button_separator_->SetVisible(collapsed);
  bottom_button_container_->SetVisible(collapsed);

  if (tab_strip_view()) {
    tab_strip_view()->SetCollapsedState(collapsed);
  }

  if ((state == tabs::VerticalTabStripCollapseState::kCollapsing) ||
      (state == tabs::VerticalTabStripCollapseState::kExpanded &&
       IsAnimatingSize())) {
    const bool will_wrap = WillWrapDueToOverflow(
        uncollapsed_width() -
        2 * GetLayoutConstant(
                LayoutConstant::kVerticalTabStripHorizontalPadding));

    if (!will_wrap) {
      for (views::LabelButton* label_button :
           {top_button_container_->GetCollapseButton(),
            top_button_container_->GetUnfocusButton()}) {
        if (label_button) {
          static_cast<TopContainerButton*>(label_button)
              ->SetDelayIconUpdates(true);
        }
      }
    }
  }

  if (state == tabs::VerticalTabStripCollapseState::kExpanded ||
      state == tabs::VerticalTabStripCollapseState::kCollapsed) {
    UpdateExpandOnHoverState();
  }
}

void VerticalTabStripRegionView::UpdateColors() {
  top_button_separator_->SetColorId(IsFrameActive()
                                        ? kColorTabDividerFrameActive
                                        : kColorTabDividerFrameInactive);
}

bool VerticalTabStripRegionView::IsFrameActive() const {
  return GetWidget() ? GetWidget()->ShouldPaintAsActive() : true;
}

bool VerticalTabStripRegionView::IsCollapseButtonHovered() const {
  return SafeInvoke(top_button_container_.get())
      .Then(&VerticalTabStripTopContainer::GetCollapseButton)
      .Then(&views::View::IsMouseHovered)
      .value_or(false);
}

gfx::Rect VerticalTabStripRegionView::GetTabStripDraggableBounds() const {
  // Original465176c: shared body plus visible physical pinned rows, ending at
  // the genuine visible profile/search header (or the actual region bottom).
  auto bounds = aux_sidebar_->GetBoundsInScreen();
  if (auto* strip = tab_strip_view()) {
    if (auto* pinned = strip->GetPinnedTabsContainer(); pinned && pinned->GetVisible())
      bounds.Union(pinned->GetBoundsInScreen());
  }
  const int bottom = aux_profile_header_ && aux_profile_header_->GetVisible()
      ? aux_profile_header_->GetBoundsInScreen().y() : GetBoundsInScreen().bottom();
  bounds.set_height(std::max(0, static_cast<int>(base::ClampSub(bottom, bounds.y()))));
  return bounds;
}

void VerticalTabStripRegionView::OnExpandOnHoverEnabledChanged(bool enabled) {
  resize_area_->SetVisible(!state_controller_->IsCollapsed() || !enabled ||
                           resize_area_->is_resizing());
  UpdateExpandOnHoverState();
}

void VerticalTabStripRegionView::InstallAuxProfilePreviewAdmission(
    std::unique_ptr<aux::ProfilePreviewAdmission> admission) {
  CHECK(admission);
  CHECK(!aux_profile_preview_admission_);
  aux_profile_preview_admission_ = std::move(admission);
  aux_profile_preview_retention_ =
      std::make_unique<aux::ProfilePreviewRetention>(
          *browser_view()->browser(), *this, *aux_profile_preview_admission_,
          base::BindRepeating(
              [](VerticalTabStripRegionView* region) {
                return region->force_collapse_lock_count_ > 0;
              }, base::Unretained(this)));
  if (GetWidget())
    aux_profile_preview_retention_->AttachToWidget();
}

aux::ProfilePreviewAdmission*
VerticalTabStripRegionView::GetAuxProfilePreviewAdmission() const {
  return aux_profile_preview_admission_.get();
}

aux::ProfilePreviewRetention*
VerticalTabStripRegionView::GetAuxProfilePreviewRetention() const {
  return aux_profile_preview_retention_.get();
}

void VerticalTabStripRegionView::UpdateExpandOnHoverState(
    std::optional<bool> hovered) {
  // If not collapsed, then we shouldn't be in or entering the expand on hover
  // state.
  if (!state_controller_->ShouldDisplayVerticalTabs() ||
      !state_controller_->IsCollapsed()) {
    ResetExpandOnHoverTimers();
    is_expanded_on_hover_ = false;
    if (aux_profile_preview_admission_)
      aux_profile_preview_admission_->ResetHoverWithoutLayout();
    return;
  }

  if (suppress_expand_on_hover_ && !IsCollapseButtonHovered()) {
    suppress_expand_on_hover_ = false;
  }

  // If the force collapse lock is held, collapse the tab strip.
  if (force_collapse_lock_count_ > 0) {
    if (aux_profile_preview_admission_) {
      aux_profile_preview_admission_->ForceCollapseRetention();
      return;
    }
    if (is_expanded_on_hover_) {
      AnimateExpandOnHover(/*expand=*/false);
    }
    return;
  }

  // If the current state lock is held, reset the timers and wait.
  if (keep_current_state_lock_count_ > 0) {
    ResetExpandOnHoverTimers();
    return;
  }

  // If the keep expanded lock is held, expand the tab strip.
  if (keep_expanded_lock_count_ > 0) {
    if (!is_expanded_on_hover_) {
      AnimateExpandOnHover(/*expand=*/true);
    }
    return;
  }

  // If the window becomes inactive, then we should not enter the expand on
  // hover state or exit it if already expanded. We evaluate this after the
  // locks because IsFrameActive can also return false when a WebUI bubble is
  // open.
  if (!IsFrameActive()) {
    if (is_expanded_on_hover_) {
      AnimateExpandOnHover(/*expand=*/false);
    }
    return;
  }

  const bool pointer_inside = hovered.value_or(IsMouseHovered());
  const bool retained = aux_profile_preview_admission_ &&
                        aux_profile_preview_admission_->retained();
  const bool retained_should_show =
      retained && (aux_profile_preview_admission_->browser_retention() ||
                   aux_profile_preview_admission_->edge_retention() ||
                   pointer_inside);
  // Original34f97b8: focus alone cannot keep a retained presentation alive.
  const bool focus_should_show =
      !retained && GetFocusManager() &&
      Contains(GetFocusManager()->GetFocusedView());
  const bool should_expand =
      retained_should_show ||
      (!suppress_expand_on_hover_ &&
       state_controller_->IsExpandOnHoverEnabled() &&
       (pointer_inside || focus_should_show));

  if (pointer_inside && retained)
    expand_on_hover_timer_.Stop();

  if (!should_expand) {
    if (retained) {
      views::ViewTracker alive(this);
      alive.SetTrackEntireViewHierarchy(true);
      aux_profile_preview_admission_->ReleaseIdleRetention(pointer_inside);
      if (!alive.view())
        return;
    }
    if (is_expanded_on_hover_ && keep_current_state_lock_count_ == 0) {
      AnimateExpandOnHover(/*expand=*/false);
    } else {
      ResetExpandOnHoverTimers();
    }
    return;
  }

  // If the region is already expanded, do nothing.
  if (is_expanded_on_hover_) {
    return;
  }

  if (!hover_card_animation_lock_) {
    hover_card_animation_lock_ =
        hover_card_controller()->GetHoverCardHideLock();
  }

  // Original retained request enters immediately, before the genuine velocity
  // heuristic/delay branch. Ordinary pointer/focus keeps its existing timing.
  if (retained_should_show) {
    AnimateExpandOnHover(/*expand=*/true);
    return;
  }

  if (tabs::kVerticalTabsExpandOnHoverUseVelocityHeuristic.Get()) {
    CalculateMouseVelocityForExpandOnHover();
  } else if (expand_on_hover_timer_.IsRunning()) {
    // If the timer is already running then we are already waiting to
    // expand, so do nothing.
    return;
  } else {
    expand_on_hover_timer_.Start(
        FROM_HERE, tabs::kVerticalTabsExpandOnHoverDelay.Get(),
        base::BindOnce(&VerticalTabStripRegionView::AnimateExpandOnHover,
                       base::Unretained(this),
                       /*expand=*/true));
    if (tabs::IsExpandOnHoverClickDelayEnabled()) {
      AddPreTargetHandler(&click_handler_);
    }
  }
}

void VerticalTabStripRegionView::RestartExpandOnHoverTimer(
    const base::TimeDelta& delay) {
  if (expand_on_hover_timer_.IsRunning()) {
    expand_on_hover_timer_.Start(
        FROM_HERE, delay,
        base::BindOnce(&VerticalTabStripRegionView::AnimateExpandOnHover,
                       base::Unretained(this),
                       /*expand=*/true));
  }
}

void VerticalTabStripRegionView::OnMouseVelocityHeuristicInterval() {
  const bool should_expand =
      state_controller_->IsExpandOnHoverEnabled() &&
      (IsMouseHovered() ||
       (GetFocusManager() && Contains(GetFocusManager()->GetFocusedView())));

  if (!should_expand || is_expanded_on_hover_) {
    ResetExpandOnHoverTimers();
    return;
  }

  CalculateMouseVelocityForExpandOnHover();
}

void VerticalTabStripRegionView::CalculateMouseVelocityForExpandOnHover() {
  gfx::Point current_point = display::Screen::Get()->GetCursorScreenPoint();
  ConvertPointFromScreen(this, &current_point);

  // If this is the first mouse event within the region, initialize values.
  if (!time_at_expand_on_hover_timer_start_.has_value()) {
    point_at_expand_on_hover_timer_start_ = current_point;
    time_at_expand_on_hover_timer_start_ = base::TimeTicks::Now();
    expand_on_hover_heuristic_samples_ = 1;
    expand_on_hover_heuristic_timer_.Start(
        FROM_HERE,
        tabs::kVerticalTabsExpandOnHoverVelocityHeuristicInterval.Get(),
        base::BindRepeating(
            &VerticalTabStripRegionView::OnMouseVelocityHeuristicInterval,
            base::Unretained(this)));
    return;
  }

  // Reset the timer so it will trigger if a mouse event isn't received in the
  // specified interval.
  expand_on_hover_heuristic_timer_.Reset();

  // Increment the number of samples received.
  expand_on_hover_heuristic_samples_ += 1;

  const int dx = std::abs(current_point.x() -
                          (*point_at_expand_on_hover_timer_start_).x());
  const base::TimeDelta dt =
      base::TimeTicks::Now() - *time_at_expand_on_hover_timer_start_;

  // Wait a minimum amount of time before potentially expanding. This also
  // avoids divide by zero errors because this param is at least 0.
  if (dt <= tabs::kVerticalTabsExpandOnHoverVelocityHeuristicDelay.Get()) {
    return;
  }

  // If the mouse is close to the inside edge, wait longer till the mouse is
  // more fully inside the tab strip.
  const int distance_from_inside_edge =
      std::abs(current_point.x() - GetContentsBounds().right());
  if (dt <= tabs::kVerticalTabsExpandOnHoverVelocityHeuristicEdgeDelay.Get() &&
      distance_from_inside_edge <=
          tabs::kVerticalTabsExpandOnHoverVelocityHeuristicDistanceFromEdge
              .Get()) {
    return;
  }

  if (expand_on_hover_heuristic_samples_ >=
          tabs::kVerticalTabsExpandOnHoverVelocityHeuristicMinSamples.Get() &&
      static_cast<double>(dx) / dt.InMilliseconds() <
          tabs::kVerticalTabsExpandOnHoverVelocityHeuristicThreshold.Get()) {
    AnimateExpandOnHover(/*expand=*/true);
  }
}

void VerticalTabStripRegionView::ResetExpandOnHoverTimers() {
  hover_card_animation_lock_.reset();

  if (expand_on_hover_timer_.IsRunning()) {
    expand_on_hover_timer_.Stop();

    if (tabs::IsExpandOnHoverClickDelayEnabled()) {
      RemovePreTargetHandler(&click_handler_);
    }
  }

  if (tabs::kVerticalTabsExpandOnHoverUseVelocityHeuristic.Get()) {
    expand_on_hover_heuristic_timer_.Stop();
    time_at_expand_on_hover_timer_start_ = std::nullopt;
    point_at_expand_on_hover_timer_start_ = std::nullopt;
    expand_on_hover_heuristic_samples_ = 0;
  }
}

void VerticalTabStripRegionView::ApplyAuxProfileHoverExpansion(bool expanded) {
  is_expanded_on_hover_ = expanded;
  ResetExpandOnHoverTimers();
  if (expanded) {
    expand_on_hover_start_time_ = base::TimeTicks::Now();
    base::RecordAction(
        base::UserMetricsAction("VerticalTabs_ExpandOnHover_Show"));
  } else {
    if (expand_on_hover_start_time_.has_value()) {
      base::UmaHistogramLongTimes(
          "Tabs.VerticalTabs.ExpandOnHover.ShowDuration",
          base::TimeTicks::Now() - expand_on_hover_start_time_.value());
      expand_on_hover_start_time_.reset();
    }
    base::RecordAction(
        base::UserMetricsAction("VerticalTabs_ExpandOnHover_Hide"));
  }
  // Source4650ac4 updates layout directly; hover does not start a second
  // collapse SlideAnimation or the independent Chromium hover animator.
  InvalidateLayout();
  browser_view()->InvalidateLayout();
}

void VerticalTabStripRegionView::AnimateExpandOnHover(bool expand) {
  if (aux_profile_preview_admission_) {
    // The installed real region delegate applies the source layout/pinned-leaf
    // effects. Never run a second independent BrowserAnimationController here.
    aux_profile_preview_admission_->SetHoverExpanded(expand);
    return;
  }
  is_expanded_on_hover_ = expand;
  ResetExpandOnHoverTimers();

  if (expand) {
    expand_on_hover_start_time_ = base::TimeTicks::Now();
    base::RecordAction(
        base::UserMetricsAction("VerticalTabs_ExpandOnHover_Show"));
  } else {
    if (expand_on_hover_start_time_.has_value()) {
      base::UmaHistogramLongTimes(
          "Tabs.VerticalTabs.ExpandOnHover.ShowDuration",
          base::TimeTicks::Now() - expand_on_hover_start_time_.value());
      expand_on_hover_start_time_.reset();
    }
    base::RecordAction(
        base::UserMetricsAction("VerticalTabs_ExpandOnHover_Hide"));
  }

  BrowserAnimationController::From(browser_view()->browser())
      ->Start(TabStripAnimations::kVerticalTabStrip,
              expand ? TabStripAnimations::kExpandOnHover
                     : TabStripAnimations::kCollapseOnHover);
}

void VerticalTabStripRegionView::RegisterExpandOnHoverLock(
    VerticalTabStripExpandOnHoverLock* lock) {
  hover_locks_.insert(lock);
  ExpandOnHoverLockType lock_type = lock->lock_type();
  switch (lock_type) {
    case ExpandOnHoverLockType::kForceCollapse: {
      force_collapse_lock_count_++;
      break;
    }
    case ExpandOnHoverLockType::kKeepCurrentState: {
      keep_current_state_lock_count_++;
      break;
    }
    case ExpandOnHoverLockType::kKeepExpanded: {
      keep_expanded_lock_count_++;
      break;
    }
  }
  UpdateExpandOnHoverState();
}

void VerticalTabStripRegionView::UnregisterExpandOnHoverLock(
    VerticalTabStripExpandOnHoverLock* lock) {
  hover_locks_.erase(lock);
  ExpandOnHoverLockType lock_type = lock->lock_type();
  switch (lock_type) {
    case ExpandOnHoverLockType::kForceCollapse: {
      CHECK_GT(force_collapse_lock_count_, 0);
      force_collapse_lock_count_--;
      if (force_collapse_lock_count_ == 0) {
        UpdateExpandOnHoverState();
      }
      break;
    }
    case ExpandOnHoverLockType::kKeepCurrentState: {
      CHECK_GT(keep_current_state_lock_count_, 0);
      keep_current_state_lock_count_--;
      if (keep_current_state_lock_count_ == 0) {
        UpdateExpandOnHoverState();
      }
      break;
    }
    case ExpandOnHoverLockType::kKeepExpanded: {
      CHECK_GT(keep_expanded_lock_count_, 0);
      keep_expanded_lock_count_--;
      if (keep_expanded_lock_count_ == 0) {
        UpdateExpandOnHoverState();
      }
      break;
    }
  }
}

void VerticalTabStripRegionView::OnOmniboxPopupVisibilityChanged(bool is_open) {
  if (is_open) {
    if (!omnibox_open_lock_) {
      omnibox_open_lock_ =
          GetExpandOnHoverLock(ExpandOnHoverLockType::kForceCollapse);
      UpdateExpandOnHoverState();
    }
  } else {
    omnibox_open_lock_.reset();
  }
}

void VerticalTabStripRegionView::OnActiveTabChanged(
    const tabs::TabInterface* active_tab) {
  BaseTabStripRegionView::OnActiveTabChanged(active_tab);
  omnibox_tab_helper_observation_.Reset();

  if (active_tab) {
    OmniboxTabHelper* const tab_helper =
        OmniboxTabHelper::FromWebContents(active_tab->GetContents());
    if (tab_helper) {
      omnibox_tab_helper_observation_.Observe(tab_helper);
    }
  }
}

// The SAME +940 timer and actual region's lock counters are used by both
// retained release and expand-on-hover. No independent timer is installed.
void VerticalTabStripRegionView::StopSharedHoverTimer() {
  expand_on_hover_timer_.Stop();
}
bool VerticalTabStripRegionView::SharedHoverTimerIsRunning() const {
  return expand_on_hover_timer_.IsRunning();
}
void VerticalTabStripRegionView::StartSharedHoverTimer(
    base::TimeDelta delay, base::OnceClosure callback) {
  expand_on_hover_timer_.Start(FROM_HERE, delay, std::move(callback));
}
bool VerticalTabStripRegionView::RetainedPointerInside() const {
  return aux_profile_preview_retention_ &&
         aux_profile_preview_retention_->RetainedPointerInside();
}
bool VerticalTabStripRegionView::KeepExpandedLocked() const {
  return keep_expanded_lock_count_ > 0;
}
void VerticalTabStripRegionView::UpdateExpandOnHover(
    std::optional<bool> hovered) {
  UpdateExpandOnHoverState(hovered);
}
void VerticalTabStripRegionView::RetentionAcquired() {
  // Original46505xx: retire the genuine caption exclusion geometry while the
  // collapsed strip is retained over content, then recompute its real layout.
  top_button_container_->SetToolbarHeightForLayout(0);
  top_button_container_->SetCaptionButtonWidthForLayout(0);
  top_button_container_->SetIsExitingExpandOnHoverForLayout(false);
  top_button_container_->SetAuxProfilePreviewPresentation(
      aux_profile_preview_admission_->VisuallyCollapsed(), true);
}
void VerticalTabStripRegionView::SetAuxProfilePreviewPinnedWidth() {
  const int target = aux_profile_preview_admission_->retained()
                         ? std::max(280, uncollapsed_width())
                         : uncollapsed_width();
  const auto* margins = pinned_tab_entries_->GetProperty(views::kMarginsKey);
  pinned_tab_entries_->SetLayoutWidthOverride(
      std::max(0, target - (margins ? margins->width() : 0)));
}
void VerticalTabStripRegionView::HoverExpandedChanged(bool expanded) {
  SetAuxProfilePreviewPinnedWidth();
  ApplyAuxProfileHoverExpansion(expanded);
  ApplyRetainedLayout();
}
void VerticalTabStripRegionView::HoldAuxProfileHeaderGeometry() {
  if (!aux_profile_header_ || aux_profile_header_holding_)
    return;
  aux_profile_header_holding_ = true;
  auto* header = aux_profile_header_.get();
  auto* profile = header->profile_button();
  auto* pager = header->pager();
  auto* search = header->search_button();
  // Source7a4 is the hold request; source7a0 is separate valid geometry.
  // Borrowed/hidden/unlaid-out leaves never become fabricated held bounds.
  if (header->parent() != this || !header->GetVisible() ||
      header->bounds().IsEmpty() || profile->parent() != header ||
      !profile->GetVisible() || profile->bounds().IsEmpty() ||
      search->parent() != header ||
      (search->GetVisible() && search->bounds().IsEmpty()) ||
      pager->parent() != header ||
      (pager->GetVisible() && pager->bounds().IsEmpty())) {
    return;
  }
  aux_profile_header_held_bounds_ = header->bounds();
  aux_profile_pager_held_visibility_ = pager->GetVisible();
  header->SetHeldChildBounds(
      aux::VerticalTabSidebarProfileHeader::HeldChildBounds{
          profile->bounds(), pager->bounds(), search->bounds()});
}
void VerticalTabStripRegionView::ReleaseAuxProfileHeaderGeometry() {
  aux_profile_header_holding_ = false;
  aux_profile_header_held_bounds_.reset();
  aux_profile_pager_held_visibility_.reset();
  if (aux_profile_header_)
    aux_profile_header_->SetHeldChildBounds(std::nullopt);
}
void VerticalTabStripRegionView::CollapseTransitionStarted() {
  if (tab_strip_view())
    tab_strip_view()->SetIsAnimatingSize(true);
  SetAuxProfilePreviewPinnedWidth();
  HoldAuxProfileHeaderGeometry();
}
void VerticalTabStripRegionView::CollapseTransitionProgressed() {
  if (tab_strip_view())
    tab_strip_view()->SetIsAnimatingSize(true);
  ApplyRetainedLayout();
}
void VerticalTabStripRegionView::CollapseTransitionSettled(bool completed) {
  if (tab_strip_view())
    tab_strip_view()->SetIsAnimatingSize(false);
  pinned_tab_entries_->SetLayoutWidthOverride(std::nullopt);
  ReleaseAuxProfileHeaderGeometry();
  ApplyRetainedLayout();
  auto alive = aux_preview_weak_factory_.GetWeakPtr();
  if (completed) {
    views::ElementTrackerViews::GetInstance()->NotifyCustomEvent(
        kAnimationCompletedEvent, this);
  }
  if (alive && aux_profile_preview_capture_)
    aux_profile_preview_capture_->Request(base::Milliseconds(120));
}
void VerticalTabStripRegionView::CollapseStateChanged(bool collapsed) {
  // Update the genuine controller, not an auxiliary pref or guessed state.
  auto alive = aux_preview_weak_factory_.GetWeakPtr();
  if (update_state_controller_collapsed_callback_)
    update_state_controller_collapsed_callback_.Run(collapsed);
  if (alive)
    ApplyRetainedLayout();
}
void VerticalTabStripRegionView::ApplyRetainedLayout() {
  const auto* admission = aux_profile_preview_admission_.get();
  if (!admission)
    return;
  const bool compact = admission->VisuallyCollapsed();
  const bool narrow = !admission->AdmitsProfilePreview(width());
  const bool animating = admission->collapse_animating() ||
                         admission->expanding_from_collapsed();
  top_button_container_->SetAuxProfilePreviewPresentation(
      compact, admission->retained());
  pinned_tab_entries_->SetCompactPresentation(compact);
  aux_sidebar_->ApplyPresentation();
  top_button_separator_->SetVisible(compact);
  bottom_button_container_->SetVisible(compact);
  resize_area_width_ = compact ? kCollapsedResizeAreaWidth : kResizeAreaWidth;
  resize_area_->SetVisible(!target_collapse_state_.collapsed ||
                           !state_controller_->IsExpandOnHoverEnabled() ||
                           resize_area_->is_resizing());
  if (aux_profile_header_) {
    aux_profile_header_->SetVisible(aux_profile_header_holding_ || !narrow);
    const bool label_suppressed = !target_collapse_state_.collapsed ||
        (!admission->hover_expanded() && !admission->retained());
    aux_profile_header_->SetPresentation(
        compact, label_suppressed, std::nullopt, narrow,
        aux_profile_header_held_bounds_
            ? aux_profile_pager_held_visibility_ : std::nullopt);
  }
  if (tab_strip_view())
    tab_strip_view()->SetCollapsedState(narrow && !animating);
  InvalidateLayout();
  browser_view()->InvalidateLayout();
}

views::View* VerticalTabStripRegionView::GetAuxProfileHeaderContainer() const {
  return aux_profile_header_;
}
aux::VerticalTabSidebarProfileButton*
VerticalTabStripRegionView::GetAuxSidebarProfileButton() const {
  return aux_profile_header_ ? aux_profile_header_->profile_button() : nullptr;
}
aux::ProfileSearchButton*
VerticalTabStripRegionView::GetAuxSidebarSearchButton() const {
  return aux_profile_header_ ? aux_profile_header_->search_button() : nullptr;
}
bool VerticalTabStripRegionView::AdmitsAuxProfilePreview() const {
  return browser_view() && browser_view()->ShouldDrawVerticalTabStrip() &&
      aux_profile_preview_admission_ &&
      aux_profile_preview_admission_->AdmitsProfilePreview(width()) &&
      force_collapse_lock_count_ == 0;
}
bool VerticalTabStripRegionView::AuxProfilePreviewIdle() const {
  return aux_profile_preview_input_ && aux_profile_preview_input_->idle();
}
bool VerticalTabStripRegionView::SelectAuxProfilePreview(
    const base::FilePath& target) {
  return aux_profile_preview_input_ &&
         aux_profile_preview_input_->Select(target);
}
gfx::ImageSkia VerticalTabStripRegionView::FindAuxProfilePreviewImage(
    const base::FilePath& path) const {
  return aux_profile_preview_capture_ ? aux_profile_preview_capture_->Find(path)
                                      : gfx::ImageSkia();
}
std::optional<aux::ProfilePreviewCaptureGeometry>
VerticalTabStripRegionView::AuxProfilePreviewCaptureGeometry() const {
  if (!AuxProfilePreviewIdle() || !AdmitsAuxProfilePreview() ||
      !aux_profile_header_ || !tab_strip_view() ||
      aux_profile_header_->parent() != this) {
    return std::nullopt;
  }
  auto* scroll = aux_sidebar_.get();
  if (!scroll || !Contains(scroll))
    return std::nullopt;
  auto bounds = GetLocalBounds();
  // Original4659080 capture starts below the real top-button container and
  // contains the genuine header and scroll surfaces, not a sidebar stand-in.
  bounds.Inset(gfx::Insets::TLBR(top_button_container_->bounds().bottom(),
                               0, 0, 0));
  return aux::ProfilePreviewCaptureGeometry{
      bounds, aux_profile_header_.get(), scroll,
      {bottom_button_container_.get(), tab_strip_view(), gemini_button_.get()}};
}
void VerticalTabStripRegionView::InitializeAuxProfilePreview() {
  if (!aux_profile_header_ || !tab_strip_view() ||
      aux_profile_preview_input_ || !aux_profile_preview_admission_)
    return;
  auto* scroll = aux_sidebar_.get();
  CHECK(scroll);
  auto& browser = *browser_view()->browser();
  aux_profile_preview_capture_ =
      std::make_unique<aux::ProfilePreviewCaptureCache>(
          browser, *this,
          base::BindRepeating(
              [](base::WeakPtr<VerticalTabStripRegionView> region)
                  -> std::optional<aux::ProfilePreviewCaptureGeometry> {
                return region ? region->AuxProfilePreviewCaptureGeometry()
                              : std::nullopt;
              }, aux_preview_weak_factory_.GetWeakPtr()));
  if (!aux_profile_preview_owner_)
    aux_profile_preview_owner_ =
        std::make_unique<aux::ProfilePreviewRegionOwner>(browser, *this);
  aux_profile_preview_input_ = std::make_unique<aux::ProfilePreviewInput>(
      browser, *this, *scroll, *aux_profile_preview_owner_,
      base::BindRepeating(
          [](base::WeakPtr<VerticalTabStripRegionView> region) {
            return region && region->AdmitsAuxProfilePreview();
          }, aux_preview_weak_factory_.GetWeakPtr()));
  if (GetWidget())
    aux_profile_preview_input_->AttachToWidget();
  ApplyRetainedLayout();
  aux_profile_preview_capture_->Request(base::Milliseconds(120));
}
void VerticalTabStripRegionView::RetireAuxProfilePreviewInput() {
  if (aux_profile_preview_input_)
    aux_profile_preview_input_->DetachFromWidget();
  aux_profile_preview_input_.reset();
}

BEGIN_METADATA(VerticalTabStripRegionView)
END_METADATA

TabDragTarget* VerticalTabStripRegionView::GetTabDragTarget(
    const gfx::Point& point_in_screen) {
  if (aux_sidebar_->IsPublishingProjection()) return nullptr;
  if (!GetDragContext()) return nullptr;
  if (auto* target = aux_sidebar_->GetProvidedSavedDropTarget(point_in_screen))
    return target;
  auto* pinned = GetPinnedTabsContainer();
  const bool empty_drop = pinned && aux::CalculateAuxEmptyPinnedDropActive(
      GetDragContext(), *pinned, *this, aux_sidebar_, point_in_screen);
  if (empty_drop != aux_empty_pinned_drop_active_) {
    aux_empty_pinned_drop_active_ = empty_drop;
    RefreshAuxPinnedPresentation();
    aux_sidebar_->InvalidateLayout();
    aux_sidebar_->SchedulePaint();
    InvalidateLayout();
    SchedulePaint();
  }
  if (pinned &&
      (empty_drop || pinned->GetBoundsInScreen().Contains(point_in_screen)))
    return &pinned->GetTabDragTarget(point_in_screen);
  auto* bookmark_target = aux_sidebar_->GetProvidedBookmarkDropTarget(point_in_screen);
  auto* strip = tab_strip_view();
  if (bookmark_target && (!strip || point_in_screen.y() < strip->GetBoundsInScreen().y()))
    return bookmark_target;
  if (strip && GetTabStripDraggableBounds().Contains(point_in_screen)) {
    if (auto* unpinned = strip->GetUnpinnedTabsContainer())
      return &unpinned->GetTabDragTarget(point_in_screen);
    return nullptr;
  }
  return bookmark_target;
}
