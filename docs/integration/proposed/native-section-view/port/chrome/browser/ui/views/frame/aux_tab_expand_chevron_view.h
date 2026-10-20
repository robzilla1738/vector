// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_EXPAND_CHEVRON_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_EXPAND_CHEVRON_VIEW_H_

#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
#include "ui/views/controls/image_view.h"

namespace aux {
// Supplied TabExpandChevronView4119804/411af20. Callers retain expansion state.
class AuxTabExpandChevronView : public views::ImageView,
                               private gfx::AnimationDelegate {
  METADATA_HEADER(AuxTabExpandChevronView, views::ImageView)
 public:
  enum class Foreground { kSecondary, kMuted };  // Original roles222/226.
  explicit AuxTabExpandChevronView(bool expanded = true,
      Foreground foreground = Foreground::kSecondary);
  ~AuxTabExpandChevronView() override;
  void SetExpanded(bool expanded);
  void OnPaint(gfx::Canvas* canvas) override;
 protected:
  void OnThemeChanged() override;
 private:
  void AnimationProgressed(const gfx::Animation*) override;
  bool expanded_;
  Foreground foreground_;
  gfx::SlideAnimation animation_{this};
};
}  // namespace aux
#endif
