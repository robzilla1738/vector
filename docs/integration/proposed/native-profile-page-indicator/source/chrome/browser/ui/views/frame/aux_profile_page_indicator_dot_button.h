// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGE_INDICATOR_DOT_BUTTON_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGE_INDICATOR_DOT_BUTTON_H_

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "ui/gfx/geometry/point.h"
#include "ui/views/controls/button/button.h"

namespace gfx {
struct VectorIcon;
}

namespace aux {

class ProfilePageIndicatorDotButton : public views::Button {
  METADATA_HEADER(ProfilePageIndicatorDotButton, views::Button)

 public:
  enum class DragEnd { kReleased, kCaptureLost };
  using ButtonCallback =
      base::RepeatingCallback<void(ProfilePageIndicatorDotButton*)>;
  using DragUpdateCallback =
      base::RepeatingCallback<void(ProfilePageIndicatorDotButton*,
                                   const gfx::Point&,
                                   const gfx::Point&)>;
  using DragEndCallback =
      base::RepeatingCallback<void(ProfilePageIndicatorDotButton*, DragEnd)>;

  ProfilePageIndicatorDotButton(PressedCallback pressed,
                                ButtonCallback context_menu,
                                ButtonCallback drag_started,
                                DragUpdateCallback drag_updated,
                                DragEndCallback drag_ended);
  ~ProfilePageIndicatorDotButton() override;

  void SetCurrent(bool current);
  void SetProfileIcon(const gfx::VectorIcon* icon);
  void SetDragHighlight(bool highlighted);

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;
  bool OnMousePressed(const ui::MouseEvent& event) override;
  bool OnMouseDragged(const ui::MouseEvent& event) override;
  void OnMouseReleased(const ui::MouseEvent& event) override;
  void OnMouseCaptureLost() override;

 protected:
  void PaintButtonContents(gfx::Canvas* canvas) override;

 private:
  ButtonCallback context_menu_;
  ButtonCallback drag_started_;
  DragUpdateCallback drag_updated_;
  DragEndCallback drag_ended_;
  raw_ptr<const gfx::VectorIcon> icon_ = nullptr;
  gfx::Point pressed_local_;
  gfx::Point pressed_parent_;
  bool current_ = false;
  bool pressed_ = false;
  bool dragging_ = false;
  bool drag_highlight_ = false;
};

}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGE_INDICATOR_DOT_BUTTON_H_
