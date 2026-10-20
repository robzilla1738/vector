// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_PROFILES_PROFILE_MONOGRAM_AVATAR_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_PROFILES_PROFILE_MONOGRAM_AVATAR_VIEW_H_

#include <optional>
#include <string>
#include <string_view>

#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/color/color_variant.h"
#include "ui/views/view.h"

// Supplied original ProfileMonogramAvatarView (metadata45885f8). Keep the
// grapheme, intrinsic geometry and actual native paint; this is not a Label or
// a stock profile-image substitute. Original private color IDs are translated
// by semantic role, not reused as different155 numeric ColorIds.
class ProfileMonogramAvatarView : public views::View {
  METADATA_HEADER(ProfileMonogramAvatarView, views::View)
 public:
  explicit ProfileMonogramAvatarView(std::u16string_view name);
  ~ProfileMonogramAvatarView() override;

  void SetName(std::u16string_view name);
  void SetDiameter(int diameter);
  void SetFontSize(int font_size);
  void SetForegroundColor(ui::ColorVariant color);
  void SetBackgroundColor(ui::ColorVariant color);

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;
  void OnPaint(gfx::Canvas* canvas) override;
  void OnThemeChanged() override;

 private:
  std::u16string monogram_;
  int diameter_ = 20;
  int font_size_ = 12;
  std::optional<ui::ColorVariant> foreground_;
  std::optional<ui::ColorVariant> background_;
};
#endif  // CHROME_BROWSER_UI_VIEWS_PROFILES_PROFILE_MONOGRAM_AVATAR_VIEW_H_
