// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SEARCH_BUTTON_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SEARCH_BUTTON_H_

#include "base/memory/raw_ptr.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/controls/button/button.h"

namespace views {
class ImageView;
}
namespace aux {

// Original ProfileSearchButton from the profile-preview fallback and native
// region. The caller supplies its genuine action; this creates no search UI.
class ProfileSearchButton : public views::Button {
  METADATA_HEADER(ProfileSearchButton, views::Button)
 public:
  explicit ProfileSearchButton(PressedCallback callback);
  ~ProfileSearchButton() override;
  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;
  void OnThemeChanged() override;
  void AddedToWidget() override;

 protected:
  void PaintButtonContents(gfx::Canvas* canvas) override;
  void StateChanged(ButtonState old_state) override;
  void OnEnabledChanged() override;

 private:
  void UpdateImage();
  raw_ptr<views::ImageView> image_ = nullptr;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SEARCH_BUTTON_H_
