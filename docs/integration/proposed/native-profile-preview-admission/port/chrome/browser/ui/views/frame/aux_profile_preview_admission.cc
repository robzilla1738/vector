// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"

#include <algorithm>
#include <cmath>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/location.h"
#include "chrome/browser/ui/ui_features.h"
#include "ui/gfx/animation/animation.h"
#include "ui/gfx/animation/tween.h"

namespace aux {
ProfilePreviewAdmission::ProfilePreviewAdmission(Delegate& delegate,
    bool collapsed, int uncollapsed_width)
    : delegate_(delegate), collapsed_(collapsed),
      uncollapsed_width_(uncollapsed_width) {
  // Original ctor37e4598..4638 overrides SlideAnimation's 120ms default.
  const bool flyover = features::UseSidePanelFlyoverAnimation();
  collapse_.SetSlideDuration(gfx::Animation::RichAnimationDuration(
      base::Milliseconds(flyover ? 350 : 450)));
  collapse_.SetTweenType(flyover ? gfx::Tween::ACCEL_30_DECEL_20_85
                               : gfx::Tween::EASE_IN_OUT_EMPHASIZED);
  collapse_.Reset(collapsed ? 0 : 1);
}

ProfilePreviewAdmission::~ProfilePreviewAdmission() = default;

void ProfilePreviewAdmission::SetBrowserRetention(bool requested) {
  // 465ab90: an expanded region never acquires the collapsed retention latch.
  requested = requested && collapsed_;
  if (browser_retention_ == requested)
    return;
  browser_retention_ = requested;
  if (requested) {
    if (!retained_)
      AcquireRetention();
  } else {
    ScheduleRelease();
  }
}

void ProfilePreviewAdmission::SetEdgeRetention(bool requested) {
  // 4650500: eligibility (real widget/activity/force-collapse) belongs to the
  // native event producer. Clearing the producer also clears its request.
  if (edge_retention_ == requested)
    return;
  edge_retention_ = requested;
  if (requested)
    AcquireRetention();
  else if (retained_)
    ScheduleRelease();
}

void ProfilePreviewAdmission::AcquireRetention() {
  auto weak = weak_factory_.GetWeakPtr();
  delegate_->StopSharedHoverTimer();
  if (!weak)
    return;
  retained_ = true;
  ScheduleRetentionCheck();
  delegate_->RetentionAcquired();
  if (weak)
    delegate_->UpdateExpandOnHover(std::nullopt);
}

void ProfilePreviewAdmission::ScheduleRelease() {
  // 4641b54 shares +940 with hover expansion. It never starts a second pending
  // task when that timer already runs. The callback rechecks the real pointer.
  if (delegate_->SharedHoverTimerIsRunning())
    return;
  delegate_->StartSharedHoverTimer(base::Milliseconds(500), base::BindOnce(
      &ProfilePreviewAdmission::ReleaseIfPointerOutside,
      weak_factory_.GetWeakPtr()));
}

void ProfilePreviewAdmission::ReleaseIfPointerOutside() {
  auto weak = weak_factory_.GetWeakPtr();
  const bool inside = delegate_->RetainedPointerInside();
  if (!weak)
    return;
  if (!inside) {
    ClearRetention();
    return;
  }
  ScheduleRetentionCheck();
  delegate_->UpdateExpandOnHover(true);
}

void ProfilePreviewAdmission::ScheduleRetentionCheck() {
  if (retained_ && !retained_check_.IsRunning()) {
    retained_check_.Start(FROM_HERE, base::Milliseconds(100), base::BindRepeating(
        &ProfilePreviewAdmission::CheckRetention, weak_factory_.GetWeakPtr()));
  }
}

void ProfilePreviewAdmission::CheckRetention() {
  if (!retained_) {
    retained_check_.Stop();
    return;
  }
  if (browser_retention_ || edge_retention_)
    return;
  auto weak = weak_factory_.GetWeakPtr();
  const bool inside = delegate_->RetainedPointerInside();
  if (weak && !inside)
    ClearRetention();
}

void ProfilePreviewAdmission::ClearRetention() {
  auto weak = weak_factory_.GetWeakPtr();
  delegate_->StopSharedHoverTimer();
  if (!weak)
    return;
  if (delegate_->KeepExpandedLocked()) {
    delegate_->UpdateExpandOnHover(std::nullopt);
    return;
  }
  retained_check_.Stop();
  browser_retention_ = edge_retention_ = false;
  if (hover_expanded_) {
    SetHoverExpanded(false);
  } else if (retained_) {
    retained_ = false;
    delegate_->ApplyRetainedLayout();
  }
}

void ProfilePreviewAdmission::ForceCollapseRetention() {
  // 34f96a0: force-collapse clears a0a/a0c, but does not invent an a0b reset.
  auto weak = weak_factory_.GetWeakPtr();
  delegate_->StopSharedHoverTimer();
  if (!weak)
    return;
  retained_check_.Stop();
  browser_retention_ = retained_ = false;
  delegate_->ResetExpandOnHoverTimers();
  if (!weak)
    return;
  if (hover_expanded_)
    SetHoverExpanded(false);
  else
    delegate_->ApplyRetainedLayout();
}

void ProfilePreviewAdmission::ReleaseIdleRetention(bool pointer_inside) {
  // 34f9840: only the genuine UpdateExpandOnHover decision supplies pointer.
  if (!retained_ || browser_retention_ || edge_retention_ || pointer_inside ||
      hover_expanded_)
    return;
  retained_ = false;
  retained_check_.Stop();
  delegate_->ApplyRetainedLayout();
}

void ProfilePreviewAdmission::SetHoverExpanded(bool expanded) {
  hover_expanded_ = expanded;
  // 4650a04 updates real pinned temporary width, timers and layout through the
  // same region owner. Retained state cleanup follows that genuine callback.
  auto weak = weak_factory_.GetWeakPtr();
  delegate_->HoverExpandedChanged(expanded);
  if (!weak)
    return;
  if (retained_) {
    if (expanded)
      ScheduleRetentionCheck();
    else
      retained_check_.Stop();
  }
}

void ProfilePreviewAdmission::SetCollapseState(bool collapsed,
                                              int uncollapsed_width) {
  const bool was_collapsed = collapsed_;
  collapsed_ = collapsed;
  uncollapsed_width_ = uncollapsed_width;
  if (was_collapsed == collapsed) {
    expanding_from_collapsed_ = false;
    if (!collapsed && !collapse_.is_animating())
      delegate_->ApplyRetainedLayout();
    return;
  }
  auto weak = weak_factory_.GetWeakPtr();
  if (was_collapsed && retained_ && !collapsed) {
    delegate_->StopSharedHoverTimer();
    if (!weak)
      return;
    retained_check_.Stop();
    browser_retention_ = retained_ = hover_expanded_ = false;
    delegate_->ResetExpandOnHoverTimers();
    if (!weak)
      return;
    collapse_.Reset(1);
    if (!weak)
      return;
    expanding_from_collapsed_ = false;
    delegate_->CollapseTransitionSettled(false);
    if (weak)
      delegate_->CollapseStateChanged(collapsed);
    if (weak)
      delegate_->ApplyRetainedLayout();
    return;
  }
  expanding_from_collapsed_ = was_collapsed && !collapsed;
  // Capture/hold genuine header geometry and mark the real tab/scroll/leaf
  // owners BEFORE starting the reversible animation (4649348..46494a8).
  delegate_->CollapseTransitionStarted();
  if (!weak)
    return;
  if (collapsed)
    collapse_.Hide();
  else
    collapse_.Show();
  if (weak)
    delegate_->CollapseStateChanged(collapsed);
}

bool ProfilePreviewAdmission::VisuallyCollapsed() const {
  return collapsed_ && !hover_expanded_ && !retained_ &&
         !expanding_from_collapsed_ && !collapse_.is_animating();
}

bool ProfilePreviewAdmission::AdmitsProfilePreview(int actual_width) const {
  if (collapsed_ && (hover_expanded_ || retained_))
    return true;
  if (!collapse_.is_animating() && !expanding_from_collapsed_)
    return !collapsed_;
  if (expanding_from_collapsed_)
    return actual_width >= 151;
  const double width = collapse_.GetCurrentValue() * uncollapsed_width_;
  const int rounded = static_cast<int>(collapse_.IsShowing() ? std::floor(width)
                                                           : std::ceil(width));
  return (actual_width > 0 ? std::min(rounded, actual_width) : rounded) >= 151;
}

void ProfilePreviewAdmission::AnimationProgressed(
    const gfx::Animation* animation) {
  CHECK_EQ(animation, &collapse_);
  // 46499b4 clears the transition latch on EVERY actual collapse frame.
  expanding_from_collapsed_ = false;
  delegate_->CollapseTransitionProgressed();
}

void ProfilePreviewAdmission::AnimationEnded(const gfx::Animation* animation) {
  CHECK_EQ(animation, &collapse_);
  expanding_from_collapsed_ = false;
  auto weak = weak_factory_.GetWeakPtr();
  delegate_->CollapseTransitionSettled(true);
  if (weak)
    delegate_->ApplyRetainedLayout();
}

void ProfilePreviewAdmission::AnimationCanceled(const gfx::Animation* animation) {
  CHECK_EQ(animation, &collapse_);
  expanding_from_collapsed_ = false;
  auto weak = weak_factory_.GetWeakPtr();
  delegate_->CollapseTransitionSettled(false);
  if (weak)
    delegate_->ApplyRetainedLayout();
}
}  // namespace aux
