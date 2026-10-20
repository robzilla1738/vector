// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_VERTICAL_TAB_STRIP_REGION_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_VERTICAL_TAB_STRIP_REGION_VIEW_H_

#include <array>
#include <memory>
#include <optional>
#include <cstdint>

#include "base/callback_list.h"
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/containers/flat_set.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_capture_cache.h"
#include "ui/gfx/image/image_skia.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/animation/browser_animation_types.h"
#include "chrome/browser/ui/omnibox/omnibox_tab_helper.h"
#include "chrome/browser/ui/tabs/tab_data.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/views/frame/base_tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_view.h"
#include "chrome/browser/ui/views/tabs/hovercard/tab_hover_card_controller.h"
#include "chrome/browser/ui/views/tabs/shared/drop_arrow.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_expand_on_hover_lock.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/base/interaction/element_tracker.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/events/event_handler.h"
#include "ui/gfx/geometry/point.h"
#include "ui/views/accessible_pane_view.h"
#include "ui/views/controls/resize_area_delegate.h"
#include "ui/views/focus/focus_manager.h"

class Browser;
namespace aux {
class ProfilePreviewRegionOwner;
class ProfilePreviewAdmission;
class ProfilePreviewRetention;
class ProfilePreviewInput;
class VerticalTabSidebarProfileHeader;
class VerticalTabSidebarProfileButton;
class ProfileSearchButton;
}

class BrowserView;
class Profile;
class VerticalPinnedTabEntriesView;
class VerticalTabStripTopContainer;
class VerticalTabStripBottomContainer;
class VerticalTabStripFocusSwipeController;
class ShadowFrameView;

namespace tabs {
class VerticalTabStripStateController;
}  // namespace tabs

namespace views {
class ResizeArea;
class Separator;
class View;
class FlexLayout;
}  // namespace views

