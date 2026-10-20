// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_ADMISSION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_ADMISSION_H_

#include <optional>

#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"

namespace aux {
// The region's original a08/a0a/a0b/a0c/cd0/f78 state, not a width-only gate.
// Its delegate MUST be the real region; no preview input is installed here.
class ProfilePreviewAdmission : public gfx::AnimationDelegate {
 public:
  class Delegate {
   public:
    virtual ~Delegate() = default;
    // These methods forward to the SAME real region timer at original +940.
    virtual void StopSharedHoverTimer() = 0;
    virtual void ResetExpandOnHoverTimers() = 0;
    virtual bool SharedHoverTimerIsRunning() const = 0;
    virtual void StartSharedHoverTimer(base::TimeDelta delay,
                                      base::OnceClosure callback) = 0;
    // Actual 465020c geometry/cursor predicate, not title/URL or guessed width.
    virtual bool RetainedPointerInside() const = 0;
    virtual bool KeepExpandedLocked() const = 0;
    virtual void UpdateExpandOnHover(std::optional<bool> hovered) = 0;
    // Genuine top-container/layout/pinned-leaf effects remain region-owned.
    virtual void RetentionAcquired() = 0;
    virtual void HoverExpandedChanged(bool expanded) = 0;
    virtual void CollapseTransitionStarted() = 0;
    virtual void CollapseTransitionProgressed() = 0;
    virtual void CollapseTransitionSettled(bool completed) = 0;
    virtual void CollapseStateChanged(bool collapsed) = 0;
    virtual void ApplyRetainedLayout() = 0;
  };

  ProfilePreviewAdmission(Delegate& delegate, bool collapsed,
                          int uncollapsed_width);
  ~ProfilePreviewAdmission() override;

  // Called only after the original producer's eligibility checks. +a0a and
  // +a0b remain distinct: a BrowserView request and native edge-monitor request.
  void SetBrowserRetention(bool requested);
  void SetEdgeRetention(bool requested);
  void SetHoverExpanded(bool expanded);
  // Original nonvertical/noncollapsed early branch is a direct state reset.
  void ResetHoverWithoutLayout() { hover_expanded_ = false; }
  void ForceCollapseRetention();
  void ClearRetention();
  void ReleaseIdleRetention(bool pointer_inside);
  void SetCollapseState(bool collapsed, int uncollapsed_width);

  bool retained() const { return retained_; }
  bool browser_retention() const { return browser_retention_; }
  bool edge_retention() const { return edge_retention_; }
  bool hover_expanded() const { return hover_expanded_; }
  bool expanding_from_collapsed() const { return expanding_from_collapsed_; }
  bool collapse_animating() const { return collapse_.is_animating(); }
  double collapse_value() const { return collapse_.GetCurrentValue(); }
  bool VisuallyCollapsed() const;
  bool AdmitsProfilePreview(int actual_region_width) const;

  void AnimationProgressed(const gfx::Animation* animation) override;
  void AnimationEnded(const gfx::Animation* animation) override;
  void AnimationCanceled(const gfx::Animation* animation) override;

 private:
  void AcquireRetention();
  void ScheduleRetentionCheck();
  void ScheduleRelease();
  void CheckRetention();
  void ReleaseIfPointerOutside();

  const raw_ref<Delegate> delegate_;
  bool collapsed_;
  int uncollapsed_width_;
  bool hover_expanded_ = false;
  bool browser_retention_ = false;
  bool edge_retention_ = false;
  bool retained_ = false;
  bool expanding_from_collapsed_ = false;
  gfx::SlideAnimation collapse_{this};
  base::RetainingOneShotTimer retained_check_;
  base::WeakPtrFactory<ProfilePreviewAdmission> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_ADMISSION_H_
