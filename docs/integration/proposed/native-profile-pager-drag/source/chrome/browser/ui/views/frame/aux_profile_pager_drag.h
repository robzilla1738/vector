// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGER_DRAG_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGER_DRAG_H_

#include <map>
#include <optional>
#include <vector>

#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "chrome/browser/ui/views/frame/aux_profile_page_indicator_dot_button.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
#include "ui/gfx/geometry/vector2d.h"

namespace aux {
// Owned by the real pager, destroyed before its children. Roster/child rebuilds
// must use DeferUpdate() so the original drag bindings remain stable.
class ProfilePagerDrag : public gfx::AnimationDelegate {
 public:
  using Button = ProfilePageIndicatorDotButton;
  ProfilePagerDrag(views::View& pager,
                   std::vector<base::FilePath>& paths,
                   std::vector<raw_ptr<Button>>& buttons,
                   base::RepeatingClosure refresh);
  ~ProfilePagerDrag() override;

  bool DeferUpdate();
  void Start(Button* button);
  void Update(Button* button,
              const gfx::Point& point,
              const gfx::Point& pressed_local);
  void End(Button* button, Button::DragEnd reason);
  // Actual profile/owner retirement cancels without writing profile order.
  void Retire();

  void AnimationProgressed(const gfx::Animation* animation) override;
  void AnimationEnded(const gfx::Animation* animation) override;

 private:
  gfx::Rect Slot(size_t index) const;
  void LayoutSlots();
  void Move(size_t from, size_t to);
  void ClearSiblingAnimation();
  void FinishSettlement();
  void PersistOrder();

  const raw_ref<views::View> pager_;
  const raw_ref<std::vector<base::FilePath>> paths_;
  const raw_ref<std::vector<raw_ptr<Button>>> buttons_;
  const base::RepeatingClosure refresh_;
  std::optional<size_t> origin_;
  std::optional<size_t> current_;
  std::vector<base::FilePath> original_order_;
  std::map<Button*, gfx::Vector2d> sibling_offsets_;
  raw_ptr<Button> settling_ = nullptr;
  gfx::Vector2d settlement_offset_;
  bool order_changed_ = false;
  bool update_pending_ = false;
  gfx::SlideAnimation sibling_animation_{this};
  gfx::SlideAnimation settlement_animation_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGER_DRAG_H_