// Container for the vertical tabstrip and the other views sharing space with
// it, excluding the caption buttons.
class VerticalTabStripRegionView final
    : public BaseTabStripRegionView,
      public views::ResizeAreaDelegate,
      public OmniboxTabHelper::Observer,
      public tabs::VerticalTabStripStateController::Delegate,
      public aux::ProfilePreviewAdmission::Delegate {
  METADATA_HEADER(VerticalTabStripRegionView, BaseTabStripRegionView)

 public:
  DECLARE_CLASS_CUSTOM_ELEMENT_EVENT_TYPE(kAnimationCompletedEvent);

  // TODO(crbug.com/465833741): Replace constant with derived value based on
  // caption buttons.
  static constexpr int kUncollapsedMinWidth = 126;
  // TODO(crbug.com/465832180): Replace constant based width final max width for
  // view.
  static constexpr int kUncollapsedMaxWidth = 400;
  static constexpr int kCollapsedWidth = 56;
  // TODO(crbug.com/465833741): Determine snapping behavior.
  static constexpr int kCollapseSnapWidth =
      (kUncollapsedMinWidth + kCollapsedWidth) / 2;

  explicit VerticalTabStripRegionView(
      tabs::VerticalTabStripStateController* state_controller,
      actions::ActionItem* root_action_item,
      BrowserView* browser_view);
  VerticalTabStripRegionView(const VerticalTabStripRegionView&) = delete;
  VerticalTabStripRegionView& operator=(const VerticalTabStripRegionView&) =
      delete;
  ~VerticalTabStripRegionView() override;

  // The real region owns the actual sidebar/footer; retain these views and
  // their callback lists across the supplied same-window transaction.
  bool CanRebindForAuxProfileSwitch(Profile* target) const;
  uint64_t BeginAuxProfileSwitch(Profile* target);
  void EndAuxProfileSwitch(uint64_t generation);

  views::View* GetPinnedTabEntriesViewForAuxProfilePreview();
  // Exact original five role members, projected through155 live ownership.
  std::array<views::View*, 5> GetAuxProfilePreviewSurfaces() const;
  views::View* GetAuxProfilePreviewTopBoundary() const;
  // Installed only with the real region effect delegate/collapse owner.
  // Installation does not attach preview input or invoke native capture.
  void InstallAuxProfilePreviewAdmission(
      std::unique_ptr<aux::ProfilePreviewAdmission> admission);
  aux::ProfilePreviewAdmission* GetAuxProfilePreviewAdmission() const;
  aux::ProfilePreviewRetention* GetAuxProfilePreviewRetention() const;
  // Actual header parent and leaves, never the whole Sidebar substitute.
  views::View* GetAuxProfileHeaderContainer() const;
  aux::VerticalTabSidebarProfileButton* GetAuxSidebarProfileButton() const;
  aux::ProfileSearchButton* GetAuxSidebarSearchButton() const;
  bool SelectAuxProfilePreview(const base::FilePath& target);
  bool AuxProfilePreviewIdle() const;
  gfx::ImageSkia FindAuxProfilePreviewImage(const base::FilePath& path) const;
  // Real delegate calls after setting actual pinned temporary width.
  void ApplyAuxProfileHoverExpansion(bool expanded);

  // Genuine original page owner. The source input controller, not these
  // methods, owns exact gesture admission, progress and frame timing.
  bool BeginAuxProfilePreview(const base::FilePath& target, int direction);
  void UpdateAuxProfilePreview(float progress);
  void OnAuxProfilePreviewFrame();
  bool CommitAuxProfilePreview(base::OnceCallback<void(Browser*)> completion);
  void CancelAuxProfilePreview();



  TabDragTarget* GetTabDragTarget(const gfx::Point& point_in_screen) override;

  VerticalTabStripTopContainer* GetTopContainer() {
    return top_button_container_;
  }

  VerticalTabStripBottomContainer* GetBottomContainer() {
    return bottom_button_container_;
  }

  bool IsPositionInWindowCaption(const gfx::Point& point) override;

  // These methods provide the toolbar height and exclusion width, before the
  // layout of this view, for use in calculating positioning of child views. If
  // an exclusion width is provided, nothing can be rendered within the
  // rectangle defined by `(caption_button_width, toolbar_height)` that is
  // aligned to the leading, top corner.
  void SetToolbarHeightForLayout(int toolbar_height);
  void SetCaptionButtonWidthForLayout(int caption_button_width);
  void SetIsExitingExpandOnHoverForLayout(bool is_exiting_expand_on_hover);
  void SetTransitionButtonOpacity(float opacity);
  bool WillWrapDueToOverflow(int available_width) const;

  // views::View:
  void AddedToWidget() override;
  void RemovedFromWidget() override;
  void Layout(PassKey) override;
  views::View* GetDefaultFocusableChild() override;
  gfx::Size GetMinimumSize() const override;
  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;
  bool OnKeyPressed(const ui::KeyEvent& event) override;
  void OnMouseEntered(const ui::MouseEvent& event) override;
  void OnMouseMoved(const ui::MouseEvent& event) override;
  void OnMouseExited(const ui::MouseEvent& event) override;

  std::unique_ptr<ExpandOnHoverLock> GetExpandOnHoverLock(
      ExpandOnHoverLockType lock_type) override;

  // BrowserRootView::DropTarget:
  void HandleDragUpdate(
      const std::optional<BrowserRootView::DropIndex>& index) override;
  void HandleDragExited() override;
  gfx::Point GetLinkDropArrowPosition(
      const BrowserRootView::DropIndex& drop_index,
      DropArrow::Direction* direction) override;

  // views::ResizeAreaDelegate:
  void OnResize(int resize_amount, bool done_resizing) override;

  // tabs::VerticalTabStripStateController::Delegate
  void SetCollapsedStateUpdatedCallback(
      base::RepeatingCallback<void(bool)> callback) override;
  bool IsCollapsing() override;
  void RequestCollapse(bool collapse) override;

  views::Separator* tabs_separator_for_testing() {
    return tab_strip_view() ? tab_strip_view()->GetTabsSeparator() : nullptr;
  }

  bool is_expanded_on_hover() const { return is_expanded_on_hover_; }
  ShadowFrameView* shadow_frame() { return shadow_frame_; }
  int uncollapsed_width() const {
    return target_collapse_state_.uncollapsed_width;
  }

  views::ResizeArea* resize_area_for_testing() { return resize_area_; }
  tabs::VerticalTabStripState target_collapse_state_for_testing() {
    return target_collapse_state_;
  }

  VerticalTabStripFocusSwipeController* focus_swipe_controller_for_testing() {
    return focus_swipe_controller_.get();
  }

 private:
  // Since VerticalTabStripRegionView inherits from AccessiblePaneView, which is
  // a FocusChangeListener, we need to have a separate focus listener to avoid
  // conflicts with the base class implementation which conditionally listens
  // for focus changes.
  class RegionViewFocusListener : public views::FocusChangeListener {
   public:
    explicit RegionViewFocusListener(VerticalTabStripRegionView* region_view);
    RegionViewFocusListener(const RegionViewFocusListener&) = delete;
    RegionViewFocusListener& operator=(const RegionViewFocusListener&) = delete;
    ~RegionViewFocusListener() override = default;

    // views::FocusChangeListener:
    void OnDidChangeFocus(views::View* focused_before,
                          views::View* focused_now) override;

   private:
    raw_ptr<VerticalTabStripRegionView> region_view_;
  };

  // To avoid extra motion during expand on hover when the user doesn't need the
  // expanded state, we reset the expand on hover timer when the user clicks on
  // a tab to give them time to exit the tab strip before triggering the expand
  // on hover state. This class listens for those click events to restart the
  // timer.
  class ClickEventHandler : public ui::EventHandler {
   public:
    explicit ClickEventHandler(VerticalTabStripRegionView* region_view);
    ClickEventHandler(const ClickEventHandler&) = delete;
    ClickEventHandler& operator=(const ClickEventHandler&) = delete;
    ~ClickEventHandler() override = default;

    // ui::EventHandler:
    void OnMouseEvent(ui::MouseEvent* event) override;

   private:
    raw_ptr<VerticalTabStripRegionView> region_view_;
  };

  // Used to create and destroy locks for the expand on hover state.
  friend class VerticalTabStripExpandOnHoverLock;

  void HandleMouseExited();

  void OnTabStripViewSet() override;
  void OnTabStripViewWillClear() override;

  void OnCollapseStateChanged(
      tabs::VerticalTabStripCollapseState collapse_state);

  void UpdateColors();

  void OnAnimationProgressed(const BrowserAnimationController* controller,
                             BrowserAnimationUpdate status);

  // Get whether the collapse/expand animation is running.
  bool IsAnimatingSize() const;

  bool IsFrameActive() const;
  bool IsCollapseButtonHovered() const;

  // Returns the bounds within which tabs can be dragged in the vertical tab
  // strip.
  gfx::Rect GetTabStripDraggableBounds() const override;

  void OnExpandOnHoverEnabledChanged(bool enabled);
  void UpdateExpandOnHoverState(std::optional<bool> hovered = std::nullopt);
  void RestartExpandOnHoverTimer(const base::TimeDelta& delay);
  void OnMouseVelocityHeuristicInterval();
  void CalculateMouseVelocityForExpandOnHover();
  void ResetExpandOnHoverTimers() override;
  void AnimateExpandOnHover(bool expand);

  void RegisterExpandOnHoverLock(VerticalTabStripExpandOnHoverLock* lock);
  void UnregisterExpandOnHoverLock(VerticalTabStripExpandOnHoverLock* lock);

  // OmniboxTabHelper::Observer:
  void OnOmniboxInputStateChanged() override {}
  void OnOmniboxInputInProgress(bool in_progress) override {}
  void OnOmniboxFocusChanged(OmniboxFocusState state,
                             OmniboxFocusChangeReason reason) override {}
  void OnOmniboxPopupVisibilityChanged(bool is_open) override;

  void OnActiveTabChanged(const tabs::TabInterface* active_tab) override;

  // ProfilePreviewAdmission::Delegate. The original +940 timer is shared,
  // not a second release timer or an independent animation controller.
  void StopSharedHoverTimer() override;
  bool SharedHoverTimerIsRunning() const override;
  void StartSharedHoverTimer(base::TimeDelta, base::OnceClosure) override;
  bool RetainedPointerInside() const override;
  bool KeepExpandedLocked() const override;
  void UpdateExpandOnHover(std::optional<bool>) override;
  void RetentionAcquired() override;
  void HoverExpandedChanged(bool) override;
  void CollapseTransitionStarted() override;
  void CollapseTransitionProgressed() override;
  void CollapseTransitionSettled(bool) override;
  void CollapseStateChanged(bool) override;
  void ApplyRetainedLayout() override;
  void InitializeAuxProfilePreview();
  void RetireAuxProfilePreviewInput();
  bool AdmitsAuxProfilePreview() const;
  std::optional<aux::ProfilePreviewCaptureGeometry>
      AuxProfilePreviewCaptureGeometry() const;
  void SetAuxProfilePreviewPinnedWidth();
  void HoldAuxProfileHeaderGeometry();
  void ReleaseAuxProfileHeaderGeometry();

  raw_ptr<VerticalTabStripTopContainer> top_button_container_ = nullptr;
  raw_ptr<views::Separator> top_button_separator_ = nullptr;
  raw_ptr<VerticalPinnedTabEntriesView> pinned_tab_entries_ = nullptr;
  std::optional<uint64_t> pinned_profile_switch_generation_;
  uint64_t pinned_profile_switch_next_generation_ = 0;
  raw_ptr<VerticalTabStripBottomContainer> bottom_button_container_ = nullptr;
  raw_ptr<views::View> gemini_button_ = nullptr;
  raw_ptr<views::ResizeArea> resize_area_ = nullptr;
  raw_ptr<ShadowFrameView> shadow_frame_ = nullptr;
  int resize_area_width_;
  raw_ptr<views::FlexLayout> flex_layout_ = nullptr;

  const raw_ptr<tabs::VerticalTabStripStateController> state_controller_;
  std::optional<base::CallbackListSubscription>
      expand_on_hover_enabled_changed_subscription_;
  std::optional<base::CallbackListSubscription>
      on_animation_update_subscription_;
  base::ScopedObservation<OmniboxTabHelper, OmniboxTabHelper::Observer>
      omnibox_tab_helper_observation_{this};

  // The width of the vertical tabstrip at the beginning of the current resize
  // operation. Is std::nullopt when not resizing.
  std::optional<int> starting_width_on_resize_;

  // The intended collapse state by the user as a result of dragging the resize
  // area. This differs from the state controller in that its uncollapsed_width
  // updates throughout a drag operation, whereas the state controller only
  // updates its uncollapsed width when a drag-to-uncollapse operation ends.
  // Additionally, when collapsing, the target_collapse_state_ will be collapsed
  // when the animation starts, but the state controller will only be updated
  // when the animation ends.
  tabs::VerticalTabStripState target_collapse_state_;

  base::CallbackListSubscription collapsed_state_changed_subscription_;
  base::RepeatingCallback<void(bool)>
      update_state_controller_collapsed_callback_;

  base::OneShotTimer expand_on_hover_timer_;
  bool is_expanded_on_hover_ = false;
  bool suppress_expand_on_hover_ = false;
  std::optional<base::TimeTicks> expand_on_hover_start_time_;
  base::RetainingOneShotTimer expand_on_hover_heuristic_timer_;
  std::optional<gfx::Point> point_at_expand_on_hover_timer_start_;
  std::optional<base::TimeTicks> time_at_expand_on_hover_timer_start_;
  int expand_on_hover_heuristic_samples_ = 0;

  // Given that both lock counters are non-zero, force_collapse_lock_count_ will
  // always take precedence.
  int force_collapse_lock_count_ = 0;
  int keep_current_state_lock_count_ = 0;
  int keep_expanded_lock_count_ = 0;
  std::unique_ptr<ExpandOnHoverLock> omnibox_open_lock_;
  std::unique_ptr<ExpandOnHoverLock> link_drag_lock_;
  base::flat_set<raw_ptr<VerticalTabStripExpandOnHoverLock>> hover_locks_;

  std::unique_ptr<TabHoverCardController::ScopedHideHoverCardLock>
      hover_card_animation_lock_;

  RegionViewFocusListener focus_listener_{this};
  ClickEventHandler click_handler_{this};
  std::unique_ptr<VerticalTabStripFocusSwipeController> focus_swipe_controller_;

  // Allows the swipe controller to inspect tab dragging state and rotate
  // focused tab groups on the TabStripModel.
  friend class VerticalTabStripFocusSwipeController;

  // The mouse exit event debounce timer.
  base::OneShotTimer mouse_exit_timer_;

  base::CallbackListSubscription paint_as_active_subscription_;
  raw_ptr<aux::VerticalTabSidebarProfileHeader> aux_profile_header_ = nullptr;
  std::optional<gfx::Rect> aux_profile_header_held_bounds_;
  std::optional<bool> aux_profile_pager_held_visibility_;
  bool aux_profile_header_holding_ = false;
  std::unique_ptr<aux::ProfilePreviewCaptureCache> aux_profile_preview_capture_;
  std::unique_ptr<aux::ProfilePreviewRegionOwner> aux_profile_preview_owner_;
  std::unique_ptr<aux::ProfilePreviewInput> aux_profile_preview_input_;
  std::unique_ptr<aux::ProfilePreviewAdmission> aux_profile_preview_admission_;
  std::unique_ptr<aux::ProfilePreviewRetention> aux_profile_preview_retention_;
  base::WeakPtrFactory<VerticalTabStripRegionView> aux_preview_weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_VERTICAL_TAB_STRIP_REGION_VIEW_H_
