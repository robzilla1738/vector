// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_INPUT_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_INPUT_H_

#include <vector>
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_region_owner.h"
#include "ui/events/event_handler.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
#include "ui/views/view_tracker.h"

class BrowserWindowInterface;
class VerticalTabStripScrollView;
namespace ui { class LocatedEvent; }
namespace aux {
// Original region pre-target input464c418/464c280 and animation delegate.
// Region mounting is separate: admission is its genuine feature/mode and
// collapsed/hover/retained/expansion151px geometry, not a new preference.
class ProfilePreviewInput : public ui::EventHandler,
                            public gfx::AnimationDelegate {
 public:
  ProfilePreviewInput(BrowserWindowInterface& browser, views::View& region,
      VerticalTabStripScrollView& scroll, ProfilePreviewRegionOwner& preview,
      base::RepeatingCallback<bool()> layout_admitted);
  ~ProfilePreviewInput() override;
  // Actual region AddedToWidget/RemovedFromWidget call these. Only its own
  // Widget's root EventTarget is observed, at original default priority.
  bool AttachToWidget();
  void DetachFromWidget();
  void OnScrollEvent(ui::ScrollEvent* event) override;
  void OnMouseEvent(ui::MouseEvent* event) override;
  void AnimationProgressed(const gfx::Animation* animation) override;
  void AnimationEnded(const gfx::Animation* animation) override;

  bool Select(const base::FilePath& target);
  bool idle() const;

 private:
  bool ValidSource() const;
  bool Admitted() const;
  bool Contains(const ui::LocatedEvent& event) const;
  const std::vector<base::FilePath>& Roster();
  base::FilePath Adjacent(int direction);
  bool HandleScroll(const ui::ScrollEvent& event);
  bool Bind(int direction);
  void Update(float progress);
  void FinishGesture();
  void CancelGesture();
  bool Commit(const base::FilePath& target, int direction);
  void OnCommitted(Browser* result);
  void AnimateTo(float target, bool commit);
  void StopAnimation();
  enum class ContentsEffect { kCapture, kClear, kOpacity, kBeginCrossfade };
  bool ApplyContents(ContentsEffect effect, float opacity = 1);

  base::WeakPtr<BrowserWindowInterface> browser_;
  views::ViewTracker region_;
  views::ViewTracker scroll_;
  views::ViewTracker event_root_;
  base::WeakPtr<ProfilePreviewRegionOwner> preview_;
  base::RepeatingCallback<bool()> layout_admitted_;
  std::vector<base::FilePath> roster_;
  base::FilePath bound_target_;
  float dx_ = 0;
  float dy_ = 0;
  float progress_ = 0;
  float animation_from_ = 0;
  float animation_to_ = 0;
  bool active_ = false;
  bool committing_ = false;
  bool roster_valid_ = false;
  bool crossfading_ = false;
  gfx::SlideAnimation animation_{this};
  gfx::SlideAnimation reveal_{this};
  base::WeakPtrFactory<ProfilePreviewInput> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_INPUT_H_
