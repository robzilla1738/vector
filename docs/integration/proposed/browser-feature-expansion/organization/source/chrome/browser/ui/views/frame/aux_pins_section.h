// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PINS_SECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PINS_SECTION_H_
#include <memory>
#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_section_view.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
class BrowserWindowInterface;
namespace aux {
class AuxSectionClipView;
// Wrap the actual supplied pin grid and global-folder projection together.
// Collapse only changes geometry; it never unloads or removes logical pins.
class AuxPinsSection final : public AuxSectionView, public gfx::AnimationDelegate {
  METADATA_HEADER(AuxPinsSection, AuxSectionView)
 public:
  AuxPinsSection(BrowserWindowInterface&, std::unique_ptr<views::View> contents);
  ~AuxPinsSection() override;
  void RebindForProfileSwitch();
 private:
  void Bind();
  void Toggle();
  void Refresh(bool animate);
  void ApplyHeight();
  void AnimationProgressed(const gfx::Animation*) override;
  void AnimationEnded(const gfx::Animation*) override;
  void AnimationCanceled(const gfx::Animation*) override;
  base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ptr<views::View> inner_ = nullptr;
  raw_ptr<AuxSectionClipView> clip_ = nullptr;
  base::CallbackListSubscription ready_, changes_;
  bool expanded_ = true;
  gfx::SlideAnimation animation_{this};
  base::WeakPtrFactory<AuxPinsSection> weak_{this};
};
}  // namespace aux
#endif
